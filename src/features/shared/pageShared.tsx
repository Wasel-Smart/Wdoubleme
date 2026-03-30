/**
 * Shared primitives for all Wasel service pages.
 *
 * Extracted from the monolithic WaselServicePage.tsx so that
 * FindRidePage, OfferRidePage, BusPage, and PackagesPage can each
 * live in their own file without duplicating DS bindings, city
 * data, storage helpers, or the Protected / PageShell wrappers.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useLocalAuth } from '../../contexts/LocalAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { PAGE_DS } from '../../styles/wasel-page-theme';

// ── Design-system shorthand ───────────────────────────────────────────────────
export const DS = PAGE_DS;

export const r = (px = 12) => `${px}px`;

export const pill = (color: string) => ({
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: 4,
  padding: '3px 10px',
  borderRadius: '99px',
  background: `${color}15`,
  border: `1px solid ${color}30`,
  fontSize: '0.66rem',
  fontWeight: 700,
  color,
});

// ── Jordan city coordinates ───────────────────────────────────────────────────
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Amman:      { lat: 31.9539, lng: 35.9106 },
  Aqaba:      { lat: 29.5321, lng: 35.0060 },
  Irbid:      { lat: 32.5568, lng: 35.8479 },
  Zarqa:      { lat: 32.0728, lng: 36.0880 },
  'Dead Sea': { lat: 31.5590, lng: 35.4732 },
  Karak:      { lat: 31.1854, lng: 35.7048 },
  Madaba:     { lat: 31.7196, lng: 35.7939 },
  Petra:      { lat: 30.3285, lng: 35.4444 },
  Jerash:     { lat: 32.2744, lng: 35.8961 },
  Mafraq:     { lat: 32.3429, lng: 36.2080 },
};

export const CITIES = [
  'Amman','Aqaba','Irbid','Zarqa','Dead Sea',
  'Karak','Madaba','Petra','Jerash','Mafraq','Salt',
];

export function resolveCityCoord(city: string) {
  return CITY_COORDS[city] ?? CITY_COORDS.Amman;
}

export function midpoint(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

// ── localStorage helpers ──────────────────────────────────────────────────────
export function readStoredStringList(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function writeStoredStringList(key: string, values: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(values));
}

export function readStoredObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

// ── Auth guard ────────────────────────────────────────────────────────────────
export function Protected({ children }: { children: ReactNode }) {
  const { user } = useLocalAuth();
  const nav = useIframeSafeNavigate();
  const location = useLocation();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!user && mountedRef.current) {
      nav(`/app/auth?returnTo=${encodeURIComponent(location.pathname)}`);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 16, background: DS.bg,
      }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <div style={{ color: DS.sub, fontFamily: DS.F }}>Redirecting to sign in…</div>
      </div>
    );
  }
  return <>{children}</>;
}

// ── Page shell (responsive layout wrapper) ────────────────────────────────────
export function PageShell({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div style={{
      minHeight: '100vh', background: DS.bg,
      fontFamily: DS.F, direction: ar ? 'rtl' : 'ltr',
    }}>
      <style>{`
        :root { color-scheme: dark; }
        .w-focus:focus-visible{ outline:none; box-shadow:0 0 0 3px rgba(0,200,232,0.28); }
        .w-focus-gold:focus-visible{ outline:none; box-shadow:0 0 0 3px rgba(240,168,48,0.28); }
        @media(max-width:899px){
          .sp-inner{ padding:16px !important; }
          .sp-2col { grid-template-columns:1fr !important; }
          .sp-3col { grid-template-columns:1fr !important; }
          .sp-4col { grid-template-columns:1fr 1fr !important; }
          .sp-head  { padding:20px 16px !important; border-radius:16px !important; }
          .sp-search-grid { grid-template-columns:1fr !important; gap:10px !important; }
          .sp-sort-bar { overflow-x:auto !important; -webkit-overflow-scrolling:touch !important; padding-bottom:6px !important; flex-wrap:nowrap !important; scrollbar-width:none !important; }
          .sp-sort-bar::-webkit-scrollbar { display:none; }
          .sp-sort-btn { flex-shrink:0 !important; white-space:nowrap !important; }
          .sp-results-header { flex-direction:column !important; align-items:flex-start !important; gap:12px !important; }
          .sp-book-btn { min-height:44px !important; }
          .sp-ride-card-body { padding:16px !important; }
        }
        @media(max-width:480px){
          .sp-4col { grid-template-columns:1fr !important; }
          .sp-head-inner { flex-direction:column !important; gap:12px !important; align-items:flex-start !important; }
          .sp-head-btn { width:100% !important; display:flex !important; justify-content:center !important; }
          .sp-inner { padding:12px !important; }
        }
      `}</style>
      <div className="sp-inner" style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 16px' }}>
        {children}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHead({
  emoji, title, titleAr, sub, color = DS.cyan, action,
}: {
  emoji: string; title: string; titleAr?: string; sub?: string; color?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="sp-head" style={{
      background: DS.gradNav, borderRadius: r(20), padding: '24px 24px',
      marginBottom: 20, position: 'relative', overflow: 'hidden',
      border: `1px solid ${color}18`, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 55% 80% at 12% 50%,${color}12,transparent)`,
        pointerEvents: 'none',
      }} />
      <div className="sp-head-inner" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: r(16),
            background: `${color}18`, border: `1.5px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.9rem', flexShrink: 0,
          }}>
            {emoji}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#fff', margin: 0 }}>{title}</h1>
            </div>
            {titleAr && (
              <p dir="rtl" style={{
                fontSize: '0.9rem', fontWeight: 700, color, margin: '0 0 2px',
                fontFamily: "'Cairo',sans-serif",
              }}>{titleAr}</p>
            )}
            {sub && <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{sub}</p>}
          </div>
        </div>
        {action && (
          <button onClick={action.onClick} className="sp-head-btn" style={{
            height: 44, padding: '0 22px', borderRadius: '99px', border: 'none',
            background: DS.gradC, color: '#fff', fontWeight: 700, fontSize: '0.875rem',
            boxShadow: `0 4px 16px ${DS.cyan}30`, cursor: 'pointer', flexShrink: 0,
          }}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Core experience banner ────────────────────────────────────────────────────
export function CoreExperienceBanner({
  title, detail, tone = DS.cyan,
}: {
  title: string; detail: string; tone?: string;
}) {
  return (
    <div style={{
      display: 'grid', gap: 14,
      gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.8fr)',
      background: `linear-gradient(135deg, ${tone}10, rgba(255,255,255,0.02))`,
      border: `1px solid ${tone}28`, borderRadius: r(18),
      padding: '18px 20px', marginBottom: 18,
    }}>
      <div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem', marginBottom: 6 }}>{title}</div>
        <div style={{ color: DS.sub, fontSize: '0.84rem', lineHeight: 1.6 }}>{detail}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
        {[
          { label: 'Verified identity', color: DS.green },
          { label: 'Live route network', color: DS.cyan },
          { label: 'Package-ready corridors', color: DS.gold },
        ].map((item) => (
          <span key={item.label} style={pill(item.color)}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
