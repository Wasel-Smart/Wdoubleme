/**
 * HowItWorks — /features/carpooling/HowItWorks.tsx
 * BlaBlaCar-model two-sided marketplace explainer for Wasel | واصل
 *
 * Covers:
 *  • Asset-light two-sided marketplace mechanics
 *  • Commission model (12% booking fee — passengers only, NOT drivers)
 *  • Cost-sharing principle (fuel cost coverage, not commercial service)
 *  • Trust & safety (ID verification, ratings, insurance)
 *  • Package delivery integrated feature
 *  • CO₂ environmental impact
 *  • Revenue streams overview
 *  • Network effects
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car, Users, ChevronRight, AlertTriangle, CheckCircle2,
  ChevronDown, Leaf, Star, Shield, Heart, MapPin, Zap,
  BadgeCheck, ArrowRight, Search, CircleDollarSign,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { STANDARD_COMMISSION_RATES } from '../../domains/finance/commissionEngine';

// ─── CO₂ Calculator ──────────────────────────────────────────────────────────
function calcCo2Saved(distKm: number, passengers: number): number {
  const soloEmissions = distKm * 0.12;
  const sharedEmissions = soloEmissions / (passengers + 1);
  return Math.round((soloEmissions - sharedEmissions) * 10) / 10;
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);
  return (
    <motion.span
      onViewportEnter={() => {
        if (started) return;
        setStarted(true);
        let start = 0;
        const t0 = Date.now();
        const dur = 1800;
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          setDisplayed(Math.round((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }}
    >
      {prefix}{displayed.toLocaleString()}{suffix}
    </motion.span>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.section>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full font-bold text-[0.7rem]"
      style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
      {children}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-3"
      >
        <span className="font-semibold text-foreground" style={{ fontSize: '0.9rem' }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p className="pb-4 text-muted-foreground" style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export function HowItWorks() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const commissionRate = Math.round(STANDARD_COMMISSION_RATES.carpooling * 100);
  const [tab, setTab] = useState<'traveler' | 'passenger'>('traveler');

  const exRidePrice = 8;
  const exSeats     = 3;
  const exGross     = exRidePrice * exSeats;
  const exFee       = +(exGross * commissionRate / 100).toFixed(3);
  const exDriver    = +(exGross - exFee).toFixed(3);
  const exFuel      = 23.76;
  const exNetDriver = +(exDriver - exFuel).toFixed(2);
  const exCo2       = calcCo2Saved(330, exSeats);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--background)' }} dir={ar ? 'rtl' : 'ltr'}>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(4,173,191,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(4,173,191,0.25), rgba(9,115,46,0.2))', border: '1px solid rgba(4,173,191,0.3)' }}>
                <Car className="w-6 h-6" style={{ color: '#04ADBF' }} />
              </div>
              <div>
                <h1 className="font-black text-foreground" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900 }}>
                  {ar ? 'كيف يشتغل واصل؟' : 'How Wasel Works'}
                </h1>
                <p className="text-muted-foreground" style={{ fontSize: '0.9rem' }}>
                  {ar ? 'منصة مشاركة رحلات للسوق العربي — مثل BlaBlaCar بس بروح شرقية' : 'Peer-to-peer ride-sharing for the Arab world — like BlaBlaCar, built for our culture'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[
                { icon: '🚗', label: ar ? 'رحلة متاحة/أسبوع' : 'rides/week', value: <AnimatedNumber value={340} suffix="+" />, color: '#04ADBF' },
                { icon: '👥', label: ar ? 'مستخدم نشط' : 'active users', value: <AnimatedNumber value={12400} suffix="+" />, color: '#09732E' },
                { icon: '🌿', label: ar ? 'طن CO₂ وُفّر' : 'tonnes CO₂ saved', value: <AnimatedNumber value={892} />, color: '#22C55E' },
                { icon: '📦', label: ar ? 'طرد تم توصيله' : 'packages delivered', value: <AnimatedNumber value={5600} suffix="+" />, color: '#D9965B' },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-2xl text-center"
                  style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="font-black" style={{ color: stat.color, fontSize: '1.4rem', fontWeight: 900 }}>{stat.value}</div>
                  <div className="text-muted-foreground" style={{ fontSize: '0.7rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 space-y-12">

        <Section>
          <h2 className="font-black text-foreground mb-6" style={{ fontSize: '1.3rem', fontWeight: 900 }}>
            {ar ? '✅ واصل هو...' : '✅ Wasel is...'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl space-y-3"
              style={{ background: 'rgba(9,115,46,0.07)', border: '1px solid rgba(9,115,46,0.18)' }}>
              <h3 className="font-bold text-emerald-400 flex items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <CheckCircle2 className="w-4 h-4" />
                {ar ? 'نحن نقدم' : 'We ARE'}
              </h3>
              {[
                ar ? 'مشاركة رحلات طويلة المسافة (50–500 كم)' : 'Long-distance carpooling (50–500 km)',
                ar ? 'حجز مسبق 24+ ساعة مسبقاً' : 'Advance booking (24h+ ahead)',
                ar ? 'تقاسم التكاليف — غطّي البنزين فقط' : 'Cost-sharing — cover fuel only',
                ar ? 'ناس عاديون يسافرون أصلاً' : 'Regular people already travelling',
                ar ? 'توصيل طرود مع المسافرين' : 'Package delivery via travellers',
                ar ? 'ميزات ثقافية: صلاة، جنس، رمضان' : 'Cultural features: prayer stops, gender, Ramadan',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span style={{ color: 'var(--foreground)', fontSize: '0.85rem' }}>{t}</span>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl space-y-3"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <h3 className="font-bold text-red-400 flex items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <AlertTriangle className="w-4 h-4" />
                {ar ? 'نحن لسنا' : 'We are NOT'}
              </h3>
              {[
                ar ? 'طلب فوري مثل أوبر / كريم' : 'On-demand like Uber / Careem',
                ar ? 'سائقين محترفين / عمال gig' : 'Professional drivers / gig workers',
                ar ? 'رحلات قصيرة داخل المدينة' : 'Short intra-city trips',
                ar ? 'أسعار ديناميكية أو surge pricing' : 'Dynamic or surge pricing',
                ar ? 'بديل عن التاكسي' : 'A taxi alternative',
                ar ? 'منافس لأوبر أو كريم' : 'A competitor to Uber or Careem',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5">
                  <span className="text-red-400 shrink-0 mt-0.5 font-black" style={{ fontSize: '0.85rem' }}>✕</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.05}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-black text-foreground" style={{ fontSize: '1.3rem', fontWeight: 900 }}>
              {ar ? '🔄 كيف تشتغل السوق؟' : '🔄 Two-Sided Marketplace'}
            </h2>
            <Pill color="#04ADBF">{ar ? 'نموذج BlaBlaCar' : 'BlaBlaCar Model'}</Pill>
          </div>
          <p className="text-muted-foreground mb-6" style={{ fontSize: '0.875rem' }}>
            {ar
              ? 'واصل وسيط بين المسافرين والركاب — لا يملك سيارات، فقط يربط الناس'
              : 'Wasel is a pure intermediary between travellers & passengers — no fleet, just connections'}
          </p>

          <div className="flex gap-2 p-1 rounded-2xl mb-6 w-fit" style={{ background: 'rgba(30,41,59,0.5)' }}>
            {[
              { id: 'traveler', en: '🚗 I\'m a Traveller', ar: '🚗 أنا مسافر' },
              { id: 'passenger', en: '🎫 I\'m a Passenger', ar: '🎫 أنا راكب' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className="px-4 py-2 rounded-xl font-bold transition-all"
                style={{
                  background: tab === t.id ? 'linear-gradient(135deg, #09732E, #04ADBF)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--muted-foreground)',
                  fontSize: '0.85rem',
                }}>
                {ar ? t.ar : t.en}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'traveler' ? (
              <motion.div key="traveler" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="space-y-3">
                {[
                  { n: 1, icon: '📍', en: 'Post your ride (origin, destination, date/time, price per seat)', ar: 'انشر رحلتك (المسار، التاريخ، السعر لكل مقعد)' },
                  { n: 2, icon: '🗣️', en: 'Set your conversation level: Quiet 🤫 / Normal 💬 / Talkative 🗣️', ar: 'حدد مستوى الكلام: صامت 🤫 / عادي 💬 / ثرثار 🗣️' },
                  { n: 3, icon: '🎯', en: 'Passengers search & book your available seats', ar: 'الركاب يبحثون ويحجزون مقاعدك المتاحة' },
                  { n: 4, icon: '💵', en: 'Wasel holds payment securely — released to you after the trip', ar: 'واصل يحتفظ بالدفع — يُحوَّل إليك بعد انتهاء الرحلة' },
                  { n: 5, icon: '⭐', en: 'Rate each other — build your trusted traveller reputation', ar: 'قيّم بعضكم — ابنِ سمعتك كمسافر موثوق' },
                  { n: 6, icon: '💰', en: `You keep ${100 - commissionRate}% — Wasel takes ${commissionRate}% service fee (NOT the driver)`, ar: `تحتفظ بـ ${100 - commissionRate}% — واصل تأخذ ${commissionRate}% عمولة خدمة (ليس أنت)` },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--card)', border: '1px solid rgba(9,115,46,0.15)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.3), rgba(4,173,191,0.2))', color: '#04ADBF' }}>
                      {step.n}
                    </div>
                    <div>
                      <span className="text-lg mr-2">{step.icon}</span>
                      <span style={{ color: 'var(--foreground)', fontSize: '0.875rem' }}>{ar ? step.ar : step.en}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="passenger" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="space-y-3">
                {[
                  { n: 1, icon: '🔍', en: 'Search rides by route, date & seat count', ar: 'ابحث عن رحلات حسب المسار والتاريخ والمقاعد' },
                  { n: 2, icon: '🌿', en: 'See CO₂ savings per trip — sharing is caring for the planet', ar: 'شوف كم CO₂ ستوفر — المشاركة تفيد الكوكب' },
                  { n: 3, icon: '🎫', en: 'Book a seat — platform fee (12%) added transparently at checkout', ar: 'احجز مقعداً — رسوم المنصة (12%) تُضاف بشفافية عند الدفع' },
                  { n: 4, icon: '💵', en: 'Pay online (5% discount) or cash on arrival — your choice', ar: 'ادفع أونلاين (خصم 5%) أو نقداً عند الوصول — اختيارك' },
                  { n: 5, icon: '📍', en: 'Meet the traveller at pickup point — ID/QR verified', ar: 'التقِ بالمسافر في نقطة الالتقاء — التحقق بـ QR' },
                  { n: 6, icon: '⭐', en: 'Rate your ride — help build the community of trust', ar: 'قيّم رحلتك — ساعد في بناء مجتمع الثقة' },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--card)', border: '1px solid rgba(4,173,191,0.12)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(4,173,191,0.3), rgba(9,115,46,0.2))', color: '#04ADBF' }}>
                      {step.n}
                    </div>
                    <div>
                      <span className="text-lg mr-2">{step.icon}</span>
                      <span style={{ color: 'var(--foreground)', fontSize: '0.875rem' }}>{ar ? step.ar : step.en}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section delay={0.08}>
          <h2 className="font-black text-foreground mb-2" style={{ fontSize: '1.3rem', fontWeight: 900 }}>
            💰 {ar ? 'كيف تُحسب الأسعار؟' : 'How Pricing Works'}
          </h2>
          <p className="text-muted-foreground mb-6" style={{ fontSize: '0.875rem' }}>
            {ar
              ? `مثال حقيقي: عمّان ← العقبة (330 كم) — ${exSeats} مقاعد`
              : `Real example: Amman → Aqaba (330 km) — ${exSeats} seats`}
          </p>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-5" style={{ background: 'rgba(4,173,191,0.05)' }}>
              <p className="font-bold mb-4 flex items-center gap-2" style={{ color: '#04ADBF', fontSize: '0.875rem' }}>
                <Users className="w-4 h-4" />
                {ar ? `الركاب يدفعون (${exSeats} مقاعد × ${exRidePrice} د.أ)` : `Passengers pay (${exSeats} seats × ${exRidePrice} JOD)`}
              </p>
              <div className="space-y-2">
                {[
                  { label: ar ? 'سعر المقعد × عدد المقاعد' : 'Seat price × seats', value: `${exGross} JOD`, muted: false },
                  { label: ar ? `رسوم خدمة واصل (${commissionRate}%)` : `Wasel service fee (${commissionRate}%)`, value: `+ ${exFee} JOD`, muted: true, note: ar ? 'تُحسب على الراكب — ليس السائق' : 'Charged to passenger — NOT driver' },
                  { label: ar ? 'الإجمالي الذي يدفعه الراكب' : 'Total passenger pays', value: `${(exGross + exFee).toFixed(3)} JOD`, bold: true, color: '#04ADBF' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <div>
                      <span style={{ color: row.muted ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: '0.85rem' }}>{row.label}</span>
                      {row.note && <p style={{ color: 'rgba(4,173,191,0.7)', fontSize: '0.68rem' }}>{row.note}</p>}
                    </div>
                    <span className="font-black shrink-0" style={{ color: row.color || 'var(--foreground)', fontWeight: row.bold ? 900 : 600, fontSize: row.bold ? '1rem' : '0.875rem' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            <div className="p-5 grid md:grid-cols-2 gap-4" style={{ background: 'var(--card)' }}>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(9,115,46,0.07)', border: '1px solid rgba(9,115,46,0.18)' }}>
                <p className="font-bold text-emerald-400 flex items-center gap-1.5 mb-3" style={{ fontSize: '0.8rem' }}>
                  <Car className="w-3.5 h-3.5" /> {ar ? 'السائق يحصل' : 'Driver receives'}
                </p>
                <p className="font-black" style={{ color: '#22C55E', fontSize: '1.5rem', fontWeight: 900 }}>{exDriver} JOD</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem', marginTop: 4 }}>
                  {ar ? `تكلفة البنزين الفعلية: ${exFuel} JOD` : `Actual fuel cost: ${exFuel} JOD`}<br />
                  {ar ? `صافي ما يوفر السائق: ${exNetDriver} JOD` : `Net cost to driver: ${exNetDriver} JOD`}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(217,150,91,0.07)', border: '1px solid rgba(217,150,91,0.18)' }}>
                <p className="font-bold flex items-center gap-1.5 mb-3" style={{ color: '#D9965B', fontSize: '0.8rem' }}>
                  <CircleDollarSign className="w-3.5 h-3.5" /> {ar ? 'واصل تحصل' : 'Wasel earns'}
                </p>
                <p className="font-black" style={{ color: '#D9965B', fontSize: '1.5rem', fontWeight: 900 }}>{exFee} JOD</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem', marginTop: 4 }}>
                  {ar ? `عمولة ${commissionRate}% × ${exGross} JOD` : `${commissionRate}% commission × ${exGross} JOD`}<br />
                  {ar ? 'تكفي التشغيل والأمان والدعم' : 'Covers operations, safety & support'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#F59E0B' }}>{ar ? 'سقف الأسعار:' : 'Price cap:'}</strong>{' '}
              {ar
                ? 'لا يمكن للسائق الربح — السعر الأقصى هو 3× تكلفة الوقود. واصل يراقب هذا لضمان روح تقاسم التكلفة.'
                : 'Drivers cannot profit excessively. Max price is capped at 3× fuel cost per seat. Wasel monitors this to preserve the cost-sharing spirit.'}
            </p>
          </div>
        </Section>

        <Section delay={0.1}>
          <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(4,173,191,0.04))', border: '1px solid rgba(34,197,94,0.18)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-black text-foreground" style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                  🌿 {ar ? 'أثر واصل على البيئة' : 'Environmental Impact'}
                </h2>
                <p style={{ color: '#22C55E', fontSize: '0.78rem' }}>
                  {ar ? 'كل رحلة مشتركة = أقل CO₂' : 'Every shared ride = less CO₂'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: ar ? 'كغ CO₂ يوفرها كل راكب (عمّان→العقبة)' : 'kg CO₂ saved per passenger (Amman→Aqaba)', value: exCo2, unit: 'kg', color: '#22C55E' },
                { label: ar ? 'طن CO₂ تم توفيرها هذا العام' : 'tonnes CO₂ saved this year', value: 892, unit: 't', color: '#04ADBF' },
                { label: ar ? 'شجرة مكافئة' : 'equivalent trees', value: 4200, unit: '🌳', color: '#09732E' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="font-black" style={{ color: stat.color, fontSize: '1.6rem', fontWeight: 900 }}>
                    <AnimatedNumber value={stat.value} />
                    <span style={{ fontSize: '0.9rem' }}>{stat.unit}</span>
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.68rem', marginTop: 4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.12}>
          <h2 className="font-black text-foreground mb-2" style={{ fontSize: '1.3rem', fontWeight: 900 }}>
            🛡️ {ar ? 'الثقة والأمان' : 'Trust & Safety'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: BadgeCheck, en: 'ID Verification', ar: 'التحقق من الهوية', sub_en: 'National ID, passport or driving licence', sub_ar: 'هوية وطنية أو جواز سفر', color: '#04ADBF' },
              { icon: Star, en: 'Ratings & Reviews', ar: 'التقييمات', sub_en: 'Two-way trust after every ride', sub_ar: 'ثقة متبادلة بعد كل رحلة', color: '#F59E0B' },
              { icon: Shield, en: 'Insurance', ar: 'التأمين', sub_en: 'JOD 0.50 basic / JOD 2 premium per package', sub_ar: '0.50 د.أ أساسي / 2 د.أ مميز للطرد', color: '#22C55E' },
              { icon: Heart, en: 'Gender Preferences', ar: 'تفضيلات الجنس', sub_en: 'Women-only, men-only, family-only', sub_ar: 'نساء فقط / رجال / عائلة', color: '#EC4899' },
              { icon: MapPin, en: 'Prayer Stops', ar: 'وقفات الصلاة', sub_en: 'Auto-calculated on every route', sub_ar: 'تُحسب تلقائياً على كل مسار', color: '#8B5CF6' },
              { icon: Zap, en: 'QR Verification', ar: 'التحقق بـ QR', sub_en: 'Pickup & delivery confirmation', sub_ar: 'تأكيد الركوب والوصول', color: '#D9965B' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.en} className="p-4 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                    <Icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <p className="font-bold text-foreground mb-1" style={{ fontSize: '0.82rem' }}>{ar ? f.ar : f.en}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem' }}>{ar ? f.sub_ar : f.sub_en}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section delay={0.16}>
          <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(4,173,191,0.06), rgba(9,115,46,0.04))', border: '1px solid rgba(4,173,191,0.15)' }}>
            <h2 className="font-black text-foreground mb-2" style={{ fontSize: '1.1rem', fontWeight: 900 }}>
              🌐 {ar ? 'أثر الشبكة' : 'Network Effects'}
            </h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              {ar
                ? 'كلما زاد عدد المسافرين على واصل، زادت الرحلات المتاحة، فجذبت ركاباً أكثر، فجذبت مسافرين أكثر — وهكذا دواليك.'
                : 'More travellers post rides → more rides available → more passengers join → more travellers attracted → and so on. Both sides win together.'}
            </p>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <Pill color="#04ADBF">{ar ? 'المزيد من المسافرين →' : 'More Travellers →'}</Pill>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Pill color="#09732E">{ar ? 'المزيد من الرحلات →' : 'More Rides →'}</Pill>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Pill color="#D9965B">{ar ? 'المزيد من الركاب →' : 'More Passengers →'}</Pill>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Pill color="#8B5CF6">{ar ? 'مزيد من النمو ∞' : 'More Growth ∞'}</Pill>
            </div>
          </div>
        </Section>

        <Section delay={0.2}>
          <h2 className="font-black text-foreground mb-6" style={{ fontSize: '1.3rem', fontWeight: 900 }}>
            ❓ {ar ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="rounded-2xl overflow-hidden px-5" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              {
                q: ar ? 'هل أنا كسائق مسؤول عن إيجاد الركاب؟' : 'Am I as a driver responsible for finding passengers?',
                a: ar ? 'لا — بمجرد نشر رحلتك، ستظهر للركاب الباحثين على المسار نفسه.' : 'No — once you post your ride, it appears to passengers searching that route.',
              },
              {
                q: ar ? 'متى أحصل على أموالي كمسافر؟' : 'When do I get paid as a traveller?',
                a: ar ? 'واصل يحتجز الدفع بأمان ويُحوّله إليك بعد انتهاء الرحلة وتأكيد الراكب بالـ QR.' : 'Wasel holds payment securely and releases it to you after the trip is confirmed via QR.',
              },
              {
                q: ar ? 'هل يمكنني الربح من الرحلات؟' : 'Can I make a profit from rides?',
                a: ar ? 'لا — واصل منصة تقاسم تكاليف. الهدف هو تغطية تكلفة الوقود والاهتراء فقط.' : 'No — Wasel is a cost-sharing platform. The goal is to cover fuel and wear-and-tear only.',
              },
              {
                q: ar ? 'ما الذي يحدث إذا ألغى الراكب؟' : 'What happens if a passenger cancels?',
                a: ar ? 'الإلغاء مجاني قبل 12 ساعة من الرحلة. بعد ذلك تُطبّق رسوم إلغاء بسيطة.' : 'Cancellation is free up to 12 hours before the ride. After that, a small cancellation fee applies.',
              },
              {
                q: ar ? 'كيف واصل يختلف عن أوبر أو كريم؟' : 'How is Wasel different from Uber or Careem?',
                a: ar ? 'أوبر وكريم = تاكسي فوري بسائقين محترفين. واصل = مشاركة رحلات مسبقة بين ناس عاديين يتقاسمون تكلفة البنزين.' : 'Uber/Careem = instant taxi with professional drivers. Wasel = advance ride-sharing between regular people splitting fuel cost.',
              },
            ].map(faq => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </Section>

        <Section delay={0.22}>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/app/find-ride')}
              className="p-5 rounded-2xl text-left relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, rgba(4,173,191,0.15), rgba(9,115,46,0.1))', border: '1px solid rgba(4,173,191,0.25)' }}>
              <Search className="w-8 h-8 mb-3" style={{ color: '#04ADBF' }} />
              <p className="font-black text-foreground" style={{ fontSize: '1rem', fontWeight: 900 }}>{ar ? 'ابحث عن رحلة' : 'Find a Ride'}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', marginTop: 4 }}>{ar ? 'دور على مسافر بيروح نفس وجهتك' : 'Find someone already going your way'}</p>
              <ChevronRight className={`w-5 h-5 absolute bottom-5 ${ar ? 'left-5' : 'right-5'} text-muted-foreground group-hover:text-primary transition-colors`} />
            </motion.button>
            <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/app/offer-ride')}
              className="p-5 rounded-2xl text-left relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.15), rgba(4,173,191,0.1))', border: '1px solid rgba(9,115,46,0.25)' }}>
              <Car className="w-8 h-8 mb-3" style={{ color: '#22C55E' }} />
              <p className="font-black text-foreground" style={{ fontSize: '1rem', fontWeight: 900 }}>{ar ? 'انشر رحلتك' : 'Post a Ride'}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', marginTop: 4 }}>{ar ? 'غطّي البنزين وخلّي الرحلة تستاهل' : 'Cover your fuel and make the trip worthwhile'}</p>
              <ChevronRight className={`w-5 h-5 absolute bottom-5 ${ar ? 'left-5' : 'right-5'} text-muted-foreground group-hover:text-primary transition-colors`} />
            </motion.button>
          </div>
        </Section>

      </div>
    </div>
  );
}
