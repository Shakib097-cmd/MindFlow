import React, { useState } from 'react';
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
  TrendingUp,
  FolderTree,
  Trash2,
  Copy,
  ExternalLink,
  Crown,
  StickyNote,
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
  const [activeMenuMapId, setActiveMenuMapId] = useState<string | null>(null);

  const categories = ['All', 'Favorites', 'Strategy', 'Business', 'Study', 'Engineering', 'Marketing'];

  const filteredMaps = allMaps.filter((m) => {
    if (selectedCategory === 'Favorites') return m.isFavorite;
    if (selectedCategory === 'All') return true;
    return m.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const completedTasks = allTasks.filter((t) => t.status === 'done').length;
  const totalTasks = allTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Welcome Banner & Quick Action Cards */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Welcome back, {profile?.name || 'Creator'} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Transform ideas into actionable mind maps, tasks, and presentations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="dash-quick-notes-btn"
              onClick={() => setIsQuickNotesOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold hover:bg-amber-100 shadow-xs transition-colors"
            >
              <StickyNote className="w-4 h-4 text-amber-600" />
              <span>Quick Notes</span>
              {quickNotes.filter((n) => !n.convertedToNode).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px]">
                  {quickNotes.filter((n) => !n.convertedToNode).length}
                </span>
              )}
            </button>
            <button
              id="dash-voice-doc-btn"
              onClick={() => setIsMultimodalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Mic className="w-4 h-4 text-purple-600" />
              <span>Voice / Doc to Map</span>
            </button>
            <button
              id="dash-ai-create-btn"
              onClick={() => setIsAIGeneratorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Mind Map</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Start Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 1: AI Prompt Map */}
          <div
            onClick={() => setIsAIGeneratorOpen(true)}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">AI Structured Map</h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              Generate from topic with Gemini thinking mode & breakdown.
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <span>Generate now</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Voice & Audio Capture */}
          <div
            onClick={() => setIsMultimodalOpen(true)}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Voice Brainstorm</h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              Speak your thoughts or meeting notes and convert directly to map.
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-600">
              <span>Record or Upload</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Templates */}
          <div
            onClick={() => setCurrentView('templates')}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Explore Templates</h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              SWOT, Startup Pitch, Sprint Plan, Study Guide, and more.
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>16+ Pro Templates</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Blank Map */}
          <div
            id="dash-blank-map-card"
            onClick={() => createNewMap('Central Topic')}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Blank Map</h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              Start with central node and expand your ideas freely.
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600">
              <span>Start with central node</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Maps */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Mind Maps
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{allMaps.length}</div>
            <span className="text-[11px] text-indigo-600 font-medium">
              Across all categories
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Tasks Progress */}
        <div
          onClick={() => setCurrentView('tasks')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Action Tasks
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {completedTasks}/{totalTasks}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {taskProgress}% Completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Goals Progress */}
        <div
          onClick={() => setCurrentView('goals')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Strategic Goals
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{allGoals.length}</div>
            <span className="text-[11px] text-rose-600 font-medium">OKRs & Milestones</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* AI Limit Usage Progress Card */}
        <AIUsageProgressBar
          variant="card"
          onOpenUpgrade={() => setIsPricingOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Mind Maps Gallery Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Your Mind Maps</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-bold">
              {filteredMaps.length}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Mind Maps Grid */}
        {filteredMaps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No mind maps in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Create your first mind map with AI or pick from our curated template library.
            </p>
            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
            >
              Generate Map with AI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaps.map((map) => (
              <div
                key={map.id}
                onClick={() => openMap(map.id)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar: Category badge & Favorite toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {map.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteMap(map.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            map.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>

                      {/* Map Menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuMapId(activeMenuMapId === map.id ? null : map.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Context menu */}
                  {activeMenuMapId === map.id && (
                    <div
                      className="absolute right-4 top-12 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-36 z-50 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          openMap(map.id);
                          setActiveMenuMapId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </button>
                      <button
                        onClick={() => {
                          deleteMap(map.id);
                          setActiveMenuMapId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {map.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {map.description || 'Interactive mind map created with MindFlow AI workspace.'}
                  </p>
                </div>

                {/* Footer stats: node count, layout type, updated time */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      {map.nodesCount} nodes
                    </span>
                    <span className="capitalize text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {map.layout}
                    </span>
                  </div>
                  <span className="text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(map.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Templates Row */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Templates</h2>
            <p className="text-xs text-slate-500">Jumpstart strategy, study, and project execution.</p>
          </div>
          <button
            onClick={() => setCurrentView('templates')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View all 16+ templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.slice(0, 4).map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => createMapFromTemplate(tpl)}
              className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-2">{tpl.icon}</div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                  {tpl.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {tpl.category}
                </span>
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Use →
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
