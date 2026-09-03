import React, { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskItem, TaskStatus, PriorityLevel, SubtaskItem, MindNode } from '../../types';
import { getStoredNodes } from '../../lib/storage';
import { generateAIActionPlan } from '../../services/aiService';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock3,
  Search,
  Filter,
  Download,
  Share2,
  ChevronRight,
  ExternalLink,
  Edit3,
  X,
  ListTodo,
  Check,
  AlertCircle,
  Flame,
  Tag,
  User,
  MoreVertical,
  HelpCircle,
  Lightbulb,
  FolderKanban,
  FileSpreadsheet,
  Copy,
  RefreshCw,
} from 'lucide-react';

const COLUMNS: {
  id: TaskStatus;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  columnBg: string;
}[] = [
  {
    id: 'backlog',
    title: 'Backlog & Ideas',
    subtitle: 'Raw concepts captured from maps',
    accentColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    borderColor: 'border-purple-200 hover:border-purple-300',
    columnBg: 'bg-purple-50/40 border-purple-100',
  },
  {
    id: 'todo',
    title: 'To Do',
    subtitle: 'Prioritized for immediate sprint',
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    borderColor: 'border-indigo-200 hover:border-indigo-300',
    columnBg: 'bg-indigo-50/40 border-indigo-100',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Actively executing tasks',
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-200 hover:border-blue-300',
    columnBg: 'bg-blue-50/40 border-blue-100',
  },
  {
    id: 'review',
    title: 'Review & QA',
    subtitle: 'Validation & testing phase',
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'border-amber-200 hover:border-amber-300',
    columnBg: 'bg-amber-50/40 border-amber-100',
  },
  {
    id: 'done',
    title: 'Done',
    subtitle: 'Shipped & verified results',
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'border-emerald-200 hover:border-emerald-300',
    columnBg: 'bg-emerald-50/40 border-emerald-100',
  },
];

export const TasksKanbanView: React.FC = () => {
  const {
    allTasks,
    allMaps,
    addTask,
    addMultipleTasks,
    updateTask,
    deleteTask,
    triggerCelebration,
    openMap,
    setSelectedNodeId,
    setCurrentView,
    setIsKeyboardShortcutsOpen,
  } = useWorkspace();

  // Active keyboard selection state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapFilter, setSelectedMapFilter] = useState<string>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('priority');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // New / Edit Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormDesc, setTaskFormDesc] = useState('');
  const [taskFormPriority, setTaskFormPriority] = useState<PriorityLevel>('medium');
  const [taskFormStatus, setTaskFormStatus] = useState<TaskStatus>('todo');
  const [taskFormDueDate, setTaskFormDueDate] = useState('');
  const [taskFormMapId, setTaskFormMapId] = useState<string>(allMaps[0]?.id || '');
  const [taskFormAssignee, setTaskFormAssignee] = useState('');
  const [taskFormHours, setTaskFormHours] = useState<number | undefined>(undefined);
  const [taskFormSubtasks, setTaskFormSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Import Nodes Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSelectedMapId, setImportSelectedMapId] = useState<string>(allMaps[0]?.id || '');
  const [availableNodes, setAvailableNodes] = useState<MindNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [importTargetStatus, setImportTargetStatus] = useState<TaskStatus>('todo');
  const [importDefaultPriority, setImportDefaultPriority] = useState<PriorityLevel>('medium');

  // AI Action Plan Generator Modal State
  const [isAIPlanModalOpen, setIsAIPlanModalOpen] = useState(false);
  const [aiPlanMapId, setAiPlanMapId] = useState<string>(allMaps[0]?.id || '');
  const [aiPlanTimeframe, setAiPlanTimeframe] = useState<'7' | '14' | '30'>('14');
  const [aiPlanFocus, setAiPlanFocus] = useState<string>('Execution, MVP development, and strategic milestones');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiPlanFeedback, setAiPlanFeedback] = useState<string | null>(null);

  // Load nodes when opening the import modal or changing map selection
  const handleOpenImportModal = () => {
    const targetMap = allMaps[0]?.id || '';
    setImportSelectedMapId(targetMap);
    if (targetMap) {
      const nodes = getStoredNodes(targetMap);
      setAvailableNodes(nodes.filter((n) => n.parentId !== null)); // non-root nodes
      setSelectedNodeIds(nodes.filter((n) => n.parentId !== null).map((n) => n.id));
    }
    setIsImportModalOpen(true);
  };

  const handleMapChangeInImport = (mapId: string) => {
    setImportSelectedMapId(mapId);
    const nodes = getStoredNodes(mapId);
    setAvailableNodes(nodes.filter((n) => n.parentId !== null));
    setSelectedNodeIds(nodes.filter((n) => n.parentId !== null).map((n) => n.id));
  };

  // Convert selected nodes from mind map into actionable Kanban tasks
  const handleExecuteImportNodes = () => {
    const matchedMap = allMaps.find((m) => m.id === importSelectedMapId);
    if (!matchedMap || selectedNodeIds.length === 0) return;

    const nodesToImport = availableNodes.filter((n) => selectedNodeIds.includes(n.id));
    const newTasks: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>[] = nodesToImport.map((n, idx) => {
      let priority: PriorityLevel = importDefaultPriority;
      if (n.priority) priority = n.priority;
      else if (n.type === 'goal') priority = 'high';
      else if (n.type === 'question') priority = 'medium';

      return {
        title: n.title,
        description: n.description || `Action item originating from branch in "${matchedMap.title}"`,
        priority,
        status: importTargetStatus,
        dueDate: new Date(Date.now() + 86400000 * (idx + 2)).toISOString().split('T')[0],
        mapId: matchedMap.id,
        mapTitle: matchedMap.title,
        nodeId: n.id,
        nodeTitle: n.title,
        subtasks: [
          { id: 'st-1', title: 'Review mind map context & specifications', completed: false },
          { id: 'st-2', title: 'Execute implementation & verify outcomes', completed: false },
        ],
      };
    });

    addMultipleTasks(newTasks);
    triggerCelebration();
    setIsImportModalOpen(false);
  };

  // AI-Powered Action Plan to Kanban Generator
  const handleGenerateAIActionPlan = async () => {
    const matchedMap = allMaps.find((m) => m.id === aiPlanMapId);
    if (!matchedMap) return;

    setIsGeneratingPlan(true);
    setAiPlanFeedback(null);

    try {
      const nodes = getStoredNodes(matchedMap.id);
      const nodeSummary = nodes.map((n) => `• [${n.type.toUpperCase()}] ${n.title}: ${n.description || 'No description'}`).join('\n');

      const result = await generateAIActionPlan(
        matchedMap.title,
        `Map Overview:\n${matchedMap.description || 'General strategy map'}\n\nNodes and Branches:\n${nodeSummary}\n\nFocus Strategy: ${aiPlanFocus}`,
        aiPlanTimeframe
      );

      if (result && Array.isArray(result.phases)) {
        const generatedTasks: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        result.phases.forEach((phase: any, pIdx: number) => {
          const phaseName = phase.phase || `Sprint Phase ${pIdx + 1}`;
          if (Array.isArray(phase.tasks)) {
            phase.tasks.forEach((t: any, tIdx: number) => {
              const status: TaskStatus = pIdx === 0 ? 'todo' : 'backlog';
              const priority: PriorityLevel = t.priority || (pIdx === 0 ? 'urgent' : 'high');
              const dueDays = (pIdx + 1) * 3 + tIdx;

              generatedTasks.push({
                title: t.task || t.title || `Action item for ${phaseName}`,
                description: `Part of ${phaseName}. Timeline: ${phase.timeframe || `${aiPlanTimeframe} Days`}`,
                priority: priority as PriorityLevel,
                status,
                dueDate: new Date(Date.now() + 86400000 * dueDays).toISOString().split('T')[0],
                mapId: matchedMap.id,
                mapTitle: matchedMap.title,
                nodeId: nodes[tIdx % nodes.length]?.id,
                nodeTitle: nodes[tIdx % nodes.length]?.title,
                subtasks: [
                  { id: 'sub-1', title: 'Prepare requirements & milestones', completed: false },
                  { id: 'sub-2', title: 'Implement and test core deliverable', completed: false },
                  { id: 'sub-3', title: 'Review metrics & sync with mind map', completed: false },
                ],
              });
            });
          }
        });

        if (generatedTasks.length > 0) {
          addMultipleTasks(generatedTasks);
          triggerCelebration();
          setIsAIPlanModalOpen(false);
        } else {
          setAiPlanFeedback('AI generated an outline. Creating fallback workflow tasks.');
          // Fallback tasks from nodes
          const fallbackTasks: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>[] = nodes.slice(0, 5).map((n, idx) => ({
            title: `Execute: ${n.title}`,
            description: n.description || `Tactical milestone derived from AI reasoning plan.`,
            priority: idx === 0 ? 'urgent' : 'high',
            status: idx === 0 ? 'in_progress' : 'todo',
            dueDate: new Date(Date.now() + 86400000 * (idx + 3)).toISOString().split('T')[0],
            mapId: matchedMap.id,
            mapTitle: matchedMap.title,
            nodeId: n.id,
            nodeTitle: n.title,
          }));
          addMultipleTasks(fallbackTasks);
          setIsAIPlanModalOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Failed to generate action plan:', err);
      setAiPlanFeedback('AI generation encountered a timeout. Generating local smart tasks instead.');
      // Auto-fallback
      const nodes = getStoredNodes(matchedMap.id);
      const fallbackTasks: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>[] = nodes.slice(0, 4).map((n, idx) => ({
        title: `Sprint Task: ${n.title}`,
        description: n.description || `Action workflow for ${n.title}`,
        priority: 'high',
        status: idx === 0 ? 'todo' : 'backlog',
        dueDate: new Date(Date.now() + 86400000 * (idx + 2)).toISOString().split('T')[0],
        mapId: matchedMap.id,
        mapTitle: matchedMap.title,
        nodeId: n.id,
        nodeTitle: n.title,
      }));
      addMultipleTasks(fallbackTasks);
      setIsAIPlanModalOpen(false);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Open modal to create a new task
  const handleOpenCreateTaskModal = (initialStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTaskFormTitle('');
    setTaskFormDesc('');
    setTaskFormPriority('medium');
    setTaskFormStatus(initialStatus);
    setTaskFormDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setTaskFormMapId(allMaps[0]?.id || '');
    setTaskFormAssignee('');
    setTaskFormHours(undefined);
    setTaskFormSubtasks([]);
    setNewSubtaskInput('');
    setIsTaskModalOpen(true);
  };

  // Open modal to edit existing task
  const handleOpenEditTaskModal = (task: TaskItem) => {
    setEditingTask(task);
    setTaskFormTitle(task.title);
    setTaskFormDesc(task.description || '');
    setTaskFormPriority(task.priority);
    setTaskFormStatus(task.status);
    setTaskFormDueDate(task.dueDate || '');
    setTaskFormMapId(task.mapId || allMaps[0]?.id || '');
    setTaskFormAssignee(task.assignee || '');
    setTaskFormHours(task.estimatedHours);
    setTaskFormSubtasks(task.subtasks || []);
    setNewSubtaskInput('');
    setIsTaskModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTaskForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormTitle.trim()) return;

    const matchedMap = allMaps.find((m) => m.id === taskFormMapId);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskFormTitle.trim(),
        description: taskFormDesc.trim(),
        priority: taskFormPriority,
        status: taskFormStatus,
        dueDate: taskFormDueDate || undefined,
        mapId: matchedMap?.id || editingTask.mapId,
        mapTitle: matchedMap?.title || editingTask.mapTitle,
        assignee: taskFormAssignee.trim() || undefined,
        estimatedHours: taskFormHours,
        subtasks: taskFormSubtasks,
      });
      if (taskFormStatus === 'done' && editingTask.status !== 'done') {
        triggerCelebration();
      }
    } else {
      addTask({
        title: taskFormTitle.trim(),
        description: taskFormDesc.trim(),
        priority: taskFormPriority,
        status: taskFormStatus,
        dueDate: taskFormDueDate || undefined,
        mapId: matchedMap?.id || '',
        mapTitle: matchedMap?.title || '',
        assignee: taskFormAssignee.trim() || undefined,
        estimatedHours: taskFormHours,
        subtasks: taskFormSubtasks,
      });
      if (taskFormStatus === 'done') {
        triggerCelebration();
      }
    }

    setIsTaskModalOpen(false);
  };

  // Handle Subtask toggle
  const handleToggleSubtask = (task: TaskItem, subtaskId: string) => {
    const currentSubtasks = task.subtasks || [];
    const nextSubtasks = currentSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allDone = nextSubtasks.length > 0 && nextSubtasks.every((st) => st.completed);
    const updates: Partial<TaskItem> = { subtasks: nextSubtasks };
    if (allDone && task.status !== 'done') {
      updates.status = 'done';
      triggerCelebration();
    }
    updateTask(task.id, updates);
  };

  // Quick move to next / previous column
  const handleMoveColumn = (task: TaskItem, direction: 'next' | 'prev') => {
    const colOrder: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const currentIndex = colOrder.indexOf(task.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < colOrder.length) {
      const nextStatus = colOrder[nextIndex];
      updateTask(task.id, { status: nextStatus });
      if (nextStatus === 'done') {
        triggerCelebration();
      }
    }
  };

  // Jump to mind map node directly in Canvas editor
  const handleJumpToNode = (task: TaskItem) => {
    if (task.mapId) {
      openMap(task.mapId);
      if (task.nodeId) {
        setSelectedNodeId(task.nodeId);
      }
      setCurrentView('canvas');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, { status: targetStatus });
      if (targetStatus === 'done') {
        triggerCelebration();
      }
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Filtering & Sorting (Strictly Personal Tasks)
  const personalTasks = useMemo(
    () =>
      allTasks.filter(
        (t) =>
          t &&
          t.mapId !== 'map-mindflow-demo' &&
          !['task-1', 'task-2', 'task-3'].includes(t.id)
      ),
    [allTasks]
  );

  const filteredTasks = useMemo(() => {
    return personalTasks
      .filter((t) => {
        // Map filter
        if (selectedMapFilter !== 'All' && t.mapId !== selectedMapFilter) return false;
        // Priority filter
        if (selectedPriorityFilter !== 'All' && t.priority !== selectedPriorityFilter.toLowerCase()) return false;
        // Search keyword
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q) || false;
          const matchMap = t.mapTitle?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDesc && !matchMap) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weight: Record<PriorityLevel, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (weight[b.priority] || 1) - (weight[a.priority] || 1);
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return b.createdAt - a.createdAt;
      });
  }, [personalTasks, selectedMapFilter, selectedPriorityFilter, searchQuery, sortBy]);

  // Overall statistics
  const total = personalTasks.length;
  const completed = personalTasks.filter((t) => t.status === 'done').length;
  const inProgressCount = personalTasks.filter((t) => t.status === 'in_progress').length;
  const urgentCount = personalTasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Keyboard Shortcuts for Kanban Navigation & Fast Triage
  useEffect(() => {
    const handleKanbanKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      // If a modal is open, don't trigger board navigation
      if (isTaskModalOpen || isImportModalOpen || isAIPlanModalOpen) {
        return;
      }

      // Help Modal (?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsKeyboardShortcutsOpen(true);
        return;
      }

      // Focus search (/ or Ctrl/Cmd + F)
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        const searchEl = document.getElementById('kanban-search-input');
        searchEl?.focus();
        return;
      }

      // Create new task (N or C)
      if ((e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'c') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleOpenCreateTaskModal('todo');
        return;
      }

      // Clear selection or escape
      if (e.key === 'Escape') {
        if (selectedTaskId) {
          e.preventDefault();
          setSelectedTaskId(null);
        }
        return;
      }

      // All visible tasks in order
      if (filteredTasks.length === 0) return;

      const currentIdx = filteredTasks.findIndex((t) => t.id === selectedTaskId);

      // Select Next Task (J or ArrowDown)
      if (e.key.toLowerCase() === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIdx === -1 || currentIdx >= filteredTasks.length - 1) {
          setSelectedTaskId(filteredTasks[0].id);
        } else {
          setSelectedTaskId(filteredTasks[currentIdx + 1].id);
        }
        return;
      }

      // Select Previous Task (K or ArrowUp)
      if (e.key.toLowerCase() === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIdx <= 0) {
          setSelectedTaskId(filteredTasks[filteredTasks.length - 1].id);
        } else {
          setSelectedTaskId(filteredTasks[currentIdx - 1].id);
        }
        return;
      }

      // The following actions require a selected task:
      if (!selectedTaskId) return;
      const activeTask = filteredTasks.find((t) => t.id === selectedTaskId);
      if (!activeTask) return;

      // Edit Selected Task (E or Enter)
      if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        e.preventDefault();
        handleOpenEditTaskModal(activeTask);
        return;
      }

      // Delete Task (Delete or Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteTask(activeTask.id);
        setSelectedTaskId(null);
        return;
      }

      // Move to previous column (H or ArrowLeft or [)
      if (e.key.toLowerCase() === 'h' || e.key === 'ArrowLeft' || e.key === '[') {
        e.preventDefault();
        handleMoveColumn(activeTask, 'prev');
        return;
      }

      // Move to next column (L or ArrowRight or ])
      if (e.key.toLowerCase() === 'l' || e.key === 'ArrowRight' || e.key === ']') {
        e.preventDefault();
        handleMoveColumn(activeTask, 'next');
        return;
      }

      // Direct column movement (1: backlog, 2: todo, 3: in_progress, 4: review, 5: done)
      const columnKeys: Record<string, TaskStatus> = {
        '1': 'backlog',
        '2': 'todo',
        '3': 'in_progress',
        '4': 'review',
        '5': 'done',
      };
      if (columnKeys[e.key]) {
        e.preventDefault();
        const targetStatus = columnKeys[e.key];
        updateTask(activeTask.id, { status: targetStatus });
        if (targetStatus === 'done') {
          triggerCelebration();
        }
        return;
      }

      // Cycle Priority (P)
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const priorityCycle: Record<PriorityLevel, PriorityLevel> = {
          low: 'medium',
          medium: 'high',
          high: 'urgent',
          urgent: 'low',
        };
        updateTask(activeTask.id, { priority: priorityCycle[activeTask.priority] || 'medium' });
        return;
      }

      // Toggle Done / In-Progress (Space)
      if (e.key === ' ') {
        e.preventDefault();
        if (activeTask.status === 'done') {
          updateTask(activeTask.id, { status: 'in_progress' });
        } else {
          updateTask(activeTask.id, { status: 'done' });
          triggerCelebration();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKanbanKeyDown);
    return () => window.removeEventListener('keydown', handleKanbanKeyDown);
  }, [
    selectedTaskId,
    filteredTasks,
    isTaskModalOpen,
    isImportModalOpen,
    isAIPlanModalOpen,
    deleteTask,
    updateTask,
    triggerCelebration,
    setIsKeyboardShortcutsOpen,
  ]);

  // Export Tasks to Markdown or CSV
  const handleExportTasks = (format: 'markdown' | 'csv') => {
    if (format === 'markdown') {
      let md = `# Action Tasks & Workflows Export\n\n`;
      md += `Generated: ${new Date().toLocaleDateString()} | Completion: ${percent}%\n\n`;
      COLUMNS.forEach((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.id);
        md += `## ${col.title} (${colTasks.length})\n\n`;
        colTasks.forEach((t) => {
          const p = t.priority.toUpperCase();
          const due = t.dueDate ? ` [Due: ${t.dueDate}]` : '';
          const map = t.mapTitle ? ` (Map: ${t.mapTitle})` : '';
          md += `- [${t.status === 'done' ? 'x' : ' '}] **[${p}]** ${t.title}${due}${map}\n`;
          if (t.description) md += `  > ${t.description}\n`;
          if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach((st) => {
              md += `  - [${st.completed ? 'x' : ' '}] ${st.title}\n`;
            });
          }
        });
        md += `\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindflow-action-tasks.md`;
      a.click();
    } else {
      let csv = `Title,Status,Priority,Due Date,Mind Map,Node,Assignee\n`;
      filteredTasks.forEach((t) => {
        csv += `"${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.dueDate || ''}","${t.mapTitle || ''}","${t.nodeTitle || ''}","${t.assignee || ''}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindflow-action-tasks.csv`;
      a.click();
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            <Flame className="w-3 h-3 text-red-600" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Low
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* =========================================================================
          1. HEADER & METRICS BAR
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                Action Tasks Kanban
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Turn mind map ideas into prioritized, actionable workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Progress Pill */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Progress
              </div>
              <div className="text-xs font-black text-slate-800">
                {completed} of {total} ({percent}%)
              </div>
            </div>
            <div className="w-14 sm:w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${percent}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {urgentCount > 0 && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Flame className="w-4 h-4 text-red-600 animate-bounce" />
              <span>{urgentCount} Urgent</span>
            </div>
          )}

          {/* Turn Mind Map to Tasks Button */}
          <button
            id="import-nodes-btn"
            onClick={handleOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Turn Map to Tasks</span>
          </button>

          {/* AI Action Plan Button */}
          <button
            id="ai-plan-btn"
            onClick={() => setIsAIPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Action Plan</span>
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            id="kanban-shortcuts-btn"
            onClick={() => setIsKeyboardShortcutsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            title="Available Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="hidden md:inline font-mono text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded border border-slate-200">?</kbd>
          </button>

          {/* New Task Button */}
          <button
            id="add-task-btn"
            onClick={() => handleOpenCreateTaskModal('todo')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. FILTERS & SEARCH CONTROLS
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="kanban-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, or press / to filter..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Map Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMapFilter}
              onChange={(e) => setSelectedMapFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden cursor-pointer hover:bg-slate-100"
            >
              <option value="All">All Connected Mind Maps</option>
              {allMaps.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden cursor-pointer hover:bg-slate-100"
            >
              <option value="All">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden cursor-pointer hover:bg-slate-100"
          >
            <option value="priority">Sort: Priority</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="created">Sort: Recently Added</option>
          </select>

          {/* Export Actions */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
            <button
              onClick={() => handleExportTasks('markdown')}
              title="Export as Markdown"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleExportTasks('csv')}
              title="Export as CSV"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. KANBAN COLUMNS BOARD
      ========================================================================= */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex-1 flex flex-col rounded-2xl p-3 sm:p-4 border transition-all min-w-[280px] max-w-[340px] ${
                column.columnBg
              } ${isOver ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/70' : 'border-slate-200/90'}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.badgeBg}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        {column.title}
                      </h3>
                      <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full border ${column.badgeBg}`}>
                        {colTasks.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                      {column.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCreateTaskModal(column.id)}
                  title={`Add task to ${column.title}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="py-8 px-4 text-center text-xs text-slate-400 border border-dashed border-slate-300/80 rounded-xl bg-white/60">
                    <p className="font-medium">No tasks in {column.title.toLowerCase()}</p>
                    <button
                      onClick={() => handleOpenCreateTaskModal(column.id)}
                      className="mt-2 text-[11px] text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                      + Add a card
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const subtasks = task.subtasks || [];
                    const doneSubtasks = subtasks.filter((st) => st.completed).length;

                    const isSelected = selectedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onClick={() => setSelectedTaskId(task.id)}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-white rounded-xl p-3.5 border transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between group relative ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-md'
                            : `${column.borderColor} shadow-xs hover:shadow-md`
                        }`}
                      >
                        <div>
                          {/* Card Top: Priority & Action Buttons */}
                          <div className="flex items-center justify-between mb-2">
                            {getPriorityBadge(task.priority)}

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditTaskModal(task)}
                                title="Edit Task"
                                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                title="Delete Task"
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4
                            className={`font-semibold text-xs text-slate-900 leading-snug mb-1.5 ${
                              task.status === 'done' ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </h4>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks Checklist */}
                          {subtasks.length > 0 && (
                            <div className="mb-2.5 bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                                <span>Checklist</span>
                                <span>
                                  {doneSubtasks}/{subtasks.length}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div
                                  style={{ width: `${(doneSubtasks / subtasks.length) * 100}%` }}
                                  className="h-full bg-indigo-500 rounded-full transition-all"
                                />
                              </div>
                              <div className="space-y-1">
                                {subtasks.slice(0, 3).map((st) => (
                                  <label
                                    key={st.id}
                                    className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={st.completed}
                                      onChange={() => handleToggleSubtask(task, st.id)}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                                    />
                                    <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                      {st.title}
                                    </span>
                                  </label>
                                ))}
                                {subtasks.length > 3 && (
                                  <div className="text-[10px] text-slate-400 pt-0.5">
                                    +{subtasks.length - 3} more items...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Mind Map Connection Pill (Deep Link) */}
                          {task.mapTitle && (
                            <div
                              onClick={() => handleJumpToNode(task)}
                              title="Click to jump to this node in Mind Map Canvas"
                              className="flex items-center justify-between text-[10px] text-indigo-700 font-medium mb-2.5 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Layers className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                                <span className="truncate">{task.mapTitle}</span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Metadata & Column Switcher */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            {task.dueDate && (
                              <span className="flex items-center gap-1 font-medium text-slate-600">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {task.dueDate}
                              </span>
                            )}
                            {task.estimatedHours && (
                              <span className="flex items-center gap-0.5 text-slate-500 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {task.estimatedHours}h
                              </span>
                            )}
                          </div>

                          {/* Move Column Controls */}
                          <div className="flex items-center gap-1">
                            {task.status !== 'backlog' && (
                              <button
                                onClick={() => handleMoveColumn(task, 'prev')}
                                title="Move to previous column"
                                className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {task.status !== 'done' && (
                              <button
                                onClick={() => handleMoveColumn(task, 'next')}
                                title="Advance to next column"
                                className="p-1 rounded hover:bg-indigo-50 text-indigo-600 transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          4. NEW / EDIT TASK MODAL
      ========================================================================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Action Task' : 'Create Action Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskFormTitle}
                  onChange={(e) => setTaskFormTitle(e.target.value)}
                  placeholder="e.g. Build authentication backend API"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={3}
                  value={taskFormDesc}
                  onChange={(e) => setTaskFormDesc(e.target.value)}
                  placeholder="Describe the actionable requirements or acceptance criteria..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Grid: Priority, Status, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskFormPriority}
                    onChange={(e) => setTaskFormPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  >
                    <option value="urgent">🔥 Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workflow Status
                  </label>
                  <select
                    value={taskFormStatus}
                    onChange={(e) => setTaskFormStatus(e.target.value as TaskStatus)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review & QA</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskFormDueDate}
                    onChange={(e) => setTaskFormDueDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Connected Mind Map */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Connect to Mind Map
                </label>
                <select
                  value={taskFormMapId}
                  onChange={(e) => setTaskFormMapId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                >
                  <option value="">None (Independent Task)</option>
                  {allMaps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtasks Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtask Checklist
                </label>
                <div className="space-y-1.5 mb-2">
                  {taskFormSubtasks.map((st, idx) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <label className="flex items-center gap-2 text-xs text-slate-800 flex-1">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => {
                            const updated = [...taskFormSubtasks];
                            updated[idx].completed = !updated[idx].completed;
                            setTaskFormSubtasks(updated);
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className={st.completed ? 'line-through text-slate-400' : ''}>
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTaskFormSubtasks(taskFormSubtasks.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSubtaskInput.trim()) {
                          setTaskFormSubtasks([
                            ...taskFormSubtasks,
                            { id: 'st-' + Date.now(), title: newSubtaskInput.trim(), completed: false },
                          ]);
                          setNewSubtaskInput('');
                        }
                      }
                    }}
                    placeholder="Type subtask and press Add..."
                    className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtaskInput.trim()) {
                        setTaskFormSubtasks([
                          ...taskFormSubtasks,
                          { id: 'st-' + Date.now(), title: newSubtaskInput.trim(), completed: false },
                        ]);
                        setNewSubtaskInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Assignee & Estimated Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={taskFormAssignee}
                    onChange={(e) => setTaskFormAssignee(e.target.value)}
                    placeholder="e.g. Sarah K."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={taskFormHours ?? ''}
                    onChange={(e) => setTaskFormHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g. 4"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. TURN MIND MAP INTO ACTIONABLE TASKS MODAL (NODE IMPORTER)
      ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Turn Mind Map Nodes into Action Tasks
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select branches or ideas from your mind map to convert to Kanban cards.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Select Mind Map */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source Mind Map
                </label>
                <select
                  value={importSelectedMapId}
                  onChange={(e) => handleMapChangeInImport(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden"
                >
                  {allMaps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.nodesCount} nodes)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Column & Default Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Add to Column
                  </label>
                  <select
                    value={importTargetStatus}
                    onChange={(e) => setImportTargetStatus(e.target.value as TaskStatus)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  >
                    <option value="backlog">Backlog & Ideas</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Priority
                  </label>
                  <select
                    value={importDefaultPriority}
                    onChange={(e) => setImportDefaultPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  >
                    <option value="urgent">🔥 Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Nodes Selector List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Select Nodes to Convert ({selectedNodeIds.length} of {availableNodes.length})
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedNodeIds(availableNodes.map((n) => n.id))}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeIds([])}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {availableNodes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No child nodes found in this map.
                    </div>
                  ) : (
                    availableNodes.map((node) => {
                      const isSelected = selectedNodeIds.includes(node.id);
                      return (
                        <div
                          key={node.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedNodeIds(selectedNodeIds.filter((id) => id !== node.id));
                            } else {
                              setSelectedNodeIds([...selectedNodeIds, node.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-indigo-600"
                            />
                            <span className="truncate">{node.title}</span>
                          </div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                            {node.type}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedNodeIds.length === 0}
                onClick={handleExecuteImportNodes}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
              >
                Generate {selectedNodeIds.length} Action Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. AI ACTION PLAN TO KANBAN GENERATOR MODAL
      ========================================================================= */}
      {isAIPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Action Plan Generator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gemini transforms your mind map into prioritized sprint workflows.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAIPlanModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Select Mind Map */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source Mind Map Strategy
                </label>
                <select
                  value={aiPlanMapId}
                  onChange={(e) => setAiPlanMapId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden"
                >
                  {allMaps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.nodesCount} nodes)
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeframe Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sprint Horizon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '7', label: '7 Days', desc: 'Rapid Sprint' },
                    { id: '14', label: '14 Days', desc: 'Standard Iteration' },
                    { id: '30', label: '30 Days', desc: 'Full Product Launch' },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setAiPlanTimeframe(tf.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        aiPlanTimeframe === tf.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{tf.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{tf.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Strategy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Execution Focus Objective
                </label>
                <input
                  type="text"
                  value={aiPlanFocus}
                  onChange={(e) => setAiPlanFocus(e.target.value)}
                  placeholder="e.g. MVP Launch, Marketing Traction, Product Validation"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                />
              </div>

              {aiPlanFeedback && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  {aiPlanFeedback}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAIPlanModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingPlan}
                onClick={handleGenerateAIActionPlan}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPlan ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Reasoning & Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate Kanban Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
