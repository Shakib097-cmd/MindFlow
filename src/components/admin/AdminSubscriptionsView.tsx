import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminSubscription } from '../../types';
import { CreditCard, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export const AdminSubscriptionsView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [paymentGatewayStatus, setPaymentGatewayStatus] = useState<string>('sandbox_configured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      setLoading(true);
      try {
        const res = await adminService.getSubscriptions(adminRole);
        setSubscriptions(res.subscriptions);
        setPaymentGatewayStatus(res.paymentGatewayStatus);
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, [adminRole, refreshKey]);

  return (
    <div className="space-y-6">
      {/* Payment Gateway Alert Banner */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-amber-300">
            ⚠️ Payment Gateway Integration: {paymentGatewayStatus.toUpperCase().replace('_', ' ')}
          </h3>
          <p className="text-xs text-amber-200/90 mt-0.5">
            Stripe webhook receivers are active on <code className="font-mono text-amber-300">/api/billing/webhook</code>.
            Simulated checkout sessions operate in sandbox mode until live production Stripe API keys are configured.
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Live Customer Subscriptions</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{subscriptions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Current Period End</th>
                <th className="py-3 px-4">Auto-Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading subscription records...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No active paid subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{sub.userName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{sub.userEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          sub.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      ${sub.amount} <span className="text-[10px] text-slate-500 font-normal">/{sub.interval}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 capitalize">{sub.provider}</td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] font-mono">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enabled
                      </span>
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
