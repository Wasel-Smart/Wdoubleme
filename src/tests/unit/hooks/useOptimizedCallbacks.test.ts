/**
 * Tests for useOptimizedCallbacks
 *
 * These tests specifically guard against the previous P0 regression where
 * useCallback was illegally called inside useMemo inside forEach, causing a
 * "Rendered more hooks than during the previous render" crash.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useOptimizedCallbacks,
  useMemoizedValue,
  useStableCallback,
} from '../../../hooks/useOptimizedCallbacks';

// ─── useOptimizedCallbacks ────────────────────────────────────────────────────

describe('useOptimizedCallbacks', () => {
  it('returns an object with the same keys as the input callbacks', () => {
    const callbacks = {
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    };

    const { result } = renderHook(() => useOptimizedCallbacks(callbacks));

    expect(result.current).toHaveProperty('onSubmit');
    expect(result.current).toHaveProperty('onCancel');
  });

  it('stable references do not change across re-renders', () => {
    const callbacks = { onClick: vi.fn() };

    const { result, rerender } = renderHook(() =>
      useOptimizedCallbacks(callbacks)
    );

    const first = result.current.onClick;
    rerender();
    const second = result.current.onClick;

    // Identity must be stable — if it changed, downstream memoization breaks
    expect(first).toBe(second);
  });

  it('always calls the LATEST version of the callback (no stale closure)', () => {
    let callCount = 0;
    const callbacks = {
      increment: () => {
        callCount++;
      },
    };

    const { result, rerender } = renderHook(
      (props: { callbacks: typeof callbacks }) =>
        useOptimizedCallbacks(props.callbacks),
      { initialProps: { callbacks } }
    );

    // Replace the callback with a new closure that adds 10 instead
    let addedValue = 0;
    const newCallbacks = {
      increment: () => {
        addedValue += 10;
      },
    };

    rerender({ callbacks: newCallbacks });

    act(() => {
      result.current.increment();
    });

    // The stable proxy should have called the NEW callback
    expect(addedValue).toBe(10);
    // The OLD callback should NOT have been called
    expect(callCount).toBe(0);
  });

  it('does not throw when the callbacks map is called multiple times', () => {
    const callbacks = { doSomething: vi.fn() };
    const { result } = renderHook(() => useOptimizedCallbacks(callbacks));

    expect(() => {
      act(() => {
        result.current.doSomething();
        result.current.doSomething();
        result.current.doSomething();
      });
    }).not.toThrow();

    expect(callbacks.doSomething).toHaveBeenCalledTimes(3);
  });

  it('passes arguments through to the underlying callback', () => {
    const received: unknown[] = [];
    const callbacks = {
      handler: (a: string, b: number) => {
        received.push(a, b);
      },
    };

    const { result } = renderHook(() => useOptimizedCallbacks(callbacks));

    act(() => {
      (result.current.handler as (a: string, b: number) => void)('hello', 42);
    });

    expect(received).toEqual(['hello', 42]);
  });
});

// ─── useMemoizedValue ─────────────────────────────────────────────────────────

describe('useMemoizedValue', () => {
  it('returns the computed value', () => {
    const { result } = renderHook(() =>
      useMemoizedValue(() => 2 + 2, [])
    );
    expect(result.current).toBe(4);
  });

  it('recomputes when dependencies change', () => {
    let multiplier = 1;
    const { result, rerender } = renderHook(() =>
      useMemoizedValue(() => 5 * multiplier, [multiplier])
    );

    expect(result.current).toBe(5);

    multiplier = 3;
    rerender();
    expect(result.current).toBe(15);
  });
});

// ─── useStableCallback ────────────────────────────────────────────────────────

describe('useStableCallback', () => {
  it('returns a function', () => {
    const { result } = renderHook(() =>
      useStableCallback(() => 'hello', [])
    );
    expect(typeof result.current).toBe('function');
  });

  it('is stable when deps do not change', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(() =>
      useStableCallback(cb, [])
    );

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('changes identity when deps change', () => {
    let dep = 1;
    const cb = vi.fn();
    const { result, rerender } = renderHook(() =>
      useStableCallback(cb, [dep])
    );

    const first = result.current;
    dep = 2;
    rerender();

    // useCallback should produce a new reference when deps change
    expect(result.current).not.toBe(first);
  });
});
