/**
 * AuthModal — Sign In / Sign Up
 * Wasel | واصل
 *
 * Uses ReactDOM.createPortal to mount directly into document.body,
 * guaranteeing it is outside every stacking context, overflow clip,
 * and CSS transform in the app tree.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WaselW } from './WaselW';
import { useLocalAuth } from '../contexts/LocalAuth';

const C = {
  bg:     '#040C18',
  panel:  '#060E24',
  panel2: '#081630',
  border: '#0C1E3A',
  cyan:   '#00C8E8',
  gold:   '#F0A830',
  goldL:  '#FFD060',
  green:  '#00C875',
  muted:  '#2A4060',
  text:   '#6A9AB8',
  white:  '#E8F4FF',
  error:  '#FF4D6A',
};

interface AuthModalProps {
  mode:     'signin' | 'signup';
  onClose:  () => void;
  onSwitch: (m: 'signin' | 'signup') => void;
}

function Field({
  label, placeholder, type = 'text', value, onChange, error,
}: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: '0.75rem', fontWeight: 700, color: C.text,
        letterSpacing: '0.06em', display: 'block',
      }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: C.panel2,
          border: `1.5px solid ${error ? C.error : focused ? C.cyan : C.border}`,
          borderRadius: 12, padding: '13px 16px',
          fontSize: '0.9rem', color: C.white,
          fontFamily: "'Inter', -apple-system, sans-serif",
          outline: 'none', transition: 'border-color 0.2s',
        }}
      />
      {error && (
        <div style={{ fontSize: '0.72rem', color: C.error, marginTop: 2 }}>{error}</div>
      )}
    </div>
  );
}

function AuthModalContent({ mode, onClose, onSwitch }: AuthModalProps) {
  const isSignIn = mode === 'signin';
  const { signIn, register } = useLocalAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<'passenger' | 'driver'>('passenger');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [formError,setFormError]= useState('');

  // Reset when mode switches
  useEffect(() => {
    setName(''); setEmail(''); setPhone('');
    setPassword(''); setErrors({}); setSuccess(false); setLoading(false); setFormError('');
  }, [mode]);

  // Escape key closes
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!isSignIn && !name.trim())               e.name     = 'Full name is required';
    if (!email.trim() || !email.includes('@'))   e.email    = 'Enter a valid email';
    if (!isSignIn && phone.replace(/\D/g,'').length < 8) e.phone = 'Enter a valid phone';
    if (password.length < 6)                     e.password = 'Min 6 characters';
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading || success) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setFormError('');
    setLoading(true);
    const result = isSignIn
      ? await signIn(email, password)
      : await register(name, email, password, phone);

    setLoading(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => onClose(), 1200);
  }

  return (
    /* ── Backdrop ── */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483647, /* max safe z-index */
        background: 'rgba(2,6,14,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', -apple-system, sans-serif",
        overscrollBehavior: 'contain',
      }}
    >
      {/* ── Panel ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          background: 'linear-gradient(145deg, #070F26 0%, #060E24 100%)',
          border: `1.5px solid ${isSignIn ? C.cyan + '40' : C.gold + '40'}`,
          borderRadius: 24,
          boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div style={{
          height: 3, borderRadius: '24px 24px 0 0',
          background: isSignIn
            ? `linear-gradient(90deg, transparent, ${C.cyan}, ${C.green}, transparent)`
            : `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, transparent)`,
        }} />

        <div style={{ padding: '32px 32px 28px' }}>

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 36, height: 36, borderRadius: 10,
              background: C.panel2, border: `1px solid ${C.border}`,
              color: C.text, cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit', lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <WaselW size={44} glow animated />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: C.white, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {isSignIn ? 'Welcome back' : 'Join Wasel'}
              </div>
              <div style={{ fontSize: '0.72rem', color: isSignIn ? C.cyan : C.gold, fontWeight: 600, marginTop: 3 }}>
                {isSignIn ? 'مرحباً بعودتك — واصل' : 'ابدأ رحلتك — Carpooling & Packages'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: C.panel2,
            border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 4, gap: 4, marginBottom: 24,
          }}>
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onSwitch(m)}
                style={{
                  flex: 1, padding: '9px 8px', borderRadius: 9,
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontWeight: 700, fontSize: '0.82rem',
                  background: mode === m
                    ? (m === 'signin' ? `${C.cyan}22` : `${C.gold}22`)
                    : 'transparent',
                  color: mode === m
                    ? (m === 'signin' ? C.cyan : C.gold)
                    : C.text,
                  borderBottom: `2px solid ${mode === m ? (m === 'signin' ? C.cyan : C.gold) : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                {m === 'signin' ? 'Sign In — دخول' : 'Sign Up — تسجيل'}
              </button>
            ))}
          </div>

          {/* Success state */}
          {success ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `${C.green}20`, border: `2px solid ${C.green}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: C.green,
              }}>
                ✓
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.green }}>
                {isSignIn ? 'Signed in!' : 'Account created!'}
              </div>
              <div style={{ fontSize: '0.82rem', color: C.text }}>
                {isSignIn ? 'Redirecting you now…' : 'Welcome to Wasel — واصل 🚗📦'}
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Sign-up only fields */}
              {!isSignIn && (
                <>
                  <Field
                    label="Full Name — الاسم الكامل"
                    placeholder="Ahmad Al-Mansour"
                    value={name} onChange={setName} error={errors.name}
                  />

                  {/* Role picker */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.text, letterSpacing: '0.06em', marginBottom: 8 }}>
                      I am joining as
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[
                        { id: 'passenger', icon: '🧳', label: 'Passenger',       color: C.cyan },
                        { id: 'driver',    icon: '🚗', label: 'Driver / Traveler', color: C.gold },
                      ].map(r => (
                        <button
                          key={r.id} type="button"
                          onClick={() => setRole(r.id as 'passenger' | 'driver')}
                          style={{
                            flex: 1, padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
                            border: `1.5px solid ${role === r.id ? r.color : C.border}`,
                            background: role === r.id ? `${r.color}18` : C.panel2,
                            color: role === r.id ? r.color : C.text,
                            fontFamily: "'Inter', -apple-system, sans-serif",
                            fontWeight: 700, fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s',
                          }}
                        >
                          {r.icon} {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field
                    label="Phone — رقم الهاتف"
                    placeholder="+962 79 123 4567" type="tel"
                    value={phone} onChange={setPhone} error={errors.phone}
                  />
                </>
              )}

              <Field
                label="Email — البريد الإلكتروني"
                placeholder="you@example.com" type="email"
                value={email} onChange={setEmail} error={errors.email}
              />

              <Field
                label="Password — كلمة السر"
                placeholder={isSignIn ? 'Enter your password' : 'Min 6 characters'} type="password"
                value={password} onChange={setPassword} error={errors.password}
              />

              {formError && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1px solid ${C.error}55`,
                  background: `${C.error}14`,
                  color: '#FFC7D1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}>
                  {formError}
                </div>
              )}

              {isSignIn && (
                <div style={{ textAlign: 'right', marginTop: -4 }}>
                  <button
                    type="button"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', color: C.text,
                      fontFamily: "'Inter', -apple-system, sans-serif",
                    }}
                  >
                    نسيت كلمة السر؟ Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px 20px',
                  borderRadius: 14, border: 'none',
                  cursor: loading ? 'default' : 'pointer',
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontWeight: 800, fontSize: '0.95rem',
                  background: isSignIn
                    ? `linear-gradient(135deg, ${C.cyan} 0%, #0099BB 100%)`
                    : `linear-gradient(135deg, ${C.gold} 0%, ${C.goldL} 100%)`,
                  color: isSignIn ? '#020C18' : '#0A0800',
                  boxShadow: isSignIn ? `0 4px 24px ${C.cyan}40` : `0 4px 24px ${C.gold}45`,
                  opacity: loading ? 0.7 : 1,
                  marginTop: 4,
                }}
              >
                {loading
                  ? '⏳ Please wait…'
                  : isSignIn
                    ? 'Sign In — تسجيل الدخول'
                    : 'Create Account — إنشاء حساب'}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: '0.7rem', color: C.muted }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Social login */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'google', label: 'G  Google' },
                  { key: 'apple',  label: '🍎  Apple' },
                  { key: 'phone',  label: '📱  Phone' },
                ].map(s => (
                  <button
                    key={s.key} type="button"
                    style={{
                      flex: 1, padding: '10px 6px', borderRadius: 12,
                      background: C.panel2, border: `1px solid ${C.border}`,
                      color: C.text, cursor: 'pointer',
                      fontFamily: "'Inter', -apple-system, sans-serif",
                      fontSize: '0.76rem', fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Switch mode */}
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: C.text }}>
                {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => onSwitch(isSignIn ? 'signup' : 'signin')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontWeight: 700,
                    color: isSignIn ? C.gold : C.cyan,
                    fontSize: '0.8rem',
                  }}
                >
                  {isSignIn ? 'Sign Up →' : '← Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/** Portal wrapper — mounts the modal directly into document.body */
export function AuthModal(props: AuthModalProps) {
  // Guard for SSR / environments where document is unavailable
  if (typeof document === 'undefined') return null;
  return createPortal(<AuthModalContent {...props} />, document.body);
}

export default AuthModal;
