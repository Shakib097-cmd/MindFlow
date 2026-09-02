import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PlanType } from '../../types';
import { Crown, Check, Zap, Sparkles, X, Shield, Star } from 'lucide-react';

export const PricingModal: React.FC = () => {
  const { isPricingOpen, setIsPricingOpen, triggerCelebration } = useWorkspace();
  const { profile, updatePlan } = useAuth();

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
      popular: true,
    },
    {
      id: 'business' as PlanType,
      name: 'Team & Business',
      price: '$49',
      period: 'per month',
      description: 'Advanced team collaboration, custom branding, and team workspace.',
      features: [
        'Everything in Pro plan',
        'Unlimited AI Generations',
        'Real-time Multi-user collaboration',
        'Custom template builder',
        'Team Folders & Shared Workspaces',
        'Dedicated Priority Support',
        'Custom Enterprise SSO & Exports',
      ],
      buttonText: currentPlan === 'business' ? 'Current Plan' : 'Upgrade to Business',
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

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((p) => {
            const isCurrent = currentPlan === p.id;
            return (
              <div
                key={p.id}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all relative ${
                  p.popular
                    ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </div>
                )}

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
