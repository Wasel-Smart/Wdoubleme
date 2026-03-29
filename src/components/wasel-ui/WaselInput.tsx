/**
 * WaselInput — Dark-theme input matching WaselCard's glassmorphic DS style.
 *
 * Intended for use inside dark-background panels (Mobility OS, Dashboard, etc.)
 * where the light DSInput from wasel-ds would contrast poorly.
 *
 * Components:
 *  WaselInput        — single-line dark input
 *  WaselSearchBar    — prominent search bar for dark surfaces
 *  WaselSelect       — dark-themed select/dropdown
 *  WaselToggle       — pill toggle (boolean switch) dark-style
 *  WaselChipGroup    — multi-select chip group
 */

import { useState, type ReactNode, type ChangeEvent } from 'react';

// ── Shared palette (matches WaselCard dark surface) ────────────────────────────

const DK = {
  bg:        '#111B2E',
  bgHover:   '#162236',
  border:    'rgba(255,255,255,0.08)',
  borderFocus:'rgba(0,202,255,0.50)',
  borderErr: 'rgba(239,68,68,0.60)',
  text:      '#F1F5FB',
  textSub:   'rgba(241,245,251,0.60)',
  textMuted: 'rgba(241,245,251,0.35)',
  cyan:      '#00CAFF',
  cyanDim:   'rgba(0,202,255,0.12)',
  cyanGlow:  '0 0 0 3px rgba(0,202,255,0.18)',
  errGlow:   '0 0 0 3px rgba(239,68,68,0.18)',
  error:     '#EF4444',
  radius:    10,
  font:      "-apple-system,'Inter','Cairo','Tajawal',sans-serif",
};

// ── WaselInput ────────────────────────────────────────────────────────────────

interface WaselInputProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
  onChange?: (value: string) => void;
  onEnter?: () => void;
}

export function WaselInput({
  id, value, defaultValue, placeholder, type = 'text',
  iconLeft, iconRight, clearable = false, disabled = false, error = false,
  helperText, label, required, dir = 'ltr',
  onChange, onEnter,
}: WaselInputProps) {
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? '');
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  const borderColor = error ? DK.borderErr : focused ? DK.borderFocus : DK.border;
  const glowStyle   = focused ? (error ? DK.errGlow : DK.cyanGlow) : 'none';

  return (
    <div>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', marginBottom: 6,
          fontSize: '0.75rem', fontWeight: 700, color: DK.textSub,
          fontFamily: DK.font, letterSpacing: '0.04em',
        }}>
          {label}
          {required && <span style={{ color: DK.error, marginLeft: 3 }}>*</span>}
        </label>
      )}

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        height: 44,
        background: disabled ? 'rgba(255,255,255,0.03)' : DK.bg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: DK.radius,
        boxShadow: glowStyle,
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
        opacity: disabled ? 0.5 : 1,
      }}>
        {iconLeft && (
          <span style={{
            display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 6,
            color: focused ? DK.cyan : DK.textMuted, transition: 'color 0.18s', flexShrink: 0,
          }}>
            {iconLeft}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={current}
          placeholder={placeholder}
          disabled={disabled}
          dir={dir}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          style={{
            flex: 1, height: '100%', border: 'none', outline: 'none',
            background: 'transparent',
            color: DK.text,
            fontFamily: DK.font,
            fontSize: '0.875rem', fontWeight: 500,
            padding: `0 ${iconLeft ? 6 : 12}px 0 ${iconLeft ? 0 : 12}px`,
          }}
        />

        {clearable && current && !disabled && (
          <button
            type="button"
            onClick={() => { setInternal(''); onChange?.(''); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(255,255,255,0.10)', border: 'none',
              cursor: 'pointer', marginRight: iconRight ? 4 : 10, flexShrink: 0,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke={DK.textMuted} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {iconRight && (
          <span style={{
            display: 'flex', alignItems: 'center', paddingRight: 12, paddingLeft: 6,
            color: DK.textMuted, flexShrink: 0,
          }}>
            {iconRight}
          </span>
        )}
      </div>

      {helperText && (
        <p style={{
          marginTop: 5, fontSize: '0.68rem', fontFamily: DK.font,
          color: error ? DK.error : DK.textMuted, lineHeight: 1.4,
        }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

// ── WaselSearchBar ────────────────────────────────────────────────────────────

interface WaselSearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch?: (q: string) => void;
  onChange?: (v: string) => void;
}

export function WaselSearchBar({ value, placeholder = 'Search…', onSearch, onChange }: WaselSearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [q, setQ] = useState(value ?? '');
  const current = value !== undefined ? value : q;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      height: 46,
      background: focused ? '#162236' : '#0D1829',
      border: `1.5px solid ${focused ? DK.borderFocus : DK.border}`,
      borderRadius: 999,
      boxShadow: focused ? DK.cyanGlow : 'none',
      transition: 'all 0.2s ease',
      padding: '0 6px 0 16px',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={focused ? DK.cyan : DK.textMuted}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, transition: 'stroke 0.18s', marginRight: 8 }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="search"
        value={current}
        placeholder={placeholder}
        onChange={e => { setQ(e.target.value); onChange?.(e.target.value); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={e => e.key === 'Enter' && onSearch?.(current)}
        style={{
          flex: 1, height: '100%', border: 'none', outline: 'none',
          background: 'transparent', color: DK.text,
          fontFamily: DK.font, fontSize: '0.875rem', fontWeight: 500,
        }}
      />

      {current && (
        <button type="button" onClick={() => { setQ(''); onChange?.(''); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke={DK.textMuted} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={() => onSearch?.(current)}
        style={{
          marginLeft: 6, height: 34, padding: '0 16px', borderRadius: 999,
          background: `linear-gradient(135deg, ${DK.cyan} 0%, #2060E8 100%)`,
          border: 'none', cursor: 'pointer', color: '#fff',
          fontSize: '0.78rem', fontWeight: 700, fontFamily: DK.font,
          boxShadow: '0 2px 12px rgba(0,202,255,0.30)',
          flexShrink: 0,
        }}
      >
        Search
      </button>
    </div>
  );
}

// ── WaselSelect ───────────────────────────────────────────────────────────────

interface WaselSelectOption { value: string; label: string; }

interface WaselSelectProps {
  value?: string;
  options: WaselSelectOption[];
  placeholder?: string;
  label?: string;
  onChange?: (v: string) => void;
}

export function WaselSelect({ value, options, placeholder = 'Select…', label, onChange }: WaselSelectProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      {label && (
        <label style={{
          display: 'block', marginBottom: 6,
          fontSize: '0.75rem', fontWeight: 700, color: DK.textSub,
          fontFamily: DK.font, letterSpacing: '0.04em',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={value ?? ''}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange?.(e.target.value)}
          style={{
            width: '100%', height: 44,
            background: DK.bg,
            border: `1.5px solid ${focused ? DK.borderFocus : DK.border}`,
            borderRadius: DK.radius,
            boxShadow: focused ? DK.cyanGlow : 'none',
            color: value ? DK.text : DK.textMuted,
            fontFamily: DK.font, fontSize: '0.875rem', fontWeight: 500,
            padding: '0 36px 0 12px',
            outline: 'none', appearance: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          }}
        >
          <option value="" disabled style={{ color: DK.textMuted, background: DK.bg }}>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ color: DK.text, background: DK.bg }}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={DK.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

// ── WaselToggle ───────────────────────────────────────────────────────────────

interface WaselToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  labelAr?: string;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function WaselToggle({ checked, defaultChecked = false, label, labelAr, onChange, disabled }: WaselToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const controlled = checked !== undefined;
  const on = controlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      onClick={toggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      {/* Track */}
      <div style={{
        width: 42, height: 24, borderRadius: 999,
        background: on
          ? `linear-gradient(135deg, ${DK.cyan}, #2060E8)`
          : 'rgba(255,255,255,0.10)',
        border: `1.5px solid ${on ? 'transparent' : DK.border}`,
        position: 'relative',
        transition: 'background 0.2s ease, border-color 0.2s',
        flexShrink: 0,
        boxShadow: on ? '0 2px 12px rgba(0,202,255,0.35)' : 'none',
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: 2, left: on ? 20 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>

      {(label || labelAr) && (
        <div>
          {label && <div style={{ fontSize: '0.82rem', fontWeight: 600, color: DK.text, fontFamily: DK.font }}>{label}</div>}
          {labelAr && <div style={{ fontSize: '0.68rem', color: DK.textSub, fontFamily: DK.font, direction: 'rtl' }}>{labelAr}</div>}
        </div>
      )}
    </div>
  );
}

// ── WaselChipGroup ────────────────────────────────────────────────────────────

interface WaselChipGroupProps {
  options: { value: string; label: string; icon?: string }[];
  value?: string[];
  defaultValue?: string[];
  multiple?: boolean;
  onChange?: (selected: string[]) => void;
}

export function WaselChipGroup({ options, value, defaultValue = [], multiple = true, onChange }: WaselChipGroupProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const controlled = value !== undefined;
  const selected = controlled ? value : internal;

  const toggle = (v: string) => {
    let next: string[];
    if (multiple) {
      next = selected.includes(v)
        ? selected.filter(s => s !== v)
        : [...selected, v];
    } else {
      next = selected.includes(v) ? [] : [v];
    }
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const on = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: on ? DK.cyanDim : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${on ? DK.borderFocus : DK.border}`,
              color: on ? DK.cyan : DK.textSub,
              fontSize: '0.78rem', fontWeight: on ? 700 : 500,
              fontFamily: DK.font,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.icon && <span>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
