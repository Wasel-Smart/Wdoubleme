/**
 * BusPage — Wasel scheduled coach booking.
 * Extracted from WaselServicePage.tsx monolith.
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MapPin, Calendar, Clock, CheckCircle2, CreditCard,
  TrendingUp, Bus, ArrowRight, Award, Wifi, Shield,
} from 'lucide-react';
import { MapWrapper } from '../../components/MapWrapper';
import { createBusBooking, fetchBusRoutes, type BusRoute } from '../../services/bus';
import {
  DS, r, pill, CITIES, resolveCityCoord, midpoint,
  Protected, PageShell, SectionHead, CoreExperienceBanner,
} from '../shared/pageShared';

// ── Static fallback schedules ─────────────────────────────────────────────────
const FALLBACK_BUSES = [
  {
    id: '0',
    from: 'Amman',     to: 'Aqaba',
    dep: '07:00',      arr: '11:30',
    price: 7,          seats: 12,
    company: 'Wasel Express',
    amenities: ['AC', 'WiFi', 'USB', 'Snacks'],
    color: DS.cyan,
    via: ['7th Circle', 'Karak Service Plaza'],
    duration: '4h 30m',
    frequency: 'Daily',
    punctuality: '96% on-time this week',
    pickupPoint: 'Abdali Intercity Hub',
    dropoffPoint: 'Aqaba Corniche Terminal',
    summary: 'Best for early arrivals, students, and business travelers heading south.',
  },
  {
    id: '1',
    from: 'Amman',     to: 'Irbid',
    dep: '08:00',      arr: '09:30',
    price: 3,          seats: 8,
    company: 'Wasel Express',
    amenities: ['AC', 'USB'],
    color: DS.blue,
    via: ['University Street'],
    duration: '1h 30m',
    frequency: 'Every 90 min',
    punctuality: '93% on-time this week',
    pickupPoint: 'North Bus Gate',
    dropoffPoint: 'Irbid University District',
    summary: 'Fast morning connection with simple boarding and light luggage support.',
  },
  {
    id: '2',
    from: 'Amman',     to: 'Aqaba',
    dep: '14:00',      arr: '18:30',
    price: 7,          seats: 5,
    company: 'Wasel Express',
    amenities: ['AC', 'WiFi', 'USB'],
    color: DS.cyan,
    via: ['Airport Road', 'Karak Service Plaza'],
    duration: '4h 30m',
    frequency: 'Daily',
    punctuality: '91% on-time this week',
    pickupPoint: 'Abdali Intercity Hub',
    dropoffPoint: 'Aqaba Marina Stop',
    summary: 'Ideal for same-day travel with live status updates and quieter afternoon boarding.',
  },
  {
    id: '3',
    from: 'Irbid',     to: 'Amman',
    dep: '06:30',      arr: '08:00',
    price: 3,          seats: 15,
    company: 'Wasel Express',
    amenities: ['AC', 'USB'],
    color: DS.green,
    via: ['Jerash Connector'],
    duration: '1h 30m',
    frequency: 'Weekdays',
    punctuality: '95% on-time this week',
    pickupPoint: 'Irbid Main Terminal',
    dropoffPoint: 'Abdali Intercity Hub',
    summary: 'Reliable weekday commuter option for office starts and university lectures.',
  },
];

export function BusPage() {
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(FALLBACK_BUSES as BusRoute[]);
  const [selected, setSelected] = useState('0');
  const [tripDate, setTripDate] = useState('2026-03-28');
  const [passengers, setPassengers] = useState(1);
  const [scheduleMode, setScheduleMode] = useState<'depart-now' | 'schedule-later'>('schedule-later');
  const [seatPreference, setSeatPreference] = useState<'window' | 'aisle' | 'front-zone'>('window');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesInfo, setRoutesInfo] = useState<string | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingSource, setBookingSource] = useState<'server' | 'local' | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBusRoutes() {
      setRoutesLoading(true);
      setRoutesInfo(null);
      try {
        const liveRoutes = await fetchBusRoutes({ date: tripDate, seats: passengers });
        if (cancelled) return;
        if (liveRoutes.length > 0) {
          setBusRoutes(liveRoutes);
          setSelected((prev) => liveRoutes.some((rt) => rt.id === prev) ? prev : liveRoutes[0].id);
        } else {
          setBusRoutes(FALLBACK_BUSES as BusRoute[]);
          setSelected((prev) => FALLBACK_BUSES.some((rt) => rt.id === prev) ? prev : FALLBACK_BUSES[0].id);
          setRoutesInfo('Showing scheduled routes while live inventory syncs.');
        }
      } catch {
        if (cancelled) return;
        setBusRoutes(FALLBACK_BUSES as BusRoute[]);
        setSelected((prev) => FALLBACK_BUSES.some((rt) => rt.id === prev) ? prev : FALLBACK_BUSES[0].id);
        setRoutesInfo('Live route API is unavailable. You can still continue booking.');
      } finally {
        if (!cancelled) setRoutesLoading(false);
      }
    }
    loadBusRoutes();
    return () => { cancelled = true; };
  }, [tripDate, passengers]);

  const activeBus = busRoutes.find((b) => b.id === selected) ?? busRoutes[0] ?? FALLBACK_BUSES[0] as BusRoute;
  const pickupCoord = resolveCityCoord(activeBus.from);
  const dropoffCoord = resolveCityCoord(activeBus.to);
  const routeCenter = midpoint(pickupCoord, dropoffCoord);
  const totalPrice = activeBus.price * passengers;
  const departureLabel = scheduleMode === 'depart-now'
    ? `Next departure today at ${activeBus.dep}`
    : `${tripDate} at ${activeBus.dep}`;

  async function handleBusBooking() {
    setBookingBusy(true);
    setBookingComplete(false);
    try {
      const result = await createBusBooking({
        tripId: activeBus.id,
        seatsRequested: passengers,
        pickupStop: activeBus.pickupPoint,
        dropoffStop: activeBus.dropoffPoint,
        scheduleDate: tripDate,
        seatPreference,
        scheduleMode,
        totalPrice,
      });
      setBookingSource(result.source);
      setBookingComplete(true);
    } finally {
      setBookingBusy(false);
    }
  }

  return (
    <Protected>
      <PageShell>
        <SectionHead
          emoji="🚌"
          title="Wasel Bus"
          titleAr="Bus Service"
          sub="Fixed-price intercity coaches · Scheduled booking · Live route preview"
          color={DS.green}
        />
        <CoreExperienceBanner
          title="Scheduled transport with the same premium Wasel system"
          detail="Bus keeps the same trust language as rides and packages: clear pricing, predictable departures, and route visibility before checkout so users never feel like they entered a different product."
          tone={DS.green}
        />

        {/* Stat bar */}
        <div className="sp-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
          {[
            { label: 'Guaranteed boarding', value: '15 min',             detail: 'Check in before departure',         icon: <CheckCircle2 size={18} />, color: DS.green },
            { label: 'Best fare',           value: `${activeBus.price} JOD`, detail: 'Transparent seat pricing',     icon: <CreditCard size={18} />,   color: activeBus.color ?? DS.cyan },
            { label: 'Route confidence',    value: activeBus.punctuality, detail: 'Updated from recent trips',        icon: <TrendingUp size={18} />,   color: DS.cyan },
            { label: 'Comfort onboard',     value: activeBus.amenities?.join(' · ') ?? '', detail: 'Displayed before you book', icon: <Wifi size={18} />, color: DS.gold },
          ].map((item) => (
            <div key={item.label} style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: r(18), padding: '18px 18px 16px' }}>
              <div style={{ width: 42, height: 42, borderRadius: r(12), background: `${item.color}16`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: 14 }}>
                {item.icon}
              </div>
              <div style={{ color: item.color, fontWeight: 900, fontSize: '1.05rem', marginBottom: 4 }}>{item.value}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.86rem' }}>{item.label}</div>
              <div style={{ color: DS.muted, fontSize: '0.74rem', marginTop: 4 }}>{item.detail}</div>
            </div>
          ))}
        </div>

        {(routesLoading || routesInfo) && (
          <div style={{ marginBottom: 16, background: DS.card2, border: `1px solid ${DS.border}`, borderRadius: r(14), padding: '12px 14px', color: DS.sub, fontSize: '0.8rem' }}>
            {routesLoading ? 'Syncing live bus routes…' : routesInfo}
          </div>
        )}

        <div className="sp-2col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr', gap: 16, alignItems: 'start' }}>
          {/* Route list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {busRoutes.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: DS.card, borderRadius: r(20),
                  border: `1px solid ${selected === b.id ? (b.color ?? DS.cyan) : DS.border}`,
                  overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                  boxShadow: selected === b.id ? `0 10px 30px ${b.color ?? DS.cyan}12` : 'none',
                }}
                onClick={() => { setSelected(String(b.id)); setBookingComplete(false); setBookingSource(null); }}
              >
                <div style={{ height: 3, background: `linear-gradient(90deg,${b.color ?? DS.cyan},transparent)` }} />
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0 }}>
                      <div style={{ width: 48, height: 48, borderRadius: r(12), background: `${b.color ?? DS.cyan}15`, border: `1.5px solid ${b.color ?? DS.cyan}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bus size={22} color={b.color ?? DS.cyan} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.02rem' }}>{b.from} to {b.to}</div>
                        <div style={{ color: DS.sub, fontSize: '0.8rem', marginTop: 3 }}>{b.dep} – {b.arr} · {b.duration} · {b.company}</div>
                        <div style={{ color: DS.muted, fontSize: '0.77rem', marginTop: 8 }}>{b.summary}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {selected === b.id && <div style={{ ...pill(b.color ?? DS.cyan), marginBottom: 6, fontSize: '0.64rem' }}>Selected route</div>}
                      <div style={{ color: b.color ?? DS.cyan, fontWeight: 900, fontSize: '1.6rem' }}>{b.price}</div>
                      <div style={{ color: DS.muted, fontSize: '0.62rem', fontWeight: 600 }}>JOD/seat</div>
                      <span style={{ ...pill(b.seats > 5 ? DS.green : DS.gold), marginTop: 6, fontSize: '0.65rem' }}>{b.seats} seats left</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginTop: 16 }}>
                    {[
                      { label: 'Pickup',      value: b.pickupPoint,  icon: <MapPin size={13} color={b.color ?? DS.cyan} /> },
                      { label: 'Frequency',   value: b.frequency,    icon: <Calendar size={13} color={b.color ?? DS.cyan} /> },
                      { label: 'Reliability', value: b.punctuality,  icon: <Award size={13} color={b.color ?? DS.cyan} /> },
                    ].map((item) => (
                      <div key={item.label} style={{ background: DS.card2, border: `1px solid ${DS.border}`, borderRadius: r(12), padding: '12px 13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: DS.muted, fontSize: '0.68rem', fontWeight: 700, marginBottom: 4 }}>
                          {item.icon}{item.label}
                        </div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.35 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                    {b.amenities?.map((a) => <span key={a} style={pill(b.color ?? DS.cyan)}>{a}</span>)}
                    {b.via?.map((stop) => <span key={stop} style={pill(DS.sub)}>Via {stop}</span>)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Booking panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 16 }}>
            <div style={{ background: DS.card, border: `1px solid ${(activeBus.color ?? DS.cyan)}30`, borderRadius: r(22), overflow: 'hidden', boxShadow: `0 14px 40px ${activeBus.color ?? DS.cyan}10` }}>
              <div style={{ padding: '22px 22px 18px', background: `linear-gradient(135deg, ${DS.navy}, ${activeBus.color ?? DS.cyan}22)` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem' }}>Schedule your seat</div>
                    <div style={{ color: DS.sub, fontSize: '0.78rem', marginTop: 4 }}>{activeBus.from} to {activeBus.to} · {activeBus.dep} departure</div>
                  </div>
                  <span style={{ ...pill(activeBus.color ?? DS.cyan), fontSize: '0.7rem' }}>{activeBus.seats} seats open</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['depart-now', 'schedule-later'] as const).map((mode) => (
                    <button key={mode} onClick={() => setScheduleMode(mode)} style={{ height: 38, padding: '0 14px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: scheduleMode === mode ? (mode === 'depart-now' ? DS.gradC : DS.gradG) : 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700 }}>
                      {mode === 'depart-now' ? 'Next departure' : 'Schedule ahead'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: DS.card2, border: `1px solid ${DS.border}`, borderRadius: r(16), padding: '14px 16px' }}>
                  <div style={{ color: DS.muted, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Departure plan</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>{departureLabel}</div>
                  <div style={{ color: DS.sub, fontSize: '0.78rem', marginTop: 4 }}>Board at {activeBus.pickupPoint} · arrive at {activeBus.dropoffPoint}.</div>
                </div>

                {scheduleMode === 'schedule-later' && (
                  <div>
                    <label style={{ display: 'block', color: DS.sub, fontSize: '0.76rem', marginBottom: 8 }}>Travel date</label>
                    <input type="date" value={tripDate} onChange={(e) => { setTripDate(e.target.value); setBookingComplete(false); }}
                      style={{ width: '100%', height: 46, borderRadius: r(14), border: `1px solid ${DS.border}`, background: DS.card2, color: '#fff', padding: '0 14px', fontFamily: DS.F }} />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', color: DS.sub, fontSize: '0.76rem', marginBottom: 8 }}>Passengers</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: DS.card2, border: `1px solid ${DS.border}`, borderRadius: r(14), overflow: 'hidden' }}>
                      <button onClick={() => { setPassengers((v) => Math.max(1, v - 1)); setBookingComplete(false); }} style={{ width: 42, height: 46, border: 'none', background: 'transparent', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}>-</button>
                      <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 800 }}>{passengers}</div>
                      <button onClick={() => { setPassengers((v) => Math.min(activeBus.seats, v + 1)); setBookingComplete(false); }} style={{ width: 42, height: 46, border: 'none', background: 'transparent', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: DS.sub, fontSize: '0.76rem', marginBottom: 8 }}>Seat preference</label>
                    <select value={seatPreference} onChange={(e) => { setSeatPreference(e.target.value as typeof seatPreference); setBookingComplete(false); }}
                      style={{ width: '100%', height: 46, borderRadius: r(14), border: `1px solid ${DS.border}`, background: DS.card2, color: '#fff', padding: '0 14px', fontFamily: DS.F }}>
                      <option value="window">Window</option>
                      <option value="aisle">Aisle</option>
                      <option value="front-zone">Front zone</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(0,200,232,0.08), rgba(240,168,48,0.08))', border: `1px solid ${DS.border}`, borderRadius: r(16), padding: '16px 16px 14px' }}>
                  {[
                    { label: 'Seat fare', val: `${activeBus.price} JOD x ${passengers}` },
                    { label: 'Schedule support', val: scheduleMode === 'schedule-later' ? 'Included' : 'Auto-assigned' },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: DS.sub, fontSize: '0.78rem' }}>{row.label}</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{row.val}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 10, borderTop: `1px solid ${DS.border}` }}>
                    <span style={{ color: '#fff', fontWeight: 800 }}>Total</span>
                    <span style={{ color: activeBus.color ?? DS.cyan, fontWeight: 900, fontSize: '1.2rem' }}>{totalPrice} JOD</span>
                  </div>
                </div>

                <button onClick={handleBusBooking} disabled={bookingBusy || routesLoading} style={{ width: '100%', height: 50, borderRadius: r(14), border: 'none', background: `linear-gradient(135deg,${activeBus.color ?? DS.cyan},${DS.blue})`, color: '#fff', fontWeight: 900, fontFamily: DS.F, cursor: bookingBusy || routesLoading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: bookingBusy || routesLoading ? 0.7 : 1 }}>
                  {bookingBusy ? 'Confirming booking…' : 'Confirm booking'}
                </button>

                {bookingComplete && (
                  <div style={{ background: 'rgba(0,200,117,0.10)', border: '1px solid rgba(0,200,117,0.28)', borderRadius: r(16), padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: DS.green, fontWeight: 800, marginBottom: 6 }}>
                      <CheckCircle2 size={16} /> Booking reserved
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.86rem', lineHeight: 1.5 }}>
                      {passengers} seat{passengers > 1 ? 's are' : ' is'} reserved for {departureLabel}. Your {seatPreference.replace('-', ' ')} preference was saved.
                      {bookingSource === 'local' ? ' Saved locally while server sync completes.' : ' Saved in your account.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map panel */}
            <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: r(22), padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800 }}>Live route view</div>
                  <div style={{ color: DS.sub, fontSize: '0.76rem', marginTop: 4 }}>Pickup, destination, and route direction before checkout.</div>
                </div>
                <span style={{ ...pill(activeBus.color ?? DS.cyan), fontSize: '0.68rem' }}>Map enabled</span>
              </div>
              <MapWrapper
                mode="live"
                center={routeCenter}
                pickupLocation={pickupCoord}
                dropoffLocation={dropoffCoord}
                driverLocation={midpoint(pickupCoord, dropoffCoord)}
                height={230}
                showMosques={false}
                showRadars={false}
              />
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                {[
                  { icon: <MapPin size={14} color={activeBus.color ?? DS.cyan} />, label: 'Boarding',  value: activeBus.pickupPoint },
                  { icon: <ArrowRight size={14} color={activeBus.color ?? DS.cyan} />, label: 'Main stop', value: activeBus.via?.join(' · ') ?? '' },
                  { icon: <Clock size={14} color={activeBus.color ?? DS.cyan} />, label: 'ETA', value: `${activeBus.arr} arrival · ${activeBus.duration}` },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: DS.card2, border: `1px solid ${DS.border}`, borderRadius: r(14), padding: '12px 14px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: r(10), background: `${activeBus.color ?? DS.cyan}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ color: DS.muted, fontSize: '0.68rem', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.84rem' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: r(22), padding: '18px 18px 16px' }}>
              <div style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>What riders need to know</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  'Booking closes 15 minutes before departure so boarding stays smooth.',
                  'Tickets are digital and tied to the passenger count you select.',
                  'If a route shifts, riders receive an in-app update before departure.',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: DS.sub, fontSize: '0.8rem', lineHeight: 1.5 }}>
                    <Shield size={15} color={DS.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </Protected>
  );
}

export default BusPage;
