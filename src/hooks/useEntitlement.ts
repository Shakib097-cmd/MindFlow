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
  const currentPlan: PlanType = profile?.plan || 'pro';
  const subscriptionStatus: string = (usage as any)?.subscriptionStatus || (profile as any)?.subscriptionStatus || 'active';

  // Authoritative credit stats
  const monthlyCredits: number = usage?.monthlyCredits ?? (currentPlan === 'business' ? 500 : currentPlan === 'pro' ? 100 : 25);
  const creditsUsed: number = usage?.creditsUsed ?? 0;
  const topupCredits: number = usage?.topupCredits ?? 0;

  // Calculate authoritative credit balance
  const creditsBalance: number = useMemo(() => {
    if (typeof usage?.creditsBalance === 'number') {
      return usage.creditsBalance;
    }
    return Math.max(0, monthlyCredits + topupCredits - creditsUsed);
  }, [usage, monthlyCredits, topupCredits, creditsUsed]);

  const isZeroCredits = creditsBalance <= 0;

  /**
   * Check if a feature is included in the user's plan and active subscription.
   */
  const checkFeature = useCallback(
    (featureKey: FeatureKey | string): boolean => {
      return hasFeature(featureKey as FeatureKey, currentPlan, subscriptionStatus);
    },
    [currentPlan, subscriptionStatus]
  );

  /**
   * Check if the user has enough credits to execute an AI feature.
   */
  const checkCredits = useCallback(
    (featureKey: FeatureKey | string) => {
      return canAffordFeature(creditsBalance, featureKey as FeatureKey);
    },
    [creditsBalance]
  );

  /**
   * Combined check verifying both plan entitlement and credit sufficiency.
   */
  const canUse = useCallback(
    (featureKey: FeatureKey | string): EntitlementCheckResult => {
      const isEntitled = checkFeature(featureKey);
      const meta: FeatureMeta | undefined = FEATURE_REGISTRY[featureKey as FeatureKey];
      const minPlan = meta?.minPlan || 'free';
      const cost = meta?.creditCost || 0;

      if (!isEntitled) {
        return {
          allowed: false,
          reason: 'plan_restricted',
          message: `The "${meta?.name || featureKey}" feature requires a ${minPlan.toUpperCase()} plan.`,
          minPlan,
          cost,
          balance: creditsBalance,
        };
      }

      if (meta?.requiresCredits) {
        const creditCheck = checkCredits(featureKey);
        if (!creditCheck.allowed) {
          return {
            allowed: false,
            reason: 'insufficient_credits',
            message: creditCheck.reason || `Insufficient AI credits (${creditsBalance} available, ${cost} required).`,
            minPlan,
            cost,
            balance: creditsBalance,
          };
        }
      }

      return {
        allowed: true,
        minPlan,
        cost,
        balance: creditsBalance,
      };
    },
    [checkFeature, checkCredits, creditsBalance]
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
