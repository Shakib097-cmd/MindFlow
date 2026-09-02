import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GoalItem } from '../../types';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Trash2,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { allGoals, allMaps, addGoal, updateGoal, deleteGoal, triggerCelebration } = useWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );
  const [newMilestones, setNewMilestones] = useState('');
  const [newMapId, setNewMapId] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const milestonesList = newMilestones
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title) => ({
        id: 'ms-' + Math.random().toString(36).substr(2, 9),
        title,
        completed: false,
      }));

    addGoal({
      title: newTitle.trim(),
      description: newDesc.trim(),
      progress: 0,
      targetDate: newTargetDate,
      status: 'in_progress',
      milestones: milestonesList,
      mapId: newMapId || undefined,
    });

    setNewTitle('');
    setNewDesc('');
    setNewMilestones('');
    setIsModalOpen(false);
  };

  const handleProgressSlider = (goal: GoalItem, newProg: number) => {
    const status = newProg >= 100 ? 'completed' : 'in_progress';
    updateGoal(goal.id, { progress: newProg, status });
    if (newProg >= 100 && goal.progress < 100) {
      triggerCelebration();
    }
  };

  const toggleMilestone = (goal: GoalItem, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const autoProgress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : goal.progress;

    const status = autoProgress >= 100 ? 'completed' : 'in_progress';
    updateGoal(goal.id, {
      milestones: updatedMilestones,
      progress: autoProgress,
      status,
    });

    if (autoProgress >= 100 && goal.progress < 100) {
      triggerCelebration();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Strategic Goals & OKRs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Connect high-level vision from your mind maps into measurable targets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {allGoals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">No goals set yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Track key milestones and connect them directly to your mind map topics.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allGoals.map((goal) => (
            <div
              key={goal.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                goal.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Status and Delete Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        goal.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                    {goal.targetDate && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Target: {goal.targetDate}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-slate-300 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{goal.description}</p>
                )}

                {/* Progress Bar & Slider */}
                <div className="space-y-1.5 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">Completion</span>
                    <span
                      className={
                        goal.progress >= 100 ? 'text-emerald-600 font-extrabold' : 'text-indigo-600'
                      }
                    >
                      {goal.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => handleProgressSlider(goal, Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Key Results / Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Results / Milestones ({goal.milestones.filter((m) => m.completed).length}/
                      {goal.milestones.length})
                    </div>
                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => toggleMilestone(goal, m.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={m.completed ? 'line-through text-slate-400' : ''}>
                            {m.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Goal footer */}
              {goal.mapId && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Linked to active Strategy Map</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Set Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-4">Set Strategic Goal / OKR</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objective Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reach $10k MRR with MindFlow AI"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Why this objective matters and core strategy..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Results / Milestones (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Launch beta to 100 users&#10;Achieve 40% WAU retention&#10;Implement stripe billing"
                  value={newMilestones}
                  onChange={(e) => setNewMilestones(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
