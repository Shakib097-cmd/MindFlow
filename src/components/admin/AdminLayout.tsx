import React, { useState } from 'react';
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
  ArrowLeft,
  ShieldAlert,
  Menu,
  X,
  RefreshCw,
  Lock,
  Crown,
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
  { id: 'users', label: 'Users & Roles', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'plans', label: 'Plans & Pricing', icon: Sliders, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'ai-usage', label: 'AI Usage & Tokens', icon: Sparkles, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
  { id: 'maps', label: 'Mind Maps', icon: Network, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'templates', label: 'Templates', icon: BookTemplate, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'workspaces', label: 'Workspaces', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'notifications', label: 'Broadcasts', icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { id: 'analytics', label: 'Analytics & MRR', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
  { id: 'audit-logs', label: 'Audit Logs', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
  { id: 'security', label: 'Security Center', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'features', label: 'Feature Flags', icon: ToggleLeft, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'settings', label: 'System Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminRole, currentTab, setCurrentTab, refreshData, loading } = useAdmin();
  const { setCurrentView } = useWorkspace();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Available tabs for Super Admin / Admin
  const availableTabs = SIDEBAR_ITEMS.filter((item) => item.roles.includes(adminRole));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar - Light Theme */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white z-30 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-sm">
              M
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                MindFlow <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">ADMIN</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Enterprise Control Panel</p>
            </div>
          </div>
        </div>

        {/* Single Super Admin Master Badge */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Authority Level</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 font-bold flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 text-purple-600" />
              SUPER ADMIN
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center gap-2 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-900 truncate">starcybercafe097@gmail.com</p>
              <p className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sole Master Super Admin
              </p>
            </div>
          </div>
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
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>


      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Navbar - Light */}
        <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              id="mobile-admin-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>Enterprise Admin</span>
                <span>/</span>
                <span className="text-indigo-600 font-semibold capitalize">{currentTab.replace('-', ' ')}</span>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight capitalize">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs text-slate-700 border border-slate-200 shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-medium">Refresh Data</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Admin identity badge */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold">
                SA
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  starcybercafe097@gmail.com
                </p>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-500" />
                  Super Admin Root Access
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 text-slate-800 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-full bg-white border-r border-slate-200 p-4 flex flex-col h-full z-10 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">M</div>
                <span className="font-bold text-sm text-slate-900">MindFlow Admin</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close Mobile Navigation" className="p-1.5 text-slate-500 hover:text-slate-800">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

          </div>
        </div>
      )}
    </div>
  );
};
