/**
 * Wasel Accessibility Utilities — WCAG 2.1 AAA Compliance
 * 
 * Provides helpers for:
 * - ARIA attributes
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - Semantic HTML
 */

import React, { useEffect, useRef, useState } from 'react';

// ─── ARIA Helpers ─────────────────────────────────────────────────────────────

/**
 * Generate unique IDs for ARIA relationships
 * Usage: const id = useAriaId('dialog');
 */
export function useAriaId(prefix: string): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).slice(2, 9)}`);
  return id;
}

/**
 * Common ARIA props for interactive elements
 */
export interface AriaButtonProps {
  role?: 'button' | 'link';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'dialog' | 'listbox' | 'tree' | 'grid';
  'aria-controls'?: string;
  tabIndex?: number;
}

/**
 * Common ARIA props for form inputs
 */
export interface AriaInputProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-errormessage'?: string;
}

/**
 * Common ARIA props for live regions
 */
export interface AriaLiveProps {
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  role?: 'status' | 'alert' | 'log';
}

// ─── Keyboard Navigation ──────────────────────────────────────────────────────

/**
 * Handle keyboard navigation for lists/menus
 * Usage: const { onKeyDown } = useKeyboardNav({ items, onSelect });
 */
export function useKeyboardNav<T>({
  items,
  onSelect,
  loop = true,
}: {
  items: T[];
  onSelect: (item: T) => void;
  loop?: boolean;
}) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          loop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1)
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          loop ? (prev - 1 + items.length) % items.length : Math.max(prev - 1, 0)
        );
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (items[focusedIndex]) {
          onSelect(items[focusedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        (e.target as HTMLElement).blur();
        break;
    }
  };

  return { focusedIndex, setFocusedIndex, onKeyDown: handleKeyDown };
}

// ─── Focus Management ─────────────────────────────────────────────────────────

/**
 * Focus trap for modals/dialogs (WCAG 2.1)
 * Usage: const trapRef = useFocusTrap({ active: isOpen });
 */
export function useFocusTrap({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: cycle backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: cycle forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return ref;
}

/**
 * Restore focus to trigger element when modal closes
 * Usage: const restoreFocusRef = useFocusReturn();
 */
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    return () => {
      // Restore focus on unmount
      previousFocusRef.current?.focus();
    };
  }, []);

  return previousFocusRef;
}

// ─── Screen Reader Utilities ──────────────────────────────────────────────────

/**
 * Visually hidden but accessible to screen readers
 * Usage: <span className={visuallyHidden}>Hidden label</span>
 */
export const visuallyHidden =
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]';

/**
 * Announce message to screen readers
 * Usage: const announce = useScreenReaderAnnouncer();
 *        announce('Ride booked successfully!');
 */
export function useScreenReaderAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to trigger re-announcement
    setTimeout(() => setAnnouncement(message), 100);
  };

  return { announce, announcement };
}

/**
 * Screen reader announcement component
 * Usage: <ScreenReaderAnnouncer message={message} />
 */
export function ScreenReaderAnnouncer({
  message,
  priority = 'polite',
}: {
  message: string;
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className={visuallyHidden}
    >
      {message}
    </div>
  );
}

// ─── Skip Links ───────────────────────────────────────────────────────────────

/**
 * Skip to main content link (WCAG 2.1)
 * Usage: <SkipLink href="#main-content">Skip to main content</SkipLink>
 */
export function SkipLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="absolute left-0 top-0 -translate-y-full focus:translate-y-0 bg-primary text-primary-foreground px-4 py-2 z-[9999] transition-transform focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </a>
  );
}

// ─── Color Contrast Checker ───────────────────────────────────────────────────

/**
 * Calculate WCAG contrast ratio
 * Usage: const ratio = getContrastRatio('#04ADBF', '#FFFFFF');
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const adjust = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG standards
 * Usage: const { aa, aaa } = checkContrast('#04ADBF', '#FFFFFF');
 */
export function checkContrast(foreground: string, background: string) {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: ratio.toFixed(2),
    AA: ratio >= 4.5,       // WCAG AA (normal text)
    AALarge: ratio >= 3,    // WCAG AA (large text)
    AAA: ratio >= 7,        // WCAG AAA (normal text)
    AAALarge: ratio >= 4.5, // WCAG AAA (large text)
  };
}

// ─── Semantic Landmarks ───────────────────────────────────────────────────────

/**
 * Helper props for semantic HTML5 landmarks
 * Usage: <main {...mainLandmark}>...</main>
 */
export const mainLandmark = {
  role: 'main',
  id: 'main-content',
  tabIndex: -1, // Allows skip link to focus
} as const;

export const navigationLandmark = {
  role: 'navigation',
  'aria-label': 'Main navigation',
} as const;

export const searchLandmark = {
  role: 'search',
  'aria-label': 'Search',
} as const;

export const complementaryLandmark = {
  role: 'complementary',
  'aria-label': 'Sidebar',
} as const;

// ─── Form Validation Helpers ──────────────────────────────────────────────────

/**
 * Generate accessible error messages for forms
 * Usage: const errorProps = getErrorProps(errorId, hasError, errorMessage);
 */
export function getErrorProps(
  errorId: string,
  hasError: boolean,
  errorMessage?: string
) {
  return {
    'aria-invalid': hasError,
    'aria-errormessage': hasError ? errorId : undefined,
    'aria-describedby': hasError ? errorId : undefined,
  };
}

/**
 * Accessible form field wrapper
 * Usage: <FormField label="Email" error="Invalid email" required>
 *          <input type="email" />
 *        </FormField>
 */
export function FormField({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
}) {
  const id = useAriaId('field');
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span aria-label="required" className="text-destructive ml-1">*</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      {React.cloneElement(children, {
        id,
        'aria-required': required,
        'aria-invalid': !!error,
        'aria-errormessage': error ? errorId : undefined,
        'aria-describedby': [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined,
      })}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Loading States ───────────────────────────────────────────────────────────

/**
 * Accessible loading indicator
 * Usage: <LoadingSpinner label="Loading rides..." />
 */
export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="flex items-center gap-2">
      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
      <span className={visuallyHidden}>{label}</span>
    </div>
  );
}

// ─── Interactive Element Helpers ──────────────────────────────────────────────

/**
 * Make any element keyboard accessible
 * Usage: <div {...makeInteractive({ onClick: handler, label: 'Click me' })}>
 */
export function makeInteractive({
  onClick,
  label,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return {
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    'aria-label': label,
    'aria-disabled': disabled,
    onClick: disabled ? undefined : onClick,
    onKeyDown: disabled
      ? undefined
      : (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
  };
}

// ─── Bilingual Accessibility ──────────────────────────────────────────────────

/**
 * RTL-aware ARIA labels
 * Usage: const ariaLabel = getBilingualLabel({ en: 'Search', ar: 'بحث' }, language);
 */
export function getBilingualLabel(
  labels: { en: string; ar: string },
  language: 'en' | 'ar'
): string {
  return labels[language];
}

/**
 * Language-specific screen reader hints
 * Usage: <button aria-label={getA11yLabel('search', language)}>
 */
export const A11Y_LABELS = {
  en: {
    search: 'Search',
    close: 'Close',
    menu: 'Menu',
    back: 'Go back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    required: 'Required field',
  },
  ar: {
    search: 'بحث',
    close: 'إغلاق',
    menu: 'القائمة',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    loading: 'جاري التحميل',
    error: 'خطأ',
    success: 'نجح',
    required: 'حقل مطلوب',
  },
} as const;

export function getA11yLabel(
  key: keyof typeof A11Y_LABELS.en,
  language: 'en' | 'ar'
): string {
  return A11Y_LABELS[language][key];
}
