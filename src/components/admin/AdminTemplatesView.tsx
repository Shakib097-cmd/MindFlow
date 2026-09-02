import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminTemplateRecord } from '../../types';
import { BookTemplate, Plus, Edit2, Trash2, CheckCircle2, Sparkles, X, Eye } from 'lucide-react';

export const AdminTemplatesView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [templates, setTemplates] = useState<AdminTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<AdminTemplateRecord> | null>(null);

  const canManage = ['SUPER_ADMIN', 'ADMIN'].includes(adminRole);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTemplates(adminRole);
      setTemplates(Array.isArray(res?.templates) ? res.templates : []);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [adminRole, refreshKey]);

  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.title) return;
    try {
      if (editingTemplate.id) {
        await adminService.updateTemplate(editingTemplate.id, editingTemplate, adminRole);
      } else {
        await adminService.createTemplate(
          {
            ...editingTemplate,
            nodeCount: editingTemplate.nodeCount || 6,
            isPublished: editingTemplate.isPublished ?? true,
          },
          adminRole
        );
      }
      setIsModalOpen(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (err: any) {
      alert(`Failed to save template: ${err.message}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this official template?')) return;
    try {
      await adminService.deleteTemplate(id, adminRole);
      loadTemplates();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookTemplate className="w-4 h-4 text-indigo-600" />
            Official System Templates Manager
          </h2>
          <p className="text-xs text-slate-500">
            Publish curated starter graphs and frameworks for Free & Pro subscribers.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingTemplate({
                title: '',
                category: 'Strategy',
                description: '',
                isPremium: false,
                isPublished: true,
                nodeCount: 6,
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Template</span>
          </button>
        )}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-400 font-mono text-xs">
            Loading template gallery...
          </div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono text-indigo-700 font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {tpl.isPremium && (
                      <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" /> PRO
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        tpl.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {tpl.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{tpl.description}</p>
                <div className="text-[10px] text-slate-400 font-mono mt-3">
                  Nodes: {tpl.nodeCount} • Uses: {tpl.usageCount || 0}
                </div>
              </div>

              {canManage && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingTemplate(tpl);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition"
                    title="Edit Template"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-2xs transition"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Template Modal */}
      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingTemplate.id ? 'Edit Template' : 'Create Starter Template'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTemplate(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  value={editingTemplate.title || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  placeholder="e.g. SWOT Analysis Framework"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Category</label>
                <select
                  value={editingTemplate.category || 'Strategy'}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Strategy">Strategy</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Education">Education</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Description</label>
                <textarea
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  placeholder="Brief description of when to use this mind map framework..."
                  className="w-full h-20 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTemplate.isPremium || false}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isPremium: e.target.checked })}
                    className="rounded border-slate-300 bg-white text-indigo-600"
                  />
                  <span className="text-slate-700 font-medium">Requires Pro / Business Tier</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTemplate.isPublished ?? true}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isPublished: e.target.checked })}
                    className="rounded border-slate-300 bg-white text-indigo-600"
                  />
                  <span className="text-slate-700 font-medium">Publish Immediately</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTemplate(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
