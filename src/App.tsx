/**
 * Wasel — App Entry Point v5.0
 * 14-service Mobility OS · Premium Light Theme · Working Auth
 *
 * Wrapped with a top-level ErrorBoundary to prevent unhandled React errors
 * from crashing the app and triggering an iframe reload (which causes
 * IframeMessageAbortError in Figma's setupMessageChannel).
 */
import { Component, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { LocalAuthProvider } from './contexts/LocalAuth';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { waselRouter } from './wasel-routes';

// ── Top-level Error Boundary ───────────────────────────────────────────────
interface EBState { hasError: boolean; error: string }

class AppErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(err: unknown): EBState {
    const msg = err instanceof Error ? err.message : String(err);
    // Swallow Figma message-port errors entirely — they are not app errors
    const figmaPatterns = [
      'IframeMessageAbortError', 'message port was destroyed',
      'Message aborted', 'setupMessageChannel', 'figma_app-',
    ];
    const isFigmaErr = figmaPatterns.some(p => msg.includes(p));
    if (isFigmaErr) return { hasError: false, error: '' };
    return { hasError: true, error: msg };
  }

  componentDidCatch(err: unknown, info: { componentStack?: string | null }) {
    const msg = err instanceof Error ? err.message : String(err);
    const figmaPatterns = [
      'IframeMessageAbortError', 'message port was destroyed',
      'Message aborted', 'setupMessageChannel',
    ];
    if (figmaPatterns.some(p => msg.includes(p))) return;
    console.error('[Wasel ErrorBoundary]', msg, info?.componentStack ?? '');
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        fontFamily: "-apple-system,'Inter',sans-serif",
        background: '#F0F4FA', padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0B1D45', marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ color: '#8A9ABD', fontSize: '0.875rem', marginBottom: 24, maxWidth: 360 }}>
          {this.state.error || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => this.setState({ hasError: false, error: '' })}
          style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #00CAFF, #2060E8)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
}

// ── App root ───────────────────────────────────────────────────────────────
export default function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <LocalAuthProvider>
            <AuthProvider>
              <RouterProvider router={waselRouter} />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: '#0A1628',
                    border: '1px solid rgba(0,200,232,0.25)',
                    color: '#EFF6FF',
                    fontFamily: "-apple-system,'Inter',sans-serif",
                  },
                }}
              />
            </AuthProvider>
          </LocalAuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
