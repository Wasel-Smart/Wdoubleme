/**
 * Wasel Design System — Form Composites v1.0
 *
 * Higher-order DS forms built from DSInputs + tokens.
 *
 * Components:
 *  DSRideSearchForm    — pickup → drop-off + date + seats row
 *  DSPackageForm       — sender / receiver / weight / dimensions
 *  DSLoginForm         — phone + OTP (2-step)
 *  DSOfferRideForm     — departure / arrival / date / seats / price
 */

import { useState } from 'react';
import { DS } from './tokens';
import { DSInput, DSSearchInput, DSOTPInput, DSInputGroup } from './DSInputs';
import { IconMapPin, IconClock, IconUser, IconPackage, IconPhone, IconCar } from './DSIcons';

const C = DS.color;
const F = DS.font;
const R = DS.radius;

// ── Shared: city list for Jordan ──────────────────────────────────────────────

const JORDAN_CITIES = [
  'Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Salt', 'Madaba',
  'Karak', 'Tafilah', 'Mafraq', 'Jerash', 'Ajloun', 'Ramtha',
];

// ── Shared: city picker dropdown ──────────────────────────────────────────────

function CityPicker({
  label, value, onChange, placeholder, id,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = JORDAN_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <DSInputGroup label={label} htmlFor={id}>
      <div style={{ position: 'relative' }}>
        <DSInput
          id={id}
          value={value || query}
          placeholder={placeholder || 'Select city…'}
          iconLeft={<IconMapPin size={16} color={C.primary} />}
          clearable
          onChange={v => { setQuery(v); onChange(''); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            marginTop: 4,
            background: C.bgCard,
            border: `1.5px solid ${C.primary}30`,
            borderRadius: R.md,
            boxShadow: DS.shadow.lg,
            maxHeight: 200, overflowY: 'auto',
          }}>
            {filtered.map(city => (
              <button
                key={city}
                type="button"
                onMouseDown={() => { onChange(city); setQuery(city); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px',
                  background: value === city ? C.primaryDim : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontSize: F.size.sm, fontFamily: F.family,
                  color: value === city ? C.primary : C.text,
                  fontWeight: value === city ? 700 : 400,
                  transition: 'background 0.1s',
                }}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>
    </DSInputGroup>
  );
}

// ── DSRideSearchForm ──────────────────────────────────────────────────────────

interface RideSearchValues {
  from: string;
  to: string;
  date: string;
  seats: number;
}

interface DSRideSearchFormProps {
  onSearch?: (values: RideSearchValues) => void;
  initialValues?: Partial<RideSearchValues>;
}

export function DSRideSearchForm({ onSearch, initialValues }: DSRideSearchFormProps) {
  const [from,  setFrom]  = useState(initialValues?.from  ?? '');
  const [to,    setTo]    = useState(initialValues?.to    ?? '');
  const [date,  setDate]  = useState(initialValues?.date  ?? '');
  const [seats, setSeats] = useState(initialValues?.seats ?? 1);

  const swap = () => { setFrom(to); setTo(from); };
  const valid = from && to && date;

  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: R.xl,
      padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* From / To with swap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'end' }}>
        <CityPicker label="From" value={from} onChange={setFrom} placeholder="Departure city" id="ride-from" />

        <button
          type="button"
          onClick={swap}
          style={{
            width: 36, height: 44, borderRadius: R.md,
            background: C.primaryDim, border: `1.5px solid ${C.primary}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, marginBottom: 0, color: C.primary,
            transition: 'background 0.15s',
          }}
          title="Swap cities"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4" />
            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <CityPicker label="To" value={to} onChange={setTo} placeholder="Destination city" id="ride-to" />
      </div>

      {/* Date + Seats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
        <DSInputGroup label="Date" htmlFor="ride-date">
          <DSInput
            id="ride-date"
            type="text"
            value={date}
            placeholder="e.g. Tomorrow, Fri 28 Mar"
            iconLeft={<IconClock size={16} color={C.textMuted} />}
            onChange={setDate}
          />
        </DSInputGroup>

        <DSInputGroup label="Seats">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            height: 44, border: `1.5px solid ${C.border}`, borderRadius: R.md,
            background: C.bgCard, overflow: 'hidden',
          }}>
            <button
              type="button"
              onClick={() => setSeats(s => Math.max(1, s - 1))}
              style={{ width: 38, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: C.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >−</button>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              flex: 1, fontWeight: 700, fontSize: F.size.md,
              color: C.text, fontFamily: F.family,
            }}>
              <IconUser size={14} color={C.textMuted} />
              {seats}
            </div>
            <button
              type="button"
              onClick={() => setSeats(s => Math.min(8, s + 1))}
              style={{ width: 38, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: C.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >+</button>
          </div>
        </DSInputGroup>
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={!valid}
        onClick={() => valid && onSearch?.({ from, to, date, seats })}
        style={{
          height: 50, borderRadius: R.md,
          background: valid
            ? `linear-gradient(135deg, ${C.primary} 0%, ${C.blue} 100%)`
            : C.bgAlt,
          border: 'none', cursor: valid ? 'pointer' : 'not-allowed',
          color: valid ? '#fff' : C.textMuted,
          fontSize: F.size.md, fontWeight: 800, fontFamily: F.family,
          boxShadow: valid ? DS.shadow.cyan : 'none',
          transition: 'all 0.2s ease',
          letterSpacing: '-0.01em',
        }}
      >
        🔍  Search Rides
      </button>
    </div>
  );
}

// ── DSOfferRideForm ───────────────────────────────────────────────────────────

interface OfferRideValues {
  from: string;
  to: string;
  date: string;
  departureTime: string;
  seats: number;
  pricePerSeat: string;
  notes: string;
}

interface DSOfferRideFormProps {
  onSubmit?: (values: OfferRideValues) => void;
}

export function DSOfferRideForm({ onSubmit }: DSOfferRideFormProps) {
  const [from,  setFrom]  = useState('');
  const [to,    setTo]    = useState('');
  const [date,  setDate]  = useState('');
  const [time,  setTime]  = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const valid = from && to && date && time && price;

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: R.xl, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h3 style={{ margin: 0, fontSize: F.size.lg, fontWeight: 800, color: C.text, fontFamily: F.family }}>
        🚗  Offer a Ride
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <CityPicker label="Departure City" value={from} onChange={setFrom} id="offer-from" />
        <CityPicker label="Destination City" value={to}   onChange={setTo}   id="offer-to"   />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <DSInputGroup label="Date" htmlFor="offer-date">
          <DSInput id="offer-date" value={date} placeholder="e.g. Fri 28 Mar"
            iconLeft={<IconClock size={16} color={C.textMuted} />} onChange={setDate} />
        </DSInputGroup>
        <DSInputGroup label="Departure Time" htmlFor="offer-time">
          <DSInput id="offer-time" value={time} placeholder="e.g. 07:30 AM"
            iconLeft={<IconClock size={16} color={C.textMuted} />} onChange={setTime} />
        </DSInputGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Seats available */}
        <DSInputGroup label="Seats Available">
          <div style={{
            display: 'flex', alignItems: 'center',
            height: 44, border: `1.5px solid ${C.border}`, borderRadius: R.md,
            background: C.bgCard, overflow: 'hidden',
          }}>
            <button type="button" onClick={() => setSeats(s => Math.max(1, s - 1))}
              style={{ width: 38, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: C.textSub }}>−</button>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: F.size.md, color: C.text, fontFamily: F.family }}>
              {seats}
            </div>
            <button type="button" onClick={() => setSeats(s => Math.min(7, s + 1))}
              style={{ width: 38, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: C.textSub }}>+</button>
          </div>
        </DSInputGroup>

        {/* Price */}
        <DSInputGroup label="Price per Seat (JOD)" htmlFor="offer-price">
          <DSInput id="offer-price" value={price} placeholder="e.g. 5.00"
            type="number"
            iconLeft={<span style={{ fontSize: F.size.sm, fontWeight: 700, color: C.primary, marginLeft: 2 }}>JOD</span>}
            onChange={setPrice} />
        </DSInputGroup>
      </div>

      {/* Notes */}
      <DSInputGroup label="Notes for Passengers (optional)" htmlFor="offer-notes">
        <DSInput id="offer-notes" value={notes} placeholder="e.g. Prayer stop in Zarqa, no smoking"
          iconLeft={<IconCar size={16} color={C.textMuted} />} onChange={setNotes} />
      </DSInputGroup>

      <button
        type="button"
        disabled={!valid}
        onClick={() => valid && onSubmit?.({ from, to, date, departureTime: time, seats, pricePerSeat: price, notes })}
        style={{
          height: 50, borderRadius: R.md,
          background: valid
            ? `linear-gradient(135deg, ${C.green} 0%, #33EFA0 100%)`
            : C.bgAlt,
          border: 'none', cursor: valid ? 'pointer' : 'not-allowed',
          color: valid ? '#fff' : C.textMuted,
          fontSize: F.size.md, fontWeight: 800, fontFamily: F.family,
          boxShadow: valid ? DS.shadow.cyan : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        ✓  Post My Ride
      </button>
    </div>
  );
}

// ── DSLoginForm ───────────────────────────────────────────────────────────────

interface DSLoginFormProps {
  onLogin?: (phone: string, otp: string) => void;
  loading?: boolean;
}

export function DSLoginForm({ onLogin, loading }: DSLoginFormProps) {
  const [step,  setStep]  = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp,   setOtp]   = useState('');

  const handleOTPComplete = (code: string) => {
    setOtp(code);
    onLogin?.(phone, code);
  };

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: R.xl, padding: 24,
      display: 'flex', flexDirection: 'column', gap: 20,
      maxWidth: 360, width: '100%',
    }}>
      {/* Logo placeholder */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: R.lg,
          background: `linear-gradient(135deg, ${C.primary}, ${C.blue})`,
          marginBottom: 12,
        }}>
          <span style={{ fontSize: '1.6rem' }}>🚗</span>
        </div>
        <h2 style={{ margin: 0, fontSize: F.size['2xl'], fontWeight: 900, color: C.text, fontFamily: F.family }}>
          واصل · Wasel
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: F.size.sm, color: C.textMuted, fontFamily: F.family }}>
          {step === 'phone' ? 'Enter your phone number to continue' : `OTP sent to +962 ${phone}`}
        </p>
      </div>

      {step === 'phone' ? (
        <>
          <DSInputGroup label="Phone Number" htmlFor="login-phone">
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', padding: '0 12px',
                background: C.bgPanel, border: `1.5px solid ${C.border}`,
                borderRadius: R.md, fontSize: F.size.sm, fontWeight: 700,
                color: C.textSub, fontFamily: F.family, flexShrink: 0, gap: 6,
              }}>
                🇯🇴 +962
              </div>
              <DSInput
                id="login-phone"
                type="tel"
                value={phone}
                placeholder="7X XXX XXXX"
                iconLeft={<IconPhone size={16} color={C.textMuted} />}
                onChange={setPhone}
                onEnter={() => phone.length >= 9 && setStep('otp')}
              />
            </div>
          </DSInputGroup>

          <button
            type="button"
            disabled={phone.length < 9 || loading}
            onClick={() => setStep('otp')}
            style={{
              height: 50, borderRadius: R.md,
              background: phone.length >= 9
                ? `linear-gradient(135deg, ${C.primary} 0%, ${C.blue} 100%)`
                : C.bgAlt,
              border: 'none', cursor: phone.length >= 9 ? 'pointer' : 'not-allowed',
              color: phone.length >= 9 ? '#fff' : C.textMuted,
              fontSize: F.size.md, fontWeight: 800, fontFamily: F.family,
              boxShadow: phone.length >= 9 ? DS.shadow.cyan : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Sending…' : 'Send OTP →'}
          </button>
        </>
      ) : (
        <>
          <div>
            <p style={{ margin: '0 0 16px', fontSize: F.size.sm, color: C.textSub, textAlign: 'center', fontFamily: F.family }}>
              Enter the 6-digit code
            </p>
            <DSOTPInput length={6} onComplete={handleOTPComplete} />
          </div>

          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button
              type="button"
              disabled={otp.length < 6 || loading}
              onClick={() => otp.length === 6 && onLogin?.(phone, otp)}
              style={{
                height: 50, borderRadius: R.md,
                background: otp.length === 6
                  ? `linear-gradient(135deg, ${C.primary} 0%, ${C.blue} 100%)`
                  : C.bgAlt,
                border: 'none', cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                color: otp.length === 6 ? '#fff' : C.textMuted,
                fontSize: F.size.md, fontWeight: 800, fontFamily: F.family,
                boxShadow: otp.length === 6 ? DS.shadow.cyan : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Verifying…' : '✓  Verify & Log In'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: F.size.sm, color: C.primary, fontFamily: F.family,
                fontWeight: 600, padding: 4,
              }}
            >
              ← Change phone number
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── DSPackageForm ─────────────────────────────────────────────────────────────

interface PackageValues {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  fromCity: string;
  toCity: string;
  weight: string;
  description: string;
}

interface DSPackageFormProps {
  onSubmit?: (values: PackageValues) => void;
}

export function DSPackageForm({ onSubmit }: DSPackageFormProps) {
  const [v, setV] = useState<PackageValues>({
    senderName: '', senderPhone: '', receiverName: '', receiverPhone: '',
    fromCity: '', toCity: '', weight: '', description: '',
  });

  const set = (k: keyof PackageValues) => (val: string) => setV(prev => ({ ...prev, [k]: val }));
  const valid = v.senderPhone && v.receiverPhone && v.fromCity && v.toCity;

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: R.xl, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h3 style={{ margin: 0, fontSize: F.size.lg, fontWeight: 800, color: C.text, fontFamily: F.family }}>
        <IconPackage size={18} color={C.primary} /> &nbsp;Send a Package
      </h3>

      {/* Sender */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: F.size.xs, fontWeight: 700, color: C.textMuted, fontFamily: F.family, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sender</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <DSInputGroup label="Name" htmlFor="pkg-sname">
            <DSInput id="pkg-sname" value={v.senderName} placeholder="Your name"
              iconLeft={<IconUser size={15} color={C.textMuted} />} onChange={set('senderName')} />
          </DSInputGroup>
          <DSInputGroup label="Phone" htmlFor="pkg-sphone">
            <DSInput id="pkg-sphone" value={v.senderPhone} placeholder="+962 7X…" type="tel"
              iconLeft={<IconPhone size={15} color={C.textMuted} />} onChange={set('senderPhone')} />
          </DSInputGroup>
        </div>
      </div>

      {/* Receiver */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: F.size.xs, fontWeight: 700, color: C.textMuted, fontFamily: F.family, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receiver</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <DSInputGroup label="Name" htmlFor="pkg-rname">
            <DSInput id="pkg-rname" value={v.receiverName} placeholder="Recipient name"
              iconLeft={<IconUser size={15} color={C.textMuted} />} onChange={set('receiverName')} />
          </DSInputGroup>
          <DSInputGroup label="Phone" htmlFor="pkg-rphone">
            <DSInput id="pkg-rphone" value={v.receiverPhone} placeholder="+962 7X…" type="tel"
              iconLeft={<IconPhone size={15} color={C.textMuted} />} onChange={set('receiverPhone')} />
          </DSInputGroup>
        </div>
      </div>

      {/* Route + Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
        <CityPicker label="From" value={v.fromCity} onChange={set('fromCity')} id="pkg-from" />
        <CityPicker label="To"   value={v.toCity}   onChange={set('toCity')}   id="pkg-to"   />
        <DSInputGroup label="Weight (kg)" htmlFor="pkg-weight">
          <DSInput id="pkg-weight" value={v.weight} placeholder="kg" type="number" onChange={set('weight')} />
        </DSInputGroup>
      </div>

      <DSInputGroup label="Package Description" htmlFor="pkg-desc">
        <DSInput id="pkg-desc" value={v.description} placeholder="e.g. Documents, clothes, electronics"
          iconLeft={<IconPackage size={15} color={C.textMuted} />} onChange={set('description')} />
      </DSInputGroup>

      <button
        type="button"
        disabled={!valid}
        onClick={() => valid && onSubmit?.(v)}
        style={{
          height: 50, borderRadius: R.md,
          background: valid
            ? `linear-gradient(135deg, ${C.accent} 0%, #FFD080 100%)`
            : C.bgAlt,
          border: 'none', cursor: valid ? 'pointer' : 'not-allowed',
          color: valid ? C.navy : C.textMuted,
          fontSize: F.size.md, fontWeight: 800, fontFamily: F.family,
          transition: 'all 0.2s ease',
        }}
      >
        📦  Send Package
      </button>
    </div>
  );
}
