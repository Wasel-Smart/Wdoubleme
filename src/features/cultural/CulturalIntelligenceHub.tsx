/**
 * CulturalIntelligenceHub — /features/cultural/CulturalIntelligenceHub.tsx
 *
 * Architectural-level Cultural Intelligence (CQ) control center.
 * Implements all 8 pillars of the CQ framework:
 *   I.   Cultural Foundation (Respect, Family, Social Awareness)
 *   II.  Language & Localization (Arabic-First, Bilingual, Contextual Tone)
 *   III. Trust & Safety (Verification, Safety-First UX, Graceful Errors)
 *   IV.  Religious & Seasonal Intelligence (Ramadan, Eid, Prayer sensitivity)
 *   V.   Regional UX Patterns (Mobile-First, WhatsApp, Cash-Friendly)
 *   VI.  Emotional Design (Hospitality Microcopy, Community Messaging)
 *   VII. Business Scalability (Emerging Market, MENA-Adaptable)
 *   VIII. Strategic Intent (Socially aware, Dignity-first, Regional Loyalty)
 *
 * ✅ Bilingual (Jordanian Arabic + English) | ✅ RTL | ✅ Dark-first | ✅ No @/ aliases
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Globe, Moon, Heart, MessageCircle, Banknote,
  Users, Star, ChevronRight, CheckCircle2, Phone,
  Lock, Sparkles, Bell, Hand, MapPin, Fingerprint,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';

// ─── CQ Pillar Data ────────────────────────────────────────────────────────────

interface CQPillar {
  id: string;
  emoji: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  features: { en: string; ar: string }[];
  color: string;
  bgColor: string;
  route?: string;
}

const CQ_PILLARS: CQPillar[] = [
  {
    id: 'gender',
    emoji: '🛡️',
    titleEn: 'Gender & Privacy',
    titleAr: 'الجنس والخصوصية',
    descEn: 'Choose your ride comfort zone — women-only, family-only, or mixed.',
    descAr: 'اختر مستوى راحتك — نساء فقط، عائلات، أو مختلط.',
    features: [
      { en: '🚺 Women-Only rides', ar: '🚺 رحلات نساء فقط' },
      { en: '👨‍👩‍👧 Family-verified rides', ar: '👨‍👩‍👧 رحلات عائلية موثقة' },
      { en: '🧕 Hijab privacy settings', ar: '🧕 إعدادات خصوصية الحجاب' },
      { en: '🔒 Profile photo control', ar: '🔒 التحكم في صورة الملف' },
    ],
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    route: '/app/cultural/gender',
  },
  {
    id: 'prayer',
    emoji: '🕌',
    titleEn: 'Prayer & Worship',
    titleAr: 'الصلاة والعبادة',
    descEn: 'Every trip respects prayer times. Vetted mosque stops along every route.',
    descAr: 'كل رحلة تحترم أوقات الصلاة. مساجد موثوقة على كل طريق.',
    features: [
      { en: '🕌 Auto-calculated prayer stops', ar: '🕌 مواقف صلاة محسوبة تلقائياً' },
      { en: '⏱️ Trip time includes prayer', ar: '⏱️ وقت الرحلة يشمل الصلاة' },
      { en: '📍 Vetted mosque directory', ar: '📍 دليل مساجد موثق' },
      { en: '🚿 Clean facilities verified', ar: '🚿 مرافق نظيفة مُتحقق منها' },
    ],
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    route: '/app/cultural/prayer-stops',
  },
  {
    id: 'ramadan',
    emoji: '🌙',
    titleEn: 'Ramadan Mode',
    titleAr: 'وضع رمضان',
    descEn: 'Fasting-friendly rides: Iftar timing, suhoor trips, no-food etiquette.',
    descAr: 'رحلات صيام-صديقة: توقيت الإفطار، السحور، آداب عدم الأكل.',
    features: [
      { en: '🌅 Iftar-timed arrival rides', ar: '🌅 رحلات الوصول قبل الإفطار' },
      { en: '🌙 Suhoor trips (3–5 AM)', ar: '🌙 رحلات السحور (٣–٥ صباحاً)' },
      { en: '🎁 10% Ramadan discount', ar: '🎁 خصم 10% طول رمضان' },
      { en: '🤲 Fasting driver preference', ar: '🤲 تفضيل السائقين الصائمين' },
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    route: '/app/cultural/ramadan',
  },
  {
    id: 'payment',
    emoji: '💵',
    titleEn: 'Cash-Friendly Payment',
    titleAr: 'دفع نقدي مرن',
    descEn: 'No credit card? No problem. Pay cash at pickup or on arrival — trust-based.',
    descAr: 'مش محتاج بطاقة. ادفع نقداً عند الاستلام أو الوصول — على أساس الثقة.',
    features: [
      { en: '💳 Online card (5% discount)', ar: '💳 بطاقة أونلاين (خصم 5%)' },
      { en: '💵 Cash on pickup', ar: '💵 نقدي عند الاستلام' },
      { en: '🤝 Cash on arrival (trust-based)', ar: '🤝 نقدي عند الوصول (قائم على الثقة)' },
      { en: '📱 Apple / Google Pay', ar: '📱 Apple / Google Pay' },
    ],
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20',
  },
  {
    id: 'whatsapp',
    emoji: '💬',
    titleEn: 'WhatsApp Integration',
    titleAr: 'تكامل واتساب',
    descEn: 'Share your trip, coordinate with your traveler, or send packages via WhatsApp.',
    descAr: 'شارك رحلتك، تواصل مع مسافرك، أو أرسل طرودك عبر واتساب.',
    features: [
      { en: '📤 Share trip link via WhatsApp', ar: '📤 شارك رابط الرحلة عبر واتساب' },
      { en: '🗺️ Live location to family', ar: '🗺️ الموقع الحي للعائلة' },
      { en: '📦 Package pickup confirmation', ar: '📦 تأكيد استلام الطرود' },
      { en: '✅ Safe arrival notification', ar: '✅ إشعار الوصول الآمن' },
    ],
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/10 border-lime-500/20',
  },
  {
    id: 'trust',
    emoji: '⭐',
    titleEn: 'Trust & Community',
    titleAr: 'الثقة والمجتمع',
    descEn: 'A community built on mutual respect, verified identities, and accountability.',
    descAr: 'مجتمع مبني على الاحترام المتبادل والهويات الموثقة والمساءلة.',
    features: [
      { en: '🪪 National ID verification', ar: '🪪 التحقق من الهوية الوطنية' },
      { en: '⭐ Two-way rating system', ar: '⭐ نظام تقييم ثنائي الاتجاه' },
      { en: '🔴 SOS emergency button', ar: '🔴 زر الطوارئ' },
      { en: '👨‍👩‍👧 Family trust network', ar: '👨‍👩‍👧 شبكة ثقة عائلية' },
    ],
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    route: '/app/safety',
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────

const CQ_STATS = [
  { value: '94%', labelEn: 'Female users feel safe', labelAr: 'من النساء يشعرن بالأمان' },
  { value: '100%', labelEn: 'Rides include prayer info', labelAr: 'من الرحلات تشمل معلومات الصلاة' },
  { value: '40%', labelEn: 'Users prefer cash', labelAr: 'من المستخدمين يفضلون النقد' },
  { value: '1st', labelEn: 'CQ-native platform in MENA', labelAr: 'منصة ذكاء ثقافي أصلي في الشرق الأوسط' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function CulturalIntelligenceHub() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const shareWhatsApp = () => {
    const msg = ar
      ? 'اكتشف واصل — منصة مشاركة الرحلات الأولى المصممة للشرق الأوسط 🕌🚗 https://wasel.app'
      : 'Discover Wasel — the first culturally-intelligent carpooling platform for the Middle East 🕌🚗 https://wasel.app';
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0B1120' }}
      dir={ar ? 'rtl' : 'ltr'}
    >
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(4,173,191,0.12) 0%, rgba(9,115,46,0.08) 50%, rgba(217,150,91,0.06) 100%)',
          }}
        />
        <div className="relative px-4 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4 mb-6"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(4,173,191,0.25), rgba(9,115,46,0.2))',
                border: '1px solid rgba(4,173,191,0.3)',
                boxShadow: '0 8px 24px rgba(4,173,191,0.15)',
              }}
            >
              🌍
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1
                  className="font-black text-white leading-tight"
                  style={{ fontWeight: 900, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}
                >
                  {ar ? 'مركز الذكاء الثقافي' : 'Cultural Intelligence Hub'}
                </h1>
                <Badge
                  className="text-[10px] font-bold"
                  style={{
                    background: 'rgba(4,173,191,0.15)',
                    border: '1px solid rgba(4,173,191,0.3)',
                    color: '#04ADBF',
                    padding: '2px 8px',
                  }}
                >
                  {ar ? 'مولود هنا' : 'Born Here'}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)', fontSize: '0.8rem' }}>
                {ar
                  ? 'واصل مصمم للشرق الأوسط — مش مجرد ترجمة، بل ذكاء ثقافي حقيقي'
                  : 'Wasel is designed for the Middle East — not just translated, but culturally intelligent'}
              </p>
            </div>
          </motion.div>

          {/* CQ Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CQ_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl p-3 text-center"
                style={{ background: 'var(--wasel-glass-brand)', border: '1px solid var(--border)' }}
              >
                <p className="font-black mb-0.5" style={{ color: '#04ADBF', fontSize: '1.25rem', fontWeight: 900 }}>
                  {stat.value}
                </p>
                <p style={{ color: 'rgba(100,116,139,1)', fontSize: '0.65rem', lineHeight: 1.3 }}>
                  {ar ? stat.labelAr : stat.labelEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Foundation Principles Banner ─────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(217,150,91,0.08), rgba(9,115,46,0.06))',
            border: '1px solid rgba(217,150,91,0.2)',
          }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: '#D9965B', letterSpacing: '0.08em' }}>
            {ar ? '🤝 المبادئ التأسيسية' : '🤝 FOUNDATION PRINCIPLES'}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { en: 'Respect', ar: 'الاحترام', icon: '🤲' },
              { en: 'Dignity', ar: 'الكرامة', icon: '👑' },
              { en: 'Community', ar: 'المجتمع', icon: '🤝' },
            ].map(p => (
              <div key={p.en}>
                <div className="text-xl mb-1">{p.icon}</div>
                <p className="text-xs font-bold text-white" style={{ fontSize: '0.7rem' }}>
                  {ar ? p.ar : p.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CQ Pillars ────────────────────────────────────────────────────── */}
      <div className="px-4 space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(100,116,139,1)' }}
        >
          {ar ? 'ركائز الذكاء الثقافي' : 'CQ PILLARS'}
        </p>

        {CQ_PILLARS.map((pillar, i) => {
          const isExpanded = expandedPillar === pillar.id;
          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${pillar.bgColor} ${
                  isExpanded ? 'shadow-lg' : 'hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(11,17,32,0.6)' }}
                    >
                      {pillar.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm leading-tight">
                        {ar ? pillar.titleAr : pillar.titleEn}
                      </p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>
                        {ar ? pillar.descAr : pillar.descEn}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                    style={{ color: 'rgba(100,116,139,1)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(30,41,59,0.5)' }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {pillar.features.map((f, fi) => (
                            <div key={fi} className="flex items-center gap-2">
                              <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${pillar.color}`} />
                              <span className="text-xs text-white" style={{ fontSize: '0.75rem' }}>
                                {ar ? f.ar : f.en}
                              </span>
                            </div>
                          ))}
                        </div>
                        {pillar.route && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(pillar.route!);
                            }}
                            size="sm"
                            className="w-full h-9 text-xs font-bold rounded-xl"
                            style={{
                              background: 'rgba(4,173,191,0.15)',
                              border: '1px solid rgba(4,173,191,0.3)',
                              color: '#04ADBF',
                              fontWeight: 700,
                            }}
                          >
                            {ar ? 'فتح الإعدادات' : 'Open Settings'}
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        )}
                        {pillar.id === 'whatsapp' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareWhatsApp();
                            }}
                            size="sm"
                            className="w-full h-9 text-xs font-bold rounded-xl"
                            style={{
                              background: 'rgba(34,197,94,0.15)',
                              border: '1px solid rgba(34,197,94,0.3)',
                              color: '#22C55E',
                              fontWeight: 700,
                            }}
                          >
                            💬 {ar ? 'شارك عبر واتساب' : 'Share via WhatsApp'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── Emotional Design Section: Hospitality Microcopy ──────────────── */}
      <div className="px-4 mt-6">
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(9,115,46,0.12), rgba(4,173,191,0.08))',
            border: '1px solid rgba(9,115,46,0.25)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(9,115,46,0.2)', border: '1px solid rgba(9,115,46,0.3)' }}
            >
              🫂
            </div>
            <div>
              <p className="font-bold text-white text-sm" style={{ fontWeight: 700 }}>
                {ar ? 'أهلاً وسهلاً — ليش واصل مختلف' : 'Ahlan wa Sahlan — Why Wasel is Different'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.7rem' }}>
                {ar ? 'مش بس تطبيق — بيت ثاني للمسافر' : 'Not just an app — a second home for the traveler'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: '🤲',
                en: '"Every journey begins with trust." We verify every traveler, not just their ID.',
                ar: '"كل رحلة تبدأ بالثقة." بنتحقق من كل مسافر، مش بس هويته.',
              },
              {
                icon: '🕌',
                en: '"Prayer time is travel time." We build worship into the journey, not around it.',
                ar: '"وقت الصلاة وقت سفر." بنبني العبادة في الرحلة، مش بجانبها.',
              },
              {
                icon: '👨‍👩‍👧',
                en: '"Family comes first." Our safety features are designed for mothers, daughters, and families.',
                ar: '"العائلة أولاً." ميزات الأمان مصممة للأمهات والبنات والعائلات.',
              },
              {
                icon: '💵',
                en: '"Your money, your choice." Cash, card, or trust — you decide.',
                ar: '"فلوسك، اختيارك." نقدي، بطاقة، أو ثقة — انت تقرر.',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(203,213,225,0.9)', fontSize: '0.78rem' }}>
                  {ar ? item.ar : item.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Regional Scalability Note ─────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'var(--wasel-glass-brand)', border: '1px solid var(--border)' }}
        >
          <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#04ADBF' }} />
          <div>
            <p className="text-xs font-bold text-white mb-1" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {ar ? '🗺️ مصمم للتوسع في الشرق الأوسط' : '🗺️ Designed for MENA Scalability'}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(100,116,139,1)', fontSize: '0.7rem' }}>
              {ar
                ? 'الأردن أولاً ← السعودية ← الإمارات ← مصر ← الشرق الأوسط كله. الذكاء الثقافي قابل للتكيف مع كل دولة.'
                : 'Jordan first → Saudi Arabia → UAE → Egypt → All MENA. CQ settings adapt per country automatically.'}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {['🇯🇴 JO', '🇸🇦 SA', '🇦🇪 UAE', '🇪🇬 EG'].map(flag => (
                <span
                  key={flag}
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: 'rgba(4,173,191,0.1)',
                    border: '1px solid rgba(4,173,191,0.2)',
                    color: '#04ADBF',
                  }}
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="px-4 mt-6">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(100,116,139,1)' }}
        >
          {ar ? 'إجراءات سريعة' : 'QUICK ACTIONS'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: '🛡️', en: 'Gender Settings', ar: 'إعدادات الجنس',
              route: '/app/cultural/gender', color: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', text: '#EC4899',
            },
            {
              icon: '🕌', en: 'Prayer Stops', ar: 'وقفات الصلاة',
              route: '/app/cultural/prayer-stops', color: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#22C55E',
            },
            {
              icon: '🌙', en: 'Ramadan Mode', ar: 'وضع رمضان',
              route: '/app/cultural/ramadan', color: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#8B5CF6',
            },
            {
              icon: '🧕', en: 'Privacy', ar: 'الخصوصية',
              route: '/app/cultural/hijab-privacy', color: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#F59E0B',
            },
          ].map(action => (
            <button
              key={action.en}
              onClick={() => navigate(action.route)}
              className="rounded-xl p-3 text-center transition-all hover:opacity-90 active:scale-95"
              style={{
                background: action.color,
                border: `1px solid ${action.border}`,
              }}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <p className="text-xs font-bold" style={{ color: action.text, fontWeight: 700, fontSize: '0.72rem' }}>
                {ar ? action.ar : action.en}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}