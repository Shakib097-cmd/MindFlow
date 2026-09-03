import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  MindMap,
  MindNode,
  MindEdge,
  MapLayout,
  TaskItem,
  GoalItem,
  FolderItem,
  NodeType,
  NodeStyle,
  TemplateItem,
  UsageData,
  QuickNote,
  QuickNoteColor,
} from '../types';
import { LegalDocId, ALL_LEGAL_LINKS } from '../data/legalData';
import {
  getStoredMaps,
  saveStoredMaps,
  getStoredNodes,
  saveStoredNodes,
  getStoredEdges,
  saveStoredEdges,
  getStoredTasks,
  saveStoredTasks,
  getStoredGoals,
  saveStoredGoals,
  getStoredFolders,
  saveStoredFolders,
  getStoredUsage,
  incrementUsage,
  saveVersionSnapshot,
  getStoredQuickNotes,
  saveStoredQuickNotes,
  addStoredQuickNote,
  updateStoredQuickNote,
  deleteStoredQuickNote,
} from '../lib/storage';
import { applyLayout, parseHierarchyToCanvas } from '../lib/layoutEngine';
import { useAuth } from './AuthContext';
import {
  saveMapToCloud,
  deleteMapFromCloud,
  saveFolderToCloud,
  deleteFolderFromCloud,
  saveTaskToCloud,
  deleteTaskFromCloud,
  saveGoalToCloud,
  deleteGoalFromCloud,
  saveQuickNoteToCloud,
  deleteQuickNoteFromCloud,
  subscribeToUserCloudMaps,
  subscribeToUserCloudFolders,
  subscribeToUserCloudTasks,
  subscribeToUserCloudGoals,
  subscribeToUserCloudQuickNotes,
  executeTwoWaySync,
  checkFirestoreConnection,
  fetchPublicShareByToken,
} from '../services/firestoreSyncService';
import {
  subscribeToFirestoreUsage,
  incrementFirestoreUsage,
} from '../services/usageFirestoreService';
import confetti from 'canvas-confetti';

export type WorkspaceView =
  | 'landing'
  | 'dashboard'
  | 'editor'
  | 'my_maps'
  | 'tasks'
  | 'goals'
  | 'templates'
  | 'study_mode'
  | 'presentation'
  | 'settings'
  | 'admin'
  | 'legal'
  | 'user_manual';

export type SyncStatus = 'saved' | 'saving' | 'synced' | 'syncing' | 'offline' | 'error';

interface WorkspaceContextType {
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  legalDocId: LegalDocId;
  setLegalDocId: (docId: LegalDocId) => void;
  openLegal: (docId?: LegalDocId) => void;
  userManualCategory: string;
  setUserManualCategory: (cat: string) => void;
  openUserManual: (category?: string, article?: string) => void;
  activeMap: MindMap | null;
  nodes: MindNode[];
  edges: MindEdge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  zoom: number;
  pan: { x: number; y: number };
  activeLayout: MapLayout;
  isSaving: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
  clearSyncError: () => void;
  searchQuery: string;
  searchResults: string[];
  allMaps: MindMap[];
  allTasks: TaskItem[];
  allGoals: GoalItem[];
  allFolders: FolderItem[];
  quickNotes: QuickNote[];
  usage: UsageData;
  setZoom: (z: number | ((prev: number) => number)) => void;
  setPan: (p: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setSelectedNodeId: (id: string | null) => void;
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  toggleNodeSelection: (id: string, multi?: boolean) => void;
  setSearchQuery: (query: string) => void;
  openMap: (mapId: string) => void;
  createNewMap: (title?: string, layout?: MapLayout) => MindMap;
  createMapFromHierarchy: (payload: any, layout?: MapLayout) => MindMap;
  createMapFromTemplate: (template: TemplateItem) => MindMap;
  updateMapMetadata: (updates: Partial<MindMap>) => void;
  deleteMap: (mapId: string) => void;
  trashMap: (mapId: string) => void;
  restoreMap: (mapId: string) => void;
  permanentDeleteMap: (mapId: string) => void;
  toggleFavoriteMap: (mapId: string) => void;
  assignMapToFolder: (mapId: string, folderId: string | undefined) => void;
  changeMapLayout: (layout: MapLayout) => void;
  addNodeChild: (parentId: string, title?: string, type?: NodeType) => MindNode;
  addNodeSibling: (siblingId: string, title?: string, type?: NodeType) => MindNode;
  updateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  updateNodeStyle: (nodeId: string, styleUpdates: Partial<NodeStyle>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  convertNodeToTask: (nodeId: string, priority?: 'low' | 'medium' | 'high' | 'urgent') => TaskItem;
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => TaskItem;
  addMultipleTasks: (tasks: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>[]) => TaskItem[];
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  deleteTask: (taskId: string) => void;
  addGoal: (goal: Omit<GoalItem, 'id' | 'createdAt' | 'updatedAt'>) => GoalItem;
  updateGoal: (goalId: string, updates: Partial<GoalItem>) => void;
  deleteGoal: (goalId: string) => void;
  addFolder: (name: string, color?: string, icon?: string) => FolderItem;
  updateFolder: (folderId: string, updates: Partial<FolderItem>) => void;
  deleteFolder: (folderId: string) => void;
  addQuickNote: (content: string, options?: { title?: string; tags?: string[]; color?: QuickNoteColor }) => QuickNote;
  updateQuickNote: (id: string, updates: Partial<QuickNote>) => void;
  deleteQuickNote: (id: string) => void;
  convertQuickNoteToNode: (noteId: string, targetMapId?: string, targetParentId?: string) => MindNode | null;
  convertQuickNoteToMap: (noteId: string, options?: { layout?: MapLayout }) => MindMap | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isAIGeneratorOpen: boolean;
  setIsAIGeneratorOpen: (open: boolean) => void;
  isMultimodalOpen: boolean;
  setIsMultimodalOpen: (open: boolean) => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  isExportShareOpen: boolean;
  setIsExportShareOpen: (open: boolean) => void;
  isPricingOpen: boolean;
  setIsPricingOpen: (open: boolean) => void;
  isVersionHistoryOpen: boolean;
  setIsVersionHistoryOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isQuickNotesOpen: boolean;
  setIsQuickNotesOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  recordUsage: (type: 'ai' | 'map' | 'export' | 'voice') => Promise<UsageData>;
  fitToScreen: () => void;
  autoArrangeMap: () => void;
  triggerCelebration: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize view from URL if matching a legal route or user manual route
  const getInitialRouteMatch = (): { view: WorkspaceView; legalDocId: LegalDocId; manualCategory: string } => {
    if (typeof window === 'undefined') return { view: 'dashboard', legalDocId: 'privacy', manualCategory: 'getting-started' };
    const path = window.location.pathname;
    if (path.startsWith('/help/user-manual') || path.startsWith('/user-manual')) {
      const hash = window.location.hash.replace('#', '');
      return { view: 'user_manual', legalDocId: 'privacy', manualCategory: hash || 'getting-started' };
    }
    const match = ALL_LEGAL_LINKS.find((l) => l.route === path);
    if (match) {
      return { view: 'legal', legalDocId: match.id as LegalDocId, manualCategory: 'getting-started' };
    }
    if (path === '/landing') {
      return { view: 'landing', legalDocId: 'privacy', manualCategory: 'getting-started' };
    }
    if (path === '/editor' || path === '/canvas') {
      return { view: 'editor', legalDocId: 'privacy', manualCategory: 'getting-started' };
    }
    if (path === '/tasks') {
      return { view: 'tasks', legalDocId: 'privacy', manualCategory: 'getting-started' };
    }
    if (path === '/templates') {
      return { view: 'templates', legalDocId: 'privacy', manualCategory: 'getting-started' };
    }
    if (path === '/my-maps' || path === '/maps') {
      return { view: 'my_maps', legalDocId: 'privacy', manualCategory: 'getting-started' };
    }
    if (path === '/admin') {
      return { view: 'admin', legalDocId: 'privacy', manualCategory: 'getting-started' };
    }
    return { view: 'dashboard', legalDocId: 'privacy', manualCategory: 'getting-started' };
  };

  const initialRoute = getInitialRouteMatch();
  const [currentView, setCurrentView] = useState<WorkspaceView>(initialRoute.view);
  const [legalDocId, setLegalDocId] = useState<LegalDocId>(initialRoute.legalDocId);
  const [userManualCategory, setUserManualCategory] = useState<string>(initialRoute.manualCategory);

  // Listen to popstate for legal, manual and standard routes
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path.startsWith('/help/user-manual') || path.startsWith('/user-manual')) {
        const hash = window.location.hash.replace('#', '');
        setUserManualCategory(hash || 'getting-started');
        setCurrentView('user_manual');
        return;
      }
      const match = ALL_LEGAL_LINKS.find((l) => l.route === path);
      if (match) {
        setLegalDocId(match.id as LegalDocId);
        setCurrentView('legal');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const openLegal = useCallback((docId: LegalDocId = 'privacy') => {
    setLegalDocId(docId);
    setCurrentView('legal');
    const targetLink = ALL_LEGAL_LINKS.find((l) => l.id === docId);
    if (targetLink && typeof window !== 'undefined') {
      window.history.pushState({}, '', targetLink.route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openUserManual = useCallback((category: string = 'getting-started', article?: string) => {
    setUserManualCategory(category);
    setCurrentView('user_manual');
    if (typeof window !== 'undefined') {
      const targetHash = article || (category !== 'getting-started' ? category : '');
      window.history.pushState({}, '', `/help/user-manual${targetHash ? '#' + targetHash : ''}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [allMaps, setAllMaps] = useState<MindMap[]>([]);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [allGoals, setAllGoals] = useState<GoalItem[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [usage, setUsage] = useState<UsageData>(getStoredUsage());

  const [activeMap, setActiveMap] = useState<MindMap | null>(null);
  const [nodes, setNodes] = useState<MindNode[]>([]);
  const [edges, setEdges] = useState<MindEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLayout, setActiveLayout] = useState<MapLayout>('left-to-right');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() => Date.now());
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const [history, setHistory] = useState<Array<{ nodes: MindNode[]; edges: MindEdge[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isMultimodalOpen, setIsMultimodalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isExportShareOpen, setIsExportShareOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, profile } = useAuth();
  const activeUserId = profile?.id || user?.uid || 'current-user';
  const activePlan = profile?.plan || 'pro';

  const cloudDebounceTimer = useRef<any>(null);
  const nodePositionDebounceTimer = useRef<any>(null);

  const clearSyncError = useCallback(() => {
    setSyncError(null);
    if (syncStatus === 'error') {
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    }
  }, [syncStatus]);

  // Wrapper for executing Firestore Cloud CRUD operations with live synchronization state tracking
  const performCloudOperation = useCallback(
    async <T,>(operation: () => Promise<T>, errorMessage = 'Cloud sync failed'): Promise<T | null> => {
      if (!user || !user.uid || activeUserId === 'demo-user' || activeUserId === 'current-user') {
        return null;
      }
      setIsSyncing(true);
      try {
        const result = await operation();
        setLastSyncedAt(Date.now());
        setSyncError(null);
        if (syncStatus === 'error' || syncStatus === 'offline') {
          setSyncStatus('synced');
        }
        return result;
      } catch (err: any) {
        console.error('Cloud operation error:', err);
        const isOff = !navigator.onLine;
        setSyncStatus(isOff ? 'offline' : 'error');
        setSyncError(err?.message || errorMessage);
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [user, activeUserId, syncStatus]
  );

  // Network Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
      syncNow();
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeUserId]);

  // Load User Cached Data on Initial Mount or User Switch (Strict Isolation)
  useEffect(() => {
    const loadedMaps = getStoredMaps(activeUserId);
    const loadedTasks = getStoredTasks(activeUserId);
    const loadedGoals = getStoredGoals(activeUserId);
    const loadedFolders = getStoredFolders(activeUserId);
    const loadedNotes = getStoredQuickNotes(activeUserId);

    setAllMaps(loadedMaps);
    setAllTasks(loadedTasks);
    setAllGoals(loadedGoals);
    setAllFolders(loadedFolders);
    setQuickNotes(loadedNotes);
    setUsage(getStoredUsage());

    if (loadedMaps.length > 0) {
      const firstMap = loadedMaps.find((m) => !m.isTrash) || loadedMaps[0];
      setActiveMap(firstMap);
      setActiveLayout(firstMap.layout || 'left-to-right');
      const loadedNodes = getStoredNodes(firstMap.id, activeUserId);
      const loadedEdges = getStoredEdges(firstMap.id, activeUserId);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setHistory([{ nodes: loadedNodes, edges: loadedEdges }]);
      setHistoryIndex(0);
    } else {
      setActiveMap(null);
      setNodes([]);
      setEdges([]);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [activeUserId]);

  // Real-time Firestore Subscriptions for Authenticated Users
  useEffect(() => {
    if (!user || !user.uid || activeUserId === 'current-user' || activeUserId === 'demo-user') {
      return;
    }

    // 1. Subscribe to Maps
    const unsubMaps = subscribeToUserCloudMaps(activeUserId, (cloudMaps) => {
      if (cloudMaps && Array.isArray(cloudMaps)) {
        setAllMaps((prev) => {
          const mapDict = new Map<string, MindMap>();
          // Preserve local items
          (prev || []).forEach((m) => {
            if (m && m.id) mapDict.set(m.id, m);
          });
          // Apply cloud items
          (cloudMaps || []).forEach((cm) => {
            if (cm && cm.map && cm.map.id) {
              const existing = mapDict.get(cm.map.id);
              if (!existing || (cm.map.updatedAt || 0) >= (existing.updatedAt || 0)) {
                mapDict.set(cm.map.id, cm.map);
                saveStoredNodes(cm.nodes || [], cm.map.id, activeUserId);
                saveStoredEdges(cm.edges || [], cm.map.id, activeUserId);
              }
            }
          });
          const merged = Array.from(mapDict.values());
          saveStoredMaps(merged, activeUserId);
          return merged;
        });
        setLastSyncedAt(Date.now());
        setSyncError(null);
      }
    });

    // 2. Subscribe to Folders
    const unsubFolders = subscribeToUserCloudFolders(activeUserId, (cloudFolders) => {
      if (cloudFolders && Array.isArray(cloudFolders)) {
        setAllFolders((prev) => {
          const folderDict = new Map<string, FolderItem>();
          (prev || []).forEach((f) => {
            if (f && f.id) folderDict.set(f.id, f);
          });
          (cloudFolders || []).forEach((cf) => {
            if (cf && cf.id) folderDict.set(cf.id, cf);
          });
          const merged = Array.from(folderDict.values());
          saveStoredFolders(merged, activeUserId);
          return merged;
        });
        setLastSyncedAt(Date.now());
        setSyncError(null);
      }
    });

    // 3. Subscribe to Tasks
    const unsubTasks = subscribeToUserCloudTasks(activeUserId, (cloudTasks) => {
      if (cloudTasks && Array.isArray(cloudTasks)) {
        setAllTasks((prev) => {
          const taskDict = new Map<string, TaskItem>();
          (prev || []).forEach((t) => {
            if (t && t.id) taskDict.set(t.id, t);
          });
          (cloudTasks || []).forEach((ct) => {
            if (ct && ct.id) taskDict.set(ct.id, ct);
          });
          const merged = Array.from(taskDict.values());
          saveStoredTasks(merged, activeUserId);
          return merged;
        });
        setLastSyncedAt(Date.now());
        setSyncError(null);
      }
    });

    // 4. Subscribe to Goals
    const unsubGoals = subscribeToUserCloudGoals(activeUserId, (cloudGoals) => {
      if (cloudGoals && Array.isArray(cloudGoals)) {
        setAllGoals((prev) => {
          const goalDict = new Map<string, GoalItem>();
          (prev || []).forEach((g) => {
            if (g && g.id) goalDict.set(g.id, g);
          });
          (cloudGoals || []).forEach((cg) => {
            if (cg && cg.id) goalDict.set(cg.id, cg);
          });
          const merged = Array.from(goalDict.values());
          saveStoredGoals(merged, activeUserId);
          return merged;
        });
        setLastSyncedAt(Date.now());
        setSyncError(null);
      }
    });

    // 5. Subscribe to Quick Notes
    const unsubNotes = subscribeToUserCloudQuickNotes(activeUserId, (cloudNotes) => {
      if (cloudNotes && Array.isArray(cloudNotes)) {
        setQuickNotes((prev) => {
          const noteDict = new Map<string, QuickNote>();
          (prev || []).forEach((n) => {
            if (n && n.id) noteDict.set(n.id, n);
          });
          (cloudNotes || []).forEach((cn) => {
            if (cn && cn.id) noteDict.set(cn.id, cn);
          });
          const merged = Array.from(noteDict.values());
          saveStoredQuickNotes(merged, activeUserId);
          return merged;
        });
        setLastSyncedAt(Date.now());
        setSyncError(null);
      }
    });

    // 6. Subscribe to Usage Quotas
    const unsubUsage = subscribeToFirestoreUsage(
      activeUserId,
      (updatedUsage) => {
        setUsage(updatedUsage);
      },
      activePlan
    );

    return () => {
      unsubMaps();
      unsubFolders();
      unsubTasks();
      unsubGoals();
      unsubNotes();
      unsubUsage();
    };
  }, [activeUserId, user, activePlan]);

  const recordUsage = async (type: 'ai' | 'map' | 'export' | 'voice'): Promise<UsageData> => {
    const updated = await incrementFirestoreUsage(activeUserId, type, activePlan);
    setUsage(updated);
    return updated;
  };

  // Check URL Hash and Path for admin and shared maps (#share-TOKEN, #admin, /admin)
  useEffect(() => {
    const checkHashRoute = async () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      if (pathname.startsWith('/admin') || hash === '#admin' || hash.startsWith('#admin/')) {
        setCurrentView('admin');
        return;
      }

      const isSharePath = pathname.startsWith('/share/');
      const token = hash.startsWith('#share-')
        ? hash.replace('#share-', '').trim()
        : isSharePath
        ? pathname.replace('/share/', '').trim()
        : null;

      if (token) {
        const publicShare = await fetchPublicShareByToken(token);
        if (publicShare && publicShare.mapData) {
          setActiveMap(publicShare.mapData.map);
          setActiveLayout(publicShare.mapData.map.layout || 'left-to-right');
          setNodes(publicShare.mapData.nodes);
          setEdges(publicShare.mapData.edges);
          setHistory([{ nodes: publicShare.mapData.nodes, edges: publicShare.mapData.edges }]);
          setHistoryIndex(0);
          setCurrentView('editor');
        }
      }
    };
    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  // Canvas Persistence (Local Cache + Debounced Cloud Save)
  const persistCanvasState = useCallback(
    (newNodes: MindNode[], newEdges: MindEdge[], mapToUpdate?: MindMap) => {
      const map = mapToUpdate || activeMap;
      if (!map) return;

      setIsSaving(true);
      setSyncStatus('saving');
      saveStoredNodes(newNodes, map.id, activeUserId);
      saveStoredEdges(newEdges, map.id, activeUserId);

      const updatedMap = {
        ...map,
        nodesCount: newNodes.length,
        updatedAt: Date.now(),
      };

      const updatedMaps = allMaps.map((m) => (m.id === map.id ? updatedMap : m));
      setAllMaps(updatedMaps);
      saveStoredMaps(updatedMaps, activeUserId);

      // Debounce Cloud Firestore persistence to avoid spamming network
      if (cloudDebounceTimer.current) {
        clearTimeout(cloudDebounceTimer.current);
      }
      cloudDebounceTimer.current = setTimeout(async () => {
        setIsSyncing(true);
        try {
          const success = await saveMapToCloud(activeUserId, updatedMap, newNodes, newEdges);
          if (success) {
            setSyncStatus('synced');
            setLastSyncedAt(Date.now());
            setSyncError(null);
          } else {
            setSyncStatus('saved');
          }
        } catch (err: any) {
          const isOff = !navigator.onLine;
          setSyncStatus(isOff ? 'offline' : 'error');
          setSyncError(err?.message || 'Failed to save map changes to cloud');
        } finally {
          setIsSyncing(false);
        }
      }, 600);

      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    },
    [activeMap, allMaps, activeUserId]
  );

  // Manual or Triggered Full 2-Way Sync Now
  const syncNow = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const isOnline = await checkFirestoreConnection();
      if (!isOnline) {
        setSyncStatus('offline');
        setSyncError('Network is offline. Local state is safely preserved.');
        setIsSyncing(false);
        return;
      }

      if (!user || activeUserId === 'demo-user' || activeUserId === 'current-user') {
        // Guest mode sync is purely local
        setTimeout(() => {
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
          setIsSyncing(false);
        }, 400);
        return;
      }

      const merged = await executeTwoWaySync(activeUserId, {
        maps: allMaps,
        tasks: allTasks,
        goals: allGoals,
        folders: allFolders,
        quickNotes,
        getNodesForMap: (mid) => getStoredNodes(mid, activeUserId),
        getEdgesForMap: (mid) => getStoredEdges(mid, activeUserId),
      });

      setAllMaps(merged.maps);
      setAllTasks(merged.tasks);
      setAllGoals(merged.goals);
      setAllFolders(merged.folders);
      setQuickNotes(merged.quickNotes);

      saveStoredMaps(merged.maps, activeUserId);
      saveStoredTasks(merged.tasks, activeUserId);
      saveStoredGoals(merged.goals, activeUserId);
      saveStoredFolders(merged.folders, activeUserId);
      saveStoredQuickNotes(merged.quickNotes, activeUserId);

      setSyncStatus('synced');
      setLastSyncedAt(Date.now());
      setSyncError(null);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncError(err?.message || 'Synchronization failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const pushHistory = useCallback(
    (newNodes: MindNode[], newEdges: MindEdge[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, { nodes: newNodes, edges: newEdges }].slice(-30);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  const undo = () => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setNodes(target.nodes);
      setEdges(target.edges);
      setHistoryIndex(historyIndex - 1);
      persistCanvasState(target.nodes, target.edges);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setNodes(target.nodes);
      setEdges(target.edges);
      setHistoryIndex(historyIndex + 1);
      persistCanvasState(target.nodes, target.edges);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = nodes
      .filter((n) => n.title.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q))
      .map((n) => n.id);
    setSearchResults(matches);
  }, [searchQuery, nodes]);

  const openMap = (mapId: string) => {
    const targetMap = allMaps.find((m) => m.id === mapId);
    if (!targetMap) return;

    setActiveMap(targetMap);
    setActiveLayout(targetMap.layout || 'left-to-right');
    let loadedNodes = getStoredNodes(mapId, activeUserId);
    let loadedEdges = getStoredEdges(mapId, activeUserId);

    // If map has no nodes (e.g. fresh blank map), initialize central root node immediately
    if (!loadedNodes || loadedNodes.length === 0) {
      const rootId = 'node-' + Math.random().toString(36).substr(2, 9);
      const rootNode: MindNode = {
        id: rootId,
        mapId: targetMap.id,
        parentId: null,
        title: targetMap.title || 'Central Topic',
        description: 'Double-click to edit or press Tab to add child idea',
        type: 'standard',
        x: -120,
        y: -37,
        width: 240,
        height: 74,
        style: {
          shape: 'rounded',
          backgroundColor: '#4f46e5',
          textColor: '#ffffff',
          borderColor: '#4338ca',
          borderWidth: 2,
          fontSize: 'lg',
          fontWeight: 'bold',
          textAlign: 'center',
          shadow: 'md',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      loadedNodes = [rootNode];
      loadedEdges = [];
      saveStoredNodes(loadedNodes, mapId, activeUserId);
      saveStoredEdges(loadedEdges, mapId, activeUserId);
    }

    setNodes(loadedNodes);
    setEdges(loadedEdges);
    const initialSelected = loadedNodes[0]?.id || null;
    setSelectedNodeId(initialSelected);
    setSelectedNodeIds(initialSelected ? [initialSelected] : []);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHistory([{ nodes: loadedNodes, edges: loadedEdges }]);
    setHistoryIndex(0);
    setCurrentView('editor');
  };

  const createNewMap = (title = 'Central Topic', layout: MapLayout = 'left-to-right'): MindMap => {
    const newMapId = 'map-' + Math.random().toString(36).substr(2, 9);
    const rootId = 'node-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    const rootNode: MindNode = {
      id: rootId,
      mapId: newMapId,
      parentId: null,
      title: title || 'Central Topic',
      description: 'Double-click to edit or press Tab to add child idea',
      type: 'standard',
      x: -120,
      y: -37,
      width: 240,
      height: 74,
      style: {
        shape: 'rounded',
        backgroundColor: '#4f46e5',
        textColor: '#ffffff',
        borderColor: '#4338ca',
        borderWidth: 2,
        fontSize: 'lg',
        fontWeight: 'bold',
        textAlign: 'center',
        shadow: 'md',
      },
      createdAt: now,
      updatedAt: now,
    };

    const newMap: MindMap = {
      id: newMapId,
      ownerId: activeUserId,
      title: title && title !== 'Central Topic' ? title : 'Untitled Mind Map',
      category: 'General',
      visibility: 'private',
      isFavorite: false,
      layout,
      rootNodeId: rootId,
      nodesCount: 1,
      tasksCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const nextMaps = [newMap, ...allMaps];
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);

    const initialNodes = [rootNode];
    const initialEdges: MindEdge[] = [];

    setActiveMap(newMap);
    setActiveLayout(layout);
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(rootId);
    setSelectedNodeIds([rootId]);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHistory([{ nodes: initialNodes, edges: initialEdges }]);
    setHistoryIndex(0);

    saveStoredNodes(initialNodes, newMapId, activeUserId);
    saveStoredEdges(initialEdges, newMapId, activeUserId);
    performCloudOperation(
      () => saveMapToCloud(activeUserId, newMap, initialNodes, initialEdges),
      'Failed to sync new map to cloud'
    );

    incrementUsage('map');
    setUsage(getStoredUsage());
    setCurrentView('editor');

    return newMap;
  };

  const createMapFromHierarchy = (payload: any, layout: MapLayout = 'left-to-right'): MindMap => {
    const newMapId = 'map-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    const { nodes: parsedNodes, edges: parsedEdges, rootId } = parseHierarchyToCanvas(
      payload.root || payload,
      newMapId,
      layout
    );

    const newMap: MindMap = {
      id: newMapId,
      ownerId: activeUserId,
      title: payload.title || 'AI Generated Mind Map',
      description: payload.description || 'Generated with MindFlow AI',
      category: payload.category || 'Strategy',
      visibility: 'private',
      isFavorite: false,
      layout,
      rootNodeId: rootId,
      nodesCount: parsedNodes.length,
      tasksCount: parsedNodes.filter((n) => n.type === 'task').length,
      createdAt: now,
      updatedAt: now,
    };

    const nextMaps = [newMap, ...allMaps];
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);

    setActiveMap(newMap);
    setActiveLayout(layout);
    setNodes(parsedNodes);
    setEdges(parsedEdges);
    setSelectedNodeId(rootId);
    setSelectedNodeIds([rootId]);
    setPan({ x: 0, y: 0 });
    setZoom(0.95);
    setHistory([{ nodes: parsedNodes, edges: parsedEdges }]);
    setHistoryIndex(0);

    saveStoredNodes(parsedNodes, newMapId, activeUserId);
    saveStoredEdges(parsedEdges, newMapId, activeUserId);
    performCloudOperation(
      () => saveMapToCloud(activeUserId, newMap, parsedNodes, parsedEdges),
      'Failed to sync AI generated map to cloud'
    );

    recordUsage('ai');
    recordUsage('map');
    saveVersionSnapshot(newMapId, 'Initial AI Generation', parsedNodes, parsedEdges);
    setCurrentView('editor');

    return newMap;
  };

  const createMapFromTemplate = (template: TemplateItem): MindMap => {
    const newMapId = 'map-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    const idMapping = new Map<string, string>();
    template.nodes.forEach((n) => {
      idMapping.set(n.id, 'node-' + Math.random().toString(36).substr(2, 9));
    });

    const parsedNodes: MindNode[] = template.nodes.map((n) => {
      const newId = idMapping.get(n.id) || n.id;
      const newParentId = n.parentId ? idMapping.get(n.parentId) || null : null;
      return {
        ...n,
        id: newId,
        mapId: newMapId,
        parentId: newParentId,
        createdAt: now,
        updatedAt: now,
      };
    });

    const parsedEdges: MindEdge[] = template.edges.map((e) => ({
      id: 'edge-' + Math.random().toString(36).substr(2, 9),
      mapId: newMapId,
      sourceId: idMapping.get(e.sourceId) || e.sourceId,
      targetId: idMapping.get(e.targetId) || e.targetId,
      style: e.style,
    }));

    const rootNode = parsedNodes.find((n) => !n.parentId) || parsedNodes[0];

    const newMap: MindMap = {
      id: newMapId,
      ownerId: activeUserId,
      title: template.title,
      description: template.description,
      category: template.category,
      visibility: 'private',
      isFavorite: false,
      layout: 'left-to-right',
      rootNodeId: rootNode?.id || '',
      tags: template.tags,
      nodesCount: parsedNodes.length,
      tasksCount: parsedNodes.filter((n) => n.type === 'task').length,
      createdAt: now,
      updatedAt: now,
    };

    const nextMaps = [newMap, ...allMaps];
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);

    setActiveMap(newMap);
    setActiveLayout('left-to-right');
    setNodes(parsedNodes);
    setEdges(parsedEdges);
    setSelectedNodeId(rootNode?.id || null);
    setSelectedNodeIds(rootNode ? [rootNode.id] : []);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHistory([{ nodes: parsedNodes, edges: parsedEdges }]);
    setHistoryIndex(0);

    saveStoredNodes(parsedNodes, newMapId, activeUserId);
    saveStoredEdges(parsedEdges, newMapId, activeUserId);
    performCloudOperation(
      () => saveMapToCloud(activeUserId, newMap, parsedNodes, parsedEdges),
      'Failed to sync template map to cloud'
    );

    incrementUsage('map');
    setUsage(getStoredUsage());
    setCurrentView('editor');

    return newMap;
  };

  const updateMapMetadata = (updates: Partial<MindMap>) => {
    if (!activeMap) return;
    const updated = { ...activeMap, ...updates, updatedAt: Date.now() };
    setActiveMap(updated);
    const nextMaps = allMaps.map((m) => (m.id === updated.id ? updated : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    performCloudOperation(
      () => saveMapToCloud(activeUserId, updated, nodes, edges),
      'Failed to update map metadata in cloud'
    );
  };

  // Map Trash, Restore & Delete Operations
  const trashMap = (mapId: string) => {
    const nextMaps = allMaps.map((m) => (m.id === mapId ? { ...m, isTrash: true, updatedAt: Date.now() } : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    const trashed = nextMaps.find((m) => m.id === mapId);
    if (trashed) {
      performCloudOperation(
        () => saveMapToCloud(activeUserId, trashed, getStoredNodes(mapId, activeUserId), getStoredEdges(mapId, activeUserId)),
        'Failed to trash map in cloud'
      );
    }
  };

  const restoreMap = (mapId: string) => {
    const nextMaps = allMaps.map((m) => (m.id === mapId ? { ...m, isTrash: false, updatedAt: Date.now() } : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    const restored = nextMaps.find((m) => m.id === mapId);
    if (restored) {
      performCloudOperation(
        () => saveMapToCloud(activeUserId, restored, getStoredNodes(mapId, activeUserId), getStoredEdges(mapId, activeUserId)),
        'Failed to restore map in cloud'
      );
    }
  };

  const permanentDeleteMap = (mapId: string) => {
    const nextMaps = allMaps.filter((m) => m.id !== mapId);
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    performCloudOperation(
      () => deleteMapFromCloud(activeUserId, mapId),
      'Failed to permanently delete map from cloud'
    );

    if (activeMap?.id === mapId) {
      const remaining = nextMaps.filter((m) => !m.isTrash);
      if (remaining.length > 0) {
        openMap(remaining[0].id);
      } else {
        createNewMap();
      }
    }
  };

  const deleteMap = (mapId: string) => {
    trashMap(mapId);
  };

  const toggleFavoriteMap = (mapId: string) => {
    const nextMaps = allMaps.map((m) => (m.id === mapId ? { ...m, isFavorite: !m.isFavorite, updatedAt: Date.now() } : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    const updated = nextMaps.find((m) => m.id === mapId);
    if (updated) {
      performCloudOperation(
        () => saveMapToCloud(activeUserId, updated, getStoredNodes(mapId, activeUserId), getStoredEdges(mapId, activeUserId)),
        'Failed to toggle favorite map in cloud'
      );
    }
    if (activeMap?.id === mapId) {
      setActiveMap((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const assignMapToFolder = (mapId: string, folderId: string | undefined) => {
    const nextMaps = allMaps.map((m) => (m.id === mapId ? { ...m, folderId, updatedAt: Date.now() } : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    const updated = nextMaps.find((m) => m.id === mapId);
    if (updated) {
      performCloudOperation(
        () => saveMapToCloud(activeUserId, updated, getStoredNodes(mapId, activeUserId), getStoredEdges(mapId, activeUserId)),
        'Failed to assign map to folder in cloud'
      );
    }
  };

  const changeMapLayout = (layout: MapLayout) => {
    setActiveLayout(layout);
    if (activeMap) {
      updateMapMetadata({ layout });
      const arranged = applyLayout(nodes, edges, layout, activeMap.rootNodeId);
      setNodes(arranged);
      persistCanvasState(arranged, edges);
      pushHistory(arranged, edges);
    }
  };

  const autoArrangeMap = () => {
    if (activeMap) {
      const arranged = applyLayout(nodes, edges, activeLayout, activeMap.rootNodeId);
      setNodes(arranged);
      persistCanvasState(arranged, edges);
      pushHistory(arranged, edges);
    }
  };

  const toggleNodeSelection = (id: string, multi = false) => {
    if (multi) {
      setSelectedNodeIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      setSelectedNodeId(id);
    } else {
      setSelectedNodeId(id);
      setSelectedNodeIds([id]);
    }
  };

  const addNodeChild = (parentId: string, title = 'New Idea', type: NodeType = 'idea'): MindNode => {
    if (!activeMap) throw new Error('No active map');

    const now = Date.now();

    // If nodes is empty or parentId is not specified, create root node
    if (nodes.length === 0 || !parentId) {
      const rootId = 'node-' + Math.random().toString(36).substr(2, 9);
      const rootNode: MindNode = {
        id: rootId,
        mapId: activeMap.id,
        parentId: null,
        title: title || 'Central Topic',
        type: 'standard',
        x: -120,
        y: -37,
        width: 240,
        height: 74,
        style: {
          shape: 'rounded',
          backgroundColor: '#4f46e5',
          textColor: '#ffffff',
          borderColor: '#4338ca',
          borderWidth: 2,
          fontSize: 'lg',
          fontWeight: 'bold',
          shadow: 'md',
        },
        createdAt: now,
        updatedAt: now,
      };
      const nextNodes = [rootNode];
      setNodes(nextNodes);
      setEdges([]);
      setSelectedNodeId(rootId);
      setSelectedNodeIds([rootId]);
      setEditingNodeId(rootId);
      persistCanvasState(nextNodes, []);
      pushHistory(nextNodes, []);
      return rootNode;
    }

    const parent = nodes.find((n) => n.id === parentId);
    const childId = 'node-' + Math.random().toString(36).substr(2, 9);

    const parentColor = parent?.style.borderColor || '#4f46e5';

    const childNode: MindNode = {
      id: childId,
      mapId: activeMap.id,
      parentId,
      title,
      type,
      x: (parent?.x || 0) + 260,
      y: (parent?.y || 0) + (Math.random() * 80 - 40),
      width: 190,
      height: 60,
      style: {
        shape: 'rounded',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        borderColor: parentColor,
        borderWidth: 2,
        fontSize: 'base',
        fontWeight: 'medium',
        shadow: 'sm',
      },
      createdAt: now,
      updatedAt: now,
    };

    const newEdge: MindEdge = {
      id: 'edge-' + Math.random().toString(36).substr(2, 9),
      mapId: activeMap.id,
      sourceId: parentId,
      targetId: childId,
      style: { color: parentColor, width: 2 },
    };

    const nextNodes = [...nodes, childNode];
    const nextEdges = [...edges, newEdge];

    const arranged = applyLayout(nextNodes, nextEdges, activeLayout, activeMap.rootNodeId);
    setNodes(arranged);
    setEdges(nextEdges);
    setSelectedNodeId(childId);
    setSelectedNodeIds([childId]);
    setEditingNodeId(childId);
    persistCanvasState(arranged, nextEdges);
    pushHistory(arranged, nextEdges);

    return childNode;
  };

  const addNodeSibling = (siblingId: string, title = 'New Idea', type: NodeType = 'idea'): MindNode => {
    const sibling = nodes.find((n) => n.id === siblingId);
    const parentId = sibling?.parentId || activeMap?.rootNodeId || null;

    if (parentId) {
      return addNodeChild(parentId, title, type);
    } else {
      return addNodeChild(siblingId, title, type);
    }
  };

  const updateNode = (nodeId: string, updates: Partial<MindNode>) => {
    const nextNodes = nodes.map((n) => (n.id === nodeId ? { ...n, ...updates, updatedAt: Date.now() } : n));
    setNodes(nextNodes);
    persistCanvasState(nextNodes, edges);
  };

  // Debounced node position updating to prevent write thrashing during mouse drag
  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes((prev) => {
      const next = prev.map((n) => (n.id === nodeId ? { ...n, x, y, updatedAt: Date.now() } : n));
      if (nodePositionDebounceTimer.current) {
        clearTimeout(nodePositionDebounceTimer.current);
      }
      nodePositionDebounceTimer.current = setTimeout(() => {
        persistCanvasState(next, edges);
      }, 500);
      return next;
    });
  };

  const updateNodeStyle = (nodeId: string, styleUpdates: Partial<NodeStyle>) => {
    const nextNodes = nodes.map((n) =>
      n.id === nodeId ? { ...n, style: { ...n.style, ...styleUpdates }, updatedAt: Date.now() } : n
    );
    setNodes(nextNodes);
    persistCanvasState(nextNodes, edges);
    pushHistory(nextNodes, edges);
  };

  const deleteNode = (nodeId: string) => {
    if (!activeMap || activeMap.rootNodeId === nodeId) return;

    const toDelete = new Set<string>([nodeId]);
    function collectDescendants(id: string) {
      nodes.forEach((n) => {
        if (n.parentId === id) {
          toDelete.add(n.id);
          collectDescendants(n.id);
        }
      });
    }
    collectDescendants(nodeId);

    const nextNodes = nodes.filter((n) => !toDelete.has(n.id));
    const nextEdges = edges.filter((e) => !toDelete.has(e.sourceId) && !toDelete.has(e.targetId));

    const arranged = applyLayout(nextNodes, nextEdges, activeLayout, activeMap.rootNodeId);
    setNodes(arranged);
    setEdges(nextEdges);
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    persistCanvasState(arranged, nextEdges);
    pushHistory(arranged, nextEdges);
  };

  const duplicateNode = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target || !activeMap) return;

    const copyId = 'node-' + Math.random().toString(36).substr(2, 9);
    const copyNode: MindNode = {
      ...target,
      id: copyId,
      title: `${target.title} (Copy)`,
      x: target.x + 30,
      y: target.y + 30,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    let nextEdges = [...edges];
    if (target.parentId) {
      nextEdges.push({
        id: 'edge-' + Math.random().toString(36).substr(2, 9),
        mapId: activeMap.id,
        sourceId: target.parentId,
        targetId: copyId,
        style: { color: target.style.borderColor, width: 2 },
      });
    }

    const nextNodes = [...nodes, copyNode];
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(copyId);
    setSelectedNodeIds([copyId]);
    persistCanvasState(nextNodes, nextEdges);
    pushHistory(nextNodes, nextEdges);
  };

  const toggleNodeCollapse = (nodeId: string) => {
    const nextNodes = nodes.map((n) => (n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n));
    if (activeMap) {
      const arranged = applyLayout(nextNodes, edges, activeLayout, activeMap.rootNodeId);
      setNodes(arranged);
      persistCanvasState(arranged, edges);
    }
  };

  // Folder Operations
  const addFolder = (name: string, color = '#4f46e5', icon = 'Folder'): FolderItem => {
    const newFolder: FolderItem = {
      id: 'f-' + Math.random().toString(36).substr(2, 9),
      userId: activeUserId,
      name: name.trim() || 'New Folder',
      color,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [newFolder, ...allFolders];
    setAllFolders(next);
    saveStoredFolders(next, activeUserId);
    performCloudOperation(
      () => saveFolderToCloud(activeUserId, newFolder),
      'Failed to create folder in cloud'
    );
    return newFolder;
  };

  const updateFolder = (folderId: string, updates: Partial<FolderItem>) => {
    const next = allFolders.map((f) => (f.id === folderId ? { ...f, ...updates, updatedAt: Date.now() } : f));
    setAllFolders(next);
    saveStoredFolders(next, activeUserId);
    const updated = next.find((f) => f.id === folderId);
    if (updated) {
      performCloudOperation(
        () => saveFolderToCloud(activeUserId, updated),
        'Failed to update folder in cloud'
      );
    }
  };

  const deleteFolder = (folderId: string) => {
    const next = allFolders.filter((f) => f.id !== folderId);
    setAllFolders(next);
    saveStoredFolders(next, activeUserId);
    performCloudOperation(
      () => deleteFolderFromCloud(activeUserId, folderId),
      'Failed to delete folder from cloud'
    );

    // Unassign maps from this folder
    const nextMaps = allMaps.map((m) => (m.folderId === folderId ? { ...m, folderId: undefined } : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
  };

  // Task Operations
  const convertNodeToTask = (nodeId: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): TaskItem => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !activeMap) throw new Error('Node not found');

    updateNode(nodeId, { type: 'task', priority, status: 'todo' });

    const newTask: TaskItem = {
      id: 'task-' + Math.random().toString(36).substr(2, 9),
      userId: activeUserId,
      title: node.title,
      description: node.description || `Generated from mind map node "${node.title}"`,
      priority,
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      mapId: activeMap.id,
      mapTitle: activeMap.title,
      nodeId: node.id,
      nodeTitle: node.title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextTasks = [newTask, ...allTasks];
    setAllTasks(nextTasks);
    saveStoredTasks(nextTasks, activeUserId);
    performCloudOperation(
      () => saveTaskToCloud(activeUserId, newTask),
      'Failed to sync converted task to cloud'
    );
    return newTask;
  };

  const addTask = (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>): TaskItem => {
    const newTask: TaskItem = {
      ...task,
      id: 'task-' + Math.random().toString(36).substr(2, 9),
      userId: activeUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [newTask, ...allTasks];
    setAllTasks(next);
    saveStoredTasks(next, activeUserId);
    performCloudOperation(
      () => saveTaskToCloud(activeUserId, newTask),
      'Failed to create task in cloud'
    );
    return newTask;
  };

  const addMultipleTasks = (tasks: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>[]): TaskItem[] => {
    const createdTasks: TaskItem[] = tasks.map((t, idx) => ({
      ...t,
      id: 'task-' + Math.random().toString(36).substr(2, 9) + '-' + idx,
      userId: activeUserId,
      createdAt: Date.now() + idx,
      updatedAt: Date.now() + idx,
    }));
    const next = [...createdTasks, ...allTasks];
    setAllTasks(next);
    saveStoredTasks(next, activeUserId);
    // Cloud persist
    createdTasks.forEach((t) => {
      performCloudOperation(
        () => saveTaskToCloud(activeUserId, t),
        'Failed to create task in cloud'
      );
    });
    return createdTasks;
  };

  const updateTask = (taskId: string, updates: Partial<TaskItem>) => {
    const next = allTasks.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t));
    setAllTasks(next);
    saveStoredTasks(next, activeUserId);
    const updated = next.find((t) => t.id === taskId);
    if (updated) {
      performCloudOperation(
        () => saveTaskToCloud(activeUserId, updated),
        'Failed to update task in cloud'
      );
    }
  };

  const deleteTask = (taskId: string) => {
    const next = allTasks.filter((t) => t.id !== taskId);
    setAllTasks(next);
    saveStoredTasks(next, activeUserId);
    performCloudOperation(
      () => deleteTaskFromCloud(activeUserId, taskId),
      'Failed to delete task from cloud'
    );
  };

  // Goal Operations
  const addGoal = (goal: Omit<GoalItem, 'id' | 'createdAt' | 'updatedAt'>): GoalItem => {
    const newGoal: GoalItem = {
      ...goal,
      id: 'goal-' + Math.random().toString(36).substr(2, 9),
      userId: activeUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [newGoal, ...allGoals];
    setAllGoals(next);
    saveStoredGoals(next, activeUserId);
    performCloudOperation(
      () => saveGoalToCloud(activeUserId, newGoal),
      'Failed to create goal in cloud'
    );
    return newGoal;
  };

  const updateGoal = (goalId: string, updates: Partial<GoalItem>) => {
    const next = allGoals.map((g) => (g.id === goalId ? { ...g, ...updates, updatedAt: Date.now() } : g));
    setAllGoals(next);
    saveStoredGoals(next, activeUserId);
    const updated = next.find((g) => g.id === goalId);
    if (updated) {
      performCloudOperation(
        () => saveGoalToCloud(activeUserId, updated),
        'Failed to update goal in cloud'
      );
    }
  };

  const deleteGoal = (goalId: string) => {
    const next = allGoals.filter((g) => g.id !== goalId);
    setAllGoals(next);
    saveStoredGoals(next, activeUserId);
    performCloudOperation(
      () => deleteGoalFromCloud(activeUserId, goalId),
      'Failed to delete goal from cloud'
    );
  };

  // Quick Notes Operations
  const addQuickNote = (
    content: string,
    options?: { title?: string; tags?: string[]; color?: QuickNoteColor }
  ): QuickNote => {
    const created = addStoredQuickNote(content, options?.title, options?.tags, options?.color || 'amber', activeUserId);
    setQuickNotes(getStoredQuickNotes(activeUserId));
    performCloudOperation(
      () => saveQuickNoteToCloud(activeUserId, created),
      'Failed to save quick note in cloud'
    );
    return created;
  };

  const updateQuickNote = (id: string, updates: Partial<QuickNote>) => {
    const updated = updateStoredQuickNote(id, updates, activeUserId);
    setQuickNotes(updated);
    const note = updated.find((n) => n.id === id);
    if (note) {
      performCloudOperation(
        () => saveQuickNoteToCloud(activeUserId, note),
        'Failed to update quick note in cloud'
      );
    }
  };

  const deleteQuickNote = (id: string) => {
    const updated = deleteStoredQuickNote(id, activeUserId);
    setQuickNotes(updated);
    performCloudOperation(
      () => deleteQuickNoteFromCloud(activeUserId, id),
      'Failed to delete quick note from cloud'
    );
  };

  const convertQuickNoteToNode = (
    noteId: string,
    targetMapId?: string,
    targetParentId?: string
  ): MindNode | null => {
    const note = quickNotes.find((n) => n.id === noteId);
    if (!note) return null;

    const mapToUse = (targetMapId ? allMaps.find((m) => m.id === targetMapId) : activeMap) || allMaps[0];
    if (!mapToUse) return null;

    const existingNodes = getStoredNodes(mapToUse.id, activeUserId);
    const existingEdges = getStoredEdges(mapToUse.id, activeUserId);

    const parentId = targetParentId || mapToUse.rootNodeId || existingNodes[0]?.id;
    const parentNode = existingNodes.find((n) => n.id === parentId) || existingNodes[0];

    const newNodeId = 'node-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    const colorMap: Record<string, string> = {
      amber: '#f59e0b',
      indigo: '#6366f1',
      emerald: '#10b981',
      purple: '#a855f7',
      rose: '#f43f5e',
      slate: '#64748b',
    };
    const accentColor = colorMap[note.color] || '#f59e0b';

    const lines = note.content.split('\n').filter((l) => l.trim().length > 0);
    const mainTitle = note.title || lines[0] || 'Captured Idea';
    const mainDescription = lines.length > 1 ? lines.slice(1).join('\n') : undefined;

    const newNode: MindNode = {
      id: newNodeId,
      mapId: mapToUse.id,
      parentId: parentNode?.id || null,
      title: mainTitle,
      description: mainDescription,
      type: 'idea',
      x: (parentNode?.x || 0) + 260,
      y: (parentNode?.y || 0) + (Math.random() * 60 - 30),
      width: 200,
      height: 65,
      tags: note.tags,
      style: {
        shape: 'rounded',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        borderColor: accentColor,
        borderWidth: 2,
        fontSize: 'base',
        fontWeight: 'semibold',
        accentColor,
        shadow: 'sm',
      },
      createdAt: now,
      updatedAt: now,
    };

    const newEdge: MindEdge = {
      id: 'edge-' + Math.random().toString(36).substr(2, 9),
      mapId: mapToUse.id,
      sourceId: parentNode ? parentNode.id : mapToUse.rootNodeId,
      targetId: newNodeId,
      style: { color: accentColor, width: 2 },
    };

    const nextNodes = [...existingNodes, newNode];
    const nextEdges = [...existingEdges, newEdge];

    if (lines.length > 1) {
      lines.slice(1).forEach((line, idx) => {
        const cleanLine = line.replace(/^[#\-*•0-9.]+\s*/, '').trim();
        if (cleanLine.length > 0) {
          const subId = 'node-' + Math.random().toString(36).substr(2, 9);
          const subNode: MindNode = {
            id: subId,
            mapId: mapToUse.id,
            parentId: newNodeId,
            title: cleanLine,
            type: cleanLine.toLowerCase().startsWith('todo') || cleanLine.toLowerCase().startsWith('check') ? 'task' : 'standard',
            x: newNode.x + 220,
            y: newNode.y + (idx * 50 - 25),
            width: 170,
            height: 50,
            style: {
              shape: 'pill',
              backgroundColor: '#f8fafc',
              textColor: '#334155',
              borderColor: accentColor,
              borderWidth: 1.5,
              fontSize: 'sm',
              fontWeight: 'normal',
            },
            createdAt: now,
            updatedAt: now,
          };
          const subEdge: MindEdge = {
            id: 'edge-' + Math.random().toString(36).substr(2, 9),
            mapId: mapToUse.id,
            sourceId: newNodeId,
            targetId: subId,
            style: { color: accentColor, width: 1.5 },
          };
          nextNodes.push(subNode);
          nextEdges.push(subEdge);
        }
      });
    }

    const arranged = applyLayout(nextNodes, nextEdges, mapToUse.layout || 'left-to-right', mapToUse.rootNodeId);

    saveStoredNodes(arranged, mapToUse.id, activeUserId);
    saveStoredEdges(nextEdges, mapToUse.id, activeUserId);

    const updatedMap = {
      ...mapToUse,
      nodesCount: nextNodes.length,
      updatedAt: Date.now(),
    };
    const nextMaps = allMaps.map((m) => (m.id === mapToUse.id ? updatedMap : m));
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);

    performCloudOperation(
      () => saveMapToCloud(activeUserId, updatedMap, arranged, nextEdges),
      'Failed to sync converted note map in cloud'
    );

    updateStoredQuickNote(noteId, { convertedToNode: true, convertedMapId: mapToUse.id }, activeUserId);
    setQuickNotes(getStoredQuickNotes(activeUserId));

    setActiveMap(updatedMap);
    setActiveLayout(mapToUse.layout || 'left-to-right');
    setNodes(arranged);
    setEdges(nextEdges);
    setSelectedNodeId(newNodeId);
    setSelectedNodeIds([newNodeId]);
    setHistory([{ nodes: arranged, edges: nextEdges }]);
    setHistoryIndex(0);
    setCurrentView('editor');
    triggerCelebration();

    return newNode;
  };

  const convertQuickNoteToMap = (
    noteId: string,
    options?: { layout?: MapLayout }
  ): MindMap | null => {
    const note = quickNotes.find((n) => n.id === noteId);
    if (!note) return null;

    const newMapId = 'map-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();
    const rootId = 'root-' + Math.random().toString(36).substr(2, 9);
    const layout = options?.layout || 'left-to-right';

    const lines = note.content.split('\n').filter((l) => l.trim().length > 0);
    const title = note.title || lines[0] || 'Captured Fleeting Idea';

    const colorMap: Record<string, string> = {
      amber: '#f59e0b',
      indigo: '#4f46e5',
      emerald: '#059669',
      purple: '#7c3aed',
      rose: '#e11d48',
      slate: '#475569',
    };
    const primaryColor = colorMap[note.color] || '#4f46e5';

    const rootNode: MindNode = {
      id: rootId,
      mapId: newMapId,
      parentId: null,
      title,
      description: lines.length > 1 ? lines[0] : 'Mind map created from Quick Note idea',
      type: 'standard',
      x: 0,
      y: 0,
      width: 230,
      height: 70,
      tags: note.tags,
      style: {
        shape: 'rounded',
        backgroundColor: primaryColor,
        textColor: '#ffffff',
        borderColor: primaryColor,
        borderWidth: 2,
        fontSize: 'lg',
        fontWeight: 'bold',
        shadow: 'lg',
      },
      createdAt: now,
      updatedAt: now,
    };

    const initialNodes: MindNode[] = [rootNode];
    const initialEdges: MindEdge[] = [];

    if (lines.length > 1) {
      lines.slice(1).forEach((line, index) => {
        const cleanLine = line.replace(/^[#\-*•0-9.]+\s*/, '').trim();
        if (cleanLine.length > 0) {
          const childId = 'node-' + Math.random().toString(36).substr(2, 9);
          const childNode: MindNode = {
            id: childId,
            mapId: newMapId,
            parentId: rootId,
            title: cleanLine,
            type: cleanLine.toLowerCase().startsWith('todo') || cleanLine.toLowerCase().startsWith('check') ? 'task' : 'idea',
            x: 260,
            y: index * 70 - 70,
            width: 190,
            height: 55,
            style: {
              shape: 'rounded',
              backgroundColor: '#ffffff',
              textColor: '#0f172a',
              borderColor: primaryColor,
              borderWidth: 2,
              fontSize: 'base',
              fontWeight: 'medium',
              shadow: 'sm',
            },
            createdAt: now,
            updatedAt: now,
          };

          const childEdge: MindEdge = {
            id: 'edge-' + Math.random().toString(36).substr(2, 9),
            mapId: newMapId,
            sourceId: rootId,
            targetId: childId,
            style: { color: primaryColor, width: 2 },
          };

          initialNodes.push(childNode);
          initialEdges.push(childEdge);
        }
      });
    }

    const arranged = applyLayout(initialNodes, initialEdges, layout, rootId);

    const newMap: MindMap = {
      id: newMapId,
      ownerId: activeUserId,
      title,
      description: `Converted from Quick Note on ${new Date().toLocaleDateString()}`,
      category: 'Brainstorm',
      visibility: 'private',
      isFavorite: false,
      layout,
      rootNodeId: rootId,
      tags: note.tags,
      nodesCount: initialNodes.length,
      tasksCount: initialNodes.filter((n) => n.type === 'task').length,
      createdAt: now,
      updatedAt: now,
    };

    const nextMaps = [newMap, ...allMaps];
    setAllMaps(nextMaps);
    saveStoredMaps(nextMaps, activeUserId);
    saveStoredNodes(arranged, newMapId, activeUserId);
    saveStoredEdges(initialEdges, newMapId, activeUserId);

    performCloudOperation(
      () => saveMapToCloud(activeUserId, newMap, arranged, initialEdges),
      'Failed to sync converted note map in cloud'
    );

    updateStoredQuickNote(noteId, { convertedToNode: true, convertedMapId: newMapId }, activeUserId);
    setQuickNotes(getStoredQuickNotes(activeUserId));

    recordUsage('map');

    setActiveMap(newMap);
    setActiveLayout(layout);
    setNodes(arranged);
    setEdges(initialEdges);
    setSelectedNodeId(rootId);
    setSelectedNodeIds([rootId]);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHistory([{ nodes: arranged, edges: initialEdges }]);
    setHistoryIndex(0);
    setCurrentView('editor');
    triggerCelebration();

    return newMap;
  };

  const fitToScreen = () => {
    if (nodes.length === 0) return;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y < minY) minY = n.y;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setPan({ x: -centerX, y: -centerY });
    setZoom(0.85);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentView,
        setCurrentView,
        legalDocId,
        setLegalDocId,
        openLegal,
        userManualCategory,
        setUserManualCategory,
        openUserManual,
        activeMap,
        nodes,
        edges,
        selectedNodeId,
        selectedNodeIds,
        zoom,
        pan,
        activeLayout,
        isSaving,
        isSyncing,
        lastSyncedAt,
        syncError,
        syncStatus,
        syncNow,
        clearSyncError,
        searchQuery,
        searchResults,
        allMaps,
        allTasks,
        allGoals,
        allFolders,
        quickNotes,
        usage,
        setZoom,
        setPan,
        setSelectedNodeId,
        editingNodeId,
        setEditingNodeId,
        toggleNodeSelection,
        setSearchQuery,
        openMap,
        createNewMap,
        createMapFromHierarchy,
        createMapFromTemplate,
        updateMapMetadata,
        deleteMap,
        trashMap,
        restoreMap,
        permanentDeleteMap,
        toggleFavoriteMap,
        assignMapToFolder,
        changeMapLayout,
        addNodeChild,
        addNodeSibling,
        updateNode,
        updateNodePosition,
        updateNodeStyle,
        deleteNode,
        duplicateNode,
        toggleNodeCollapse,
        convertNodeToTask,
        addTask,
        addMultipleTasks,
        updateTask,
        deleteTask,
        addGoal,
        updateGoal,
        deleteGoal,
        addFolder,
        updateFolder,
        deleteFolder,
        addQuickNote,
        updateQuickNote,
        deleteQuickNote,
        convertQuickNoteToNode,
        convertQuickNoteToMap,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        isAIGeneratorOpen,
        setIsAIGeneratorOpen,
        isMultimodalOpen,
        setIsMultimodalOpen,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        isExportShareOpen,
        setIsExportShareOpen,
        isPricingOpen,
        setIsPricingOpen,
        isVersionHistoryOpen,
        setIsVersionHistoryOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isQuickNotesOpen,
        setIsQuickNotesOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        recordUsage,
        fitToScreen,
        autoArrangeMap,
        triggerCelebration,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
