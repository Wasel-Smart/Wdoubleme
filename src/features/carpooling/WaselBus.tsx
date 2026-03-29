/**
 * WaselBus — /features/carpooling/WaselBus.tsx
 * Intercity bus integration (BlaBlaBus equivalent for MENA)
 *
 * Partners: JETT (Jordan), TRC (Jordan), NTT (Jordan),
 *           SuperJet (Egypt), GoBus (Egypt), SAPTCO (Saudi Arabia),
 *           Karwa Bus (Qatar), Dubai RTA Express (UAE)
 *
 * Revenue model: Commission on ticket sales (15-20%) or direct ticketing
 *
 * Features:
 *  • Search intercity bus routes
 *  • Real timetables + price tiers (economy / comfort / VIP)
 *  • Multi-modal journey planner (carpool + bus combo)
 *  • Operator partner badges
 *  • Wasel commission transparency
 */

import { useNavigate } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCountry } from '../../contexts/CountryContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type BusTier = 'economy' | 'comfort' | 'vip';

interface BusRoute {
  id: string;
  operator: string;
  operatorAr: string;
  operatorLogo: string;
  from: string; fromAr: string;
  to: string; toAr: string;
  distanceKm: number;
  durationH: string;
  departures: string[];
  tiers: {
    type: BusTier;
    priceJOD: number;
    seatsLeft: number;
    amenities: string[];
  }[];
  features: { en: string; ar: string }[];
  country: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const JORDAN_ROUTES: BusRoute[] = [
  {
    id: 'jett-amman-aqaba',
    operator: 'JETT Bus', operatorAr: 'شركة جيت',
    operatorLogo: '🚌',
    from: 'Amman', fromAr: 'عمّان', to: 'Aqaba', toAr: 'العقبة',
    distanceKm: 330, durationH: '4h 30m',
    departures: ['06:00', '09:00', '14:00', '20:00'],
    tiers: [
      { type: 'economy', priceJOD: 7, seatsLeft: 12, amenities: ['A/C', 'Seat belt'] },
      { type: 'comfort', priceJOD: 10, seatsLeft: 8, amenities: ['A/C', 'USB charging', 'Reclining seats'] },
      { type: 'vip', priceJOD: 15, seatsLeft: 4, amenities: ['A/C', 'Wi-Fi', 'Meal', 'Extra legroom', 'USB+220V'] },
    ],
    features: [{ en: 'Direct route', ar: 'مباشر' }, { en: 'Daily', ar: 'يومياً' }],
    country: 'JO',
  },
  {
    id: 'jett-amman-irbid',
    operator: 'JETT Bus', operatorAr: 'شركة جيت',
    operatorLogo: '🚌',
    from: 'Amman', fromAr: 'عمّان', to: 'Irbid', toAr: 'إربد',
    distanceKm: 85, durationH: '1h 30m',
    departures: ['07:00', '08:30', '10:00', '13:00', '16:00', '18:30'],
    tiers: [
      { type: 'economy', priceJOD: 2.5, seatsLeft: 20, amenities: ['A/C', 'Seat belt'] },
      { type: 'comfort', priceJOD: 3.5, seatsLeft: 10, amenities: ['A/C', 'USB charging'] },
    ],
    features: [{ en: 'Hourly departures', ar: 'كل ساعة' }, { en: 'Students', ar: 'طلاب' }],
    country: 'JO',
  },
  {
    id: 'trc-amman-petra',
    operator: 'TRC Jordan', operatorAr: 'الناقلات الأردنية',
    operatorLogo: '🏛️',
    from: 'Amman', fromAr: 'عمّان', to: 'Petra', toAr: 'البتراء',
    distanceKm: 250, durationH: '3h 30m',
    departures: ['07:30', '10:00', '14:00'],
    tiers: [
      { type: 'economy', priceJOD: 9, seatsLeft: 6, amenities: ['A/C', 'Seat belt'] },
      { type: 'vip', priceJOD: 18, seatsLeft: 3, amenities: ['A/C', 'Wi-Fi', 'Meal', 'Tour guide info'] },
    ],
    features: [{ en: 'Tourist route', ar: 'مسار سياحي' }, { en: '3×/day', ar: '3 مرات يومياً' }],
    country: 'JO',
  },
  {
    id: 'ntt-amman-dead-sea',
    operator: 'NTT Jordan', operatorAr: 'النقل الوطني',
    operatorLogo: '🌊',
    from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت',
    distanceKm: 60, durationH: '1h 15m',
    departures: ['08:00', '10:00', '12:00', '14:00'],
    tiers: [
      { type: 'economy', priceJOD: 4, seatsLeft: 15, amenities: ['A/C'] },
      { type: 'comfort', priceJOD: 6, seatsLeft: 8, amenities: ['A/C', 'USB'] },
    ],
    features: [{ en: 'Weekends popular', ar: 'شعبي نهاية الأسبوع' }],
    country: 'JO',
  },
];

const EGYPT_ROUTES: BusRoute[] = [
  {
    id: 'superjet-cairo-alex',
    operator: 'SuperJet', operatorAr: 'سوبر جيت',
    operatorLogo: '🇪🇬',
    from: 'Cairo', fromAr: 'القاهرة', to: 'Alexandria', toAr: 'الإسكندرية',
    distanceKm: 220, durationH: '2h 30m',
    departures: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    tiers: [
      { type: 'economy', priceJOD: 4, seatsLeft: 25, amenities: ['A/C'] },
      { type: 'comfort', priceJOD: 6, seatsLeft: 12, amenities: ['A/C', 'Wi-Fi', 'USB'] },
    ],
    features: [{ en: 'Every 2 hours', ar: 'كل ساعتين' }, { en: 'Popular route', ar: 'مسار مشهور' }],
    country: 'EG',
  },
  {
    id: 'gobus-cairo-sharm',
    operator: 'GoBus', operatorAr: 'جوباص',
    operatorLogo: '🏖️',
    from: 'Cairo', fromAr: 'القاهرة', to: 'Sharm El-Sheikh', toAr: 'شرم الشيخ',
    distanceKm: 480, durationH: '6h',
    departures: ['08:00', '23:00'],
    tiers: [
      { type: 'economy', priceJOD: 8, seatsLeft: 18, amenities: ['A/C', 'Seat belt'] },
      { type: 'vip', priceJOD: 14, seatsLeft: 6, amenities: ['A/C', 'Wi-Fi', 'Meal', 'Reclining'] },
    ],
    features: [{ en: 'Overnight option', ar: 'رحلة ليلية' }, { en: 'Tourist', ar: 'سياحي' }],
    country: 'EG',
  },
];

// ─── Tier meta ────────────────────────────────────────────────────────────────

const TIER_META: Record<BusTier, { en: string; ar: string; color: string; emoji: string }> = {
  economy: { en: 'Economy', ar: 'اقتصادي', color: '#64748B', emoji: '🎫' },
  comfort: { en: 'Comfort', ar: 'مريح', color: '#04ADBF', emoji: '💺' },
  vip: { en: 'VIP', ar: 'في آي بي', color: '#D9965B', emoji: '👑' },
};

// ─── Bus Route Card ───────────────────────────────────────────────────────────

function BusRouteCard({ route, ar, onBook }: { route: BusRoute; ar: boolean; onBook: (route: BusRoute, tier: BusTier) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selTier, setSelTier] = useState<BusTier>(route.tiers[0].type);
  const tier = route.tiers.find(t => t.type === selTier) ?? route.tiers[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {route.operatorLogo}
            </div>
            <div>
              <p className="font-bold text-foreground" style={{ fontSize: '0.85rem' }}>{ar ? route.operatorAr : route.operator}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span style={{ color: '#F59E0B', fontSize: '0.7rem', fontWeight: 700 }}>4.7</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.68rem' }}>· {ar ? 'شريك واصل' : 'Wasel Partner'}</span>
                <Shield className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black" style={{ color: '#04ADBF', fontSize: '1.5rem', fontWeight: 900 }}>{tier.priceJOD}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.65rem' }}>JOD/{ar ? 'شخص' : 'person'}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
          style={{ background: 'rgba(15,23,42,0.5)' }}>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground" style={{ fontSize: '0.9rem' }}>{ar ? route.fromAr : route.from}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>
              <MapPin className="inline w-2.5 h-2.5 mr-0.5" />
              {ar ? 'نقطة الانطلاق' : 'Departure'}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 shrink-0 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="w-px h-8" style={{ background: 'linear-gradient(180deg, var(--primary) 0%, #D9965B 100%)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D9965B' }} />
            <p style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{route.durationH}</p>
            <p style={{ fontSize: '0.58rem', color: 'var(--muted-foreground)' }}>{route.distanceKm} km</p>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="font-bold text-foreground" style={{ fontSize: '0.9rem' }}>{ar ? route.toAr : route.to}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>
              {ar ? 'الوجهة' : 'Destination'}
              <MapPin className="inline w-2.5 h-2.5 ml-0.5" />
            </p>
          </div>
        </div>

        {/* Tier selector */}
        <div className="flex gap-2 mb-4">
          {route.tiers.map(t => {
            const meta = TIER_META[t.type];
            return (
              <button key={t.type} onClick={() => setSelTier(t.type)}
                className="flex-1 py-2 px-2 rounded-xl transition-all"
                style={{
                  background: selTier === t.type ? `${meta.color}18` : 'rgba(30,41,59,0.4)',
                  border: `1.5px solid ${selTier === t.type ? meta.color + '40' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <p className="font-bold" style={{ color: selTier === t.type ? meta.color : 'var(--muted-foreground)', fontSize: '0.7rem' }}>
                  {meta.emoji} {ar ? meta.ar : meta.en}
                </p>
                <p style={{ color: selTier === t.type ? meta.color : 'var(--muted-foreground)', fontSize: '0.78rem', fontWeight: 900 }}>
                  {t.priceJOD} JOD
                </p>
              </button>
            );
          })}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tier.amenities.map(a => (
            <span key={a} className="px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(4,173,191,0.08)', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.18)', fontSize: '0.68rem', fontWeight: 600 }}>
              {a}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.18)', fontSize: '0.68rem', fontWeight: 600 }}>
            🌿 {ar ? `${Math.round(route.distanceKm * 0.06)} كغ CO₂` : `${Math.round(route.distanceKm * 0.06)} kg CO₂ saved`}
          </span>
        </div>

        {/* Next departures */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>{ar ? 'أقرب مواعيد:' : 'Next departures:'}</span>
          {route.departures.slice(0, 4).map(d => (
            <span key={d} className="px-2 py-0.5 rounded-lg font-bold"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.72rem' }}>
              {d}
            </span>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex gap-2">
          <button onClick={() => setExpanded(e => !e)}
            className="flex-1 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              background: 'rgba(30,41,59,0.5)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'var(--muted-foreground)',
              fontSize: '0.82rem',
            }}>
            {expanded ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'التفاصيل' : 'Details')}
          </button>
          <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
            onClick={() => onBook(route, selTier)}
            className="flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #09732E, #04ADBF)', color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>
            <TicketCheck className="w-4 h-4" />
            {ar ? 'احجز تذكرة ←' : 'Book Ticket →'}
          </motion.button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-2 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="font-bold text-foreground" style={{ fontSize: '0.82rem' }}>{ar ? 'جميع المواعيد:' : 'All departures:'}</p>
              <div className="flex flex-wrap gap-2">
                {route.departures.map(d => (
                  <span key={d} className="px-3 py-1 rounded-xl font-bold"
                    style={{ background: 'rgba(4,173,191,0.08)', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.2)', fontSize: '0.8rem' }}>
                    {d}
                  </span>
                ))}
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(217,150,91,0.06)', border: '1px solid rgba(217,150,91,0.15)' }}>
                <p style={{ color: '#D9965B', fontSize: '0.75rem', fontWeight: 700 }}>
                  💡 {ar ? 'واصل يكسب عمولة 15-20% من كل تذكرة — باقي المبلغ يذهب للمشغّل مباشرةً' : 'Wasel earns 15-20% commission on each ticket — the rest goes directly to the operator'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                  {ar ? 'مقاعد متبقية: ' : 'Seats available: '}<strong style={{ color: 'var(--foreground)' }}>{tier.seatsLeft}</strong>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Live tracking panel ──────────────────────────────────────────────────────
function LiveTrackingPanel({ ar }: { ar: boolean }) {
  const [progress, setProgress] = useState(42); // % along route
  const [speed, setSpeed] = useState(92);
  const [eta, setEta] = useState(148);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const iv = setInterval(() => {
      if (!mountedRef.current) return;
      setProgress(p => Math.min(100, p + 0.08));
      setSpeed(Math.round(85 + Math.random() * 15));
      setEta(e => Math.max(0, e - 1));
    }, 3000);
    return () => { mountedRef.current = false; clearInterval(iv); };
  }, []);

  const C = { bg:'#040C18', card:'#0A1628', border:'rgba(0,200,232,0.12)', cyan:'#00C8E8', green:'#00C875', gold:'#F0A830', red:'#FF4455', muted:'rgba(148,163,184,0.6)' };

  const waypoints = [
    { name:'Amman', nameAr:'عمّان', done: true  },
    { name:'Qatrana', nameAr:'قطرانة', done: progress > 30 },
    { name:'Ma\'an',   nameAr:'معان',   done: progress > 60 },
    { name:'Aqaba',   nameAr:'العقبة', done: progress >= 100 },
  ];

  return (
    <div style={{ background:C.card, border:`1px solid rgba(0,200,232,0.18)`, borderRadius:20, padding:'20px 22px', marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}`, animation:'pulse 1.5s infinite' }} />
          <span style={{ fontSize:'0.75rem', fontWeight:700, color:C.green }}>{ar?'مباشر — رحلة جيت الصباحية':'LIVE — JETT Morning Run'}</span>
        </div>
        <span style={{ fontSize:'0.65rem', background:'rgba(0,200,232,0.10)', border:'1px solid rgba(0,200,232,0.20)', borderRadius:999, padding:'3px 9px', color:C.cyan }}>
          🚌 JO-JETT-0621
        </span>
        <span style={{ marginLeft:'auto', fontSize:'0.65rem', color:C.muted }}>
          {ar?'آخر تحديث منذ ثوانٍ':'Updated seconds ago'}
        </span>
      </div>

      {/* Route progress */}
      <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:14 }}>
        {waypoints.map((w, i) => (
          <div key={w.name} style={{ display:'flex', alignItems:'center', flex: i < waypoints.length-1 ? 1 : 0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: w.done ? C.green : 'rgba(255,255,255,0.06)', border:`2px solid ${w.done ? C.green : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', boxShadow: w.done ? `0 0 8px ${C.green}50` : 'none' }}>
                {w.done ? '✓' : ''}
              </div>
              <span style={{ fontSize:'0.58rem', color: w.done ? C.cyan : 'rgba(148,163,184,0.5)', whiteSpace:'nowrap' }}>{ar ? w.nameAr : w.name}</span>
            </div>
            {i < waypoints.length-1 && (
              <div style={{ flex:1, height:3, margin:'0 3px', marginBottom:18, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <motion.div animate={{ width: i === Math.floor(progress/33) ? `${(progress % 33) * 3}%` : i < Math.floor(progress/33) ? '100%' : '0%' }}
                  style={{ height:'100%', background:`linear-gradient(90deg,${C.green},${C.cyan})` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bus icon on track */}
      <div style={{ height:6, borderRadius:999, background:'rgba(255,255,255,0.04)', overflow:'hidden', position:'relative', marginBottom:16 }}>
        <div style={{ height:'100%', width:`${progress}%`, borderRadius:999, background:`linear-gradient(90deg,${C.cyan},${C.green})`, transition:'width 3s ease' }} />
        <div style={{ position:'absolute', top:'50%', left:`${progress}%`, transform:'translate(-50%,-50%)', fontSize:'1rem' }}>🚌</div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[
          { icon:<Gauge size={14}/>, label:ar?'السرعة':'Speed',      val:`${speed} km/h`, color:C.cyan  },
          { icon:<Clock size={14}/>, label:ar?'الوصول':'ETA',         val:`${eta} min`,    color:C.gold  },
          { icon:<Navigation2 size={14}/>, label:ar?'قطعنا':'Progress', val:`${progress.toFixed(0)}%`, color:C.green },
          { icon:<Users size={14}/>, label:ar?'الركاب':'Passengers',  val:'24/40',         color:'#A78BFA'},
        ].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', border:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ display:'flex', gap:5, alignItems:'center', marginBottom:4, color:s.color }}>{s.icon}</div>
            <div style={{ fontSize:'0.88rem', fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:'0.62rem', color:C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ─── Next departure countdown ────────────────────────────────────────────────
function NextDepartureCountdown({ nextTime, ar }: { nextTime: string; ar: boolean }) {
  const [secs, setSecs] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const [h, m] = nextTime.split(':').map(Number);
    const now = new Date();
    const target = new Date(); target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    setSecs(Math.floor((target.getTime() - now.getTime()) / 1000));

    const iv = setInterval(() => {
      if (!mountedRef.current) return;
      setSecs(s => Math.max(0, s - 1));
    }, 1000);
    return () => { mountedRef.current = false; clearInterval(iv); };
  }, [nextTime]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const fmt = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:999, background:'rgba(0,200,232,0.08)', border:'1px solid rgba(0,200,232,0.20)' }}>
      <Zap size={13} color='#00C8E8'/>
      <span style={{ fontSize:'0.72rem', color:'rgba(148,163,184,0.8)' }}>{ar?'الرحلة التالية في:':'Next bus in:'}</span>
      <span style={{ fontSize:'0.82rem', fontWeight:900, color:'#00C8E8', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.05em' }}>
        {fmt(h)}:{fmt(m)}:{fmt(s)}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WaselBus() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { currentCountry } = useCountry();
  const ar = language === 'ar';

  const country = currentCountry?.iso_alpha2 || 'JO';
  const [search, setSearch] = useState({ from: '', to: '', date: '' });
  const [filterTier, setFilterTier] = useState<BusTier | 'all'>('all');
  const [showingRoutes, setShowingRoutes] = useState(true);
  const [showLiveTracking, setShowLiveTracking] = useState(true);

  // Choose routes based on country
  const allRoutes = country === 'EG' ? EGYPT_ROUTES : JORDAN_ROUTES;
  const filteredRoutes = allRoutes.filter(r => {
    const matchFrom = !search.from || r.from.toLowerCase().includes(search.from.toLowerCase()) || r.fromAr.includes(search.from);
    const matchTo = !search.to || r.to.toLowerCase().includes(search.to.toLowerCase()) || r.toAr.includes(search.to);
    const matchTier = filterTier === 'all' || r.tiers.some(t => t.type === filterTier);
    return matchFrom && matchTo && matchTier;
  });

  const handleBook = (route: BusRoute, tier: BusTier) => {
    toast.success(
      ar
        ? `✅ جاري الحجز: ${route.fromAr} → ${route.toAr} (${TIER_META[tier].ar})`
        : `✅ Booking: ${route.from} → ${route.to} (${TIER_META[tier].en})`,
      { description: ar ? 'سنتواصل معك لتأكيد التذكرة' : 'We\'ll contact you to confirm the ticket' }
    );
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--background)' }} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(4,173,191,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
                🚌
              </div>
              <div>
                <h1 className="font-black text-foreground" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900 }}>
                  {ar ? 'واصل باص' : 'WaselBus'}
                </h1>
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  {ar ? 'رحلات بين المدن مع أفضل شركات الباصات — شريك BlaBlaBus للشرق الأوسط' : 'Intercity bus travel with top operators — the BlaBlaBus for the Middle East'}
                </p>
              </div>
            </div>

            {/* Next departure countdown + live toggle */}
            <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginTop:12 }}>
              <NextDepartureCountdown nextTime="09:00" ar={ar} />
              <button onClick={() => setShowLiveTracking(v => !v)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:999, border:'1px solid rgba(0,200,117,0.25)', background: showLiveTracking ? 'rgba(0,200,117,0.10)' : 'transparent', color:'#00C875', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}>
                <Radio size={12}/> {ar ? (showLiveTracking?'إخفاء التتبع المباشر':'عرض التتبع المباشر') : (showLiveTracking?'Hide live tracking':'Show live tracking')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live tracking panel ── */}
      <div className="max-w-4xl mx-auto px-5">
        <AnimatePresence>
          {showLiveTracking && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ overflow:'hidden' }}>
              <LiveTrackingPanel ar={ar} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-4xl mx-auto px-5 space-y-6">

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'from', icon: MapPin, ph_en: 'From (e.g. Amman)', ph_ar: 'من (مثال: عمّان)' },
              { key: 'to', icon: MapPin, ph_en: 'To (e.g. Aqaba)', ph_ar: 'إلى (مثال: العقبة)' },
              { key: 'date', icon: Calendar, ph_en: 'Travel date', ph_ar: 'تاريخ السفر', type: 'date' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.key} className="relative">
                  <Icon className="absolute w-4 h-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)', [ar ? 'right' : 'left']: 12 }} />
                  <input
                    type={f.type || 'text'}
                    value={(search as any)[f.key]}
                    onChange={e => setSearch(s => ({ ...s, [f.key]: e.target.value }))}
                    placeholder={ar ? f.ph_ar : f.ph_en}
                    className="w-full py-3 rounded-xl bg-background border border-border text-foreground"
                    style={{ fontSize: '0.875rem', [ar ? 'paddingRight' : 'paddingLeft']: 36, [ar ? 'paddingLeft' : 'paddingRight']: 12, colorScheme: 'dark' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Tier filter */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
              <Filter className="w-3.5 h-3.5" /> {ar ? 'الدرجة:' : 'Class:'}
            </span>
            {(['all', 'economy', 'comfort', 'vip'] as const).map(t => (
              <button key={t} onClick={() => setFilterTier(t)}
                className="px-3 py-1 rounded-xl font-semibold transition-all"
                style={{
                  background: filterTier === t ? 'rgba(4,173,191,0.15)' : 'rgba(30,41,59,0.4)',
                  color: filterTier === t ? '#04ADBF' : 'var(--muted-foreground)',
                  border: `1px solid ${filterTier === t ? 'rgba(4,173,191,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  fontSize: '0.75rem',
                }}>
                {t === 'all' ? (ar ? 'الكل' : 'All') : TIER_META[t][ar ? 'ar' : 'en']}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Combo suggestion ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, rgba(4,173,191,0.07), rgba(9,115,46,0.04))', border: '1px solid rgba(4,173,191,0.15)' }}
          onClick={() => navigate('/app/multimodal')}>
          <div className="flex items-center gap-1 text-2xl shrink-0">🚗<ArrowRight className="w-4 h-4 text-muted-foreground" />🚌</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold" style={{ color: '#04ADBF', fontSize: '0.875rem' }}>
              {ar ? 'هل جربت الرحلة المركبة؟' : 'Try a combined journey?'}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
              {ar ? 'مشاركة رحلة حتى المدينة ثم باص للوجهة النهائية — أوفر وأسهل' : 'Carpool to the city then bus to your final destination — cheaper & easier'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>

        {/* ── Routes list ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-foreground" style={{ fontSize: '1.1rem', fontWeight: 900 }}>
              {ar ? `${filteredRoutes.length} رحلة متاحة` : `${filteredRoutes.length} routes available`}
            </h2>
            <span style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
              {ar ? 'جميع الأسعار شاملة العمولة' : 'All prices include Wasel fee'}
            </span>
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="text-center py-16">
              <Bus className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-muted-foreground">{ar ? 'لا توجد رحلات تطابق البحث' : 'No routes match your search'}</p>
              <button onClick={() => setSearch({ from: '', to: '', date: '' })}
                className="mt-4 flex items-center gap-2 mx-auto text-primary" style={{ fontSize: '0.85rem' }}>
                <RefreshCw className="w-4 h-4" />
                {ar ? 'إعادة ضبط' : 'Reset filters'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoutes.map(route => (
                <BusRouteCard key={route.id} route={route} ar={ar} onBook={handleBook} />
              ))}
            </div>
          )}
        </div>

        {/* ── Partners section ──────────────────────────────────────────── */}
        <div className="pt-6">
          <h2 className="font-bold text-muted-foreground mb-4 text-center" style={{ fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {ar ? 'شركاؤنا من مشغّلي الحافلات' : 'Our Bus Operator Partners'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'JETT Bus', country: 'JO 🇯🇴', desc: ar ? 'شبكة الأردن' : 'Jordan Network' },
              { name: 'TRC Jordan', country: 'JO 🇯🇴', desc: ar ? 'مسارات سياحية' : 'Tourist Routes' },
              { name: 'SuperJet', country: 'EG 🇪🇬', desc: ar ? 'شبكة مصر' : 'Egypt Network' },
              { name: 'SAPTCO', country: 'SA 🇸🇦', desc: ar ? 'المملكة' : 'Saudi Arabia' },
            ].map(p => (
              <div key={p.name} className="p-3 rounded-xl text-center"
                style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xl mb-1">🚌</div>
                <p className="font-bold text-foreground" style={{ fontSize: '0.78rem' }}>{p.name}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.68rem' }}>{p.country} · {p.desc}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span style={{ color: '#22C55E', fontSize: '0.65rem' }}>{ar ? 'شريك معتمد' : 'Verified Partner'}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-4" style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
            {ar
              ? '+ شركات أخرى قريباً: كروا باص (قطر)، دبي RTA، GoBus (مصر)'
              : '+ More coming: Karwa Bus (Qatar), Dubai RTA Express, NTT Jordan'}
          </p>
        </div>

        {/* ── CTA to carpooling ─────────────────────────────────────────── */}
        <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.08), rgba(4,173,191,0.05))', border: '1px solid rgba(9,115,46,0.18)' }}>
          <p className="font-bold text-foreground mb-2" style={{ fontSize: '0.9rem' }}>
            💡 {ar ? 'تفضّل مشاركة السيارات؟' : 'Prefer carpooling?'}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', marginBottom: 12 }}>
            {ar
              ? 'واصل الأساسي هو مشاركة رحلات بسيارات خاصة — أحياناً أسرع وأوفر من الباص'
              : 'Wasel\'s core is private-car ride-sharing — sometimes faster and cheaper than the bus'}
          </p>
          <button onClick={() => navigate('/app/find-ride')}
            className="flex items-center gap-2 font-bold"
            style={{ color: '#04ADBF', fontSize: '0.875rem' }}>
            {ar ? 'ابحث عن مشاركة سيارة' : 'Search for a carpool ride'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
