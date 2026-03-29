/**
 * useGxP — Frontend IT GxP hook
 * Call from any component to log actions, require e-signatures,
 * check compliance status, and file deviations.
 */

import { useCallback } from 'react';
import { useGxPContext, type GxPFrontendEvent } from './GxPContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;
const H   = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

export interface UseGxPReturn {
  // Logging
  log:         (action: string, opts?: { component?: string; metadata?: Record<string, unknown>; category?: GxPFrontendEvent['category'] }) => void;
  logErr:      (error: Error | string, component?: string) => void;
  logNav:      (from: string, to: string) => void;
  logApi:      (method: string, path: string, status: number, ms: number) => void;
  // E-signature
  requireEsig: (action: string, onSign: (sigId: string) => void) => void;
  // Deviation reporting
  fileDeviation: (description: string, severity?: 'minor' | 'major' | 'critical', capa?: string) => Promise<void>;
  // State
  complianceScore:   number | null;
  openDeviations:    number;
  totalAuditEvents:  number;
  lastRefresh:       string | null;
  sessionId:         string;
  // Refresh
  refresh: () => Promise<void>;
}

export function useGxP(): UseGxPReturn {
  const ctx = useGxPContext();

  const fileDeviation = useCallback(async (
    description: string,
    severity: 'minor' | 'major' | 'critical' = 'minor',
    capa?: string,
  ) => {
    try {
      ctx.logAction(`Deviation reported: ${description}`, { category: 'deviation', metadata: { severity, capa } });
      await fetch(`${API}/gxp/deviations`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({
          description,
          severity,
          capa: capa || 'Under investigation',
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          audit_ref: 'frontend',
        }),
      });
    } catch (e) {
      console.error('[GxP] fileDeviation failed:', e);
    }
  }, [ctx]);

  return {
    log:           ctx.logAction,
    logErr:        ctx.logError,
    logNav:        ctx.logNavigation,
    logApi:        ctx.logApiCall,
    requireEsig:   ctx.requireEsig,
    fileDeviation,
    complianceScore:  ctx.complianceScore,
    openDeviations:   ctx.openDeviations,
    totalAuditEvents: ctx.totalAuditEvents,
    lastRefresh:      ctx.lastRefresh,
    sessionId:        ctx.sessionId,
    refresh:          ctx.refreshCompliance,
  };
}
