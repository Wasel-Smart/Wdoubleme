/**
 * Wasel Design System — Bottom Navigation v3.0
 * Deep Space · Electric Cyan
 */

import { useState } from 'react';
import { DS } from './tokens';
import { WaselMark } from './WaselLogo';
import { IconHome, IconPackage, IconMapPin, IconActivity, IconUser } from './DSIcons';

const C = DS.color;
const F = DS.font;
const R = DS.radius;

const NAV_ITEMS = [
  { id: 'home',     Icon: IconHome,      label: 'Home'     },
  { id: 'trips',    Icon: IconActivity,  label: 'Trips'    },
  { id: 'book',     Icon: null,          label: 'Wasel',   isCTA: true },
  { id: 'packages', Icon: IconPackage,   label: 'Packages' },
  { id: 'profile',  Icon: IconUser,      label: 'Profile'  },
];

export function DSBottomNav() {
  const [active, setActive] = useState('book');

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      {/* Preview in phone bar context */}
      <div style={{
        background: '#040C18',
        borderRadius: `0 0 ${R.xl}px ${R.xl}px`,
        border: `1px solid ${C.border}`,
        borderTop: `1px solid rgba(0,200,232,0.12)`,
        overflow: 'visible',
      }}>
        <div style={{
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '0 8px', position: 'relative',
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id;
            const Icon = item.Icon;

            if (item.isCTA) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%', marginTop: -22,
                    background: isActive
                      ? `linear-gradient(145deg, ${C.primary}, #5EE7FF)`
                      : `linear-gradient(145deg, rgba(0,200,232,0.8), rgba(0,200,232,0.5))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? DS.shadow.cyan : DS.shadow.md,
                    border: `3px solid #040C18`,
                    overflow: 'hidden', padding: 6,
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  }}>
                    <WaselMark size={38} glow={false} />
                  </div>
                  <span style={{
                    fontSize: '0.52rem', fontFamily: F.family,
                    fontWeight: 700, color: C.primary, letterSpacing: '0.08em',
                  }}>
                    WASEL
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px',
                  minWidth: 44, transition: 'all 0.15s ease',
                }}
              >
                <div style={{ position: 'relative' }}>
                  {Icon && (
                    <Icon
                      size={22}
                      color={isActive ? C.primary : C.textMuted}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                  )}
                  {/* Active indicator pill */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
                      width: 16, height: 3, borderRadius: 2,
                      background: `linear-gradient(90deg, ${C.primary}, ${C.green})`,
                      boxShadow: `0 0 6px ${C.primary}`,
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '0.52rem', fontFamily: F.family,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? C.primary : C.textMuted,
                  letterSpacing: '0.04em',
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Home indicator */}
        <div style={{ height: 4, display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
          <div style={{ width: 100, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>

      {/* Spec table */}
      <div style={{
        marginTop: 20,
        background: C.bgCard, borderRadius: R.xl, border: `1px solid ${C.border}`,
        padding: '16px 20px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
      }}>
        {[
          { label: 'Height', value: '64px' },
          { label: 'Icon size', value: '22 × 22px' },
          { label: 'CTA diameter', value: '54px' },
          { label: 'Label size', value: '8px / 700' },
          { label: 'Active rail', value: '16 × 3px' },
          { label: 'Active color', value: '#00C8E8' },
        ].map(s => (
          <div key={s.label} style={{ padding: '8px 12px', background: C.bgSurface, borderRadius: R.md, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '0.6rem', color: C.textMuted, fontFamily: F.family }}>{s.label}</div>
            <div style={{ fontSize: F.size.sm, fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
