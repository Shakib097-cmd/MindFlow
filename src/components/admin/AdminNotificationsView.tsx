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
  const [targetAudience, setTargetAudience] = useState<AdminNotificationBroadcast['targetAudience']>('all');
  const [priority, setPriority] = useState<AdminNotificationBroadcast['priority']>('normal');

  const canBroadcast = ['SUPER_ADMIN', 'ADMIN'].includes(adminRole);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminService.getNotifications(adminRole);
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
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
          targetAudience,
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
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            System Notifications & Broadcast Dispatcher
          </h2>
          <p className="text-xs text-slate-400">
            Publish in-app banners, maintenance notices, and security advisories to SaaS subscribers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Composer */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-850">
            <Send className="w-4 h-4 text-indigo-400" />
            Compose Broadcast Announcement
          </h3>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Active Users</option>
                <option value="free">Free Tier Subscribers Only</option>
                <option value="pro">Pro Tier Subscribers Only</option>
                <option value="business">Business Tier Subscribers Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="system">System Announcement</option>
                  <option value="maintenance">Maintenance Notice</option>
                  <option value="feature">New Feature</option>
                  <option value="security">Security Alert</option>
                  <option value="billing">Billing Update</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent (Modal Alert)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Broadcast Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Gemini 3.1 Architecture Upgrade"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of the announcement or system maintenance window..."
                className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending || !canBroadcast}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Broadcast to Users'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-850">
            <Bell className="w-4 h-4 text-purple-400" />
            Broadcast Dispatch History
          </h3>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                Loading broadcast logs...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No past broadcasts found.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {n.type}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          n.priority === 'urgent'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-200 text-sm">{n.title}</h4>
                  <p className="text-slate-400 text-xs">{n.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-850 font-mono">
                    <span>Target: {n.targetAudience.toUpperCase()}</span>
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
