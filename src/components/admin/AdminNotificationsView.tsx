import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminNotificationBroadcast } from '../../types';
import { Bell, Send, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

export const AdminNotificationsView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [notifications, setNotifications] = useState<AdminNotificationBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AdminNotificationBroadcast['type']>('system');
  const [targetType, setTargetType] = useState<AdminNotificationBroadcast['targetType']>('all');
  const [priority, setPriority] = useState<AdminNotificationBroadcast['priority']>('normal');

  const canBroadcast = ['SUPER_ADMIN', 'ADMIN'].includes(adminRole);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminService.getNotifications(adminRole);
      setNotifications(Array.isArray(res?.notifications) ? res.notifications : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [adminRole, refreshKey]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    setSuccessMsg(null);
    try {
      await adminService.broadcastNotification(
        {
          title,
          message,
          type,
          targetType,
          priority,
        },
        adminRole
      );
      setSuccessMsg('Broadcast dispatched successfully to targeted users.');
      setTitle('');
      setMessage('');
      loadNotifications();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            System Notifications & Broadcast Dispatcher
          </h2>
          <p className="text-xs text-slate-500">
            Publish in-app banners, maintenance notices, and security advisories to SaaS subscribers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Composer */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Send className="w-4 h-4 text-indigo-600" />
            Compose Broadcast Announcement
          </h3>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Target Audience</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Active Users</option>
                <option value="free">Free Tier Subscribers Only</option>
                <option value="pro">Pro Tier Subscribers Only</option>
                <option value="business">Business Tier Subscribers Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="system">System Announcement</option>
                  <option value="maintenance">Maintenance Notice</option>
                  <option value="feature">New Feature</option>
                  <option value="security">Security Alert</option>
                  <option value="billing">Billing Update</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent (Modal Alert)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Broadcast Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Gemini 3.1 Architecture Upgrade"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of the announcement or system maintenance window..."
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending || !canBroadcast}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Broadcast to Users'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-purple-600" />
            Broadcast Dispatch History
          </h3>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs">
                Loading broadcast logs...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs">
                No past broadcasts found.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {n.type}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          n.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-slate-600 text-xs">{n.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-mono">
                    <span>Target: {(n.targetAudience || 'all').toUpperCase()}</span>
                    <span>Delivered to: {n.sentCount} recipients</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
