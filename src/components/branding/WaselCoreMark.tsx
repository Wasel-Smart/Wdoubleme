import React, { useId } from 'react';
import { motion } from 'motion/react';

interface WaselCoreMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glow?: boolean;
  title?: string;
}

/**
 * A production-ready Wasel mark distilled from the circular city concept:
 * one ring, one route, one silhouette.
 */
export function WaselCoreMark({
  size = 48,
  className = '',
  animated = false,
  glow = true,
  title = 'Wasel',
}: WaselCoreMarkProps) {
  const id = useId().replace(/:/g, '');

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={animated ? { y: [0, -3, 0] } : undefined}
      transition={animated ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 202, 255, 0.26) 0%, rgba(35, 184, 233, 0.14) 42%, transparent 74%)',
            filter: `blur(${Math.max(12, size * 0.24)}px)`,
            transform: 'scale(1.16)',
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
        style={{ display: 'block', position: 'relative', zIndex: 1 }}
      >
        <defs>
          <radialGradient id={`${id}-bg`} cx="28%" cy="22%" r="76%">
            <stop offset="0%" stopColor="#173F8A" />
            <stop offset="55%" stopColor="#0D255A" />
            <stop offset="100%" stopColor="#081632" />
          </radialGradient>
          <linearGradient id={`${id}-ring`} x1="10" y1="54" x2="54" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#12C5FF" />
            <stop offset="54%" stopColor="#38E0FF" />
            <stop offset="100%" stopColor="#8FF7FF" />
          </linearGradient>
          <linearGradient id={`${id}-route`} x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C7FBFF" />
            <stop offset="45%" stopColor="#6BEAFE" />
            <stop offset="100%" stopColor="#22C8FF" />
          </linearGradient>
          <linearGradient id={`${id}-river`} x1="23" y1="46" x2="44" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#13D38D" />
            <stop offset="100%" stopColor="#6CF2BC" />
          </linearGradient>
          <filter id={`${id}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#020817" floodOpacity="0.32" />
          </filter>
          <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
        </defs>

        <g filter={`url(#${id}-shadow)`}>
          <circle cx="32" cy="32" r="28" fill={`url(#${id}-bg)`} />
          <circle cx="32" cy="32" r="23.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        </g>

        <circle
          cx="32"
          cy="32"
          r="21.5"
          stroke={`url(#${id}-ring)`}
          strokeWidth="6.5"
          strokeLinecap="round"
          opacity="0.98"
        />

        <path
          d="M21 47C23.8 42.2 25.9 37.7 27.8 33.2C29.4 29.4 30.9 25.3 32.2 20.8C33.5 25.2 35 29.4 36.8 33.2C38.9 37.7 41.4 42.2 44.8 47"
          stroke={`url(#${id}-river)`}
          strokeWidth="10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
          filter={`url(#${id}-soft)`}
        />

        <path
          d="M18 20L24 42L32 24L40 42L46 20"
          stroke={`url(#${id}-route)`}
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M18 20L24 42L32 24L40 42L46 20"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
        />

        <circle cx="18" cy="20" r="2.8" fill="#C7FBFF" />
        <circle cx="32" cy="24" r="3.1" fill="#9AF7FF" />
        <circle cx="46" cy="20" r="2.8" fill="#C7FBFF" />

        <circle cx="18" cy="20" r="5.6" fill="rgba(111, 235, 255, 0.18)" />
        <circle cx="32" cy="24" r="6.2" fill="rgba(111, 235, 255, 0.14)" />
        <circle cx="46" cy="20" r="5.6" fill="rgba(111, 235, 255, 0.18)" />
      </svg>
    </motion.div>
  );
}
