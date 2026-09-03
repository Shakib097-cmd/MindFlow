import {
  MindMap,
  MindNode,
  MindEdge,
  TaskItem,
  GoalItem,
  FolderItem,
  VersionSnapshot,
  CommentItem,
  NotificationItem,
  UsageData,
  UserProfile,
  QuickNote,
} from '../types';

const MAPS_KEY = 'mindflow_maps_v1';
const NODES_KEY = 'mindflow_nodes_v1';
const EDGES_KEY = 'mindflow_edges_v1';
const TASKS_KEY = 'mindflow_tasks_v1';
const GOALS_KEY = 'mindflow_goals_v1';
const FOLDERS_KEY = 'mindflow_folders_v1';
const VERSIONS_KEY = 'mindflow_versions_v1';
const COMMENTS_KEY = 'mindflow_comments_v1';
const NOTIFICATIONS_KEY = 'mindflow_notifications_v1';
const USAGE_KEY = 'mindflow_usage_v1';
const QUICK_NOTES_KEY = 'mindflow_quick_notes_v1';

const SAMPLE_QUICK_NOTES: QuickNote[] = [];

// Initial workspace folders
const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'f-business', name: 'Business & Startup', color: '#4f46e5', icon: 'Briefcase', createdAt: Date.now() },
  { id: 'f-study', name: 'Study & Academics', color: '#d97706', icon: 'BookOpen', createdAt: Date.now() },
  { id: 'f-projects', name: 'Product Roadmaps', color: '#059669', icon: 'Compass', createdAt: Date.now() },
  { id: 'f-personal', name: 'Personal & Growth', color: '#db2777', icon: 'Heart', createdAt: Date.now() },
];

// Reserved demo ID for isolation
const SAMPLE_MAP_ID = 'map-mindflow-demo';

// Purge legacy demo keys and clean storage helper
export function purgeLegacyDemoData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.includes('map-mindflow-demo')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Notice while purging demo cache:', e);
  }
}

if (typeof window !== 'undefined') {
  purgeLegacyDemoData();
}

const INITIAL_USAGE: UsageData = {
  userId: 'current-user',
  aiGenerationsUsed: 0,
  aiGenerationsLimit: 50,
  mapsCreated: 0,
  mapsLimit: 10,
  storageMbUsed: 0,
  storageMbLimit: 50,
  exportsUsed: 0,
  exportsLimit: 25,
  voiceMinutesUsed: 0,
  voiceMinutesLimit: 30,
  periodStart: Date.now(),
  periodEnd: Date.now() + 86400000 * 30,
};

// Storage Helpers
function getPrefixKey(baseKey: string, userId?: string): string {
  if (userId && userId !== 'demo-user' && userId !== 'current-user') {
    return `${baseKey}_${userId}`;
  }
  return baseKey;
}

export function getStoredMaps(userId?: string): MindMap[] {
  try {
    const key = getPrefixKey(MAPS_KEY, userId);
    const raw = localStorage.getItem(key);
    const isPersonalUser = Boolean(userId && userId !== 'demo-user' && userId !== 'current-user');

    if (!raw) {
      if (isPersonalUser) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out demo map to ensure the user only sees their personal content
    const filtered = parsed.filter(
      (m: MindMap) => m && m.id !== SAMPLE_MAP_ID && m.ownerId !== 'demo-user'
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveStoredMaps(maps: MindMap[], userId?: string) {
  const key = getPrefixKey(MAPS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(maps));
}

export function getStoredNodes(mapId?: string, userId?: string): MindNode[] {
  try {
    const key = getPrefixKey(NODES_KEY, userId);
    const raw = localStorage.getItem(key);
    const all: MindNode[] = raw ? JSON.parse(raw) : [];
    if (!raw) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    return mapId ? all.filter((n) => n.mapId === mapId) : all;
  } catch {
    return [];
  }
}

export function saveStoredNodes(nodes: MindNode[], mapId?: string, userId?: string) {
  try {
    const key = getPrefixKey(NODES_KEY, userId);
    const all = getStoredNodes(undefined, userId);
    let updated: MindNode[];
    if (mapId) {
      updated = all.filter((n) => n.mapId !== mapId).concat(nodes);
    } else {
      updated = nodes;
    }
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save nodes:', err);
  }
}

export function getStoredEdges(mapId?: string, userId?: string): MindEdge[] {
  try {
    const key = getPrefixKey(EDGES_KEY, userId);
    const raw = localStorage.getItem(key);
    const all: MindEdge[] = raw ? JSON.parse(raw) : [];
    if (!raw) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    return mapId ? all.filter((e) => e.mapId === mapId) : all;
  } catch {
    return [];
  }
}

export function saveStoredEdges(edges: MindEdge[], mapId?: string, userId?: string) {
  try {
    const key = getPrefixKey(EDGES_KEY, userId);
    const all = getStoredEdges(undefined, userId);
    let updated: MindEdge[];
    if (mapId) {
      updated = all.filter((e) => e.mapId !== mapId).concat(edges);
    } else {
      updated = edges;
    }
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save edges:', err);
  }
}

export function getStoredTasks(userId?: string): TaskItem[] {
  try {
    const key = getPrefixKey(TASKS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out sample demo tasks to ensure the user only sees personal tasks
    const filtered = parsed.filter(
      (t: TaskItem) =>
        t &&
        t.mapId !== SAMPLE_MAP_ID &&
        t.id !== 'task-1' &&
        t.id !== 'task-2' &&
        t.id !== 'task-3'
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveStoredTasks(tasks: TaskItem[], userId?: string) {
  const key = getPrefixKey(TASKS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(tasks));
}

export function getStoredGoals(userId?: string): GoalItem[] {
  try {
    const key = getPrefixKey(GOALS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out sample demo goals to ensure the user only sees personal goals
    const filtered = parsed.filter(
      (g: GoalItem) => g && g.mapId !== SAMPLE_MAP_ID && g.id !== 'goal-1'
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveStoredGoals(goals: GoalItem[], userId?: string) {
  const key = getPrefixKey(GOALS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(goals));
}

export function getStoredFolders(userId?: string): FolderItem[] {
  try {
    const key = getPrefixKey(FOLDERS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_FOLDERS));
      return INITIAL_FOLDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FOLDERS;
  }
}

export function saveStoredFolders(folders: FolderItem[], userId?: string) {
  const key = getPrefixKey(FOLDERS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(folders));
}

export function getStoredUsage(): UsageData {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) {
      localStorage.setItem(USAGE_KEY, JSON.stringify(INITIAL_USAGE));
      return INITIAL_USAGE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USAGE;
  }
}

export function incrementUsage(type: 'ai' | 'map' | 'export' | 'voice') {
  const usage = getStoredUsage();
  if (type === 'ai') usage.aiGenerationsUsed += 1;
  if (type === 'map') usage.mapsCreated += 1;
  if (type === 'export') usage.exportsUsed += 1;
  if (type === 'voice') usage.voiceMinutesUsed += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function getStoredVersions(mapId: string): VersionSnapshot[] {
  try {
    const raw = localStorage.getItem(`${VERSIONS_KEY}_${mapId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStoredSnapshots(mapId: string) {
  const versions = getStoredVersions(mapId);
  return versions.map((v) => ({
    id: v.id,
    label: v.name || `Snapshot ${new Date(v.timestamp).toLocaleTimeString()}`,
    createdAt: v.timestamp,
    nodes: v.nodes || [],
    edges: v.edges || [],
  }));
}


export function saveVersionSnapshot(mapId: string, name: string, nodes: MindNode[], edges: MindEdge[]) {
  const list = getStoredVersions(mapId);
  const snap: VersionSnapshot = {
    id: 'ver-' + Date.now(),
    mapId,
    name,
    timestamp: Date.now(),
    nodes,
    edges,
    authorName: 'Current User',
  };
  list.unshift(snap);
  localStorage.setItem(`${VERSIONS_KEY}_${mapId}`, JSON.stringify(list.slice(0, 20)));
  return snap;
}

export function getStoredQuickNotes(userId?: string): QuickNote[] {
  try {
    const key = getPrefixKey(QUICK_NOTES_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(SAMPLE_QUICK_NOTES));
      return SAMPLE_QUICK_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(key, JSON.stringify(SAMPLE_QUICK_NOTES));
      return SAMPLE_QUICK_NOTES;
    }
    return parsed;
  } catch {
    return SAMPLE_QUICK_NOTES;
  }
}

export function saveStoredQuickNotes(notes: QuickNote[], userId?: string) {
  const key = getPrefixKey(QUICK_NOTES_KEY, userId);
  localStorage.setItem(key, JSON.stringify(notes));
}

export function addStoredQuickNote(
  content: string,
  title?: string,
  tags?: string[],
  color: QuickNote['color'] = 'amber',
  userId?: string
): QuickNote {
  const notes = getStoredQuickNotes(userId);
  const now = Date.now();
  const trimmed = content.trim();
  const inferredTitle =
    title?.trim() ||
    trimmed.split('\n')[0].replace(/^[#\-*•0-9.]+\s*/, '').slice(0, 48) ||
    'Fleeting Idea';

  const newNote: QuickNote = {
    id: 'qnote-' + Math.random().toString(36).substr(2, 9),
    userId: userId && userId !== 'demo-user' ? userId : undefined,
    title: inferredTitle,
    content: trimmed,
    tags: tags && tags.length > 0 ? tags : ['Idea'],
    color: color || 'amber',
    convertedToNode: false,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newNote, ...notes];
  saveStoredQuickNotes(updated, userId);
  return newNote;
}

export function updateStoredQuickNote(id: string, updates: Partial<QuickNote>, userId?: string): QuickNote[] {
  const notes = getStoredQuickNotes(userId);
  const updated = notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  saveStoredQuickNotes(updated, userId);
  return updated;
}

export function deleteStoredQuickNote(id: string, userId?: string): QuickNote[] {
  const notes = getStoredQuickNotes(userId);
  const updated = notes.filter((n) => n.id !== id);
  saveStoredQuickNotes(updated, userId);
  return updated;
}
