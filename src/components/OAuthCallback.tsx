import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../utils/supabase/client';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

/**
 * OAuthCallback — handles the redirect from Google/Facebook OAuth.
 *
 * Route: /auth/callback
 *
 * After the provider redirects back with the auth code, Supabase JS
 * automatically exchanges it for a session. This component waits for
 * that session, optionally creates a profile on the server, and
 * navigates to the dashboard.
 */
export function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');

  useEffect(() => {
    let cancelled = false;

    const handleOAuthCallback = async () => {
      try {
        setStatus('Checking authentication...');

        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // Give Supabase a moment to process the URL hash and establish the session
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get the session — Supabase should have parsed the hash fragment by now
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[OAuthCallback] Session error:', sessionError);
          throw new Error('Failed to get session: ' + sessionError.message);
        }

        if (!session) {
          // Retry once more after a short delay (providers can be slow)
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: retry } = await supabase.auth.getSession();
          if (!retry.session) {
            throw new Error('No session found after OAuth. Please try logging in again.');
          }
        }

        if (cancelled) return;

        console.log('[OAuthCallback] Session established');
        setStatus('Authentication successful! Redirecting...');

        // Brief pause so the user sees the success message
        await new Promise(resolve => setTimeout(resolve, 600));

        if (!cancelled) {
          // If we're inside a popup window opened by the main Wasel tab,
          // close the popup so the main window can react to the new session
          // via onAuthStateChange (localStorage event).
          if (window.opener && !window.opener.closed) {
            window.close();
          } else {
            navigate('/app/dashboard', { replace: true });
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[OAuthCallback] Error:', err);
        setError(err.message || 'An error occurred during authentication');
        setStatus('Authentication failed');
      }
    };

    handleOAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0B1120' }}>
        <div
          className="max-w-md w-full space-y-6 p-8 rounded-2xl"
          style={{
            background: 'rgba(17, 27, 46, 0.95)',
            border: '1px solid rgba(30, 41, 59, 0.8)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Error icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>Authentication Error</h2>
              <p className="text-sm" style={{ color: '#94A3B8' }}>خطأ في المصادقة</p>
            </div>
          </div>

          {/* Error message */}
          <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{error}</p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/auth?tab=login', { replace: true })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'rgba(4, 173, 191, 0.12)',
                color: '#04ADBF',
                border: '1px solid rgba(4, 173, 191, 0.25)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: '#04ADBF',
                color: '#0B1120',
              }}
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0B1120' }}>
      <LoadingSpinner />
      <div className="text-center">
        <p className="text-lg font-medium" style={{ color: '#F1F5F9' }}>{status}</p>
        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>...استنا شوي | Please wait</p>
      </div>
    </div>
  );
}