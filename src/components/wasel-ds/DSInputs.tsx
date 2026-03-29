/**
 * Wasel Design System — Input Components v1.0
 * Light-surface inputs that match the DS token palette.
 *
 * Components:
 *  DSInput         — single-line text field (icon left, clear right, states)
 *  DSSearchInput   — search bar with animated placeholder
 *  DSTextarea      — multi-line textarea with auto-grow cue
 *  DSOTPInput      — 4 or 6-digit OTP pin-entry
 *  DSInputLabel    — accessible label with optional required star
 *  DSInputGroup    — stacks label + input + helper/error message
 */

import { useState, useRef, type ReactNode, type ChangeEvent, type KeyboardEvent } from 'react';
import { DS } from './tokens';

const C = DS.color;
const F = DS.font;
const R = DS.radius;

// ── Shared style helpers ──────────────────────────────────────────────────────

function getInputBorderColor(focused: boolean, error: boolean, disabled: boolean) {
  if (disabled) return C.border;
  if (error)    return C.error;
  if (focused)  return C.primary;
  return C.border;
}

function getInputShadow(focused: boolean, error: boolean) {
  if (error)   return `0 0 0 3px ${C.error}22`;
  if (focused) return `0 0 0 3px ${C.primaryGlow}`;
  return 'none';
}

// ── DSInputLabel ──────────────────────────────────────────────────────────────

interface DSInputLabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export function DSInputLabel({ children, required, htmlFor }: DSInputLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontSize: F.size.sm,
        fontWeight: F.weight.semibold,
        color: C.text,
        fontFamily: F.family,
        marginBottom: 6,
        userSelect: 'none',
      }}
    >
      {children}
      {required && (
        <span style={{ color: C.error, marginLeft: 3, fontWeight: 700 }}>*</span>
      )}
    </label>
  );
}

// ── DSInput ───────────────────────────────────────────────────────────────────

interface DSInputProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dir?: 'ltr' | 'rtl' | 'auto';
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
}

const INPUT_SIZE = {
  sm: { height: 36, fontSize: F.size.sm,   px: 12, iconSize: 14 },
  md: { height: 44, fontSize: F.size.base, px: 14, iconSize: 16 },
  lg: { height: 52, fontSize: F.size.md,   px: 16, iconSize: 18 },
};

export function DSInput({
  id, value, defaultValue, placeholder, type = 'text',
  iconLeft, iconRight, clearable = false,
  disabled = false, readOnly = false, error = false,
  size = 'md', dir = 'ltr',
  onChange, onFocus, onBlur, onEnter,
}: DSInputProps) {
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? '');
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const s = INPUT_SIZE[size];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onEnter?.();
  };

  const showClear = clearable && !!current && !disabled && !readOnly;
  const borderColor = getInputBorderColor(focused, error, disabled);
  const boxShadow   = focused ? getInputShadow(focused, error) : 'none';

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: s.height,
      background: disabled ? C.bgAlt : C.bgCard,
      border: `1.5px solid ${borderColor}`,
      borderRadius: R.md,
      boxShadow,
      transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
      opacity: disabled ? 0.6 : 1,
    }}>
      {/* Left icon */}
      {iconLeft && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingLeft: s.px, paddingRight: 6, color: focused ? C.primary : C.textMuted,
          flexShrink: 0, transition: 'color 0.18s',
        }}>
          {iconLeft}
        </span>
      )}

      {/* Input element */}
      <input
        id={id}
        type={type}
        value={current}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        dir={dir}
        onChange={handleChange}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: C.text,
          fontFamily: F.family,
          fontSize: s.fontSize,
          fontWeight: F.weight.medium,
          padding: `0 ${iconLeft ? 6 : s.px}px 0 ${iconLeft ? 0 : s.px}px`,
          cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
        }}
      />

      {/* Clear button */}
      {showClear && (
        <button
          type="button"
          onClick={() => { setInternal(''); onChange?.(''); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: '50%',
            background: C.textMuted + '30',
            border: 'none', cursor: 'pointer',
            marginRight: iconRight ? 4 : s.px,
            flexShrink: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Right icon */}
      {iconRight && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingRight: s.px, paddingLeft: 6, color: C.textMuted, flexShrink: 0,
        }}>
          {iconRight}
        </span>
      )}
    </div>
  );
}

// ── DSSearchInput ─────────────────────────────────────────────────────────────

interface DSSearchInputProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChange?: (value: string) => void;
  loading?: boolean;
}

export function DSSearchInput({ value, placeholder = 'Search…', onSearch, onChange, loading }: DSSearchInputProps) {
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(value ?? '');
  const current = value !== undefined ? value : internal;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInternal(v);
    onChange?.(v);
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: 44,
      background: focused ? C.bgCard : C.bgPanel,
      border: `1.5px solid ${focused ? C.primary : C.border}`,
      borderRadius: R.full,
      boxShadow: focused ? getInputShadow(true, false) : 'none',
      transition: 'all 0.2s ease',
    }}>
      {/* Search icon */}
      <span style={{ paddingLeft: 14, paddingRight: 8, color: focused ? C.primary : C.textMuted, transition: 'color 0.18s', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="search"
        value={current}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.(current)}
        style={{
          flex: 1, height: '100%', border: 'none', outline: 'none',
          background: 'transparent', color: C.text,
          fontFamily: F.family, fontSize: F.size.base, fontWeight: F.weight.medium,
        }}
      />

      {/* Loading spinner or clear */}
      <span style={{ paddingRight: 14, color: C.textMuted, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {loading ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
            </path>
          </svg>
        ) : current ? (
          <button type="button" onClick={() => { setInternal(''); onChange?.(''); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: C.textMuted + '25', border: 'none', cursor: 'pointer' }}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </span>
    </div>
  );
}

// ── DSTextarea ────────────────────────────────────────────────────────────────

interface DSTextareaProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
  onChange?: (value: string) => void;
}

export function DSTextarea({
  id, value, defaultValue, placeholder, rows = 4,
  maxLength, disabled = false, error = false, dir = 'ltr', onChange,
}: DSTextareaProps) {
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? '');
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        id={id}
        value={current}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        dir={dir}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: disabled ? C.bgAlt : C.bgCard,
          border: `1.5px solid ${getInputBorderColor(focused, error, disabled)}`,
          borderRadius: R.md,
          boxShadow: focused ? getInputShadow(focused, error) : 'none',
          color: C.text,
          fontFamily: F.family,
          fontSize: F.size.base,
          fontWeight: F.weight.medium,
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
        }}
      />
      {maxLength && (
        <span style={{
          position: 'absolute', bottom: 10, right: 12,
          fontSize: F.size.xs, color: C.textMuted, fontFamily: F.family,
        }}>
          {current.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

// ── DSOTPInput ────────────────────────────────────────────────────────────────

interface DSOTPInputProps {
  length?: 4 | 6;
  onComplete?: (otp: string) => void;
  error?: boolean;
}

export function DSOTPInput({ length = 6, onComplete, error = false }: DSOTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) onComplete?.(next.join(''));
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 56,
            textAlign: 'center',
            fontSize: F.size.xl, fontWeight: F.weight.bold, fontFamily: F.family,
            color: C.text,
            background: C.bgCard,
            border: `2px solid ${error ? C.error : d ? C.primary : C.border}`,
            borderRadius: R.md,
            outline: 'none',
            transition: 'border-color 0.18s ease',
            caretColor: C.primary,
          }}
        />
      ))}
    </div>
  );
}

// ── DSInputGroup ──────────────────────────────────────────────────────────────

interface DSInputGroupProps {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function DSInputGroup({ label, required, helper, error, htmlFor, children }: DSInputGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {label && <DSInputLabel htmlFor={htmlFor} required={required}>{label}</DSInputLabel>}
      {children}
      {(error || helper) && (
        <p style={{
          marginTop: 5, marginBottom: 0,
          fontSize: F.size.xs, fontFamily: F.family,
          color: error ? C.error : C.textMuted,
          lineHeight: 1.4,
        }}>
          {error || helper}
        </p>
      )}
    </div>
  );
}
