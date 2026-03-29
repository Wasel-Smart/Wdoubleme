/**
 * Wasel Shared Color Constants — v1.0
 *
 * Single source of truth for the inline style `C` object pattern used
 * across all feature components. Import this instead of defining a local
 * `const C = { ... }` in each file.
 *
 * Mirrors /tokens/wasel-tokens.ts WaselColors but structured as the
 * compact `C` shape that all components already use.
 *
 * Usage:
 *   import { C } from '../../tokens/colors';
 *   style={{ background: C.bg, color: C.cyan }}
 */

export const C = {
  // ── Backgrounds (5-level elevation) ─────────────────────────────────────────
  bg:    '#040C18',   // Deep Space — page background
  bg1:   '#070F1F',   // Elevation 1
  card:  '#0A1628',   // Card surface
  card2: '#0D1E35',   // Secondary card
  s3:    '#10203A',   // Surface 3 / hover

  // ── Brand primaries ──────────────────────────────────────────────────────────
  cyan:   '#00C8E8',  // Electric Cyan — primary
  gold:   '#F0A830',  // Solar Gold — accent / CTA
  green:  '#00C875',  // Emerald Green — success / live
  lime:   '#A8E63D',  // Volt Lime — positive callouts
  purple: '#A78BFA',  // Soft Purple — AI / premium

  // ── Status ───────────────────────────────────────────────────────────────────
  red:   '#FF4455',   // Destructive / error
  warn:  '#F59E0B',   // Warning / caution

  // ── Text ─────────────────────────────────────────────────────────────────────
  text:   '#E2E8F0',  // Primary text
  muted:  '#4D6A8A',  // Secondary / muted text
  dim:    '#2D4A6A',  // Dimmed / placeholder

  // ── Borders ──────────────────────────────────────────────────────────────────
  brd:   'rgba(0,200,232,0.10)',   // Default border
  brd2:  'rgba(0,200,232,0.22)',   // Highlighted border
  cbrd:  'rgba(255,255,255,0.08)', // Neutral card border

  // ── Glows / translucent fills ─────────────────────────────────────────────────
  cyanDim:   'rgba(0,200,232,0.12)',
  cyanGlow:  'rgba(0,200,232,0.25)',
  goldDim:   'rgba(240,168,48,0.12)',
  greenDim:  'rgba(0,200,117,0.12)',
  purpleDim: 'rgba(167,139,250,0.12)',

  // ── Typography ───────────────────────────────────────────────────────────────
  mono: '"Courier New","SF Mono","Fira Code",monospace',
  sys:  'system-ui,-apple-system,sans-serif',
} as const;

export type CTokens = typeof C;
