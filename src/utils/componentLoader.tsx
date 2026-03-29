/**
 * Optimized Component Loader
 *
 * Intelligent lazy loading, preloading, and caching for the component tree.
 */

import { lazy, ComponentType } from 'react';

// Polyfill: use requestIdleCallback if available, otherwise setTimeout
const scheduleIdleWork = (cb: () => void) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(cb);
  } else {
    setTimeout(cb, 200);
  }
};

// ── Component Loading Priority Lists ────────────────────────────────────────

/** Critical — loaded immediately (first meaningful paint) */
export const CRITICAL_COMPONENTS = [
  'LandingPage',
  'AuthPage',
  'Dashboard',
  'SearchRides',
  'PostRide',
  'Header',
  'Sidebar',
  'LoadingSpinner',
];

/** High priority — preload after critical path */
export const HIGH_PRIORITY_COMPONENTS = [
  'MyTrips',
  'Messages',
  'UserProfile',
  'Settings',
  'NotificationCenter',
  'Payments',
];

/** Medium priority — load on demand */
export const MEDIUM_PRIORITY_COMPONENTS = [
  'PackageDelivery',
  'SafetyCenter',
  'VerificationCenter',
  'WalletDashboard',
];

/** Low priority — rarely accessed / admin-only */
export const LOW_PRIORITY_COMPONENTS = [
  'AdminDashboard',
  'TripInjectionDashboard',
];

// ── Component Cache ──────────────────────────────────────────────────────────

const componentCache = new Map<string, ComponentType<any>>();
const loadingPromises = new Map<string, Promise<{ default: ComponentType<any> }>>();

/**
 * Enhanced lazy loading with caching and retry logic.
 */
export function lazyLoadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  componentName: string,
  retries = 3,
  retryDelay = 1000,
): ComponentType<any> {
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!;
  }

  const LazyComponent = lazy(() => {
    if (loadingPromises.has(componentName)) {
      return loadingPromises.get(componentName)!;
    }

    const loadingPromise = retryImport(importFn, retries, retryDelay)
      .then((module) => {
        componentCache.set(componentName, module.default);
        loadingPromises.delete(componentName);
        return module;
      })
      .catch((error) => {
        console.error(`Failed to load component ${componentName}:`, error);
        loadingPromises.delete(componentName);
        return {
          default: () => (
            <div className="flex items-center justify-center min-h-[60vh] p-4">
              <div className="text-center bg-[#111B2E] border border-[#1E293B] rounded-2xl p-8 max-w-md">
                <h2 className="text-xl font-bold text-red-400 mb-2">Failed to load component</h2>
                <p className="text-slate-400 mb-4">{componentName}</p>
                <button
                  onClick={() => {
                    try {
                      history.replaceState(null, '', window.location.pathname);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    } catch { /* ignore */ }
                  }}
                  className="px-6 py-2.5 bg-[#04ADBF] hover:bg-[#04ADBF]/80 text-white rounded-xl font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ),
        };
      });

    loadingPromises.set(componentName, loadingPromise);
    return loadingPromise;
  });

  return LazyComponent;
}

/** Retry import with exponential backoff */
async function retryImport(importFn: () => Promise<any>, retries: number, delay: number): Promise<any> {
  try {
    return await importFn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryImport(importFn, retries - 1, delay * 2);
  }
}

/** Preload a component without rendering it */
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<any> }>, componentName: string): void {
  if (componentCache.has(componentName) || loadingPromises.has(componentName)) return;

  const promise = importFn()
    .then((module) => {
      componentCache.set(componentName, module.default);
      return module;
    })
    .catch(() => {
      // Silently fail — preload is non-critical
    });

  loadingPromises.set(componentName, promise);
}

/** Batch preload multiple components during idle time */
export function preloadComponents(components: Array<{ importFn: () => Promise<any>; name: string }>): void {
  scheduleIdleWork(() => {
    components.forEach(({ importFn, name }) => preloadComponent(importFn, name));
  });
}

/** Clear the component cache (useful for dev hot-reload) */
export function clearComponentCache(): void {
  componentCache.clear();
  loadingPromises.clear();
}

/** Cache statistics */
export function getCacheStats() {
  return {
    cached: componentCache.size,
    loading: loadingPromises.size,
    cacheSize: `${componentCache.size} components`,
  };
}

// ── Intelligent Preloading ───────────────────────────────────────────────────

/** Preload high-priority components after initial render */
export function preloadHighPriorityComponents(): void {
  setTimeout(() => {
    const batchSize = 2;
    const highPriorityImports = [
      { importFn: () => import('../components/MyTrips').then(m => ({ default: m.MyTrips })), name: 'MyTrips' },
      { importFn: () => import('../components/Messages').then(m => ({ default: m.Messages })), name: 'Messages' },
      { importFn: () => import('../features/profile/UserProfile').then(m => ({ default: m.UserProfile })), name: 'UserProfile' },
      { importFn: () => import('../components/Settings').then(m => ({ default: m.Settings })), name: 'Settings' },
      { importFn: () => import('../components/NotificationCenter').then(m => ({ default: m.NotificationCenter })), name: 'NotificationCenter' },
      { importFn: () => import('../components/Payments').then(m => ({ default: m.Payments })), name: 'Payments' },
    ];

    for (let i = 0; i < highPriorityImports.length; i += batchSize) {
      const batch = highPriorityImports.slice(i, i + batchSize);
      setTimeout(() => preloadComponents(batch), i * 1000);
    }
  }, 5000);
}

// Auto-start monitoring in dev
if (import.meta?.env?.DEV) {
  setInterval(() => {
    console.debug('📊 Component Cache:', getCacheStats());
  }, 30_000);
}
