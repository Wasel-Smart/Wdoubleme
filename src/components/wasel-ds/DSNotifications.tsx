/**
 * Wasel Design System — Notification & Toast Components v1.0
 *
 * Components:
 *  DSToast           — auto-dismiss toast (success / error / info / warning)
 *  DSToastContainer  — renders all active toasts in a portal-like corner
 *  DSNotifCard       — persistent notification row (inbox-style)
 *  DSAlertBanner     — full-width dismissible alert bar
 *  useDSToast        — hook to fire toasts from anywhere
 */

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { DS } from './tokens';

const C = DS.color;
const F = DS.font;
const R = DS.radius;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // ms — 0 = sticky
}

// ── Config ────────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
  bg: string; border: string; icon: string; color: string; bar: string;
}> = {
  success: {
    bg: C.successL, border: `${C.success}35`,
    icon: '✓', color: C.success, bar: C.success,
  },
  error: {
    bg: C.errorL, border: `${C.error}35`,
    icon: '✕', color: C.error, bar: C.error,
  },
  info: {
    bg: C.infoL, border: `${C.info}35`,
    icon: 'ℹ', color: C.info, bar: C.info,
  },
  warning: {
    bg: C.warningL, border: `${C.warning}35`,
    icon: '⚠', color: C.warning, bar: C.warning,
  },
};

// ── DSToast ───────────────────────────────────────────────────────────────────

interface DSToastProps extends ToastItem {
  onDismiss: (id: string) => void;
}

export function DSToast({ id, variant, title, message, duration = 4000, onDismiss }: DSToastProps) {
  const cfg = VARIANT_CONFIG[variant];
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Enter animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    if (duration === 0) return;
    const step = 100 / (duration / 50);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p <= 0) {
          clearInterval(intervalRef.current!);
          setTimeout(() => onDismiss(id), 200);
          return 0;
        }
        return p - step;
      });
    }, 50);
    return () => clearInterval(intervalRef.current!);
  }, [duration, id, onDismiss]);

  return (
    <div style={{
      width: 320,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: R.lg,
      boxShadow: DS.shadow.lg,
      overflow: 'hidden',
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.97)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
    }}>
      {/* Progress bar */}
      {duration > 0 && (
        <div style={{ height: 3, background: `${cfg.bar}22` }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: cfg.bar,
            transition: 'width 0.05s linear',
          }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `${cfg.color}22`,
          border: `1px solid ${cfg.color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '0.8rem', color: cfg.color, fontWeight: 800,
        }}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: F.size.sm, fontWeight: 700, color: C.text, fontFamily: F.family }}>{title}</p>
          {message && (
            <p style={{ margin: '3px 0 0', fontSize: F.size.xs, color: C.textSub, fontFamily: F.family, lineHeight: 1.5 }}>{message}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onDismiss(id)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: C.textMuted + '20', border: 'none', cursor: 'pointer',
            flexShrink: 0, color: C.textMuted, fontSize: '0.7rem',
          }}
        >✕</button>
      </div>
    </div>
  );
}

// ── DSToastContainer ──────────────────────────────────────────────────────────

interface DSToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function DSToastContainer({ toasts, onDismiss, position = 'top-right' }: DSToastContainerProps) {
  const isTop    = position.startsWith('top');
  const isRight  = position.endsWith('right');

  return (
    <div style={{
      position: 'fixed',
      top:    isTop    ? 20 : undefined,
      bottom: !isTop   ? 20 : undefined,
      right:  isRight  ? 20 : undefined,
      left:   !isRight ? 20 : undefined,
      zIndex: 9999,
      display: 'flex',
      flexDirection: isTop ? 'column' : 'column-reverse',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <DSToast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ── useDSToast ────────────────────────────────────────────────────────────────

let _counter = 0;

export function useDSToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fire = useCallback((
    variant: ToastVariant,
    title: string,
    message?: string,
    duration?: number,
  ) => {
    const id = `toast-${++_counter}`;
    setToasts(prev => [...prev, { id, variant, title, message, duration }]);
    return id;
  }, []);

  return {
    toasts,
    dismiss,
    success: (title: string, msg?: string) => fire('success', title, msg),
    error:   (title: string, msg?: string) => fire('error',   title, msg),
    info:    (title: string, msg?: string) => fire('info',    title, msg),
    warning: (title: string, msg?: string) => fire('warning', title, msg),
  };
}

// ── DSNotifCard ───────────────────────────────────────────────────────────────

interface DSNotifCardProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  time?: string;
  unread?: boolean;
  icon?: ReactNode;
  onDismiss?: () => void;
  onClick?: () => void;
}

export function DSNotifCard({
  variant = 'info', title, message, time, unread = false,
  icon, onDismiss, onClick,
}: DSNotifCardProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', gap: 12, padding: '14px 16px',
        background: unread ? cfg.bg : C.bgCard,
        border: `1px solid ${unread ? cfg.border : C.border}`,
        borderRadius: R.lg,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
        position: 'relative',
      }}
    >
      {/* Unread dot */}
      {unread && (
        <div style={{
          position: 'absolute', top: 10, right: 12,
          width: 8, height: 8, borderRadius: '50%', background: cfg.color,
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: `${cfg.color}20`, border: `1px solid ${cfg.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '0.85rem', color: cfg.color,
      }}>
        {icon || cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: F.size.sm, fontWeight: unread ? 700 : 600, color: C.text, fontFamily: F.family }}>{title}</p>
        {message && (
          <p style={{ margin: '3px 0 0', fontSize: F.size.xs, color: C.textSub, fontFamily: F.family, lineHeight: 1.5 }}>{message}</p>
        )}
        {time && (
          <p style={{ margin: '6px 0 0', fontSize: '0.65rem', color: C.textMuted, fontFamily: F.family }}>{time}</p>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: C.textMuted + '20', border: 'none', cursor: 'pointer',
            flexShrink: 0, alignSelf: 'flex-start', color: C.textMuted, fontSize: '0.7rem',
          }}
        >✕</button>
      )}
    </div>
  );
}

// ── DSAlertBanner ─────────────────────────────────────────────────────────────

interface DSAlertBannerProps {
  variant?: ToastVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
}

export function DSAlertBanner({ variant = 'info', title, message, dismissible = true, action }: DSAlertBannerProps) {
  const [visible, setVisible] = useState(true);
  const cfg = VARIANT_CONFIG[variant];
  if (!visible) return null;

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: R.lg,
      borderLeft: `4px solid ${cfg.color}`,
    }}>
      <span style={{ color: cfg.color, fontSize: '1rem', flexShrink: 0 }}>{cfg.icon}</span>

      <div style={{ flex: 1 }}>
        {title && <span style={{ fontSize: F.size.sm, fontWeight: 700, color: C.text, fontFamily: F.family, marginRight: 6 }}>{title}</span>}
        <span style={{ fontSize: F.size.sm, color: C.textSub, fontFamily: F.family }}>{message}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {action && (
          <button
            onClick={action.onClick}
            style={{
              fontSize: F.size.xs, fontWeight: 700, color: cfg.color,
              background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
              borderRadius: R.sm, padding: '4px 10px',
              cursor: 'pointer', fontFamily: F.family,
            }}
          >
            {action.label}
          </button>
        )}
        {dismissible && (
          <button
            onClick={() => setVisible(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '50%',
              background: C.textMuted + '20', border: 'none',
              cursor: 'pointer', color: C.textMuted, fontSize: '0.7rem',
            }}
          >✕</button>
        )}
      </div>
    </div>
  );
}
