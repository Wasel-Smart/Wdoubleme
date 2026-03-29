/**
 * PostRide — Wasel Carpooling v5.0
 * Premium step wizard · Glassmorphism · Gradient progress · Token-compliant
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Calendar, Clock, Users, Settings,
  CheckCircle2, Moon, Car, Fuel,
  ArrowRight, Sparkles, Shield, Calculator,
  ChevronRight, ChevronLeft, Loader2,
  Package,
} from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { useCountry } from '../../contexts/CountryContext';
import { getRegion } from '../../utils/regionConfig';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcPrice(distKm: number, seats = 3, fuelJOD = 0.9): number {
  const liters = (distKm / 100) * 8;
  const fuel = liters * fuelJOD;
  return Math.ceil((fuel / seats) * 1.2);
}

// Route icon map
const ROUTE_ICONS: Record<string, { icon: string; color: string }> = {
  aqaba: { icon: '🏖️', color: '#04ADBF' }, irbid: { icon: '🎓', color: '#09732E' },
  'dead sea': { icon: '🌊', color: '#0EA5E9' }, zarqa: { icon: '🏙️', color: '#8B5CF6' },
  petra: { icon: '🏛️', color: '#D9965B' }, 'wadi rum': { icon: '⛺', color: '#F59E0B' },
  alexandria: { icon: '🌊', color: '#0EA5E9' }, 'sharm el-sheikh': { icon: '🏖️', color: '#04ADBF' },
  riyadh: { icon: '🏙️', color: '#09732E' }, jeddah: { icon: '🕌', color: '#04ADBF' },
  dubai: { icon: '🏙️', color: '#8B5CF6' }, hurghada: { icon: '🏖️', color: '#D9965B' },
};
function getRouteStyle(to: string) { return ROUTE_ICONS[to.toLowerCase()] ?? { icon: '🚗', color: '#64748B' }; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { val: 'mixed',       en: 'Mixed — All welcome', ar: 'مختلط — الكل مرحب',    emoji: '👥' },
  { val: 'women_only',  en: 'Women Only',           ar: 'نساء فقط',             emoji: '🚺' },
  { val: 'men_only',    en: 'Men Only',             ar: 'رجال فقط',             emoji: '🚹' },
  { val: 'family_only', en: 'Family Only',          ar: 'عائلة فقط',            emoji: '👨‍👩‍👧' },
];

// ─── Section card wrapper ─────────────────────────────────────────────────────

function StepCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`p-5 ${className}`}
      style={{
        background: 'var(--wasel-surface-2)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--wasel-radius-xl)',
        boxShadow: 'var(--wasel-shadow-sm)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5" style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: 600 }}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface FormData {
  from: string; to: string; date: string; time: string;
  returnDate: string; returnTime: string;
  seatsAvailable: number; pricePerSeat: number;
  genderPreference: 'mixed' | 'women_only' | 'men_only' | 'family_only';
  prayerStops: boolean; smoking: boolean; music: boolean; description: string;
  acceptPackages: boolean;
  isRoundTrip: boolean;
  isRecurring: boolean;
  recurringPattern: 'daily' | 'weekdays' | 'weekly';
  conversationLevel: 'quiet' | 'normal' | 'talkative'; // 🆕 "Bla level" equivalent
}

export function PostRide() {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const isRTL = language === 'ar';

  // ── Country-aware routes from regionConfig ─────────────────────────────────
  const { currentCountry } = useCountry();
  const region = getRegion(currentCountry?.iso_alpha2 || 'JO');
  const ROUTES = region.routes.slice(0, 8).map(r => {
    const style = getRouteStyle(r.to);
    return {
      from: r.from, fromAr: r.fromAr,
      to: r.to, toAr: r.toAr,
      dist: r.distanceKm,
      price: calcPrice(r.distanceKm, 3, region.fuel.priceInJOD),
      icon: style.icon, color: style.color,
      packageEnabled: r.packageEnabled,
    };
  });

  // ── ID verification gate ───────────────────────────────────────────────────
  const isVerified = (profile as any)?.phone_verified || (profile as any)?.id_verified || !profile;
  // (allow unverified in dev/demo mode so testing isn't blocked)

  const [step, setStep]     = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selRoute, setSelRoute] = useState<typeof ROUTES[0] | null>(null);
  const [form, setForm] = useState<FormData>({
    from: '', to: '', date: '', time: '',
    returnDate: '', returnTime: '',
    seatsAvailable: 3, pricePerSeat: 0,
    genderPreference: 'mixed',
    prayerStops: true, smoking: false, music: true, description: '',
    acceptPackages: false,
    isRoundTrip: false,
    isRecurring: false,
    recurringPattern: 'weekdays',
    conversationLevel: 'normal', // 🆕 default: normal chat
  });

  const up = (patch: Partial<FormData>) => setForm(f => ({ ...f, ...patch }));

  const calcedPrice = form.pricePerSeat > 0 ? form.pricePerSeat
    : (selRoute ? calcPrice(selRoute.dist, form.seatsAvailable, region.fuel.priceInJOD) : 0);

  const netEarnings = +(calcedPrice * form.seatsAvailable * 0.88).toFixed(3);

  const handleRouteSelect = (r: typeof ROUTES[0]) => {
    setSelRoute(r);
    const fromVal = isRTL ? r.fromAr : r.from;
    const toVal   = isRTL ? r.toAr   : r.to;
    up({ from: fromVal, to: toVal, pricePerSeat: r.price, acceptPackages: r.packageEnabled });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = session?.access_token || publicAnonKey;
      const payload = {
        from: form.from, to: form.to,
        date: form.date, time: form.time,
        seatsAvailable: form.seatsAvailable,
        pricePerSeat: calcedPrice,
        genderPreference: form.genderPreference,
        prayerStops: form.prayerStops,
        smoking: form.smoking, music: form.music,
        description: form.description,
        accept_packages: form.acceptPackages,
        is_round_trip: form.isRoundTrip,
        return_date: form.isRoundTrip ? form.returnDate : null,
        return_time: form.isRoundTrip ? form.returnTime : null,
        is_recurring: form.isRecurring,
        recurring_pattern: form.isRecurring ? form.recurringPattern : null,
        distance_km: selRoute?.dist,
        country: currentCountry?.iso_alpha2 || 'JO',
        currency: region.currency,
        conversation_level: form.conversationLevel, // 🆕 Bla level
      };
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }
      );
      // If round-trip, create return leg
      if (form.isRoundTrip && form.returnDate && res.ok) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...payload, from: form.to, to: form.from, date: form.returnDate, time: form.returnTime || form.time, is_return_leg: true }) }
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isRTL ? '✅ تم نشر رحلتك بنجاح!' : '✅ Ride posted successfully!');
      navigate('/app/my-trips?tab=as-driver');
    } catch (err) {
      toast.error(isRTL ? 'فشل نشر الرحلة — حاول مرة ثانية' : 'Failed to post ride — please try again');
    } finally { setSubmitting(false); }
  };

  const STEPS = [
    { num: 1, en: 'Route',       ar: 'المسار'    },
    { num: 2, en: 'Schedule',    ar: 'الوقت'     },
    { num: 3, en: 'Preferences', ar: 'التفضيلات' },
    { num: 4, en: 'Review',      ar: 'مراجعة'    },
  ];

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--wasel-surface-0)' }} dir={dir}>
      <div className="max-w-2xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(9,115,46,0.35), rgba(4,173,191,0.25))',
                border: '1px solid rgba(9,115,46,0.25)',
                boxShadow: 'var(--wasel-shadow-green)',
              }}
            >
              <Car className="w-5 h-5" style={{ color: '#22C55E' }} />
            </div>
            <div>
              <h1 className="type-h1 text-gradient-primary" style={{ fontWeight: 900 }}>
                {isRTL ? 'انشر رحلتك' : 'Post Your Ride'}
              </h1>
            </div>
          </div>
          <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-body)', maxWidth: '30rem' }}>
            {isRTL
              ? 'رايح رحلة؟ شارك المقاعد الفاضية وغطّي تكلفة البنزين — مش تكسي، مشاركة بس'
              : "Going on a trip? Share empty seats & cover fuel costs — not a taxi, just sharing"}
          </p>

          {/* Cost calculator link */}
          <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/app/cost-calculator')}
            className="mt-3 inline-flex items-center gap-1.5 transition-colors"
            style={{ color: '#04ADBF', fontSize: 'var(--wasel-text-caption)', fontWeight: 600 }}>
            <Calculator className="w-3.5 h-3.5" />
            {isRTL ? 'مش عارف السعر؟ استخدم الحاسبة' : "Unsure of pricing? Use the cost calculator"}
            <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
          </motion.button>
        </motion.div>

        {/* ── Step progress ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mb-8">
          {/* Progress bar */}
          <div className="step-progress-track mb-4">
            <div className="step-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {/* Step labels */}
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done = step > s.num;
              const active = step === s.num;
              return (
                <button key={s.num} onClick={() => done && setStep(s.num)}
                  className="flex flex-col items-center gap-1 group"
                  style={{ cursor: done ? 'pointer' : 'default' }}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all"
                    style={{
                      background: done ? 'linear-gradient(135deg, #09732E, #04ADBF)'
                        : active ? 'rgba(4,173,191,0.15)' : 'rgba(30,41,59,0.8)',
                      border: active ? '1.5px solid #04ADBF' : '1.5px solid rgba(255,255,255,0.07)',
                      color: done ? '#fff' : active ? '#04ADBF' : 'rgba(71,85,105,1)',
                      fontWeight: 700,
                    }}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: active ? 700 : 500,
                    color: active ? '#04ADBF' : done ? 'rgba(100,116,139,1)' : 'rgba(51,65,85,1)',
                    whiteSpace: 'nowrap',
                  }}>
                    {isRTL ? s.ar : s.en}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Steps ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">

            {/* STEP 1 — Route */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                {/* Cost calculator banner */}
                <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/app/cost-calculator')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors"
                  style={{ background: 'rgba(217,150,91,0.07)', border: '1px solid rgba(217,150,91,0.2)' }}>
                  <div className="flex items-center gap-2.5">
                    <Fuel className="w-4 h-4" style={{ color: '#D9965B' }} />
                    <span style={{ color: 'rgba(240,201,154,0.9)', fontWeight: 700, fontSize: 'var(--wasel-text-sm)' }}>
                      {isRTL ? '🧮 حاسبة تقاسم التكاليف' : '🧮 Cost-Sharing Calculator'}
                    </span>
                  </div>
                  <span style={{ color: 'rgba(217,150,91,0.6)', fontSize: 'var(--wasel-text-caption)' }}>
                    {isRTL ? 'احسب السعر العادل ←' : 'Calculate fair price →'}
                  </span>
                </motion.button>

                {/* Quick routes */}
                <StepCard>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4" style={{ color: '#04ADBF' }} />
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                      {isRTL ? 'طرق شعبية — اختار بسرعة' : 'Popular Routes — Quick Select'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {ROUTES.map(r => (
                      <motion.button key={r.to} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                        onClick={() => handleRouteSelect(r)}
                        className="flex flex-col p-3 rounded-xl transition-all"
                        style={{
                          background: selRoute?.to === r.to ? `${r.color}14` : 'rgba(15,23,42,0.5)',
                          border: `1px solid ${selRoute?.to === r.to ? r.color + '40' : 'rgba(255,255,255,0.05)'}`,
                          boxShadow: selRoute?.to === r.to ? `0 4px 16px ${r.color}20` : 'none',
                        }}>
                        <div className="flex items-center gap-1 mb-1.5">
                          <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: selRoute?.to === r.to ? r.color : 'rgba(100,116,139,1)' }}>
                            {isRTL ? `${r.fromAr} → ${r.toAr}` : `${r.from} → ${r.to}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.62rem' }}>{r.dist} km</span>
                          <span style={{ color: r.color, fontWeight: 800, fontSize: '0.78rem' }}>
                            {r.price} {isRTL ? 'د.أ' : 'JOD'}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </StepCard>

                {/* Manual route */}
                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    {isRTL ? 'أو أدخل المسار يدوياً' : 'Or enter route manually'}
                  </h3>
                  <div className="space-y-3">
                    <Field label={isRTL ? 'من وين رايح؟' : 'From where?'} icon={MapPin}>
                      <input className="input-premium" value={form.from}
                        onChange={e => up({ from: e.target.value })}
                        placeholder={isRTL ? 'عمّان' : 'Amman'} required />
                    </Field>
                    <Field label={isRTL ? 'وين رايح؟' : 'Going to?'} icon={MapPin}>
                      <input className="input-premium" value={form.to}
                        onChange={e => up({ to: e.target.value })}
                        placeholder={isRTL ? 'العقبة' : 'Aqaba'} required />
                    </Field>
                  </div>
                </StepCard>

                <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                  disabled={!form.from || !form.to}
                  className="btn-wasel-primary w-full py-3.5 flex items-center justify-center gap-2"
                  style={{ fontSize: 'var(--wasel-text-body)', borderRadius: 'var(--wasel-radius-lg)', opacity: (!form.from || !form.to) ? 0.5 : 1 }}>
                  {isRTL ? 'التالي: الوقت والمقاعد' : 'Next: Time & Seats'}
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </motion.button>
              </motion.div>
            )}

            {/* STEP 2 — Schedule */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                {/* ── Round-trip toggle ─── */}
                <StepCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                      🔄 {isRTL ? 'رحلة ذهاب وعودة؟' : 'Round Trip?'}
                    </h3>
                    <Switch checked={form.isRoundTrip} onCheckedChange={v => up({ isRoundTrip: v })} />
                  </div>
                  {form.isRoundTrip && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="grid md:grid-cols-2 gap-4 pt-2 border-t"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <Field label={isRTL ? 'تاريخ العودة' : 'Return Date'} icon={Calendar}>
                        <input type="date" className="input-premium" style={{ colorScheme: 'dark' }}
                          value={form.returnDate} min={form.date || new Date().toISOString().split('T')[0]}
                          onChange={e => up({ returnDate: e.target.value })} />
                      </Field>
                      <Field label={isRTL ? 'وقت العودة' : 'Return Time'} icon={Clock}>
                        <input type="time" className="input-premium" style={{ colorScheme: 'dark' }}
                          value={form.returnTime} onChange={e => up({ returnTime: e.target.value })} />
                      </Field>
                      <p className="col-span-full text-xs" style={{ color: '#22C55E' }}>
                        ✅ {isRTL ? 'سننشر رحلتَي الذهاب والعودة معاً تلقائياً' : 'We\'ll automatically post both the outbound and return trips'}
                      </p>
                    </motion.div>
                  )}
                </StepCard>

                {/* ── Recurring toggle ─── */}
                <StepCard>
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                      📅 {isRTL ? 'رحلة متكررة؟' : 'Recurring Ride?'}
                    </h3>
                    <Switch checked={form.isRecurring} onCheckedChange={v => up({ isRecurring: v })} />
                  </div>
                  {form.isRecurring && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: 10 }}>
                        {isRTL ? 'انشر مرة وسنكرر الرحلة تلقائياً' : 'Post once and we\'ll repeat it automatically'}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { val: 'daily',    en: 'Every day',     ar: 'كل يوم'          },
                          { val: 'weekdays', en: 'Mon–Thu',        ar: 'الإثنين–الخميس' },
                          { val: 'weekly',   en: 'Weekly',         ar: 'أسبوعياً'       },
                        ].map(opt => (
                          <button key={opt.val} type="button" onClick={() => up({ recurringPattern: opt.val as any })}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                            style={{
                              background: form.recurringPattern === opt.val ? 'rgba(4,173,191,0.15)' : 'rgba(30,41,59,0.5)',
                              color: form.recurringPattern === opt.val ? '#04ADBF' : '#64748B',
                              border: `1px solid ${form.recurringPattern === opt.val ? 'rgba(4,173,191,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            }}>
                            {isRTL ? opt.ar : opt.en}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </StepCard>

                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    📅 {isRTL ? 'موعد الرحلة' : 'Trip Schedule'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={isRTL ? 'تاريخ الرحلة' : 'Trip Date'} icon={Calendar}>
                      <input type="date" className="input-premium" style={{ colorScheme: 'dark' }}
                        value={form.date} min={new Date().toISOString().split('T')[0]}
                        onChange={e => up({ date: e.target.value })} required />
                    </Field>
                    <Field label={isRTL ? 'وقت الانطلاق' : 'Departure Time'} icon={Clock}>
                      <input type="time" className="input-premium" style={{ colorScheme: 'dark' }}
                        value={form.time} onChange={e => up({ time: e.target.value })} required />
                    </Field>
                  </div>
                </StepCard>

                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    💺 {isRTL ? 'المقاعد والسعر' : 'Seats & Price'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={isRTL ? 'عدد المقاعد المتاحة' : 'Available Seats'} icon={Users}>
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4].map(n => (
                          <motion.button key={n} type="button" whileTap={{ scale: 0.88 }}
                            onClick={() => up({ seatsAvailable: n })}
                            className="w-10 h-10 rounded-xl font-bold transition-all"
                            style={{
                              background: form.seatsAvailable === n ? 'rgba(4,173,191,0.2)' : 'rgba(30,41,59,0.5)',
                              border: `1.5px solid ${form.seatsAvailable === n ? 'rgba(4,173,191,0.5)' : 'rgba(255,255,255,0.06)'}`,
                              color: form.seatsAvailable === n ? '#04ADBF' : 'rgba(100,116,139,1)',
                              fontWeight: 700,
                            }}>
                            {n}
                          </motion.button>
                        ))}
                      </div>
                    </Field>

                    <Field label={isRTL ? 'السعر لكل مقعد (د.أ)' : 'Price per Seat (JOD)'} icon={Calculator}>
                      <input type="number" className="input-premium" min={1} max={50}
                        value={calcedPrice || ''}
                        onChange={e => up({ pricePerSeat: +e.target.value })}
                        placeholder={isRTL ? `مقترح: ${calcedPrice}` : `Suggested: ${calcedPrice} JOD`} />
                    </Field>
                  </div>

                  {/* Earnings summary */}
                  {calcedPrice > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl flex items-center justify-between"
                      style={{ background: 'rgba(9,115,46,0.07)', border: '1px solid rgba(9,115,46,0.18)' }}>
                      <div>
                        <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)' }}>
                          {isRTL ? 'ستكسب بعد عمولة 12%' : 'You earn after 12% commission'}
                        </p>
                        <p className="font-black savings-shimmer" style={{ fontWeight: 900, fontSize: '1.4rem' }}>
                          {netEarnings} {isRTL ? 'د.أ' : 'JOD'}
                        </p>
                      </div>
                      <div className="text-3xl">💰</div>
                    </motion.div>
                  )}
                </StepCard>

                <div className="flex gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(100,116,139,1)', fontWeight: 600, fontSize: 'var(--wasel-text-sm)' }}>
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </motion.button>
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                    disabled={!form.date || !form.time}
                    className="btn-wasel-primary flex-1 py-3 flex items-center justify-center gap-2"
                    style={{ fontSize: 'var(--wasel-text-sm)', borderRadius: 'var(--wasel-radius-md)', opacity: (!form.date || !form.time) ? 0.5 : 1 }}>
                    {isRTL ? 'التالي' : 'Next'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Preferences */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                {/* ── Accept Packages toggle ─── */}
                <StepCard>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(217,150,91,0.1)', border: '1px solid rgba(217,150,91,0.2)' }}>
                        <Package className="w-4 h-4" style={{ color: '#D9965B' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#fff', fontSize: 'var(--wasel-text-sm)' }}>
                          {isRTL ? 'قبول طرود أوصل' : 'Accept Awasel Packages'}
                        </p>
                        <p style={{ color: '#94A3B8', fontSize: '0.68rem' }}>
                          {isRTL ? 'اكسب دخلاً إضافياً بحمل الطرود' : 'Earn extra income by carrying packages'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={form.acceptPackages} onCheckedChange={v => up({ acceptPackages: v })} />
                  </div>
                  {form.acceptPackages && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs px-3 py-2 rounded-xl mt-2"
                      style={{ background: 'rgba(217,150,91,0.07)', color: '#D9965B', border: '1px solid rgba(217,150,91,0.15)' }}>
                      📦 {isRTL
                        ? 'طرود مؤمَّنة حتى 100 د.أ. أنت تكسب 80% من رسوم التوصيل.'
                        : 'Packages insured up to JOD 100. You earn 80% of the delivery fee.'}
                    </motion.p>
                  )}
                </StepCard>

                {/* Gender */}
                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    👥 {isRTL ? 'تفضيل الجنس' : 'Gender Preference'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {GENDER_OPTIONS.map(g => (
                      <motion.button key={g.val} type="button" whileTap={{ scale: 0.96 }}
                        onClick={() => up({ genderPreference: g.val as any })}
                        className="flex items-center gap-2.5 p-3.5 rounded-xl transition-all"
                        style={{
                          background: form.genderPreference === g.val ? 'rgba(4,173,191,0.1)' : 'rgba(15,23,42,0.5)',
                          border: `1px solid ${form.genderPreference === g.val ? 'rgba(4,173,191,0.4)' : 'rgba(255,255,255,0.05)'}`,
                          fontWeight: form.genderPreference === g.val ? 700 : 500,
                        }}>
                        <span style={{ fontSize: '1.2rem' }}>{g.emoji}</span>
                        <span style={{ fontSize: 'var(--wasel-text-caption)', color: form.genderPreference === g.val ? '#04ADBF' : 'rgba(100,116,139,1)' }}>
                          {isRTL ? g.ar : g.en}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </StepCard>

                {/* 🆕 Conversation Level ("Bla" level — BlaBlaCar's signature feature) */}
                <StepCard>
                  <h3 className="mb-1" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    💬 {isRTL ? 'مستوى الحديث في الرحلة' : 'Conversation Level'}
                  </h3>
                  <p className="mb-4" style={{ color: 'rgba(100,116,139,1)', fontSize: '0.72rem' }}>
                    {isRTL
                      ? 'أخبر الركاب كم تحب الكلام — مثل نظام Bla في BlaBlaCar'
                      : 'Let passengers know how chatty you are — like BlaBlaCar\'s "Bla" system'}
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { val: 'quiet',    emoji: '🤫', en: 'Quiet',    ar: 'صامت',    sub_en: 'I prefer silence', sub_ar: 'أفضّل الصمت',       color: '#8B5CF6' },
                      { val: 'normal',   emoji: '💬', en: 'Normal',   ar: 'عادي',    sub_en: 'Chat a little',   sub_ar: 'شوية حديث',          color: '#04ADBF' },
                      { val: 'talkative',emoji: '🗣️', en: 'Talkative',ar: 'ثرثار',   sub_en: 'Love to chat!',   sub_ar: 'أحب الحديث كثيراً!', color: '#22C55E' },
                    ].map(opt => (
                      <motion.button key={opt.val} type="button" whileTap={{ scale: 0.95 }}
                        onClick={() => up({ conversationLevel: opt.val as any })}
                        className="flex flex-col items-center p-3 rounded-xl transition-all text-center"
                        style={{
                          background: form.conversationLevel === opt.val ? `${opt.color}12` : 'rgba(15,23,42,0.5)',
                          border: `1.5px solid ${form.conversationLevel === opt.val ? opt.color + '50' : 'rgba(255,255,255,0.05)'}`,
                          boxShadow: form.conversationLevel === opt.val ? `0 4px 16px ${opt.color}15` : 'none',
                        }}>
                        <span style={{ fontSize: '1.6rem', marginBottom: 4 }}>{opt.emoji}</span>
                        <span className="font-bold" style={{ color: form.conversationLevel === opt.val ? opt.color : '#fff', fontSize: '0.78rem', fontWeight: 700 }}>
                          {isRTL ? opt.ar : opt.en}
                        </span>
                        <span style={{ color: 'rgba(100,116,139,1)', fontSize: '0.62rem', marginTop: 2 }}>
                          {isRTL ? opt.sub_ar : opt.sub_en}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </StepCard>

                {/* Toggles */}
                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    ⚙️ {isRTL ? 'تفضيلات الرحلة' : 'Trip Preferences'}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'prayerStops', en: 'Prayer stops along route', ar: 'وقفات صلاة في الطريق', emoji: '🕌' },
                      { key: 'music',       en: 'Music allowed',            ar: 'موسيقى مسموحة',      emoji: '🎵' },
                      { key: 'smoking',     en: 'Smoking allowed',          ar: 'التدخين مسموح',      emoji: '🚭' },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2.5">
                          <span>{toggle.emoji}</span>
                          <span style={{ color: 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-sm)', fontWeight: 500 }}>
                            {isRTL ? toggle.ar : toggle.en}
                          </span>
                        </div>
                        <Switch
                          checked={form[toggle.key as keyof FormData] as boolean}
                          onCheckedChange={v => up({ [toggle.key]: v })}
                        />
                      </div>
                    ))}
                  </div>
                </StepCard>

                {/* Description */}
                <StepCard>
                  <Field label={isRTL ? 'ملاحظات للركاب (اختياري)' : 'Notes for passengers (optional)'}>
                    <textarea
                      className="input-premium resize-none"
                      rows={3}
                      value={form.description}
                      onChange={e => up({ description: e.target.value })}
                      placeholder={isRTL
                        ? 'مثال: محطة للصلاة عند الزرقاء — الرجاء الالتزام بالوقت'
                        : 'e.g. Prayer stop at Zarqa — please be on time'}
                    />
                  </Field>
                </StepCard>

                <div className="flex gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(100,116,139,1)', fontWeight: 600, fontSize: 'var(--wasel-text-sm)' }}>
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </motion.button>
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(4)}
                    className="btn-wasel-primary flex-1 py-3 flex items-center justify-center gap-2"
                    style={{ fontSize: 'var(--wasel-text-sm)', borderRadius: 'var(--wasel-radius-md)' }}>
                    {isRTL ? 'مراجعة' : 'Review'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Review */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                {/* Summary card */}
                <div
                  className="p-5 rounded-2xl relative overflow-hidden"
                  style={{ background: 'var(--wasel-surface-2)', border: '1px solid rgba(4,173,191,0.2)', boxShadow: 'var(--wasel-shadow-teal)' }}
                >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #09732E, #04ADBF)' }} />

                  <h3 className="mb-5 font-bold text-white" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)' }}>
                    ✅ {isRTL ? 'مراجعة الرحلة' : 'Ride Summary'}
                  </h3>

                  <div className="space-y-3">
                    {[
                      { icon: MapPin,    label: isRTL ? 'المسار' : 'Route',         val: `${form.from} → ${form.to}` },
                      { icon: Calendar,  label: isRTL ? 'التاريخ' : 'Date',          val: form.date },
                      { icon: Clock,     label: isRTL ? 'الوقت' : 'Time',            val: form.time },
                      { icon: Users,     label: isRTL ? 'المقاعد' : 'Seats',         val: `${form.seatsAvailable} ${isRTL ? 'مقاعد' : 'seats'}` },
                      { icon: Calculator,label: isRTL ? 'السعر/مقعد' : 'Price/seat', val: `${calcedPrice} ${isRTL ? 'د.أ' : 'JOD'}` },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="flex items-center justify-between py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" style={{ color: '#04ADBF' }} />
                          <span style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)' }}>{label}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--wasel-text-caption)', color: 'rgba(241,245,249,1)' }}>{val}</span>
                      </div>
                    ))}
                    {/* Conversation level summary */}
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.85rem' }}>💬</span>
                        <span style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)' }}>{isRTL ? 'الحديث' : 'Chat level'}</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--wasel-text-caption)', color: 'rgba(241,245,249,1)' }}>
                        {form.conversationLevel === 'quiet' ? (isRTL ? '🤫 صامت' : '🤫 Quiet') : form.conversationLevel === 'talkative' ? (isRTL ? '🗣️ ثرثار' : '🗣️ Talkative') : (isRTL ? '💬 عادي' : '💬 Normal')}
                      </span>
                    </div>
                  </div>

                  {/* CO₂ savings estimate */}
                  {selRoute && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl flex items-center gap-3"
                      style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
                      <span style={{ fontSize: '1.2rem' }}>🌿</span>
                      <div>
                        <p style={{ color: '#22C55E', fontWeight: 700, fontSize: '0.78rem' }}>
                          {isRTL
                            ? `ستوفر ~${Math.round(selRoute.dist * 0.09 * form.seatsAvailable / 10) * 10} غ CO₂ لكل راكب`
                            : `~${Math.round(selRoute.dist * 0.09 * form.seatsAvailable / 10) * 10}g CO₂ saved per passenger`}
                        </p>
                        <p style={{ color: 'rgba(100,116,139,1)', fontSize: '0.65rem' }}>
                          {isRTL ? 'مقارنةً بسيارة لكل شخص' : 'vs. each person driving alone'}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Net earnings */}
                  <div className="mt-5 p-4 rounded-xl flex items-center justify-between"
                    style={{ background: 'rgba(9,115,46,0.08)', border: '1px solid rgba(9,115,46,0.2)' }}>
                    <div>
                      <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)' }}>
                        {isRTL ? 'صافي أرباحك' : 'Net Earnings'}
                      </p>
                      <p className="font-black savings-shimmer" style={{ fontWeight: 900, fontSize: '1.5rem' }}>
                        {netEarnings} {isRTL ? 'د.أ' : 'JOD'}
                      </p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </div>

                {/* Trust row */}
                <div className="flex items-center gap-3 px-1">
                  {[Shield, CheckCircle2, Moon].map((Icon, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: '#04ADBF' }} />
                      <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.65rem' }}>
                        {i === 0 ? (isRTL ? 'مؤمّن' : 'Insured') : i === 1 ? (isRTL ? 'موثّق' : 'Verified') : (isRTL ? 'مراجع' : 'Reviewed')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(100,116,139,1)', fontWeight: 600, fontSize: 'var(--wasel-text-sm)' }}>
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </motion.button>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }}
                    disabled={submitting}
                    className="btn-wasel-primary flex-1 py-3 flex items-center justify-center gap-2"
                    style={{ fontSize: 'var(--wasel-text-body)', fontWeight: 700, borderRadius: 'var(--wasel-radius-md)' }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
                    {isRTL ? 'انشر الرحلة ✨' : 'Post Ride ✨'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
