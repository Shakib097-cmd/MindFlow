import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    setIsPricingOpen,
    usage,
    activeLayout,
    changeMapLayout,
    openLegal,
  } = useWorkspace();
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'usage' | 'account' | 'preferences'>('usage');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isSettingsOpen) return null;

  const handleRefreshUsage = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
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
            <div className="space-y-6">
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
                    User ID: {profile?.id || user?.uid || 'demo-user'}
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

              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Current Subscription</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    {profile?.plan || 'pro'} Plan
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Includes {usage?.aiGenerationsLimit || 500} monthly AI generations, unlimited canvas
                  nodes, 6 auto-layout algorithms, and cloud persistence.
                </p>
              </div>

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
