/**
 * Wasel Logo System v7.0
 * ─────────────────────────────────────────────
 * Pure SVG — zero external assets, scales from favicon to billboard.
 * Wordmark: "Wasel" with Crown W mark.
 */

import { useState } from 'react';

const NAVY   = '#0B1D45';
const NAVY2  = '#162C6A';
const CYAN   = '#00CAFF';
const CYANL  = '#6EEEFF';
const CYANLL = '#C0F8FF';
const BLUE   = '#2060E8';
const BLUEL  = '#5590FF';

let _uid = 0;

// ═══════════════════════════════════════════════════════════════════════════
//  MARK  (64 × 64 viewBox)
// ═══════════════════════════════════════════════════════════════════════════
function WaselMarkSVG({ size = 48 }: { size?: number }) {
  const [p] = useState(() => `wm${++_uid}`);

  const W = 'M 12 18 C 14 26, 18 36, 22 38 C 26 40, 29 28, 32 22 C 35 28, 38 40, 42 38 C 46 36, 50 26, 52 18';

  const dots = [
    { cx: 12, cy: 18 },
    { cx: 32, cy: 22 },
    { cx: 52, cy: 18 },
  ] as const;

  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      role="img" aria-label="Wasel"
    >
      <defs>
        <linearGradient id={`${p}bg`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#162C6E" />
          <stop offset="100%" stopColor="#0A1638" />
        </linearGradient>
        <radialGradient id={`${p}sh`} cx="30%" cy="20%" r="60%">
          <stop offset="0%"   stopColor={BLUEL} stopOpacity="0.18" />
          <stop offset="100%" stopColor={BLUEL} stopOpacity="0"    />
        </radialGradient>
        <linearGradient id={`${p}wg`} x1="12" y1="28" x2="52" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={CYANL} />
          <stop offset="48%"  stopColor={CYAN}  />
          <stop offset="100%" stopColor={BLUEL} />
        </linearGradient>
        <linearGradient id={`${p}wc`} x1="12" y1="28" x2="52" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={CYANLL} />
          <stop offset="50%"  stopColor={CYANL}  />
          <stop offset="100%" stopColor={BLUEL}  />
        </linearGradient>
        <radialGradient id={`${p}dot`}>
          <stop offset="0%"   stopColor={CYANLL} />
          <stop offset="40%"  stopColor={CYAN}   />
          <stop offset="100%" stopColor={CYAN}   stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}brd`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={CYANL} stopOpacity="0.5" />
          <stop offset="50%"  stopColor={BLUEL} stopOpacity="0.2" />
          <stop offset="100%" stopColor={NAVY2} stopOpacity="0.5" />
        </linearGradient>
        <filter id={`${p}f4`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <filter id={`${p}f2`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${p}fd`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${p}fs`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      <rect x="0" y="0" width="64" height="64" rx="16" ry="16" fill={`url(#${p}bg)`} filter={`url(#${p}fs)`} />
      <rect x="0" y="0" width="64" height="64" rx="16" ry="16" fill={`url(#${p}sh)`} />
      <path d="M 20 2 Q 32 0.5, 44 2" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      <path d={W} stroke={`url(#${p}wg)`} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" filter={`url(#${p}f4)`} opacity="0.20" />
      <path d={W} stroke={`url(#${p}wc)`} strokeWidth="8"  strokeLinecap="round" strokeLinejoin="round" fill="none" filter={`url(#${p}f2)`} opacity="0.55" />
      <path d={W} stroke={`url(#${p}wg)`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={W} stroke={`url(#${p}wc)`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75" />

      {dots.map(({ cx, cy }, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="9"   fill={`url(#${p}dot)`} opacity="0.22" filter={`url(#${p}fd)`} />
          <circle cx={cx} cy={cy} r="4.8" fill={`url(#${p}dot)`} opacity="0.6" />
          <circle cx={cx} cy={cy} r="3.0" fill="rgba(10,22,50,0.85)" stroke={CYANL} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="1.7" fill={CYANLL} />
          <circle cx={cx - 0.7} cy={cy - 0.7} r="0.65" fill="rgba(255,255,255,0.92)" />
        </g>
      ))}

      <rect x="1" y="1" width="62" height="62" rx="15.5" ry="15.5" stroke={`url(#${p}brd)`} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

interface WaselLogoProps {
  size?: number;
  showWordmark?: boolean;
  /** 'dark' = navy text (default, light bg) | 'light' = white text (dark bg) */
  theme?: 'dark' | 'light';
  style?: React.CSSProperties;
  /** compact = just "W" mark; full = Wasel wordmark */
  variant?: 'full' | 'compact';
}

export function WaselLogo({
  size = 38,
  showWordmark = true,
  theme = 'dark',
  style,
  variant = 'full',
}: WaselLogoProps) {
  const isDark      = theme === 'dark';
  const textColor   = isDark ? '#0B1D45' : '#FFFFFF';
  const accentColor = isDark ? '#00CAFF' : '#6EEEFF';
  const subColor    = isDark ? 'rgba(11,29,69,0.38)' : 'rgba(0,202,255,0.55)';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.28), ...style }}>
      <WaselMarkSVG size={size} />

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {variant === 'full' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: size * 0.04 }}>
                <span style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', sans-serif",
                  fontSize: size * 0.44, fontWeight: 900, color: textColor,
                  letterSpacing: '-0.035em', whiteSpace: 'nowrap',
                }}>Wasel</span>
              </div>
              <span style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                fontSize: size * 0.16, fontWeight: 600, color: subColor,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', paddingLeft: 1,
              }}>Move smarter across Jordan</span>
            </>
          ) : (
            <span style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', sans-serif",
              fontSize: size * 0.44, fontWeight: 900, color: textColor,
              letterSpacing: '-0.035em',
            }}>W</span>
          )}
        </div>
      )}
    </div>
  );
}

export function WaselMark({ size = 38, style }: { size?: number; style?: React.CSSProperties }) {
  return <div style={{ display: 'inline-flex', ...style }}><WaselMarkSVG size={size} /></div>;
}

export function WaselHeroMark({ size = 120 }: { size?: number }) {
  return <WaselMarkSVG size={size} />;
}

export function WaselIcon({ size = 20 }: { size?: number }) {
  const [p] = useState(() => `wi${++_uid}`);
  const W = 'M 12 18 C 14 26, 18 36, 22 38 C 26 40, 29 28, 32 22 C 35 28, 38 40, 42 38 C 46 36, 50 26, 52 18';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${p}g`} x1="12" y1="28" x2="52" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={CYANL} />
          <stop offset="100%" stopColor={BLUEL} />
        </linearGradient>
      </defs>
      <path d={W} stroke={`url(#${p}g)`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18" r="2.8" fill={CYANLL} />
      <circle cx="32" cy="22" r="2.8" fill={CYANLL} />
      <circle cx="52" cy="18" r="2.8" fill={CYANLL} />
    </svg>
  );
}
