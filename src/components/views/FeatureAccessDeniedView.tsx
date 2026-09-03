import React from 'react';
import { Lock, ArrowRight, Home, Sparkles, CheckCircle2 } from 'lucide-react';
import { FeatureKey, FEATURE_REGISTRY } from '../../services/entitlementsService';
import { PlanType } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FeatureAccessDeniedViewProps {
  featureKey: FeatureKey | string;
  currentPlan?: PlanType;
  onUpgradeClick?: () => void;
  onReturnDashboard?: () => void;
  onBack?: () => void;
}

export const FeatureAccessDeniedView: React.FC<FeatureAccessDeniedViewProps> = ({
  featureKey,
  currentPlan = 'free',
  onUpgradeClick,
  onReturnDashboard,
  onBack,
}) => {
  const { setIsPricingOpen, setCurrentView } = useWorkspace();

  const handleUpgrade = onUpgradeClick || (() => setIsPricingOpen(true));
  const handleHome = onReturnDashboard || onBack || (() => setCurrentView('dashboard'));

  const canonicalKey = (
    featureKey === 'study_quizzes' ? 'study_assistant' :
    featureKey === 'slide_presentation' ? 'presentation_mode' :
    featureKey === 'voice_speech_input' ? 'voice_to_mindmap' :
    featureKey
  ) as FeatureKey;

  const meta = FEATURE_REGISTRY[canonicalKey];
  const featureName = meta?.name || 'Premium Feature';
  const minPlan = meta?.minPlan || 'pro';
  const minPlanLabel = minPlan.toUpperCase();

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        {/* Lock & Plan Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto mb-6 text-amber-600 dark:text-amber-400">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Requires {minPlanLabel} Subscription
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {featureName} is Locked
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
          This feature isn't included in your current <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPlan.toUpperCase()}</span> plan. 
          Upgrade to {minPlanLabel} to activate this tool across your dashboard and workspace.
        </p>

        {/* Feature Highlights */}
        {meta?.description && (
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              What you unlock with {minPlanLabel}:
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{meta.description}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="denied-view-upgrade-btn"
            onClick={handleUpgrade}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <span>Upgrade to {minPlanLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="denied-view-home-btn"
            onClick={handleHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
