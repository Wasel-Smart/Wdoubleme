/**
 * MENA Liquidity Hub — /features/admin/MenaLiquidityHub.tsx
 * Implements all 7 sections of wasel-mena-liquidity-strategy.md
 *
 * I.   MENA Liquidity Architecture (Corridor Strategy)
 * II.  Micro-Market Seeding Model (Regional Playbook)
 * III. Cross-Country Network Effect
 * IV.  Cultural & Behavioral Optimization
 * V.   Organic Growth Engine (Self-Multiplying)
 * VI.  Smart Liquidity KPIs
 * VII. Expansion Logic (Stepwise Dominance)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Globe, Users, Zap, BarChart3, Map, ArrowRight,
  CheckCircle2, Clock, Star, Shield, Moon, Share2, RefreshCw,
  Target, ChevronDown, ChevronRight, Repeat, Bell, Car,
  Building2, Package, MessageCircle, Wallet, Sparkles,
  AlertTriangle, Activity, Database,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router';

// ─── Corridor Data ────────────────────────────────────────────────────────────

const CORRIDORS = [
  // Phase 1 — Levant
  {
    id: 'amman-aqaba',    phase: 1, status: 'active',
    from: 'Amman',        to: 'Aqaba',      country: 'Jordan',  region: 'Levant',
    fromAr: 'عمّان',       toAr: 'العقبة',   countryAr: 'الأردن',
    dist: 330, density: 87, matchTime: 4.2, recurringRatio: 0.42,
    ridesPerWeek: 68, conversionPct: 14, multiCityRate: 31, activationVelocity: 9.1,
    color: '#04ADBF', icon: '🏖️',
  },
  {
    id: 'amman-irbid',    phase: 1, status: 'active',
    from: 'Amman',        to: 'Irbid',      country: 'Jordan',  region: 'Levant',
    fromAr: 'عمّان',       toAr: 'إربد',    countryAr: 'الأردن',
    dist: 85, density: 92, matchTime: 2.1, recurringRatio: 0.61,
    ridesPerWeek: 143, conversionPct: 18, multiCityRate: 22, activationVelocity: 9.8,
    color: '#09732E', icon: '🎓',
  },
  {
    id: 'dubai-abudhabi', phase: 1, status: 'launching',
    from: 'Dubai',        to: 'Abu Dhabi',  country: 'UAE',     region: 'UAE',
    fromAr: 'دبي',        toAr: 'أبوظبي',  countryAr: 'الإمارات',
    dist: 140, density: 34, matchTime: 18.5, recurringRatio: 0.28,
    ridesPerWeek: 12, conversionPct: 8, multiCityRate: 47, activationVelocity: 4.2,
    color: '#8B5CF6', icon: '🏙️',
  },
  {
    id: 'amman-deadsea',  phase: 1, status: 'active',
    from: 'Amman',        to: 'Dead Sea',   country: 'Jordan',  region: 'Levant',
    fromAr: 'عمّان',       toAr: 'البحر الميت', countryAr: 'الأردن',
    dist: 60, density: 71, matchTime: 6.8, recurringRatio: 0.33,
    ridesPerWeek: 44, conversionPct: 11, multiCityRate: 18, activationVelocity: 7.3,
    color: '#0EA5E9', icon: '🌊',
  },
  {
    id: 'beirut-tripoli', phase: 1, status: 'planned',
    from: 'Beirut',       to: 'Tripoli',    country: 'Lebanon', region: 'Levant',
    fromAr: 'بيروت',      toAr: 'طرابلس',  countryAr: 'لبنان',
    dist: 85, density: 0, matchTime: null, recurringRatio: 0,
    ridesPerWeek: 0, conversionPct: 0, multiCityRate: 0, activationVelocity: 0,
    color: '#D9965B', icon: '🕌',
  },
  // Phase 2 — GCC
  {
    id: 'riyadh-dammam',  phase: 2, status: 'planned',
    from: 'Riyadh',       to: 'Dammam',     country: 'Saudi Arabia', region: 'GCC',
    fromAr: 'الرياض',     toAr: 'الدمام',   countryAr: 'السعودية',
    dist: 400, density: 0, matchTime: null, recurringRatio: 0,
    ridesPerWeek: 0, conversionPct: 0, multiCityRate: 0, activationVelocity: 0,
    color: '#F59E0B', icon: '🛢️',
  },
  {
    id: 'kuwait-city',    phase: 2, status: 'planned',
    from: 'Kuwait City',  to: 'Al-Ahmadi',  country: 'Kuwait',  region: 'GCC',
    fromAr: 'الكويت',     toAr: 'الأحمدي', countryAr: 'الكويت',
    dist: 50, density: 0, matchTime: null, recurringRatio: 0,
    ridesPerWeek: 0, conversionPct: 0, multiCityRate: 0, activationVelocity: 0,
    color: '#EC4899', icon: '⛽',
  },
  // Phase 3 — North Africa
  {
    id: 'cairo-alex',     phase: 3, status: 'future',
    from: 'Cairo',        to: 'Alexandria', country: 'Egypt',   region: 'N.Africa',
    fromAr: 'القاهرة',    toAr: 'الإسكندرية', countryAr: 'مصر',
    dist: 220, density: 0, matchTime: null, recurringRatio: 0,
    ridesPerWeek: 0, conversionPct: 0, multiCityRate: 0, activationVelocity: 0,
    color: '#6366F1', icon: '🏛️',
  },
  {
    id: 'casablanca-rabat', phase: 3, status: 'future',
    from: 'Casablanca',   to: 'Rabat',      country: 'Morocco', region: 'N.Africa',
    fromAr: 'الدار البيضاء', toAr: 'الرباط', countryAr: 'المغرب',
    dist: 90, density: 0, matchTime: null, recurringRatio: 0,
    ridesPerWeek: 0, conversionPct: 0, multiCityRate: 0, activationVelocity: 0,
    color: '#14B8A6', icon: '🌴',
  },
];

const STATUS_META: Record<string, { label: string; labelAr: string; color: string; bg: string; dot: string }> = {
  active:    { label: 'Active',    labelAr: 'نشط',       color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  dot: '#22C55E' },
  launching: { label: 'Launching', labelAr: 'إطلاق',     color: '#04ADBF', bg: 'rgba(4,173,191,0.1)',  dot: '#04ADBF' },
  planned:   { label: 'Planned',   labelAr: 'مخطط',      color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', dot: '#F59E0B' },
  future:    { label: 'Year 3+',   labelAr: 'مستقبلي',   color: '#6366F1', bg: 'rgba(99,102,241,0.1)', dot: '#6366F1' },
};

const CULTURAL_FEATURES = [
  { icon: '🇯🇴',  en: 'Arabic-first UX (Jordanian dialect)', ar: 'واجهة عربية أولاً (اللهجة الأردنية)', done: true },
  { icon: '🕌',   en: 'Prayer time notifications',           ar: 'إشعارات أوقات الصلاة',               done: true },
  { icon: '🌙',   en: 'Ramadan traffic adaptation',          ar: 'تكيّف مع حركة رمضان',                done: true },
  { icon: '💵',   en: 'Cash-flexible payment logic',         ar: 'دفع كاش مرن',                        done: true },
  { icon: '📱',   en: 'WhatsApp-native ride sharing',        ar: 'مشاركة واتساب مدمجة',               done: true },
  { icon: '🧕',   en: 'Hijab-friendly privacy controls',     ar: 'إعدادات خصوصية الحجاب',              done: true },
  { icon: '🚺',   en: 'Gender segregation filters',          ar: 'فلتر الفصل بين الجنسين',            done: true },
  { icon: '⭐',   en: 'Trust-portable across MENA',          ar: 'ثقة قابلة للنقل عبر المنطقة',       done: false },
];

const GROWTH_FUNNEL = [
  { stage: 'New Users',       stageAr: 'مستخدمون جدد',     count: 12840, pct: 100, color: '#04ADBF' },
  { stage: 'First Ride',      stageAr: 'أول رحلة',          count: 9418,  pct: 73,  color: '#09732E' },
  { stage: '3–5 Rides',       stageAr: '3–5 رحلات',         count: 4230,  pct: 33,  color: '#8B5CF6' },
  { stage: 'Income Prompt',   stageAr: 'عرض الأرباح',       count: 2890,  pct: 22,  color: '#D9965B' },
  { stage: '→ Driver',        stageAr: '← مسافر',           count: 742,   pct: 5.8, color: '#F59E0B' },
];

const PHASE_DATA = [
  {
    num: 1, label: 'Levant + UAE',     labelAr: 'الشام + الإمارات',
    timeframe: 'Q1–Q3 2026', progress: 62, corridors: 4,
    color: '#04ADBF', description: 'Corridor dominance in Jordan + UAE launch',
  },
  {
    num: 2, label: 'GCC Intercity',    labelAr: 'المملكة + الخليج',
    timeframe: 'Q4 2026–2027', progress: 5, corridors: 3,
    color: '#8B5CF6', description: 'KSA, Kuwait, Bahrain, Qatar intercity density',
  },
  {
    num: 3, label: 'North Africa',     labelAr: 'شمال أفريقيا',
    timeframe: '2027–2028', progress: 0, corridors: 2,
    color: '#D9965B', description: 'Egypt, Morocco, Tunisia corridor activation',
  },
];

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const w = 60; const h = 24;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * h}
        r="2.5" fill={color} />
    </svg>
  );
}

// ─── Density Gauge ────────────────────────────────────────────────────────────

function DensityGauge({ value, color }: { value: number; color: string }) {
  const radius = 16; const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={radius} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth={3.5} />
      <circle cx={22} cy={22} r={radius} fill="none" stroke={color} strokeWidth={3.5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={22} y={26} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>{value}</text>
    </svg>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ num, title, titleAr, sub, subAr, icon: Icon, color, children, isRTL }:
  { num: string; title: string; titleAr: string; sub: string; subAr: string; icon: any; color: string; children: React.ReactNode; isRTL: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mb-8">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-4 mb-4 group text-left">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black" style={{ color, fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em' }}>
              {num}
            </span>
            <h2 className="font-bold text-white truncate" style={{ fontWeight: 800, fontSize: 'var(--wasel-text-body-lg)' }}>
              {isRTL ? titleAr : title}
            </h2>
          </div>
          <p className="text-left" style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)' }}>
            {isRTL ? subAr : sub}
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'rgba(71,85,105,1)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

// ─── Corridor Card ────────────────────────────────────────────────────────────

function CorridorCard({ c, isRTL }: { c: typeof CORRIDORS[0]; isRTL: boolean }) {
  const s = STATUS_META[c.status];
  const sparkData = c.status === 'active'
    ? [c.density * 0.5, c.density * 0.65, c.density * 0.72, c.density * 0.8, c.density * 0.88, c.density]
    : [0, 0, 0];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="p-4 rounded-2xl relative overflow-hidden"
      style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${c.color}20` }}>
      {/* Top color line */}
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: c.color, opacity: 0.6 }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>{c.icon}</span>
            <span className="font-bold text-white" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-sm)' }}>
              {isRTL ? `${c.fromAr} ↔ ${c.toAr}` : `${c.from} ↔ ${c.to}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.65rem' }}>
              {isRTL ? c.countryAr : c.country} · {c.dist} km
            </span>
            <span className="pill text-[9px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
              {c.status === 'active' && (
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse"
                  style={{ background: s.dot }} />
              )}
              {isRTL ? s.labelAr : s.label}
            </span>
          </div>
        </div>
        <DensityGauge value={c.density} color={c.color} />
      </div>

      {/* KPIs */}
      {c.status === 'active' && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: isRTL ? 'رحلات/أسبوع' : 'Rides/wk',    val: c.ridesPerWeek.toString(), color: c.color },
            { label: isRTL ? 'وقت التطابق' : 'Match Time',   val: `${c.matchTime}h`,          color: '#F59E0B' },
            { label: isRTL ? 'متكرر %' : 'Recurring',        val: `${(c.recurringRatio * 100).toFixed(0)}%`, color: '#22C55E' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center py-2 rounded-xl"
              style={{ background: 'rgba(15,23,42,0.5)' }}>
              <p className="font-bold" style={{ fontWeight: 700, fontSize: '0.9rem', color }}>{val}</p>
              <p style={{ color: 'rgba(71,85,105,1)', fontSize: '0.58rem', marginTop: 1 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sparkline */}
      {c.status === 'active' && (
        <div className="flex items-center justify-between">
          <Sparkline data={sparkData} color={c.color} />
          <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.6rem' }}>
            {isRTL ? '30 يوم' : '30d trend'}
          </span>
        </div>
      )}

      {c.status !== 'active' && (
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3" style={{ color: s.color }} />
          <span style={{ color: s.color, fontSize: '0.65rem', fontWeight: 600 }}>
            {c.status === 'launching' ? (isRTL ? 'يبدأ قريباً — الفصل الثاني 2026' : 'Starting soon — Q2 2026')
             : c.status === 'planned'  ? (isRTL ? 'مخطط — الفصل الرابع 2026' : 'Planned — Q4 2026')
             : (isRTL ? 'السنة الثالثة+' : 'Year 3+')}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MenaLiquidityHub() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const activeCorridors  = CORRIDORS.filter(c => c.status === 'active');
  const totalWeeklyRides = activeCorridors.reduce((s, c) => s + c.ridesPerWeek, 0);
  const avgDensity       = Math.round(activeCorridors.reduce((s, c) => s + c.density, 0) / (activeCorridors.length || 1));
  const avgMatchTime     = (activeCorridors.reduce((s, c) => s + (c.matchTime || 0), 0) / activeCorridors.length).toFixed(1);
  const driverConvRate   = (GROWTH_FUNNEL[4].count / GROWTH_FUNNEL[0].count * 100).toFixed(1);

  const regions = ['all', ...Array.from(new Set(CORRIDORS.map(c => c.region)))];
  const filteredCorridors = CORRIDORS.filter(c =>
    (selectedPhase === 'all' || c.phase === selectedPhase) &&
    (selectedRegion === 'all' || c.region === selectedRegion)
  );

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--wasel-surface-0)' }}
      dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          {/* Ambient glow */}
          <div className="absolute pointer-events-none" style={{
            background: 'radial-gradient(ellipse 600px 300px at 50% 0%, rgba(4,173,191,0.06), transparent)',
            inset: 0, zIndex: 0,
          }} />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(9,115,46,0.3), rgba(4,173,191,0.25))',
                border: '1px solid rgba(4,173,191,0.25)',
                boxShadow: 'var(--wasel-shadow-teal)',
              }}>
              <Globe className="w-6 h-6" style={{ color: '#04ADBF' }} />
            </div>
            <div>
              <p style={{ color: '#04ADBF', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em' }}>
                MENA STRATEGY
              </p>
              <h1 className="type-h1 text-gradient-primary" style={{ fontWeight: 900, lineHeight: 1.1 }}>
                {isRTL ? 'محرك السيولة في الشرق الأوسط' : 'MENA Liquidity Engine'}
              </h1>
            </div>
          </div>

          <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-body)', maxWidth: '44rem', lineHeight: 1.65 }}>
            {isRTL
              ? 'توسع قائم على الممرات، لا المدن. واصل تصبح الشبكة المهيمنة على التنقل المشترك في الشرق الأوسط عبر سيولة ذاتية التوليد.'
              : 'Corridor-first, not city-first. Transform Wasel into the Middle East\'s corridor-dominant shared mobility network through self-generating liquidity.'}
          </p>

          {/* Top-level KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: isRTL ? 'رحلات/أسبوع' : 'Weekly Rides',      val: totalWeeklyRides,      suffix: '',   color: '#04ADBF', icon: Car },
              { label: isRTL ? 'متوسط الكثافة' : 'Avg Density',       val: avgDensity,             suffix: '/100', color: '#09732E', icon: Activity },
              { label: isRTL ? 'وقت التطابق' : 'Avg Match Time',     val: avgMatchTime,           suffix: 'h',  color: '#8B5CF6', icon: Clock },
              { label: isRTL ? 'تحويل مسافر %' : 'Driver Conversion', val: `${driverConvRate}%`,  suffix: '',   color: '#D9965B', icon: TrendingUp },
            ].map(({ label, val, suffix, color, icon: Icon }) => (
              <motion.div key={label} whileHover={{ y: -3 }} className="p-4 rounded-2xl"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${color}20` }}>
                <Icon className="w-4 h-4 mb-2" style={{ color }} />
                <p className="font-black" style={{ fontWeight: 900, fontSize: '1.4rem', color, lineHeight: 1 }}>
                  {val}{suffix}
                </p>
                <p style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', marginTop: 3 }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="mb-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(4,173,191,0.2), transparent)' }} />

        {/* ════════════════════════════════════════════════════════════ */}
        {/* I. MENA LIQUIDITY ARCHITECTURE                              */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="I" title="MENA Liquidity Architecture" titleAr="هيكل السيولة في الشرق الأوسط"
          sub="Corridor-first expansion — density before geography"
          subAr="التوسع بالممرات أولاً — الكثافة قبل الجغرافيا"
          icon={Map} color="#04ADBF" isRTL={isRTL}>

          {/* Philosophy callout */}
          <div className="mb-5 p-4 rounded-2xl flex gap-3 items-start"
            style={{ background: 'rgba(4,173,191,0.05)', border: '1px solid rgba(4,173,191,0.15)' }}>
            <Zap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#04ADBF' }} />
            <div className="space-y-1">
              {[
                isRTL ? '❌ مش "إطلاق في الرياض" — بدل: ممر الرياض ↔ الدمام' : '❌ Not "launch in Riyadh" — Instead: Riyadh ↔ Dammam corridor density',
                isRTL ? '❌ مش "مدينة دبي" — بدل: حزام التنقل دبي ↔ أبوظبي' : '❌ Not "Dubai city" — Instead: Dubai ↔ Abu Dhabi commute belt',
                isRTL ? '✅ السيولة تنتشر من الممرات للخارج، مش من الخرائط' : '✅ Liquidity spreads outward from corridors, not from maps',
              ].map((t, i) => (
                <p key={i} style={{ color: i === 2 ? '#04ADBF' : 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: i === 2 ? 700 : 400 }}>{t}</p>
              ))}
            </div>
          </div>

          {/* Corridor filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: 600 }}>
              {isRTL ? 'المرحلة:' : 'Phase:'}
            </span>
            {(['all', 1, 2, 3] as const).map(p => (
              <motion.button key={p} whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedPhase(p)}
                className="pill transition-all"
                style={selectedPhase === p
                  ? { background: 'rgba(4,173,191,0.18)', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.4)', fontWeight: 700 }
                  : { background: 'rgba(30,41,59,0.5)', color: 'rgba(71,85,105,1)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {p === 'all' ? (isRTL ? 'الكل' : 'All') : `${isRTL ? 'المرحلة' : 'Phase'} ${p}`}
              </motion.button>
            ))}
            <span style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: 600, marginLeft: 8 }}>
              {isRTL ? 'المنطقة:' : 'Region:'}
            </span>
            {regions.map(r => (
              <motion.button key={r} whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedRegion(r)}
                className="pill transition-all capitalize"
                style={selectedRegion === r
                  ? { background: 'rgba(9,115,46,0.18)', color: '#22C55E', border: '1px solid rgba(9,115,46,0.35)', fontWeight: 700 }
                  : { background: 'rgba(30,41,59,0.5)', color: 'rgba(71,85,105,1)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {r === 'all' ? (isRTL ? 'الكل' : 'All') : r}
              </motion.button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCorridors.map(c => <CorridorCard key={c.id} c={c} isRTL={isRTL} />)}
          </div>
        </Section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* II. MICRO-MARKET SEEDING                                    */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="II" title="Micro-Market Seeding Model" titleAr="نموذج البذر في الأسواق الصغيرة"
          sub="2–3 high-frequency routes per country · Saturate before expanding"
          subAr="2–3 طرق عالية التردد لكل دولة · اشبع قبل أن تتوسع"
          icon={Target} color="#09732E" isRTL={isRTL}>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                country: 'Jordan 🇯🇴', countryAr: 'الأردن 🇯🇴',
                routes: ['Amman ↔ Aqaba', 'Amman ↔ Irbid', 'Amman ↔ Dead Sea'],
                routesAr: ['عمّان ↔ العقبة', 'عمّان ↔ إربد', 'عمّان ↔ البحر الميت'],
                saturation: 82, phase: 1, color: '#04ADBF', status: 'active',
                tip: 'Routes feel "always alive". Ready to add Petra corridor.',
                tipAr: 'الطرق تبدو "نشطة دائماً". جاهز لإضافة ممر البتراء.',
              },
              {
                country: 'UAE 🇦🇪', countryAr: 'الإمارات 🇦🇪',
                routes: ['Dubai ↔ Abu Dhabi'],
                routesAr: ['دبي ↔ أبوظبي'],
                saturation: 22, phase: 1, color: '#8B5CF6', status: 'launching',
                tip: 'Focus supply incentives on morning commute 7–9AM.',
                tipAr: 'ركّز الحوافز على ساعة الذروة الصباحية 7–9 ص.',
              },
              {
                country: 'Saudi Arabia 🇸🇦', countryAr: 'السعودية 🇸🇦',
                routes: ['Riyadh ↔ Dammam', 'Riyadh ↔ Jeddah'],
                routesAr: ['الرياض ↔ الدمام', 'الرياض ↔ جدة'],
                saturation: 0, phase: 2, color: '#F59E0B', status: 'planned',
                tip: 'Target business corridor first (500+ km Riyadh–Dammam).',
                tipAr: 'استهدف الممر التجاري أولاً (500+ كم الرياض–الدمام).',
              },
              {
                country: 'Egypt 🇪🇬', countryAr: 'مصر 🇪🇬',
                routes: ['Cairo ↔ Alexandria'],
                routesAr: ['القاهرة ↔ الإسكندرية'],
                saturation: 0, phase: 3, color: '#6366F1', status: 'future',
                tip: "World's highest-density intercity corridor. Phase 3 anchor.",
                tipAr: 'أعلى كثافة ممر حضاري عالمياً. محور المرحلة 3.',
              },
            ].map(c => (
              <div key={c.country} className="p-4 rounded-2xl"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${c.color}18` }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-white" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-sm)' }}>
                      {isRTL ? c.countryAr : c.country}
                    </p>
                    <span className="pill text-[9px] mt-1 inline-block"
                      style={{ background: STATUS_META[c.status].bg, color: STATUS_META[c.status].color, border: `1px solid ${STATUS_META[c.status].color}30` }}>
                      {isRTL ? STATUS_META[c.status].labelAr : STATUS_META[c.status].label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-black" style={{ fontWeight: 900, fontSize: '1.3rem', color: c.color }}>{c.saturation}%</p>
                    <p style={{ color: 'rgba(71,85,105,1)', fontSize: '0.6rem' }}>{isRTL ? 'تشبع' : 'saturation'}</p>
                  </div>
                </div>

                {/* Saturation bar */}
                <div className="step-progress-track mb-3">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.saturation}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="step-progress-fill" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}50` }} />
                </div>

                {/* Routes */}
                <div className="space-y-1.5 mb-3">
                  {(isRTL ? c.routesAr : c.routes).map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                      <span style={{ color: 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-caption)' }}>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Playbook tip */}
                <div className="p-2.5 rounded-xl" style={{ background: `${c.color}08`, border: `1px solid ${c.color}18` }}>
                  <p style={{ color: c.color, fontSize: '0.65rem', fontWeight: 600 }}>
                    💡 {isRTL ? c.tipAr : c.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* III. CROSS-COUNTRY NETWORK EFFECT                           */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="III" title="Cross-Country Network Effect" titleAr="تأثير الشبكة عبر الدول"
          sub="One identity across MENA · Portable ratings · Verified badge transferable"
          subAr="هوية واحدة عبر المنطقة · تقييمات قابلة للنقل · شارة التحقق تنتقل"
          icon={Globe} color="#8B5CF6" isRTL={isRTL}>

          <div className="grid md:grid-cols-3 gap-4 mb-5">
            {[
              {
                icon: Star, label: 'Portable Ratings', labelAr: 'تقييمات قابلة للنقل',
                desc: 'A driver rated 4.9★ in Amman keeps that reputation in Dubai and Riyadh.',
                descAr: 'مسافر بتقييم 4.9★ في عمّان يحتفظ بسمعته في دبي والرياض.',
                status: 'In Roadmap', statusAr: 'في خارطة الطريق', color: '#8B5CF6',
              },
              {
                icon: Shield, label: 'Verified Badge Transfer', labelAr: 'نقل شارة التحقق',
                desc: 'KYC completed in Kuwait → automatically valid in Bahrain, UAE, Qatar.',
                descAr: 'التحقق المكتمل في الكويت → صالح تلقائياً في البحرين والإمارات وقطر.',
                status: 'In Roadmap', statusAr: 'في خارطة الطريق', color: '#04ADBF',
              },
              {
                icon: Users, label: 'One MENA Profile', labelAr: 'ملف واحد لكل المنطقة',
                desc: 'Same account, same trust score, same history — across all 7+ MENA markets.',
                descAr: 'نفس الحساب، نفس درجة الثقة، نفس التاريخ — في كل أسواق المنطقة.',
                status: 'Active', statusAr: 'نشط', color: '#22C55E',
              },
            ].map(f => (
              <div key={f.label} className="p-4 rounded-2xl"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${f.color}20` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <span className="pill text-[9px]"
                    style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}25` }}>
                    {isRTL ? f.statusAr : f.status}
                  </span>
                </div>
                <p className="font-bold text-white mb-1.5" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-sm)' }}>
                  {isRTL ? f.labelAr : f.label}
                </p>
                <p style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', lineHeight: 1.55 }}>
                  {isRTL ? f.descAr : f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Brand gravity quote */}
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(139,92,246,0.05)', border: '1px dashed rgba(139,92,246,0.2)' }}>
            <p className="font-bold" style={{ color: '#8B5CF6', fontSize: 'var(--wasel-text-body)', fontWeight: 700 }}>
              {isRTL
                ? '"مسافر موثوق في الكويت يجب أن يُشعر بالثقة في البحرين."'
                : '"A driver trusted in Kuwait should feel trusted in Bahrain."'}
            </p>
            <p style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', marginTop: 4 }}>
              {isRTL ? 'هذا يبني جاذبية العلامة التجارية الإقليمية.' : 'This builds regional brand gravity.'}
            </p>
          </div>
        </Section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* IV. CULTURAL & BEHAVIORAL OPTIMIZATION                      */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="IV" title="Cultural & Behavioral Optimization" titleAr="التحسين الثقافي والسلوكي"
          sub="Region-born, not imported · Arabic-first · Prayer · Ramadan · Cash"
          subAr="ولد في المنطقة، مش مستورد · عربي أولاً · صلاة · رمضان · كاش"
          icon={Moon} color="#D9965B" isRTL={isRTL}>

          <div className="grid md:grid-cols-2 gap-3">
            {CULTURAL_FEATURES.map(f => (
              <div key={f.en} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${f.done ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)'}` }}>
                <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                <span className="flex-1" style={{ color: f.done ? 'rgba(148,163,184,1)' : 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: f.done ? 500 : 400 }}>
                  {isRTL ? f.ar : f.en}
                </span>
                {f.done
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />
                  : <Clock className="w-4 h-4 shrink-0" style={{ color: '#F59E0B' }} />}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-2xl"
            style={{ background: 'rgba(217,150,91,0.06)', border: '1px solid rgba(217,150,91,0.2)' }}>
            <p className="font-bold" style={{ color: '#D9965B', fontSize: 'var(--wasel-text-sm)', fontWeight: 700 }}>
              🎯 {isRTL ? 'هذا يجب أن يُشعر أنه ولد في المنطقة، مش مستورد.' : 'This must feel region-born, not imported.'}
            </p>
          </div>
        </Section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* V. ORGANIC GROWTH ENGINE                                    */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="V" title="Organic Growth Engine" titleAr="محرك النمو العضوي"
          sub="Self-multiplying · Rider → Driver → Habit → Network Power"
          subAr="ذاتي التضاعف · راكب ← مسافر ← عادة ← قوة شبكة"
          icon={Zap} color="#F59E0B" isRTL={isRTL}>

          {/* Conversion funnel */}
          <div className="mb-5 p-4 rounded-2xl"
            style={{ background: 'var(--wasel-surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-bold text-white mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)' }}>
              {isRTL ? '1. محرك تحويل الراكب → مسافر' : '1. Rider → Driver Conversion Engine'}
            </p>
            <div className="space-y-2.5">
              {GROWTH_FUNNEL.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-caption)' }}>
                      {isRTL ? stage.stageAr : stage.stage}
                    </span>
                    <div className="flex items-center gap-3">
                      <span style={{ color: stage.color, fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>
                        {stage.count.toLocaleString()}
                      </span>
                      <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.6rem', width: '2.5rem', textAlign: 'right' }}>
                        {stage.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="step-progress-track">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${stage.pct}%` }}
                      viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                      style={{ height: '100%', borderRadius: 9999, background: stage.color, boxShadow: `0 0 6px ${stage.color}40` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <p style={{ color: '#F59E0B', fontSize: 'var(--wasel-text-caption)', fontWeight: 600 }}>
                🎯 {isRTL
                  ? 'بعد 3–5 رحلات → اعرض محاكاة الدخل "كسب X د.أ شهرياً بالسفر معنا"'
                  : 'After 3–5 rides → Show income simulation "Earn X JOD/month by traveling with us"'}
              </p>
            </div>
          </div>

          {/* 4 growth mechanisms */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                num: '2', icon: TrendingUp, color: '#09732E',
                en: 'Route Activation Rewards',      ar: 'مكافآت تفعيل الطرق',
                desc: 'Reward users when their route reaches density threshold — they become invested in platform success.',
                descAr: 'كافئ المستخدمين لما طريقهم يوصل لعتبة الكثافة — يصيروا مستثمرين في نجاح المنصة.',
              },
              {
                num: '3', icon: Users, color: '#8B5CF6',
                en: 'Group Commute Nudging',          ar: 'تحفيز الرحلات الجماعية',
                desc: '"4 professionals commute this route daily. Join them and split costs." — social proof drives conversion.',
                descAr: '"4 مهنيين يتنقلون على هذا الطريق يومياً. انضم إليهم وقسّم التكلفة." — الدليل الاجتماعي يحفز التحويل.',
              },
              {
                num: '4', icon: RefreshCw, color: '#04ADBF',
                en: 'Recurring Ride Automation',      ar: 'أتمتة الرحلات المتكررة',
                desc: 'Auto-publish weekly commute after 3 confirmed trips on same route. Habit = liquidity.',
                descAr: 'نشر تلقائي للرحلة الأسبوعية بعد 3 رحلات مؤكدة على نفس الطريق. العادة = السيولة.',
              },
              {
                num: '1', icon: Share2, color: '#D9965B',
                en: 'WhatsApp-Native Sharing',        ar: 'مشاركة واتساب أصيلة',
                desc: 'One tap to share ride to WhatsApp groups. Viral acquisition — no ad spend needed.',
                descAr: 'ضغطة واحدة لمشاركة الرحلة في مجموعات واتساب. اكتساب فيروسي — بدون إنفاق على الإعلانات.',
              },
            ].map(m => (
              <div key={m.num} className="flex gap-3 p-4 rounded-2xl"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${m.color}15` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${m.color}15`, border: `1px solid ${m.color}25` }}>
                  <m.icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <div>
                  <p className="font-bold text-white mb-1" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-sm)' }}>
                    {m.num}. {isRTL ? m.ar : m.en}
                  </p>
                  <p style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', lineHeight: 1.55 }}>
                    {isRTL ? m.descAr : m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-2xl text-center"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="font-black" style={{ color: '#F59E0B', fontWeight: 900, fontSize: 'var(--wasel-text-body)' }}>
              {isRTL
                ? 'العادة = سيولة · السيولة = نمو · النمو = هيمنة إقليمية'
                : 'Habit = Liquidity · Liquidity = Growth · Growth = Regional Dominance'}
            </p>
          </div>
        </Section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* VI. SMART LIQUIDITY KPIs                                   */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="VI" title="Smart Liquidity KPIs" titleAr="مؤشرات السيولة الذكية"
          sub="Per-corridor health · Density not downloads"
          subAr="صحة كل ممر · الكثافة مش التنزيلات"
          icon={BarChart3} color="#22C55E" isRTL={isRTL}>

          {/* KPI definitions */}
          <div className="grid md:grid-cols-3 gap-3 mb-5">
            {[
              { kpi: 'Route Density Score',          kpiAr: 'درجة كثافة الطريق',         def: 'Rides / 100 possible riders on corridor per week', defAr: 'رحلات / 100 راكب ممكن لكل أسبوع', color: '#04ADBF' },
              { kpi: 'Average Match Time',            kpiAr: 'متوسط وقت التطابق',         def: 'Hours between search and successful booking',     defAr: 'ساعات بين البحث والحجز الناجح',   color: '#F59E0B' },
              { kpi: 'Recurring Ride Ratio',          kpiAr: 'نسبة الرحلات المتكررة',    def: '% of trips that recur weekly or biweekly',        defAr: '% من الرحلات التي تتكرر أسبوعياً', color: '#22C55E' },
              { kpi: 'Rider → Driver Conversion %',  kpiAr: '% تحويل راكب → مسافر',     def: 'Passengers who become active travelers / month',   defAr: 'ركاب يصيرون مسافرين نشطين / شهر', color: '#D9965B' },
              { kpi: 'Corridor Activation Velocity', kpiAr: 'سرعة تفعيل الممر',         def: 'Days from launch to 10+ weekly rides',             defAr: 'أيام من الإطلاق لـ10+ رحلات أسبوعياً', color: '#8B5CF6' },
              { kpi: 'Multi-City User Rate',          kpiAr: 'معدل المستخدمين متعددي المدن', def: '% of active users who ride 2+ different corridors', defAr: '% من المستخدمين الذين يركبون 2+ ممرات', color: '#EC4899' },
            ].map(k => (
              <div key={k.kpi} className="p-3 rounded-xl"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${k.color}18` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: k.color }} />
                  <span className="font-bold text-white" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>
                    {isRTL ? k.kpiAr : k.kpi}
                  </span>
                </div>
                <p style={{ color: 'rgba(71,85,105,1)', fontSize: '0.62rem', lineHeight: 1.5 }}>
                  {isRTL ? k.defAr : k.def}
                </p>
              </div>
            ))}
          </div>

          {/* Live KPI table for active corridors */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="p-3 flex items-center gap-2"
              style={{ background: 'rgba(15,23,42,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Activity className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              <span style={{ color: 'rgba(148,163,184,1)', fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>
                {isRTL ? 'ممرات نشطة — مقاييس حية' : 'Active Corridors — Live Metrics'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22C55E', marginLeft: 'auto' }} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[
                      isRTL ? 'الممر' : 'Corridor',
                      isRTL ? 'الكثافة' : 'Density',
                      isRTL ? 'وقت التطابق' : 'Match Time',
                      isRTL ? 'متكرر %' : 'Recurring',
                      isRTL ? 'تحويل %' : 'Conversion',
                      isRTL ? 'متعدد مدن %' : 'Multi-City',
                    ].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left"
                        style={{ color: 'rgba(71,85,105,1)', fontWeight: 600, fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeCorridors.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < activeCorridors.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{c.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: 'var(--wasel-text-caption)', color: c.color }}>
                            {isRTL ? `${c.fromAr} ↔ ${c.toAr}` : `${c.from} ↔ ${c.to}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 step-progress-track">
                            <div style={{ width: `${c.density}%`, height: '100%', borderRadius: 9999, background: c.color }} />
                          </div>
                          <span style={{ color: c.color, fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>{c.density}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3" style={{ color: '#F59E0B', fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>{c.matchTime}h</td>
                      <td className="px-3 py-3" style={{ color: '#22C55E', fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>{(c.recurringRatio * 100).toFixed(0)}%</td>
                      <td className="px-3 py-3" style={{ color: '#D9965B', fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>{c.conversionPct}%</td>
                      <td className="px-3 py-3" style={{ color: '#8B5CF6', fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>{c.multiCityRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-center" style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)', fontStyle: 'italic' }}>
            {isRTL
              ? '"صحة السيولة تُقاس بالكثافة، مش بالتنزيلات."'
              : '"Liquidity health must be measured by density, not downloads."'}
          </p>
        </Section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* VII. EXPANSION LOGIC                                        */}
        {/* ════════════════════════════════════════════════════════════ */}

        <Section num="VII" title="Expansion Logic" titleAr="منطق التوسع"
          sub="Stepwise dominance · Proven density replication · Never by geography"
          subAr="هيمنة تدريجية · تكرار الكثافة المثبتة · أبداً بالجغرافيا"
          icon={TrendingUp} color="#D9965B" isRTL={isRTL}>

          <div className="space-y-4 mb-5">
            {PHASE_DATA.map((ph, idx) => (
              <motion.div key={ph.num} initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.35 }}
                className="p-5 rounded-2xl relative overflow-hidden"
                style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${ph.color}22` }}>

                {/* Phase number watermark */}
                <div className="absolute right-4 top-4 font-black opacity-5"
                  style={{ fontSize: '5rem', color: ph.color, lineHeight: 1 }}>
                  {ph.num}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black" style={{ color: ph.color, fontSize: '0.75rem', fontWeight: 900 }}>
                        {isRTL ? `المرحلة ${ph.num}` : `Phase ${ph.num}`}
                      </span>
                      <span className="pill text-[9px]"
                        style={{ background: `${ph.color}12`, color: ph.color, border: `1px solid ${ph.color}25` }}>
                        {ph.timeframe}
                      </span>
                    </div>
                    <h3 className="font-bold text-white" style={{ fontWeight: 800, fontSize: 'var(--wasel-text-body-lg)' }}>
                      {isRTL ? ph.labelAr : ph.label}
                    </h3>
                    <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)', marginTop: 2 }}>
                      {ph.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black" style={{ fontWeight: 900, fontSize: '1.6rem', color: ph.color, lineHeight: 1 }}>
                      {ph.progress}%
                    </p>
                    <p style={{ color: 'rgba(71,85,105,1)', fontSize: '0.6rem' }}>
                      {isRTL ? 'مكتمل' : 'complete'}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="step-progress-track">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${ph.progress}%` }}
                    viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + idx * 0.15, ease: [0.4, 0, 0.2, 1] }}
                    style={{ height: '100%', borderRadius: 9999, background: ph.color, boxShadow: `0 0 8px ${ph.color}50` }} />
                </div>

                {/* Corridors */}
                <div className="flex items-center gap-2 mt-3">
                  <Database className="w-3 h-3" style={{ color: ph.color }} />
                  <span style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)' }}>
                    {ph.corridors} {isRTL ? 'ممرات مستهدفة' : 'target corridors'}
                  </span>
                  {idx < PHASE_DATA.length - 1 && (
                    <>
                      <ChevronRight className="w-3 h-3" style={{ color: 'rgba(51,65,85,1)' }} />
                      <span style={{ color: 'rgba(51,65,85,1)', fontSize: 'var(--wasel-text-caption)' }}>
                        {isRTL ? 'ثم' : 'then'} Phase {ph.num + 1}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final strategic statement */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.08), rgba(4,173,191,0.06))', border: '1px solid rgba(4,173,191,0.2)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(4,173,191,0.06), transparent)' }} />
            <Sparkles className="w-6 h-6 mx-auto mb-3" style={{ color: '#04ADBF' }} />
            <p className="font-black text-white mb-2"
              style={{ fontWeight: 900, fontSize: 'var(--wasel-text-h3)', lineHeight: 1.2 }}>
              {isRTL
                ? 'التوسع بالكثافة المثبتة، ليس بالجغرافيا.'
                : 'Expand by proven density replication, never by geography.'}
            </p>
            <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-sm)' }}>
              {isRTL
                ? 'واصل تتحول إلى الشبكة المهيمنة على التنقل المشترك في الشرق الأوسط.'
                : 'Transform Wasel into the Middle East\'s corridor-dominant shared mobility network.'}
            </p>

            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              {[
                { label: isRTL ? 'توليد عرض' : 'Generate supply',  icon: Car     },
                { label: isRTL ? 'توليد طلب'  : 'Generate demand',  icon: Users   },
                { label: isRTL ? 'زيادة الكثافة' : 'Increase density', icon: TrendingUp },
                { label: isRTL ? 'حوّل إلى عادة' : 'Convert to habits', icon: RefreshCw },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: '#04ADBF' }} />
                  <span style={{ color: 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </Section>

      </div>
    </div>
  );
}
