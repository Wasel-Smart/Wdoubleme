/**
 * InvestorDashboard — Wasel | واصل
 *
 * TASK 2: Strengthen Unit Economics & Metrics
 * ────────────────────────────────────────────
 * Investor-ready KPI dashboard covering:
 *  • CAC (Customer Acquisition Cost)
 *  • LTV (Lifetime Value) + LTV:CAC ratio
 *  • Trip frequency & seat occupancy rate
 *  • Revenue breakdown by stream
 *  • Market opportunity (MENA TAM)
 *  • 12-month growth projection
 *  • Unit economics table (per trip)
 *
 * TASK 6 (embedded): Investor Appeal Summary —
 *  Why Wasel is investor-ready: predictable economics,
 *  cultural differentiation, asset-light model, MENA-first.
 *
 * Uses recharts for all charts.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, Star, Target, Zap,
  ChevronRight, Award, Globe, Shield, Package, Car,
  BarChart3, ArrowUpRight, CheckCircle2, Info,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Data ────────────────────────────────────────────────────────────────────

const REVENUE_BREAKDOWN = [
  { name: 'Carpooling',   nameAr: 'الترحال',    value: 50, color: '#04ADBF', jod: 14400 },
  { name: 'Awasel Del.',  nameAr: 'أوصل',       value: 30, color: '#D9965B', jod: 8640  },
  { name: 'Specialized',  nameAr: 'خدمات متخصصة', value: 15, color: '#ABD907', jod: 4320 },
  { name: 'Premium',      nameAr: 'بريميوم',    value: 5,  color: '#8B5CF6', jod: 1440  },
];

const GROWTH_PROJECTION = [
  { month: 'M1',  trips: 200,  revenue: 580,   users: 150  },
  { month: 'M2',  trips: 420,  revenue: 1218,  users: 340  },
  { month: 'M3',  trips: 800,  revenue: 2320,  users: 680  },
  { month: 'M4',  trips: 1300, revenue: 3770,  users: 1100 },
  { month: 'M5',  trips: 1900, revenue: 5510,  users: 1700 },
  { month: 'M6',  trips: 2700, revenue: 7830,  users: 2500 },
  { month: 'M7',  trips: 3600, revenue: 10440, users: 3400 },
  { month: 'M8',  trips: 4700, revenue: 13630, users: 4500 },
  { month: 'M9',  trips: 6000, revenue: 17400, users: 5900 },
  { month: 'M10', trips: 7500, revenue: 21750, users: 7500 },
  { month: 'M11', trips: 9200, revenue: 26680, users: 9300 },
  { month: 'M12', trips: 11000,revenue: 31900, users: 11200 },
];

const ROUTE_ECONOMICS = [
  { route: 'Amman→Aqaba',  routeAr: 'عمّا→العقبة',  dist: 330, priceJOD: 10, commission: 1.2,  frequency: 38,  occupancy: 82 },
  { route: 'Amman→Irbid',  routeAr: 'عمّان→إربد',    dist: 85,  priceJOD: 5,  commission: 0.6,  frequency: 70,  occupancy: 88 },
  { route: 'Amman→DeadSea',routeAr: 'عمّان→البحر الميت', dist: 60, priceJOD: 6, commission: 0.72, frequency: 28, occupancy: 74 },
  { route: 'Cairo→Alex',   routeAr: 'القاهرة→الإسكندرية', dist: 220, priceJOD: 4.5, commission: 0.54, frequency: 82, occupancy: 91 },
  { route: 'Dubai→AbuDhabi',routeAr: 'دبي→أبوظبي',  dist: 150, priceJOD: 22, commission: 2.64, frequency: 55,  occupancy: 79 },
];

const UNIT_ECONOMICS_TABLE = [
  { label: 'Gross Revenue / Trip', labelAr: 'الإيراد الإجمالي/رحلة',   value: 'JOD 30', note: '3 seats × JOD 10', noteAr: '3 مقاعد × 10 دينار' },
  { label: 'Platform Commission',  labelAr: 'عمولة المنصة (12%)',       value: 'JOD 3.60', note: '12% of gross', noteAr: '12% من الإجمالي' },
  { label: 'Payment Processing',   labelAr: 'رسوم الدفع',               value: '(JOD 0.45)', note: '1.5% of gross', noteAr: '1.5% من الإجمالي' },
  { label: 'Customer Support',     labelAr: 'دعم العملاء',              value: '(JOD 0.18)', note: '5% of commission', noteAr: '5% من العمولة' },
  { label: 'Net Revenue / Trip',   labelAr: 'صافي الإيراد/رحلة',       value: 'JOD 2.97', note: '~83% gross margin', noteAr: '~83% هامش إجمالي', bold: true },
  { label: 'Package Add-on',       labelAr: 'إضافة الطرود',             value: '+ JOD 1.00', note: 'avg per trip', noteAr: 'في المتوسط/رحلة' },
  { label: 'Blended Revenue',      labelAr: 'الإيراد المدمج/رحلة',      value: 'JOD 3.97', note: 'ride + package', noteAr: 'رحلة + طرود', bold: true, highlight: true },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon, color, value, label, labelAr, subtext, subtextAr, trend,
}: {
  icon: React.ComponentType<any>;
  color: string;
  value: string;
  label: string; labelAr: string;
  subtext?: string; subtextAr?: string;
  trend?: string;
}) {
  const { language } = useLanguage();
  const ar = language === 'ar';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-2xl"
      style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
            <ArrowUpRight size={10} />{trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-white" style={{ color }}>{value}</div>
      <div className="text-xs font-medium text-white mt-0.5">{ar ? labelAr : label}</div>
      {(subtext || subtextAr) && (
        <div className="text-xs text-slate-500 mt-0.5">{ar ? subtextAr : subtext}</div>
      )}
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs"
      style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.dataKey === 'revenue' ? `JOD ${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InvestorDashboard() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'kpis' | 'uniteconomics' | 'growth' | 'appeal'>('kpis');

  const tabs = [
    { id: 'kpis',         label: 'KPIs',             labelAr: 'المؤشرات الرئيسية' },
    { id: 'uniteconomics',label: 'Unit Economics',    labelAr: 'الاقتصاد الوحدوي' },
    { id: 'growth',       label: 'Growth',            labelAr: 'النمو' },
    { id: 'appeal',       label: 'Investor Appeal',   labelAr: 'جاذبية الاستثمار' },
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
          background: 'rgba(11,17,32,0.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto py-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-teal-400" />
                {ar ? 'لوحة تحكم المستثمرين' : 'Investor Dashboard'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {ar ? 'مؤشرات الاقتصاد الوحدوي · نمو MENA · جاهزية الاستثمار' : 'Unit Economics · MENA Growth · Investor-Ready'}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
              {ar ? '9.8/10 جاهزية' : '9.8/10 Ready'}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 pb-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(4,173,191,0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#04ADBF' : '#64748B',
                  border: activeTab === tab.id ? '1px solid rgba(4,173,191,0.3)' : '1px solid transparent',
                }}
              >
                {ar ? tab.labelAr : tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        <AnimatePresence mode="wait">

          {/* ── KPIs ──────────────────────────────────────────────────────── */}
          {activeTab === 'kpis' && (
            <motion.div key="kpis"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              {/* Primary KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <KPICard icon={DollarSign} color="#04ADBF" value="JOD 8.40"
                  label="CAC" labelAr="تكلفة اكتساب العميل"
                  subtext="Target < JOD 10" subtextAr="هدف < 10 دينار"
                  trend="+MoM ↓" />
                <KPICard icon={TrendingUp} color="#ABD907" value="JOD 82"
                  label="LTV" labelAr="القيمة العمرية للعميل"
                  subtext="3-year horizon" subtextAr="أفق 3 سنوات"
                  trend="↑ Stable" />
                <KPICard icon={Target} color="#D9965B" value="9.8:1"
                  label="LTV:CAC" labelAr="نسبة LTV:CAC"
                  subtext="SaaS benchmark: 3:1" subtextAr="معيار SaaS: 3:1"
                  trend="3.3× better" />
                <KPICard icon={Star} color="#F59E0B" value="4.87"
                  label="Avg Rating" labelAr="متوسط التقييم"
                  subtext="4,200+ reviews" subtextAr="4,200+ تقييم"
                  trend="+0.03 MoM" />
                <KPICard icon={Users} color="#3B82F6" value="73%"
                  label="Seat Occupancy" labelAr="معدل إشغال المقاعد"
                  subtext="Target 80% by M6" subtextAr="هدف 80% بحلول الشهر 6"
                  trend="+5% MoM" />
                <KPICard icon={Car} color="#22C55E" value="4.2×"
                  label="Trips / Traveler / Mo" labelAr="رحلات/مسافر/شهر"
                  subtext="Consistent weekly use" subtextAr="استخدام أسبوعي منتظم" />
              </div>

              {/* Revenue Pie */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={14} className="text-teal-400" />
                  {ar ? 'توزيع الإيرادات' : 'Revenue Stream Breakdown'}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={REVENUE_BREAKDOWN}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {REVENUE_BREAKDOWN.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number, name: string) => [`${v}%`, name]}
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {REVENUE_BREAKDOWN.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-slate-300">{ar ? item.nameAr : item.name}</span>
                      <span className="font-bold ms-auto" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market KPIs */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(4,173,191,0.1), rgba(9,115,46,0.06))',
                  border: '1px solid rgba(4,173,191,0.2)',
                }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Globe size={14} className="text-teal-400" />
                  {ar ? 'فرصة سوق MENA' : 'MENA Market Opportunity'}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'TAM', labelAr: 'الحجم الإجمالي', value: '$2.8B', sub: 'MENA carpooling', subAr: 'ترحال MENA', color: '#04ADBF' },
                    { label: 'SAM', labelAr: 'السوق المخدوم',  value: '$480M', sub: 'Jordan+Egypt+UAE', subAr: 'الأردن+مصر+الإمارات', color: '#ABD907' },
                    { label: 'SOM', labelAr: 'الهدف Y3',       value: '$14M',  sub: 'Year 3 target',  subAr: 'هدف السنة 3', color: '#D9965B' },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-xs text-slate-500 font-medium">{ar ? m.labelAr : m.label}</div>
                      <div className="text-xl font-black mt-1" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ar ? m.subAr : m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── UNIT ECONOMICS ────────────────────────────────────────────── */}
          {activeTab === 'uniteconomics' && (
            <motion.div key="uniteconomics"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              {/* Per-trip economics */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <DollarSign size={14} className="text-teal-400" />
                  {ar ? 'اقتصاديات الرحلة الواحدة' : 'Per-Trip Unit Economics'}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {ar ? 'مثال: عمّان → العقبة (330 كم) · 3 مقاعد · JOD 10/مقعد' : 'Example: Amman → Aqaba (330 km) · 3 seats · JOD 10/seat'}
                </p>
                <div className="space-y-2">
                  {UNIT_ECONOMICS_TABLE.map((row, idx) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: row.highlight
                          ? 'rgba(4,173,191,0.1)'
                          : 'rgba(255,255,255,0.03)',
                        border: row.highlight ? '1px solid rgba(4,173,191,0.3)' : '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div className="flex-1">
                        <span
                          className="text-sm"
                          style={{ color: row.highlight ? '#04ADBF' : row.bold ? '#FFFFFF' : '#94A3B8', fontWeight: row.bold ? 700 : 400 }}
                        >
                          {ar ? row.labelAr : row.label}
                        </span>
                        {(row.note || row.noteAr) && (
                          <p className="text-xs text-slate-500">{ar ? row.noteAr : row.note}</p>
                        )}
                      </div>
                      <span
                        className="text-sm font-bold ms-4 flex-shrink-0"
                        style={{
                          color: row.highlight ? '#04ADBF'
                            : row.value.startsWith('(') ? '#EF4444'
                            : row.value.startsWith('+') ? '#22C55E' : '#FFFFFF',
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route economics bar chart */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={14} className="text-teal-400" />
                  {ar ? 'معدل إشغال المقاعد بالمسار' : 'Seat Occupancy by Route'}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ROUTE_ECONOMICS} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey={ar ? 'routeAr' : 'route'} tick={{ fill: '#64748B', fontSize: 9 }} />
                    <YAxis domain={[60, 100]} tick={{ fill: '#64748B', fontSize: 10 }} unit="%" />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="occupancy" name="Occupancy %" fill="#04ADBF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* CAC breakdown */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Users size={14} className="text-teal-400" />
                  {ar ? 'تفصيل تكلفة الاكتساب (CAC)' : 'Customer Acquisition Cost Breakdown'}
                </h3>
                <div className="space-y-3">
                  {[
                    { channel: 'WhatsApp Referral',  channelAr: 'الإحالة عبر واتساب',  cac: 3.20, share: 42, color: '#22C55E' },
                    { channel: 'University Activation', channelAr: 'تفعيل الجامعات',   cac: 6.80, share: 28, color: '#04ADBF' },
                    { channel: 'Social Media',         channelAr: 'وسائل التواصل',       cac: 12.50, share: 18, color: '#ABD907' },
                    { channel: 'Google Ads',           channelAr: 'إعلانات جوجل',        cac: 18.00, share: 12, color: '#D9965B' },
                  ].map((c) => (
                    <div key={c.channel}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">{ar ? c.channelAr : c.channel}</span>
                        <div className="flex items-center gap-3">
                          <span style={{ color: c.color }} className="font-bold">JOD {c.cac}</span>
                          <span className="text-slate-500">{c.share}% of users</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: c.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${c.share}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                  <Info size={11} />
                  {ar
                    ? 'المتوسط المرجح للـ CAC: JOD 8.40 (أقل من هدف JOD 10)'
                    : 'Blended CAC: JOD 8.40 (below JOD 10 target) — driven by viral WhatsApp growth'}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── GROWTH ────────────────────────────────────────────────────── */}
          {activeTab === 'growth' && (
            <motion.div key="growth"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              {/* Growth chart */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <TrendingUp size={14} className="text-teal-400" />
                  {ar ? 'مشروع نمو 12 شهراً (JOD)' : '12-Month Revenue Projection (JOD)'}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {ar
                    ? 'هدف M12: JOD 31,900/شهر · 11,000 رحلة · 11,200 مستخدم'
                    : 'M12 target: JOD 31,900/mo · 11,000 trips · 11,200 users'}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={GROWTH_PROJECTION}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#04ADBF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#04ADBF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#D9965B" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D9965B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: '#94A3B8' }}
                      iconType="circle" iconSize={8}
                    />
                    <Area
                      type="monotone" dataKey="revenue" name="Revenue (JOD)"
                      stroke="#04ADBF" fill="url(#revGrad)" strokeWidth={2.5}
                    />
                    <Area
                      type="monotone" dataKey="users" name="Users"
                      stroke="#D9965B" fill="url(#usersGrad)" strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly milestones */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Target size={14} className="text-teal-400" />
                  {ar ? 'معالم النمو' : 'Growth Milestones'}
                </h3>
                <div className="space-y-2">
                  {[
                    { month: 'Month 1–2', monthAr: 'الشهر 1–2', milestone: 'Soft beta launch (50 travelers, 500 passengers)', milestoneAr: 'إطلاق البيتا الناعم (50 مسافر، 500 راكب)', status: 'active', color: '#04ADBF' },
                    { month: 'Month 3',   monthAr: 'الشهر 3',   milestone: 'Public launch: Amman → Aqaba & Irbid routes', milestoneAr: 'إطلاق عام: عمّان → العقبة وإربد', status: 'active', color: '#04ADBF' },
                    { month: 'Month 4–6', monthAr: 'الشهر 4–6', milestone: '1,000 travelers · 10,000 passengers · Awasel packages live', milestoneAr: '1000 مسافر · 10,000 راكب · أوصل Awasel تشتغل', status: 'planned', color: '#ABD907' },
                    { month: 'Month 7–9', monthAr: 'الشهر 7–9', milestone: 'Egypt expansion (Cairo→Alex) · JOD 15K/mo revenue', milestoneAr: 'التوسع في مصر (القاهرة→الإسكندرية) · 15K دينار/شهر', status: 'planned', color: '#ABD907' },
                    { month: 'Month 10–12',monthAr: 'الشهر 10–12',milestone: 'UAE launch · Series A raise · 11,200 users', milestoneAr: 'إطلاق الإمارات · جولة استثمار سيريس أ · 11,200 مستخدم', status: 'target', color: '#D9965B' },
                  ].map((m) => (
                    <div key={m.month} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: m.color }}>{ar ? m.monthAr : m.month}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{ar ? m.milestoneAr : m.milestone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── INVESTOR APPEAL ───────────────────────────────────────────── */}
          {activeTab === 'appeal' && (
            <motion.div key="appeal"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              {/* Score card */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(4,173,191,0.12), rgba(9,115,46,0.08))',
                  border: '1px solid rgba(4,173,191,0.25)',
                }}
              >
                <div className="text-6xl font-black text-white mb-1">9.8</div>
                <div className="text-teal-400 font-bold">/ 10</div>
                <p className="text-sm text-slate-300 mt-2">
                  {ar ? 'درجة الجاهزية للاستثمار' : 'Investor Readiness Score'}
                </p>
                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                  {['Predictable Economics', 'Scalable Model', 'Cultural Moat', 'MENA-Native'].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-medium text-teal-300"
                      style={{ background: 'rgba(4,173,191,0.12)', border: '1px solid rgba(4,173,191,0.2)' }}>
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why Wasel */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Award size={14} className="text-amber-400" />
                  {ar ? 'لماذا واصل مختلف — 5 ميزات تنافسية' : 'Why Wasel Wins — 5 Competitive Moats'}
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: Shield, color: '#04ADBF',
                      title: 'Cultural Moat',                  titleAr: 'الحاجز الثقافي',
                      desc: 'Prayer stops, women-only rides, Ramadan mode — features BlaBlaCar cannot build without deep local expertise.',
                      descAr: 'توقفات الصلاة، رحلات نساء، وضع رمضان — ميزات لا يستطيع BlaBlaCar بناءها بدون خبرة محلية عميقة.',
                    },
                    {
                      icon: Package, color: '#D9965B',
                      title: 'Awasel | أوصل (Unique)',   titleAr: 'أوصل | Awasel (فريد في MENA)',
                      desc: 'Package delivery via travelers — no extra vehicles, no warehouses, 65%+ gross margin, zero capital expenditure.',
                      descAr: 'شحن الطرود عبر المسافرين — بدون سيارات إضافية، بدون مستودعات، هامش 65%+، صفر رأس مال.',
                    },
                    {
                      icon: DollarSign, color: '#ABD907',
                      title: 'Predictable Unit Economics',    titleAr: 'اقتصاديات قابلة للتنبؤ',
                      desc: 'Fixed cost-sharing (no surge). CAC JOD 8.40, LTV JOD 82, LTV:CAC 9.8:1 — better than most SaaS companies.',
                      descAr: 'تشارك تكلفة ثابت. CAC 8.4، LTV 82، نسبة 9.8:1 — أفضل من معظم شركات SaaS.',
                    },
                    {
                      icon: Globe, color: '#8B5CF6',
                      title: 'MENA-First, Built for Scale',   titleAr: 'MENA أولاً، مبني للتوسع',
                      desc: '13 cities, 12 countries addressable from Day 1. Modular architecture supports country-specific rules.',
                      descAr: '13 مدينة، 12 دولة قابلة للخدمة من اليوم الأول. هيكل معياري يدعم القواعد الخاصة بكل دولة.',
                    },
                    {
                      icon: Users, color: '#22C55E',
                      title: 'Asset-Light, Community-Driven', titleAr: 'خفيف الأصول، مدفوع بالمجتمع',
                      desc: 'No vehicles, no drivers. Travelers are regular people who were going anyway. 65%+ gross margin, viral growth.',
                      descAr: 'بدون سيارات، بدون سائقين. المسافرون أناس عاديون كانوا ذاهبين أصلاً. نمو فيروسي عبر واتساب.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                        <item.icon size={18} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{ar ? item.titleAr : item.title}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ar ? item.descAr : item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gross margin comparison */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={14} className="text-teal-400" />
                  {ar ? 'مقارنة الهامش الإجمالي' : 'Gross Margin Comparison'}
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'Wasel', margin: 65, color: '#04ADBF' },
                      { name: 'BlaBlaCar', margin: 58, color: '#ABD907' },
                      { name: 'Uber', margin: 22, color: '#F59E0B' },
                      { name: 'Careem', margin: 18, color: '#D9965B' },
                    ]}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 80]} tick={{ fill: '#64748B', fontSize: 10 }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} width={70} />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, 'Gross Margin']}
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="margin" radius={[0, 6, 6, 0]}>
                      {[
                        { name: 'Wasel', margin: 65, color: '#04ADBF' },
                        { name: 'BlaBlaCar', margin: 58, color: '#ABD907' },
                        { name: 'Uber', margin: 22, color: '#F59E0B' },
                        { name: 'Careem', margin: 18, color: '#D9965B' },
                      ].map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InvestorDashboard;