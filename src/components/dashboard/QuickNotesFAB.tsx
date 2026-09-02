import React, { useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { StickyNote, Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const QuickNotesFAB: React.FC = () => {
  const { isQuickNotesOpen, setIsQuickNotesOpen, quickNotes } = useWorkspace();

  // Keyboard shortcut: Cmd+J or Ctrl+J to toggle Quick Notes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsQuickNotesOpen(!isQuickNotesOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickNotesOpen, setIsQuickNotesOpen]);

  const unconvertedCount = quickNotes.filter((n) => !n.convertedToNode).length;

  return (
    <motion.div
      id="quick-notes-fab-container"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 group"
    >
      <button
        id="quick-notes-fab-btn"
        onClick={() => setIsQuickNotesOpen(true)}
        className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-hidden focus:ring-4 focus:ring-amber-500/30"
        title="Capture fleeting ideas & convert to mind maps (Cmd/Ctrl + J)"
      >
        <div className="relative">
          <StickyNote className="w-5 h-5" />
          {unconvertedCount > 0 && (
            <span
              id="quick-notes-fab-badge"
              className="absolute -top-1.5 -right-2 bg-slate-900 text-amber-300 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white/40 shadow-xs"
            >
              {unconvertedCount > 9 ? '9+' : unconvertedCount}
            </span>
          )}
        </div>

        <span className="font-bold text-sm tracking-tight pr-0.5">Quick Notes</span>

        <span className="hidden sm:inline-flex items-center text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded text-amber-50">
          ⌘J
        </span>
      </button>
    </motion.div>
  );
};
