/**
 * WaselMainLogo - Official Wasel Logo Component
 * High-resolution UFO logo with proper sizing and best practices
 * 
 * The spaceship silhouette IS the letter "W" (Wasel):
 *   - UFO disc = crown arc (center peak of W)
 *   - Two arms with orbs = outer legs of W
 *   - Central beam = center stroke
 *   - Bottom rings = W valleys with metallic detail
 *
 * For the SVG W monogram, see /components/WaselW.tsx
 * 
 * Features:
 * - Responsive sizing (40px - 800px)
 * - Retina display support (2x/3x)
 * - Proper color palette integration
 * - Glow effects for brand consistency
 * - Multiple variants (icon, full, hero)
 * - Accessibility compliant
 */

import React from 'react';
import { motion } from 'motion/react';
import { WaselCoreMark } from './WaselCoreMark';

// ══════════════════════════════════════════════════════════════════════════════
// BRAND COLORS (From Wasel Guidelines)
// ══════════════════════════════════════════════════════════════════════════════

const WASEL_COLORS = {
  cyan: '#00C8E8',        // Primary brand color (matches logo pins)
  cyanGlow: 'rgba(0,200,232,0.4)',
  gold: '#F0A830',        // Secondary accent (matches logo ring)
  goldGlow: 'rgba(240,168,48,0.3)',
  dark: '#040C18',        // Background
  darkSurface: '#060E1C', // Card background
};

// ══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

interface WaselMainLogoProps {
  /** Size in pixels (default: 200) */
  size?: number;
  /** Enable floating animation (default: false) */
  animated?: boolean;
  /** Enable glow effect (default: true) */
  glow?: boolean;
  /** Variant type */
  variant?: 'icon' | 'full' | 'hero';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// ═════════════════════════════════════════════════════════════════════════��════
// SIZE PRESETS (Following Logo Best Practices)
// ══════════════════════════════════════════════════════════════════════════════

const SIZE_PRESETS = {
  // Icon sizes (navigation, buttons, favicons)
  icon: {
    xs: 32,    // Mobile navigation
    sm: 40,    // Desktop navigation
    md: 48,    // Large navigation
    lg: 64,    // App icons
  },
  // Full sizes (headers, cards, features)
  full: {
    sm: 120,   // Small cards
    md: 180,   // Medium headers
    lg: 240,   // Large headers
    xl: 320,   // Feature sections
  },
  // Hero sizes (landing pages, splash screens)
  hero: {
    sm: 400,   // Mobile hero
    md: 500,   // Tablet hero
    lg: 600,   // Desktop hero
    xl: 800,   // Full-screen hero
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════════

const floatingAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

const glowPulseAnimation = {
  opacity: [0.6, 1, 0.6],
  scale: [1, 1.05, 1],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function WaselMainLogo({
  size = 200,
  animated = false,
  glow = true,
  variant = 'full',
  className = '',
  onClick,
}: WaselMainLogoProps) {
  // Calculate optimal size based on variant
  const logoSize = size;
  const glowSize = logoSize * 1.4;
  
  return (
    <div
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ width: logoSize, height: logoSize }}
    >
      {/* Outer glow (cyan) */}
      {glow && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            width: glowSize,
            height: glowSize,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${WASEL_COLORS.cyanGlow} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            zIndex: -2,
          }}
          animate={animated ? glowPulseAnimation : {}}
        />
      )}

      {/* Secondary glow (gold) */}
      {glow && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            width: glowSize * 0.8,
            height: glowSize * 0.8,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${WASEL_COLORS.goldGlow} 0%, transparent 60%)`,
            filter: 'blur(30px)',
            zIndex: -1,
          }}
          animate={animated ? { ...glowPulseAnimation, transition: { ...glowPulseAnimation.transition, delay: 0.5 } } : {}}
        />
      )}

      {/* Main vector logo mark */}
      <motion.div
        className="relative w-full h-full"
        animate={animated ? floatingAnimation : {}}
      >
        <WaselCoreMark
          size={logoSize}
          animated={false}
          glow={false}
          className="w-full h-full"
          title="Wasel mobility mark"
        />
      </motion.div>

      {/* Shine effect overlay (subtle) */}
      {glow && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════��═════════════
// PRESET VARIANTS (Quick Use Components)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Small icon for navigation bars (40px)
 */
export function WaselLogoIcon({ 
  animated = false, 
  onClick,
  className = '',
}: { 
  animated?: boolean; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <WaselMainLogo 
      size={SIZE_PRESETS.icon.sm} 
      animated={animated}
      variant="icon"
      onClick={onClick}
      className={className}
      glow={false} // No glow for small icons (clarity)
    />
  );
}

/**
 * Medium logo for headers and cards (180px)
 */
export function WaselLogoFull({ 
  animated = false, 
  onClick,
  className = '',
}: { 
  animated?: boolean; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <WaselMainLogo 
      size={SIZE_PRESETS.full.md} 
      animated={animated}
      variant="full"
      onClick={onClick}
      className={className}
      glow={true}
    />
  );
}

/**
 * Large hero logo for landing pages (500px)
 */
export function WaselLogoHero({ 
  animated = true, 
  onClick,
  className = '',
}: { 
  animated?: boolean; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <WaselMainLogo 
      size={SIZE_PRESETS.hero.md} 
      animated={animated}
      variant="hero"
      onClick={onClick}
      className={className}
      glow={true}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGO WITH TEXT (Full Branding)
// ══════════════════════════════════════════════════════════════════════════════

interface WaselLogoWithTextProps {
  size?: number;
  animated?: boolean;
  showTagline?: boolean;
  onClick?: () => void;
  className?: string;
}

export function WaselLogoWithText({
  size = 200,
  animated = false,
  showTagline = true,
  onClick,
  className = '',
}: WaselLogoWithTextProps) {
  const textSize = size * 0.15; // Text size proportional to logo
  const taglineSize = size * 0.08;

  return (
    <div 
      className={`inline-flex flex-col items-center gap-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo */}
      <WaselMainLogo size={size} animated={animated} glow={true} />
      
      {/* Brand Text */}
      <div className="text-center">
        <div 
          className="font-black flex items-center justify-center gap-2"
          style={{ 
            fontSize: textSize,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          <span>Wasel</span>
          <span style={{ color: WASEL_COLORS.cyan, fontFamily: "'Cairo', sans-serif" }}>
            | واصل
          </span>
        </div>
        
        {showTagline && (
          <div
            className="font-bold uppercase tracking-widest mt-1"
            style={{
              fontSize: taglineSize,
              color: WASEL_COLORS.cyan,
              opacity: 0.7,
            }}
          >
            Out of This World
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSIVE LOGO (Auto-sizes based on screen)
// ══════════════════════════════════════════════════════════════════════════════

export function WaselLogoResponsive({
  animated = false,
  onClick,
  className = '',
}: {
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Mobile (320px) */}
      <div className="block sm:hidden">
        <WaselMainLogo size={320} animated={animated} onClick={onClick} />
      </div>
      
      {/* Tablet (400px) */}
      <div className="hidden sm:block md:hidden">
        <WaselMainLogo size={400} animated={animated} onClick={onClick} />
      </div>
      
      {/* Desktop (500px) */}
      <div className="hidden md:block lg:hidden">
        <WaselMainLogo size={500} animated={animated} onClick={onClick} />
      </div>
      
      {/* Large Desktop (600px) */}
      <div className="hidden lg:block">
        <WaselMainLogo size={600} animated={animated} onClick={onClick} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export default WaselMainLogo;

// Export color palette for consistency
export { WASEL_COLORS };

// Export size presets for custom usage
export { SIZE_PRESETS };
