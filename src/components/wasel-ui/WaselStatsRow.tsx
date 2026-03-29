/**
 * WaselStatsRow — Reusable horizontal stats strip.
 *
 * Components:
 *  WaselStatsRow      — responsive row of stat tiles (value + label + optional trend)
 *  WaselStatCard      — single elevated stat card with icon, sparkline support
 *  WaselKPIBanner     — full-width announcement-style highlight metric
 */

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StatItem {
  label: string;
  labelAr?: string;
  value: string | number;
  unit?: string;
  trend?: number;       // positive = up, negative = down, 0 = flat (percent)
  trendLabel?: string;  // e.g. "vs last week"
  color?: string;       // override tile accent
  icon?: ReactNode;
}

// ── WaselStatsRow ─────────────────────────────────────────────────────────────

interface WaselStatsRowProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  compact?: boolean;
}

export function WaselStatsRow({ stats, columns, compact = false }: WaselStatsRowProps) {
  const cols = columns ?? Math.min(stats.length, 4);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: compact ? 8 : 12,
    }}>
      {stats.map((s, i) => (
        <StatTile key={i} stat={s} compact={compact} />
      ))}
    </div>
  );
}

// ── StatTile (internal) ───────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0)  return <TrendingUp  size={12} color="#00C875" />;
  if (trend < 0)  return <TrendingDown size={12} color="#EF4444" />;
  return <Minus size={12} color="#8A9ABD" />;
}

function StatTile({ stat, compact }: { stat: StatItem; compact: boolean }) {
  const trendColor = !stat.trend ? '#8A9ABD' : stat.trend > 0 ? '#00C875' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        border: `1px solid #E2E8F2`,
        borderRadius: compact ? 12 : 16,
        padding: compact ? '10px 12px' : '14px 16px',
        borderTop: stat.color ? `3px solid ${stat.color}` : '1px solid #E2E8F2',
        fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
      }}
    >
      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: compact ? 4 : 6 }}>
        {stat.icon && (
          <span style={{ color: stat.color ?? '#00CAFF', display: 'flex', flexShrink: 0 }}>
            {stat.icon}
          </span>
        )}
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, color: '#8A9ABD',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {stat.label}
        </span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          fontSize: compact ? '1.1rem' : '1.45rem',
          fontWeight: 900, color: '#0B1D45',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          {stat.value}
        </span>
        {stat.unit && (
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8A9ABD' }}>{stat.unit}</span>
        )}
      </div>

      {/* Arabic sub-label */}
      {stat.labelAr && !compact && (
        <div style={{ fontSize: '0.62rem', color: '#8A9ABD', marginTop: 2, direction: 'rtl' }}>
          {stat.labelAr}
        </div>
      )}

      {/* Trend */}
      {stat.trend !== undefined && !compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <TrendIcon trend={stat.trend} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: trendColor }}>
            {stat.trend > 0 ? '+' : ''}{stat.trend}%
          </span>
          {stat.trendLabel && (
            <span style={{ fontSize: '0.62rem', color: '#8A9ABD' }}>{stat.trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── WaselStatCard ─────────────────────────────────────────────────────────────

interface WaselStatCardProps {
  label: string;
  labelAr?: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: ReactNode;
  accentColor?: string;
  trend?: number;
  trendLabel?: string;
  /** Mini sparkline values (6–12 numbers, normalized 0–100) */
  sparkline?: number[];
}

export function WaselStatCard({
  label, labelAr, value, unit, description, icon,
  accentColor = '#00CAFF', trend, trendLabel, sparkline,
}: WaselStatCardProps) {
  const trendColor = !trend ? '#8A9ABD' : trend > 0 ? '#00C875' : '#EF4444';
  const height = 40;
  const width  = 80;

  // Build SVG sparkline path
  const sparkPath = (() => {
    if (!sparkline || sparkline.length < 2) return null;
    const step = width / (sparkline.length - 1);
    const points = sparkline.map((v, i) => {
      const x = i * step;
      const y = height - (v / 100) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: '#fff',
        border: '1.5px solid #E2E8F2',
        borderRadius: 18,
        padding: '18px 20px',
        boxShadow: '0 2px 12px rgba(11,29,69,0.06)',
        fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Colored left rail */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
        background: `linear-gradient(180deg, ${accentColor}, ${accentColor}88)`,
        borderRadius: '18px 0 0 18px',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Icon + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            {icon && (
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `${accentColor}15`, border: `1px solid ${accentColor}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentColor,
              }}>
                {icon}
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8A9ABD', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {label}
              </div>
              {labelAr && (
                <div style={{ fontSize: '0.62rem', color: '#8A9ABD', direction: 'rtl' }}>{labelAr}</div>
              )}
            </div>
          </div>

          {/* Value */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0B1D45', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {value}
            </span>
            {unit && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8A9ABD' }}>{unit}</span>}
          </div>

          {description && (
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#4A5678', lineHeight: 1.4 }}>
              {description}
            </p>
          )}

          {/* Trend */}
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              {trend > 0 ? <TrendingUp size={13} color={trendColor} /> :
               trend < 0 ? <TrendingDown size={13} color={trendColor} /> :
               <Minus size={13} color={trendColor} />}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: trendColor }}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span style={{ fontSize: '0.65rem', color: '#8A9ABD' }}>{trendLabel}</span>}
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparkPath && (
          <div style={{ flexShrink: 0, marginLeft: 12, opacity: 0.7 }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
              {/* Filled area */}
              <path
                d={`${sparkPath} L ${width},${height} L 0,${height} Z`}
                fill={`${accentColor}18`}
              />
              {/* Line */}
              <path
                d={sparkPath}
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Last dot */}
              <circle
                cx={(sparkline!.length - 1) * (width / (sparkline!.length - 1))}
                cy={height - (sparkline![sparkline!.length - 1] / 100) * height}
                r="3"
                fill={accentColor}
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── WaselKPIBanner ────────────────────────────────────────────────────────────

interface WaselKPIBannerProps {
  /** Main headline number */
  value: string | number;
  unit?: string;
  label: string;
  labelAr?: string;
  description?: string;
  gradient?: string;
  icon?: ReactNode;
  badge?: string;
  action?: { label: string; onClick: () => void };
}

export function WaselKPIBanner({
  value, unit, label, labelAr, description,
  gradient = 'linear-gradient(135deg, #00CAFF 0%, #2060E8 100%)',
  icon, badge, action,
}: WaselKPIBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: gradient,
        borderRadius: 20,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 8px 32px rgba(0,202,255,0.28)',
        fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80,  height: 80,  borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '1.8rem',
        }}>
          {icon}
        </div>
      )}

      <div style={{ flex: 1 }}>
        {badge && (
          <span style={{
            display: 'inline-block', marginBottom: 6,
            padding: '2px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.20)',
            fontSize: '0.62rem', fontWeight: 800, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {badge}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {value}
          </span>
          {unit && <span style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{unit}</span>}
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{label}</div>
        {labelAr && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', direction: 'rtl', marginTop: 1 }}>{labelAr}</div>}
        {description && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.70)', marginTop: 4 }}>{description}</div>}
      </div>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            height: 40, padding: '0 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.22)',
            border: '1.5px solid rgba(255,255,255,0.30)',
            color: '#fff', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
            transition: 'background 0.15s',
            fontFamily: 'inherit',
          }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
