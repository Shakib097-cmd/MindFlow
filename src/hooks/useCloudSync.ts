import { useState, useEffect, useRef, useCallback } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MindMap, MindNode, MindEdge, SyncStatus } from '../types';

export interface CloudMapData {
  map: MindMap;
  nodes: MindNode[];
  edges: MindEdge[];
  updatedAt: number;
}

export interface UseCloudSyncOptions {
  userId?: string | null;
  mapId?: string | null;
  debounceMs?: number;
  onRemoteUpdate?: (data: CloudMapData) => void;
  autoSubscribe?: boolean;
}

export interface UseCloudSyncReturn {
  // Sync States
  isSaving: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  syncStatus: SyncStatus;
  isOnline: boolean;

  // Sync Actions
  debouncedSaveMap: (map: MindMap, nodes: MindNode[], edges: MindEdge[]) => void;
  saveMapImmediate: (map: MindMap, nodes: MindNode[], edges: MindEdge[]) => Promise<boolean>;
  loadMap: (targetMapId?: string) => Promise<CloudMapData | null>;
  deleteMap: (targetMapId: string) => Promise<boolean>;
  updateMapMetadata: (targetMapId: string, partial: Partial<MindMap>) => Promise<boolean>;
  updateNode: (targetMapId: string, updatedNode: MindNode, currentMap: MindMap, currentNodes: MindNode[], currentEdges: MindEdge[]) => Promise<boolean>;
  deleteNode: (targetMapId: string, nodeId: string, currentMap: MindMap, currentNodes: MindNode[], currentEdges: MindEdge[]) => Promise<boolean>;
  updateEdge: (targetMapId: string, updatedEdge: MindEdge, currentMap: MindMap, currentNodes: MindNode[], currentEdges: MindEdge[]) => Promise<boolean>;
  deleteEdge: (targetMapId: string, edgeId: string, currentMap: MindMap, currentNodes: MindNode[], currentEdges: MindEdge[]) => Promise<boolean>;
  fetchUserMaps: () => Promise<CloudMapData[]>;
  subscribeToMap: (targetMapId: string, onUpdate: (data: CloudMapData) => void) => () => void;
  subscribeToAllUserMaps: (onUpdate: (maps: CloudMapData[]) => void) => () => void;
  clearSyncError: () => void;
  cancelPendingSaves: () => void;
}

/**
 * Helper to safely resolve and verify current user ID for Firestore security isolation
 */
function resolveUserId(providedUserId?: string | null): string | null {
  const currentUid = auth.currentUser?.uid || null;
  if (providedUserId && providedUserId !== 'demo-user' && providedUserId !== 'current-user') {
    return currentUid || providedUserId;
  }
  return currentUid;
}

/**
 * Custom hook providing Firestore CRUD operations with debounce logic
 * targeting user-isolated collection path: users/{userId}/maps/{mapId}
 */
export function useCloudSync({
  userId: initialUserId,
  mapId: initialMapId,
  debounceMs = 500,
  onRemoteUpdate,
  autoSubscribe = false,
}: UseCloudSyncOptions = {}): UseCloudSyncReturn {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPayloadRef = useRef<{ map: MindMap; nodes: MindNode[]; edges: MindEdge[] } | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Monitor network connectivity
  useEffect(() => {
    isMountedRef.current = true;
    const handleOnline = () => {
      if (isMountedRef.current) {
        setIsOnline(true);
        if (syncStatus === 'offline') setSyncStatus('synced');
      }
    };
    const handleOffline = () => {
      if (isMountedRef.current) {
        setIsOnline(false);
        setSyncStatus('offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus]);

  const clearSyncError = useCallback(() => {
    setSyncError(null);
    if (syncStatus === 'error') {
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    }
  }, [syncStatus]);

  const cancelPendingSaves = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingPayloadRef.current = null;
    if (isMountedRef.current) {
      setIsSaving(false);
      setIsSyncing(false);
    }
  }, []);

  // Immediate save operation to users/{userId}/maps/{mapId}
  const saveMapImmediate = useCallback(
    async (map: MindMap, nodes: MindNode[], edges: MindEdge[]): Promise<boolean> => {
      const activeUserId = resolveUserId(initialUserId);
      if (!activeUserId) {
        // Unauthenticated/guest mode: persist as saved locally
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
        return true;
      }

      if (!map?.id) {
        setSyncError('Cannot save map: Map ID is missing');
        setSyncStatus('error');
        return false;
      }

      setIsSyncing(true);
      setSyncStatus('syncing');

      try {
        const now = Date.now();
        const docRef = doc(db, 'users', activeUserId, 'maps', map.id);

        const payload: CloudMapData = {
          map: {
            ...map,
            ownerId: activeUserId,
            nodesCount: nodes.length,
            updatedAt: map.updatedAt || now,
          },
          nodes: nodes.map((node) => ({
            ...node,
            mapId: map.id,
          })),
          edges: edges.map((edge) => ({
            ...edge,
            mapId: map.id,
          })),
          updatedAt: now,
        };

        await setDoc(docRef, payload, { merge: true });

        // If map is shared, mirror to public mindmaps collection
        if (map.visibility === 'public' || map.visibility === 'link') {
          try {
            await setDoc(
              doc(db, 'mindmaps', map.id),
              {
                ...payload.map,
                nodes: payload.nodes,
                edges: payload.edges,
              },
              { merge: true }
            );
          } catch (mirrorErr) {
            console.warn('Public share mirror note:', mirrorErr);
          }
        }

        if (isMountedRef.current) {
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
          setSyncError(null);
          setIsSyncing(false);
          setIsSaving(false);
        }
        return true;
      } catch (err: any) {
        console.error('Firestore saveMap error:', err);
        if (isMountedRef.current) {
          const offline = !navigator.onLine;
          setSyncStatus(offline ? 'offline' : 'error');
          setSyncError(err?.message || 'Failed to sync map to Cloud Firestore');
          setIsSyncing(false);
          setIsSaving(false);
        }
        return false;
      }
    },
    [initialUserId]
  );

  // Debounced save operation for rapid node moves and canvas mutations
  const debouncedSaveMap = useCallback(
    (map: MindMap, nodes: MindNode[], edges: MindEdge[]) => {
      pendingPayloadRef.current = { map, nodes, edges };
      setIsSaving(true);
      setSyncStatus('saving');

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        if (!pendingPayloadRef.current) return;
        const currentPayload = pendingPayloadRef.current;
        pendingPayloadRef.current = null;
        await saveMapImmediate(currentPayload.map, currentPayload.nodes, currentPayload.edges);
      }, debounceMs);
    },
    [debounceMs, saveMapImmediate]
  );

  // Load a single map from users/{userId}/maps/{mapId}
  const loadMap = useCallback(
    async (targetMapId?: string): Promise<CloudMapData | null> => {
      const activeMapId = targetMapId || initialMapId;
      const activeUserId = resolveUserId(initialUserId);

      if (!activeUserId || !activeMapId) return null;

      setIsSyncing(true);
      try {
        const docRef = doc(db, 'users', activeUserId, 'maps', activeMapId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as CloudMapData;
          if (isMountedRef.current) {
            setLastSyncedAt(Date.now());
            setSyncStatus('synced');
            setSyncError(null);
          }
          return data;
        }
        return null;
      } catch (err: any) {
        console.error('Firestore loadMap error:', err);
        if (isMountedRef.current) {
          setSyncStatus(navigator.onLine ? 'error' : 'offline');
          setSyncError(err?.message || 'Failed to load map from cloud');
        }
        return null;
      } finally {
        if (isMountedRef.current) {
          setIsSyncing(false);
        }
      }
    },
    [initialMapId, initialUserId]
  );

  // Delete a map document from users/{userId}/maps/{mapId}
  const deleteMap = useCallback(
    async (targetMapId: string): Promise<boolean> => {
      const activeUserId = resolveUserId(initialUserId);
      if (!activeUserId || !targetMapId) return false;

      setIsSyncing(true);
      try {
        const docRef = doc(db, 'users', activeUserId, 'maps', targetMapId);
        await deleteDoc(docRef);

        // Delete public share mirror if existing
        try {
          await deleteDoc(doc(db, 'mindmaps', targetMapId));
        } catch {
          // ignore mirror cleanup errors
        }

        if (isMountedRef.current) {
          setLastSyncedAt(Date.now());
          setSyncStatus('synced');
          setSyncError(null);
        }
        return true;
      } catch (err: any) {
        console.error('Firestore deleteMap error:', err);
        if (isMountedRef.current) {
          setSyncStatus('error');
          setSyncError(err?.message || 'Failed to delete map from cloud');
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSyncing(false);
        }
      }
    },
    [initialUserId]
  );

  // Update map-level metadata
  const updateMapMetadata = useCallback(
    async (targetMapId: string, partial: Partial<MindMap>): Promise<boolean> => {
      const activeUserId = resolveUserId(initialUserId);
      if (!activeUserId || !targetMapId) return false;

      try {
        const docRef = doc(db, 'users', activeUserId, 'maps', targetMapId);
        const mapUpdatePayload: Record<string, any> = {
          updatedAt: Date.now(),
        };

        Object.entries(partial || {}).forEach(([key, val]) => {
          if (val !== undefined) {
            mapUpdatePayload[`map.${key}`] = val;
          }
        });

        await setDoc(docRef, mapUpdatePayload, { merge: true });
        if (isMountedRef.current) {
          setLastSyncedAt(Date.now());
          setSyncStatus('synced');
        }
        return true;
      } catch (err: any) {
        console.error('Firestore updateMapMetadata error:', err);
        return false;
      }
    },
    [initialUserId]
  );

  // Node CRUD helpers
  const updateNode = useCallback(
    async (
      targetMapId: string,
      updatedNode: MindNode,
      currentMap: MindMap,
      currentNodes: MindNode[],
      currentEdges: MindEdge[]
    ): Promise<boolean> => {
      const nextNodes = currentNodes.some((n) => n.id === updatedNode.id)
        ? currentNodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
        : [...currentNodes, updatedNode];

      return saveMapImmediate(currentMap, nextNodes, currentEdges);
    },
    [saveMapImmediate]
  );

  const deleteNode = useCallback(
    async (
      targetMapId: string,
      nodeId: string,
      currentMap: MindMap,
      currentNodes: MindNode[],
      currentEdges: MindEdge[]
    ): Promise<boolean> => {
      const nextNodes = currentNodes.filter((n) => n.id !== nodeId);
      const nextEdges = currentEdges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId);

      return saveMapImmediate(currentMap, nextNodes, nextEdges);
    },
    [saveMapImmediate]
  );

  // Edge CRUD helpers
  const updateEdge = useCallback(
    async (
      targetMapId: string,
      updatedEdge: MindEdge,
      currentMap: MindMap,
      currentNodes: MindNode[],
      currentEdges: MindEdge[]
    ): Promise<boolean> => {
      const nextEdges = currentEdges.some((e) => e.id === updatedEdge.id)
        ? currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e))
        : [...currentEdges, updatedEdge];

      return saveMapImmediate(currentMap, currentNodes, nextEdges);
    },
    [saveMapImmediate]
  );

  const deleteEdge = useCallback(
    async (
      targetMapId: string,
      edgeId: string,
      currentMap: MindMap,
      currentNodes: MindNode[],
      currentEdges: MindEdge[]
    ): Promise<boolean> => {
      const nextEdges = currentEdges.filter((e) => e.id !== edgeId);
      return saveMapImmediate(currentMap, currentNodes, nextEdges);
    },
    [saveMapImmediate]
  );

  // Fetch all user maps from users/{userId}/maps
  const fetchUserMaps = useCallback(async (): Promise<CloudMapData[]> => {
    const activeUserId = resolveUserId(initialUserId);
    if (!activeUserId) return [];

    try {
      const colRef = collection(db, 'users', activeUserId, 'maps');
      const snapshot = await getDocs(colRef);
      const list: CloudMapData[] = [];

      snapshot.forEach((d) => {
        const item = d.data() as CloudMapData;
        if (item && item.map) {
          list.push(item);
        }
      });

      return list;
    } catch (err: any) {
      console.error('Firestore fetchUserMaps error:', err);
      return [];
    }
  }, [initialUserId]);

  // Real-time subscription to a single map
  const subscribeToMap = useCallback(
    (targetMapId: string, onUpdate: (data: CloudMapData) => void): (() => void) => {
      const activeUserId = resolveUserId(initialUserId);
      if (!activeUserId || !targetMapId) return () => {};

      const docRef = doc(db, 'users', activeUserId, 'maps', targetMapId);
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as CloudMapData;
            onUpdate(data);
            if (isMountedRef.current) {
              setLastSyncedAt(Date.now());
              setSyncStatus('synced');
            }
          }
        },
        (err) => {
          console.warn('Map subscription warning:', err);
          if (isMountedRef.current) {
            setSyncStatus(navigator.onLine ? 'error' : 'offline');
          }
        }
      );

      return unsubscribe;
    },
    [initialUserId]
  );

  // Real-time subscription to entire maps collection for library views
  const subscribeToAllUserMaps = useCallback(
    (onUpdate: (maps: CloudMapData[]) => void): (() => void) => {
      const activeUserId = resolveUserId(initialUserId);
      if (!activeUserId) return () => {};

      const colRef = collection(db, 'users', activeUserId, 'maps');
      const unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          const list: CloudMapData[] = [];
          snap.forEach((d) => {
            const item = d.data() as CloudMapData;
            if (item && item.map) {
              list.push(item);
            }
          });
          onUpdate(list);
          if (isMountedRef.current) {
            setLastSyncedAt(Date.now());
            setSyncStatus('synced');
          }
        },
        (err) => {
          console.warn('All maps subscription warning:', err);
          if (isMountedRef.current) {
            setSyncStatus(navigator.onLine ? 'error' : 'offline');
          }
        }
      );

      return unsubscribe;
    },
    [initialUserId]
  );

  // Auto-subscribe if requested
  useEffect(() => {
    if (!autoSubscribe || !initialMapId) return;

    const unsubscribe = subscribeToMap(initialMapId, (remoteData) => {
      if (onRemoteUpdate) {
        onRemoteUpdate(remoteData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [autoSubscribe, initialMapId, subscribeToMap, onRemoteUpdate]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    isSyncing,
    lastSyncedAt,
    syncError,
    syncStatus,
    isOnline,
    debouncedSaveMap,
    saveMapImmediate,
    loadMap,
    deleteMap,
    updateMapMetadata,
    updateNode,
    deleteNode,
    updateEdge,
    deleteEdge,
    fetchUserMaps,
    subscribeToMap,
    subscribeToAllUserMaps,
    clearSyncError,
    cancelPendingSaves,
  };
}
