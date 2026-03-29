/**
 * Production Error Boundary - Wasel | واصل
 * Enterprise-grade error handling with recovery mechanisms
 * 
 * Features:
 * - Graceful error handling with user-friendly messages
 * - Error logging to console (can be extended to external services)
 * - Automatic retry mechanism
 * - Fallback UI with brand identity
 * - Stack trace display (development only)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logoImage from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service like Sentry)
    console.error('🚨 [Production Error Boundary] Error caught:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Reload the page if error persists
    if (this.state.errorCount > 2) {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/app';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default production error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4"
          style={{ background: '#040C18' }}>
          <div className="max-w-md w-full rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'rgba(10,22,40,0.8)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,200,232,0.12)',
            }}>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src={logoImage}
                alt="Wasel Logo"
                className="w-20 h-20 object-contain"
                style={{ filter: 'drop-shadow(0 0 16px rgba(0,200,232,0.6))' }}
              />
            </div>

            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,68,85,0.1)', border: '1px solid rgba(255,68,85,0.2)' }}>
                <AlertTriangle className="w-8 h-8" style={{ color: '#FF4455' }} />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#EFF6FF' }}>
              Something Went Wrong
            </h1>
            <p className="text-center mb-2" dir="rtl" style={{ color: 'rgba(148,163,184,0.7)' }}>
              حدث خطأ غير متوقع
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,68,85,0.15)' }}>
                <p className="text-xs font-mono mb-2" style={{ color: '#FF4455' }}>
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    <summary className="cursor-pointer hover:opacity-80">Stack Trace</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Error Count Warning */}
            {this.state.errorCount > 1 && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(240,168,48,0.08)', border: '1px solid rgba(240,168,48,0.2)' }}>
                <p className="text-xs text-center" style={{ color: '#F0A830' }}>
                  {this.state.errorCount > 2
                    ? 'The page will reload automatically'
                    : `Error occurred ${this.state.errorCount} times`}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #00C8E8, #00C875)', color: '#040C18' }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#EFF6FF' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-center text-slate-500">
              If the problem persists, please contact support at{' '}
              <a
                href="mailto:support@wasel.jo"
                className="text-cyan-400 hover:underline"
              >
                support@wasel.jo
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}