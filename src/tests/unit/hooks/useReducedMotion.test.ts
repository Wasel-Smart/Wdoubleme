/**
 * useReducedMotion — Accessibility hook tests.
 *
 * Covers:
 *  - Returns false when prefers-reduced-motion: no-preference
 *  - Returns true when prefers-reduced-motion: reduce
 *  - Reacts to OS setting changes at runtime
 *  - Cleans up event listener on unmount
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

// ─── Mocks ────────────────────────────────────────────────────────────────────

let listenerFn: ((event: { matches: boolean }) => void) | null = null;
let currentMatches = false;

const mockMediaQueryList = {
  get matches() { return currentMatches; },
  media: '(prefers-reduced-motion: reduce)',
  addEventListener: vi.fn((_, fn) => { listenerFn = fn; }),
  removeEventListener: vi.fn((_, fn) => {
    if (listenerFn === fn) listenerFn = null;
  }),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  onchange: null,
  dispatchEvent: vi.fn(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  currentMatches = false;
  listenerFn = null;
  vi.spyOn(window, 'matchMedia').mockReturnValue(mockMediaQueryList as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useReducedMotion', () => {
  it('returns false when user has no motion preference', () => {
    currentMatches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when user prefers reduced motion', () => {
    currentMatches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the OS setting changes at runtime', () => {
    currentMatches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate the user toggling "Reduce Motion" in OS settings
    act(() => {
      if (listenerFn) listenerFn({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalled();

    unmount();
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
  });

  it('subscribes to the correct media query', () => {
    renderHook(() => useReducedMotion());
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
