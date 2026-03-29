/**
 * WaselAI — Unified Platform
 * Merges: Core Hub · Ask Wasel AI · Corridor AI Dashboard
 *
 * Architecture:
 *  ┌──────────────────────────────────────────────┐
 *  │  SHARED DATA LAYER (live corridor state)     │
 *  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
 *  │  │ Core Hub │ │ Chat AI  │ │ Corridor AI  │ │
 *  │  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
 *  │       └────────────┼───────────────┘         │
 *  │               Orchestration Layer             │
 *  └──────────────────────────────────────────────┘
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Bot, Send, Package, Car, MapPin, Shield,
  Brain, Zap, TrendingUp, Users, Activity,
  Star, CheckCircle2, ArrowUpRight, ArrowDownRight,
  RefreshCcw, BarChart3, MessageSquare, Cpu,
  Clock, User, Sparkles, ChevronRight,
  AlertTriangle, Wifi, Database, Server,
  Navigation, Heart, Globe, Menu,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { formatCurrency } from '../../utils/currency';
import { WaselBurgerMenu } from '../../components/WaselBurgerMenu';

// ── Brand Tokens ───────────────────────────────────────────────────────────────
const C = {
  bg:      '#040C18',
  surface: '#070F1F',
  card:    '#0A1628',
  card2:   '#0D1E35',
  card3:   '#101F38',
  cyan:    '#00C8E8',
  green:   '#00C875',
  gold:    '#F0A830',
  lime:    '#A8E63D',
  purple:  '#A78BFA',
  red:     '#EF4444',
  pink:    '#EC4899',
  muted:   '#4D6A8A',
  text:    '#CBD5E1',
  border:  'rgba(0,200,232,0.10)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED DATA LAYER — single source of truth used by all three modules
// ═══════════════════════════════════════════════════════════════════════════════

interface CorridorState {
  id: string;
  from: string; to: string;
  demand: number; capacity: number;
  packages: number; revenue: number;
  trend: string; trendUp: boolean;
  color: string; emoji: string;
}

const CORRIDORS: CorridorState[] = [
  { id: 'amm-aqb', from: 'AMM', to: 'AQB', demand: 94, capacity: 120, packages: 23, revenue: 2880, trend: '+23%', trendUp: true,  color: C.cyan,   emoji: '🏖️' },
  { id: 'amm-irb', from: 'AMM', to: 'IRB', demand: 87, capacity: 100, packages: 41, revenue: 1740, trend: '+8%',  trendUp: true,  color: C.green,  emoji: '🎓' },
  { id: 'amm-zrq', from: 'AMM', to: 'ZRQ', demand: 76, capacity: 90,  packages: 18, revenue:  912, trend: '+5%',  trendUp: true,  color: C.gold,   emoji: '🏙️' },
  { id: 'amm-ptr', from: 'AMM', to: 'PTR', demand: 62, capacity: 80,  packages: 12, revenue: 1488, trend: '+18%', trendUp: true,  color: C.purple, emoji: '🏛️' },
  { id: 'amm-dsa', from: 'AMM', to: 'DSA', demand: 58, capacity: 75,  packages: 9,  revenue:  870, trend: '-2%',  trendUp: false, color: '#10B981', emoji: '🌊' },
  { id: 'amm-slt', from: 'AMM', to: 'SLT', demand: 45, capacity: 60,  packages: 6,  revenue:  540, trend: '+3%',  trendUp: true,  color: '#F59E0B', emoji: '🏔️' },
];

const WEEKLY_TREND = [
  { day: 'Mon', rides: 42, packages: 18, rev: 756  },
  { day: 'Tue', rides: 38, packages: 14, rev: 684  },
  { day: 'Wed', rides: 55, packages: 22, rev: 990  },
  { day: 'Thu', rides: 61, packages: 29, rev: 1098 },
  { day: 'Fri', rides: 89, packages: 41, rev: 1602 },
  { day: 'Sat', rides: 94, packages: 38, rev: 1692 },
  { day: 'Sun', rides: 73, packages: 30, rev: 1314 },
];

const HOURLY = [
  { h: '4am', v: 12 }, { h: '6am', v: 34 }, { h: '7am', v: 78 },
  { h: '8am', v: 92 }, { h: '9am', v: 65 }, { h: '12pm', v: 48 },
  { h: '2pm', v: 55 }, { h: '4pm', v: 71 }, { h: '5pm', v: 88 },
  { h: '6pm', v: 95 }, { h: '7pm', v: 82 }, { h: '9pm', v: 41 },
];

const AI_PREDICTIONS = [
  { corridor: 'Amman → Aqaba',  lift: '+34%', confidence: 94, reason: 'Weekend surge + beach season',       icon: '🏖️', color: C.cyan   },
  { corridor: 'Amman → Irbid',  lift: '+18%', confidence: 89, reason: 'University exam period starts',      icon: '🎓', color: C.green  },
  { corridor: 'Amman → Petra',  lift: '+52%', confidence: 87, reason: 'Tourism high season',                icon: '🏛️', color: C.purple },
  { corridor: 'Amman → Zarqa',  lift: '+8%',  confidence: 91, reason: 'Regular daily commuter pattern',     icon: '🏙️', color: C.gold   },
];

const SYSTEM_SERVICES = [
  { id: 'ai-engine',   name: 'AI Engine',       status: 'healthy', latency: '12ms',  icon: Brain,    color: C.purple },
  { id: 'corridor',    name: 'Corridor Oracle',  status: 'healthy', latency: '28ms',  icon: Navigation,color: C.cyan  },
  { id: 'matching',    name: 'Match Engine',     status: 'healthy', latency: '45ms',  icon: Zap,      color: C.green  },
  { id: 'trust',       name: 'Sanad Trust',      status: 'healthy', latency: '18ms',  icon: Shield,   color: C.lime   },
  { id: 'payments',    name: 'Payment Gateway',  status: 'healthy', latency: '88ms',  icon: Database, color: C.gold   },
  { id: 'realtime',    name: 'Real-time Bus',    status: 'healthy', latency: '6ms',   icon: Wifi,     color: C.cyan   },
  { id: 'gxp',         name: 'GxP Compliance',  status: 'healthy', latency: '22ms',  icon: CheckCircle2, color: C.green },
  { id: 'api-gateway', name: 'API Gateway',      status: 'degraded',latency: '210ms', icon: Server,   color: C.gold   },
];

// ═══════════════════════════════════════════════════════════════════════════════
// AI RESPONSE ENGINE — shared by chat, corridor suggestions, system alerts
// ═══════════════════════════════════════════════════════════════════════════════

interface TripCard { type: 'ride'|'package'|'corridor'; from: string; to: string; price: number; seats?: number; time?: string; driver?: string; rating?: number; emoji: string; color: string; }
interface ChatMessage { id: string; role: 'user'|'assistant'; text: string; cards?: TripCard[]; ts: Date; corridor?: CorridorState; }

function aiRespond(input: string, ar: boolean, corridors: CorridorState[]): { text: string; cards?: TripCard[]; corridor?: CorridorState } {
  const q = input.toLowerCase();

  if (q.includes('package') || q.includes('طرد') || q.includes('send') || q.includes('بعث')) {
    const c = corridors[1]; // AMM→IRB most popular for packages
    return {
      text: ar
        ? `وجدت ${Math.floor(Math.random()*8)+3} مسافرين رايحين ${c.from}→${c.to} اليوم. أرخص توصيل ${formatCurrency(4.5,'JOD')} — تأمين حتى 100 دينار شامل. طلب الممر: ${c.demand}%.`
        : `Found ${Math.floor(Math.random()*8)+3} travelers heading ${c.from}→${c.to} today. Cheapest delivery ${formatCurrency(4.5,'JOD')} — JOD 100 insurance included. Corridor demand: ${c.demand}%.`,
      cards: [
        { type:'package', from:'Amman', to:'Irbid', price:4.5, time:'Today 2:30 PM', driver:'Ahmad K.',  rating:4.9, emoji:'📦', color:C.gold },
        { type:'package', from:'Amman', to:'Irbid', price:5.5, time:'Today 5:00 PM', driver:'Sara M.',   rating:5.0, emoji:'📦', color:C.gold },
      ],
      corridor: c,
    };
  }

  if (q.includes('women') || q.includes('نساء') || q.includes('female')) {
    return {
      text: ar
        ? `رحلات نساء فقط 🚺 — سائقات موثقات بـ Sanad eKYC. وجدت ${Math.floor(Math.random()*5)+2} رحلات. الممر AMM→PTR طلبه عالي الآن (+52%).`
        : `Women-only rides 🚺 — verified female drivers via Sanad eKYC. Found ${Math.floor(Math.random()*5)+2} rides. AMM→PTR corridor is hot right now (+52%).`,
      cards: [
        { type:'ride', from:'Amman', to:'Petra', price:12, seats:2, time:'Tomorrow 9:00 AM', driver:'Fatima Al-Ahmad', rating:5.0, emoji:'🚺', color:C.pink },
        { type:'ride', from:'Amman', to:'Irbid', price:4,  seats:1, time:'Today 3:00 PM',    driver:'Noor Hassan',     rating:4.8, emoji:'🚺', color:C.pink },
      ],
      corridor: corridors[3],
    };
  }

  if (q.includes('prayer') || q.includes('صلاة') || q.includes('mosque') || q.includes('مسجد')) {
    return {
      text: ar
        ? `كل رحلات واصل الطويلة تحسب وقفات الصلاة تلقائياً بـ AI. عمّان → البحر الميت: وقفة 15 دقيقة في مسجد موثق على الطريق. وقت العصر 3:30م، المغرب 5:45م.`
        : `All long-distance Wasel rides auto-calculate prayer stops via AI. Amman → Dead Sea: 15-min stop at a vetted mosque. Asr 3:30 PM, Maghrib 5:45 PM.`,
      cards: [
        { type:'corridor', from:'Amman', to:'Dead Sea', price:5, seats:3, time:'Tomorrow 10:00 AM', driver:'Mohammad K.', rating:4.8, emoji:'🕌', color:C.green },
      ],
    };
  }

  if (q.includes('aqaba') || q.includes('العقبة')) {
    const c = corridors[0];
    const h = Math.floor(Math.random()*3)+7;
    return {
      text: ar
        ? `وجدت ${Math.floor(Math.random()*12)+4} رحلات عمّان→العقبة (330كم، ~4 ساعات). AI يقترح ${h}:00 صباحاً لتجنب الازدحام. الممر يعمل بـ ${c.demand}% طاقة.`
        : `Found ${Math.floor(Math.random()*12)+4} rides Amman→Aqaba (330 km, ~4h). AI suggests ${h}:00 AM to avoid congestion. Corridor at ${c.demand}% capacity.`,
      cards: [
        { type:'ride', from:'Amman', to:'Aqaba', price:8,  seats:3, time:`${h}:00 AM`,     driver:'Ahmad Al-Masri',  rating:4.9, emoji:'🏖️', color:C.cyan },
        { type:'ride', from:'Amman', to:'Aqaba', price:10, seats:2, time:`${h+2}:00 AM`,   driver:'Khalid Nasser',   rating:4.7, emoji:'🏖️', color:C.cyan },
      ],
      corridor: c,
    };
  }

  if (q.includes('irbid') || q.includes('إربد')) {
    const c = corridors[1];
    return {
      text: ar
        ? `عمّان→إربد: أكثر مسار شعبية لطلاب اليرموك. ${Math.floor(Math.random()*20)+10} رحلة اليوم من ${formatCurrency(3,'JOD')}/مقعد. الممر ${c.demand}% مشغول.`
        : `Amman→Irbid: most popular for Yarmouk students. ${Math.floor(Math.random()*20)+10} rides today from ${formatCurrency(3,'JOD')}/seat. Corridor ${c.demand}% utilized.`,
      cards: [
        { type:'ride', from:'Amman', to:'Irbid', price:3, seats:4, time:'Today 7:30 AM', driver:'Mohammad Khalil', rating:4.8, emoji:'🎓', color:C.green },
        { type:'ride', from:'Amman', to:'Irbid', price:4, seats:2, time:'Today 2:00 PM', driver:'Hasan Omar',      rating:4.9, emoji:'🎓', color:C.green },
      ],
      corridor: c,
    };
  }

  if (q.includes('suhoor') || q.includes('سحور') || q.includes('ramadan') || q.includes('رمضان')) {
    return {
      text: ar
        ? `🌙 وضع رمضان فعّال! رحلات السحور 3:00–5:00 صباحاً. خصم 10٪ على كل الرحلات. 6 سائقين متاحين الآن.`
        : `🌙 Ramadan Mode active! Suhoor rides 3:00–5:00 AM. 10% discount on all rides. 6 drivers available now.`,
      cards: [
        { type:'ride', from:'Amman', to:'Zarqa', price:2, seats:3, time:'3:30 AM', driver:'Ali Hassan', rating:4.7, emoji:'🌙', color:C.purple },
      ],
    };
  }

  if (q.includes('zarqa') || q.includes('الزرقا') || q.includes('cheap') || q.includes('أرخص')) {
    const c = corridors[2];
    return {
      text: ar
        ? `عمّان→الزرقا (30كم) من ${formatCurrency(2,'JOD')} فقط! ${Math.floor(Math.random()*15)+8} رحلات اليوم. الممر ${c.trend} هذا الأسبوع.`
        : `Amman→Zarqa (30 km) from just ${formatCurrency(2,'JOD')}! ${Math.floor(Math.random()*15)+8} rides today. Corridor ${c.trend} this week.`,
      cards: [
        { type:'ride', from:'Amman', to:'Zarqa', price:2,   seats:4, time:'Today 8:00 AM', driver:'Basem Al-Ali', rating:4.6, emoji:'🏙️', color:C.gold },
        { type:'ride', from:'Amman', to:'Zarqa', price:2.5, seats:2, time:'Today 9:30 AM', driver:'Tariq M.',     rating:4.8, emoji:'🏙️', color:C.gold },
      ],
      corridor: c,
    };
  }

  if (q.includes('corridor') || q.includes('ممر') || q.includes('analytics') || q.includes('تحليل')) {
    const top = [...CORRIDORS].sort((a,b) => b.demand - a.demand)[0];
    return {
      text: ar
        ? `أعلى طلب الآن: ${top.from}→${top.to} بـ ${top.demand}% طاقة. إجمالي إيراد اليوم ${formatCurrency(8040,'JOD')}. 6 ممرات نشطة، 109 طرود جاري توصيلها.`
        : `Highest demand now: ${top.from}→${top.to} at ${top.demand}% capacity. Today's total revenue ${formatCurrency(8040,'JOD')}. 6 active corridors, 109 packages in transit.`,
      corridor: top,
    };
  }

  return {
    text: ar
      ? `أهلاً! أنا Wasel AI 🤖 — الذكاء المركزي لمنصة واصل. أقدر أساعدك تحجز رحلة، تبعث طرد، أو تشوف تحليلات الممرات. بس قلّي!`
      : `Hello! I'm Wasel AI 🤖 — the central intelligence of the Wasel platform. I can help you book a ride, send a package, or explore corridor analytics. Just ask!`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI ATOMS
// ═══════════════════════════════════════════════════════════════════════════════

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background:`${color}15`, color, border:`1px solid ${color}25` }}>
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'healthy' ? C.green : status === 'degraded' ? C.gold : C.red;
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: color, boxShadow:`0 0 6px ${color}` }} />;
}

function KpiCard({
  label, value, sub, color, icon: Icon, trend, tag,
}: {
  label: string; value: string; sub?: string; color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  trend?: { val: string; up: boolean }; tag?: string;
}) {
  return (
    <motion.div whileHover={{ y:-3, scale:1.01 }} transition={{ type:'spring', stiffness:400, damping:25 }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background:C.card, border:`1px solid ${color}20` }}>
      <div className="absolute inset-0" style={{ background:`radial-gradient(ellipse at 0% 0%, ${color}10 0%, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          {tag && <Badge label={tag} color={color} />}
        </div>
        <div className="font-black text-xl text-white mb-0.5">{value}</div>
        <div className="text-xs font-semibold mb-1" style={{ color:C.muted }}>{label}</div>
        {sub && <div className="text-xs" style={{ color }}>{sub}</div>}
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold mt-1" style={{ color: trend.up ? C.green : C.red }}>
            {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.val}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CorridorPill({ c, onClick, active }: { c: CorridorState; onClick: () => void; active: boolean }) {
  const pct = Math.round((c.demand / c.capacity) * 100);
  return (
    <motion.button whileTap={{ scale:0.97 }} onClick={onClick}
      className="flex items-center justify-between rounded-xl px-3 py-2 w-full text-left transition-all"
      style={{ background: active ? `${c.color}20` : `${c.color}08`, border:`1px solid ${active ? c.color : c.color+'20'}`, outline:'none' }}>
      <div className="flex items-center gap-2">
        <span className="text-base">{c.emoji}</span>
        <div>
          <div className="text-xs font-bold text-white">{c.from}→{c.to}</div>
          <div className="text-xs" style={{ color:C.muted }}>{pct}% cap</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-black" style={{ color:c.color }}>{c.trend}</div>
        <div className="h-1 rounded-full mt-1" style={{ width:36, background:`${c.color}20` }}>
          <div className="h-full rounded-full" style={{ width:`${pct}%`, background:c.color }} />
        </div>
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. OVERVIEW (Core Hub) ───────────────────────────────────────────────────
function OverviewTab({ ar, corridors, onSelectCorridor, onAskAI }: {
  ar: boolean; corridors: CorridorState[];
  onSelectCorridor: (c: CorridorState) => void;
  onAskAI: (q: string) => void;
}) {
  const totalRevenue = corridors.reduce((s,c) => s + c.revenue, 0);
  const totalPackages = corridors.reduce((s,c) => s + c.packages, 0);
  const avgDemand = Math.round(corridors.reduce((s,c) => s + c.demand, 0) / corridors.length);

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label={ar ? 'رحلات اليوم' : 'Rides Today'}       value="94"                         color={C.cyan}   icon={Car}        trend={{ val:'+23%', up:true }}  tag="[Hub]"      sub={ar?'6 ممرات':'6 corridors'} />
        <KpiCard label={ar ? 'طرود نشطة' : 'Active Packages'}     value={String(totalPackages)}       color={C.gold}   icon={Package}    trend={{ val:'+31%', up:true }}  tag="[Awasel]"   sub={ar?'جاري التوصيل':'in transit'} />
        <KpiCard label={ar ? 'إيراد اليوم' : "Today's Revenue"}   value={formatCurrency(totalRevenue,'JOD')} color={C.green}  icon={TrendingUp} trend={{ val:'+18%', up:true }}           sub={ar?'12% عمولة':'12% commission'} />
        <KpiCard label={ar ? 'مستخدمون نشطون' : 'Active Users'}  value="1,243"                       color={C.purple} icon={Users}      trend={{ val:'+8%', up:true }}   tag="[AI]"       sub={ar?'مسافر + راكب':'drivers + pax'} />
      </div>

      {/* Weekly chart + Corridor pills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background:C.card, border:`1px solid ${C.cyan}12` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-black text-white text-sm">{ar ? 'أداء الأسبوع' : 'Weekly Performance'}</div>
              <div className="text-xs" style={{ color:C.muted }}>{ar ? 'رحلات + طرود + إيراد' : 'Rides · Packages · Revenue'}</div>
            </div>
            <Badge label="[Corridor]" color={C.cyan} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEKLY_TREND}>
              <defs>
                <linearGradient id="wasel-ride" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.cyan}  stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.cyan} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="wasel-pkg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.gold}  stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.gold} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:C.card2, border:`1px solid ${C.cyan}20`, borderRadius:12, color:'#E2E8F0', fontSize:11 }} />
              <Area type="monotone" dataKey="rides"    stroke={C.cyan} fill="url(#wasel-ride)" strokeWidth={2} name={ar?'رحلات':'Rides'} />
              <Area type="monotone" dataKey="packages" stroke={C.gold} fill="url(#wasel-pkg)"  strokeWidth={2} name={ar?'طرود':'Packages'} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-4 h-4" style={{ color:C.cyan }} />
            <span className="font-bold text-white text-sm">{ar ? 'الممرات الحية' : 'Live Corridors'}</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:C.green }} />
          </div>
          {corridors.map(c => (
            <CorridorPill key={c.id} c={c} active={false}
              onClick={() => { onSelectCorridor(c); onAskAI(ar ? `معلومات عن ممر ${c.from}→${c.to}` : `corridor ${c.from}→${c.to} analytics`); }} />
          ))}
        </div>
      </div>

      {/* AI Predictions row */}
      <div className="rounded-2xl p-5" style={{ background:C.card, border:`1px solid ${C.purple}15` }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4" style={{ color:C.purple }} />
          <span className="font-bold text-white text-sm">{ar ? 'توقعات AI — 72 ساعة' : 'AI Forecast — Next 72h'}</span>
          <Badge label="[AI]" color={C.purple} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AI_PREDICTIONS.map((p, i) => (
            <motion.button key={`ai-pred-overview-${p.corridor}`} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
              onClick={() => onAskAI(ar ? `توقعات ${p.corridor}` : p.corridor)}
              className="rounded-xl p-3 text-left transition-all" style={{ background:`${p.color}08`, border:`1px solid ${p.color}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{p.icon}</span>
                <span className="font-black text-xl" style={{ color:p.color }}>{p.lift}</span>
              </div>
              <div className="text-xs font-bold text-white mb-1">{p.corridor}</div>
              <div className="text-xs" style={{ color:C.muted }}>{p.reason}</div>
              <div className="mt-2 h-1 rounded-full" style={{ background:`${p.color}15` }}>
                <div className="h-full rounded-full" style={{ width:`${p.confidence}%`, background:p.color }} />
              </div>
              <div className="text-xs mt-1" style={{ color:C.muted }}>{p.confidence}% {ar?'ثقة':'confidence'}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: ar ? 'ابحث عن رحلة' : 'Find a Ride',     emoji:'🚗', color:C.cyan,   q: ar?'أريد رحلة':'I need a ride'        },
          { label: ar ? 'أرسل طرد' : 'Send Package',        emoji:'📦', color:C.gold,   q: ar?'أبعث طرد':'Send a package'         },
          { label: ar ? 'رحلات نساء' : "Women's Rides",     emoji:'🚺', color:C.pink,   q: ar?'نساء فقط':'women only rides'        },
          { label: ar ? 'وضع رمضان' : 'Ramadan Mode',       emoji:'🌙', color:C.purple, q: ar?'رحلات رمضان':'ramadan suhoor rides' },
        ].map((a, i) => (
          <motion.button key={`qa-${i}`} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => onAskAI(a.q)}
            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-3 font-bold text-xs transition-all"
            style={{ background:`${a.color}10`, border:`1px solid ${a.color}25`, color:a.color }}>
            <span className="text-2xl">{a.emoji}</span>
            {a.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── 2. CHAT AI ───────────────────────────────────────────────────────────────
function ChatTab({ ar, corridors, activeCorridor }: { ar: boolean; corridors: CorridorState[]; activeCorridor: CorridorState | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0', role: 'assistant', ts: new Date(),
    text: ar
      ? 'أهلاً! أنا Wasel AI 🤖✨ — الذكاء المركزي لمنصة واصل. أقدر أساعدك تحجز رحلة، تبعث طرد، أو تشوف تحليلات الممرات. كيف أقدر أساعدك؟'
      : "Hi! I'm Wasel AI 🤖✨ — the central intelligence of the Wasel platform. I can help you book a ride, send a package, or explore live corridor analytics. How can I help?",
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [pkgMode, setPkgMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, typing]);

  // Inject corridor context when a corridor is selected from another tab
  useEffect(() => {
    if (!activeCorridor) return;
    const q = ar ? `تحليل ممر ${activeCorridor.from}→${activeCorridor.to}` : `Analyze corridor ${activeCorridor.from}→${activeCorridor.to}`;
    sendMessage(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCorridor]);

  const sendMessage = useCallback(async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');

    const userMsg: ChatMessage = { id: Date.now().toString(), role:'user', text:q, ts:new Date() };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 700 + Math.random()*500));
    if (!mountedRef.current) return;
    setTyping(false);

    const fullQ = pkgMode ? `send package ${q}` : q;
    const { text: replyText, cards, corridor } = aiRespond(fullQ, ar, corridors);
    const aiMsg: ChatMessage = {
      id: (Date.now()+1).toString(), role:'assistant',
      text: replyText, cards, corridor, ts: new Date(),
    };
    if (mountedRef.current) setMessages(m => [...m, aiMsg]);
  }, [input, pkgMode, ar, corridors]);

  const QUICK = ar
    ? ['🚗 رحلة عمّان للعقبة بكرا', '📦 أبعث طرد لإربد', '🚺 رحلات نساء فقط', '🌙 رحلات سحور رمضان', '💰 أرخص رحلة للزرقا', '🕌 رحلات مع وقفات صلاة']
    : ['🚗 Amman to Aqaba tomorrow', '📦 Send package to Irbid', '🚺 Women-only rides', '🌙 Suhoor rides at 3 AM', '💰 Cheapest ride to Zarqa', '🕌 Rides with prayer stops'];

  return (
    <div className="flex flex-col h-full min-h-0" style={{ height:'calc(100vh - 200px)' }}>
      {/* Corridor intel strip */}
      <div className="rounded-xl p-3 mb-3 flex gap-2 overflow-x-auto" style={{ background:C.card2, border:`1px solid ${C.cyan}12` }}>
        <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color:C.gold }} />
        <span className="text-xs font-bold shrink-0" style={{ color:C.gold }}>{ar?'ممرات حية:':'Live:'}</span>
        {corridors.slice(0,4).map(c => (
          <div key={`strip-${c.id}`} className="flex items-center gap-1.5 shrink-0 rounded-lg px-2 py-1"
            style={{ background:`${c.color}10`, border:`1px solid ${c.color}20` }}>
            <span className="text-xs font-bold" style={{ color:c.text }}>{c.from}→{c.to}</span>
            <span className="text-xs font-black" style={{ color:c.color }}>{c.trend}</span>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ minHeight:0 }}>
        {messages.length === 1 && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color:C.muted }}>
              {ar ? '⚡ اقتراحات سريعة' : '⚡ Quick starts'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK.map((q, i) => (
                <motion.button key={`quick-${i}`} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  onClick={() => sendMessage(q)}
                  className="text-left px-3 py-2 rounded-xl text-sm transition-all"
                  style={{ background:C.card2, border:`1px solid ${C.border}`, color:C.text }}>
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <motion.div key={msg.id}
              initial={{ opacity:0, y:10, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              transition={{ type:'spring', stiffness:380, damping:28 }}
              className={`flex gap-2.5 ${isUser ? (ar?'flex-row':'flex-row-reverse') : ''}`}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={isUser
                  ? { background:`${C.cyan}20`, border:`1.5px solid ${C.cyan}30` }
                  : { background:`linear-gradient(135deg, ${C.purple}30, ${C.cyan}20)`, border:`1.5px solid ${C.purple}30` }}>
                {isUser ? <User className="w-3.5 h-3.5" style={{ color:C.cyan }} /> : <Bot className="w-3.5 h-3.5" style={{ color:C.purple }} />}
              </div>
              <div className={`flex-1 max-w-[85%] ${isUser?(ar?'':'flex flex-col items-end'):''}`}>
                <div className={`text-xs font-bold mb-1 ${isUser?(ar?'':'text-right'):''}`}
                  style={{ color: isUser ? C.cyan : C.purple }}>
                  {isUser ? (ar?'أنت':'You') : (ar?'Wasel AI':'Wasel AI')}
                </div>
                <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={isUser
                    ? { background:`${C.cyan}15`, border:`1px solid ${C.cyan}25`, color:'#E2E8F0', borderRadius: ar?'18px 18px 4px 18px':'18px 18px 18px 4px' }
                    : { background:C.card2, border:`1px solid rgba(255,255,255,0.07)`, color:'#E2E8F0', borderRadius: ar?'18px 4px 18px 18px':'4px 18px 18px 18px' }}>
                  {msg.text}
                </div>
                {/* Trip cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="mt-2 space-y-2 w-full">
                    {msg.cards.map((card, i) => (
                      <motion.div key={`card-${msg.id}-${i}`}
                        initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                        whileHover={{ y:-2 }} onClick={() => navigate('/app/find-ride')}
                        className="cursor-pointer rounded-xl px-3.5 py-3 flex items-center gap-3"
                        style={{ background:C.card3, border:`1px solid ${card.color}25` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background:`${card.color}15`, border:`1px solid ${card.color}25` }}>
                          {card.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm">{ar?`${card.to} ← ${card.from}`:`${card.from} → ${card.to}`}</div>
                          <div className="text-xs" style={{ color:C.muted }}>
                            {card.time} · {card.driver} {card.rating && `⭐ ${card.rating}`}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black" style={{ color:card.color }}>{formatCurrency(card.price,'JOD')}</div>
                          <div className="text-xs" style={{ color:C.muted }}>{card.seats ? `${card.seats} ${ar?'مقاعد':'seats'}` : ar?'طرد':'pkg'}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {/* Corridor insight */}
                {msg.corridor && (
                  <div className="mt-2 rounded-xl px-3 py-2 flex items-center gap-2.5"
                    style={{ background:`${msg.corridor.color}08`, border:`1px solid ${msg.corridor.color}20` }}>
                    <Navigation className="w-3 h-3 shrink-0" style={{ color:msg.corridor.color }} />
                    <span className="text-xs font-bold" style={{ color:msg.corridor.color }}>{msg.corridor.from}→{msg.corridor.to}</span>
                    <span className="text-xs" style={{ color:C.muted }}>{Math.round((msg.corridor.demand/msg.corridor.capacity)*100)}% {ar?'طاقة':'cap'} · {msg.corridor.trend}</span>
                  </div>
                )}
                <div className={`text-xs mt-1 ${isUser?(ar?'':'text-right'):''}`} style={{ color:C.muted }}>
                  {msg.ts.toLocaleTimeString(ar?'ar-JO':'en-JO',{hour:'2-digit',minute:'2-digit'})}
                </div>
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`linear-gradient(135deg, ${C.purple}30, ${C.cyan}20)`, border:`1.5px solid ${C.purple}30` }}>
                <Bot className="w-3.5 h-3.5" style={{ color:C.purple }} />
              </div>
              <div className="flex gap-1.5 items-center h-9 px-4 rounded-2xl"
                style={{ background:C.card2, border:`1px solid rgba(255,255,255,0.07)` }}>
                {[0,0.18,0.36].map((delay, i) => (
                  <motion.div key={`dot-${i}`} className="w-1.5 h-1.5 rounded-full"
                    style={{ background:C.purple }}
                    animate={{ scale:[1,1.6,1], opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.9, repeat:Infinity, delay }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Feature pills */}
      <div className="flex gap-2 overflow-x-auto py-2 mt-1">
        {[
          { label: ar?'[مسار] ذكاء الممرات':'[Corridor] Routing', color:C.cyan },
          { label: ar?'[طرود] تتبع حي':'[Package] Tracking',      color:C.gold },
          { label: ar?'[أمان] Sanad eKYC':'[Trust] Sanad eKYC',   color:C.green },
          { label: ar?'[ثقافي] صلاة':'[Cultural] Prayer stops',   color:C.purple },
        ].map((p, i) => (
          <span key={`pill-chat-${i}`} className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background:`${p.color}12`, color:p.color, border:`1px solid ${p.color}25` }}>
            {p.label}
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end mt-1">
        <motion.button whileTap={{ scale:0.95 }} onClick={() => setPkgMode(m => !m)}
          className="p-2.5 rounded-xl transition-all shrink-0"
          style={pkgMode
            ? { background:`${C.gold}20`, border:`1px solid ${C.gold}40`, color:C.gold }
            : { background:`rgba(255,255,255,0.04)`, border:`1px solid ${C.border}`, color:C.muted }}>
          <Package className="w-4 h-4" />
        </motion.button>
        <div className="flex-1 relative">
          <textarea rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={pkgMode
              ? (ar?'صف طردك وأين تريده...':'Describe your package...')
              : (ar?'اسأل واصل AI...':'Ask Wasel AI...')}
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ background:C.card2, border:`1px solid ${pkgMode?C.gold:C.border}`, color:'#E2E8F0', caretColor:C.cyan, lineHeight:'1.4', maxHeight:120 }}
          />
        </div>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="p-2.5 rounded-xl transition-all shrink-0"
          style={{ background:input.trim()?`linear-gradient(135deg, ${C.purple}, ${C.cyan})`:`rgba(255,255,255,0.05)`, color: input.trim()?'#000':'#4D6A8A', cursor:input.trim()?'pointer':'not-allowed' }}>
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

// ── 3. CORRIDOR INTELLIGENCE ─────────────────────────────────────────────────
function CorridorTab({ ar, corridors, onAskAI }: { ar: boolean; corridors: CorridorState[]; onAskAI: (q:string)=>void }) {
  const [selected, setSelected] = useState<CorridorState>(corridors[0]);

  return (
    <div className="space-y-5">
      {/* Demand vs Capacity chart */}
      <div className="rounded-2xl p-5" style={{ background:C.card, border:`1px solid ${C.cyan}12` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-black text-white text-sm">{ar?'الطلب مقابل الطاقة':'Demand vs Capacity'}</div>
            <div className="text-xs" style={{ color:C.muted }}>{ar?'كل الممرات الحية':'All live corridors'}</div>
          </div>
          <Badge label="[DigitalTwin]" color={C.cyan} />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={corridors} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="from" type="category" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} width={55}
              tickFormatter={(v,i) => `${v}→${corridors[i]?.to??''}`} />
            <Tooltip contentStyle={{ background:C.card2, border:`1px solid ${C.cyan}20`, borderRadius:12, color:'#E2E8F0', fontSize:11 }} />
            <Bar dataKey="demand"   name={ar?'الطلب':'Demand'}   radius={[0,6,6,0]}>
              {corridors.map(c => <Cell key={`bar-demand-${c.id}`} fill={c.color} />)}
            </Bar>
            <Bar dataKey="capacity" name={ar?'الطاقة':'Capacity'} fill="rgba(255,255,255,0.07)" radius={[0,6,6,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Corridor detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {corridors.map(c => {
          const pct = Math.round((c.demand/c.capacity)*100);
          const isSelected = selected.id === c.id;
          return (
            <motion.button key={`detail-${c.id}`} whileHover={{ y:-2 }} whileTap={{ scale:0.98 }}
              onClick={() => { setSelected(c); onAskAI(ar ? `تحليل ممر ${c.from}→${c.to}` : `Analyze corridor ${c.from}→${c.to}`); }}
              className="rounded-2xl p-4 text-left transition-all"
              style={{ background:isSelected?`${c.color}15`:C.card2, border:`1px solid ${isSelected?c.color:c.color+'20'}`, outline:'none' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{c.emoji}</span>
                <div>
                  <div className="font-bold text-white text-sm">{c.from}→{c.to}</div>
                  <div className="text-xs" style={{ color:C.muted }}>{pct}% {ar?'طاقة':'capacity'}</div>
                </div>
                <span className={`ml-auto text-xs font-black`} style={{ color:c.trendUp?C.green:C.red }}>{c.trend}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label:ar?'طلب':'Demand',   val:String(c.demand) },
                  { label:ar?'طرود':'Pkgs',     val:String(c.packages) },
                  { label:ar?'إيراد':'Revenue', val:formatCurrency(c.revenue,'JOD') },
                ].map(m => (
                  <div key={`m-${c.id}-${m.label}`} className="text-center rounded-lg py-1.5" style={{ background:'rgba(0,0,0,0.25)' }}>
                    <div className="font-bold text-white text-xs">{m.val}</div>
                    <div className="text-xs" style={{ color:C.muted }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full" style={{ background:c.color }}
                  initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* AI Predictions */}
      <div className="rounded-2xl p-5" style={{ background:C.card, border:`1px solid ${C.purple}15` }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4" style={{ color:C.purple }} />
          <span className="font-bold text-white text-sm">{ar?'توقعات AI — 72 ساعة':'AI Forecast — 72h'}</span>
          <Badge label="[AI][ML]" color={C.purple} />
          <span className="ml-auto text-xs" style={{ color:C.muted }}>{ar?'دقة 91.3%':'91.3% accuracy'}</span>
        </div>
        <div className="space-y-3">
          {AI_PREDICTIONS.map((p, i) => (
            <motion.div key={`ai-corr-${p.corridor}`}
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ background:`${p.color}08`, border:`1px solid ${p.color}18` }}>
              <span className="text-xl shrink-0">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{p.corridor}</div>
                <div className="text-xs" style={{ color:C.muted }}>{p.reason}</div>
                <div className="mt-1.5 h-1 rounded-full" style={{ background:`${p.color}15` }}>
                  <div className="h-full rounded-full" style={{ width:`${p.confidence}%`, background:p.color }} />
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div className="font-black text-xl" style={{ color:p.color }}>{p.lift}</div>
                <div className="text-xs" style={{ color:C.muted }}>{p.confidence}%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hourly demand */}
      <div className="rounded-2xl p-5" style={{ background:C.card, border:`1px solid ${C.green}12` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-black text-white text-sm">{ar?'الطلب بالساعة — اليوم':'Hourly Demand — Today'}</div>
          <Badge label="[AI]" color={C.green} />
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={HOURLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="h" tick={{ fill:C.muted, fontSize:9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.muted, fontSize:9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:C.card2, border:`1px solid ${C.green}20`, borderRadius:12, color:'#E2E8F0', fontSize:11 }} />
            <Bar dataKey="v" radius={[5,5,0,0]} name={ar?'الطلب':'Demand'}>
              {HOURLY.map((d, i) => (
                <Cell key={`hourly-corr-${d.h}-${i}`} fill={d.v>80?C.cyan:d.v>60?C.green:d.v>40?C.gold:'#2D4A6B'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── 4. SYSTEM HEALTH (Core Hub Orchestration) ────────────────────────────────
function SystemTab({ ar }: { ar: boolean }) {
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    if (mountedRef.current) setRefreshing(false);
  }, []);

  const healthy = SYSTEM_SERVICES.filter(s => s.status==='healthy').length;
  const degraded = SYSTEM_SERVICES.filter(s => s.status==='degraded').length;

  return (
    <div className="space-y-5">
      {/* Status overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label={ar?'خدمات نشطة':'Active Services'} value={`${healthy}/${SYSTEM_SERVICES.length}`} color={C.green}  icon={CheckCircle2} sub={ar?'100% جاهزية':'100% uptime'} />
        <KpiCard label={ar?'تحذيرات':'Warnings'}           value={String(degraded)}                          color={C.gold}   icon={AlertTriangle} sub={ar?'يتطلب مراجعة':'requires review'} />
        <KpiCard label={ar?'متوسط تأخير':'Avg Latency'}    value="36ms"                                      color={C.cyan}   icon={Activity}      sub={ar?'تحت الهدف 100ms':'under 100ms SLA'} />
        <KpiCard label={ar?'امتثال GxP':'GxP Compliance'}  value="99.1%"                                     color={C.purple} icon={Shield}        sub={ar?'ALCOA+ فعّال':'ALCOA+ active'} />
      </div>

      {/* Service grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background:C.card, border:`1px solid ${C.cyan}12` }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor:`${C.cyan}12` }}>
          <div>
            <div className="font-black text-white text-sm">{ar?'حالة الخدمات — مباشر':'Service Status — Live'}</div>
            <div className="text-xs" style={{ color:C.muted }}>{ar?'طبقة تنسيق المنصة':'Platform orchestration layer'}</div>
          </div>
          <motion.button whileTap={{ scale:0.95 }} onClick={refresh}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <RefreshCcw className={`w-4 h-4 ${refreshing?'animate-spin':''}`} style={{ color:C.muted }} />
          </motion.button>
        </div>
        <div className="divide-y" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
          {SYSTEM_SERVICES.map((svc, i) => (
            <motion.div key={`svc-${svc.id}`} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
              className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${svc.color}12`, border:`1px solid ${svc.color}20` }}>
                <svc.icon className="w-4 h-4" style={{ color:svc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{svc.name}</div>
                <div className="flex items-center gap-2">
                  <StatusDot status={svc.status} />
                  <span className="text-xs capitalize" style={{ color: svc.status==='healthy'?C.green:svc.status==='degraded'?C.gold:C.red }}>
                    {ar && svc.status==='healthy' ? 'سليم' : ar && svc.status==='degraded' ? 'متدهور' : svc.status}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-black" style={{ color: parseInt(svc.latency)<100?C.green:C.gold }}>{svc.latency}</div>
                <div className="text-xs" style={{ color:C.muted }}>{ar?'تأخير':'latency'}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 9-Layer Trust */}
      <div className="rounded-2xl p-5" style={{ background:C.card, border:`1px solid ${C.green}15` }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4" style={{ color:C.green }} />
          <span className="font-bold text-white text-sm">{ar?'نظام ثقة Sanad — 9 طبقات':'Sanad Trust System — 9 Layers'}</span>
          <Badge label="[Trust]" color={C.green} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { n:'01', label:ar?'Sanad eKYC':'Sanad eKYC',            color:C.green  },
            { n:'02', label:ar?'تحقق الهاتف':'Phone verify',          color:C.cyan   },
            { n:'03', label:ar?'رخصة السيارة':'Car registration',      color:C.gold   },
            { n:'04', label:ar?'التأمين':'Insurance',                  color:C.purple },
            { n:'05', label:ar?'نظام التقييم':'Rating system',         color:'#F59E0B'},
            { n:'06', label:ar?'تتبع الرحلة':'Trip tracking',          color:'#10B981'},
            { n:'07', label:ar?'SOS طوارئ':'SOS emergency',           color:C.red    },
            { n:'08', label:ar?'AI مكافحة الغش':'Anti-fraud AI',       color:C.lime   },
            { n:'09', label:ar?'نزاعات بشرية':'Human disputes',        color:C.cyan   },
          ].map((l, i) => (
            <div key={`trust-${i}`} className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background:`${l.color}08`, border:`1px solid ${l.color}18` }}>
              <span className="font-black text-xs w-5 shrink-0" style={{ color:l.color }}>{l.n}</span>
              <span className="text-sm text-white font-medium">{l.label}</span>
              <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color:l.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* GxP compliance row */}
      <div className="rounded-2xl p-5" style={{ background:`${C.purple}08`, border:`1px solid ${C.purple}20` }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" style={{ color:C.purple }} />
          <span className="font-bold text-white text-sm">{ar?'امتثال IT GxP — ALCOA+':'IT GxP Compliance — ALCOA+'}</span>
          <Badge label="[GxP]" color={C.purple} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {['Attributable','Legible','Contemporaneous','Original','Accurate','Complete','Consistent','Enduring','Available'].map((p,i) => (
            <div key={`alcoa-${i}`} className="rounded-xl py-2 px-3 flex items-center gap-1.5"
              style={{ background:`${C.purple}10`, border:`1px solid ${C.purple}20` }}>
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color:C.purple }} />
              <span className="text-xs font-bold" style={{ color:C.purple }}>{p.slice(0,4)}.</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WASEL AI PLATFORM
// ═══════════════════════════════════════════════════════════════════════════════

type Tab = 'overview' | 'chat' | 'corridor' | 'system';

const TABS = (ar: boolean): { id: Tab; label: string; labelAr: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; badge?: string }[] => [
  { id:'overview',  label:'Overview',      labelAr:'نظرة عامة',        icon:Cpu,           color:C.cyan,   badge:'Hub'      },
  { id:'chat',      label:'Wasel AI',      labelAr:'Wasel AI',         icon:MessageSquare, color:C.purple, badge:'Chat'     },
  { id:'corridor',  label:'Corridor AI',   labelAr:'ذكاء الممرات',     icon:BarChart3,     color:C.green,  badge:'AI'       },
  { id:'system',    label:'System',        labelAr:'صحة النظام',        icon:Server,        color:C.gold,   badge:'Ops'      },
];

export function WaselAI() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCorridor, setActiveCorridor] = useState<CorridorState | null>(null);
  const [chatKey, setChatKey] = useState(0);

  const corridors = useMemo(() => CORRIDORS, []);
  const tabs = useMemo(() => TABS(ar), [ar]);

  const handleAskAI = useCallback((q: string) => {
    setActiveTab('chat');
  }, []);

  const handleSelectCorridor = useCallback((c: CorridorState) => {
    setActiveCorridor(c);
    setChatKey(k => k + 1);
  }, []);

  const unhealthy = SYSTEM_SERVICES.filter(s => s.status !== 'healthy').length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: '#E2E8F0' }} dir={dir}>

      {/* ── BURGER MENU DRAWER ── */}
      <WaselBurgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
      />

      {/* ── HEADER ── */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{ background: `${C.bg}f2`, backdropFilter: 'blur(24px)', borderColor: `${C.cyan}12` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">

          {/* Hamburger */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(true)}
            aria-label={ar ? 'فتح القائمة' : 'Open menu'}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}` }}
          >
            {/* Three-line icon */}
            <span className="flex flex-col gap-[4px]">
              <span className="block w-[18px] h-[2px] rounded-full" style={{ background: C.cyan }} />
              <span className="block w-[13px] h-[2px] rounded-full" style={{ background: C.cyan, opacity: 0.7 }} />
              <span className="block w-[18px] h-[2px] rounded-full" style={{ background: C.cyan }} />
            </span>
          </motion.button>

          {/* Logo constellation */}
          <div className="flex items-center gap-2 shrink-0">
            <svg width="30" height="22" viewBox="0 0 38 28" fill="none">
              <circle cx="6"  cy="22" r="3.5" fill="#F0A830" />
              <circle cx="19" cy="6"  r="3.5" fill="#F0A830" />
              <circle cx="32" cy="22" r="3.5" fill="#F0A830" />
              <line x1="6"  y1="22" x2="19" y2="6"  stroke="#F0A830" strokeWidth="1.5" strokeOpacity=".7" />
              <line x1="19" y1="6"  x2="32" y2="22" stroke="#F0A830" strokeWidth="1.5" strokeOpacity=".7" />
              <line x1="6"  y1="22" x2="32" y2="22" stroke="#F0A830" strokeWidth="1" strokeOpacity=".3" strokeDasharray="3 3" />
            </svg>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-black text-sm" style={{ color: C.cyan }}>Wasel</span>
              <span className="font-black text-sm" style={{ color: C.cyan, fontFamily: 'Cairo, sans-serif' }}>| واصل</span>
            </div>
          </div>

          {/* Live status */}
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
              <span className="text-xs font-semibold hidden sm:block" style={{ color: C.green }}>
                {ar ? 'مباشر' : 'Live'}
              </span>
            </div>
            <Badge label="Hub+AI+Corridor" color={C.purple} />
          </div>

          {/* Corridor pulse chip */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 cursor-default"
            style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}20` }}
          >
            <Globe className="w-3.5 h-3.5" style={{ color: C.cyan }} />
            <span className="text-xs font-bold" style={{ color: C.cyan }}>
              {ar ? `${CORRIDORS[0].demand}% AMM→AQB` : `${CORRIDORS[0].demand}% peak AMM→AQB`}
            </span>
          </motion.div>
        </div>

        {/* ── Tab bar ── */}
        <div className="max-w-7xl mx-auto px-4 flex gap-0.5 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all shrink-0 border-b-2"
                style={active
                  ? { color: tab.color, borderColor: tab.color, background: `${tab.color}0e` }
                  : { color: C.muted, borderColor: 'transparent', background: 'transparent' }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{ar ? tab.labelAr : tab.label}</span>
                <span className="sm:hidden">{tab.badge ?? ''}</span>
                {tab.badge && (
                  <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: `${active ? tab.color : C.muted}18`, color: active ? tab.color : C.muted }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === 'overview' && (
              <OverviewTab ar={ar} corridors={corridors} onSelectCorridor={handleSelectCorridor} onAskAI={handleAskAI} />
            )}
            {activeTab === 'chat' && (
              <ChatTab key={`chat-${chatKey}`} ar={ar} corridors={corridors} activeCorridor={activeCorridor} />
            )}
            {activeTab === 'corridor' && (
              <CorridorTab ar={ar} corridors={corridors} onAskAI={handleAskAI} />
            )}
            {activeTab === 'system' && (
              <SystemTab ar={ar} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Mobile bottom bar ── */}
      <div
        className="md:hidden sticky bottom-0 border-t flex"
        style={{ background: `${C.bg}f5`, backdropFilter: 'blur(20px)', borderColor: `${C.cyan}12` }}
      >
        {/* Burger shortcut */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-2.5"
          style={{ color: C.muted }}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] font-bold">{ar ? 'قائمة' : 'Menu'}</span>
        </button>
        {/* Tab shortcuts */}
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={`mb-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-none transition-colors"
              style={{ color: active ? tab.color : C.muted, background: active ? `${tab.color}10` : 'transparent' }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[10px] font-bold">{ar ? tab.labelAr : tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WaselAI;
