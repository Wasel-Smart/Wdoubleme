/**
 * Wasel Subscription Marketplace — Dark Glassmorphic Design
 *
 * Redesigned to match the Wasel dark premium UI with glassmorphism,
 * teal/green accent plan cards, and the JOD currency.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, Zap, Shield, TrendingUp, Calendar, MapPin, ArrowRight,
  CreditCard, Brain, Sparkles, ChevronRight, CircleDollarSign,
  Users, Star, Clock, RefreshCw, Layers, TrendingDown, Activity,
  ChevronDown, ChevronUp, Car, Crown, Package,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  rides: number | 'Unlimited';
  price: number;
  originalPrice: number;
  passengerSavingsPct: number;
  driverBoostPct: number;
  aiSuggestedFor?: string;
  popular?: boolean;
  premium?: boolean;
  accent: 'teal' | 'green' | 'orange';
  stats: { value: string; label: string }[];
  features: string[];
  aiFeatures: string[];
  pricingRows: { label: string; original: string; discounted: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: 'wasel',
    name: 'Wasel',
    nameAr: 'واصل',
    tagline: 'Your everyday commute, AI-optimized. Save on every trip with guaranteed pricing.',
    taglineAr: 'تنقلك اليومي بذكاء اصطناعي',
    rides: 20,
    price: 45.000,
    originalPrice: 65.000,
    passengerSavingsPct: 31,
    driverBoostPct: 28,
    popular: true,
    accent: 'teal',
    stats: [
      { value: '31,000+', label: 'Trip Completed' },
      { value: '76%', label: 'Repeat Rate' },
      { value: '49', label: 'Active Drivers' },
    ],
    features: [
      'Priority Commuting',
      'Flexible Cancellation',
      'AI Route Optimization',
      'Regular Routes via Location',
    ],
    aiFeatures: [
      'ML demand forecasting',
      'Peak-avoidance scheduling',
      'Dedicated driver pool',
    ],
    pricingRows: [
      { label: 'Amman → Zarqa', original: '5.000 JOD', discounted: '3.450 JOD' },
      { label: 'Airport → Amman', original: '15.000 JOD', discounted: '10.950 JOD' },
    ],
  },
  {
    id: 'raja3',
    name: 'Raja3',
    nameAr: 'رجعة',
    tagline: 'Round-trip benefits: AI-matched rides for verified daily commuters.',
    taglineAr: 'رحلات ذهاب وإياب لكل يوم',
    rides: 'Unlimited',
    price: 85.000,
    originalPrice: 130.000,
    passengerSavingsPct: 35,
    driverBoostPct: 35,
    premium: true,
    accent: 'green',
    stats: [
      { value: '29,000+', label: 'Round Trip Experience' },
      { value: '15%', label: 'Double Discount' },
      { value: '49', label: 'Pro Commuters' },
    ],
    features: [
      'Round Trip Commute',
      'Guaranteed Return Driver',
      'Zone Unlimited Access',
      'Regular Routes via Location',
    ],
    aiFeatures: [
      'Full AI route learning',
      'Guaranteed driver',
      'Predictive scheduling',
      'Personal mobility coach',
    ],
    pricingRows: [
      { label: 'Amman → Zarqa', original: '10.000 JOD', discounted: '6.500 JOD' },
      { label: 'Airport → Amman (R/T)', original: '30.000 JOD', discounted: '19.500 JOD' },
    ],
  },
];

const ACTIVE_SUB = {
  name: 'Wasel',
  ridesUsed: 14,
  ridesTotal: 20,
  expiresIn: 12,
  savedSoFar: 28.600,
  driverEarning: '180 JOD/mo',
  nextRenewal: 'Feb 24, 2026',
};

// ─── Accent colors ────────────────────────────────────────────────────────────

const accentMap = {
  teal: {
    gradient: 'from-[#09732E] to-[#04ADBF]',
    gradientSubtle: 'from-[#09732E]/20 to-[#04ADBF]/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
    bg: 'bg-teal-500/10',
    check: 'text-teal-400',
    button: 'bg-gradient-to-r from-[#09732E] to-[#04ADBF] hover:from-[#07602A] hover:to-[#038FA0]',
    glow: 'shadow-teal-500/20',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
    stat: 'text-teal-300',
  },
  green: {
    gradient: 'from-[#16A34A] to-[#22C55E]',
    gradientSubtle: 'from-[#16A34A]/20 to-[#22C55E]/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    check: 'text-emerald-400',
    button: 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A]',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    stat: 'text-emerald-300',
  },
  orange: {
    gradient: 'from-[#F59E0B] to-[#FF6B00]',
    gradientSubtle: 'from-[#F59E0B]/20 to-[#FF6B00]/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    check: 'text-amber-400',
    button: 'bg-gradient-to-r from-[#F59E0B] to-[#FF6B00] hover:from-[#D97706] hover:to-[#EA580C]',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    stat: 'text-amber-300',
  },
};

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onSelect,
}: {
  plan: Plan;
  onSelect: (p: Plan) => void;
}) {
  const colors = accentMap[plan.accent];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col"
    >
      {/* Popular / Premium ribbon */}
      {(plan.popular || plan.premium) && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center z-20">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${colors.badge} border`}>
            {plan.popular && <><Sparkles className="w-3 h-3" /> AI Recommended</>}
            {plan.premium && <><Crown className="w-3 h-3" /> Maximum Savings</>}
          </span>
        </div>
      )}

      <div className={`
        flex-1 flex flex-col rounded-2xl overflow-hidden
        bg-gradient-to-br from-[#111B2E] to-[#0D1526]
        border ${colors.border}
        shadow-xl ${colors.glow}
        backdrop-blur-sm
      `}>
        {/* ── Header gradient ── */}
        <div className={`relative bg-gradient-to-br ${colors.gradient} p-5 pb-6 overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-xl -ml-4 -mb-4 pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
            <p className="text-white/60 text-xs font-semibold mt-0.5" dir="rtl">{plan.nameAr}</p>
            <p className="text-white/80 text-xs mt-2 leading-relaxed max-w-[260px]">
              {plan.tagline}
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
          {plan.stats.map((stat, i) => (
            <div key={i} className="bg-[#0D1526] px-3 py-3 text-center">
              <div className={`text-lg font-black ${colors.stat}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-col p-5 space-y-4">
          {/* Mutual benefit */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-2">
              <Layers className="w-3 h-3" /> Mutual Value
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/10 rounded-lg p-2">
                <TrendingDown className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-green-300">{plan.passengerSavingsPct}% off</p>
                  <p className="text-[9px] text-green-500/60">You save</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/10 rounded-lg p-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-amber-300">+{plan.driverBoostPct}% more</p>
                  <p className="text-[9px] text-amber-500/60">Driver earns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {plan.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <div className={`w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Check className={`w-3 h-3 ${colors.check}`} />
                </div>
                <span className="text-slate-300 text-sm">{feat}</span>
              </div>
            ))}
          </div>

          {/* AI features */}
          <div className="space-y-2 border-t border-white/5 pt-3">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3 h-3" /> AI-Powered
            </p>
            {plan.aiFeatures.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-3 h-3 text-cyan-500/60 flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>

          {/* Pricing rows */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <CircleDollarSign className="w-3 h-3" /> Sample Pricing
            </p>
            {plan.pricingRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 line-through text-[10px]">{row.original}</span>
                  <span className={`font-bold ${colors.text}`}>{row.discounted}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Subscribe button */}
          <Button
            className={`w-full h-12 font-black text-sm shadow-lg ${colors.button} text-white border-0 rounded-xl`}
            onClick={() => onSelect(plan)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Subscribe Now — Save {plan.passengerSavingsPct}%
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Active Subscription Card ─────────────────────────────────────────────────

function ActiveSubscriptionCard({ sub }: { sub: typeof ACTIVE_SUB }) {
  const progress = (sub.ridesUsed / sub.ridesTotal) * 100;

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#111B2E] to-[#0D1526] border border-teal-500/20 shadow-xl shadow-teal-500/10">
      <div className="bg-gradient-to-r from-[#09732E] to-[#04ADBF] p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white border border-white/10">
              <Activity className="w-3 h-3" /> Active Plan
            </span>
            <h3 className="text-xl font-black text-white mt-2">{sub.name}</h3>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/10">
            {sub.expiresIn} days left
          </span>
        </div>

        {/* Rides progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-white/80">
            <span>Rides: {sub.ridesUsed}/{sub.ridesTotal}</span>
            <span>{sub.ridesTotal - sub.ridesUsed} remaining</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/10 rounded-xl p-3 text-center">
            <CircleDollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-base font-black text-green-300">{sub.savedSoFar.toFixed(3)}</p>
            <p className="text-[10px] text-green-500/60 font-medium">JOD Saved So Far</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/10 rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-base font-black text-amber-300">{sub.driverEarning}</p>
            <p className="text-[10px] text-amber-500/60 font-medium">Driver Earns</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 text-teal-400" />
            <span className="font-medium text-slate-400">Auto-renews</span>
          </div>
          <span className="font-bold text-white text-sm">{sub.nextRenewal}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 font-bold text-sm border-teal-500/20 text-teal-400 hover:bg-teal-500/10 bg-transparent">
            Manage
          </Button>
          <Button className="flex-1 font-bold text-sm bg-gradient-to-r from-[#09732E] to-[#04ADBF] text-white border-0">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Book a Ride
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

function ConfirmationView({
  plan,
  onConfirm,
  onBack,
}: {
  plan: Plan;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const colors = accentMap[plan.accent];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg mx-auto">
      <Button variant="ghost" className="mb-4 pl-0 font-bold text-slate-400 hover:text-white hover:bg-white/5" onClick={onBack}>
        ← Back to Plans
      </Button>

      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#111B2E] to-[#0D1526] border border-white/10 shadow-xl">
        <div className={`bg-gradient-to-br ${colors.gradient} p-5 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider relative z-10">Confirm Subscription</p>
          <h2 className="text-2xl font-black text-white mt-1 relative z-10">{plan.name}</h2>
          <div className="flex items-end gap-2 mt-3 relative z-10">
            <span className="text-3xl font-black text-white">{plan.price.toFixed(3)}</span>
            <span className="text-base text-white/60 pb-0.5">JOD / month</span>
          </div>
          <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/10 relative z-10">
            You save {(plan.originalPrice - plan.price).toFixed(3)} JOD vs pay-per-ride
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Mutual benefit */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-2">
                <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                <div>
                  <p className="text-xs font-black text-green-300">{plan.passengerSavingsPct}% off</p>
                  <p className="text-[9px] text-green-500/60">You save</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg p-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <p className="text-xs font-black text-amber-300">+{plan.driverBoostPct}% more</p>
                  <p className="text-[9px] text-amber-500/60">Driver earns</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Projections */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">AI 3-Month Projection</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {['Month 1', 'Month 2', 'Month 3'].map((m, i) => (
                <div key={m} className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                  <p className="text-[9px] text-slate-500 font-medium">{m}</p>
                  <p className="text-sm font-black text-green-400">{((plan.originalPrice - plan.price) * (i + 1)).toFixed(1)} JOD</p>
                  <p className="text-[9px] text-slate-500">saved</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <CreditCard className="w-4 h-4" /> Payment Method
              </span>
              <button className="text-teal-400 text-sm font-bold hover:text-teal-300">Change</button>
            </div>
            <div className="p-3 border border-white/5 rounded-xl flex items-center gap-3 bg-white/[0.03]">
              <div className="w-10 h-6 bg-slate-700 rounded flex items-center justify-center text-white text-[10px] font-black">VISA</div>
              <span className="text-sm font-medium text-slate-300">•••• 4242</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white cursor-pointer" htmlFor="auto-renew-confirm">Auto-renewal</label>
              <Switch id="auto-renew-confirm" defaultChecked />
            </div>
            <p className="text-xs text-slate-500 bg-white/[0.03] border border-white/5 rounded-lg p-2">
              Auto-renews Feb 24, 2026. Cancel anytime — no fees. AI will notify you 3 days before renewal.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <Button className={`w-full h-13 text-base font-black shadow-xl ${colors.button} text-white border-0 rounded-xl`} onClick={onConfirm}>
            <Zap className="w-5 h-5 mr-2" />
            Confirm & Pay {plan.price.toFixed(3)} JOD
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SubscriptionPlans() {
  const [activeTab, setActiveTab] = useState<'browse' | 'manage'>('browse');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [view, setView] = useState<'list' | 'confirm'>('list');

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setView('confirm');
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    toast.success(`Subscribed to ${selectedPlan.name}!`, {
      description: `You'll save ${selectedPlan.passengerSavingsPct}% — your driver earns ${selectedPlan.driverBoostPct}% more. Win-win!`,
    });
    setView('list');
    setActiveTab('manage');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8">

        {/* ── AI Status Bar ── */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-card border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 live-dot" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Subscription Engine</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-cyan-500" /> Match Rate: <span className="text-teal-400 font-bold">99.2%</span></span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Accuracy: <span className="text-amber-400 font-bold">97.8%</span></span>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="text-center space-y-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Brain className="w-3 h-3" /> AI Commute Optimizer
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2">
            Ride More. <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Pay Less.</span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            AI-powered commute bundles that save passengers money while guaranteeing drivers stable income.
          </p>
          <p className="text-xs font-bold text-teal-500/70 italic" dir="rtl">
            كل مقعد يولّد دخلاً · كل رحلة تبني ثروة
          </p>
        </div>

        {/* ── AI Recommendation Banner ── */}
        <div className="rounded-2xl overflow-hidden ai-glow">
          <div className="bg-gradient-to-r from-[#006F5C] to-emerald-700 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-2.5 bg-white/15 rounded-xl flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/10 mb-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Insight
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  You've taken <span className="text-green-300">18 trips</span> this month.
                </p>
                <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                  The <span className="font-black text-amber-300">Wasel</span> plan would have saved you
                  <span className="font-black text-green-300"> 18.5 JOD</span>. Subscribing also
                  guarantees your preferred driver <span className="font-black text-white">+35% higher earnings</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex justify-center">
          <div className="bg-card border border-white/5 p-1 rounded-full flex gap-1">
            <button
              onClick={() => { setActiveTab('browse'); setView('list'); }}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-[#09732E] to-[#04ADBF] text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse Plans
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                activeTab === 'manage'
                  ? 'bg-gradient-to-r from-[#09732E] to-[#04ADBF] text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              My Subscriptions
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {/* BROWSE: Plan Grid */}
          {activeTab === 'browse' && view === 'list' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                {PLANS.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
                ))}
              </div>

              {/* How subscriptions work */}
              <div className="rounded-2xl bg-gradient-to-br from-[#111B2E] to-[#0D1526] border border-white/5 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-white">How Subscriptions Fuel the Economy</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Brain className="w-2.5 h-2.5" /> E-SOSTAC Loop
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: Users, title: 'Passenger', desc: 'Saves up to 35% on monthly commute costs', color: 'text-teal-400', bg: 'bg-teal-500/10' },
                    { icon: Car, title: 'Driver', desc: 'Earns 35% more via predictable recurring revenue', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { icon: Brain, title: 'AI Engine', desc: 'Learns every trip to reduce cost and maximize earnings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  ].map((item) => (
                    <div key={item.title} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                      <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mx-auto`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* BROWSE: Confirmation */}
          {activeTab === 'browse' && view === 'confirm' && selectedPlan && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ConfirmationView plan={selectedPlan} onConfirm={handleConfirm} onBack={() => setView('list')} />
            </motion.div>
          )}

          {/* MANAGE */}
          {activeTab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <ActiveSubscriptionCard sub={ACTIVE_SUB} />

              {/* AI upsell */}
              <div className="rounded-2xl bg-gradient-to-br from-[#111B2E] to-[#0D1526] border border-cyan-500/15 p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">Upgrade Opportunity</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Upgrading to <span className="text-emerald-400 font-bold">Raja3</span> saves an extra 11.500 JOD/month based on your current trip pattern.
                    </p>
                    <button
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                      onClick={() => { setActiveTab('browse'); setView('list'); }}
                    >
                      View Plans <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
