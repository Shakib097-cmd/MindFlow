import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskItem, TaskStatus, PriorityLevel } from '../../types';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock3,
} from 'lucide-react';

export const TasksKanbanView: React.FC = () => {
  const { allTasks, allMaps, addTask, updateTask, deleteTask, triggerCelebration } = useWorkspace();

  const [selectedMapFilter, setSelectedMapFilter] = useState<string>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('All');

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [newMapId, setNewMapId] = useState<string>(allMaps[0]?.id || '');

  const filteredTasks = allTasks.filter((t) => {
    if (selectedMapFilter !== 'All' && t.mapId !== selectedMapFilter) return false;
    if (selectedPriorityFilter !== 'All' && t.priority !== selectedPriorityFilter.toLowerCase())
      return false;
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === 'done').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedMap = allMaps.find((m) => m.id === newMapId);

    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      status: 'todo',
      dueDate: newDueDate,
      mapId: matchedMap?.id,
      mapTitle: matchedMap?.title,
    });

    setNewTitle('');
    setNewDesc('');
    setIsNewTaskModalOpen(false);
  };

  const handleStatusChange = (task: TaskItem, nextStatus: TaskStatus) => {
    updateTask(task.id, { status: nextStatus });
    if (nextStatus === 'done') {
      triggerCelebration();
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Medium</span>;
      case 'low':
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const renderColumn = (title: string, count: number, tasks: TaskItem[], status: TaskStatus, icon: React.ReactNode, borderClass: string) => (
    <div className="flex-1 flex flex-col bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 min-w-[300px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">{icon}</span>
          <h3 className="font-bold text-sm text-slate-800">{title}</h3>
          <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
            {count}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-white/50">
            No tasks in {title.toLowerCase()}
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-4 border ${borderClass} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getPriorityBadge(task.priority)}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className={`font-semibold text-xs text-slate-900 mb-1 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {task.description}
                  </p>
                )}

                {task.mapTitle && (
                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium mb-3 bg-indigo-50/60 px-2 py-1 rounded-md">
                    <Layers className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{task.mapTitle}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Due date + move status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                {task.dueDate ? (
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {task.dueDate}
                  </span>
                ) : (
                  <span />
                )}

                {/* Status Switch Controls */}
                <div className="flex items-center gap-1">
                  {task.status !== 'todo' && (
                    <button
                      onClick={() => handleStatusChange(task, 'todo')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold"
                    >
                      ← Todo
                    </button>
                  )}
                  {task.status !== 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(task, 'in_progress')}
                      className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold"
                    >
                      In Progress
                    </button>
                  )}
                  {task.status !== 'done' && (
                    <button
                      onClick={() => handleStatusChange(task, 'done')}
                      className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold flex items-center gap-0.5"
                    >
                      ✓ Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header with Progress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Action Tasks Kanban
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Turn mind map ideas into prioritized, actionable workflows.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Completion Pill */}
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Progress
              </div>
              <div className="text-xs font-black text-slate-800">
                {completed} of {total} completed ({percent}%)
              </div>
            </div>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${percent}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all"
              />
            </div>
          </div>

          <button
            id="add-task-btn"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        <select
          value={selectedMapFilter}
          onChange={(e) => setSelectedMapFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold focus:outline-hidden"
        >
          <option value="All">All Connected Mind Maps</option>
          {allMaps.map((m) => (
            <option key={m.id} value={m.id}>
              Map: {m.title}
            </option>
          ))}
        </select>

        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold focus:outline-hidden"
        >
          <option value="All">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* 3 Column Kanban Board */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {renderColumn(
          'To Do',
          todoTasks.length,
          todoTasks,
          'todo',
          <Circle className="w-4 h-4 text-slate-400" />,
          'border-slate-200'
        )}
        {renderColumn(
          'In Progress',
          inProgressTasks.length,
          inProgressTasks,
          'in_progress',
          <Clock3 className="w-4 h-4 text-blue-500" />,
          'border-blue-200'
        )}
        {renderColumn(
          'Done & Delivered',
          doneTasks.length,
          doneTasks,
          'done',
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          'border-emerald-200'
        )}
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-4">Create Action Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct competitor pricing analysis"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Action Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, acceptance criteria, or links..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Connect to Mind Map (Optional)
                </label>
                <select
                  value={newMapId}
                  onChange={(e) => setNewMapId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">No connected map</option>
                  {allMaps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
