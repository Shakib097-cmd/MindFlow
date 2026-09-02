import { PlanType, UsageData } from '../types';

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
    aiGenerationsLimit: 20,
    mapsLimit: 3,
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
    aiGenerationsLimit: 300,
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
    aiGenerationsLimit: 1500,
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
  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.aiGenerationsLimit - (usage.aiGenerationsUsed || 0));
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Monthly AI generation quota reached (${limits.aiGenerationsLimit}/${limits.aiGenerationsLimit}). Upgrade your plan to continue.`,
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
      reason: `Maximum maps reached (${currentMapsCount}/${limits.mapsLimit}) on ${plan.toUpperCase()} plan. Upgrade for higher capacity.`,
    };
  }
  return { allowed: true, remaining };
}

export function canExportFormat(format: 'png' | 'svg' | 'pdf' | 'md' | 'json', plan: PlanType = 'free'): boolean {
  if (format === 'svg') {
    return getPlanLimits(plan).canExportSVG;
  }
  return true;
}
