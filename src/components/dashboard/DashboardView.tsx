import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { TEMPLATES } from '../../data/templates';
import {
  Sparkles,
  Plus,
  Mic,
  FileText,
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
  LayoutGrid,
  List,
  Zap,
  Play,
  GraduationCap,
  ArrowUpRight,
  BookOpen,
  Filter,
} from 'lucide-react';
import { AIUsageProgressBar } from '../common/AIUsageProgressBar';
import { QuickNotesFAB } from './QuickNotesFAB';

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
  } = useWorkspace();

  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'updated' | 'nodes' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuMapId, setActiveMenuMapId] = useState<string | null>(null);

  const categories = ['All', 'Favorites', 'Strategy', 'Business', 'Study', 'Engineering', 'Marketing'];

  // Filter & Sort Maps (Strictly Personal Content)
  const filteredAndSortedMaps = useMemo(() => {
    return allMaps
      .filter((m) => !m.isTrash && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user')
      .filter((m) => {
        // Category Filter
        if (selectedCategory === 'Favorites' && !m.isFavorite) return false;
        if (
          selectedCategory !== 'All' &&
          selectedCategory !== 'Favorites' &&
          (m.category || 'General').toLowerCase() !== (selectedCategory || '').toLowerCase()
        ) {
          return false;
        }
        // Search Query
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
  }, [allMaps, selectedCategory, searchQuery, sortBy]);

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

  const personalMaps = useMemo(
    () => allMaps.filter((m) => !m.isTrash && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user'),
    [allMaps]
  );
  const personalGoals = useMemo(
    () => allGoals.filter((g) => g.mapId !== 'map-mindflow-demo' && g.id !== 'goal-1'),
    [allGoals]
  );

  // Most recently updated personal map for the "Continue Workspace" hero
  const mostRecentMap = useMemo(() => {
    if (personalMaps.length === 0) return null;
    return [...personalMaps].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  }, [personalMaps]);

  const unreadQuickNotesCount = quickNotes.filter((n) => !n.convertedToNode).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Top Welcome Header & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                Welcome back, {profile?.name || 'Creator'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                {profile?.plan ? String(profile.plan).toUpperCase() : 'PRO'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Your visual thinking workspace. Transform complex concepts into structured maps, tasks, and slides.
            </p>
          </div>

          {/* Direct Action Triggers */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Primary Blank Map Instant Action */}
            <button
              id="dash-header-blank-map-btn"
              onClick={() => createNewMap('Central Topic')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>+ Blank Map</span>
            </button>

            {/* AI Generator Modal Trigger */}
            <button
              id="dash-header-ai-btn"
              onClick={() => setIsAIGeneratorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Mind Map</span>
            </button>

            {/* Voice & Document Analysis */}
            <button
              id="dash-header-voice-btn"
              onClick={() => setIsMultimodalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Voice & PDF</span>
            </button>

            {/* Quick Notes Scratchpad */}
            <button
              id="dash-header-notes-btn"
              onClick={() => setIsQuickNotesOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer relative"
            >
              <StickyNote className="w-4 h-4 text-amber-600" />
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
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Continue Workspace:</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {mostRecentMap.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-indigo-600">{mostRecentMap.nodesCount} nodes</span>
                  <span>•</span>
                  <span>Category: {mostRecentMap.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Edited {new Date(mostRecentMap.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="dash-resume-presentation-btn"
                onClick={() => {
                  openMap(mostRecentMap.id);
                  setCurrentView('presentation');
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                title="Present Deck"
              >
                <Play className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden md:inline">Present</span>
              </button>
              <button
                id="dash-resume-study-btn"
                onClick={() => {
                  openMap(mostRecentMap.id);
                  setCurrentView('study_mode');
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                title="Study Flashcards"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Study</span>
              </button>
              <button
                id="dash-resume-canvas-btn"
                onClick={() => openMap(mostRecentMap.id)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Open Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Minimalist Creation Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blank Canvas Fast Start */}
        <div
          id="dash-card-blank-map"
          onClick={() => createNewMap('Central Topic')}
          className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
              Blank Infinite Canvas
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              Start with a single root topic and expand freely with keyboard shortcuts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>Instant launch</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: AI Mind Map Generator */}
        <div
          id="dash-card-ai-map"
          onClick={() => setIsAIGeneratorOpen(true)}
          className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
              AI Copilot & Strategy
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              Deconstruct complex topics with Gemini thinking mode and branch reasoning.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>Generate from prompt</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Voice & Document Breakdown */}
        <div
          id="dash-card-multimodal-map"
          onClick={() => setIsMultimodalOpen(true)}
          className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
              Voice & PDF Analysis
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              Record spoken thoughts or upload PDFs/documents for automatic mind map synthesis.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
            <span>Audio & PDF</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Curated Template Library */}
        <div
          id="dash-card-templates"
          onClick={() => setCurrentView('templates')}
          className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
              Template Gallery
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              16+ pre-engineered templates: SWOT, Startup Pitch, Sprint, OKR, and Study Hub.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>Explore 16+ blueprints</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Metric Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Maps */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Mind Maps
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{personalMaps.length}</div>
            <span className="text-[11px] text-indigo-600 font-medium">
              In your personal workspace
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Tasks Progress */}
        <div
          onClick={() => setCurrentView('tasks')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Action Tasks
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {completedTasks}/{totalTasks}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {taskProgress}% Completed
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Goals Progress */}
        <div
          onClick={() => setCurrentView('goals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Strategic Goals
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{personalGoals.length}</div>
            <span className="text-[11px] text-rose-600 font-medium">Milestones & OKRs</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* AI Limit Usage Progress Card */}
        <AIUsageProgressBar
          variant="card"
          onOpenUpgrade={() => setIsPricingOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main Gallery Section: Maps & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Left: Section Title & Category Filter Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Your Mind Maps</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {filteredAndSortedMaps.length}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {categories.map((c) => (
                <button
                  key={c}
                  id={`dash-filter-${c.toLowerCase()}`}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === c
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search, Sort Dropdown & View Mode */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="dash-search-maps-input"
                placeholder="Search maps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Sort Select */}
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

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                id="dash-view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                id="dash-view-list-btn"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
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
                ? 'Try searching with different keywords or clear the filter.'
                : 'Start fresh with a blank canvas or generate structured branches with AI.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                id="dash-empty-blank-map-btn"
                onClick={() => createNewMap('Central Topic')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Blank Map</span>
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
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedMaps.map((map) => (
              <div
                key={map.id}
                id={`dash-map-card-${map.id}`}
                onClick={() => openMap(map.id)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar: Category badge & Favorite / Menu */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {map.category}
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
                      className="absolute right-4 top-12 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-40 z-50 text-xs"
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
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          deleteMap(map.id);
                          setActiveMenuMapId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Map
                      </button>
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {map.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {map.description || 'Interactive mind map created in MindFlow workspace.'}
                  </p>
                </div>

                {/* Card Footer */}
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
          /* High-Density List View */
          <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
            {filteredAndSortedMaps.map((map) => (
              <div
                key={map.id}
                id={`dash-map-row-${map.id}`}
                onClick={() => openMap(map.id)}
                className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
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

                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {map.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {map.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">
                      {map.description || 'Mind map'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
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

      {/* Recommended Templates Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Featured Strategic Blueprints</h2>
            <p className="text-xs text-slate-500">Jumpstart your workflow with verified industry templates.</p>
          </div>
          <button
            id="dash-view-all-templates-link"
            onClick={() => setCurrentView('templates')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.slice(0, 4).map((tpl) => (
            <div
              key={tpl.id}
              id={`dash-tpl-${tpl.id}`}
              onClick={() => createMapFromTemplate(tpl)}
              className="group bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
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

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {tpl.nodes.length} nodes
                </span>
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Use Template →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Quick Notes */}
      <QuickNotesFAB />
    </div>
  );
};
