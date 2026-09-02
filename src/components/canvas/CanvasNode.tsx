import React, { useState, useRef, useEffect } from 'react';
import { MindNode, NodeType, NodeStyle } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Plus,
  Trash2,
  Sparkles,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Copy,
  Edit3,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  Tag,
  Palette,
} from 'lucide-react';

interface CanvasNodeProps {
  node: MindNode;
  hasChildren: boolean;
  childCount: number;
  isSelected: boolean;
  isSearchMatch: boolean;
  onDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onTouchDragStart?: (e: React.TouchEvent, nodeId: string) => void;
}

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  node,
  hasChildren,
  childCount,
  isSelected,
  isSearchMatch,
  onDragStart,
  onTouchDragStart,
}) => {
  const {
    updateNode,
    deleteNode,
    duplicateNode,
    addNodeChild,
    addNodeSibling,
    toggleNodeCollapse,
    convertNodeToTask,
    updateNodeStyle,
    setIsAIAssistantOpen,
    setSelectedNodeId,
  } = useWorkspace();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(node.title);
  }, [node.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleSubmit = () => {
    if (editTitle.trim()) {
      updateNode(node.id, { title: editTitle.trim() });
    } else {
      setEditTitle(node.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(node.title);
      setIsEditing(false);
    }
  };

  // Node Shape Class mapping
  const getShapeClasses = () => {
    switch (node.style.shape) {
      case 'pill':
        return 'rounded-full px-5 py-2.5';
      case 'circle':
        return 'rounded-full aspect-square flex items-center justify-center p-4';
      case 'rectangle':
        return 'rounded-none px-4 py-3';
      case 'cloud':
        return 'rounded-3xl px-5 py-3 shadow-inner';
      case 'rounded':
      default:
        return 'rounded-xl px-4 py-3';
    }
  };

  const getShadowClass = () => {
    if (isSelected) return 'shadow-xl ring-2 ring-indigo-500 ring-offset-2 ring-offset-white';
    if (isSearchMatch) return 'ring-4 ring-amber-400 animate-pulse';
    switch (node.style.shadow) {
      case 'lg':
        return 'shadow-lg';
      case 'md':
        return 'shadow-md';
      case 'sm':
        return 'shadow-sm';
      case 'none':
        return 'shadow-none';
      default:
        return 'shadow-sm';
    }
  };

  const PALETTE_COLORS = [
    { bg: '#ffffff', border: '#4f46e5', text: '#0f172a' },
    { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' },
    { bg: '#f5f3ff', border: '#8b5cf6', text: '#4c1d95' },
    { bg: '#ecfdf5', border: '#10b981', text: '#064e3b' },
    { bg: '#fff7ed', border: '#f97316', text: '#7c2d12' },
    { bg: '#fdf2f8', border: '#ec4899', text: '#831843' },
    { bg: '#fefce8', border: '#eab308', text: '#713f12' },
    { bg: '#0f172a', border: '#334155', text: '#ffffff' },
  ];

  return (
    <div
      id={`node-${node.id}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        minWidth: `${node.width}px`,
        maxWidth: `${node.width * 1.6}px`,
      }}
      className={`group absolute select-none transition-shadow cursor-grab active:cursor-grabbing z-10 ${
        isSelected ? 'z-30' : 'z-10'
      }`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onDragStart(e, node.id);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onTouchDragStart?.(e, node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {/* Main Node Body */}
      <div
        style={{
          backgroundColor: node.style.backgroundColor,
          color: node.style.textColor,
          borderColor: node.style.borderColor,
          borderWidth: `${node.style.borderWidth || 1.5}px`,
          borderStyle: node.style.borderStyle || 'solid',
        }}
        className={`relative transition-all duration-200 border ${getShapeClasses()} ${getShadowClass()} backdrop-blur-sm`}
      >
        {/* Node Priority / Status Badge */}
        {node.priority && (
          <div className="absolute -top-2.5 right-3 flex items-center gap-1 bg-white/95 px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                node.priority === 'urgent'
                  ? 'bg-red-500 animate-ping'
                  : node.priority === 'high'
                  ? 'bg-amber-500'
                  : node.priority === 'medium'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="uppercase tracking-wider">{node.priority}</span>
          </div>
        )}

        {/* Node Content Container */}
        <div className="flex flex-col">
          {/* Eyebrow type tag if specified */}
          {node.type === 'task' && (
            <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
              Task
            </span>
          )}
          {node.type === 'goal' && (
            <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
              Goal
            </span>
          )}
          {node.type === 'question' && (
            <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
              Question
            </span>
          )}

          <div className="flex items-center gap-2">
            {/* Node Icon / Type Checkbox */}
            {node.type === 'task' ? (
              <button
                id={`task-check-${node.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const nextStatus = node.status === 'done' ? 'todo' : 'done';
                  updateNode(node.id, { status: nextStatus });
                }}
                className={`flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  node.status === 'done'
                    ? 'bg-emerald-500 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-indigo-500 bg-white'
                }`}
              >
                {node.status === 'done' && <CheckSquare className="w-3 h-3 stroke-[3]" />}
              </button>
            ) : (
              node.style.icon && <span className="text-xs">{node.style.icon}</span>
            )}

            {/* Title or Inline Input */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white/95 text-slate-900 px-1 py-0.5 rounded text-xs font-semibold outline-hidden ring-2 ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div
                  className={`font-semibold tracking-tight break-words ${
                    node.status === 'done' ? 'line-through opacity-60' : ''
                  } ${
                    node.style.fontSize === 'xl'
                      ? 'text-sm font-bold'
                      : node.style.fontSize === 'lg'
                      ? 'text-xs font-bold'
                      : 'text-xs font-medium'
                  }`}
                >
                  {node.title}
                </div>
              )}

              {/* Node Sub-description if present */}
              {node.description && !isEditing && (
                <p className="text-[10px] opacity-75 mt-0.5 line-clamp-2 leading-relaxed">
                  {node.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Collapse / Expand Toggle for Nodes with Children */}
        {hasChildren && (
          <button
            id={`collapse-btn-${node.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeCollapse(node.id);
            }}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-indigo-500 shadow-xs flex items-center justify-center text-[11px] font-bold z-20 transition-transform active:scale-95"
            title={node.collapsed ? `Expand ${childCount} nodes` : 'Collapse'}
          >
            {node.collapsed ? `+${childCount}` : <ChevronDown className="w-3 h-3 text-slate-500" />}
          </button>
        )}
      </div>

      {/* Floating Hover Action Toolbar */}
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-slate-700/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-40 ${
          isSelected ? 'opacity-100' : ''
        }`}
      >
        {/* Add Child */}
        <button
          id={`add-child-${node.id}`}
          onClick={(e) => {
            e.stopPropagation();
            addNodeChild(node.id);
          }}
          className="p-1 rounded hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Add Child Idea (Tab)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Add Sibling */}
        <button
          id={`add-sibling-${node.id}`}
          onClick={(e) => {
            e.stopPropagation();
            addNodeSibling(node.id);
          }}
          className="px-1 py-0.5 text-[10px] font-medium rounded hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Add Sibling Idea (Enter)"
        >
          +Sib
        </button>

        {/* AI Expand */}
        <button
          id={`ai-expand-${node.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNodeId(node.id);
            setIsAIAssistantOpen(true);
          }}
          className="p-1 rounded hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors flex items-center gap-0.5 text-[10px]"
          title="AI Expand & Thinking Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {/* Convert to Task */}
        {node.type !== 'task' && (
          <button
            id={`convert-task-${node.id}`}
            onClick={(e) => {
              e.stopPropagation();
              convertNodeToTask(node.id);
            }}
            className="p-1 rounded hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Convert node to actionable Task"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Style / Palette Picker Toggle */}
        <button
          id={`style-btn-${node.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowStyleMenu(!showStyleMenu);
          }}
          className="p-1 rounded hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Change Color & Shape"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {/* Duplicate */}
        <button
          id={`dup-btn-${node.id}`}
          onClick={(e) => {
            e.stopPropagation();
            duplicateNode(node.id);
          }}
          className="p-1 rounded hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Duplicate Node"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete (if not root) */}
        {node.parentId && (
          <button
            id={`del-btn-${node.id}`}
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className="p-1 rounded hover:bg-red-600 text-red-300 hover:text-white transition-colors"
            title="Delete (Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Style Dropdown Menu */}
      {showStyleMenu && (
        <div
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 w-56 text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Color Theme
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {PALETTE_COLORS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  updateNodeStyle(node.id, {
                    backgroundColor: p.bg,
                    borderColor: p.border,
                    textColor: p.text,
                  });
                  setShowStyleMenu(false);
                }}
                style={{ backgroundColor: p.bg, borderColor: p.border }}
                className="w-full h-7 rounded border-2 hover:scale-105 transition-transform"
              />
            ))}
          </div>

          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Node Shape
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {(['rounded', 'pill', 'rectangle', 'circle', 'cloud'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  updateNodeStyle(node.id, { shape: s });
                  setShowStyleMenu(false);
                }}
                className={`px-2 py-1 rounded capitalize border text-slate-700 hover:bg-slate-100 ${
                  node.style.shape === s ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold' : 'border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
