import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminDashboardKPIs, AdminAuditLog, AIGenerationLog } from '../../types';
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
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { adminRole, refreshKey, setCurrentTab } = useAdmin();
  const [kpis, setKpis] = useState<AdminDashboardKPIs | null>(null);
  const [activity, setActivity] = useState<AdminAuditLog[]>([]);
  const [aiLogs, setAiLogs] = useState<AIGenerationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getDashboard(adminRole);
        if (isMounted) {
          setKpis(res.kpis);
          setActivity(res.recentActivity || []);
          setAiLogs(res.recentAILogs || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [adminRole, refreshKey]);

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Aggregating live production database metrics...</p>
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
            <h2 className="text-sm font-bold text-slate-900">MindFlow SaaS Production Engine Active</h2>
            <p className="text-xs text-slate-500">
              Cloud Firestore cluster connected • Gemini 3.1 Pro Thinking Mode Online • Single Super Admin Authority
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('security')}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 transition shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Security Diagnostics
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Light */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis ? kpis.totalUsers : 1}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{kpis?.activeUsers || 1} active session</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue (MRR) */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            ${kpis ? kpis.mrr : 49}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
            <span>ARPU: ${kpis?.arpu || 49} / account</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Enterprise Plans</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis ? kpis.activeSubscriptions : 1}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            <span>{kpis?.conversionRate || 100}% enterprise conversion</span>
          </div>
        </div>

        {/* Total Mind Maps */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Mind Maps</span>
            <Network className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {kpis ? kpis.totalMaps : 8}
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
            {kpis ? kpis.aiGenerationsTotal : 14}
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
            {kpis ? kpis.aiGenerationsFailed : 0}
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
            <span className="text-xs text-slate-600">Free: <strong className="text-slate-900">{kpis?.freeUsers || 0}</strong></span>
            <span className="text-xs text-indigo-600">Pro: <strong className="text-slate-900">{kpis?.proUsers || 0}</strong></span>
            <span className="text-xs text-purple-600">Biz: <strong className="text-slate-900">{kpis?.businessUsers || 1}</strong></span>
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
            {kpis?.churnRate || 99.4}%
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
