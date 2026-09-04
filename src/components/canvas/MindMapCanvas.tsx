import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CanvasNode } from './CanvasNode';
import { MindNode, MapLayout } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Undo2,
  Redo2,
  Sparkles,
  Layers,
  Map as MapIcon,
  HelpCircle,
  Search,
  CheckCircle2,
  Loader2,
  Compass,
  FileUp,
  Workflow,
  Grid,
  Palette,
  Share2,
  Crosshair,
} from 'lucide-react';
import { DocumentIngestModal } from './DocumentIngestModal';

export const MindMapCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    activeMap,
    activeLayout,
    changeMapLayout,
    autoArrangeMap,
    selectedNodeId,
    selectedNodeIds,
    setSelectedNodeId,
    editingNodeId,
    setEditingNodeId,
    toggleNodeSelection,
    zoom,
    setZoom,
    pan,
    setPan,
    fitToScreen,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    isSyncing,
    lastSyncedAt,
    syncError,
    syncStatus,
    syncNow,
    searchQuery,
    setSearchQuery,
    searchResults,
    updateNodePosition,
    addNodeChild,
    addNodeSibling,
    deleteNode,
    duplicateNode,
    toggleNodeCollapse,
    convertNodeToTask,
    setIsKeyboardShortcutsOpen,
    setIsAIGeneratorOpen,
    setIsMultimodalOpen,
    setIsAIAssistantOpen,
    setIsExportShareOpen,
  } = useWorkspace();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  // Fullscreen and Texture State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasTexture, setCanvasTexture] = useState<'dots' | 'grid' | 'blank' | 'dark'>('dots');
  const [showTextureMenu, setShowTextureMenu] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const centerOnRoot = useCallback(() => {
    const rootId = activeMap?.rootNodeId || nodes.find((n) => !n.parentId)?.id;
    if (rootId) {
      const rootNode = nodes.find((n) => n.id === rootId);
      if (rootNode && containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        setPan({
          x: cw / 2 - (rootNode.x + rootNode.width / 2),
          y: ch / 2 - (rootNode.y + rootNode.height / 2),
        });
        setZoom(1);
        setLayoutNotice('Centered on root idea');
        setTimeout(() => setLayoutNotice(null), 2000);
      }
    }
  }, [activeMap?.rootNodeId, nodes, setPan, setZoom]);

  // Dragging individual node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [touchPinchDist, setTouchPinchDist] = useState<number | null>(null);
  const [touchInitialZoom, setTouchInitialZoom] = useState<number>(1);

  // Mini-map visible
  const [showMinimap, setShowMinimap] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [layoutNotice, setLayoutNotice] = useState<string | null>(null);

  // Auto-layout trigger handler
  const handleAutoLayout = useCallback((targetLayout?: MapLayout) => {
    // Default to 'tree' (hierarchical tree structure) or preferred layout
    const layout = targetLayout || (activeLayout === 'left-to-right' ? 'left-to-right' : 'tree');
    autoArrangeMap(layout);
    setLayoutNotice('Hierarchical tree layout applied');
    const timer = setTimeout(() => {
      setLayoutNotice(null);
    }, 2400);
    return () => clearTimeout(timer);
  }, [activeLayout, autoArrangeMap]);

  // Drag and Drop File Ingestion
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [dragHoverNodeId, setDragHoverNodeId] = useState<string | null>(null);
  const [ingestFile, setIngestFile] = useState<File | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const dragCounterRef = useRef(0);
  const canvasFileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Quick zoom controls
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.15, 3));
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.15, 0.25));
        return;
      }

      // If no node selected, default to active root node or first node for seamless keyboard interaction
      const effectiveNodeId = selectedNodeId || (nodes.length > 0 ? (activeMap?.rootNodeId || nodes[0]?.id) : null);

      // Node Actions
      if (e.key === 'F2' && effectiveNodeId) {
        e.preventDefault();
        if (!selectedNodeId) setSelectedNodeId(effectiveNodeId);
        setEditingNodeId(effectiveNodeId);
      } else if (e.key === 'Escape') {
        if (editingNodeId) {
          e.preventDefault();
          setEditingNodeId(null);
        } else if (selectedNodeId) {
          setSelectedNodeId(null);
        }
      } else if (e.key === 'Tab' && effectiveNodeId && !editingNodeId) {
        e.preventDefault();
        if (!selectedNodeId) setSelectedNodeId(effectiveNodeId);
        addNodeChild(effectiveNodeId);
      } else if (e.key === 'Enter' && effectiveNodeId && !editingNodeId) {
        e.preventDefault();
        if (!selectedNodeId) setSelectedNodeId(effectiveNodeId);
        addNodeSibling(effectiveNodeId);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && !editingNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && effectiveNodeId && !editingNodeId) {
        e.preventDefault();
        duplicateNode(effectiveNodeId);
      } else if (e.key === ' ' && effectiveNodeId && !editingNodeId) {
        e.preventDefault();
        toggleNodeCollapse(effectiveNodeId);
      } else if ((e.key === 't' || e.key === 'T') && effectiveNodeId && !editingNodeId && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        convertNodeToTask(effectiveNodeId);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') ||
        (e.altKey && e.key.toLowerCase() === 'l')
      ) {
        e.preventDefault();
        handleAutoLayout();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('canvas-search-input');
        searchInput?.focus();
      } else if (!editingNodeId) {
        // Arrow Keys Tree Navigation
        if (!selectedNodeId && effectiveNodeId) {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            setSelectedNodeId(effectiveNodeId);
            return;
          }
        }
        if (selectedNodeId) {
          const currNode = nodes.find((n) => n.id === selectedNodeId);
          if (currNode) {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              if (currNode.parentId) {
                setSelectedNodeId(currNode.parentId);
              }
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              const childNodes = nodes.filter((n) => n.parentId === selectedNodeId);
              if (childNodes.length > 0) {
                setSelectedNodeId(childNodes[0].id);
              }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const siblings = currNode.parentId
                ? nodes.filter((n) => n.parentId === currNode.parentId)
                : nodes.filter((n) => !n.parentId);
              const currIdx = siblings.findIndex((n) => n.id === currNode.id);
              if (currIdx !== -1) {
                if (e.key === 'ArrowDown' && currIdx < siblings.length - 1) {
                  setSelectedNodeId(siblings[currIdx + 1].id);
                } else if (e.key === 'ArrowUp' && currIdx > 0) {
                  setSelectedNodeId(siblings[currIdx - 1].id);
                }
              }
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    editingNodeId,
    nodes,
    setEditingNodeId,
    setSelectedNodeId,
    addNodeChild,
    addNodeSibling,
    deleteNode,
    duplicateNode,
    toggleNodeCollapse,
    convertNodeToTask,
    setIsKeyboardShortcutsOpen,
    undo,
    redo,
    setZoom,
    setPan,
    handleAutoLayout,
  ]);

  // Non-passive event listeners for flawless canvas pan/zoom without browser scrolling conflict
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventScrollWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
        setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.25), 3));
      } else {
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    const preventDefaultTouch = (e: TouchEvent) => {
      if (e.target === el || (e.target as HTMLElement)?.id === 'canvas-svg-layer') {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', preventScrollWheel, { passive: false });
    el.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    el.addEventListener('touchmove', preventDefaultTouch, { passive: false });

    return () => {
      el.removeEventListener('wheel', preventScrollWheel);
      el.removeEventListener('touchstart', preventDefaultTouch);
      el.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, [setZoom, setPan]);

  // Zoom with wheel (React fallback)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.25), 3));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Canvas Pan Handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-svg-layer')) {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      setEditingNodeId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y,
      });
    } else if (draggingNodeId) {
      const currentZoom = zoom;
      const targetNode = nodes.find((n) => n.id === draggingNodeId);
      if (targetNode && containerRef.current) {
        const newX = (e.clientX - pan.x - containerRef.current.getBoundingClientRect().left) / currentZoom - dragOffset.x;
        const newY = (e.clientY - pan.y - containerRef.current.getBoundingClientRect().top) / currentZoom - dragOffset.y;
        updateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Touch Handlers for Mobile and Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-svg-layer') {
        setIsPanning(true);
        setStartPanPos({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        setSelectedNodeId(null);
        setEditingNodeId(null);
      }
    } else if (e.touches.length === 2) {
      // 2 fingers pinch to zoom
      setIsPanning(false);
      setDraggingNodeId(null);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      setTouchPinchDist(dist);
      setTouchInitialZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (isPanning) {
        setPan({
          x: touch.clientX - startPanPos.x,
          y: touch.clientY - startPanPos.y,
        });
      } else if (draggingNodeId) {
        const targetNode = nodes.find((n) => n.id === draggingNodeId);
        if (targetNode && containerRef.current) {
          const newX = (touch.clientX - pan.x - containerRef.current.getBoundingClientRect().left) / zoom - dragOffset.x;
          const newY = (touch.clientY - pan.y - containerRef.current.getBoundingClientRect().top) / zoom - dragOffset.y;
          updateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
        }
      }
    } else if (e.touches.length === 2 && touchPinchDist) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = dist / touchPinchDist;
      setZoom(Math.min(Math.max(touchInitialZoom * scale, 0.25), 3));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setTouchPinchDist(null);
  };

  // Node Drag Start (Mouse)
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorCanvasX = (e.clientX - pan.x - rect.left) / zoom;
    const cursorCanvasY = (e.clientY - pan.y - rect.top) / zoom;

    setDragOffset({
      x: cursorCanvasX - node.x,
      y: cursorCanvasY - node.y,
    });
    setDraggingNodeId(nodeId);
  };

  // Node Drag Start (Touch)
  const handleNodeTouchDragStart = (e: React.TouchEvent, nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !containerRef.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const cursorCanvasX = (touch.clientX - pan.x - rect.left) / zoom;
    const cursorCanvasY = (touch.clientY - pan.y - rect.top) / zoom;

    setDragOffset({
      x: cursorCanvasX - node.x,
      y: cursorCanvasY - node.y,
    });
    setDraggingNodeId(nodeId);
  };

  // Drag-and-Drop Document Ingest Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDraggingFile(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = targetEl?.closest('[data-node-id]');
      const foundNodeId = nodeEl ? nodeEl.getAttribute('data-node-id') : null;
      if (foundNodeId !== dragHoverNodeId) {
        setDragHoverNodeId(foundNodeId);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDraggingFile(false);
        setDragHoverNodeId(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingFile(false);

      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = targetEl?.closest('[data-node-id]');
      const droppedNodeId = nodeEl ? nodeEl.getAttribute('data-node-id') : dragHoverNodeId;
      setDragHoverNodeId(null);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        setIngestFile(file);
        if (droppedNodeId) {
          setSelectedNodeId(droppedNodeId);
        }
        setIsIngestModalOpen(true);
      }
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIngestFile(file);
      setIsIngestModalOpen(true);
    }
    e.target.value = '';
  };

  // Build Children Map for collapse & child count
  const childrenCountMap = new Map<string, number>();
  nodes.forEach((n) => {
    if (n.parentId) {
      childrenCountMap.set(n.parentId, (childrenCountMap.get(n.parentId) || 0) + 1);
    }
  });

  // Calculate Bezier curve between source node and target node
  const renderEdge = (edge: any) => {
    const source = nodes.find((n) => n.id === edge.sourceId);
    const target = nodes.find((n) => n.id === edge.targetId);
    if (!source || !target) return null;

    // Source coordinates (center of source node)
    const sx = source.x + source.width / 2;
    const sy = source.y + source.height / 2;

    // Target coordinates (center of target node)
    const tx = target.x + target.width / 2;
    const ty = target.y + target.height / 2;

    const dx = tx - sx;
    const dy = ty - sy;

    let pathD = '';
    if (activeLayout === 'top-to-bottom' || activeLayout === 'bottom-to-top' || activeLayout === 'tree') {
      const cy1 = sy + dy * 0.5;
      const cy2 = ty - dy * 0.5;
      pathD = `M ${sx} ${sy} C ${sx} ${cy1}, ${tx} ${cy2}, ${tx} ${ty}`;
    } else {
      const cx1 = sx + dx * 0.5;
      const cx2 = tx - dx * 0.5;
      pathD = `M ${sx} ${sy} C ${cx1} ${sy}, ${cx2} ${ty}, ${tx} ${ty}`;
    }

    const strokeColor = edge.style?.color || source.style?.borderColor || '#cbd5e1';
    const strokeWidth = edge.style?.width || 2;

    return (
      <path
        key={edge.id}
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-300 opacity-80"
      />
    );
  };

  const LAYOUT_OPTIONS: Array<{ id: MapLayout; label: string; icon: string }> = [
    { id: 'left-to-right', label: 'Left to Right', icon: '➡️' },
    { id: 'radial', label: 'Radial Map', icon: '🌐' },
    { id: 'top-to-bottom', label: 'Top to Bottom', icon: '⬇️' },
    { id: 'tree', label: 'Hierarchy Tree', icon: '🌲' },
    { id: 'right-to-left', label: 'Right to Left', icon: '⬅️' },
    { id: 'bottom-to-top', label: 'Bottom to Top', icon: '⬆️' },
  ];

  return (
    <div
      ref={containerRef}
      id="mindmap-canvas-container"
      className={`relative w-full h-full overflow-hidden ${
        canvasTexture === 'dark'
          ? 'bg-canvas-dark text-white'
          : canvasTexture === 'grid'
          ? 'bg-canvas-grid'
          : canvasTexture === 'blank'
          ? 'bg-canvas-blank'
          : 'bg-slate-50 bg-canvas-dots'
      } cursor-crosshair select-none touch-none ${
        isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen bg-slate-900/95' : ''
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Fullscreen Exit Floating Indicator */}
      {isFullscreen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-2xl border border-slate-700 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exit Fullscreen (Press ESC or F)</span>
          </button>
        </div>
      )}
      {/* Top Floating Control Bar / Header */}
      <div className="absolute top-3 sm:top-6 left-3 sm:left-6 z-40 flex flex-col gap-1.5 max-w-[calc(100vw-130px)] sm:max-w-md pointer-events-none">
        <div className="flex flex-col gap-0.5 pointer-events-auto bg-white/80 backdrop-blur-xs p-2 sm:p-0 rounded-xl sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
          <h1 className="text-sm sm:text-lg font-semibold text-slate-800 tracking-tight truncate">
            {activeMap?.title || 'SaaS Launch Strategy'}
          </h1>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-medium">
            {isSaving ? (
              <span className="flex items-center gap-1 text-indigo-600 font-medium animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving locally...
              </span>
            ) : isSyncing || syncStatus === 'syncing' ? (
              <span className="flex items-center gap-1 text-indigo-600 font-medium animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Syncing with cloud...
              </span>
            ) : syncStatus === 'offline' ? (
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Offline (Saved locally)
              </span>
            ) : syncStatus === 'error' ? (
              <button
                onClick={() => syncNow()}
                className="flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                title={syncError || 'Sync failed'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Sync issue • Retry
              </button>
            ) : (
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {lastSyncedAt ? `Synced at ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Autosaved'}
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="hidden xs:inline">
              {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
            </span>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 mt-0.5 pointer-events-auto flex-wrap">
          {/* Layout Selector */}
          <div className="relative">
            <button
              id="layout-picker-btn"
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize hidden xs:inline">{activeLayout.replace(/-/g, ' ')}</span>
            </button>

            {showLayoutMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 w-44 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Map Layouts
                </div>
                {LAYOUT_OPTIONS.map((lo) => (
                  <button
                    key={lo.id}
                    onClick={() => {
                      changeMapLayout(lo.id);
                      setShowLayoutMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeLayout === lo.id ? 'font-bold text-indigo-600 bg-indigo-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{lo.icon}</span>
                    <span>{lo.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-layout */}
          <button
            id="auto-layout-btn"
            onClick={() => handleAutoLayout()}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-all cursor-pointer active:scale-95"
            title="Auto-layout: Clean hierarchical tree structure (Ctrl+Shift+L)"
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Auto-layout</span>
          </button>

          {/* Quick Auto Arrange alias */}
          <button
            id="auto-arrange-btn"
            onClick={() => handleAutoLayout()}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer hidden"
            title="Auto Arrange Nodes"
            aria-hidden="true"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              id="canvas-undo-btn"
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="canvas-redo-btn"
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Right Actions: Search & AI Quick Triggers */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2">
        {/* Search input in canvas (desktop only, mobile has navbar search) */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="canvas-search-input"
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-36 lg:w-48 focus:w-56 transition-all text-xs pl-8 pr-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          {searchResults.length > 0 && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
              {searchResults.length}
            </span>
          )}
        </div>

        {/* Fullscreen Toggle Button */}
        <button
          id="canvas-fullscreen-btn"
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-indigo-600 shadow-xs transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen (F / Esc)' : 'Full Screen Canvas (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* Canvas Texture Switcher */}
        <div className="relative">
          <button
            id="canvas-texture-btn"
            onClick={() => setShowTextureMenu(!showTextureMenu)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-indigo-600 shadow-xs transition-colors cursor-pointer"
            title="Switch Canvas Background Texture"
          >
            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {showTextureMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 w-40 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Background
              </div>
              {[
                { id: 'dots', label: 'Dot Grid', icon: '⚪' },
                { id: 'grid', label: 'Grid Lines', icon: '📐' },
                { id: 'blank', label: 'Clean Blank', icon: '⬜' },
                { id: 'dark', label: 'Dark Studio', icon: '🌙' },
              ].map((tex) => (
                <button
                  key={tex.id}
                  onClick={() => {
                    setCanvasTexture(tex.id as any);
                    setShowTextureMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer ${
                    canvasTexture === tex.id ? 'font-bold text-indigo-600 bg-indigo-50/60' : 'text-slate-700'
                  }`}
                >
                  <span>{tex.icon}</span>
                  <span>{tex.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Export Trigger */}
        <button
          id="canvas-export-trigger-btn"
          onClick={() => setIsExportShareOpen(true)}
          className="p-1.5 sm:p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-indigo-600 shadow-xs transition-colors cursor-pointer hidden xs:flex items-center gap-1 text-xs font-semibold px-2.5"
          title="Export & Share Map"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* AI Generator Button */}
        <button
          id="canvas-ai-gen-btn"
          onClick={() => setIsAIGeneratorOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">AI Generate</span>
        </button>

        {/* AI Copilot Side Drawer Trigger */}
        <button
          id="canvas-ai-assistant-btn"
          onClick={() => setIsAIAssistantOpen(true)}
          className="p-1.5 sm:p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs transition-colors cursor-pointer"
          title="Open AI Assistant & Thinking Mode"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Main Canvas Infinite Transform Viewport */}
      <div
        id="canvas-viewport"
        className="w-full h-full origin-top-left"
        style={{
          transform: `translate(${pan.x + (containerRef.current?.clientWidth || 0) / 2}px, ${
            pan.y + (containerRef.current?.clientHeight || 0) / 2
          }px) scale(${zoom})`,
          transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {/* SVG Bezier Connectors Layer */}
        <svg
          id="canvas-svg-layer"
          className="absolute overflow-visible pointer-events-none"
          style={{ width: 1, height: 1 }}
        >
          {edges.map((edge) => renderEdge(edge))}
        </svg>

        {/* Canvas Nodes Layer */}
        <div id="canvas-nodes-layer" className="absolute">
          {nodes.length === 0 && (
            <div className="absolute -top-16 -left-36 w-72 p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl text-center z-30">
              <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2 animate-bounce" />
              <h3 className="font-bold text-sm text-slate-800 mb-1">Canvas is Empty</h3>
              <p className="text-xs text-slate-500 mb-3">Add a central idea to start mapping your thoughts.</p>
              <button
                id="empty-canvas-add-root-btn"
                onClick={() => addNodeChild('', 'Central Topic')}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                + Create Central Idea
              </button>
            </div>
          )}

          {nodes.map((node) => {
            const count = childrenCountMap.get(node.id) || 0;
            const isMatch = searchResults.includes(node.id);
            return (
              <CanvasNode
                key={node.id}
                node={node}
                hasChildren={count > 0}
                childCount={count}
                isSelected={selectedNodeId === node.id || selectedNodeIds.includes(node.id)}
                isSearchMatch={isMatch}
                onDragStart={handleNodeDragStart}
                onTouchDragStart={handleNodeTouchDragStart}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Canvas Controls */}
      <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 z-40 flex items-center gap-1.5 sm:gap-2">
        <button
          id="fit-screen-btn"
          onClick={fitToScreen}
          className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden xs:inline">Fit to Screen</span>
        </button>

        <button
          id="center-root-btn"
          onClick={centerOnRoot}
          className="p-1.5 sm:px-3 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Center on Root Idea"
        >
          <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Center Root</span>
        </button>

        <button
          id="canvas-auto-layout-btn"
          onClick={() => handleAutoLayout()}
          className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-600 shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Auto-layout: Clean hierarchical tree structure (Ctrl+Shift+L)"
        >
          <Workflow className="w-3.5 h-3.5 text-indigo-600" />
          <span>Auto-layout</span>
        </button>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-xs">
          <button
            id="zoom-out-btn"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.25))}
            className="p-1.5 sm:p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors rounded-l-lg cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-700 select-none px-1.5 sm:px-2 min-w-[36px] sm:min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            id="zoom-in-btn"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 3))}
            className="p-1.5 sm:p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors rounded-r-lg cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          id="help-shortcuts-btn"
          onClick={() => setIsKeyboardShortcutsOpen(true)}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Shortcuts</span>
          <kbd className="hidden md:inline font-mono text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded border border-slate-200">?</kbd>
        </button>

        {/* Import Document Button */}
        <button
          id="canvas-import-doc-btn"
          onClick={() => {
            setIngestFile(null);
            setIsIngestModalOpen(true);
          }}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-600 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Import Document (PDF, Markdown, Word, TXT, Code) - Or drag & drop directly onto canvas"
        >
          <FileUp className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Import Doc</span>
        </button>

        <input
          type="file"
          ref={canvasFileInputRef}
          onChange={handleManualFileSelect}
          className="hidden"
          accept=".pdf,.txt,.md,.markdown,.json,.csv,.tsv,.docx,.doc,.ts,.js,.py,.html,.css,image/*"
        />
      </div>

      {/* Mini-map Widget (Bottom Right) */}
      <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 z-40">
        {showMinimap ? (
          <div className="relative bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl p-2 w-40 sm:w-48 h-28 sm:h-32 overflow-hidden">
            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Mini Map</span>
              <button
                onClick={() => setShowMinimap(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full h-20 sm:h-24 bg-slate-50 rounded border border-slate-200 overflow-hidden">
              {nodes.map((n) => {
                const miniX = (n.x / 18) + 80;
                const miniY = (n.y / 18) + 35;
                return (
                  <div
                    key={n.id}
                    style={{
                      left: `${miniX}px`,
                      top: `${miniY}px`,
                      backgroundColor: n.style.borderColor || '#4f46e5',
                    }}
                    className={`absolute w-2 h-1 rounded-xs ${
                      selectedNodeId === n.id ? 'ring-2 ring-indigo-600 scale-150' : 'opacity-70'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <button
            id="show-minimap-btn"
            onClick={() => setShowMinimap(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-lg transition-colors cursor-pointer"
            title="Show Mini Map"
          >
            <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Full Canvas Drag-and-Drop Ingestion Overlay */}
      {isDraggingFile && (
        <div
          id="canvas-drag-drop-overlay"
          className="absolute inset-0 z-50 pointer-events-none bg-indigo-950/25 backdrop-blur-xs flex items-center justify-center p-6 border-4 border-dashed border-indigo-500 rounded-2xl animate-in fade-in duration-150"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-200 p-8 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
              <FileUp className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Drop Document to Ingest & Synthesize
            </h3>
            <p className="text-xs text-slate-600 mb-4 max-w-xs mx-auto">
              {dragHoverNodeId ? (
                <span className="text-indigo-600 font-semibold">
                  Attaching branches to: "{nodes.find((n) => n.id === dragHoverNodeId)?.title || 'Selected Idea'}"
                </span>
              ) : (
                'Extract key concepts, milestones, and strategic structure with Gemini 3.8 AI'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                PDF
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                Markdown (.md)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                Word (.docx)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                TXT & Code
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                JSON / CSV
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Document Ingestion & AI Synthesis Modal */}
      <DocumentIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => {
          setIsIngestModalOpen(false);
          setIngestFile(null);
        }}
        initialFile={ingestFile}
        initialHoverNodeId={dragHoverNodeId}
      />

      {/* Auto-layout Toast Notification */}
      {layoutNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium shadow-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{layoutNotice}</span>
          </div>
        </div>
      )}
    </div>
  );
};
