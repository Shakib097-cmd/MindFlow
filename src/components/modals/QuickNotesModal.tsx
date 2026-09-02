import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QuickNote, QuickNoteColor, MapLayout } from '../../types';
import {
  StickyNote,
  Plus,
  Sparkles,
  Layers,
  Trash2,
  Edit3,
  Search,
  ExternalLink,
  X,
  Check,
  Tag,
  Clock,
  ArrowRight,
  FolderPlus,
  CornerDownRight,
  Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLOR_OPTIONS: Array<{
  id: QuickNoteColor;
  label: string;
  bg: string;
  border: string;
  ring: string;
  dot: string;
}> = [
  { id: 'amber', label: 'Amber', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-400', dot: 'bg-amber-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', ring: 'ring-indigo-400', dot: 'bg-indigo-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400', dot: 'bg-emerald-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', ring: 'ring-purple-400', dot: 'bg-purple-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-50', border: 'border-rose-200', ring: 'ring-rose-400', dot: 'bg-rose-500' },
  { id: 'slate', label: 'Slate', bg: 'bg-slate-50', border: 'border-slate-200', ring: 'ring-slate-400', dot: 'bg-slate-500' },
];

const SUGGESTED_TAGS = ['Idea', 'Brainstorm', 'Feature', 'Strategy', 'Task', 'Research', 'Study', 'Launch'];

export const QuickNotesModal: React.FC = () => {
  const {
    isQuickNotesOpen,
    setIsQuickNotesOpen,
    quickNotes,
    addQuickNote,
    updateQuickNote,
    deleteQuickNote,
    convertQuickNoteToNode,
    convertQuickNoteToMap,
    allMaps,
    activeMap,
    openMap,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'capture' | 'list'>('capture');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<QuickNoteColor>('amber');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Idea']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [targetMapForAppend, setTargetMapForAppend] = useState<string>(activeMap?.id || allMaps[0]?.id || '');
  const [appendDropdownNoteId, setAppendDropdownNoteId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when opening capture tab
  useEffect(() => {
    if (isQuickNotesOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isQuickNotesOpen, activeTab]);

  // Keep target map in sync
  useEffect(() => {
    if (activeMap?.id) {
      setTargetMapForAppend(activeMap.id);
    } else if (allMaps.length > 0 && !targetMapForAppend) {
      setTargetMapForAppend(allMaps[0].id);
    }
  }, [activeMap, allMaps, targetMapForAppend]);

  // Global Esc key & Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isQuickNotesOpen) return;

      if (e.key === 'Escape') {
        setIsQuickNotesOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && activeTab === 'capture') {
        e.preventDefault();
        handleSaveNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickNotesOpen, activeTab, content, title, selectedTags, selectedColor, editingNoteId]);

  if (!isQuickNotesOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setSelectedTags(['Idea']);
    setSelectedColor('amber');
    setEditingNoteId(null);
  };

  const handleSaveNote = () => {
    if (!content.trim()) return;

    if (editingNoteId) {
      updateQuickNote(editingNoteId, {
        title: title.trim() || undefined,
        content: content.trim(),
        tags: selectedTags,
        color: selectedColor,
      });
      showToast('Note updated successfully');
      setEditingNoteId(null);
      setActiveTab('list');
    } else {
      addQuickNote(content.trim(), {
        title: title.trim() || undefined,
        tags: selectedTags,
        color: selectedColor,
      });
      showToast('Idea captured into Quick Notes!');
      resetForm();
    }
  };

  const handleSaveAndConvertToMap = () => {
    if (!content.trim()) return;

    let noteToConvert: QuickNote;
    if (editingNoteId) {
      updateQuickNote(editingNoteId, {
        title: title.trim() || undefined,
        content: content.trim(),
        tags: selectedTags,
        color: selectedColor,
      });
      noteToConvert = quickNotes.find((n) => n.id === editingNoteId)!;
    } else {
      noteToConvert = addQuickNote(content.trim(), {
        title: title.trim() || undefined,
        tags: selectedTags,
        color: selectedColor,
      });
    }

    resetForm();
    setIsQuickNotesOpen(false);
    convertQuickNoteToMap(noteToConvert.id);
  };

  const handleSaveAndAppendToActiveMap = () => {
    if (!content.trim()) return;

    let noteToConvert: QuickNote;
    if (editingNoteId) {
      updateQuickNote(editingNoteId, {
        title: title.trim() || undefined,
        content: content.trim(),
        tags: selectedTags,
        color: selectedColor,
      });
      noteToConvert = quickNotes.find((n) => n.id === editingNoteId)!;
    } else {
      noteToConvert = addQuickNote(content.trim(), {
        title: title.trim() || undefined,
        tags: selectedTags,
        color: selectedColor,
      });
    }

    resetForm();
    setIsQuickNotesOpen(false);
    convertQuickNoteToNode(noteToConvert.id, targetMapForAppend || activeMap?.id);
  };

  const handleStartEdit = (note: QuickNote) => {
    setEditingNoteId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
    setSelectedTags(note.tags || ['Idea']);
    setSelectedColor(note.color || 'amber');
    setActiveTab('capture');
  };

  const handleConvertToMapFromList = (noteId: string, layout: MapLayout = 'left-to-right') => {
    setIsQuickNotesOpen(false);
    convertQuickNoteToMap(noteId, { layout });
  };

  const handleAppendToMapFromList = (noteId: string, mapId: string) => {
    setIsQuickNotesOpen(false);
    convertQuickNoteToNode(noteId, mapId);
  };

  const filteredNotes = quickNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const formatRelativeTime = (timestamp: number) => {
    const diffSecs = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div
      id="quick-notes-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsQuickNotesOpen(false)}
    >
      <div
        id="quick-notes-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-sm">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Quick Notes</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {quickNotes.length} {quickNotes.length === 1 ? 'idea' : 'ideas'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Capture fleeting thoughts and transform them into mind map branches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-600">
              <button
                id="tab-quick-capture-btn"
                onClick={() => {
                  setActiveTab('capture');
                  if (!editingNoteId) resetForm();
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'capture'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>{editingNoteId ? 'Edit Note' : 'Capture'}</span>
              </button>

              <button
                id="tab-captured-notes-btn"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Stash ({quickNotes.length})</span>
              </button>
            </div>

            <button
              id="close-quick-notes-modal-btn"
              onClick={() => setIsQuickNotesOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Toast Notification */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{feedbackToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'capture' ? (
            <div className="space-y-4">
              {/* Optional Title Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Idea Title / Topic (Optional)
                </label>
                <input
                  id="quick-note-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mobile lockscreen widget, Pricing revamp, SWOT items..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-hidden transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                />
              </div>

              {/* Distraction-Free Note Content Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Fleeting Thought or Brainstorm Bullets *
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Tip: Bullet lines auto-split into sub-branches
                  </span>
                </div>
                <textarea
                  id="quick-note-content-textarea"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder={`Capture anything before it slips away...
- First key point or sub-topic
- Second observation or task
- Desired outcome or hypothesis`}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-sm leading-relaxed focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-hidden transition-all bg-slate-50/40 hover:bg-white focus:bg-white resize-none font-normal"
                />
              </div>

              {/* Color Accents & Tags Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Color Accent
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id)}
                        className={`w-7 h-7 rounded-full ${c.dot} transition-transform flex items-center justify-center ${
                          selectedColor === c.id
                            ? 'scale-115 ring-2 ring-offset-2 ' + c.ring
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        title={c.label}
                      >
                        {selectedColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Categorization Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {SUGGESTED_TAGS.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            active
                              ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Tag */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Add custom tag..."
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 w-36"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      disabled={!customTagInput.trim()}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Stash / Captured Notes List Tab */
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="search-quick-notes-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search captured fleeting notes..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Notes Grid */}
              {filteredNotes.length === 0 ? (
                <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <StickyNote className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    {searchQuery ? 'No matching notes found' : 'No quick notes yet'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                    {searchQuery
                      ? 'Try adjusting your search keywords.'
                      : 'Capture spontaneous ideas, brainstorm takeaways, and convert them to mind map branches.'}
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('capture');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs"
                  >
                    + Capture First Idea
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredNotes.map((note) => {
                    const colorScheme = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0];

                    return (
                      <div
                        key={note.id}
                        className={`rounded-2xl border ${colorScheme.border} ${colorScheme.bg} p-4 transition-all hover:shadow-md relative flex flex-col justify-between`}
                      >
                        <div>
                          {/* Note Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900">
                                {note.title || 'Untitled Idea'}
                              </span>

                              {note.convertedToNode && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1 border border-indigo-200">
                                  <Sparkles className="w-2.5 h-2.5" /> Converted to Map
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEdit(note)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
                                title="Edit Note"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteQuickNote(note.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white/80 transition-colors"
                                title="Delete Note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Note Content / Bullets */}
                          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed mb-3 font-normal">
                            {note.content}
                          </p>

                          {/* Tags & Time */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200/60 text-slate-500 text-[11px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {note.tags?.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/80 font-medium text-slate-600 text-[10px]"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(note.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Conversion Action Footer */}
                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {/* Convert to New Map Button */}
                            <button
                              id={`convert-new-map-btn-${note.id}`}
                              onClick={() => handleConvertToMapFromList(note.id)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Convert to New Map</span>
                            </button>

                            {/* Append to Active Map Button */}
                            {allMaps.length > 0 && (
                              <button
                                id={`append-active-map-btn-${note.id}`}
                                onClick={() =>
                                  handleAppendToMapFromList(note.id, activeMap?.id || allMaps[0].id)
                                }
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
                              >
                                <CornerDownRight className="w-3 h-3 text-indigo-500" />
                                <span>
                                  Add to "{activeMap?.title ? activeMap.title.slice(0, 18) + '...' : 'Map'}"
                                </span>
                              </button>
                            )}
                          </div>

                          {/* If converted, link to open map */}
                          {note.convertedMapId && (
                            <button
                              onClick={() => {
                                setIsQuickNotesOpen(false);
                                openMap(note.convertedMapId!);
                              }}
                              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <span>Open Map</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          {activeTab === 'capture' ? (
            <>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600 shadow-2xs">
                  ⌘ + Enter
                </kbd>
                <span>to save note</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="quick-note-save-only-btn"
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!content.trim()}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  {editingNoteId ? 'Update Note' : 'Save to Stash'}
                </button>

                {allMaps.length > 0 && (
                  <button
                    id="quick-note-save-append-btn"
                    type="button"
                    onClick={handleSaveAndAppendToActiveMap}
                    disabled={!content.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Append to Map</span>
                  </button>
                )}

                <button
                  id="quick-note-save-convert-btn"
                  type="button"
                  onClick={handleSaveAndConvertToMap}
                  disabled={!content.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Convert to Mind Map</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500">
                {quickNotes.length} total captured {quickNotes.length === 1 ? 'idea' : 'ideas'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('capture');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Capture New Idea</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
