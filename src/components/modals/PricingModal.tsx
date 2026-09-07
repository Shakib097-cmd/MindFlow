import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PlanType } from '../../types';
import { UNLIMITED_USAGE } from '../../config/usageConfig';
import { Crown, Check, Zap, Sparkles, X, Shield, Star } from 'lucide-react';

export const PricingModal: React.FC = () => {
  const { isPricingOpen, setIsPricingOpen, triggerCelebration } = useWorkspace();
  const { profile, updatePlan } = useAuth();

  const isAdmin =
    profile?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com';

  if (UNLIMITED_USAGE && !isAdmin) {
    if (!isPricingOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6 relative">
          <button
            onClick={() => setIsPricingOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full uppercase tracking-wider">
              Coming Soon
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Subscription & Pricing Plans</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We are currently fine-tuning our flexible creator plans and billing tiers. For now, you have <strong>unlimited free access</strong> to all Pro features, AI capabilities, and mind-mapping tools with zero restrictions!
            </p>
          </div>

          <button
            onClick={() => setIsPricingOpen(false)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    );
  }

  if (!isPricingOpen) return null;

  const currentPlan = profile?.plan || 'pro';

  const handleSelectPlan = (plan: PlanType) => {
    updatePlan(plan);
    triggerCelebration();
    setIsPricingOpen(false);
  };

  const PLANS = [
    {
      id: 'free' as PlanType,
      name: 'Starter Free',
      price: '$0',
      period: 'forever',
      description: 'Essential visual brainstorming for individuals and students.',
      features: [
        '3 Mind Maps total',
        '25 AI Generations / month',
        'Standard Tree & Radial layouts',
        'Export to Markdown & PNG',
        'Local Storage sync',
      ],
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free',
      popular: false,
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro Creator',
      price: '$19',
      period: 'per month',
      description: 'Deep AI Thinking Mode, unlimited mind maps, voice capture & quizzes.',
      features: [
        'Unlimited Mind Maps & Canvas nodes',
        '500 AI Thinking Generations / month',
        'Gemini 3.1 Pro Thinking Mode',
        'Voice-to-Map Speech Recognition',
        'Document & PDF to Mind Map',
        'Interactive AI Study Hub & Quizzes',
        'Slide Deck Presentation Mode',
        'Cloud Firestore backup & sync',
      ],
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl p-6 md:p-8 animate-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                MindFlow AI Subscription Plans
              </h2>
              <p className="text-xs text-slate-500">
                Unlock full Gemini thinking capabilities, voice capture, and unlimited maps
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPricingOpen(false)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* 2 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((p) => {
            const isCurrent = currentPlan === p.id;
            return (
              <div
                key={p.id}
                className="rounded-3xl p-6 border border-slate-200 bg-white shadow-xs flex flex-col justify-between transition-all relative"
              >

                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-500 mb-4 min-h-[32px]">{p.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-500 font-medium">/{p.period}</span>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-700">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan(p.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : p.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  }`}
                >
                  {p.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-500" />
            14-day money-back guarantee. Cancel anytime with one click.
          </span>
          <span className="font-semibold text-slate-700">Secure 256-bit Encryption</span>
        </div>
      </div>
    </div>
  );
};
