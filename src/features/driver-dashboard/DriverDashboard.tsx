/**
 * Wasel Driver Dashboard v5.0
 * Cosmic dark theme · Premium earnings hub · Real-time AI insights
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DemandHeatmap } from './DemandHeatmap';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ── Design tokens ─────────────────────────────────────────────────────────
const BG   = '#040C18';
const CARD = 'rgba(255,255,255,0.04)';
const CARD_HOVER = 'rgba(255,255,255,0.07)';
const BORDER = 'rgba(0,200,232,0.14)';
const BORDER_GOLD = 'rgba(240,168,48,0.25)';
const CYAN  = '#00C8E8';
const GOLD  = '#F0A830';
const GREEN = '#00C875';
const RED   = '#FF4455';
const TEXT  = '#EFF6FF';
const MUTED = 'rgba(148,163,184,0.75)';
const GRAD_CYAN = 'linear-gradient(135deg,#00C8E8,#2060E8)';
const GRAD_GOLD = 'linear-gradient(135deg,#F0A830,#FF9500)';
const GRAD_GREEN = 'linear-gradient(135deg,#00C875,#0EA5E9)';
const F = "-apple-system,BlinkMacSystemFont,'Inter','Cairo',sans-serif";

function darkCard(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    ...extra,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────
interface EarningsData {
  today: number; thisWeek: number; thisMonth: number;
  avgPerTrip: number; avgPerHour: number; totalTrips: number;
  topEarningHours: string[];
  predictions: { todayTarget: number; weekTarget: number; monthTarget: number };
}
interface Incentive {
  id: string; type: string; title: string; titleAr: string;
  description: string; descriptionAr: string;
  reward: number; progress: number; target: number; expiresAt: string;
}
interface Opportunity {
  route: string; expectedEarnings: string; passengersWaiting: number;
  incentive: string | null; recommendation: string; peakHours: string[];
}
interface DriverDashboardProps { driverId: string }

// ── Ring chart ────────────────────────────────────────────────────────────
function RingProgress({ pct, color, size = 64, stroke = 6 }: {
  pct: number; color: string; size?: number; stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fill={color}
        style={{ fontSize: size * 0.2, fontWeight: 800, fontFamily: F }}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────
function StatCard({ label, labelAr, value, sub, color, icon, pct }: {
  label: string; labelAr: string; value: string; sub: string;
  color: string; icon: string; pct?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...darkCard({ padding: '20px 20px 18px' }),
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: `${color}10`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`,
          border: `1px solid ${color}30`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.2rem' }}>{icon}</div>
        {pct !== undefined && <RingProgress pct={pct} color={color} size={52} stroke={5} />}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: TEXT, fontFamily: F,
        letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: MUTED, fontFamily: F, marginTop: 4 }}>{sub}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: color, fontFamily: F,
        marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div dir="rtl" style={{ fontSize: '0.65rem', color: MUTED, fontFamily: "'Cairo',sans-serif", marginTop: 1 }}>{labelAr}</div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export function DriverDashboard({ driverId }: DriverDashboardProps) {
  const nav = useIframeSafeNavigate();
  const [tab, setTab] = useState<'overview' | 'heatmap' | 'opportunities' | 'incentives'>('overview');
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Mock data — replace with real API
      await new Promise(r => setTimeout(r, 600));
      if (!mountedRef.current) return;
      setEarnings({
        today: 65, thisWeek: 320, thisMonth: 1250,
        avgPerTrip: 6.95, avgPerHour: 22.5, totalTrips: 180,
        topEarningHours: ['Fri 6-9 PM', 'Sat 8-11 AM', 'Thu 5-8 PM'],
        predictions: { todayTarget: 80, weekTarget: 400, monthTarget: 1500 },
      });
      setOpportunities([
        { route: 'Abdali → Airport', expectedEarnings: 'JOD 22-28', passengersWaiting: 8,
          incentive: '1.8× surge', recommendation: 'High demand now', peakHours: ['Now', '6 PM'] },
        { route: 'Amman → Dead Sea', expectedEarnings: 'JOD 35-45', passengersWaiting: 4,
          incentive: 'Package bonus', recommendation: 'Bring a package for +JOD 5', peakHours: ['10 AM', '2 PM'] },
        { route: 'Shmeisani → Swefieh', expectedEarnings: 'JOD 8-12', passengersWaiting: 12,
          incentive: null, recommendation: 'Quick 15-min trip', peakHours: ['Rush hour'] },
        { route: 'Amman → Aqaba', expectedEarnings: 'JOD 55-70', passengersWaiting: 6,
          incentive: 'Guaranteed JOD 30', recommendation: 'Fri morning guaranteed earnings', peakHours: ['Fri 7 AM'] },
      ]);
      setIncentives([
        { id: '1', type: 'referral', title: 'Referral Bonus', titleAr: 'مكافأة الإحالة',
          description: 'Refer 3 drivers → earn JOD 30', descriptionAr: 'ادعُ 3 سائقين واكسب 30 دينار',
          reward: 30, progress: 1, target: 3, expiresAt: '2026-03-31' },
        { id: '2', type: 'weekend_guarantee', title: 'Weekend Guarantee', titleAr: 'ضمان الويكاند',
          description: '15 trips Fri-Sun → guaranteed JOD 200', descriptionAr: '15 رحلة الجمعة-الأحد = 200 دينار مضمونة',
          reward: 200, progress: 7, target: 15, expiresAt: '2026-03-16' },
        { id: '3', type: 'milestone', title: 'Monthly Milestone', titleAr: 'إنجاز الشهر',
          description: 'Reach 200 trips this month', descriptionAr: 'أكمل 200 رحلة هذا الشهر',
          reward: 50, progress: 180, target: 200, expiresAt: '2026-03-31' },
      ]);
      setLoading(false);
    };
    load();
  }, [driverId]);

  const TABS = [
    { key: 'overview', label: 'Overview', ar: 'نظرة عامة', icon: '📊' },
    { key: 'heatmap', label: 'Demand Map', ar: 'خريطة الطلب', icon: '🔥' },
    { key: 'opportunities', label: 'Opportunities', ar: 'الفرص', icon: '⚡' },
    { key: 'incentives', label: 'Incentives', ar: 'الحوافز', icon: '🏆' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, paddingBottom: 48 }}>
      <style>{`
        @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slide-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .drv-tab:hover { background: rgba(0,200,232,0.08) !important; }
        .opp-card:hover { border-color: rgba(0,200,232,0.28) !important; background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(0,200,232,0.08) 0%,rgba(4,12,24,0) 60%)',
        borderBottom: `1px solid ${BORDER}`,
        padding: '28px 24px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: GRAD_CYAN,
                  boxShadow: `0 0 0 3px rgba(0,200,232,0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 900, color: '#040C18', letterSpacing: '-0.02em',
                }}>AH</div>
                {/* Online dot */}
                <div style={{
                  position: 'absolute', bottom: 1, right: 1,
                  width: 13, height: 13, borderRadius: '50%',
                  background: online ? GREEN : '#666',
                  border: `2px solid ${BG}`,
                  animation: online ? 'pulse-ring 2s infinite' : 'none',
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em' }}>Ahmad Hassan</span>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                    background: 'rgba(0,200,117,0.15)', color: GREEN, border: '1px solid rgba(0,200,117,0.3)',
                    letterSpacing: '0.08em',
                  }}>✓ VERIFIED</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⭐ 4.92</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>180 trips</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ color: online ? GREEN : '#888' }}>{online ? '🟢 Online' : '⚫ Offline'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Online toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: MUTED }}>Available</span>
                <button
                  onClick={() => setOnline(o => !o)}
                  style={{
                    width: 48, height: 26, borderRadius: 99, padding: 3,
                    background: online ? GRAD_GREEN : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${online ? GREEN + '50' : BORDER}`,
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    transform: online ? 'translateX(22px)' : 'translateX(0)',
                    transition: 'transform 0.2s',
                  }} />
                </button>
              </div>
              <button
                onClick={() => nav('/app/offer-ride')}
                style={{
                  height: 38, padding: '0 20px', borderRadius: 99,
                  background: GRAD_CYAN, border: 'none', color: '#040C18',
                  fontWeight: 800, fontSize: '0.82rem', fontFamily: F, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,200,232,0.25)',
                }}
              >+ Post Ride</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="drv-tab"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: '10px 10px 0 0',
                  background: tab === t.key ? 'rgba(0,200,232,0.10)' : 'transparent',
                  border: tab === t.key ? `1px solid ${BORDER}` : '1px solid transparent',
                  borderBottom: tab === t.key ? `1px solid ${BG}` : '1px solid transparent',
                  color: tab === t.key ? CYAN : MUTED,
                  fontWeight: tab === t.key ? 700 : 500,
                  fontSize: '0.82rem', fontFamily: F, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        <AnimatePresence mode="wait">

          {/* OVERVIEW */}
          {tab === 'overview' && earnings && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Earnings hero strip */}
              <div style={{
                background: 'linear-gradient(135deg,rgba(0,200,232,0.07),rgba(32,96,232,0.07))',
                border: `1px solid ${BORDER}`,
                borderRadius: 20, padding: '24px 28px', marginBottom: 24,
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0,
                  background: 'radial-gradient(ellipse 60% 100% at 0% 50%,rgba(0,200,232,0.06),transparent)',
                  pointerEvents: 'none' }} />
                {[
                  { label: 'Today', labelAr: 'اليوم', value: earnings.today, target: earnings.predictions.todayTarget, color: CYAN, grad: GRAD_CYAN, icon: '⚡' },
                  { label: 'This Week', labelAr: 'هذا الأسبوع', value: earnings.thisWeek, target: earnings.predictions.weekTarget, color: GOLD, grad: GRAD_GOLD, icon: '📅' },
                  { label: 'This Month', labelAr: 'هذا الشهر', value: earnings.thisMonth, target: earnings.predictions.monthTarget, color: GREEN, grad: GRAD_GREEN, icon: '📈' },
                ].map((e, i) => (
                  <div key={e.label} style={{
                    padding: '0 28px', borderRight: i < 2 ? `1px solid ${BORDER}` : 'none',
                    position: 'relative', zIndex: 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: '1rem' }}>{e.icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED,
                        textTransform: 'uppercase', letterSpacing: '0.08em' }}>{e.label}</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: TEXT,
                      letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                      JOD <span style={{ color: e.color }}>{e.value}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }} dir="rtl">
                      {e.labelAr}
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        background: e.grad,
                        width: `${Math.min((e.value / e.target) * 100, 100)}%`,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 4 }}>
                      {Math.round((e.value / e.target) * 100)}% of JOD {e.target} target
                    </div>
                  </div>
                ))}
              </div>

              {/* Stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Trips" labelAr="إجمالي الرحلات" value={String(earnings.totalTrips)}
                  sub="All time" color={CYAN} icon="🚗" />
                <StatCard label="Avg / Trip" labelAr="معدل لكل رحلة" value={`JOD ${earnings.avgPerTrip}`}
                  sub="Gross earnings" color={GOLD} icon="💰" />
                <StatCard label="Avg / Hour" labelAr="معدل لكل ساعة" value={`JOD ${earnings.avgPerHour}`}
                  sub="Active hours" color={GREEN} icon="⏱️" />
                <StatCard label="Rating" labelAr="التقييم" value="4.92 ★"
                  sub="Last 90 days" color="#FFD700" icon="⭐" pct={98} />
              </div>

              {/* Top hours + quick actions row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Peak hours */}
                <div style={darkCard({ padding: '22px 24px' })}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: CYAN,
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                    🔥 Peak Earning Windows
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {earnings.topEarningHours.map((h, i) => (
                      <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: i === 0 ? GRAD_GOLD : CARD_HOVER,
                          border: `1px solid ${i === 0 ? GOLD + '40' : BORDER}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 900, color: i === 0 ? GOLD : MUTED,
                        }}>#{i + 1}</div>
                        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: TEXT }}>{h}</span>
                        <span style={{ fontSize: '0.7rem', color: i === 0 ? GOLD : MUTED }}>
                          {i === 0 ? 'Best' : i === 1 ? 'High' : 'Good'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(0,200,232,0.06)', border: `1px solid rgba(0,200,232,0.15)` }}>
                    <div style={{ fontSize: '0.72rem', color: MUTED }}>AI Recommendation</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: TEXT, marginTop: 2 }}>
                      Drive to Abdali <span style={{ color: CYAN }}>tonight 6-9 PM</span> — predicted JOD 45/hr
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={darkCard({ padding: '22px 24px' })}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: CYAN,
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                    Quick Actions
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Post a Ride', labelAr: 'أضف رحلة', icon: '➕', color: CYAN, path: '/app/offer-ride' },
                      { label: 'View Map', labelAr: 'خريطة الطلب', icon: '🗺️', color: GOLD, action: () => setTab('heatmap') },
                      { label: 'My Earnings', labelAr: 'أرباحي', icon: '💳', color: GREEN, path: '/app/dashboard' },
                      { label: 'Get Support', labelAr: 'الدعم', icon: '🛡️', color: '#8B5CF6', path: '/app/safety' },
                    ].map(a => (
                      <button key={a.label}
                        onClick={() => a.action ? a.action() : nav(a.path!)}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 8, padding: '14px',
                          borderRadius: 12, background: `${a.color}0A`,
                          border: `1px solid ${a.color}22`,
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}15`; (e.currentTarget as HTMLElement).style.borderColor = `${a.color}35`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}0A`; (e.currentTarget as HTMLElement).style.borderColor = `${a.color}22`; }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{a.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT }}>{a.label}</div>
                          <div dir="rtl" style={{ fontSize: '0.65rem', color: MUTED, fontFamily: "'Cairo',sans-serif" }}>{a.labelAr}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* HEATMAP */}
          {tab === 'heatmap' && (
            <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DemandHeatmap />
            </motion.div>
          )}

          {/* OPPORTUNITIES */}
          {tab === 'opportunities' && (
            <motion.div key="opportunities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* AI insight banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px', borderRadius: 14,
                background: 'rgba(0,200,232,0.06)', border: `1px solid ${BORDER}`,
                marginBottom: 20,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: GRAD_CYAN,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 700, color: TEXT, fontSize: '0.875rem' }}>
                    AI-Powered Opportunity Engine
                  </div>
                  <div style={{ fontSize: '0.72rem', color: MUTED }}>
                    Real-time demand signals · Updated every 5 minutes · Based on current supply/demand ratios
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.7rem', color: GREEN, fontWeight: 700 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN,
                    animation: 'pulse-ring 1.5s infinite' }} />
                  LIVE
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {opportunities.map((opp, i) => (
                  <motion.div
                    key={opp.route}
                    className="opp-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={darkCard({ padding: '20px', cursor: 'pointer', transition: 'all 0.15s' })}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: TEXT, marginBottom: 3 }}>{opp.route}</div>
                        <div style={{ fontSize: '0.72rem', color: MUTED }}>{opp.recommendation}</div>
                      </div>
                      {opp.incentive && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: 99,
                          background: 'rgba(240,168,48,0.15)', color: GOLD, border: `1px solid rgba(240,168,48,0.3)`,
                          whiteSpace: 'nowrap' }}>
                          {opp.incentive}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.03)',
                      borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}`, marginBottom: 14 }}>
                      <div style={{ flex: 1, padding: '10px 14px', borderRight: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: GREEN }}>{opp.expectedEarnings}</div>
                        <div style={{ fontSize: '0.6rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expected</div>
                      </div>
                      <div style={{ flex: 1, padding: '10px 14px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: CYAN }}>{opp.passengersWaiting}</div>
                        <div style={{ fontSize: '0.6rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Waiting</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {opp.peakHours.map(h => (
                        <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                          borderRadius: 99, background: 'rgba(0,200,232,0.08)', color: CYAN,
                          border: `1px solid rgba(0,200,232,0.18)` }}>⏰ {h}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => nav('/app/offer-ride')}
                      style={{ marginTop: 14, width: '100%', height: 36, borderRadius: 10,
                        background: GRAD_CYAN, border: 'none', color: '#040C18',
                        fontWeight: 800, fontSize: '0.78rem', fontFamily: F, cursor: 'pointer',
                      }}
                    >Go to this route →</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* INCENTIVES */}
          {tab === 'incentives' && (
            <motion.div key="incentives" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {incentives.map((inc, i) => {
                  const pct = Math.round((inc.progress / inc.target) * 100);
                  const colors = [GOLD, CYAN, GREEN];
                  const grads = [GRAD_GOLD, GRAD_CYAN, GRAD_GREEN];
                  const color = colors[i % colors.length];
                  const grad  = grads[i % grads.length];
                  return (
                    <motion.div
                      key={inc.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={darkCard({ padding: '22px 24px', position: 'relative', overflow: 'hidden' })}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: grad, borderRadius: '16px 0 0 16px' }} />
                      <div style={{ paddingLeft: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12,
                              background: `${color}18`, border: `1px solid ${color}30`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                              {inc.type === 'referral' ? '👥' : inc.type === 'weekend_guarantee' ? '🛡️' : '🏆'}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: TEXT }}>{inc.title}</div>
                              <div dir="rtl" style={{ fontSize: '0.78rem', fontWeight: 600, color: MUTED, fontFamily: "'Cairo',sans-serif" }}>{inc.titleAr}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: color }}>JOD {inc.reward}</div>
                            <div style={{ fontSize: '0.62rem', color: MUTED }}>Reward</div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: TEXT, marginBottom: 4 }}>{inc.description}</div>
                        <div dir="rtl" style={{ fontSize: '0.75rem', color: MUTED, fontFamily: "'Cairo',sans-serif", marginBottom: 16 }}>{inc.descriptionAr}</div>

                        {/* Progress */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.72rem', color: MUTED }}>{inc.progress} / {inc.target} completed</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: color }}>{pct}%</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 99, background: grad,
                            width: `${pct}%`, transition: 'width 0.8s ease',
                            boxShadow: `0 0 8px ${color}60`,
                          }} />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 6 }}>
                          Expires {new Date(inc.expiresAt).toLocaleDateString('en-JO', { day:'numeric', month:'short', year:'numeric' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty slot CTA */}
                <div style={darkCard({
                  padding: '24px', textAlign: 'center',
                  background: 'linear-gradient(135deg,rgba(0,200,232,0.04),rgba(32,96,232,0.04))',
                })}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</div>
                  <div style={{ fontWeight: 700, color: TEXT, marginBottom: 4 }}>Unlock More Incentives</div>
                  <div style={{ fontSize: '0.78rem', color: MUTED, marginBottom: 16 }}>
                    Complete 20 more trips this week to unlock the Gold Driver tier — earns an extra JOD 80/month guaranteed.
                  </div>
                  <button style={{
                    height: 38, padding: '0 24px', borderRadius: 99,
                    background: GRAD_CYAN, border: 'none', color: '#040C18',
                    fontWeight: 800, fontSize: '0.82rem', fontFamily: F, cursor: 'pointer',
                  }}>Explore Bonuses →</button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: `3px solid rgba(0,200,232,0.2)`,
                borderTopColor: CYAN,
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }} />
              <div style={{ fontSize: '0.82rem', color: MUTED }}>جاري تحميل لوحة التحكم…</div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
