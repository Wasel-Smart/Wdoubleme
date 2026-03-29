/**
 * GxPContext — Frontend IT GxP Layer
 * Wraps the entire app, capturing all user actions, API calls, and errors
 * for ALCOA+-compliant audit trail and real-time compliance monitoring.
 */

import { createContext, useContext, useEffect, useRef, useCallback, useState, type ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

/* ── Generate a UUID-like session ID ────────────────────────────────────── */
function newSessionId(): string {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/* ── ALCOA+ Frontend Audit Event ────────────────────────────────────────── */
export interface GxPFrontendEvent {
  id:          string;
  session_id:  string;
  ts:          string;            // ISO 8601 — contemporaneous
  user_id:     string | null;     // attributable
  category:    'user_action' | 'api_call' | 'navigation' | 'error' | 'system' | 'esig' | 'deviation';
  action:      string;            // legible
  path:        string;            // original — current route
  component?:  string;            // which component triggered it
  metadata?:   Record<string, unknown>;
  risk_level:  'critical' | 'high' | 'medium' | 'low';
  status:      'success' | 'failure' | 'pending';
  // ALCOA+ hashes for tamper-evidence
  event_hash?: string;
}

/* ── Risk classification for frontend actions ──────────────────────────── */
function classifyFrontendRisk(action: string): 'critical' | 'high' | 'medium' | 'low' {
  const lower = action.toLowerCase();
  if (/payment|pay|checkout|refund|stripe|wallet/.test(lower)) return 'critical';
  if (/sign.*in|login|logout|password|signup|register/.test(lower)) return 'critical';
  if (/esig|electronic.signature/.test(lower)) return 'critical';
  if (/book|cancel|delete|confirm|submit/.test(lower)) return 'high';
  if (/deviation|report|safety|sanad|verify/.test(lower)) return 'high';
  if (/search|filter|navigate|view/.test(lower)) return 'low';
  return 'medium';
}

async function simpleHash(input: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  } catch {
    let h = 5381;
    for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
    return Math.abs(h).toString(16);
  }
}

/* ── Context types ──────────────────────────────────────────────────────── */
export interface GxPContextValue {
  sessionId:         string;
  userId:            string | null;
  setUserId:         (id: string | null) => void;
  // Core logging
  logAction:         (action: string, opts?: { category?: GxPFrontendEvent['category']; component?: string; metadata?: Record<string, unknown>; status?: GxPFrontendEvent['status'] }) => void;
  logError:          (error: Error | string, component?: string) => void;
  logNavigation:     (from: string, to: string) => void;
  logApiCall:        (method: string, path: string, status: number, durationMs: number) => void;
  // Compliance state
  complianceScore:   number | null;
  openDeviations:    number;
  totalAuditEvents:  number;
  lastRefresh:       string | null;
  refreshCompliance: () => Promise<void>;
  // Local event buffer (last 50 events for widget)
  localEvents:       GxPFrontendEvent[];
  // E-signature helper
  pendingEsigAction: string | null;
  requireEsig:       (action: string, onSign: (sigId: string) => void) => void;
  clearEsig:         () => void;
  onEsigCallback:    React.MutableRefObject<((sigId: string) => void) | null>;
}

const GxPContext = createContext<GxPContextValue | null>(null);

export function useGxPContext(): GxPContextValue {
  const ctx = useContext(GxPContext);
  if (!ctx) throw new Error('useGxPContext must be used inside GxPProvider');
  return ctx;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  GxPProvider                                                                */
/* ══════════════════════════════════════════════════════════════════════════ */
export function GxPProvider({ children }: { children: ReactNode }) {
  const sessionId = useRef(newSessionId()).current;
  const [userId, setUserId] = useState<string | null>(null);

  // Compliance state from backend
  const [complianceScore, setComplianceScore] = useState<number | null>(null);
  const [openDeviations,  setOpenDeviations]  = useState(0);
  const [totalAuditEvents, setTotalAuditEvents] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  // Local event buffer (last 50)
  const [localEvents, setLocalEvents] = useState<GxPFrontendEvent[]>([]);
  const eventQueue = useRef<GxPFrontendEvent[]>([]);
  const flushTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true); // guard all async ops after unmount

  // E-signature state
  const [pendingEsigAction, setPendingEsigAction] = useState<string | null>(null);
  const onEsigCallback = useRef<((sigId: string) => void) | null>(null);

  /* ── Core event logger ─────────────────────────────────────────────────── */
  const logAction = useCallback(async (
    action: string,
    opts: {
      category?: GxPFrontendEvent['category'];
      component?: string;
      metadata?: Record<string, unknown>;
      status?: GxPFrontendEvent['status'];
    } = {}
  ) => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const ts   = new Date().toISOString();
    const id   = `fe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

    const event: GxPFrontendEvent = {
      id,
      session_id: sessionId,
      ts,
      user_id:    userId,
      category:   opts.category || 'user_action',
      action,
      path,
      component:  opts.component,
      metadata:   opts.metadata,
      risk_level: classifyFrontendRisk(action),
      status:     opts.status || 'success',
    };

    // Compute ALCOA+ event hash
    event.event_hash = await simpleHash(`${id}|${ts}|${userId}|${action}`);

    // Add to local buffer (keep last 50)
    setLocalEvents(prev => [event, ...prev].slice(0, 50));
    eventQueue.current.push(event);
  }, [sessionId, userId]);

  const logError = useCallback((error: Error | string, component?: string) => {
    const msg = error instanceof Error ? error.message : error;
    logAction(`Error: ${msg}`, { category: 'error', component, status: 'failure', metadata: {
      stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined,
    }});
  }, [logAction]);

  const logNavigation = useCallback((from: string, to: string) => {
    logAction(`Navigate ${from} → ${to}`, { category: 'navigation', metadata: { from, to } });
  }, [logAction]);

  const logApiCall = useCallback((method: string, path: string, status: number, durationMs: number) => {
    logAction(`API ${method} ${path} → ${status}`, {
      category: 'api_call',
      status: status < 400 ? 'success' : 'failure',
      metadata: { method, path, status, durationMs },
    });
  }, [logAction]);

  /* ── Flush event queue to backend every 15 seconds ──────────────────────── */
  const flushEvents = useCallback(() => {
    if (!mountedRef.current) return;
    const batch = eventQueue.current.splice(0);
    if (batch.length === 0) return;
    // Only flush critical/high risk events to avoid noise
    const criticals = batch.filter(e => e.risk_level === 'critical' || e.risk_level === 'high');
    for (const evt of criticals) {
      // Fire-and-forget — never await, never throw into the iframe message loop
      fetch(`${API}/core-hub/audit-log`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json', 'X-Session-ID': sessionId },
        body: JSON.stringify({
          event:  `[FE] ${evt.action}`,
          user:   evt.user_id || 'anonymous',
          color:  evt.risk_level === 'critical' ? '#EF4444' : '#F0A830',
          meta:   { session: sessionId, path: evt.path, component: evt.component, hash: evt.event_hash },
        }),
        // Short timeout so it doesn't hang on unmount
        signal: AbortSignal.timeout?.(5000),
      }).catch(() => { /* intentionally swallowed — non-critical telemetry */ });
    }
  }, [sessionId]);

  /* ── Refresh compliance score ──────────────────────────────────────────── */
  const refreshCompliance = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const res  = await fetch(`${API}/gxp/compliance-score`, {
        headers: { Authorization: `Bearer ${publicAnonKey}`, 'X-Session-ID': sessionId },
        signal: AbortSignal.timeout?.(8000),
      });
      if (!res.ok || !mountedRef.current) return;
      const data = await res.json();
      if (!mountedRef.current) return;
      setComplianceScore(data.overall_score ?? null);
      setOpenDeviations(data.counters?.open_deviations ?? 0);
      setTotalAuditEvents(data.counters?.total_audit_records ?? 0);
      setLastRefresh(new Date().toISOString());
    } catch { /* silent — fetch aborted or network error */ }
  }, [sessionId]);

  /* ── E-signature flow ──────────────────────────────────────────────────── */
  const requireEsig = useCallback((action: string, onSign: (sigId: string) => void) => {
    onEsigCallback.current = onSign;
    setPendingEsigAction(action);
    logAction(`E-signature required: ${action}`, { category: 'esig', risk_level: 'critical' } as any);
  }, [logAction]);

  const clearEsig = useCallback(() => {
    setPendingEsigAction(null);
    onEsigCallback.current = null;
  }, []);

  /* ── Lifecycle ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    logAction('GxP session started', { category: 'system' });

    // Delay initial compliance fetch slightly so the app renders first
    const initTimer = setTimeout(() => refreshCompliance(), 2000);

    flushTimer.current = setInterval(() => {
      flushEvents();
    }, 30_000); // relaxed to 30s — less pressure on message port

    // Compliance refresh every 90s — less frequent to reduce load
    const complianceTimer = setInterval(() => {
      if (mountedRef.current) refreshCompliance();
    }, 90_000);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      if (flushTimer.current) clearInterval(flushTimer.current);
      clearInterval(complianceTimer);
      // Do NOT flush on unmount — the message port may already be destroyed
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Intercept unhandled errors globally — but SKIP Figma iframe internal errors
  useEffect(() => {
    const IFRAME_ERRORS = ['IframeMessageAbortError', 'message port was destroyed', 'Message aborted'];

    const isIframeInternalError = (msg: string): boolean =>
      IFRAME_ERRORS.some(e => msg?.includes(e));

    const handler = (e: ErrorEvent) => {
      const msg = e.error?.message || e.message || '';
      if (isIframeInternalError(msg)) return; // skip — Figma internal, not our error
      logError(e.error || msg, 'window');
    };

    const rejHandler = (e: PromiseRejectionEvent) => {
      const msg = String(e.reason?.message || e.reason || '');
      if (isIframeInternalError(msg)) return; // skip — Figma internal
      logError(msg, 'promise');
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejHandler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejHandler);
    };
  }, [logError]);

  return (
    <GxPContext.Provider value={{
      sessionId,
      userId, setUserId,
      logAction, logError, logNavigation, logApiCall,
      complianceScore, openDeviations, totalAuditEvents, lastRefresh,
      refreshCompliance,
      localEvents,
      pendingEsigAction, requireEsig, clearEsig, onEsigCallback,
    }}>
      {children}
    </GxPContext.Provider>
  );
}