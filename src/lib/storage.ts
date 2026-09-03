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

const SAMPLE_QUICK_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    title: 'Mobile Widget for Quick Capture',
    content: 'Add an iOS/Android lock screen widget to capture fleeting thoughts on the go and auto-sync with the workspace.\n• Push to mind map inbox\n• Voice dictation shortcut\n• Offline cache',
    tags: ['Idea', 'Mobile'],
    color: 'amber',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'note-2',
    title: 'Student Discount 50% Off',
    content: 'Evaluate offering student discount 50% off Pro plan with .edu email verification.\n• Check Stripe Coupon APIs\n• Build onboarding verification banner\n• Announce on campus community channels',
    tags: ['Growth', 'Pricing'],
    color: 'emerald',
    createdAt: Date.now() - 3600000 * 18,
    updatedAt: Date.now() - 3600000 * 18,
  },
  {
    id: 'note-3',
    title: 'Deep Research Synthesis Model',
    content: 'Integrate multi-source web grounding to extract market data directly into mind map SWOT branches.',
    tags: ['AI', 'Research'],
    color: 'indigo',
    createdAt: Date.now() - 3600000 * 42,
    updatedAt: Date.now() - 3600000 * 42,
  },
];

// Seed demo initial folders
const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'f-business', name: 'Business & Startup', color: '#4f46e5', icon: 'Briefcase', createdAt: Date.now() },
  { id: 'f-study', name: 'Study & Academics', color: '#d97706', icon: 'BookOpen', createdAt: Date.now() },
  { id: 'f-projects', name: 'Product Roadmaps', color: '#059669', icon: 'Compass', createdAt: Date.now() },
  { id: 'f-personal', name: 'Personal & Growth', color: '#db2777', icon: 'Heart', createdAt: Date.now() },
];

// Seed initial demo map
const SAMPLE_MAP_ID = 'map-mindflow-demo';
const SAMPLE_MAP: MindMap = {
  id: SAMPLE_MAP_ID,
  ownerId: 'demo-user',
  folderId: 'f-business',
  title: 'MindFlow AI — Product Strategy & Launch',
  description: 'Master mind map connecting ideation, Gemini AI core, execution tasks, and monetization.',
  category: 'Strategy',
  visibility: 'private',
  isFavorite: true,
  layout: 'left-to-right',
  rootNodeId: 'root-demo',
  tags: ['Strategy', 'AI', 'Launch', 'SaaS'],
  nodesCount: 10,
  tasksCount: 4,
  createdAt: Date.now() - 3600000 * 24,
  updatedAt: Date.now(),
};

const SAMPLE_NODES: MindNode[] = [
  {
    id: 'root-demo',
    mapId: SAMPLE_MAP_ID,
    parentId: null,
    title: 'MindFlow AI Master Workspace',
    description: 'AI Workspace for turning ideas, voice, notes, and documents into action.',
    type: 'standard',
    x: 0,
    y: 0,
    width: 250,
    height: 80,
    style: {
      shape: 'rounded',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      borderColor: '#4338ca',
      borderWidth: 2,
      fontSize: 'xl',
      fontWeight: 'bold',
      textAlign: 'center',
      shadow: 'lg',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-ai',
    mapId: SAMPLE_MAP_ID,
    parentId: 'root-demo',
    title: '1. Multimodal AI Engine',
    description: 'Gemini 3.1 Pro Thinking Mode & Flash integration',
    type: 'idea',
    x: 290,
    y: -140,
    width: 210,
    height: 65,
    style: {
      shape: 'rounded',
      backgroundColor: '#f5f3ff',
      textColor: '#4c1d95',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      fontSize: 'base',
      fontWeight: 'semibold',
      accentColor: '#7c3aed',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-ai-1',
    mapId: SAMPLE_MAP_ID,
    parentId: 'node-ai',
    title: 'Voice & Speech to Map',
    description: 'Speech recognition transcript parsed into nodes',
    type: 'task',
    priority: 'high',
    status: 'in_progress',
    x: 540,
    y: -170,
    width: 190,
    height: 55,
    style: {
      shape: 'pill',
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a',
      borderColor: '#3b82f6',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-ai-2',
    mapId: SAMPLE_MAP_ID,
    parentId: 'node-ai',
    title: 'Document & OCR Parser',
    description: 'Extract PDF/image notes with Gemini Vision',
    type: 'task',
    priority: 'medium',
    status: 'done',
    x: 540,
    y: -110,
    width: 190,
    height: 55,
    style: {
      shape: 'pill',
      backgroundColor: '#ecfdf5',
      textColor: '#064e3b',
      borderColor: '#10b981',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-canvas',
    mapId: SAMPLE_MAP_ID,
    parentId: 'root-demo',
    title: '2. Infinite Dynamic Canvas',
    description: 'Bezier curves, auto-layouts & presentation mode',
    type: 'idea',
    x: 290,
    y: -20,
    width: 210,
    height: 65,
    style: {
      shape: 'rounded',
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a',
      borderColor: '#3b82f6',
      borderWidth: 2,
      fontSize: 'base',
      fontWeight: 'semibold',
      accentColor: '#2563eb',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-canvas-1',
    mapId: SAMPLE_MAP_ID,
    parentId: 'node-canvas',
    title: '6 Map Layout Algorithms',
    description: 'Radial, Tree, L-to-R, R-to-L, Top-Down',
    type: 'task',
    priority: 'urgent',
    status: 'done',
    x: 540,
    y: -20,
    width: 190,
    height: 55,
    style: {
      shape: 'pill',
      backgroundColor: '#ecfdf5',
      textColor: '#064e3b',
      borderColor: '#10b981',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-action',
    mapId: SAMPLE_MAP_ID,
    parentId: 'root-demo',
    title: '3. Execution & Action Hub',
    description: 'Turn map branches into Kanban tasks & goals',
    type: 'goal',
    x: 290,
    y: 100,
    width: 210,
    height: 65,
    style: {
      shape: 'rounded',
      backgroundColor: '#ecfdf5',
      textColor: '#064e3b',
      borderColor: '#10b981',
      borderWidth: 2,
      fontSize: 'base',
      fontWeight: 'semibold',
      accentColor: '#059669',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-action-1',
    mapId: SAMPLE_MAP_ID,
    parentId: 'node-action',
    title: '7/14/30 Day Action Plans',
    description: 'AI-generated tactical milestones',
    type: 'task',
    priority: 'high',
    status: 'in_progress',
    x: 540,
    y: 100,
    width: 190,
    height: 55,
    style: {
      shape: 'pill',
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a',
      borderColor: '#3b82f6',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'node-monetization',
    mapId: SAMPLE_MAP_ID,
    parentId: 'root-demo',
    title: '4. SaaS Growth & Plans',
    description: 'Free, Pro ($19/mo) and Business ($49/mo)',
    type: 'goal',
    x: 290,
    y: 220,
    width: 210,
    height: 65,
    style: {
      shape: 'rounded',
      backgroundColor: '#fff7ed',
      textColor: '#7c2d12',
      borderColor: '#f97316',
      borderWidth: 2,
      fontSize: 'base',
      fontWeight: 'semibold',
      accentColor: '#ea580c',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const SAMPLE_EDGES: MindEdge[] = [
  { id: 'e-1', mapId: SAMPLE_MAP_ID, sourceId: 'root-demo', targetId: 'node-ai', style: { color: '#8b5cf6', width: 2.5 } },
  { id: 'e-1-1', mapId: SAMPLE_MAP_ID, sourceId: 'node-ai', targetId: 'node-ai-1', style: { color: '#3b82f6', width: 1.8 } },
  { id: 'e-1-2', mapId: SAMPLE_MAP_ID, sourceId: 'node-ai', targetId: 'node-ai-2', style: { color: '#10b981', width: 1.8 } },
  { id: 'e-2', mapId: SAMPLE_MAP_ID, sourceId: 'root-demo', targetId: 'node-canvas', style: { color: '#3b82f6', width: 2.5 } },
  { id: 'e-2-1', mapId: SAMPLE_MAP_ID, sourceId: 'node-canvas', targetId: 'node-canvas-1', style: { color: '#10b981', width: 1.8 } },
  { id: 'e-3', mapId: SAMPLE_MAP_ID, sourceId: 'root-demo', targetId: 'node-action', style: { color: '#10b981', width: 2.5 } },
  { id: 'e-3-1', mapId: SAMPLE_MAP_ID, sourceId: 'node-action', targetId: 'node-action-1', style: { color: '#3b82f6', width: 1.8 } },
  { id: 'e-4', mapId: SAMPLE_MAP_ID, sourceId: 'root-demo', targetId: 'node-monetization', style: { color: '#f97316', width: 2.5 } },
];

const SAMPLE_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Test Multimodal Voice to Mind Map flow',
    description: 'Ensure speech recognition and Gemini audio transcript prompt output valid nodes',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'high',
    status: 'in_progress',
    mapId: SAMPLE_MAP_ID,
    mapTitle: SAMPLE_MAP.title,
    nodeId: 'node-ai-1',
    nodeTitle: 'Voice & Speech to Map',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'task-2',
    title: 'Generate SWOT template and AI Quiz Pack',
    description: 'Ensure interactive flashcards flip cleanly and calculate test score',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    priority: 'medium',
    status: 'done',
    completedAt: Date.now() - 3600000 * 5,
    mapId: SAMPLE_MAP_ID,
    mapTitle: SAMPLE_MAP.title,
    nodeId: 'node-canvas-1',
    nodeTitle: '6 Map Layout Algorithms',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'task-3',
    title: 'Create 30-day product launch action plan',
    description: 'Auto-convert strategic nodes into prioritized sprint milestones',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    priority: 'urgent',
    status: 'todo',
    mapId: SAMPLE_MAP_ID,
    mapTitle: SAMPLE_MAP.title,
    nodeId: 'node-action-1',
    nodeTitle: '7/14/30 Day Action Plans',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const SAMPLE_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Launch MindFlow AI Public Beta to 10,000 Users',
    description: 'Achieve smooth onboarding, high engagement on AI mind mapping, and 15% conversion to Pro plan.',
    deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    progress: 65,
    category: 'Product & Growth',
    mapId: SAMPLE_MAP_ID,
    mapTitle: SAMPLE_MAP.title,
    milestones: [
      { id: 'm1', text: 'Build AI Mind Map & Multimodal generators', completed: true },
      { id: 'm2', text: 'Implement 6 layout algorithms and infinite canvas', completed: true },
      { id: 'm3', text: 'Action Hub: Tasks & Goals synchronization', completed: true },
      { id: 'm4', text: 'AI Study Assistant & Presentation Deck generator', completed: true },
      { id: 'm5', text: 'First 100 beta test signups & feedback round', completed: false },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const INITIAL_USAGE: UsageData = {
  userId: 'current-user',
  aiGenerationsUsed: 3,
  aiGenerationsLimit: 50,
  mapsCreated: 1,
  mapsLimit: 10,
  storageMbUsed: 2.4,
  storageMbLimit: 50,
  exportsUsed: 2,
  exportsLimit: 25,
  voiceMinutesUsed: 4,
  voiceMinutesLimit: 30,
  periodStart: Date.now() - 86400000 * 10,
  periodEnd: Date.now() + 86400000 * 20,
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
