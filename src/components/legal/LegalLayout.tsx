import React, { useState, useEffect } from 'react';
import {
  LEGAL_DOCUMENTS,
  ALL_LEGAL_LINKS,
  LegalDocId,
  LegalDocument,
} from '../../data/legalData';
import { LegalDocumentView } from './LegalDocumentView';
import { LegalContactPage } from './LegalContactPage';
import { GlobalLegalFooter } from './GlobalLegalFooter';
import { CookieConsentBanner } from './CookieConsentBanner';
import {
  Sparkles,
  ArrowLeft,
  Printer,
  Share2,
  Check,
  Search,
  ChevronDown,
  Menu,
  X,
  Shield,
  FileText,
  Mail,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface LegalLayoutProps {
  initialDocId?: LegalDocId;
  onBackToApp?: () => void;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  initialDocId = 'privacy',
  onBackToApp,
}) => {
  const [activeDocId, setActiveDocId] = useState<LegalDocId>(initialDocId);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [searchTocQuery, setSearchTocQuery] = useState('');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);

  // Sync with browser URL / popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const matchingLink = ALL_LEGAL_LINKS.find((l) => l.route === path);
      if (matchingLink) {
        setActiveDocId(matchingLink.id as LegalDocId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToDoc = (docId: LegalDocId) => {
    setActiveDocId(docId);
    setIsMobileTocOpen(false);
    setIsDocDropdownOpen(false);
    setSearchTocQuery('');

    const targetLink = ALL_LEGAL_LINKS.find((l) => l.id === docId);
    if (targetLink) {
      window.history.pushState({}, '', targetLink.route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDoc: LegalDocument = LEGAL_DOCUMENTS[activeDocId] || LEGAL_DOCUMENTS.privacy;
  const Icon = currentDoc.icon;

  // Scrollspy observer for table of contents
  useEffect(() => {
    if (activeDocId === 'contact') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0.1 }
    );

    (currentDoc?.sections || []).forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeDocId, currentDoc]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredSections = (currentDoc?.sections || []).filter((s) => {
    if (!searchTocQuery) return true;
    const q = searchTocQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.content || []).some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToApp || (() => navigateToDoc('privacy'))}
            className="flex items-center gap-2 group cursor-pointer"
            title="Return to MindFlow AI Workspace"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="font-display font-black text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>MindFlow</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono font-bold border border-indigo-200">
                AI
              </span>
            </div>
          </button>

          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline font-mono">
            Compliance & Legal
          </span>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Document Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">{currentDoc.title}</span>
              <span className="md:hidden">Policies</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDocDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono px-2 py-1 mb-1">
                  Legal Documents
                </div>
                <div className="space-y-0.5">
                  {ALL_LEGAL_LINKS.map((link) => {
                    const DocIcon = link.icon;
                    const isSelected = activeDocId === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => navigateToDoc(link.id as LegalDocId)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <DocIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{link.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Back to Workspace button */}
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to App</span>
              <span className="sm:hidden">App</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Document Header Hero */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-semibold">
                <Icon className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentDoc.badge}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                {currentDoc.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                {currentDoc.shortDescription}
              </p>

              {/* Version & Date Metadata */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                <div>
                  <span className="text-slate-400">Last Updated:</span>{' '}
                  <span className="font-bold text-slate-800">{currentDoc.lastUpdated}</span>
                </div>
                <span>•</span>
                <div>
                  <span className="text-slate-400">Version:</span>{' '}
                  <span className="font-semibold text-slate-700">{currentDoc.version}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap md:flex-col items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                title="Copy shareable link to this policy"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                title="Print or export to PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Collapsible TOC button */}
        {activeDocId !== 'contact' && (
          <div className="lg:hidden mb-6">
            <button
              type="button"
              onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Table of Contents ({currentDoc.sections.length} Sections)</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  isMobileTocOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMobileTocOpen && (
              <div className="mt-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-2 animate-in fade-in duration-150">
                {currentDoc.sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setIsMobileTocOpen(false)}
                    className="block text-xs font-medium text-slate-600 hover:text-indigo-600 py-1"
                  >
                    {sec.number ? `§ ${sec.number} — ` : ''}
                    {sec.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Table of Contents
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentDoc.sections.length} Sections
                </span>
              </div>

              {/* Search TOC */}
              {activeDocId !== 'contact' && currentDoc.sections.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTocQuery}
                    onChange={(e) => setSearchTocQuery(e.target.value)}
                    placeholder="Filter sections..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* TOC Section Links */}
              {activeDocId === 'contact' ? (
                <div className="space-y-2 text-xs text-slate-600">
                  <p>Official communication intake for regulatory, DMCA, and legal inquiries.</p>
                </div>
              ) : (
                <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                  {filteredSections.map((sec) => {
                    const isActive = activeSectionId === sec.id;
                    return (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {sec.number && (
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">
                            {sec.number}.
                          </span>
                        )}
                        <span className="truncate">{sec.title}</span>
                      </a>
                    );
                  })}
                </nav>
              )}

              {/* Quick Contact CTA in TOC */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigateToDoc('contact')}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Submit Legal Inquiry</span>
                </button>
              </div>
            </div>

            {/* Other Policies Switcher Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                Other Policies
              </span>
              <div className="space-y-1">
                {ALL_LEGAL_LINKS.filter((l) => l.id !== activeDocId)
                  .slice(0, 5)
                  .map((link) => {
                    const DocIcon = link.icon;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => navigateToDoc(link.id as LegalDocId)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                      >
                        <DocIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </aside>

          {/* Right Column: Main Legal Content */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
            {activeDocId === 'contact' ? (
              <LegalContactPage onNavigateToDoc={navigateToDoc} />
            ) : (
              <LegalDocumentView
                document={currentDoc}
                onNavigateToContact={() => navigateToDoc('contact')}
                onOpenCookiePreferences={() => setShowCookieModal(true)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Global Legal Footer */}
      <GlobalLegalFooter
        currentDocId={activeDocId}
        onNavigateLegal={navigateToDoc}
        onOpenCookiePreferences={() => setShowCookieModal(true)}
        onAdminLogin={() => {
          window.history.pushState({}, '', '/admin');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />

      {/* Interactive Cookie Consent Banner & Preferences Modal */}
      <CookieConsentBanner
        forceOpenModal={showCookieModal}
        onCloseModal={() => setShowCookieModal(false)}
        onNavigateToCookiePolicy={() => navigateToDoc('cookies')}
      />
    </div>
  );
};
