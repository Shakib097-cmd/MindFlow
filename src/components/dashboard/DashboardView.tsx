import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { TEMPLATES } from '../../data/templates';
import {
  Sparkles,
  Plus,
  Mic,
  Layers,
  CheckSquare,
  Target,
  Clock,
  Star,
  MoreVertical,
  ArrowRight,
  FolderTree,
  Trash2,
  ExternalLink,
  StickyNote,
  Search,
  X,
  LayoutGrid,
  List,
  Zap,
  Play,
  GraduationCap,
  ArrowUpRight,
  BookOpen,
  Crown,
  AlertCircle,
  BrainCircuit,
  Kanban,
  FileText,
  Wand2,
  Compass,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { AIUsageProgressBar } from '../common/AIUsageProgressBar';
import { QuickNotesFAB } from './QuickNotesFAB';
import { useEntitlement } from '../../hooks/useEntitlement';

type DashboardCategoryFilter = 'all' | 'core' | 'ai' | 'projects' | 'blueprints';

export const DashboardView: React.FC = () => {
  const {
    allMaps,
    allTasks,
    allGoals,
    quickNotes,
    openMap,
    createNewMap,
    createMapFromTemplate,
    deleteMap,
    toggleFavoriteMap,
    setCurrentView,
    setIsAIGeneratorOpen,
    setIsMultimodalOpen,
    setIsPricingOpen,
    setIsSettingsOpen,
    setIsQuickNotesOpen,
    usage,
    setIsCreditTopUpOpen,
  } = useWorkspace();

  const { profile } = useAuth();
  const [activeCategorySection, setActiveCategorySection] = useState<DashboardCategoryFilter>('all');
  const [selectedMapCategory, setSelectedMapCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'updated' | 'nodes' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuMapId, setActiveMenuMapId] = useState<string | null>(null);
  const [mapToDelete, setMapToDelete] = useState<{ id: string; title: string } | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close card options dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuMapId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuMapId(null);
        setMapToDelete(null);
      }
    };

    if (activeMenuMapId || mapToDelete) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuMapId, mapToDelete]);

  // Dynamic Entitlements via Hook
  const {
    canVoice,
    canDoc,
    canStudy,
    canPresentation,
    creditsBalance,
    monthlyCredits,
    creditsUsed,
    topupCredits,
    isZeroCredits,
  } = useEntitlement();

  const effectivePlan = profile?.plan || 'pro';
  const rawStatus = (profile as any)?.subscriptionStatus || 'active';
  const isSubscriptionActive = !['past_due', 'cancelled', 'expired'].includes(rawStatus);
  const statusLabel = isSubscriptionActive ? 'Active' : rawStatus.replace('_', ' ');

  // Format Renewal / Cycle Period End Date
  const renewalDateString = useMemo(() => {
    const endTimestamp = usage?.periodEnd || Date.now() + 18 * 86400000;
    return new Date(endTimestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [usage?.periodEnd]);

  // Low Credits Threshold (when balance is > 0 and <= 15)
  const isLowCredits = creditsBalance > 0 && creditsBalance <= 15;

  // Personal Clean Mind Maps (exclude demo/placeholder maps)
  const personalMaps = useMemo(
    () => allMaps.filter((m) => !m.isTrash && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user'),
    [allMaps]
  );

  // Filter Categories with Real-time Count
  const mapCategories = useMemo(() => {
    const catList = ['All', 'Favorites', 'Strategy', 'Business', 'Study', 'Engineering', 'Marketing'];
    return catList.map((cat) => {
      let count = 0;
      if (cat === 'All') count = personalMaps.length;
      else if (cat === 'Favorites') count = personalMaps.filter((m) => m.isFavorite).length;
      else count = personalMaps.filter((m) => (m.category || 'General').toLowerCase() === cat.toLowerCase()).length;
      return { name: cat, count };
    });
  }, [personalMaps]);

  // Filter & Sort Maps (Strictly Personal Content)
  const filteredAndSortedMaps = useMemo(() => {
    return personalMaps
      .filter((m) => {
        if (selectedMapCategory === 'Favorites' && !m.isFavorite) return false;
        if (
          selectedMapCategory !== 'All' &&
          selectedMapCategory !== 'Favorites' &&
          (m.category || 'General').toLowerCase() !== (selectedMapCategory || '').toLowerCase()
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (m.title || '').toLowerCase().includes(q);
          const matchCategory = (m.category || '').toLowerCase().includes(q);
          const matchDesc = (m.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updated') return b.updatedAt - a.updatedAt;
        if (sortBy === 'nodes') return (b.nodesCount || 0) - (a.nodesCount || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [personalMaps, selectedMapCategory, searchQuery, sortBy]);

  const personalTasks = useMemo(
    () =>
      allTasks.filter(
        (t) =>
          t.mapId !== 'map-mindflow-demo' &&
          !['task-1', 'task-2', 'task-3'].includes(t.id)
      ),
    [allTasks]
  );
  const completedTasks = personalTasks.filter((t) => t.status === 'done').length;
  const totalTasks = personalTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const personalGoals = useMemo(
    () => allGoals.filter((g) => g.mapId !== 'map-mindflow-demo' && g.id !== 'goal-1'),
    [allGoals]
  );

  // Most recently updated personal map for Continue Workspace
  const mostRecentMap = useMemo(() => {
    if (personalMaps.length === 0) return null;
    return [...personalMaps].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  }, [personalMaps]);

  const unreadQuickNotesCount = quickNotes.filter((n) => !n.convertedToNode).length;
  const totalMonthlyAllowance = Math.max(1, monthlyCredits);
  const creditUsagePercent = Math.min(100, Math.max(0, Math.round((creditsBalance / totalMonthlyAllowance) * 100)));

  // Category Color Badges Helper
  const getCategoryBadgeClass = (category?: string) => {
    const c = (category || '').toLowerCase();
    if (c === 'strategy') return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    if (c === 'business') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    if (c === 'study') return 'bg-amber-50 text-amber-700 border-amber-200/80';
    if (c === 'engineering') return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
    if (c === 'marketing') return 'bg-rose-50 text-rose-700 border-rose-200/80';
    return 'bg-slate-100 text-slate-700 border-slate-200/80';
  };

  // Safe delete handler
  const confirmDeleteMap = useCallback(() => {
    if (mapToDelete) {
      deleteMap(mapToDelete.id);
      setMapToDelete(null);
    }
  }, [mapToDelete, deleteMap]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto w-full">
      {/* 1. ZERO CREDITS DEPLETED ALERT (When credits <= 0) */}
      {isZeroCredits && (
        <div
          id="dash-zero-credits-alert"
          className="bg-rose-500/10 border border-rose-300 dark:border-rose-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Your AI credits are finished.
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                You've used all your AI credits for this billing period. Top up your balance to continue generating mind maps without interruption.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              id="dash-zero-credits-topup-btn"
              onClick={() => setIsCreditTopUpOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Top Up Credits</span>
            </button>
            <button
              id="dash-zero-credits-upgrade-btn"
              onClick={() => setIsPricingOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Manage Plan
            </button>
          </div>
        </div>
      )}

      {/* 2. LOW CREDITS WARNING BANNER (When credits > 0 and <= 15) */}
      {!isZeroCredits && isLowCredits && (
        <div
          id="dash-low-credits-warning"
          className="bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ⚠ Low AI Credits
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  • You have {creditsBalance} credits remaining.
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Top up credits now to prevent generation interruptions.
              </p>
            </div>
          </div>
          <button
            id="dash-low-credits-topup-btn"
            onClick={() => setIsCreditTopUpOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Top Up</span>
          </button>
        </div>
      )}

      {/* 3. HIGH DENSITY HERO & PLAN OVERVIEW */}
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                  Welcome back, {profile?.name || 'Creator'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                  {effectivePlan.toUpperCase()}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Visual intelligence workspace organized into Core Tools, AI Assistants, and Projects.
              </p>
            </div>

            {/* Quick Fast Creation Triggers */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                id="dash-header-blank-map-btn"
                onClick={() => createNewMap('Central Topic')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Blank Canvas</span>
              </button>

              <button
                id="dash-header-ai-btn"
                onClick={() => setIsAIGeneratorOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Generator</span>
              </button>

              {(canVoice || canDoc) && (
                <button
                  id="dash-header-voice-btn"
                  onClick={() => setIsMultimodalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Voice & PDF</span>
                </button>
              )}

              <button
                id="dash-header-notes-btn"
                onClick={() => setIsQuickNotesOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer relative active:scale-95"
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                <span>Notes</span>
                {unreadQuickNotesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadQuickNotesCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Continue Where You Left Off Hero (if active map exists) */}
          {mostRecentMap && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 hover:bg-slate-50 p-4 rounded-xl transition-colors border border-slate-200/70">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/90 text-indigo-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  <Layers className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      Resume Project
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {mostRecentMap.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{mostRecentMap.nodesCount} nodes</span>
                    <span>•</span>
                    <span className="capitalize">{mostRecentMap.category || 'General'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Edited {new Date(mostRecentMap.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canPresentation && (
                  <button
                    id="dash-resume-presentation-btn"
                    onClick={() => {
                      openMap(mostRecentMap.id);
                      setCurrentView('presentation');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    title="Present Deck"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="hidden md:inline">Present</span>
                  </button>
                )}

                {canStudy && (
                  <button
                    id="dash-resume-study-btn"
                    onClick={() => {
                      openMap(mostRecentMap.id);
                      setCurrentView('study_mode');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    title="Study Flashcards"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden md:inline">Study</span>
                  </button>
                )}

                <button
                  id="dash-resume-canvas-btn"
                  onClick={() => openMap(mostRecentMap.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <span>Open Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Plan & Quota Breakdown Strip */}
        <div
          id="dash-my-plan-widget"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                <Crown className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    {effectivePlan} Plan
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                      isSubscriptionActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSubscriptionActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {statusLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Renewal: {renewalDateString} • {effectivePlan === 'free' ? 'Starter Quota' : 'Pro Entitlements'}
                </div>
              </div>
            </div>

            {/* AI Credits Bar */}
            <div className="flex-1 lg:max-w-md bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                  <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                  AI Credits Balance
                </span>
                <span className="font-black font-mono text-slate-900 text-xs">
                  {creditsBalance} <span className="text-slate-400 font-normal">/ {monthlyCredits}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  style={{ width: `${creditUsagePercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isZeroCredits
                      ? 'bg-rose-500'
                      : isLowCredits
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-medium text-slate-600">{creditUsagePercent}% capacity available</span>
                <div className="flex items-center gap-2">
                  <span>Used: {creditsUsed}</span>
                  {topupCredits > 0 && <span className="text-indigo-600 font-bold">(+{topupCredits} top-up)</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="dash-my-plan-topup-btn"
                onClick={() => setIsCreditTopUpOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-white" />
                <span>Top Up</span>
              </button>
              <button
                id="dash-my-plan-manage-btn"
                onClick={() => setIsPricingOpen(true)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Manage Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. USAGE CATEGORY FILTER NAVIGATION BAR */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          <button
            id="dash-category-tab-all"
            onClick={() => setActiveCategorySection('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategorySection === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          <button
            id="dash-category-tab-core"
            onClick={() => setActiveCategorySection('core')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategorySection === 'core'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Core Tools</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">4</span>
          </button>

          <button
            id="dash-category-tab-ai"
            onClick={() => setActiveCategorySection('ai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategorySection === 'ai'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-purple-600'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Assistants</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">4</span>
          </button>

          <button
            id="dash-category-tab-projects"
            onClick={() => setActiveCategorySection('projects')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategorySection === 'projects'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Recent Projects</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
              {personalMaps.length}
            </span>
          </button>

          <button
            id="dash-category-tab-blueprints"
            onClick={() => setActiveCategorySection('blueprints')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategorySection === 'blueprints'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Strategic Blueprints</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">16+</span>
          </button>
        </div>

        {/* Quick count chips */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-2">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-slate-700">{completedTasks}</span>/{totalTasks} tasks done
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CATEGORY GROUP 1: CORE TOOLS */}
      {/* ========================================================================= */}
      {(activeCategorySection === 'all' || activeCategorySection === 'core') && (
        <div id="section-core-tools" className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Core Tools
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Productivity Engine
                  </span>
                </div>
              </div>
            </div>
            <button
              id="dash-core-tools-blank-btn"
              onClick={() => createNewMap('Central Topic')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>+ New Canvas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Core Card 1: Blank Infinite Canvas */}
            <div
              id="dash-card-blank-map"
              onClick={() => createNewMap('Central Topic')}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Infinite Canvas
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  Blank Infinite Canvas
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Radial, tree, and flow layouts with drag-and-drop hierarchy, node styling, and markdown notes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Instant Launch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Core Card 2: Action Tasks Kanban */}
            <div
              id="dash-card-tasks"
              onClick={() => setCurrentView('tasks')}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                    {completedTasks}/{totalTasks} Done
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                  Action Tasks Kanban
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Convert mind map nodes into actionable tasks with priority tags, deadlines, and board columns.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>{taskProgress}% Completed</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Core Card 3: Strategic Goals & OKRs */}
            <div
              id="dash-card-goals"
              onClick={() => setCurrentView('goals')}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-rose-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                    {personalGoals.length} Goals
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">
                  Strategic Goals & OKRs
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Align high-level vision with measurable milestones, target dates, and progress tracking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                <span>Manage Goals</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Core Card 4: Quick Notes Scratchpad */}
            <div
              id="dash-card-quick-notes"
              onClick={() => setIsQuickNotesOpen(true)}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <StickyNote className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {quickNotes.length} Notes
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  Quick Notes Scratchpad
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Capture fleeting ideas instantly with colored cards and convert them to mind map nodes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>{unreadQuickNotesCount} Active Drafts</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY GROUP 2: AI ASSISTANTS & COPILOTS */}
      {/* ========================================================================= */}
      {(activeCategorySection === 'all' || activeCategorySection === 'ai') && (
        <div id="section-ai-assistants" className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    AI Assistants
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                    Smart Copilots
                  </span>
                </div>
              </div>
            </div>
            <button
              id="dash-ai-group-explore-btn"
              onClick={() => setIsAIGeneratorOpen(true)}
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Launch Copilot</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Card 1: AI Mind Map Generator */}
            <div
              id="dash-card-ai-map"
              onClick={() => setIsAIGeneratorOpen(true)}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                    AI Generator
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                  AI Mind Map Copilot
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Deconstruct complex topics with deep thinking mode and contextual branch expansion.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                <span>Generate Map</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* AI Card 2: Voice & PDF Multimodal Analysis */}
            <div
              id="dash-card-multimodal-map"
              onClick={() => {
                if (canVoice || canDoc) {
                  setIsMultimodalOpen(true);
                } else {
                  setIsPricingOpen(true);
                }
              }}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    Audio & PDF
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Voice & Document Intel
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Transcribe spoken dictation or ingest documents for automatic mind map diagramming.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>{canVoice || canDoc ? 'Record & Ingest' : 'Pro Feature'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* AI Card 3: AI Study Mode & Flashcards */}
            <div
              id="dash-card-ai-study"
              onClick={() => {
                if (canStudy) {
                  if (mostRecentMap) {
                    openMap(mostRecentMap.id);
                    setCurrentView('study_mode');
                  } else {
                    setCurrentView('study_mode');
                  }
                } else {
                  setIsPricingOpen(true);
                }
              }}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                    Flashcards
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                  AI Study & Retention
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Transform mind map node hierarchies into active recall flashcards and spaced quizzes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>{canStudy ? 'Open Study Deck' : 'Pro Feature'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* AI Card 4: AI Presentation Deck */}
            <div
              id="dash-card-ai-presentation"
              onClick={() => {
                if (canPresentation) {
                  if (mostRecentMap) {
                    openMap(mostRecentMap.id);
                    setCurrentView('presentation');
                  } else {
                    setCurrentView('presentation');
                  }
                } else {
                  setIsPricingOpen(true);
                }
              }}
              className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-cyan-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-100">
                    Slide Deck
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-cyan-600 transition-colors">
                  AI Presentation Deck
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Convert branches and concept nodes into presentable visual slide decks instantly.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-600">
                <span>{canPresentation ? 'Present Slides' : 'Pro Feature'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY GROUP 3: RECENT PROJECTS & PERSONAL WORKSPACES */}
      {/* ========================================================================= */}
      {(activeCategorySection === 'all' || activeCategorySection === 'projects') && (
        <div id="section-recent-projects" className="space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            {/* Left: Section Title & Category Filter Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <FolderTree className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent Projects</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {filteredAndSortedMaps.length}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {mapCategories.map((c) => (
                  <button
                    key={c.name}
                    id={`dash-filter-${c.name.toLowerCase()}`}
                    onClick={() => setSelectedMapCategory(c.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedMapCategory === c.name
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedMapCategory === c.name ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/70 text-slate-500'
                      }`}
                    >
                      {c.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Search, Sort Dropdown & View Mode */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="dash-search-maps-input"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    id="dash-search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                id="dash-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="updated">Recent</option>
                <option value="nodes">Nodes</option>
                <option value="title">A-Z</option>
              </select>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  id="dash-view-grid-btn"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  id="dash-view-list-btn"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mind Maps Content (Grid or List) */}
          {filteredAndSortedMaps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                {searchQuery ? 'No matching mind maps found' : 'No mind maps in this category'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? 'Try searching with different keywords or clear your active filter.'
                  : 'Start fresh with a blank canvas or generate structured branches with AI.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  id="dash-empty-blank-map-btn"
                  onClick={() => createNewMap('Central Topic')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Blank Canvas</span>
                </button>
                <button
                  id="dash-empty-ai-btn"
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with AI</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedMaps.map((map) => (
                <div
                  key={map.id}
                  id={`dash-map-card-${map.id}`}
                  onClick={() => openMap(map.id)}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                          map.category
                        )}`}
                      >
                        {map.category || 'General'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          id={`dash-favorite-btn-${map.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteMap(map.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
                          title={map.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              map.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                            }`}
                          />
                        </button>

                        <button
                          id={`dash-menu-btn-${map.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMapId(activeMenuMapId === map.id ? null : map.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          title="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    {activeMenuMapId === map.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-4 top-12 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-44 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            openMap(map.id);
                            setActiveMenuMapId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" /> Open Canvas
                        </button>
                        {canPresentation && (
                          <button
                            onClick={() => {
                              openMap(map.id);
                              setCurrentView('presentation');
                              setActiveMenuMapId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 text-cyan-600" /> Present Slides
                          </button>
                        )}
                        {canStudy && (
                          <button
                            onClick={() => {
                              openMap(map.id);
                              setCurrentView('study_mode');
                              setActiveMenuMapId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> Study Mode
                          </button>
                        )}
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            setActiveMenuMapId(null);
                            setMapToDelete({ id: map.id, title: map.title });
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Map
                        </button>
                      </div>
                    )}

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                      {map.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {map.description || 'Interactive mind map created in MindFlow workspace.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-medium">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        {map.nodesCount} nodes
                      </span>
                      <span className="capitalize text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {map.layout}
                      </span>
                    </div>
                    <span className="text-[11px] flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(map.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredAndSortedMaps.map((map) => (
                <div
                  key={map.id}
                  id={`dash-map-row-${map.id}`}
                  onClick={() => openMap(map.id)}
                  className="group flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMap(map.id);
                      }}
                      className="p-1 rounded-lg text-slate-300 hover:text-amber-500 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          map.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {map.title}
                        </h4>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getCategoryBadgeClass(
                            map.category
                          )}`}
                        >
                          {map.category || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-md">
                        {map.description || 'Mind map in personal workspace'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="font-semibold text-slate-600 hidden sm:inline">
                      {map.nodesCount} nodes
                    </span>
                    <span className="text-slate-400 text-[11px] hidden md:inline">
                      {new Date(map.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMap(map.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 transition-colors"
                      title="Open Map"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY GROUP 4: STRATEGIC BLUEPRINTS & TEMPLATES */}
      {/* ========================================================================= */}
      {(activeCategorySection === 'all' || activeCategorySection === 'blueprints') && (
        <div id="section-strategic-blueprints" className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Strategic Blueprints
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Templates
                  </span>
                </div>
              </div>
            </div>
            <button
              id="dash-view-all-templates-link"
              onClick={() => setCurrentView('templates')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all 16+ blueprints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.slice(0, 4).map((tpl) => (
              <div
                key={tpl.id}
                id={`dash-tpl-${tpl.id}`}
                onClick={() => createMapFromTemplate(tpl)}
                className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {tpl.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {tpl.nodes.length} nodes
                  </span>
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Use Blueprint →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {mapToDelete && (
        <div
          id="dash-delete-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="dash-delete-modal-content"
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Mind Map?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{mapToDelete.title}"</span>? This will remove all associated nodes and branches.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                id="dash-delete-cancel-btn"
                onClick={() => setMapToDelete(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                id="dash-delete-confirm-btn"
                onClick={confirmDeleteMap}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Delete Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Notes */}
      <QuickNotesFAB />
    </div>
  );
};
