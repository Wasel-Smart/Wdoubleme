/**
 * Wasel Responsive Utilities — Mobile-First Design System
 * 
 * Provides type-safe, mobile-first responsive helpers for all breakpoints.
 * Follow mobile-first principle: design for small screens, enhance for larger.
 */

// ─── Breakpoints (matches Tailwind v4 defaults) ──────────────────────────────
export const BREAKPOINTS = {
  xs: 375,   // iPhone SE, small phones
  sm: 640,   // Large phones, small tablets
  md: 768,   // Tablets
  lg: 1024,  // Laptops
  xl: 1280,  // Desktops
  '2xl': 1536, // Large desktops
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// ─── Touch Target Sizes (WCAG 2.1 AA/AAA) ─────────────────────────────────────
export const TOUCH_TARGETS = {
  minimum: 44,     // WCAG 2.1 AAA (44x44px)
  recommended: 48, // Material Design recommendation
  comfortable: 56, // Extra comfortable for elderly users
} as const;

// ─── Responsive Grid Columns ──────────────────────────────────────────────────
/**
 * Returns optimal grid columns for each breakpoint
 * Usage: className={getGridCols({ xs: 1, sm: 2, md: 3, lg: 4 })}
 */
export function getGridCols(cols: Partial<Record<Breakpoint | 'base', number>>): string {
  const classes: string[] = [];
  
  // Base (mobile-first)
  if (cols.base) classes.push(`grid-cols-${cols.base}`);
  
  // Responsive breakpoints
  if (cols.xs) classes.push(`xs:grid-cols-${cols.xs}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
  
  return classes.join(' ');
}

// ─── Responsive Spacing ───────────────────────────────────────────────────────
/**
 * Returns responsive spacing classes
 * Usage: className={getSpacing({ base: 4, md: 6, lg: 8 })}
 */
export function getSpacing(spacing: Partial<Record<Breakpoint | 'base', number>>): string {
  const classes: string[] = [];
  
  if (spacing.base) classes.push(`p-${spacing.base}`);
  if (spacing.xs) classes.push(`xs:p-${spacing.xs}`);
  if (spacing.sm) classes.push(`sm:p-${spacing.sm}`);
  if (spacing.md) classes.push(`md:p-${spacing.md}`);
  if (spacing.lg) classes.push(`lg:p-${spacing.lg}`);
  if (spacing.xl) classes.push(`xl:p-${spacing.xl}`);
  if (spacing['2xl']) classes.push(`2xl:p-${spacing['2xl']}`);
  
  return classes.join(' ');
}

// ─── Responsive Text Sizes ────────────────────────────────────────────────────
/**
 * Returns responsive text size classes
 * Usage: className={getTextSize({ base: 'sm', md: 'base', lg: 'lg' })}
 */
export function getTextSize(
  sizes: Partial<Record<Breakpoint | 'base', 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'>>
): string {
  const classes: string[] = [];
  
  if (sizes.base) classes.push(`text-${sizes.base}`);
  if (sizes.xs) classes.push(`xs:text-${sizes.xs}`);
  if (sizes.sm) classes.push(`sm:text-${sizes.sm}`);
  if (sizes.md) classes.push(`md:text-${sizes.md}`);
  if (sizes.lg) classes.push(`lg:text-${sizes.lg}`);
  if (sizes.xl) classes.push(`xl:text-${sizes.xl}`);
  if (sizes['2xl']) classes.push(`2xl:text-${sizes['2xl']}`);
  
  return classes.join(' ');
}

// ─── Responsive Visibility ────────────────────────────────────────────────────
/**
 * Show/hide elements at different breakpoints
 * Usage: className={showAt(['md', 'lg'])} or className={hideAt(['xs', 'sm'])}
 */
export function showAt(breakpoints: Breakpoint[]): string {
  const classes = ['hidden'];
  breakpoints.forEach(bp => classes.push(`${bp}:block`));
  return classes.join(' ');
}

export function hideAt(breakpoints: Breakpoint[]): string {
  const classes: string[] = [];
  breakpoints.forEach(bp => classes.push(`${bp}:hidden`));
  return classes.join(' ');
}

// ─── Container Queries (for component-level responsiveness) ───────────────────
/**
 * Use container queries for component-level responsiveness
 * More granular than viewport-based breakpoints
 */
export const CONTAINER_SIZES = {
  xs: '20rem',   // 320px
  sm: '24rem',   // 384px
  md: '28rem',   // 448px
  lg: '32rem',   // 512px
  xl: '36rem',   // 576px
  '2xl': '42rem', // 672px
  '3xl': '48rem', // 768px
  '4xl': '56rem', // 896px
  '5xl': '64rem', // 1024px
} as const;

// ─── Media Query Hooks ────────────────────────────────────────────────────────
/**
 * Client-side media query detection
 * Usage: const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia(query);
  const [matches, setMatches] = React.useState(mediaQuery.matches);
  
  React.useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);
  
  return matches;
}

// Import React for hooks
import React from 'react';

// ─── Viewport Detection Hook ──────────────────────────────────────────────────
/**
 * Detect current viewport size
 * Usage: const { isMobile, isTablet, isDesktop } = useViewport();
 */
export function useViewport() {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  );
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  
  return { isMobile, isTablet, isDesktop };
}

// ─── Safe Area Insets (for iOS notch/home indicator) ─────────────────────────
/**
 * CSS safe area classes for iOS devices with notch
 * Usage: className="pb-safe" or className="pt-safe"
 */
export const SAFE_AREA_CLASSES = {
  top: 'pt-[env(safe-area-inset-top)]',
  bottom: 'pb-[env(safe-area-inset-bottom)]',
  left: 'pl-[env(safe-area-inset-left)]',
  right: 'pr-[env(safe-area-inset-right)]',
} as const;

// ─── Responsive Card Variants ─────────────────────────────────────────────────
/**
 * Pre-configured responsive card layouts
 * Usage: className={CARD_LAYOUTS.mobileStack}
 */
export const CARD_LAYOUTS = {
  // Stack on mobile, 2 cols on tablet, 3 on desktop
  mobileStack: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  
  // Stack on mobile, 2 cols on tablet, 4 on desktop
  dense: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3',
  
  // 1 col on mobile, 2 on desktop
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  
  // Full width on mobile, centered max-width on desktop
  centered: 'w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
} as const;

// ─── Responsive Padding Scale ─────────────────────────────────────────────────
/**
 * Consistent responsive padding for sections
 * Usage: className={SECTION_PADDING.default}
 */
export const SECTION_PADDING = {
  tight: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
  default: 'px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16',
  loose: 'px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24',
} as const;

// ─── Typography Responsive Scale ──────────────────────────────────────────────
/**
 * Fluid typography that scales with viewport
 * Usage: className={FLUID_TYPE.h1}
 */
export const FLUID_TYPE = {
  h1: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
  h2: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
  h3: 'text-xl sm:text-2xl lg:text-3xl',
  h4: 'text-lg sm:text-xl lg:text-2xl',
  body: 'text-sm sm:text-base lg:text-lg',
  small: 'text-xs sm:text-sm',
} as const;

// ─── Aspect Ratio Helpers ─────────────────────────────────────────────────────
/**
 * Responsive aspect ratios for images/videos
 * Usage: className={ASPECT_RATIOS.video}
 */
export const ASPECT_RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  portrait: 'aspect-[3/4]',
} as const;

// ─── Mobile-First Helper Functions ────────────────────────────────────────────
/**
 * Check if touch device (mobile/tablet)
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get optimal image sizes for responsive images
 * Usage: <img srcSet={getImageSizes('/image.jpg')} />
 */
export function getImageSizes(baseUrl: string): string {
  return `
    ${baseUrl}?w=375 375w,
    ${baseUrl}?w=640 640w,
    ${baseUrl}?w=768 768w,
    ${baseUrl}?w=1024 1024w,
    ${baseUrl}?w=1280 1280w,
    ${baseUrl}?w=1536 1536w
  `.trim();
}

// ─── Performance Hints ────────────────────────────────────────────────────────
/**
 * Reduce motion for users with vestibular disorders
 * Usage: const { prefersReducedMotion } = useAccessibility();
 */
export function useAccessibility() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  
  return { prefersReducedMotion, prefersHighContrast, prefersDark };
}
