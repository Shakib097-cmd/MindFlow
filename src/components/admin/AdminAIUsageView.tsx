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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [usageRes, logsRes] = await Promise.all([
          adminService.getAIUsage(adminRole),
          adminService.getAILogs(100, adminRole),
        ]);
        setMetrics(usageRes.metrics);
        setLogs(logsRes.logs);
      } catch (err) {
        console.error('Failed to load AI usage:', err);
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

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total AI Calls</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics ? metrics.totalGenerations : 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">SaaS lifetime volume</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Successful Generations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {metrics ? metrics.successfulGenerations : 0}
          </div>
          <p className="text-[10px] text-emerald-500 mt-1">
            {metrics?.totalGenerations
              ? Math.round((metrics.successfulGenerations / metrics.totalGenerations) * 100)
              : 100}
            % success rate
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Failed / Rate Limited</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {metrics ? metrics.failedGenerations : 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Quota breaches & timeouts</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {metrics?.averageDurationMs || 0}ms
          </div>
          <p className="text-[10px] text-indigo-400 mt-1">Thinking model processing</p>
        </div>
      </div>

      {/* Feature & Model Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Distribution */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Gemini Model Distribution
          </h3>
          <div className="space-y-3">
            {metrics &&
              Object.entries(metrics.modelBreakdown).map(([model, count]) => {
                const total = Math.max(1, metrics.totalGenerations);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={model} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-slate-300">{model}</span>
                      <span className="font-mono text-slate-400">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Feature Breakdown */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-amber-400" />
            AI Feature Usage Breakdown
          </h3>
          <div className="space-y-3">
            {metrics &&
              Object.entries(metrics.featureBreakdown).map(([feature, count]) => {
                const total = Math.max(1, metrics.totalGenerations);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={feature} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize text-slate-300">{feature.replace('-', ' ')}</span>
                      <span className="font-mono text-slate-400">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Detailed Live AI Logs Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Live AI Execution Telemetry</h3>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search telemetry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Telemetry by Status"
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
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
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading AI generation telemetry...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No execution logs matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-300">{log.userEmail}</td>
                    <td className="py-3 px-4 capitalize font-semibold text-slate-200">
                      {log.feature.replace('-', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.model}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{log.durationMs}ms</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.tokensUsed || '~250'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
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
