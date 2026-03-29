/**
 * Advanced Analytics Service
 * Event tracking, funnel analysis, and custom dashboards
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  timestamp: number;
  properties: Record<string, any>;
  page_url: string;
  user_agent: string;
}

export interface FunnelStep {
  name: string;
  event_name: string;
  users: number;
  conversion_rate: number;
}

export interface CohortData {
  cohort_date: string;
  users: number;
  retention: Record<string, number>; // day_0, day_1, day_7, day_30
}

class AnalyticsService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    // startAutoFlush is intentionally NOT called here.
    // Call analyticsService.init() from inside a React useEffect to avoid
    // module-level setInterval / window.addEventListener which race against
    // Figma's iframe message-port handshake (IframeMessageAbortError).
  }

  /**
   * Initialise — call once from a React useEffect after mount
   */
  init(): void {
    if (this.flushInterval) return; // already initialised
    this.startAutoFlush();
  }

  /**
   * Track custom event
   */
  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      event_name: eventName,
      session_id: this.sessionId,
      timestamp: Date.now(),
      properties,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    this.queue.push(event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(eventName)) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  pageView(pageName?: string): void {
    this.track('page_view', {
      page_name: pageName || document.title,
      referrer: document.referrer,
    });
  }

  /**
   * Track user action
   */
  action(actionName: string, properties: Record<string, any> = {}): void {
    this.track('user_action', {
      action: actionName,
      ...properties,
    });
  }

  /**
   * Track booking funnel
   */
  bookingFunnel(step: string, properties: Record<string, any> = {}): void {
    this.track('booking_funnel', {
      step,
      ...properties,
    });
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(
    steps: string[],
    startDate: Date,
    endDate: Date
  ): Promise<FunnelStep[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/funnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          steps,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch funnel');

      const data = await response.json();
      return data.funnel || [];
    } catch (error) {
      console.error('[Analytics] Funnel error:', error);
      return [];
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(
    startDate: Date,
    endDate: Date
  ): Promise<CohortData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics/cohort?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch cohort');

      const data = await response.json();
      return data.cohorts || [];
    } catch (error) {
      console.error('[Analytics] Cohort error:', error);
      return [];
    }
  }

  /**
   * Export analytics data
   */
  async exportData(
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics/export?start=${startDate.toISOString()}&end=${endDate.toISOString()}&format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to export');

      return await response.blob();
    } catch (error) {
      console.error('[Analytics] Export error:', error);
      throw error;
    }
  }

  /**
   * Flush events to server
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch(`${this.baseUrl}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('[Analytics] Flush error:', error);
      // Re-queue failed events
      this.queue.push(...events);
    }
  }

  /**
   * Start auto-flush
   */
  private startAutoFlush(): void {
    if (typeof window === 'undefined') return;
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30_000); // 30 s (was 10 s — less pressure on Figma iframe)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    }, { passive: true });
  }

  /**
   * Stop auto-flush
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if event is critical
   */
  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'booking_completed',
      'payment_failed',
      'trip_cancelled',
      'emergency_sos',
    ];
    return criticalEvents.includes(eventName);
  }
}

// Lazy singleton — not constructed until first call, keeping module-level clean
let _analyticsInstance: AnalyticsService | null = null;
export const analyticsService = {
  get instance(): AnalyticsService {
    if (!_analyticsInstance) _analyticsInstance = new AnalyticsService();
    return _analyticsInstance;
  },
  track(eventName: string, properties?: Record<string, any>) {
    try { this.instance.track(eventName, properties ?? {}); } catch { /* silent */ }
  },
  init() {
    try { this.instance.init(); } catch { /* silent */ }
  },
  stop() {
    try { this.instance.stop(); } catch { /* silent */ }
  },
};