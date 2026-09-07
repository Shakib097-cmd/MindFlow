import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AdminAccessDeniedView: React.FC = () => {
  const { user, signOut } = useAuth();
  const { setCurrentView } = useWorkspace();

  const handleReturnDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleSignOutAndSwitch = async () => {
    try {
      await signOut();
      setCurrentView('landing');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-indigo-900 selection:text-indigo-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
        {/* 403 Badge & Icon */}
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Lock className="w-3.5 h-3.5" />
            HTTP 403 Forbidden
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
            Admin Access Denied
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            This secure administrative portal is exclusively restricted to authorized platform administrators. Your current account (<span className="font-semibold text-slate-200">{user?.email || 'Standard User'}</span>) is authenticated as a standard user and lacks administrative clearance.
          </p>
        </div>

        {/* Security Audit Box */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Security Protocol:</span>
            <span className="text-emerald-400 font-bold">RBAC Enforced</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Attempted Resource:</span>
            <span className="text-rose-400">/admin/console</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>User Clearance:</span>
            <span className="text-amber-400">Standard User (Non-Whitelisted)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReturnDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleSignOutAndSwitch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
          MindFlow AI Enterprise Security Guard • Incident logged to audit registry
        </div>
      </div>
    </div>
  );
};
