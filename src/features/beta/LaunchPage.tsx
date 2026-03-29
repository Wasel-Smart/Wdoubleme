/**
 * LaunchPage — Wasel | واصل — Soft Beta Live 🚀
 * March 15, 2026 — We shipped.
 */

import { useNavigate } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import waselLogoImg from 'figma:asset/a27f60f5bb3f7a6f1c6cbf6b21c04044dc1e53e1.png';

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#040C18',
  card:   '#0A1628',
  card2:  '#0D1E35',
  cyan:   '#00C8E8',
  green:  '#00C875',
  gold:   '#F0A830',
  lime:   '#A8E63D',
  purple: '#A78BFA',
};

// ─── Confetti particle ────────────────────────────────────────────────────────
function ConfettiParticle({ delay = 0, x = 0 }: { delay: number; x: number }) {
  const colors = [C.cyan, C.green, C.gold, C.lime, C.purple, '#FF6B9D'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 4 + Math.random() * 6;
  const isRect = Math.random() > 0.5;
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: -20,
        left: `${x}%`,
        width: size,
        height: isRect ? size * 0.5 : size,
        borderRadius: isRect ? 1 : '50%',
        background: color,
        zIndex: 50,
        pointerEvents: 'none',
      }}
      initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
        opacity: [1, 1, 0.8, 0],
        rotate: Math.random() > 0.5 ? 360 : -360,
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{ duration: 2.5 + Math.random() * 2, delay, ease: 'easeIn' }}
    />
  );
}

// ─── Live counter ─────────────────────────────────────────────────────────────
function LiveCounter({ target, label, labelAr, color, icon: Icon, suffix = '' }: {
  target: number; label: string; labelAr: string; color: string;
  icon: React.ElementType; suffix?: string;
}) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1800;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: C.card,
        border: `1px solid ${color}25`,
        borderRadius: 20,
        padding: '24px 28px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${color}12 0%, transparent 65%)`,
      }} />
      <Icon size={22} style={{ color, margin: '0 auto 10px' }} />
      <div style={{
        fontSize: '2.4rem', fontWeight: 900, lineHeight: 1,
        color, fontVariantNumeric: 'tabular-nums',
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontSize: '0.78rem', fontWeight: 600, marginTop: 6,
        color: 'rgba(255,255,255,0.55)',
        fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
      }}>
        {ar ? labelAr : label}
      </div>
    </motion.div>
  );
}

// ─── Milestone card ───────────────────────────────────────────────────────────
function MilestoneCard({ icon, titleEn, titleAr, descEn, descAr, color, done }: {
  icon: string; titleEn: string; titleAr: string;
  descEn: string; descAr: string; color: string; done: boolean;
}) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <motion.div
      initial={{ opacity: 0, x: ar ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: '18px 20px',
        background: done ? `${color}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${done ? color + '30' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: done ? `${color}20` : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
        border: `1px solid ${done ? color + '35' : 'rgba(255,255,255,0.06)'}`,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
        }}>
          <span style={{
            fontWeight: 700, fontSize: '0.92rem',
            color: done ? '#F1F5F9' : 'rgba(255,255,255,0.5)',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? titleAr : titleEn}
          </span>
          {done && (
            <CheckCircle2 size={14} style={{ color, flexShrink: 0 }} />
          )}
        </div>
        <p style={{
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)',
          lineHeight: 1.5, margin: 0,
          fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
        }}>
          {ar ? descAr : descEn}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Route pill ───────────────────────────────────────────────────────────────
function RoutePill({ from, to, fromAr, toAr, price, seats, emoji, color }: {
  from: string; to: string; fromAr: string; toAr: string;
  price: number; seats: number; emoji: string; color: string;
}) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        background: C.card,
        border: `1px solid ${color}25`,
        borderRadius: 18,
        padding: '18px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${ar ? '100%' : '0%'} 50%, ${color}10 0%, transparent 65%)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
        <div>
          <div style={{
            fontWeight: 700, fontSize: '1rem', color: '#F1F5F9',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? `${fromAr} ← ${toAr}` : `${from} → ${to}`}
          </div>
          <div style={{
            fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', marginTop: 2,
          }}>
            {seats} {ar ? 'مقعد متاح' : 'seats available'}
          </div>
        </div>
      </div>
      <div style={{ textAlign: ar ? 'left' : 'right', position: 'relative' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color }}>
          {formatCurrency(price, 'JOD')}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
          {ar ? 'للمقعد' : 'per seat'}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LaunchPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const dir = ar ? 'rtl' : 'ltr';
  const [confetti, setConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveStats, setLiveStats] = useState<{ users: number; trips: number; bookings: number; co2SavedKg: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setConfetti(true), 400);
    const t2 = setTimeout(() => setConfetti(false), 4000);
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/stats`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    })
      .then(r => r.json())
      .then(d => { if (d && typeof d.users === 'number') setLiveStats(d); })
      .catch(() => {});
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://wasel.app').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = [
    {
      icon: '🏗️', done: true,
      titleEn: 'Architecture & Token System',
      titleAr: 'البنية المعمارية ونظام التوكنز',
      descEn: 'Feature-slice architecture, RTL utilities, 214 components consolidated',
      descAr: 'بنية الـ feature-slice، أدوات RTL، ودمج 214 مكوّن',
      color: C.green,
    },
    {
      icon: '🚗', done: true,
      titleEn: 'Core Carpooling Flow',
      titleAr: 'تدفق المشاركة الأساسي',
      descEn: 'Search → RideDetails → BookRide → Payment → QR confirmation',
      descAr: 'البحث ← تفاصيل الرحلة ← الحجز ← الدفع ← تأكيد QR',
      color: C.cyan,
    },
    {
      icon: '📦', done: true,
      titleEn: 'Awasel Package Delivery',
      titleAr: 'توصيل طرود أوصل',
      descEn: 'Send packages with travelers · Raje3 returns · QR tracking',
      descAr: 'إرسال طرود مع المسافرين · رجع للإرجاع · تتبع QR',
      color: C.gold,
    },
    {
      icon: '🕌', done: true,
      titleEn: 'Cultural Features',
      titleAr: 'الميزات الثقافية',
      descEn: 'Prayer stops, gender preferences, Ramadan mode, Cash on Arrival',
      descAr: 'وقفات الصلاة، خيارات الجنس، وضع رمضان، الدفع عند الوصول',
      color: C.purple,
    },
    {
      icon: '🏫', done: true,
      titleEn: 'Smart School Mobility',
      titleAr: 'النقل المدرسي الذكي',
      descEn: 'QR/NFC student tracking, parent notifications, AI routing',
      descAr: 'تتبع QR/NFC للطلاب، إشعارات الوالدين، تحسين المسارات بالذكاء الاصطناعي',
      color: '#10B981',
    },
    {
      icon: '📍', done: true,
      titleEn: 'Mobility Hubs',
      titleAr: 'مراكز التنقل',
      descEn: '6 hubs live: Zarqa BRT, Jordan U, City Mall, Yarmouk, North Terminal, Abdali',
      descAr: '٦ مراكز: زرقاء BRT، جامعة الأردن، سيتي مول، اليرموك، المحطة الشمالية، عبدالي',
      color: C.cyan,
    },
    {
      icon: '🛡️', done: true,
      titleEn: 'Sanad eKYC Safety Layer',
      titleAr: 'طبقة أمان سند eKYC',
      descEn: 'Jordan gov\'t ID verification, 9-layer trust system, SOS emergency',
      descAr: 'توثيق الهوية الحكومي الأردني، نظام ثقة ٩ طبقات، SOS طوارئ',
      color: '#EF4444',
    },
    {
      icon: '🗺️', done: true,
      titleEn: 'Mobility OS',
      titleAr: 'نظام تشغيل التنقل',
      descEn: 'National-scale digital twin, 20-city real-time simulation, A* routing',
      descAr: 'التوأم الرقمي على المستوى الوطني، محاكاة ٢٠ مدينة، خوارزمية A*',
      color: C.gold,
    },
    {
      icon: '🚀', done: true,
      titleEn: 'Soft Beta — Live Now',
      titleAr: 'البيتا اللينة — مباشرة الآن',
      descEn: '50 travelers + 500 passengers · Amman → Aqaba / Irbid / Dead Sea',
      descAr: '٥٠ مسافراً + ٥٠٠ راكب · عمّان ← العقبة / إربد / البحر الميت',
      color: C.lime,
    },
  ];

  const particles = Array.from({ length: 60 }, (_, i) => ({
    delay: Math.random() * 1.5,
    x: Math.random() * 100,
  }));

  return (
    <div
      dir={dir}
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: '#F1F5F9',
        fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : '"Inter","system-ui",sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* ── Confetti ── */}
      <AnimatePresence>
        {confetti && particles.map((p, i) => (
          <ConfettiParticle key={i} delay={p.delay} x={p.x} />
        ))}
      </AnimatePresence>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(4,12,24,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
            <div style={{
              position: 'absolute', inset: -3, borderRadius: '50%',
              background: `radial-gradient(circle, ${C.cyan}30 0%, transparent 70%)`,
              filter: 'blur(5px)',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1.5px solid transparent',
              backgroundImage: `linear-gradient(${C.bg},${C.bg}), linear-gradient(135deg,${C.green},${C.cyan})`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }} />
            <div style={{
              position: 'absolute', inset: 2, borderRadius: '50%', overflow: 'hidden',
            }}>
              <img src={waselLogoImg} alt="Wasel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{
                fontWeight: 900, fontSize: '1rem',
                background: `linear-gradient(135deg,${C.green},${C.cyan})`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Wasel</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>|</span>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'rgba(203,213,225,0.8)', fontFamily: '"Cairo","Tajawal",sans-serif' }}>واصل</span>
            </div>
          </div>
        </div>

        {/* LIVE pill */}
        <motion.div
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `${C.lime}15`,
            border: `1px solid ${C.lime}40`,
            borderRadius: 20, padding: '5px 14px',
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: C.lime, boxShadow: `0 0 8px ${C.lime}`,
          }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.lime, letterSpacing: '0.08em' }}>
            {ar ? 'مباشر · بيتا' : 'SOFT BETA · LIVE'}
          </span>
        </motion.div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/auth?tab=signup')}
          style={{
            background: `linear-gradient(135deg,${C.cyan},${C.green})`,
            border: 'none', borderRadius: 10, padding: '8px 18px',
            fontSize: '0.82rem', fontWeight: 700, color: '#040C18',
            cursor: 'pointer',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}
        >
          {ar ? 'انضم الآن' : 'Join Now'}
        </motion.button>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center', padding: '80px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: `radial-gradient(ellipse, ${C.cyan}12 0%, ${C.green}06 40%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Shipped badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${C.gold}18`,
            border: `1px solid ${C.gold}40`,
            borderRadius: 30, padding: '7px 18px',
            marginBottom: 32,
          }}
        >
          <Sparkles size={14} style={{ color: C.gold }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.gold, letterSpacing: '0.06em' }}>
            {ar ? '🚀 انطلقنا رسمياً — ٠٥ مارس ٢٠٢٦' : '🚀 WE SHIPPED — MARCH 5, 2026'}
          </span>
          <Sparkles size={14} style={{ color: C.gold }} />
        </motion.div>

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: 'spring', bounce: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}
        >
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: -12,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${C.cyan}35 0%, ${C.green}20 50%, transparent 70%)`,
                filter: 'blur(8px)',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid transparent',
              backgroundImage: `linear-gradient(${C.bg},${C.bg}), linear-gradient(135deg,${C.green},${C.cyan},${C.lime})`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }} />
            <div style={{
              position: 'absolute', inset: 3, borderRadius: '50%', overflow: 'hidden',
              boxShadow: `0 0 0 1px ${C.cyan}30, 0 8px 32px ${C.cyan}25`,
            }}>
              <img src={waselLogoImg} alt="Wasel واصل" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}
        >
          <span style={{
            background: `linear-gradient(135deg,${C.green} 0%,${C.cyan} 50%,${C.lime} 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {ar ? 'واصل — مباشر الآن' : 'Wasel is Live.'}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 580, margin: '0 auto 40px',
            lineHeight: 1.6,
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}
        >
          {ar
            ? 'أول منصة مشاركة رحلات بلمسة أردنية حقيقية. صلاة، خصوصية، ودفع نقدي عند الوصول.'
            : 'The first carpooling platform built for the Middle East. Prayer stops, gender privacy, cash on arrival.'}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 32px ${C.cyan}50` }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth?tab=signup')}
            style={{
              background: `linear-gradient(135deg,${C.cyan},${C.green})`,
              border: 'none', borderRadius: 14, padding: '14px 32px',
              fontSize: '1rem', fontWeight: 800, color: '#040C18',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
            }}
          >
            {ar ? 'ابدأ رحلتك' : 'Get Started'}
            <ArrowRight size={18} style={{ transform: ar ? 'scaleX(-1)' : 'none' }} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/app/find-ride')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '14px 28px',
              fontSize: '1rem', fontWeight: 700, color: '#F1F5F9',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
            }}
          >
            <MapPin size={17} />
            {ar ? 'ابحث عن رحلة' : 'Find a Ride'}
          </motion.button>
        </motion.div>

        {/* Date stamp */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: 24, fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em',
          }}
        >
          {ar ? 'منذ ٠٥ مارس ٢٠٢٦ — عمّان، المملكة الأردنية الهاشمية' : 'March 5, 2026 — Amman, Hashemite Kingdom of Jordan'}
        </motion.p>
      </section>

      {/* ── Live stats ── */}
      <section style={{ padding: '0 24px 64px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}>
          <LiveCounter target={liveStats?.users && liveStats.users > 0 ? liveStats.users : 50}  label={liveStats?.users ? 'Registered Users' : 'Beta Travelers'}   labelAr={liveStats?.users ? 'مستخدم مسجّل' : 'مسافر بيتا'}    color={C.cyan}   icon={Car}       suffix="+" />
          <LiveCounter target={liveStats?.bookings && liveStats.bookings > 0 ? liveStats.bookings : 500} label={liveStats?.bookings ? 'Bookings Made' : 'Beta Passengers'}  labelAr={liveStats?.bookings ? 'حجز منجز' : 'راكب بيتا'}     color={C.green}  icon={Users}     suffix="+" />
          <LiveCounter target={3}   label="Live Routes"      labelAr="مسار مباشر"    color={C.gold}   icon={MapPin}    />
          <LiveCounter target={94}  label="Safety Score"     labelAr="نقاط الأمان"   color={C.lime}   icon={Shield}    suffix="%" />
        </div>
      </section>

      {/* ── Live routes ── */}
      <section style={{ padding: '0 24px 64px', maxWidth: 700, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `${C.cyan}15`, border: `1px solid ${C.cyan}30`,
            borderRadius: 20, padding: '5px 14px', marginBottom: 16,
          }}>
            <Radio size={12} style={{ color: C.cyan }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.cyan, letterSpacing: '0.08em' }}>
              {ar ? 'المسارات المفعّلة الآن' : 'ROUTES LIVE NOW'}
            </span>
          </div>
          <h2 style={{
            fontSize: '1.8rem', fontWeight: 800, color: '#F1F5F9',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? 'رحلات حقيقية، أسعار واضحة' : 'Real trips. Fixed prices.'}
          </h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <RoutePill from="Amman" to="Aqaba"    fromAr="عمّان" toAr="العقبة"      price={8}  seats={12} emoji="🏖️" color={C.cyan}   />
          <RoutePill from="Amman" to="Irbid"    fromAr="عمّان" toAr="إربد"        price={4}  seats={24} emoji="🎓" color={C.green}  />
          <RoutePill from="Amman" to="Dead Sea" fromAr="عمّان" toAr="البحر الميت" price={5}  seats={18} emoji="🌊" color={C.purple} />
        </div>
      </section>

      {/* ── What we shipped ── */}
      <section style={{ padding: '0 24px 64px', maxWidth: 760, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <h2 style={{
            fontSize: '1.8rem', fontWeight: 800, color: '#F1F5F9',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? 'ما أنجزناه' : 'What we shipped'}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: 8,
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? '٩ مراحل، ٩ طبقات من الأمان، بنية مصممة للتوسع' : '9 sprints. 9 safety layers. Built to scale.'}
          </p>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: ar ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <MilestoneCard {...m} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Cultural edge ── */}
      <section style={{ padding: '0 24px 64px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <h2 style={{
            fontSize: '1.8rem', fontWeight: 800, color: '#F1F5F9',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? 'مبني لأردننا' : 'Built for our Jordan'}
          </h2>
        </motion.div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {[
            { emoji: '🕌', en: 'Prayer Stop Planning', ar: 'وقفات الصلاة', color: '#10B981' },
            { emoji: '🚺', en: 'Gender Preferences',   ar: 'خيارات الجنس', color: '#EC4899' },
            { emoji: '🌙', en: 'Ramadan Mode',          ar: 'وضع رمضان',    color: C.purple },
            { emoji: '💵', en: 'Cash on Arrival',       ar: 'دفع عند الوصول', color: C.gold },
            { emoji: '🧕', en: 'Hijab Privacy',         ar: 'خصوصية الحجاب', color: C.cyan },
            { emoji: '🛡️', en: 'Sanad eKYC',           ar: 'سند eKYC',      color: '#EF4444' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ scale: 1.04 }}
              style={{
                background: C.card,
                border: `1px solid ${f.color}25`,
                borderRadius: 18, padding: '20px',
                textAlign: 'center', cursor: 'default',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{f.emoji}</div>
              <div style={{
                fontWeight: 700, fontSize: '0.88rem', color: '#F1F5F9',
                fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
              }}>
                {ar ? f.ar : f.en}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 24px 100px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: 580, margin: '0 auto',
            background: C.card,
            border: `1px solid ${C.cyan}25`,
            borderRadius: 28, padding: '48px 40px',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${C.cyan}12 0%, transparent 60%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
          <h2 style={{
            fontSize: '1.9rem', fontWeight: 900, marginBottom: 12,
            background: `linear-gradient(135deg,${C.green},${C.cyan})`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar ? 'كن من أوائل المسافرين' : 'Be an early traveler'}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.6,
            fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
          }}>
            {ar
              ? 'نحن نقبل أول ٥٠ مسافر و٥٠٠ راكب فقط في مرحلة البيتا. سجّل الآن قبل امتلاء الأماكن.'
              : 'We\'re accepting only the first 50 travelers and 500 passengers in beta. Sign up before spots fill.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${C.cyan}40` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth?tab=signup')}
              style={{
                background: `linear-gradient(135deg,${C.cyan},${C.green})`,
                border: 'none', borderRadius: 14, padding: '14px 36px',
                fontSize: '1rem', fontWeight: 800, color: '#040C18',
                cursor: 'pointer',
                fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
              }}
            >
              {ar ? 'سجّل مجاناً' : 'Sign Up Free'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/beta')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '14px 28px',
                fontSize: '1rem', fontWeight: 700, color: '#F1F5F9',
                cursor: 'pointer',
                fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
              }}
            >
              {ar ? 'قائمة الانتظار' : 'Join Waitlist'}
            </motion.button>
          </div>

          {/* Share link */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px 16px',
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
            }}>
              wasel.app
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              style={{
                background: copied ? `${C.lime}20` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${copied ? C.lime + '40' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, padding: '8px 12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                fontSize: '0.75rem', fontWeight: 600,
                color: copied ? C.lime : 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {copied ? (ar ? 'تم!' : 'Copied!') : (ar ? 'نسخ' : 'Copy')}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        maxWidth: 900, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1.5px solid transparent',
              backgroundImage: `linear-gradient(${C.bg},${C.bg}), linear-gradient(135deg,${C.green},${C.cyan})`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }} />
            <div style={{
              position: 'absolute', inset: 2, borderRadius: '50%', overflow: 'hidden',
            }}>
              <img src={waselLogoImg} alt="Wasel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            </div>
          </div>
          <div>
            <span style={{
              fontWeight: 800, fontSize: '0.88rem',
              background: `linear-gradient(135deg,${C.green},${C.cyan})`,
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Wasel</span>
            <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>|</span>
            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'rgba(203,213,225,0.6)', fontFamily: '"Cairo","Tajawal",sans-serif' }}>واصل</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { en: 'Privacy', ar: 'الخصوصية', path: '/privacy' },
            { en: 'Terms',   ar: 'الشروط',   path: '/terms' },
            { en: 'Beta',    ar: 'بيتا',      path: '/beta' },
          ].map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)',
                fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
                padding: 0,
              }}
            >
              {ar ? l.ar : l.en}
            </button>
          ))}
        </div>

        <p style={{
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)',
          margin: 0, fontFamily: ar ? '"Cairo","Tajawal",sans-serif' : 'inherit',
        }}>
          {ar ? '© ٢٠٢٦ واصل — عمّان، الأردن' : '© 2026 Wasel — Amman, Jordan'}
        </p>
      </footer>
    </div>
  );
}

export default LaunchPage;