import { useEffect, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';
import { CurrencyService } from '../utils/currency';
import {
  buildInnovationSnapshot,
  getJordanLaunchRoutes,
  type InnovationSnapshot,
} from '../services/innovationNetwork';

const BG = '#040C18';
const CARD = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(0,200,232,0.14)';
const CYAN = '#00C8E8';
const GOLD = '#F0A830';
const GREEN = '#00C875';
const PURPLE = '#8B5CF6';
const RED = '#FF4455';
const TEXT = '#EFF6FF';
const MUTED = 'rgba(148,163,184,0.75)';
const GRAD = 'linear-gradient(135deg,#00C8E8,#2060E8)';
const F = "-apple-system,BlinkMacSystemFont,'Inter','Cairo',sans-serif";

function dc(extra: CSSProperties = {}): CSSProperties {
  return { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, ...extra };
}

function pill(label: string, color: string) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    color,
    fontSize: '0.66rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  };
}

export default function WaselInnovationHub() {
  const nav = useIframeSafeNavigate();
  const [snapshot, setSnapshot] = useState<InnovationSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const currency = CurrencyService.getInstance();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const next = await buildInnovationSnapshot();
        if (active) setSnapshot(next);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const launchRoutes = getJordanLaunchRoutes().slice(0, 4);

  if (loading || !snapshot) {
    return (
      <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading connected innovation layer...
      </div>
    );
  }

  const bestPassenger = snapshot.passengerMatches[0];
  const bestPackage = snapshot.packageMatches[0];
  const bestSeatYield = snapshot.seatYield[snapshot.seatYield.length - 1];
  const bestBusinessSeat = snapshot.businessSeatYield[snapshot.businessSeatYield.length - 1];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, paddingBottom: 56 }}>
      <style>{`
        @media(max-width:899px){
          .innovation-grid-4 { grid-template-columns:1fr 1fr !important; }
          .innovation-grid-3 { grid-template-columns:1fr !important; }
          .innovation-grid-2 { grid-template-columns:1fr !important; }
          .innovation-shell { padding:20px 12px 0 !important; }
          .innovation-cta { flex-direction:column !important; }
        }
      `}</style>

      <div className="innovation-shell" style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 18px 0' }}>
        <button
          onClick={() => nav('/dashboard')}
          style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontFamily: F, fontSize: '0.8rem', padding: 0, marginBottom: 16 }}
        >
          ← Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...dc({
              padding: '30px 28px',
              marginBottom: 20,
              background: 'linear-gradient(135deg,rgba(0,200,232,0.12) 0%, rgba(11,29,69,0.28) 50%, rgba(240,168,48,0.08) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }),
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 30%, rgba(0,200,232,0.10), transparent 40%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ ...pill('Middle East First', GOLD), marginBottom: 14 }}>Middle East First</div>
            <h1 style={{ fontSize: '1.9rem', lineHeight: 1.05, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: '0 0 10px' }}>
              Wasel Innovation Hub
            </h1>
            <p style={{ maxWidth: 760, color: MUTED, fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              {snapshot.firstMoverClaim}. This layer fuses route intelligence, return matching, package tracking, seat yield,
              business accounts, and school transport into one corridor-based operating model for Jordan now and the wider region next.
            </p>

            <div className="innovation-cta" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                onClick={() => nav('/app/innovation-hub')}
                style={{ height: 44, padding: '0 18px', borderRadius: 999, border: 'none', background: GRAD, color: '#040C18', fontWeight: 800, cursor: 'pointer', fontFamily: F }}
              >
                Open Intelligence
              </button>
              <button
                onClick={() => nav('/app/services/corporate')}
                style={{ height: 44, padding: '0 18px', borderRadius: 999, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.05)', color: TEXT, fontWeight: 700, cursor: 'pointer', fontFamily: F }}
              >
                Corporate Mobility
              </button>
              <button
                onClick={() => nav('/app/services/school')}
                style={{ height: 44, padding: '0 18px', borderRadius: 999, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.05)', color: TEXT, fontWeight: 700, cursor: 'pointer', fontFamily: F }}
              >
                School Transport
              </button>
            </div>
          </div>
        </motion.div>

        <div className="innovation-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Active launch regions', value: String(snapshot.activeRegionCount), tone: CYAN },
            { label: 'Best passenger score', value: `${bestPassenger?.score.overall ?? 0}/100`, tone: GREEN },
            { label: 'Package escrow state', value: snapshot.packageOps.escrow.heldInEscrow ? 'Protected' : 'Released', tone: GOLD },
            { label: 'Top seat yield', value: currency.formatFromJOD(bestSeatYield?.price ?? 0), tone: PURPLE },
          ].map((stat) => (
            <div key={stat.label} style={{ ...dc({ padding: '18px 16px' }) }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.tone }}>{stat.value}</div>
              <div style={{ fontSize: '0.68rem', color: MUTED, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="innovation-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18, marginBottom: 20 }}>
          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('Route Intelligence Core', CYAN), marginBottom: 14 }}>Route Intelligence Core</div>
            <h2 style={{ fontSize: '1.1rem', color: TEXT, margin: '0 0 10px', fontWeight: 800 }}>
              Corridor decisions powered by passenger fit, package fit, and liquidity
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ ...dc({ padding: '16px', background: 'rgba(0,200,117,0.06)' }) }}>
                <div style={{ fontSize: '0.72rem', color: GREEN, fontWeight: 800, marginBottom: 6 }}>Top passenger corridor</div>
                <div style={{ fontSize: '0.96rem', color: TEXT, fontWeight: 800 }}>
                  {bestPassenger.trip.originCity} to {bestPassenger.trip.destinationCity}
                </div>
                <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: 6 }}>
                  {bestPassenger.score.reasons.join(' • ')}
                </div>
              </div>
              <div style={{ ...dc({ padding: '16px', background: 'rgba(240,168,48,0.06)' }) }}>
                <div style={{ fontSize: '0.72rem', color: GOLD, fontWeight: 800, marginBottom: 6 }}>Best package lane</div>
                <div style={{ fontSize: '0.96rem', color: TEXT, fontWeight: 800 }}>
                  {bestPackage.trip.originCity} to {bestPackage.trip.destinationCity}
                </div>
                <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: 6 }}>
                  Score {bestPackage.result.score}/100 • Delivery before deadline • Package-enabled traveler
                </div>
              </div>
              <div style={{ ...dc({ padding: '16px' }) }}>
                <div style={{ fontSize: '0.72rem', color: CYAN, fontWeight: 800, marginBottom: 8 }}>Prayer-aware long-haul scheduling</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {snapshot.prayerStops.map((stop) => (
                    <span key={stop.name} style={pill(stop.name, CYAN)}>
                      {stop.name} +{stop.waitMinutes}m
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('Liquidity Board', GREEN), marginBottom: 14 }}>Liquidity Board</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {snapshot.corridors.map((corridor) => (
                <div key={corridor.routeId} style={{ ...dc({ padding: '14px 16px', background: 'rgba(255,255,255,0.03)' }) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', color: TEXT, fontWeight: 800 }}>{corridor.title}</div>
                      <div dir="rtl" style={{ fontSize: '0.68rem', color: MUTED, fontFamily: "'Cairo',sans-serif" }}>{corridor.titleAr}</div>
                    </div>
                    <span style={pill(corridor.status, corridor.status === 'critical' ? RED : corridor.status === 'oversupply' ? PURPLE : GREEN)}>
                      {corridor.healthScore}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
                    Business: {corridor.businessUseCase}
                    <br />
                    School: {corridor.schoolUseCase}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="innovation-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 20 }}>
          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('Return + Package Layer', GOLD), marginBottom: 14 }}>Return + Package Layer</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT, marginBottom: 10 }}>Secure attached logistics</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ ...dc({ padding: '14px 16px' }) }}>
                <div style={{ fontSize: '0.68rem', color: GOLD, fontWeight: 800 }}>Tracking code</div>
                <div style={{ fontSize: '0.82rem', color: TEXT, marginTop: 4 }}>{snapshot.packageOps.tracking.trackingCode}</div>
              </div>
              <div style={{ ...dc({ padding: '14px 16px' }) }}>
                <div style={{ fontSize: '0.68rem', color: GREEN, fontWeight: 800 }}>Escrow protection</div>
                <div style={{ fontSize: '0.82rem', color: TEXT, marginTop: 4 }}>
                  {snapshot.packageOps.escrow.heldInEscrow ? 'Held until verified delivery' : 'Ready for release'}
                </div>
              </div>
              <div style={{ ...dc({ padding: '14px 16px' }) }}>
                <div style={{ fontSize: '0.68rem', color: CYAN, fontWeight: 800 }}>Return promise</div>
                <div style={{ fontSize: '0.82rem', color: TEXT, marginTop: 4 }}>
                  Insured {currency.formatFromJOD(snapshot.packageOps.insuredValueJOD)} • {snapshot.packageOps.returnWindowHours}h return window
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('SeatPricing Engine', PURPLE), marginBottom: 14 }}>SeatPricing Engine</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT, marginBottom: 10 }}>Every seat becomes smarter inventory</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {snapshot.seatYield.map((seat) => (
                <div key={seat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.76rem', color: TEXT }}>{seat.label}</span>
                  <span style={{ fontSize: '0.76rem', color: CYAN, fontWeight: 800 }}>
                    {currency.formatFromJOD(seat.price)} • {seat.savings}% saved
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('Business + School', CYAN), marginBottom: 14 }}>Business + School</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT, marginBottom: 10 }}>Recurring revenue from repeat corridors</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ ...dc({ padding: '14px 16px' }) }}>
                <div style={{ fontSize: '0.68rem', color: CYAN, fontWeight: 800 }}>Corporate lane yield</div>
                <div style={{ fontSize: '0.82rem', color: TEXT, marginTop: 4 }}>
                  Up to {currency.formatFromJOD(bestBusinessSeat?.price ?? 0)} per seat across managed commuter accounts
                </div>
              </div>
              <div style={{ ...dc({ padding: '14px 16px' }) }}>
                <div style={{ fontSize: '0.68rem', color: GOLD, fontWeight: 800 }}>School subscription</div>
                <div style={{ fontSize: '0.82rem', color: TEXT, marginTop: 4 }}>
                  Standard {currency.formatFromJOD(snapshot.schoolPricing.standard)} • Premium {currency.formatFromJOD(snapshot.schoolPricing.premium)}
                </div>
              </div>
              <div style={{ ...dc({ padding: '14px 16px' }) }}>
                <div style={{ fontSize: '0.68rem', color: GREEN, fontWeight: 800 }}>Connected promise</div>
                <div style={{ fontSize: '0.82rem', color: TEXT, marginTop: 4 }}>
                  One corridor can sell seats, trunk capacity, returns, subscriptions, and verified transport
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="innovation-grid-2" style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 18, marginBottom: 20 }}>
          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('Jordan Launch Stack', CYAN), marginBottom: 14 }}>Jordan Launch Stack</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {launchRoutes.map((route) => (
                <div key={route.id} style={{ ...dc({ padding: '14px 16px' }) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 800 }}>{route.from} to {route.to}</div>
                      <div dir="rtl" style={{ fontSize: '0.68rem', color: MUTED, fontFamily: "'Cairo',sans-serif" }}>{route.fromAr} إلى {route.toAr}</div>
                    </div>
                    <span style={pill(route.packageEnabled ? 'package ready' : 'ride only', route.packageEnabled ? GREEN : MUTED)}>
                      {route.distanceKm} km
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: MUTED, marginTop: 8 }}>{route.useCase}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...dc({ padding: '20px' }) }}>
            <div style={{ ...pill('Why This Is Different', GOLD), marginBottom: 14 }}>Why This Is Different</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                'Route intelligence decides where seats, packages, and recurring contracts should be activated first.',
                'Return matching lets e-commerce reverse logistics travel on existing passenger movement instead of separate courier networks.',
                'Package tracking and escrow add trust, verification, and insured commerce to every qualifying trip.',
                'SeatPricing turns occupancy into a controlled yield engine instead of one flat ride fare.',
                'Business accounts and school transport add predictable monthly revenue on the same corridor graph.',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: GOLD, fontWeight: 900 }}>+</span>
                  <span style={{ color: TEXT, fontSize: '0.78rem', lineHeight: 1.7 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
