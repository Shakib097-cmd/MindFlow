import React, { useState } from 'react';
import { useWorkspace, WorkspaceView } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Plus,
  Search,
  LayoutDashboard,
  Layers,
  FolderTree,
  CheckSquare,
  Target,
  GraduationCap,
  Presentation,
  Share2,
  Download,
  Settings,
  User,
  Crown,
  Mic,
  FileText,
  History,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Cloud,
  CloudOff,
  Check,
  Loader2,
  AlertCircle,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { AIUsageProgressBar } from '../common/AIUsageProgressBar';
import { UsageMeter } from '../common/UsageMeter';
import { AuthModal } from '../modals/AuthModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeMap,
    createNewMap,
    setIsAIGeneratorOpen,
    setIsMultimodalOpen,
    setIsExportShareOpen,
    setIsPricingOpen,
    setIsVersionHistoryOpen,
    setIsAIAssistantOpen,
    setIsSettingsOpen,
    usage,
    searchQuery,
    setSearchQuery,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSaving,
    isSyncing,
    lastSyncedAt,
    syncError,
    syncStatus,
    syncNow,
    openLegal,
    openUserManual,
    setIsKeyboardShortcutsOpen,
  } = useWorkspace();

  const { user, profile, signOut } = useAuth();
  const isAdmin =
    user?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com' ||
    profile?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com';
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const NAV_LINKS: Array<{ id: WorkspaceView; label: string }> = [
    { id: 'editor', label: 'Editor' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'templates', label: 'Templates' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'goals', label: 'Goals' },
    { id: 'study_mode', label: 'Study Hub' },
    { id: 'presentation', label: 'Present' },
  ];

  return (
    <nav className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-40 sticky top-0">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-6 lg:gap-8">
        {/* Mobile Hamburger Button */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          id="brand-logo-btn"
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 text-left group cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs text-white group-hover:bg-indigo-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 font-display">
            MindFlow
          </span>
        </button>

        {/* Top Nav Links (Visible on desktop & large tablets) */}
        <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-500">
          {NAV_LINKS.map((link) => {
            const isActive = currentView === link.id || (link.id === 'editor' && currentView === 'canvas');
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => setCurrentView(link.id)}
                className={`h-16 flex items-center px-1 transition-colors cursor-pointer text-xs font-semibold ${
                  isActive
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'hover:text-slate-900 border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Area: Search, Create Actions, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <input
            id="navbar-search-input"
            type="text"
            placeholder="Search maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-100 border-none rounded-full py-1.5 px-3.5 text-xs w-36 lg:w-48 focus:w-56 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Mobile Search Toggle Icon */}
        <button
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Reusable Visual AI Limit Usage Progress Meter in Navbar */}
        <UsageMeter
          variant="navbar"
          onUpgrade={() => setIsPricingOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Real Cloud Sync Status & Sync Now Trigger */}
        <button
          id="navbar-cloud-sync-btn"
          onClick={() => syncNow()}
          disabled={isSyncing || isSaving}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
            syncStatus === 'synced'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : syncStatus === 'syncing' || isSyncing || isSaving
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : syncStatus === 'offline'
              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
          title={
            syncStatus === 'synced'
              ? lastSyncedAt
                ? `All changes synced at ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Click to re-sync.`
                : 'All changes synced to Cloud Firestore. Click to re-sync.'
              : isSaving
              ? 'Saving changes locally...'
              : syncStatus === 'syncing' || isSyncing
              ? 'Syncing changes with Firestore...'
              : syncStatus === 'offline'
              ? 'Offline mode (changes cached locally). Click to retry cloud connection.'
              : syncError
              ? `Sync alert: ${syncError}. Click to retry.`
              : 'Sync alert. Click to retry.'
          }
        >
          {syncStatus === 'syncing' || isSyncing || isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : syncStatus === 'offline' ? (
            <CloudOff className="w-3.5 h-3.5 text-slate-500" />
          ) : syncStatus === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span className="hidden md:inline">
            {isSaving
              ? 'Saving...'
              : syncStatus === 'syncing' || isSyncing
              ? 'Syncing...'
              : syncStatus === 'synced'
              ? 'Synced'
              : syncStatus === 'offline'
              ? 'Offline'
              : 'Sync'}
          </span>
        </button>

        {/* AI Copilot Quick Button */}
        <button
          id="navbar-ai-copilot-btn"
          onClick={() => setIsAIAssistantOpen(true)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Open AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          id="navbar-shortcuts-btn"
          onClick={() => setIsKeyboardShortcutsOpen(true)}
          className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors hidden md:flex items-center gap-1 text-xs font-semibold shadow-2xs cursor-pointer"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <kbd className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded border border-slate-200">?</kbd>
        </button>

        {/* Create Dropdown */}
        <div className="relative">
          <button
            id="global-create-dropdown-btn"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showCreateMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800"
              onClick={() => setShowCreateMenu(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Create Options
              </div>
              <button
                id="create-ai-map-btn"
                onClick={() => {
                  setShowCreateMenu(false);
                  setIsAIGeneratorOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-indigo-50 text-indigo-900 font-semibold cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <div>
                  <div>AI Mind Map</div>
                  <span className="text-[10px] text-slate-500 font-normal">Generate from topic prompt</span>
                </div>
              </button>
              <button
                id="create-blank-map-btn"
                onClick={() => {
                  setShowCreateMenu(false);
                  createNewMap('Central Topic');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-semibold">Blank Map</div>
                  <span className="text-[10px] text-slate-500 font-normal">Start with central node</span>
                </div>
              </button>
              <button
                id="create-multimodal-btn"
                onClick={() => {
                  setShowCreateMenu(false);
                  setIsMultimodalOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-semibold">Voice, Text & Doc</div>
                  <span className="text-[10px] text-slate-500 font-normal">Speech or document upload</span>
                </div>
              </button>
              <button
                id="create-template-btn"
                onClick={() => {
                  setShowCreateMenu(false);
                  setCurrentView('templates');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
              >
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">Browse Templates</div>
                  <span className="text-[10px] text-slate-500 font-normal">16+ Business & Study templates</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export & Share buttons if in Canvas */}
        {(currentView === 'editor' || currentView === 'canvas') && (
          <div className="hidden sm:flex items-center gap-1">
            <button
              id="export-share-btn"
              onClick={() => setIsExportShareOpen(true)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 sm:py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer"
              title="Export PNG, PDF, Markdown & Share"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share</span>
            </button>
            <button
              id="version-history-btn"
              onClick={() => setIsVersionHistoryOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-xs transition-colors cursor-pointer"
              title="Version History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            id="user-avatar-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-300 hover:border-indigo-400 transition-colors flex items-center justify-center cursor-pointer"
          >
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                {profile?.name
                  ? profile.name
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((n) => n[0] || '')
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'MF'
                  : 'MF'}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {profile?.name || 'MindFlow User'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{profile?.email || 'Free Plan'}</div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {profile?.plan || 'pro'} Plan
                  </span>
                  <button
                    onClick={() => setIsPricingOpen(true)}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                  Dashboard
                </button>
                <button
                  id="user-menu-settings-btn"
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-800"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Settings & AI Limits
                </button>
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Subscription Plans
                </button>
                <button
                  id="user-menu-user-manual-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    openUserManual('getting-started');
                  }}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-indigo-50 text-indigo-700 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  User Manual & Docs
                </button>
                <button
                  id="user-menu-keyboard-shortcuts-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsKeyboardShortcutsOpen(true);
                  }}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Keyboard Shortcuts</span>
                  </div>
                  <kbd className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded border border-slate-200">?</kbd>
                </button>
                {isAdmin && (
                  <button
                    id="user-menu-admin-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      setCurrentView('admin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 flex items-center justify-between font-bold cursor-pointer border-t border-b border-indigo-200 my-1"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Admin Console</span>
                    </div>
                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">OWNER</span>
                  </button>
                )}
                <button
                  id="user-menu-auth-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Account & Admin Login</span>
                </button>
                <button
                  id="user-menu-legal-btn"
                  onClick={() => openLegal('privacy')}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Legal & Policies
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  id="signout-btn"
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Floating Bar */}
      {isMobileSearchOpen && (
        <div className="absolute top-full left-0 right-0 p-2 bg-white border-b border-slate-200 shadow-md md:hidden z-50 flex items-center gap-2 animate-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Search all mind maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-100 border-none rounded-lg py-2 px-3 text-xs outline-none text-slate-800 placeholder-slate-400"
            autoFocus
          />
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Account & Admin Sign-in Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};
