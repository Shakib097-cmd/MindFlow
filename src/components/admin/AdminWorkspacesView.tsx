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
        setWorkspaces(Array.isArray(res?.workspaces) ? res.workspaces : []);
      } catch (err) {
        console.error('Failed to load workspaces:', err);
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaces();
  }, [adminRole, refreshKey]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Team & Organization Workspaces
          </h2>
          <p className="text-xs text-slate-500">
            Multi-tenant collaboration spaces and permission registries.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Workspace Name</th>
                <th className="py-3 px-4">Owner Email</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Maps Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                    Loading workspace directories...
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No team workspaces created yet.
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{ws.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{ws.ownerEmail}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{ws.memberCount}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">{ws.mapsCount}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ws.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
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
