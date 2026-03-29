/**
 * WaselW — Journey Mark  v7.0  "Maximum"
 * ══════════════════════════════════════════════════════════
 *
 *  BOLD      — 5 px route, bold pins, prominent diamond
 *  DETAILED  — 4-layer route · specular sheens · inner rings ·
 *              metallic pin rims · waypoint pulse rings · orbit arc
 *  ALIVE     — route draw-on · 3 particles (animateMotion) ·
 *              chasing shimmer · alternating pin auras ·
 *              diamond heartbeat · waypoint sonar ping ·
 *              dual aurora bloom · gentle float
 *  SHARP     — pins are proper map teardrop markers (sharp tip,
 *              tight curve, NOT balloons)
 *
 *  Colour narrative:
 *  ◆ GOLD departure ────── ◎ CYAN network ────── ● GREEN arrival
 *
 * ══════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import { motion, animate, MotionConfig } from 'motion/react';
import { MotionGlobalConfig } from 'motion';

// Force animations regardless of OS reduced-motion setting
MotionGlobalConfig.skipAnimations = false;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  cyan:        '#00C8E8',
  cyanLight:   '#40DEFF',
  gold:        '#F0A830',
  goldLight:   '#FFD060',
  goldDark:    '#A06010',
  green:       '#00C875',
  greenLight:  '#40FFAA',
  greenDark:   '#006838',
  white:       '#F4FAFF',
  cream:       '#FFFBF0',
  mint:        '#F0FFF8',
  dark:        '#040C18',
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────
export interface WaselWProps {
  size?:      number;
  glow?:      boolean;
  animated?:  boolean;
  contained?: boolean;
  className?: string;
  onClick?:   () => void;
}

// ── Geometry ──────────────────────────────────────────────────────────────────
// ViewBox 0 0 100 90. All coords are absolute — no transforms.
const G = {
  // Left pin  (gold = origin)
  LP:  { x: 14, y: 11 },   // circle centre
  LT:  { x: 14, y: 30 },   // tip (sharp bottom)
  PR:  7.5,                  // pin-head radius

  // Right pin  (green = destination)
  RP:  { x: 86, y: 11 },
  RT:  { x: 86, y: 30 },

  // W valleys  (cyan waypoints)
  LV:  { x: 35, y: 73 },
  RV:  { x: 65, y: 73 },

  // W centre peak  (gold diamond)
  CP:  { x: 50, y: 40 },
} as const;

// ── Sharp teardrop path ───────────────────────────────────────────────────────
// Proper map-pin shape: round head, sides taper aggressively to a sharp tip.
// cx,headY = circle centre   tipY = pointed bottom
function sharpPin(cx: number, headY: number, tipY: number, r: number): string {
  const lx = cx - r;
  const rx = cx + r;
  // Control points hug close to tip → sharp taper, not a balloon
  const c1x = cx - r * 0.18;
  const c2x = cx + r * 0.18;
  const cy1 = tipY - 3.5;   // near-tip vertical control
  const sy  = headY + r * 0.72; // shoulder start
  return (
    `M ${cx},${tipY} ` +
    `C ${c1x},${cy1} ${lx},${sy} ${lx},${headY} ` +
    `A ${r},${r},0,0,1 ${rx},${headY} ` +
    `C ${rx},${sy} ${c2x},${cy1} ${cx},${tipY} Z`
  );
}

// ── W route ───────────────────────────────────────────────────────────────────
const W =
  `M ${G.LT.x},${G.LT.y} ` +
  `C 16,56 26,68 ${G.LV.x},${G.LV.y} ` +
  `C 43,79 47,56 ${G.CP.x},${G.CP.y} ` +
  `C 53,56 57,79 ${G.RV.x},${G.RV.y} ` +
  `C 74,68 84,56 ${G.RT.x},${G.RT.y}`;

// ── Nav diamond ───────────────────────────────────────────────────────────────
const { x: dx, y: dy } = G.CP;
const DIAMOND =
  `M ${dx},${dy - 13} L ${dx + 9},${dy} L ${dx},${dy + 8} L ${dx - 9},${dy} Z`;

// ── Particle helper ───────────────────────────────────────────────────────────
interface PProps { color: string; r: number; dur: string; begin: string }
function Particle({ color, r, dur, begin }: PProps) {
  const am = { path: W, dur, repeatCount: 'indefinite' as const, begin };
  return (
    <g>
      <circle r={r + 2.5} fill={color} opacity="0.3">
        <animateMotion {...(am as any)} />
      </circle>
      <circle r={r} fill={color} opacity="1">
        <animateMotion {...(am as any)} />
      </circle>
      <circle r={r * 0.42} fill={C.white} opacity="0.85">
        <animateMotion {...(am as any)} />
      </circle>
    </g>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function WaselW({
  size      = 48,
  glow      = true,
  animated  = false,
  contained = false,
  className = '',
  onClick,
}: WaselWProps) {
  const isMicro  = size < 34;
  const uid      = useRef(`ww_${Math.random().toString(36).slice(2, 8)}`).current;
  const routeRef = useRef<SVGPathElement>(null);

  // Route draw-on
  useEffect(() => {
    if (isMicro || !routeRef.current) return;
    const el = routeRef.current;
    const len = el.getTotalLength();
    el.style.strokeDasharray  = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const ctrl = animate(
      (p: number) => { el.style.strokeDashoffset = `${len * (1 - p)}`; },
      { duration: 1.8, ease: [0.16, 1, 0.3, 1] }
    );
    return () => ctrl.stop();
  }, [isMicro]);

  const svgPx  = size * (contained ? 0.60 : 0.93);
  const glowPx = Math.max(4, Math.round(size * 0.16));

  const filterStr = glow
    ? [
        `drop-shadow(0 0 ${glowPx}px ${C.cyan}AA)`,
        `drop-shadow(0 0 ${Math.round(glowPx * 0.6)}px ${C.gold}88)`,
        `drop-shadow(0 0 ${Math.round(glowPx * 0.3)}px ${C.green}66)`,
      ].join(' ')
    : undefined;

  const wrapStyle: React.CSSProperties = contained
    ? {
        width: size, height: size, borderRadius: size * 0.22,
        background: `radial-gradient(135deg, #071428 0%, ${C.dark} 100%)`,
        border: `1.5px solid ${C.cyan}40`,
        boxShadow: glow
          ? `0 0 ${size * 0.35}px ${C.cyan}28, 0 0 ${size * 0.18}px ${C.gold}18, inset 0 1px 0 ${C.white}08`
          : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative' as const,
      }
    : {
        width: size, height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative' as const,
      };

  return (
    <MotionConfig reducedMotion="never">
    <motion.div
      className={`inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={wrapStyle}
      whileHover={onClick ? { scale: 1.09 } : undefined}
      whileTap={onClick  ? { scale: 0.91 } : undefined}
      onClick={onClick}
      aria-label="Wasel"
      role="img"
    >
      {/* ── Dual aurora bloom ── */}
      {glow && !contained && size >= 36 && (
        <>
          <motion.div className="absolute pointer-events-none" style={{
            width: size * 1.5, height: size * 1.2,
            top: '50%', left: '-22%', transform: 'translateY(-52%)',
            background: `radial-gradient(ellipse, ${C.gold}20 0%, transparent 60%)`,
            filter: `blur(${size * 0.2}px)`,
          }}
            animate={animated ? { opacity: [0.45, 1, 0.45] } : {}}
            transition={animated ? { duration: 4.8, repeat: Infinity, ease: 'easeInOut' } : {}}
          />
          <motion.div className="absolute pointer-events-none" style={{
            width: size * 1.5, height: size * 1.2,
            top: '50%', right: '-22%', transform: 'translateY(-52%)',
            background: `radial-gradient(ellipse, ${C.green}20 0%, transparent 60%)`,
            filter: `blur(${size * 0.2}px)`,
          }}
            animate={animated ? { opacity: [1, 0.45, 1] } : {}}
            transition={animated ? { duration: 4.8, repeat: Infinity, ease: 'easeInOut' } : {}}
          />
        </>
      )}

      {/* ── SVG mark ─────────────────────────────────────────────────────────── */}
      <motion.svg
        viewBox="0 0 100 90"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: svgPx, height: svgPx, overflow: 'visible', filter: filterStr }}
        animate={animated ? { y: [0, -3, 0] } : {}}
        transition={animated ? { duration: 4.4, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <defs>
          {/* Journey gradient */}
          <linearGradient id={`${uid}rg`} x1="14" y1="0" x2="86" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={C.gold}  />
            <stop offset="45%"  stopColor={C.cyanLight} />
            <stop offset="100%" stopColor={C.green} />
          </linearGradient>

          {/* Gold pin fill */}
          <radialGradient id={`${uid}gp`} cx="40%" cy="24%" r="76%">
            <stop offset="0%"   stopColor={C.cream}    />
            <stop offset="30%"  stopColor={C.goldLight} />
            <stop offset="70%"  stopColor={C.gold}     />
            <stop offset="100%" stopColor={C.goldDark} />
          </radialGradient>

          {/* Green pin fill */}
          <radialGradient id={`${uid}grp`} cx="40%" cy="24%" r="76%">
            <stop offset="0%"   stopColor={C.mint}       />
            <stop offset="30%"  stopColor={C.greenLight} />
            <stop offset="70%"  stopColor={C.green}      />
            <stop offset="100%" stopColor={C.greenDark}  />
          </radialGradient>

          {/* Diamond fill */}
          <radialGradient id={`${uid}dg`} cx="44%" cy="22%" r="74%">
            <stop offset="0%"   stopColor={C.cream}    stopOpacity="0.95" />
            <stop offset="28%"  stopColor={C.goldLight} />
            <stop offset="65%"  stopColor={C.gold}     />
            <stop offset="100%" stopColor={C.goldDark} />
          </radialGradient>

          {/* Waypoint fill */}
          <radialGradient id={`${uid}wp`} cx="50%" cy="40%" r="70%">
            <stop offset="0%"   stopColor={C.cyanLight} />
            <stop offset="100%" stopColor={C.cyan}      />
          </radialGradient>
        </defs>

        {/* ══════════════════════════════════════════════════════
            FULL DETAIL  (size ≥ 34)
        ══════════════════════════════════════════════════════ */}
        {!isMicro && (
          <>
            {/* ── ROUTE  4 layers ─────────────────────────────── */}
            {/* Wide diffuse bloom */}
            <path d={W} stroke={C.cyan}       strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.035" />
            {/* Medium bloom */}
            <path d={W} stroke={C.gold}       strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.05" />
            {/* Main gradient stroke — animates draw-on */}
            <path
              ref={routeRef}
              d={W}
              stroke={`url(#${uid}rg)`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Glass specular sheen */}
            <path d={W} stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.30" />
            {/* Chasing shimmer dashes */}
            <motion.path
              d={W}
              stroke={C.white}
              strokeWidth="2.8"
              fill="none"
              opacity="0.55"
              strokeLinecap="round"
              strokeDasharray="6 18"
              animate={animated ? { strokeDashoffset: [0, -24] } : {}}
              transition={animated ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : {}}
            />

            {/* ── LEFT PIN  (gold = origin) ────────────────────── */}
            {/* Breathing sonar halo */}
            <motion.circle
              cx={G.LP.x} cy={G.LP.y} r={G.PR + 4}
              fill={C.gold} opacity={0.08}
              animate={animated ? { r: [G.PR + 3, G.PR + 11, G.PR + 3], opacity: [0.08, 0.25, 0.08] } : {}}
              transition={animated ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } : {}}
            />
            {/* Pin shadow (depth) */}
            <path d={sharpPin(G.LP.x, G.LP.y, G.LT.y, G.PR)} fill="#000" opacity="0.22" transform="translate(0.8,1.2)" />
            {/* Pin body */}
            <path d={sharpPin(G.LP.x, G.LP.y, G.LT.y, G.PR)} fill={`url(#${uid}gp)`} />
            {/* Metallic rim */}
            <path d={sharpPin(G.LP.x, G.LP.y, G.LT.y, G.PR)} stroke={C.goldLight} strokeWidth="0.9" fill="none" opacity="0.7" />
            {/* Inner secondary rim */}
            <circle cx={G.LP.x} cy={G.LP.y} r={G.PR - 2.5} stroke={C.cream} strokeWidth="0.5" fill="none" opacity="0.35" />
            {/* Glass sheen ellipse */}
            <ellipse cx={G.LP.x - 2.2} cy={G.LP.y - 2.6} rx="3" ry="1.8" fill={C.white} opacity="0.50" transform={`rotate(-30 ${G.LP.x} ${G.LP.y})`} />
            {/* Inner eye */}
            <circle cx={G.LP.x} cy={G.LP.y} r="3.6" fill={C.white}     opacity="0.88" />
            <circle cx={G.LP.x} cy={G.LP.y} r="2.0" fill={C.gold}      opacity="1"    />
            <circle cx={G.LP.x - 0.6} cy={G.LP.y - 0.6} r="0.65" fill={C.cream} opacity="0.9" />

            {/* ── RIGHT PIN  (green = destination) ────────────── */}
            <motion.circle
              cx={G.RP.x} cy={G.RP.y} r={G.PR + 4}
              fill={C.green} opacity={0.08}
              animate={animated ? { r: [G.PR + 11, G.PR + 3, G.PR + 11], opacity: [0.25, 0.08, 0.25] } : {}}
              transition={animated ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } : {}}
            />
            <path d={sharpPin(G.RP.x, G.RP.y, G.RT.y, G.PR)} fill="#000" opacity="0.22" transform="translate(0.8,1.2)" />
            <path d={sharpPin(G.RP.x, G.RP.y, G.RT.y, G.PR)} fill={`url(#${uid}grp)`} />
            <path d={sharpPin(G.RP.x, G.RP.y, G.RT.y, G.PR)} stroke={C.greenLight} strokeWidth="0.9" fill="none" opacity="0.7" />
            <circle cx={G.RP.x} cy={G.RP.y} r={G.PR - 2.5} stroke={C.mint} strokeWidth="0.5" fill="none" opacity="0.35" />
            <ellipse cx={G.RP.x - 2.2} cy={G.RP.y - 2.6} rx="3" ry="1.8" fill={C.white} opacity="0.50" transform={`rotate(-30 ${G.RP.x} ${G.RP.y})`} />
            <circle cx={G.RP.x} cy={G.RP.y} r="3.6" fill={C.white}      opacity="0.88" />
            <circle cx={G.RP.x} cy={G.RP.y} r="2.0" fill={C.green}      opacity="1"    />
            <circle cx={G.RP.x - 0.6} cy={G.RP.y - 0.6} r="0.65" fill={C.mint} opacity="0.9" />

            {/* ── VALLEY WAYPOINTS ─────────────────────────────── */}
            {[
              { v: G.LV, delay: 0 },
              { v: G.RV, delay: 1.3 },
            ].map(({ v, delay }, i) => (
              <g key={i}>
                {/* Sonar ring */}
                <motion.circle
                  cx={v.x} cy={v.y} r="5"
                  stroke={C.cyan} strokeWidth="1.1" fill="none" opacity="0.5"
                  animate={animated ? { r: [4, 13], opacity: [0.55, 0] } : {}}
                  transition={animated ? { duration: 2.6, repeat: Infinity, ease: 'easeOut', delay, repeatDelay: 1.0 } : {}}
                />
                {/* Static glow */}
                <circle cx={v.x} cy={v.y} r="6"   fill={C.cyan} opacity="0.08" />
                {/* Outer ring */}
                <circle cx={v.x} cy={v.y} r="4.5" stroke={C.cyanLight} strokeWidth="0.8" fill="none" opacity="0.5" />
                {/* Main filled circle */}
                <circle cx={v.x} cy={v.y} r="3.5" fill={`url(#${uid}wp)`} />
                {/* Inner specular */}
                <circle cx={v.x - 0.7} cy={v.y - 0.9} r="1.1" fill={C.white} opacity="0.5" />
              </g>
            ))}

            {/* ── CENTRE DIAMOND ───────────────────────────────── */}
            {/* Bloom ring */}
            <circle cx={dx} cy={dy - 2} r="16"  fill={C.gold} opacity="0.06" />
            <circle cx={dx} cy={dy - 2} r="11"  fill={C.gold} opacity="0.07" />
            {/* Shadow */}
            <path d={DIAMOND} fill="#000" opacity="0.25" transform="translate(0.7,1.3)" />
            {/* Body */}
            <motion.path
              d={DIAMOND}
              fill={`url(#${uid}dg)`}
              style={{ transformOrigin: `${dx}px ${dy}px`, transformBox: 'fill-box' }}
              animate={animated ? { scale: [1, 1.18, 1], opacity: [0.92, 1, 0.92] } : {}}
              transition={animated ? { duration: 2.1, repeat: Infinity, ease: [0.4, 0, 0.6, 1] } : {}}
            />
            {/* Metallic rim */}
            <path d={DIAMOND} stroke={C.goldLight} strokeWidth="0.8" fill="none" opacity="0.72" />
            {/* Highlight line */}
            <line x1={dx} y1={dy - 13} x2={dx} y2={dy - 2} stroke={C.white} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
            {/* Apex flash */}
            <circle cx={dx} cy={dy - 13} r="1.3" fill={C.white} opacity="0.85" />

            {/* ── PARTICLES ────────────────────────────────────── */}
            {animated && (
              <>
                <Particle color={C.gold}  r={3.2} dur="2.8s" begin="0s"    />
                <Particle color={C.cyan}  r={2.4} dur="2.8s" begin="0.93s" />
                <Particle color={C.green} r={3.2} dur="2.8s" begin="1.87s" />
              </>
            )}

            {/* ── ORBIT ARC  (≥ 80 px) ──────────────────────────── */}
            {size >= 80 && (
              <motion.ellipse
                cx="50" cy="45" rx="52" ry="48"
                stroke={C.cyan} strokeWidth="0.6" fill="none" opacity="0.11"
                strokeDasharray="4 8"
                style={{ transformOrigin: '50px 45px', transformBox: 'fill-box' }}
                animate={animated ? { rotate: [0, 360] } : {}}
                transition={animated ? { duration: 32, repeat: Infinity, ease: 'linear' } : {}}
              />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            MICRO MODE  (< 34 px) — thick route + coloured dots
        ══════════════════════════════════════════════════════ */}
        {isMicro && (
          <>
            <path d={W} stroke={C.cyan} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.12" />
            <path d={W} stroke={`url(#${uid}rg)`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={G.LP.x} cy={G.LP.y} r="10"  fill={C.gold}  opacity="0.95" />
            <circle cx={G.LP.x} cy={G.LP.y} r="4.5" fill={C.cream} opacity="0.85" />
            <circle cx={G.RP.x} cy={G.RP.y} r="10"  fill={C.green} opacity="0.95" />
            <circle cx={G.RP.x} cy={G.RP.y} r="4.5" fill={C.mint}  opacity="0.85" />
          </>
        )}
      </motion.svg>
    </motion.div>
    </MotionConfig>
  );
}

// ── WaselWLoading ─────────────────────────────────────────────────────────────
export function WaselWLoading({ size = 52, message }: { size?: number; message?: string }) {
  return (
    <MotionConfig reducedMotion="never">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative' }}>
        <motion.div style={{
          position: 'absolute', inset: -11, borderRadius: '50%',
          border: '2.5px solid transparent',
          borderTopColor: C.gold, borderRightColor: `${C.gold}18`,
        }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: `${C.cyan}70`, borderLeftColor: `${C.cyan}18`,
        }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div style={{
          position: 'absolute', inset: -2, borderRadius: '50%',
          border: '1.5px solid transparent',
          borderBottomColor: `${C.green}55`,
        }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        />
        <WaselW size={size} glow animated />
      </div>
      {message && (
        <motion.p style={{
          margin: 0, fontSize: '0.68rem', fontWeight: 700,
          color: `${C.cyan}CC`, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2.1, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
    </MotionConfig>
  );
}

export default WaselW;