/**
 * DriverPage — /app/driver
 * Earnings overview · Demand heatmap · Trip stats
 *
 * Fix: Protected now calls useIframeSafeNavigate so unauthenticated
 * users are actually redirected to /app/auth instead of stuck on
 * the lock screen forever.
 */
import { useEffect, type ReactNode } from 'react';
import { useLocalAuth } from '../../contexts/LocalAuth';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { PAGE_DS } from '../../styles/wasel-page-theme';

const DS = PAGE_DS;
const r = (px = 12) => `${px}px`;

function Protected({ children }: { children: ReactNode }) {
  const { user } = useLocalAuth();
  const navigate = useIframeSafeNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/app/auth?returnTo=/app/driver');
    }
  }, [user, navigate]);

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

const METRICS = [
  { label: "Today's Earnings", val: 'JOD 42', icon: '💰', color: DS.green },
  { label: 'Active Trips',     val: '3',      icon: '🚗', color: DS.cyan  },
  { label: 'Rating',           val: '4.9★',   icon: '⭐', color: DS.gold  },
  { label: 'Total Trips',      val: '127',    icon: '📍', color: DS.blue  },
];

const DEMAND_ZONES = [
  { zone: 'Abdali',      demand: 92, earn: 'JOD 45/hr', surge: '2.5×', color: '#EF4444' },
  { zone: 'Shmeisani',  demand: 65, earn: 'JOD 28/hr', surge: '1.4×', color: DS.gold   },
  { zone: 'Sweifieh',   demand: 38, earn: 'JOD 18/hr', surge: '1.0×', color: DS.green  },
  { zone: '7th Circle', demand: 54, earn: 'JOD 22/hr', surge: '1.2×', color: DS.cyan   },
];

export default function DriverPage() {
  return (
    <Protected>
      <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.F }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 16px' }}>

          {/* Header */}
          <div style={{
            background: DS.gradNav, borderRadius: r(20), padding: '24px',
            marginBottom: 20, border: `1px solid ${DS.blue}18`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: r(16),
                background: `${DS.blue}18`, border: `1.5px solid ${DS.blue}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.9rem',
              }}>
                📊
              </div>
              <div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                  Driver Dashboard
                </h1>
                <p style={{ color: DS.sub, margin: '4px 0 0', fontSize: '0.82rem' }}>
                  Earnings · Trips · Demand Heatmap
                </p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {METRICS.map(m => (
              <div key={m.label} style={{
                background: DS.card, borderRadius: r(16), padding: '20px 18px',
                border: `1px solid ${DS.border}`,
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{m.icon}</div>
                <div style={{ color: m.color, fontWeight: 900, fontSize: '1.5rem' }}>{m.val}</div>
                <div style={{ color: DS.muted, fontSize: '0.75rem', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Demand heatmap */}
          <div style={{
            background: DS.card, borderRadius: r(20), padding: '24px',
            border: `1px solid ${DS.border}`,
          }}>
            <h3 style={{ color: '#fff', fontWeight: 800, margin: '0 0 16px' }}>
              🔥 Demand Heatmap — Amman
            </h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {DEMAND_ZONES.map(z => (
                <div key={z.zone} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: DS.card2, borderRadius: r(12), padding: '14px 18px',
                  border: `1px solid ${DS.border}`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: r(10),
                    background: `${z.color}15`, border: `1.5px solid ${z.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: z.color, fontSize: '0.8rem', flexShrink: 0,
                  }}>
                    {z.demand}%
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{z.zone}</div>
                    <div style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: 6,
                    }}>
                      <div style={{
                        width: `${z.demand}%`, height: '100%',
                        background: `linear-gradient(90deg,${z.color},${z.color}80)`, borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: z.color, fontWeight: 800 }}>{z.earn}</div>
                    <div style={{ color: DS.muted, fontSize: '0.72rem' }}>Surge {z.surge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Protected>
  );
}
