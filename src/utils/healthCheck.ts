/**
 * Health Check Utility
 * Monitors backend connectivity and system health
 */

import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    backend: boolean;
    auth: boolean;
    database: boolean;
  };
  latency: {
    backend?: number;
    auth?: number;
  };
  errors: string[];
}

/**
 * Performs a comprehensive health check of the system
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const checks = {
    backend: false,
    auth: false,
    database: false,
  };
  const latency: { backend?: number; auth?: number } = {};

  // Check backend health endpoint
  try {
    const backendStart = Date.now();
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/health`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    latency.backend = Date.now() - backendStart;

    if (response.ok) {
      checks.backend = true;
    } else {
      errors.push(`Backend returned status ${response.status}`);
    }
  } catch (error) {
    errors.push(`Backend health check failed: ${error}`);
  }

  // Check Supabase auth
  if (supabase) {
    try {
      const authStart = Date.now();
      const { error } = await supabase.auth.getSession();
      latency.auth = Date.now() - authStart;

      if (!error) {
        checks.auth = true;
      } else {
        errors.push(`Auth check failed: ${error.message}`);
      }
    } catch (error) {
      errors.push(`Auth system error: ${error}`);
    }
  } else {
    errors.push('Supabase client not configured');
  }

  // Database is considered healthy if backend health check passes
  checks.database = checks.backend;

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (checks.backend && checks.auth) {
    status = 'healthy';
  } else if (checks.backend || checks.auth) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    latency,
    errors,
  };
}

/**
 * Quick check if backend is reachable
 */
export async function isBackendHealthy(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/health`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: AbortSignal.timeout(3000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Monitors backend health at regular intervals
 */
export class HealthMonitor {
  private intervalId: number | null = null;
  private listeners: Array<(result: HealthCheckResult) => void> = [];

  constructor(private intervalMs: number = 60000) {} // Default: 1 minute

  start() {
    if (this.intervalId !== null) {
      return; // Already running
    }

    // Initial check
    this.check();

    // Set up interval
    this.intervalId = window.setInterval(() => {
      this.check();
    }, this.intervalMs);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async check() {
    const result = await performHealthCheck();
    this.notifyListeners(result);
  }

  subscribe(listener: (result: HealthCheckResult) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(result: HealthCheckResult) {
    this.listeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in health check listener:', error);
      }
    });
  }
}

/**
 * Get system status badge color
 */
export function getStatusBadgeColor(status: HealthCheckResult['status']): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'unhealthy':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Format latency for display
 */
export function formatLatency(ms?: number): string {
  if (ms === undefined) return 'N/A';
  if (ms < 100) return `${ms}ms (Excellent)`;
  if (ms < 500) return `${ms}ms (Good)`;
  if (ms < 1000) return `${ms}ms (Fair)`;
  return `${ms}ms (Slow)`;
}