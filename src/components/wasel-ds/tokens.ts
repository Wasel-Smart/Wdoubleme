/**
 * Wasel Design System — Tokens v4.0
 * Clean Light · Deep Navy · Electric Cyan · Royal Blue
 * Matches the reference brand image palette
 */

export const DS = {
  // ── Brand Colors ─────────────────────────────────────────────────────────────
  color: {
    // Light backgrounds
    bg:          '#F0F4FA',   // Page background
    bgAlt:       '#E8EDF6',   // Alternate sections
    bgCard:      '#FFFFFF',   // Card surface
    bgPanel:     '#F8FAFF',   // Panel / elevated
    bgHover:     '#EEF3FB',   // Hover state

    // Deep navy
    navy:        '#0B1D45',   // Primary dark — logo bg, headings
    navyMid:     '#162C6A',   // Medium navy
    navyLight:   '#2D4A8A',   // Lighter navy

    // Electric cyan (primary brand)
    primary:     '#00CAFF',   // Wasel Cyan
    primaryDark: '#0090E8',   // Darker cyan
    primaryDim:  'rgba(0,202,255,0.12)',
    primaryGlow: 'rgba(0,202,255,0.30)',

    // Royal blue (gradient end)
    blue:        '#2060E8',   // Royal Blue
    blueLight:   '#5590FF',   // Light blue
    blueDim:     'rgba(32,96,232,0.12)',

    // Gradient (primary CTA)
    gradStart:   '#00CAFF',
    gradEnd:     '#2060E8',

    // Accent gold (secondary brand, kept for cultural features)
    accent:      '#F0A830',
    accentDim:   'rgba(240,168,48,0.12)',

    // Success green
    green:       '#00C875',
    greenBg:     '#E6FFF5',
    greenDim:    'rgba(0,200,117,0.12)',

    // Semantic
    success:     '#00C875',
    successL:    '#E6FFF5',
    warning:     '#F0A830',
    warningL:    'rgba(240,168,48,0.12)',
    error:       '#EF4444',
    errorL:      'rgba(239,68,68,0.10)',
    info:        '#00CAFF',
    infoL:       'rgba(0,202,255,0.10)',

    // Text
    text:        '#0B1D45',   // Primary text — deep navy
    textSub:     '#4A5678',   // Secondary text
    textMuted:   '#8A9ABD',   // Muted text
    textDim:     'rgba(74,86,120,0.55)',

    // Borders
    border:      '#E2E8F2',   // Default border
    borderHover: '#C0CFEA',   // Hover border
    borderBlue:  'rgba(0,202,255,0.25)',

    // Overlays
    overlay:     'rgba(11,29,69,0.6)',
    glass:       'rgba(255,255,255,0.85)',

    // Legacy aliases (for component compatibility)
    surface:     '#FFFFFF',
    white:       '#FFFFFF',
    accentD:     '#0090E8',
    accentL:     '#6EEEFF',
    secondary:   '#2060E8',
    secondaryL:  '#5590FF',
    textLight:   '#8A9ABD',
    bgSurface:   '#F8FAFF',
  },

  // ── Shadows ──────────────────────────────────────────────────────────────────
  shadow: {
    xs:   '0 1px 4px rgba(11,29,69,0.06)',
    sm:   '0 2px 8px rgba(11,29,69,0.09)',
    md:   '0 4px 20px rgba(11,29,69,0.10)',
    lg:   '0 8px 40px rgba(11,29,69,0.12)',
    xl:   '0 16px 60px rgba(11,29,69,0.14)',
    cyan: '0 4px 24px rgba(0,202,255,0.28)',
    blue: '0 4px 24px rgba(32,96,232,0.25)',
    card: '0 2px 12px rgba(11,29,69,0.08)',
  },

  // ── Radius ───────────────────────────────────────────────────────────────────
  radius: {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    xxl:  28,
    full: 9999,
  },

  // ── Spacing ──────────────────────────────────────────────────────────────────
  space: {
    1: 4,  2: 8,   3: 12, 4: 16,
    5: 20, 6: 24,  7: 32, 8: 40,
    9: 48, 10: 64,
  },

  // ── Typography ───────────────────────────────────────────────────────────────
  font: {
    family: "-apple-system, BlinkMacSystemFont, 'Inter', 'Cairo', 'Tajawal', sans-serif",
    size: {
      xs:   '0.70rem',
      sm:   '0.80rem',
      base: '0.875rem',
      md:   '1rem',
      lg:   '1.125rem',
      xl:   '1.25rem',
      '2xl':'1.5rem',
      '3xl':'1.875rem',
      '4xl':'2.25rem',
      '5xl':'3rem',
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700, black: 800 },
  },
} as const;
