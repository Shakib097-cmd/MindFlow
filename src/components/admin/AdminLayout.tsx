import React, { useState, useEffect } from 'react';
import { useAdmin, AdminTab } from '../../context/AdminContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { AdminRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Sliders,
  Sparkles,
  Network,
  BookTemplate,
  Building2,
  Bell,
  BarChart3,
  ShieldCheck,
  FileText,
  Settings,
  ToggleLeft,
  ChevronRight,
  LogOut,
  ArrowLeft,
  ShieldAlert,
  Menu,
  X,
  RefreshCw,
  Cpu,
  Lock,
} from 'lucide-react';

interface SidebarItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  roles: AdminRole[];
  badge?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST'] },
  { id: 'users', label: 'Users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'plans', label: 'Plans & Pricing', icon: Sliders, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'ai-usage', label: 'AI & Usage', icon: Sparkles, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
  { id: 'maps', label: 'Mind Maps', icon: Network, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'templates', label: 'Templates', icon: BookTemplate, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'workspaces', label: 'Workspaces', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
  { id: 'audit-logs', label: 'Audit Logs', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
  { id: 'security', label: 'Security Center', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'features', label: 'Feature Flags', icon: ToggleLeft, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'settings', label: 'System Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminRole, setAdminRole, currentTab, setCurrentTab, refreshData, loading } = useAdmin();
  const { setCurrentView } = useWorkspace();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter allowed tabs based on active role
  const availableTabs = SIDEBAR_ITEMS.filter((item) => item.roles.includes(adminRole));

  // Role pill color
  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SUPPORT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ANALYST':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-md z-30">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              M
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                MindFlow <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">ADMIN</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Enterprise Console</p>
            </div>
          </div>
        </div>

        {/* Role Switcher (Active RBAC Engine) */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Admin Role</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getRoleBadgeColor(adminRole)}`}>
              {adminRole}
            </span>
          </div>
          <select
            id="admin-role-selector"
            value={adminRole}
            onChange={(e) => setAdminRole(e.target.value as AdminRole)}
            aria-label="Select Admin Role"
            className="w-full text-xs bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="SUPER_ADMIN">SUPER_ADMIN (Full Access)</option>
            <option value="ADMIN">ADMIN (Operations)</option>
            <option value="SUPPORT">SUPPORT (User Assist)</option>
            <option value="ANALYST">ANALYST (Read-Only Metrics)</option>
          </select>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 custom-scrollbar">
          {availableTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Switch to User Workspace */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <button
            id="exit-admin-panel-btn"
            onClick={() => setCurrentView('dashboard')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User App</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              id="mobile-admin-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Admin</span>
                <span>/</span>
                <span className="text-slate-200 capitalize font-semibold">{currentTab.replace('-', ' ')}</span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight capitalize">
                {currentTab.replace('-', ' ')} Console
              </h1>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            <button
              id="admin-refresh-data-btn"
              onClick={refreshData}
              disabled={loading}
              title="Refresh Admin Data"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* Admin identity badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.email || 'starcybercafe097@gmail.com'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  Verified Session
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-900 text-slate-100 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-full bg-slate-950 border-r border-slate-800 p-4 flex flex-col h-full z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-sm text-white">MindFlow Admin</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close Mobile Navigation" className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {availableTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                      isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to User App</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
