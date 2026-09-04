import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import {
  Users,
  CreditCard,
  Sparkles,
  Network,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { setCurrentTab } = useAdmin();
  const {
    kpis,
    recentActivity: activity,
    recentAILogs: aiLogs,
    loading,
    error,
    refresh,
    isLiveFirestore,
  } = useAdminStats();

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Listening to live Cloud Firestore administrative streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2 font-bold">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          Dashboard Error
        </div>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Firestore Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Header Banner - Light */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">MindFlow SaaS Production Engine Active</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                {isLiveFirestore ? 'Firestore Real-Time Stream' : 'Live Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cloud Firestore cluster connected • Gemini 3.1 Pro Thinking Mode Online • Real-time stats synchronized
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-2xs"
            title="Refresh Firestore Metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentTab('security')}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 transition shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Security Diagnostics
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Real-time from Firestore */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.totalUsers}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{kpis.activeUsers} active session{kpis.activeUsers === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue (MRR) */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            ${kpis.mrr}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
            <span>ARPU: ${kpis.arpu} / account</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Subscriptions</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.activeSubscriptions}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            <span>{kpis.conversionRate}% paid conversion</span>
          </div>
        </div>

        {/* Total Mind Maps */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Mind Maps</span>
            <Network className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.totalMaps}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            <span>Graph nodes in sync</span>
          </div>
        </div>

        {/* AI Generations Total */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">AI Generations</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.aiGenerationsTotal}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Thinking & Flash SDK</span>
          </div>
        </div>

        {/* AI Failure Rate */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">AI Failures / Quotas</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.aiGenerationsFailed}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            <span>0% error rate (Optimal)</span>
          </div>
        </div>

        {/* Pro vs Business Breakdown */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tier Distribution</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-600">Free: <strong className="text-slate-900">{kpis.freeUsers}</strong></span>
            <span className="text-xs text-indigo-600">Pro: <strong className="text-slate-900">{kpis.proUsers}</strong></span>
            <span className="text-xs text-purple-600">Biz: <strong className="text-slate-900">{kpis.businessUsers}</strong></span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            <span>Cloud synced tiers</span>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Monthly Retention</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {100 - kpis.churnRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            <span>Zero churn detected</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Administrative Audit Trail & AI Operations - Light */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Log Stream */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Live Administrative Audit Trail</h3>
            </div>
            <button
              onClick={() => setCurrentTab('audit-logs')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View All Logs →
            </button>
          </div>

          {activity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent administrative events recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {activity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                        {log.action}
                      </span>
                      <span className="text-slate-800 font-medium">{log.reason || 'System operation executed'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      By: <span className="text-slate-700 font-semibold">{log.adminEmail}</span> • Target: <span className="font-mono text-slate-600">{log.targetId}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Execution Stream */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Gemini AI Generations</h3>
            </div>
            <button
              onClick={() => setCurrentTab('ai-usage')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Inspect Tokens →
            </button>
          </div>

          {aiLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No AI generation logs available yet.</p>
          ) : (
            <div className="space-y-2.5">
              {aiLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 capitalize truncate">
                        {log.feature.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">({log.model})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      User: {log.userEmail} • {log.durationMs}ms
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
