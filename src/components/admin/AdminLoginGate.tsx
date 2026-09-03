import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ShieldCheck, Lock, AlertTriangle, ArrowLeft, Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

const AUTHORIZED_ADMIN_EMAIL = 'starcybercafe097@gmail.com';

interface AdminLoginGateProps {
  onSuccess?: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onSuccess }) => {
  const { user, signInWithGoogle, signInWithEmail, signOut } = useAuth();
  const { setCurrentView } = useWorkspace();

  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isCurrentUserAdmin = user?.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

  const handleGoogleAdminLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Check will re-evaluate on auth state changed
      localStorage.setItem('mindflow_admin_email', AUTHORIZED_ADMIN_EMAIL);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Admin Google sign-in failed:', err);
      setError(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setError(`Access Denied: Only "${AUTHORIZED_ADMIN_EMAIL}" is authorized to access the Admin Console.`);
      return;
    }

    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      localStorage.setItem('mindflow_admin_email', AUTHORIZED_ADMIN_EMAIL);
      setSuccessMsg('Authentication verified. Loading Admin Console...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Admin email sign-in failed:', err);
      setError(err?.message || 'Failed to authenticate. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setLoading(true);
    try {
      await signOut();
      setEmail(AUTHORIZED_ADMIN_EMAIL);
      setPassword('');
      setError(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* Main Admin Authentication Box */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="bg-slate-950 p-6 text-white text-center relative border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            MindFlow <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-mono">ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted Enterprise Administrative Console
          </p>
        </div>

        {/* Body Section */}
        <div className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <Lock className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div className="text-slate-600 leading-relaxed">
              Access is strictly restricted. Only the verified administrator account (
              <span className="font-semibold text-slate-900">{AUTHORIZED_ADMIN_EMAIL}</span>) is permitted.
            </div>
          </div>

          {/* If user is logged in with a non-admin account */}
          {user && !isCurrentUserAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unauthorized Account Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                You are currently signed in as <strong className="text-amber-900">{user.email || 'guest/regular user'}</strong>, which does not have admin permissions.
              </p>
              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={loading}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Switch Account / Sign In with Admin Gmail
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign-in Option */}
          <div>
            <button
              type="button"
              id="admin-google-login-btn"
              onClick={handleGoogleAdminLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Admin Google Account</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="h-px bg-slate-200 flex-1" />
            <span>or sign in with email credentials</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Email Password Form */}
          <form onSubmit={handleEmailAdminLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  id="admin-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={AUTHORIZED_ADMIN_EMAIL}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              id="admin-submit-login-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Back Link */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Workspace</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">v2.4 Secured</span>
        </div>
      </div>
    </div>
  );
};
