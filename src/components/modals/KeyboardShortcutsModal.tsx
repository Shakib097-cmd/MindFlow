import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Command,
  Layers,
  FolderKanban,
  Zap,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export type ShortcutCategory = 'all' | 'canvas' | 'kanban' | 'global';

interface ShortcutItem {
  id: string;
  category: 'canvas' | 'kanban' | 'global';
  section: string;
  description: string;
  keys: string[];
  context?: string;
  badge?: string;
}

export const KeyboardShortcutsModal: React.FC = () => {
  const {
    isKeyboardShortcutsOpen,
    setIsKeyboardShortcutsOpen,
    currentView,
  } = useWorkspace();

  const [activeCategory, setActiveCategory] = useState<ShortcutCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  // When opening from specific views, smartly default to relevant tab if in 'all'
  useEffect(() => {
    if (isKeyboardShortcutsOpen) {
      if (currentView === 'canvas' || currentView === 'editor') {
        setActiveCategory('canvas');
      } else if (currentView === 'tasks') {
        setActiveCategory('kanban');
      } else {
        setActiveCategory('all');
      }
      setSearchQuery('');
    }
  }, [isKeyboardShortcutsOpen, currentView]);

  // Global ESC to close this modal
  useEffect(() => {
    if (!isKeyboardShortcutsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsKeyboardShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen]);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const SHORTCUTS: ShortcutItem[] = useMemo(
    () => [
      // ================= MIND MAP CANVAS =================
      {
        id: 'canvas-child',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Add Child Idea node branching from selected topic',
        keys: ['Tab'],
        context: 'With node selected',
        badge: 'Core Workflow',
      },
      {
        id: 'canvas-sibling',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Add Sibling Idea node at the same level',
        keys: ['Enter'],
        context: 'With node selected',
        badge: 'Core Workflow',
      },
      {
        id: 'canvas-edit',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Edit / Rename title of selected node',
        keys: ['F2'],
        context: 'Or Double-Click node',
      },
      {
        id: 'canvas-delete',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Delete selected node and its connectors',
        keys: ['Backspace'],
        context: 'Or Delete key',
      },
      {
        id: 'canvas-duplicate',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Duplicate selected node with style and contents',
        keys: [modKey, 'D'],
        context: 'With node selected',
      },
      {
        id: 'canvas-task',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Convert selected node directly into an Action Task',
        keys: ['T'],
        context: 'With node selected',
        badge: 'Bridge to Kanban',
      },
      {
        id: 'canvas-collapse',
        category: 'canvas',
        section: 'Structure & Creation',
        description: 'Toggle branch collapse / expand for selected parent',
        keys: ['Space'],
        context: 'When not editing text',
      },
      {
        id: 'canvas-nav-left',
        category: 'canvas',
        section: 'Navigation & Selection',
        description: 'Navigate to parent node / branch',
        keys: ['←'],
        context: 'With node selected',
      },
      {
        id: 'canvas-nav-right',
        category: 'canvas',
        section: 'Navigation & Selection',
        description: 'Navigate to first child node',
        keys: ['→'],
        context: 'With node selected',
      },
      {
        id: 'canvas-nav-up',
        category: 'canvas',
        section: 'Navigation & Selection',
        description: 'Navigate to previous sibling node',
        keys: ['↑'],
        context: 'With node selected',
      },
      {
        id: 'canvas-nav-down',
        category: 'canvas',
        section: 'Navigation & Selection',
        description: 'Navigate to next sibling node',
        keys: ['↓'],
        context: 'With node selected',
      },
      {
        id: 'canvas-escape',
        category: 'canvas',
        section: 'Navigation & Selection',
        description: 'Deselect current node or cancel text edit',
        keys: ['Esc'],
      },
      {
        id: 'canvas-search',
        category: 'canvas',
        section: 'Navigation & Selection',
        description: 'Search nodes across the active mind map',
        keys: [modKey, 'F'],
        context: 'Focuses canvas search bar',
      },
      {
        id: 'canvas-undo',
        category: 'canvas',
        section: 'History & Viewport',
        description: 'Undo previous canvas action',
        keys: [modKey, 'Z'],
      },
      {
        id: 'canvas-redo',
        category: 'canvas',
        section: 'History & Viewport',
        description: 'Redo previously undone canvas action',
        keys: [modKey, 'Shift', 'Z'],
        context: `Or ${modKey} + Y`,
      },
      {
        id: 'canvas-zoom-in',
        category: 'canvas',
        section: 'History & Viewport',
        description: 'Zoom in on canvas',
        keys: ['+'],
        context: 'Or Wheel Scroll with Ctrl',
      },
      {
        id: 'canvas-zoom-out',
        category: 'canvas',
        section: 'History & Viewport',
        description: 'Zoom out on canvas',
        keys: ['-'],
        context: 'Or Wheel Scroll with Ctrl',
      },
      {
        id: 'canvas-zoom-reset',
        category: 'canvas',
        section: 'History & Viewport',
        description: 'Reset zoom to 100% and center view',
        keys: [modKey, '0'],
      },
      {
        id: 'canvas-pan',
        category: 'canvas',
        section: 'History & Viewport',
        description: 'Pan around canvas canvas freely',
        keys: ['Drag Backdrop'],
        context: 'Mouse drag or 2-finger swipe',
      },

      // ================= KANBAN BOARD =================
      {
        id: 'kanban-new-task',
        category: 'kanban',
        section: 'Task Management',
        description: 'Open modal to create a new Action Task',
        keys: ['N'],
        context: 'Or C key',
        badge: 'Quick Capture',
      },
      {
        id: 'kanban-edit-task',
        category: 'kanban',
        section: 'Task Management',
        description: 'Edit the selected task card details and subtasks',
        keys: ['E'],
        context: 'Or Enter key on selected card',
      },
      {
        id: 'kanban-delete-task',
        category: 'kanban',
        section: 'Task Management',
        description: 'Delete the selected task card',
        keys: ['Backspace'],
        context: 'Or Delete key',
      },
      {
        id: 'kanban-toggle-done',
        category: 'kanban',
        section: 'Task Management',
        description: 'Toggle task or checklist completion with confetti',
        keys: ['Space'],
        context: 'On selected task card',
        badge: 'Instant Done',
      },
      {
        id: 'kanban-cycle-priority',
        category: 'kanban',
        section: 'Task Management',
        description: 'Cycle task priority (Low → Medium → High → Urgent)',
        keys: ['P'],
        context: 'On selected task card',
      },
      {
        id: 'kanban-select-down',
        category: 'kanban',
        section: 'Card & Column Navigation',
        description: 'Select next task card in current column',
        keys: ['J'],
        context: 'Or Down Arrow ↓',
      },
      {
        id: 'kanban-select-up',
        category: 'kanban',
        section: 'Card & Column Navigation',
        description: 'Select previous task card in current column',
        keys: ['K'],
        context: 'Or Up Arrow ↑',
      },
      {
        id: 'kanban-col-prev',
        category: 'kanban',
        section: 'Card & Column Navigation',
        description: 'Move selected task to the previous column',
        keys: ['H'],
        context: 'Or Left Arrow ←',
      },
      {
        id: 'kanban-col-next',
        category: 'kanban',
        section: 'Card & Column Navigation',
        description: 'Advance selected task to the next column',
        keys: ['L'],
        context: 'Or Right Arrow →',
      },
      {
        id: 'kanban-move-1',
        category: 'kanban',
        section: 'Instant Column Jump',
        description: 'Move selected task directly to Backlog column',
        keys: ['1'],
        context: 'Column 1',
      },
      {
        id: 'kanban-move-2',
        category: 'kanban',
        section: 'Instant Column Jump',
        description: 'Move selected task directly to To Do column',
        keys: ['2'],
        context: 'Column 2',
      },
      {
        id: 'kanban-move-3',
        category: 'kanban',
        section: 'Instant Column Jump',
        description: 'Move selected task directly to In Progress column',
        keys: ['3'],
        context: 'Column 3',
      },
      {
        id: 'kanban-move-4',
        category: 'kanban',
        section: 'Instant Column Jump',
        description: 'Move selected task directly to In Review column',
        keys: ['4'],
        context: 'Column 4',
      },
      {
        id: 'kanban-move-5',
        category: 'kanban',
        section: 'Instant Column Jump',
        description: 'Move selected task directly to Done column',
        keys: ['5'],
        context: 'Column 5 (Celebration)',
      },
      {
        id: 'kanban-search',
        category: 'kanban',
        section: 'Card & Column Navigation',
        description: 'Focus task search input bar',
        keys: ['/'],
        context: `Or ${modKey} + F`,
      },
      {
        id: 'kanban-clear-select',
        category: 'kanban',
        section: 'Card & Column Navigation',
        description: 'Deselect active card or close active modal',
        keys: ['Esc'],
      },

      // ================= GLOBAL =================
      {
        id: 'global-shortcuts',
        category: 'global',
        section: 'Global & Fast Tools',
        description: 'Open this Keyboard Shortcuts cheat-sheet',
        keys: ['?'],
        context: `Or Shift + /`,
        badge: 'Help',
      },
      {
        id: 'global-quick-notes',
        category: 'global',
        section: 'Global & Fast Tools',
        description: 'Open Quick Notes capture drawer',
        keys: ['Alt', 'N'],
        context: 'Or press Q when not typing',
      },
      {
        id: 'global-ai-assistant',
        category: 'global',
        section: 'Global & Fast Tools',
        description: 'Toggle AI Thought Partner assistant drawer',
        keys: [modKey, '/'],
      },
    ],
    [modKey]
  );

  // Filter shortcuts
  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchSection = item.section.toLowerCase().includes(q);
        const matchKeys = item.keys.some((k) => k.toLowerCase().includes(q));
        const matchContext = item.context?.toLowerCase().includes(q) || false;
        return matchDesc || matchSection || matchKeys || matchContext;
      }
      return true;
    });
  }, [SHORTCUTS, activeCategory, searchQuery]);

  // Group by section for clean visual hierarchy
  const groupedSections: Record<string, ShortcutItem[]> = useMemo(() => {
    const groups: Record<string, ShortcutItem[]> = {};
    filteredShortcuts.forEach((item) => {
      const groupKey = `${item.category.toUpperCase()} — ${item.section}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredShortcuts]);

  if (!isKeyboardShortcutsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsKeyboardShortcutsOpen(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* =========================================================================
            1. MODAL HEADER
        ========================================================================= */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="keyboard-shortcuts-modal-title"
                  className="font-bold text-base sm:text-lg leading-tight text-white tracking-tight"
                >
                  Keyboard Shortcuts
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold">
                  {isMac ? 'macOS' : 'Windows / Linux'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Speed up mind mapping and kanban task execution without lifting your hands
              </p>
            </div>
          </div>

          <button
            id="close-shortcuts-modal-btn"
            onClick={() => setIsKeyboardShortcutsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            2. TOOLBAR: CATEGORY TABS & SEARCH
        ========================================================================= */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 self-start sm:self-auto">
            <button
              id="tab-shortcuts-all"
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Shortcuts
            </button>
            <button
              id="tab-shortcuts-canvas"
              type="button"
              onClick={() => setActiveCategory('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'canvas'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mind Map Canvas</span>
            </button>
            <button
              id="tab-shortcuts-kanban"
              type="button"
              onClick={() => setActiveCategory('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'kanban'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              id="tab-shortcuts-global"
              type="button"
              onClick={() => setActiveCategory('global')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'global'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Global</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="shortcuts-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcut by name or key..."
              className="w-full pl-9 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

        {/* =========================================================================
            3. SHORTCUTS LIST (SCROLLABLE)
        ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {Object.keys(groupedSections).length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching shortcuts found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for keywords like &quot;tab&quot;, &quot;task&quot;, &quot;zoom&quot;, or &quot;edit&quot;.</p>
            </div>
          ) : (
            (Object.entries(groupedSections) as [string, ShortcutItem[]][]).map(([sectionTitle, items]) => {
              const isCanvas = sectionTitle.startsWith('CANVAS');
              const isKanban = sectionTitle.startsWith('KANBAN');

              return (
                <div key={sectionTitle} className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
                    {isCanvas && <Layers className="w-3.5 h-3.5 text-indigo-600" />}
                    {isKanban && <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />}
                    {!isCanvas && !isKanban && <Zap className="w-3.5 h-3.5 text-purple-600" />}
                    <span>{sectionTitle.replace(/^(CANVAS|KANBAN|GLOBAL) — /, '')}</span>
                    <span className="text-[10px] font-medium text-slate-400 lowercase">
                      ({items.length} {items.length === 1 ? 'action' : 'actions'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800 leading-snug">
                              {item.description}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                                  item.badge === 'Core Workflow'
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    : item.badge === 'Instant Done'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.context && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {item.context}
                            </p>
                          )}
                        </div>

                        {/* Keystroke badges */}
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, index) => (
                            <React.Fragment key={index}>
                              <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-xs">
                                {k}
                              </kbd>
                              {index < item.keys.length - 1 && (
                                <span className="text-[10px] text-slate-400 font-bold">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Pro Tips Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-100/90 flex items-start gap-3 mt-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-slate-900 mb-0.5">High-Speed Workflow Pro-Tips:</div>
              <ul className="text-slate-600 space-y-1 text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-indigo-900">Mind Map Flow:</strong> Press <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">Tab</kbd> to branch an idea child, type the title, press <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">Enter</kbd> to add siblings. Build entire diagrams in seconds.
                </li>
                <li>
                  <strong className="text-emerald-900">Kanban Board Triage:</strong> Use <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">J</kbd> / <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">K</kbd> to select tasks, and press numbers <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">1</kbd> to <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">5</kbd> to instantly triage cards across columns.
                </li>
                <li>
                  Press <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">?</kbd> anywhere in MindFlow to pull up this shortcuts reference at any time.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. MODAL FOOTER
        ========================================================================= */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Tip: Press <kbd className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[10px]">Esc</kbd> to dismiss this modal
            </span>
          </div>
          <button
            onClick={() => setIsKeyboardShortcutsOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
