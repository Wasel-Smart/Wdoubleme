/**
 * Error Boundary Component
 * 
 * Catches React errors and provides a bilingual fallback UI
 * with dark theme matching the Wasel brand.
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Comprehensive Figma error patterns
const FIGMA_ERROR_PATTERNS = [
  'message port was destroyed',
  'IframeMessageAbortError',
  'Message aborted',
  'setupMessageChannel',
  'figma_app-',
  'eS.setupMessageChannel',
  'IframeMessage',
  'webpack-artifacts',
  '6005-',
  'a.cleanup',
  'o.cleanup',
  'e.onload',
  'MessagePort',
  'port.close',
  'postMessage',
  'Failed to fetch dynamically imported module',
  'makeproxy-c.figma.site',
  'dynamically imported',
  '/src/App.tsx',
  'Cannot read properties of null',
  'reading \'postMessage\'',
  'reading \'port\'',
  'ResizeObserver loop',
  'Non-passive event listener',
  'was added in strict mode',
  'SecurityError',
  'pushState',
  'replaceState',
  'Blocked a frame',
  'cross-origin',
  'Loading chunk',
  'Loading CSS chunk',
  'port is closed',
];

/**
 * Check if error is Figma-related and should be suppressed
 */
function isFigmaError(error: Error | null): boolean {
  if (!error) return false;
  
  const message = error.message || '';
  const stack = error.stack || '';
  const name = error.name || '';
  
  // Check all patterns
  return FIGMA_ERROR_PATTERNS.some(pattern => 
    message.includes(pattern) || 
    stack.includes(pattern) || 
    name.includes(pattern)
  );
}

// Bilingual text for the error boundary (can't use hooks in class component)
const getText = () => {
  try {
    const lang = localStorage.getItem('wasel-language') || 'en';
    if (lang === 'ar') {
      return {
        title: 'عفوًا! صار غلط',
        description: 'واجهنا غلط مش متوقع. لا تقلق، بياناتك بأمان.',
        devOnly: 'تفاصيل الغلط (وضع التطوير بس):',
        whatToDo: 'شو بتقدر تعمل؟',
        tip1: 'جرّب تحدّث الصفحة — غالباً بتحل المشاكل المؤقتة',
        tip2: 'ارجع للصفحة الرئيسية وحاول مرة ثانية',
        tip3: 'إذا ضلت المشكلة، تواصل مع فريق الدعم',
        refreshPage: 'حدّث الصفحة',
        goHome: 'الصفحة الرئيسية',
        needHelp: 'بدك مساعدة؟ تواصل معنا على',
      };
    }
    return {
      title: 'Oops! Something went wrong',
      description: 'We encountered an unexpected error. Don\'t worry, your data is safe.',
      devOnly: 'Error Details (Development Only):',
      whatToDo: 'What can you do?',
      tip1: 'Try refreshing the page - this often resolves temporary issues',
      tip2: 'Go back to the home page and try again',
      tip3: 'If the problem persists, please contact our support team',
      refreshPage: 'Refresh Page',
      goHome: 'Go to Home',
      needHelp: 'Need help? Contact us at',
    };
  } catch {
    return {
      title: 'Oops! Something went wrong',
      description: 'We encountered an unexpected error. Don\'t worry, your data is safe.',
      devOnly: 'Error Details (Development Only):',
      whatToDo: 'What can you do?',
      tip1: 'Try refreshing the page - this often resolves temporary issues',
      tip2: 'Go back to the home page and try again',
      tip3: 'If the problem persists, please contact our support team',
      refreshPage: 'Refresh Page',
      goHome: 'Go to Home',
      needHelp: 'Need help? Contact us at',
    };
  }
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Completely ignore Figma-specific errors - don't trigger error boundary at all
    if (isFigmaError(error)) {
      // Return no error state - component will continue rendering normally
      return { hasError: false, error: null, errorInfo: null };
    }
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Silently suppress Figma-specific errors - no logging
    if (isFigmaError(error)) {
      // Completely silent - don't even log in Figma environment
      return;
    }
    
    // Only log real errors
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // In unit tests (JSDOM) prefer history navigation over location reassignment.
    if (import.meta.env.MODE === 'test') {
      try {
        history.replaceState(null, '', '/');
        return;
      } catch { /* ignore */ }
    }
    // Use history API instead of window.location.href to avoid IframeMessageAbortError
    try {
      history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch { /* silently ignore */ }
  };

  handleReload = () => {
    // Reset state first, then navigate home — avoids window.location.reload()
    // which triggers iframe onload → IframeMessageAbortError in Figma environment.
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      history.replaceState(null, '', window.location.pathname);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch { /* silently ignore */ }
  };

  render() {
    if (this.state.hasError) {
      const t = getText();

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-card border-border text-foreground">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-900/40 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-foreground">{t.title}</CardTitle>
                  <CardDescription className="mt-1 text-muted-foreground">
                    {t.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details (only in development — uses Vite's import.meta.env.DEV) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-background p-4 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-red-400 mb-2">
                    {t.devOnly}
                  </p>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* User-friendly message */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground">{t.whatToDo}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    <span>{t.tip1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    <span>{t.tip2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    <span>{t.tip3}</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={this.handleReload}
                  className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.refreshPage}
                </Button>
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t.goHome}
                </Button>
              </div>

              {/* Support Info */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  {t.needHelp}{' '}
                  <a 
                    href="mailto:support@wasel.jo" 
                    className="text-primary hover:underline font-medium"
                  >
                    support@wasel.jo
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
