/**
 * Wasel Design System — Card Components v3.0
 * Deep Space · Glassmorphic
 */

import { DS } from './tokens';
import { IconCheck, IconBell, IconShield, IconActivity, IconChevronRight } from './DSIcons';

// ── Status Card ───────────────────────────────────────────────────────────────

interface StatusCardProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  badge?: string;
  action?: string;
}

const STATUS_CONFIG = {
  success: {
    bg:     DS.color.successL,
    border: `${DS.color.success}30`,
    iconBg: DS.color.success,
    color:  DS.color.success,
    label:  'Success',
    Icon:   IconCheck,
  },
  info: {
    bg:     DS.color.infoL,
    border: `${DS.color.info}30`,
    iconBg: DS.color.info,
    color:  DS.color.info,
    label:  'Info',
    Icon:   IconBell,
  },
  warning: {
    bg:     DS.color.warningL,
    border: `${DS.color.warning}30`,
    iconBg: DS.color.warning,
    color:  DS.color.warning,
    label:  'Warning',
    Icon:   IconShield,
  },
  error: {
    bg:     DS.color.errorL,
    border: `${DS.color.error}30`,
    iconBg: DS.color.error,
    color:  DS.color.error,
    label:  'Error',
    Icon:   IconActivity,
  },
};

export function StatusCard({ type, title, message, badge, action }: StatusCardProps) {
  const cfg = STATUS_CONFIG[type];
  const Icon = cfg.Icon;

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: DS.radius.xl,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${cfg.iconBg}25`,
          border: `1px solid ${cfg.iconBg}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={cfg.color} strokeWidth={2.5} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: DS.font.size.sm, fontWeight: 700, color: DS.color.text, fontFamily: DS.font.family }}>{title}</div>
            {badge && (
              <span style={{
                fontSize: '0.58rem', fontWeight: 700, color: cfg.color,
                background: `${cfg.iconBg}18`, border: `1px solid ${cfg.iconBg}30`,
                borderRadius: DS.radius.full, padding: '2px 8px',
                fontFamily: DS.font.family, letterSpacing: '0.08em',
              }}>
                {badge}
              </span>
            )}
          </div>
          <p style={{
            margin: 0, fontSize: DS.font.size.xs, color: DS.color.textSub,
            fontFamily: DS.font.family, lineHeight: 1.6,
          }}>
            {message}
          </p>
          {action && (
            <button style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: DS.font.size.xs, fontWeight: 700, color: cfg.color,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: DS.font.family,
            }}>
              {action} <IconChevronRight size={12} color={cfg.color} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Surface Card ──────────────────────────────────────────────────────────────

export function SurfaceCard({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div style={{
      background: DS.color.bgCard,
      border: `1px solid ${DS.color.border}`,
      borderRadius: DS.radius.xl,
      padding: noPad ? 0 : '20px',
      transition: 'box-shadow 0.2s ease',
    }}>
      {children}
    </div>
  );
}

// ── Ride Card ─────────────────────────────────────────────────────────────────

interface RideCardProps {
  from: string;
  to: string;
  price: number;
  seats: number;
  time: string;
  driver: string;
  rating: number;
}

export function RideCard({ from, to, price, seats, time, driver, rating }: RideCardProps) {
  return (
    <div style={{
      background: DS.color.bgCard,
      border: `1px solid ${DS.color.border}`,
      borderRadius: DS.radius.xl,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: DS.color.primary, boxShadow: `0 0 6px ${DS.color.primary}` }} />
            <span style={{ fontSize: DS.font.size.sm, fontWeight: 600, color: DS.color.text, fontFamily: DS.font.family }}>{from}</span>
          </div>
          <div style={{ width: 1, height: 16, background: `linear-gradient(${DS.color.primary}, ${DS.color.green})`, marginLeft: 3.5 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: DS.color.green, boxShadow: `0 0 6px ${DS.color.green}` }} />
            <span style={{ fontSize: DS.font.size.sm, fontWeight: 600, color: DS.color.text, fontFamily: DS.font.family }}>{to}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: DS.font.size.xl, fontWeight: DS.font.weight.black,
            color: DS.color.primary, fontFamily: DS.font.family, letterSpacing: '-0.025em',
          }}>
            JOD {price}
          </div>
          <div style={{ fontSize: DS.font.size.xs, color: DS.color.textMuted, fontFamily: DS.font.family }}>per seat</div>
        </div>
      </div>

      {/* Meta */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: `1px solid ${DS.color.border}`,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: DS.font.size.xs, color: DS.color.textMuted, fontFamily: DS.font.family }}>{time}</div>
          <div style={{
            fontSize: DS.font.size.xs, fontWeight: 600,
            color: seats > 0 ? DS.color.green : DS.color.error,
            fontFamily: DS.font.family,
          }}>
            {seats} seats left
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: DS.color.primaryDim,
            border: `1px solid ${DS.color.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem',
          }}>👤</div>
          <div>
            <div style={{ fontSize: DS.font.size.xs, fontWeight: 600, color: DS.color.text, fontFamily: DS.font.family }}>{driver}</div>
            <div style={{ fontSize: '0.6rem', color: DS.color.accent, fontFamily: DS.font.family }}>★ {rating}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
