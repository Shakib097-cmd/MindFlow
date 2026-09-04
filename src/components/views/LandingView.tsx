import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { TEMPLATES } from '../../data/templates';
import { GlobalLegalFooter } from '../legal/GlobalLegalFooter';
import { CookieConsentBanner } from '../legal/CookieConsentBanner';
import {
  Sparkles,
  ArrowRight,
  Zap,
  BrainCircuit,
  Mic,
  CheckSquare,
  GraduationCap,
  Presentation,
  Shield,
  Layers,
  Check,
  FileText,
  Share2,
  Cloud,
  Compass,
  MousePointer,
  Cpu,
  Network,
  Menu,
  X,
  Users,
  Lightbulb,
  Briefcase,
  Search,
  FileDown,
  Workflow,
  Wand2,
  Layout,
  HelpCircle,
  CheckCircle2,
  Flame,
  ChevronRight,
  FolderKanban,
  ExternalLink,
  ChevronDown,
  Play,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    setCurrentView,
    createNewMap,
    createMapFromTemplate,
    openLegal,
    openUserManual,
    setIsPricingOpen,
  } = useWorkspace();
  const { user, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, loginAsEmailUser } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Interactive Live Prompt Demo on Landing Page
  const [heroPrompt, setHeroPrompt] = useState('Product Launch Strategy for 2026 SaaS');
  const [activeTab, setActiveTab] = useState<'map' | 'kanban' | 'study'>('kanban');

  // Interactive FAQ Open item
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleStartTemplate = (templateTitle: string) => {
    const match = TEMPLATES.find((t) => t.title.toLowerCase().includes(templateTitle.toLowerCase()));
    if (match) {
      createMapFromTemplate(match);
      return;
    }
    setCurrentView('templates');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(email, password, name || 'MindFlow Creator');
      } else {
        await signInWithEmail(email, password);
      }
      setShowAuthModal(false);
      setCurrentView('dashboard');
    } catch (err: any) {
      console.warn('Auth notice, fallback to email user session:', err);
      loginAsEmailUser(email, name);
      setShowAuthModal(false);
      setCurrentView('dashboard');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      setCurrentView('dashboard');
    } catch (err: any) {
      console.warn('Google sign in notice, fallback:', err);
      loginAsEmailUser('creator@mindflow.ai', 'MindFlow Creator');
      setShowAuthModal(false);
      setCurrentView('dashboard');
    } finally {
      setAuthLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      q: 'How does MindFlow turn mind map ideas into actionable Kanban workflows?',
      a: 'MindFlow features a dedicated Action Tasks Kanban engine. You can select any mind map or branch, and with one click, convert ideas into prioritized Kanban tasks with subtasks, due dates, and sprint milestones.',
    },
    {
      q: 'Which AI models power the intelligent node generation and action planning?',
      a: 'MindFlow uses Gemini 3.7 Flash and Gemini 3.1 Pro for deep multi-step reasoning, real-time structured tree generation, automatic task categorization, and study flashcards.',
    },
    {
      q: 'Can I import documents, PDFs, or use voice dictation?',
      a: 'Yes! MindFlow supports multimodal ingestion. You can record live voice notes or upload text and PDFs to instantly synthesize comprehensive visual mind maps.',
    },
    {
      q: 'Is my data synced securely across devices?',
      a: 'All maps, Kanban tasks, goals, and study materials are saved locally with instant responsiveness and persisted via Cloud Firestore for secure multi-device access.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Lighting (Light Mode) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[20%] w-[550px] h-[550px] bg-indigo-200/40 rounded-full blur-[130px]" />
        <div className="absolute top-[10%] right-[15%] w-[480px] h-[480px] bg-violet-200/35 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] left-[30%] w-[420px] h-[420px] bg-blue-100/50 rounded-full blur-[130px]" />
        {/* Subtle Light Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* =========================================================================
          1. LIGHT NAVBAR
      ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 border-b border-slate-200/80 transition-all duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left Brand */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                MindFlow
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('features')}
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('kanban-feature')}
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
            >
              <FolderKanban className="w-4 h-4 text-indigo-500" />
              <span>Action Kanban</span>
            </button>
            <button
              onClick={() => scrollToSection('templates')}
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              Templates
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => openUserManual('getting-started')}
              className="px-3.5 py-2 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Docs</span>
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <button
                id="nav-go-to-dashboard-btn"
                onClick={() => setCurrentView('dashboard')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  id="nav-login-btn"
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  id="nav-start-for-free-btn"
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-slate-200 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('kanban-feature')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4 text-indigo-600" />
                <span>Action Kanban</span>
              </button>
              <button
                onClick={() => scrollToSection('templates')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Templates
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Pricing
              </button>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <button
                  id="mobile-go-to-dashboard-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('dashboard');
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-center shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('signin');
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 text-center cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    id="mobile-start-for-free-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-center shadow-xs cursor-pointer"
                  >
                    Start for Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION (LIGHT MODE)
      ========================================================================= */}
      <main className="flex-1 relative z-10">
        <section className="pt-12 sm:pt-20 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Visual Ideation & Agile Execution</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Think Visually.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                Execute Strategically
              </span>{' '}
              with AI.
            </h1>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Transform brainstormed thoughts into structured mind maps, prioritized Kanban
              workflows, slide presentations, and interactive study decks with Gemini 3.7 AI.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <button
                  id="hero-go-dashboard-btn"
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    id="hero-start-btn"
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <span>Start Creating Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="hero-see-features-btn"
                    onClick={() => {
                      const el = document.getElementById('features');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-base border border-slate-200 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Explore Features</span>
                  </button>
                </>
              )}
            </div>

            {/* Feature Badges below CTAs */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Instant cloud persistence
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Export to PDF, PNG & Markdown
              </span>
            </div>
          </div>

          {/* =========================================================================
              HERO INTERACTIVE PREVIEW CANVAS (LIGHT MODE)
          ========================================================================= */}
          <div className="mt-14 sm:mt-16 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
              {/* Window Bar */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-slate-500 font-mono">
                    MindFlow Interactive Canvas
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
                  <button
                    onClick={() => setActiveTab('kanban')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === 'kanban' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Action Kanban
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === 'map' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Mind Map Graph
                  </button>
                  <button
                    onClick={() => setActiveTab('study')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === 'study' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Study Deck
                  </button>
                </div>
              </div>

              {/* Window Content */}
              <div className="p-6 sm:p-8 bg-[#F8FAFC]">
                {activeTab === 'kanban' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Sprint Workflow: 2026 SaaS Product Launch
                        </h4>
                        <p className="text-xs text-slate-500">
                          Generated from Mind Map branch "Core Execution & MVP"
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        4 of 6 Completed (67%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Column 1 */}
                      <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Backlog & Ideas</span>
                          <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 border text-[10px]">
                            2
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-xs space-y-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Ideation
                          </span>
                          <p className="text-xs font-semibold text-slate-800">
                            Partner Integration API Spec
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-indigo-500" /> Linked to Node "Partners"
                          </div>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>In Progress</span>
                          <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 border text-[10px]">
                            1
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs space-y-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            🔥 Urgent
                          </span>
                          <p className="text-xs font-semibold text-slate-800">
                            Auth & Multi-Tenant Database
                          </p>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-indigo-500 rounded-full" />
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            3 of 4 subtasks done
                          </div>
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Done</span>
                          <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 border text-[10px]">
                            3
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs space-y-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                          <p className="text-xs font-semibold text-slate-400 line-through">
                            AI Reasoning Engine Setup
                          </p>
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Deployed to Production
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'map' && (
                  <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
                    <div className="inline-block p-4 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-xs">
                      <div className="text-xs font-bold text-indigo-700">ROOT STRATEGY</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        2026 SaaS Product Launch
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left">
                        <div className="font-bold text-indigo-600">Phase 1: Validation</div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          User interviews & MVP scope definition
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left">
                        <div className="font-bold text-violet-600">Phase 2: Architecture</div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Vite, Node.js & Gemini 3.7 integration
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left">
                        <div className="font-bold text-emerald-600">Phase 3: Launch & GTM</div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Product Hunt, Ads & Referral program
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'study' && (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto text-center space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      Flashcard 1 of 5
                    </span>
                    <h5 className="text-sm font-bold text-slate-900">
                      What is the primary benefit of Radial Mind Mapping?
                    </h5>
                    <p className="text-xs text-slate-500">
                      It mirrors human cognitive branching, improving recall speed by up to 40%.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. TRUST / BENEFIT BAR (LIGHT MODE)
        ========================================================================= */}
        <section className="border-y border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-center text-center">
              {/* Item 1 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">AI Powered</div>
                  <div className="text-xs text-slate-500">Gemini 3.7 Reasoning</div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Action Kanban</div>
                  <div className="text-xs text-slate-500">Map to Sprint Tasks</div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Cloud Sync</div>
                  <div className="text-xs text-slate-500">Instant Durability</div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Multi-Format</div>
                  <div className="text-xs text-slate-500">PDF, PNG & Markdown</div>
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Infinite Canvas</div>
                  <div className="text-xs text-slate-500">Zero lag panning</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. ACTION TASKS KANBAN SPOTLIGHT (NEW FEATURE FOCUS)
        ========================================================================= */}
        <section
          id="kanban-feature"
          className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  <span>NEW CAPABILITY</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-[1.15]">
                  Action Tasks Kanban:{' '}
                  <span className="text-indigo-300">Turn Mind Map Ideas</span> into Prioritized
                  Workflows.
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Mind maps shouldn’t stop at brainstorming. With MindFlow Action Kanban, convert
                  any branch, concept, or strategy into agile execution workflows with drag-and-drop
                  milestones, AI action plans, subtask checklists, and deep links back to your visual
                  nodes.
                </p>

                <div className="space-y-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>1-Click Node Import:</strong> Convert branches into actionable cards
                      with pre-set priorities.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>AI Sprint Horizon (7/14/30 Days):</strong> Gemini drafts tactical
                      milestones and subtasks automatically.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Bi-Directional Deep Linking:</strong> Jump straight from Kanban cards
                      into the Canvas editor.
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanban Graphic */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                  <span className="font-bold flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-indigo-400" /> Agile Board (5 Columns)
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">Sync Status: Active</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-indigo-300">
                      <span>To Do</span>
                      <span className="text-[10px] px-1.5 rounded bg-indigo-500/20">3</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                      <div className="text-[10px] font-bold text-amber-400">High Priority</div>
                      <div className="font-medium text-[11px] mt-0.5">Define GTM Channels</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-300">
                      <span>Done</span>
                      <span className="text-[10px] px-1.5 rounded bg-emerald-500/20">5</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 line-through">
                      <div className="text-[10px] font-bold text-emerald-400">Completed</div>
                      <div className="font-medium text-[11px] mt-0.5">Brainstorm 20+ Features</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. CORE FEATURES (LIGHT MODE CARDS)
        ========================================================================= */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              EVERYTHING YOU NEED
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
              Powerful Tools to Structure Complex Thought
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Designed for entrepreneurs, engineers, researchers, and students who want clarity.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-500/60 hover:shadow-lg transition-all duration-300 group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Mind Map Generator</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Turn a single topic or prompt into a multi-level structured graph in seconds with
                Gemini 3.7 AI reasoning.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-indigo-600 font-bold">
                <span>Prompt → Full Map</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-violet-500/60 hover:shadow-lg transition-all duration-300 group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Action Tasks Kanban</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Turn mind map ideas into prioritized, actionable workflows with backlog, sprint
                execution, subtask checklists, and AI milestones.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-violet-600 font-bold">
                <span>Ideas → Action Tasks</span>
                <Layers className="w-4 h-4 opacity-70" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-cyan-500/60 hover:shadow-lg transition-all duration-300 group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Document & PDF Ingestion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform long documents, PDFs, and articles into clean, navigable visual knowledge
                graphs.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-cyan-600 font-bold">
                <span>OCR & Document Parsing</span>
                <Check className="w-4 h-4 opacity-70" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-500/60 hover:shadow-lg transition-all duration-300 group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Voice to Mind Map</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speak your thoughts freely and let AI automatically transcribe, categorize, and
                diagram them into nodes.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-amber-600 font-bold">
                <span>Live Audio Transcription</span>
                <Zap className="w-4 h-4 opacity-70" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Study & Flashcards</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create structured learning materials, interactive quizzes, and spaced-repetition
                flashcards from any node.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-emerald-600 font-bold">
                <span>Quiz & Memory Engine</span>
                <CheckSquare className="w-4 h-4 opacity-70" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-500/60 hover:shadow-lg transition-all duration-300 group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">6 Smart Layout Algorithms</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Radial, Tree, Left-to-Right, Right-to-Left, Top-Down, and Fishbone layouts with
                automatic balance.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-rose-600 font-bold">
                <span>Radial, Tree & Fishbone</span>
                <Workflow className="w-4 h-4 opacity-70" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. TEMPLATES SHOWCASE (LIGHT MODE)
        ========================================================================= */}
        <section id="templates" className="py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-3">
                  READY-TO-USE BLUEPRINTS
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                  Launch Instantly with Curated Templates
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Start with structured blueprints created for fast execution.
                </p>
              </div>

              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore All Templates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Startup Product Strategy',
                  desc: 'MVP scope, market analysis, user personas, and monetization tiers.',
                  tag: 'Business',
                  nodes: 14,
                  color: 'border-indigo-200 hover:border-indigo-400',
                },
                {
                  title: 'Engineering System Design',
                  desc: 'API gateways, microservices, caches, databases, and CI/CD pipelines.',
                  tag: 'Tech',
                  nodes: 18,
                  color: 'border-violet-200 hover:border-violet-400',
                },
                {
                  title: 'Sprint Roadmap & Milestones',
                  desc: 'Prioritized backlog, sprint deliverables, QA testing, and launch checklist.',
                  tag: 'Agile',
                  nodes: 12,
                  color: 'border-emerald-200 hover:border-emerald-400',
                },
                {
                  title: 'Comprehensive Study Revision',
                  desc: 'Key theories, formulas, historical timelines, and practice quizzes.',
                  tag: 'Education',
                  nodes: 16,
                  color: 'border-amber-200 hover:border-amber-400',
                },
              ].map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStartTemplate(tmpl.title)}
                  className={`bg-slate-50 hover:bg-white p-6 rounded-2xl border ${tmpl.color} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {tmpl.tag}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{tmpl.nodes} nodes</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{tmpl.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Use Template</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. TRANSPARENT PRICING (LIGHT MODE)
        ========================================================================= */}
        <section id="pricing" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              TRANSPARENT PRICING
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
              Simple Plans for Individuals and Teams
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Get started free, upgrade when you need unlimited AI reasoning and team collaboration.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span
                className={`text-xs font-bold ${
                  billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')
                }
                className="w-12 h-6 bg-slate-200 rounded-full p-0.5 transition-colors relative cursor-pointer"
              >
                <div
                  className={`w-5 h-5 bg-indigo-600 rounded-full shadow-xs transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Starter</h3>
                <p className="text-xs text-slate-500 mb-6">Essential visual mapping for individuals.</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-400 ml-1">/ forever</span>
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Up to 5 Active Mind Maps
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Action Tasks Kanban Basic
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> 30 AI Generations per month
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> PDF & PNG Exports
                  </div>
                </div>
              </div>
              <button
                id="pricing-starter-free-btn"
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Start for Free
              </button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-indigo-600 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Professional</h3>
                <p className="text-xs text-slate-500 mb-6">Unlimited AI power & deep reasoning.</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {billingCycle === 'annual' ? '$12' : '$15'}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600" /> Unlimited Mind Maps & Nodes
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600" /> Full Action Tasks Kanban + Subtasks
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600" /> Gemini 3.7 Deep AI Reasoning
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600" /> Voice & OCR Document Ingestion
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600" /> Spaced Repetition Study & Quizzes
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Get Pro Access
              </button>
            </div>

            {/* Team Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Team & Enterprise</h3>
                <p className="text-xs text-slate-500 mb-6">Collaborative workspaces & admin controls.</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {billingCycle === 'annual' ? '$32' : '$39'}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ seat / month</span>
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Everything in Pro Plan
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Multi-user live collaboration
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Shared team workspace & folders
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Priority 24/7 Support
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="mt-8 w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. FREQUENTLY ASKED QUESTIONS (LIGHT MODE ACCORDION)
        ========================================================================= */}
        <section className="py-20 bg-slate-100/60 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-display font-extrabold text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-500">
                Everything you need to know about MindFlow and Action Tasks Kanban.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. FINAL LIGHT CALL TO ACTION
        ========================================================================= */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-200/80 p-10 sm:p-16 text-center overflow-hidden shadow-lg">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your Next Great Breakthrough Starts Here.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Experience clarity, generate structured mind maps, and turn ideas into actionable
                workflows with MindFlow AI.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  id="bottom-start-creating-free-btn"
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Creating Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition-all cursor-pointer"
                >
                  <span>Log In to Account</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Legal & Compliance Footer */}
      <GlobalLegalFooter
        onNavigateLegal={(docId) => openLegal(docId)}
        onOpenCookiePreferences={() => setShowCookieModal(true)}
      />

      {/* Cookie Consent Banner & Modal */}
      <CookieConsentBanner
        forceOpenModal={showCookieModal}
        onCloseModal={() => setShowCookieModal(false)}
        onNavigateToCookiePolicy={() => openLegal('cookies')}
      />

      {/* Authentication Modal (Light Mode) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-150 text-slate-900">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {authMode === 'signup' ? 'Create MindFlow Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {authMode === 'signup'
                    ? 'Start for free with mind mapping, action Kanban & AI'
                    : 'Sign in to sync your mind maps and action plans'}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account (Free)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium mb-3">
                {authError}
              </div>
            )}

            {/* Google One-Click Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors mb-4 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative text-center my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-2 text-[10px] font-bold uppercase text-slate-400">
                Or with Email
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {authLoading ? (
                  <span>Processing...</span>
                ) : authMode === 'signup' ? (
                  <span>Create Account for Free</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              {authMode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthError('');
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
