/**
 * RouteExpansionStrategy — Wasel | واصل
 *
 * TASK 3: Route & Expansion Strategy
 * ────────────────────────────────────
 * Domestic-first route strategy with scalable expansion.
 * Flags high-risk cross-border routes for later-stage rollout.
 *
 * TASK 5 (embedded): Operational improvements:
 *  • Friction-free ride/package CTAs from route cards
 *  • Clear booking steps shown per route
 *  • One-tap from route discovery to booking
 *
 * ✅ Bilingual | ✅ RTL | ✅ Token-compliant
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Clock, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle2, Lock, ChevronRight, Car, Package,
  Users, Zap, Globe, ArrowRight, Flag, Calendar,
  Shield, Star, Info,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 1 | 2 | 3;
type RouteRisk = 'low' | 'medium' | 'high';

interface Route {
  id: string;
  from: string;     fromAr: string;
  to: string;       toAr: string;
  distanceKm: number;
  durationH: string;
  priceJOD: number;
  countries: string[];
  countriesAr: string[];
  flags: string[];
  tier: Tier;
  risk: RouteRisk;
  riskReason?: string;  riskReasonAr?: string;
  weeklyTrips: number;
  demandScore: number;  // 0–100
  revenueWeeklyJOD: number;
  launchQuarter: string;
  launchQuarterAr: string;
  useCase: string; useCaseAr: string;
  icon: string;
  available: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROUTES: Route[] = [
  // ── Tier 1: Launch Now ──────────────────────────────────────────────────────
  {
    id: 'JO_AMM_AQB', from: 'Amman', fromAr: 'عمّان', to: 'Aqaba', toAr: 'العقبة',
    distanceKm: 330, durationH: '4h', priceJOD: 10,
    countries: ['Jordan'], countriesAr: ['الأردن'], flags: ['🇯🇴'],
    tier: 1, risk: 'low', weeklyTrips: 38, demandScore: 94, revenueWeeklyJOD: 1368,
    launchQuarter: 'Q2 2026', launchQuarterAr: 'الربع 2 2026',
    useCase: 'Beach weekends, port visits, resort tourism',
    useCaseAr: 'عطلات نهاية الأسبوع على الشاطئ، السياحة',
    icon: '🏖️', available: true,
  },
  {
    id: 'JO_AMM_IRB', from: 'Amman', fromAr: 'عمّان', to: 'Irbid', toAr: 'إربد',
    distanceKm: 85, durationH: '1.5h', priceJOD: 5,
    countries: ['Jordan'], countriesAr: ['الأردن'], flags: ['🇯🇴'],
    tier: 1, risk: 'low', weeklyTrips: 70, demandScore: 88, revenueWeeklyJOD: 1176,
    launchQuarter: 'Q2 2026', launchQuarterAr: 'الربع 2 2026',
    useCase: 'University students (Yarmouk), daily commuters',
    useCaseAr: 'طلاب الجامعة (اليرموك)، المسافرون اليوميون',
    icon: '🎓', available: true,
  },
  {
    id: 'JO_AMM_DSA', from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت',
    distanceKm: 60, durationH: '1h', priceJOD: 6,
    countries: ['Jordan'], countriesAr: ['الأردن'], flags: ['🇯🇴'],
    tier: 1, risk: 'low', weeklyTrips: 28, demandScore: 72, revenueWeeklyJOD: 483,
    launchQuarter: 'Q2 2026', launchQuarterAr: 'الربع 2 2026',
    useCase: 'Spa resorts, tourist day trips',
    useCaseAr: 'منتجعات السبا، الرحلات السياحية',
    icon: '🌊', available: true,
  },
  {
    id: 'JO_AMM_ZRQ', from: 'Amman', fromAr: 'عمّان', to: 'Zarqa', toAr: 'الزرقا',
    distanceKm: 30, durationH: '30m', priceJOD: 3,
    countries: ['Jordan'], countriesAr: ['الأردن'], flags: ['🇯🇴'],
    tier: 1, risk: 'low', weeklyTrips: 90, demandScore: 79, revenueWeeklyJOD: 810,
    launchQuarter: 'Q2 2026', launchQuarterAr: 'الربع 2 2026',
    useCase: 'Daily family and work commuters',
    useCaseAr: 'التنقل اليومي للعمل والعائلة',
    icon: '🏙️', available: true,
  },

  // ── Tier 2: Expand Year 2 ───────────────────────────────────────────────────
  {
    id: 'JO_AMM_PET', from: 'Amman', fromAr: 'عمّان', to: 'Petra', toAr: 'البتراء',
    distanceKm: 250, durationH: '3h', priceJOD: 12,
    countries: ['Jordan'], countriesAr: ['الأردن'], flags: ['🇯🇴'],
    tier: 2, risk: 'low', weeklyTrips: 22, demandScore: 68, revenueWeeklyJOD: 792,
    launchQuarter: 'Q1 2027', launchQuarterAr: 'الربع 1 2027',
    useCase: 'International tourists, heritage site visitors',
    useCaseAr: 'السياح الدوليون، زوار مواقع التراث',
    icon: '🏛️', available: false,
  },
  {
    id: 'JO_AMM_WRU', from: 'Amman', fromAr: 'عمّان', to: 'Wadi Rum', toAr: 'وادي رم',
    distanceKm: 320, durationH: '4h', priceJOD: 15,
    countries: ['Jordan'], countriesAr: ['الأردن'], flags: ['🇯🇴'],
    tier: 2, risk: 'low', weeklyTrips: 18, demandScore: 65, revenueWeeklyJOD: 810,
    launchQuarter: 'Q1 2027', launchQuarterAr: 'الربع 1 2027',
    useCase: 'Desert tourism, adventure travelers',
    useCaseAr: 'سياحة الصحراء، محبو المغامرات',
    icon: '⛺', available: false,
  },
  {
    id: 'EG_CAI_ALX', from: 'Cairo', fromAr: 'القاهرة', to: 'Alexandria', toAr: 'الإسكندرية',
    distanceKm: 220, durationH: '2.5h', priceJOD: 4.5,
    countries: ['Egypt'], countriesAr: ['مصر'], flags: ['🇪🇬'],
    tier: 2, risk: 'low', weeklyTrips: 85, demandScore: 91, revenueWeeklyJOD: 1147,
    launchQuarter: 'Q2 2027', launchQuarterAr: 'الربع 2 2027',
    useCase: "Summer beach trips, business, Egypt's #1 intercity route",
    useCaseAr: 'رحلات الصيف، العمل، أكثر مسار بين المدن في مصر',
    icon: '🏖️', available: false,
  },
  {
    id: 'AE_DXB_AUH', from: 'Dubai', fromAr: 'دبي', to: 'Abu Dhabi', toAr: 'أبوظبي',
    distanceKm: 150, durationH: '1.5h', priceJOD: 22,
    countries: ['UAE'], countriesAr: ['الإمارات'], flags: ['🇦🇪'],
    tier: 2, risk: 'low', weeklyTrips: 55, demandScore: 76, revenueWeeklyJOD: 3630,
    launchQuarter: 'Q3 2027', launchQuarterAr: 'الربع 3 2027',
    useCase: 'Business commuters, event attendees, high-income segment',
    useCaseAr: 'المتنقل��ن في الأعمال، الحضور للفعاليات، شريحة الدخل المرتفع',
    icon: '🏙️', available: false,
  },

  // ── Tier 3: Cross-border (High Risk) ───────────────────────────────────────
  {
    id: 'JO_AMM_JER', from: 'Amman', fromAr: 'عمّان', to: 'Jerusalem', toAr: 'القدس',
    distanceKm: 90, durationH: '2h+', priceJOD: 15,
    countries: ['Jordan', 'Palestine'], countriesAr: ['الأردن', 'فلسطين'], flags: ['🇯🇴', '🇵🇸'],
    tier: 3, risk: 'high',
    riskReason: 'Complex border controls, political sensitivity, unpredictable crossing times',
    riskReasonAr: 'ضوابط حدودية معقدة، حساسية سياسية، أوقات عبور غير متوقعة',
    weeklyTrips: 0, demandScore: 45, revenueWeeklyJOD: 0,
    launchQuarter: 'TBD (Year 3+)', launchQuarterAr: 'يُحدد لاحقاً (السنة 3+)',
    useCase: 'Religious tourism, family visits',
    useCaseAr: 'السياحة الدينية، زيارات الأسرة',
    icon: '🕌', available: false,
  },
  {
    id: 'JO_AMM_DAM', from: 'Amman', fromAr: 'عمّان', to: 'Damascus', toAr: 'دمشق',
    distanceKm: 150, durationH: '3h+', priceJOD: 8,
    countries: ['Jordan', 'Syria'], countriesAr: ['الأردن', 'سوريا'], flags: ['🇯🇴', '🇸🇾'],
    tier: 3, risk: 'high',
    riskReason: 'Active conflict recovery, insurance restrictions, border unpredictability',
    riskReasonAr: 'تعافٍ من نزاع، قيود تأمينية، تقلبات حدودية',
    weeklyTrips: 0, demandScore: 38, revenueWeeklyJOD: 0,
    launchQuarter: 'TBD (Year 3+)', launchQuarterAr: 'يُحدد لاحقاً (السنة 3+)',
    useCase: 'Regional reconnection (post-conflict)',
    useCaseAr: 'إعادة الترابط الإقليمي (ما بعد النزاع)',
    icon: '🕊️', available: false,
  },
  {
    id: 'JO_AMM_BEI', from: 'Amman', fromAr: 'عمّان', to: 'Beirut', toAr: 'بيروت',
    distanceKm: 400, durationH: '6h+', priceJOD: 20,
    countries: ['Jordan', 'Syria', 'Lebanon'], countriesAr: ['الأردن', 'سوريا', 'لبنان'], flags: ['🇯🇴', '🇸🇾', '🇱🇧'],
    tier: 3, risk: 'high',
    riskReason: 'Crosses two borders + Syrian territory — regulatory + safety complexity',
    riskReasonAr: 'عبور حدودين + أراضي سورية — تعقيد تنظيمي وأمني',
    weeklyTrips: 0, demandScore: 32, revenueWeeklyJOD: 0,
    launchQuarter: 'TBD (Year 3+)', launchQuarterAr: 'يُحدد لاحقاً (السنة 3+)',
    useCase: 'Lebanese diaspora returnees',
    useCaseAr: 'المغتربون اللبنانيون العائدون',
    icon: '✈️', available: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  1: { label: 'Tier 1 — Launch Now',         labelAr: 'المستوى 1 — أطلق الآن',        color: '#04ADBF', bg: 'rgba(4,173,191,0.1)',  border: 'rgba(4,173,191,0.25)', icon: Zap },
  2: { label: 'Tier 2 — Year 2 Expansion',   labelAr: 'المستوى 2 — التوسع السنة 2',    color: '#ABD907', bg: 'rgba(171,217,7,0.08)', border: 'rgba(171,217,7,0.2)',  icon: TrendingUp },
  3: { label: 'Tier 3 — Cross-Border (Risk)', labelAr: 'المستوى 3 — عابر للحدود (خطر)', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',  icon: AlertTriangle },
};

const RISK_CONFIG = {
  low:    { label: 'Low Risk',    labelAr: 'خطر منخفض',  color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  medium: { label: 'Medium Risk', labelAr: 'خطر متوسط',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  high:   { label: 'High Risk',   labelAr: 'خطر مرتفع',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

// ─── Route Card ───────────────────────────────────────────────────────────────

function RouteCard({ route, ar, navigate }: { route: Route; ar: boolean; navigate: (p: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const tierCfg = TIER_CONFIG[route.tier];
  const riskCfg = RISK_CONFIG[route.risk];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--wasel-glass-lg)',
        border: `1px solid ${route.available ? tierCfg.border : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <button
        className="w-full p-4 text-start"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Icon + flag */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${tierCfg.color}12` }}>
              {route.icon}
            </div>
            <div className="flex gap-0.5">
              {route.flags.map((f) => <span key={f} className="text-xs">{f}</span>)}
            </div>
          </div>

          {/* Route info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-white">
                {ar ? `${route.fromAr} → ${route.toAr}` : `${route.from} → ${route.to}`}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: riskCfg.bg, color: riskCfg.color }}
              >
                {ar ? riskCfg.labelAr : riskCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1"><MapPin size={10} />{route.distanceKm} km</span>
              <span className="flex items-center gap-1"><Clock size={10} />{route.durationH}</span>
              <span className="font-semibold" style={{ color: tierCfg.color }}>JOD {route.priceJOD}/seat</span>
            </div>
            {route.available && (
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="text-slate-400">{route.weeklyTrips} trips/week</span>
                <span className="text-slate-400">·</span>
                <span style={{ color: '#22C55E' }}>JOD {route.revenueWeeklyJOD.toLocaleString()}/week</span>
              </div>
            )}
          </div>

          {/* Tier badge + demand */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="px-2 py-1 rounded-full text-xs font-bold"
              style={{ background: tierCfg.bg, color: tierCfg.color }}>
              T{route.tier}
            </div>
            {route.available && (
              <div className="text-xs font-black" style={{ color: tierCfg.color }}>
                {route.demandScore}
                <span className="text-slate-500 font-normal">/100</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t space-y-3"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-slate-500 pt-3">
                {ar ? 'حالة الاستخدام:' : 'Use case:'}{' '}
                <span className="text-slate-300">{ar ? route.useCaseAr : route.useCase}</span>
              </p>

              {route.risk === 'high' && (route.riskReason || route.riskReasonAr) && (
                <div className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-0.5">
                      {ar ? '⚠️ لماذا هذا المسار محفوف بالمخاطر' : '⚠️ Why this route is high-risk'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ar ? route.riskReasonAr : route.riskReason}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <Calendar size={12} className="text-slate-500" />
                <span className="text-slate-400">
                  {ar ? 'إطلاق مخطط:' : 'Planned launch:'}{' '}
                  <span className="font-semibold text-white">
                    {ar ? route.launchQuarterAr : route.launchQuarter}
                  </span>
                </span>
              </div>

              {/* TASK 5: One-tap to book — reduces onboarding friction */}
              {route.available && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/app/find-ride')}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg, #04ADBF, #09732E)' }}
                  >
                    <Car size={13} />
                    {ar ? 'ابحث عن رحلة' : 'Find a Ride'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/app/awasel/send')}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                    style={{ background: 'rgba(217,150,91,0.15)', border: '1px solid rgba(217,150,91,0.3)', color: '#D9965B' }}
                  >
                    <Package size={13} />
                    {ar ? 'ابعث طرداً' : 'Send Package'}
                  </motion.button>
                </div>
              )}
              {!route.available && (
                <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                  <Lock size={11} />
                  {ar ? 'غير متاح بعد — انضم لقائمة الانتظار' : 'Not yet available — join waitlist'}
                  <button
                    onClick={() => navigate('/beta')}
                    className="text-teal-400 underline"
                  >
                    {ar ? 'هنا' : 'here'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RouteExpansionStrategy() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';

  const [activeTier, setActiveTier] = useState<Tier | 'all'>('all');

  const filtered = activeTier === 'all' ? ROUTES : ROUTES.filter((r) => r.tier === activeTier);

  const tier1Routes = ROUTES.filter((r) => r.tier === 1);
  const totalTier1Revenue = tier1Routes.reduce((acc, r) => acc + r.revenueWeeklyJOD, 0);
  const totalTier1Trips = tier1Routes.reduce((acc, r) => acc + r.weeklyTrips, 0);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0B1120', direction: ar ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe"
        style={{
          background: 'rgba(11,17,32,0.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-2xl mx-auto py-4">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe size={20} className="text-teal-400" />
            {ar ? 'استراتيجية توسع المسارات' : 'Route Expansion Strategy'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">
            {ar
              ? 'المحلي أولاً · توسع تدريجي · علامة الخطر للمسارات العابرة للحدود'
              : 'Domestic-first · Staged expansion · Risk-flagged cross-border routes'}
          </p>

          {/* Tier filter pills */}
          <div className="flex gap-2 pb-1 overflow-x-auto">
            {[
              { id: 'all', label: 'All Routes', labelAr: 'كل المسارات', color: '#94A3B8' },
              { id: 1,     label: 'Tier 1 — Now',  labelAr: 'المستوى 1',   color: '#04ADBF' },
              { id: 2,     label: 'Tier 2 — Y2',   labelAr: 'المستوى 2',   color: '#ABD907' },
              { id: 3,     label: 'Tier 3 — Risk', labelAr: 'المستوى 3',   color: '#EF4444' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveTier(f.id as Tier | 'all')}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: activeTier === f.id ? `${f.color}18` : 'transparent',
                  color: activeTier === f.id ? f.color : '#64748B',
                  border: activeTier === f.id ? `1px solid ${f.color}40` : '1px solid transparent',
                }}
              >
                {ar ? f.labelAr : f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Strategy Summary */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(4,173,191,0.1), rgba(9,115,46,0.06))',
            border: '1px solid rgba(4,173,191,0.22)',
          }}
        >
          <p className="text-xs font-medium text-teal-400 mb-3 uppercase tracking-wider">
            {ar ? '🗺️ مبدأ المحلي أولاً' : '🗺️ Domestic-First Principle'}
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            {[
              { icon: CheckCircle2, color: '#22C55E', text: ar ? 'الأردن أولاً — 4 مسارات رئيسية تغطي 90% من الطلب' : 'Jordan first — 4 priority routes cover 90% of demand' },
              { icon: TrendingUp,   color: '#04ADBF', text: ar ? 'مصر والإمارات السنة 2 — بعد إثبات النموذج' : 'Egypt & UAE in Year 2 — after model proof' },
              { icon: AlertTriangle,color: '#EF4444', text: ar ? 'المسارات العابرة للحدود: خطر مرتفع — ننتظر السنة 3+' : 'Cross-border routes: high risk — defer to Year 3+' },
              { icon: Shield,       color: '#ABD907', text: ar ? 'متطلبات خاصة لكل دولة: تأمين، عملة، ترخيص تنظيمي' : 'Country-specific: insurance, currency, regulatory licensing' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2">
                <item.icon size={12} style={{ color: item.color, flexShrink: 0, marginTop: 1 }} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 1 KPIs */}
        {(activeTier === 'all' || activeTier === 1) && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'T1 Trips/Week',  labelAr: 'رحلات أسبوعياً',  value: `${totalTier1Trips}+`, color: '#04ADBF' },
              { label: 'T1 Revenue/Week',labelAr: 'إيراد أسبوعي',    value: `JOD ${totalTier1Revenue.toLocaleString()}`, color: '#ABD907' },
              { label: 'Avg Demand',     labelAr: 'متوسط الطلب',     value: `${Math.round(tier1Routes.reduce((a, r) => a + r.demandScore, 0) / tier1Routes.length)}%`, color: '#D9965B' },
            ].map((kpi) => (
              <div key={kpi.label} className="p-3 rounded-xl text-center"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}>
                <div className="text-lg font-black" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{ar ? kpi.labelAr : kpi.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tier headers & route cards */}
        {([1, 2, 3] as Tier[])
          .filter((t) => activeTier === 'all' || activeTier === t)
          .map((tier) => {
            const cfg = TIER_CONFIG[tier];
            const tierRoutes = filtered.filter((r) => r.tier === tier);
            if (tierRoutes.length === 0) return null;
            return (
              <div key={tier} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <cfg.icon size={14} style={{ color: cfg.color }} />
                  <h3 className="text-sm font-bold" style={{ color: cfg.color }}>
                    {ar ? cfg.labelAr : cfg.label}
                  </h3>
                  <div className="flex-1 h-px" style={{ background: `${cfg.color}25` }} />
                  <span className="text-xs text-slate-500">{tierRoutes.length} routes</span>
                </div>
                {tier === 3 && (
                  <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-400">
                      {ar
                        ? 'هذه المسارات موثقة للاستثمارين فقط. لن يتم الإطلاق حتى تحقق المنصة تشغيلاً مستقراً على المستوى المحلي.'
                        : 'These routes are documented for investors only. No launch until platform achieves stable domestic operations.'}
                    </p>
                  </div>
                )}
                {tierRoutes.map((route) => (
                  <RouteCard key={route.id} route={route} ar={ar} navigate={navigate} />
                ))}
              </div>
            );
          })}

      </div>
    </div>
  );
}

export default RouteExpansionStrategy;