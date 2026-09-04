import { UNLIMITED_USAGE } from '../../lib/config';
import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  Sparkles,
  AlertTriangle,
  Crown,
  Calendar,
  ChevronRight,
  TrendingUp,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface AIUsageProgressBarProps {
  variant?: 'compact' | 'inline' | 'card' | 'navbar';
  showDetails?: boolean;
  className?: string;
  onOpenUpgrade?: () => void;
  onOpenSettings?: () => void;
}

export const AIUsageProgressBar: React.FC<AIUsageProgressBarProps> = ({
  variant = 'compact',
  showDetails = true,
  className = '',
  onOpenUpgrade,
  onOpenSettings,
}) => {
  const { usage, setIsPricingOpen, setIsCreditTopUpOpen } = useWorkspace();
  const { profile } = useAuth();
  const [showPopover, setShowPopover] = useState(false);

  const isAdmin = profile?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com';
  if (UNLIMITED_USAGE && !isAdmin) return null;

  const used = usage?.aiGenerationsUsed ?? 0;
  const limit = usage?.aiGenerationsLimit ?? 50;
  const percentage = Math.min(100, Math.max(0, Math.round((used / Math.max(1, limit)) * 100)));
  const remaining = Math.max(0, limit - used);

  const creditsBalance = usage?.creditsBalance ?? Math.max(0, (usage?.monthlyCredits ?? 100) - (usage?.creditsUsed ?? 0));
  const isCreditsDepleted = creditsBalance <= 0;

  // Calculate days remaining in monthly cycle
  const now = Date.now();
  const periodEnd = usage?.periodEnd || now + 86400000 * 30;
  const msRemaining = Math.max(0, periodEnd - now);
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  // Determine state colors
  const isCritical = percentage >= 90;
  const isWarning = percentage >= 70 && percentage < 90;

  const barColor = isCritical
    ? 'from-rose-500 to-red-600'
    : isWarning
    ? 'from-amber-500 to-orange-500'
    : 'from-indigo-600 to-violet-600';

  const badgeColor = isCritical
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isWarning
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-indigo-50 text-indigo-700 border-indigo-200';

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(false);
    if (onOpenUpgrade) {
      onOpenUpgrade();
    } else {
      setIsPricingOpen(true);
    }
  };

  // 1. NAVBAR COMPACT PILL VARIANT
  if (variant === 'navbar') {
    return (
      <div className="relative inline-block">
        <button
          id="navbar-ai-usage-btn"
          onClick={() => setShowPopover(!showPopover)}
          onMouseEnter={() => setShowPopover(true)}
          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
            isCritical
              ? 'bg-rose-50/90 border-rose-300 hover:bg-rose-100/90 text-rose-900'
              : isWarning
              ? 'bg-amber-50/90 border-amber-300 hover:bg-amber-100/90 text-amber-900'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
          } ${className}`}
          title="Monthly AI Generation Quota (Firestore 'usage')"
        >
          <div className="flex items-center gap-1.5">
            {isCritical ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            ) : (
              <Zap
                className={`w-3.5 h-3.5 ${
                  isWarning ? 'text-amber-600 fill-amber-500' : 'text-indigo-600 fill-indigo-600'
                }`}
              />
            )}
            <span className="text-[11px] font-bold tracking-tight">
              {used}
              <span className="text-slate-400 font-medium">/{limit}</span>
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-14 sm:w-16 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shrink-0">
            <div
              style={{ width: `${percentage}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-300`}
            />
          </div>

          <span
            className={`hidden md:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}
          >
            {percentage}%
          </span>
        </button>

        {/* Interactive Popover Tooltip */}
        {showPopover && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPopover(false)}
            />
            <div
              onMouseLeave={() => setShowPopover(false)}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Monthly AI Limits</div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">
                      {profile?.plan || 'Pro'} Plan Quota
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
                >
                  {isCritical ? 'Almost Out' : isWarning ? 'Nearing Limit' : 'Active'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">AI Generations Used</span>
                  <span className="text-slate-900 font-mono">
                    {used} <span className="text-slate-400">/ {limit}</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-300`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>{remaining} remaining</span>
                  <span className="font-semibold text-indigo-600">{percentage}% utilized</span>
                </div>
              </div>

              {/* Cycle Details */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 mb-3 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Monthly Cycle Renewal:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Database Sync:
                  </span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Firestore Live
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="popover-topup-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopover(false);
                    setIsCreditTopUpOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Top Up Credits</span>
                </button>
                <button
                  id="popover-upgrade-btn"
                  onClick={handleUpgradeClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade</span>
                </button>
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setShowPopover(false);
                      onOpenSettings();
                    }}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 2. INLINE / SIDEBAR COMPACT VARIANT
  if (variant === 'inline') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-1.5">
            <Zap
              className={`w-3.5 h-3.5 ${
                isCreditsDepleted
                  ? 'text-rose-500 fill-rose-500'
                  : isWarning
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-indigo-500 fill-indigo-500'
              }`}
            />
            <span>AI Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold font-mono text-slate-700">
              {creditsBalance} <span className="text-[10px] font-normal text-slate-400">pts</span>
            </span>
            {isCreditsDepleted && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreditTopUpOpen(true);
                }}
                className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer animate-pulse"
              >
                Top Up
              </button>
            )}
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-300`}
          />
        </div>

        {showDetails && (
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>{isCreditsDepleted ? '0 credits left' : `${creditsBalance} credits left`}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreditTopUpOpen(true);
              }}
              className="font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              + Top Up
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. FULL CARD VARIANT (For Settings & Dashboard Views)
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}
    >
      {/* Decorative Accent Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-50/60 via-purple-50/30 to-transparent pointer-events-none rounded-bl-full" />

      <div className="relative z-10 space-y-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Monthly AI Generation Limit
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${badgeColor}`}
                >
                  {profile?.plan || 'pro'} Plan
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Synced in real-time with Firestore <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">usage/{usage?.userId || 'current'}</code>
              </p>
            </div>
          </div>

          <button
            id="settings-upgrade-quota-btn"
            onClick={handleUpgradeClick}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Increase Limit</span>
          </button>
        </div>

        {/* Progress Bar Display */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                {used}
              </span>
              <span className="text-sm font-medium text-slate-400 ml-1.5">
                / {limit} generations used
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-sm sm:text-base font-bold ${
                  isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-indigo-600'
                }`}
              >
                {percentage}%
              </span>
              <div className="text-[10px] text-slate-400 font-medium">quota consumed</div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full p-0.5 border border-slate-200/70 overflow-hidden">
            <div
              style={{ width: `${percentage}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${barColor} shadow-inner transition-all duration-500`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <strong className="text-slate-800">{remaining}</strong> AI generations remaining
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Cycle resets in <strong className="text-slate-800">{daysRemaining} days</strong>
            </span>
          </div>
        </div>

        {/* Feature Quota Grid Breakdown */}
        {showDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mind Maps
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {usage?.mapsCreated ?? 1} / {usage?.mapsLimit ?? 50}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      ((usage?.mapsCreated ?? 1) / (usage?.mapsLimit ?? 50)) * 100
                    )}%`,
                  }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Voice Minutes
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {usage?.voiceMinutesUsed ?? 0} / {usage?.voiceMinutesLimit ?? 120}m
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      ((usage?.voiceMinutesUsed ?? 0) / (usage?.voiceMinutesLimit ?? 120)) * 100
                    )}%`,
                  }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Exports Quota
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {usage?.exportsUsed ?? 0} / {usage?.exportsLimit ?? 200}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      ((usage?.exportsUsed ?? 0) / (usage?.exportsLimit ?? 200)) * 100
                    )}%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cloud Storage
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {usage?.storageMbUsed ?? 2.5} / {usage?.storageMbLimit ?? 500}MB
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      ((usage?.storageMbUsed ?? 2.5) / (usage?.storageMbLimit ?? 500)) * 100
                    )}%`,
                  }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
