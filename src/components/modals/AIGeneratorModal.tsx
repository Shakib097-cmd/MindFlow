import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { generateMapFromPrompt } from '../../services/aiService';
import { MapLayout } from '../../types';
import {
  Sparkles,
  Zap,
  Compass,
  Layers,
  Loader2,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

export const AIGeneratorModal: React.FC = () => {
  const {
    isAIGeneratorOpen,
    setIsAIGeneratorOpen,
    createMapFromHierarchy,
    triggerCelebration,
  } = useWorkspace();

  const [prompt, setPrompt] = useState('');
  const [depth, setDepth] = useState<number>(3);
  const [layout, setLayout] = useState<MapLayout>('left-to-right');
  const [thinkingMode, setThinkingMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isAIGeneratorOpen) return null;

  const SAMPLE_PROMPTS = [
    'AI SaaS Go-To-Market & Growth Strategy',
    'Comprehensive SWOT Analysis for EV Startup',
    'Clean Architecture & Microservices Breakdown',
    'Neuroscience of Habit Formation & Learning',
    'Q3 Product Roadmap & Sprint Prioritization',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setStatusMessage('Activating Gemini Thinking Mode & structuring concepts...');

    try {
      setTimeout(() => {
        setStatusMessage('Synthesizing hierarchy, milestones, and actionable tasks...');
      }, 1200);

      const result = await generateMapFromPrompt(
        prompt.trim(),
        'General',
        depth,
        thinkingMode
      );

      createMapFromHierarchy(result, layout);
      triggerCelebration();
      setIsAIGeneratorOpen(false);
      setPrompt('');
    } catch (err: any) {
      console.error('Failed to generate map:', err);
      setStatusMessage('Error generating map. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 md:p-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                AI Mind Map Generator
              </h2>
              <p className="text-xs text-slate-500">
                Powered by Gemini with structured Thinking Mode reasoning
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIGeneratorOpen(false)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Prompt input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              What idea or topic do you want to explore? *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g., Complete strategy for launching an AI B2B SaaS in 2025 including monetization, tech stack, and growth loops..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Quick prompt chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Examples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Grid: Depth, Layout, Thinking Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {/* Depth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hierarchy Depth
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 font-medium focus:outline-hidden"
              >
                <option value={2}>2 Levels (Concise & Focused)</option>
                <option value={3}>3 Levels (Standard Strategic)</option>
                <option value={4}>4 Levels (Deep Master Architecture)</option>
              </select>
            </div>

            {/* Layout */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Canvas Layout</label>
              <select
                value={layout}
                onChange={(e: any) => setLayout(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 font-medium focus:outline-hidden capitalize"
              >
                <option value="left-to-right">Left to Right</option>
                <option value="radial">Radial Map</option>
                <option value="tree">Hierarchy Tree</option>
                <option value="top-to-bottom">Top to Bottom</option>
              </select>
            </div>

            {/* Thinking Mode Toggle */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Gemini Pro Thinking Mode
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Uses deep chain-of-thought for complex strategic models
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={thinkingMode}
                  onChange={(e) => setThinkingMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>

          {/* Loading status */}
          {isLoading && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-xs text-indigo-900 font-semibold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsAIGeneratorOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Map...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Mind Map</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
