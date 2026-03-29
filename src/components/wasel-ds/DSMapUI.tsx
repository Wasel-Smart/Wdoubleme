/**
 * Wasel Design System — Map UI with Cyan Route
 */

import { DS } from './tokens';
import { IconMapPin, IconNavigation } from './DSIcons';

interface MapUIProps {
  height?: number;
  showUI?: boolean;
}

export function DSMapUI({ height = 320, showUI = true }: MapUIProps) {
  return (
    <div style={{
      position: 'relative', height, borderRadius: DS.radius.xl, overflow: 'hidden',
      background: '#070F1F',
      boxShadow: DS.shadow.cyan,
      border: `1px solid ${DS.color.border}`,
    }}>
      {/* ── SVG Map Layer ── */}
      <svg
        width="100%" height="100%"
        viewBox="0 0 600 320"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Base map background */}
        <rect width="600" height="320" fill="#070F1F" />

        {/* City blocks / areas */}
        <rect x="0"   y="0"   width="180" height="120" fill="#0A1628" rx="4" />
        <rect x="200" y="0"   width="200" height="100" fill="#0A1628" rx="4" />
        <rect x="420" y="0"   width="180" height="150" fill="#0A1628" rx="4" />
        <rect x="0"   y="170" width="130" height="150" fill="#0A1628" rx="4" />
        <rect x="160" y="200" width="160" height="120" fill="#0A1628" rx="4" />
        <rect x="360" y="180" width="240" height="140" fill="#0A1628" rx="4" />

        {/* Green space */}
        <ellipse cx="310" cy="170" rx="80" ry="50" fill="rgba(0,200,117,0.08)" />
        <rect x="240" y="140" width="140" height="60" rx="8" fill="rgba(0,200,117,0.06)" />

        {/* Main horizontal road */}
        <rect x="0" y="120" width="600" height="24" fill="#CDD5E0" />
        <line x1="0" y1="132" x2="600" y2="132" stroke="#B8C4D4" strokeWidth="1" strokeDasharray="20 12" />

        {/* Main vertical road left */}
        <rect x="150" y="0" width="22" height="320" fill="#CDD5E0" />

        {/* Main vertical road right */}
        <rect x="400" y="0" width="22" height="320" fill="#CDD5E0" />

        {/* Secondary roads */}
        <rect x="0"   y="200" width="600" height="16" fill="#D4DCE8" />
        <rect x="0"   y="260" width="600" height="14" fill="#D4DCE8" />
        <rect x="70"  y="0"   width="14"  height="320" fill="#D4DCE8" />
        <rect x="270" y="0"   width="14"  height="320" fill="#D4DCE8" />
        <rect x="480" y="0"   width="14"  height="320" fill="#D4DCE8" />

        {/* Building details */}
        {[
          [20,20,48,60],[80,15,55,75],[30,170,70,40],[200,220,80,60],
          [440,20,60,80],[440,200,70,50],[340,220,80,55],
        ].map(([x,y,w,h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#D0D9E8" />
        ))}

        {/* ── Route Line (Cyan) ── */}
        {/* Animated dashes behind */}
        <path
          d="M 80 278 L 80 208 L 160 208 L 160 132 L 275 132 L 275 50 L 420 50 L 420 132 L 490 132"
          fill="none"
          stroke="#00D1FF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.25"
        />
        {/* Main route */}
        <path
          d="M 80 278 L 80 208 L 160 208 L 160 132 L 275 132 L 275 50 L 420 50 L 420 132 L 490 132"
          fill="none"
          stroke="#00D1FF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 0"
        />

        {/* Route glow */}
        <path
          d="M 80 278 L 80 208 L 160 208 L 160 132 L 275 132 L 275 50 L 420 50 L 420 132 L 490 132"
          fill="none"
          stroke="#00D1FF"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.12"
        />

        {/* ── Pickup Pin (Deep Blue) ── */}
        <g transform="translate(80, 278)">
          <circle cx="0" cy="0" r="14" fill="white" />
          <circle cx="0" cy="0" r="10" fill={DS.color.primary} />
          <circle cx="0" cy="0" r="4" fill="white" />
        </g>

        {/* ── Drop Pin (Cyan) ── */}
        <g transform="translate(490, 132)">
          <circle cx="0" cy="0" r="16" fill="white" opacity="0.9" />
          <circle cx="0" cy="0" r="11" fill={DS.color.accent} />
          <circle cx="0" cy="0" r="4"  fill="white" />
          <circle cx="0" cy="0" r="20" fill={DS.color.accent} opacity="0.15" />
        </g>

        {/* ── Route waypoint ── */}
        <g transform="translate(275, 132)">
          <circle cx="0" cy="0" r="7" fill="white" />
          <circle cx="0" cy="0" r="4" fill={DS.color.accent} />
        </g>

        {/* ── Current location pulse ── */}
        <g transform="translate(80, 278)">
          <circle cx="0" cy="0" r="26" fill={DS.color.primary} opacity="0.06" />
        </g>
      </svg>

      {/* ── Map UI Overlays ── */}
      {showUI && (
        <>
          {/* Top-left: my location label */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: DS.color.surface, borderRadius: DS.radius.md,
            padding: '8px 12px', boxShadow: DS.shadow.lg,
            display: 'flex', alignItems: 'center', gap: 8,
            border: `1px solid ${DS.color.border}`,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: DS.color.primary, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: DS.color.text, fontFamily: DS.font.family }}>Pickup</div>
              <div style={{ fontSize: '0.62rem', color: DS.color.textMuted, fontFamily: DS.font.family }}>Abdali, Amman</div>
            </div>
          </div>

          {/* Top-right: destination */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: DS.color.surface, borderRadius: DS.radius.md,
            padding: '8px 12px', boxShadow: DS.shadow.lg,
            display: 'flex', alignItems: 'center', gap: 8,
            border: `1.5px solid ${DS.color.accent}40`,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: DS.color.accent, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: DS.color.text, fontFamily: DS.font.family }}>Drop-off</div>
              <div style={{ fontSize: '0.62rem', color: DS.color.textMuted, fontFamily: DS.font.family }}>Airport Terminal</div>
            </div>
          </div>

          {/* Bottom-left: route info */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: DS.color.primary, borderRadius: DS.radius.md,
            padding: '8px 14px', boxShadow: DS.shadow.lg,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: DS.font.family }}>Distance</div>
              <div style={{ fontSize: DS.font.size.sm, fontWeight: 700, color: DS.color.white, fontFamily: DS.font.family }}>18.4 km</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: DS.font.family }}>ETA</div>
              <div style={{ fontSize: DS.font.size.sm, fontWeight: 700, color: DS.color.accent, fontFamily: DS.font.family }}>24 min</div>
            </div>
          </div>

          {/* Bottom-right: re-center button */}
          <button style={{
            position: 'absolute', bottom: 14, right: 14,
            width: 40, height: 40, borderRadius: '50%',
            background: DS.color.surface, border: `1px solid ${DS.color.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: DS.shadow.md,
          }}>
            <IconNavigation size={18} color={DS.color.secondary} />
          </button>
        </>
      )}
    </div>
  );
}