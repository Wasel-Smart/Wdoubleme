/**
 * Wasel BookingModal v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ GxP      — mountedRef guard on every async setState path
 * ✅ PERF     — useMemo for dates, stable seat-counts, price breakdowns
 * ✅ UX       — 5-step cinematic flow: Details → Schedule → Passengers → Payment → QR Ticket
 * ✅ RTL      — full dir/rowDir support (Arabic + English)
 * ✅ BRAND    — Wasel-only ticket branding, no stale sub-brand text
 * ✅ A11Y     — ARIA labels, keyboard-navigable buttons
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Car, Zap, Clock, Users, CreditCard,
  Check, MapPin, ChevronRight, ChevronLeft,
  Package, Shield, Star, Phone, ArrowRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS  (match MobilityOSCore tokens exactly)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:    '#020810',
  card:  '#06101E',
  card2: '#0A1628',
  bdr:   'rgba(255,255,255,0.07)',
  bdrA:  'rgba(43,143,255,0.22)',
  bdrB:  'rgba(43,143,255,0.36)',
  ride:  '#2B8FFF', rideLt: '#82BFFF',
  pkg:   '#F5A623', pkgLt:  '#FFD07A',
  green: '#00E87A',
  orange:'#FF7722',
  red:   '#FF2D55',
  cyan:  '#00D4FF',
  t0: '#FFFFFF',
  t1: 'rgba(255,255,255,0.85)',
  t2: 'rgba(255,255,255,0.55)',
  t3: 'rgba(255,255,255,0.30)',
  t4: 'rgba(255,255,255,0.10)',
  F:  "-apple-system,'Inter',ui-sans-serif,'Cairo',sans-serif",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (shared with MobilityOSCore — keep in sync)
// ─────────────────────────────────────────────────────────────────────────────
export interface City  { id:number; name:string; ar:string; lat:number; lon:number; pop:number; tier:1|2|3; }
export interface Route { id:string; from:number; to:number; km:number; mins:number; fare:number; pop:'high'|'med'|'low'; }

export interface BookingModalProps {
  route:    Route;
  fromCity: City;
  toCity:   City;
  onClose:  () => void;
  ar:       boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const DAYS_EN  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;
const DAYS_AR  = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'] as const;
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;
const TIMES    = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00'] as const;

const GENDERS = [
  { k:'mixed',  en:'Mixed',      ar:'مختلط',     icon:'👥' },
  { k:'women',  en:'Women Only', ar:'نساء فقط',  icon:'👩' },
  { k:'men',    en:'Men Only',   ar:'رجال فقط',  icon:'👨' },
  { k:'family', en:'Family',     ar:'عائلة',      icon:'👨‍👩‍👧' },
] as const;

const PAYMENTS = [
  { k:'cash', en:'Cash on Arrival',  ar:'كاش عند الوصول',  icon:'💵', sub:'Most popular in Jordan'  },
  { k:'cliq', en:'CliQ',             ar:'كليك',             icon:'📱', sub:'Jordan instant payment'  },
  { k:'card', en:'Credit / Debit',   ar:'بطاقة ائتمان',     icon:'💳', sub:'Visa · Mastercard'       },
] as const;

const CONFIRM_STEPS_EN = ['Creating your booking…','Finding your driver…','Generating your ticket…'] as const;
const CONFIRM_STEPS_AR = ['إنشاء الحجز…','البحث عن سائق…','إنشاء التذكرة…']  as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic QR-like bitmap from a booking-ID seed. */
function buildQR(seed: string): boolean[][] {
  const SIZE = 21;
  const grid: boolean[][] = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));

  let h = 5381;
  for (const ch of seed) h = ((h << 5) + h) + ch.charCodeAt(0);

  const corner = (r0: number, c0: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        grid[r0 + i][c0 + j] = (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4));
      }
    }
  };
  corner(0, 0); corner(0, 14); corner(14, 0);

  for (let k = 8; k < 13; k++) {
    grid[6][k] = k % 2 === 0;
    grid[k][6] = k % 2 === 0;
  }

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if ((i < 8 && (j < 8 || j > 12)) || (i > 12 && j < 8) || (i === 6 || j === 6)) continue;
      h = (Math.imul(h, 1664525) + 1013904223) | 0;
      grid[i][j] = (h & 1) === 1;
    }
  }

  return grid;
}

/** Seeded pseudo-random number — stable across renders for a given seed. */
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS  (injected once per session)
// ─────────────────────────────────────────────────────────────────────────────
const BM_CSS = `
  @keyframes bmSpin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
  .bm-pill {
    border-radius:10px; border:1px solid transparent;
    padding:10px 14px; cursor:pointer;
    transition:all .15s ease; text-align:start;
  }
  .bm-pill:hover  { filter:brightness(1.08); }
  .bm-btn {
    border-radius:11px; padding:12px 24px; border:none;
    font-family:${C.F}; font-weight:700; cursor:pointer;
    transition:all .15s ease;
  }
  .bm-btn:hover  { filter:brightness(1.12); transform:translateY(-1px); }
  .bm-btn:active { transform:scale(.97); }
  .bm-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function BookingModal({ route, fromCity, toCity, onClose, ar }: BookingModalProps) {

  // ── GxP: prevent setState after unmount ────────────────────────────────────
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [step,    setStep]    = useState(0);
  const [mode,    setMode]    = useState<'carpool' | 'ondemand'>('carpool');
  const [dateIdx, setDateIdx] = useState(0);
  const [time,    setTime]    = useState<string>('08:00');
  const [pax,     setPax]     = useState(1);
  const [gender,  setGender]  = useState<string>('mixed');
  const [prayer,  setPrayer]  = useState(false);
  const [payment, setPayment] = useState<string>('cash');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cStep,   setCStep]   = useState(-1);   // confirmation animation step

  const dir    = ar ? 'rtl' : 'ltr' as const;
  const rowDir = ar ? 'row-reverse' : 'row' as const;

  // ── Stable computed values ─────────────────────────────────────────────────
  /** 7 upcoming dates — memoized so they never change while modal is open. */
  const dates = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      return d;
    });
  }, []);  // empty deps → computed once on mount

  /**
   * Stable seat-counts per time-slot — seeded by slot index so they never
   * flicker on re-render (was previously Math.random() inline in JSX).
   */
  const seatCounts = useMemo(() =>
    TIMES.map((_, i) => 2 + Math.floor(seededRand(i * 7 + route.id.charCodeAt(0)) * 4)),
  [route.id]);

  // Pricing
  const baseFare  = mode === 'carpool' ? route.fare : route.fare * 2.1;
  const totalFare = +(baseFare * pax).toFixed(2);
  const tax       = +(totalFare * 0.16).toFixed(2);
  const insurance = 0.50;
  const grand     = +(totalFare + tax + insurance).toFixed(2);

  const maxPax = mode === 'carpool' ? 4 : 6;

  // ── Step navigation ────────────────────────────────────────────────────────
  const canProceed = [
    true,      // step 0: mode selected
    !!time,    // step 1: time required
    true,      // step 2: passengers
    true,      // step 3: payment
    false,     // step 4: confirmation (no "next")
  ] as const;

  // ── Booking confirmation (GxP-guarded) ────────────────────────────────────
  const handleBook = async () => {
    if (!mountedRef.current) return;
    setStep(4);
    setCStep(0);

    for (let s = 0; s < CONFIRM_STEPS_EN.length; s++) {
      await new Promise<void>(resolve => setTimeout(resolve, 900));
      if (!mountedRef.current) return;   // ← guard: modal may have closed
      setCStep(s + 1);
    }

    if (!mountedRef.current) return;
    const id = 'WM-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    setBookingId(id);
  };

  const qr = bookingId ? buildQR(bookingId) : null;

  // ── Shared motion props ────────────────────────────────────────────────────
  const stepMotion = {
    initial:    { opacity: 0, x: ar ? -18 : 18 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: ar ? 18 : -18 },
    transition: { duration: .18 },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        key="bm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(2,8,16,0.88)',
          backdropFilter: 'blur(14px)',
          zIndex: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <style>{BM_CSS}</style>

        <motion.div
          initial={{ scale: .92, y: 24, opacity: 0 }}
          animate={{ scale: 1,   y: 0,  opacity: 1 }}
          exit={{   scale: .92, y: 24, opacity: 0 }}
          transition={{ duration: .22, ease: [.22, .1, .25, 1] }}
          dir={dir}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={ar ? 'نموذج الحجز' : 'Booking form'}
          style={{
            width: '100%', maxWidth: 520,
            background: C.card,
            border: `1px solid ${C.bdrA}`,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 32px 96px rgba(0,0,0,0.80)',
            fontFamily: C.F,
          }}
        >
          {/* ── Progress bar ────────────────────────────────────────────── */}
          {step < 4 && (
            <div style={{ height: 3, background: C.t4 }}>
              <motion.div
                animate={{ width: `${((step + 1) / 4) * 100}%` }}
                transition={{ duration: .4, ease: [.22, .1, .25, 1] }}
                style={{ height: '100%', background: `linear-gradient(90deg,${C.ride},${C.cyan})` }}
              />
            </div>
          )}

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '18px 20px 14px',
            borderBottom: `1px solid ${C.bdr}`,
            flexDirection: rowDir,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: rowDir }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: step < 4 ? C.ride : C.green,
                  boxShadow: `0 0 10px ${step < 4 ? C.ride : C.green}`,
                }} />
                <span style={{ fontWeight: 800, color: C.t0, fontSize: '.92rem' }}>
                  {step === 0 ? (ar ? 'تفاصيل الرحلة'  : 'Trip Details')   :
                   step === 1 ? (ar ? 'اختر الموعد'    : 'Choose Schedule'):
                   step === 2 ? (ar ? 'المسافرون'       : 'Passengers')     :
                   step === 3 ? (ar ? 'الدفع'           : 'Payment')        :
                                (ar ? 'تذكرتك'          : 'Your Ticket')}
                </span>
              </div>
              {step < 4 && (
                <div style={{ fontSize: '.60rem', color: C.t3, marginTop: 3, marginInlineStart: 16 }}>
                  {ar ? `الخطوة ${step + 1} من 4` : `Step ${step + 1} of 4`}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={ar ? 'إغلاق' : 'Close'}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${C.bdr}`,
                borderRadius: 8, padding: '5px 7px',
                color: C.t3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Route strip (steps 1-3) ──────────────────────────────────── */}
          {step > 0 && step < 4 && (
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '10px 20px',
              background: 'rgba(43,143,255,0.05)',
              borderBottom: `1px solid ${C.bdr}`,
              gap: 8, flexDirection: rowDir,
            }}>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: C.rideLt }}>{fromCity.name}</span>
              <ArrowRight size={12} color={C.t3} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: C.rideLt }}>{toCity.name}</span>
              <span style={{ color: C.t4, marginInlineStart: 'auto' }}>&bull;</span>
              <span style={{ fontSize: '.63rem', color: C.t3 }}>{route.km}km · {route.mins}min</span>
              <span style={{ color: C.t4 }}>&bull;</span>
              <span style={{ fontSize: '.70rem', fontWeight: 800, color: mode === 'carpool' ? C.green : C.orange }}>
                JOD {grand.toFixed(2)}
              </span>
            </div>
          )}

          {/* ── Step content ─────────────────────────────────────────────── */}
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <AnimatePresence mode="wait">

              {/* ─── STEP 0: Trip summary + mode selection ──────────────── */}
              {step === 0 && (
                <motion.div key="s0" {...stepMotion} style={{ padding: '20px' }}>

                  {/* Cities banner */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', borderRadius: 14,
                    background: 'rgba(43,143,255,0.06)',
                    border: `1px solid rgba(43,143,255,0.16)`,
                    marginBottom: 18, flexDirection: rowDir,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '.60rem', color: C.t3, marginBottom: 3 }}>{ar ? 'من' : 'FROM'}</div>
                      <div style={{ fontWeight: 800, color: C.t0, fontSize: '.95rem' }}>{fromCity.name}</div>
                      <div style={{ fontSize: '.68rem', color: C.t2, fontFamily: 'Cairo,sans-serif' }}>{fromCity.ar}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 40, height: 1, background: `linear-gradient(${ar?'left':'right'},${C.ride},${C.cyan})` }} />
                      <span style={{ fontSize: '.55rem', color: C.t3 }}>{route.km} km</span>
                      <div style={{ width: 40, height: 1, background: `linear-gradient(${ar?'left':'right'},${C.cyan},${C.ride})` }} />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '.60rem', color: C.t3, marginBottom: 3 }}>{ar ? 'إلى' : 'TO'}</div>
                      <div style={{ fontWeight: 800, color: C.t0, fontSize: '.95rem' }}>{toCity.name}</div>
                      <div style={{ fontSize: '.68rem', color: C.t2, fontFamily: 'Cairo,sans-serif' }}>{toCity.ar}</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexDirection: rowDir }}>
                    {[
                      { icon: <Clock  size={11} />, v: `${route.mins} min`, l: ar ? 'المدة'    : 'Duration' },
                      { icon: <MapPin size={11} />, v: `${route.km} km`,   l: ar ? 'المسافة'  : 'Distance' },
                      { icon: <Star   size={11} />, v: '4.8 ★',            l: ar ? 'التقييم'  : 'Rating'   },
                    ].map(s => (
                      <div key={s.l} style={{
                        flex: 1, padding: '10px', borderRadius: 10,
                        background: C.card2, border: `1px solid ${C.bdr}`,
                        textAlign: 'center',
                      }}>
                        <div style={{ color: C.t3, display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontWeight: 700, color: C.t0, fontSize: '.78rem' }}>{s.v}</div>
                        <div style={{ fontSize: '.56rem', color: C.t3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mode selector */}
                  <div>
                    <div style={{
                      fontSize: '.65rem', fontWeight: 700, color: C.t3,
                      letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 10,
                    }}>
                      {ar ? 'اختر النمط' : 'CHOOSE MODE'}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexDirection: rowDir }}>
                      {[
                        {
                          k: 'carpool'  as const,
                          en: 'Carpool',   ar: 'كاربول',
                          icon: <Car size={16} />,
                          fare: route.fare,
                          col: C.green,
                          sub: ar ? 'توفير التكلفة · حجز مسبق' : 'Cost-sharing · Advance booking',
                        },
                        {
                          k: 'ondemand' as const,
                          en: 'On-Demand', ar: 'فوري',
                          icon: <Zap size={16} />,
                          fare: route.fare * 2.1,
                          col: C.orange,
                          sub: ar ? 'فوري · سائق محترف' : 'Instant · Professional driver',
                        },
                      ].map(m => {
                        const on = mode === m.k;
                        return (
                          <button
                            key={m.k}
                            className="bm-pill"
                            onClick={() => setMode(m.k)}
                            aria-pressed={on}
                            style={{
                              flex: 1,
                              background: on ? `${m.col}12` : 'rgba(255,255,255,0.02)',
                              borderColor: on ? `${m.col}44` : C.bdr,
                            }}
                          >
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              marginBottom: 6, flexDirection: rowDir, justifyContent: 'space-between',
                            }}>
                              <span style={{ color: on ? m.col : C.t2 }}>{m.icon}</span>
                              {on && <Check size={12} color={m.col} />}
                            </div>
                            <div style={{ fontWeight: 700, color: on ? m.col : C.t1, fontSize: '.80rem' }}>
                              {ar ? m.ar : m.en}
                            </div>
                            <div style={{ fontSize: '.60rem', color: C.t3, marginTop: 2, lineHeight: 1.4 }}>
                              {m.sub}
                            </div>
                            <div style={{ fontWeight: 800, color: m.col, fontSize: '.92rem', marginTop: 8 }}>
                              JOD {m.fare.toFixed(2)}
                              <span style={{ fontWeight: 400, fontSize: '.60rem', color: C.t3 }}>/seat</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 1: Schedule ───────────────────────────────────── */}
              {step === 1 && (
                <motion.div key="s1" {...stepMotion} style={{ padding: '20px' }}>
                  <SectionLabel label={ar ? 'اختر التاريخ' : 'SELECT DATE'} />
                  <div style={{
                    display: 'flex', gap: 7, marginBottom: 20,
                    overflowX: 'auto', paddingBottom: 4, flexDirection: rowDir,
                  }}>
                    {dates.map((d, i) => {
                      const on = dateIdx === i;
                      const day = ar ? DAYS_AR[d.getDay()] : DAYS_EN[d.getDay()];
                      return (
                        <button
                          key={i}
                          onClick={() => setDateIdx(i)}
                          aria-pressed={on}
                          style={{
                            flex: '0 0 auto', width: 58, padding: '10px 0',
                            borderRadius: 12,
                            border: `1px solid ${on ? `${C.ride}66` : C.bdr}`,
                            background: on ? `${C.ride}14` : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '.58rem', color: on ? C.rideLt : C.t3, fontWeight: 600, marginBottom: 4 }}>{day}</div>
                          <div style={{ fontSize: '.88rem', fontWeight: 800, color: on ? C.ride : C.t1 }}>{d.getDate()}</div>
                          <div style={{ fontSize: '.54rem', color: C.t3 }}>{MONTHS[d.getMonth()]}</div>
                        </button>
                      );
                    })}
                  </div>

                  <SectionLabel label={ar ? 'اختر الوقت' : 'SELECT TIME'} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {TIMES.map((t, ti) => {
                      const on   = time === t;
                      const [hh] = t.split(':').map(Number);
                      const label = hh < 12 ? `${hh} AM` : hh === 12 ? '12 PM' : `${hh - 12} PM`;
                      const seats = seatCounts[ti];   // ← stable, no Math.random() in JSX
                      return (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          aria-pressed={on}
                          style={{
                            padding: '10px 6px', borderRadius: 10,
                            border: `1px solid ${on ? `${C.ride}55` : C.bdr}`,
                            background: on ? `${C.ride}12` : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', textAlign: 'center', fontFamily: C.F,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: on ? C.ride : C.t1, fontSize: '.74rem' }}>{label}</div>
                          <div style={{ fontSize: '.54rem', color: C.t3, marginTop: 2 }}>
                            {seats} {ar ? 'مقاعد' : 'seats'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2: Passengers ─────────────────────────────────── */}
              {step === 2 && (
                <motion.div key="s2" {...stepMotion} style={{ padding: '20px' }}>
                  <SectionLabel label={ar ? 'عدد المسافرين' : 'PASSENGERS'} />

                  {/* Seat counter */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', borderRadius: 14,
                    background: C.card2, border: `1px solid ${C.bdr}`,
                    marginBottom: 18, flexDirection: rowDir,
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.t0, fontSize: '.86rem' }}>
                        {ar ? 'عدد المقاعد' : 'Number of Seats'}
                      </div>
                      <div style={{ fontSize: '.62rem', color: C.t3, marginTop: 3 }}>
                        JOD {(baseFare * pax).toFixed(2)} {ar ? 'إجمالي' : 'total'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexDirection: rowDir }}>
                      <button
                        onClick={() => setPax(p => Math.max(1, p - 1))}
                        aria-label={ar ? 'تقليل' : 'Decrease'}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          border: `1px solid ${C.bdr}`,
                          background: 'rgba(255,255,255,0.05)',
                          color: C.t1, cursor: 'pointer', fontSize: '1.1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >−</button>
                      <span style={{
                        fontWeight: 900, color: C.ride, fontSize: '1.4rem',
                        minWidth: 24, textAlign: 'center',
                      }}>{pax}</span>
                      <button
                        onClick={() => setPax(p => Math.min(maxPax, p + 1))}
                        aria-label={ar ? 'زيادة' : 'Increase'}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          border: `1px solid ${C.ride}55`,
                          background: `${C.ride}14`,
                          color: C.ride, cursor: 'pointer', fontSize: '1.1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                    </div>
                  </div>

                  {/* Gender preference */}
                  <SectionLabel label={ar ? 'تفضيل الجنس' : 'GENDER PREFERENCE'} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 18 }}>
                    {GENDERS.map(g => {
                      const on = gender === g.k;
                      return (
                        <button
                          key={g.k}
                          onClick={() => setGender(g.k)}
                          aria-pressed={on}
                          style={{
                            padding: '10px 12px', borderRadius: 10,
                            border: `1px solid ${on ? `${C.ride}55` : C.bdr}`,
                            background: on ? `${C.ride}10` : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            flexDirection: rowDir, fontFamily: C.F,
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{g.icon}</span>
                          <div style={{ textAlign: 'start' }}>
                            <div style={{ fontWeight: 700, color: on ? C.ride : C.t1, fontSize: '.72rem' }}>
                              {ar ? g.ar : g.en}
                            </div>
                          </div>
                          {on && <Check size={11} color={C.ride} style={{ marginInlineStart: 'auto' }} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Prayer stop (long trips only) */}
                  {route.km > 80 && (
                    <button
                      onClick={() => setPrayer(p => !p)}
                      aria-pressed={prayer}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12,
                        border: `1px solid ${prayer ? 'rgba(255,184,0,0.44)' : C.bdr}`,
                        background: prayer ? 'rgba(255,184,0,0.07)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                        flexDirection: rowDir, fontFamily: C.F,
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>🕌</span>
                      <div style={{ flex: 1, textAlign: 'start' }}>
                        <div style={{ fontWeight: 700, color: prayer ? '#FFB800' : C.t1, fontSize: '.76rem' }}>
                          {ar ? 'إضافة وقفة للصلاة' : 'Include Prayer Stop'}
                        </div>
                        <div style={{ fontSize: '.60rem', color: C.t3 }}>
                          {ar ? '15-20 دقيقة · بدون رسوم إضافية' : '15-20 min · No extra charge'}
                        </div>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: `2px solid ${prayer ? '#FFB800' : C.bdr}`,
                        background: prayer ? '#FFB800' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {prayer && <Check size={11} color="#000" />}
                      </div>
                    </button>
                  )}
                </motion.div>
              )}

              {/* ─── STEP 3: Payment ────────────────────────────────────── */}
              {step === 3 && (
                <motion.div key="s3" {...stepMotion} style={{ padding: '20px' }}>
                  <SectionLabel label={ar ? 'طريقة الدفع' : 'PAYMENT METHOD'} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
                    {PAYMENTS.map(p => {
                      const on = payment === p.k;
                      return (
                        <button
                          key={p.k}
                          onClick={() => setPayment(p.k)}
                          className="bm-pill"
                          aria-pressed={on}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: on ? `${C.ride}10` : 'rgba(255,255,255,0.02)',
                            borderColor: on ? `${C.ride}55` : C.bdr,
                            flexDirection: rowDir,
                          }}
                        >
                          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{p.icon}</span>
                          <div style={{ flex: 1, textAlign: 'start' }}>
                            <div style={{ fontWeight: 700, color: on ? C.ride : C.t0, fontSize: '.80rem' }}>
                              {ar ? p.ar : p.en}
                            </div>
                            <div style={{ fontSize: '.60rem', color: C.t3 }}>{p.sub}</div>
                          </div>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            border: `2px solid ${on ? C.ride : C.bdr}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {on && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.ride }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Fare breakdown */}
                  <div style={{ padding: '14px', borderRadius: 12, background: C.card2, border: `1px solid ${C.bdr}` }}>
                    <SectionLabel label={ar ? 'تفاصيل السعر' : 'FARE BREAKDOWN'} />
                    {[
                      { l: ar ? `القاعدة (${pax} × JOD ${baseFare.toFixed(2)})` : `Base (${pax} × JOD ${baseFare.toFixed(2)})`, v: `JOD ${totalFare.toFixed(2)}` },
                      { l: ar ? 'ضريبة الخدمة 16%' : 'Service Tax 16%',  v: `JOD ${tax}` },
                      { l: ar ? 'تأمين الرحلة'     : 'Trip Insurance',    v: 'JOD 0.50'  },
                    ].map(row => (
                      <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexDirection: rowDir }}>
                        <span style={{ fontSize: '.67rem', color: C.t2 }}>{row.l}</span>
                        <span style={{ fontSize: '.68rem', fontWeight: 600, color: C.t0 }}>{row.v}</span>
                      </div>
                    ))}
                    <div style={{ height: 1, background: C.bdr, margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: rowDir }}>
                      <span style={{ fontWeight: 800, color: C.t0, fontSize: '.82rem' }}>{ar ? 'الإجمالي' : 'TOTAL'}</span>
                      <span style={{ fontWeight: 900, color: C.green, fontSize: '1.1rem' }}>JOD {grand}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 4: Confirmation + QR Ticket ──────────────────── */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .22 }}
                  style={{ padding: '20px' }}>
                  {!bookingId ? (
                    /* Loading animation */
                    <div style={{ padding: '24px 0', textAlign: 'center' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: 48, height: 48, borderRadius: '50%',
                          border: `3px solid ${C.bdr}`,
                          borderTop: `3px solid ${C.ride}`,
                          margin: '0 auto 24px',
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                        {CONFIRM_STEPS_EN.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: cStep > i ? 0.3 : cStep === i ? 1 : 0.3, y: 0 }}
                            transition={{ delay: i * .1, duration: .3 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: rowDir }}
                          >
                            {cStep > i
                              ? <Check size={14} color={C.green} />
                              : cStep === i
                                ? <motion.div animate={{ opacity: [1, .2, 1] }} transition={{ duration: .9, repeat: Infinity }}
                                    style={{ width: 8, height: 8, borderRadius: '50%', background: C.ride }} />
                                : <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.t4 }} />
                            }
                            <span style={{ fontSize: '.74rem', color: cStep === i ? C.t0 : C.t3 }}>
                              {ar ? CONFIRM_STEPS_AR[i] : s}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ── QR Ticket ─────────────────────────────────────── */
                    <motion.div
                      initial={{ opacity: 0, scale: .90 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: .4, ease: [.22, .1, .25, 1] }}
                      style={{
                        background: 'linear-gradient(145deg,#061428,#0A1E3C)',
                        border: `1px solid rgba(43,143,255,0.30)`,
                        borderRadius: 16, overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.60)',
                      }}
                    >
                      {/* Ticket header */}
                      <div style={{
                        background: 'linear-gradient(135deg,rgba(43,143,255,0.18),rgba(0,212,255,0.08))',
                        padding: '16px 18px',
                        borderBottom: `1px solid rgba(43,143,255,0.16)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexDirection: rowDir,
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: rowDir }}>
                            <MapPin size={12} color={C.ride} />
                            <span style={{ fontWeight: 800, color: C.t0, fontSize: '.78rem' }}>Wasel</span>
                          </div>
                          <div style={{
                            fontSize: '.55rem', color: C.t3, marginTop: 2,
                            letterSpacing: '.12em', textTransform: 'uppercase',
                          }}>
                            {ar ? 'تذكرة رحلة' : 'RIDE TICKET'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'end' }}>
                          <div style={{ fontSize: '.56rem', color: C.t3 }}>{ar ? 'رقم الحجز' : 'Booking ID'}</div>
                          <div style={{ fontWeight: 900, color: C.cyan, fontSize: '.88rem', letterSpacing: '.08em' }}>
                            {bookingId}
                          </div>
                        </div>
                      </div>

                      {/* Route strip */}
                      <div style={{
                        padding: '14px 18px',
                        borderBottom: `1px solid rgba(43,143,255,0.10)`,
                        display: 'flex', alignItems: 'center', gap: 12,
                        flexDirection: rowDir,
                      }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontWeight: 800, color: C.t0 }}>{fromCity.name}</div>
                          <div style={{ fontSize: '.62rem', color: C.t3, fontFamily: 'Cairo,sans-serif' }}>{fromCity.ar}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} style={{ width: 4, height: 2, borderRadius: 1, background: i === 2 ? C.ride : C.t4 }} />
                            ))}
                          </div>
                          <span style={{ fontSize: '.54rem', color: C.t3 }}>{route.km}km</span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontWeight: 800, color: C.t0 }}>{toCity.name}</div>
                          <div style={{ fontSize: '.62rem', color: C.t3, fontFamily: 'Cairo,sans-serif' }}>{toCity.ar}</div>
                        </div>
                      </div>

                      {/* Details + QR */}
                      <div style={{ display: 'flex', flexDirection: rowDir }}>
                        <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            { l: ar ? 'التاريخ'    : 'Date',  v: `${dates[dateIdx].getDate()} ${MONTHS[dates[dateIdx].getMonth()]}` },
                            { l: ar ? 'الوقت'      : 'Time',  v: time },
                            { l: ar ? 'المسافرون'  : 'Pax',   v: `${pax} ${ar ? 'مسافر' : 'passenger'}${pax > 1 && !ar ? 's' : ''}` },
                            { l: ar ? 'النمط'      : 'Mode',  v: mode === 'carpool' ? (ar ? 'كاربول' : 'Carpool') : (ar ? 'فوري' : 'On-Demand') },
                            { l: ar ? 'الإجمالي'  : 'Total', v: `JOD ${grand}` },
                          ].map(row => (
                            <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: rowDir }}>
                              <span style={{ fontSize: '.60rem', color: C.t3 }}>{row.l}</span>
                              <span style={{ fontSize: '.66rem', fontWeight: 700, color: C.t0 }}>{row.v}</span>
                            </div>
                          ))}

                          {/* Driver info */}
                          <div style={{
                            marginTop: 6, padding: '8px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${C.bdr}`,
                            display: 'flex', alignItems: 'center', gap: 8,
                            flexDirection: rowDir,
                          }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: `linear-gradient(135deg,${C.ride},${C.cyan})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '.70rem',
                            }}>👤</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '.63rem', fontWeight: 700, color: C.t0 }}>
                                {ar ? 'أحمد المحمد' : 'Ahmad Al-Mohammad'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexDirection: rowDir }}>
                                <Star size={9} color="#F5A623" />
                                <span style={{ fontSize: '.56rem', color: C.t3 }}>4.9 · Toyota Camry</span>
                              </div>
                            </div>
                            <Phone size={11} color={C.t3} />
                          </div>
                        </div>

                        {/* QR code */}
                        {qr && (
                          <div style={{
                            padding: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderInlineStart: `1px solid rgba(43,143,255,0.12)`,
                          }}>
                            <div style={{ background: '#fff', padding: 6, borderRadius: 8 }}>
                              <svg width={84} height={84} viewBox="0 0 21 21" shapeRendering="crispEdges">
                                {qr.map((row, r) =>
                                  row.map((cell, c) =>
                                    cell
                                      ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#000" />
                                      : null
                                  )
                                )}
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Insurance strip */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px',
                        background: 'rgba(0,232,122,0.06)',
                        borderTop: `1px solid rgba(0,232,122,0.14)`,
                        flexDirection: rowDir,
                      }}>
                        <Shield size={11} color={C.green} />
                        <span style={{ fontSize: '.60rem', color: C.green, fontWeight: 600 }}>
                          {ar ? 'رحلة مؤمنة · واصل ضامن' : 'Trip Insured · Wasel Guaranteed'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Footer navigation ────────────────────────────────────────── */}
          {step < 4 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderTop: `1px solid ${C.bdr}`,
              flexDirection: rowDir,
            }}>
              {step > 0
                ? <button
                    className="bm-btn"
                    onClick={() => setStep(s => s - 1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.04)',
                      color: C.t2, flexDirection: rowDir,
                    }}
                  >
                    {ar ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    {ar ? 'رجوع' : 'Back'}
                  </button>
                : <div />
              }

              {step < 3
                ? <button
                    className="bm-btn"
                    disabled={!canProceed[step]}
                    onClick={() => setStep(s => s + 1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: canProceed[step]
                        ? `linear-gradient(135deg,${C.ride},#1A55E3)`
                        : 'rgba(255,255,255,0.05)',
                      color: canProceed[step] ? '#fff' : C.t3,
                      flexDirection: rowDir,
                    }}
                  >
                    {ar ? 'التالي' : 'Next'}
                    {ar ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                : <button
                    className="bm-btn"
                    onClick={handleBook}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: `linear-gradient(135deg,${C.green},#00AA58)`,
                      color: '#000', fontWeight: 900,
                      flexDirection: rowDir,
                    }}
                  >
                    <Check size={14} />
                    {ar ? `تأكيد · JOD ${grand}` : `Confirm · JOD ${grand}`}
                  </button>
              }
            </div>
          )}

          {/* ── Post-confirmation actions ─────────────────────────────── */}
          {step === 4 && bookingId && (
            <div style={{
              display: 'flex', gap: 10,
              padding: '16px 20px',
              borderTop: `1px solid ${C.bdr}`,
              flexDirection: rowDir,
            }}>
              <button
                className="bm-btn"
                onClick={onClose}
                style={{ flex: 1, background: `linear-gradient(135deg,${C.ride},#1A55E3)`, color: '#fff' }}
              >
                {ar ? 'إغلاق' : 'Close'}
              </button>
              <button
                className="bm-btn"
                style={{ background: 'rgba(255,255,255,0.05)', color: C.t2 }}
              >
                {ar ? 'مشاركة' : 'Share'}
              </button>
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MICRO-COMPONENT: Section label
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: '.65rem', fontWeight: 700, color: C.t3,
      letterSpacing: '.10em', textTransform: 'uppercase',
      marginBottom: 12,
    }}>
      {label}
    </div>
  );
}
