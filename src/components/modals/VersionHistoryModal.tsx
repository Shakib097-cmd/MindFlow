import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getStoredSnapshots } from '../../lib/storage';
import { History, RotateCcw, Clock, Layers, ArrowRight } from 'lucide-react';

export const VersionHistoryModal: React.FC = () => {
  const {
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    activeMap,
    triggerCelebration,
  } = useWorkspace();

  if (!isVersionHistoryOpen || !activeMap) return null;

  const snapshots = getStoredSnapshots(activeMap.id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Version History</h3>
              <p className="text-[11px] text-slate-500">Restore earlier snapshots</p>
            </div>
          </div>
          <button
            onClick={() => setIsVersionHistoryOpen(false)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Snapshot list */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {snapshots.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Current version is the primary snapshot. Changes are saved automatically in real-time.
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-indigo-50/40 transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{snap.label}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(snap.createdAt).toLocaleTimeString()}
                    </span>
                    <span>• {snap.nodes.length} nodes</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // restore snapshot logic
                    triggerCelebration();
                    setIsVersionHistoryOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white text-[11px] font-bold shadow-xs transition-colors"
                >
                  Restore
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsVersionHistoryOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
