import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/adminService';
import { AdminPlanConfig } from '../../types';
import { Sliders, Save, CheckCircle2, AlertTriangle, Sparkles, Layers, HardDrive } from 'lucide-react';

export const AdminPlansView: React.FC = () => {
  const { adminRole, refreshKey } = useAdmin();
  const [plans, setPlans] = useState<AdminPlanConfig[]>([]);
  const [editedPlans, setEditedPlans] = useState<Record<string, AdminPlanConfig>>({});
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const canEdit = ['SUPER_ADMIN'].includes(adminRole);

  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      try {
        const res = await adminService.getPlans(adminRole);
        const planList = Array.isArray(res?.plans) ? res.plans : [];
        setPlans(planList);
        const map: Record<string, AdminPlanConfig> = {};
        planList.forEach((p) => {
          map[p.id] = { ...p };
        });
        setEditedPlans(map);
      } catch (err) {
        console.error('Failed to load plans:', err);
        setPlans([]);
        setEditedPlans({});
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [adminRole, refreshKey]);

  const handleFieldChange = (planId: string, field: keyof AdminPlanConfig, value: any) => {
    setEditedPlans((prev) => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value,
      },
    }));
  };

  const handleSavePlan = async (planId: string) => {
    if (!canEdit) return;
    setSavingPlanId(planId);
    setSaveSuccess(null);
    try {
      const planData = editedPlans[planId];
      await adminService.updatePlan(planId, planData, adminRole);
      setSaveSuccess(`Plan "${planData.name}" configuration saved.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSavingPlanId(null);
    }
  };

  if (loading && plans.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading plan configurations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Centralized Plan Configuration Engine
          </h2>
          <p className="text-xs text-slate-500">
            Updating plan limits here automatically enforces server-side AI quota middleware and UI capabilities.
          </p>
        </div>
        {!canEdit && (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            🔒 SUPER_ADMIN required to modify plans
          </span>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveSuccess}
        </div>
      )}

      {/* Grid of 3 Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const edited = editedPlans[plan.id] || plan;
          const isSaving = savingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-indigo-600 font-bold">{plan.id} TIER</span>
                    <h3 className="text-base font-bold text-slate-900">{edited.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-700">
                    ${edited.monthlyPrice}/mo
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Monthly Price ($)</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={edited.monthlyPrice}
                      onChange={(e) => handleFieldChange(plan.id, 'monthlyPrice', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Yearly Price ($)</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={edited.yearlyPrice}
                      onChange={(e) => handleFieldChange(plan.id, 'yearlyPrice', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Monthly AI Generations Limit</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={edited.aiGenerationsLimit}
                      onChange={(e) => handleFieldChange(plan.id, 'aiGenerationsLimit', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-amber-700 font-mono font-bold disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Max Maps Limit</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={edited.mapLimit}
                      onChange={(e) => handleFieldChange(plan.id, 'mapLimit', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Cloud Storage Limit (MB)</label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={edited.storageLimitMb}
                      onChange={(e) => handleFieldChange(plan.id, 'storageLimitMb', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={edited.premiumTemplates}
                        onChange={(e) => handleFieldChange(plan.id, 'premiumTemplates', e.target.checked)}
                        className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-700 text-xs font-medium">Premium Template Access</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={edited.prioritySupport}
                        onChange={(e) => handleFieldChange(plan.id, 'prioritySupport', e.target.checked)}
                        className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-700 text-xs font-medium">Priority AI Thinking Model Queue</span>
                    </label>
                  </div>
                </div>
              </div>

              {canEdit && (
                <button
                  onClick={() => handleSavePlan(plan.id)}
                  disabled={isSaving}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Plan Changes'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
