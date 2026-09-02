export type PlanType = 'free' | 'pro' | 'business';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  plan: PlanType;
  onboardingCompleted: boolean;
  role?: string;
  company?: string;
  createdAt: number;
  updatedAt: number;
}

export type NodeType =
  | 'standard'
  | 'idea'
  | 'task'
  | 'goal'
  | 'note'
  | 'question'
  | 'checklist'
  | 'link'
  | 'file'
  | 'image';

export type NodeShape = 'rounded' | 'rectangle' | 'pill' | 'circle' | 'cloud';

export interface NodeStyle {
  shape: NodeShape;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  icon?: string;
  accentColor?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MindNode {
  id: string;
  mapId: string;
  parentId: string | null;
  title: string;
  description?: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  style: NodeStyle;
  icon?: string;
  collapsed?: boolean;
  checklist?: ChecklistItem[];
  tags?: string[];
  linkUrl?: string;
  imageUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  estimatedHours?: number;
  assignedTo?: string;
  order?: number;
  createdAt: number;
  updatedAt: number;
}

export interface MindEdge {
  id: string;
  mapId: string;
  sourceId: string;
  targetId: string;
  relationship?: string;
  style?: {
    color?: string;
    width?: number;
    dashed?: boolean;
    animated?: boolean;
    arrow?: boolean;
  };
}

export type MapLayout =
  | 'radial'
  | 'tree'
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top';

export interface MindMap {
  id: string;
  ownerId: string;
  workspaceId?: string;
  folderId?: string;
  title: string;
  description?: string;
  category: string;
  thumbnail?: string;
  visibility: 'private' | 'link' | 'workspace' | 'public';
  isFavorite: boolean;
  isTrash?: boolean;
  layout: MapLayout;
  rootNodeId: string;
  tags?: string[];
  nodesCount: number;
  tasksCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface FolderItem {
  id: string;
  userId?: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt?: number;
}

export type SyncStatus = 'synced' | 'saving' | 'syncing' | 'offline' | 'error' | 'saved';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: PriorityLevel;
  status: TaskStatus;
  assignee?: string;
  mapId: string;
  mapTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  subtasks?: SubtaskItem[];
  estimatedHours?: number;
  tags?: string[];
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}


export interface MilestoneItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface GoalItem {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  deadline?: string;
  progress: number;
  category?: string;
  milestones: MilestoneItem[];
  mapId?: string;
  mapTitle?: string;
  relatedTaskIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CommentItem {
  id: string;
  mapId: string;
  nodeId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  resolved: boolean;
  createdAt: number;
}

export interface VersionSnapshot {
  id: string;
  mapId: string;
  name: string;
  description?: string;
  nodes: MindNode[];
  edges: MindEdge[];
  timestamp: number;
  authorName: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task_due' | 'mention' | 'ai_ready' | 'export_ready' | 'system' | 'share';
  link?: string;
  read: boolean;
  createdAt: number;
}

export interface UsageData {
  userId: string;
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  mapsCreated: number;
  mapsLimit: number;
  storageMbUsed: number;
  storageMbLimit: number;
  exportsUsed: number;
  exportsLimit: number;
  voiceMinutesUsed: number;
  voiceMinutesLimit: number;
  periodStart: number;
  periodEnd: number;
}

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  category: 'Business' | 'Study' | 'Planning' | 'Strategy' | 'Creative' | 'Engineering';
  icon: string;
  color: string;
  tags: string[];
  featured?: boolean;
  nodes: Omit<MindNode, 'mapId'>[];
  edges: Omit<MindEdge, 'mapId'>[];
}

export interface AIActionPlanTask {
  title: string;
  detail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  category?: string;
}

export interface AIActionPlanMilestone {
  phase: string;
  timeline: string;
  goals: string[];
  tasks: AIActionPlanTask[];
}

export interface AIActionPlan {
  title: string;
  overview: string;
  targetDuration: '7_days' | '14_days' | '30_days' | '90_days' | 'custom';
  milestones: AIActionPlanMilestone[];
  criticalSuccessFactors: string[];
}

export interface AIBusinessPlan {
  title: string;
  executiveSummary: string;
  valueProposition: string;
  targetMarket: {
    demographics: string;
    tamSamSom: string;
    painPoints: string[];
  };
  productStrategy: {
    coreFeatures: string[];
    uniqueDifferentiator: string;
  };
  monetization: {
    pricingModel: string;
    revenueStreams: string[];
  };
  go投ToMarket: string[];
  costStructure: string[];
  risksAndMitigations: Array<{ risk: string; mitigation: string }>;
  keyMetrics: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category: string;
  confidence?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface AIStudyPack {
  topic: string;
  chapterSummary: string;
  keyConcepts: Array<{ term: string; definition: string }>;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  memoryMnemonics: string[];
}

export interface AIMapImprovementSuggestion {
  id: string;
  type: 'missing_topic' | 'duplicate' | 'clarity' | 'actionable' | 'structure';
  title: string;
  description: string;
  targetNodeId?: string;
  recommendedNodesToAdd?: Array<{
    title: string;
    description: string;
    type: NodeType;
    parentTitle?: string;
  }>;
}

export interface AISummaryReport {
  title: string;
  summary: string;
  keyTakeaways: string[];
  topPriorities: string[];
  potentialRisks: string[];
  strategicRecommendations: string[];
}

export type QuickNoteColor = 'amber' | 'indigo' | 'emerald' | 'purple' | 'rose' | 'slate';

export interface QuickNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  tags?: string[];
  color: QuickNoteColor;
  convertedToNode?: boolean;
  convertedMapId?: string;
  createdAt: number;
  updatedAt: number;
}

// =========================================================================
// ADMIN PANEL TYPES & DATA SCHEMAS
// =========================================================================

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'ANALYST';

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  plan: PlanType;
  role: AdminRole | 'USER';
  status: 'active' | 'suspended' | 'pending';
  aiUsage: {
    used: number;
    limit: number;
    periodEnd: number;
  };
  mapsCount: number;
  tasksCount: number;
  goalsCount: number;
  createdAt: number;
  lastActiveAt: number;
  suspensionReason?: string;
  suspendedAt?: number;
  suspendedBy?: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: PlanType;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  provider: 'stripe' | 'manual' | 'none';
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
}

export interface AdminPlanConfig {
  id: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  aiGenerationsLimit: number;
  mapLimit: number;
  storageLimitMb: number;
  voiceLimitMins: number;
  documentLimitMb: number;
  exportFormats: string[];
  maxTeamMembers: number;
  premiumTemplates: boolean;
  customThemes: boolean;
  prioritySupport: boolean;
  updatedAt: number;
  updatedBy: string;
}

export interface AIGenerationLog {
  id: string;
  userId: string;
  userEmail: string;
  feature: string;
  model: string;
  status: 'success' | 'quota_rejected' | 'failed' | 'timeout';
  durationMs: number;
  tokensEstimate: number;
  timestamp: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AdminAIUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  quotaRejected: number;
  tokensUsedEstimate: number;
  byModel: Record<string, number>;
  byFeature: Record<string, number>;
  byPlan: Record<PlanType, number>;
  dailyTrend: Array<{ date: string; requests: number; success: number; failed: number }>;
}

export interface AdminMapSummary {
  id: string;
  title: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  nodeCount: number;
  edgeCount: number;
  visibility: 'private' | 'link' | 'workspace' | 'public' | 'shared';
  category?: string;
  isTrash: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AdminTemplateRecord {
  id: string;
  title: string;
  description: string;
  category: 'Business' | 'Study' | 'Productivity' | 'Creative' | 'Planning';
  nodeCount: number;
  isPremium: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  authorId: string;
  authorName: string;
  usesCount: number;
}

export interface AdminWorkspaceRecord {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  membersCount: number;
  mapsCount: number;
  status: 'active' | 'suspended';
  createdAt: number;
  lastActivityAt: number;
}

export interface AdminNotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'free' | 'pro' | 'business' | 'user';
  targetUserId?: string;
  type: 'system' | 'maintenance' | 'feature' | 'security' | 'billing';
  priority: 'low' | 'normal' | 'urgent';
  actionUrl?: string;
  sentBy: string;
  sentAt: number;
  deliveryCount: number;
  readCount: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action:
    | 'ADMIN_LOGIN'
    | 'USER_SUSPEND'
    | 'USER_UNSUSPEND'
    | 'PLAN_CHANGE'
    | 'USAGE_RESET'
    | 'TEMPLATE_CREATE'
    | 'TEMPLATE_UPDATE'
    | 'TEMPLATE_DELETE'
    | 'WORKSPACE_ACTION'
    | 'NOTIFICATION_BROADCAST'
    | 'SUPPORT_ACCESS'
    | 'ROLE_CHANGE'
    | 'FEATURE_FLAG_UPDATE'
    | 'SETTINGS_UPDATE'
    | 'SECURITY_EVENT';
  targetType: 'user' | 'subscription' | 'plan' | 'template' | 'workspace' | 'system' | 'notification' | 'security';
  targetId: string;
  timestamp: number;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface AdminSecurityEvent {
  id: string;
  type: 'UNAUTHORIZED_ACCESS' | 'QUOTA_ABUSE' | 'SUSPICIOUS_LOGIN' | 'RULE_REJECTION' | 'WEBHOOK_FAILURE';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  details: string;
  timestamp: number;
  resolved: boolean;
}

export interface AdminSecurityDiagnostics {
  authServiceStatus: 'operational' | 'degraded' | 'down';
  firestoreRulesStatus: 'hardened' | 'warning' | 'open';
  adminVerificationStatus: 'verified' | 'unverified';
  geminiKeyIsolation: 'secure' | 'exposed';
  paymentGatewayStatus: 'sandbox_configured' | 'live_connected' | 'not_configured';
  recentEvents: AdminSecurityEvent[];
  activeSuperAdminsCount: number;
  lastRulesCheck: number;
}

export interface AdminFeatureFlags {
  aiCopilot: boolean;
  voiceBrainstorm: boolean;
  documentAI: boolean;
  realTimeCollaboration: boolean;
  presentationMode: boolean;
  studyFlashcards: boolean;
  maintenanceMode: boolean;
  signupEnabled: boolean;
  updatedAt: number;
  updatedBy: string;
}

export interface AdminSystemSettings {
  maintenanceMode: boolean;
  signupEnabled: boolean;
  aiEnabled: boolean;
  maxUploadSizeMb: number;
  defaultAIModel: string;
  defaultMapDepth: string;
  supportEmail: string;
  notifyOnNewUser: boolean;
  updatedAt: number;
  updatedBy: string;
}

export interface AdminDashboardKPIs {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  freeUsers: number;
  proUsers: number;
  businessUsers: number;
  totalMaps: number;
  aiGenerationsTotal: number;
  aiGenerationsFailed: number;
  activeSubscriptions: number;
  mrr: number;
  arpu: number;
  churnRate: number;
  conversionRate: number;
}

