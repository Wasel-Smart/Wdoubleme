/**
 * Dashboard — Wasel | واصل v6.0 "Deep Space Network"
 * The app's home — unified brand, electric cyan, solar gold
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Wallet, Bell, Users, Moon, Star,
  BellRing, X as XIcon, Car, Clock,
  ChevronRight, Sparkles, BadgeCheck, TreePine,
  ArrowRight, Search, Shield, TrendingUp,
  Sunrise, Sun, Sunset, Package, Zap,
} from 'lucide-react';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RecommendedForYou } from '../carpooling/RecommendedForYou';
import { CommunityImpactBanner } from './dashboard/CommunityImpactBanner';
import { JourneyStreak as JourneyStreakWidget } from './dashboard/JourneyStreak';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useCountry } from '../../contexts/CountryContext';
import { getRegion } from '../../utils/regionConfig';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

// ─── Brand constants ──────────────────────────────────────────────────────────
const C = {
  cyan:  '#00C8E8',
  gold:  '#F0A830',
  green: '#00C875',
  bg:    '#040C18',
  card:  '#0A1628',
  s3:    '#10203A',
};

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

const DESTINATION_IMAGES: Record<string, string> = {
  aqaba: 'https://images.unsplash.com/photo-1614628086086-c0c6c598ace1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcWFiYSUyMEpvcmRhbiUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc3Mjg1NTAzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
  petra: 'https://images.unsplash.com/photo-1545909314-775f95f8d1aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQZXRyYSUyMEpvcmRhbiUyMGFuY2llbnQlMjBydWluc3xlbnwxfHx8fDE3NzI4MzkwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'dead sea': 'https://images.unsplash.com/photo-1574681197038-c49ad7ccc4ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEZWFkJTIwU2VhJTIwSm9yZGFuJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3Mjg1NTAzOHww&ixlib=rb-4.1.0&q=80&w=1080',
  'wadi rum': 'https://images.unsplash.com/photo-1662747975053-ee44de7015a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxXYWRpJTIwUnVtJTIwSm9yZGFuJTIwZGVzZXJ0fGVufDF8fHx8MTc3Mjg1NTAzOHww&ixlib=rb-4.1.0&q=80&w=1080',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AvailableRide {
  id: string | number;
  travelerName: string; travelerNameAr: string;
  rating: number; verified: boolean;
  from: string; fromAr: string; to: string; toAr: string;
  date: string; time: string;
  seatsLeft: number; pricePerSeat: number;
  distance: number; duration: string;
  genderPref: 'mixed' | 'women_only' | 'family_only';
  prayerStops: boolean;
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(ar: boolean): { text: string; icon: any } {
  const h = new Date().getHours();
  if (ar) {
    if (h < 5)  return { text: 'مرحباً', icon: Moon };
    if (h < 12) return { text: 'صباح الخير', icon: Sunrise };
    if (h < 17) return { text: 'مساء الخير', icon: Sun };
    if (h < 21) return { text: 'مساء النور', icon: Sunset };
    return { text: 'مرحباً', icon: Moon };
  }
  if (h < 5)  return { text: 'Welcome back', icon: Moon };
  if (h < 12) return { text: 'Good morning', icon: Sunrise };
  if (h < 17) return { text: 'Good afternoon', icon: Sun };
  if (h < 21) return { text: 'Good evening', icon: Sunset };
  return { text: 'Hello', icon: Moon };
}

// ─── Pulse Dot ────────────────────────────────────────────────────────────────
function PulseDot({ color = C.cyan, size = 6 }: { color?: string; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.div animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="absolute inset-0 rounded-full" style={{ background: color }} />
      <div className="absolute inset-0 rounded-full" style={{ background: color }} />
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / 1200, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHdr({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-black text-sm uppercase tracking-widest" style={{ color: `${C.cyan}80` }}>
        {label}
      </h2>
      {action && onAction && (
        <button onClick={onAction} className="flex items-center gap-1 text-xs font-bold transition-colors"
          style={{ color: C.cyan }}
          onMouseEnter={e => (e.currentTarget.style.color = '#5EE7FF')}
          onMouseLeave={e => (e.currentTarget.style.color = C.cyan)}>
          {action} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── Hero Search Bar ──────────────────────────────────────────────────────────
function HeroSearch({ ar, onClick }: { ar: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick}
      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl relative overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, ${C.card}, #0d1e36)`,
        border: `1px solid ${C.cyan}18`,
        boxShadow: `0 0 0 1px ${C.cyan}08, 0 8px 32px rgba(0,0,0,0.4)`,
      }}>
      {/* Hover sweep */}
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${C.cyan}06, ${C.green}03)` }} />

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${C.cyan}12`, border: `1px solid ${C.cyan}20` }}>
        <Search className="w-5 h-5" style={{ color: C.cyan }} />
      </div>

      {/* Text */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-bold text-white" style={{ fontSize: '1rem' }}>
          {ar ? 'رايح فين؟' : 'Where are you going?'}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: `${C.cyan}55` }}>
          {ar ? 'عقبة · إربد · البتراء · البحر الميت' : 'Aqaba · Irbid · Petra · Dead Sea'}
        </p>
      </div>

      {/* Arrow */}
      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <ArrowRight className="w-5 h-5 shrink-0" style={{ color: C.cyan }} />
      </motion.div>
    </motion.button>
  );
}

// ─── Quick Action Tile ────────────────────────────────────────────────────────
function ActionTile({ icon, label, sub, color, grad, onClick, delay = 0 }:
  { icon: string; label: string; sub: string; color: string; grad: string; onClick: () => void; delay?: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 26 }}
      whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-start p-4 rounded-2xl relative overflow-hidden group text-left"
      style={{ background: grad, border: `1px solid ${color}18` }}>
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}10 0%, transparent 70%)` }} />
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 relative z-10"
        style={{ background: `${color}15` }}>
        {icon}
      </div>
      <p className="font-black relative z-10 leading-none mb-1" style={{ color, fontSize: '0.88rem' }}>{label}</p>
      <p className="text-xs relative z-10" style={{ color: `${color}65` }}>{sub}</p>
    </motion.button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon, onClick, loading, delay = 0 }:
  { label: string; value: string; color: string; icon: any; onClick: () => void; loading: boolean; delay?: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 26 }}
      whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl p-4 text-left relative overflow-hidden group"
      style={{
        background: C.card,
        border: `1px solid ${color}12`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
      }}>
      {/* Corner glow */}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`, filter: 'blur(8px)' }} />
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 rounded-lg animate-pulse w-2/3" style={{ background: C.s3 }} />
          <div className="h-3 rounded-lg animate-pulse w-1/2" style={{ background: C.s3 }} />
        </div>
      ) : (
        <div className="relative z-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
            style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <p className="font-black leading-none mb-1 tabular-nums" style={{ color, fontSize: '1.05rem' }}>{value}</p>
          <p className="text-xs font-medium" style={{ color: '#4D6A8A' }}>{label}</p>
        </div>
      )}
    </motion.button>
  );
}

// ─── Destination Story Card ───────────────────────────────────────────────────
function DestCard({ dest, ar, onClick }: { dest: any; ar: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, scale: 1.04 }} whileTap={{ scale: 0.97 }}
      className="snap-center flex-shrink-0 w-28 rounded-2xl overflow-hidden relative"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: `1px solid rgba(255,255,255,0.05)` }}>
      <div className="aspect-[3/4] relative">
        <ImageWithFallback src={dest.img} alt={dest.nameEn}
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,12,24,0.92) 0%, rgba(4,12,24,0.2) 50%, transparent 100%)' }} />
        {/* Live count */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(4,12,24,0.7)', backdropFilter: 'blur(8px)' }}>
          <PulseDot color={C.green} size={4} />
          <span className="text-[9px] font-bold text-white">{dest.rides}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <span className="text-base block mb-0.5">{dest.icon}</span>
          <p className="font-black text-white leading-none" style={{ fontSize: '0.72rem' }}>
            {ar ? dest.nameAr : dest.nameEn}
          </p>
          <p className="font-bold mt-0.5" style={{ color: C.cyan, fontSize: '0.64rem' }}>
            {ar ? `من ${dest.price}` : `from ${dest.price}`} JOD
          </p>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Ride Card (horizontal scroll) ───────────────────────────────────────────
function RideCard({ ride, ar, onBook }: { ride: AvailableRide; ar: boolean; onBook: () => void }) {
  const genderBadge =
    ride.genderPref === 'women_only' ? { label: ar ? '🚺 نساء' : '🚺 Women', color: '#FF6B9D' } :
    ride.genderPref === 'family_only' ? { label: ar ? '👨‍👩‍👧 عائلة' : '👨‍👩‍👧 Family', color: C.gold } : null;

  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="snap-center flex-shrink-0 w-[240px] rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: C.card, border: `1px solid ${C.cyan}10`, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      onClick={onBook}>

      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}50, transparent)` }} />

      <div className="p-4">
        {/* Route */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.cyan, boxShadow: `0 0 8px ${C.cyan}60` }} />
            <motion.div animate={{ scaleY: [1, 1.4, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="w-px h-6" style={{ background: `linear-gradient(to bottom, ${C.cyan}, ${C.gold})` }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.gold, boxShadow: `0 0 8px ${C.gold}60` }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate" style={{ fontSize: '0.82rem' }}>
              {ar ? ride.fromAr : ride.from}
            </p>
            <p className="my-0.5 text-xs" style={{ color: '#4D6A8A' }}>
              {ride.distance > 0 ? `${ride.distance} km · ` : ''}{ride.duration}
            </p>
            <p className="font-bold text-white truncate" style={{ fontSize: '0.82rem' }}>
              {ar ? ride.toAr : ride.to}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black leading-none" style={{ color: C.cyan, fontSize: '1.4rem' }}>
              {ride.pricePerSeat}
            </p>
            <p style={{ color: '#4D6A8A', fontSize: '0.52rem', fontWeight: 600 }}>
              JOD/{ar ? 'مقعد' : 'seat'}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs" style={{ color: '#4D6A8A' }}>
            {ride.date} {ride.time && `· ${ride.time}`}
          </span>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" style={{ color: C.green }} />
            <span className="text-xs font-bold" style={{ color: C.green }}>{ride.seatsLeft} left</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {genderBadge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: `${genderBadge.color}15`, color: genderBadge.color, border: `1px solid ${genderBadge.color}25` }}>
              {genderBadge.label}
            </span>
          )}
          {ride.prayerStops && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: `${C.green}12`, color: C.green, border: `1px solid ${C.green}25` }}>
              🕌 {ar ? 'صلاة' : 'Prayer'}
            </span>
          )}
          {ride.verified && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: `${C.cyan}10`, color: C.cyan, border: `1px solid ${C.cyan}20` }}>
              <BadgeCheck className="w-2.5 h-2.5" /> {ar ? 'موثّق' : 'Verified'}
            </span>
          )}
        </div>

        {/* Traveler + Book CTA */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}25` }}>
            {(ar ? ride.travelerNameAr : ride.travelerName).charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{ar ? ride.travelerNameAr : ride.travelerName}</p>
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px]" style={{ color: '#4D6A8A' }}>{ride.rating}</span>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}
            className="px-3 py-1.5 rounded-xl text-xs font-black"
            style={{
              background: `linear-gradient(135deg, ${C.cyan}, #0095b8)`,
              color: C.bg,
              boxShadow: `0 4px 12px ${C.cyan}30`,
            }}>
            {ar ? 'احجز' : 'Book'}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Notif Nudge ──────────────────────────────────────────────────────────────
function NotifNudge({ onDismiss, ar }: { onDismiss: () => void; ar: boolean }) {
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const [requesting, setRequesting] = useState(false);
  if (!isSupported || permission !== 'default') return null;
  const handle = async () => { setRequesting(true); await requestPermission(); setRequesting(false); onDismiss(); };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: `linear-gradient(135deg, ${C.cyan}08, ${C.green}05)`, border: `1px solid ${C.cyan}18` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.cyan}15` }}>
        <BellRing className="w-4 h-4" style={{ color: C.cyan }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">{ar ? 'فعّل إشعارات الرحلات' : 'Enable ride alerts'}</p>
        <p className="text-xs mt-0.5" style={{ color: '#4D6A8A' }}>
          {ar ? 'احصل على إشعار لما يتأكد حجزك' : 'Know instantly when your booking confirms'}
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <button onClick={handle} disabled={requesting}
            className="px-3 py-1.5 rounded-lg text-xs font-black"
            style={{ background: C.cyan, color: C.bg, opacity: requesting ? 0.7 : 1 }}>
            {requesting ? '…' : `🔔 ${ar ? 'فعّل' : 'Enable'}`}
          </button>
          <button onClick={onDismiss} className="px-3 py-1.5 rounded-lg text-xs"
            style={{ color: '#4D6A8A' }}>{ar ? 'لاحقاً' : 'Not now'}</button>
        </div>
      </div>
      <button onClick={onDismiss}><XIcon className="w-3.5 h-3.5" style={{ color: '#4D6A8A' }} /></button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export function Dashboard() {
  const navigate = useIframeSafeNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { stats, loading: statsLoading } = useDashboardStats();
  const ar = language === 'ar';

  const [nudgeDismissed, setNudgeDismissed] = useState(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem('wasel_notif_nudge_dismissed') === 'true' : false);
  const [apiRides, setApiRides] = useState<AvailableRide[]>([]);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [isRamadan] = useState(() => {
    const n = new Date();
    return n >= new Date('2026-03-01') && n <= new Date('2026-03-30');
  });

  const { currentCountry } = useCountry();
  const region = getRegion(currentCountry?.iso_alpha2 || 'JO');

  useEffect(() => {
    const fetchRides = async () => {
      setRidesLoading(true);
      try {
        const res = await fetch(`${API_URL}/trips?seats=1`, { headers: { Authorization: `Bearer ${publicAnonKey}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: any[] = await res.json();
        setApiRides(data.slice(0, 8).map(t => ({
          id: t.id, travelerName: t.driver_name || 'Traveler', travelerNameAr: t.driver_name_ar || 'مسافر',
          rating: t.driver_rating || 4.5, verified: !!t.driver_verified,
          from: t.from || '', fromAr: t.from || '', to: t.to || '', toAr: t.to || '',
          date: t.date || '', time: t.time || '',
          seatsLeft: t.seats_available ?? 0, pricePerSeat: t.price_per_seat ?? 0,
          distance: 0, duration: '', genderPref: (t.gender_preference as AvailableRide['genderPref']) || 'mixed',
          prayerStops: t.prayer_stops ?? true,
        })));
      } catch (err) {
        console.error('[Dashboard] rides fetch error:', err);
      } finally { setRidesLoading(false); }
    };
    fetchRides();
  }, []);

  const go = (page: string) => navigate(`/app/${page}`);
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Ahmad';
  const greeting = getGreeting(ar);
  const GreetIcon = greeting.icon;

  const quickActions = [
    { icon: '🔍', label: ar ? 'ابحث عن رحلة' : 'Find a Ride',  sub: ar ? 'مشاركة رحلة'       : 'Carpooling',      path: 'find-ride',       color: C.cyan,  grad: `linear-gradient(135deg, ${C.cyan}10, ${C.card})` },
    { icon: '🚗', label: ar ? 'انشر رحلة'    : 'Post a Ride',   sub: ar ? 'وفّر مصاري البنزين' : 'Share fuel cost', path: 'offer-ride',      color: C.green, grad: `linear-gradient(135deg, ${C.green}10, ${C.card})` },
    { icon: '📦', label: ar ? 'ابعث طرد'     : 'Send Package',  sub: ar ? 'أوصل | ٥ دينار'     : 'Awasel | 5 JOD',  path: 'awasel/send',     color: C.gold,  grad: `linear-gradient(135deg, ${C.gold}10, ${C.card})` },
    { icon: '📋', label: ar ? 'طلباتي'       : 'My Bookings',   sub: ar ? 'تأكيد / رفض'        : 'Manage bookings', path: 'booking-requests', color: '#A78BFA', grad: 'linear-gradient(135deg, rgba(167,139,250,0.1), #0A1628)' },
  ];

  const destinations = [
    { id: 'aqaba',    nameEn: 'Aqaba',    nameAr: 'العقبة',     price: 8,  rides: 12, icon: '🏖️', img: DESTINATION_IMAGES.aqaba    },
    { id: 'dead-sea', nameEn: 'Dead Sea', nameAr: 'البحر الميت', price: 5,  rides: 8,  icon: '🌊', img: DESTINATION_IMAGES['dead sea'] },
    { id: 'petra',    nameEn: 'Petra',    nameAr: 'البتراء',     price: 12, rides: 4,  icon: '🏛️', img: DESTINATION_IMAGES.petra    },
    { id: 'wadi-rum', nameEn: 'Wadi Rum', nameAr: 'وادي رم',    price: 10, rides: 3,  icon: '⛺', img: DESTINATION_IMAGES['wadi rum'] },
  ];

  const statCards = [
    { label: ar ? 'المحفظة' : 'Wallet',    value: `${stats.wallet_balance.toFixed(2)} JOD`, color: C.green,    icon: Wallet,    path: 'wallet'   },
    { label: ar ? 'رحلاتي'  : 'Trips',     value: stats.total_trips.toString(),              color: C.cyan,     icon: Car,       path: 'my-trips' },
    { label: ar ? 'التوفير' : 'Saved',     value: `${stats.total_saved.toFixed(2)} JOD`,    color: C.gold,     icon: TrendingUp,path: 'my-trips' },
    { label: ar ? 'CO₂ أقل' : 'CO₂ Saved', value: `${stats.co2_saved_kg} kg`,               color: '#A78BFA',  icon: TreePine,  path: 'dashboard'},
  ];

  return (
    <div className="min-h-screen pb-24 antialiased" style={{ background: C.bg }} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── Ambient background glow ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${C.cyan}05 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      <div className="relative px-4 pt-6 space-y-6 max-w-2xl mx-auto">

        {/* ══ HERO: Greeting + Search ══ */}
        <section>
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                onClick={() => go('profile')}
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${C.cyan}25, ${C.green}18)`,
                  border: `1.5px solid ${C.cyan}30`,
                  color: C.cyan,
                  boxShadow: `0 4px 20px ${C.cyan}20`,
                }}>
                {displayName.charAt(0).toUpperCase()}
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{ background: C.green, border: `2px solid ${C.bg}`, boxShadow: `0 0 8px ${C.green}60` }} />
              </motion.button>
              {/* Text */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <GreetIcon className="w-3.5 h-3.5" style={{ color: C.gold }} />
                  <span className="text-xs font-medium" style={{ color: '#4D6A8A' }}>{greeting.text}</span>
                </div>
                <h1 className="font-black text-white" style={{ fontSize: '1.25rem', lineHeight: 1.15 }}>
                  {displayName} <span style={{ fontSize: '1.1rem' }}>👋</span>
                </h1>
              </div>
            </div>

            {/* Right: wallet + bell */}
            <div className="flex items-center gap-2">
              {stats.wallet_balance > 0 && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => go('wallet')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: `${C.green}10`, border: `1px solid ${C.green}20` }}>
                  <Wallet className="w-3.5 h-3.5" style={{ color: C.green }} />
                  <span className="font-black text-xs" style={{ color: C.green }}>
                    {stats.wallet_balance.toFixed(2)} JOD
                  </span>
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => go('notifications')}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: C.card, border: `1px solid ${C.cyan}10` }}>
                <Bell className="w-4 h-4" style={{ color: '#4D6A8A' }} />
                {stats.unread_notifications > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center font-black text-white"
                    style={{ background: C.gold, fontSize: '0.58rem', padding: '0 3px', boxShadow: `0 0 0 2px ${C.bg}` }}>
                    {stats.unread_notifications > 9 ? '9+' : stats.unread_notifications}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Hero search */}
          <HeroSearch ar={ar} onClick={() => go('find-ride')} />
        </section>

        {/* Notif nudge */}
        <AnimatePresence>
          {!nudgeDismissed && (
            <NotifNudge ar={ar} onDismiss={() => {
              setNudgeDismissed(true);
              localStorage.setItem('wasel_notif_nudge_dismissed', 'true');
            }} />
          )}
        </AnimatePresence>

        {/* ── Ramadan Banner ── */}
        <AnimatePresence>
          {isRamadan && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(88,28,135,0.15), rgba(120,53,15,0.1))', border: '1px solid rgba(139,92,246,0.25)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${C.gold}18 0%, transparent 70%)`, filter: 'blur(16px)' }} />
              <div className="flex items-center gap-3 relative z-10">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}
                  className="text-2xl shrink-0">🌙</motion.span>
                <div className="flex-1">
                  <p className="font-black text-white text-sm">{ar ? 'رمضان مبارك! 🌙' : 'Ramadan Mubarak! 🌙'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(253,230,138,0.7)' }}>
                    {ar ? 'رحلات إفطار وسحور · خصم ١٠٪ · وقفات صلاة' : 'Iftar & Suhoor rides · 10% off · Prayer stops'}
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => go('cultural')}
                  className="px-3 py-1.5 rounded-xl font-black text-xs shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.35)' }}>
                  {ar ? 'استكشف ←' : 'Explore →'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Community Impact ── */}
        <CommunityImpactBanner ar={ar} />

        {/* ══ QUICK ACTIONS ══ */}
        <section>
          <SectionHdr label={ar ? 'إجراءات سريعة' : 'Quick Actions'} />
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a, i) => (
              <ActionTile key={a.path} icon={a.icon} label={a.label} sub={a.sub}
                color={a.color} grad={a.grad} onClick={() => go(a.path)} delay={i * 0.05} />
            ))}
          </div>
        </section>

        {/* ── Journey Streak ── */}
        <JourneyStreakWidget ar={ar} />

        {/* ══ STAT CARDS ══ */}
        <section>
          <SectionHdr label={ar ? 'ملخصك' : 'Your Summary'}
            action={ar ? 'رحلاتي' : 'My Trips'} onAction={() => go('my-trips')} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map((s, i) => (
              <StatCard key={s.label} label={s.label} value={s.value} color={s.color}
                icon={s.icon} onClick={() => go(s.path)} loading={statsLoading} delay={i * 0.05} />
            ))}
          </div>
        </section>

        {/* ── Savings Hero Card ── */}
        <section>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${C.green}CC 0%, ${C.cyan}CC 100%)`,
              boxShadow: `0 12px 40px ${C.green}35`,
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
                    <Sparkles className="w-3 h-3" /> {ar ? 'توفير مشاركة الرحلات' : 'Carpooling Savings'}
                  </span>
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {ar ? 'توفيرك هالشهر مقارنة بتاكسي' : 'Saved this month vs. solo taxi'}
                  </p>
                  {statsLoading
                    ? <div className="h-10 w-32 rounded-xl animate-pulse mt-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    : <h2 className="font-black text-white mt-1" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                        <AnimatedNumber value={parseFloat(stats.total_saved.toFixed(2))} />
                        <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.65 }}> JOD</span>
                      </h2>
                  }
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => go('find-ride')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)' }}>
                <Zap className="w-4 h-4" />
                {ar ? 'احجز رحلة الآن ←' : 'Book a ride now →'}
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* ══ DESTINATIONS ══ */}
        <section>
          <SectionHdr label={ar ? 'وجهات شائعة' : 'Popular Destinations'}
            action={ar ? 'كل الوجهات' : 'All routes'} onAction={() => go('routes')} />
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory -mx-1 px-1">
            {destinations.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}>
                <DestCard dest={d} ar={ar} onClick={() => go('find-ride')} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══ LIVE RIDES ══ */}
        <section>
          <SectionHdr label={ar ? 'رحلات متاحة' : 'Available Now'}
            action={ar ? 'كل الرحلات' : 'See all'} onAction={() => go('find-ride')} />

          {ridesLoading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
              {[1,2,3].map(i => (
                <div key={i} className="snap-center flex-shrink-0 w-[240px] rounded-2xl overflow-hidden"
                  style={{ background: C.card, border: `1px solid ${C.cyan}08` }}>
                  <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}20, transparent)` }} />
                  <div className="p-4 space-y-3">
                    {[80, 60, 100, 70].map((w, j) => (
                      <div key={j} className="h-3 rounded-lg animate-pulse" style={{ background: C.s3, width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : apiRides.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory -mx-1 px-1">
              {apiRides.map(ride => (
                <RideCard key={ride.id} ride={ride} ar={ar} onBook={() => go('find-ride')} />
              ))}
            </div>
          ) : (
            // Fallback: prompt to search
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => go('find-ride')}
              className="w-full py-8 rounded-2xl flex flex-col items-center gap-3"
              style={{ background: C.card, border: `1px dashed ${C.cyan}20` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${C.cyan}10` }}>
                <Search className="w-6 h-6" style={{ color: C.cyan }} />
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-sm">{ar ? 'دور على رحلة الآن' : 'Find your ride now'}</p>
                <p className="text-xs mt-1" style={{ color: '#4D6A8A' }}>
                  {ar ? 'عمّان ← عقبة · إربد · البتراء' : 'Amman → Aqaba · Irbid · Petra'}
                </p>
              </div>
            </motion.button>
          )}
        </section>

        {/* ══ RECOMMENDED ══ */}
        <section>
          <SectionHdr label={ar ? 'مقترح لك' : 'Recommended'} />
          <RecommendedForYou ar={ar} onNavigate={go} />
        </section>

      </div>
    </div>
  );
}
