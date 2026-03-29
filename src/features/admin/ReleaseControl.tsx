/**
 * ReleaseControl — /features/admin/ReleaseControl.tsx
 * Incremental Release Control Dashboard — SMART-based sprint management
 * Full visibility and control over every feature gate, sprint, and launch milestone
 * ✅ Feature flags | ✅ Sprint tracker | ✅ Launch gates | ✅ KPI live view | ✅ Bilingual
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flag, Zap, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  Play, Pause, ToggleLeft, ToggleRight, Rocket, Shield,
  BarChart3, Users, Package, Moon, MapPin, Car, Star,
  TrendingUp, XCircle, RefreshCw, Settings, Eye, EyeOff,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Switch } from '../../components/ui/switch';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type FeatureStatus = 'live' | 'beta' | 'dev' | 'deprecated' | 'planned';
type SprintStatus  = 'completed' | 'active' | 'upcoming';

interface Feature {
  id: string;
  nameEn: string; nameAr: string;
  category: string;
  status: FeatureStatus;
  enabled: boolean;
  rolloutPct: number;
  route: string;
  smartGoal: string; // Specific / Measurable / Attainable / Relevant / Time-bound
  kpi?: string;
  country?: 'SA' | 'JO' | 'ALL';
}

interface Sprint {
  id: string;
  labelEn: string; labelAr: string;
  weeks: string;
  status: SprintStatus;
  progress: number;
  features: string[];
  completedFeatures: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  // Core Carpooling
  { id: 'search-rides',     nameEn: 'Search Rides',       nameAr: 'البحث عن رحلات',      category: 'Carpooling', status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/find-ride',              smartGoal: '1,000 rides/week by Month 3',       kpi: '1K rides/wk',  country: 'ALL' },
  { id: 'post-ride',        nameEn: 'Post a Ride',        nameAr: 'نشر رحلة',             category: 'Carpooling', status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/post-ride',              smartGoal: '100 travelers post rides/week',     kpi: '100/wk',       country: 'ALL' },
  { id: 'book-ride',        nameEn: 'Book a Seat',        nameAr: 'حجز مقعد',             category: 'Carpooling', status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/carpooling/book',        smartGoal: '80% booking success rate',          kpi: '>80% success', country: 'ALL' },
  { id: 'ride-calendar',    nameEn: 'Ride Calendar',      nameAr: 'تقويم الرحلات',        category: 'Carpooling', status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/carpooling/calendar',   smartGoal: 'Users plan 7+ days ahead',          kpi: '7d horizon',   country: 'ALL' },
  { id: 'cost-calculator',  nameEn: 'Cost Calculator',    nameAr: 'حاسبة التكلفة',        category: 'Carpooling', status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/carpooling/cost-calculator', smartGoal: 'Transparent pricing, 0 disputes', kpi: '<2% disputes', country: 'ALL' },
  // Awasel
  { id: 'send-package',     nameEn: 'Send Package',       nameAr: 'إرسال طرد',            category: 'Awasel',      status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/awasel/send',             smartGoal: '500 packages/week by Month 3',      kpi: '500 pkgs/wk',  country: 'ALL' },
  { id: 'avail-packages',   nameEn: 'Available Packages', nameAr: 'الطرود المتاحة',        category: 'Awasel',      status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/awasel/available-packages', smartGoal: 'Traveler sees 10+ packages on route', kpi: '10+ per route', country: 'ALL' },
  { id: 'qr-scanner',       nameEn: 'QR Verification',    nameAr: 'التحقق بـQR',           category: 'Awasel',      status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/awasel/qr-scanner',      smartGoal: '99% QR scan success rate',          kpi: '99% success',  country: 'ALL' },
  { id: 'insurance-claims', nameEn: 'Insurance Claims',   nameAr: 'مطالبات التأمين',      category: 'Awasel',      status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/awasel/insurance-claims', smartGoal: '48h claim resolution',             kpi: '<48h resolve', country: 'ALL' },
  // Cultural
  { id: 'prayer-stops',     nameEn: 'Prayer Stops',       nameAr: 'وقفات الصلاة',         category: 'Cultural',   status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/cultural/prayer-stops',  smartGoal: 'All intercity rides auto-calculate prayer stops', kpi: '100% coverage', country: 'ALL' },
  { id: 'ramadan-mode',     nameEn: 'Ramadan Mode',       nameAr: 'وضع رمضان',            category: 'Cultural',   status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/cultural/ramadan-mode',  smartGoal: '10% discount applied during Ramadan 2026', kpi: '10% off',     country: 'ALL' },
  { id: 'gender-prefs',     nameEn: 'Gender Preferences', nameAr: 'تفضيلات الجنس',        category: 'Cultural',   status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/cultural/gender-preferences', smartGoal: '60% female users use women-only filter', kpi: '60% adoption', country: 'ALL' },
  { id: 'hijab-privacy',    nameEn: 'Hijab Privacy',      nameAr: 'خصوصية المحجبات',       category: 'Cultural',   status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/cultural/hijab-privacy', smartGoal: '30% of female users enable photo privacy', kpi: '30% opt-in',  country: 'ALL' },
  // Payments
  { id: 'cash-on-arrival',  nameEn: 'Cash on Arrival',    nameAr: 'دفع عند الوصول',       category: 'Payments',   status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/payments/cash-on-arrival', smartGoal: '40% of bookings use COA in Year 1', kpi: '40% COA',     country: 'ALL' },
  // Specialized Services
  { id: 'school-carpool',   nameEn: 'School Carpooling',  nameAr: 'رحلات مدرسية',         category: 'Services',   status: 'beta',   enabled: true,  rolloutPct: 50,  route: '/app/services/school-carpooling', smartGoal: 'JOD 30/child/month subscription, 100 children by Month 6', kpi: '100 children', country: 'ALL' },
  { id: 'hospital-rides',   nameEn: 'Hospital Rides',     nameAr: 'رحلات طبية',           category: 'Services',   status: 'beta',   enabled: true,  rolloutPct: 50,  route: '/app/services/hospital-transport', smartGoal: '50 medical travelers by Month 4', kpi: '50 by M4',    country: 'ALL' },
  { id: 'corporate-pools',  nameEn: 'Corporate Carpools', nameAr: 'كاربول الشركات',       category: 'Services',   status: 'beta',   enabled: true,  rolloutPct: 30,  route: '/app/services/corporate-carpools', smartGoal: '5 B2B contracts by Month 6',    kpi: '5 contracts',  country: 'SA' },
  // KSA Priority
  { id: 'ksa-routes',       nameEn: 'KSA Routes',         nameAr: 'مسارات المملكة',       category: 'Vision 2030',status: 'live',   enabled: true,  rolloutPct: 100, route: '/app/find-ride?country=SA',   smartGoal: 'Riyadh→Jeddah 10+ rides/day by Month 2', kpi: '10/day',       country: 'SA' },
  { id: 'wasel-plus',       nameEn: 'Wasel Plus',         nameAr: 'واصل بلس',             category: 'Premium',    status: 'planned',enabled: false, rolloutPct: 0,   route: '/app/revenue/subscriptions',  smartGoal: 'JOD 9.99/month, 1,000 subscribers Y1', kpi: '1K subs Y1',  country: 'ALL' },
];

const SPRINTS: Sprint[] = [
  {
    id: 'S1', labelEn: 'Sprint 1 — Remove On-Demand', labelAr: 'سبرينت ٢ — إزالة الطلب الفوري',
    weeks: 'Weeks 1–2 (Done)', status: 'completed', progress: 100,
    features: ['post-ride', 'book-ride', 'cost-calculator'],
    completedFeatures: ['post-ride', 'book-ride', 'cost-calculator'],
  },
  {
    id: 'S2', labelEn: 'Sprint 2 — Cultural Features', labelAr: 'سبرينت ٢ — الميزات الثقافية',
    weeks: 'Weeks 3–4 (Done)', status: 'completed', progress: 100,
    features: ['prayer-stops', 'ramadan-mode', 'gender-prefs', 'hijab-privacy'],
    completedFeatures: ['prayer-stops', 'ramadan-mode', 'gender-prefs', 'hijab-privacy'],
  },
  {
    id: 'S3', labelEn: 'Sprint 3 — Awasel Package Delivery', labelAr: 'سبرينت ٣ — أوصل توصيل الطرود',
    weeks: 'Weeks 5–6 (Active)', status: 'active', progress: 75,
    features: ['send-package', 'avail-packages', 'qr-scanner', 'insurance-claims'],
    completedFeatures: ['send-package', 'avail-packages', 'qr-scanner'],
  },
  {
    id: 'S4', labelEn: 'Sprint 4 — Soft Beta Launch', labelAr: 'سبرينت ٤ — إطلاق تجريبي',
    weeks: 'Weeks 7–8 (Upcoming)', status: 'upcoming', progress: 0,
    features: ['school-carpool', 'hospital-rides', 'cash-on-arrival', 'ksa-routes'],
    completedFeatures: [],
  },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { labelEn: 'Features Live',   labelAr: 'مزايا مباشرة',   value: '12', icon: Zap,      color: 'text-primary' },
  { labelEn: 'Beta Features',   labelAr: 'تجريبية',         value: '3',  icon: Star,     color: 'text-amber-400' },
  { labelEn: 'Sprint Progress', labelAr: 'تقدم السبرينت',   value: '75%',icon: TrendingUp,color: 'text-emerald-400' },
  { labelEn: 'Planned',         labelAr: 'مخططة',           value: '2',  icon: Clock,    color: 'text-slate-400' },
];

// ─── Feature Row ─────────────────────────────────────────────────────────────

function FeatureRow({ feature, onToggle }: { feature: Feature; onToggle: (id: string, val: boolean) => void }) {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const statusConfig: Record<FeatureStatus, { label: string; labelAr: string; color: string }> = {
    live:       { label: 'Live',       labelAr: 'مباشر',     color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    beta:       { label: 'Beta',       labelAr: 'تجريبي',    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20'       },
    dev:        { label: 'Dev',        labelAr: 'تطوير',     color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'          },
    deprecated: { label: 'Deprecated', labelAr: 'مُهمَل',   color: 'bg-red-500/15 text-red-400 border-red-500/20'             },
    planned:    { label: 'Planned',    labelAr: 'مخطط',      color: 'bg-slate-700/50 text-slate-400 border-slate-600/50'       },
  };

  const sc = statusConfig[feature.status];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      feature.enabled ? 'bg-card border-border' : 'bg-muted/50 border-border/50 opacity-60'
    }`}>
      <Switch
        checked={feature.enabled}
        onCheckedChange={(v) => onToggle(feature.id, v)}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-white truncate">
            {ar ? feature.nameAr : feature.nameEn}
          </span>
          <Badge className={`${sc.color} text-[9px] flex-shrink-0`}>
            {ar ? sc.labelAr : sc.label}
          </Badge>
          {feature.country && feature.country !== 'ALL' && (
            <span className="text-[9px] text-slate-500">{feature.country === 'SA' ? '🇸🇦' : '🇯🇴'}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Progress value={feature.rolloutPct} className="h-1 flex-1" />
          <span className="text-[10px] text-slate-500 flex-shrink-0">{feature.rolloutPct}%</span>
          {feature.kpi && (
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">
              {feature.kpi}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sprint Card ──────────────────────────────────────────────────────────────

function SprintCard({ sprint }: { sprint: Sprint }) {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const statusConfig: Record<SprintStatus, { icon: any; color: string; bg: string }> = {
    completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-500/20' },
    active:    { icon: Zap,          color: 'text-amber-400',   bg: 'bg-amber-900/20 border-amber-500/20'     },
    upcoming:  { icon: Clock,        color: 'text-slate-500',   bg: 'bg-card border-border'                   },
  };

  const sc = statusConfig[sprint.status];
  const Icon = sc.icon;

  return (
    <Card className={`border p-4 ${sc.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2">
          <Icon className={`w-4 h-4 ${sc.color} flex-shrink-0 mt-0.5`} />
          <div>
            <p className="font-bold text-white text-sm">
              {ar ? sprint.labelAr : sprint.labelEn}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{sprint.weeks}</p>
          </div>
        </div>
        <Badge className={`${sc.bg.includes('emerald') ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : sc.bg.includes('amber') ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'} text-[9px] font-bold flex-shrink-0`}>
          {sprint.status === 'completed' ? (ar ? 'مكتمل' : 'Done') :
           sprint.status === 'active'    ? (ar ? 'نشط' : 'Active') : (ar ? 'قادم' : 'Upcoming')}
        </Badge>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{ar ? 'تقدم السبرينت' : 'Sprint Progress'}</span>
          <span className="font-bold text-white">{sprint.progress}%</span>
        </div>
        <Progress value={sprint.progress} className="h-1.5" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sprint.features.map(fid => {
          const done = sprint.completedFeatures.includes(fid);
          const f = FEATURES.find(x => x.id === fid);
          if (!f) return null;
          return (
            <span
              key={fid}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                done
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-[#1E293B] text-slate-500 border border-[#1E293B]'
              }`}
            >
              {done ? '✓ ' : ''}{ar ? f.nameAr : f.nameEn}
            </span>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReleaseControl() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [features, setFeatures] = useState<Feature[]>(FEATURES);
  const [activeTab, setActiveTab] = useState<'features' | 'sprints' | 'kpis'>('features');
  const [filterCat, setFilterCat] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(FEATURES.map(f => f.category)))];

  const handleToggle = useCallback((id: string, val: boolean) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: val } : f));
    const feature = features.find(f => f.id === id);
    toast.success(val
      ? (ar ? `✅ ${feature?.nameAr} مُفعَّل` : `✅ ${feature?.nameEn} enabled`)
      : (ar ? `⏸ ${feature?.nameAr} مُعطَّل` : `⏸ ${feature?.nameEn} disabled`)
    );
  }, [features, ar]);

  const filteredFeatures = filterCat === 'All' ? features : features.filter(f => f.category === filterCat);

  const liveCount    = features.filter(f => f.status === 'live'    && f.enabled).length;
  const betaCount    = features.filter(f => f.status === 'beta'    && f.enabled).length;
  const plannedCount = features.filter(f => f.status === 'planned'             ).length;
  const disabledCount= features.filter(f => !f.enabled                         ).length;

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">
              {ar ? 'مركز التحكم بالإصدارات' : 'Release Control Center'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {ar ? 'تحكم كامل في كل ميزة — SMART + e-SOSTACT' : 'Full control over every feature — SMART + e-SOSTACT'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-bold">{liveCount} {ar ? 'مباشر' : 'live'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {(['features', 'sprints', 'kpis'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {tab === 'features' ? (ar ? 'المزايا' : 'Features') :
               tab === 'sprints'  ? (ar ? 'السبرينتات' : 'Sprints') :
                                    (ar ? 'مؤشرات الأداء' : 'KPIs')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">

        {/* Summary KPI strip */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: liveCount,    labelEn: 'Live',     labelAr: 'مباشر',   color: 'text-emerald-400' },
            { v: betaCount,    labelEn: 'Beta',     labelAr: 'تجريبي',  color: 'text-amber-400'   },
            { v: plannedCount, labelEn: 'Planned',  labelAr: 'مخطط',    color: 'text-slate-400'   },
            { v: disabledCount,labelEn: 'Off',      labelAr: 'معطل',    color: 'text-red-400'     },
          ].map(s => (
            <div key={s.labelEn} className="bg-card border border-border rounded-xl p-2.5 text-center">
              <p className={`text-lg font-black ${s.color}`}>{s.v}</p>
              <p className="text-[10px] text-slate-600">{ar ? s.labelAr : s.labelEn}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Features Tab */}
          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Category filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      filterCat === cat ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mt-3">
                {filteredFeatures.map(f => (
                  <FeatureRow key={f.id} feature={f} onToggle={handleToggle} />
                ))}
              </div>

              {/* SMART legend */}
              <Card className="bg-card border-border p-4 mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {ar ? 'منهجية SMART' : 'SMART Methodology'}
                </p>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {[
                    { key: 'S', en: 'Specific — clear feature ownership', ar: 'محدد — ملكية واضحة للميزة' },
                    { key: 'M', en: 'Measurable — KPI per feature',        ar: 'قابل للقياس — KPI لكل ميزة' },
                    { key: 'A', en: 'Attainable — rollout % controls',     ar: 'قابل للتحقيق — نسبة الطرح' },
                    { key: 'R', en: 'Relevant — Vision 2030 aligned',      ar: 'ذو صلة — متوافق مع رؤية 2030' },
                    { key: 'T', en: 'Time-Bound — sprint deadlines',       ar: 'محدد بوقت — مواعيد السبرينت' },
                  ].map(s => (
                    <div key={s.key} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center flex-shrink-0">{s.key}</span>
                      <span>{ar ? s.ar : s.en}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Sprints Tab */}
          {activeTab === 'sprints' && (
            <motion.div key="sprints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="font-bold text-white text-sm mb-1">
                  {ar ? 'خطة المشروع — ٤ سبرينتات، ٨ أسابيع' : 'Project Plan — 4 Sprints, 8 Weeks'}
                </p>
                <p className="text-xs text-slate-400">
                  {ar ? 'من تطبيق الطلب الفوري إلى منصة مشاركة الرحلات لمنطقة الشرق الأوسط (BlaBlaCar)'
                       : 'From on-demand ride-hailing → BlaBlaCar for the Middle East'}
                </p>
              </div>
              {SPRINTS.map(s => <SprintCard key={s.id} sprint={s} />)}
            </motion.div>
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <motion.div key="kpis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              <div className="grid grid-cols-2 gap-3">
                {KPI_DATA.map(k => {
                  const Icon = k.icon;
                  return (
                    <Card key={k.labelEn} className="bg-card border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${k.color}`} />
                        <span className="text-xs text-slate-400">{ar ? k.labelAr : k.labelEn}</span>
                      </div>
                      <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                    </Card>
                  );
                })}
              </div>

              {/* SMART KPIs breakdown */}
              <Card className="bg-card border-border p-4">
                <p className="text-sm font-bold text-white mb-3">
                  {ar ? 'مؤشرات الأداء الرئيسية — Wasel الكاربول' : 'Wasel Carpooling — Key KPIs'}
                </p>
                <div className="space-y-3">
                  {[
                    { labelEn: 'Rides available per route (target 10+/week)', labelAr: 'رحلات متاحة (هدف ٠٠+/أسبوع)', value: 8, max: 10, unit: 'rides/wk' },
                    { labelEn: 'Traveler:Passenger ratio (target 1:10)',       labelAr: 'نسبة مسافر:راكب (هدف ٠:٠٠)',   value: 6,  max: 10, unit: ':10' },
                    { labelEn: 'Booking success rate (target 80%+)',           labelAr: 'معدل نجاح الحجز (هدف ٨٠٪+)',   value: 72, max: 100, unit: '%' },
                    { labelEn: 'Active travelers (target 1,000 by M12)',       labelAr: 'مسافرون نشطون (٠٠٠٠ بالشهر ٠٢)', value: 120, max: 1000, unit: '' },
                  ].map(kpi => (
                    <div key={kpi.labelEn}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">{ar ? kpi.labelAr : kpi.labelEn}</span>
                        <span className="text-xs font-bold text-primary">{kpi.value}{kpi.unit}</span>
                      </div>
                      <Progress value={(kpi.value / kpi.max) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* e-SOSTACT */}
              <Card className="bg-gradient-to-br from-[#09732E]/20 to-[#04ADBF]/20 border border-primary/20 p-4">
                <p className="text-sm font-bold text-white mb-3">
                  {ar ? 'إطار e-SOSTACT — السعودية والشرق الأوسط' : 'e-SOSTACT Framework — KSA & MENA'}
                </p>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'E', titleEn: 'Environment',      titleAr: 'البيئة',       descEn: 'Vision 2030 — 2.5B trees, reduce private car use', descAr: 'رؤية 2030 — تقليل استخدام السيارات الخاصة' },
                    { key: 'S', titleEn: 'Social',           titleAr: 'المجتمع',      descEn: 'Gender safety, prayer culture, community trust',    descAr: 'أمان المرأة، الثقافة الدينية، الثقة المجتمعية' },
                    { key: 'O', titleEn: 'Organization',     titleAr: 'المؤسسة',     descEn: 'B2B schools, hospitals, corporates',               descAr: 'شراكات المدارس، المستشفيات، الشركات' },
                    { key: 'S', titleEn: 'Strategy',         titleAr: 'الاستراتيجية',  descEn: 'BlaBlaCar model proven in 22 countries',           descAr: 'نموذج بلابلاكار — ٢٢ دولة مجربة' },
                    { key: 'T', titleEn: 'Technology',       titleAr: 'التكنولوجيا', descEn: 'QR verification, prayer stop AI, KV-backed API',   descAr: 'QR، ذكاء اصطناعي للصلاة، API سريع' },
                    { key: 'A', titleEn: 'Accountability',   titleAr: 'المساءلة',    descEn: 'Insurance, trust scores, dispute resolution',      descAr: 'تأمين، درجات ثقة، حل النزاعات' },
                    { key: 'C', titleEn: 'Culture',          titleAr: 'الثقافة',     descEn: 'Ramadan mode, hijab privacy, Jordanian dialect',   descAr: 'وضع رمضان، خصوصية الحجاب، اللهجة الأردنية' },
                    { key: 'T', titleEn: 'Transformation',   titleAr: 'التحول',      descEn: 'From taxi alternative → travel companion ecosystem',descAr: 'من بديل التاكسي → منظومة رفيق السفر' },
                  ].map(s => (
                    <div key={`${s.key}-${s.titleEn}`} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center flex-shrink-0">{s.key}</span>
                      <div>
                        <span className="font-bold text-white">{ar ? s.titleAr : s.titleEn}: </span>
                        <span className="text-slate-400">{ar ? s.descAr : s.descEn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
