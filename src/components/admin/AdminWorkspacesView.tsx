import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminWorkspaceRecord } from '../../types';
import { Building2, Users, Network, Calendar, ShieldCheck } from 'lucide-react';

export const AdminWorkspacesView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspaces() {
      setLoading(true);
      try {
        const res = await adminService.getWorkspaces(adminRole);
        setWorkspaces(res.workspaces);
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaces();
  }, [adminRole, refreshKey]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Team & Organization Workspaces
          </h2>
          <p className="text-xs text-slate-400">
            Multi-tenant collaboration spaces and permission registries.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Workspace Name</th>
                <th className="py-3 px-4">Owner Email</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Maps Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading workspace directories...
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No team workspaces created yet.
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200">{ws.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{ws.ownerEmail}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{ws.memberCount}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{ws.mapsCount}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {ws.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(ws.createdAt).toLocaleDateString()}
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
