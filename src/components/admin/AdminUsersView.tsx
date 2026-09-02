import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminUserRecord, PlanType } from '../../types';
import { AdminUserDetailsModal } from './AdminUserDetailsModal';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Sparkles,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  UserCheck,
  UserX,
  Eye,
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(
        {
          search,
          status: statusFilter,
          plan: planFilter,
          page,
          limit: 20,
        },
        adminRole
      );
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, planFilter, page, adminRole, refreshKey]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="admin-users-search-input"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[11px] text-slate-400">Status:</span>
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Status"
              className="bg-transparent text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[11px] text-slate-400">Plan:</span>
            <select
              id="admin-plan-filter"
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Plan"
              className="bg-transparent text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Usage</th>
                <th className="py-3 px-4">Maps</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading users from backend registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                          {u.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200 truncate">{u.name || 'MindFlow User'}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          u.status === 'suspended'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (u.aiUsage.used / Math.max(1, u.aiUsage.limit)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {u.aiUsage.used}/{u.aiUsage.limit}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.mapsCount || 0}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(u.lastActiveAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-white">{pagination.page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <AdminUserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => {
            fetchUsers();
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};
