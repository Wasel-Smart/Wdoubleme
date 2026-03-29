/**
 * CommunityTrust — /features/cultural/CommunityTrust.tsx
 *
 * CQ Pillar III: Trust & Safety Design Logic
 * - Visible verification systems with transparency
 * - Safety-first UX with easy access to support
 * - Emergency visibility logic (SOS)
 * - WhatsApp trip sharing to family
 * - Two-way accountability (ratings both ways)
 * - Graceful fallback messaging (no technical errors exposed)
 *
 * ✅ Bilingual (Jordanian Arabic + English) | ✅ RTL | ✅ Dark-first | ✅ Relative imports
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Star, CheckCircle2, AlertCircle, Phone,
  MessageCircle, Share2, Eye, Lock, Fingerprint,
  BadgeCheck, Heart, Users, ChevronRight, UserCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrustProfile {
  name: string;
  nameAr: string;
  role: 'traveler' | 'passenger';
  rating: number;
  trips: number;
  verified: boolean;
  idVerified: boolean;
  phoneVerified: boolean;
  responseRate: number;
  memberSince: string;
  badges: string[];
}

// ─── Mock data (replace with real API data in production) ──────────────────────

const DEMO_PROFILE: TrustProfile = {
  name: 'Ahmad Al-Khatib',
  nameAr: 'أحمد الخطيب',
  role: 'traveler',
  rating: 4.9,
  trips: 128,
  verified: true,
  idVerified: true,
  phoneVerified: true,
  responseRate: 97,
  memberSince: '2024',
  badges: ['top_rated', 'safe_driver', 'on_time'],
};

const BADGE_CONFIG: Record<string, { en: string; ar: string; color: string; emoji: string }> = {
  top_rated:   { en: 'Top Rated',   ar: 'الأعلى تقييماً', color: 'text-amber-400',  emoji: '⭐' },
  safe_driver: { en: 'Safe Driver', ar: 'سائق آمن',         color: 'text-emerald-400', emoji: '🛡️' },
  on_time:     { en: 'On Time',     ar: 'دائماً في الوقت',  color: 'text-blue-400',   emoji: '⏱️' },
  family_verified: { en: 'Family Verified', ar: 'متحقق عائلياً', color: 'text-pink-400', emoji: '👨‍👩‍👧' },
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface CommunityTrustProps {
  profile?: TrustProfile;
  showSOSButton?: boolean;
  tripId?: string;
}

export function CommunityTrust({
  profile = DEMO_PROFILE,
  showSOSButton = true,
  tripId,
}: CommunityTrustProps) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [sosPressed, setSosPressed] = useState(false);
  const [sharePressed, setSharePressed] = useState(false);

  const handleSOS = () => {
    setSosPressed(true);
    // In production: trigger emergency alert to platform + family
    toast.error(
      ar ? '🔴 تم إرسال طلب الطوارئ — فريق الأمان يتصل بك الآن' : '🔴 Emergency sent — safety team is calling you now',
      { duration: 8000 }
    );
    // Open phone dialer for Jordan emergency
    setTimeout(() => window.open('tel:911'), 500);
  };

  const handleWhatsAppShare = () => {
    setSharePressed(true);
    const msg = ar
      ? `أنا في رحلة مع واصل 🚗\nالمسافر: ${profile.nameAr}\nرقم الرحلة: ${tripId || '#WS-2026'}\nتابع موقعي: https://wasel.app/track/${tripId || 'demo'}`
      : `I'm on a Wasel carpool trip 🚗\nTraveler: ${profile.name}\nTrip ID: ${tripId || '#WS-2026'}\nTrack me: https://wasel.app/track/${tripId || 'demo'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success(ar ? 'تم فتح واتساب لمشاركة موقعك مع عائلتك 💚' : 'WhatsApp opened — share your location with family 💚');
  };

  const t = {
    trustScore:     ar ? 'نقاط الثقة'                 : 'Trust Score',
    verified:       ar ? 'هوية موثقة'                  : 'Verified Identity',
    phoneVerified:  ar ? 'رقم موثق'                    : 'Phone Verified',
    idVerified:     ar ? 'هوية وطنية موثقة'             : 'National ID Verified',
    rating:         ar ? 'التقييم'                     : 'Rating',
    trips:          ar ? 'رحلة مكتملة'                 : 'Completed Trips',
    responseRate:   ar ? 'معدل الاستجابة'               : 'Response Rate',
    memberSince:    ar ? `عضو منذ ${profile.memberSince}` : `Member since ${profile.memberSince}`,
    safetyTitle:    ar ? 'أدوات الأمان'                : 'Safety Tools',
    shareTrip:      ar ? 'شارك رحلتك مع العائلة'        : 'Share Trip with Family',
    shareDesc:      ar ? 'أرسل رابط التتبع لعائلتك عبر واتساب' : 'Send live tracking link to family via WhatsApp',
    sosTitle:       ar ? 'زر الطوارئ'                  : 'Emergency SOS',
    sosDesc:        ar ? 'اضغط للوصول الفوري لفريق الأمان والشرطة' : 'Instant access to safety team and police',
    cancelPolicy:   ar ? 'سياسة الإلغاء واضحة'          : 'Clear cancellation policy',
    cancelDesc:     ar ? 'الغِ مجاناً حتى ٢٤ ساعة قبل الرحلة' : 'Cancel free up to 24 hours before departure',
    communityTitle: ar ? 'قيم المجتمع'                 : 'Community Values',
    respectMsg:     ar ? '🤝 الاحترام المتبادل بين المسافرين' : '🤝 Mutual respect among travelers',
    dignityMsg:     ar ? '👑 الكرامة في كل رحلة'         : '👑 Dignity in every journey',
    accountMsg:     ar ? '⚖️ المساءلة تحمي الجميع'        : '⚖️ Accountability protects everyone',
    roleLabel:      ar ? (profile.role === 'traveler' ? 'مسافر' : 'راكب') : (profile.role === 'traveler' ? 'Traveler' : 'Passenger'),
  };

  const verificationItems = [
    { label: t.phoneVerified, done: profile.phoneVerified, icon: '📱' },
    { label: t.idVerified,    done: profile.idVerified,    icon: '🪪' },
  ];

  return (
    <div
      className="space-y-4"
      dir={ar ? 'rtl' : 'ltr'}
    >
      {/* ── Trust Profile Card ───────────────────────────────────────────── */}
      <Card
        className="overflow-hidden"
        style={{ background: '#111B2E', border: '1px solid rgba(30,41,59,0.9)' }}
      >
        {/* Header */}
        <div
          className="p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(4,173,191,0.08), rgba(9,115,46,0.06))',
            borderBottom: '1px solid rgba(30,41,59,0.7)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(4,173,191,0.3), rgba(9,115,46,0.25))',
                border: '2px solid rgba(4,173,191,0.4)',
              }}
            >
              {(ar ? profile.nameAr : profile.name).charAt(0)}
              {profile.verified && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#04ADBF' }}
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-bold text-white text-sm" style={{ fontWeight: 700 }}>
                  {ar ? profile.nameAr : profile.name}
                </p>
                <Badge
                  className="text-[10px]"
                  style={{
                    background: 'rgba(4,173,191,0.12)',
                    border: '1px solid rgba(4,173,191,0.25)',
                    color: '#04ADBF',
                    padding: '1px 6px',
                  }}
                >
                  {t.roleLabel}
                </Badge>
              </div>
              <p className="text-xs" style={{ color: 'rgba(100,116,139,1)', fontSize: '0.7rem' }}>
                {t.memberSince}
              </p>
            </div>

            {/* Rating */}
            <div className="text-center flex-shrink-0">
              <div className="flex items-center gap-1 justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-black text-amber-400" style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                  {profile.rating}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(100,116,139,1)', fontSize: '0.65rem' }}>
                {profile.trips} {t.trips}
              </p>
            </div>
          </div>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.badges.map(badge => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span
                    key={badge}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.color}`}
                    style={{
                      background: 'var(--wasel-glass-brand)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {cfg.emoji} {ar ? cfg.ar : cfg.en}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Verification Row */}
        <div className="px-4 py-3">
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'rgba(100,116,139,1)' }}
          >
            {t.verified}
          </p>
          <div className="flex gap-3 flex-wrap">
            {verificationItems.map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-sm">{item.icon}</span>
                <CheckCircle2
                  className="w-3.5 h-3.5"
                  style={{ color: item.done ? '#22C55E' : 'rgba(100,116,139,1)' }}
                />
                <span
                  className="text-xs"
                  style={{ color: item.done ? 'rgba(203,213,225,0.9)' : 'rgba(100,116,139,1)', fontSize: '0.72rem' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Response Rate */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(30,41,59,0.8)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.responseRate}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #09732E, #04ADBF)' }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: '#04ADBF', fontSize: '0.72rem' }}>
              {profile.responseRate}% {t.responseRate}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Safety Tools ─────────────────────────────────────────────────── */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(100,116,139,1)' }}
        >
          {t.safetyTitle}
        </p>

        <div className="space-y-3">
          {/* WhatsApp Share */}
          <Card
            className="p-4 cursor-pointer transition-all hover:opacity-90"
            style={{ background: '#111B2E', border: '1px solid rgba(34,197,94,0.2)' }}
            onClick={handleWhatsAppShare}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.12)' }}
              >
                💬
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm" style={{ fontWeight: 700 }}>{t.shareTrip}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,1)', fontSize: '0.7rem' }}>{t.shareDesc}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} />
            </div>
          </Card>

          {/* Cancellation Policy — Formal tone per CQ §II.3 */}
          <Card
            className="p-4"
            style={{ background: '#111B2E', border: '1px solid rgba(30,41,59,0.8)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(4,173,191,0.1)' }}
              >
                <AlertCircle className="w-5 h-5" style={{ color: '#04ADBF' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm" style={{ fontWeight: 700 }}>{t.cancelPolicy}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,1)', fontSize: '0.7rem' }}>{t.cancelDesc}</p>
              </div>
            </div>
          </Card>

          {/* SOS Button */}
          {showSOSButton && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSOS}
              className="w-full rounded-2xl p-4 flex items-center gap-3 transition-all"
              style={{
                background: sosPressed ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${sosPressed ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)' }}
              >
                🆘
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm" style={{ color: '#EF4444', fontWeight: 700 }}>{t.sosTitle}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(239,68,68,0.7)', fontSize: '0.7rem' }}>{t.sosDesc}</p>
              </div>
              <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#EF4444' }} />
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Community Values — Hospitality Microcopy ─────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'var(--wasel-glass-brand)',
          border: '1px solid rgba(217,150,91,0.15)',
        }}
      >
        <p className="font-bold text-white text-sm mb-3" style={{ fontWeight: 700 }}>
          🤝 {t.communityTitle}
        </p>
        <div className="space-y-2">
          {[t.respectMsg, t.dignityMsg, t.accountMsg].map((msg, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D9965B' }} />
              <p className="text-xs" style={{ color: 'rgba(203,213,225,0.85)', fontSize: '0.75rem' }}>
                {msg}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
