import React, { useState } from 'react';
import { X, Zap, Check, Sparkles, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { UNLIMITED_USAGE } from '../../config/usageConfig';
import { TOPUP_PACKAGES, FEATURE_REGISTRY, FeatureKey } from '../../services/entitlementsService';
import { CreditTopUpPackage } from '../../types';

export interface CreditTopUpModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentBalance?: number;
  onTopUpSuccess?: (creditsAdded: number, newBalance: number) => void;
  onTopUpExecute?: (packageId: string) => Promise<{ success: boolean; newBalance: number; packageCredits: number }>;
}

export const CreditTopUpModal: React.FC<CreditTopUpModalProps> = (props) => {
  const workspace = useWorkspace();
  const { profile } = useAuth();

  const isOpen = props.isOpen !== undefined ? props.isOpen : workspace.isCreditTopUpOpen;
  const onClose = props.onClose || (() => workspace.setIsCreditTopUpOpen(false));
  const currentBalance =
    props.currentBalance !== undefined
      ? props.currentBalance
      : (workspace.usage?.creditsBalance ?? Math.max(0, (workspace.usage?.monthlyCredits ?? 100) - (workspace.usage?.creditsUsed ?? 0)));
  const onTopUpExecute = props.onTopUpExecute || workspace.topUpCredits;
  const onTopUpSuccess = props.onTopUpSuccess;

  const [selectedPackage, setSelectedPackage] = useState<string>('topup_500');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{ credits: number; newBalance: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin =
    profile?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com';

  if (UNLIMITED_USAGE && !isAdmin) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6 relative">
          <button
            onClick={() => onClose()}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full uppercase tracking-wider">
              Coming Soon
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">AI Credit Top-Ups</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Credit refill packages and billing integration are coming soon. All AI generations and operations are currently <strong>unlimited and free</strong> for your workspace!
            </p>
          </div>

          <button
            onClick={() => onClose()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const res = await onTopUpExecute(selectedPackage);
      if (res && res.success) {
        setSuccessReceipt({
          credits: res.packageCredits,
          newBalance: res.newBalance,
        });
        if (workspace.triggerCelebration) {
          workspace.triggerCelebration();
        }
        if (onTopUpSuccess) {
          onTopUpSuccess(res.packageCredits, res.newBalance);
        }
      } else {
        setErrorMsg('Failed to apply credit top-up. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Transaction error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Up AI Credits</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Instant credit balance reload without altering monthly renewal</p>
            </div>
          </div>
          <button
            id="close-topup-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successReceipt ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Credits Successfully Added!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
                +{successReceipt.credits} AI credits have been added to your account. Your new balance is{' '}
                <span className="font-bold text-slate-900 dark:text-white">{successReceipt.newBalance} credits</span>.
              </p>
              <button
                id="topup-receipt-done-btn"
                onClick={handleReset}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
              >
                Continue Working
              </button>
            </div>
          ) : (
            <>
              {/* Balance Banner */}
              <div className="flex items-center justify-between p-4 mb-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Current Balance
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {currentBalance} <span className="text-sm font-semibold text-slate-500">Credits</span>
                  </span>
                </div>
                {currentBalance <= 0 ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    Depleted
                  </span>
                ) : currentBalance <= 15 ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    Low Balance
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Active
                  </span>
                )}
              </div>

              {/* Package Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {TOPUP_PACKAGES.map((pkg: CreditTopUpPackage) => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white uppercase tracking-wider">
                          {pkg.badge}
                        </span>
                      )}
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {pkg.name}
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        +{pkg.credits} <span className="text-xs font-semibold text-slate-500">pts</span>
                      </div>
                      <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        ${pkg.priceUsd} <span className="text-xs font-normal text-slate-400">one-time</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consumption Guide */}
              <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Credit Consumption Rates:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div>• AI Mind Map: <strong className="text-slate-800 dark:text-slate-200">5 pts</strong></div>
                  <div>• Voice / Doc Analysis: <strong className="text-slate-800 dark:text-slate-200">5 pts</strong></div>
                  <div>• Study Quizzes: <strong className="text-slate-800 dark:text-slate-200">4 pts</strong></div>
                  <div>• AI Summary: <strong className="text-slate-800 dark:text-slate-200">3 pts</strong></div>
                  <div>• AI Copilot Chat: <strong className="text-slate-800 dark:text-slate-200">2 pts</strong></div>
                  <div>• Node Expansion: <strong className="text-slate-800 dark:text-slate-200">1 pt</strong></div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-topup-purchase-btn"
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchase}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
                >
                  {isProcessing ? (
                    <span>Processing Top-Up...</span>
                  ) : (
                    <>
                      <span>Add Credits Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
