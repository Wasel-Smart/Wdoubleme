/**
 * AICommuteOptimizer — Wasel AI-powered route optimizer panel
 *
 * ✅ Collapsible/expandable with smooth 250ms ease-in-out animation
 * ✅ Collapsed: brain icon + "AI SMART" label + destination input prompt
 * ✅ Expanded: full panel (stats, savings projector, route builder)
 * ✅ Session-persistent toggle state
 * ✅ Bilingual EN / AR (Jordanian dialect)
 * ✅ Wasel dark design system tokens
 * ✅ Accessible — keyboard + touch support
 */

import { useState, useRef, useEffect } from 'react';
import type { ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Sparkles,
  ChevronDown,
  Wallet,
  Car,
  TrendingUp,
  Leaf,
  MapPin,
  Target,
  Search,
  Flame,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface StatCard {
  icon: ElementType;
  label: string;
  labelAr: string;
  value: string;
  valueAr: string;
  color: string;
}

interface AICommuteOptimizerProps {
  /** User display name */
  userName?: string;
  /** JOD saved this month */
  savedThisMonth?: number;
  /** Wallet balance */
  walletBalance?: number;
  /** Total trips */
  totalTrips?: number;
  /** Total JOD saved */
  totalSaved?: number;
  /** CO₂ saved in kg */
  co2Saved?: number;
  /** Monthly savings goal in JOD */
  monthlyGoal?: number;
  /** Called when user submits a destination */
  onDestinationSubmit?: (destination: string) => void;
  /** Initial expanded state */
  defaultExpanded?: boolean;
  className?: string;
}

/* ─── Helper ─────────────────────────────────────────────────────────────────── */
function fmtJOD(n: number) {
  return n.toFixed(3);
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function StatPill({ icon: Icon, label, labelAr, value, valueAr, color }: StatCard) {
  return (
    <div
      className="flex flex-col gap-1.5 flex-1 min-w-0 rounded-2xl px-3 py-3 border border-white/5"
      style={{ background: 'var(--wasel-glass-md)' }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">{label}</span>
      </div>
      <p className="text-base font-bold text-white leading-none">{value}</p>
      <p className="text-[10px] text-slate-500 truncate" dir="rtl">{valueAr}</p>
    </div>
  );
}

function SavingsProjector({
  totalSaved,
  monthlyGoal,
}: {
  totalSaved: number;
  monthlyGoal: number;
}) {
  const pct = Math.min(100, (totalSaved / monthlyGoal) * 100);

  return (
    <div
      className="rounded-2xl p-4 border border-[#09732E]/30"
      style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.18) 0%, rgba(4,173,191,0.10) 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#09732E]/20 flex items-center justify-center">
            <Target className="w-3 h-3 text-[#09732E]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#09732E]">
            AI Savings Projector
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 rounded-full px-2 py-0.5 border border-white/10">
          <ArrowUpRight className="w-3 h-3 text-[#09732E]" />
          <span className="font-medium text-[#09732E]">vs solo taxi</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-[11px] text-slate-400 mb-1">This month's total savings</p>

      {/* Big number */}
      <div className="flex items-end gap-1 mb-3">
        <span className="text-3xl font-black text-white leading-none">{fmtJOD(totalSaved)}</span>
        <span className="text-sm font-bold text-slate-400 mb-0.5">JOD</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #09732E 0%, #04ADBF 100%)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${pct.toFixed(1)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Monthly Goal: {fmtJOD(monthlyGoal)} JOD</span>
          <span className="font-bold" style={{ color: pct > 0 ? '#04ADBF' : '#4b5563' }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export function AICommuteOptimizer({
  userName = 'User',
  savedThisMonth = 18.2,
  walletBalance = 0,
  totalTrips = 0,
  totalSaved = 0,
  co2Saved = 0,
  monthlyGoal = 20,
  onDestinationSubmit,
  defaultExpanded = false,
  className = '',
}: AICommuteOptimizerProps) {
  /* ── State ── */
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const stored = sessionStorage.getItem('wasel_ai_optimizer_open');
      return stored !== null ? stored === 'true' : defaultExpanded;
    } catch {
      return defaultExpanded;
    }
  });

  const [destination, setDestination] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Persist to session */
  useEffect(() => {
    try {
      sessionStorage.setItem('wasel_ai_optimizer_open', String(isExpanded));
    } catch {}
  }, [isExpanded]);

  /* Focus input on expand */
  useEffect(() => {
    if (isExpanded) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [isExpanded]);

  const toggle = () => setIsExpanded(p => !p);

  const handleDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onDestinationSubmit?.(destination.trim());
    }
  };

  /* ── Stats ── */
  const STATS: StatCard[] = [
    {
      icon: Wallet,
      label: 'Wallet',
      labelAr: 'المحفظة',
      value: `${fmtJOD(walletBalance)} JOD`,
      valueAr: `${fmtJOD(walletBalance)} د.أ`,
      color: '#D9965B',
    },
    {
      icon: Car,
      label: 'Trips',
      labelAr: 'رحلات',
      value: String(totalTrips),
      valueAr: String(totalTrips),
      color: '#04ADBF',
    },
    {
      icon: TrendingUp,
      label: 'Saved',
      labelAr: 'توفير',
      value: `${fmtJOD(totalSaved)} JOD`,
      valueAr: `${fmtJOD(totalSaved)} د.أ`,
      color: '#09732E',
    },
    {
      icon: Leaf,
      label: 'CO₂ Saved',
      labelAr: 'CO₂',
      value: `${co2Saved} kg`,
      valueAr: `${co2Saved} كغ`,
      color: '#50A612',
    },
  ];

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingAr =
    hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء الخير';

  return (
    <div
      className={`rounded-3xl overflow-hidden border border-white/8 shadow-2xl shadow-black/40 ${className}`}
      style={{ background: '#0B1120' }}
    >
      {/* ═══ HEADER — always visible ═══ */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse AI Commute Optimizer' : 'Expand AI Commute Optimizer'}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#04ADBF]/50 rounded-t-3xl"
        style={{
          background: 'linear-gradient(90deg, #09732E 0%, #04ADBF 90%)',
        }}
      >
        {/* Left: brain + label */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-white/90 truncate">
            AI Commute Optimizer
          </span>
        </div>

        {/* Right: savings badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/20">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-[10px] font-bold text-white">
              Saved {fmtJOD(savedThisMonth)} JOD this month
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </div>
      </button>

      {/* ═══ COLLAPSED BAR — sub-header always visible ═══ */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5"
        style={{ background: 'rgba(11,17,32,0.95)' }}
      >
        {/* Brain icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(4,173,191,0.15)', border: '1px solid rgba(4,173,191,0.3)' }}
        >
          <Brain className="w-4 h-4 text-[#04ADBF]" />
        </div>

        {/* Destination input (collapsed = read-only prompt, expanded = editable) */}
        <form onSubmit={handleDestinationSubmit} className="flex-1 flex items-center gap-2">
          <div
            onClick={() => !isExpanded && toggle()}
            className={`flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-white/8 ${!isExpanded ? 'cursor-pointer' : ''}`}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {isExpanded ? (
              <input
                ref={inputRef}
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Where to? AI will optimize your route…"
                className="flex-1 bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none"
                aria-label="Destination input"
              />
            ) : (
              <span className="text-xs text-slate-500">
                Where to? AI will optimize your route…
              </span>
            )}
          </div>

          {/* AI SMART badge */}
          <button
            type={isExpanded ? 'submit' : 'button'}
            onClick={() => !isExpanded && toggle()}
            className="shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold text-[10px] uppercase tracking-wider transition-all hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#04ADBF]/50"
            style={{
              background: 'linear-gradient(135deg, rgba(4,173,191,0.2) 0%, rgba(9,115,46,0.2) 100%)',
              border: '1px solid rgba(4,173,191,0.35)',
              color: '#04ADBF',
            }}
          >
            <Sparkles className="w-3 h-3" />
            AI Smart
          </button>
        </form>
      </div>

      {/* ═══ EXPANDABLE BODY ═══ */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-3 space-y-4">
              {/* Greeting row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #09732E, #04ADBF)' }}
                  >
                    {userName[0]?.toUpperCase() ?? 'W'}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">{greeting} · {greetingAr}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{userName}</span>
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                  </div>
                </div>

                {/* Saved badge */}
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-[#09732E]/30"
                  style={{ background: 'rgba(9,115,46,0.12)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#09732E] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#09732E]">
                    {fmtJOD(totalSaved)} JOD saved
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATS.map((stat) => (
                  <StatPill key={stat.label} {...stat} />
                ))}
              </div>

              {/* AI Savings Projector */}
              <SavingsProjector totalSaved={totalSaved} monthlyGoal={monthlyGoal} />

              {/* Popular routes (quick suggestions) */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Quick Routes · رحلات سريعة
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Amman → Aqaba', ar: 'عمّان ← العقبة', price: '8 JOD' },
                    { label: 'Amman → Irbid', ar: 'عمّان ← إربد', price: '4 JOD' },
                    { label: 'Amman → Dead Sea', ar: 'عمّان ← البحر الميت', price: '6 JOD' },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => {
                        setDestination(r.label);
                        onDestinationSubmit?.(r.label);
                      }}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-semibold text-slate-300 border border-white/8 hover:border-[#04ADBF]/40 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <MapPin className="w-3 h-3 text-[#04ADBF] shrink-0" />
                      {r.label}
                      <span className="text-[#09732E] font-bold">{r.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}