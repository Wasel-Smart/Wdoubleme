/**
 * SearchRides — Wasel Carpooling v5.0
 * Premium world-class design · Shimmer skeletons · Glassmorphism · Token-compliant
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, MapPin, Users, Search, Clock, Star,
  ChevronRight, Shield, CheckCircle2, Moon, SlidersHorizontal,
  ArrowRight, Sparkles, Package, Loader2, Car, Filter,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useCountry } from '../../contexts/CountryContext';
import { getRegion } from '../../utils/regionConfig';

// ── Brand constants ────────────────────────────────────────────────────────────
const C = { cyan:'#00C8E8', gold:'#F0A830', green:'#00C875', bg:'#040C18', card:'#0A1628', s3:'#10203A' };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ride {
  id: string;
  driver: { name: string; nameAr: string; rating: number; verified: boolean; trips: number };
  from: string; fromAr: string;
  to: string; toAr: string;
  date: string; time: string;
  seatsAvailable: number; totalSeats: number;
  pricePerSeat: number; distance: number; duration: string;
  genderPreference: 'mixed' | 'women_only' | 'men_only' | 'family_only';
  features: { en: string; ar: string }[];
  prayerStops: boolean;
  isRamadanFriendly?: boolean;
  conversationLevel?: 'quiet' | 'normal' | 'talkative';
}

// ─── Static data ──────────────────────────────────────────────────────────────

const FALLBACK_ROUTES = [
  { from: 'Amman', fromAr: 'عمّان', to: 'Aqaba',    toAr: 'العقبة',      dist: 330, price: 8,  icon: '🏖️', color: '#04ADBF' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Irbid',    toAr: 'إربد',        dist: 85,  price: 3,  icon: '🎓', color: '#09732E' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت', dist: 60,  price: 5,  icon: '🌊', color: '#0EA5E9' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Zarqa',    toAr: 'الزرقا',      dist: 30,  price: 2,  icon: '🏙️', color: '#8B5CF6' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Petra',    toAr: 'البتراء',     dist: 250, price: 12, icon: '🏛️', color: '#D9965B' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Wadi Rum', toAr: 'وادي رم',     dist: 320, price: 15, icon: '⛺', color: '#F59E0B' },
];

const ROUTE_ICONS: Record<string, { icon: string; color: string }> = {
  aqaba: { icon: '🏖️', color: '#04ADBF' }, aqabah: { icon: '🏖️', color: '#04ADBF' },
  irbid: { icon: '🎓', color: '#09732E' },
  'dead sea': { icon: '🌊', color: '#0EA5E9' }, 'البحر الميت': { icon: '🌊', color: '#0EA5E9' },
  zarqa: { icon: '🏙️', color: '#8B5CF6' }, zarqaa: { icon: '🏙️', color: '#8B5CF6' }, الزرقاء: { icon: '🏙️', color: '#8B5CF6' },
  petra: { icon: '🏛️', color: '#D9965B' }, البتراء: { icon: '🏛️', color: '#D9965B' },
  'wadi rum': { icon: '⛺', color: '#F59E0B' }, 'وادي رم': { icon: '⛺', color: '#F59E0B' },
  alexandria: { icon: '🌊', color: '#0EA5E9' }, الإسكندرية: { icon: '🌊', color: '#0EA5E9' },
  'sharm el-sheikh': { icon: '🏖️', color: '#04ADBF' }, 'شرم الشيخ': { icon: '🏖️', color: '#04ADBF' },
  hurghada: { icon: '🏖️', color: '#D9965B' }, الغردقة: { icon: '🏖️', color: '#D9965B' },
  riyadh: { icon: '🏙️', color: '#09732E' }, الرياض: { icon: '🏙️', color: '#09732E' },
  jeddah: { icon: '🕌', color: '#04ADBF' }, جدة: { icon: '🕌', color: '#04ADBF' },
  dubai: { icon: '🏙️', color: '#8B5CF6' }, دبي: { icon: '🏙️', color: '#8B5CF6' },
};

function getRouteStyle(to: string): { icon: string; color: string } {
  const key = to.toLowerCase();
  return ROUTE_ICONS[key] ?? { icon: '🚗', color: '#64748B' };
}

function calcSeatPrice(distKm: number, fuelPriceJOD: number, effL100: number, seats = 3, hasTolls = false): number {
  const liters = (distKm / 100) * effL100;
  const fuel = liters * fuelPriceJOD;
  const tolls = hasTolls ? 2 : 0;
  return Math.max(2, Math.ceil(((fuel + tolls) / seats) * 1.2));
}

const MOCK_RIDES: Ride[] = [
  {
    id: '1',
    driver: { name: 'Ahmad Al-Masri', nameAr: 'أحمد المصري', rating: 4.9, verified: true, trips: 127 },
    from: 'Amman', fromAr: 'عمّان', to: 'Aqaba', toAr: 'العقبة',
    date: '2026-03-14', time: '14:00', seatsAvailable: 3, totalSeats: 4,
    pricePerSeat: 8, distance: 330, duration: '4h',
    genderPreference: 'mixed',
    features: [{ en: 'A/C', ar: 'تكييف' }, { en: 'Wi-Fi', ar: 'واي فاي' }, { en: 'Smoke-free', ar: 'بدون تدخين' }],
    prayerStops: true, isRamadanFriendly: true,
    conversationLevel: 'normal',
  },
  {
    id: '2',
    driver: { name: 'Fatima Al-Ahmad', nameAr: 'فاطمة الأحمد', rating: 5.0, verified: true, trips: 89 },
    from: 'Amman', fromAr: 'عمّان', to: 'Aqaba', toAr: 'العقبة',
    date: '2026-03-15', time: '09:00', seatsAvailable: 2, totalSeats: 3,
    pricePerSeat: 10, distance: 330, duration: '4h',
    genderPreference: 'women_only',
    features: [{ en: 'Women only 🚺', ar: 'نساء فقط 🚺' }, { en: 'A/C', ar: 'تكييف' }],
    prayerStops: true,
    conversationLevel: 'quiet',
  },
  {
    id: '3',
    driver: { name: 'Mohammad Khalil', nameAr: 'محمد خليل', rating: 4.8, verified: true, trips: 204 },
    from: 'Amman', fromAr: 'عمّان', to: 'Irbid', toAr: 'إربد',
    date: '2026-03-13', time: '07:30', seatsAvailable: 1, totalSeats: 4,
    pricePerSeat: 3, distance: 85, duration: '1.5h',
    genderPreference: 'mixed',
    features: [{ en: 'Uni student', ar: 'طالب جامعي' }, { en: 'A/C', ar: 'تكييف' }],
    prayerStops: false,
    conversationLevel: 'talkative',
  },
  {
    id: '4',
    driver: { name: 'Hanan Nasser', nameAr: 'حنان ناصر', rating: 4.7, verified: true, trips: 56 },
    from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت',
    date: '2026-03-16', time: '10:00', seatsAvailable: 3, totalSeats: 4,
    pricePerSeat: 5, distance: 60, duration: '1h',
    genderPreference: 'family_only',
    features: [{ en: 'Family friendly', ar: 'عائلات' }, { en: 'A/C', ar: 'تكييف' }],
    prayerStops: false, isRamadanFriendly: true,
    conversationLevel: 'normal',
  },
];

const GENDER_META: Record<string, { en: string; ar: string; emoji: string; pill: string }> = {
  mixed:       { en: 'Mixed',       ar: 'مختلط',    emoji: '👥', pill: 'pill-teal'  },
  women_only:  { en: 'Women Only',  ar: 'نساء فقط', emoji: '🚺', pill: 'pill-pink'  },
  men_only:    { en: 'Men Only',    ar: 'رجال فقط', emoji: '🚹', pill: 'pill-teal'  },
  family_only: { en: 'Family Only', ar: 'عائلة',    emoji: '👨‍👩‍👧', pill: 'pill-amber' },
};

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

function RideSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border:`1px solid ${C.cyan}08` }}>
      <div className="h-px w-full" style={{ background:`linear-gradient(90deg, transparent, ${C.cyan}20, transparent)` }} />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl animate-pulse shrink-0" style={{ background: C.s3 }} />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded-lg animate-pulse w-36" style={{ background: C.s3 }} />
            <div className="h-2.5 rounded-lg animate-pulse w-24" style={{ background: C.s3 }} />
          </div>
          <div className="h-8 w-16 rounded-xl animate-pulse" style={{ background: C.s3 }} />
        </div>
        <div className="h-16 rounded-xl animate-pulse" style={{ background: C.s3 }} />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full animate-pulse" style={{ background: C.s3 }} />
          <div className="h-6 w-20 rounded-full animate-pulse" style={{ background: C.s3 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Ride Card ────────────────────────────────────────────────────────────────

function RideCard({ ride, idx, isRTL, language, onBook }: { ride: Ride; idx: number; isRTL: boolean; language: string; onBook: () => void }) {
  const g = GENDER_META[ride.genderPreference];
  const initials = (isRTL ? ride.driver.nameAr : ride.driver.name).charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, type: 'spring', stiffness: 380, damping: 28 }}
      whileHover={{ y: -5 }}
      className="relative group cursor-pointer"
      style={{ borderRadius: 'var(--wasel-radius-xl)' }}
      onClick={onBook}
    >
      {/* Card surface */}
      <div className="relative overflow-hidden rounded-2xl transition-all duration-300"
        style={{ background: C.card, border:`1px solid ${C.cyan}10`, boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
        <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background:`linear-gradient(90deg, transparent, ${C.cyan}60, transparent)` }} />

        <div className="p-5">
          {/* Driver row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ background:`linear-gradient(135deg, ${C.cyan}20, ${C.green}15)`, color: C.cyan, border:`1.5px solid ${C.cyan}25` }}>
                  {initials}
                </div>
                {ride.driver.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: C.cyan, border:`1.5px solid ${C.card}` }}>
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              {/* Name + rating */}
              <div>
                <p className="font-bold text-white" style={{ fontSize:'0.88rem' }}>
                  {isRTL ? ride.driver.nameAr : ride.driver.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-400" style={{ fontSize:'0.7rem' }}>{ride.driver.rating}</span>
                  <span style={{ color:'#4D6A8A', fontSize:'0.68rem' }}>· {ride.driver.trips} {isRTL ? 'رحلة' : 'trips'}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="font-black leading-none" style={{ fontSize:'1.6rem', color: C.cyan }}>{ride.pricePerSeat}</div>
              <div style={{ fontSize:'0.6rem', color:'#4D6A8A', fontWeight:600, marginTop:1 }}>{isRTL ? 'د.أ/مقعد' : 'JOD/seat'}</div>
            </div>
          </div>

          {/* Route visualization */}
          <div className="flex items-center gap-3 rounded-xl mb-4 p-3" style={{ background:'rgba(0,0,0,0.25)' }}>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate" style={{ fontSize:'0.88rem' }}>{isRTL ? ride.fromAr : ride.from}</p>
              <p style={{ color:'#4D6A8A', fontSize:'0.68rem', marginTop:1 }}>
                <Clock className="inline w-2.5 h-2.5 mr-0.5" />{ride.time}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0.5 shrink-0 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: C.green, boxShadow:`0 0 6px ${C.green}60` }} />
              <div className="w-px flex-1 min-h-[18px]" style={{ background:`linear-gradient(180deg, ${C.green}, ${C.cyan})` }} />
              <div className="w-2 h-2 rounded-full" style={{ background: C.cyan, boxShadow:`0 0 6px ${C.cyan}60` }} />
              <p style={{ fontSize:'0.6rem', color:'#4D6A8A', marginTop:2, fontWeight:600 }}>{ride.duration}</p>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-bold text-white truncate" style={{ fontSize:'0.88rem' }}>{isRTL ? ride.toAr : ride.to}</p>
              <p style={{ color:'#4D6A8A', fontSize:'0.68rem', marginTop:1 }}>{ride.distance} km</p>
            </div>
          </div>

          {/* Bottom row: badges + CTA */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Seats */}
              <span className="pill pill-slate">
                <Users className="w-3 h-3" />
                {ride.seatsAvailable} {isRTL ? 'مقاعد' : 'seats'}
              </span>

              {/* Gender */}
              <span className={`pill ${g.pill}`}>
                {g.emoji} {isRTL ? g.ar : g.en}
              </span>

              {/* Prayer stops */}
              {ride.prayerStops && (
                <span className="pill pill-bronze">🕌</span>
              )}

              {/* Ramadan */}
              {ride.isRamadanFriendly && (
                <span className="pill pill-amber">🌙</span>
              )}

              {/* Conversation level */}
              {ride.conversationLevel && (
                <span className="pill pill-slate">
                  {ride.conversationLevel === 'quiet' ? '🤫' : ride.conversationLevel === 'talkative' ? '🗣️' : '💬'}
                  {' '}
                  {isRTL
                    ? (ride.conversationLevel === 'quiet' ? 'صامت' : ride.conversationLevel === 'talkative' ? 'ثرثار' : 'عادي')
                    : (ride.conversationLevel === 'quiet' ? 'Quiet' : ride.conversationLevel === 'talkative' ? 'Talkative' : 'Normal')}
                </span>
              )}

              {/* CO₂ savings badge */}
              {ride.distance > 0 && (
                <span className="pill"
                  style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.6rem', fontWeight: 700 }}>
                  🌿 {isRTL
                    ? `${Math.round(ride.distance * 0.09)} غ CO₂`
                    : `${Math.round(ride.distance * 0.09)}g CO₂ saved`}
                </span>
              )}
            </div>

            {/* Book CTA + WhatsApp share */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button whileTap={{ scale: 0.93 }}
                className="px-4 py-2 rounded-xl font-black text-sm"
                style={{ background:`linear-gradient(135deg, ${C.cyan}, #0095b8)`, color: C.bg, fontWeight:800, boxShadow:`0 4px 16px ${C.cyan}30` }}
                onClick={e => { e.stopPropagation(); onBook(); }}>
                {isRTL ? 'احجز مقعد' : 'Book Seat'}
              </motion.button>
              {/* WhatsApp native share */}
              <motion.button
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)' }}
                title={isRTL ? 'شارك على واتساب' : 'Share via WhatsApp'}
                onClick={e => {
                  e.stopPropagation();
                  const from = isRTL ? ride.fromAr : ride.from;
                  const to   = isRTL ? ride.toAr   : ride.to;
                  const msg  = isRTL
                    ? `🚗 رحلة متوفرة على واصل!\n${from} ← ${to}\n📅 ${ride.date} · ${ride.time}\n${ride.seatsAvailable} مقاعد · ${ride.pricePerSeat} JOD/مقعد\n${ride.prayerStops ? '🕌 وقفات صلاة · ' : ''}حجّز الآن: https://wasel.app`
                    : `🚗 Ride available on Wasel!\n${from} → ${to}\n📅 ${ride.date} · ${ride.time}\n${ride.seatsAvailable} seats · ${ride.pricePerSeat} JOD/seat\n${ride.prayerStops ? '🕌 Prayer stops · ' : ''}Book now: https://wasel.app`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SearchRides() {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  // ── Country-aware routes from regionConfig ────────────────────────────────
  const { currentCountry } = useCountry();
  const region = getRegion(currentCountry?.iso_alpha2 || 'JO');
  const POPULAR_ROUTES = region.routes.slice(0, 6).map(r => {
    const style = getRouteStyle(r.to);
    return {
      from: r.from, fromAr: r.fromAr,
      to: r.to,     toAr: r.toAr,
      dist: r.distanceKm,
      price: calcSeatPrice(r.distanceKm, region.fuel.priceInJOD, region.fuel.efficiencyLper100km, 3, r.hasTolls),
      icon: style.icon, color: style.color,
    };
  });

  // ── Gap #7 Fix ✅ — Restore search state from sessionStorage ─────────────
  const savedSearch = (() => {
    try { return JSON.parse(sessionStorage.getItem('wasel_search') || 'null'); } catch { return null; }
  })();

  const [fromCity, setFromCity] = useState<string>(savedSearch?.fromCity || '');
  const [toCity,   setToCity]   = useState<string>(savedSearch?.toCity   || '');
  const [date,     setDate]     = useState<string>(savedSearch?.date     || '');
  const [genderFilter, setGenderFilter] = useState<string>(savedSearch?.genderFilter || 'all');
  const [prayerFilter, setPrayerFilter] = useState<boolean>(savedSearch?.prayerFilter ?? false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveRides, setLiveRides] = useState<Ride[] | null>(null);

  // ── Read URL search params (from landing page hero search) ────────────────
  const [searchParams] = useSearchParams();
  const urlParamsProcessed = React.useRef(false);
  useEffect(() => {
    if (urlParamsProcessed.current) return;
    const qFrom = searchParams.get('from');
    const qTo = searchParams.get('to');
    const qDate = searchParams.get('date');
    if (qFrom || qTo) {
      urlParamsProcessed.current = true;
      if (qFrom) setFromCity(qFrom);
      if (qTo) setToCity(qTo);
      if (qDate) setDate(qDate);
      setHasSearched(true);
      setTimeout(() => fetchRides(qFrom || '', qTo || '', qDate || ''), 50);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRides = async (qFrom?: string, qTo?: string, qDate?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (qFrom || fromCity) params.set('from', qFrom || fromCity);
      if (qTo   || toCity)   params.set('to',   qTo   || toCity);
      if (qDate || date) params.set('date', qDate || date);
      params.set('seats', '1');

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips?${params}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLiveRides(data.map((t: any): Ride => ({
          id: t.id, driver: { name: t.traveler_name || 'Wasel User', nameAr: t.traveler_name_ar || 'مستخدم واصل', rating: t.rating || 4.8, verified: true, trips: t.total_trips || 1 },
          from: t.from, fromAr: t.from, to: t.to, toAr: t.to,
          date: t.date, time: t.time || '', seatsAvailable: t.seats_available || 3, totalSeats: 4,
          pricePerSeat: t.price_per_seat || 5, distance: t.distance || 0, duration: t.duration || '',
          genderPreference: t.gender_preference || 'mixed', features: [], prayerStops: t.prayer_stops ?? false,
        })));
      } else { setLiveRides([]); }
    } catch { setLiveRides(null); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setHasSearched(true); fetchRides(); };

  const handleQuickRoute = (r: typeof POPULAR_ROUTES[0]) => {
    setFromCity(isRTL ? r.fromAr : r.from);
    setToCity(isRTL ? r.toAr : r.to);
    setHasSearched(true);
    fetchRides(r.from, r.to);
  };

  const baseRides = (liveRides && liveRides.length > 0) ? liveRides : MOCK_RIDES;
  const rides = baseRides.filter(r => {
    if (genderFilter !== 'all' && r.genderPreference !== genderFilter) return false;
    if (prayerFilter && !r.prayerStops) return false;
    return true;
  });

  const activeFilters = (genderFilter !== 'all' ? 1 : 0) + (prayerFilter ? 1 : 0);

  // Persist search state whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('wasel_search', JSON.stringify({ fromCity, toCity, date, genderFilter, prayerFilter }));
    } catch {}
  }, [fromCity, toCity, date, genderFilter, prayerFilter]);

  return (
    <div className="min-h-screen px-4 py-6 md:py-8" style={{ background: C.bg }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background:`linear-gradient(135deg, ${C.cyan}20, ${C.green}15)`, border:`1px solid ${C.cyan}25`, boxShadow:`0 4px 20px ${C.cyan}20` }}>
              <Car className="w-5 h-5" style={{ color: C.cyan }} />
            </div>
            <h1 className="font-black text-white" style={{ fontSize:'clamp(1.4rem,5vw,1.75rem)' }}>
              {isRTL ? 'دور على رحلة' : 'Find a Ride'}
            </h1>
          </div>
          <p style={{ color:'#4D6A8A', fontSize:'0.88rem', lineHeight:1.6 }}>
            {isRTL ? 'احجز مقعد مع شخص رايح نفس طريقك — آمن، مريح، واقتصادي'
              : 'Book a seat with someone already going your way — safe, comfortable, affordable'}
          </p>
        </motion.div>

        {/* ── Ramadan banner ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.18)' }}>
          <Moon className="w-4 h-4 shrink-0" style={{ color:'#A78BFA' }} />
          <p style={{ color:'rgba(209,193,255,0.8)', fontSize:'0.82rem', lineHeight:1.5 }}>
            {isRTL ? '🌙 رمضان مبارك! رحلات قبل وبعد الإفطار — رحلات السحور متاحة 3–5 صباحاً'
              : '🌙 Ramadan Mubarak! Rides before & after Iftar — Suhoor trips 3–5 AM'}
          </p>
        </motion.div>

        {/* ── Search card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mb-5 p-4 md:p-5 rounded-2xl"
          style={{ background: C.card, border:`1px solid ${C.cyan}12`, boxShadow:`0 8px 32px rgba(0,0,0,0.4)` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
            {/* From */}
            <div className="relative">
              <MapPin className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} style={{ color:'#4D6A8A' }} />
              <input className="w-full py-3.5 md:py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background:'rgba(0,0,0,0.25)', border:`1px solid ${C.cyan}10`, paddingLeft: isRTL ? 14 : 36, paddingRight: isRTL ? 36 : 14, colorScheme:'dark', fontSize:'16px' }}
                placeholder={isRTL ? 'من وين؟' : 'From where?'}
                value={fromCity} onChange={e => setFromCity(e.target.value)} list="from-cities"
                onFocus={e => { e.currentTarget.style.borderColor = `${C.cyan}35`; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.cyan}12`; }}
                onBlur={e => { e.currentTarget.style.borderColor = `${C.cyan}10`; e.currentTarget.style.boxShadow = 'none'; }} />
              <datalist id="from-cities">{POPULAR_ROUTES.map((r, i) => <option key={i} value={isRTL ? r.fromAr : r.from} />)}</datalist>
            </div>
            {/* To */}
            <div className="relative">
              <MapPin className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} style={{ color: C.cyan }} />
              <input className="w-full py-3.5 md:py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background:'rgba(0,0,0,0.25)', border:`1px solid ${C.cyan}10`, paddingLeft: isRTL ? 14 : 36, paddingRight: isRTL ? 36 : 14, colorScheme:'dark', fontSize:'16px' }}
                placeholder={isRTL ? 'لوين؟' : 'To where?'}
                value={toCity} onChange={e => setToCity(e.target.value)} list="to-cities"
                onFocus={e => { e.currentTarget.style.borderColor = `${C.cyan}35`; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.cyan}12`; }}
                onBlur={e => { e.currentTarget.style.borderColor = `${C.cyan}10`; e.currentTarget.style.boxShadow = 'none'; }} />
              <datalist id="to-cities">{POPULAR_ROUTES.map((r, i) => <option key={i} value={isRTL ? r.toAr : r.to} />)}</datalist>
            </div>
            {/* Date + Passengers row on mobile */}
            <div className="grid grid-cols-2 gap-2.5 md:contents">
              {/* Date */}
              <div className="relative">
                <Calendar className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} style={{ color:'#4D6A8A' }} />
                <input type="date" className="w-full py-3.5 md:py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background:'rgba(0,0,0,0.25)', border:`1px solid ${C.cyan}10`, paddingLeft: isRTL ? 14 : 36, paddingRight: isRTL ? 36 : 14, colorScheme:'dark', fontSize:'16px' }}
                  value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                  onFocus={e => { e.currentTarget.style.borderColor = `${C.cyan}35`; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.cyan}12`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${C.cyan}10`; e.currentTarget.style.boxShadow = 'none'; }} />
              </div>
              {/* Passengers */}
              <div className="relative">
                <Users className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} style={{ color:'#4D6A8A' }} />
                <input type="number" min={1} max={4} className="w-full py-3.5 md:py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background:'rgba(0,0,0,0.25)', border:`1px solid ${C.cyan}10`, paddingLeft: isRTL ? 14 : 36, paddingRight: isRTL ? 36 : 14, colorScheme:'dark', fontSize:'16px' }}
                  defaultValue={1}
                  onFocus={e => { e.currentTarget.style.borderColor = `${C.cyan}35`; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.cyan}12`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${C.cyan}10`; e.currentTarget.style.boxShadow = 'none'; }} />
              </div>
            </div>
          </div>

          {/* Search button */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="w-full py-4 md:py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-sm"
            style={{ background:`linear-gradient(135deg, ${C.cyan}, #0095b8)`, color: C.bg, boxShadow:`0 8px 24px ${C.cyan}30`, minHeight:52 }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isRTL ? 'ابحث عن رحلة' : 'Search Rides'}
          </motion.button>

          {/* Filters toggle */}
          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop:`1px solid ${C.cyan}08` }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(s => !s)}
              className="flex items-center gap-2 transition-colors"
              style={{ color: showFilters ? C.cyan : '#4D6A8A', fontSize:'0.85rem', fontWeight:500 }}>
              <Filter className="w-3.5 h-3.5" />
              {isRTL ? 'فلاتر متقدمة' : 'Filters'}
              <motion.div animate={{ rotate: showFilters ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>
            {activeFilters > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background:`${C.cyan}15`, color: C.cyan, border:`1px solid ${C.cyan}30` }}>
                {activeFilters} {isRTL ? 'فلتر' : 'filter'}
              </span>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                <div className="pt-4 grid md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:`${C.cyan}60` }}>
                      {isRTL ? 'تفضيل الجنس' : 'Gender'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'mixed', 'women_only', 'men_only', 'family_only'].map(g => (
                        <motion.button key={g} whileTap={{ scale: 0.94 }} onClick={() => setGenderFilter(g)}
                          className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                          style={genderFilter === g
                            ? { background:`${C.cyan}18`, color: C.cyan, border:`1px solid ${C.cyan}40` }
                            : { background:'rgba(0,0,0,0.2)', color:'#4D6A8A', border:`1px solid ${C.cyan}10` }}>
                          {g === 'all' ? (isRTL ? 'الكل' : 'All') : `${GENDER_META[g].emoji} ${isRTL ? GENDER_META[g].ar : GENDER_META[g].en}`}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:`${C.cyan}60` }}>
                      {isRTL ? 'ثقافي' : 'Cultural'}
                    </p>
                    <motion.button whileTap={{ scale: 0.94 }} onClick={() => setPrayerFilter(f => !f)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={prayerFilter
                        ? { background:`${C.gold}15`, color: C.gold, border:`1px solid ${C.gold}35` }
                        : { background:'rgba(0,0,0,0.2)', color:'#4D6A8A', border:`1px solid ${C.cyan}10` }}>
                      🕌 {isRTL ? 'وقفات صلاة' : 'Prayer stops'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Popular routes ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:`${C.cyan}55` }}>
            {isRTL ? '⚡ طرق شعبية' : '⚡ Popular Routes'}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-6 md:overflow-visible"
            style={{ scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {POPULAR_ROUTES.map((r, i) => {
              const active = toCity === r.to || toCity === r.toAr;
              return (
                <motion.button
                  key={i}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleQuickRoute(r)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl transition-all shrink-0"
                  style={{
                    background: active ? `${r.color}18` : 'rgba(0,0,0,0.2)',
                    border: active ? `1px solid ${r.color}45` : `1px solid ${C.cyan}08`,
                    minWidth: 76, width: 76, padding: '12px 8px',
                  }}
                >
                  <span style={{ fontSize:'1.3rem' }}>{r.icon}</span>
                  <span className="font-bold text-white text-center" style={{ fontSize:'0.63rem', lineHeight:1.2 }}>
                    {isRTL ? r.toAr : r.to}
                  </span>
                  <span style={{ color: r.color, fontSize:'0.63rem', fontWeight:700 }}>
                    {r.price} {isRTL ? 'د.أ' : 'JOD'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-white" style={{ fontSize:'1.1rem' }}>
            {loading
              ? (isRTL ? 'جاري البحث...' : 'Searching...')
              : hasSearched
                ? `${rides.length} ${isRTL ? 'رحلة متاحة' : 'rides found'}`
                : (isRTL ? 'رحلات مقترحة' : 'Suggested Rides')}
          </h2>
          {!loading && (
            <div>
              {liveRides && liveRides.length > 0 ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background:`${C.green}12`, color: C.green, border:`1px solid ${C.green}25` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                  {isRTL ? 'رحلات حقيقية' : 'Live'}
                </span>
              ) : hasSearched ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background:`${C.gold}12`, color: C.gold, border:`1px solid ${C.gold}25` }}>
                  {isRTL ? 'تجريبي' : 'Sample'}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background:`${C.cyan}12`, color: C.cyan, border:`1px solid ${C.cyan}25` }}>
                  <Sparkles className="w-3 h-3" />{isRTL ? 'مقترح' : 'Suggested'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Ride cards ── */}
        <div className="space-y-3 md:space-y-4">
          {loading ? (
            [0,1,2].map(i => <RideSkeleton key={i} />)
          ) : rides.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-14 rounded-2xl"
              style={{ background: C.card, border:`1px dashed ${C.cyan}15` }}>
              <div className="text-5xl mb-4">🚗</div>
              <p className="font-black text-white mb-2" style={{ fontSize:'1.05rem' }}>
                {isRTL ? 'ما في رحلات متاحة الحين' : 'No rides right now'}
              </p>
              <p style={{ color:'#4D6A8A', fontSize:'0.88rem' }}>
                {isRTL ? 'جرب تاريخ ثاني أو مسار مختلف' : 'Try a different date or route'}
              </p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/app/offer-ride')}
                className="mt-6 px-6 py-3 inline-flex items-center gap-2 rounded-xl font-black text-sm"
                style={{ background:`linear-gradient(135deg, ${C.cyan}, #0095b8)`, color: C.bg }}>
                <Car className="w-4 h-4" />{isRTL ? 'انشر رحلتك' : 'Post Your Ride'}
              </motion.button>
            </motion.div>
          ) : (
            rides.map((ride, idx) => (
              <RideCard key={ride.id} ride={ride} idx={idx}
                isRTL={isRTL} language={language}
                onBook={() => navigate(`/app/rides/${ride.id}`)} />
            ))
          )}
        </div>

        {/* ── Bottom CTA ── */}
        {rides.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-8 p-5 rounded-2xl text-center"
            style={{ background:`linear-gradient(135deg, ${C.green}10, ${C.cyan}06)`, border:`1px solid ${C.green}20` }}>
            <p className="font-black text-white mb-1" style={{ fontSize:'0.95rem' }}>
              {isRTL ? 'رايح نفس الطريق؟' : 'Going the same way?'}
            </p>
            <p style={{ color:'#4D6A8A', fontSize:'0.82rem' }} className="mb-4">
              {isRTL ? 'انشر رحلتك ووفّر مصاري البنزين' : 'Post your ride and share the fuel cost'}
            </p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/app/offer-ride')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm"
              style={{ background:`linear-gradient(135deg, ${C.green}, #009a55)`, color:'#fff', boxShadow:`0 6px 20px ${C.green}30` }}>
              <Car className="w-4 h-4" />
              {isRTL ? 'انشر رحلة ←' : '→ Post a Ride'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}