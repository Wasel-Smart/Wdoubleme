/**
 * WaselBrand — The ONE true Wasel logo system
 * Cosmic Identity · Electric Cyan · Solar Gold
 * Used everywhere: Header, Sidebar, Auth, Loading, Landing
 *
 * The spaceship silhouette IS the letter "W" (Wasel):
 *   UFO disc = crown, arms = outer legs, beam = center stroke, rings = valleys
 * For the SVG W monogram, see /components/WaselW.tsx
 */

import { motion } from 'motion/react';
import waselLogoImg from '../assets/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

// ── Brand Color Constants ──────────────────────────────────────────────────────
export const BRAND = {
  cyan:   '#00C8E8',
  gold:   '#F0A830',
  green:  '#00C875',
  bg:     '#040C18',
  card:   '#0A1628',
} as const;

// ── Logo Mark ─────────────────────────────────────────────────────────────────
interface LogoMarkProps {
  size?: number;
  animated?: boolean;
  pulse?: boolean;
  id?: string;
}

export function WaselBrandMark({ size = 40, animated = true, pulse = false, id = 'main' }: LogoMarkProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        flexShrink: 0,
        boxShadow: `0 0 ${size * 0.4}px rgba(0,200,232,0.3), 0 0 ${size * 0.15}px rgba(0,200,232,0.15)`,
        position: 'relative',
      }}
    >
      <img
        src={waselLogoImg}
        alt="Wasel واصل"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: `drop-shadow(0 0 ${size * 0.12}px ${BRAND.cyan}80)`,
          animation: animated ? 'waselBrandFloat 3s ease-in-out infinite' : undefined,
        }}
      />
      {animated && (
        <style>{`
          @keyframes waselBrandFloat {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.04); filter: brightness(1.12); }
          }
        `}</style>
      )}
      {pulse && (
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: size * 0.25,
            border: `1px solid ${BRAND.cyan}`,
          }}
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// ── Full Brand Wordmark ────────────────────────────────────────────────────────
interface WaselBrandProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
  showTagline?: boolean;
  id?: string;
}

const sizeConfig = {
  xs:  { logo: 24, en: '0.75rem',  ar: '0.7rem',   tag: '0.45rem' },
  sm:  { logo: 32, en: '0.9rem',   ar: '0.85rem',  tag: '0.5rem'  },
  md:  { logo: 40, en: '1.1rem',   ar: '1rem',     tag: '0.55rem' },
  lg:  { logo: 52, en: '1.4rem',   ar: '1.2rem',   tag: '0.6rem'  },
  xl:  { logo: 72, en: '1.9rem',   ar: '1.6rem',   tag: '0.65rem' },
};

export function WaselBrand({ size = 'md', animated = true, onClick, showTagline = false, id = 'brand' }: WaselBrandProps) {
  const cfg = sizeConfig[size];
  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag onClick={onClick}
      className="flex items-center gap-2.5 shrink-0"
      style={{ cursor: onClick ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0 }}
      whileHover={onClick ? { scale: 1.03 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}>

      {/* Logo mark */}
      <div className="relative">
        <WaselBrandMark size={cfg.logo} animated={animated} id={id} />
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 blur-xl opacity-40 rounded-full"
          style={{ background: `radial-gradient(circle, ${BRAND.cyan} 0%, transparent 70%)` }} />
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span style={{
            fontSize: cfg.en,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            background: `linear-gradient(135deg, ${BRAND.cyan} 0%, #5EE7FF 50%, ${BRAND.gold} 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Wasel
          </span>
        </div>
        {showTagline && (
          <span style={{
            fontSize: cfg.tag, color: `${BRAND.cyan}55`,
            letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700,
          }}>
            Mobility Network
          </span>
        )}
        {/* Slogan — always show except xs */}
        {size !== 'xs' && (
          <span
            style={{
              fontSize: cfg.tag,
              fontWeight: 700,
              color: BRAND.gold,
              letterSpacing: '0.04em',
              fontStyle: 'italic',
            }}
          >
            Move smarter across Jordan
          </span>
        )}
      </div>
    </Tag>
  );
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
export function WaselLoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8"
      style={{ background: BRAND.bg, fontFamily: "'Inter', sans-serif", zIndex: 9999 }}>

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${BRAND.cyan}08 0%, transparent 70%)` }} />
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({length:10},(_,i)=>(
            <line key={`h${i}`} x1="0" y1={i*10} x2="100" y2={i*10} stroke={BRAND.cyan} strokeWidth="0.05" opacity="0.3"/>
          ))}
          {Array.from({length:10},(_,i)=>(
            <line key={`v${i}`} x1={i*10} y1="0" x2={i*10} y2="100" stroke={BRAND.cyan} strokeWidth="0.05" opacity="0.3"/>
          ))}
        </svg>
      </div>

      {/* Pulse rings */}
      <div className="relative flex items-center justify-center">
        {[1,2,3].map(i=>(
          <motion.div key={i} className="absolute rounded-full border"
            style={{ borderColor:`${BRAND.cyan}20`, width: 60+i*48, height: 60+i*48 }}
            animate={{ scale:[1,1.08,1], opacity:[0.3,0.1,0.3] }}
            transition={{ duration:2.5, delay:i*0.35, repeat:Infinity }}
          />
        ))}
        <WaselBrandMark size={80} animated pulse id="loading" />
      </div>

      {/* Wordmark */}
      <div className="text-center space-y-3">
        <WaselBrand size="lg" animated showTagline id="loading-brand" />
        <motion.p animate={{ opacity:[0.4,0.8,0.4] }} transition={{ duration:2, repeat:Infinity }}
          style={{ fontSize:'0.7rem', color:`${BRAND.cyan}55`, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:700 }}>
          Loading your journey
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="w-40 h-px rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background:`linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.gold})` }}
          animate={{ x:['-100%','0%'] }}
          transition={{ duration:1.8, repeat:Infinity, ease:'easeInOut' }}
        />
      </div>
    </div>
  );
}
