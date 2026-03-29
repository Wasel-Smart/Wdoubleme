import React from 'react';
import { motion } from 'motion/react';
import { WaselCoreMark } from './branding/WaselCoreMark';

const B = {
  cyan: '#00C8E8',
  green: '#13D38D',
  navy: '#0B1D45',
} as const;

const SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 80,
  hero: 140,
  giant: 320,
};

function resolveSize(size: number | string): number {
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] ?? 48;
}

interface WaselLogoMarkProps {
  size?: number | string;
  className?: string;
  animated?: boolean;
  glow?: boolean;
  showTagline?: boolean;
  onClick?: () => void;
}

export function WaselLogoMark({
  size = 48,
  className = '',
  animated = false,
  glow = true,
  onClick,
}: WaselLogoMarkProps) {
  const px = resolveSize(size);

  return (
    <motion.div
      className={`relative flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: px, height: px }}
      aria-label="Wasel Logo"
      role="img"
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${B.cyan}40 0%, ${B.green}18 42%, transparent 72%)`,
            filter: `blur(${px * 0.22}px)`,
            transform: 'scale(1.2)',
          }}
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [1.16, 1.24, 1.16] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <WaselCoreMark
        size={px}
        animated={animated}
        glow={false}
        className="relative z-[1]"
        title="Wasel"
      />
    </motion.div>
  );
}

export function WaselLogotype({
  size = 36,
  showArabic = true,
  className = '',
  onClick,
}: {
  size?: number;
  showArabic?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
    >
      <WaselLogoMark size={size} glow animated={false} />
      <div className="leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className="font-black"
            style={{
              fontSize: size * 0.44,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.86) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Wasel
          </span>
          {showArabic && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: size * 0.38 }}>|</span>
              <span
                className="font-black"
                style={{
                  fontSize: size * 0.44,
                  fontFamily: "'Cairo', 'Tajawal', sans-serif",
                  background: `linear-gradient(135deg, ${B.cyan}, ${B.green})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ÙˆØ§ØµÙ„
              </span>
            </>
          )}
        </div>
        <div
          className="font-bold uppercase tracking-widest"
          style={{
            fontSize: size * 0.17,
            color: `${B.cyan}90`,
            letterSpacing: '0.18em',
            marginTop: 2,
          }}
        >
          Mobility OS
        </div>
      </div>
    </motion.div>
  );
}

export function WaselHeroLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${B.cyan}30 0%, ${B.green}18 40%, transparent 74%)`,
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 'clamp(260px, 32vw, 420px)',
          height: 'clamp(260px, 32vw, 420px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <WaselCoreMark size={420} glow={false} title="Wasel" className="w-full h-full" />
      </motion.div>
    </div>
  );
}

export function WaselLoadingLogo({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid transparent`,
            borderTopColor: B.cyan,
            borderRightColor: `${B.cyan}50`,
            margin: -6,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <WaselLogoMark size={size} glow animated />
      </div>
      {message && (
        <motion.p
          className="text-sm font-medium"
          style={{ color: `${B.cyan}90` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

export function WaselFooterLogo({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <WaselCoreMark size={40} glow={false} title="Wasel" />
      <span
        className="font-black text-lg cursor-pointer"
        onClick={onClick}
        style={{
          background: `linear-gradient(135deg, #fff, ${B.cyan})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Wasel | ÙˆØ§ØµÙ„
      </span>
    </div>
  );
}
