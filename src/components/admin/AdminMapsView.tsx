import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminMapSummary } from '../../types';
import { Network, Search, Eye, Share2, Lock, Calendar, RefreshCw } from 'lucide-react';

export const AdminMapsView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [maps, setMaps] = useState<AdminMapSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaps() {
      setLoading(true);
      try {
        const res = await adminService.getMaps(search, adminRole);
        setMaps(res.maps);
      } catch (err) {
        console.error('Failed to load maps:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaps();
  }, [search, adminRole, refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            Global Mind Maps Inventory
          </h2>
          <p className="text-xs text-slate-400">
            Real-time synchronization records across all workspace accounts.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search map titles or user email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Maps Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Map Title</th>
                <th className="py-3 px-4">Owner Email</th>
                <th className="py-3 px-4">Nodes</th>
                <th className="py-3 px-4">Edges</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading map graph records...
                  </td>
                </tr>
              ) : maps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No maps found in database.
                  </td>
                </tr>
              ) : (
                maps.map((map) => (
                  <tr key={map.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200">{map.title}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{map.userEmail}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{map.nodeCount}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{map.edgeCount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          map.isPublic
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {map.isPublic ? <Share2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {map.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-300">{map.category || 'General'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(map.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
