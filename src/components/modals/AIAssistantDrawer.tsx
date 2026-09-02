import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { expandNodeWithAI, askGeminiCustom } from '../../services/aiService';
import {
  Sparkles,
  BrainCircuit,
  Plus,
  ArrowRight,
  Loader2,
  X,
  Lightbulb,
  CheckSquare,
  Zap,
  Check,
} from 'lucide-react';

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    selectedNodeId,
    nodes,
    activeMap,
    addNodeChild,
    allTasks,
    updateTask,
    usage,
    recordUsage,
    triggerCelebration,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'ai' | 'action'>('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; suggestions?: string[] }>
  >([
    {
      sender: 'ai',
      text: "I've analyzed your mind map and identified strategic growth areas to expand.",
    },
  ]);

  // Suggested nodes for the active topic
  const [suggestions, setSuggestions] = useState<string[]>([
    'Competitive Analysis Node',
    'Pricing Tier Mapping',
    'Security & Compliance Review',
    'Customer Feedback Loops',
  ]);

  if (!isAIAssistantOpen) return null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleApplySingleSuggestion = (item: string) => {
    if (!selectedNode) return;
    addNodeChild(selectedNode.id, item, 'idea');
    setSuggestions((prev) => prev.filter((s) => s !== item));
    triggerCelebration();
  };

  const handleApplyAllSuggestions = () => {
    if (!selectedNode) return;
    (suggestions || []).forEach((item) => {
      addNodeChild(selectedNode.id, item, 'idea');
    });
    setSuggestions([]);
    triggerCelebration();
  };

  const handleExpandBranch = async () => {
    if (!selectedNode || !activeMap) return;
    setIsLoading(true);

    try {
      const generated = await expandNodeWithAI(
        selectedNode.id,
        selectedNode.title,
        activeMap.title,
        4
      );

      const items = Array.isArray(generated) ? generated : [];

      items.forEach((sub: any) => {
        if (sub && sub.title) {
          addNodeChild(selectedNode.id, sub.title, sub.type || 'idea');
        }
      });

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Expanded "${selectedNode.title}" with ${items.length} new nodes.`,
          suggestions: items.map((s: any) => s.title).filter(Boolean),
        },
      ]);
      recordUsage('ai');
      triggerCelebration();
    } catch (err) {
      console.error('Error expanding node:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || !selectedNode) return;

    const q = userQuery.trim();
    setUserQuery('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setIsLoading(true);

    try {
      const response = await askGeminiCustom(
        q,
        `Topic: ${activeMap?.title || 'Map'}, Selected Node: ${selectedNode.title}`
      );

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response,
        },
      ]);
      recordUsage('ai');
    } catch (err) {
      console.error('AI Copilot query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recentTasks = allTasks.slice(0, 5);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 sm:hidden transition-opacity"
        onClick={() => setIsAIAssistantOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 w-full xs:w-88 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Top Header & Close Button */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-tight">AI Copilot</span>
        </div>
        <button
          onClick={() => setIsAIAssistantOpen(false)}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
            activeTab === 'ai'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          AI ASSISTANT
        </button>
        <button
          onClick={() => setActiveTab('action')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
            activeTab === 'action'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          ACTION PLAN
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {activeTab === 'ai' ? (
          <>
            {/* Gemini Suggestions Card */}
            {suggestions.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-indigo-800 mb-1.5 uppercase tracking-wide">
                  Gemini Suggestions
                </h4>
                <p className="text-xs text-indigo-600 leading-relaxed mb-3">
                  Identified {suggestions.length} missing areas for{' '}
                  <span className="font-bold text-indigo-900">
                    {selectedNode ? selectedNode.title : activeMap?.title || 'Strategy'}
                  </span>
                  .
                </p>
                <ul className="space-y-2">
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleApplySingleSuggestion(item)}
                      className="bg-white p-2 rounded-lg border border-indigo-100 text-[11px] flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all text-slate-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleApplyAllSuggestions}
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
                >
                  Apply All Suggestions
                </button>
              </div>
            )}

            {/* Chat History Messages */}
            <div className="space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-xs font-semibold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini thinking and expanding...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ACTION PLAN TAB */
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">
                Recent Tasks
              </h4>
              {recentTasks.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No tasks created yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((t) => (
                    <div key={t.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={t.status === 'done'}
                        onChange={() =>
                          updateTask(t.id, {
                            status: t.status === 'done' ? 'todo' : 'done',
                          })
                        }
                        className="rounded border-slate-300 mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-medium text-slate-800 ${
                            t.status === 'done' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t.dueDate ? `Due ${t.dueDate}` : 'No deadline'} •{' '}
                          <span className="capitalize">{t.priority}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Context Node
              </span>
              <span className="text-xs font-semibold text-slate-800 block truncate">
                {selectedNode ? selectedNode.title : 'Root Topic'}
              </span>
              <button
                onClick={handleExpandBranch}
                disabled={isLoading}
                className="mt-3 w-full py-1.5 bg-white border border-slate-300 hover:border-indigo-500 text-slate-700 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-generate Sub-tasks</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Credits & Prompt Input */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          <span>AI Credits</span>
          <span>
            {usage.aiGenerationsLimit - usage.aiGenerationsUsed} / {usage.aiGenerationsLimit}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            style={{
              width: `${Math.max(
                10,
                ((usage.aiGenerationsLimit - usage.aiGenerationsUsed) / usage.aiGenerationsLimit) * 100
              )}%`,
            }}
            className="h-full bg-indigo-500 rounded-full transition-all"
          />
        </div>

        <form onSubmit={handleCustomQuery} className="mt-4 relative">
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCustomQuery(e);
              }
            }}
            rows={3}
            placeholder="Ask AI to expand a node..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 placeholder-slate-400 pr-9"
          />
          <button
            type="submit"
            disabled={isLoading || !userQuery.trim()}
            className="absolute bottom-3 right-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
    </>
  );
};

