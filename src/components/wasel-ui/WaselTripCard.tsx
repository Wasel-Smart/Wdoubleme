/**
 * WaselTripCard — Core carpooling trip listing card.
 *
 * Displays a single trip result with route, driver, timing, seats, price,
 * CTA buttons (Book + WhatsApp), and feature badges.
 *
 * Used on: FindRide search results, MyTrips history, Home recommendations.
 */

import { motion } from 'motion/react';
import { MapPin, Clock, Users, Star, MessageCircle, Phone, ChevronRight, Shield, Coffee, Cigarette, Music } from 'lucide-react';
import { WaselBadge } from './WaselBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TripDriver {
  id: string;
  name: string;
  nameAr?: string;
  phone: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
  avatarUrl?: string;
  responseTimeMin?: number; // average response time in minutes
}

export interface TripFeatures {
  smokingAllowed?: boolean;
  musicAllowed?: boolean;
  prayerStops?: boolean;
  womenOnly?: boolean;
  aircon?: boolean;
  instantBook?: boolean;
}

export interface WaselTripCardProps {
  id: string;
  from: string;
  fromAr?: string;
  to: string;
  toAr?: string;
  departureDate: string;    // e.g. "Fri, 28 Mar"
  departureTime: string;    // e.g. "07:30 AM"
  arrivalTime?: string;     // e.g. "09:15 AM"
  durationMin?: number;
  distanceKm?: number;
  pricePerSeat: number;     // JOD
  seatsAvailable: number;
  seatsTotal: number;
  driver: TripDriver;
  features?: TripFeatures;
  isInstantBook?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  onBook?: (tripId: string) => void;
  onWhatsApp?: (tripId: string, driverPhone: string) => void;
  onExpand?: (tripId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Dot({ color }: { color: string }) {
  return <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />;
}

function SeatBar({ available, total }: { available: number; total: number }) {
  const pct = available / total;
  const color = pct > 0.5 ? '#00C875' : pct > 0.25 ? '#F0A830' : '#EF4444';
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: 2,
          background: i < available ? color : 'rgba(139,148,166,0.25)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WaselTripCard({
  id, from, fromAr, to, toAr,
  departureDate, departureTime, arrivalTime, durationMin, distanceKm,
  pricePerSeat, seatsAvailable, seatsTotal,
  driver, features = {}, isInstantBook, isPopular, isNew,
  onBook, onWhatsApp, onExpand,
}: WaselTripCardProps) {
  const noSeats = seatsAvailable === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={noSeats ? {} : { y: -3 }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#fff',
        border: '1.5px solid #E2E8F2',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(11,29,69,0.07)',
        opacity: noSeats ? 0.65 : 1,
        transition: 'box-shadow 0.2s',
        fontFamily: "-apple-system,'Inter','Cairo','Tajawal',sans-serif",
      }}
    >
      {/* ── Top accent bar (gradient) ── */}
      <div style={{
        height: 4,
        background: noSeats
          ? '#E2E8F2'
          : isPopular
          ? 'linear-gradient(90deg, #F0A830, #FFD080)'
          : 'linear-gradient(90deg, #00CAFF, #2060E8)',
      }} />

      {/* ── Header: badges + price ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {isInstantBook && <WaselBadge variant="live" label="INSTANT" />}
          {isPopular && <WaselBadge variant="hot" label="POPULAR" />}
          {isNew && <WaselBadge variant="new" />}
          {features.womenOnly && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 999,
              background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.20)',
              fontSize: '0.6rem', fontWeight: 700, color: '#EC4899', letterSpacing: '0.07em',
            }}>👩 WOMEN ONLY</span>
          )}
        </div>

        {/* Price */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0B1D45', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {pricePerSeat.toFixed(2)}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8A9ABD', marginLeft: 3 }}>JOD</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8A9ABD', marginTop: 2 }}>per seat</div>
        </div>
      </div>

      {/* ── Route ── */}
      <div style={{ padding: '14px 16px 0', display: 'flex', gap: 12 }}>
        {/* Left: dots + line */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, gap: 0 }}>
          <Dot color="#00CAFF" />
          <div style={{ width: 2, flex: 1, minHeight: 28, background: 'linear-gradient(#00CAFF, #2060E8)', margin: '4px 0', borderRadius: 1 }} />
          <Dot color="#2060E8" />
        </div>

        {/* Right: city names + times */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Departure */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1D45' }}>{from}</div>
              {fromAr && <div style={{ fontSize: '0.72rem', color: '#8A9ABD', direction: 'rtl' }}>{fromAr}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0B1D45' }}>{departureTime}</div>
              <div style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>{departureDate}</div>
            </div>
          </div>

          {/* Duration strip */}
          {(durationMin || distanceKm) && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {durationMin && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#4A5678' }}>
                  <Clock size={12} /> {Math.floor(durationMin / 60)}h {durationMin % 60}m
                </span>
              )}
              {distanceKm && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#4A5678' }}>
                  <MapPin size={12} /> {distanceKm} km
                </span>
              )}
            </div>
          )}

          {/* Arrival */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1D45' }}>{to}</div>
              {toAr && <div style={{ fontSize: '0.72rem', color: '#8A9ABD', direction: 'rtl' }}>{toAr}</div>}
            </div>
            {arrivalTime && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0B1D45' }}>{arrivalTime}</div>
                <div style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>arrival</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ margin: '14px 16px 0', height: 1, background: '#E2E8F2' }} />

      {/* ── Driver + Seats row ── */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Driver */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00CAFF22, #2060E822)',
            border: '2px solid #E2E8F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', overflow: 'hidden', flexShrink: 0,
          }}>
            {driver.avatarUrl
              ? <img src={driver.avatarUrl} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '👤'}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B1D45' }}>{driver.name}</span>
              {driver.verified && (
                <span title="Verified Driver" style={{ color: '#00C875' }}><Shield size={12} /></span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.68rem', color: '#F0A830', fontWeight: 700 }}>
                <Star size={11} fill="#F0A830" /> {driver.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>{driver.totalTrips} trips</span>
              {driver.responseTimeMin && (
                <span style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>~{driver.responseTimeMin}m reply</span>
              )}
            </div>
          </div>
        </div>

        {/* Seats */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: 4 }}>
            <Users size={12} color="#8A9ABD" />
            <span style={{ fontSize: '0.72rem', color: noSeats ? '#EF4444' : '#0B1D45', fontWeight: 700 }}>
              {noSeats ? 'Full' : `${seatsAvailable} left`}
            </span>
          </div>
          <SeatBar available={seatsAvailable} total={seatsTotal} />
        </div>
      </div>

      {/* ── Feature chips ── */}
      {Object.values(features).some(Boolean) && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {features.prayerStops && (
            <span style={chipStyle('#6366F1')}>🕌 Prayer Stops</span>
          )}
          {features.aircon && (
            <span style={chipStyle('#00CAFF')}>❄️ A/C</span>
          )}
          {features.musicAllowed && (
            <span style={chipStyle('#8A9ABD')}><Music size={10} /> Music OK</span>
          )}
          {features.smokingAllowed === false && (
            <span style={chipStyle('#EF4444')}><Cigarette size={10} /> No Smoking</span>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
        {/* WhatsApp */}
        <button
          disabled={noSeats}
          onClick={() => onWhatsApp?.(id, driver.phone)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 42, borderRadius: 12,
            background: noSeats ? '#F0F4FA' : '#25D36615',
            border: `1.5px solid ${noSeats ? '#E2E8F2' : '#25D36640'}`,
            cursor: noSeats ? 'not-allowed' : 'pointer',
            color: noSeats ? '#8A9ABD' : '#128C7E',
            fontSize: '0.8rem', fontWeight: 700,
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <MessageCircle size={15} />
          WhatsApp
        </button>

        {/* Book */}
        <button
          disabled={noSeats}
          onClick={() => onBook?.(id)}
          style={{
            flex: 1, height: 42, borderRadius: 12,
            background: noSeats
              ? '#F0F4FA'
              : 'linear-gradient(135deg, #00CAFF 0%, #2060E8 100%)',
            border: 'none',
            cursor: noSeats ? 'not-allowed' : 'pointer',
            color: noSeats ? '#8A9ABD' : '#fff',
            fontSize: '0.85rem', fontWeight: 800,
            boxShadow: noSeats ? 'none' : '0 4px 16px rgba(0,202,255,0.30)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {noSeats ? 'Fully Booked' : 'Book Seat'}
          {!noSeats && <ChevronRight size={15} />}
        </button>

        {/* Expand details */}
        {onExpand && (
          <button
            onClick={() => onExpand(id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 42, height: 42, borderRadius: 12,
              background: '#F0F4FA', border: '1.5px solid #E2E8F2',
              cursor: 'pointer', color: '#4A5678',
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Chip helper ───────────────────────────────────────────────────────────────

function chipStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 9px', borderRadius: 999,
    background: `${color}12`, border: `1px solid ${color}25`,
    fontSize: '0.65rem', fontWeight: 600,
    color,
    whiteSpace: 'nowrap',
  };
}
