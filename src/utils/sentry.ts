/**
 * Sentry Error Tracking Configuration
 * Production-grade error monitoring with safe dynamic imports.
 *
 * Uses lazy-loaded `@sentry/react` so the build doesn't break
 * when the package isn't installed in preview/dev environments.
 */

const isProduction = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
const sentryDSN = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SENTRY_DSN : undefined;

// Cached Sentry module reference (populated after first dynamic import)
let _Sentry: typeof import('@sentry/react') | null = null;

/** Attempt to load @sentry/react at runtime. Returns null if unavailable. */
async function loadSentry() {
  if (_Sentry) return _Sentry;
  try {
    _Sentry = await import('@sentry/react');
    return _Sentry;
  } catch {
    console.warn('[Sentry] @sentry/react not available — error tracking disabled');
    return null;
  }
}

/**
 * Initialize Sentry SDK.
 * Safe to call anywhere — no-ops when DSN is missing or package unavailable.
 */
export async function initializeSentry() {
  if (!isProduction || !sentryDSN) {
    console.log('[Sentry] Disabled (dev/preview mode or DSN not set)');
    return null;
  }

  const Sentry = await loadSentry();
  if (!Sentry) return null;

  Sentry.init({
    dsn: sentryDSN,

    // Environment
    environment: import.meta.env.MODE || 'production',
    release: `wasel-app@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

    // Modern integrations — Sentry v7.47+ auto-discovers BrowserTracing
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance traces sample rate
    tracesSampleRate: 0.1,

    // Session replay sample rates
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter sensitive data before sending
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers['stripe-signature'];
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(bc => {
          if (bc.data) {
            delete bc.data.password;
            delete bc.data.token;
            delete bc.data.accessToken;
          }
          return bc;
        });
      }
      return event;
    },

    // Ignore noise
    ignoreErrors: [
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      'AbortError',
      'The operation was aborted',
      'ResizeObserver loop limit exceeded',
    ],

    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
  });

  console.log('[Sentry] Initialized successfully');

  return {
    setUserContext: (user: { id: string; email?: string; name?: string }) => {
      Sentry.setUser({ id: user.id, email: user.email, username: user.name });
    },
    clearUserContext: () => {
      Sentry.setUser(null);
    },
  };
}

// ── Lightweight helpers (sync — use cached module or console fallback) ──

export function logError(
  error: Error,
  context?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'error',
) {
  if (isProduction && _Sentry) {
    _Sentry.captureException(error, {
      level,
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    console.error('[Error]', error, context);
  }
}

export function logEvent(
  message: string,
  data?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
) {
  if (isProduction && _Sentry) {
    _Sentry.captureMessage(message, {
      level,
      contexts: data ? { custom: data } : undefined,
    });
  } else {
    console.log('[Event]', message, data);
  }
}

export function trackPerformance(
  operation: string,
  callback: () => void | Promise<void>,
) {
  // In modern Sentry v7.47+ spans are created via startSpan, but we keep it
  // simple: just run the callback. Sentry auto-instruments fetch/XHR.
  const result = callback();
  if (result instanceof Promise) return result;
}

export function trackAPICall(
  method: string,
  url: string,
  duration: number,
  status: number,
  error?: Error,
) {
  if (!isProduction || !_Sentry) return;

  _Sentry.addBreadcrumb({
    type: 'http',
    category: 'api',
    data: { method, url, status_code: status, duration },
    level: error ? 'error' : 'info',
  });

  if (error) {
    logError(error, { api_endpoint: url, http_method: method, http_status: status });
  }
}

export function trackFeatureFlag(flag: string, enabled: boolean) {
  if (!isProduction || !_Sentry) return;

  _Sentry.addBreadcrumb({
    type: 'default',
    category: 'feature-flag',
    data: { flag, enabled },
    level: 'info',
  });
}

export default {
  initializeSentry,
  logError,
  logEvent,
  trackPerformance,
  trackAPICall,
  trackFeatureFlag,
};
