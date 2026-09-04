import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Presentation,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Layers,
  Sparkles,
  Download,
  Share2,
  Sun,
  Moon,
  Palette,
  Clock,
  RotateCcw,
  PenTool,
  MousePointer,
  Focus,
  Eye,
  Settings2,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Printer,
  Volume2,
  BookOpen,
  ArrowRight,
  HelpCircle,
  X,
  Sliders,
  Layout,
  Columns,
  Grid,
  ListOrdered,
  TrendingUp,
  CheckCircle2,
  MoveLeft,
  MoveRight,
} from 'lucide-react';

export type SlideTheme = 'light' | 'cream' | 'dark' | 'indigo' | 'slate';
export type SlideLayoutType = 'cards' | 'split' | 'hero_stat' | 'timeline' | 'hierarchy';

export interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  layout: SlideLayoutType;
  bullets: string[];
  notes: string;
  stats?: { value: string; label: string; change?: string }[];
  keyTakeaway?: string;
  sourceNodeId?: string;
}

export const PresentationView: React.FC = () => {
  const { activeMap, nodes, setCurrentView } = useWorkspace();

  // Primary State
  const [theme, setTheme] = useState<SlideTheme>('light');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showThumbnailDrawer, setShowThumbnailDrawer] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Presenter Tools
  const [toolMode, setToolMode] = useState<'cursor' | 'laser' | 'pen' | 'spotlight'>('cursor');
  const [penColor, setPenColor] = useState<string>('#ef4444');
  const [screenBlank, setScreenBlank] = useState<'none' | 'black' | 'white'>('none');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Timer & Auto-play State
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5); // seconds
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  // Drawing Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Laser Pointer Coordinates
  const [laserPos, setLaserPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLaser, setShowLaser] = useState(false);

  // Slide Deck Structure Derived from Active Map
  const rootNode = useMemo(() => nodes.find((n) => !n.parentId) || nodes[0], [nodes]);
  const primaryBranches = useMemo(
    () => (rootNode ? nodes.filter((n) => n.parentId === rootNode.id) : []),
    [nodes, rootNode]
  );

  // Initialize slides from Mind Map
  const initialSlides: SlideData[] = useMemo(() => {
    const root = nodes.find((n) => !n.parentId) || nodes[0];
    const branches = root ? nodes.filter((n) => n.parentId === root.id) : [];

    const list: SlideData[] = [
      {
        id: 'slide-root',
        title: activeMap?.title || 'Executive Strategy & Architecture',
        subtitle: activeMap?.description || 'Strategic Vision, Core Pillars, and Implementation Roadmap',
        badge: 'Executive Overview',
        layout: 'split',
        keyTakeaway: 'Transforming complexity into a structured, executable strategic framework.',
        bullets: branches.length > 0 
          ? branches.map((b) => b.title)
          : ['Core Vision & Strategy', 'Execution Pillars', 'Milestones & Deliverables', 'Risk & Impact Assessment'],
        notes: 'Welcome stakeholders. Set the stage by highlighting core objectives and overarching value delivery.',
        stats: [
          { value: `${nodes.length}`, label: 'Architecture Nodes' },
          { value: `${branches.length}`, label: 'Core Pillars' },
          { value: '100%', label: 'Cloud Synced' },
        ],
        sourceNodeId: root?.id,
      },
      ...branches.map((branch, idx) => {
        const subChildren = nodes.filter((n) => n.parentId === branch.id);
        const subSubCount = nodes.filter((n) => subChildren.some((c) => c.id === n.parentId)).length;
        
        // Select an appropriate layout variant based on content
        let layoutChoice: SlideLayoutType = 'cards';
        if (idx === 0) layoutChoice = 'cards';
        else if (idx === 1) layoutChoice = 'split';
        else if (idx === 2) layoutChoice = 'hero_stat';
        else layoutChoice = 'timeline';

        return {
          id: `slide-branch-${branch.id}`,
          title: branch.title,
          subtitle: branch.description || `Strategic Pillar #${idx + 1} under ${root?.title || 'Main Plan'}`,
          badge: `Pillar 0${idx + 1}`,
          layout: layoutChoice,
          keyTakeaway: `${branch.title} is critical for accelerating deliverables and aligning team ownership.`,
          bullets:
            subChildren.length > 0
              ? subChildren.map((c) => c.title)
              : [
                  'Strategic milestone planning & team assignment',
                  'Resource optimization & tooling leverage',
                  'Risk mitigation and cross-functional dependencies',
                ],
          notes: `Walk through ${branch.title}. Highlight high-impact deliverables, timelines, and measurable success metrics.`,
          stats: [
            { value: `${subChildren.length || 3}`, label: 'Sub-Objectives' },
            { value: `${subSubCount > 0 ? subSubCount : 100}%`, label: subSubCount > 0 ? 'Action Items' : 'On Track' },
          ],
          sourceNodeId: branch.id,
        };
      }),
    ];

    // Add a conclusion / summary slide if more than 2 slides
    if (branches.length > 0) {
      list.push({
        id: 'slide-conclusion',
        title: 'Summary & Action Next Steps',
        subtitle: 'Key Decisions, Owners, and Near-Term Milestones',
        badge: 'Next Steps',
        layout: 'timeline',
        keyTakeaway: 'Clear accountability and rapid execution across all milestone streams.',
        bullets: [
          'Immediate Step: Finalize scope & resource allocation',
          'Sprint 1: Deploy initial architecture and baseline workflows',
          'Sprint 2: Review early KPI signals and iterate based on team feedback',
          'Review: Bi-weekly stakeholder alignment sync',
        ],
        notes: 'Summarize key takeaways, assign clear ownership, and open the floor for executive Q&A.',
        stats: [
          { value: 'Sprint 1', label: 'Launch Phase' },
          { value: 'Next Mon', label: 'Kickoff Sync' },
        ],
      });
    }

    return list;
  }, [activeMap?.id, activeMap?.title, activeMap?.description, nodes]);

  // Customizable local slides state
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);

  // Sync slides when activeMap or nodes change
  useEffect(() => {
    setSlides(initialSlides);
    setCurrentSlideIndex(0);
  }, [initialSlides]);

  // Ensure current slide index is in bounds
  const currentSlide = slides[currentSlideIndex] || slides[0] || initialSlides[0];

  // Presentation Timer Clock
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Auto-Play Slideshow Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (isAutoPlay) {
      const stepMs = 100;
      const totalSteps = (autoPlayInterval * 1000) / stepMs;
      let currentStep = 0;

      progressTimer = setInterval(() => {
        currentStep++;
        setAutoPlayProgress((currentStep / totalSteps) * 100);
      }, stepMs);

      interval = setInterval(() => {
        setCurrentSlideIndex((prev) => {
          if (prev >= slides.length - 1) {
            return 0; // Loop back to start
          }
          return prev + 1;
        });
        currentStep = 0;
        setAutoPlayProgress(0);
      }, autoPlayInterval * 1000);
    } else {
      setAutoPlayProgress(0);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressTimer);
    };
  }, [isAutoPlay, autoPlayInterval, slides.length]);

  // Clear drawing canvas when changing slides
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [currentSlideIndex]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
        case 'PageDown':
          e.preventDefault();
          setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlideIndex(slides.length - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFullscreen((prev) => !prev);
          break;
        case 'Escape':
          if (screenBlank !== 'none') {
            setScreenBlank('none');
          } else if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
        case 'b':
        case 'B':
          setScreenBlank((prev) => (prev === 'black' ? 'none' : 'black'));
          break;
        case 'w':
        case 'W':
          setScreenBlank((prev) => (prev === 'white' ? 'none' : 'white'));
          break;
        case 'l':
        case 'L':
          setToolMode((prev) => (prev === 'laser' ? 'cursor' : 'laser'));
          break;
        case 'p':
        case 'P':
          setToolMode((prev) => (prev === 'pen' ? 'cursor' : 'pen'));
          break;
        case 'n':
        case 'N':
          setShowNotes((prev) => !prev);
          break;
        case '?':
          setShowShortcutsModal((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen, screenBlank]);

  // Format Elapsed Seconds to MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Theme Styles Dictionary
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'light':
        return {
          wrapperBg: 'bg-slate-100',
          deckBg: 'bg-white',
          border: 'border-slate-200/90 shadow-xl shadow-slate-200/50',
          titleColor: 'text-slate-900',
          subtitleColor: 'text-slate-600',
          bodyColor: 'text-slate-700',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          cardBg: 'bg-slate-50/80 border-slate-200 text-slate-800 hover:border-indigo-300',
          cardBulletNum: 'bg-indigo-600 text-white',
          footerBorder: 'border-slate-100 text-slate-400',
          accent: 'text-indigo-600',
          takeawayBg: 'bg-indigo-50/60 border-indigo-100 text-indigo-900',
          glow: 'bg-indigo-500/5',
        };
      case 'cream':
        return {
          wrapperBg: 'bg-stone-200',
          deckBg: 'bg-[#faf8f5]',
          border: 'border-[#e8e2d8] shadow-xl shadow-stone-300/40',
          titleColor: 'text-stone-900',
          subtitleColor: 'text-stone-600',
          bodyColor: 'text-stone-700',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          cardBg: 'bg-[#f4efe6] border-[#e2d9cb] text-stone-800 hover:border-amber-400',
          cardBulletNum: 'bg-amber-700 text-white',
          footerBorder: 'border-[#ede7dc] text-stone-500',
          accent: 'text-amber-800',
          takeawayBg: 'bg-amber-50 border-amber-200 text-amber-950',
          glow: 'bg-amber-500/5',
        };
      case 'dark':
        return {
          wrapperBg: 'bg-slate-950',
          deckBg: 'bg-slate-900',
          border: 'border-slate-800 shadow-2xl shadow-black/90 ring-1 ring-slate-800/50',
          titleColor: 'text-white',
          subtitleColor: 'text-slate-300',
          bodyColor: 'text-slate-200',
          badgeBg: 'bg-indigo-500/25 text-indigo-200 border-indigo-500/40',
          cardBg: 'bg-slate-800/90 border-slate-700 text-slate-100 hover:border-indigo-400 hover:bg-slate-800',
          cardBulletNum: 'bg-indigo-600 text-white font-bold',
          footerBorder: 'border-slate-800 text-slate-400',
          accent: 'text-indigo-400',
          takeawayBg: 'bg-slate-800/90 border-slate-700 text-indigo-100',
          glow: 'bg-indigo-600/15',
        };
      case 'indigo':
        return {
          wrapperBg: 'bg-slate-950',
          deckBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950',
          border: 'border-indigo-700/60 shadow-2xl shadow-indigo-950/90 ring-1 ring-indigo-500/30',
          titleColor: 'text-white',
          subtitleColor: 'text-indigo-200',
          bodyColor: 'text-indigo-50',
          badgeBg: 'bg-indigo-500/40 text-indigo-100 border-indigo-400/50',
          cardBg: 'bg-indigo-900/50 border-indigo-700/60 text-indigo-50 hover:border-indigo-400 hover:bg-indigo-900/70',
          cardBulletNum: 'bg-indigo-400 text-indigo-950 font-black',
          footerBorder: 'border-indigo-900/80 text-indigo-200',
          accent: 'text-indigo-300',
          takeawayBg: 'bg-indigo-900/70 border-indigo-600/70 text-white',
          glow: 'bg-indigo-500/30',
        };
      case 'slate':
      default:
        return {
          wrapperBg: 'bg-slate-200',
          deckBg: 'bg-slate-50',
          border: 'border-slate-300 shadow-xl shadow-slate-300/50',
          titleColor: 'text-slate-900',
          subtitleColor: 'text-slate-600',
          bodyColor: 'text-slate-700',
          badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
          cardBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-400',
          cardBulletNum: 'bg-slate-800 text-white',
          footerBorder: 'border-slate-200 text-slate-500',
          accent: 'text-slate-800',
          takeawayBg: 'bg-slate-100 border-slate-300 text-slate-900',
          glow: 'bg-slate-400/5',
        };
    }
  }, [theme]);

  // Drawing Canvas Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Laser Tracker
    if (toolMode === 'laser' || toolMode === 'spotlight') {
      setLaserPos({ x, y });
      setShowLaser(true);
    }

    // Pen Drawing
    if (toolMode === 'pen' && isDrawingRef.current && lastPointRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        lastPointRef.current = { x, y };
      }
    }
  };

  const handleCanvasMouseUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvasDrawings = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // AI Speaker Script Generator (Client-Side Smart Generator)
  const handleGenerateAISpeakerNotes = () => {
    if (!currentSlide) return;
    const bulletsContext = currentSlide.bullets.join(', ');
    const generatedScript = `Presenting "${currentSlide.title}": Begin by addressing the core objective: ${currentSlide.subtitle}. Guide the audience through our ${currentSlide.bullets.length} key points: ${bulletsContext}. Emphasize that ${currentSlide.keyTakeaway || 'this directly drives measurable impact'}. Conclude with clear team ownership and ask for immediate stakeholder alignment.`;

    setSlides((prev) =>
      prev.map((s, idx) => (idx === currentSlideIndex ? { ...s, notes: generatedScript } : s))
    );
    setCopiedNotification('AI Speaker Script Updated!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Slide Management Helpers
  const handleAddSlide = () => {
    const newSlide: SlideData = {
      id: `custom-slide-${Date.now()}`,
      title: 'New Strategic Section',
      subtitle: 'Key Deliverables, Metrics, and Responsibilities',
      badge: 'Custom Slide',
      layout: 'cards',
      keyTakeaway: 'Focus on strategic outcomes and alignment.',
      bullets: ['Define core milestone', 'Establish deliverable timeline', 'Mitigate risk factors'],
      notes: 'Introduce this section clearly and highlight key milestones.',
      stats: [{ value: 'Q3', label: 'Timeline Target' }],
    };

    const newIndex = currentSlideIndex + 1;
    const updated = [...slides.slice(0, newIndex), newSlide, ...slides.slice(newIndex)];
    setSlides(updated);
    setCurrentSlideIndex(newIndex);
  };

  const handleDuplicateSlide = () => {
    if (!currentSlide) return;
    const duplicated: SlideData = {
      ...currentSlide,
      id: `duplicate-${Date.now()}`,
      title: `${currentSlide.title} (Copy)`,
    };
    const newIndex = currentSlideIndex + 1;
    const updated = [...slides.slice(0, newIndex), duplicated, ...slides.slice(newIndex)];
    setSlides(updated);
    setCurrentSlideIndex(newIndex);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, idx) => idx !== currentSlideIndex);
    setSlides(updated);
    setCurrentSlideIndex((prev) => Math.min(prev, updated.length - 1));
  };

  const handleMoveSlide = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentSlideIndex > 0) {
      const updated = [...slides];
      const temp = updated[currentSlideIndex];
      updated[currentSlideIndex] = updated[currentSlideIndex - 1];
      updated[currentSlideIndex - 1] = temp;
      setSlides(updated);
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else if (direction === 'right' && currentSlideIndex < slides.length - 1) {
      const updated = [...slides];
      const temp = updated[currentSlideIndex];
      updated[currentSlideIndex] = updated[currentSlideIndex + 1];
      updated[currentSlideIndex + 1] = temp;
      setSlides(updated);
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  // Export to Markdown / Outline
  const handleExportMarkdown = () => {
    const md = slides
      .map(
        (s, idx) => `## Slide ${idx + 1}: ${s.title}
*${s.subtitle}* [${s.badge}]

${s.bullets.map((b) => `- ${b}`).join('\n')}

> **Key Takeaway:** ${s.keyTakeaway || 'N/A'}
> **Presenter Notes:** ${s.notes}
`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(md);
    setCopiedNotification('Markdown presentation copied to clipboard!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Trigger Print to PDF
  const handlePrintDeck = () => {
    window.print();
  };

  // Blackout / Whiteout screen overlays
  if (screenBlank !== 'none') {
    return (
      <div
        onClick={() => setScreenBlank('none')}
        className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer ${
          screenBlank === 'black' ? 'bg-black text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="text-center space-y-2 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-sm font-semibold">
            Screen {screenBlank === 'black' ? 'Blackout' : 'Whiteout'} Active
          </p>
          <p className="text-xs">Press B, W, or click anywhere to restore presentation</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 ${
        themeConfig.wrapperBg
      } ${isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6' : 'p-4 sm:p-6 lg:p-8'}`}
    >
      {/* Top Header Command Bar */}
      <div
        className={`flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/80 ${
          theme === 'dark' || theme === 'indigo' ? 'border-slate-800' : ''
        }`}
      >
        {/* Left: Presentation Info & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('canvas')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Back to Canvas"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Canvas</span>
          </button>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {activeMap?.title || 'Executive Deck'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-indigo-600">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                <span>•</span>
                <span className="capitalize">{currentSlide.layout} layout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Auto-Play Controls */}
        <div className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formattedTime}</span>
          </div>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setElapsedSeconds(0)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Auto-Play Toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              isAutoPlay
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Auto-play presentation slideshow"
          >
            {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Auto ({autoPlayInterval}s)</span>
          </button>
        </div>

        {/* Right: Theme Selector, Presenter Tools & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Dropdown */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 rounded-xl shadow-2xs">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Crisp Studio Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('cream')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'cream'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Warm Editorial Cream"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Pitch Dark Executive"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('indigo')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'indigo'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Indigo Luxury Gradient"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Presenter Tool Mode Selector */}
          <div className="hidden lg:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 rounded-xl shadow-2xs">
            <button
              onClick={() => setToolMode('cursor')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                toolMode === 'cursor' ? 'bg-slate-200 dark:bg-slate-700 text-indigo-600' : 'text-slate-400'
              }`}
              title="Pointer Mode"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setToolMode('laser')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                toolMode === 'laser' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-red-500'
              }`}
              title="Laser Pointer (L)"
            >
              <Focus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setToolMode('pen')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                toolMode === 'pen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'
              }`}
              title="Draw Annotations (P)"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            {toolMode === 'pen' && (
              <button
                onClick={clearCanvasDrawings}
                className="text-[10px] font-bold px-1.5 py-0.5 text-slate-500 hover:text-red-600 cursor-pointer"
                title="Clear drawings"
              >
                Clear
              </button>
            )}
          </div>

          {/* Edit Slide Modal Button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Edit Current Slide"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          </button>

          {/* Export & Outline Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Export Presentation Deck"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Notes */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showNotes
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Deck (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Auto-Play Progress Bar */}
      {isAutoPlay && (
        <div className="w-full bg-slate-200 h-1 overflow-hidden mb-2 rounded-full">
          <div
            className="bg-indigo-600 h-full transition-all duration-100"
            style={{ width: `${autoPlayProgress}%` }}
          />
        </div>
      )}

      {/* Notification Toast */}
      {copiedNotification && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Main Presentation Stage & Canvas */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative min-h-0">
        <div
          className={`w-full max-w-5xl aspect-[16/9] rounded-3xl ${themeConfig.deckBg} border ${themeConfig.border} p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-200 select-none`}
        >
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute -top-24 -right-24 w-96 h-96 ${themeConfig.glow} rounded-full blur-3xl pointer-events-none`}
          />

          {/* Slide Header: Badge, Title, Subtitle */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span
                className={`inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${themeConfig.badgeBg}`}
              >
                {currentSlide.badge}
              </span>

              <span className="text-xs font-mono font-semibold text-slate-400">
                0{currentSlideIndex + 1} / 0{slides.length}
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-extrabold font-display ${themeConfig.titleColor} tracking-tight leading-snug`}
            >
              {currentSlide.title}
            </h1>
            <p className={`text-xs sm:text-sm md:text-base ${themeConfig.subtitleColor} mt-1.5 max-w-3xl leading-relaxed`}>
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Dynamic Layout Content Body */}
          <div className="my-auto py-3 sm:py-5">
            {/* 1. Split Layout / Executive Keynote */}
            {currentSlide.layout === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left Key Takeaway Callout */}
                <div
                  className={`md:col-span-5 p-5 sm:p-6 rounded-2xl border ${themeConfig.takeawayBg} flex flex-col justify-between h-full`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-2">
                    Executive Focus
                  </span>
                  <p className="text-sm sm:text-base font-bold leading-relaxed italic">
                    "{currentSlide.keyTakeaway || currentSlide.subtitle}"
                  </p>
                  {currentSlide.stats && currentSlide.stats.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-current/10 flex items-center gap-4">
                      {currentSlide.stats.map((stat, i) => (
                        <div key={i}>
                          <div className="text-lg font-black">{stat.value}</div>
                          <div className="text-[10px] opacity-70 uppercase font-bold">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Bullet Points */}
                <div className="md:col-span-7 space-y-2.5">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${themeConfig.cardBg} flex items-center gap-3 transition-all`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg ${themeConfig.cardBulletNum} flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold ${themeConfig.bodyColor}`}>
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Hero Stats & Metrics Layout */}
            {currentSlide.layout === 'hero_stat' && (
              <div className="space-y-4">
                {currentSlide.stats && currentSlide.stats.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    {currentSlide.stats.map((stat, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border ${themeConfig.cardBg} text-center`}
                      >
                        <div className={`text-3xl sm:text-4xl font-black ${themeConfig.accent}`}>
                          {stat.value}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border ${themeConfig.cardBg} flex items-center gap-2.5`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${themeConfig.accent} shrink-0`} />
                      <span className={`text-xs sm:text-sm font-medium ${themeConfig.bodyColor}`}>
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Timeline / Step Sequence Layout */}
            {currentSlide.layout === 'timeline' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {currentSlide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${themeConfig.cardBg} flex flex-col justify-between relative`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          Step 0{idx + 1}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className={`text-xs sm:text-sm font-bold ${themeConfig.bodyColor} mt-2`}>
                        {bullet}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-slate-400 font-medium">Phase {idx + 1} Action</div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Standard Cards Grid Layout (Default) */}
            {(currentSlide.layout === 'cards' || currentSlide.layout === 'hierarchy') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentSlide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-2xl border ${themeConfig.cardBg} flex items-start gap-3.5 transition-all`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl ${themeConfig.cardBulletNum} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold ${themeConfig.bodyColor}`}>
                        {bullet}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        Aligned with {activeMap?.title || 'mind map'} strategic deliverable.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slide Footer */}
          <div
            className={`flex items-center justify-between text-xs pt-3.5 border-t ${themeConfig.footerBorder}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{activeMap?.title || 'MindFlow Deck'}</span>
              <span>•</span>
              <span>{activeMap?.category || 'Strategic Planning'}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Use ← / → keys to navigate
              </span>
              <span className="font-mono font-bold">
                {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>
          </div>

          {/* Interactive Annotation / Laser Canvas Layer */}
          <canvas
            ref={canvasRef}
            width={1200}
            height={675}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className={`absolute inset-0 w-full h-full pointer-events-auto ${
              toolMode === 'pen'
                ? 'cursor-crosshair'
                : toolMode === 'laser'
                ? 'cursor-none'
                : 'pointer-events-none'
            }`}
          />

          {/* Laser Pointer Dot */}
          {toolMode === 'laser' && showLaser && (
            <div
              className="absolute w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_4px_rgba(239,68,68,0.8)] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 z-40 animate-pulse"
              style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
            />
          )}
        </div>
      </div>

      {/* Presenter Notes Bar & Bottom Toolbar */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Speaker Notes & AI Talking Points */}
        {showNotes ? (
          <div className="flex-1 w-full md:max-w-2xl bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Presenter Notes & Talking Points:
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {currentSlide.notes}
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAISpeakerNotes}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Generate AI Talking Points"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Script</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">Presenter notes hidden (Press N to toggle)</div>
        )}

        {/* Right: Slide Reordering & Carousel Controls */}
        <div className="flex items-center gap-2.5">
          {/* Move Slide Left/Right */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => handleMoveSlide('left')}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
              title="Move Slide Left"
            >
              <MoveLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMoveSlide('right')}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
              title="Move Slide Right"
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add / Duplicate / Delete Slide Buttons */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={handleAddSlide}
              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 cursor-pointer"
              title="Add New Slide"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDuplicateSlide}
              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 cursor-pointer"
              title="Duplicate Current Slide"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteSlide}
              disabled={slides.length <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
              title="Delete Slide"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="deck-prev-btn"
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer shadow-2xs"
              title="Previous Slide (← / Space)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="deck-next-btn"
              onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 transition-colors cursor-pointer shadow-xs"
              title="Next Slide (→ / Space)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Slide Thumbnail Strip Drawer */}
      {showThumbnailDrawer && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`flex-shrink-0 w-36 h-20 rounded-xl p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                currentSlideIndex === idx
                  ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate max-w-[80px]">
                  {s.badge}
                </span>
                <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
              </div>
              <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {s.title}
              </h4>
              <div className="text-[9px] text-slate-400 truncate">
                {s.bullets.length} points • {s.layout}
              </div>
            </button>
          ))}

          {/* Add Slide Plus Card in Strip */}
          <button
            onClick={handleAddSlide}
            className="flex-shrink-0 w-24 h-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
            title="Add Slide"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">+ Slide</span>
          </button>
        </div>
      )}

      {/* Edit Current Slide Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-xl w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Slide #{currentSlideIndex + 1}</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slide Title
                </label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSlides((prev) =>
                      prev.map((s, i) => (i === currentSlideIndex ? { ...s, title: val } : s))
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle / Context
                </label>
                <input
                  type="text"
                  value={currentSlide.subtitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSlides((prev) =>
                      prev.map((s, i) => (i === currentSlideIndex ? { ...s, subtitle: val } : s))
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge / Category
                  </label>
                  <input
                    type="text"
                    value={currentSlide.badge}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSlides((prev) =>
                        prev.map((s, i) => (i === currentSlideIndex ? { ...s, badge: val } : s))
                      );
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Layout Style
                  </label>
                  <select
                    value={currentSlide.layout}
                    onChange={(e) => {
                      const val = e.target.value as SlideLayoutType;
                      setSlides((prev) =>
                        prev.map((s, i) => (i === currentSlideIndex ? { ...s, layout: val } : s))
                      );
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="cards">Standard Cards</option>
                    <option value="split">Executive Split</option>
                    <option value="hero_stat">Hero Stat & Metrics</option>
                    <option value="timeline">Timeline Sequence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bullet Points (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={currentSlide.bullets.join('\n')}
                  onChange={(e) => {
                    const bullets = e.target.value.split('\n').filter((b) => b.trim() !== '');
                    setSlides((prev) =>
                      prev.map((s, i) => (i === currentSlideIndex ? { ...s, bullets } : s))
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Speaker Notes
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.notes}
                  onChange={(e) => {
                    const notes = e.target.value;
                    setSlides((prev) =>
                      prev.map((s, i) => (i === currentSlideIndex ? { ...s, notes } : s))
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export & Sharing Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export Presentation</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  handlePrintDeck();
                  setShowExportModal(false);
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Print / Save as PDF</h4>
                  <p className="text-[11px] text-slate-500">
                    Export high-res 16:9 presentation slides ready for distribution.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  handleExportMarkdown();
                  setShowExportModal(false);
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Copy Markdown Presentation</h4>
                  <p className="text-[11px] text-slate-500">
                    Copy complete structured outline with notes to clipboard.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowExportModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
