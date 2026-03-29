/**
 * WaselDriverCard — Driver profile card for marketplace & listings.
 *
 * Variants:
 *  'compact'  — avatar + name + rating + quick contact (used in trip listings)
 *  'profile'  — full card with stats, vehicle info, badges, bio
 *  'leaderboard' — rank + name + score row (used in analytics dashboard)
 */

import { motion } from 'motion/react';
import { Star, Shield, Phone, MessageCircle, Car, Hash, TrendingUp, Clock, Award } from 'lucide-react';
import { WaselBadge } from './WaselBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DriverVehicle {
  make: string;       // e.g. "Toyota"
  model: string;      // e.g. "Camry"
  year: number;       // e.g. 2021
  color: string;      // e.g. "Silver"
  plateNumber: string;
}

export interface DriverStats {
  totalTrips: number;
  rating: number;       // 1–5
  acceptanceRate: number; // 0–100
  completionRate: number; // 0–100
  avgResponseMin: number;
  onTimeRate: number;   // 0–100
}

export interface WaselDriverCardProps {
  id: string;
  name: string;
  nameAr?: string;
  avatarUrl?: string;
  verified?: boolean;
  isPremium?: boolean;
  isTopRated?: boolean;
  stats: DriverStats;
  vehicle?: DriverVehicle;
  bio?: string;
  variant?: 'compact' | 'profile' | 'leaderboard';
  rank?: number;          // for leaderboard variant
  phone?: string;
  onContact?: (id: string, method: 'phone' | 'whatsapp') => void;
  onViewProfile?: (id: string) => void;
}

// ── Star rating row ───────────────────────────────────────────────────────────

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? '#F0A830' : 'transparent'}
          color={i <= Math.round(rating) ? '#F0A830' : '#C0CFEA'}
        />
      ))}
      <span style={{ fontSize: size * 0.9, fontWeight: 700, color: '#0B1D45', marginLeft: 3 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ icon, label, value, color = '#0B1D45' }: {
  icon: React.ReactNode; label: string; value: string | number; color?: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      padding: '10px 12px', borderRadius: 12,
      background: '#F8FAFF', border: '1px solid #E2E8F2',
      minWidth: 72,
    }}>
      <div style={{ color: '#00CAFF' }}>{icon}</div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.6rem', color: '#8A9ABD', textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WaselDriverCard({
  id, name, nameAr, avatarUrl, verified, isPremium, isTopRated,
  stats, vehicle, bio, variant = 'profile', rank, phone,
  onContact, onViewProfile,
}: WaselDriverCardProps) {

  // ── Leaderboard variant ──────────────────────────────────────────────────────
  if (variant === 'leaderboard') {
    const rankColors: Record<number, string> = { 1: '#F0A830', 2: '#C0CFEA', 3: '#CD7C46' };
    const rankBg: Record<number, string>     = { 1: '#FFF8E6', 2: '#F4F6FA', 3: '#FDF1E8' };
    const rColor = rankColors[rank ?? 99] ?? '#E2E8F2';
    const rBg    = rankBg[rank ?? 99]    ?? '#F8FAFF';

    return (
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        padding: '12px 16px',
        background: rank === 1 ? '#FFFDF5' : '#fff',
        border: `1px solid ${rank === 1 ? '#F0A83030' : '#E2E8F2'}`,
        borderRadius: 14,
        fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
      }}>
        {/* Rank badge */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: rBg, border: `2px solid ${rColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 900, color: rColor, flexShrink: 0,
        }}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
        </div>

        {/* Avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: '#E2E8F2', overflow: 'hidden',
          border: '2px solid #E2E8F2', flexShrink: 0,
        }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>}
        </div>

        {/* Name + rating */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0B1D45', display: 'flex', gap: 5, alignItems: 'center' }}>
            {name}
            {verified && <Shield size={12} color="#00C875" />}
          </div>
          <StarRating rating={stats.rating} size={11} />
        </div>

        {/* Trips */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00CAFF' }}>{stats.totalTrips.toLocaleString()}</div>
          <div style={{ fontSize: '0.6rem', color: '#8A9ABD' }}>trips</div>
        </div>
      </div>
    );
  }

  // ── Compact variant ──────────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        padding: '10px 14px',
        background: '#fff', border: '1px solid #E2E8F2', borderRadius: 14,
        fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#E8EDF6', overflow: 'hidden',
          border: '2px solid #E2E8F2', flexShrink: 0,
        }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👤</div>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0B1D45', whiteSpace: 'nowrap' }}>{name}</span>
            {verified && <Shield size={13} color="#00C875" />}
            {isPremium && <WaselBadge variant="ai" label="PRO" />}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
            <StarRating rating={stats.rating} size={11} />
            <span style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>{stats.totalTrips} trips</span>
            {stats.avgResponseMin && (
              <span style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>~{stats.avgResponseMin}m reply</span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {phone && (
            <button
              onClick={() => onContact?.(id, 'whatsapp')}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#25D36615', border: '1.5px solid #25D36640',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#128C7E',
              }}
            >
              <MessageCircle size={15} />
            </button>
          )}
          <button
            onClick={() => onViewProfile?.(id)}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#00CAFF15', border: '1.5px solid #00CAFF30',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#00CAFF',
            }}
          >
            <TrendingUp size={15} />
          </button>
        </div>
      </div>
    );
  }

  // ── Profile variant (default) ────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        border: '1.5px solid #E2E8F2',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(11,29,69,0.07)',
        fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
      }}
    >
      {/* ── Cover band ── */}
      <div style={{
        height: 6,
        background: isTopRated
          ? 'linear-gradient(90deg, #F0A830, #FFD080)'
          : isPremium
          ? 'linear-gradient(90deg, #00CAFF, #2060E8)'
          : '#E2E8F2',
      }} />

      {/* ── Avatar + name section ── */}
      <div style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#E8EDF6', overflow: 'hidden',
            border: '3px solid #fff',
            boxShadow: '0 2px 8px rgba(11,29,69,0.14)',
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>👤</div>}
          </div>
          {verified && (
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 20, height: 20, borderRadius: '50%',
              background: '#00C875', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={10} color="#fff" />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0B1D45' }}>{name}</h3>
            {isTopRated && <WaselBadge variant="hot" label="TOP RATED" />}
            {isPremium && <WaselBadge variant="ai" label="PRO" />}
          </div>
          {nameAr && (
            <p style={{ margin: '2px 0 4px', fontSize: '0.75rem', color: '#8A9ABD', direction: 'rtl' }}>{nameAr}</p>
          )}
          <StarRating rating={stats.rating} size={13} />
          <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#4A5678' }}>
            {stats.totalTrips.toLocaleString()} completed trips
          </p>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ padding: '0 18px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <StatPill icon={<Hash size={14} />}       label="Total Trips"    value={stats.totalTrips.toLocaleString()} />
        <StatPill icon={<TrendingUp size={14} />}  label="Acceptance"     value={`${stats.acceptanceRate}%`}       color="#00C875" />
        <StatPill icon={<Award size={14} />}       label="Completion"     value={`${stats.completionRate}%`}       color="#00CAFF" />
        <StatPill icon={<Clock size={14} />}       label="Avg Response"   value={`${stats.avgResponseMin}m`}       />
      </div>

      {/* ── Vehicle info ── */}
      {vehicle && (
        <div style={{
          margin: '0 18px 14px',
          padding: '12px 14px',
          background: '#F8FAFF', border: '1px solid #E2E8F2', borderRadius: 12,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <Car size={18} color="#00CAFF" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0B1D45' }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8A9ABD', marginTop: 1 }}>
              {vehicle.color} · {vehicle.plateNumber}
            </div>
          </div>
        </div>
      )}

      {/* ── Bio ── */}
      {bio && (
        <p style={{
          margin: '0 18px 16px', fontSize: '0.8rem', color: '#4A5678',
          lineHeight: 1.6, borderLeft: '3px solid #00CAFF30', paddingLeft: 10,
        }}>
          {bio}
        </p>
      )}

      {/* ── Actions ── */}
      <div style={{ padding: '0 18px 18px', display: 'flex', gap: 10 }}>
        {phone && (
          <>
            <button
              onClick={() => onContact?.(id, 'whatsapp')}
              style={{
                flex: 1, height: 42, borderRadius: 12,
                background: '#25D36618', border: '1.5px solid #25D36640',
                cursor: 'pointer', color: '#128C7E',
                fontSize: '0.82rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button
              onClick={() => onContact?.(id, 'phone')}
              style={{
                width: 42, height: 42, borderRadius: 12,
                background: '#F8FAFF', border: '1.5px solid #E2E8F2',
                cursor: 'pointer', color: '#4A5678',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Phone size={15} />
            </button>
          </>
        )}
        <button
          onClick={() => onViewProfile?.(id)}
          style={{
            flex: phone ? 0 : 1, height: 42,
            padding: phone ? '0 14px' : '0',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00CAFF, #2060E8)',
            border: 'none', cursor: 'pointer', color: '#fff',
            fontSize: '0.82rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 16px rgba(0,202,255,0.28)',
          }}
        >
          View Profile
        </button>
      </div>
    </motion.div>
  );
}
