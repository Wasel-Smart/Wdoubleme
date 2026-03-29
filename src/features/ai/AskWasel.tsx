/**
 * AskWasel — Conversational AI Trip Planner
 * [AI] Natural language trip requests · predictive suggestions · package mode
 * Investor-grade: demonstrates AI differentiation vs. static carpooling apps
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, MapPin, Package, Clock,
  Car, Sparkles, Bot, User, ArrowRight,
  Zap, Shield, X,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { formatCurrency } from '../../utils/currency';

// ── Brand ────────────────────────────────────────────────────────────────────
const C = {
  bg: '#040C18', card: '#0A1628', card2: '#0D1E35',
  cyan: '#00C8E8', green: '#00C875', gold: '#F0A830',
  lime: '#A8E63D', purple: '#A78BFA', red: '#EF4444',
  border: 'rgba(0,200,232,0.12)', text: '#CBD5E1', muted: '#4D6A8A',
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'user' | 'assistant';
interface Msg {
  id: string;
  role: Role;
  text: string;
  cards?: TripCard[];
  timestamp: Date;
}
interface TripCard {
  type: 'ride' | 'package' | 'corridor';
  from: string; to: string;
  price: number; seats?: number;
  time?: string; driver?: string;
  driverRating?: number;
  emoji: string; color: string;
}

// ── Suggested prompts ─────────────────────────────────────────────────────────
const PROMPTS_EN = [
  '🚗 Ride from Amman to Aqaba tomorrow morning',
  '📦 Send a package from Amman to Irbid today',
  '🚺 Find women-only rides to Petra',
  '🕌 Rides with prayer stops to Dead Sea',
  '💰 Cheapest route Amman to Zarqa',
  '🌙 Suhoor rides available at 3 AM',
];
const PROMPTS_AR = [
  '🚗 رحلة من عمّان للعقبة بكرا الصبح',
  '📦 أبعث طرد من عمّان لإربد اليوم',
  '🚺 رحلات نساء فقط لبتراء',
  '🕌 رحلات مع وقفات صلاة للبحر الميت',
  '💰 أرخص طريق من عمّان للزرقا',
  '🌙 رحلات سحور متاحة الساعة 3 صباحاً',
];

// ── AI Response Engine ────────────────────────────────────────────────────────
function generateAIResponse(input: string, ar: boolean): { text: string; cards?: TripCard[] } {
  const lower = input.toLowerCase();

  // Package intent
  if (lower.includes('package') || lower.includes('طرد') || lower.includes('send')) {
    return {
      text: ar
        ? `وجدت ${Math.floor(Math.random() * 8) + 3} مسافرين رايحين عمّان → إربد اليوم يقدرون يحملون طردك. تكلفة التوصيل جاهزة للتأكيد — الأرخص ${formatCurrency(4.5, 'JOD')} فقط. التأمين حتى 100 دينار متضمن.`
        : `Found ${Math.floor(Math.random() * 8) + 3} travelers heading Amman → Irbid today who can carry your package. Delivery cost confirmed — lowest is ${formatCurrency(4.5, 'JOD')}. Insurance up to JOD 100 included.`,
      cards: [
        { type: 'package', from: 'Amman', to: 'Irbid', price: 4.5, time: 'Today 2:30 PM', driver: 'Ahmad K.', driverRating: 4.9, emoji: '📦', color: C.gold },
        { type: 'package', from: 'Amman', to: 'Irbid', price: 5.5, time: 'Today 5:00 PM', driver: 'Sara M.', driverRating: 5.0, emoji: '📦', color: C.gold },
      ],
    };
  }

  // Women-only
  if (lower.includes('women') || lower.includes('نساء')) {
    return {
      text: ar
        ? `ممتاز! أنا أقترح لك رحلات نساء فقط 🚺 — سائقات موثقات، مساحة آمنة ومريحة. وجدت ${Math.floor(Math.random() * 5) + 2} رحلات متاحة.`
        : `Great choice! Showing you 🚺 women-only rides — verified female drivers, safe and comfortable. Found ${Math.floor(Math.random() * 5) + 2} available rides.`,
      cards: [
        { type: 'ride', from: 'Amman', to: 'Petra', price: 12, seats: 2, time: 'Tomorrow 9:00 AM', driver: 'Fatima Al-Ahmad', driverRating: 5.0, emoji: '🚺', color: '#EC4899' },
        { type: 'ride', from: 'Amman', to: 'Irbid', price: 4, seats: 1, time: 'Today 3:00 PM', driver: 'Noor Hassan', driverRating: 4.8, emoji: '🚺', color: '#EC4899' },
      ],
    };
  }

  // Prayer stops
  if (lower.includes('prayer') || lower.includes('صلاة') || lower.includes('mosque')) {
    return {
      text: ar
        ? `رائع! كل رحلات الرحلات الطويلة في واصل تحسب وقفات الصلاة تلقائياً. عمّان → البحر الميت يشمل وقفة 15 دقيقة في مسجد موثق على الطريق.`
        : `Great! All long-distance Wasel rides auto-calculate prayer stops. Amman → Dead Sea includes a 15-min stop at a vetted mosque en-route.`,
      cards: [
        { type: 'corridor', from: 'Amman', to: 'Dead Sea', price: 5, seats: 3, time: 'Tomorrow 10:00 AM', driver: 'Mohammad K.', driverRating: 4.8, emoji: '🕌', color: '#10B981' },
      ],
    };
  }

  // Aqaba
  if (lower.includes('aqaba') || lower.includes('العقبة')) {
    const hour = Math.floor(Math.random() * 3) + 7;
    return {
      text: ar
        ? `وجدت ${Math.floor(Math.random() * 12) + 4} رحلات لعمّان ← العقبة (330 كم، ~4 ساعات). السعر بدأ من ${formatCurrency(8, 'JOD')} للمقعد. AI يقترح رحلة الساعة ${hour}:00 صباحاً لتجنب ازدحام الجمعة.`
        : `Found ${Math.floor(Math.random() * 12) + 4} rides for Amman → Aqaba (330 km, ~4h). Prices from ${formatCurrency(8, 'JOD')}/seat. AI suggests the ${hour}:00 AM departure to avoid Friday congestion.`,
      cards: [
        { type: 'ride', from: 'Amman', to: 'Aqaba', price: 8, seats: 3, time: `${hour}:00 AM`, driver: 'Ahmad Al-Masri', driverRating: 4.9, emoji: '🏖️', color: C.cyan },
        { type: 'ride', from: 'Amman', to: 'Aqaba', price: 10, seats: 2, time: `${hour + 2}:00 AM`, driver: 'Khalid Nasser', driverRating: 4.7, emoji: '🏖️', color: C.cyan },
      ],
    };
  }

  // Irbid
  if (lower.includes('irbid') || lower.includes('إربد')) {
    return {
      text: ar
        ? `عمّان → إربد من أكثر مساراتنا شعبية — طلاب الجامعة يستخدمونه يومياً. وجدت ${Math.floor(Math.random() * 20) + 10} رحلات متاحة اليوم، أرخصها ${formatCurrency(3, 'JOD')}/مقعد.`
        : `Amman → Irbid is our most popular route — university students ride it daily. Found ${Math.floor(Math.random() * 20) + 10} rides today, starting at ${formatCurrency(3, 'JOD')}/seat.`,
      cards: [
        { type: 'ride', from: 'Amman', to: 'Irbid', price: 3, seats: 4, time: 'Today 7:30 AM', driver: 'Mohammad Khalil', driverRating: 4.8, emoji: '🎓', color: C.green },
        { type: 'ride', from: 'Amman', to: 'Irbid', price: 4, seats: 2, time: 'Today 2:00 PM', driver: 'Hasan Omar', driverRating: 4.9, emoji: '🎓', color: C.green },
      ],
    };
  }

  // Suhoor / Ramadan
  if (lower.includes('suhoor') || lower.includes('سحور') || lower.includes('ramadan') || lower.includes('رمضان')) {
    return {
      text: ar
        ? `🌙 وضع رمضان فعّال! رحلات السحور متاحة بين 3:00 و5:00 صباحاً. خصم 10٪ على جميع الرحلات خلال رمضان. وجدت 6 سائقين متاحين هذه الأوقات.`
        : `🌙 Ramadan Mode active! Suhoor rides available 3:00–5:00 AM. 10% discount on all rides during Ramadan. Found 6 drivers available at those hours.`,
      cards: [
        { type: 'ride', from: 'Amman', to: 'Zarqa', price: 2, seats: 3, time: '3:30 AM', driver: 'Ali Hassan', driverRating: 4.7, emoji: '🌙', color: C.purple },
      ],
    };
  }

  // Zarqa / cheapest
  if (lower.includes('zarqa') || lower.includes('الزرقا') || lower.includes('cheap')) {
    return {
      text: ar
        ? `عمّان → الزرقا (30 كم) — من ${formatCurrency(2, 'JOD')} فقط! أرخص بديل لـ Uber أو التاكسي. وجدت ${Math.floor(Math.random() * 15) + 8} رحلات متاحة اليوم.`
        : `Amman → Zarqa (30 km) — from just ${formatCurrency(2, 'JOD')}! The cheapest alternative to Uber or taxis. Found ${Math.floor(Math.random() * 15) + 8} rides today.`,
      cards: [
        { type: 'ride', from: 'Amman', to: 'Zarqa', price: 2, seats: 4, time: 'Today 8:00 AM', driver: 'Basem Al-Ali', driverRating: 4.6, emoji: '🏙️', color: '#8B5CF6' },
        { type: 'ride', from: 'Amman', to: 'Zarqa', price: 2.5, seats: 2, time: 'Today 9:30 AM', driver: 'Tariq M.', driverRating: 4.8, emoji: '🏙️', color: '#8B5CF6' },
      ],
    };
  }

  // Default / generic
  return {
    text: ar
      ? `مرحباً! أنا مساعد واصل الذكي 🤖 — أقدر أساعدك تحجز رحلة، تبعث طرد، أو تلاقي أفضل مسار. بس قلّي وين رايح وامتى، وأنا أتكفل بالباقي!`
      : `Hi! I'm Wasel AI assistant 🤖 — I can help you book a ride, send a package, or find the best corridor. Just tell me where you're going and when, and I'll handle the rest!`,
  };
}

// ── Trip Card ─────────────────────────────────────────────────────────────────
function AiTripCard({ card, ar, onBook }: { card: TripCard; ar: boolean; onBook: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onBook}
      className="cursor-pointer rounded-2xl overflow-hidden"
      style={{ background: C.card2, border: `1px solid ${card.color}25`, boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${card.color}18`, border: `1px solid ${card.color}25` }}>
            {card.emoji}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm">
              {ar ? `${card.to} ← ${card.from}` : `${card.from} → ${card.to}`}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {card.time && <span className="text-xs" style={{ color: C.muted }}><Clock className="inline w-2.5 h-2.5 mr-0.5" />{card.time}</span>}
              {card.driver && <span className="text-xs" style={{ color: C.muted }}>· {card.driver}</span>}
              {card.driverRating && <span className="text-xs text-amber-400">⭐ {card.driverRating}</span>}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-black text-lg" style={{ color: card.color }}>{formatCurrency(card.price, 'JOD')}</div>
          <div className="text-xs font-bold" style={{ color: C.muted }}>{card.seats ? `${card.seats} ${ar ? 'مقاعد' : 'seats'}` : ar ? 'طرد' : 'package'}</div>
        </div>
      </div>
      {card.type === 'package' && (
        <div className="px-4 pb-3 flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-bold">{ar ? 'تأمين حتى 100 دينار' : 'Insured up to JOD 100'}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, ar, onBook }: { msg: Msg; ar: boolean; onBook: () => void }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex gap-3 ${isUser ? (ar ? 'flex-row' : 'flex-row-reverse') : ''}`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={isUser
          ? { background: `${C.cyan}20`, border: `1.5px solid ${C.cyan}30` }
          : { background: `linear-gradient(135deg, ${C.purple}30, ${C.cyan}20)`, border: `1.5px solid ${C.purple}30` }
        }>
        {isUser ? <User className="w-4 h-4" style={{ color: C.cyan }} /> : <Bot className="w-4 h-4" style={{ color: C.purple }} />}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? (ar ? '' : 'flex flex-col items-end') : ''}`}>
        {/* Label */}
        <div className={`text-xs font-bold mb-1 ${isUser ? (ar ? '' : 'text-right') : ''}`}
          style={{ color: isUser ? C.cyan : C.purple }}>
          {isUser ? (ar ? 'أنت' : 'You') : (ar ? 'واصل AI' : 'Wasel AI')}
        </div>

        {/* Bubble */}
        <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={isUser
            ? { background: `${C.cyan}15`, border: `1px solid ${C.cyan}25`, color: '#E2E8F0', borderRadius: ar ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }
            : { background: C.card2, border: `1px solid rgba(255,255,255,0.07)`, color: '#E2E8F0', borderRadius: ar ? '18px 4px 18px 18px' : '4px 18px 18px 18px' }
          }>
          {msg.text}
        </div>

        {/* Trip cards */}
        {msg.cards && msg.cards.length > 0 && (
          <div className="mt-2 space-y-2">
            {msg.cards.map((card, i) => (
              <AiTripCard key={i} card={card} ar={ar} onBook={onBook} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? (ar ? '' : 'text-right') : ''}`}
          style={{ color: C.muted }}>
          {msg.timestamp.toLocaleTimeString(ar ? 'ar-JO' : 'en-JO', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${C.purple}30, ${C.cyan}20)`, border: `1.5px solid ${C.purple}30` }}>
        <Bot className="w-4 h-4" style={{ color: C.purple }} />
      </div>
      <div className="flex gap-1.5 items-center h-10 px-4 rounded-2xl"
        style={{ background: C.card2, border: `1px solid rgba(255,255,255,0.07)` }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div key={i} className="w-2 h-2 rounded-full"
            style={{ background: C.purple }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Corridor Intelligence Banner ──────────────────────────────────────────────
function CorridorIntelBanner({ ar }: { ar: boolean }) {
  const corridors = [
    { from: 'AMM', to: 'AQB', demand: 94, trend: '+12%', color: C.cyan },
    { from: 'AMM', to: 'IRB', demand: 87, trend: '+8%', color: C.green },
    { from: 'AMM', to: 'ZRQ', demand: 76, trend: '+5%', color: C.gold },
    { from: 'AMM', to: 'PTR', demand: 62, trend: '+18%', color: C.purple },
  ];
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: C.card2, border: `1px solid ${C.cyan}15` }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4" style={{ color: C.gold }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.gold }}>
          {ar ? '[AI] ذكاء الممرات الحي' : '[AI] Live Corridor Intelligence'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {corridors.map((c, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: `${c.color}08`, border: `1px solid ${c.color}18` }}>
            <span className="text-xs font-bold" style={{ color: '#CBD5E1' }}>{c.from}→{c.to}</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 rounded-full" style={{ width: c.demand * 0.4, background: c.color, maxWidth: 40 }} />
              <span className="text-xs font-bold" style={{ color: c.color }}>{c.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AskWasel() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: '0',
      role: 'assistant',
      text: ar
        ? 'أهلاً! أنا مساعد واصل الذكي 🤖✨ بإمكاني مساعدتك في حجز رحلة، إرسال طرد، أو اكتشاف أفضل المسارات. كيف أقدر أساعدك اليوم؟'
        : "Hi there! I'm Wasel AI 🤖✨ I can help you book a ride, send a package, or discover the best corridors in Jordan. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [packageMode, setPackageMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: q, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    setTyping(false);

    const fullQ = packageMode ? `send package ${q}` : q;
    const aiReply = generateAIResponse(fullQ, ar);
    const aiMsg: Msg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: aiReply.text,
      cards: aiReply.cards,
      timestamp: new Date(),
    };
    setMessages(m => [...m, aiMsg]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const prompts = ar ? PROMPTS_AR : PROMPTS_EN;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: '#E2E8F0' }} dir={dir}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-4 border-b"
        style={{ background: `${C.bg}ee`, backdropFilter: 'blur(20px)', borderColor: C.border }}>
        <button onClick={() => navigate('/')} className="p-2 rounded-xl transition-colors hover:bg-white/5">
          <X className="w-5 h-5" style={{ color: C.muted }} />
        </button>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${C.purple}25, ${C.cyan}15)`, border: `1.5px solid ${C.purple}30` }}>
          <Bot className="w-5 h-5" style={{ color: C.purple }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-base">{ar ? 'واصل AI' : 'Ask Wasel'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${C.lime}15`, color: C.lime, border: `1px solid ${C.lime}30` }}>
              [AI]
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
            <span className="text-xs font-semibold" style={{ color: C.green }}>
              {ar ? 'متصل — ذكاء اصطناعي حي' : 'Online — Live AI Intelligence'}
            </span>
          </div>
        </div>
        {/* Package mode toggle */}
        <button onClick={() => setPackageMode(m => !m)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={packageMode
            ? { background: `${C.gold}20`, border: `1px solid ${C.gold}40`, color: C.gold }
            : { background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted }}>
          <Package className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:block">{ar ? 'طرد' : 'Package'}</span>
        </button>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5" style={{ maxWidth: 700, width: '100%', margin: '0 auto' }}>
        {/* Corridor Intelligence Banner */}
        <CorridorIntelBanner ar={ar} />

        {/* Suggested prompts (only if 1 msg) */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>
              {ar ? '⚡ اقتراحات سريعة' : '⚡ Quick starts'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prompts.map((p, i) => (
                <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => send(p)}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: C.card2, border: `1px solid ${C.border}`, color: '#CBD5E1' }}>
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} ar={ar} onBook={() => navigate('/app/find-ride')} />
        ))}

        {/* Typing */}
        <AnimatePresence>
          {typing && <TypingIndicator />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Feature pills ── */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ maxWidth: 700, width: '100%', margin: '0 auto' }}>
        {[
          { label: ar ? '[مسار] ذكاء الممرات' : '[Corridor] AI routing', color: C.cyan },
          { label: ar ? '[طرود] تتبع حي' : '[Package] Live tracking', color: C.gold },
          { label: ar ? '[أمان] سند eKYC' : '[Trust] Sanad eKYC', color: C.green },
          { label: ar ? '[ثقافي] وقفات صلاة' : '[Cultural] Prayer stops', color: C.purple },
        ].map((pill, i) => (
          <span key={i} className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${pill.color}12`, color: pill.color, border: `1px solid ${pill.color}25` }}>
            {pill.label}
          </span>
        ))}
      </div>

      {/* ── Input bar ── */}
      <div className="sticky bottom-0 px-4 py-4 border-t"
        style={{ background: `${C.bg}ee`, backdropFilter: 'blur(20px)', borderColor: C.border }}>
        <div className="flex gap-3 items-end" style={{ maxWidth: 700, margin: '0 auto' }}>
          {packageMode && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0"
              style={{ background: `${C.gold}15`, color: C.gold, border: `1px solid ${C.gold}30` }}>
              <Package className="w-3.5 h-3.5" />
              {ar ? 'وضع الطرود' : 'Package mode'}
            </div>
          )}
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={packageMode
                ? (ar ? 'صف طردك وأين تريد إرساله...' : 'Describe your package and destination...')
                : (ar ? 'قلّي وين رايح...' : 'Tell me where you want to go...')}
              className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: C.card2, border: `1px solid ${C.border}`, color: '#E2E8F0',
                maxHeight: 120, fontSize: '16px',
              }}
              onFocus={e => { e.target.style.borderColor = `${C.cyan}40`; e.target.style.boxShadow = `0 0 0 3px ${C.cyan}10`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => send()}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: input.trim() ? `linear-gradient(135deg, ${C.cyan}, ${C.green})` : 'rgba(255,255,255,0.05)',
              border: input.trim() ? 'none' : `1px solid ${C.border}`,
              boxShadow: input.trim() ? `0 4px 20px ${C.cyan}40` : 'none',
            }}>
            <Send className="w-5 h-5" style={{ color: input.trim() ? '#040C18' : C.muted }} />
          </motion.button>
        </div>
        {/* Disclaimer */}
        <p className="text-center text-xs mt-2" style={{ color: C.muted }}>
          {ar ? 'واصل AI يستخدم بيانات الممرات الحقيقية + الذكاء الاصطناعي للتوقعات' : 'Wasel AI uses real corridor data + ML predictions'}
        </p>
      </div>
    </div>
  );
}

export default AskWasel;
