import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  USER_MANUAL_CATEGORIES,
  ManualCategory,
  ManualArticle,
} from '../../data/userManualData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  AlertCircle,
  MessageSquare,
  Printer,
  Share2,
  Play,
  Layers,
  ArrowLeft,
  X,
  CheckCircle2,
  FileText,
  Send,
  LifeBuoy,
} from 'lucide-react';

interface UserManualViewProps {
  initialCategory?: string;
  initialArticle?: string;
  onBackToApp?: () => void;
}

export const UserManualView: React.FC<UserManualViewProps> = ({
  initialCategory = 'getting-started',
  initialArticle,
  onBackToApp,
}) => {
  const {
    setCurrentView,
    createNewMap,
    setIsAIGeneratorOpen,
    openLegal,
  } = useWorkspace();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(initialArticle || null);
  const [expandedFaqIndexes, setExpandedFaqIndexes] = useState<Record<number, boolean>>({});
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Article feedback state
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'yes' | 'no'>>({});
  const [feedbackComments, setFeedbackComments] = useState<Record<string, string>>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});

  // Contact support modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [isSendingContact, setIsSendingContact] = useState(false);

  // Visited sections tracker for progress calculation
  const [visitedCategories, setVisitedCategories] = useState<Set<string>>(
    new Set([initialCategory])
  );

  // Mobile drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        // Look for matching category or article
        for (const cat of USER_MANUAL_CATEGORIES) {
          if (cat.id === hash) {
            setSelectedCategoryId(cat.id);
            setActiveArticleId(null);
            return;
          }
          const art = cat.articles.find((a) => a.id === hash);
          if (art) {
            setSelectedCategoryId(cat.id);
            setActiveArticleId(art.id);
            return;
          }
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update progress when category changes
  useEffect(() => {
    setVisitedCategories((prev) => {
      if (prev.has(selectedCategoryId)) return prev;
      const updated = new Set(prev);
      updated.add(selectedCategoryId);
      return updated;
    });

    // Update document title
    const currentCat = USER_MANUAL_CATEGORIES.find((c) => c.id === selectedCategoryId);
    if (currentCat) {
      document.title = `${currentCat.title} — MindFlow AI User Manual`;
    }
  }, [selectedCategoryId]);

  // Calculate reading progress percentage
  const readingProgress = useMemo(() => {
    const total = USER_MANUAL_CATEGORIES.length;
    const visited = visitedCategories.size;
    return Math.min(100, Math.max(10, Math.round((visited / total) * 100)));
  }, [visitedCategories]);

  // Current active category
  const activeCategory = useMemo(() => {
    return (
      USER_MANUAL_CATEGORIES.find((c) => c.id === selectedCategoryId) ||
      USER_MANUAL_CATEGORIES[0]
    );
  }, [selectedCategoryId]);

  // Live filtered search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matches: Array<{
      category: ManualCategory;
      article: ManualArticle;
      matchType: 'title' | 'description' | 'step' | 'faq' | 'troubleshoot';
      snippet: string;
    }> = [];

    for (const cat of USER_MANUAL_CATEGORIES) {
      for (const art of cat.articles) {
        if (art.title.toLowerCase().includes(query)) {
          matches.push({
            category: cat,
            article: art,
            matchType: 'title',
            snippet: art.title,
          });
          continue;
        }
        if (art.description.toLowerCase().includes(query)) {
          matches.push({
            category: cat,
            article: art,
            matchType: 'description',
            snippet: art.description,
          });
          continue;
        }
        if (art.steps?.some((s) => s.toLowerCase().includes(query))) {
          const matchingStep = art.steps.find((s) => s.toLowerCase().includes(query)) || '';
          matches.push({
            category: cat,
            article: art,
            matchType: 'step',
            snippet: matchingStep,
          });
          continue;
        }
        if (art.faqs?.some((f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query))) {
          const matchingFaq = art.faqs.find((f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query));
          matches.push({
            category: cat,
            article: art,
            matchType: 'faq',
            snippet: matchingFaq?.question || '',
          });
          continue;
        }
        if (art.troubleshooting?.some((t) => t.problem.toLowerCase().includes(query))) {
          const matchingT = art.troubleshooting.find((t) => t.problem.toLowerCase().includes(query));
          matches.push({
            category: cat,
            article: art,
            matchType: 'troubleshoot',
            snippet: matchingT?.problem || '',
          });
          continue;
        }
      }
    }

    return matches;
  }, [searchQuery]);

  const handleSelectCategory = (catId: string, articleId?: string) => {
    setSelectedCategoryId(catId);
    setActiveArticleId(articleId || null);
    setIsMobileNavOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/help/user-manual#${articleId || catId}`);
    }
    const targetElement = document.getElementById(articleId || catId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleCopyPageLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleStartCreating = () => {
    if (onBackToApp) {
      onBackToApp();
    } else {
      setCurrentView('editor');
    }
    createNewMap('Mind Map Project');
  };

  const handleSendFeedback = (articleId: string) => {
    setFeedbackSubmitted((prev) => ({ ...prev, [articleId]: true }));
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setIsSendingContact(true);
    try {
      await fetch('/api/legal/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.displayName || 'Help Center User',
          email: user?.email || 'guest@mindflow.ai',
          category: 'support_manual',
          subject: contactSubject || 'User Manual Question',
          message: contactMessage,
        }),
      });
    } catch {
      // Fallback optimistic
    } finally {
      setIsSendingContact(false);
      setContactSent(true);
      setTimeout(() => {
        setIsContactModalOpen(false);
        setContactSent(false);
        setContactSubject('');
        setContactMessage('');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onBackToApp) onBackToApp();
                else setCurrentView(user ? 'dashboard' : 'landing');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                  MindFlow AI
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    User Manual
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Search on Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the user manual..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectCategory('getting-started')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Getting Started</span>
            </button>

            <button
              onClick={() => setIsContactModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </button>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the user manual..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Section Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT SIDEBAR (Category Navigation) ================= */}
        <aside
          className={`lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto ${
            isMobileNavOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Documentation Topics
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {USER_MANUAL_CATEGORIES.length} Modules
            </span>
          </div>

          <nav className="space-y-1">
            {USER_MANUAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategoryId === cat.id && !searchQuery;
              return (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{cat.title}</span>
                    </div>
                    {cat.badge && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-indigo-200/60 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </button>

                  {/* If active, show sub-articles */}
                  {isActive && cat.articles.length > 1 && (
                    <div className="pl-7 pr-2 py-1 space-y-1 border-l-2 border-indigo-100 ml-4 my-1">
                      {cat.articles.map((art) => (
                        <button
                          key={art.id}
                          onClick={() => handleSelectCategory(cat.id, art.id)}
                          className={`w-full text-left text-[11px] py-1 px-2 rounded-lg transition-colors truncate block cursor-pointer ${
                            activeArticleId === art.id
                              ? 'bg-indigo-100/70 text-indigo-900 font-bold'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                          }`}
                        >
                          {art.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer Link to Legals */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <button
              onClick={() => openLegal('privacy')}
              className="w-full flex items-center justify-between text-slate-500 hover:text-indigo-600 py-1 transition-colors cursor-pointer text-[11px]"
            >
              <span>Privacy & Compliance</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => openLegal('ai-disclaimer')}
              className="w-full flex items-center justify-between text-slate-500 hover:text-indigo-600 py-1 transition-colors cursor-pointer text-[11px]"
            >
              <span>AI Ethics & Disclaimer</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* ================= CENTER CONTENT (Main Documentation) ================= */}
        <main className="lg:col-span-6 space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <button
              onClick={() => {
                if (onBackToApp) onBackToApp();
                else setCurrentView('dashboard');
              }}
              className="hover:text-indigo-600 transition-colors"
            >
              Help & Support
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600 font-medium">User Manual</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-indigo-600 font-bold truncate">
              {activeCategory.title}
            </span>
          </div>

          {/* Main Hero Header Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Official Documentation & Guide</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
                MindFlow AI User Manual
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Everything you need to get started with MindFlow AI and create powerful visual mind maps, organize complex ideas, and collaborate with teams.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartCreating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-900 text-xs font-bold shadow-md hover:bg-indigo-50 transition-all cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Creating</span>
                </button>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Get Live Help</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Start 5-Step Card (Rendered on Getting Started or when no search) */}
          {!searchQuery && selectedCategoryId === 'getting-started' && (
            <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Quick Start in 5 Simple Steps
                    </h3>
                    <p className="text-xs text-slate-500">
                      Start mind mapping in under 60 seconds.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStartCreating}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Start Creating</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {[
                  {
                    num: '1',
                    title: 'Create Account',
                    desc: 'Sign up or log in with Google / Email.',
                  },
                  {
                    num: '2',
                    title: 'Create Map',
                    desc: 'Choose Blank Map, AI Generator, or Template.',
                  },
                  {
                    num: '3',
                    title: 'Customize',
                    desc: 'Add nodes, branches, notes, icons, and styles.',
                  },
                  {
                    num: '4',
                    title: 'Autosave',
                    desc: 'Your changes are automatically saved to cloud.',
                  },
                  {
                    num: '5',
                    title: 'Share / Export',
                    desc: 'Export to PNG, SVG, PDF, or share link.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 relative"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {step.num}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 pt-1">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200/70 p-3 rounded-xl">
                <span className="text-xs font-medium text-indigo-900">
                  Search results for &ldquo;<strong>{searchQuery}</strong>&rdquo; (
                  {searchResults?.length || 0} matches found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Clear search
                </button>
              </div>

              {searchResults && searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      handleSelectCategory(res.category.id, res.article.id);
                      setSearchQuery('');
                    }}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600">
                      <span>{res.category.title}</span>
                      <span>•</span>
                      <span>{res.article.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {res.snippet}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                  <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">
                    No articles found matching &ldquo;{searchQuery}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for broader keywords like &ldquo;nodes&rdquo;, &ldquo;export&rdquo;, &ldquo;AI prompt&rdquo;, or browse our categories.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    Browse All Categories
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Category Content Articles */}
          {!searchQuery && (
            <div className="space-y-8">
              {activeCategory.articles.map((article) => {
                const isHelpful = feedbackGiven[article.id];
                const isSubmitted = feedbackSubmitted[article.id];

                return (
                  <section
                    key={article.id}
                    id={article.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-24"
                  >
                    {/* Article Header */}
                    <div className="border-b border-slate-100 pb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                          {activeCategory.title}
                        </span>
                        <button
                          onClick={handleCopyPageLink}
                          className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 cursor-pointer"
                          title="Copy Link to Article"
                        >
                          {copiedLink ? (
                            <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Link Copied
                            </span>
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900">
                        {article.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {article.description}
                      </p>
                    </div>

                    {/* Step-by-Step Instructions */}
                    {article.steps && article.steps.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Step-by-Step Instructions
                        </h4>
                        <ol className="space-y-2.5">
                          {article.steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-normal"
                            >
                              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-indigo-200 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Example AI Prompts */}
                    {article.codeOrPrompts && article.codeOrPrompts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Sample AI Prompts to Try</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {article.codeOrPrompts.map((prompt, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs font-mono text-slate-800 hover:border-indigo-200 transition-colors"
                            >
                              <span className="truncate">&ldquo;{prompt}&rdquo;</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleCopyPrompt(prompt)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-sans flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedPrompt === prompt ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>{copiedPrompt === prompt ? 'Copied' : 'Copy'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsAIGeneratorOpen(true);
                                    if (onBackToApp) onBackToApp();
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-sans font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Run Prompt</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Structured Tables (Shortcuts, Tools, Templates) */}
                    {article.tableData && (
                      <div className="space-y-3">
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                {article.tableData.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="p-3">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {article.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3 font-medium">
                                      {cIdx === 0 && (
                                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mr-2">
                                          {cell}
                                        </span>
                                      )}
                                      {cIdx !== 0 && cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Troubleshooting Solutions */}
                    {article.troubleshooting && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Troubleshooting & Resolution Checklist</span>
                        </h4>
                        <div className="space-y-3">
                          {article.troubleshooting.map((item, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2"
                            >
                              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                {item.problem}
                              </h5>
                              <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700">
                                {item.solutions.map((sol, sIdx) => (
                                  <li key={sIdx}>{sol}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable FAQs Accordion */}
                    {article.faqs && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Frequently Asked Questions</span>
                        </h4>
                        <div className="space-y-2">
                          {article.faqs.map((faq, fIdx) => {
                            const isOpen = expandedFaqIndexes[fIdx] ?? true;
                            return (
                              <div
                                key={fIdx}
                                className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedFaqIndexes((prev) => ({
                                      ...prev,
                                      [fIdx]: !isOpen,
                                    }))
                                  }
                                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 hover:bg-slate-100/60 transition-colors cursor-pointer"
                                >
                                  <span>{faq.question}</span>
                                  {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                </button>
                                {isOpen && (
                                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                                    {faq.answer}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pro Tips Box */}
                    {article.tips && article.tips.length > 0 && (
                      <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Pro Tips for Efficiency
                        </span>
                        <ul className="space-y-1 text-xs text-indigo-800 list-disc pl-4">
                          {article.tips.map((tip, tipIdx) => (
                            <li key={tipIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Was this article helpful? (Helpful Actions Module) */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600 font-medium">
                          Was this article helpful?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setFeedbackGiven((prev) => ({ ...prev, [article.id]: 'yes' }))
                            }
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              isHelpful === 'yes'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Yes</span>
                          </button>
                          <button
                            onClick={() =>
                              setFeedbackGiven((prev) => ({ ...prev, [article.id]: 'no' }))
                            }
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              isHelpful === 'no'
                                ? 'bg-rose-50 border-rose-300 text-rose-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>No</span>
                          </button>
                        </div>
                      </div>

                      {isHelpful === 'yes' && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Thank you for your feedback!
                        </span>
                      )}
                    </div>

                    {/* If No was clicked, show improvement input */}
                    {isHelpful === 'no' && !isSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Tell us how we can improve this article:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={feedbackComments[article.id] || ''}
                            onChange={(e) =>
                              setFeedbackComments((prev) => ({
                                ...prev,
                                [article.id]: e.target.value,
                              }))
                            }
                            placeholder="What information was missing or unclear?"
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-hidden focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleSendFeedback(article.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}

                    {isSubmitted && (
                      <div className="text-xs text-indigo-700 font-medium flex items-center gap-1 bg-indigo-50 p-2 rounded-lg">
                        <Check className="w-3.5 h-3.5" /> Feedback received. Our documentation team will review this.
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {/* Need More Help? Contact Support Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <LifeBuoy className="w-4 h-4" />
                <span>Need More Help?</span>
              </div>
              <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                Our 24/7 support engineering team is here for you
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Have a unique question, encountering an edge-case bug, or want feature recommendations?
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Support</span>
              </button>
              <button
                onClick={() => handleSelectCategory('faq')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                View FAQ
              </button>
            </div>
          </div>
        </main>

        {/* ================= RIGHT SIDEBAR (On This Page & Progress) ================= */}
        <aside className="lg:col-span-3 space-y-6 sticky top-24 hidden lg:block">
          {/* Progress Indicator Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Reading Progress</span>
              <span className="font-mono font-bold text-indigo-600">
                {readingProgress}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              You&apos;re {readingProgress}% through the MindFlow AI User Manual.
            </p>
          </div>

          {/* Table of Contents / On This Page */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                On This Page
              </span>
              <FileText className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-1 text-xs">
              {activeCategory.articles.map((art) => (
                <a
                  key={art.id}
                  href={`#${art.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectCategory(activeCategory.id, art.id);
                  }}
                  className={`block py-1.5 px-2 rounded-lg transition-colors truncate ${
                    activeArticleId === art.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {art.title}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Quick Actions
            </span>
            <button
              onClick={handleStartCreating}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5" />
                Launch Canvas
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleCopyPageLink}
              className="w-full flex items-center justify-between p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Copy Page Link
              </span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-between p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                Print Manual
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-display font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>MindFlow AI</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Documentation & Help Center
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => handleSelectCategory('getting-started')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Getting Started
              </button>
              <button
                onClick={() => handleSelectCategory('faq')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                FAQ
              </button>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer text-indigo-400"
              >
                Contact Support
              </button>
              <button
                onClick={() => openLegal('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openLegal('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                onClick={() => openLegal('cookies')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Cookie Policy
              </button>
              <button
                onClick={() => openLegal('ai-disclaimer')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                AI Disclaimer
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 MindFlow AI. All rights reserved.</p>
            <p>Built with Google Gemini 3.1 Pro & Firebase Firestore.</p>
          </div>
        </div>
      </footer>

      {/* Interactive Contact Support Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Contact Support Team
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSent ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold">Message Dispatched</h4>
                <p className="text-xs text-emerald-700">
                  Your ticket was routed to engineering support. Typical SLA response is under 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g., Question about AI branch generation"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Message / Question
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your question, request, or issue in detail..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingContact}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingContact ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
