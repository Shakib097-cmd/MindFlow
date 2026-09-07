import React from 'react';
import { ALL_LEGAL_LINKS, LegalDocId } from '../../data/legalData';
import { Sparkles, ShieldCheck, Lock, ExternalLink, BookOpen } from 'lucide-react';

interface GlobalLegalFooterProps {
  onNavigateLegal?: (docId: LegalDocId) => void;
  onOpenCookiePreferences?: () => void;
  onAdminLogin?: () => void;
  currentDocId?: LegalDocId;
}

export const GlobalLegalFooter: React.FC<GlobalLegalFooterProps> = ({
  onNavigateLegal,
  onOpenCookiePreferences,
  onAdminLogin,
  currentDocId,
}) => {
  const handleLinkClick = (e: React.MouseEvent, docId: LegalDocId, route: string) => {
    e.preventDefault();
    if (onNavigateLegal) {
      onNavigateLegal(docId);
    } else {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 selection:bg-indigo-900 selection:text-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top brand and security trust row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>MindFlow AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-mono border border-slate-700">
                Legal & Compliance Hub
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md">
              AI-driven visual thought architecture. Built with zero-retention enterprise inference and multi-tenant Firestore security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 & AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>GDPR & CCPA Aligned</span>
            </div>
          </div>
        </div>

        {/* Legal Grid Links */}
        <div className="py-8">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-4 font-mono">
            Compliance & Legal Documents
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <a
              id="footer-user-manual-link"
              href="/help/user-manual"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/help/user-manual');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="flex items-center gap-2 p-2 rounded-lg text-xs transition-colors bg-indigo-950/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60 border border-indigo-800/40 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span className="truncate">User Manual</span>
            </a>
            {ALL_LEGAL_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = currentDocId === link.id;
              return (
                <a
                  key={link.id}
                  href={link.route}
                  onClick={(e) => handleLinkClick(e, link.id as LegalDocId, link.route)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom bar & disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} MindFlow AI Inc. All rights reserved. Registered trademark.
          </p>

          <div className="flex items-center gap-4">
            {onOpenCookiePreferences && (
              <button
                type="button"
                onClick={onOpenCookiePreferences}
                className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Manage Cookie Preferences
              </button>
            )}
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => {
                if (onAdminLogin) {
                  onAdminLogin();
                } else {
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
              title="Restricted Administrator Portal"
            >
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Admin Login</span>
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">
              Last Regulatory Audit: Sept 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
