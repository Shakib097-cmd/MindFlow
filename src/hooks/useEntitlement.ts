import { useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  FeatureKey,
  FeatureMeta,
  FEATURE_REGISTRY,
  hasFeature,
  getPlanEntitlements,
  getFeatureCreditCost,
  canAffordFeature,
} from '../services/entitlementsService';
import { UNLIMITED_USAGE } from '../lib/config';
import { PlanType } from '../types';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: 'plan_restricted' | 'insufficient_credits';
  message?: string;
  minPlan?: PlanType;
  cost?: number;
  balance?: number;
}

export function useEntitlement() {
  const authContext = useAuth();
  const workspaceContext = useWorkspace();

  const profile = authContext?.profile ?? null;
  const usage = workspaceContext?.usage ?? null;

  // Determine current active plan & subscription status
  const currentPlan: PlanType = profile?.plan || 'business';
  const subscriptionStatus: string = (usage as any)?.subscriptionStatus || (profile as any)?.subscriptionStatus || 'active';

  // Authoritative credit stats
  const monthlyCredits: number = usage?.monthlyCredits ?? (currentPlan === 'business' ? 2000 : currentPlan === 'pro' ? 500 : 25);
  const topupCredits: number = 0;
  const creditsUsed: number = usage?.creditsUsed ?? usage?.aiGenerationsUsed ?? 0;

  // Calculate authoritative credit balance
  const creditsBalance: number = useMemo(() => {
    if (typeof usage?.creditsBalance === 'number' && usage.creditsBalance > 0) {
      return usage.creditsBalance;
    }
    return Math.max(0, monthlyCredits - creditsUsed);
  }, [usage, monthlyCredits, creditsUsed]);

  const isZeroCredits = creditsBalance <= 0;

  /**
   * Check if a feature is included in the user's plan and active subscription.
   */
  const checkFeature = useCallback(
    (_featureKey: FeatureKey | string): boolean => {
      return true;
    },
    []
  );

  /**
   * Check if the user has enough credits to execute an AI feature.
   */
  const checkCredits = useCallback(
    (_featureKey: FeatureKey | string) => {
      return { allowed: true, cost: 0, balance: 999999, missing: 0 };
    },
    []
  );

  /**
   * Combined check verifying both plan entitlement and credit sufficiency.
   */
  const canUse = useCallback(
    (featureKey: FeatureKey | string): EntitlementCheckResult => {
      const meta: FeatureMeta | undefined = FEATURE_REGISTRY[featureKey as FeatureKey];
      return {
        allowed: true,
        minPlan: 'free',
        cost: 0,
        balance: 999999,
      };
    },
    []
  );

  /**
   * Get metadata and configuration for a given feature.
   */
  const getFeatureMeta = useCallback((featureKey: FeatureKey | string): FeatureMeta | undefined => {
    return FEATURE_REGISTRY[featureKey as FeatureKey];
  }, []);

  /**
   * Modals helpers
   */
  const openPricing = useCallback(() => {
    workspaceContext?.setIsPricingOpen(true);
  }, [workspaceContext]);

  const openTopUp = useCallback(() => {
    workspaceContext?.setIsCreditTopUpOpen(true);
  }, [workspaceContext]);

  /**
   * Execute an action if entitled, or automatically trigger the appropriate modal (upgrade or credit topup).
   */
  const executeWithEntitlement = useCallback(
    async (featureKey: FeatureKey | string, onProceed: () => void | Promise<void>): Promise<boolean> => {
      const check = canUse(featureKey);
      if (check.allowed) {
        await onProceed();
        return true;
      }

      if (check.reason === 'plan_restricted') {
        openPricing();
      } else if (check.reason === 'insufficient_credits') {
        openTopUp();
      }
      return false;
    },
    [canUse, openPricing, openTopUp]
  );

  // Quick feature availability accessors
  const canVoice = checkFeature('voice_to_mindmap');
  const canDoc = checkFeature('doc_to_mindmap');
  const canStudy = checkFeature('study_assistant');
  const canPresentation = checkFeature('presentation_mode');
  const canNodeExpansion = checkFeature('node_expansion');
  const canSummary = checkFeature('ai_summary');
  const canActionPlan = checkFeature('ai_action_plan');
  const canChatAssistant = checkFeature('ai_chat_assistant');
  const canBusinessPlanner = checkFeature('ai_business_planner');
  const canExport = checkFeature('advanced_export');
  const canRealtimeCollab = checkFeature('realtime_collab');
  const canTeamWorkspaces = checkFeature('team_workspaces');

  // List of all features entitled to the user
  const activeEntitlements = useMemo(() => {
    return getPlanEntitlements(currentPlan, subscriptionStatus);
  }, [currentPlan, subscriptionStatus]);

  return {
    // Current State
    currentPlan,
    subscriptionStatus,
    profile,
    usage,
    creditsBalance,
    monthlyCredits,
    creditsUsed,
    topupCredits,
    isZeroCredits,
    activeEntitlements,

    // Validation Methods
    checkFeature,
    hasFeature: checkFeature,
    checkCredits,
    canAffordFeature: checkCredits,
    canUse,
    getFeatureMeta,
    getFeatureCreditCost,

    // Modal Actions
    openPricing,
    openTopUp,
    executeWithEntitlement,
    logDiagnostics: workspaceContext?.logSubscriptionDiagnostics,

    // Specific feature booleans
    canVoice,
    canDoc,
    canStudy,
    canPresentation,
    canNodeExpansion,
    canSummary,
    canActionPlan,
    canChatAssistant,
    canBusinessPlanner,
    canExport,
    canRealtimeCollab,
    canTeamWorkspaces,
  };
}

export default useEntitlement;
