/**
 * Optimized Callback Hooks
 *
 * Provides stable callback references that always invoke the *latest* version
 * of the function passed in — without violating the Rules of Hooks.
 *
 * PREVIOUS BUG: useCallback was called inside useMemo inside forEach, which is
 * an illegal hook call site (React Rules of Hooks §1: only call hooks at the
 * top level). This caused a crash whenever the key-set changed between renders.
 *
 * SOLUTION: Use a ref-based stable-proxy pattern.
 *   1. Store the latest callbacks object in a ref (updated synchronously on every render).
 *   2. Create stable proxy functions *once* (stored in a second ref).
 *   3. The proxies never change identity, so downstream memoization stays valid.
 *      They always delegate to `latestRef.current`, so they always call the newest closure.
 */

import { useRef, useMemo, useCallback } from 'react';
import type { DependencyList } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CallbackMap = Record<string, (...args: unknown[]) => unknown>;

// ─── useOptimizedCallbacks ────────────────────────────────────────────────────

/**
 * Returns a stable version of the provided callbacks map.
 * Each stable function has a fixed reference across renders but always calls
 * the latest version of the underlying callback — no stale-closure bugs.
 *
 * No deps array is required: the hook is unconditionally safe.
 *
 * @example
 * const stable = useOptimizedCallbacks({ onSubmit, onCancel });
 * // stable.onSubmit and stable.onCancel never change identity.
 */
export function useOptimizedCallbacks<T extends CallbackMap>(callbacks: T): T {
  // ① Always keep the latest callbacks accessible (no stale closures)
  const latestRef = useRef<T>(callbacks);
  latestRef.current = callbacks;

  // ② Create stable proxy wrappers exactly once — they never change identity
  const stableRef = useRef<T | null>(null);

  if (stableRef.current === null) {
    const stable = {} as T;

    // Iterate the *initial* key-set to build proxies.
    // NOTE: keys added after the first render won't get a proxy, which is the
    // same behaviour as useCallback with an exhaustive-deps rule — callers
    // should ensure the callback map shape is stable.
    for (const key of Object.keys(callbacks) as Array<keyof T>) {
      // ✅ No hook called here — plain function assignment
      (stable as Record<keyof T, unknown>)[key] = (
        ...args: unknown[]
      ) => (latestRef.current[key] as (...a: unknown[]) => unknown)(...args);
    }

    stableRef.current = stable;
  }

  return stableRef.current;
}

// ─── useMemoizedValue ─────────────────────────────────────────────────────────

/**
 * Thin semantic alias over `useMemo`.
 * Prefer this when you want to make intent explicit at the call site.
 */
export function useMemoizedValue<T>(factory: () => T, deps: DependencyList): T {
  // useMemo is called at top-level — no hook rule violation
  return useMemo(factory, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── useStableCallback ────────────────────────────────────────────────────────

/**
 * Thin semantic alias over `useCallback`.
 * Prefer this for clarity when wrapping a single event handler.
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList = []
): T {
  return useCallback((...args: unknown[]) => callback(...args), [callback, ...deps]) as T;
}
