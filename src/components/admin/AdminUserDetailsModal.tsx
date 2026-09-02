import React, { useState } from 'react';
import { AdminUserRecord, PlanType } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import {
  X,
  ShieldAlert,
  UserCheck,
  CreditCard,
  Sparkles,
  RotateCcw,
  Network,
  Clock,
  Calendar,
  AlertTriangle,
  Mail,
  Crown,
} from 'lucide-react';

interface Props {
  user: AdminUserRecord | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const AdminUserDetailsModal: React.FC<Props> = ({ user, onClose, onUpdated }) => {
  const { adminRole } = useAdmin();
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user?.plan || 'free');
  const [planReason, setPlanReason] = useState('');
  const [activeAction, setActiveAction] = useState<'details' | 'suspend' | 'plan' | 'resetUsage'>('details');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!user) return null;

  const isSuspended = user.status === 'suspended';
  const isSuperAdmin = (user.email || '').toLowerCase() === 'starcybercafe097@gmail.com';
  const canModify = ['SUPER_ADMIN', 'ADMIN'].includes(adminRole);
  const canResetUsage = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(adminRole);

  const handleToggleSuspension = async () => {
    if (!canModify) return;
    if (isSuperAdmin) {
      setStatusMessage({ text: 'The Master Super Admin account cannot be suspended.', isError: true });
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const nextStatus = isSuspended ? 'active' : 'suspended';
      await adminService.updateUserStatus(user.id, nextStatus, suspendReason || 'Admin console action', adminRole);
      setStatusMessage({ text: `User status changed to ${nextStatus}`, isError: false });
      setTimeout(() => {
        onUpdated();
        setActiveAction('details');
      }, 700);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Operation failed', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!canModify) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      await adminService.updateUserPlan(user.id, selectedPlan, planReason || 'Plan override via Admin Console', adminRole);
      setStatusMessage({ text: `Plan updated to ${(selectedPlan || '').toUpperCase()}`, isError: false });
      setTimeout(() => {
        onUpdated();
        setActiveAction('details');
      }, 700);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Plan update failed', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResetUsage = async () => {
    if (!canResetUsage) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      await adminService.resetUserUsage(user.id, 'AI quota reset via Admin Console', adminRole);
      setStatusMessage({ text: 'AI generation quota reset to 0/0', isError: false });
      setTimeout(() => {
        onUpdated();
        setActiveAction('details');
      }, 700);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Usage reset failed', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header - Light */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{user.name || 'MindFlow User'}</h3>
                {isSuperAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-600" /> Super Admin
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isSuspended
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {user.status}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold uppercase">
                  {user.plan}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close User Details Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveAction('details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeAction === 'details' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Account Details
          </button>
          {canModify && !isSuperAdmin && (
            <>
              <button
                onClick={() => setActiveAction('suspend')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeAction === 'suspend' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                }`}
              >
                {isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
              </button>
              <button
                onClick={() => setActiveAction('plan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeAction === 'plan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Change Plan
              </button>
            </>
          )}
          {canResetUsage && (
            <button
              onClick={() => setActiveAction('resetUsage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAction === 'resetUsage' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              Reset AI Quota
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1 bg-white">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold border ${
                statusMessage.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {activeAction === 'details' && (
            <div className="space-y-4">
              {/* Suspension Notice if Suspended */}
              {isSuspended && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Account is Currently Suspended</h4>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Reason: <span className="font-semibold">{user.suspensionReason || 'Administrative decision'}</span>
                    </p>
                    {user.suspendedAt && (
                      <p className="text-[10px] text-rose-600 mt-1 font-mono">
                        Suspended on {new Date(user.suspendedAt).toLocaleString()} by {user.suspendedBy || 'Admin'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AI Generations
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {user.aiUsage.used} <span className="text-xs font-normal text-slate-500">/ {user.aiUsage.limit}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (user.aiUsage.used / Math.max(1, user.aiUsage.limit)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-semibold">
                    <Network className="w-3.5 h-3.5 text-indigo-600" />
                    Mind Maps
                  </div>
                  <div className="text-lg font-bold text-slate-900">{user.mapsCount || 0}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Saved graphs</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-semibold">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    Subscription
                  </div>
                  <div className="text-lg font-bold text-indigo-600 uppercase">{user.plan}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Tier Plan Quota</p>
                </div>
              </div>

              {/* Metadata details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Account Created:
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Last Active:
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">{new Date(user.lastActiveAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium">User Document ID:</span>
                  <span className="font-mono text-slate-600">{user.id}</span>
                </div>
              </div>
            </div>
          )}

          {activeAction === 'suspend' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  {isSuspended ? 'Confirm Account Reactivation' : 'Confirm Account Suspension'}
                </h4>
                <p className="text-xs text-slate-600">
                  {isSuspended
                    ? 'Reactivating this user will restore their ability to generate AI maps and access cloud sync.'
                    : 'Suspended users are immediately blocked on all protected SaaS endpoints with HTTP 403 Forbidden.'}
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrative Reason (Recorded to Audit Trail)
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder={isSuspended ? 'e.g. Cleared compliance review' : 'e.g. Terms of Service policy violation'}
                    className="w-full h-20 bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveAction('details')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleSuspension}
                    disabled={loading}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition ${
                      isSuspended ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    {loading ? 'Processing...' : isSuspended ? 'Reactivate User' : 'Confirm Suspension'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeAction === 'plan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Override Subscription Plan
                </h4>
                <p className="text-xs text-slate-600">
                  Changing the tier will adjust the user AI quota limit immediately in both Firestore and server cache.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['free', 'pro', 'business'] as PlanType[]).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-lg border text-left transition ${
                        selectedPlan === plan
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs capitalize">{plan}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {plan === 'free' ? '20 AI/mo' : plan === 'pro' ? '300 AI/mo' : '1500 AI/mo'}
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Plan Change</label>
                  <input
                    type="text"
                    value={planReason}
                    onChange={(e) => setPlanReason(e.target.value)}
                    placeholder="e.g. VIP Enterprise Customer upgrade"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveAction('details')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePlan}
                    disabled={loading}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs"
                  >
                    {loading ? 'Updating...' : 'Save Plan Change'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeAction === 'resetUsage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Reset Monthly AI Usage Counter
                </h4>
                <p className="text-xs text-slate-600">
                  This will reset the user's used generations counter from{' '}
                  <strong className="text-slate-900">{user.aiUsage.used}</strong> back to <strong className="text-emerald-600">0</strong>.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveAction('details')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetUsage}
                    disabled={loading}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-xs"
                  >
                    {loading ? 'Resetting...' : 'Confirm Usage Reset'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
