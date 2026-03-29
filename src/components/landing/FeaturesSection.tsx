/**
 * FeaturesSection — Wasel | واصل
 * Single-brand. BlaBlaCar model. No surge pricing. No Awasel split.
 * v4.0 — Accurate, token-compliant, bilingual Jordanian dialect
 */

import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  CircleDollarSign, ShieldCheck, Users,
  CheckCircle, CalendarDays, MapPin, Star,
  Award, ThumbsUp, Package, Heart, Globe,
  Sparkles, Zap, Calculator, ArrowRight,
  TrendingDown, Clock,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCount({ to, dur = 1800, suffix = '', prefix = '' }: { to: number; dur?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inV = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  const hasRun = useRef(false);

  if (inV && !hasRun.current) {
    hasRun.current = true;
    let elapsed = 0;
    const interval = 16;
    const t = setInterval(() => {
      elapsed += interval;
      const p = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p >= 1) clearInterval(t);
    }, interval);
  }

  return <span ref={ref}>{prefix}{val > 0 ? val.toLocaleString() : to.toLocaleString()}{suffix}</span>;
}

// ─── Inline animated stat ──────────────────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center px-4 py-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <p className="font-black" style={{ color, fontSize: '1.5rem', fontWeight: 900 }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
    </div>
  );
}

// ─── Feature card ──────────────────────────────────────────────────────────────
interface FeatCard {
  icon: React.ElementType;
  titleEn: string;  titleAr: string;
  descEn: string;   descAr: string;
  points: { en: string; ar: string }[];
  stats: { label: string; value: string }[];
  color: string;
  delay: number;
}

function FeatureCard({ icon: Icon, titleEn, titleAr, descEn, descAr, points, stats, color, delay }: FeatCard) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inV ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="relative rounded-3xl overflow-hidden cursor-pointer group"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Color top strip */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

      <div className="p-6" dir={dir}>
        {/* Icon */}
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${color}14`, border: `1px solid ${color}30` }}
          animate={open ? { rotate: [0, -8, 8, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </motion.div>

        {/* Title */}
        <h3 className="mb-2 text-foreground" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          {ar ? titleAr : titleEn}
        </h3>
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          {ar ? descAr : descEn}
        </p>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((s, i) => (
            <Stat key={i} label={s.label} value={s.value} color={color} />
          ))}
        </div>

        {/* Expandable bullets */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t pt-4 mt-1 space-y-2.5" style={{ borderColor: 'var(--border)' }}>
                {points.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: ar ? 16 : -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {ar ? p.ar : p.en}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand hint */}
        <motion.div
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--muted-foreground)' }}
          animate={{ x: open ? (ar ? -2 : 2) : 0 }}
        >
          <span>{open ? (ar ? 'إخفاء' : 'Show Less') : (ar ? 'اعرف أكثر' : 'Learn More')}</span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{ transform: open ? 'rotate(90deg)' : ar ? 'scaleX(-1)' : 'none' }}
          />
        </motion.div>
      </div>

      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ border: `1.5px solid ${color}45` }}
      />
    </motion.div>
  );
}

// ─── Cost Sharing Calculator — BlaBlaCar model (Wasel vs. Taxi vs. Bus) ───────
function CostSharingCalculator() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';
  const [km, setKm] = useState(150);

  const wasel  = +(km * 0.045).toFixed(2);           // cost-sharing
  const taxi   = +(km * 0.80).toFixed(2);            // Jordan taxi
  const bus    = +(km * 0.018).toFixed(2);           // public bus
  const savVsTaxi = Math.round((1 - wasel / taxi) * 100);

  const PRESETS = [
    { en: 'Amman→Zarqa', ar: 'عمّان→زرقا', km: 30 },
    { en: 'Amman→Irbid', ar: 'عمّان→إربد', km: 85 },
    { en: 'Amman→Dead Sea', ar: 'عمّان→البحر الميت', km: 60 },
    { en: 'Amman→Aqaba', ar: 'عمّان→العقبة', km: 330 },
  ];

  const options = [
    { labelEn: 'Taxi / Careem', labelAr: 'تاكسي / كريم', value: taxi, color: '#EF4444', icon: '🚕', badgeEn: 'Most Expensive', badgeAr: 'الأغلى' },
    { labelEn: 'Wasel Carpool', labelAr: 'واصل (مشاركة)', value: wasel, color: '#04ADBF', icon: '🚗', badgeEn: `Save ${savVsTaxi}%`, badgeAr: `وفّر ${savVsTaxi}٪`, highlighted: true },
    { labelEn: 'Public Bus', labelAr: 'باص عام', value: bus, color: '#94A3B8', icon: '🚌', badgeEn: 'No comfort / fixed', badgeAr: 'ثابت / غير مريح' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto mb-16"
    >
      <div
        className="rounded-3xl p-6 sm:p-8"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6" dir={dir}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(4,173,191,0.1)', border: '1px solid rgba(4,173,191,0.2)', color: '#04ADBF' }}
          >
            <Calculator className="w-3.5 h-3.5" />
            {ar ? 'حاسبة تقاسم التكلفة' : 'Cost-Sharing Calculator'}
          </div>
          <h3 className="text-foreground mb-1" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
            {ar ? 'كم تدفع مقابل كل خيار؟' : 'How Much Per Option?'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {ar ? 'حرّك الشريط — الأسعار بالدينار الأردني للشخص الواحد' : 'Drag the slider — prices in JOD per person'}
          </p>
        </div>

        {/* Route presets */}
        <div className="flex flex-wrap gap-2 justify-center mb-5" dir={dir}>
          {PRESETS.map(p => (
            <button
              key={p.km}
              onClick={() => setKm(p.km)}
              className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
              style={{
                background: km === p.km ? 'rgba(4,173,191,0.14)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${km === p.km ? 'rgba(4,173,191,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: km === p.km ? '#04ADBF' : 'var(--muted-foreground)',
              }}
            >
              {ar ? p.ar : p.en}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="mb-7" dir="ltr">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{ar ? 'المسافة' : 'Distance'}</span>
            <span className="font-black" style={{ color: '#04ADBF', fontSize: '1.15rem' }}>{km} km</span>
          </div>
          <input
            type="range" min={15} max={400} step={5} value={km}
            onChange={e => setKm(+e.target.value)}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #04ADBF 0%, #04ADBF ${((km - 15) / 385) * 100}%, rgba(255,255,255,0.1) ${((km - 15) / 385) * 100}%, rgba(255,255,255,0.1) 100%)` }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
            <span>15 km</span><span>400 km</span>
          </div>
        </div>

        {/* Price cards */}
        <div className="grid sm:grid-cols-3 gap-4" dir={dir}>
          {options.map((opt, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{
                background: opt.highlighted ? `${opt.color}10` : 'rgba(255,255,255,0.02)',
                border: `1.5px solid ${opt.highlighted ? `${opt.color}40` : 'rgba(255,255,255,0.06)'}`,
                boxShadow: opt.highlighted ? `0 0 32px ${opt.color}15` : 'none',
              }}
            >
              {/* Top accent */}
              {opt.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: opt.color }} />
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{opt.icon}</span>
                <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                  {ar ? opt.labelAr : opt.labelEn}
                </p>
              </div>

              <div className="mb-3">
                <span className="font-black" style={{ color: opt.color, fontSize: '1.75rem' }}>
                  JOD {opt.value}
                </span>
                <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>/{ar ? 'شخص' : 'person'}</span>
              </div>

              <span
                className="inline-block text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: `${opt.color}14`,
                  color: opt.color,
                  border: `1px solid ${opt.color}25`,
                }}
              >
                {ar ? opt.badgeAr : opt.badgeEn}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Insight footer */}
        <motion.div
          key={km}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: 'rgba(4,173,191,0.05)', border: '1px solid rgba(4,173,191,0.12)' }}
          dir={dir}
        >
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#04ADBF' }} />
          <p className="text-xs" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
            {ar
              ? `عند ${km} كم، واصل يكلّفك ${wasel} دينار — ${savVsTaxi}٪ أرخص من التاكسي (${taxi} دينار). أسعار ثابتة — لا تسعير متغير.`
              : `At ${km} km, Wasel costs JOD ${wasel} — ${savVsTaxi}% cheaper than a taxi (JOD ${taxi}). Fixed prices — no surge pricing ever.`}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Platform Stats Row ────────────────────────────────────────────────────────
function PlatformStats() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, { once: true });

  const stats = [
    { value: '50K+', labelEn: 'Active Users', labelAr: 'مستخدم نشط', color: '#04ADBF', icon: Users },
    { value: '125K+', labelEn: 'Trips Completed', labelAr: 'رحلة مكتملة', color: '#09732E', icon: MapPin },
    { value: '70%', labelEn: 'Avg. Savings vs Taxi', labelAr: 'توفير مقارنة بالتاكسي', color: '#22C55E', icon: TrendingDown },
    { value: '4.9★', labelEn: 'App Rating', labelAr: 'تقييم التطبيق', color: '#F59E0B', icon: Star },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inV ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="rounded-3xl p-8 mb-16"
      style={{ background: 'linear-gradient(135deg, rgba(4,173,191,0.06) 0%, rgba(9,115,46,0.06) 100%)', border: '1px solid var(--border)' }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={inV ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="text-center"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: `${s.color}14`, border: `1px solid ${s.color}25` }}
            >
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <p className="font-black mb-1" style={{ color: s.color, fontSize: '1.6rem' }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {ar ? s.labelAr : s.labelEn}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function FeaturesSection() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  const features: FeatCard[] = [
    {
      icon: CircleDollarSign,
      titleEn: 'True Cost-Sharing',
      titleAr: 'تقاسم التكلفة الحقيقي',
      descEn: 'Split fuel costs with fellow travelers. Fixed prices — no surge, ever.',
      descAr: 'قسّم تكلفة البنزين مع المسافرين. أسعار ثابتة — لا تسعير متغير أبداً.',
      stats: [
        { label: ar ? 'توفير مقارنة بالتاكسي' : 'vs. Taxi', value: '70%' },
        { label: ar ? 'عمّان→العقبة' : 'Amman→Aqaba', value: 'JOD 8' },
      ],
      points: [
        { en: 'Fuel cost split among passengers — not a professional fare', ar: 'تكلفة بنزين تتوزع على الركاب — مش أجرة مهنية' },
        { en: 'Fixed per-seat pricing calculated from actual fuel cost', ar: 'سعر ثابت للمقعد محسوب من التكلفة الفعلية للوقود' },
        { en: 'No surge pricing — ever. Even on Eid and holidays', ar: 'لا تسعير متغير أبداً — حتى في العيد والإجازات' },
        { en: 'Transparent JOD pricing, no hidden fees', ar: 'أسعار شفافة بالدينار الأردني، بدون رسوم مخفية' },
        { en: 'Cash on Arrival option for those without cards', ar: 'خيار الدفع نقداً عند الوصول لمن ليس لديه بطاقة' },
      ],
      color: '#04ADBF',
      delay: 0,
    },
    {
      icon: CalendarDays,
      titleEn: 'Advance Booking',
      titleAr: 'الحجز المسبق',
      descEn: 'Book your seat 24h+ ahead. Browse by date and route, not by impulse.',
      descAr: 'احجز مقعدك قبل ٢٤ ساعة أو أكثر. تصفح بالتاريخ والطريق — مش رحلات فورية.',
      stats: [
        { label: ar ? 'حجز مسبق' : 'Advance booking', value: '24h+' },
        { label: ar ? 'معدل نجاح الحجز' : 'Booking success', value: '80%+' },
      ],
      points: [
        { en: 'Travelers post rides days in advance — you browse and pick', ar: 'المسافرون ينشرون رحلاتهم مسبقاً — أنت تتصفح وتختار' },
        { en: 'Calendar view shows all available rides on your route', ar: 'عرض التقويم يظهر كل الرحلات المتاحة على طريقك' },
        { en: 'Drivers are regular people going that way anyway', ar: 'السائقون أشخاص عاديون رايحين نفس الوجهة أصلاً' },
        { en: 'Recurring rides for daily commuters (Amman↔Zarqa)', ar: 'رحلات متكررة للمتنقلين اليوميين (عمّان↔زرقا)' },
      ],
      color: '#09732E',
      delay: 0.12,
    },
    {
      icon: ShieldCheck,
      titleEn: 'Sanad eKYC Trust',
      titleAr: 'أمان سند eKYC',
      descEn: "Jordan's official government identity verification — every single traveler.",
      descAr: 'التحقق الحكومي الرسمي من الهوية — كل مسافر بدون استثناء.',
      stats: [
        { label: ar ? 'مستخدمون موثقون' : 'Verified users', value: '100%' },
        { label: ar ? 'درجة الأمان' : 'Safety score', value: '9.8/10' },
      ],
      points: [
        { en: 'Sanad — Jordan government ID verification in real-time', ar: 'سند — توثيق هوية حكومي أردني فوري' },
        { en: 'National ID + face liveness match against gov\'t database', ar: 'الرقم الوطني + مطابقة وجه مع قاعدة بيانات الحكومة' },
        { en: 'Women-only rides: female driver + verified female passengers', ar: 'رحلات نساء فقط: سائقة + ركاب إناث موثقات' },
        { en: '24/7 emergency SOS with live location sharing', ar: 'طوارئ SOS على مدار الساعة مع مشاركة الموقع الحي' },
        { en: 'Trip sharing to trusted contacts before every ride', ar: 'مشاركة تفاصيل الرحلة مع جهات اتصال موثوقة' },
      ],
      color: '#D9965B',
      delay: 0.24,
    },
    {
      icon: Heart,
      titleEn: 'Built for the Middle East',
      titleAr: 'مبني للشرق الأوسط',
      descEn: 'Prayer stops, gender preferences, Ramadan mode — features no Western app has.',
      descAr: 'وقفات صلاة، تفضيلات جنس، وضع رمضان — ميزات ما عندها أي تطبيق غربي.',
      stats: [
        { label: ar ? 'خيارات الجنس' : 'Gender options', value: '4' },
        { label: ar ? 'وضع رمضان' : 'Ramadan mode', value: '✓' },
      ],
      points: [
        { en: 'Prayer stop auto-calculation based on departure time', ar: 'حساب تلقائي لوقفات الصلاة بناءً على وقت الانطلاق' },
        { en: 'Gender options: Mixed, Women-only, Men-only, Family-only', ar: 'خيارات الجنس: مختلط، نساء فقط، رجال فقط، عائلة فقط' },
        { en: 'Ramadan mode: iftar-timed arrivals, fasting etiquette', ar: 'وضع رمضان: وصول بوقت الإفطار، احترام آداب الصيام' },
        { en: 'Hijab privacy: hide profile photo, use nickname', ar: 'خصوصية الحجاب: إخفاء الصورة، استخدام اسم مستعار' },
        { en: 'Cash on Arrival — 40% of Jordanians prefer cash', ar: 'دفع عند الوصول — ٤٠٪ من الأردنيين يفضلون النقد' },
      ],
      color: '#EC4899',
      delay: 0.36,
    },
  ];

  const trustBadges = [
    { icon: Award,     labelEn: 'ISO Certified',    labelAr: 'معتمد ISO',     color: '#F59E0B' },
    { icon: ShieldCheck, labelEn: '100% Secure',    labelAr: 'آمن ١٠٠٪',      color: '#04ADBF' },
    { icon: ThumbsUp,  labelEn: '98% Satisfaction', labelAr: '٩٨٪ رضا',      color: '#22C55E' },
    { icon: Clock,     labelEn: '24/7 Support',     labelAr: 'دعم ٢٤/٧',      color: '#8B5CF6' },
    { icon: Globe,     labelEn: 'Jordan-First',     labelAr: 'أردني أولاً',   color: '#D9965B' },
    { icon: Package,   labelEn: 'Package Delivery', labelAr: 'توصيل طرود',   color: '#09732E' },
  ];

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Ambient bg orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-24 left-8 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(4,173,191,0.06)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-24 right-8 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(9,115,46,0.06)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10" dir={dir}>

        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
            style={{ background: 'rgba(9,115,46,0.1)', border: '1px solid rgba(9,115,46,0.2)', color: '#09732E' }}
          >
            <Zap className="w-4 h-4" />
            <span>{ar ? 'موثوق من ٥٠,٠٠٠+ مسافر' : 'Trusted by 50,000+ Travelers'}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-4"
            style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            dir={dir}
          >
            {ar ? 'لماذا تختار واصل؟' : 'Why Choose Wasel?'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted-foreground)' }}
            dir={dir}
          >
            {ar
              ? 'مبني خصيصاً للأردن — ليس نسخة من تطبيق غربي. نموذج BlaBlaCar مع روح شرق أوسطية.'
              : 'Built specifically for Jordan — not a copy of a Western app. BlaBlaCar model with a Middle Eastern soul.'}
          </motion.p>
        </div>

        {/* Platform stats */}
        <PlatformStats />

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>

        {/* Cost sharing calculator */}
        <CostSharingCalculator />

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
        >
          {trustBadges.map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.06, y: -4 }}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                style={{ background: `${b.color}14`, border: `1px solid ${b.color}25` }}
              >
                <b.icon className="w-5 h-5" style={{ color: b.color }} />
              </div>
              <p className="text-xs font-bold text-foreground">{ar ? b.labelAr : b.labelEn}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
