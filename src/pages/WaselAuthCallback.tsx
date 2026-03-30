import { useEffect, useState } from 'react';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';
import { supabase } from '../utils/supabase/client';

type CallbackState = 'loading' | 'closing' | 'redirecting' | 'error';

export default function WaselAuthCallback() {
  const navigate = useIframeSafeNavigate();
  const [state, setState] = useState<CallbackState>('loading');
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    let active = true;

    const finishAuth = async () => {
      if (!supabase) {
        if (!active) return;
        setState('error');
        setMessage('Backend is not configured for social sign-in.');
        return;
      }

      const { error } = await supabase.auth.getSession();
      if (error) {
        if (!active) return;
        setState('error');
        setMessage(error.message || 'Unable to complete sign-in.');
        return;
      }

      if (window.opener && !window.opener.closed) {
        setState('closing');
        setMessage('Sign-in complete. You can return to Wasel.');
        window.opener.postMessage({ type: 'wasel-auth-complete' }, window.location.origin);
        window.close();
        return;
      }

      setState('redirecting');
      setMessage('Sign-in complete. Redirecting...');
      navigate('/find-ride', { replace: true });
    };

    void finishAuth();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040C18',
        color: '#EFF6FF',
        padding: 24,
        fontFamily: "-apple-system,'Inter',sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          padding: 28,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(0,200,232,0.14)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            margin: '0 auto 16px',
            borderRadius: '50%',
            border: state === 'error' ? '3px solid rgba(255,68,85,0.3)' : '3px solid rgba(0,200,232,0.15)',
            borderTop: state === 'error' ? '3px solid #FF4455' : '3px solid #00C8E8',
            animation: state === 'redirecting' || state === 'loading' || state === 'closing' ? 'spin 0.8s linear infinite' : 'none',
          }}
        />
        <h1 style={{ margin: '0 0 8px', fontSize: '1.35rem', lineHeight: 1.2 }}>
          {state === 'error' ? 'Sign-in could not finish' : 'Finalizing authentication'}
        </h1>
        <p style={{ margin: 0, color: 'rgba(239,246,255,0.7)' }}>{message}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
