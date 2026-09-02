import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Zap,
  BrainCircuit,
  Mic,
  CheckSquare,
  Target,
  GraduationCap,
  Presentation,
  Shield,
  Star,
  Layers,
  ChevronRight,
  Play,
  Check,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentView, setIsAIGeneratorOpen, createNewMap } = useWorkspace();
  const { loginAsGuest, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleGuestDemo = () => {
    loginAsGuest();
    setCurrentView('dashboard');
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
      setAuthError(err.message || 'Authentication error');
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
      setAuthError('Google sign in error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="font-display font-black text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>MindFlow</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono font-bold border border-indigo-200">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={handleGuestDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live Workspace</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 max-w-6xl mx-auto text-center space-y-8">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs">
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          <span>Next-Gen Gemini 3.1 Pro Thinking Mode & Realtime Canvas</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.1]">
          AI Workspace for Turning <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Ideas into Action
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Transform unstructured thoughts, voice notes, and documents into strategic mind maps. Then
          instantly convert those maps into <strong>actionable tasks, OKRs, slide decks, and study quizzes</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            id="hero-demo-cta"
            onClick={handleGuestDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Interactive Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 shadow-xs transition-colors"
          >
            Create Free Account
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            Full Gemini AI power
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            Instant live sync
          </span>
        </div>

        {/* Interactive Mind Map Visual Preview Graphic */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-bold text-slate-700">MindFlow AI — Live Strategy Canvas</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                12 Nodes • 4 Action Tasks • Auto-Arranged
              </span>
            </div>

            {/* Mind Map Demo Mock View */}
            <div className="relative min-h-[300px] bg-slate-50/60 rounded-2xl border border-slate-100 p-6 flex items-center justify-center">
              <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                {/* Central Node */}
                <div className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl shadow-xl font-bold text-sm tracking-tight text-center border-2 border-indigo-700">
                  <div>🚀 Product Launch 2025</div>
                  <span className="text-[10px] opacity-80">Central Strategy</span>
                </div>

                <div className="text-slate-300 font-bold text-lg hidden md:block">➔</div>

                {/* Sub branches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm text-left">
                    <div className="font-bold text-xs text-blue-900">1. Growth & Marketing</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automate viral loops & SEO</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm text-left">
                    <div className="font-bold text-xs text-emerald-900">2. Architecture & Cloud</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Firebase & Gemini Realtime</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm text-left">
                    <div className="font-bold text-xs text-amber-900">3. Action Tasks (Kanban)</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">4 items prioritized</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-sm text-left">
                    <div className="font-bold text-xs text-purple-900">4. Slide Deck Mode</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Executive Presentation ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Loop Section */}
      <section className="bg-white border-y border-slate-200/80 py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-slate-900">
              The Capture → Think → Map → Act → Track Loop
            </h2>
            <p className="text-sm text-slate-500">
              Unlike generic mind map tools, MindFlow AI drives complete end-to-end execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                <Mic className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                Step 1
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Capture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stream of consciousness, speech audio, or uploaded documents.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                Step 2
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Think</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gemini Pro Thinking Mode analyzes and organizes connections.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                Step 3
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Map</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Render interactive visual trees, radial graphs, and nodes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                Step 4
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Act</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Convert nodes into prioritized Kanban tasks and slide presentations.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Step 5
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Track</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Measure milestones, goal progress, and study retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-slate-900 text-white py-12 px-6 lg:px-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 font-display font-extrabold text-base mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>MindFlow AI Workspace</span>
            </div>
            <p className="text-xs text-slate-400">
              Built on Google AI Studio, Gemini 3.1 Pro & Firebase Firestore.
            </p>
          </div>

          <button
            onClick={handleGuestDemo}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Launch Free Sandbox
          </button>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {authMode === 'signup' ? 'Create MindFlow Account' : 'Welcome Back'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium mb-3">
                {authError}
              </div>
            )}

            {/* Google One-Click Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors mb-4"
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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                {authMode === 'signup' ? 'Sign Up Free' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              {authMode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signin')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign Up
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
