/**
 * MyTripsPage — /app/my-trips
 * Passenger and driver trip history with filters and re-book flow.
 */
import { useState } from 'react';
import { useLocalAuth } from '../../contexts/LocalAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { Car, Package, Clock, CheckCircle, XCircle, MapPin, ChevronRight, Plus } from 'lucide-react';

const BG   = '#040C18';
const CARD = 'rgba(255,255,255,0.04)';
const BORD = 'rgba(255,255,255,0.09)';
const CYAN = '#00C8E8';
const FONT = "-apple-system,'Inter',sans-serif";

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
}

const MOCK_RIDES: MockTrip[] = [
  { id: 't1', from: 'Amman', to: 'Aqaba', date: 'Mar 28, 2026', time: '07:00', price: 'JOD 8.00', status: 'upcoming',  seats: 1, driver: 'Ahmad K.' },
  { id: 't2', from: 'Amman', to: 'Irbid', date: 'Mar 24, 2026', time: '09:30', price: 'JOD 4.50', status: 'completed', seats: 1, driver: 'Sara M.', rating: 5 },
  { id: 't3', from: 'Zarqa', to: 'Amman', date: 'Mar 20, 2026', time: '08:00', price: 'JOD 2.00', status: 'completed', seats: 2, driver: 'Khalid R.', rating: 4 },
  { id: 't4', from: 'Amman', to: 'Karak', date: 'Mar 15, 2026', time: '06:30', price: 'JOD 6.00', status: 'cancelled', seats: 1, driver: 'Omar H.' },
];

const MOCK_PACKAGES: MockTrip[] = [
  { id: 'p1', from: 'Amman', to: 'Aqaba', date: 'Mar 27, 2026', time: '10:00', price: 'JOD 3.50', status: 'upcoming' },
  { id: 'p2', from: 'Irbid', to: 'Amman', date: 'Mar 22, 2026', time: '14:00', price: 'JOD 2.50', status: 'completed' },
];

const STATUS_CONFIG: Record<TripStatus, { label: string; labelAr: string; color: string; bg: string; icon: React.ReactNode }> = {
  upcoming:  { label: 'Upcoming',  labelAr: 'قادمة',    color: CYAN,       bg: 'rgba(0,200,232,0.12)',   icon: <Clock size={12} />       },
  completed: { label: 'Completed', labelAr: 'مكتملة',   color: '#22C55E',  bg: 'rgba(34,197,94,0.12)',   icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', labelAr: 'ملغاة',    color: '#EF4444',  bg: 'rgba(239,68,68,0.12)',   icon: <XCircle size={12} />     },
};

function StatusBadge({ status, ar }: { status: TripStatus; ar: boolean }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, color: c.color, background: c.bg, fontFamily: FONT }}>
      {c.icon}
      {ar ? c.labelAr : c.label}
    </span>
  );
}

function TripCard({ trip, ar, onRebook }: { trip: MockTrip; ar: boolean; onRebook: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        {/* Route icon */}
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,200,232,0.08)', border: '1px solid rgba(0,200,232,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MapPin size={16} color={CYAN} />
        </div>
        {/* Route info */}
        <div style={{ flex: 1, minWidth: 0, textAlign: ar ? 'right' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#EFF6FF', fontFamily: FONT, fontSize: '0.9rem' }}>{trip.from}</span>
            <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.75rem' }}>→</span>
            <span style={{ fontWeight: 700, color: '#EFF6FF', fontFamily: FONT, fontSize: '0.9rem' }}>{trip.to}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.6)', fontFamily: FONT, marginTop: 3 }}>{trip.date} · {trip.time}</div>
        </div>
        {/* Right: price + status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <span style={{ fontWeight: 900, color: '#EFF6FF', fontFamily: FONT, fontSize: '0.9rem' }}>{trip.price}</span>
          <StatusBadge status={trip.status} ar={ar} />
        </div>
        <ChevronRight size={14} color="rgba(148,163,184,0.35)" style={{ flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${BORD}`, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {trip.driver && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.7)', fontFamily: FONT }}>
              {ar ? `السائق: ${trip.driver}` : `Driver: ${trip.driver}`}
            </span>
          )}
          {trip.rating && (
            <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontFamily: FONT }}>
              {'★'.repeat(trip.rating)}{'☆'.repeat(5 - trip.rating)}
            </span>
          )}
          {trip.seats && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.7)', fontFamily: FONT }}>
              {ar ? `${trip.seats} مقعد` : `${trip.seats} seat${trip.seats > 1 ? 's' : ''}`}
            </span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {trip.status === 'completed' && (
              <button onClick={onRebook} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(0,200,232,0.12)', border: `1px solid rgba(0,200,232,0.3)`, color: CYAN, fontWeight: 700, fontFamily: FONT, fontSize: '0.75rem', cursor: 'pointer' }}>
                {ar ? 'أعد الحجز' : 'Rebook'}
              </button>
            )}
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
  const filtered = filter === 'all' ? items : items.filter(t => t.status === filter);

  const FILTERS: { key: TripStatus | 'all'; label: string; labelAr: string }[] = [
    { key: 'all',       label: 'All',       labelAr: 'الكل'    },
    { key: 'upcoming',  label: 'Upcoming',  labelAr: 'قادمة'   },
    { key: 'completed', label: 'Completed', labelAr: 'مكتملة'  },
    { key: 'cancelled', label: 'Cancelled', labelAr: 'ملغاة'   },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, direction: ar ? 'rtl' : 'ltr', paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EFF6FF', fontFamily: FONT, margin: 0 }}>{ar ? 'رحلاتي' : 'My Trips'}</h1>
            <p style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.6)', fontFamily: FONT, margin: '4px 0 0' }}>
              {ar ? `${filtered.length} رحلة` : `${filtered.length} trip${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => nav('/app/find-ride')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: `linear-gradient(135deg,${CYAN},#0095B8)`, border: 'none', color: '#040C18', fontWeight: 700, fontFamily: FONT, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            <Plus size={14} /> {ar ? 'رحلة جديدة' : 'New Trip'}
          </button>
        </div>

        {/* Tabs: Rides / Packages */}
        <div style={{ display: 'flex', gap: 0, background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {([['rides', '🚗', ar ? 'الرحلات' : 'Rides'], ['packages', '📦', ar ? 'الطرود' : 'Packages']] as const).map(([k, emoji, lbl]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: tab === k ? 'rgba(0,200,232,0.12)' : 'transparent', border: tab === k ? `1px solid rgba(0,200,232,0.25)` : '1px solid transparent', color: tab === k ? CYAN : 'rgba(148,163,184,0.6)', fontWeight: tab === k ? 700 : 500, fontFamily: FONT, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.14s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>{emoji}</span>{lbl}
            </button>
          ))}
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{ padding: '5px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: filter === f.key ? 700 : 500, fontFamily: FONT, cursor: 'pointer', border: `1px solid ${filter === f.key ? CYAN : BORD}`, background: filter === f.key ? 'rgba(0,200,232,0.12)' : 'transparent', color: filter === f.key ? CYAN : 'rgba(148,163,184,0.7)', transition: 'all 0.12s' }}
            >
              {ar ? f.labelAr : f.label}
            </button>
          ))}
        </div>

        {/* Trip list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(148,163,184,0.4)' }}>
            <Car size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontFamily: FONT, fontSize: '0.9rem' }}>{ar ? 'لا توجد رحلات' : 'No trips found'}</p>
            <button onClick={() => nav('/app/find-ride')} style={{ marginTop: 16, padding: '9px 20px', borderRadius: 10, background: 'rgba(0,200,232,0.12)', border: `1px solid rgba(0,200,232,0.25)`, color: CYAN, fontWeight: 700, fontFamily: FONT, fontSize: '0.82rem', cursor: 'pointer' }}>
              {ar ? 'ابحث عن رحلة' : 'Find a Ride'}
            </button>
          </div>
        ) : (
          filtered.map(t => (
            <TripCard
              key={t.id}
              trip={t}
              ar={ar}
              onRebook={() => nav('/app/find-ride')}
            />
          ))
        )}
      </div>
    </div>
  );
}
