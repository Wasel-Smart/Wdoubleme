/**
 * Wasel Shared UI Components for Admin Dashboard
 *
 * Simplified visual building blocks aligned with the carpooling model.
 * No surge pricing, no real-time matching, no demand heatmaps.
 * Focus: route liquidity, cost-sharing, cultural features.
 */

import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIMetric {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
}

// ─── AI Badge ─────────────────────────────────────────────────────────────────
// A small glowing pill label

interface AIBadgeProps {
  label: string;
  variant?: 'teal' | 'orange' | 'gold' | 'green';
  pulse?: boolean;
  icon?: React.ElementType;
  size?: 'xs' | 'sm';
}

export function AIBadge({
  label,
  variant = 'teal',
  pulse = true,
  icon: Icon = Sparkles,
  size = 'xs',
}: AIBadgeProps) {
  const styles = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    gold: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  };
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${styles[variant]} ${textSize}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 mr-0.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === 'teal' ? 'bg-teal-500' : variant === 'orange' ? 'bg-orange-500' : variant === 'gold' ? 'bg-amber-500' : 'bg-green-500'}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${variant === 'teal' ? 'bg-teal-600' : variant === 'orange' ? 'bg-orange-600' : variant === 'gold' ? 'bg-amber-600' : 'bg-green-600'}`} />
        </span>
      )}
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ─── Insight Card ──────────────────────────────────────────────────────────────
// A glowing card that shows a single insight

interface AIInsightCardProps {
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  icon?: React.ElementType;
  variant?: 'teal' | 'orange' | 'purple';
  onClick?: () => void;
}

export function AIInsightCard({
  title,
  description,
  metric,
  metricLabel,
  icon: Icon = Sparkles,
  variant = 'teal',
  onClick,
}: AIInsightCardProps) {
  const bg = {
    teal: 'from-teal-600 to-[#006F5C]',
    orange: 'from-orange-500 to-[#FF6B00]',
    purple: 'from-violet-600 to-purple-700',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bg[variant]} p-0.5 shadow-xl cursor-pointer`}
      onClick={onClick}
    >
      <div className={`relative overflow-hidden rounded-[14px] bg-gradient-to-br ${bg[variant]} p-4`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl -ml-6 -mb-6 pointer-events-none" />

        <div className="relative z-10 flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-white leading-tight">{title}</h4>
              {metric && (
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black text-white leading-none">{metric}</div>
                  {metricLabel && <div className="text-[9px] text-white/70 uppercase tracking-wider">{metricLabel}</div>}
                </div>
              )}
            </div>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Metrics Row ───────────────────────────────────────────────────────────────

export function AIMetricsRow({ metrics }: { metrics: AIMetric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="bg-card border border-border/60 rounded-xl p-3 space-y-1 hover:border-primary/30 transition-colors"
        >
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</p>
          <p className="text-xl font-black text-foreground leading-none">{m.value}</p>
          {m.delta && (
            <p className={`text-[10px] font-bold flex items-center gap-0.5 ${m.positive !== false ? 'text-green-600' : 'text-red-500'}`}>
              {m.positive !== false ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {m.delta}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Route Overlay (replaces ML Heatmap) ──────────────────────────────────────
// Shows popular route lines on the map instead of demand/surge zones

export function MLHeatmapOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Popular route indicators */}
      <div className="absolute top-[25%] left-[40%] w-3 h-3 rounded-full bg-primary animate-pulse" />
      <div className="absolute top-[55%] left-[35%] w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
      <div className="absolute top-[70%] left-[50%] w-3 h-3 rounded-full bg-amber-500 animate-pulse" />

      {/* Label */}
      <div className="absolute top-2 right-2">
        <span className="text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
          <Cpu className="w-2.5 h-2.5" /> Popular Routes
        </span>
      </div>
    </div>
  );
}

// ─── Carpooling Ticker ─────────────────────────────────────────────────────────

export function AIPerformanceTicker() {
  const items = [
    '🚗 47 rides available today',
    '📦 12 packages in transit',
    '🕌 156 prayer stops this week',
    '🚺 34% women-only rides',
    '✅ 82% booking success rate',
    '💰 Avg JOD 5.50/seat (fixed cost-sharing)',
    '🌙 Ramadan Mode: 1,204 active users',
    '⭐ 4.8 avg community rating',
  ];

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-xl py-2 px-0">
      <div className="flex gap-8 animate-[ticker_25s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-[11px] font-semibold text-slate-300 flex-shrink-0">
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Economic Loop Visualizer ─────────────────────────────────────────────────
// Shows the carpooling value loop (simplified)

export function EconomicLoopVisualizer() {
  const steps = [
    { label: 'Traveler Posts Ride', sub: 'Advance booking', color: '#006F5C', angle: 270 },
    { label: 'Passengers Book', sub: 'Share fuel cost', color: '#FF6B00', angle: 30 },
    { label: 'Everyone Saves', sub: 'Lower cost for all', color: '#7c3aed', angle: 150 },
  ];

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="72" fill="none" stroke="url(#loopGrad)" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
          <defs>
            <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006F5C" />
              <stop offset="50%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <radialGradient id="centerGrad">
              <stop offset="0%" stopColor="#006F5C" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#006F5C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="40" fill="url(#centerGrad)" />

          {steps.map((step, i) => {
            const rad = (step.angle * Math.PI) / 180;
            const x = 100 + 72 * Math.cos(rad);
            const y = 100 + 72 * Math.sin(rad);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="16" fill={step.color} opacity="0.15" />
                <circle cx={x} cy={y} r="8" fill={step.color} opacity="0.9" />
              </g>
            );
          })}

          <path d="M 100 28 Q 160 30 172 100" fill="none" stroke="#006F5C" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowTeal)" opacity="0.6" />
          <path d="M 172 100 Q 160 170 100 172" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowOrange)" opacity="0.6" />
          <path d="M 100 172 Q 40 170 28 100 Q 30 40 100 28" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowPurple)" opacity="0.6" />

          <defs>
            <marker id="arrowTeal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#006F5C" />
            </marker>
            <marker id="arrowOrange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF6B00" />
            </marker>
            <marker id="arrowPurple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
            </marker>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl">🚗</span>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">Wasel</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground font-medium italic leading-snug max-w-[220px]">
        "شارك الرحلة، وفّر المصاري"
        <br />Share the Journey, Share the Cost
      </p>
    </div>
  );
}

// ─── Mutual Benefit Banner ─────────────────────────────────────────────────────

interface MutualBenefitBannerProps {
  driverBoost: string;
  passengerSavings: string;
  plan?: string;
}

export function MutualBenefitBanner({ driverBoost, passengerSavings, plan }: MutualBenefitBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-orange-500 shadow-xl"
    >
      <div className="bg-slate-900 rounded-[14px] p-4">
        <div className="flex items-center justify-center gap-1 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
            {plan ? `${plan} — ` : ''}Cost Sharing Benefits
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <TrendingDown className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-black text-green-400">{passengerSavings}%</p>
            <p className="text-[10px] text-green-300/70 font-medium">Passenger Saves</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <TrendingUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-black text-amber-400">{driverBoost}%</p>
            <p className="text-[10px] text-amber-300/70 font-medium">Traveler Fuel Offset</p>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-semibold mt-3 italic">
          "Share the Journey, Share the Cost"
        </p>
      </div>
    </motion.div>
  );
}

// ─── Savings Badge ─────────────────────────────────────────────────────────────

export function SavingsBadge({ amount, label = 'Estimated Savings' }: { amount: string; label?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-green-500/30"
    >
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
        <span className="text-sm font-black">{amount} JOD</span>
      </div>
    </motion.div>
  );
}

// ─── Earnings Badge ────────────────────────────────────────────────────────────

export function EarningsBadge({ amount, label = 'Fuel Offset' }: { amount: string; label?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/30"
    >
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
        <span className="text-sm font-black">+{amount} JOD</span>
      </div>
    </motion.div>
  );
}

// ─── Prediction Chip ───────────────────────────────────────────────────────────

interface AIPredictionChipProps {
  label: string;
  value: string;
  confidence?: number;
  variant?: 'savings' | 'earnings' | 'demand';
}

export function AIPredictionChip({ label, value, confidence = 92, variant = 'savings' }: AIPredictionChipProps) {
  const color = variant === 'savings' ? 'text-green-600 bg-green-50 border-green-200' :
                variant === 'earnings' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <div className={`inline-flex flex-col px-3 py-2 rounded-xl border ${color} min-w-[120px]`}>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-base font-black leading-tight">{value}</span>
      <div className="flex items-center gap-1 mt-1">
        <Progress value={confidence} className="h-1 flex-1" />
        <span className="text-[9px] font-semibold opacity-60">{confidence}%</span>
      </div>
    </div>
  );
}

// ─── Status Bar (kept for backward compat) ─────────────────────────────────────

export function AIStatusBar({ mode }: { mode: 'passenger' | 'driver' | 'admin' }) {
  const configs = {
    passenger: { color: 'bg-gradient-to-r from-[#006F5C] to-emerald-600', label: 'Ride Recommendations', stat: 'Based on your travel history' },
    driver: { color: 'bg-gradient-to-r from-slate-900 to-[#006F5C]', label: 'Traveler Dashboard', stat: 'Your upcoming rides' },
    admin: { color: 'bg-gradient-to-r from-[#1A1F36] to-[#006F5C]', label: 'Operations Center', stat: 'Route liquidity: Healthy' },
  };
  const c = configs[mode];

  return (
    <div className={`${c.color} text-white px-4 py-2 flex items-center justify-between text-xs rounded-xl`}>
      <span className="font-bold uppercase tracking-wider">{c.label}</span>
      <span className="text-white/70 font-medium">{c.stat}</span>
    </div>
  );
}
