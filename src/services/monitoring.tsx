/**
 * Sentry Error Tracking & Performance Monitoring
 * Complete setup for production-grade error tracking
 */

import type { ComponentType } from 'react';
import * as Sentry from '@sentry/react';

// Initialize Sentry
export function initSentry() {
  const environment = import.meta.env.MODE || 'development';
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of errors

    // Release tracking
    release: `wasel@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        
        // Filter sensitive headers
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }

        // Filter sensitive query params
        if (event.request.query_string) {
          const params = new URLSearchParams(event.request.query_string);
          params.delete('token');
          params.delete('password');
          params.delete('apiKey');
          event.request.query_string = params.toString();
        }
      }

      // Filter sensitive breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.filter(
          (breadcrumb) => {
            return !breadcrumb.message?.toLowerCase().includes('password');
          }
        );
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      
      // Canceled requests
      'AbortError',
      'Request aborted',
      
      // 3rd party errors
      'gtm',
      'fbevents',
      'google-analytics',
    ],

    // Deny URLs - don't track errors from these URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      
      // 3rd party scripts
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
      /facebook\.com/i,
    ],
  });

  // Set user context if authenticated
  const user = getUserContext();
  if (user) {
    Sentry.setUser(user);
  }
}

/**
 * Get user context for Sentry
 */
function getUserContext() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return {
      id: user.id,
      email: user.email,
      username: user.fullName,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; name?: string; role?: string } | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role,
  });
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string = 'user-action',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string = 'navigation') {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Track custom performance metrics
 */
export function trackPerformance(metricName: string, value: number, unit: string = 'millisecond') {
  Sentry.setMeasurement(metricName, value, unit);
}

/**
 * Error boundary for React components
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * HOC to wrap components with error boundary
 */
export function withSentry<P extends object>(
  Component: ComponentType<P>,
  options?: Sentry.ErrorBoundaryProps
) {
  return (props: P) => (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>We've been notified and are working on it.</p>
          <button onClick={resetError}>Try again</button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details (Dev Only)</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {error.toString()}
                {componentStack}
              </pre>
            </details>
          )}
        </div>
      )}
      {...options}
    >
      <Component {...props} />
    </Sentry.ErrorBoundary>
  );
}

/**
 * Track API errors
 */
export function trackAPIError(
  endpoint: string,
  method: string,
  statusCode: number,
  error: any
) {
  Sentry.withScope((scope) => {
    scope.setTag('api.endpoint', endpoint);
    scope.setTag('api.method', method);
    scope.setTag('api.status', statusCode);
    scope.setContext('API Error', {
      endpoint,
      method,
      statusCode,
      error: error?.message || error,
    });
    Sentry.captureException(error);
  });
}

/**
 * Track payment errors
 */
export function trackPaymentError(
  paymentMethod: string,
  amount: number,
  currency: string,
  error: any
) {
  Sentry.withScope((scope) => {
    scope.setTag('payment.method', paymentMethod);
    scope.setTag('payment.currency', currency);
    scope.setContext('Payment Error', {
      paymentMethod,
      amount,
      currency,
      error: error?.message || error,
    });
    Sentry.captureException(error);
  });
}

/**
 * Track trip errors
 */
export function trackTripError(
  tripId: string,
  stage: 'booking' | 'matching' | 'in-progress' | 'payment' | 'completion',
  error: any
) {
  Sentry.withScope((scope) => {
    scope.setTag('trip.id', tripId);
    scope.setTag('trip.stage', stage);
    scope.setContext('Trip Error', {
      tripId,
      stage,
      error: error?.message || error,
    });
    Sentry.captureException(error);
  });
}

/**
 * Performance monitoring utilities
 */
export const Performance = {
  // Measure page load time
  measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      trackPerformance('page_load', pageLoadTime);
    });
  },

  // Measure API call
  async measureAPI<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const transaction = startTransaction(`API: ${name}`, 'http');
    const start = Date.now();

    try {
      const result = await apiCall();
      const duration = Date.now() - start;
      trackPerformance(`api_${name}`, duration);
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  },

  // Measure component render
  measureRender(componentName: string) {
    const transaction = startTransaction(`Render: ${componentName}`, 'render');
    
    return () => {
      transaction.finish();
    };
  },
};

/**
 * Setup axios interceptor for automatic error tracking
 */
export function setupAxiosInterceptor(axios: any) {
  axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      const config = error.config;
      trackAPIError(
        config?.url || 'unknown',
        config?.method || 'unknown',
        error.response?.status || 0,
        error
      );
      return Promise.reject(error);
    }
  );
}

/**
 * Setup fetch interceptor for automatic error tracking
 */
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const [url, options] = args;
    const method = options?.method || 'GET';

    try {
      const response = await originalFetch(...args);

      if (!response.ok) {
        trackAPIError(
          typeof url === 'string' ? url : url.toString(),
          method,
          response.status,
          new Error(`HTTP ${response.status}`)
        );
      }

      return response;
    } catch (error) {
      trackAPIError(
        typeof url === 'string' ? url : url.toString(),
        method,
        0,
        error
      );
      throw error;
    }
  };
}

// Export Sentry for direct access if needed
export { Sentry };

// Auto-initialize in production
if (import.meta.env.PROD) {
  initSentry();
}
