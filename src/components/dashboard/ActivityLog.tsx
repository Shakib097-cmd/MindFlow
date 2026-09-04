import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActivityLogItem, ActivityType } from '../../types';
import {
  Activity,
  Clock,
  Layers,
  CheckSquare,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Trash2,
  Star,
  Plus,
  ArrowRight,
  Search,
  RotateCcw,
  ExternalLink,
  Target,
  StickyNote,
  Filter,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type FilterCategory = 'all' | 'maps' | 'tasks' | 'ai' | 'goals';

interface ActivityLogProps {
  limit?: number;
  className?: string;
  showFilters?: boolean;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  limit = 8,
  className = '',
  showFilters = true,
}) => {
  const {
    activityLogs,
    clearActivityLogs,
    openMap,
    setCurrentView,
    createNewMap,
    addTask,
  } = useWorkspace();

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Format relative time helper
  const getRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter activities based on active tab and search query
  const filteredActivities = useMemo(() => {
    return activityLogs.filter((act) => {
      // Category filter
      if (activeCategory === 'maps') {
        const isMapRelated =
          act.targetType === 'map' ||
          act.targetType === 'node' ||
          act.type.startsWith('map_') ||
          act.type.startsWith('node_');
        if (!isMapRelated) return false;
      } else if (activeCategory === 'tasks') {
        const isTaskRelated = act.targetType === 'task' || act.type.startsWith('task_');
        if (!isTaskRelated) return false;
      } else if (activeCategory === 'ai') {
        const isAiRelated =
          act.type === 'ai_generation' ||
          act.type === 'template_used' ||
          act.targetType === 'ai';
        if (!isAiRelated) return false;
      } else if (activeCategory === 'goals') {
        const isGoalRelated = act.targetType === 'goal' || act.type.startsWith('goal_');
        if (!isGoalRelated) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesDesc = act.description?.toLowerCase().includes(q) || false;
        const matchesTarget = act.targetTitle?.toLowerCase().includes(q) || false;
        return matchesTitle || matchesDesc || matchesTarget;
      }

      return true;
    });
  }, [activityLogs, activeCategory, searchQuery]);

  const displayedActivities = useMemo(() => {
    if (isExpanded) {
      return filteredActivities;
    }
    return filteredActivities.slice(0, limit);
  }, [filteredActivities, isExpanded, limit]);

  // Handle activity click navigation
  const handleActivityClick = (act: ActivityLogItem) => {
    if (act.targetType === 'map' && act.targetId) {
      openMap(act.targetId);
    } else if (act.targetType === 'node' && act.metadata?.mapId) {
      openMap(act.metadata.mapId);
    } else if (act.targetType === 'task') {
      setCurrentView('tasks');
    } else if (act.targetType === 'goal') {
      setCurrentView('goals');
    } else if (act.targetType === 'note') {
      setCurrentView('dashboard');
    } else if (act.type === 'template_used') {
      setCurrentView('templates');
    }
  };

  // Activity icon and color styling
  const getActivityMeta = (type: ActivityType, targetType: ActivityLogItem['targetType']) => {
    switch (type) {
      case 'map_created':
        return {
          icon: <Plus className="w-3.5 h-3.5 text-indigo-600" />,
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-100',
          tagLabel: 'Map Created',
          tagClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'map_updated':
        return {
          icon: <Layers className="w-3.5 h-3.5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          tagLabel: 'Map Edit',
          tagClass: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'map_favorite':
        return {
          icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          tagLabel: 'Starred',
          tagClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'map_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-500" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-100',
          tagLabel: 'Deleted',
          tagClass: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'node_added':
      case 'node_created':
        return {
          icon: <Plus className="w-3.5 h-3.5 text-indigo-500" />,
          bgColor: 'bg-indigo-50/70',
          borderColor: 'border-indigo-100',
          tagLabel: 'Node Added',
          tagClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'node_updated':
        return {
          icon: <Layers className="w-3.5 h-3.5 text-slate-600" />,
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
          tagLabel: 'Node Edit',
          tagClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'node_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-slate-500" />,
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
          tagLabel: 'Node Deleted',
          tagClass: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      case 'task_created':
        return {
          icon: <CheckSquare className="w-3.5 h-3.5 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          tagLabel: 'Task Added',
          tagClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'task_status':
      case 'task_status_changed':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-sky-600" />,
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-100',
          tagLabel: 'Status Shift',
          tagClass: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'task_completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          tagLabel: 'Task Done',
          tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'task_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-slate-400" />,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          tagLabel: 'Task Deleted',
          tagClass: 'bg-slate-100 text-slate-500 border-slate-200',
        };
      case 'task_converted':
        return {
          icon: <CheckCheck className="w-3.5 h-3.5 text-purple-600" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-100',
          tagLabel: 'Node → Task',
          tagClass: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'goal_created':
      case 'goal_updated':
      case 'goal_progress':
        return {
          icon: <Target className="w-3.5 h-3.5 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-100',
          tagLabel: 'Goal',
          tagClass: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'quicknote_created':
      case 'note_created':
        return {
          icon: <StickyNote className="w-3.5 h-3.5 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          tagLabel: 'Note',
          tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'ai_generation':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-100',
          tagLabel: 'AI Generation',
          tagClass: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'template_used':
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          tagLabel: 'Blueprint',
          tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-slate-600" />,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          tagLabel: 'Event',
          tagClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div
      id="dashboard-activity-log"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                Activity Log
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {activityLogs.length} events
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live chronological timeline of mind map and task changes
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="activity-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search changes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {activityLogs.length > 0 && (
            <button
              id="activity-clear-btn"
              onClick={() => {
                if (isClearing) {
                  clearActivityLogs();
                  setIsClearing(false);
                } else {
                  setIsClearing(true);
                  setTimeout(() => setIsClearing(false), 3000);
                }
              }}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                isClearing
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent'
              }`}
              title={isClearing ? 'Click again to confirm' : 'Clear activity history'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isClearing && <span className="text-[10px]">Confirm?</span>}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {showFilters && (
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>

          <button
            id="activity-filter-all"
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            All Changes
          </button>

          <button
            id="activity-filter-maps"
            onClick={() => setActiveCategory('maps')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'maps'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <Layers className="w-3 h-3" />
            Mind Maps
          </button>

          <button
            id="activity-filter-tasks"
            onClick={() => setActiveCategory('tasks')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'tasks'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            Tasks & Kanban
          </button>

          <button
            id="activity-filter-ai"
            onClick={() => setActiveCategory('ai')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'ai'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI & Templates
          </button>

          <button
            id="activity-filter-goals"
            onClick={() => setActiveCategory('goals')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'goals'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <Target className="w-3 h-3" />
            Goals
          </button>
        </div>
      )}

      {/* Activity List Container */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[460px]">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((act) => {
            const meta = getActivityMeta(act.type, act.targetType);
            const isClickable = Boolean(
              (act.targetType === 'map' && act.targetId) ||
                (act.targetType === 'node' && act.metadata?.mapId) ||
                act.targetType === 'task' ||
                act.targetType === 'goal'
            );

            return (
              <div
                key={act.id}
                id={`activity-item-${act.id}`}
                onClick={() => isClickable && handleActivityClick(act)}
                className={`group p-3.5 sm:px-5 sm:py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
              >
                {/* Icon & Title */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl ${meta.bgColor} border ${meta.borderColor} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    {meta.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {act.title}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${meta.tagClass}`}
                      >
                        {meta.tagLabel}
                      </span>
                    </div>

                    {act.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {act.description}
                      </p>
                    )}

                    {act.targetTitle && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span className="font-medium text-slate-600 truncate max-w-[200px] sm:max-w-xs">
                          {act.targetTitle}
                        </span>
                        {act.metadata?.taskPriority && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {act.metadata.taskPriority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & Action Indicator */}
                <div className="flex items-center gap-2 shrink-0 pt-0.5 text-right">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium whitespace-nowrap">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{getRelativeTime(act.timestamp)}</span>
                  </div>

                  {isClickable && (
                    <div className="p-1 rounded-lg text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <div className="max-w-xs mx-auto">
              <h4 className="font-bold text-sm text-slate-800">No activity logged yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? `No changes matched "${searchQuery}". Try a different search keyword.`
                  : 'Actions you take across mind maps, tasks, and AI assistants will appear here chronologically.'}
              </p>
            </div>
            {!searchQuery && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  id="activity-empty-new-map-btn"
                  onClick={() => createNewMap('Strategic Roadmap')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  + Create Mind Map
                </button>
                <button
                  id="activity-empty-new-task-btn"
                  onClick={() =>
                    addTask({
                      title: 'Complete Project Milestone',
                      priority: 'high',
                      status: 'todo',
                      mapId: 'map-quick',
                    })
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add Action Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Expand / Collapse Toggle */}
      {filteredActivities.length > limit && (
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-[11px]">
            Showing {displayedActivities.length} of {filteredActivities.length} changes
          </span>
          <button
            id="activity-toggle-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <span>{isExpanded ? 'Show Less' : `View All (${filteredActivities.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
