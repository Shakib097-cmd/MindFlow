import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminUserRecord } from '../../types';
import { AdminUserDetailsModal } from './AdminUserDetailsModal';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Crown,
  ShieldCheck,
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
      setUsers(Array.isArray(res?.users) ? res.users : []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, planFilter, page, adminRole, refreshKey]);

  return (
    <div className="space-y-6">
      {/* Super Admin Notice Banner */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              Strict Single Super Admin Policy Enforced
            </h3>
            <p className="text-[11px] text-purple-700">
              Only <span className="font-semibold">starcybercafe097@gmail.com</span> holds Master Super Admin authority. All other users operate under Standard Admin, Support, or Analyst tier.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Root Protected
        </div>
      </div>

      {/* Search and Filters Bar - Light */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
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
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Status:</span>
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Status"
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Plan:</span>
            <select
              id="admin-plan-filter"
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Plan"
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Light */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Loading users from backend registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperAdminUser = (u.email || '').toLowerCase() === 'starcybercafe097@gmail.com';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSuperAdminUser
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}>
                            {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              {u.name || 'MindFlow User'}
                              {isSuperAdminUser && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5 text-purple-600" /> SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            u.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (u.aiUsage.used / Math.max(1, u.aiUsage.limit)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 font-medium">
                            {u.aiUsage.used}/{u.aiUsage.limit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{u.mapsCount || 0}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(u.lastActiveAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing page <strong className="text-slate-900 font-bold">{pagination.page}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{pagination.totalPages}</strong> ({pagination.total} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
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
