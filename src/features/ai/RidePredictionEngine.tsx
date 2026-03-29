/**
 * RidePredictionEngine — Wasel | واصل
 * Smart Ride Prediction & Incentive Engine
 *
 * Features:
 *  • AI demand forecasting by route, day, time
 *  • Empty seat minimization recommendations
 *  • Dynamic incentive rewards engine
 *  • Route score & match quality display
 *  • Weekly demand heatmap (per route, per day)
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Zap, Award, Target, ArrowRight, Calendar,
  Users, Package, Star, DollarSign, Clock, ChevronRight,
  Flame, BarChart3, Brain, Gift, AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteDemand {
  id: string;
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  distanceKm: number;
  demandScore: number;       // 0-100
  predictedBookings: number; // next 7 days
  emptySeats: number;        // on currently posted trips
  avgPrice: number;          // JOD
  trend: 'rising' | 'stable' | 'falling';
  peakDays: string[];
  peakDaysAr: string[];
}

interface Incentive {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  reward: string;
  rewardAr: string;
  rewardJOD?: number;
  type: 'bonus' | 'badge' | 'discount' | 'streak';
  progress: number;   // 0-100
  expiresInHours?: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface DemandCell {
  day: string;
  dayAr: string;
  demand: number; // 0-100
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ROUTE_DEMANDS: RouteDemand[] = [
  {
    id: 'JO_AMM_AQB', from: 'Amman', fromAr: 'عمّان', to: 'Aqaba', toAr: 'العقبة',
    distanceKm: 330, demandScore: 94, predictedBookings: 38, emptySeats: 12,
    avgPrice: 10, trend: 'rising',
    peakDays: ['Fri', 'Sat'], peakDaysAr: ['الجمعة', 'السبت'],
  },
  {
    id: 'JO_AMM_IRB', from: 'Amman', fromAr: 'عمّان', to: 'Irbid', toAr: 'إربد',
    distanceKm: 85, demandScore: 81, predictedBookings: 55, emptySeats: 18,
    avgPrice: 5, trend: 'stable',
    peakDays: ['Sun', 'Mon'], peakDaysAr: ['الأحد', 'الاثنين'],
  },
  {
    id: 'EG_CAI_ALX', from: 'Cairo', fromAr: 'القاهرة', to: 'Alexandria', toAr: 'الإسكندرية',
    distanceKm: 220, demandScore: 88, predictedBookings: 72, emptySeats: 25,
    avgPrice: 4.5, trend: 'rising',
    peakDays: ['Thu', 'Fri'], peakDaysAr: ['الخميس', 'الجمعة'],
  },
  {
    id: 'AE_DXB_AUH', from: 'Dubai', fromAr: 'دبي', to: 'Abu Dhabi', toAr: 'أبوظبي',
    distanceKm: 150, demandScore: 76, predictedBookings: 48, emptySeats: 9,
    avgPrice: 22, trend: 'stable',
    peakDays: ['Sun', 'Mon'], peakDaysAr: ['الأحد', 'الاثنين'],
  },
  {
    id: 'JO_AMM_DSA', from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت',
    distanceKm: 60, demandScore: 62, predictedBookings: 21, emptySeats: 7,
    avgPrice: 6, trend: 'falling',
    peakDays: ['Fri'], peakDaysAr: ['الجمعة'],
  },
];

const INCENTIVES: Incentive[] = [
  {
    id: 'full_car_bonus',
    title: 'Full Car Bonus',       titleAr: 'مكافأة السيارة الممتلئة',
    description: 'Fill all seats on your next Aqaba trip',
    descriptionAr: 'امتلئ بكل المقاعد في رحلتك القادمة للعقبة',
    reward: 'JOD 3 bonus', rewardAr: '3 دينار مكافأة', rewardJOD: 3,
    type: 'bonus', progress: 67, expiresInHours: 36,
    icon: Users, color: '#04ADBF',
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',      titleAr: 'مسافر عطلة نهاية الأسبوع',
    description: 'Post 3 rides on Fri–Sat this month',
    descriptionAr: 'انشر 3 رحلات الجمعة والسبت هذا الشهر',
    reward: 'Silver Badge',  rewardAr: 'شارة فضية',
    type: 'badge', progress: 33, expiresInHours: 72,
    icon: Award, color: '#ABD907',
  },
  {
    id: 'awasel_carrier',
    title: 'Awasel Package Carrier', titleAr: 'حامل طرود أوصل',
    description: 'Deliver 5 packages to earn Awasel carrier status',
    descriptionAr: 'وصّل 5 طرود واحصل على لقب حامل أوصل',
    reward: '15% commission off', rewardAr: 'خصم 15% من العمولة',
    type: 'discount', progress: 80, expiresInHours: undefined,
    icon: Package, color: '#D9965B',
  },
  {
    id: '7day_streak',
    title: '7-Day Posting Streak', titleAr: 'سلسلة نشر 7 أيام',
    description: 'Post at least one ride every day for 7 days',
    descriptionAr: 'انشر رحلة يومياً لمدة 7 أيام متتالية',
    reward: 'JOD 5 credit',  rewardAr: '5 دينار رصيد', rewardJOD: 5,
    type: 'streak', progress: 57,
    icon: Flame, color: '#F59E0B',
  },
];

// Demand by day-of-week for the heatmap
const WEEKLY_DEMAND: Record<string, DemandCell[]> = {
  JO_AMM_AQB: [
    { day: 'Sun', dayAr: 'أحد', demand: 45 },
    { day: 'Mon', dayAr: 'اثنين', demand: 30 },
    { day: 'Tue', dayAr: 'ثلاثاء', demand: 28 },
    { day: 'Wed', dayAr: 'أربعاء', demand: 35 },
    { day: 'Thu', dayAr: 'خميس', demand: 72 },
    { day: 'Fri', dayAr: 'جمعة', demand: 98 },
    { day: 'Sat', dayAr: 'سبت', demand: 94 },
  ],
  JO_AMM_IRB: [
    { day: 'Sun', dayAr: 'أحد', demand: 88 },
    { day: 'Mon', dayAr: 'اثنين', demand: 82 },
    { day: 'Tue', dayAr: 'ثلاثاء', demand: 74 },
    { day: 'Wed', dayAr: 'أربعاء', demand: 70 },
    { day: 'Thu', dayAr: 'خميس', demand: 65 },
    { day: 'Fri', dayAr: 'جمعة', demand: 40 },
    { day: 'Sat', dayAr: 'سبت', demand: 38 },
  ],
  EG_CAI_ALX: [
    { day: 'Sun', dayAr: 'أحد', demand: 58 },
    { day: 'Mon', dayAr: 'اثنين', demand: 55 },
    { day: 'Tue', dayAr: 'ثلاثاء', demand: 48 },
    { day: 'Wed', dayAr: 'أربعاء', demand: 60 },
    { day: 'Thu', dayAr: 'خميس', demand: 92 },
    { day: 'Fri', dayAr: 'جمعة', demand: 95 },
    { day: 'Sat', dayAr: 'سبت', demand: 62 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function demandColor(score: number): string {
  if (score >= 85) return '#04ADBF';
  if (score >= 65) return '#ABD907';
  if (score >= 45) return '#F59E0B';
  return '#EF4444';
}

function demandLabel(score: number, ar: boolean): string {
  if (score >= 85) return ar ? 'طلب عالٍ جداً' : 'Very High Demand';
  if (score >= 65) return ar ? 'طلب عالٍ' : 'High Demand';
  if (score >= 45) return ar ? 'طلب متوسط' : 'Moderate Demand';
  return ar ? 'طلب منخفض' : 'Low Demand';
}

function trendIcon(trend: RouteDemand['trend']) {
  if (trend === 'rising')  return { symbol: '↑', color: '#22C55E' };
  if (trend === 'falling') return { symbol: '↓', color: '#EF4444' };
  return { symbol: '→', color: '#94A3B8' };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RidePredictionEngine() {
  const { language } = useLanguage();
  const { formatShort } = useCurrency();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'forecast' | 'optimizer' | 'incentives'>('forecast');
  const [selectedRoute, setSelectedRoute] = useState<string>('JO_AMM_AQB');

  const selectedDemand = useMemo(
    () => WEEKLY_DEMAND[selectedRoute] ?? WEEKLY_DEMAND['JO_AMM_AQB'],
    [selectedRoute],
  );

  const totalEmptySeats = useMemo(
    () => ROUTE_DEMANDS.reduce((acc, r) => acc + r.emptySeats, 0),
    [],
  );

  const tabs = [
    { id: 'forecast',   label: 'Demand Forecast', labelAr: 'توقع الطلب', icon: BarChart3 },
    { id: 'optimizer',  label: 'Seat Optimizer',  labelAr: 'مُحسّن المقاعد', icon: Target },
    { id: 'incentives', label: 'Incentives',       labelAr: 'الحوافز',        icon: Gift },
  ] as const;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0B1120', direction: ar ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe"
        style={{
          background: 'rgba(11,17,32,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-2xl mx-auto py-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain size={20} className="text-teal-400" />
                {ar ? 'محرك التنبؤ الذكي' : 'AI Prediction Engine'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {ar ? 'تنبؤ الطلب · تحسين المقاعد · حوافز ذكية' : 'Demand Forecast · Seat Optimizer · Smart Incentives'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(4,173,191,0.12)', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.25)' }}>
              <motion.div className="w-1.5 h-1.5 rounded-full bg-teal-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              {ar ? 'مباشر' : 'Live'}
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: ar ? 'مقاعد فارغة' : 'Empty Seats', value: totalEmptySeats, color: '#EF4444', unit: '' },
              { label: ar ? 'أعلى طلب'    : 'Top Demand',  value: 94,              color: '#04ADBF', unit: '%' },
              { label: ar ? 'حوافز نشطة'  : 'Active Incentives', value: INCENTIVES.length, color: '#ABD907', unit: '' },
            ].map((kpi) => (
              <div key={kpi.label} className="py-2 px-3 rounded-xl text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xl font-black" style={{ color: kpi.color }}>
                  {kpi.value}{kpi.unit}
                </div>
                <div className="text-xs text-slate-500">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 pb-3">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(4,173,191,0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#04ADBF' : '#64748B',
                  border: activeTab === tab.id ? '1px solid rgba(4,173,191,0.3)' : '1px solid transparent',
                }}>
                <tab.icon size={12} />
                <span className="hidden sm:inline">{ar ? tab.labelAr : tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <AnimatePresence mode="wait">

          {/* ── DEMAND FORECAST ───────────────────────────────────────────── */}
          {activeTab === 'forecast' && (
            <motion.div key="forecast"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-4"
            >
              {/* Route selector */}
              <div className="grid grid-cols-1 gap-3">
                {ROUTE_DEMANDS.map((route) => {
                  const trend = trendIcon(route.trend);
                  const isSelected = selectedRoute === route.id;
                  return (
                    <motion.button
                      key={route.id}
                      onClick={() => setSelectedRoute(route.id)}
                      className="w-full text-start p-4 rounded-2xl transition-all"
                      style={{
                        background: isSelected ? 'rgba(4,173,191,0.1)' : 'var(--wasel-glass-lg)',
                        border: `1px solid ${isSelected ? 'rgba(4,173,191,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">
                              {ar ? `${route.fromAr} → ${route.toAr}` : `${route.from} → ${route.to}`}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: `${demandColor(route.demandScore)}18`,
                                color: demandColor(route.demandScore),
                              }}>
                              {demandLabel(route.demandScore, ar)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span>{route.distanceKm} km</span>
                            <span>·</span>
                            <span>{ar ? `${route.predictedBookings} حجز متوقع` : `${route.predictedBookings} predicted bookings`}</span>
                            <span>·</span>
                            <span style={{ color: trend.color }}>{trend.symbol}</span>
                          </div>
                        </div>
                        {/* Demand ring */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="relative w-14 h-14">
                            <svg width={56} height={56}>
                              <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
                              <circle cx={28} cy={28} r={22} fill="none"
                                stroke={demandColor(route.demandScore)}
                                strokeWidth={6} strokeLinecap="round"
                                strokeDasharray={`${(route.demandScore / 100) * 138} 138`}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black"
                              style={{ color: demandColor(route.demandScore) }}>
                              {route.demandScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Weekly demand heatmap */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-teal-400" />
                  {ar ? 'خريطة الطلب الأسبوعية' : 'Weekly Demand Heatmap'}
                  <span className="text-xs text-slate-500 font-normal ms-1">
                    {ar
                      ? ROUTE_DEMANDS.find(r => r.id === selectedRoute)?.toAr
                      : ROUTE_DEMANDS.find(r => r.id === selectedRoute)?.to}
                  </span>
                </h3>
                <div className="flex gap-2">
                  {selectedDemand.map((cell) => (
                    <div key={cell.day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-xl transition-all"
                        style={{
                          height: `${Math.max(24, cell.demand * 0.8)}px`,
                          background: `linear-gradient(180deg, ${demandColor(cell.demand)}, ${demandColor(cell.demand)}40)`,
                          boxShadow: cell.demand > 80 ? `0 0 12px ${demandColor(cell.demand)}40` : 'none',
                        }}
                      />
                      <span className="text-xs text-slate-400">{ar ? cell.dayAr : cell.day}</span>
                      <span className="text-xs font-bold" style={{ color: demandColor(cell.demand) }}>
                        {cell.demand}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span>{ar ? 'منخفض' : 'Low'}</span>
                  <div className="flex gap-1 flex-1 mx-3 h-1 rounded-full overflow-hidden">
                    {['#EF4444', '#F59E0B', '#ABD907', '#04ADBF'].map((c) => (
                      <div key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <span>{ar ? 'عالٍ جداً' : 'Very High'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SEAT OPTIMIZER ────────────────────────────────────────────── */}
          {activeTab === 'optimizer' && (
            <motion.div key="optimizer"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-4"
            >
              {/* AI Summary */}
              <div
                className="rounded-2xl p-5 flex gap-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(4,173,191,0.12), rgba(9,115,46,0.08))',
                  border: '1px solid rgba(4,173,191,0.25)',
                }}
              >
                <Brain size={36} className="text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {ar ? '🧠 توصية الذكاء الاصطناعي' : '🧠 AI Recommendation'}
                  </p>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {ar
                      ? `يوجد ${totalEmptySeats} مقعد فارغ على مسارات تحت الطلب العالي هذا الأسبوع. خفّض سعرك بـ JOD 1 على رحلة الجمعة للعقبة لرفع معدل الإشغال من 67% إلى 95% خلال 24 ساعة.`
                      : `There are ${totalEmptySeats} empty seats on high-demand routes this week. Drop your Aqaba Friday price by JOD 1 to boost fill rate from 67% to ~95% within 24 hours.`}
                  </p>
                </div>
              </div>

              {/* Route optimization cards */}
              {ROUTE_DEMANDS.filter(r => r.emptySeats > 0).map((route, idx) => {
                const fillRate = Math.round(((10 - route.emptySeats % 6) / 10) * 100);
                const suggestedDiscount = route.emptySeats > 10 ? 1.0 : 0.5;
                return (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, x: ar ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {ar ? `${route.fromAr} → ${route.toAr}` : `${route.from} → ${route.to}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ar ? `${route.emptySeats} مقعد فارغ من أصل مقاعد الأسبوع` : `${route.emptySeats} empty seats this week`}
                        </p>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <p className="text-xs text-slate-400">{ar ? 'معدل الإشغال' : 'Fill Rate'}</p>
                        <p className="text-lg font-black" style={{ color: fillRate > 70 ? '#22C55E' : '#F59E0B' }}>
                          {fillRate}%
                        </p>
                      </div>
                    </div>

                    {/* Fill bar */}
                    <div className="h-2 rounded-full bg-slate-800 mb-3">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: fillRate > 70 ? '#22C55E' : '#F59E0B' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${fillRate}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>

                    {/* AI suggestions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs p-2.5 rounded-xl"
                        style={{ background: 'rgba(4,173,191,0.08)', border: '1px solid rgba(4,173,191,0.15)' }}>
                        <Zap size={12} className="text-teal-400 flex-shrink-0" />
                        <span className="text-slate-300">
                          {ar
                            ? `اخفّض السعر JOD ${suggestedDiscount} → توقع +${Math.round(route.emptySeats * 0.6)} حجز جديد`
                            : `Drop price JOD ${suggestedDiscount} → expect +${Math.round(route.emptySeats * 0.6)} new bookings`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs p-2.5 rounded-xl"
                        style={{ background: 'rgba(171,217,7,0.06)', border: '1px solid rgba(171,217,7,0.15)' }}>
                        <Clock size={12} className="text-lime-400 flex-shrink-0" />
                        <span className="text-slate-300">
                          {ar
                            ? `أفضل وقت للنشر: ${route.peakDaysAr.join('، ')} الساعة 6-9 مساءً`
                            : `Best posting time: ${route.peakDays.join(', ')} at 6–9 PM`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── INCENTIVES ────────────────────────────────────────────────── */}
          {activeTab === 'incentives' && (
            <motion.div key="incentives"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-4"
            >
              {/* Earnings summary */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(217,150,91,0.12), rgba(171,217,7,0.06))',
                  border: '1px solid rgba(217,150,91,0.25)',
                }}
              >
                <p className="text-xs text-slate-400 mb-1">{ar ? 'مكافآتك المتاحة هذا الأسبوع' : 'Available rewards this week'}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">JOD 8</span>
                  <span className="text-sm text-slate-400 mb-1">{ar ? 'قابلة للكسب' : 'earnable'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                  <TrendingUp size={12} />
                  {ar ? 'أكمل جميع الحوافز لتحصل على JOD 8 + شارة فضية' : 'Complete all incentives for JOD 8 + Silver Badge'}
                </div>
              </div>

              {/* Incentive cards */}
              {INCENTIVES.map((inc, idx) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${inc.color}18`, border: `1px solid ${inc.color}30` }}
                    >
                      <inc.icon size={20} style={{ color: inc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{ar ? inc.titleAr : inc.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{ar ? inc.descriptionAr : inc.description}</p>
                        </div>
                        <div
                          className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: `${inc.color}18`, color: inc.color, border: `1px solid ${inc.color}30` }}
                        >
                          {ar ? inc.rewardAr : inc.reward}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-500">{ar ? 'التقدم' : 'Progress'}</span>
                          <span style={{ color: inc.color }}>{inc.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: inc.color, boxShadow: `0 0 6px ${inc.color}50` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${inc.progress}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>

                      {inc.expiresInHours && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Clock size={10} />
                          {ar ? `تنتهي خلال ${inc.expiresInHours} ساعة` : `Expires in ${inc.expiresInHours}h`}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Platform commission info */}
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <AlertCircle size={16} className="text-slate-500 flex-shrink-0" />
                <p className="text-xs text-slate-500">
                  {ar
                    ? 'يتم احتساب الحوافز بعد خصم عمولة المنصة (12%). الحوافز لا تنطبق على الأسعار خارج نطاق تقاسم التكاليف.'
                    : 'Incentives are calculated after platform commission (12%). Incentives do not apply to prices outside the cost-sharing range.'}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default RidePredictionEngine;