/**
 * MyTripsPage — /app/my-trips
 * Harmonized with the main Wasel ride/package UX system.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { useLocalAuth } from '../../contexts/LocalAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import {
  Car, Package, Clock, CheckCircle, XCircle, MapPin, ChevronRight, Plus,
  Shield, Navigation, Star, ArrowRight,
} from 'lucide-react';

const BG = '#040C18';
const CARD = 'rgba(255,255,255,0.04)';
const CARD_ALT = 'rgba(255,255,255,0.03)';
const BORDER = 'rgba(255,255,255,0.09)';
const CYAN = '#00C8E8';
const GOLD = '#F0A830';
const GREEN = '#22C55E';
const RED = '#EF4444';
const TEXT = '#EFF6FF';
const MUTED = 'rgba(148,163,184,0.72)';
const DIM = 'rgba(148,163,184,0.55)';
const FONT = "-apple-system,'Inter','Cairo','Tajawal',sans-serif";

type TripStatus = 'upcoming' | 'completed' | 'cancelled';
type TabKey = 'rides' | 'packages';

interface MockTrip {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  status: TripStatus;
  seats?: number;
  driver?: string;
  rating?: number;
  trustLabel?: string;
}

const MOCK_RIDES: MockTrip[] = [
  { id: 't1', from: 'Amman', to: 'Aqaba', date: 'Mar 28, 2026', time: '07:00', price: 'JOD 8.00', status: 'upcoming', seats: 1, driver: 'Ahmad K.', trustLabel: 'Verified captain' },
  { id: 't2', from: 'Amman', to: 'Irbid', date: 'Mar 24, 2026', time: '09:30', price: 'JOD 4.50', status: 'completed', seats: 1, driver: 'Sara M.', rating: 5, trustLabel: 'High trust route' },
  { id: 't3', from: 'Zarqa', to: 'Amman', date: 'Mar 20, 2026', time: '08:00', price: 'JOD 2.00', status: 'completed', seats: 2, driver: 'Khalid R.', rating: 4, trustLabel: 'Verified captain' },
  { id: 't4', from: 'Amman', to: 'Karak', date: 'Mar 15, 2026', time: '06:30', price: 'JOD 6.00', status: 'cancelled', seats: 1, driver: 'Omar H.', trustLabel: 'Schedule changed' },
];

const MOCK_PACKAGES: MockTrip[] = [
  { id: 'p1', from: 'Amman', to: 'Aqaba', date: 'Mar 27, 2026', time: '10:00', price: 'JOD 3.50', status: 'upcoming', trustLabel: 'Matched to live route' },
  { id: 'p2', from: 'Irbid', to: 'Amman', date: 'Mar 22, 2026', time: '14:00', price: 'JOD 2.50', status: 'completed', trustLabel: 'Delivered successfully' },
];

const STATUS_CONFIG: Record<TripStatus, { label: string; labelAr: string; color: string; bg: string; icon: ReactNode }> = {
  upcoming: { label: 'Upcoming', labelAr: 'قادمة', color: CYAN, bg: 'rgba(0,200,232,0.12)', icon: <Clock size={12} /> },
  completed: { label: 'Completed', labelAr: 'مكتملة', color: GREEN, bg: 'rgba(34,197,94,0.12)', icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', labelAr: 'ملغاة', color: RED, bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={12} /> },
};

function pill(color: string) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 999,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    color,
    fontSize: '0.66rem',
    fontWeight: 700,
    fontFamily: FONT,
  } as const;
}

function StatusBadge({ status, ar }: { status: TripStatus; ar: boolean }) {
  const item = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.64rem', fontWeight: 700, padding: '4px 9px', borderRadius: 999, color: item.color, background: item.bg, fontFamily: FONT }}>
      {item.icon}
      {ar ? item.labelAr : item.label}
    </span>
  );
}

function ExperienceBanner({ ar }: { ar: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(240px, 0.8fr)',
        gap: 14,
        borderRadius: 18,
        padding: '18px 20px',
        background: 'linear-gradient(135deg, rgba(0,200,232,0.10), rgba(255,255,255,0.03))',
        border: '1px solid rgba(0,200,232,0.18)',
        marginBottom: 18,
      }}
    >
      <div>
        <div style={{ color: TEXT, fontWeight: 800, fontSize: '0.98rem', marginBottom: 6, fontFamily: FONT }}>
          {ar ? 'كل رحلاتك وطرودك في نفس الشبكة' : 'All your rides and parcels in one network'}
        </div>
        <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.6, fontFamily: FONT }}>
          {ar
            ? 'رحلاتي الآن تعرض الحجز، التتبع، والثقة بنفس لغة المنتج الأساسية حتى تشعر أن كل ما بعد الحجز جزء من نفس تجربة واصل.'
            : 'My Trips now carries the same trust, tracking, and corridor language as the primary booking flow so post-booking feels like part of the same Wasel product.'}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
        <span style={pill(GREEN)}><Shield size={12} />Verified trust</span>
        <span style={pill(CYAN)}><Navigation size={12} />Live route state</span>
        <span style={pill(GOLD)}><Package size={12} />Package continuity</span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail, color, icon }: { label: string; value: string; detail: string; color: string; icon: ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '18px 18px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 72, height: 72, borderRadius: '50%', background: `radial-gradient(circle, ${color}16 0%, transparent 72%)` }} />
      <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}16`, border: `1px solid ${color}26`, marginBottom: 12 }}>
        {icon}
      </div>
      <div style={{ color, fontWeight: 900, fontSize: '1.3rem', fontFamily: FONT }}>{value}</div>
      <div style={{ color: TEXT, fontWeight: 800, fontSize: '0.84rem', marginTop: 4, fontFamily: FONT }}>{label}</div>
      <div style={{ color: DIM, fontSize: '0.74rem', marginTop: 4, fontFamily: FONT }}>{detail}</div>
    </div>
  );
}

function TripCard({
  trip,
  ar,
  onRebook,
  type,
}: {
  trip: MockTrip;
  ar: boolean;
  onRebook: () => void;
  type: TabKey;
}) {
  const [expanded, setExpanded] = useState(false);
  const routeAccent = type === 'rides' ? CYAN : GOLD;

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => setExpanded((value) => !value)}
        style={{
          width: '100%',
          padding: '16px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: ar ? 'right' : 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ width: 42, height: 42, borderRadius: 13, background: `${routeAccent}14`, border: `1px solid ${routeAccent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MapPin size={16} color={routeAccent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: TEXT, fontFamily: FONT, fontSize: '0.92rem' }}>{trip.from}</span>
            <span style={{ color: 'rgba(148,163,184,0.42)', fontSize: '0.78rem' }}>→</span>
            <span style={{ fontWeight: 800, color: TEXT, fontFamily: FONT, fontSize: '0.92rem' }}>{trip.to}</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: MUTED, fontFamily: FONT, marginTop: 4 }}>{trip.date} · {trip.time}</div>
          {trip.trustLabel && (
            <div style={{ marginTop: 8 }}>
              <span style={pill(type === 'rides' ? GREEN : routeAccent)}>{trip.trustLabel}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ fontWeight: 900, color: TEXT, fontFamily: FONT, fontSize: '0.92rem' }}>{trip.price}</span>
          <StatusBadge status={trip.status} ar={ar} />
        </div>
        <ChevronRight size={14} color="rgba(148,163,184,0.35)" style={{ flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '14px 18px', display: 'grid', gap: 12, background: CARD_ALT }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {trip.driver && (
              <span style={{ fontSize: '0.78rem', color: MUTED, fontFamily: FONT }}>
                {ar ? `السائق: ${trip.driver}` : `Captain: ${trip.driver}`}
              </span>
            )}
            {trip.rating && (
              <span style={{ fontSize: '0.78rem', color: GOLD, fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={12} fill={GOLD} stroke={GOLD} />
                {trip.rating.toFixed(1)} / 5
              </span>
            )}
            {trip.seats && (
              <span style={{ fontSize: '0.78rem', color: MUTED, fontFamily: FONT }}>
                {ar ? `${trip.seats} مقعد` : `${trip.seats} seat${trip.seats > 1 ? 's' : ''}`}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ color: DIM, fontSize: '0.76rem', fontFamily: FONT }}>
              {type === 'rides'
                ? (ar ? 'يمكنك إعادة الحجز أو متابعة الرحلة من نفس المسار.' : 'You can rebook or continue tracking from the same corridor.')
                : (ar ? 'الطرد يبقى ضمن نفس سلسلة التتبع حتى التسليم.' : 'Package continuity stays on the same tracking chain until delivery.')}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {trip.status === 'completed' && (
                <button
                  onClick={onRebook}
                  style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(0,200,232,0.12)', border: '1px solid rgba(0,200,232,0.28)', color: CYAN, fontWeight: 700, fontFamily: FONT, fontSize: '0.76rem', cursor: 'pointer' }}
                >
                  {ar ? 'أعد الحجز' : 'Rebook'}
                </button>
              )}
              <button
                onClick={type === 'rides' ? onRebook : () => onRebook()}
                style={{ padding: '7px 14px', borderRadius: 10, background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 700, fontFamily: FONT, fontSize: '0.76rem', cursor: 'pointer' }}
              >
                {type === 'rides' ? (ar ? 'افتح الحجز' : 'Open booking') : (ar ? 'افتح التتبع' : 'Open tracking')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTripsPage() {
  const { user } = useLocalAuth();
  const { language } = useLanguage();
  const nav = useIframeSafeNavigate();
  const ar = language === 'ar';

  const [tab, setTab] = useState<TabKey>('rides');
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');

  const items = tab === 'rides' ? MOCK_RIDES : MOCK_PACKAGES;
  const filtered = filter === 'all' ? items : items.filter((trip) => trip.status === filter);

  const stats = useMemo(() => {
    const source = tab === 'rides' ? MOCK_RIDES : MOCK_PACKAGES;
    const upcoming = source.filter((trip) => trip.status === 'upcoming').length;
    const completed = source.filter((trip) => trip.status === 'completed').length;
    const cancelled = source.filter((trip) => trip.status === 'cancelled').length;
    return { total: source.length, upcoming, completed, cancelled };
  }, [tab]);

  const FILTERS: { key: TripStatus | 'all'; label: string; labelAr: string }[] = [
    { key: 'all', label: 'All', labelAr: 'الكل' },
    { key: 'upcoming', label: 'Upcoming', labelAr: 'قادمة' },
    { key: 'completed', label: 'Completed', labelAr: 'مكتملة' },
    { key: 'cancelled', label: 'Cancelled', labelAr: 'ملغاة' },
  ];

  const createPath = tab === 'rides' ? '/app/find-ride' : '/app/packages';

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, direction: ar ? 'rtl' : 'ltr', paddingBottom: 88 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: CYAN, marginBottom: 6, fontFamily: FONT }}>
              {ar ? 'واصل · إدارة الرحلات' : 'WASEL · JOURNEY CONTROL'}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: TEXT, fontFamily: FONT, margin: 0 }}>
              {ar ? 'رحلاتي' : 'My Trips'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: MUTED, fontFamily: FONT, margin: '6px 0 0' }}>
              {ar
                ? `مرحباً ${user?.name ?? ''} · ${filtered.length} عنصر ظاهر الآن`
                : `Welcome ${user?.name ?? ''} · ${filtered.length} visible items right now`}
            </p>
          </div>
          <button
            onClick={() => nav(createPath)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: `linear-gradient(135deg,${CYAN},#0095B8)`, border: 'none', color: '#041018', fontWeight: 800, fontFamily: FONT, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            <Plus size={14} />
            {tab === 'rides' ? (ar ? 'رحلة جديدة' : 'New ride') : (ar ? 'طرد جديد' : 'New package')}
          </button>
        </div>

        <ExperienceBanner ar={ar} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          <SummaryCard
            label={ar ? 'الإجمالي' : 'Total'}
            value={String(stats.total)}
            detail={tab === 'rides' ? (ar ? 'رحلات على حسابك' : 'Trips on your account') : (ar ? 'طرود على حسابك' : 'Packages on your account')}
            color={CYAN}
            icon={<Navigation size={18} color={CYAN} />}
          />
          <SummaryCard
            label={ar ? 'القادمة' : 'Upcoming'}
            value={String(stats.upcoming)}
            detail={ar ? 'تحتاج متابعة' : 'Need attention'}
            color={CYAN}
            icon={<Clock size={18} color={CYAN} />}
          />
          <SummaryCard
            label={ar ? 'المكتملة' : 'Completed'}
            value={String(stats.completed)}
            detail={ar ? 'مغلقة بنجاح' : 'Closed successfully'}
            color={GREEN}
            icon={<CheckCircle size={18} color={GREEN} />}
          />
          <SummaryCard
            label={ar ? 'الثقة' : 'Trust layer'}
            value={tab === 'rides' ? '4.9' : '24/7'}
            detail={tab === 'rides' ? (ar ? 'متوسط تقييم المسارات' : 'Average route confidence') : (ar ? 'تتبع الطرود متاح' : 'Tracking always visible')}
            color={GOLD}
            icon={<Shield size={18} color={GOLD} />}
          />
        </div>

        <div style={{ display: 'flex', gap: 0, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {([
            ['rides', '🚗', ar ? 'الرحلات' : 'Rides'],
            ['packages', '📦', ar ? 'الطرود' : 'Packages'],
          ] as const).map(([key, emoji, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 10,
                background: tab === key ? 'rgba(0,200,232,0.12)' : 'transparent',
                border: tab === key ? '1px solid rgba(0,200,232,0.25)' : '1px solid transparent',
                color: tab === key ? CYAN : MUTED,
                fontWeight: tab === key ? 800 : 600,
                fontFamily: FONT,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.14s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {FILTERS.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: filter === filterOption.key ? 800 : 600,
                fontFamily: FONT,
                cursor: 'pointer',
                border: `1px solid ${filter === filterOption.key ? CYAN : BORDER}`,
                background: filter === filterOption.key ? 'rgba(0,200,232,0.12)' : 'transparent',
                color: filter === filterOption.key ? CYAN : MUTED,
              }}
            >
              {ar ? filterOption.labelAr : filterOption.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0', color: DIM, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18 }}>
            {tab === 'rides' ? <Car size={42} style={{ marginBottom: 12, opacity: 0.35 }} /> : <Package size={42} style={{ marginBottom: 12, opacity: 0.35 }} />}
            <p style={{ fontFamily: FONT, fontSize: '0.94rem', margin: 0 }}>
              {tab === 'rides'
                ? (ar ? 'لا توجد رحلات مطابقة لهذا الفلتر' : 'No rides match this filter')
                : (ar ? 'لا توجد طرود مطابقة لهذا الفلتر' : 'No packages match this filter')}
            </p>
            <button
              onClick={() => nav(createPath)}
              style={{ marginTop: 16, padding: '10px 18px', borderRadius: 10, background: 'rgba(0,200,232,0.12)', border: '1px solid rgba(0,200,232,0.25)', color: CYAN, fontWeight: 800, fontFamily: FONT, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {tab === 'rides' ? (ar ? 'ابحث عن رحلة' : 'Find a ride') : (ar ? 'أنشئ طلب طرد' : 'Create package request')}
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          filtered.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              ar={ar}
              type={tab}
              onRebook={() => nav(createPath)}
            />
          ))
        )}
      </div>
    </div>
  );
}
