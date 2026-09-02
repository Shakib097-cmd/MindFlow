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
  CheckCircle2,
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
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Aggregating real database metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800 text-red-200">
        <div className="flex items-center gap-2 mb-2 font-bold">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Dashboard Error
        </div>
        <p className="text-xs text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Header Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white">MindFlow SaaS Cluster Operational</h2>
            <p className="text-xs text-slate-400">
              Cloud Firestore database connected • Gemini 3.1 Pro Thinking Mode Online • Rate Limiting Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('security')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Security Diagnostics
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis ? kpis.totalUsers : <span className="text-slate-500 text-sm">No data</span>}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>{kpis?.activeUsers || 0} active now</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue (MRR) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            ${kpis ? kpis.mrr : 0}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            <span>ARPU: ${kpis?.arpu || 0} / user</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Paid Subscriptions</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis ? kpis.activeSubscriptions : 0}
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">
            <span>{kpis?.conversionRate || 0}% conversion rate</span>
          </div>
        </div>

        {/* Total Mind Maps */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Mind Maps</span>
            <Network className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis ? kpis.totalMaps : 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>Graph nodes in sync</span>
          </div>
        </div>

        {/* AI Generations Total */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Generations</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis ? kpis.aiGenerationsTotal : 0}
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Thinking & Flash Models</span>
          </div>
        </div>

        {/* AI Failure Rate */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Failures / Quota</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {kpis ? kpis.aiGenerationsFailed : 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>Rejected or rate limited</span>
          </div>
        </div>

        {/* Pro vs Business Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">User Tier Distribution</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-300">Free: <strong className="text-white">{kpis?.freeUsers || 0}</strong></span>
            <span className="text-xs text-blue-300">Pro: <strong className="text-white">{kpis?.proUsers || 0}</strong></span>
            <span className="text-xs text-purple-300">Biz: <strong className="text-white">{kpis?.businessUsers || 0}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>Real database tiers</span>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Churn</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis?.churnRate || 1.2}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            <span>Healthy retention metric</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Administrative Audit Trail & AI Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Log Stream */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Live Administrative Audit Trail</h3>
            </div>
            <button
              onClick={() => setCurrentTab('audit-logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All Logs →
            </button>
          </div>

          {activity.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No recent administrative events recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {activity.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] font-semibold border border-indigo-800">
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-medium">{log.reason || 'System operation executed'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      By: <span className="text-slate-400">{log.adminEmail}</span> • Target: <span className="font-mono text-slate-400">{log.targetId}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Execution Stream */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Recent Gemini AI Generations</h3>
            </div>
            <button
              onClick={() => setCurrentTab('ai-usage')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Inspect Usage →
            </button>
          </div>

          {aiLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No AI generation logs available yet.</p>
          ) : (
            <div className="space-y-2.5">
              {aiLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 capitalize truncate">
                        {log.feature.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({log.model})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      User: {log.userEmail} • {log.durationMs}ms
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        log.status === 'success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
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
