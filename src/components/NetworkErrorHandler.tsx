/**
 * Network Error Handler Component
 * Handles network connection errors and page refresh issues.
 * Bilingual (AR/EN) with dynamic Supabase URL.
 */

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
// Remove the invalid '../lib/history' import — history is a browser global (window.history)

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

// Bilingual labels
const labels = {
  en: {
    connectionError: 'Connection Error',
    offline: 'Your device is offline. Please check your internet connection.',
    serverUnreachable: 'Unable to connect to Wasel servers. This might be a temporary network issue.',
    retrying: 'Retrying...',
    retry: 'Retry Connection',
    forceReload: 'Force Reload',
    tip1: 'Check your WiFi or mobile data',
    tip2: 'Try refreshing the page',
    tip3: 'Clear browser cache if problem persists',
    deviceOnline: 'Device is Online',
    deviceOnlineDesc: "Your device has internet connection, but we can't reach Wasel servers. This is likely a temporary issue.",
  },
  ar: {
    connectionError: 'غلط بالاتصال',
    offline: 'جهازك مش متصل بالإنترنت. شوف اتصالك.',
    serverUnreachable: 'ما قدرنا نتصل بسيررات واصل. ممكن تكون مشكلة مؤقتة بالشبكة.',
    retrying: 'عم نحاول مرة ثانية...',
    retry: 'حاول مرة ثانية',
    forceReload: 'إعادة تحميل إجبارية',
    tip1: 'شوف شبكة الواي فاي أو بيانات التلفون',
    tip2: 'جرّب تحدّث الصفحة',
    tip3: 'امسح ذاكرة المتصفح إذا ضل في مشكلة',
    deviceOnline: 'الجهاز متصل',
    deviceOnlineDesc: 'جهازك متصل بالإنترنت، بس ما قدرنا نوصل لسيرفرات واصل. غالبًا مشكلة مؤقتة.',
  },
};

function getLang(): 'en' | 'ar' {
  try {
    const saved = localStorage.getItem('wasel-language');
    return saved === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

export function NetworkErrorHandler({ children }: NetworkErrorHandlerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const t = labels[getLang()];

  // Build health URL dynamically from projectId
  const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasError(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasError(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setIsOnline(true);
        setHasError(false);
        // Do NOT call window.location.reload() — it triggers Figma's iframe onload
        // → setupMessageChannel → IframeMessageAbortError.
        // Instead, navigate home via history API (no page reload).
        try {
          window.history.replaceState(null, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch { /* silently ignore */ }
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      setHasError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleForceReload = () => {
    localStorage.removeItem('wasel-auth-token');
    sessionStorage.clear();
    // Same: avoid window.location.reload() to prevent IframeMessageAbortError.
    try {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.replace('/');
    }
  };

  // Don't show error if we're online
  if (isOnline && !hasError) {
    return <>{children}</>;
  }

  return (
    <>
      {!isOnline || hasError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 space-y-4">
            <Alert variant="destructive" className="bg-card border-red-800 text-foreground">
              <WifiOff className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold text-foreground">{t.connectionError}</AlertTitle>
              <AlertDescription className="space-y-4 text-muted-foreground">
                <p>
                  {!isOnline ? t.offline : t.serverUnreachable}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t.retrying}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t.retry}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleForceReload}
                    variant="outline"
                    className="flex-1 border-border text-foreground hover:bg-secondary"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t.forceReload}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>&#8226; {t.tip1}</p>
                  <p>&#8226; {t.tip2}</p>
                  <p>&#8226; {t.tip3}</p>
                </div>
              </AlertDescription>
            </Alert>

            {isOnline && (
              <Alert className="bg-card border-border text-foreground">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertTitle className="text-foreground">{t.deviceOnline}</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  {t.deviceOnlineDesc}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      ) : null}
      
      {children}
    </>
  );
}