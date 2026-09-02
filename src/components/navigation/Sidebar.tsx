import React, { useState } from 'react';
import { useWorkspace, WorkspaceView } from '../../context/WorkspaceContext';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  CheckSquare,
  Target,
  Sparkles,
  GraduationCap,
  Presentation,
  Settings,
  Plus,
  Folder,
  ChevronRight,
  ChevronDown,
  Crown,
  Zap,
  X,
} from 'lucide-react';
import { AIUsageProgressBar } from '../common/AIUsageProgressBar';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    allMaps,
    allTasks,
    allGoals,
    allFolders,
    openMap,
    usage,
    setIsPricingOpen,
    setIsAIGeneratorOpen,
    setIsSettingsOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useWorkspace();

  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleNavigate = (view: WorkspaceView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleOpenMap = (mapId: string) => {
    openMap(mapId);
    setIsMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 lg:hidden">
          <span className="text-xs font-bold text-slate-800 tracking-tight">Navigation</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Workspace Sections */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Workspace
          </div>
          <div className="space-y-0.5">
            <button
              id="sidebar-dashboard"
              onClick={() => handleNavigate('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              id="sidebar-canvas"
              onClick={() => handleNavigate('editor')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'editor' || currentView === 'canvas'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Canvas Editor</span>
              </div>
            </button>

            <button
              id="sidebar-my-maps"
              onClick={() => handleNavigate('my_maps')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'my_maps' || currentView === 'my-maps'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4 text-emerald-500" />
                <span>All Mind Maps</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                {allMaps.length}
              </span>
            </button>
          </div>
        </div>

        {/* Execution & Action Sections */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Turn Into Action
          </div>
          <div className="space-y-0.5">
            <button
              id="sidebar-tasks"
              onClick={() => handleNavigate('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'tasks'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                <span>Tasks Kanban</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                {allTasks.length}
              </span>
            </button>

            <button
              id="sidebar-goals"
              onClick={() => handleNavigate('goals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'goals'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-rose-500" />
                <span>Goals & OKRs</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                {allGoals.length}
              </span>
            </button>

            <button
              id="sidebar-study"
              onClick={() => handleNavigate('study_mode')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'study_mode' || currentView === 'study'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <span>Study & Quizzes</span>
              </div>
            </button>

            <button
              id="sidebar-presentation"
              onClick={() => handleNavigate('presentation')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'presentation'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Presentation className="w-4 h-4 text-cyan-500" />
                <span>Slide Deck Mode</span>
              </div>
            </button>
          </div>
        </div>

        {/* Templates & Folders */}
        <div>
          <div className="px-3 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Templates</span>
            <button
              onClick={() => handleNavigate('templates')}
              className="text-indigo-600 hover:underline capitalize font-medium cursor-pointer"
            >
              Browse
            </button>
          </div>
          <button
            id="sidebar-templates"
            onClick={() => handleNavigate('templates')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'templates'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>16+ Pro Templates</span>
          </button>
        </div>

        {/* Recent Maps Quick List */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Recent Maps
          </div>
          <div className="space-y-1">
            {allMaps.slice(0, 5).map((m) => (
              <button
                key={m.id}
                onClick={() => handleOpenMap(m.id)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 truncate flex items-center gap-2 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="truncate">{m.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Footer: AI Quota & Upgrade Banner */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0 space-y-2">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <AIUsageProgressBar
            variant="inline"
            showDetails={true}
            onOpenUpgrade={() => {
              setIsPricingOpen(true);
              setIsMobileMenuOpen(false);
            }}
            onOpenSettings={() => {
              setIsSettingsOpen(true);
              setIsMobileMenuOpen(false);
            }}
          />

          <div className="pt-2.5 flex items-center gap-1.5">
            <button
              id="sidebar-upgrade-btn"
              onClick={() => {
                setIsPricingOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Crown className="w-3 h-3 text-amber-300" />
              <span>Upgrade</span>
            </button>
            <button
              id="sidebar-settings-btn"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Settings & Quota"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-full shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
