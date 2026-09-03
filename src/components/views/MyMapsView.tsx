import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Layers,
  Search,
  Plus,
  Star,
  Trash2,
  ExternalLink,
  Calendar,
  Grid,
  List,
  Sparkles,
  MoreVertical,
  Filter,
  Folder,
  FolderPlus,
  RotateCcw,
  Tag,
  Check,
  X,
  AlertTriangle,
  FolderCheck,
} from 'lucide-react';

export const MyMapsView: React.FC = () => {
  const {
    allMaps,
    allFolders,
    openMap,
    trashMap,
    restoreMap,
    permanentDeleteMap,
    toggleFavoriteMap,
    assignMapToFolder,
    addFolder,
    deleteFolder,
    setIsAIGeneratorOpen,
    createNewMap,
  } = useWorkspace();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'trash'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'nodes' | 'title'>('recent');

  // Folder creation modal state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#4f46e5');

  // Assign folder menu state
  const [activeAssignMapId, setActiveAssignMapId] = useState<string | null>(null);

  const categories = ['All', 'Strategy', 'Business', 'Study', 'Engineering', 'Marketing', 'Brainstorm'];
  const folderColors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const filtered = allMaps
    .filter((m) => m && m.id !== 'map-mindflow-demo' && m.ownerId !== 'demo-user')
    .filter((m) => {
      // Trash vs Active tab
      if (activeTab === 'trash') {
        if (!m.isTrash) return false;
      } else {
        if (m.isTrash) return false;
        if (activeTab === 'favorites' && !m.isFavorite) return false;
      }

      // Folder filter
      if (selectedFolderId !== 'all') {
        if (m.folderId !== selectedFolderId) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && (m.category || 'General').toLowerCase() !== (selectedCategory || '').toLowerCase()) {
        return false;
      }

      // Search query filter
      if (
        search.trim() &&
        !(m.title || '').toLowerCase().includes(search.toLowerCase()) &&
        !(m.description || '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return (b.updatedAt || 0) - (a.updatedAt || 0);
      if (sortBy === 'nodes') return (b.nodesCount || 0) - (a.nodesCount || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const getFolderName = (folderId?: string) => {
    if (!folderId) return null;
    const f = allFolders.find((folder) => folder.id === folderId);
    return f ? f.name : null;
  };

  const getFolderColor = (folderId?: string) => {
    if (!folderId) return '#64748b';
    const f = allFolders.find((folder) => folder.id === folderId);
    return f ? f.color : '#64748b';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Mind Maps Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cloud-synced visual workspaces, folders, favorites, and trash.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="my-maps-blank-map-btn"
            onClick={() => createNewMap('Central Topic')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Blank Map</span>
          </button>
          <button
            id="my-maps-new-folder-btn"
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>New Folder</span>
          </button>
          <button
            id="my-maps-ai-generate-btn"
            onClick={() => setIsAIGeneratorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (All Maps / Favorites / Trash) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-all-maps"
          onClick={() => {
            setActiveTab('all');
            setSelectedFolderId('all');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'all' && selectedFolderId === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Maps ({allMaps.filter((m) => !m.isTrash).length})</span>
        </button>

        <button
          id="tab-favorites"
          onClick={() => {
            setActiveTab('favorites');
            setSelectedFolderId('all');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Favorites ({allMaps.filter((m) => !m.isTrash && m.isFavorite).length})</span>
        </button>

        {/* Folders Pills */}
        {allFolders.map((f) => (
          <div key={f.id} className="relative group flex items-center">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedFolderId(f.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedFolderId === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Folder className="w-3.5 h-3.5" style={{ color: selectedFolderId === f.id ? '#ffffff' : f.color }} />
              <span>{f.name}</span>
              <span className="text-[10px] opacity-80">
                ({allMaps.filter((m) => !m.isTrash && m.folderId === f.id).length})
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete folder "${f.name}"? (Maps inside will be moved to unassigned)`)) {
                  deleteFolder(f.id);
                  if (selectedFolderId === f.id) setSelectedFolderId('all');
                }
              }}
              className="hidden group-hover:flex items-center justify-center w-4 h-4 ml-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-500 transition-colors"
              title="Delete folder"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        <div className="ml-auto">
          <button
            id="tab-trash"
            onClick={() => {
              setActiveTab('trash');
              setSelectedFolderId('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash ({allMaps.filter((m) => m.isTrash).length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search maps by title or description..."
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* View mode toggle & Sort */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="recent">Recently Updated</option>
            <option value="nodes">Node Count</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            {activeTab === 'trash' ? <Trash2 className="w-6 h-6 text-rose-500" /> : <Layers className="w-6 h-6" />}
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">
            {activeTab === 'trash' ? 'Trash is empty' : 'No mind maps found'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {activeTab === 'trash'
              ? 'Deleted maps will appear here before permanent deletion.'
              : 'Try clearing filters or generate a new visual map.'}
          </p>
          {activeTab !== 'trash' && (
            <div className="flex items-center justify-center gap-3">
              <button
                id="my-maps-empty-blank-map-btn"
                onClick={() => createNewMap('Central Topic')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Blank Map</span>
              </button>
              <button
                onClick={() => setIsAIGeneratorOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Mind Map</span>
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((map) => (
            <div
              key={map.id}
              onClick={() => {
                if (!map.isTrash) openMap(map.id);
              }}
              className={`group bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between relative ${
                map.isTrash
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200 hover:border-indigo-500 hover:shadow-lg cursor-pointer'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {map.category}
                    </span>
                    {map.folderId && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white flex items-center gap-1"
                        style={{ backgroundColor: getFolderColor(map.folderId) }}
                      >
                        <Folder className="w-2.5 h-2.5" />
                        {getFolderName(map.folderId)}
                      </span>
                    )}
                  </div>
                  {!map.isTrash && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMap(map.id);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${map.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                      />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                  {map.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {map.description || 'Interactive mind map created with MindFlow AI workspace.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    {map.nodesCount || 0} nodes
                  </span>
                  <span className="capitalize text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {map.layout || 'left-to-right'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {map.isTrash ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreMap(map.id);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Restore map"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Permanently delete "${map.title}"? This cannot be undone.`)) {
                            permanentDeleteMap(map.id);
                          }
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Folder assign button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAssignMapId(activeAssignMapId === map.id ? null : map.id);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                        title="Assign to folder"
                      >
                        <Folder className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          trashMap(map.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Assign Folder Dropdown */}
              {activeAssignMapId === map.id && (
                <div
                  className="absolute right-4 bottom-14 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                    Assign to Folder
                  </div>
                  <button
                    onClick={() => {
                      assignMapToFolder(map.id, undefined);
                      setActiveAssignMapId(null);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      !map.folderId ? 'font-bold text-indigo-600' : 'text-slate-700'
                    }`}
                  >
                    <span>None (Unassigned)</span>
                    {!map.folderId && <Check className="w-3 h-3" />}
                  </button>
                  {allFolders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        assignMapToFolder(map.id, f.id);
                        setActiveAssignMapId(null);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        map.folderId === f.id ? 'font-bold text-indigo-600' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        <span className="truncate">{f.name}</span>
                      </div>
                      {map.folderId === f.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Folder</th>
                <th className="px-6 py-3.5">Layout</th>
                <th className="px-6 py-3.5">Nodes</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((map) => (
                <tr
                  key={map.id}
                  onClick={() => {
                    if (!map.isTrash) openMap(map.id);
                  }}
                  className={`hover:bg-slate-50/80 transition-colors ${map.isTrash ? 'bg-rose-50/20' : 'cursor-pointer'}`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      {!map.isTrash && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteMap(map.id);
                          }}
                          className="text-slate-300 hover:text-amber-500 cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              map.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                            }`}
                          />
                        </button>
                      )}
                      <span>{map.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {map.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {map.folderId ? (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded text-white inline-flex items-center gap-1"
                        style={{ backgroundColor: getFolderColor(map.folderId) }}
                      >
                        <Folder className="w-2.5 h-2.5" />
                        {getFolderName(map.folderId)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-600">{map.layout || 'left-to-right'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{map.nodesCount || 0} nodes</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(map.updatedAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {map.isTrash ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreMap(map.id);
                          }}
                          className="text-indigo-600 hover:underline font-bold text-xs cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Permanently delete "${map.title}"?`)) {
                              permanentDeleteMap(map.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          trashMap(map.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <span>Create New Folder</span>
              </div>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Marketing Q3, Engineering Sprints"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        newFolderColor === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {newFolderColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
