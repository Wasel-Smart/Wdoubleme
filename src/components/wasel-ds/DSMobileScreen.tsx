/**
 * Wasel Design System — Mobile App Screen: Ride Booking UI v3.0
 * Deep Space · Electric Cyan · Solar Gold
 */

import { useState } from 'react';
import { DS } from './tokens';
import { DSMapUI } from './DSMapUI';
import { RideCard } from './DSCards';
import { WaselMark } from './WaselLogo';
import {
  IconMapPin, IconClock, IconStar, IconUser,
  IconShield, IconPackage,
} from './DSIcons';

const C = DS.color;
const F = DS.font;
const R = DS.radius;

export function DSMobileScreen() {
  const [selected, setSelected] = useState<'economy' | 'comfort' | 'premium'>('comfort');

  const rides = [
    { key: 'economy' as const,  label: 'Economy',  price: 6,  icon: '🚗', color: C.textSub },
    { key: 'comfort' as const,  label: 'Comfort',  price: 8,  icon: '🚙', color: C.primary },
    { key: 'premium' as const,  label: 'Premium',  price: 12, icon: '🚘', color: C.accent  },
  ];

  return (
    /* Phone frame */
    <div style={{
      width: 360, height: 740,
      background: C.bg,
      borderRadius: 44,
      overflow: 'hidden',
      boxShadow: `
        0 0 0 8px #040C18,
        0 0 0 11px rgba(0,200,232,0.15),
        0 32px 80px rgba(0,0,0,0.7),
        0 8px 24px rgba(0,0,0,0.4)
      `,
      position: 'relative',
      fontFamily: F.family,
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Status Bar ── */}
      <div style={{
        height: 44, background: '#040C18',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px 0 24px', flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.text }}>9:41</span>
        {/* Dynamic island */}
        <div style={{
          width: 110, height: 28,
          background: '#000',
          borderRadius: '0 0 16px 16px',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0,
        }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Signal bars */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            {[6, 9, 12, 15].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, background: i < 3 ? C.text : 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
            ))}
          </div>
          {/* WiFi */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 10a1 1 0 110-2 1 1 0 010 2z" fill={C.text} />
            <path d="M5.5 7.5a3.5 3.5 0 015 0" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 5a7 7 0 0110 0" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          </svg>
          {/* Battery */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <div style={{ width: 22, height: 11, borderRadius: 3, border: `1.5px solid rgba(255,255,255,0.4)`, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 2px' }}>
              <div style={{ width: '80%', height: 7, borderRadius: 1.5, background: C.green }} />
            </div>
            <div style={{ width: 2, height: 5, borderRadius: '0 1px 1px 0', background: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>

      {/* ── App Header ── */}
      <div style={{
        background: '#040C18',
        padding: '10px 18px 14px', flexShrink: 0,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <WaselMark size={30} />
            <div>
              <div style={{ fontSize: '0.6rem', color: C.textMuted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>BOOK A RIDE</div>
              <div style={{
                fontSize: '0.85rem', fontWeight: 900, letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${C.primary} 0%, #5EE7FF 100%)`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Wasel | واصل</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Notification dot */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 32, height: 32, borderRadius: R.sm, background: C.bgCard, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: C.error, border: `1.5px solid #040C18` }} />
            </div>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: R.sm,
              background: `linear-gradient(135deg, ${C.primaryDim}, ${C.greenDim})`,
              border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 900, color: C.primary,
            }}>A</div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          height: 44, borderRadius: R.md, border: `1.5px solid ${C.primary}40`,
          background: C.bgCard,
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
          boxShadow: `0 0 0 3px ${C.primaryDim}`,
        }}>
          <IconMapPin size={16} color={C.primary} />
          <span style={{ flex: 1, fontSize: '0.8rem', color: C.text, fontWeight: 600 }}>Airport Terminal 2</span>
          <div style={{ width: 24, height: 24, borderRadius: R.xs, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flexShrink: 0, height: 200, position: 'relative', overflow: 'hidden' }}>
        <DSMapUI height={200} showUI={false} />
        {/* Route stats overlay */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          background: 'rgba(4,12,24,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: R.md, border: `1px solid ${C.border}`,
          padding: '8px 14px', display: 'flex', justifyContent: 'space-between',
        }}>
          {[
            { label: 'Distance', value: '18.4 km', color: C.text },
            { label: 'Duration', value: '24 min',  color: C.primary },
            { label: 'Fare',     value: 'JOD 8',   color: C.accent },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: C.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ride Type Selector ── */}
      <div style={{ padding: '14px 14px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: '0.65rem', color: C.textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Choose ride type</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {rides.map(ride => {
            const isSelected = selected === ride.key;
            return (
              <button
                key={ride.key}
                onClick={() => setSelected(ride.key)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: R.md, cursor: 'pointer',
                  background: isSelected ? C.primaryDim : C.bgCard,
                  border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? `0 0 0 2px ${C.primaryDim}` : 'none',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{ride.icon}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isSelected ? C.primary : C.textMuted, fontFamily: F.family }}>{ride.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: C.text, fontFamily: F.family }}>JOD {ride.price}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ride Card ── */}
      <div style={{ padding: '8px 14px', flexShrink: 0 }}>
        <RideCard
          from="Abdali District"
          to="Airport Terminal 2"
          price={8}
          seats={2}
          time="Now · 3 min"
          driver="Ahmad Hassan"
          rating={4.9}
        />
      </div>

      {/* ── Trust indicators ── */}
      <div style={{ padding: '6px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { icon: <IconShield  size={11} color={C.green} />,   label: 'Verified Driver' },
            { icon: <IconStar    size={11} color={C.accent} />,  label: '4.9 Stars' },
            { icon: <IconUser    size={11} color={C.primary} />, label: 'Women Friendly' },
            { icon: <IconClock   size={11} color={C.textMuted} />, label: 'On time' },
          ].map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: C.bgCard, borderRadius: R.full,
              border: `1px solid ${C.border}`,
              padding: '3px 8px',
            }}>
              {t.icon}
              <span style={{ fontSize: '0.58rem', color: C.textMuted, fontFamily: F.family, fontWeight: 600 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Book CTA ── */}
      <div style={{ padding: '10px 14px', flexShrink: 0 }}>
        <button style={{
          width: '100%', height: 50, borderRadius: R.md,
          background: `linear-gradient(135deg, ${C.primary} 0%, #5EE7FF 100%)`,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: DS.shadow.cyan,
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: C.bg, fontFamily: F.family }}>Book Comfort · JOD 8</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{
        marginTop: 'auto', height: 64,
        background: '#040C18',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 4px', flexShrink: 0,
        backdropFilter: 'blur(24px)',
      }}>
        {[
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Home',   active: false },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, label: 'Search', active: true },
          { icon: null, label: '',       active: false, isCTA: true },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: 'Trips', active: false },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Profile', active: false },
        ].map((item, i) => (
          item.isCTA ? (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', marginTop: -24,
                background: `linear-gradient(135deg, ${C.primary}, #5EE7FF)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: DS.shadow.cyan,
                overflow: 'hidden', padding: 6,
                border: `3px solid #040C18`,
              }}>
                <WaselMark size={36} glow={false} />
              </div>
              <span style={{ fontSize: '0.52rem', color: C.primary, fontFamily: F.family, fontWeight: 700, marginTop: 3, letterSpacing: '0.06em' }}>WASEL</span>
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 44 }}>
              <div style={{ color: item.active ? C.primary : C.textMuted, position: 'relative' }}>
                {item.icon}
                {item.active && (
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 16, height: 3, borderRadius: 2,
                    background: `linear-gradient(90deg, ${C.primary}, ${C.green})`,
                  }} />
                )}
              </div>
              <span style={{ fontSize: '0.52rem', color: item.active ? C.primary : C.textMuted, fontFamily: F.family, fontWeight: item.active ? 700 : 500 }}>{item.label}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
