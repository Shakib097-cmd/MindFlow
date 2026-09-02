import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, Settings2, Lock } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // always true
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  consentTimestamp: number;
}

const COOKIE_STORAGE_KEY = 'mindflow_cookie_preferences_v1';

export const getStoredCookiePreferences = (): CookiePreferences | null => {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse cookie preferences', e);
  }
  return null;
};

export const saveStoredCookiePreferences = (prefs: CookiePreferences) => {
  try {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('mindflow:cookie-consent-updated', { detail: prefs }));
  } catch (e) {
    console.error('Failed to save cookie preferences', e);
  }
};

interface CookieConsentBannerProps {
  forceOpenModal?: boolean;
  onCloseModal?: () => void;
  onNavigateToCookiePolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  forceOpenModal = false,
  onCloseModal,
  onNavigateToCookiePolicy,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Granular preference state
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getStoredCookiePreferences();
    if (!existing) {
      // Delay display slightly so it doesn't jarringly block the viewport on initial load
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setAnalytics(existing.analytics);
      setFunctional(existing.functional);
      setMarketing(existing.marketing);
    }
  }, []);

  useEffect(() => {
    if (forceOpenModal) {
      setShowPreferencesModal(true);
    }
  }, [forceOpenModal]);

  const handleAcceptAll = () => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
      consentTimestamp: Date.now(),
    };
    saveStoredCookiePreferences(prefs);
    setAnalytics(true);
    setFunctional(true);
    setMarketing(true);
    setShowBanner(false);
    setShowPreferencesModal(false);
    if (onCloseModal) onCloseModal();
  };

  const handleRejectNonEssential = () => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
      consentTimestamp: Date.now(),
    };
    saveStoredCookiePreferences(prefs);
    setAnalytics(false);
    setFunctional(false);
    setMarketing(false);
    setShowBanner(false);
    setShowPreferencesModal(false);
    if (onCloseModal) onCloseModal();
  };

  const handleSavePreferences = () => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics,
      functional,
      marketing,
      consentTimestamp: Date.now(),
    };
    saveStoredCookiePreferences(prefs);
    setShowBanner(false);
    setShowPreferencesModal(false);
    if (onCloseModal) onCloseModal();
  };

  return (
    <>
      {/* Floating Bottom Cookie Consent Banner */}
      {showBanner && !showPreferencesModal && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 animate-in slide-in-from-bottom-5 duration-300 font-sans text-slate-900 selection:bg-indigo-100"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Cookie & Privacy Choices</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                We use essential cookies to keep your session secure and persist your mind maps. With your permission, we also use performance cookies to optimize AI canvas speed.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPreferencesModal(true);
                setShowBanner(false);
              }}
              className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 underline underline-offset-2 cursor-pointer"
            >
              Customize
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Management Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 font-sans text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cookie & Tracking Preferences</h3>
                  <p className="text-[11px] text-slate-500">Configure how MindFlow AI stores data on your device</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPreferencesModal(false);
                  if (onCloseModal) onCloseModal();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Granular Categories */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Essential */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Strictly Necessary Cookies</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase font-mono">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Required for core authentication, session security, CSRF protection, and real-time Firestore synchronization. Cannot be turned off.
                  </p>
                </div>
                <div className="p-1 rounded bg-slate-200 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Analytics & Performance</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Collects aggregated metrics regarding canvas framerates and AI inference latency to prevent application slowdowns.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Functional */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Functional & Canvas Preferences</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Memorizes your active zoom level, pan position, default AI model selection, and collapsed sidebar states.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={functional}
                    onChange={(e) => setFunctional(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Feature Announcement Banners</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Controls dismiss states for new AI feature releases and product update tours.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {onNavigateToCookiePolicy ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowPreferencesModal(false);
                    if (onCloseModal) onCloseModal();
                    onNavigateToCookiePolicy();
                  }}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Read Full Cookie Policy
                </button>
              ) : <div />}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
