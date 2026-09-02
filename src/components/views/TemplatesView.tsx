import React, { useState } from 'react';
import { TEMPLATES } from '../../data/templates';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TemplateItem } from '../../types';
import { Search, Sparkles, ArrowRight, Layers, Tag, Check, Eye, Plus } from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const { createMapFromTemplate, createNewMap } = useWorkspace();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const categories = ['All', 'Strategy', 'Business', 'Study', 'Engineering', 'Marketing', 'Personal'];

  const filtered = TEMPLATES.filter((tpl) => {
    if (selectedCategory !== 'All' && (tpl.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (
      search.trim() &&
      !(tpl.title || '').toLowerCase().includes(search.toLowerCase()) &&
      !(tpl.description || '').toLowerCase().includes(search.toLowerCase()) &&
      !(tpl.tags || []).some((t) => (t || '').toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Mind Map Templates
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Curated frameworks for business strategy, software architecture, study, and sprint planning.
          </p>
        </div>

        <button
          id="templates-blank-map-btn"
          onClick={() => createNewMap('Central Topic')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 text-xs font-bold shadow-xs transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Blank Map (Start with central node)</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates (e.g. SWOT, Pitch, Sprint)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Blank Canvas Fast Card */}
        {selectedCategory === 'All' && !search.trim() && (
          <div
            id="template-blank-canvas-card"
            onClick={() => createNewMap('Central Topic')}
            className="group bg-gradient-to-b from-indigo-50/70 to-white rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  Instant Blank
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                Blank Mind Map
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                Start with a single central node on an infinite canvas and build out custom branches instantly.
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                  #blank
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                  #scratchpad
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                  #fast
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-indigo-100 flex items-center justify-between gap-2">
              <span className="text-xs text-indigo-600 font-semibold">1 Root Node</span>
              <button
                id="template-open-blank-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  createNewMap('Central Topic');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Open Blank</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {tpl.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {tpl.category}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                {tpl.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {tpl.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewTemplate(tpl)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold p-1"
                title="Preview Nodes Structure"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => createMapFromTemplate(tpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{previewTemplate.icon}</span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{previewTemplate.title}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">
                    {previewTemplate.category} Template ({previewTemplate.nodes.length} Nodes)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">{previewTemplate.description}</p>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Template Node Hierarchy:
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mb-4">
              {previewTemplate.nodes.map((node) => (
                <div
                  key={node.id}
                  style={{ marginLeft: node.parentId ? '24px' : '0px' }}
                  className={`p-2 rounded-lg text-xs font-medium ${
                    !node.parentId
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{node.title}</span>
                    {node.priority && (
                      <span className="text-[10px] uppercase font-bold text-indigo-200">
                        {node.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  createMapFromTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
              >
                Create Map with Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
