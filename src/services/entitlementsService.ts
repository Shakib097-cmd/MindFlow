import { PlanType, UsageData, UserProfile, CreditTopUpPackage } from '../types';

// =========================================================================
// 1. SYSTEM FEATURE IDENTIFIERS (Single Source of Truth)
// =========================================================================
export type FeatureKey =
  | 'basic_mindmap'
  | 'templates'
  | 'tasks_kanban'
  | 'goals_okrs'
  | 'quick_notes'
  | 'ai_mindmap'
  | 'node_expansion'
  | 'ai_summary'
  | 'voice_to_mindmap'
  | 'doc_to_mindmap'
  | 'study_assistant'
  | 'presentation_mode'
  | 'advanced_export'
  | 'ai_action_plan'
  | 'ai_business_planner'
  | 'ai_chat_assistant'
  | 'realtime_collab'
  | 'team_workspaces';

export interface FeatureMeta {
  key: FeatureKey;
  name: string;
  category: 'Core' | 'AI Intelligence' | 'Execution' | 'Collaboration' | 'Export';
  description: string;
  minPlan: PlanType;
  requiresCredits: boolean;
  creditCost: number;
}

// =========================================================================
// 2. FEATURE METADATA & CREDIT COSTS
// =========================================================================
export const FEATURE_REGISTRY: Record<FeatureKey, FeatureMeta> = {
  basic_mindmap: {
    key: 'basic_mindmap',
    name: 'Blank Infinite Canvas',
    category: 'Core',
    description: 'Manual node creation, branching, keyboard shortcuts, and visual mind mapping.',
    minPlan: 'free',
    requiresCredits: false,
    creditCost: 0,
  },
  templates: {
    key: 'templates',
    name: 'Strategic Template Gallery',
    category: 'Core',
    description: '16+ curated blueprints: SWOT, Sprint Planning, OKRs, and Brainstorming.',
    minPlan: 'free',
    requiresCredits: false,
    creditCost: 0,
  },
  tasks_kanban: {
    key: 'tasks_kanban',
    name: 'Integrated Tasks Kanban',
    category: 'Execution',
    description: 'Convert mind map branches into actionable kanban task cards.',
    minPlan: 'free',
    requiresCredits: false,
    creditCost: 0,
  },
  goals_okrs: {
    key: 'goals_okrs',
    name: 'Strategic Goals & OKRs',
    category: 'Execution',
    description: 'Track key performance indicators, milestones, and target completion dates.',
    minPlan: 'free',
    requiresCredits: false,
    creditCost: 0,
  },
  quick_notes: {
    key: 'quick_notes',
    name: 'Quick Notes Scratchpad',
    category: 'Core',
    description: 'Unstructured thought capture with one-click conversion to mind map nodes.',
    minPlan: 'free',
    requiresCredits: false,
    creditCost: 0,
  },
  ai_mindmap: {
    key: 'ai_mindmap',
    name: 'AI Mind Map Generator',
    category: 'AI Intelligence',
    description: 'Generate multi-level hierarchical visual mind maps from prompt or topic.',
    minPlan: 'free', // Available with limited monthly credits
    requiresCredits: true,
    creditCost: 5,
  },
  node_expansion: {
    key: 'node_expansion',
    name: 'Smart Node Expansion & Simplify',
    category: 'AI Intelligence',
    description: 'AI-assisted branch sub-ideas, contextual elaboration, and text simplification.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 1,
  },
  ai_summary: {
    key: 'ai_summary',
    name: 'AI Executive Summary & Brief',
    category: 'AI Intelligence',
    description: 'Synthesize comprehensive visual mind maps into structured executive reports.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 3,
  },
  voice_to_mindmap: {
    key: 'voice_to_mindmap',
    name: 'Voice Brainstorming to Mind Map',
    category: 'AI Intelligence',
    description: 'Record spoken streams of consciousness and convert audio into organized maps.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 5,
  },
  doc_to_mindmap: {
    key: 'doc_to_mindmap',
    name: 'Document & PDF Multimodal Analysis',
    category: 'AI Intelligence',
    description: 'Extract complex PDF documents and textbooks into structured mind branches.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 5,
  },
  study_assistant: {
    key: 'study_assistant',
    name: 'Interactive Study Hub & Flashcards',
    category: 'AI Intelligence',
    description: 'Generate active-recall flashcard decks and self-evaluating multiple choice quizzes.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 4,
  },
  presentation_mode: {
    key: 'presentation_mode',
    name: 'Slide Deck Presentation Engine',
    category: 'Execution',
    description: 'Transform tree hierarchies into full-screen interactive slide decks.',
    minPlan: 'pro',
    requiresCredits: false,
    creditCost: 0,
  },
  advanced_export: {
    key: 'advanced_export',
    name: 'Advanced Vector & Document Export',
    category: 'Export',
    description: 'Export infinite canvas to crisp SVG vector, PDF document, and formatted Markdown.',
    minPlan: 'pro',
    requiresCredits: false,
    creditCost: 0,
  },
  ai_action_plan: {
    key: 'ai_action_plan',
    name: 'AI Action & Execution Planner',
    category: 'Execution',
    description: 'Transform branches into phased timeframes, owners, and effort estimates.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 4,
  },
  ai_chat_assistant: {
    key: 'ai_chat_assistant',
    name: 'Contextual AI Copilot Drawer',
    category: 'AI Intelligence',
    description: 'Conversational assistant aware of your canvas nodes, proposing real-time improvements.',
    minPlan: 'pro',
    requiresCredits: true,
    creditCost: 2,
  },
  ai_business_planner: {
    key: 'ai_business_planner',
    name: 'Enterprise Strategic Business Planner',
    category: 'AI Intelligence',
    description: 'Deep business plan modeling, financial projections, and GTM execution mapping.',
    minPlan: 'business',
    requiresCredits: true,
    creditCost: 5,
  },
  realtime_collab: {
    key: 'realtime_collab',
    name: 'Live Real-Time Collaboration',
    category: 'Collaboration',
    description: 'Multi-user concurrent editing, presence indicators, and live cursor tracking.',
    minPlan: 'business',
    requiresCredits: false,
    creditCost: 0,
  },
  team_workspaces: {
    key: 'team_workspaces',
    name: 'Team Workspaces & Shared Folders',
    category: 'Collaboration',
    description: 'Centralized team repository, shared templates, and role-based permissions.',
    minPlan: 'business',
    requiresCredits: false,
    creditCost: 0,
  },
};

// =========================================================================
// 3. PLAN-TO-FEATURE MAPPING (Single Source of Truth)
// =========================================================================
export const PLAN_FEATURES: Record<PlanType, FeatureKey[]> = {
  free: [
    'basic_mindmap',
    'templates',
    'tasks_kanban',
    'goals_okrs',
    'quick_notes',
    'ai_mindmap', // Limited to monthly free credits
  ],
  pro: [
    'basic_mindmap',
    'templates',
    'tasks_kanban',
    'goals_okrs',
    'quick_notes',
    'ai_mindmap',
    'node_expansion',
    'ai_summary',
    'voice_to_mindmap',
    'doc_to_mindmap',
    'study_assistant',
    'presentation_mode',
    'advanced_export',
    'ai_action_plan',
    'ai_chat_assistant',
  ],
  business: [
    'basic_mindmap',
    'templates',
    'tasks_kanban',
    'goals_okrs',
    'quick_notes',
    'ai_mindmap',
    'node_expansion',
    'ai_summary',
    'voice_to_mindmap',
    'doc_to_mindmap',
    'study_assistant',
    'presentation_mode',
    'advanced_export',
    'ai_action_plan',
    'ai_chat_assistant',
    'ai_business_planner',
    'realtime_collab',
    'team_workspaces',
  ],
};

// =========================================================================
// 4. MONTHLY ALLOCATED CREDITS PER PLAN
// =========================================================================
export const PLAN_MONTHLY_CREDITS: Record<PlanType, number> = {
  free: 25,
  pro: 500, // 500 monthly AI credits for Pro plan
  business: 2000,
};

// =========================================================================
// 5. CREDIT TOP-UP PACKAGES
// =========================================================================
export const TOPUP_PACKAGES: CreditTopUpPackage[] = [
  {
    id: 'topup_100',
    name: 'Starter Boost',
    credits: 100,
    priceUsd: 5,
    badge: 'Popular',
    popular: true,
  },
  {
    id: 'topup_500',
    name: 'Creator Pack',
    credits: 500,
    priceUsd: 20,
    badge: 'Best Value',
    bestValue: true,
  },
  {
    id: 'topup_1000',
    name: 'Power Studio',
    credits: 1000,
    priceUsd: 35,
    badge: 'Heavy AI',
  },
];

// =========================================================================
// 6. CENTRALIZED ENTITLEMENT CHECK HOOK / FUNCTION
// =========================================================================
function normalizeFeatureKey(key: string): FeatureKey {
  if (key === 'study_quizzes' || key === 'study_mode') return 'study_assistant';
  if (key === 'slide_presentation' || key === 'presentation') return 'presentation_mode';
  if (key === 'voice_speech_input' || key === 'voice') return 'voice_to_mindmap';
  if (key === 'document_upload_ocr' || key === 'pdf') return 'doc_to_mindmap';
  return key as FeatureKey;
}

/**
 * Centralized feature access checker.
 * Validates plan membership AND subscription status.
 * Supports both:
 *  - hasFeature(userOrProfile, featureKey, subscriptionStatus?)
 *  - hasFeature(featureKey, userOrPlan, subscriptionStatus?)
 * If user has no active subscription or status is past_due/cancelled/expired,
 * falls back to 'free' tier features.
 */
export function hasFeature(
  first: FeatureKey | string | UserProfile | { plan?: PlanType; subscriptionStatus?: string } | null | undefined,
  second?: FeatureKey | string | PlanType | UserProfile | { plan?: PlanType; subscriptionStatus?: string } | null,
  third?: string
): boolean {
  let featureKey: FeatureKey;
  let rawPlan: PlanType = 'free';
  let status: string = 'active';

  if (typeof first === 'string' && (typeof second === 'string' || (second && typeof second === 'object'))) {
    // Called as hasFeature(featureKey, userOrPlan, status?)
    featureKey = normalizeFeatureKey(first);
    if (typeof second === 'string') {
      rawPlan = (second as PlanType) || 'free';
      status = third || 'active';
    } else if (second) {
      rawPlan = (second.plan as PlanType) || 'free';
      status = third || (second as any).subscriptionStatus || 'active';
    }
  } else {
    // Called as hasFeature(userOrProfile, featureKey, status?)
    const userOrProfile = first as UserProfile | { plan?: PlanType; subscriptionStatus?: string } | null | undefined;
    featureKey = normalizeFeatureKey((second as string) || 'basic_mindmap');
    if (!userOrProfile) {
      return featureKey === 'basic_mindmap';
    }
    rawPlan = (userOrProfile.plan as PlanType) || 'free';
    status = third || (userOrProfile as any)?.subscriptionStatus || 'active';
  }

  // If subscription is delinquent, cancelled, or expired, drop back to free tier
  const effectivePlan: PlanType =
    ['past_due', 'cancelled', 'expired'].includes(status) ? 'free' : rawPlan;

  const allowedFeatures = PLAN_FEATURES[effectivePlan] || PLAN_FEATURES.free;
  return allowedFeatures.includes(featureKey);
}

/**
 * Get all features available for a given plan and subscription status
 */
export function getPlanEntitlements(plan: PlanType = 'free', status: string = 'active'): FeatureKey[] {
  const effectivePlan: PlanType = ['past_due', 'cancelled', 'expired'].includes(status) ? 'free' : plan;
  return PLAN_FEATURES[effectivePlan] || PLAN_FEATURES.free;
}

/**
 * Get credit cost for a feature
 */
export function getFeatureCreditCost(featureKey: FeatureKey): number {
  return FEATURE_REGISTRY[featureKey]?.creditCost || 0;
}

/**
 * Check if the user has sufficient credits to execute an AI feature
 */
export function canAffordFeature(
  creditsBalance: number,
  featureKey: FeatureKey
): {
  allowed: boolean;
  cost: number;
  balance: number;
  missing: number;
  reason?: string;
} {
  const meta = FEATURE_REGISTRY[featureKey];
  if (!meta || !meta.requiresCredits) {
    return { allowed: true, cost: 0, balance: creditsBalance, missing: 0 };
  }

  const cost = meta.creditCost;
  const current = typeof creditsBalance === 'number' ? creditsBalance : 0;

  if (current < cost) {
    return {
      allowed: false,
      cost,
      balance: current,
      missing: cost - current,
      reason: `Insufficient AI credits. This operation requires ${cost} credits, but your current balance is ${current}.`,
    };
  }

  return { allowed: true, cost, balance: current, missing: 0 };
}

// =========================================================================
// 7. LEGACY PLAN LIMITS (Maintained for Backward Compatibility)
// =========================================================================
export interface PlanLimits {
  aiGenerationsLimit: number;
  mapsLimit: number;
  storageMbLimit: number;
  voiceMinutesLimit: number;
  exportsLimit: number;
  canExportSVG: boolean;
  canUseThinkingAI: boolean;
  canUseWorkspaces: boolean;
  canUseRealTimeCollab: boolean;
  maxTeamMembers: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    aiGenerationsLimit: 25,
    mapsLimit: 5,
    storageMbLimit: 100,
    voiceMinutesLimit: 5,
    exportsLimit: 10,
    canExportSVG: false,
    canUseThinkingAI: false,
    canUseWorkspaces: false,
    canUseRealTimeCollab: false,
    maxTeamMembers: 1,
  },
  pro: {
    aiGenerationsLimit: 100,
    mapsLimit: 50,
    storageMbLimit: 2000,
    voiceMinutesLimit: 60,
    exportsLimit: 500,
    canExportSVG: true,
    canUseThinkingAI: true,
    canUseWorkspaces: false,
    canUseRealTimeCollab: true,
    maxTeamMembers: 3,
  },
  business: {
    aiGenerationsLimit: 500,
    mapsLimit: 9999,
    storageMbLimit: 25000,
    voiceMinutesLimit: 500,
    exportsLimit: 5000,
    canExportSVG: true,
    canUseThinkingAI: true,
    canUseWorkspaces: true,
    canUseRealTimeCollab: true,
    maxTeamMembers: 25,
  },
};

export function getPlanLimits(plan: PlanType = 'free'): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canPerformAIGeneration(usage: UsageData, plan: PlanType = 'free'): {
  allowed: boolean;
  remaining: number;
  reason?: string;
} {
  // Use credit balance if present, otherwise fallback to generations count
  if (typeof usage.creditsBalance === 'number') {
    if (usage.creditsBalance <= 0) {
      return {
        allowed: false,
        remaining: 0,
        reason: 'Your AI credits are finished. Please top up credits to continue.',
      };
    }
    return { allowed: true, remaining: usage.creditsBalance };
  }

  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.aiGenerationsLimit - (usage.aiGenerationsUsed || 0));
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Monthly AI generation quota reached (${limits.aiGenerationsLimit}/${limits.aiGenerationsLimit}). Upgrade your plan or top up credits to continue.`,
    };
  }
  return { allowed: true, remaining };
}

export function canCreateMap(currentMapsCount: number, plan: PlanType = 'free'): {
  allowed: boolean;
  remaining: number;
  reason?: string;
} {
  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.mapsLimit - currentMapsCount);
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Maximum maps reached (${currentMapsCount}/${limits.mapsLimit}) on ${(plan || 'free').toUpperCase()} plan. Upgrade for higher capacity.`,
    };
  }
  return { allowed: true, remaining };
}

export function canExportFormat(format: 'png' | 'svg' | 'pdf' | 'md' | 'json' | 'html', plan: PlanType = 'free'): boolean {
  if (format === 'svg' || format === 'pdf') {
    return hasFeature({ plan }, 'advanced_export');
  }
  return true;
}

