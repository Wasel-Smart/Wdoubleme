/**
 * AI Error Boundary Component
 * Catches errors in AI Intelligence components and provides fallback UI
 */

import { Component, ReactNode } from 'react';
import { Brain, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to console
    console.error('[AIErrorBoundary] Component crashed:', {
      component: this.props.componentName || 'Unknown',
      error: error.message,
      stack: error.stack,
      errorInfo,
    });

    // TODO: Send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-red-900 mb-2">
              خطأ في الميزة الذكية
            </h3>
            <p className="text-lg text-red-700 mb-4">AI Feature Error</p>

            {/* Error Message */}
            <div className="bg-white border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-mono text-red-600">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
              {this.props.componentName && (
                <p className="text-xs text-gray-500 mt-2">
                  Component: {this.props.componentName}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-red-700 mb-6">
              نعتذر عن الإزعاج. حدث خطأ في تحميل هذه الميزة.
              <br />
              يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                إعادة المحاولة
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                  Technical Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error fallback for inline components
 */
export function AIErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-red-900 mb-1">Feature Error</h4>
          <p className="text-sm text-red-700 mb-3">{error.message}</p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
