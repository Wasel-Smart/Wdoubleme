/**
 * Wasel Design System — Single Source of Truth
 *
 * Import everything from here instead of scattered locations:
 *
 *   import { WaselColors, WaselTokens, WaselLogo, WaselBadge } from '@/design-system';
 *
 * Sources consolidated:
 *  - src/styles/wasel-design-system.ts   → WaselColors, WaselTypography, WaselSpacing
 *  - src/tokens/wasel-tokens.ts          → WaselTokens (design tokens)
 *  - src/utils/wasel-ds.ts               → C, F, R, SH, GRAD, GLOBAL_STYLES (layout helpers)
 *  - src/styles/wasel-page-theme.ts      → PAGE_DS (page-level theme)
 *  - src/components/wasel-ds/WaselLogo   → WaselLogo component
 *  - src/components/wasel-ui/WaselBadge  → WaselBadge component
 */

// ── Token layer ───────────────────────────────────────────────────────────────
export * from '../tokens/wasel-tokens';

// ── Color / typography / spacing constants ────────────────────────────────────
export * from '../styles/wasel-design-system';

// ── Page-level theme (DS shorthand used in service pages) ────────────────────
export * from '../styles/wasel-page-theme';

// ── Layout helpers (C, F, R, SH, GRAD, GLOBAL_STYLES) ───────────────────────
export * from '../utils/wasel-ds';

// ── Components ────────────────────────────────────────────────────────────────
export { WaselLogo } from '../components/wasel-ds/WaselLogo';
export { WaselBadge } from '../components/wasel-ui/WaselBadge';
