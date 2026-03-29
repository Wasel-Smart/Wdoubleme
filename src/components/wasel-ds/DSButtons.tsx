/**
 * Wasel Design System — Button Components v3.0
 * Deep Space design system
 */

import { DS } from './tokens';
import { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

const VARIANTS = {
  primary: {
    bg:      `linear-gradient(135deg, ${DS.color.primary} 0%, #5EE7FF 100%)`,
    bgHover: `linear-gradient(135deg, #33DBFF 0%, ${DS.color.primary} 100%)`,
    color:   DS.color.bg,
    border:  'transparent',
    shadow:  DS.shadow.cyan,
  },
  secondary: {
    bg:      `linear-gradient(135deg, ${DS.color.accent} 0%, #FFD080 100%)`,
    bgHover: `linear-gradient(135deg, #FFD080 0%, ${DS.color.accent} 100%)`,
    color:   DS.color.bg,
    border:  'transparent',
    shadow:  DS.shadow.accent,
  },
  ghost: {
    bg:      'transparent',
    bgHover: DS.color.primaryDim,
    color:   DS.color.textSub,
    border:  DS.color.border,
    shadow:  'none',
  },
  danger: {
    bg:      `${DS.color.error}18`,
    bgHover: `${DS.color.error}28`,
    color:   DS.color.error,
    border:  `${DS.color.error}35`,
    shadow:  '0 4px 20px rgba(255,68,85,0.25)',
  },
  success: {
    bg:      `linear-gradient(135deg, ${DS.color.green} 0%, #33EFA0 100%)`,
    bgHover: `linear-gradient(135deg, #33EFA0 0%, ${DS.color.green} 100%)`,
    color:   DS.color.bg,
    border:  'transparent',
    shadow:  DS.shadow.green,
  },
};

const SIZES = {
  sm: { padding: '8px 16px',  fontSize: DS.font.size.sm,   radius: DS.radius.sm, height: 36 },
  md: { padding: '10px 22px', fontSize: DS.font.size.base, radius: DS.radius.md, height: 44 },
  lg: { padding: '14px 32px', fontSize: DS.font.size.md,   radius: DS.radius.md, height: 52 },
};

export function Button({
  children, variant = 'primary', size = 'md',
  icon, iconRight, disabled = false, loading = false,
  fullWidth = false, onClick,
}: ButtonProps) {
  const [hov, setHov] = useState(false);
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: s.height, padding: s.padding, borderRadius: s.radius,
        background: hov ? v.bgHover : v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        boxShadow: hov ? v.shadow : 'none',
        fontSize: s.fontSize, fontWeight: DS.font.weight.bold,
        fontFamily: DS.font.family,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.18s ease',
        transform: hov && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        width: fullWidth ? '100%' : 'auto',
        minHeight: 44,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? (
        <span style={{
          display: 'inline-block', width: 14, height: 14,
          border: `2px solid ${v.color}30`,
          borderTop: `2px solid ${v.color}`,
          borderRadius: '50%',
          animation: 'dsSpinBtn 0.8s linear infinite',
        }} />
      ) : icon}
      {children}
      {!loading && iconRight}
      <style>{`@keyframes dsSpinBtn { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

export function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {children}
    </div>
  );
}
