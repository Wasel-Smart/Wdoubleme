/**
 * Wasel API Gateway
 * Central fetch wrapper with auth, error handling, retries, and request deduplication.
 */

import { supabase } from '@/lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  requiresAuth?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

function buildHeaders(
  token: string | null,
  extra: Record<string, string> = {}
): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => ({})) : {};
    return {
      data: null,
      error: {
        status: res.status,
        message: body?.message ?? body?.error ?? res.statusText,
        code: body?.code,
      },
    };
  }

  if (res.status === 204 || !isJson) {
    return { data: null, error: null };
  }

  try {
    const data: T = await res.json();
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: { status: 500, message: 'Failed to parse response JSON' },
    };
  }
}

// ─── Core Request ─────────────────────────────────────────────────────────────

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers: extraHeaders = {},
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    timeout = DEFAULT_TIMEOUT_MS,
    requiresAuth = true,
  } = options;

  const token = requiresAuth ? await getAuthToken() : null;
  const headers = buildHeaders(token, extraHeaders);

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await parseResponse<T>(res);

      // Don't retry on 4xx client errors
      if (result.error && result.error.status >= 400 && result.error.status < 500) {
        return result;
      }

      if (!result.error) return result;

      // Retry on 5xx or network-ish errors
      if (attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt)); // exponential backoff
        attempt++;
        continue;
      }

      return result;
    } catch (err) {
      clearTimeout(timeoutId);

      if (attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt));
        attempt++;
        continue;
      }

      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      return {
        data: null,
        error: {
          status: isAbort ? 408 : 0,
          message: isAbort ? 'Request timed out' : 'Network error',
        },
      };
    }
  }

  return { data: null, error: { status: 0, message: 'Unknown error' } };
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  put: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  patch: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

export default api;
