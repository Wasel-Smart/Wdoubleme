/**
 * Logo — Wasel | واصل & Awasel | أوصل
 * ╔═══════════════════════════════════════════════════╗
 * ║  LOGO-CENTRIC · CUTTING EDGE · BRAND CANONICAL   ║
 * ║  Dark/Light dual-mode · Animated · RTL-aware     ║
 * ╚═══════════════════════════════════════════════════╝
 *
 * The spaceship silhouette IS the letter "W" (for Wasel):
 *   - UFO disc = top arc of W's middle peak
 *   - Two arms extending outward = outer legs of W
 *   - Central beam = center stroke of W
 *   - Bottom rings = valleys of W
 *
 * Variants:
 *  - full: Logo mark + bilingual wordmark + tagline (headers, auth)
 *  - wordmark: Logo mark + text only (sidebar, nav)
 *  - mark: Logo mark alone (favicon, avatar, loading)
 *  - color-plate: Full brand palette showcase (settings, styleguide)
 */

import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

// Wasel brand logo — the spaceship whose silhouette forms the letter "W"
import waselLogoImg from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

// ─── Brand tokens ─────────────────────────────────────────────────────────────

export const BRAND = {
  teal:        '#00C8E8',
  green:       '#00C875',
  bronze:      '#F0A830',
  lime:        '#A8E63D',
  navyDeep:    '#040C18',
  navyCard:    '#0A1628',
  // Light-mode equivalents
  lightBg:     '#F0F9FA',
  lightCard:   '#FFFFFF',
  lightBorder: 'rgba(0,200,232,0.15)',
} as const;

// ─── Size map ─────────────────────────────────────────────────────────────────

const MARK_SIZE = {
  xs:   28,
  sm:   36,
  md:   44,
  lg:   56,
  xl:   80,
  hero: 120,
} as const;

// ─── WaselMark — the core logo badge ─────────────────────────────────────────

interface WaselMarkProps {
  size?: keyof typeof MARK_SIZE;
  pulse?: boolean;
  spin?:  boolean;
  className?: string;
}

export function WaselMark({ size = 'md', pulse = false, spin = false, className = '' }: WaselMarkProps) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const px   = MARK_SIZE[size];
  const isLarge = px >= 56; // lg+ gets the orbit ring

  return (
    <motion.div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: px, height: px }}
      animate={pulse ? { scale: [1, 1.03, 1] } : {}}
      transition={pulse ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Subtle ambient glow — only for md+ */}
      {px >= 44 && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${BRAND.teal}25 0%, transparent 70%)`,
            filter: 'blur(8px)',
            transform: 'scale(1.3)',
          }}
        />
      )}

      {/* Single orbit ring — only for lg+ sizes */}
      {isLarge && (
        <motion.div
          className="absolute rounded-2xl"
          style={{
            inset: '-5px',
            border: '1.5px solid transparent',
            backgroundImage: `linear-gradient(${dark ? '#040C18' : '#F0F9FA'}, ${dark ? '#040C18' : '#F0F9FA'}), linear-gradient(135deg, ${BRAND.green}, ${BRAND.teal}, ${BRAND.lime})`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
          animate={{ rotate: spin ? 360 : [0, -5, 0, 5, 0] }}
          transition={{ duration: spin ? 14 : 12, repeat: Infinity, ease: spin ? 'linear' : 'easeInOut' }}
        />
      )}

      {/* Core logo container — rounded-2xl, NO circular clip */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: dark
            ? `linear-gradient(145deg, #0A1628, #040C18)`
            : `linear-gradient(145deg, #F0F9FA, #FFFFFF)`,
          boxShadow: dark
            ? `0 0 0 1px rgba(0,200,232,0.15), 0 4px 20px rgba(0,200,232,0.15)`
            : `0 0 0 1px rgba(0,200,232,0.2), 0 4px 20px rgba(0,200,135,0.12)`,
        }}
      >
        {/* Logo image — no border-radius, let shape breathe */}
        <img
          src={waselLogoImg}
          alt="Wasel واصل"
          className="w-full h-full object-contain p-[8%]"
          draggable={false}
          style={{
            filter: dark
              ? `drop-shadow(0 0 ${px * 0.15}px ${BRAND.teal}80)`
              : 'none',
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── WaselWordmark — text part ────────────────────────────────────────────────

interface WaselWordmarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showAwasel?: boolean;
}

function WaselWordmark({ size = 'sm', showTagline = false, showAwasel = false }: WaselWordmarkProps) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const sizes = {
    xs: { primary: '0.75rem', secondary: '0.55rem', tagline: '0.5rem' },
    sm: { primary: '0.92rem', secondary: '0.62rem', tagline: '0.55rem' },
    md: { primary: '1.1rem',  secondary: '0.72rem', tagline: '0.6rem'  },
    lg: { primary: '1.4rem',  secondary: '0.85rem', tagline: '0.7rem'  },
    xl: { primary: '1.8rem',  secondary: '1.0rem',  tagline: '0.8rem'  },
  }[size];

  return (
    <div className="flex flex-col justify-center leading-none gap-[2px]">
      {/* Primary: bilingual name */}
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-black tracking-tight"
          style={{
            fontSize: sizes.primary,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.teal} 60%, ${BRAND.lime} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          Wasel
        </span>
        <span
          style={{
            fontSize: sizes.secondary,
            fontWeight: 700,
            color: dark ? 'rgba(100,116,139,0.8)' : 'rgba(71,85,105,0.7)',
            letterSpacing: '0.02em',
          }}
        >
          واصل
        </span>
      </div>

      {/* Slogan — hide at xs (too small to read) */}
      {size !== 'xs' && (
        <p
          dir="rtl"
          style={{
            fontSize: sizes.tagline,
            fontWeight: 600,
            color: BRAND.bronze,
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            letterSpacing: '0.02em',
            marginTop: '1px',
          }}
        >
          انا واصل انتا؟
        </p>
      )}

      {/* Awasel sub-brand (optional) */}
      {showAwasel && (
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1"
          style={{ marginTop: '1px' }}
        >
          <span
            style={{
              fontSize: sizes.tagline,
              fontWeight: 600,
              color: BRAND.bronze,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            & Awasel
          </span>
          <span
            style={{
              fontSize: sizes.tagline,
              fontWeight: 600,
              color: dark ? 'rgba(100,116,139,0.6)' : 'rgba(100,116,139,0.7)',
            }}
          >
            |
          </span>
          <span
            style={{
              fontSize: sizes.tagline,
              fontWeight: 600,
              color: BRAND.bronze,
              fontFamily: '-apple-system, "Cairo", "Tajawal", sans-serif',
            }}
          >
            أوصل
          </span>
        </motion.div>
      )}

      {/* Tagline (xl mode only) */}
      {showTagline && (
        <p
          style={{
            fontSize: sizes.tagline,
            fontWeight: 500,
            letterSpacing: '0.09em',
            color: dark ? 'rgba(71,85,105,0.8)' : 'rgba(100,116,139,0.7)',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          Your Intelligent Mobility Companion
        </p>
      )}
    </div>
  );
}

// ─── Main Logo component ──────────────────────────────────────────────────────

interface LogoProps {
  /** Layout variant */
  variant?: 'full' | 'wordmark' | 'mark' | 'color-plate';
  size?:    'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  /** Show "& Awasel | أوصل" sub-brand */
  showAwasel?: boolean;
  /** Show tagline below */
  showTagline?: boolean;
  /** Pulse the logo mark */
  pulse?: boolean;
  /** Spin the logo mark rings */
  rolling?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({
  variant    = 'wordmark',
  size       = 'sm',
  showText   = true,
  showAwasel = false,
  showTagline= false,
  pulse      = false,
  rolling    = false,
  className  = '',
  onClick,
}: LogoProps) {
  // map logo size to mark size
  const markSize: keyof typeof MARK_SIZE =
    size === 'hero' ? 'hero' : (size as keyof typeof MARK_SIZE);

  // Color-plate variant (used in design system / settings pages)
  if (variant === 'color-plate') {
    return <ColorPlate />;
  }

  // Mark only (no text)
  if (variant === 'mark' || (!showText && variant !== 'full')) {
    return (
      <motion.div
        className={`inline-flex cursor-pointer ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        <WaselMark size={markSize} pulse={pulse} spin={rolling} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2.5 cursor-pointer ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <WaselMark size={markSize} pulse={pulse} spin={rolling} />
      <WaselWordmark
        size={size === 'hero' ? 'xl' : size as any}
        showTagline={showTagline || variant === 'full'}
        showAwasel={showAwasel}
      />
    </motion.div>
  );
}

// ─── ColorPlate — brand palette showcase ─────────────────────────────────────

export function ColorPlate() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const palette = [
    { name: 'Cyan',    nameAr: 'سماوي كهربائي', hex: '#00C8E8', usage: 'Primary CTA, links, accents (dark mode)' },
    { name: 'Green',   nameAr: 'أخضر كوني',     hex: '#00C875', usage: 'Success, eco, cultural mode' },
    { name: 'Gold',    nameAr: 'ذهبي شمسي',     hex: '#F0A830', usage: 'CTA accent, package delivery' },
    { name: 'Lime',    nameAr: 'ليموني',         hex: '#A8E63D', usage: 'Success, live indicators' },
    { name: 'Space',   nameAr: 'كحلي فضائي',    hex: '#040C18', usage: 'Page background (dark)' },
    { name: 'Card',    nameAr: 'بطاقة',          hex: '#0A1628', usage: 'Card surface (dark)' },
  ];

  return (
    <div className="space-y-6" style={{ direction: 'ltr' }}>
      {/* Hero brand mark */}
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-3xl"
        style={{
          background: dark
            ? 'linear-gradient(135deg, #0D1A2E 0%, #0B1120 100%)'
            : 'linear-gradient(135deg, #E8F7F9 0%, #F0FFF4 100%)',
          border: `1px solid ${dark ? 'rgba(4,173,191,0.15)' : 'rgba(4,173,191,0.2)'}`,
        }}
      >
        <WaselMark size="hero" pulse />
        <div className="text-center">
          <h1
            className="font-black"
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.teal} 55%, ${BRAND.lime} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Wasel | واصل
          </h1>
          <p style={{ color: BRAND.bronze, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.75rem', textTransform: 'uppercase', marginTop: 4 }}>
            × Awasel | أوصل
          </p>
          <p style={{ color: dark ? 'rgba(100,116,139,0.7)' : 'rgba(71,85,105,0.7)', fontSize: '0.72rem', marginTop: 6, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Share the Journey · Send with Someone Going
          </p>
        </div>
      </div>

      {/* Logo size scale */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: 'var(--wasel-glass-brand)', border: '1px solid var(--border)' }}
      >
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#334155' : '#94A3B8', marginBottom: 16 }}>
          Logo Scale
        </p>
        <div className="flex items-end gap-5 flex-wrap">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <WaselMark size={s} />
              <span style={{ fontSize: '0.55rem', color: dark ? '#475569' : '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Colour palette */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: 'var(--wasel-glass-brand)', border: '1px solid var(--border)' }}
      >
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#334155' : '#94A3B8', marginBottom: 16 }}>
          Brand Palette
        </p>
        <div className="grid grid-cols-3 gap-3">
          {palette.map(c => (
            <div key={c.hex} className="space-y-2">
              <div
                className="w-full rounded-xl aspect-[3/2]"
                style={{ background: c.hex, boxShadow: `0 4px 16px ${c.hex}40` }}
              />
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: dark ? '#F1F5F9' : '#1E293B' }}>{c.name}</p>
                <p style={{ fontSize: '0.6rem', fontWeight: 500, color: dark ? '#475569' : '#94A3B8', fontFamily: 'Cairo, Tajawal, sans-serif' }}>{c.nameAr}</p>
                <code style={{ fontSize: '0.6rem', color: c.hex }}>{c.hex}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography sample */}
      <div
        className="p-5 rounded-2xl space-y-3"
        style={{ background: 'var(--wasel-glass-brand)', border: '1px solid var(--border)' }}
      >
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#334155' : '#94A3B8' }}>
          Brand Typography
        </p>
        <div
          className="text-gradient-primary type-h1 font-black"
          style={{ fontWeight: 900 }}
        >
          Wasel | واصل
        </div>
        <p style={{ color: BRAND.bronze, fontWeight: 700, letterSpacing: '0.08em' }}>
          Share the Journey, Share the Cost
        </p>
        <p style={{ fontFamily: 'Cairo, Tajawal, sans-serif', color: dark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
          شارك الرحلة، وفّر المصاري
        </p>
      </div>
    </div>
  );
}

// ─── SidebarLogoHeader — the logo unit used at the top of the sidebar ─────────

interface SidebarLogoHeaderProps {
  onLogoClick?: () => void;
}

export function SidebarLogoHeader({ onLogoClick }: SidebarLogoHeaderProps) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <motion.button
      onClick={onLogoClick}
      className="flex items-center gap-3 w-full text-left group"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
    >
      {/* Logo mark */}
      <WaselMark size="sm" pulse />

      {/* Wordmark */}
      <div className="flex-1 min-w-0 leading-none">
        {/* Primary brand */}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span
            className="font-black"
            style={{
              fontSize: '0.95rem',
              fontWeight: 900,
              background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.teal} 65%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}
          >
            Wasel
          </span>
          <span style={{ color: dark ? '#334155' : '#CBD5E1', fontSize: '0.7rem' }}>|</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: dark ? 'rgba(203,213,225,0.8)' : 'rgba(30,41,59,0.8)',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
            }}
          >
            واصل
          </span>
        </div>
        {/* Sub-brand */}
        <div className="flex items-center gap-1 mt-0.5">
          <span
            dir="rtl"
            style={{
              fontSize: '0.56rem',
              fontWeight: 600,
              color: BRAND.bronze,
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            انا واصل انتا؟
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default Logo;