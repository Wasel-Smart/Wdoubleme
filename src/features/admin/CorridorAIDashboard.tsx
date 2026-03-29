/**
 * CorridorAIDashboard — Wasel | واصل
 * [AI] Corridor demand heatmaps · Predictive analytics · Package tracking
 * [DigitalTwin] Real-time corridor optimization
 * Investor-grade: demonstrates operational intelligence and scalability
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUp, Package, Car, MapPin, Shield,
  Star, ArrowUpRight, ArrowDownRight,
  BarChart3, Brain, Activity, RefreshCcw,
  CheckCircle2, Users,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { C as CT } from '../../tokens/colors';

// ── Brand — aligned with /tokens/colors.ts ────────────────────────────────────
const C = {
  bg:     CT.bg,
  card:   CT.card,
  card2:  CT.card2,
  cyan:   CT.cyan,
  green:  CT.green,
  gold:   CT.gold,
  lime:   CT.lime,
  purple: CT.purple,
  red:    CT.red,
  muted:  CT.muted,
};

// ── Data ────────────────────────────────────────────────────────────────────
const DEMAND_DATA = [
  { corridor: 'AMM→AQB', demand: 94, capacity: 120, packages: 23, revenue: 2880, color: C.cyan },
  { corridor: 'AMM→IRB', demand: 87, capacity: 100, packages: 41, revenue: 1740, color: C.green },
  { corridor: 'AMM→ZRQ', demand: 76, capacity: 90,  packages: 18, revenue: 912,  color: C.gold },
  { corridor: 'AMM→PTR', demand: 62, capacity: 80,  packages: 12, revenue: 1488, color: C.purple },
  { corridor: 'AMM→DSA', demand: 58, capacity: 75,  packages: 9,  revenue: 870,  color: '#10B981' },
  { corridor: 'AMM→SLT', demand: 45, capacity: 60,  packages: 6,  revenue: 540,  color: '#F59E0B' },
];

const WEEKLY_TREND = [
  { day: 'Mon', rides: 42, packages: 18, rev: 756 },
  { day: 'Tue', rides: 38, packages: 14, rev: 684 },
  { day: 'Wed', rides: 55, packages: 22, rev: 990 },
  { day: 'Thu', rides: 61, packages: 29, rev: 1098 },
  { day: 'Fri', rides: 89, packages: 41, rev: 1602 },
  { day: 'Sat', rides: 94, packages: 38, rev: 1692 },
  { day: 'Sun', rides: 73, packages: 30, rev: 1314 },
];

const HOURLY_DEMAND = [
  { h: '4am', v: 12 }, { h: '6am', v: 34 }, { h: '7am', v: 78 },
  { h: '8am', v: 92 }, { h: '9am', v: 65 }, { h: '12pm', v: 48 },
  { h: '2pm', v: 55 }, { h: '4pm', v: 71 }, { h: '5pm', v: 88 },
  { h: '6pm', v: 95 }, { h: '7pm', v: 82 }, { h: '9pm', v: 41 },
];

const AI_PREDICTIONS = [
  { corridor: 'Amman → Aqaba', prediction: '+34%', confidence: 94, reason: 'Weekend surge + beach season', icon: '🏖️', color: C.cyan },
  { corridor: 'Amman → Irbid', prediction: '+18%', confidence: 89, reason: 'University exam period starts', icon: '🎓', color: C.green },
  { corridor: 'Amman → Petra', prediction: '+52%', confidence: 87, reason: 'Tourism high season', icon: '🏛️', color: C.purple },
  { corridor: 'Amman → Zarqa', prediction: '+8%', confidence: 91, reason: 'Regular daily commuter pattern', icon: '🏙️', color: C.gold },
];

const PACKAGE_FLOW = [
  { route: 'AMM→IRB', volume: 41, value: 'JOD 4.5 avg', success: 97, color: C.green },
  { route: 'AMM→AQB', volume: 23, value: 'JOD 8.0 avg', success: 94, color: C.cyan },
  { route: 'AMM→ZRQ', volume: 18, value: 'JOD 3.5 avg', success: 98, color: C.gold },
  { route: 'AMM→PTR', volume: 12, value: 'JOD 12.0 avg', success: 91, color: C.purple },
];

const TRUST_METRICS = [
  { label: 'Verified Drivers', value: '100%', color: C.green, icon: Shield },
  { label: 'Avg Trust Score', value: '4.87', color: C.cyan, icon: Star },
  { label: 'Disputes Resolved', value: '98.2%', color: C.lime, icon: CheckCircle2 },
  { label: 'SOS Response (avg)', value: '< 2min', color: C.gold, icon: Activity },
];

// ── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon: Icon, trend, tag }: {
  label: string; value: string; sub?: string; color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  trend?: { val: string; up: boolean }; tag?: string;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: C.card, border: `1px solid ${color}20` }}>
      <div className="absolute inset-0 opacity-50"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${color}12 0%, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {tag && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{tag}</span>
          )}
        </div>
        <div className="font-black text-2xl text-white mb-1">{value}</div>
        <div className="text-xs font-semibold mb-2" style={{ color: C.muted }}>{label}</div>
        {sub && <div className="text-xs" style={{ color }}>{sub}</div>}
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold mt-1"
            style={{ color: trend.up ? C.green : C.red }}>
            {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.val} vs last week
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, tag, subtitle }: { title: string; tag: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-black text-white text-lg">{title}</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${C.cyan}12`, color: C.cyan, border: `1px solid ${C.cyan}25` }}>{tag}</span>
      </div>
      {subtitle && <p className="text-sm" style={{ color: C.muted }}>{subtitle}</p>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function CorridorAIDashboard() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  const [activeTab, setActiveTab] = useState<'overview' | 'corridors' | 'packages' | 'ai' | 'trust'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Guard against setState-after-unmount which can trigger IframeMessageAbortError
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    if (mountedRef.current) setRefreshing(false);
  }, []);

  const tabs = [
    { id: 'overview',  label: ar ? 'نظرة عامة' : 'Overview',    icon: BarChart3 },
    { id: 'corridors', label: ar ? 'الممرات'   : 'Corridors',   icon: MapPin },
    { id: 'packages',  label: ar ? 'الطرود'    : 'Packages',    icon: Package },
    { id: 'ai',        label: ar ? 'AI توقعات' : 'AI Forecast', icon: Brain },
    { id: 'trust',     label: ar ? 'الثقة'     : 'Trust',       icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: '#E2E8F0' }} dir={dir}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 px-4 py-4 border-b"
        style={{ background: `${C.bg}ee`, backdropFilter: 'blur(20px)', borderColor: `${C.cyan}12` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5" style={{ color: C.cyan }} />
              <h1 className="font-black text-white text-lg">
                {ar ? 'لوحة ذكاء الممرات AI' : 'Corridor AI Dashboard'}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${C.lime}15`, color: C.lime, border: `1px solid ${C.lime}25` }}>
                [DigitalTwin]
              </span>
            </div>
            <p className="text-xs" style={{ color: C.muted }}>
              {ar
                ? 'تحليلات حية للطلب + توقعات الذكاء الاصطناعي — Jordan Mobility OS'
                : 'Live demand analytics + AI predictions — Jordan Mobility OS'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={refresh}
              className="p-2 rounded-xl transition-colors hover:bg-white/5">
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: C.muted }} />
            </motion.button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: `${C.green}12`, border: `1px solid ${C.green}25` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
              <span className="text-xs font-bold" style={{ color: C.green }}>{ar ? 'مباشر' : 'LIVE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-4 pt-4 pb-0 border-b" style={{ borderColor: `${C.cyan}10` }}>
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto pb-3">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0"
              style={activeTab === tab.id
                ? { background: `${C.cyan}18`, color: C.cyan, border: `1px solid ${C.cyan}35` }
                : { background: 'transparent', color: C.muted, border: '1px solid transparent' }}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label={ar ? 'رحلات اليوم' : 'Rides Today'} value="94"
                sub={ar ? 'في 6 ممرات' : 'across 6 corridors'} color={C.cyan} icon={Car}
                trend={{ val: '+23%', up: true }} tag="[Corridor]" />
              <KpiCard label={ar ? 'طرود نشطة' : 'Active Packages'} value="109"
                sub={ar ? 'جاري التوصيل' : 'in transit'} color={C.gold} icon={Package}
                trend={{ val: '+31%', up: true }} tag="[Package]" />
              <KpiCard label={ar ? 'إيراد اليوم' : "Today's Revenue"} value="JOD 2,847"
                sub={ar ? '12% عمولة' : '12% commission'} color={C.green} icon={TrendingUp}
                trend={{ val: '+18%', up: true }} />
              <KpiCard label={ar ? 'مستخدمون نشطون' : 'Active Users'} value="1,243"
                sub={ar ? 'مسافر + راكب' : 'drivers + passengers'} color={C.purple} icon={Users}
                trend={{ val: '+8%', up: true }} tag="[AI]" />
            </div>

            {/* Weekly chart */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cyan}12` }}>
              <SectionHeader title={ar ? 'أداء الأسبوع' : 'Weekly Performance'} tag="[Corridor]"
                subtitle={ar ? 'رحلات + طرود + إيراد' : 'Rides + packages + revenue'} />
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={WEEKLY_TREND}>
                  <defs>
                    <linearGradient id="caiRideGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.cyan} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={C.cyan} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="caiPkgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.gold} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={C.gold} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: C.card2, border: `1px solid ${C.cyan}20`, borderRadius: 12, color: '#E2E8F0', fontSize: 12 }} />
                  <Area key="area-rides" type="monotone" dataKey="rides" stroke={C.cyan} fill="url(#caiRideGrad)" strokeWidth={2} name={ar ? 'رحلات' : 'Rides'} />
                  <Area key="area-packages" type="monotone" dataKey="packages" stroke={C.gold} fill="url(#caiPkgGrad)" strokeWidth={2} name={ar ? 'طرود' : 'Packages'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly demand */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.green}12` }}>
              <SectionHeader title={ar ? 'الطلب بالساعة — اليوم' : 'Hourly Demand — Today'} tag="[AI]"
                subtitle={ar ? 'يُستخدم للتنبؤ بأوقات الذروة + توزيع السائقين' : 'Used for peak-hour prediction + driver distribution'} />
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={HOURLY_DEMAND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="h" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: C.card2, border: `1px solid ${C.green}20`, borderRadius: 12, color: '#E2E8F0', fontSize: 12 }} />
                  <Bar key="bar-demand" dataKey="v" radius={[6, 6, 0, 0]} name={ar ? 'الطلب' : 'Demand'}>
                    {HOURLY_DEMAND.map((d, i) => (
                      <Cell key={`hourly-cell-${d.h}-${i}`} fill={d.v > 80 ? C.cyan : d.v > 60 ? C.green : d.v > 40 ? C.gold : '#2D4A6B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                {[
                  { color: C.cyan, label: ar ? 'ذروة' : 'Peak (80+)' },
                  { color: C.green, label: ar ? 'عالي' : 'High (60+)' },
                  { color: C.gold, label: ar ? 'متوسط' : 'Medium (40+)' },
                ].map((l, i) => (
                  <div key={`legend-${l.color}-${i}`} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                    <span className="text-xs" style={{ color: C.muted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CORRIDORS ── */}
        {activeTab === 'corridors' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <SectionHeader title={ar ? 'تحليل الممرات' : 'Corridor Analysis'} tag="[Corridor]"
              subtitle={ar ? 'طلب + طاقة + إيراد لكل مسار' : 'Demand + capacity + revenue per corridor'} />

            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cyan}12` }}>
              <h3 className="font-bold text-white mb-4 text-sm">{ar ? 'الطلب مقابل الطاقة الاستيعابية' : 'Demand vs. Capacity'}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={DEMAND_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="corridor" type="category" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: C.card2, border: `1px solid ${C.cyan}20`, borderRadius: 12, color: '#E2E8F0', fontSize: 12 }} />
                  <Bar key="bar-demand" dataKey="demand" name={ar ? 'الطلب' : 'Demand'} radius={[0, 6, 6, 0]}>
                    {DEMAND_DATA.map((d, i) => (
                      <Cell key={`demand-cell-${i}-${d.corridor}`} fill={d.color} />
                    ))}
                  </Bar>
                  <Bar key="bar-capacity" dataKey="capacity" name={ar ? 'الطاقة' : 'Capacity'} fill="rgba(255,255,255,0.08)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMAND_DATA.map((d, i) => (
                <motion.div key={`corridor-card-${d.corridor}`} whileHover={{ y: -2 }} className="rounded-2xl p-4"
                  style={{ background: C.card2, border: `1px solid ${d.color}20` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white">{d.corridor}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${d.color}15`, color: d.color, border: `1px solid ${d.color}25` }}>
                      {Math.round((d.demand / d.capacity) * 100)}% {ar ? 'مشغول' : 'utilized'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: ar ? 'الطلب' : 'Demand', val: d.demand },
                      { label: ar ? 'الطرود' : 'Packages', val: d.packages },
                      { label: ar ? 'الإيراد' : 'Revenue', val: formatCurrency(d.revenue, 'JOD') },
                    ].map((m, j) => (
                      <div key={`metric-${d.corridor}-${m.label}`} className="text-center rounded-xl py-2 px-1"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="font-bold text-white text-sm">{m.val}</div>
                        <div className="text-xs" style={{ color: C.muted }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: d.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.demand / d.capacity) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PACKAGES ── */}
        {activeTab === 'packages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <SectionHeader title={ar ? 'تدفق الطرود' : 'Package Flow'} tag="[Package]"
              subtitle={ar ? 'حجم + معدل نجاح + متوسط قيمة لكل مسار' : 'Volume + success rate + avg value per corridor'} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label={ar ? 'إجمالي الطرود' : 'Total Packages'} value="109"
                sub={ar ? 'جاري التوصيل' : 'in transit'} color={C.gold} icon={Package} />
              <KpiCard label={ar ? 'تُسلَّم اليوم' : 'Delivered Today'} value="47"
                sub={ar ? 'متوسط 3.2 ساعة' : 'avg 3.2h delivery'} color={C.green} icon={CheckCircle2} />
              <KpiCard label={ar ? 'معدل النجاح' : 'Success Rate'} value="96.4%"
                sub={ar ? 'مقارنة 94% الصناعة' : 'vs 94% industry'} color={C.lime} icon={Star} />
              <KpiCard label={ar ? 'متوسط القيمة' : 'Avg Package Value'} value="JOD 5.8"
                sub={ar ? 'عمولة 20%' : '20% commission'} color={C.cyan} icon={TrendingUp} />
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.gold}12` }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: `${C.gold}15` }}>
                <h3 className="font-bold text-white">{ar ? 'تفصيل الطرود حسب المسار' : 'Package Detail by Corridor'}</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {PACKAGE_FLOW.map((p, i) => (
                  <div key={`pkg-flow-${p.route}`} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                        <Package className="w-4 h-4" style={{ color: p.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{p.route}</div>
                        <div className="text-xs" style={{ color: C.muted }}>{p.value} {ar ? '· تأمين شامل' : '· insured'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-bold text-white">{p.volume}</div>
                        <div className="text-xs" style={{ color: C.muted }}>{ar ? 'طرود' : 'pkgs'}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold" style={{ color: p.color }}>{p.success}%</div>
                        <div className="text-xs" style={{ color: C.muted }}>{ar ? 'نجاح' : 'success'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: `${C.gold}08`, border: `1px solid ${C.gold}25` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${C.gold}15` }}>📦</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{ar ? 'راجع للمرتجعات — خاصية AI' : 'Raje3 Returns — AI Feature'}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${C.gold}20`, color: C.gold, border: `1px solid ${C.gold}35` }}>[Package][AI]</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: C.muted }}>
                    {ar
                      ? 'تطابق تلقائي لمرتجعات التجارة الإلكترونية مع رحلات قائمة. 2,400+ مرتجع مكتمل، معدل نجاح 94%.'
                      : 'Auto-match e-commerce returns with existing trips. 2,400+ returns completed, 94% success rate.'}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { size: 'Small', price: 'JOD 3.50' },
                      { size: 'Medium', price: 'JOD 5.50' },
                      { size: 'Large', price: 'JOD 8.50' },
                    ].map((s, i) => (
                      <div key={`raje3-${s.size}`} className="text-center rounded-xl py-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="font-bold text-white text-sm">{s.price}</div>
                        <div className="text-xs" style={{ color: C.muted }}>{s.size}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── AI FORECAST ── */}
        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <SectionHeader title={ar ? 'توقعات الذكاء الاصطناعي' : 'AI Demand Forecasting'} tag="[AI]"
              subtitle={ar ? 'نماذج ML تتنبأ بالطلب 72 ساعة مستقبلاً لكل ممر' : 'ML models predict demand 72h ahead per corridor'} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: ar ? 'دقة النموذج' : 'Model Accuracy', value: '91.3%', color: C.green, desc: ar ? 'RMSE متوسط = 4.2 رحلة' : 'Avg RMSE = 4.2 trips' },
                { label: ar ? 'أفق التنبؤ' : 'Prediction Horizon', value: '72h', color: C.cyan, desc: ar ? 'يُحدَّث كل 6 ساعات' : 'Refreshed every 6h' },
                { label: ar ? 'ممرات تحت المراقبة' : 'Corridors Monitored', value: '6 live', color: C.gold, desc: ar ? 'توسع لـ 20 مدينة Q3' : 'Expanding to 20 cities Q3' },
              ].map((m, i) => (
                <div key={`ai-metric-${m.label}`} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${m.color}20` }}>
                  <div className="font-black text-xl text-white mb-1">{m.value}</div>
                  <div className="text-sm font-bold mb-1 text-white">{m.label}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{m.desc}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-white">{ar ? 'توقعات الـ 72 ساعة القادمة' : 'Next 72-Hour Predictions'}</h3>
              {AI_PREDICTIONS.map((p, i) => (
                <motion.div key={`ai-pred-${p.corridor}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: C.card2, border: `1px solid ${p.color}20` }}>
                  <span className="text-2xl shrink-0">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm mb-1">{p.corridor}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{p.reason}</div>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: p.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${p.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: C.muted }}>
                      {ar ? `ثقة النموذج: ${p.confidence}%` : `Model confidence: ${p.confidence}%`}
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="font-black text-2xl" style={{ color: p.color }}>{p.prediction}</div>
                    <div className="text-xs font-bold" style={{ color: C.muted }}>
                      {ar ? 'الطلب المتوقع' : 'demand lift'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.purple}15` }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4" style={{ color: C.purple }} />
                <span className="font-bold text-white text-sm">{ar ? 'قدرات AI المُدمجة' : 'Embedded AI Capabilities'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  '[AI] Trip demand forecasting',
                  '[AI] Smart pickup zone clustering',
                  '[AI] Dynamic bundle optimization',
                  '[AI] Package route matching',
                  '[AI] Driver earnings estimator',
                  '[DigitalTwin] National corridor simulation',
                  '[Corridor] A* route intelligence',
                ].map((tag, i) => (
                  <span key={`ai-tag-${i}-${tag.slice(0, 10)}`} className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${C.purple}12`, color: C.purple, border: `1px solid ${C.purple}25` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TRUST ── */}
        {activeTab === 'trust' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <SectionHeader title={ar ? 'طبقة الثقة والأمان' : 'Trust & Safety Layer'} tag="[Trust]"
              subtitle={ar ? 'Sanad eKYC + 9 طبقات أمان + SOS' : 'Sanad eKYC + 9-layer trust system + SOS emergency'} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRUST_METRICS.map((m, i) => (
                <div key={`trust-metric-${i}-${m.label}`} className="rounded-2xl p-4 text-center"
                  style={{ background: C.card, border: `1px solid ${m.color}20` }}>
                  <m.icon className="w-6 h-6 mx-auto mb-2" style={{ color: m.color }} />
                  <div className="font-black text-xl text-white mb-1">{m.value}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Sanad eKYC pipeline */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.green}15` }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5" style={{ color: C.green }} />
                <h3 className="font-bold text-white">{ar ? 'خط أنابيب Sanad eKYC' : 'Sanad eKYC Pipeline'}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}25` }}>[Trust]</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { n: '01', label: ar ? 'رقم وطني' : 'National ID', icon: '🪪', color: C.cyan, time: '<1s' },
                  { n: '02', label: ar ? 'مسح الوثيقة' : 'Doc Scan', icon: '📄', color: C.green, time: '<2s' },
                  { n: '03', label: ar ? 'مطابقة الوجه' : 'Face Match', icon: '🤳', color: C.gold, time: '<3s' },
                  { n: '04', label: ar ? 'تأكيد حكومي' : "Gov't Confirm", icon: '✅', color: C.lime, time: '<5s' },
                ].map((step, i) => (
                  <div key={`kyc-step-${step.n}`} className="rounded-xl p-4 text-center"
                    style={{ background: `${step.color}10`, border: `1px solid ${step.color}25` }}>
                    <div className="text-2xl mb-2">{step.icon}</div>
                    <div className="font-black text-xs mb-1" style={{ color: step.color }}>{step.n}</div>
                    <div className="font-bold text-white text-xs mb-1">{step.label}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{step.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9-layer trust */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cyan}12` }}>
              <h3 className="font-bold text-white mb-4">{ar ? 'نظام الثقة — 9 طبقات' : '9-Layer Trust System'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { layer: '01', label: ar ? 'Sanad eKYC' : 'Sanad eKYC', color: C.green },
                  { layer: '02', label: ar ? 'تحقق الهاتف' : 'Phone verify', color: C.cyan },
                  { layer: '03', label: ar ? 'تسجيل السيارة' : 'Car registration', color: C.gold },
                  { layer: '04', label: ar ? 'التأمين' : 'Insurance', color: C.purple },
                  { layer: '05', label: ar ? 'نظام التقييم' : 'Rating system', color: '#F59E0B' },
                  { layer: '06', label: ar ? 'تتبع الرحلة' : 'Trip tracking', color: '#10B981' },
                  { layer: '07', label: ar ? 'SOS طوارئ' : 'SOS emergency', color: C.red },
                  { layer: '08', label: ar ? 'AI مكافحة الغش' : 'Anti-fraud AI', color: C.lime },
                  { layer: '09', label: ar ? 'نزاعات بشرية' : 'Human disputes', color: C.cyan },
                ].map((l, i) => (
                  <div key={`trust-layer-${l.layer}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: `${l.color}08`, border: `1px solid ${l.color}18` }}>
                    <span className="font-black text-xs w-6 shrink-0" style={{ color: l.color }}>{l.layer}</span>
                    <span className="text-sm text-white font-medium">{l.label}</span>
                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: l.color }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default CorridorAIDashboard;