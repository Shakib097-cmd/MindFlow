import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminSystemSettings } from '../../types';
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Cpu,
  Mail,
  HardDrive,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [settings, setSettings] = useState<AdminSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = adminRole === 'SUPER_ADMIN';

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await adminService.getSystemSettings(adminRole);
        if (isMounted && res.settings) {
          setSettings(res.settings);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load system settings');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [adminRole, refreshKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !isSuperAdmin) return;
    setSaving(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await adminService.updateSystemSettings(settings, adminRole);
      if (res.settings) {
        setSettings(res.settings);
        setSuccessMsg('Global system settings successfully applied.');
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Loading System Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            Global System & Engine Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Configure default AI model engines, storage parameters, and core SaaS behavior.
          </p>
        </div>
        {!isSuperAdmin && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5" />
            Restricted (SUPER_ADMIN Only)
          </span>
        )}
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {settings && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Engine Settings */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                AI Inference Engine
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default AI Architecture Model
                </label>
                <select
                  id="admin-default-ai-model"
                  disabled={!isSuperAdmin}
                  value={settings.defaultAIModel}
                  onChange={(e) => setSettings({ ...settings, defaultAIModel: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended — Ultra Fast &amp; Multimodal)</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash (High Speed &amp; Reasoning)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Lightweight)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Thinking Engine)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Selected model is orchestrated securely through the backend proxy.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Mind Map Depth Level
                </label>
                <select
                  id="admin-default-depth"
                  disabled={!isSuperAdmin}
                  value={settings.defaultMapDepth}
                  onChange={(e) => setSettings({ ...settings, defaultMapDepth: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                >
                  <option value="Standard">Standard (4-6 branches, 3 sub-items)</option>
                  <option value="Detailed">Detailed (6-8 branches, deep hierarchy)</option>
                  <option value="Expert">Expert (Comprehensive multi-tier strategic blueprint)</option>
                  <option value="Basic">Basic (Compact summary)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">AI Subsystem Master Switch</span>
                  <span className="text-[10px] text-slate-500">Allow AI generation requests across the platform</span>
                </div>
                <input
                  type="checkbox"
                  id="admin-ai-master-toggle"
                  disabled={!isSuperAdmin}
                  checked={settings.aiEnabled}
                  onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Storage & Limits */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                Uploads & Quotas
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Document / File Upload Size (MB)
                </label>
                <input
                  type="number"
                  id="admin-max-upload-size"
                  disabled={!isSuperAdmin}
                  value={settings.maxUploadSizeMb}
                  onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
                <p className="text-[10px] text-slate-500 mt-1">Applies to PDF & audio uploads for multimodal analysis.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platform Support Email
                </label>
                <input
                  type="email"
                  id="admin-support-email"
                  disabled={!isSuperAdmin}
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Notify On New Registrations</span>
                  <span className="text-[10px] text-slate-500">Trigger audit event when new users sign up</span>
                </div>
                <input
                  type="checkbox"
                  id="admin-notify-signup"
                  disabled={!isSuperAdmin}
                  checked={settings.notifyOnNewUser}
                  onChange={(e) => setSettings({ ...settings, notifyOnNewUser: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {isSuperAdmin && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                id="save-system-settings-btn"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Applying...' : 'Save System Settings'}</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
