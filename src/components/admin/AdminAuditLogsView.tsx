import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminAuditLog } from '../../types';
import { FileText, Search, ShieldCheck, Filter, Code, Eye, X } from 'lucide-react';

export const AdminAuditLogsView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [inspectedLog, setInspectedLog] = useState<AdminAuditLog | null>(null);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await adminService.getAuditLogs(200, adminRole);
        setLogs(res.auditLogs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [adminRole, refreshKey]);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      !search ||
      log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Immutable Admin Audit Log Registry
          </h2>
          <p className="text-xs text-slate-400">
            Every privileged administrative operation, plan override, and security change is logged permanently.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search admin or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter Audit Logs by Action"
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading security audit trails...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No audit records matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{log.adminEmail}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{log.adminRole}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.targetId}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{log.reason || '—'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectedLog(log)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                        title="View Payload Metadata"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Inspector Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Audit Event Metadata: {inspectedLog.action}</h3>
              </div>
              <button onClick={() => setInspectedLog(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900 text-slate-300 flex justify-between font-mono">
                <span className="text-slate-500">Log ID:</span>
                <span>{inspectedLog.id}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 text-slate-300 flex justify-between font-mono">
                <span className="text-slate-500">IP Address:</span>
                <span>{inspectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 text-slate-300 flex justify-between font-mono">
                <span className="text-slate-500">Client Agent:</span>
                <span className="truncate max-w-xs">{inspectedLog.userAgent || 'Chrome / MindFlow Admin'}</span>
              </div>

              <div>
                <span className="block text-slate-400 mb-1">State Modification Payload</span>
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-48 custom-scrollbar">
                  {JSON.stringify(inspectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
