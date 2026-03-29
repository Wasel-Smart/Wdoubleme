/**
 * Observability & Monitoring — Wasel | واصل
 *
 * Tracks key platform health metrics:
 *   • Booking success rate
 *   • Route liquidity (rides available per route)
 *   • API latency (p50, p95, p99)
 *   • Booking failure events (with reason)
 *   • Package match rate (Raje3)
 *   • Platform error rate
 *
 * All events are structured logs emitted to console in development
 * and to a configurable sink (Sentry, Datadog, etc.) in production.
 *
 * Design: zero-overhead when disabled; no external dep required.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type EventCategory =
  | 'booking'       // Trip booking lifecycle
  | 'package'       // Package delivery lifecycle
  | 'payment'       // Payment processing
  | 'auth'          // Authentication events
  | 'route'         // Route intelligence events
  | 'safety'        // Safety / SOS events
  | 'api'           // API request/response
  | 'performance'   // Web vitals, render times
  | 'business';     // Business KPI events

export interface ObservabilityEvent {
  /** Unique event ID (UUID-like) */
  id: string;
  /** ISO timestamp */
  timestamp: string;
  category: EventCategory;
  name: string;
  severity: EventSeverity;
  /** Structured payload */
  data: Record<string, unknown>;
  /** Optional trace ID for request correlation */
  traceId?: string;
  userId?: string;
  country?: string;
  sessionId?: string;
}

export interface ApiLatencyRecord {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  durationMs: number;
  status: number;
  success: boolean;
  traceId: string;
  timestamp: string;
}

export interface BookingEvent {
  bookingId?: string;
  tripId: string;
  passengerId: string;
  seatsRequested: number;
  success: boolean;
  failureReason?: BookingFailureReason;
  durationMs: number;
  country: string;
}

export type BookingFailureReason =
  | 'no_seats_available'
  | 'payment_failed'
  | 'driver_rejected'
  | 'trip_cancelled'
  | 'gender_mismatch'
  | 'price_too_high'
  | 'duplicate_booking'
  | 'session_expired'
  | 'unknown';

export interface RouteLiquiditySnapshot {
  routeId: string;
  country: string;
  availableTrips: number;
  totalSeats: number;
  bookedSeats: number;
  utilizationRate: number;
  capturedAt: string;
}

export interface KpiSnapshot {
  /** ISO timestamp of snapshot */
  capturedAt: string;
  bookingSuccessRate: number;       // 0-1 (target: 0.80)
  packageMatchRate: number;         // 0-1 (target: 0.75)
  averageApiLatencyMs: number;      // target: < 500ms
  p95ApiLatencyMs: number;
  errorRate: number;                // 0-1 (target: < 0.01)
  activeRoutes: number;
  dailyActiveUsers: number;
  ridesPostedToday: number;
  bookingsMadeToday: number;
  packagesSentToday: number;
  revenueJOD: number;
}

// ─── In-memory store (development only) ──────────────────────────────────────

const EVENT_BUFFER_SIZE = 500;
const eventBuffer: ObservabilityEvent[] = [];
const latencyBuffer: ApiLatencyRecord[] = [];

let sessionId: string | undefined;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Core emit ────────────────────────────────────────────────────────────────

/**
 * Emit an observability event.
 * In development: writes to console + in-memory buffer.
 * In production: replace `sinkEvent` with Sentry/Datadog/custom endpoint.
 */
export function emitEvent(
  category: EventCategory,
  name: string,
  data: Record<string, unknown>,
  options: {
    severity?: EventSeverity;
    traceId?: string;
    userId?: string;
    country?: string;
  } = {},
): ObservabilityEvent {
  const event: ObservabilityEvent = {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    category,
    name,
    severity: options.severity ?? 'info',
    data,
    traceId: options.traceId,
    userId: options.userId,
    country: options.country,
    sessionId: getSessionId(),
  };

  // Buffer (ring buffer)
  if (eventBuffer.length >= EVENT_BUFFER_SIZE) {
    eventBuffer.shift();
  }
  eventBuffer.push(event);

  // Console output (structured)
  sinkEvent(event);

  return event;
}

function sinkEvent(event: ObservabilityEvent): void {
  const label = `[wasel:${event.category}:${event.name}]`;
  switch (event.severity) {
    case 'critical':
    case 'error':
      console.error(label, event);
      break;
    case 'warn':
      console.warn(label, event);
      break;
    case 'debug':
      if (process.env.NODE_ENV !== 'production') console.debug(label, event);
      break;
    default:
      console.log(label, event);
  }

  // TODO (production): forward to external sink
  // void sendToDatadog(event);
  // void sendToSentry(event);
}

// ─── Booking Events ───────────────────────────────────────────────────────────

export function trackBookingAttempt(params: BookingEvent): void {
  emitEvent(
    'booking',
    params.success ? 'booking.success' : 'booking.failure',
    {
      bookingId: params.bookingId,
      tripId: params.tripId,
      passengerId: params.passengerId,
      seatsRequested: params.seatsRequested,
      success: params.success,
      failureReason: params.failureReason,
      durationMs: params.durationMs,
      country: params.country,
    },
    {
      severity: params.success ? 'info' : 'warn',
      userId: params.passengerId,
      country: params.country,
    },
  );
}

export function trackBookingFailure(
  tripId: string,
  reason: BookingFailureReason,
  passengerId: string,
  country: string,
): void {
  emitEvent(
    'booking',
    'booking.failure',
    { tripId, reason, passengerId, country },
    { severity: 'warn', userId: passengerId, country },
  );
}

// ─── Package Events ───────────────────────────────────────────────────────────

export function trackPackagePosted(packageId: string, userId: string, country: string): void {
  emitEvent('package', 'package.posted', { packageId, country }, { userId, country });
}

export function trackPackageMatched(packageId: string, tripId: string, country: string): void {
  emitEvent('package', 'package.matched', { packageId, tripId, country }, { country });
}

export function trackPackageDelivered(packageId: string, durationHours: number, country: string): void {
  emitEvent('package', 'package.delivered', { packageId, durationHours, country }, { country });
}

export function trackPackageMatchFailed(packageId: string, reason: string, country: string): void {
  emitEvent('package', 'package.match_failed', { packageId, reason, country }, {
    severity: 'warn', country,
  });
}

// ─── API Latency ──────────────────────────────────────────────────────────────

/**
 * Wrap any async function to track API latency automatically.
 * @example
 * const result = await trackApiCall('/api/trips', 'GET', () => fetchTrips());
 */
export async function trackApiCall<T>(
  endpoint: string,
  method: ApiLatencyRecord['method'],
  fn: () => Promise<T>,
  traceId?: string,
): Promise<T> {
  const start = performance.now();
  let status = 200;
  let success = true;

  try {
    const result = await fn();
    return result;
  } catch (err) {
    status = 500;
    success = false;
    emitEvent('api', 'api.error', { endpoint, method, error: String(err) }, {
      severity: 'error', traceId,
    });
    throw err;
  } finally {
    const durationMs = Math.round(performance.now() - start);
    const record: ApiLatencyRecord = {
      endpoint, method, durationMs, status, success,
      traceId: traceId ?? generateEventId(),
      timestamp: new Date().toISOString(),
    };

    if (latencyBuffer.length >= EVENT_BUFFER_SIZE) latencyBuffer.shift();
    latencyBuffer.push(record);

    if (durationMs > 3000) {
      emitEvent('api', 'api.slow_request', { endpoint, durationMs, method }, {
        severity: 'warn', traceId,
      });
    }
  }
}

// ─── Route Liquidity ──────────────────────────────────────────────────────────

export function trackRouteLiquidity(snapshot: RouteLiquiditySnapshot): void {
  const severity: EventSeverity =
    snapshot.utilizationRate < 0.2 ? 'warn'
    : snapshot.utilizationRate < 0.1 ? 'error'
    : 'info';

  emitEvent(
    'route',
    'route.liquidity_snapshot',
    { ...snapshot },
    { severity, country: snapshot.country },
  );
}

// ─── Payment Events ───────────────────────────────────────────────────────────

export function trackPaymentSuccess(
  bookingId: string,
  amountJOD: number,
  method: string,
  country: string,
): void {
  emitEvent('payment', 'payment.success', { bookingId, amountJOD, method, country }, { country });
}

export function trackPaymentFailure(
  bookingId: string,
  amountJOD: number,
  method: string,
  error: string,
  country: string,
): void {
  emitEvent('payment', 'payment.failure', {
    bookingId, amountJOD, method, error, country,
  }, { severity: 'error', country });
}

// ─── Safety Events ────────────────────────────────────────────────────────────

export function trackSOSActivated(userId: string, tripId: string, country: string): void {
  emitEvent('safety', 'safety.sos_activated', { userId, tripId, country }, {
    severity: 'critical', userId, country,
  });
}

// ─── Performance ──────────────────────────────────────────────────────────────

export function trackWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor'): void {
  emitEvent('performance', `perf.${name.toLowerCase()}`, { name, value, rating }, {
    severity: rating === 'poor' ? 'warn' : 'info',
  });
}

// ─── KPI Aggregation ──────────────────────────────────────────────────────────

/**
 * Calculate a KPI snapshot from the in-memory buffers.
 * In production, query your analytics DB instead.
 */
export function getKpiSnapshot(): Partial<KpiSnapshot> {
  const bookingEvents = eventBuffer.filter(
    (e) => e.category === 'booking' && (e.name === 'booking.success' || e.name === 'booking.failure'),
  );
  const successCount = bookingEvents.filter((e) => e.name === 'booking.success').length;
  const bookingSuccessRate = bookingEvents.length > 0 ? successCount / bookingEvents.length : 0;

  const packageEvents = eventBuffer.filter(
    (e) => e.category === 'package' && (e.name === 'package.matched' || e.name === 'package.match_failed'),
  );
  const matchedCount = packageEvents.filter((e) => e.name === 'package.matched').length;
  const packageMatchRate = packageEvents.length > 0 ? matchedCount / packageEvents.length : 0;

  const latencies = latencyBuffer.map((r) => r.durationMs).sort((a, b) => a - b);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length)
    : 0;
  const p95Latency = latencies.length > 0
    ? latencies[Math.floor(latencies.length * 0.95)] ?? 0
    : 0;

  const errorEvents = eventBuffer.filter((e) => e.severity === 'error' || e.severity === 'critical');
  const errorRate = eventBuffer.length > 0 ? errorEvents.length / eventBuffer.length : 0;

  return {
    capturedAt: new Date().toISOString(),
    bookingSuccessRate: Math.round(bookingSuccessRate * 1000) / 1000,
    packageMatchRate: Math.round(packageMatchRate * 1000) / 1000,
    averageApiLatencyMs: avgLatency,
    p95ApiLatencyMs: p95Latency,
    errorRate: Math.round(errorRate * 1000) / 1000,
  };
}

/** Get recent events (for admin observability dashboard) */
export function getRecentEvents(
  limit = 50,
  category?: EventCategory,
  severity?: EventSeverity,
): ObservabilityEvent[] {
  let events = [...eventBuffer].reverse();
  if (category) events = events.filter((e) => e.category === category);
  if (severity) events = events.filter((e) => e.severity === severity);
  return events.slice(0, limit);
}

/** Get API latency stats */
export function getLatencyStats(): {
  p50: number; p95: number; p99: number; avg: number; count: number;
} {
  const sorted = latencyBuffer.map((r) => r.durationMs).sort((a, b) => a - b);
  if (sorted.length === 0) return { p50: 0, p95: 0, p99: 0, avg: 0, count: 0 };

  const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
  const p50 = sorted[Math.floor(sorted.length * 0.50)] ?? 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;

  return { p50, p95, p99, avg, count: sorted.length };
}
