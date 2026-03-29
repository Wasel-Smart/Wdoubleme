/**
 * services/core.ts — Shared HTTP / Supabase primitives for the Wasel frontend.
 *
 * ✅ fetchWithRetry: exponential backoff + per-request timeout + abort support
 * ✅ warmUpServer: pre-pings the Edge Function health endpoint on app load
 * ✅ Singleton Supabase client re-export
 * ✅ getAuthDetails: one-shot helper for token + userId
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  supabase as supabaseClient,
  supabaseUrl,
} from '../utils/supabase/client';

export { projectId, publicAnonKey };

export const API_URL = supabaseUrl
  ? `${supabaseUrl}/functions/v1/make-server-0b1f4071`
  : '';

// ── Edge Function Status ────────────────────────────────────────────────────
let _edgeFunctionAvailable = true;

/**
 * Check if Edge Function is available. If it fails repeatedly,
 * we'll mark it as unavailable and use direct Supabase queries instead.
 */
export function isEdgeFunctionAvailable(): boolean {
  return _edgeFunctionAvailable;
}

export function markEdgeFunctionUnavailable(): void {
  if (_edgeFunctionAvailable) {
    // Check if we're in development mode (safely handle import.meta)
    const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
    if (isDev) {
      console.info('��� Edge Function unavailable - using direct Supabase queries (this is normal in development)');
    }
    _edgeFunctionAvailable = false;
  }
}

// ── Server warm-up ──────────────────────────────────────────────────────────

let _serverWarm = false;
let _warmUpAttempts = 0;
const MAX_WARMUP_ATTEMPTS = 3;

/**
 * Fire-and-forget health ping to wake up the Edge Function.
 * Called once on app startup so the first real request doesn't hit a cold start.
 * Retries up to 3 times with increasing delay if the first ping fails.
 * If all attempts fail, marks Edge Function as unavailable.
 */
export async function warmUpServer(): Promise<void> {
  if (_serverWarm || !API_URL || !publicAnonKey) return;
  _warmUpAttempts++;

  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(12_000),
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    if (res.ok) {
      _serverWarm = true;
      _edgeFunctionAvailable = true;
      console.log('[warmUp] Edge Function is warm ✅');
    } else {
      if (_warmUpAttempts < MAX_WARMUP_ATTEMPTS) {
        setTimeout(() => warmUpServer(), 2000 * _warmUpAttempts);
      } else {
        markEdgeFunctionUnavailable();
      }
    }
  } catch (err) {
    // Only log on final attempt to reduce console noise
    if (_warmUpAttempts >= MAX_WARMUP_ATTEMPTS) {
      console.info(`[warmUp] Edge Function unavailable after ${MAX_WARMUP_ATTEMPTS} attempts. Using direct Supabase queries.`);
      markEdgeFunctionUnavailable();
    } else {
      // Silent retry
      setTimeout(() => warmUpServer(), 2000 * _warmUpAttempts);
    }
  }
}

// Kick off warm-up immediately when this module loads
warmUpServer();

// ── fetchWithRetry ──────────────────────────────────────────────────────────

interface FetchWithRetryOptions extends RequestInit {
  /** Per-attempt timeout in ms. Default: 5000 (fast failover for graceful degradation) */
  timeout?: number;
}

/**
 * Fetch with exponential backoff and per-attempt timeout.
 *
 * Retries on network errors and 502/503/504 responses.
 * Respects the caller's `signal` for cancellation.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
  retries = 1,  // Default to 1 retry (down from 3) for fast failover
  backoff = 500, // Default to 500ms (down from 800ms) for faster response
): Promise<Response> {
  if (!url) {
    throw new Error('Backend API is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { timeout = 5_000, signal: callerSignal, ...fetchOptions } = options; // Default to 5s (down from 20s)

  // Merge caller signal with per-attempt timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // If the caller already aborted, forward immediately
  if (callerSignal?.aborted) {
    clearTimeout(timer);
    throw new DOMException('Request aborted', 'AbortError');
  }

  // Forward caller abort into our controller
  const onCallerAbort = () => controller.abort();
  callerSignal?.addEventListener('abort', onCallerAbort, { once: true });

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    // Retry on transient server errors (typically cold-start gateway timeouts)
    if (retries > 0 && (response.status === 502 || response.status === 503 || response.status === 504)) {
      console.warn(
        `[fetchWithRetry] ${response.status} from ${url}. Retrying (${retries} left) in ${backoff}ms…`,
      );
      await delay(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    return response;
  } catch (error: unknown) {
    // Don't retry if the caller explicitly aborted
    if (callerSignal?.aborted) throw error;

    const isRetryable =
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === 'AbortError');

    if (retries > 0 && isRetryable) {
      // Silent retry - only log in development
      const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
      if (isDev) {
        console.info(
          `[fetchWithRetry] Retrying ${url} (${retries} left)...`,
        );
      }
      await delay(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    // Only log exhausted retries as info since fallback handles it gracefully
    console.info(
      `[fetchWithRetry] Using fallback for ${url.split('/').slice(-2).join('/')}`,
    );
    throw error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Supabase singleton ──────────────────────────────────────────────────────

export const supabase = supabaseClient;

// ── Auth details helper ─────────────────────────────────────────────────────

export interface AuthDetails {
  token: string;
  userId: string;
}

/**
 * Resolve the current session's access_token and user id.
 * Throws if the user is not authenticated.
 */
export async function getAuthDetails(): Promise<AuthDetails> {
  if (!supabase) throw new Error('Supabase client is not initialised');

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error('Not authenticated');

  return {
    token: session.access_token,
    userId: session.user.id,
  };
}
