/**
 * Ultra-Fast Performance Optimizer
 * Makes Wasel the fastest carpooling app on Earth
 * 
 * Features:
 * - Request batching & deduplication
 * - Aggressive caching
 * - Connection pooling
 * - Prefetching strategies
 * - Resource hints
 * - Critical path optimization
 */

import { supabase } from './supabase/client';

// ============================================================================
// REQUEST BATCHING & DEDUPLICATION
// ============================================================================

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
  key: string;
}

class RequestOptimizer {
  private pendingRequests = new Map<string, PendingRequest>();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private batchDelay = 50; // 50ms batching window
  
  /**
   * Deduplicate identical requests
   */
  deduplicate<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check if identical request is already pending
    const existing = this.pendingRequests.get(key);
    if (existing && Date.now() - existing.timestamp < 5000) {
      console.log(`🚀 Deduped request: ${key}`);
      return existing.promise;
    }

    // Create new request
    const promise = fetchFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
      key,
    });

    return promise;
  }

  /**
   * Batch multiple requests together
   */
  batch<T>(fetchFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(() => fetchFn().then(resolve).catch(reject));
      
      if (!this.isProcessing) {
        setTimeout(() => this.processBatch(), this.batchDelay);
      }
    });
  }

  private async processBatch() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    const batch = [...this.requestQueue];
    this.requestQueue = [];

    console.log(`🚀 Processing batch of ${batch.length} requests`);

    // Execute all requests in parallel
    await Promise.allSettled(batch.map(fn => fn()));
    
    this.isProcessing = false;

    // Process next batch if queue has grown
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processBatch(), this.batchDelay);
    }
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
    this.requestQueue = [];
  }
}

export const requestOptimizer = new RequestOptimizer();

// ============================================================================
// CONNECTION POOLING
// ============================================================================

class ConnectionPool {
  private activeConnections = 0;
  private maxConnections = 6; // Browser limit per domain
  private waitQueue: Array<() => void> = [];

  async acquire<T>(operation: () => Promise<T>): Promise<T> {
    // Wait if at connection limit
    if (this.activeConnections >= this.maxConnections) {
      await new Promise<void>(resolve => this.waitQueue.push(resolve));
    }

    this.activeConnections++;
    
    try {
      return await operation();
    } finally {
      this.activeConnections--;
      
      // Release next waiting operation
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }

  getStats() {
    return {
      active: this.activeConnections,
      waiting: this.waitQueue.length,
      utilization: (this.activeConnections / this.maxConnections) * 100,
    };
  }
}

export const connectionPool = new ConnectionPool();

// ============================================================================
// INTELLIGENT PREFETCHING
// ============================================================================

interface PrefetchConfig {
  routes: string[];
  data: Array<() => Promise<any>>;
  priority: 'high' | 'medium' | 'low';
}

class PrefetchManager {
  private prefetchedRoutes = new Set<string>();
  private prefetchedData = new Map<string, any>();

  /**
   * Prefetch route components
   */
  prefetchRoute(route: string) {
    if (this.prefetchedRoutes.has(route)) {
      return Promise.resolve();
    }

    console.log(`🚀 Prefetching route: ${route}`);
    this.prefetchedRoutes.add(route);

    // Prefetch based on route patterns
    const prefetchMap: Record<string, () => Promise<any>> = {
      '/app/dashboard': () => import('../features/premium/Dashboard'),
      '/app/search-rides': () => import('../features/carpooling/SearchRides'),
      '/app/post-ride': () => import('../features/carpooling/PostRide'),
      '/app/messages': () => import('../components/Messages'),
      '/app/profile': () => import('../features/profile/UserProfile'),
    };

    return prefetchMap[route]?.() || Promise.resolve();
  }

  /**
   * Prefetch data for a key
   */
  async prefetchData<T>(key: string, fetchFn: () => Promise<T>): Promise<void> {
    if (this.prefetchedData.has(key)) {
      console.log(`✅ Data already prefetched: ${key}`);
      return;
    }

    try {
      console.log(`🚀 Prefetching data: ${key}`);
      const data = await fetchFn();
      this.prefetchedData.set(key, data);
    } catch (error) {
      console.error(`❌ Prefetch failed for ${key}:`, error);
    }
  }

  /**
   * Get prefetched data
   */
  getCached<T>(key: string): T | null {
    return this.prefetchedData.get(key) || null;
  }

  /**
   * Predictive prefetching based on user behavior
   */
  predictiveLoadNextRoute(currentRoute: string) {
    // Common navigation patterns in carpooling app
    const navigationGraph: Record<string, string[]> = {
      '/': ['/auth', '/app/dashboard'],
      '/auth': ['/app/dashboard'],
      '/app/dashboard': ['/app/search-rides', '/app/post-ride', '/app/messages'],
      '/app/search-rides': ['/app/messages'],
      '/app/post-ride': ['/app/my-trips'],
      '/app/messages': ['/app/profile'],
    };

    const nextRoutes = navigationGraph[currentRoute] || [];
    
    // Prefetch likely next routes with low priority
    requestIdleCallback(() => {
      nextRoutes.forEach(route => this.prefetchRoute(route));
    }, { timeout: 2000 });
  }

  /**
   * Clear all prefetched data
   */
  clear() {
    this.prefetchedRoutes.clear();
    this.prefetchedData.clear();
  }
}

export const prefetchManager = new PrefetchManager();

// ============================================================================
// RESOURCE HINTS
// ============================================================================

export function addResourceHints() {
  const head = document.head;

  // DNS Prefetch for external resources
  const dnsPrefetch = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
  ];

  dnsPrefetch.forEach(url => {
    if (!document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      head.appendChild(link);
    }
  });

  // Preconnect to critical origins
  const preconnect = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnect.forEach(url => {
    if (!document.querySelector(`link[href="${url}"][rel="preconnect"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    }
  });
}

// ============================================================================
// CRITICAL PATH OPTIMIZATION
// ============================================================================

export function optimizeCriticalPath() {
  // Mark critical resources as high priority
  const criticalResources = document.querySelectorAll('link[rel="stylesheet"]');
  criticalResources.forEach((link) => {
    (link as HTMLLinkElement).fetchPriority = 'high';
  });

  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach((script) => {
    if (!(script as HTMLScriptElement).async) {
      (script as HTMLScriptElement).defer = true;
    }
  });
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

export function optimizeImages() {
  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
      }
    );

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// ============================================================================
// MEMORY OPTIMIZATION
// ============================================================================

export function optimizeMemory() {
  // Clear unused cache entries
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old') || name.includes('deprecated')) {
          caches.delete(name);
        }
      });
    });
  }

  // Clear old localStorage entries
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('temp-') || key.includes('cache-')) {
        const timestamp = localStorage.getItem(`${key}-timestamp`);
        if (timestamp && Date.now() - parseInt(timestamp) > 86400000) {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}-timestamp`);
        }
      }
    });
  } catch (error) {
    console.warn('Could not optimize localStorage:', error);
  }
}

// ============================================================================
// NETWORK QUALITY DETECTION
// ============================================================================

type NetworkQuality = 'fast' | 'medium' | 'slow' | 'offline';

class NetworkMonitor {
  private quality: NetworkQuality = 'fast';
  private listeners: Array<(quality: NetworkQuality) => void> = [];

  constructor() {
    this.detectQuality();
    this.setupListeners();
  }

  private detectQuality() {
    // Check if offline
    if (!navigator.onLine) {
      this.quality = 'offline';
      return;
    }

    // Use Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === '4g') {
        this.quality = 'fast';
      } else if (effectiveType === '3g') {
        this.quality = 'medium';
      } else {
        this.quality = 'slow';
      }

      console.log(`📡 Network quality: ${this.quality} (${effectiveType})`);
    }
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.quality = 'fast';
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.quality = 'offline';
      this.notifyListeners();
    });

    // Listen to connection changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.detectQuality();
        this.notifyListeners();
      });
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.quality));
  }

  getQuality(): NetworkQuality {
    return this.quality;
  }

  onQualityChange(callback: (quality: NetworkQuality) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Adjust fetch strategy based on network quality
   */
  getOptimalFetchStrategy() {
    switch (this.quality) {
      case 'fast':
        return {
          timeout: 5000,
          retries: 2,
          cacheFirst: false,
        };
      case 'medium':
        return {
          timeout: 10000,
          retries: 3,
          cacheFirst: true,
        };
      case 'slow':
        return {
          timeout: 15000,
          retries: 4,
          cacheFirst: true,
        };
      case 'offline':
        return {
          timeout: 0,
          retries: 0,
          cacheFirst: true,
        };
    }
  }
}

export const networkMonitor = new NetworkMonitor();

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initPerformanceOptimizer() {
  console.log('🚀 Initializing Ultra-Fast Performance Optimizer...');

  // Add resource hints
  addResourceHints();

  // Optimize critical rendering path
  optimizeCriticalPath();

  // Optimize images
  requestIdleCallback(() => {
    optimizeImages();
  });

  // Optimize memory usage
  requestIdleCallback(() => {
    optimizeMemory();
  }, { timeout: 5000 });

  // Log performance stats
  if (window.performance) {
    requestIdleCallback(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('📊 Performance Stats:', {
          'DNS Lookup': `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
          'TCP Connection': `${navigation.connectEnd - navigation.connectStart}ms`,
          'Request Time': `${navigation.responseEnd - navigation.requestStart}ms`,
          'DOM Load': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
          'Total Load': `${navigation.loadEventEnd - navigation.fetchStart}ms`,
        });
      }
    });
  }

  console.log('✅ Performance Optimizer Active');
}

// Export for React Query integration
export function getOptimizedQueryConfig() {
  const strategy = networkMonitor.getOptimalFetchStrategy();
  
  return {
    staleTime: strategy.cacheFirst ? 5 * 60 * 1000 : 60 * 1000,
    gcTime: strategy.cacheFirst ? 10 * 60 * 1000 : 5 * 60 * 1000,
    retry: strategy.retries,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
    networkMode: strategy.timeout === 0 ? ('offlineFirst' as const) : ('online' as const),
  };
}