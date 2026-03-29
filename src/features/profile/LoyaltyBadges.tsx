/**
 * LoyaltyBadges — Wasel | واصل
 *
 * Traveler loyalty & badge system — BlaBlaCar's key differentiator.
 * Earned badges build trust, drive re-engagement, and surface in TrustScore.
 *
 * Badge Categories:
 *   🚗 Trip milestones  — TripCount 5/10/25/50/100
 *   🌱 Eco             — CO₂ saved milestones
 *   🤝 Ambassador      — Referrals sent/converted
 *   ✅ Verified        — ID / phone / student confirmed
 *   🕌 Cultural        — Prayer stop veteran, Ramadan rider
 *   📦 Awasel          — Package delivery milestones
 *   ⭐ Rating          — Maintained 4.9+ over 10+ trips
 *   🏆 Sanad           — Full Sanad Trust verification
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car, Leaf, Users, ShieldCheck, Moon, Package,
  Star, Award, Lock, CheckCircle2, TrendingUp,
  ChevronRight, Sparkles, RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

// ─── Icon map: category → lucide icon ────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  trips:       Car,
  eco:         Leaf,
  ambassador:  Users,
  verified:    ShieldCheck,
  cultural:    Moon,
  awasel:      Package,
  rating:      Star,
  sanad:       Award,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface Badge {
  id: string;
  icon: React.ComponentType<any>;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  tier: BadgeTier;
  category: string;
  threshold: number;
  unit: string;
  rewardEn: string;
  rewardAr: string;
}

interface EarnedBadge {
  badge: Badge;
  earned: boolean;
  progress: number; // 0-100
  currentValue: number;
  earnedAt?: string;
}

// ─── Badge Definitions ────────────────────────────────────────────────────────

const BADGES: Badge[] = [
  // Trip milestones
  {
    id: 'trips-5',
    icon: Car,
    titleEn: 'First Five',
    titleAr: 'الخمسة الأولى',
    descEn: 'Complete 5 carpool trips',
    descAr: 'أكمل 5 رحلات مشاركة',
    tier: 'bronze',
    category: 'trips',
    threshold: 5,
    unit: 'trips',
    rewardEn: '5% off next booking',
    rewardAr: '5% خصم على الحجز التالي',
  },
  {
    id: 'trips-25',
    icon: Car,
    titleEn: 'Road Regular',
    titleAr: 'المسافر المنتظم',
    descEn: 'Complete 25 carpool trips',
    descAr: 'أكمل 25 رحلة مشاركة',
    tier: 'silver',
    category: 'trips',
    threshold: 25,
    unit: 'trips',
    rewardEn: '8% off + priority booking',
    rewardAr: '8% خصم + أولوية الحجز',
  },
  {
    id: 'trips-50',
    icon: Car,
    titleEn: 'Highway Hero',
    titleAr: 'بطل الطريق',
    descEn: 'Complete 50 carpool trips',
    descAr: 'أكمل 50 رحلة مشاركة',
    tier: 'gold',
    category: 'trips',
    threshold: 50,
    unit: 'trips',
    rewardEn: '12% off all rides + Wasel Plus free month',
    rewardAr: '12% خصم + شهر واصل بلس مجاناً',
  },
  {
    id: 'trips-100',
    icon: Award,
    titleEn: 'Wasel Legend',
    titleAr: 'أسطورة واصل',
    descEn: 'Complete 100 carpool trips',
    descAr: 'أكمل 100 رحلة مشاركة',
    tier: 'platinum',
    category: 'trips',
    threshold: 100,
    unit: 'trips',
    rewardEn: 'Permanent 15% off + VIP support',
    rewardAr: '15% خصم دائم + دعم VIP',
  },
  // Eco
  {
    id: 'eco-50',
    icon: Leaf,
    titleEn: 'Green Traveler',
    titleAr: 'المسافر الأخضر',
    descEn: 'Save 50 kg of CO₂',
    descAr: 'وفّر 50 كغ من ثاني أكسيد الكربون',
    tier: 'bronze',
    category: 'eco',
    threshold: 50,
    unit: 'kg CO₂',
    rewardEn: 'Eco badge on profile',
    rewardAr: 'شارة بيئية على الملف الشخصي',
  },
  {
    id: 'eco-200',
    icon: Leaf,
    titleEn: 'Climate Champion',
    titleAr: 'بطل المناخ',
    descEn: 'Save 200 kg of CO₂',
    descAr: 'وفّر 200 كغ من ثاني أكسيد الكربون',
    tier: 'gold',
    category: 'eco',
    threshold: 200,
    unit: 'kg CO₂',
    rewardEn: 'Featured in Wasel Green Wall',
    rewardAr: 'ظهور في الجدار الأخضر لواصل',
  },
  // Ambassador
  {
    id: 'ambassador-3',
    icon: Users,
    titleEn: 'Connector',
    titleAr: 'الواصل',
    descEn: 'Refer 3 active users',
    descAr: 'أحضر 3 مستخدمين نشطين',
    tier: 'bronze',
    category: 'ambassador',
    threshold: 3,
    unit: 'referrals',
    rewardEn: 'JOD 3 credit per referral',
    rewardAr: '3 دينار رصيد لكل إحالة',
  },
  {
    id: 'ambassador-10',
    icon: Users,
    titleEn: 'Community Builder',
    titleAr: 'بانٍ المجتمع',
    descEn: 'Refer 10 active users',
    descAr: 'أحضر 10 مستخدمين نشطين',
    tier: 'gold',
    category: 'ambassador',
    threshold: 10,
    unit: 'referrals',
    rewardEn: 'JOD 5/referral + Ambassador badge',
    rewardAr: '5 دينار لكل إحالة + شارة سفير',
  },
  // Verified
  {
    id: 'verified-phone',
    icon: ShieldCheck,
    titleEn: 'Phone Verified',
    titleAr: 'رقم موثّق',
    descEn: 'Verify your phone number',
    descAr: 'تحقق من رقم هاتفك',
    tier: 'bronze',
    category: 'verified',
    threshold: 1,
    unit: 'verifications',
    rewardEn: 'Trusted label on profile',
    rewardAr: 'ختم موثوق على الملف الشخصي',
  },
  {
    id: 'sanad-full',
    icon: Award,
    titleEn: 'Sanad Trusted',
    titleAr: 'سند موثوق',
    descEn: 'Complete full Sanad ID verification',
    descAr: 'أكمل التحقق الكامل من الهوية سند',
    tier: 'platinum',
    category: 'verified',
    threshold: 1,
    unit: 'verifications',
    rewardEn: 'Blue Sanad badge + 10% trust bonus',
    rewardAr: 'شارة سند الزرقاء + 10% مكافأة ثقة',
  },
  // Cultural
  {
    id: 'ramadan-rider',
    icon: Moon,
    titleEn: 'Ramadan Rider',
    titleAr: 'مسافر رمضان',
    descEn: 'Complete 5 rides during Ramadan',
    descAr: 'أكمل 5 رحلات خلال رمضان',
    tier: 'gold',
    category: 'cultural',
    threshold: 5,
    unit: 'Ramadan trips',
    rewardEn: 'Special Ramadan frame on profile',
    rewardAr: 'إطار رمضاني خاص على الملف',
  },
  // Packages
  {
    id: 'package-5',
    icon: Package,
    titleEn: 'Parcel Pioneer',
    titleAr: 'رائد الطرود',
    descEn: 'Deliver 5 packages via Awasel',
    descAr: 'سلّم 5 طرود عبر أوصل',
    tier: 'bronze',
    category: 'awasel',
    threshold: 5,
    unit: 'packages',
    rewardEn: 'JOD 1 per extra package',
    rewardAr: '1 دينار مكافأة لكل طرد إضافي',
  },
  // Rating
  {
    id: 'top-rated',
    icon: Star,
    titleEn: 'Top Rated',
    titleAr: 'الأعلى تقييماً',
    descEn: 'Maintain 4.9+ rating over 10 trips',
    descAr: 'احتفظ بتقييم 4.9+ على 10 رحلات',
    tier: 'gold',
    category: 'rating',
    threshold: 4.9,
    unit: '★ rating',
    rewardEn: 'Gold star on profile + priority listing',
    rewardAr: 'نجمة ذهبية + أولوية في القوائم',
  },
];

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<BadgeTier, { color: string; bg: string; glow: string; label: string; labelAr: string }> = {
  bronze:   { color: '#CD7F32', bg: 'rgba(205,127,50,0.12)',  glow: 'rgba(205,127,50,0.25)',  label: 'Bronze',   labelAr: 'برونزي'  },
  silver:   { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', glow: 'rgba(156,163,175,0.25)', label: 'Silver',   labelAr: 'فضي'     },
  gold:     { color: '#F0A830', bg: 'rgba(240,168,48,0.12)',  glow: 'rgba(240,168,48,0.3)',   label: 'Gold',     labelAr: 'ذهبي'    },
  platinum: { color: '#00C8E8', bg: 'rgba(0,200,232,0.12)',   glow: 'rgba(0,200,232,0.35)',   label: 'Platinum', labelAr: 'بلاتيني' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function LoyaltyBadges() {
  const { language } = useLanguage();
  const { user, session } = useAuth();
  const ar = language === 'ar';
  const mountedRef = useRef(true);
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadge | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const token = session?.access_token || publicAnonKey;

  // ── Fetch badge progress from backend ────────────────────────────────────
  const { data: badgeData, isLoading, refetch } = useQuery({
    queryKey: ['badges', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/badges/${user!.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Badge fetch failed: ${res.status}`);
      return res.json();
    },
  });

  // ── Trigger badge check (re-compute + auto-award) ────────────────────────
  const checkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/badges/${user!.id}/check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Badge check failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges', user?.id] });
    },
  });

  // ── Map backend response to EarnedBadge[] ────────────────────────────────
  const earnedBadges: EarnedBadge[] = (badgeData?.badges || BADGES).map((b: any) => ({
    badge: {
      id: b.id,
      icon: ICON_MAP[b.category] || Sparkles,
      titleEn: b.titleEn,
      titleAr: b.titleAr,
      descEn: b.descEn || `Complete ${b.threshold} ${b.unit || b.category}`,
      descAr: b.descAr || `أكمل ${b.threshold} ${b.unit || b.category}`,
      tier: b.tier as BadgeTier,
      category: b.category,
      threshold: b.threshold,
      unit: b.unit || '',
      rewardEn: b.rewardEn || '',
      rewardAr: b.rewardAr || '',
    },
    earned: b.earned || false,
    progress: b.progress || 0,
    currentValue: b.currentValue || 0,
    earnedAt: b.earnedAt,
  }));

  const earnedCount = badgeData?.earnedCount ?? earnedBadges.filter(b => b.earned).length;
  const totalPoints = badgeData?.loyaltyPoints ?? 0;

  const categories = ['all', 'trips', 'eco', 'ambassador', 'verified', 'cultural', 'awasel', 'rating'];
  const catLabels: Record<string, { en: string; ar: string }> = {
    all:        { en: 'All Badges',  ar: 'كل الشارات' },
    trips:      { en: '🚗 Trips',    ar: '🚗 الرحلات' },
    eco:        { en: '🌱 Eco',      ar: '🌱 البيئة'  },
    ambassador: { en: '🤝 Referrals',ar: '🤝 الإحالات'},
    verified:   { en: '✅ Verified', ar: '✅ التحقق'  },
    cultural:   { en: '🕌 Cultural', ar: '🕌 ثقافي'   },
    awasel:     { en: '📦 Awasel',   ar: '📦 أوصل'    },
    rating:     { en: '⭐ Rating',   ar: '⭐ التقييم' },
  };

  const filtered = activeCategory === 'all'
    ? earnedBadges
    : earnedBadges.filter(b => b.badge.category === activeCategory ||
        (activeCategory === 'ambassador' && b.badge.category === 'ambassador'));

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      dir={ar ? 'rtl' : 'ltr'}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(240,168,48,0.12)', border: '1px solid rgba(240,168,48,0.2)' }}
              >
                <Sparkles size={20} style={{ color: '#F0A830' }} />
              </div>
              <div>
                <h1 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>
                  {ar ? 'شاراتي وإنجازاتي' : 'My Badges & Achievements'}
                </h1>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {ar ? 'اكسب الشارات، ابنِ الثقة، احصل على مكافآت' : 'Earn badges, build trust, unlock rewards'}
                </p>
              </div>
            </div>
            {/* Refresh button */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => checkMutation.mutate()}
              disabled={checkMutation.isPending || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                color: 'var(--muted-foreground)', minHeight: 36,
                opacity: checkMutation.isPending ? 0.5 : 1,
              }}
            >
              <RefreshCw size={12} className={checkMutation.isPending ? 'animate-spin' : ''} />
              {ar ? 'تحديث' : 'Sync'}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Bar ──────────────────────────────────��──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: ar ? 'الشارات المكتسبة' : 'Badges Earned',
              value: `${earnedCount}/${BADGES.length}`,
              icon: Award,
              color: '#F0A830',
            },
            {
              label: ar ? 'نقاط الولاء' : 'Loyalty Points',
              value: totalPoints.toString(),
              icon: Star,
              color: '#00C8E8',
            },
            {
              label: ar ? 'مستوى الثقة' : 'Trust Level',
              value: earnedCount >= 8 ? (ar ? 'ذهبي' : 'Gold') : earnedCount >= 4 ? (ar ? 'فضي' : 'Silver') : (ar ? 'برونزي' : 'Bronze'),
              icon: ShieldCheck,
              color: '#00C875',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <stat.icon size={18} className="mx-auto mb-1" style={{ color: stat.color }} />
              <div className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Category Filter ───────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: activeCategory === cat ? 'var(--primary)' : 'var(--card)',
                color: activeCategory === cat ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                border: `1px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                minHeight: 32,
              }}
            >
              {ar ? catLabels[cat].ar : catLabels[cat].en}
            </button>
          ))}
        </div>

        {/* ── Badge Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((eb, i) => {
              const tier = TIER_CONFIG[eb.badge.tier];
              const Icon = eb.badge.icon;
              return (
                <motion.button
                  key={eb.badge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedBadge(eb)}
                  className="relative rounded-2xl p-4 text-center flex flex-col items-center gap-2"
                  style={{
                    background: eb.earned ? tier.bg : 'var(--card)',
                    border: `1px solid ${eb.earned ? tier.color + '30' : 'var(--border)'}`,
                    boxShadow: eb.earned ? `0 4px 20px ${tier.glow}` : 'none',
                    opacity: eb.earned ? 1 : 0.65,
                  }}
                >
                  {/* Earned indicator */}
                  {eb.earned && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 size={12} style={{ color: tier.color }} />
                    </div>
                  )}
                  {!eb.earned && (
                    <div className="absolute top-2 right-2">
                      <Lock size={11} style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: eb.earned ? tier.color + '20' : 'var(--muted)',
                      border: `1px solid ${eb.earned ? tier.color + '30' : 'var(--border)'}`,
                      boxShadow: eb.earned ? `0 0 16px ${tier.glow}` : 'none',
                    }}
                  >
                    <Icon
                      size={22}
                      style={{ color: eb.earned ? tier.color : 'var(--muted-foreground)' }}
                    />
                  </div>

                  {/* Title */}
                  <div className="text-xs font-bold leading-tight" style={{ color: eb.earned ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                    {ar ? eb.badge.titleAr : eb.badge.titleEn}
                  </div>

                  {/* Tier pill */}
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: tier.bg, color: tier.color }}
                  >
                    {ar ? tier.labelAr : tier.label}
                  </span>

                  {/* Progress bar */}
                  {!eb.earned && (
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: tier.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${eb.progress}%` }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                      />
                    </div>
                  )}
                  {!eb.earned && (
                    <div className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                      {eb.currentValue}/{eb.badge.threshold} {eb.badge.unit}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Progress summary ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-2xl p-4"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: '#00C8E8' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                {ar ? 'مسار نمو الثقة' : 'Trust Growth Track'}
              </span>
            </div>
            <span className="text-[10px] font-bold" style={{ color: '#00C8E8' }}>
              {Math.round((earnedCount / BADGES.length) * 100)}% {ar ? 'مكتمل' : 'complete'}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00C8E8, #F0A830)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / BADGES.length) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {ar
              ? `${BADGES.length - earnedCount} شارات متبقية لتحقيق المستوى البلاتيني`
              : `${BADGES.length - earnedCount} badges remaining to reach Platinum level`}
          </p>
        </motion.div>
      </div>

      {/* ── Badge Detail Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ y: 60, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 60, scale: 0.95 }}
              className="rounded-3xl p-6 w-full max-w-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const tier = TIER_CONFIG[selectedBadge.badge.tier];
                const Icon = selectedBadge.badge.icon;
                return (
                  <>
                    <div className="flex flex-col items-center text-center gap-3 mb-4">
                      <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center"
                        style={{
                          background: tier.bg,
                          border: `2px solid ${tier.color}40`,
                          boxShadow: `0 0 32px ${tier.glow}`,
                        }}
                      >
                        <Icon size={36} style={{ color: tier.color }} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black" style={{ color: 'var(--foreground)' }}>
                          {ar ? selectedBadge.badge.titleAr : selectedBadge.badge.titleEn}
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          {ar ? selectedBadge.badge.descAr : selectedBadge.badge.descEn}
                        </p>
                      </div>
                      {selectedBadge.earned ? (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: 'rgba(0,200,117,0.1)', color: '#00C875' }}
                        >
                          <CheckCircle2 size={12} />
                          {ar ? 'مكتسبة ✓' : 'Earned ✓'}
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--muted-foreground)' }}>
                            <span>{selectedBadge.currentValue}/{selectedBadge.badge.threshold} {selectedBadge.badge.unit}</span>
                            <span>{Math.round(selectedBadge.progress)}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${selectedBadge.progress}%`, background: tier.color }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className="rounded-2xl p-3 flex items-center gap-3"
                      style={{ background: tier.bg, border: `1px solid ${tier.color}20` }}
                    >
                      <Sparkles size={14} style={{ color: tier.color }} />
                      <div>
                        <div className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                          {ar ? 'المكافأة' : 'Reward'}
                        </div>
                        <div className="text-xs font-bold" style={{ color: tier.color }}>
                          {ar ? selectedBadge.badge.rewardAr : selectedBadge.badge.rewardEn}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBadge(null)}
                      className="w-full mt-3 py-2.5 rounded-2xl text-sm font-bold transition-all"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', minHeight: 44 }}
                    >
                      {ar ? 'إغلاق' : 'Close'}
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}