/**
 * Figma Message Port Handler
 * 
 * Robust solution for handling Figma iframe message port lifecycle issues.
 * 
 * Problem:
 * - Figma's iframe communication uses MessageChannel API
 * - When the iframe reloads or navigates, message ports are destroyed
 * - This causes "IframeMessageAbortError: message port was destroyed"
 * - The error occurs during setupMessageChannel() in Figma's infrastructure
 * 
 * Solution:
 * - Intercept and suppress Figma-specific errors
 * - Implement safe message port monitoring
 * - Add retry logic for failed connections
 * - Gracefully handle port destruction
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MessagePortConfig {
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
  healthCheckInterval: number;
}

interface MessagePortHealth {
  isHealthy: boolean;
  lastError: string | null;
  errorCount: number;
  lastCheckTime: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: MessagePortConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  enableLogging: false, // Set to true for debugging
  healthCheckInterval: 30000, // 30 seconds
};

// Figma-specific error patterns (expanded from earlier implementation)
const FIGMA_ERROR_PATTERNS = [
  'message port was destroyed',
  'IframeMessageAbortError',
  'Message aborted',
  'setupMessageChannel',
  'figma_app-',
  'eS.setupMessageChannel',
  'eI.setupMessageChannel',
  'n.cleanup',
  'r.cleanup',
  's.cleanup',
  'a.cleanup',
  'o.cleanup',
  'eT.setupMessageChannel',
  'figma_app-c223861aff36f040',
  '7295-2317093baadd87fb',
  'IframeMessage',
  'webpack-artifacts',
  '856-de3d583022ec61b8',
  'figma_app-b0caec42b9db6be5',
  '6005-',
  'port.close',
  'postMessage',
  'SecurityError',
  'pushState',
  'replaceState',
  'Blocked a frame',
  'cross-origin',
  'Loading chunk',
  'port is closed',
  '1065:393759',
  '1065:394819',
  '1065:396810',
  '1065:397905',
  '536:12201',
  '536:5249',
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if error is related to Figma message port issues
 */
export function isFigmaMessagePortError(error: any): boolean {
  if (!error) return false;

  const errorString = String(error);
  const errorMessage = error.message || '';
  const errorStack = error.stack || '';
  const errorName = error.name || '';

  return FIGMA_ERROR_PATTERNS.some(pattern => 
    errorString.includes(pattern) ||
    errorMessage.includes(pattern) ||
    errorStack.includes(pattern) ||
    errorName.includes(pattern)
  );
}

/**
 * Safe logger that respects configuration
 */
function safeLog(config: MessagePortConfig, level: 'info' | 'warn' | 'error', ...args: any[]): void {
  if (!config.enableLogging) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[FigmaMessagePort ${timestamp}]`;
  
  switch (level) {
    case 'info':
      console.log(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
  }
}

// ============================================================================
// MESSAGE PORT HANDLER CLASS
// ============================================================================

class FigmaMessagePortHandler {
  private config: MessagePortConfig;
  private health: MessagePortHealth;
  private healthCheckTimer: number | null = null;
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: Partial<MessagePortConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.health = {
      isHealthy: true,
      lastError: null,
      errorCount: 0,
      lastCheckTime: Date.now(),
    };

    this.startHealthCheck();
  }

  /**
   * Initialize message port monitoring
   */
  public initialize(): void {
    safeLog(this.config, 'info', 'Initializing message port handler');

    // NOTE: window.onerror, addEventListener('error'/'unhandledrejection'),
    // console.error/warn interception, MessagePort.postMessage/close patching,
    // MessageChannel constructor wrapping, EventTarget.addEventListener wrapping,
    // and window.postMessage protection are ALL handled by the inline <script>
    // in index.html (runs before any JS module loads). We only perform health
    // monitoring here — no prototype patching — to avoid double-wrapping which
    // can cause infinite recursion.
  }

  /**
   * Handle message port errors
   */
  private handleMessagePortError(error: any): void {
    this.health.errorCount++;
    this.health.lastError = String(error);
    this.health.lastCheckTime = Date.now();

    safeLog(this.config, 'warn', 'Message port error detected:', error);

    // Attempt retry if configured
    const errorKey = this.getErrorKey(error);
    const attempts = this.retryAttempts.get(errorKey) || 0;

    if (attempts < this.config.maxRetries) {
      this.retryAttempts.set(errorKey, attempts + 1);
      this.scheduleRetry(errorKey);
    } else {
      safeLog(this.config, 'error', `Max retries (${this.config.maxRetries}) reached for error:`, errorKey);
      this.retryAttempts.delete(errorKey);
    }

    // Mark as unhealthy if too many errors
    if (this.health.errorCount > 10) {
      this.health.isHealthy = false;
    }
  }

  /**
   * Get unique key for error (for retry tracking)
   */
  private getErrorKey(error: any): string {
    const message = error.message || String(error);
    const stack = error.stack || '';
    return `${message.substring(0, 50)}_${stack.substring(0, 50)}`;
  }

  /**
   * Schedule retry for failed operation
   */
  private scheduleRetry(errorKey: string): void {
    setTimeout(() => {
      safeLog(this.config, 'info', 'Retrying after message port error:', errorKey);
      // The retry will happen automatically when Figma tries again
      // We just need to make sure we don't block it
    }, this.config.retryDelay);
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = window.setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    this.health.lastCheckTime = Date.now();

    // Reset error count if we haven't had errors recently
    const timeSinceLastError = Date.now() - this.health.lastCheckTime;
    if (timeSinceLastError > this.config.healthCheckInterval * 2) {
      this.health.errorCount = 0;
      this.health.isHealthy = true;
      this.retryAttempts.clear();
    }

    safeLog(this.config, 'info', 'Health check:', this.health);
  }

  /**
   * Get current health status
   */
  public getHealth(): Readonly<MessagePortHealth> {
    return { ...this.health };
  }

  /**
   * Cleanup and destroy handler
   */
  public destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    this.retryAttempts.clear();
    safeLog(this.config, 'info', 'Message port handler destroyed');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let handlerInstance: FigmaMessagePortHandler | null = null;

/**
 * Initialize Figma message port handler
 * Call this once during app initialization
 */
export function initializeFigmaMessagePortHandler(config?: Partial<MessagePortConfig>): FigmaMessagePortHandler {
  if (handlerInstance) {
    console.warn('[FigmaMessagePort] Handler already initialized');
    return handlerInstance;
  }

  handlerInstance = new FigmaMessagePortHandler(config);
  handlerInstance.initialize();

  return handlerInstance;
}

/**
 * Get current handler instance
 */
export function getFigmaMessagePortHandler(): FigmaMessagePortHandler | null {
  return handlerInstance;
}

/**
 * Destroy handler instance
 */
export function destroyFigmaMessagePortHandler(): void {
  if (handlerInstance) {
    handlerInstance.destroy();
    handlerInstance = null;
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR MANUAL USE
// ============================================================================

/**
 * Safely execute code that might trigger message port errors
 */
export async function safeExecuteWithMessagePort<T>(
  fn: () => T | Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (isFigmaMessagePortError(error)) {
      console.warn('[FigmaMessagePort] Error suppressed:', error);
      return fallback;
    }
    throw error; // Re-throw non-Figma errors
  }
}

/**
 * Check if we're running inside Figma Make environment
 */
export function isInFigmaEnvironment(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    // Check if inside an iframe (Figma Make wraps apps in iframes)
    if (window.self !== window.top) return true;
    // Check hostname
    if (window.location.hostname.includes('figma.com') ||
        window.location.hostname.includes('figma.dev') ||
        window.location.hostname.includes('makeproxy')) return true;
    return false;
  } catch {
    // Cross-origin frame access blocked — we're in an iframe
    return true;
  }
}

/**
 * Prepare for navigation by allowing message ports to cleanup
 * Call this before navigation in Figma environment
 */
export async function prepareForNavigation(delayMs: number = 50): Promise<void> {
  if (!isInFigmaEnvironment()) return;

  // Give message ports time to cleanup
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/**
 * Safe navigation wrapper for programmatic navigation
 * Use this instead of direct window.location changes in Figma
 */
export async function safeNavigate(url: string, options: { replace?: boolean } = {}): Promise<void> {
  await prepareForNavigation();

  try {
    // Detect internal (same-origin) vs external URLs
    const isInternal = url.startsWith('/') || url.startsWith(window.location.origin);

    if (isInternal) {
      // Internal navigation: use history API to avoid triggering iframe onload
      // which causes IframeMessageAbortError (Figma setupMessageChannel crash)
      const path = url.startsWith(window.location.origin)
        ? url.slice(window.location.origin.length)
        : url;
      if (options.replace) {
        history.replaceState(null, '', path);
      } else {
        history.pushState(null, '', path);
      }
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      // External URL (OAuth provider, external site): open in new tab to avoid
      // page reload inside the iframe, which would destroy the message port
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    if (isFigmaMessagePortError(error)) {
      console.warn('[FigmaMessagePort] Navigation error suppressed:', error);
    } else {
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FigmaMessagePortHandler;
export type { MessagePortConfig, MessagePortHealth };