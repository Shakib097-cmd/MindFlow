import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useEntitlement } from '../../hooks/useEntitlement';
import { AIUsageProgressBar } from '../common/AIUsageProgressBar';
import {
  Settings,
  Zap,
  Sparkles,
  User,
  Sliders,
  Shield,
  Crown,
  Check,
  X,
  Layers,
  Activity,
  AlertCircle,
  FileText,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    setIsPricingOpen,
    setIsCreditTopUpOpen,
    setCurrentView,
    usage,
    activeLayout,
    changeMapLayout,
    openLegal,
  } = useWorkspace();
  const { profile, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'usage' | 'account' | 'preferences'>('usage');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    creditsBalance,
    monthlyCredits,
    creditsUsed,
    topupCredits,
    isZeroCredits,
  } = useEntitlement();

  const effectivePlan = profile?.plan || 'pro';
  const rawStatus = (profile as any)?.subscriptionStatus || (usage as any)?.subscriptionStatus || 'active';
  const isSubscriptionActive = !['past_due', 'cancelled', 'expired'].includes(rawStatus);
  const statusLabel = isSubscriptionActive ? 'Active' : rawStatus.replace('_', ' ');

  // Format Renewal / Cycle Period End Date (e.g. 20 Sept 2026)
  const renewalDateString = useMemo(() => {
    const endTimestamp = usage?.periodEnd || Date.now() + 17 * 86400000;
    return new Date(endTimestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [usage?.periodEnd]);

  const totalMonthlyAllowance = Math.max(1, monthlyCredits);
  const creditUsagePercent = Math.min(100, Math.max(0, Math.round((creditsBalance / totalMonthlyAllowance) * 100)));

  if (!isSettingsOpen) return null;

  const handleRefreshUsage = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSignOut = async () => {
    setIsSettingsOpen(false);
    await signOut();
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Settings & Usage Limits
              </h2>
              <p className="text-xs text-slate-500">
                Manage your account quotas, AI credits, database, and preferences
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-2 overflow-x-auto">
          <button
            id="tab-ai-usage-btn"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'usage'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Monthly AI Usage</span>
          </button>

          <button
            id="tab-account-btn"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'account'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account & Plan</span>
          </button>

          <button
            id="tab-preferences-btn"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AI USAGE & LIMITS */}
          {activeTab === 'usage' && (
            <div className="space-y-5">
              {/* PRIMARY PRO PLAN & AI CREDITS BALANCE HERO STRIP (MATCHING SCREENSHOT) */}
              <div
                id="settings-plan-credits-hero"
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                      <Crown className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase">
                          {effectivePlan} Plan
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                            isSubscriptionActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSubscriptionActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          {statusLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Renewal: {renewalDateString} • {effectivePlan === 'free' ? 'Starter Quota' : 'Pro Entitlements'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="settings-hero-topup-btn"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsCreditTopUpOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Top Up</span>
                    </button>
                    <button
                      id="settings-hero-manage-btn"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsPricingOpen(true);
                      }}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Manage Plan
                    </button>
                  </div>
                </div>

                {/* AI Credits Bar */}
                <div className="mt-4 bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                      <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                      AI Credits Balance
                    </span>
                    <span className="font-black font-mono text-slate-900 text-xs">
                      {creditsBalance} <span className="text-slate-400 font-normal">/ {monthlyCredits}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${creditUsagePercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isZeroCredits
                          ? 'bg-rose-500'
                          : creditUsagePercent <= 15
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-medium text-slate-600">{creditUsagePercent}% capacity available</span>
                    <div className="flex items-center gap-2">
                      <span>Used: {creditsUsed}</span>
                      {topupCredits > 0 && <span className="text-indigo-600 font-bold">(+{topupCredits} top-up)</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly AI Generation Limit Card */}
              <AIUsageProgressBar
                variant="card"
                showDetails={true}
                onOpenUpgrade={() => {
                  setIsSettingsOpen(false);
                  setIsPricingOpen(true);
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    AI Generations Used
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {usage?.aiGenerationsUsed ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Resets at the start of your billing cycle
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Plan Allowance
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-600">
                    {usage?.aiGenerationsLimit ?? 500}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Total quota allocated for this period
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">Active Plan Capabilities</span>
                  </div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    {profile?.plan || 'pro'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Gemini 2.5 Flash / Pro 3.1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited Canvas Nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Multi-format SVG/PNG Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Real-time Cloud Sync</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT & PLAN */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                  {profile?.name
                    ? profile.name
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((n) => n[0] || '')
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'MF'
                    : 'MF'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {profile?.name || 'MindFlow User'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {profile?.email || 'Registered User'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    User ID: {profile?.id || user?.uid || 'user-local'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsPricingOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Change Plan
                </button>
              </div>

              {/* Plan & Credits Summary in Account Tab */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Current Subscription</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                      {effectivePlan} Plan
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {statusLabel}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Renewal: {renewalDateString} • {effectivePlan === 'free' ? 'Starter Quota' : 'Pro Entitlements'}
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">AI Credits Balance</div>
                    <div className="text-sm font-black font-mono text-slate-900">
                      {creditsBalance} / {monthlyCredits}{' '}
                      {topupCredits > 0 && <span className="text-xs text-indigo-600 font-normal">(+{topupCredits} top-up)</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsCreditTopUpOpen(true);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Top Up
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Includes {usage?.aiGenerationsLimit || 500} monthly AI generations, unlimited canvas
                  nodes, 6 auto-layout algorithms, and cloud persistence.
                </p>
              </div>

              {/* Sign Out Button in Account Tab */}
              <button
                id="settings-account-signout-btn"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Legal & Compliance Policies
                  </span>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      openLegal('privacy');
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    View All <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      openLegal('privacy');
                    }}
                    className="text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      openLegal('terms');
                    }}
                    className="text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      openLegal('data-protection');
                    }}
                    className="text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                  >
                    GDPR & CCPA
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      openLegal('contact');
                    }}
                    className="text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                  >
                    Legal Inquiry Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACE PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">Default Layout Algorithm</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left-to-right', 'right-to-left', 'radial', 'tree-vertical'] as const).map(
                    (layout) => (
                      <button
                        key={layout}
                        onClick={() => changeMapLayout(layout)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center capitalize transition-colors cursor-pointer ${
                          activeLayout === layout
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {layout.replace('-', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Auto-Save Changes</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Enabled
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Mind maps and nodes are automatically saved to local storage and synced.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
