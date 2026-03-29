/**
 * Live Trip Tracker — Supabase Realtime
 * Real SVG Jordan map + broadcast channel position updates
 * GxP-compliant: mountedRef guards on all async
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../utils/supabase/backend-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Design tokens ───────────────────────────────────────────────────────────
const BG     = '#040C18';
const CARD   = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(0,200,232,0.14)';
const CYAN   = '#00C8E8';
const GOLD   = '#F0A830';
const GREEN  = '#00C875';
const TEXT   = '#EFF6FF';
const MUTED  = 'rgba(148,163,184,0.75)';
const F      = "-apple-system,BlinkMacSystemFont,'Inter','Cairo',sans-serif";

// ── SVG map waypoints (canvas 280×360) ─────────────────────────────────────
const AQABA_ROUTE = [
  { x: 160, y: 75,  label: 'Amman',  labelAr: 'عمان',    km: 0   },
  { x: 143, y: 140, label: 'Madaba', labelAr: 'مادبا',   km: 30  },
  { x: 130, y: 195, label: 'Karak',  labelAr: 'الكرك',   km: 125 },
  { x: 108, y: 255, label: 'Petra',  labelAr: 'البتراء', km: 215 },
  { x: 98,  y: 300, label: "Ma'an",  labelAr: 'معان',    km: 270 },
  { x: 82,  y: 345, label: 'Aqaba',  labelAr: 'العقبة',  km: 330 },
];

const SECONDARY_ROUTES = [
  { from: { x: 160, y: 75 }, to: { x: 138, y: 20 }, label: 'Irbid' },
  { from: { x: 160, y: 75 }, to: { x: 72,  y: 100 }, label: 'Dead Sea' },
  { from: { x: 160, y: 75 }, to: { x: 210, y: 65 }, label: 'Zarqa' },
];

// ── Math helpers ─────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function interpolateRoute(waypoints: { x: number; y: number }[], progress: number) {
  const segs = waypoints.slice(1).map((wp, i) => {
    const p = waypoints[i];
    return Math.hypot(wp.x - p.x, wp.y - p.y);
  });
  const total = segs.reduce((a, b) => a + b, 0);
  let rem = Math.max(0, Math.min(1, progress)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (rem <= segs[i]) {
      const t = segs[i] === 0 ? 0 : rem / segs[i];
      return { x: lerp(waypoints[i].x, waypoints[i + 1].x, t), y: lerp(waypoints[i].y, waypoints[i + 1].y, t) };
    }
    rem -= segs[i];
  }
  return waypoints[waypoints.length - 1];
}

function getKmAtProgress(progress: number) {
  return Math.round(progress * 330);
}

// Wall-clock synced progress so all viewers see same position (90s cycle demo)
function getSyncedProgress() {
  const CYCLE_MS = 90_000;
  const OFFSET   = 25_000; // start 25s in so it's not always at Amman
  return ((Date.now() + OFFSET) % CYCLE_MS) / CYCLE_MS;
}

interface LivePos {
  progress: number;
  speed: number;
  timestamp: string;
}

export function LiveTripTracker() {
  const mountedRef = useRef(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const broadcastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [progress, setProgress] = useState(getSyncedProgress());
  const [speed, setSpeed] = useState(92);
  const [connected, setConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState('');
  const [pulse, setPulse] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Derived values
  const driverPos = interpolateRoute(AQABA_ROUTE, progress);
  const kmTravelled = getKmAtProgress(progress);
  const kmRemaining = 330 - kmTravelled;
  const etaMin = Math.round((kmRemaining / Math.max(speed, 1)) * 60);
  const etaH = Math.floor(etaMin / 60);
  const etaM = etaMin % 60;

  // Find current segment for "next stop" label
  const currentCity = AQABA_ROUTE.findIndex(wp => wp.km > kmTravelled);
  const nextStop = currentCity >= 0 ? AQABA_ROUTE[currentCity] : AQABA_ROUTE[AQABA_ROUTE.length - 1];

  // Broadcast + subscribe via Supabase Realtime
  useEffect(() => {
    mountedRef.current = true;

    const channel = supabase
      .channel('live-trip-amman-aqaba-demo')
      .on('broadcast', { event: 'driver-position' }, ({ payload }: { payload: LivePos }) => {
        if (!mountedRef.current) return;
        setProgress(payload.progress);
        setSpeed(payload.speed);
        setLastSeen(new Date(payload.timestamp).toLocaleTimeString('en-JO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      })
      .subscribe(async (status) => {
        if (!mountedRef.current) return;
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          startBroadcasting(channel);
        }
      });

    channelRef.current = channel;

    // Pulse every second
    const pulseTimer = setInterval(() => {
      if (!mountedRef.current) return;
      setPulse(p => !p);
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(pulseTimer);
      if (broadcastTimerRef.current) clearInterval(broadcastTimerRef.current);
      if (animTimerRef.current)    clearInterval(animTimerRef.current);
      if (channelRef.current)      supabase.removeChannel(channelRef.current);
    };
  }, []);

  function startBroadcasting(ch: RealtimeChannel) {
    // Broadcast to Supabase every 2 seconds
    const bcast = async () => {
      if (!mountedRef.current) return;
      const p = getSyncedProgress();
      const spd = 85 + Math.random() * 20;
      try {
        await ch.send({
          type: 'broadcast',
          event: 'driver-position',
          payload: { progress: p, speed: parseFloat(spd.toFixed(1)), timestamp: new Date().toISOString() } as LivePos,
        });
      } catch { /* silent fail */ }
    };

    bcast();
    broadcastTimerRef.current = setInterval(bcast, 2000);

    // Local smooth animation at 500ms
    animTimerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      setProgress(getSyncedProgress());
      setSpeed(85 + Math.random() * 20);
    }, 500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg,rgba(0,200,232,0.06) 0%,rgba(4,12,24,0.98) 60%)',
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        overflow: 'hidden',
        fontFamily: F,
        position: 'relative',
      }}
    >
      {/* Glow backdrop */}
      <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 120,
        borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,200,232,0.08),transparent)', pointerEvents: 'none' }} />

      {/* ── Header bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
        borderBottom: `1px solid ${BORDER}`, background: 'rgba(0,200,232,0.04)',
      }}>
        {/* Live pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 99, background: 'rgba(0,200,117,0.12)',
          border: '1px solid rgba(0,200,117,0.3)', flexShrink: 0 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: GREEN,
            boxShadow: `0 0 ${pulse ? 8 : 4}px ${GREEN}`,
            transition: 'box-shadow 0.5s',
          }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: GREEN, letterSpacing: '0.1em' }}>
            {connected ? 'SUPABASE LIVE' : 'CONNECTING...'}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: TEXT }}>Ahmad Al-Rashid · أحمد الراشد</div>
          <div style={{ fontSize: '0.65rem', color: MUTED }}>Amman → Aqaba · Toyota Camry 2023 · ABC-1234</div>
        </div>

        {/* ETA badge */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: CYAN }}>{etaH}h {etaM}m</div>
          <div style={{ fontSize: '0.58rem', color: MUTED }}>ETA remaining</div>
        </div>

        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
          borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: MUTED,
          fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{expanded ? '▲' : '▼'}</button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {/* ── Main panel ── */}
            <div style={{ display: 'flex', gap: 0 }}>

              {/* SVG Map */}
              <div style={{ flex: '0 0 auto', padding: '16px 8px 16px 16px', position: 'relative' }}>
                <svg width={240} height={370} viewBox="0 0 280 380" style={{ display: 'block' }}>
                  <defs>
                    <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-driver" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="route-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CYAN} />
                      <stop offset="100%" stopColor={GOLD} />
                    </linearGradient>
                  </defs>

                  {/* Background */}
                  <rect width={280} height={380} fill={BG} rx={12} />

                  {/* Subtle grid */}
                  {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(y => (
                    <line key={y} x1={0} y1={y} x2={280} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
                  ))}
                  {[60, 120, 180, 240].map(x => (
                    <line key={x} x1={x} y1={0} x2={x} y2={380} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
                  ))}

                  {/* Secondary routes (dimmed) */}
                  {SECONDARY_ROUTES.map(r => (
                    <line key={r.label}
                      x1={r.from.x} y1={r.from.y} x2={r.to.x} y2={r.to.y}
                      stroke="rgba(148,163,184,0.15)" strokeWidth={1.5} strokeDasharray="4,4"
                    />
                  ))}
                  {SECONDARY_ROUTES.map(r => (
                    <text key={r.label + '-lbl'} x={r.to.x + 4} y={r.to.y + 4}
                      fontSize={8} fill="rgba(148,163,184,0.4)" fontFamily={F}>{r.label}</text>
                  ))}
                  {/* Secondary city dots */}
                  {SECONDARY_ROUTES.map(r => (
                    <circle key={r.label + '-dot'} cx={r.to.x} cy={r.to.y} r={3}
                      fill="rgba(148,163,184,0.25)" />
                  ))}

                  {/* Main route: completed portion (glowing cyan) */}
                  {AQABA_ROUTE.slice(0, -1).map((wp, i) => {
                    const next = AQABA_ROUTE[i + 1];
                    const segStart = wp.km / 330;
                    const segEnd = next.km / 330;
                    if (progress < segStart) return null;
                    const segProg = Math.min(1, (progress - segStart) / (segEnd - segStart));
                    const ex = lerp(wp.x, next.x, segProg);
                    const ey = lerp(wp.y, next.y, segProg);
                    return (
                      <g key={i}>
                        {/* Full segment (dim) */}
                        <line x1={wp.x} y1={wp.y} x2={next.x} y2={next.y}
                          stroke="rgba(0,200,232,0.15)" strokeWidth={2} />
                        {/* Completed portion (bright) */}
                        <line x1={wp.x} y1={wp.y} x2={ex} y2={ey}
                          stroke="url(#route-grad)" strokeWidth={2.5} filter="url(#glow-cyan)" />
                      </g>
                    );
                  })}

                  {/* Remaining route (dim) */}
                  {AQABA_ROUTE.slice(0, -1).map((wp, i) => {
                    const next = AQABA_ROUTE[i + 1];
                    const segStart = wp.km / 330;
                    if (progress >= segStart + (next.km - wp.km) / 330) return null;
                    if (progress <= segStart) {
                      return (
                        <line key={'rem' + i} x1={wp.x} y1={wp.y} x2={next.x} y2={next.y}
                          stroke="rgba(0,200,232,0.12)" strokeWidth={1.5} />
                      );
                    }
                    const segEnd = next.km / 330;
                    const segProg = Math.min(1, (progress - segStart) / (segEnd - segStart));
                    const sx = lerp(wp.x, next.x, segProg);
                    const sy = lerp(wp.y, next.y, segProg);
                    return (
                      <line key={'rem' + i} x1={sx} y1={sy} x2={next.x} y2={next.y}
                        stroke="rgba(0,200,232,0.12)" strokeWidth={1.5} />
                    );
                  })}

                  {/* City waypoint dots */}
                  {AQABA_ROUTE.map((wp, i) => {
                    const passed = wp.km / 330 <= progress;
                    return (
                      <g key={wp.label}>
                        <circle cx={wp.x} cy={wp.y} r={passed ? 5 : 4}
                          fill={passed ? CYAN : 'rgba(0,200,232,0.2)'}
                          stroke={passed ? 'rgba(0,200,232,0.4)' : 'rgba(0,200,232,0.15)'}
                          strokeWidth={2}
                        />
                        <text x={wp.x + 8} y={wp.y + 4} fontSize={9}
                          fill={passed ? 'rgba(239,246,255,0.9)' : 'rgba(148,163,184,0.5)'}
                          fontFamily={F} fontWeight={passed ? 700 : 400}>{wp.label}</text>
                        <text x={wp.x + 8} y={wp.y + 14} fontSize={7.5}
                          fill={passed ? 'rgba(0,200,232,0.7)' : 'rgba(148,163,184,0.3)'}
                          fontFamily="'Cairo',sans-serif">{wp.labelAr}</text>
                      </g>
                    );
                  })}

                  {/* Driver position */}
                  <g transform={`translate(${driverPos.x}, ${driverPos.y})`} style={{ transition: 'transform 0.5s ease-out' }}>
                    {/* Pulse rings */}
                    <circle r={14} fill="none" stroke={CYAN} strokeWidth={1} opacity={pulse ? 0.4 : 0.15}
                      style={{ transition: 'opacity 0.5s' }} />
                    <circle r={20} fill="none" stroke={CYAN} strokeWidth={0.5} opacity={pulse ? 0.2 : 0.05}
                      style={{ transition: 'opacity 0.5s' }} />
                    {/* Driver icon */}
                    <circle r={9} fill={CYAN} filter="url(#glow-driver)" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize={10} style={{ userSelect: 'none' }}>🚗</text>
                  </g>

                  {/* Destination beacon */}
                  {progress < 0.98 && (
                    <g>
                      <circle cx={82} cy={345} r={pulse ? 12 : 9} fill="none" stroke={GOLD}
                        strokeWidth={1} opacity={0.3} style={{ transition: 'r 0.5s' }} />
                      <circle cx={82} cy={345} r={5} fill={GOLD} opacity={0.8} />
                    </g>
                  )}
                </svg>
              </div>

              {/* Info panel */}
              <div style={{ flex: 1, padding: '16px 16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

                {/* Driver card */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12, background: CARD,
                  border: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#00C8E8,#2060E8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 900, color: '#040C18',
                    boxShadow: '0 0 0 2px rgba(0,200,232,0.3)',
                  }}>AR</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT }}>Ahmad Al-Rashid</div>
                    <div style={{ fontSize: '0.62rem', color: MUTED }}>
                      <span style={{ color: GOLD }}>★</span> 4.9 · 847 trips · Verified ✓
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{
                      width: 30, height: 30, borderRadius: 8, fontSize: '0.85rem',
                      background: 'rgba(0,200,117,0.12)', border: '1px solid rgba(0,200,117,0.25)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Call">📞</button>
                    <button style={{
                      width: 30, height: 30, borderRadius: 8, fontSize: '0.85rem',
                      background: `rgba(0,200,232,0.12)`, border: `1px solid rgba(0,200,232,0.25)`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Message">💬</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ padding: '10px 12px', borderRadius: 12, background: CARD, border: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Journey Progress
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: TEXT }}>
                      {kmTravelled} <span style={{ color: MUTED, fontWeight: 400 }}>/ 330 km</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.5, ease: 'linear' }}
                      style={{ height: '100%', borderRadius: 99,
                        background: 'linear-gradient(90deg,#00C8E8,#F0A830)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(0,200,232,0.7)' }}>🟢 Amman</span>
                    <span style={{ fontSize: '0.6rem', color: MUTED }}>🏁 Aqaba</span>
                  </div>
                </div>

                {/* Speed + Next stop */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ padding: '10px 12px', borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: CYAN }}>{Math.round(speed)}</div>
                    <div style={{ fontSize: '0.6rem', color: MUTED, marginTop: 2 }}>km/h</div>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: 12, background: CARD, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '0.58rem', color: MUTED, marginBottom: 3 }}>Next stop</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: GOLD }}>{nextStop.label}</div>
                    <div dir="rtl" style={{ fontSize: '0.65rem', color: 'rgba(240,168,48,0.6)', fontFamily: "'Cairo',sans-serif" }}>{nextStop.labelAr}</div>
                  </div>
                </div>

                {/* Realtime status */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 10,
                  background: connected ? 'rgba(0,200,117,0.06)' : 'rgba(148,163,184,0.05)',
                  border: `1px solid ${connected ? 'rgba(0,200,117,0.2)' : BORDER}`,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: connected ? GREEN : MUTED,
                    boxShadow: connected ? `0 0 6px ${GREEN}` : 'none',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: connected ? GREEN : MUTED }}>
                      {connected ? 'Supabase Realtime Connected' : 'Connecting to Realtime...'}
                    </div>
                    {lastSeen && (
                      <div style={{ fontSize: '0.56rem', color: MUTED }}>Last update: {lastSeen}</div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.56rem', fontWeight: 700, padding: '2px 6px',
                    borderRadius: 99, background: 'rgba(0,200,232,0.1)',
                    color: CYAN, border: '1px solid rgba(0,200,232,0.2)',
                  }}>BROADCAST</div>
                </div>

                {/* SOS button */}
                <button style={{
                  width: '100%', height: 34, borderRadius: 10,
                  background: 'rgba(255,68,85,0.08)', border: '1px solid rgba(255,68,85,0.25)',
                  color: '#FF4455', fontWeight: 700, fontSize: '0.75rem', fontFamily: F,
                  cursor: 'pointer', letterSpacing: '0.05em',
                }}>🛡️ SOS Emergency · Sanad Protocol</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
