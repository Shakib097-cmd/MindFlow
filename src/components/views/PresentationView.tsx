import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Layers,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

export const PresentationView: React.FC = () => {
  const { activeMap, nodes, allMaps, openMap } = useWorkspace();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  // Group nodes into slides: Root slide + 1 slide per primary child branch
  const rootNode = nodes.find((n) => !n.parentId) || nodes[0];
  const primaryBranches = nodes.filter((n) => n.parentId === rootNode?.id);

  const slides = [
    {
      title: activeMap?.title || 'MindFlow Presentation',
      subtitle: activeMap?.description || 'Executive Presentation & Strategic Architecture',
      badge: 'Overview',
      bullets: primaryBranches.map((b) => b.title),
      notes: 'Introduce core goals, high-level thesis, and roadmap structure.',
    },
    ...primaryBranches.map((branch) => {
      const subChildren = nodes.filter((n) => n.parentId === branch.id);
      return {
        title: branch.title,
        subtitle: branch.description || `Branch Pillar under ${rootNode?.title || 'Strategy'}`,
        badge: branch.type || 'Pillar',
        bullets:
          subChildren.length > 0
            ? subChildren.map((c) => c.title)
            : ['Core functional milestone', 'Deliverable timeline & ownership', 'Risk & mitigation plan'],
        notes: `Focus on ${branch.title} details, tactical execution steps, and dependencies.`,
      };
    }),
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden bg-slate-900 text-white ${
        isFullscreen ? 'fixed inset-0 z-50 p-6' : 'p-6 lg:p-8'
      }`}
    >
      {/* Top Deck Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">{activeMap?.title || 'Presentation'}</h2>
            <span className="text-[11px] text-slate-400">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showNotes ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Presenter Notes</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl aspect-[16/9] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Header */}
          <div>
            <div className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
              {currentSlide.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 font-normal">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Slide Bullets */}
          <div className="my-auto py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentSlide.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-slate-200">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80">
            <span>MindFlow AI Workspace</span>
            <span>
              {currentSlideIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Presenter Notes & Navigation Bar */}
      <div className="border-t border-slate-800 pt-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Presenter Notes */}
        {showNotes && (
          <div className="flex-1 text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-start gap-2 max-w-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300">Presenter Tip: </span>
              <span>{currentSlide.notes}</span>
            </div>
          </div>
        )}

        {/* Slide Carousel Thumbnails & Prev/Next */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlideIndex === idx ? 'bg-indigo-500 w-6' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
