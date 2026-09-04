import React, { useState, useEffect } from 'react';
import { db, doc, onSnapshot } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UsageData, PlanType } from '../../types';
import { PLAN_LIMITS, getDefaultUsageForUser, handleFirestoreError, OperationType } from '../../services/usageFirestoreService';
import { PLAN_MONTHLY_CREDITS } from '../../services/entitlementsService';
import {
  Zap,
  Sparkles,
  AlertTriangle,
  Crown,
  Calendar,
  Layers,
  ChevronRight,
  Database,
} from 'lucide-react';

export interface UsageMeterProps {
  /**
   * Optional custom user ID to query. Defaults to current authenticated user's ID.
   */
  userId?: string;
  /**
   * Layout style format.
   * - 'navbar': Compact interactive bar pill optimized for top navigation bar.
   * - 'inline': Horizontal bar with label for sidebars or toolbars.
   * - 'card': Detailed container card with breakdowns.
   */
  variant?: 'navbar' | 'inline' | 'card';
  /**
   * Whether to show numerical details alongside the progress bar.
   */
  showDetails?: boolean;
  /**
   * Custom CSS classes.
   */
  className?: string;
  /**
   * Callback when user clicks the upgrade action.
   */
  onUpgrade?: () => void;
  /**
   * Callback when user clicks settings or details.
   */
  onOpenSettings?: () => void;
}

/**
 * Reusable UsageMeter component
 * Fetches current user usage from Firestore 'usage' collection in real-time
 * and displays a visual progress bar indicating AI generation monthly limit consumption.
 */
export const UsageMeter: React.FC<UsageMeterProps> = ({
  userId: propUserId,
  variant = 'navbar',
  showDetails = true,
  className = '',
  onUpgrade,
  onOpenSettings,
}) => {
  const { user, profile } = useAuth();
  const { usage: contextUsage, setIsPricingOpen, setIsSettingsOpen, setIsCreditTopUpOpen } = useWorkspace();
  
  const effectiveUserId = propUserId || profile?.id || user?.uid || 'current-user';
  const effectivePlan: PlanType = profile?.plan || 'pro';

  const [usageData, setUsageData] = useState<UsageData | null>(contextUsage || null);
  const [isLoading, setIsLoading] = useState<boolean>(!contextUsage);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  // Fetch / Subscribe directly to the 'usage' collection in Firestore
  useEffect(() => {
    if (!effectiveUserId) return;

    const docPath = `usage/${effectiveUserId}`;
    const usageDocRef = doc(db, 'usage', effectiveUserId);

    try {
      const unsubscribe = onSnapshot(
        usageDocRef,
        (snapshot) => {
          setIsLoading(false);
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<UsageData>;
            const limits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.pro;
            const now = Date.now();

            const monthly = Number(data.monthlyCredits || PLAN_MONTHLY_CREDITS[effectivePlan] || 500);
            const topup = Number(data.topupCredits ?? (effectivePlan === 'pro' ? 100 : 0));
            const usedCredits = Number(data.creditsUsed ?? data.aiGenerationsUsed ?? 0);
            const balance = typeof data.creditsBalance === 'number' && data.creditsBalance > 0
              ? data.creditsBalance
              : Math.max(0, monthly - usedCredits) + topup;

            setUsageData({
              userId: effectiveUserId,
              aiGenerationsUsed: Number(data.aiGenerationsUsed ?? 0),
              aiGenerationsLimit: Number(data.aiGenerationsLimit || limits.aiGenerations),
              mapsCreated: Number(data.mapsCreated ?? 1),
              mapsLimit: Number(data.mapsLimit || limits.maps),
              storageMbUsed: Number(data.storageMbUsed ?? 2.5),
              storageMbLimit: Number(data.storageMbLimit || limits.storageMb),
              exportsUsed: Number(data.exportsUsed ?? 0),
              exportsLimit: Number(data.exportsLimit || limits.exports),
              voiceMinutesUsed: Number(data.voiceMinutesUsed ?? 0),
              voiceMinutesLimit: Number(data.voiceMinutesLimit || limits.voiceMinutes),
              periodStart: Number(data.periodStart || Date.parse('2026-08-20T00:00:00Z')),
              periodEnd: Number(data.periodEnd || Date.parse('2026-09-20T23:59:59Z')),
              creditsBalance: balance,
              monthlyCredits: monthly,
              creditsUsed: usedCredits,
              topupCredits: topup,
              subscriptionStatus: (data as any)?.subscriptionStatus || 'active',
            });
          } else {
            // Fallback default for user
            setUsageData(getDefaultUsageForUser(effectiveUserId, effectivePlan));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, docPath);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      setIsLoading(false);
      return () => {};
    }
  }, [effectiveUserId, effectivePlan]);

  // Calculations
  const currentUsage = usageData || contextUsage || getDefaultUsageForUser(effectiveUserId, effectivePlan);
  const used = currentUsage.creditsUsed ?? currentUsage.aiGenerationsUsed ?? 0;
  const monthly = currentUsage.monthlyCredits ?? 500;
  const topup = currentUsage.topupCredits ?? 100;
  const balance = currentUsage.creditsBalance ?? (monthly + topup - used);
  const totalCapacity = Math.max(1, monthly + (topup > 0 ? topup : 0));
  const percentage = Math.min(100, Math.max(0, Math.round((balance / totalCapacity) * 100)));
  const isZeroCredits = balance <= 0;

  const now = Date.now();
  const periodEnd = currentUsage.periodEnd || Date.parse('2026-09-20T23:59:59Z');
  const daysRemaining = Math.max(1, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)));

  const isCritical = isZeroCredits;
  const isWarning = balance > 0 && balance <= 15;

  // Aesthetic styling mapped to urgency
  const barGradient = isCritical
    ? 'from-rose-500 to-red-600'
    : isWarning
    ? 'from-amber-500 to-orange-500'
    : 'from-indigo-600 via-indigo-500 to-violet-600';

  const badgeStyle = isCritical
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isWarning
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(false);
    if (onUpgrade) {
      onUpgrade();
    } else {
      setIsPricingOpen(true);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(false);
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setIsSettingsOpen(true);
    }
  };

  // 1. NAVBAR VARIANT (Designed for top navigation bar)
  if (variant === 'navbar') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          id="navbar-usage-meter-btn"
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          onMouseEnter={() => setShowPopover(true)}
          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
            isCritical
              ? 'bg-rose-50/90 border-rose-300 hover:bg-rose-100 text-rose-950 shadow-xs'
              : isWarning
              ? 'bg-amber-50/90 border-amber-300 hover:bg-amber-100 text-amber-950 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/90 text-slate-800'
          }`}
          aria-label={`AI Credits: ${balance} of ${monthly} credits available (${percentage}%)`}
          title="AI Credits Balance (Firestore 'usage' collection)"
        >
          {/* Status Icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isCritical ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            ) : (
              <Zap
                className={`w-3.5 h-3.5 ${
                  isWarning ? 'text-amber-500 fill-amber-500' : 'text-indigo-600 fill-indigo-600'
                }`}
              />
            )}
            <span className="text-[11px] font-bold tracking-tight">
              {balance}
              <span className="text-slate-400 font-medium">/{monthly}</span>
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-14 sm:w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
            <div
              style={{ width: `${percentage}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-300`}
            />
          </div>

          {/* Percentage Pill */}
          <span
            className={`hidden md:inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${badgeStyle}`}
          >
            {percentage}%
          </span>
        </button>

        {/* Dropdown / Popover Information Flyout */}
        {showPopover && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPopover(false)}
            />
            <div
              onMouseLeave={() => setShowPopover(false)}
              className="absolute right-0 top-full mt-2 w-76 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 uppercase">{effectivePlan} Plan</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Renewal: 20 Sept 2026
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}
                >
                  {isCritical ? 'Depleted' : isWarning ? 'Low Credits' : 'Active'}
                </span>
              </div>

              {/* Progress Bar Display */}
              <div className="space-y-1.5 mb-3.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                    AI Credits Balance
                  </span>
                  <span className="text-slate-900 font-mono">
                    {balance} <span className="text-slate-400 font-normal">/ {monthly}</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full p-0.5 border border-slate-200/60 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-300`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>{percentage}% capacity available</span>
                  <div className="flex items-center gap-1.5">
                    <span>Used: {used}</span>
                    {topup > 0 && <span className="text-indigo-600 font-bold">(+{topup} top-up)</span>}
                  </div>
                </div>
              </div>

              {/* Real-time Firestore Sync Badge & Reset Info */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 mb-3 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Renewal:
                  </span>
                  <span className="font-semibold text-slate-800">
                    20 Sept 2026 • Pro Entitlements
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    Live Source:
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Firestore Sync Active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="usage-meter-topup-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopover(false);
                    setIsCreditTopUpOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Top Up</span>
                </button>
                <button
                  id="usage-meter-settings-btn"
                  onClick={handleSettingsClick}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Settings
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 2. INLINE VARIANT (For sidebars or toolbars)
  if (variant === 'inline') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-1.5">
            <Zap
              className={`w-3.5 h-3.5 ${
                isCritical
                  ? 'text-rose-500 fill-rose-500'
                  : isWarning
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-indigo-500 fill-indigo-500'
              }`}
            />
            <span>AI Credits</span>
          </div>
          <span className="text-[11px] font-mono text-slate-600">
            {balance}/{monthly}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-300`}
          />
        </div>

        {showDetails && (
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>{balance} credits available</span>
            <span>{percentage}%</span>
          </div>
        )}
      </div>
    );
  }

  // 3. CARD VARIANT (For dashboards or settings modals)
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">AI Credits Balance</h4>
            <p className="text-xs text-slate-500">
              Fetched in real-time from Firestore <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">usage</code>
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
          {percentage}% Capacity
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold font-display text-slate-900">
            {balance} <span className="text-xs text-slate-400 font-normal">/ {monthly} credits</span>
          </span>
          <span className="text-xs text-slate-500">Used: {used}</span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
          />
        </div>
      </div>
    </div>
  );
};

export default UsageMeter;
