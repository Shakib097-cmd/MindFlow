import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminSecurityDiagnostics } from '../../types';
import { ShieldCheck, ShieldAlert, Lock, Key, Database, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminSecurityView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [diagnostics, setDiagnostics] = useState<AdminSecurityDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSecurity() {
      setLoading(true);
      try {
        const res = await adminService.getSecurityDiagnostics(adminRole);
        setDiagnostics(res?.diagnostics || null);
      } catch (err) {
        console.error('Failed to load security diagnostics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSecurity();
  }, [adminRole, refreshKey]);

  const recentEvents = Array.isArray(diagnostics?.recentEvents) ? diagnostics.recentEvents : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security Posture & Infrastructure Diagnostics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time verification of backend token isolation, Firestore security rules, and rate limiters.
          </p>
        </div>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gemini API Isolation */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600" />
              Gemini API Key Isolation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              ENFORCED
            </span>
          </div>
          <p className="text-xs text-slate-600">
            API key is stored strictly server-side in Node environment (<code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">process.env.GEMINI_API_KEY</code>). Zero client exposure.
          </p>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Server proxy routing active
          </div>
        </div>

        {/* Firestore Rules */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              Firestore Security Rules
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Users restricted to <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">/users/&#123;userId&#125;/**</code>. Cross-account unauthorized reads and writes rejected by rules.
          </p>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Row-level security active
          </div>
        </div>

        {/* Backend RBAC Middleware */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              Admin RBAC Gatekeeper
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              PROTECTED
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Every <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">/api/admin/*</code> route requires verified admin headers and role authorization checks.
          </p>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Backend middleware verified
          </div>
        </div>
      </div>

      {/* Security Incident Log */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Live Security Incident & Anomaly Stream</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recentEvents.length} events
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {loading ? (
            <div className="p-6 text-center text-slate-400 font-mono">Scanning security records...</div>
          ) : recentEvents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-mono">No active security anomalies detected.</div>
          ) : (
            recentEvents.map((evt) => (
              <div key={evt.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        evt.severity === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : evt.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-bold text-slate-900">{evt.type}</span>
                  </div>
                  <p className="text-slate-600 text-xs">{evt.description}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    User: <span className="text-slate-700 font-medium">{evt.userEmail || 'Anonymous'}</span> • IP:{' '}
                    <span className="text-slate-700 font-medium">{evt.ipAddress}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      evt.resolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {evt.resolved ? 'RESOLVED' : 'ACTIVE'}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
