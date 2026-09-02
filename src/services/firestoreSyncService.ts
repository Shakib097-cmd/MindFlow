import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  MindMap,
  MindNode,
  MindEdge,
  TaskItem,
  GoalItem,
  QuickNote,
  FolderItem,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// 1. Connection Health Check
export interface DBConnectionTestResult {
  success: boolean;
  latencyMs: number;
  projectId: string;
  databaseId: string;
  authStatus: string;
  message: string;
  timestamp: string;
}

export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    if (!auth.currentUser) return true; // Offline / Guest mode is considered gracefully operational
    const testDocRef = doc(db, 'usage', auth.currentUser.uid);
    await getDocFromServer(testDocRef);
    return true;
  } catch (err: any) {
    if (err?.message?.includes('the client is offline') || err?.code === 'unavailable') {
      return false;
    }
    return true;
  }
}

export async function testDatabaseConnection(): Promise<DBConnectionTestResult> {
  const startTime = Date.now();
  const projectId = 'gen-lang-client-0309605137';
  const databaseId = 'ai-studio-mindflowai-cf3076d6-fc09-4682-8c9d-182b3459b31f';
  const currentUser = auth.currentUser;
  
  try {
    const res = await fetch('/api/health/firestore');
    const data = await res.json();
    const latency = Date.now() - startTime;
    
    return {
      success: true,
      latencyMs: Math.max(1, data.latencyMs || latency),
      projectId: data.projectId || projectId,
      databaseId: data.firestoreDatabaseId || databaseId,
      authStatus: currentUser ? `Authenticated (${currentUser.email || currentUser.uid})` : 'Anonymous / Guest Session',
      message: 'Cloud Firestore is connected and responsive.',
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      latencyMs: latency,
      projectId,
      databaseId,
      authStatus: currentUser ? `Authenticated (${currentUser.email || currentUser.uid})` : 'Anonymous / Guest Session',
      message: err?.message || 'Failed to ping Firestore service endpoint.',
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

// Helper to verify authenticated Firebase user before any cloud write
function getVerifiedUserId(targetUserId: string): string | null {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.uid) {
    return null;
  }
  if (targetUserId === 'demo-user' || targetUserId === 'current-user') {
    return currentUser.uid;
  }
  // Enforce isolation: ensure caller cannot write under another user's path
  if (currentUser.uid !== targetUserId) {
    console.warn(`User mismatch: auth UID ${currentUser.uid} !== target ${targetUserId}`);
    return currentUser.uid;
  }
  return currentUser.uid;
}

// 2. Cloud Mind Map Synchronization
export interface CloudMapPayload {
  map: MindMap;
  nodes: MindNode[];
  edges: MindEdge[];
  updatedAt: number;
}

export async function saveMapToCloud(
  userId: string,
  map: MindMap,
  nodes: MindNode[],
  edges: MindEdge[]
): Promise<boolean> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return false;

  const mapPath = `users/${verifiedId}/maps/${map.id}`;
  try {
    const now = Date.now();
    const payload: CloudMapPayload = {
      map: {
        ...map,
        ownerId: verifiedId,
        nodesCount: nodes.length,
        updatedAt: map.updatedAt || now,
      },
      nodes: nodes.map((n) => ({
        ...n,
        mapId: map.id,
      })),
      edges: edges.map((e) => ({
        ...e,
        mapId: map.id,
      })),
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', verifiedId, 'maps', map.id), payload, { merge: true });

    // Mirror to public shares if shared/public
    if (map.visibility === 'public' || map.visibility === 'link') {
      await setDoc(
        doc(db, 'mindmaps', map.id),
        {
          ...payload.map,
          nodes: payload.nodes,
          edges: payload.edges,
        },
        { merge: true }
      );
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, mapPath);
    return false;
  }
}

export async function fetchUserCloudMaps(userId: string): Promise<CloudMapPayload[]> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return [];

  const path = `users/${verifiedId}/maps`;
  try {
    const snap = await getDocs(collection(db, 'users', verifiedId, 'maps'));
    const results: CloudMapPayload[] = [];
    snap.forEach((d) => {
      const data = d.data() as CloudMapPayload;
      if (data && data.map) {
        results.push(data);
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToUserCloudMaps(
  userId: string,
  onMapsUpdated: (cloudMaps: CloudMapPayload[]) => void
): () => void {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return () => {};

  const mapsCollectionPath = `users/${verifiedId}/maps`;
  try {
    const q = collection(db, 'users', verifiedId, 'maps');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const maps: CloudMapPayload[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CloudMapPayload;
          if (data && data.map) {
            maps.push(data);
          }
        });
        onMapsUpdated(maps);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, mapsCollectionPath);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, mapsCollectionPath);
    return () => {};
  }
}

export async function deleteMapFromCloud(userId: string, mapId: string): Promise<void> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return;

  const path = `users/${verifiedId}/maps/${mapId}`;
  try {
    await deleteDoc(doc(db, 'users', verifiedId, 'maps', mapId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Cloud Folders Sync
export async function saveFolderToCloud(userId: string, folder: FolderItem): Promise<boolean> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return false;

  const path = `users/${verifiedId}/folders/${folder.id}`;
  try {
    await setDoc(
      doc(db, 'users', verifiedId, 'folders', folder.id),
      {
        ...folder,
        userId: verifiedId,
        updatedAt: folder.updatedAt || Date.now(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteFolderFromCloud(userId: string, folderId: string): Promise<void> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return;

  const path = `users/${verifiedId}/folders/${folderId}`;
  try {
    await deleteDoc(doc(db, 'users', verifiedId, 'folders', folderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserCloudFolders(
  userId: string,
  onFoldersUpdated: (folders: FolderItem[]) => void
): () => void {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return () => {};

  const path = `users/${verifiedId}/folders`;
  try {
    const q = collection(db, 'users', verifiedId, 'folders');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const folders: FolderItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FolderItem;
          if (data && data.name) {
            folders.push(data);
          }
        });
        onFoldersUpdated(folders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function fetchUserCloudFolders(userId: string): Promise<FolderItem[]> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return [];

  const path = `users/${verifiedId}/folders`;
  try {
    const snap = await getDocs(collection(db, 'users', verifiedId, 'folders'));
    const results: FolderItem[] = [];
    snap.forEach((d) => {
      const data = d.data() as FolderItem;
      if (data && data.name) {
        results.push(data);
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 4. Cloud Tasks Sync
export async function saveTaskToCloud(userId: string, task: TaskItem): Promise<boolean> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return false;

  const path = `users/${verifiedId}/tasks/${task.id}`;
  try {
    await setDoc(
      doc(db, 'users', verifiedId, 'tasks', task.id),
      { ...task, userId: verifiedId },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteTaskFromCloud(userId: string, taskId: string): Promise<void> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return;

  const path = `users/${verifiedId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', verifiedId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserCloudTasks(
  userId: string,
  onTasksUpdated: (tasks: TaskItem[]) => void
): () => void {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return () => {};

  const path = `users/${verifiedId}/tasks`;
  try {
    const q = collection(db, 'users', verifiedId, 'tasks');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks: TaskItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TaskItem;
          if (data && data.title) {
            tasks.push(data);
          }
        });
        onTasksUpdated(tasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function fetchUserCloudTasks(userId: string): Promise<TaskItem[]> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return [];

  const path = `users/${verifiedId}/tasks`;
  try {
    const snap = await getDocs(collection(db, 'users', verifiedId, 'tasks'));
    const results: TaskItem[] = [];
    snap.forEach((d) => {
      const data = d.data() as TaskItem;
      if (data && data.title) {
        results.push(data);
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 5. Cloud Goals Sync
export async function saveGoalToCloud(userId: string, goal: GoalItem): Promise<boolean> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return false;

  const path = `users/${verifiedId}/goals/${goal.id}`;
  try {
    await setDoc(
      doc(db, 'users', verifiedId, 'goals', goal.id),
      { ...goal, userId: verifiedId },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteGoalFromCloud(userId: string, goalId: string): Promise<void> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return;

  const path = `users/${verifiedId}/goals/${goalId}`;
  try {
    await deleteDoc(doc(db, 'users', verifiedId, 'goals', goalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserCloudGoals(
  userId: string,
  onGoalsUpdated: (goals: GoalItem[]) => void
): () => void {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return () => {};

  const path = `users/${verifiedId}/goals`;
  try {
    const q = collection(db, 'users', verifiedId, 'goals');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goals: GoalItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as GoalItem;
          if (data && data.title) {
            goals.push(data);
          }
        });
        onGoalsUpdated(goals);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function fetchUserCloudGoals(userId: string): Promise<GoalItem[]> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return [];

  const path = `users/${verifiedId}/goals`;
  try {
    const snap = await getDocs(collection(db, 'users', verifiedId, 'goals'));
    const results: GoalItem[] = [];
    snap.forEach((d) => {
      const data = d.data() as GoalItem;
      if (data && data.title) {
        results.push(data);
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 6. Cloud Quick Notes Sync
export async function saveQuickNoteToCloud(userId: string, note: QuickNote): Promise<boolean> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return false;

  const path = `users/${verifiedId}/quickNotes/${note.id}`;
  try {
    await setDoc(
      doc(db, 'users', verifiedId, 'quickNotes', note.id),
      { ...note, userId: verifiedId },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteQuickNoteFromCloud(userId: string, noteId: string): Promise<void> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return;

  const path = `users/${verifiedId}/quickNotes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', verifiedId, 'quickNotes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserCloudQuickNotes(
  userId: string,
  onNotesUpdated: (notes: QuickNote[]) => void
): () => void {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return () => {};

  const path = `users/${verifiedId}/quickNotes`;
  try {
    const q = collection(db, 'users', verifiedId, 'quickNotes');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notes: QuickNote[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as QuickNote;
          if (data && data.content !== undefined) {
            notes.push(data);
          }
        });
        onNotesUpdated(notes);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function fetchUserCloudQuickNotes(userId: string): Promise<QuickNote[]> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return [];

  const path = `users/${verifiedId}/quickNotes`;
  try {
    const snap = await getDocs(collection(db, 'users', verifiedId, 'quickNotes'));
    const results: QuickNote[] = [];
    snap.forEach((d) => {
      const data = d.data() as QuickNote;
      if (data && data.content !== undefined) {
        results.push(data);
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 7. Comprehensive Full Two-Way Synchronization
export interface SyncStats {
  mapsSynced: number;
  tasksSynced: number;
  goalsSynced: number;
  foldersSynced: number;
  notesSynced: number;
  conflictsResolved: number;
  timestamp: number;
}

export interface LocalSyncPayload {
  maps: MindMap[];
  tasks: TaskItem[];
  goals: GoalItem[];
  folders: FolderItem[];
  quickNotes: QuickNote[];
  getNodesForMap: (mapId: string) => MindNode[];
  getEdgesForMap: (mapId: string) => MindEdge[];
}

export interface MergedSyncResult {
  maps: MindMap[];
  tasks: TaskItem[];
  goals: GoalItem[];
  folders: FolderItem[];
  quickNotes: QuickNote[];
  stats: SyncStats;
}

export async function executeTwoWaySync(
  userId: string,
  local: LocalSyncPayload
): Promise<MergedSyncResult> {
  const verifiedId = getVerifiedUserId(userId);
  const now = Date.now();

  const stats: SyncStats = {
    mapsSynced: 0,
    tasksSynced: 0,
    goalsSynced: 0,
    foldersSynced: 0,
    notesSynced: 0,
    conflictsResolved: 0,
    timestamp: now,
  };

  if (!verifiedId) {
    return {
      maps: local.maps,
      tasks: local.tasks,
      goals: local.goals,
      folders: local.folders,
      quickNotes: local.quickNotes,
      stats,
    };
  }

  // 1. Fetch remote states in parallel
  const [cloudMaps, cloudTasks, cloudGoals, cloudFolders, cloudNotes] = await Promise.all([
    fetchUserCloudMaps(verifiedId),
    fetchUserCloudTasks(verifiedId),
    fetchUserCloudGoals(verifiedId),
    fetchUserCloudFolders(verifiedId),
    fetchUserCloudQuickNotes(verifiedId),
  ]);

  // 2. Merge Maps & Nodes & Edges
  const mergedMapsMap = new Map<string, MindMap>();
  const cloudMapLookup = new Map<string, CloudMapPayload>();
  cloudMaps.forEach((cm) => cloudMapLookup.set(cm.map.id, cm));

  // Process Local Maps
  for (const localMap of local.maps) {
    const cloudEntry = cloudMapLookup.get(localMap.id);
    if (!cloudEntry) {
      // Local only -> push to Cloud
      const nodes = local.getNodesForMap(localMap.id);
      const edges = local.getEdgesForMap(localMap.id);
      await saveMapToCloud(verifiedId, localMap, nodes, edges);
      mergedMapsMap.set(localMap.id, localMap);
      stats.mapsSynced++;
    } else {
      // Both exist -> Compare updatedAt / version
      const localUpdated = localMap.updatedAt || 0;
      const cloudUpdated = cloudEntry.map.updatedAt || cloudEntry.updatedAt || 0;
      if (localUpdated >= cloudUpdated) {
        // Local is newer -> push to Cloud
        const nodes = local.getNodesForMap(localMap.id);
        const edges = local.getEdgesForMap(localMap.id);
        await saveMapToCloud(verifiedId, localMap, nodes, edges);
        mergedMapsMap.set(localMap.id, localMap);
      } else {
        // Cloud is newer -> adopt Cloud
        mergedMapsMap.set(localMap.id, cloudEntry.map);
        stats.conflictsResolved++;
      }
      stats.mapsSynced++;
      cloudMapLookup.delete(localMap.id);
    }
  }

  // Any remaining Cloud Maps not in Local -> Adopt from Cloud
  for (const [, cloudEntry] of cloudMapLookup) {
    mergedMapsMap.set(cloudEntry.map.id, cloudEntry.map);
    stats.mapsSynced++;
  }

  // 3. Merge Folders
  const mergedFoldersMap = new Map<string, FolderItem>();
  const cloudFolderLookup = new Map<string, FolderItem>();
  cloudFolders.forEach((cf) => cloudFolderLookup.set(cf.id, cf));

  for (const localFolder of local.folders) {
    const cloudFolder = cloudFolderLookup.get(localFolder.id);
    if (!cloudFolder) {
      await saveFolderToCloud(verifiedId, localFolder);
      mergedFoldersMap.set(localFolder.id, localFolder);
      stats.foldersSynced++;
    } else {
      const localUpdated = localFolder.updatedAt || localFolder.createdAt || 0;
      const cloudUpdated = cloudFolder.updatedAt || cloudFolder.createdAt || 0;
      if (localUpdated >= cloudUpdated) {
        await saveFolderToCloud(verifiedId, localFolder);
        mergedFoldersMap.set(localFolder.id, localFolder);
      } else {
        mergedFoldersMap.set(localFolder.id, cloudFolder);
      }
      stats.foldersSynced++;
      cloudFolderLookup.delete(localFolder.id);
    }
  }
  for (const [, cf] of cloudFolderLookup) {
    mergedFoldersMap.set(cf.id, cf);
    stats.foldersSynced++;
  }

  // 4. Merge Tasks
  const mergedTasksMap = new Map<string, TaskItem>();
  const cloudTaskLookup = new Map<string, TaskItem>();
  cloudTasks.forEach((ct) => cloudTaskLookup.set(ct.id, ct));

  for (const localTask of local.tasks) {
    const cloudTask = cloudTaskLookup.get(localTask.id);
    if (!cloudTask) {
      await saveTaskToCloud(verifiedId, localTask);
      mergedTasksMap.set(localTask.id, localTask);
      stats.tasksSynced++;
    } else {
      const localUpdated = localTask.updatedAt || localTask.createdAt || 0;
      const cloudUpdated = cloudTask.updatedAt || cloudTask.createdAt || 0;
      if (localUpdated >= cloudUpdated) {
        await saveTaskToCloud(verifiedId, localTask);
        mergedTasksMap.set(localTask.id, localTask);
      } else {
        mergedTasksMap.set(localTask.id, cloudTask);
      }
      stats.tasksSynced++;
      cloudTaskLookup.delete(localTask.id);
    }
  }
  for (const [, ct] of cloudTaskLookup) {
    mergedTasksMap.set(ct.id, ct);
    stats.tasksSynced++;
  }

  // 5. Merge Goals
  const mergedGoalsMap = new Map<string, GoalItem>();
  const cloudGoalLookup = new Map<string, GoalItem>();
  cloudGoals.forEach((cg) => cloudGoalLookup.set(cg.id, cg));

  for (const localGoal of local.goals) {
    const cloudGoal = cloudGoalLookup.get(localGoal.id);
    if (!cloudGoal) {
      await saveGoalToCloud(verifiedId, localGoal);
      mergedGoalsMap.set(localGoal.id, localGoal);
      stats.goalsSynced++;
    } else {
      const localUpdated = localGoal.updatedAt || localGoal.createdAt || 0;
      const cloudUpdated = cloudGoal.updatedAt || cloudGoal.createdAt || 0;
      if (localUpdated >= cloudUpdated) {
        await saveGoalToCloud(verifiedId, localGoal);
        mergedGoalsMap.set(localGoal.id, localGoal);
      } else {
        mergedGoalsMap.set(localGoal.id, cloudGoal);
      }
      stats.goalsSynced++;
      cloudGoalLookup.delete(localGoal.id);
    }
  }
  for (const [, cg] of cloudGoalLookup) {
    mergedGoalsMap.set(cg.id, cg);
    stats.goalsSynced++;
  }

  // 6. Merge Quick Notes
  const mergedNotesMap = new Map<string, QuickNote>();
  const cloudNoteLookup = new Map<string, QuickNote>();
  cloudNotes.forEach((cn) => cloudNoteLookup.set(cn.id, cn));

  for (const localNote of local.quickNotes) {
    const cloudNote = cloudNoteLookup.get(localNote.id);
    if (!cloudNote) {
      await saveQuickNoteToCloud(verifiedId, localNote);
      mergedNotesMap.set(localNote.id, localNote);
      stats.notesSynced++;
    } else {
      const localUpdated = localNote.updatedAt || localNote.createdAt || 0;
      const cloudUpdated = cloudNote.updatedAt || cloudNote.createdAt || 0;
      if (localUpdated >= cloudUpdated) {
        await saveQuickNoteToCloud(verifiedId, localNote);
        mergedNotesMap.set(localNote.id, localNote);
      } else {
        mergedNotesMap.set(localNote.id, cloudNote);
      }
      stats.notesSynced++;
      cloudNoteLookup.delete(localNote.id);
    }
  }
  for (const [, cn] of cloudNoteLookup) {
    mergedNotesMap.set(cn.id, cn);
    stats.notesSynced++;
  }

  return {
    maps: Array.from(mergedMapsMap.values()),
    tasks: Array.from(mergedTasksMap.values()),
    goals: Array.from(mergedGoalsMap.values()),
    folders: Array.from(mergedFoldersMap.values()),
    quickNotes: Array.from(mergedNotesMap.values()),
    stats,
  };
}

// 8. Public Share Registry
export interface PublicShareRecord {
  shareToken: string;
  mapId: string;
  ownerId: string;
  title: string;
  role: 'viewer' | 'commenter' | 'editor';
  mapData: {
    map: MindMap;
    nodes: MindNode[];
    edges: MindEdge[];
  };
  isActive: boolean;
  createdAt: number;
  expiresAt: number;
}

export async function createOrUpdatePublicShare(
  userId: string,
  shareToken: string,
  map: MindMap,
  nodes: MindNode[],
  edges: MindEdge[],
  role: 'viewer' | 'commenter' | 'editor' = 'viewer'
): Promise<void> {
  const verifiedId = getVerifiedUserId(userId);
  if (!verifiedId) return;

  const path = `publicShares/${shareToken}`;
  try {
    const record: PublicShareRecord = {
      shareToken,
      mapId: map.id,
      ownerId: verifiedId,
      title: map.title,
      role,
      mapData: {
        map: { ...map, visibility: 'link', ownerId: verifiedId },
        nodes,
        edges,
      },
      isActive: true,
      createdAt: Date.now(),
      expiresAt: 0, // 0 = never expires
    };

    await setDoc(doc(db, 'publicShares', shareToken), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchPublicShareByToken(shareToken: string): Promise<PublicShareRecord | null> {
  const path = `publicShares/${shareToken}`;
  try {
    const snap = await getDoc(doc(db, 'publicShares', shareToken));
    if (snap.exists()) {
      const data = snap.data() as PublicShareRecord;
      if (data.isActive) {
        return data;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
