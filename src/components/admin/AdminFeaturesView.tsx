import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminFeatureFlags } from '../../types';
import {
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Mic,
  FileText,
  Users,
  Presentation,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Save,
  RotateCcw,
} from 'lucide-react';

export const AdminFeaturesView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [features, setFeatures] = useState<AdminFeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditable = adminRole === 'SUPER_ADMIN' || adminRole === 'ADMIN';

  useEffect(() => {
    let isMounted = true;
    async function loadFeatures() {
      setLoading(true);
      try {
        const res = await adminService.getFeatureFlags(adminRole);
        if (isMounted && res.features) {
          setFeatures(res.features);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load feature flags');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeatures();
    return () => {
      isMounted = false;
    };
  }, [adminRole, refreshKey]);

  const handleToggle = async (key: keyof AdminFeatureFlags) => {
    if (!features || !isEditable) return;
    const updated = { ...features, [key]: !features[key] };
    setFeatures(updated);
    setSaving(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await adminService.updateFeatureFlags({ [key]: updated[key] }, adminRole);
      if (res.features) {
        setFeatures(res.features);
        setSuccessMsg(`Feature flag "${key}" updated successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update feature flag');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !features) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Loading Feature Flags...</p>
        </div>
      </div>
    );
  }

  const FLAGS_META = [
    {
      key: 'aiCopilot' as const,
      label: 'AI Copilot & Mind Map Generator',
      description: 'Enables real-time generative nodes, text-to-map, and contextual AI chat reasoning.',
      icon: Sparkles,
      color: 'text-indigo-600',
    },
    {
      key: 'voiceBrainstorm' as const,
      label: 'Voice Brainstorming Mode',
      description: 'Allows users to record audio streams and convert spoken thoughts into organized branches.',
      icon: Mic,
      color: 'text-purple-600',
    },
    {
      key: 'documentAI' as const,
      label: 'Document & PDF Multimodal Analysis',
      description: 'Gemini native PDF parsing, OCR document breakdown, and syllabus deconstruction.',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      key: 'realTimeCollaboration' as const,
      label: 'Live Workspace Collaboration',
      description: 'Enables multi-user cloud workspace synchronization and shared maps.',
      icon: Users,
      color: 'text-emerald-600',
    },
    {
      key: 'presentationMode' as const,
      label: 'Presentation Slide Deck Engine',
      description: 'Converts hierarchical mind maps into full-screen interactive slide decks.',
      icon: Presentation,
      color: 'text-cyan-600',
    },
    {
      key: 'studyFlashcards' as const,
      label: 'Study Hub & Interactive Flashcards',
      description: 'Generates active-recall flashcard sets and self-testing quizzes from mind maps.',
      icon: GraduationCap,
      color: 'text-amber-600',
    },
    {
      key: 'signupEnabled' as const,
      label: 'Public User Registration',
      description: 'Allows new users to create accounts and join the MindFlow SaaS platform.',
      icon: CheckCircle2,
      color: 'text-teal-600',
    },
    {
      key: 'maintenanceMode' as const,
      label: 'Platform Maintenance Mode',
      description: 'Displays a maintenance banner and suspends background mutation requests.',
      icon: AlertTriangle,
      color: 'text-rose-600',
      critical: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ToggleLeft className="w-4 h-4 text-indigo-600" />
            Dynamic SaaS Feature Flags & Toggles
          </h2>
          <p className="text-xs text-slate-500">
            Control platform capabilities in real time without redeploying code.
          </p>
        </div>
        {!isEditable && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5" />
            Read-Only (Requires SUPER_ADMIN / ADMIN)
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

      {/* Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FLAGS_META.map((flag) => {
          const Icon = flag.icon;
          const isEnabled = features ? Boolean(features[flag.key]) : false;
          return (
            <div
              key={flag.key}
              className={`p-4 rounded-xl border shadow-xs transition-all ${
                flag.critical
                  ? isEnabled
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-white border-slate-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                    <Icon className={`w-4 h-4 ${flag.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{flag.label}</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {flag.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  id={`flag-toggle-${flag.key}`}
                  disabled={!isEditable || saving}
                  onClick={() => handleToggle(flag.key)}
                  className={`shrink-0 transition-colors focus:outline-none ${
                    !isEditable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  aria-label={`Toggle ${flag.label}`}
                >
                  {isEnabled ? (
                    <ToggleRight className={`w-8 h-8 ${flag.critical ? 'text-rose-600' : 'text-indigo-600'}`} />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300 hover:text-slate-400" />
                  )}
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Key: {flag.key}</span>
                <span className={isEnabled ? (flag.critical ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold') : 'text-slate-400 font-medium'}>
                  {isEnabled ? (flag.critical ? 'CRITICAL ACTIVE' : 'ENABLED') : 'DISABLED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
