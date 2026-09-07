import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminAIUsageMetrics, AIGenerationLog } from '../../types';
import {
  Sparkles,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminAIUsageView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [metrics, setMetrics] = useState<AdminAIUsageMetrics | null>(null);
  const [logs, setLogs] = useState<AIGenerationLog[]>([]);
  const [filterFeature, setFilterFeature] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const defaultMetrics: AdminAIUsageMetrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        quotaRejected: 0,
        tokensUsedEstimate: 0,
        averageDurationMs: 0,
        byModel: {},
        byFeature: {},
        byPlan: { free: 0, pro: 0, business: 0 },
        dailyTrend: [],
      };

      try {
        const [usageRes, logsRes] = await Promise.all([
          adminService.getAIUsage(adminRole).catch(() => ({ metrics: defaultMetrics })),
          adminService.getAILogs(100, adminRole).catch(() => ({ logs: [] })),
        ]);
        setMetrics(usageRes?.metrics || defaultMetrics);
        setLogs(Array.isArray(logsRes?.logs) ? logsRes.logs : []);
      } catch (err: any) {
        console.error('Failed to load AI usage:', err);
        setErrorMsg(err?.message || 'Failed to fetch');
        setMetrics({
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          quotaRejected: 0,
          tokensUsedEstimate: 0,
          averageDurationMs: 0,
          byModel: {},
          byFeature: {},
          byPlan: { free: 0, pro: 0, business: 0 },
          dailyTrend: [],
        });
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [adminRole, refreshKey]);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      !search ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.feature.toLowerCase().includes(search.toLowerCase()) ||
      (log.promptPreview && log.promptPreview.toLowerCase().includes(search.toLowerCase()));
    const matchFeature = filterFeature === 'all' || log.feature === filterFeature;
    const matchStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchSearch && matchFeature && matchStatus;
  });

  const totalGen = metrics ? ((metrics as any).totalGenerations ?? metrics.totalRequests ?? 0) : 0;
  const successGen = metrics ? ((metrics as any).successfulGenerations ?? metrics.successfulRequests ?? 0) : 0;
  const failedGen = metrics ? ((metrics as any).failedGenerations ?? metrics.failedRequests ?? 0) : 0;
  const avgDuration = metrics ? ((metrics as any).averageDurationMs ?? 240) : 240;
  const modelEntries = Object.entries(
    (metrics as any)?.modelBreakdown || metrics?.byModel || {
      'gemini-3.8-flash': 0,
      'gemini-3.7-flash': 0,
      'gemini-3.1-flash-lite': 0,
      'gemini-3.1-pro-preview': 0,
    }
  );
  const featureEntries = Object.entries(
    (metrics as any)?.featureBreakdown || metrics?.byFeature || {
      'generate-map': 0,
      'expand-node': 0,
      'voice-to-map': 0,
      'doc-to-map': 0,
    }
  );

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Total AI Calls</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalGen}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">SaaS lifetime volume</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Successful Generations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {successGen}
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">
            {totalGen > 0 ? Math.round((successGen / totalGen) * 100) : 100}% success rate
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Failed / Rate Limited</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tracking-tight">
            {failedGen}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Quota breaches & timeouts</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {avgDuration}ms
          </div>
          <p className="text-[10px] text-indigo-600 mt-1 font-medium">Thinking model processing</p>
        </div>
      </div>

      {/* Feature & Model Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Distribution */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Gemini Model Distribution
          </h3>
          <div className="space-y-3">
            {modelEntries.map(([model, count]) => {
              const total = Math.max(1, totalGen);
              const countNum = Number(count) || 0;
              const pct = totalGen > 0 ? Math.round((countNum / total) * 100) : 0;
              return (
                <div key={model} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-700 font-medium">{model}</span>
                    <span className="font-mono text-slate-500">
                      {countNum} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Breakdown */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-amber-500" />
            AI Feature Usage Breakdown
          </h3>
          <div className="space-y-3">
            {featureEntries.map(([feature, count]) => {
              const total = Math.max(1, totalGen);
              const countNum = Number(count) || 0;
              const pct = totalGen > 0 ? Math.round((countNum / total) * 100) : 0;
              return (
                <div key={feature} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-slate-700 font-medium">{feature.replace('-', ' ')}</span>
                    <span className="font-mono text-slate-500">
                      {countNum} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Live AI Logs Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Live AI Execution Telemetry</h3>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search telemetry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Telemetry by Status"
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Tokens (Est)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                    Loading AI generation telemetry...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No execution logs matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-600">{log.userEmail}</td>
                    <td className="py-3 px-4 capitalize font-semibold text-slate-900">
                      {log.feature.replace('-', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.model}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">{log.durationMs}ms</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.tokensUsed || '~250'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
