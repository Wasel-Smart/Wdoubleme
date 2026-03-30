/**
 * WaselPlusPage — extracted from WaselServicePage.tsx
 * Premium membership · 10% off rides · Priority booking
 */
import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLocalAuth } from '../../contexts/LocalAuth';
import { PAGE_DS } from '../../styles/wasel-page-theme';

const DS = PAGE_DS;
const r = (px = 12) => `${px}px`;

function Protected({ children }: { children: ReactNode }) {
  const { user } = useLocalAuth();
  if (!user) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, background: DS.bg }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <div style={{ color: DS.sub, fontFamily: DS.F }}>Redirecting to sign in…</div>
    </div>
  );
  return <>{children}</>;
}

const PLUS_FEATURES = [
  { emoji: '💸', title: '10% Off All Rides',     desc: 'Automatic discount on every booking'   },
  { emoji: '⚡', title: 'Priority Booking',       desc: 'First access to limited seats'         },
  { emoji: '📦', title: 'Free Package Insurance', desc: 'Up to JOD 50 per package'              },
  { emoji: '🕌', title: 'Premium Cultural',       desc: 'Advanced prayer stop planning'         },
];

export default function WaselPlusPage() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <Protected>
      <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.F }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 16px' }}>
          {/* Header */}
          <div style={{ background: DS.gradNav, borderRadius: r(20), padding: '24px', marginBottom: 20, border: `1px solid ${DS.gold}18` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: r(16), background: `${DS.gold}18`, border: `1.5px solid ${DS.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem' }}>
                💎
              </div>
              <div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#fff', margin: 0 }}>Wasel Plus</h1>
                <p style={{ color: DS.sub, margin: '4px 0 0', fontSize: '0.82rem' }}>10% off all rides · Priority booking · Exclusive perks</p>
              </div>
            </div>
          </div>

          {subscribed ? (
            <div style={{ background: DS.card, borderRadius: r(20), padding: '60px 28px', textAlign: 'center', border: `1px solid ${DS.gold}25` }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>👑</div>
              <h2 style={{ color: DS.gold, fontWeight: 900, fontSize: '1.5rem', margin: '0 0 8px' }}>You're a Plus Member!</h2>
              <p style={{ color: DS.sub }}>Enjoy 10% off every ride and priority booking.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {PLUS_FEATURES.map(f => (
                <div key={f.title} style={{ background: DS.card, borderRadius: r(18), padding: '22px 20px', border: `1px solid ${DS.border}` }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{f.emoji}</div>
                  <h4 style={{ color: '#fff', fontWeight: 800, margin: '0 0 6px' }}>{f.title}</h4>
                  <p style={{ color: DS.sub, fontSize: '0.8rem', margin: 0 }}>{f.desc}</p>
                </div>
              ))}
              {/* Pricing card */}
              <div style={{ gridColumn: '1/-1', background: 'linear-gradient(135deg,#2a1a00,#3d2a00)', borderRadius: r(18), padding: '28px 28px', border: `1px solid ${DS.gold}30`, textAlign: 'center' }}>
                <div style={{ color: DS.gold, fontWeight: 900, fontSize: '2rem', marginBottom: 4 }}>
                  12.99 JOD <span style={{ fontSize: '1rem' }}>/month</span>
                </div>
                <div style={{ color: 'rgba(240,168,48,0.6)', fontSize: '0.82rem', marginBottom: 20 }}>Cancel anytime</div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSubscribed(true)}
                  style={{ width: '100%', height: 52, borderRadius: '99px', border: 'none', background: DS.gradGold, color: '#fff', fontWeight: 800, fontFamily: DS.F, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 8px 24px ${DS.gold}40` }}
                >
                  👑 Subscribe to Plus
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
