/**
 * InvestorFeatureSections — Wasel | واصل
 * Investor-grade feature showcase for the landing page
 * [AI] Smart Pickup Zones · Dynamic Trip Bundling · Corridor Map · Demand Forecasting
 * [Package] Passenger + Package Fusion · [Trust] Safety Layer
 * [DigitalTwin] National corridor intelligence
 */

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Brain, MapPin, Package, Shield,
  TrendingUp, Car, CheckCircle2, ArrowRight,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { formatCurrency } from '../../utils/currency';

// ── Brand ─────────────────────────────────────────────────────────────────────
const C = {
  bg: '#040C18', card: '#0A1628', card2: '#0D1E35',
  cyan: '#00C8E8', green: '#00C875', gold: '#F0A830',
  lime: '#A8E63D', purple: '#A78BFA', pink: '#EC4899',
  muted: '#4D6A8A',
};

// ── Annotation tag ────────────────────────────────────────────────────────────
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center text-xs font-black px-2.5 py-0.5 rounded-full"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30`, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`py-16 px-4 ${className}`}>
      {children}
    </motion.section>
  );
}

// ── Jordan Corridor Map SVG ───────────────────────────────────────────────────
function JordanCorridorMap({ ar }: { ar: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const corridors = [
    { id: 'aqaba', label: ar ? 'العقبة' : 'Aqaba', x: 200, y: 380, color: C.cyan, demand: 94, price: 8 },
    { id: 'irbid', label: ar ? 'إربد' : 'Irbid',  x: 210, y: 70,  color: C.green, demand: 87, price: 4 },
    { id: 'zarqa', label: ar ? 'الزرقا' : 'Zarqa', x: 305, y: 160, color: C.gold, demand: 76, price: 2 },
    { id: 'salt',  label: ar ? 'السلط' : 'Salt',   x: 155, y: 185, color: C.purple, demand: 45, price: 3 },
    { id: 'petra', label: ar ? 'البتراء' : 'Petra', x: 150, y: 330, color: '#F59E0B', demand: 62, price: 12 },
    { id: 'deadsea', label: ar ? 'البحر الميت' : 'Dead Sea', x: 90, y: 240, color: '#0EA5E9', demand: 58, price: 5 },
  ];
  // Amman center
  const amman = { x: 235, y: 195 };

  return (
    <div className="relative rounded-3xl overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.cyan}15`, boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${C.cyan}12` }}>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" style={{ color: C.cyan }} />
          <span className="font-bold text-white text-sm">{ar ? 'خريطة الممرات الذكية' : 'Smart Corridor Map'}</span>
        </div>
        <div className="flex gap-1.5">
          <Tag label="[Corridor]" color={C.cyan} />
          <Tag label="[AI]" color={C.lime} />
        </div>
      </div>

      {/* SVG map */}
      <div className="relative">
        <svg viewBox="0 0 400 480" className="w-full" style={{ maxHeight: 400 }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="ammanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={C.cyan} stopOpacity="0.4" />
              <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="480" fill="url(#grid)" />

          {/* Route lines */}
          {corridors.map((c) => {
            const isHov = hovered === c.id;
            const utilization = c.demand / 100;
            const dashLen = Math.round(utilization * 12);
            return (
              <g key={c.id}>
                {/* Background line */}
                <line x1={amman.x} y1={amman.y} x2={c.x} y2={c.y}
                  stroke={c.color} strokeWidth={isHov ? 3 : 2}
                  strokeOpacity={isHov ? 0.9 : 0.35}
                  strokeDasharray={`${dashLen} ${14 - dashLen}`} />
                {/* Animated flow */}
                <motion.circle r={3} fill={c.color}
                  animate={{ x: [amman.x, c.x, amman.x], y: [amman.y, c.y, amman.y] }}
                  transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'linear' }}
                  opacity={0.7} />
              </g>
            );
          })}

          {/* Amman center glow */}
          <circle cx={amman.x} cy={amman.y} r={24} fill="url(#ammanGlow)" />
          <motion.circle cx={amman.x} cy={amman.y} r={16}
            fill={C.card2} stroke={C.cyan} strokeWidth={2}
            animate={{ r: [16, 18, 16] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
          <text x={amman.x} y={amman.y + 4} textAnchor="middle" fontSize={9} fill={C.cyan} fontWeight="bold">AMM</text>
          <text x={amman.x} y={amman.y + 35} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.7)" fontWeight="bold">
            {ar ? 'عمّان' : 'Amman'}
          </text>

          {/* Destination nodes */}
          {corridors.map((c) => {
            const isHov = hovered === c.id;
            return (
              <g key={c.id}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                {isHov && <circle cx={c.x} cy={c.y} r={22} fill={c.color} opacity={0.15} />}
                <circle cx={c.x} cy={c.y} r={isHov ? 13 : 10}
                  fill={C.card2} stroke={c.color}
                  strokeWidth={isHov ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }} />
                <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={7} fill={c.color} fontWeight="bold">
                  {c.demand}%
                </text>
                <text x={c.x} y={c.y + 24} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.65)">
                  {c.label}
                </text>
                {isHov && (
                  <g>
                    <rect x={c.x - 34} y={c.y - 42} width={68} height={28} rx={6}
                      fill={C.card2} stroke={c.color} strokeWidth={1} opacity={0.95} />
                    <text x={c.x} y={c.y - 30} textAnchor="middle" fontSize={8} fill="white" fontWeight="bold">
                      {formatCurrency(c.price, 'JOD')}/seat
                    </text>
                    <text x={c.x} y={c.y - 19} textAnchor="middle" fontSize={7} fill={c.color}>
                      {c.demand}% demand
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g>
            <rect x={10} y={440} width={120} height={30} rx={8} fill={C.card2} opacity={0.9} />
            <circle cx={22} cy={455} r={4} fill={C.cyan} />
            <text x={30} y={459} fontSize={8} fill="rgba(255,255,255,0.6)">High demand</text>
            <circle cx={75} cy={455} r={3} fill={C.gold} />
            <text x={82} y={459} fontSize={8} fill="rgba(255,255,255,0.6)">Medium</text>
          </g>
        </svg>

        {/* Corridor stats overlay */}
        {hovered && (() => {
          const c = corridors.find(x => x.id === hovered)!;
          return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 rounded-xl p-3"
              style={{ background: C.card2, border: `1px solid ${c.color}35`, minWidth: 140 }}>
              <div className="font-bold text-white text-sm mb-2">
                {ar ? 'عمّان ←' : 'Amman →'} {c.label}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: C.muted }}>{ar ? 'الطلب' : 'Demand'}</span>
                  <span className="font-bold" style={{ color: c.color }}>{c.demand}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: C.muted }}>{ar ? 'السعر' : 'Price'}</span>
                  <span className="font-bold text-white">{formatCurrency(c.price, 'JOD')}</span>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}

// ── AI Trip Estimator Widget ──────────────────────────────────────────────────
export function AITripEstimator({ ar, onSearch }: { ar: boolean; onSearch: (from: string, to: string) => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState<'ride' | 'package'>('ride');
  const [passengers, setPassengers] = useState(1);
  const [estimated, setEstimated] = useState<{ price: number; seats: number; packages: number; co2: number } | null>(null);
  const [estimating, setEstimating] = useState(false);

  const ROUTE_DB: Record<string, { dist: number; price: number }> = {
    'amman-aqaba': { dist: 330, price: 8 }, 'amman-irbid': { dist: 85, price: 4 },
    'amman-zarqa': { dist: 30, price: 2 }, 'amman-salt': { dist: 35, price: 3 },
    'amman-petra': { dist: 250, price: 12 }, 'amman-dead sea': { dist: 60, price: 5 },
    'amman-wadi rum': { dist: 320, price: 15 }, 'amman-madaba': { dist: 33, price: 3 },
  };

  const estimate = async () => {
    if (!from.trim() || !to.trim()) return;
    setEstimating(true);
    await new Promise(r => setTimeout(r, 900));
    const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
    const route = ROUTE_DB[key] || { dist: 100, price: 5 };
    const seats = Math.floor(Math.random() * 8) + 3;
    const pkgs = Math.floor(Math.random() * 5) + 1;
    const co2 = Math.round(route.dist * 0.09);
    setEstimated({ price: route.price, seats, packages: pkgs, co2 });
    setEstimating(false);
  };

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.cyan}15`, boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${C.cyan}12` }}>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: C.purple }} />
          <span className="font-bold text-white text-sm">{ar ? 'AI مُقدِّر الرحلة' : 'AI Trip Estimator'}</span>
        </div>
        <div className="flex gap-1.5">
          <Tag label="[AI]" color={C.lime} />
          <Tag label="[Corridor]" color={C.cyan} />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {[
            { id: 'ride', label: ar ? '🚗 رحلة' : '🚗 Ride' },
            { id: 'package', label: ar ? '📦 طرد' : '📦 Package' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as any)}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
              style={mode === m.id
                ? { background: `linear-gradient(135deg, ${C.cyan}, ${C.green})`, color: '#040C18' }
                : { background: 'transparent', color: C.muted }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <MapPin className={`absolute top-3 left-3 w-4 h-4`} style={{ color: C.muted }} />
            <input
              value={from}
              onChange={e => setFrom(e.target.value)}
              placeholder={ar ? 'من؟' : 'From'}
              list="estimator-from"
              className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: C.card2, border: `1px solid ${C.cyan}12`, fontSize: '16px' }}
              onFocus={e => e.currentTarget.style.borderColor = `${C.cyan}40`}
              onBlur={e => e.currentTarget.style.borderColor = `${C.cyan}12`}
            />
            <datalist id="estimator-from">
              {['Amman', 'Irbid', 'Zarqa', 'Aqaba'].map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="relative">
            <MapPin className="absolute top-3 left-3 w-4 h-4" style={{ color: C.cyan }} />
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder={ar ? 'إلى؟' : 'To'}
              list="estimator-to"
              className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: C.card2, border: `1px solid ${C.cyan}12`, fontSize: '16px' }}
              onFocus={e => e.currentTarget.style.borderColor = `${C.cyan}40`}
              onBlur={e => e.currentTarget.style.borderColor = `${C.cyan}12`}
            />
            <datalist id="estimator-to">
              {['Aqaba', 'Irbid', 'Zarqa', 'Petra', 'Dead Sea', 'Salt', 'Wadi Rum'].map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        {/* Passengers / Weight */}
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: C.muted }}>
            {mode === 'ride' ? (ar ? 'المسافرون:' : 'Passengers:') : (ar ? 'الوزن (كغ):' : 'Weight (kg):')}
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => setPassengers(n)}
                className="w-9 h-9 rounded-xl font-bold text-sm transition-all"
                style={passengers === n
                  ? { background: `${C.cyan}20`, color: C.cyan, border: `1.5px solid ${C.cyan}40` }
                  : { background: C.card2, color: C.muted, border: `1px solid rgba(255,255,255,0.06)` }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Estimate button */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={estimate}
          disabled={!from.trim() || !to.trim() || estimating}
          className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"
          style={{
            background: from && to ? `linear-gradient(135deg, ${C.cyan}, ${C.green})` : 'rgba(255,255,255,0.05)',
            color: from && to ? '#040C18' : C.muted,
            boxShadow: from && to ? `0 8px 24px ${C.cyan}30` : 'none',
            minHeight: 52,
          }}>
          {estimating
            ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />{ar ? 'AI يحسب...' : 'AI calculating...'}</>
            : <><Brain className="w-4 h-4" />{ar ? 'تقدير ذكي AI' : 'AI Smart Estimate'}</>
          }
        </motion.button>

        {/* Results */}
        {estimated && !estimating && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 space-y-3"
            style={{ background: C.card2, border: `1px solid ${C.cyan}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5" style={{ color: C.lime }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.lime }}>
                {ar ? 'نتيجة AI' : 'AI Result'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: ar ? 'السعر المقدر' : 'Est. Price', val: `${formatCurrency(estimated.price * passengers, 'JOD')}`, color: C.cyan },
                { label: ar ? 'مقاعد متاحة' : 'Avail. Seats', val: `${estimated.seats}`, color: C.green },
                { label: ar ? 'طرود يمكن إضافتها' : 'Package slots', val: `${estimated.packages}`, color: C.gold },
                { label: ar ? 'CO₂ موفَّر' : 'CO₂ saved', val: `${estimated.co2}g`, color: C.lime },
              ].map((r, i) => (
                <div key={i} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${r.color}15` }}>
                  <div className="font-black text-lg" style={{ color: r.color }}>{r.val}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{r.label}</div>
                </div>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onSearch(from, to)}
              className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.green})`, color: '#040C18' }}>
              {ar ? 'عرض الرحلات المتاحة' : 'Show Available Rides'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Smart Pickup Zones ────────────────────────────────────────────────────────
function SmartPickupZones({ ar }: { ar: boolean }) {
  const zones = [
    { name: ar ? 'حي الجاردنز' : 'Gardens Area', riders: 23, color: C.cyan, x: 30, y: 25, r: 28 },
    { name: ar ? 'عبدون' : 'Abdoun', riders: 17, color: C.green, x: 60, y: 45, r: 22 },
    { name: ar ? 'الجبيهة' : 'Jubeiha', riders: 31, color: C.gold, x: 20, y: 60, r: 34 },
    { name: ar ? 'مدينة الملك' : 'King Abdullah II', riders: 14, color: C.purple, x: 72, y: 20, r: 19 },
    { name: ar ? 'الشميساني' : 'Shmeisani', riders: 19, color: '#10B981', x: 45, y: 70, r: 24 },
  ];
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cyan}15` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white">{ar ? 'مناطق التقاط ذكية' : 'Smart Pickup Zones'}</h3>
            <Tag label="[AI]" color={C.lime} />
          </div>
          <p className="text-xs" style={{ color: C.muted }}>
            {ar ? 'AI يُجمّع الركاب القريبين لتحسين الطريق وتقليل التكلفة'
              : 'AI clusters nearby passengers to optimize routes and reduce costs'}
          </p>
        </div>
        <div className="text-right">
          <div className="font-black text-xl" style={{ color: C.lime }}>-23%</div>
          <div className="text-xs" style={{ color: C.muted }}>{ar ? 'وقت انتظار' : 'wait time'}</div>
        </div>
      </div>
      {/* Visual */}
      <div className="relative rounded-xl overflow-hidden mb-4" style={{ height: 180, background: C.card2 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <rect width="100" height="100" fill={C.card2} />
          {/* Grid */}
          {[20, 40, 60, 80].map(v => (
            <g key={v}>
              <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </g>
          ))}
          {/* Zones */}
          {zones.map((z, i) => (
            <g key={i}>
              <circle cx={z.x} cy={z.y} r={z.r} fill={z.color} opacity={0.12} />
              <circle cx={z.x} cy={z.y} r={z.r} fill="none" stroke={z.color} strokeWidth={0.8} strokeOpacity={0.5} strokeDasharray="2 2" />
              <circle cx={z.x} cy={z.y} r={3} fill={z.color} />
              <text x={z.x} y={z.y - 6} textAnchor="middle" fontSize={4} fill={z.color} fontWeight="bold">{z.riders}</text>
            </g>
          ))}
          {/* Connection lines between biggest zones */}
          <line x1="20" y1="60" x2="45" y2="70" stroke={C.cyan} strokeWidth={0.5} strokeOpacity={0.4} />
          <line x1="20" y1="60" x2="30" y2="25" stroke={C.cyan} strokeWidth={0.5} strokeOpacity={0.4} />
        </svg>
        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          {zones.slice(0, 3).map((z, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{z.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: '5', label: ar ? 'مناطق نشطة' : 'Active zones', color: C.cyan },
          { val: '104', label: ar ? 'راكب في المجموعة' : 'Clustered riders', color: C.green },
          { val: '18 JOD', label: ar ? 'توفير يومي' : 'Daily savings', color: C.gold },
        ].map((s, i) => (
          <div key={i} className="text-center rounded-xl py-2 px-1"
            style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid rgba(255,255,255,0.05)` }}>
            <div className="font-black text-base" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs" style={{ color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dynamic Trip Bundling ─────────────────────────────────────────────────────
function DynamicTripBundling({ ar }: { ar: boolean }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: '🚗', label: ar ? 'سائق رايح عمّان → العقبة' : 'Driver: Amman → Aqaba', color: C.cyan },
    { icon: '👤', label: ar ? '+ راكب من الجاردنز' : '+ Passenger from Gardens', color: C.green },
    { icon: '📦', label: ar ? '+ طرد صغير من الجبيهة' : '+ Small package from Jubeiha', color: C.gold },
    { icon: '👥', label: ar ? '+ راكبتان من الشميساني' : '+ 2 women-only from Shmeisani', color: C.pink },
    { icon: '✅', label: ar ? 'رحلة مُجمَّعة: 4 ركاب + طرد = JOD 38 إيراد' : 'Bundled trip: 4 riders + package = JOD 38 revenue', color: C.lime },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.green}15` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white">{ar ? 'تجميع الرحلات الديناميكي' : 'Dynamic Trip Bundling'}</h3>
            <Tag label="[AI]" color={C.lime} />
            <Tag label="[Package]" color={C.gold} />
          </div>
          <p className="text-xs" style={{ color: C.muted }}>
            {ar ? 'AI يدمج ركاب + طرود على نفس المسار لتعظيم الإيراد'
              : 'AI combines riders + packages on same corridor to maximize revenue'}
          </p>
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-2 mb-4">
        {steps.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={step >= i ? { opacity: 1, x: 0 } : { opacity: 0.15, x: -10 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: step >= i ? `${s.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${step >= i ? s.color + '30' : 'rgba(255,255,255,0.04)'}`,
            }}>
            <span className="text-xl shrink-0">{s.icon}</span>
            <span className="text-sm font-medium" style={{ color: step >= i ? '#E2E8F0' : C.muted }}>{s.label}</span>
            {step >= i && i === steps.length - 1 && (
              <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: C.lime }} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setStep(Math.min(step + 1, steps.length - 1))}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}30` }}>
          {step < steps.length - 1 ? (ar ? 'التالي ←' : '→ Next step') : (ar ? 'مكتمل ✓' : '✓ Complete')}
        </motion.button>
        {step > 0 && (
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setStep(0)}
            className="py-2.5 px-4 rounded-xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', color: C.muted }}>
            ↺
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ── Passenger + Package Fusion ────────────────────────────────────────────────
function PassengerPackageFusion({ ar }: { ar: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.gold}15` }}>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-bold text-white">{ar ? 'دمج الركاب + الطرود' : 'Passenger + Package Fusion'}</h3>
        <Tag label="[Package]" color={C.gold} />
        <Tag label="[Corridor]" color={C.cyan} />
      </div>
      <p className="text-xs mb-5" style={{ color: C.muted }}>
        {ar ? 'كل رحلة تُدرّ دخلاً مزدوجاً: ركاب يدفعون + طرود تُرسل = إيراد أعلى بـ 40٪ لكل مسار'
          : 'Every trip earns dual revenue: passengers pay + packages ship = 40% more revenue per corridor'}
      </p>
      <div className="flex items-center gap-4">
        {/* Passenger side */}
        <div className="flex-1 rounded-xl p-4 text-center"
          style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}25` }}>
          <div className="text-3xl mb-2">🚗</div>
          <div className="font-bold text-white text-sm mb-1">{ar ? 'ركاب' : 'Passengers'}</div>
          <div className="font-black text-xl" style={{ color: C.cyan }}>JOD 8</div>
          <div className="text-xs mt-1" style={{ color: C.muted }}>{ar ? 'عمولة 12٪' : '12% commission'}</div>
          <div className="text-xs mt-1 font-bold" style={{ color: C.cyan }}>= JOD 0.96</div>
        </div>
        <div className="text-2xl font-black" style={{ color: C.lime }}>+</div>
        {/* Package side */}
        <div className="flex-1 rounded-xl p-4 text-center"
          style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}25` }}>
          <div className="text-3xl mb-2">📦</div>
          <div className="font-bold text-white text-sm mb-1">{ar ? 'طرد' : 'Package'}</div>
          <div className="font-black text-xl" style={{ color: C.gold }}>JOD 5</div>
          <div className="text-xs mt-1" style={{ color: C.muted }}>{ar ? 'عمولة 20٪' : '20% commission'}</div>
          <div className="text-xs mt-1 font-bold" style={{ color: C.gold }}>= JOD 1.50</div>
        </div>
        <div className="text-2xl font-black" style={{ color: C.lime }}>=</div>
        {/* Total */}
        <div className="flex-1 rounded-xl p-4 text-center"
          style={{ background: `${C.lime}10`, border: `1px solid ${C.lime}25` }}>
          <div className="text-3xl mb-2">💰</div>
          <div className="font-bold text-white text-sm mb-1">{ar ? 'إيراد واصل' : 'Wasel Rev.'}</div>
          <div className="font-black text-xl" style={{ color: C.lime }}>JOD 2.46</div>
          <div className="text-xs mt-1" style={{ color: C.muted }}>{ar ? 'لكل رحلة' : 'per trip'}</div>
          <div className="text-xs mt-1 font-bold" style={{ color: C.lime }}>vs JOD 0.96 rides-only</div>
        </div>
      </div>
    </div>
  );
}

// ── Driver Earnings Estimator ─────────────────────────────────────────────────
function DriverEarningsEstimator({ ar }: { ar: boolean }) {
  const [corridor, setCorridor] = useState(0);
  const corridors = [
    { name: ar ? 'عمّان → العقبة' : 'Amman → Aqaba', seats: 3, price: 8, dist: 330, fuel: 7.5 },
    { name: ar ? 'عمّان → إربد' : 'Amman → Irbid', seats: 4, price: 4, dist: 85, fuel: 2.5 },
    { name: ar ? 'عمّان → الزرقا' : 'Amman → Zarqa', seats: 3, price: 2, dist: 30, fuel: 1.2 },
    { name: ar ? 'عمّان → البتراء' : 'Amman → Petra', seats: 3, price: 12, dist: 250, fuel: 6.0 },
  ];
  const c = corridors[corridor];
  const gross = c.seats * c.price;
  const commission = gross * 0.12;
  const driverNet = gross - commission - c.fuel;

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.green}15` }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-white">{ar ? 'مُقدِّر أرباح السائق' : 'Driver Earnings Estimator'}</h3>
        <Tag label="[AI]" color={C.lime} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {corridors.map((c, i) => (
          <button key={i} onClick={() => setCorridor(i)}
            className="py-2 px-3 rounded-xl text-xs font-bold transition-all text-left"
            style={corridor === i
              ? { background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}35` }
              : { background: C.card2, color: C.muted, border: `1px solid rgba(255,255,255,0.06)` }}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: ar ? 'إجمالي الركاب' : 'Passenger total', val: formatCurrency(gross, 'JOD'), color: C.cyan },
          { label: ar ? 'تكلفة البنزين' : 'Fuel cost', val: `- ${formatCurrency(c.fuel, 'JOD')}`, color: C.gold },
          { label: ar ? 'صافي السائق' : 'Driver earns', val: formatCurrency(Math.max(0, driverNet), 'JOD'), color: C.lime },
        ].map((m, i) => (
          <div key={i} className="text-center rounded-xl py-3 px-2"
            style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}>
            <div className="font-black text-base" style={{ color: m.color }}>{m.val}</div>
            <div className="text-xs mt-1" style={{ color: C.muted }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3" style={{ background: `${C.lime}08`, border: `1px solid ${C.lime}20` }}>
        <p className="text-xs" style={{ color: C.lime }}>
          💡 {ar
            ? `رحلة ${c.name} = تكلفة بنزين تكاد تُغطى بالكامل. السائق يربح ${formatCurrency(Math.max(0, driverNet), 'JOD')} دينار صافي!`
            : `${c.name} trip nearly covers full fuel cost. Driver nets ${formatCurrency(Math.max(0, driverNet), 'JOD')} pure profit!`}
        </p>
      </div>
    </div>
  );
}

// ── Main export: all sections ─────────────────────────────────────────────────
export function InvestorFeatureSections() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';

  return (
    <div style={{ background: C.bg }} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── 1. Corridor Map + AI Estimator ── */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Tag label="[Corridor]" color={C.cyan} />
              <Tag label="[AI]" color={C.lime} />
              <Tag label="[DigitalTwin]" color={C.purple} />
            </div>
            <h2 className="font-black text-3xl md:text-4xl text-white mb-3">
              {ar ? 'ذكاء الممرات الأردنية' : "Jordan's Corridor Intelligence"}
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.muted }}>
              {ar
                ? 'خريطة حية تُظهر الطلب الحقيقي + توقعات AI لكل مسار — التوأم الرقمي لشبكة المواصلات الأردنية'
                : 'Live map showing real demand + AI predictions per corridor — the digital twin of Jordan\'s transport network'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <JordanCorridorMap ar={ar} />
            <AITripEstimator ar={ar} onSearch={(f, t) => navigate(`/app/find-ride?from=${f}&to=${t}`)} />
          </div>
        </div>
      </Section>

      {/* ── 2. Smart Pickup + Dynamic Bundling ── */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Tag label="[AI]" color={C.lime} />
              <Tag label="[Package]" color={C.gold} />
            </div>
            <h2 className="font-black text-3xl text-white mb-3">
              {ar ? 'تحسين ذكي لكل رحلة' : 'AI-Optimized Every Trip'}
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.muted }}>
              {ar
                ? 'من تجميع الركاب إلى دمج الطرود — كل رحلة تُعظَّم بالذكاء الاصطناعي'
                : 'From passenger clustering to package bundling — every trip is AI-maximized'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <SmartPickupZones ar={ar} />
            <DynamicTripBundling ar={ar} />
          </div>
        </div>
      </Section>

      {/* ── 3. Revenue model: Fusion + Earnings ── */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Tag label="[Package]" color={C.gold} />
              <Tag label="[Corridor]" color={C.cyan} />
            </div>
            <h2 className="font-black text-3xl text-white mb-3">
              {ar ? 'نموذج إيراد مزدوج' : 'Dual Revenue Model'}
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.muted }}>
              {ar
                ? 'كل مسار = ركاب + طرود. ضعف الإيراد بنفس الرحلة — لا منافس في المنطقة يفعل هذا'
                : 'Every corridor = passengers + packages. Double revenue from a single trip — no competitor in MENA does this'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <PassengerPackageFusion ar={ar} />
            <DriverEarningsEstimator ar={ar} />
          </div>
        </div>
      </Section>

      {/* ── 4. Ask Wasel AI CTA ── */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <motion.div whileHover={{ scale: 1.01 }}
            className="rounded-3xl p-8 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${C.card} 0%, #0D1540 100%)`, border: `1px solid ${C.purple}25` }}>
            <div className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${C.purple}15 0%, transparent 60%)` }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Tag label="[AI]" color={C.lime} />
                <Tag label="[Corridor]" color={C.cyan} />
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${C.purple}25, ${C.cyan}15)`, border: `1.5px solid ${C.purple}30` }}>
                <Brain className="w-8 h-8" style={{ color: C.purple }} />
              </div>
              <h2 className="font-black text-2xl text-white mb-3">
                {ar ? 'اسأل واصل AI' : 'Ask Wasel AI'}
              </h2>
              <p className="mb-6" style={{ color: C.muted }}>
                {ar
                  ? 'احجز رحلتك بالعربية أو الإنجليزية — AI يفهم، يقترح، ويحجز لك فوراً'
                  : 'Book your trip in Arabic or English — AI understands, suggests, and books instantly'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {(ar ? ['"رايح عالعقبة بكرا الصبح"', '"ابعث طرد لإربد"', '"رحلة نساء فقط"'] : ['"Going to Aqaba tomorrow"', '"Send package to Irbid"', '"Women-only ride"']).map((q, i) => (
                  <span key={i} className="text-sm px-3 py-1.5 rounded-xl"
                    style={{ background: `${C.purple}12`, color: C.purple, border: `1px solid ${C.purple}25` }}>{q}</span>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/ask-wasel')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base"
                style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`, color: '#040C18', boxShadow: `0 8px 32px ${C.purple}40` }}>
                <Brain className="w-5 h-5" />
                {ar ? 'جرّب واصل AI الآن' : 'Try Wasel AI Now'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}

export default InvestorFeatureSections;
