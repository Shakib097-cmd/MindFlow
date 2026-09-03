import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  FileText,
  Star,
  Users,
  Trash2,
  HelpCircle,
  BookOpen,
  Play,
  MessageSquare,
  User,
  Brain,
} from 'lucide-react';
import { AIUsageProgressBar } from '../common/AIUsageProgressBar';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, profile } = useAuth();
  const isAdmin =
    (user?.email || '').trim().toLowerCase() === 'starcybercafe097@gmail.com' ||
    (profile?.email || '').trim().toLowerCase() === 'starcybercafe097@gmail.com';

  const {
    currentView,
    setCurrentView,
    allMaps,
    allTasks,
    allGoals,
    allFolders,
    openMap,
    createNewMap,
    usage,
    setIsPricingOpen,
    setIsAIGeneratorOpen,
    setIsSettingsOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    openLegal,
    openUserManual,
  } = useWorkspace();

  const [isHelpOpen, setIsHelpOpen] = useState(true);

  // Strictly personal content isolation for sidebar counters
  const personalMaps = useMemo(
    () => allMaps.filter((m) => !m.isTrash && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user'),
    [allMaps]
  );
  const favoriteMaps = useMemo(
    () => allMaps.filter((m) => m.isFavorite && !m.isTrash && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user'),
    [allMaps]
  );
  const trashMaps = useMemo(
    () => allMaps.filter((m) => m.isTrash && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user'),
    [allMaps]
  );
  const personalTasks = useMemo(
    () => allTasks.filter((t) => t.mapId !== 'map-mindflow-demo' && !['task-1', 'task-2', 'task-3'].includes(t.id)),
    [allTasks]
  );
  const personalGoals = useMemo(
    () => allGoals.filter((g) => g.mapId !== 'map-mindflow-demo' && g.id !== 'goal-1'),
    [allGoals]
  );

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
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
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

        {/* Main User Panel Navigation */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Main Menu
          </div>
          <div className="space-y-0.5">
            {/* Dashboard */}
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

            {/* My Mind Maps */}
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
                <span>My Mind Maps</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                {personalMaps.length}
              </span>
            </button>

            {/* Templates */}
            <button
              id="sidebar-templates"
              onClick={() => handleNavigate('templates')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'templates'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Templates</span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                16+
              </span>
            </button>

            {/* AI Generator */}
            <button
              id="sidebar-ai-generator"
              onClick={() => {
                setIsAIGeneratorOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>AI Generator</span>
              </div>
              <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">
                Pro
              </span>
            </button>

            {/* Favorites */}
            <button
              id="sidebar-favorites"
              onClick={() => handleNavigate('my_maps')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                {favoriteMaps.length}
              </span>
            </button>

            {/* Shared With Me */}
            <button
              id="sidebar-shared"
              onClick={() => handleNavigate('my_maps')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Shared With Me</span>
              </div>
            </button>

            {/* Trash */}
            <button
              id="sidebar-trash"
              onClick={() => handleNavigate('my_maps')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Trash</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                {trashMaps.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action Hubs */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Execution
          </div>
          <div className="space-y-0.5">
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
                {personalTasks.length}
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
                {personalGoals.length}
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

        {/* Help & Support Section */}
        <div>
          <div className="flex items-center justify-between px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Help & Support</span>
            <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {isHelpOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isHelpOpen && (
            <div className="space-y-0.5">
              {/* User Manual - Highlighted when on user_manual */}
              <button
                id="sidebar-user-manual"
                onClick={() => {
                  openUserManual('getting-started');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'user_manual'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className={`w-4 h-4 ${currentView === 'user_manual' ? 'text-white' : 'text-indigo-600'}`} />
                  <span>User Manual</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  currentView === 'user_manual' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  Guide
                </span>
              </button>

              {/* Getting Started */}
              <button
                id="sidebar-getting-started"
                onClick={() => {
                  openUserManual('getting-started');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer pl-6"
              >
                <Play className="w-3 h-3 text-emerald-500" />
                <span>Getting Started</span>
              </button>

              {/* FAQ */}
              <button
                id="sidebar-faq"
                onClick={() => {
                  openUserManual('faq');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer pl-6"
              >
                <HelpCircle className="w-3 h-3 text-purple-500" />
                <span>FAQ</span>
              </button>

              {/* Contact Support */}
              <button
                id="sidebar-contact-support"
                onClick={() => {
                  openUserManual('troubleshooting');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer pl-6"
              >
                <MessageSquare className="w-3 h-3 text-indigo-500" />
                <span>Contact Support</span>
              </button>
            </div>
          )}
        </div>

        {/* Account & Settings Group */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Preferences
          </div>
          <div className="space-y-0.5">
            <button
              id="sidebar-settings-nav"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>

            <button
              id="sidebar-profile-nav"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-indigo-500" />
              <span>Profile</span>
            </button>
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

          {isAdmin && (
            <button
              id="sidebar-admin-console-btn"
              onClick={() => handleNavigate('admin')}
              className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition border border-slate-800 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Console</span>
            </button>
          )}
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

