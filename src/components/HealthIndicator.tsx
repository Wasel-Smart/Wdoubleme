import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

/**
 * Development-only health indicator
 * Shows in bottom-right corner in dev mode
 * Displays status of critical systems
 */
export function HealthIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const [health, setHealth] = useState({
    app: 'checking',
    env: 'checking',
    supabase: 'checking',
    localStorage: 'checking',
  });

  // Check if we're in development mode (safe check)
  const isDevelopment = typeof import.meta.env !== 'undefined' && import.meta.env.MODE === 'development';

  useEffect(() => {
    // Only show in development
    if (!isDevelopment) return;

    checkHealth();
  }, [isDevelopment]);

  const checkHealth = async () => {
    const newHealth = { ...health };

    // Check app
    newHealth.app = 'healthy';

    // Check environment variables (with safety checks)
    try {
      const hasGoogleMaps = typeof import.meta.env !== 'undefined' && !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const hasStripe = typeof import.meta.env !== 'undefined' && !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const hasSupabase = typeof import.meta.env !== 'undefined' && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      newHealth.env = (hasGoogleMaps && hasStripe && hasSupabase) ? 'healthy' : 'warning';
    } catch (error) {
      newHealth.env = 'error';
    }

    // Check Supabase connection
    try {
      const { supabase } = await import('../utils/supabase/client');
      if (supabase) {
        const { error } = await supabase.auth.getSession();
        newHealth.supabase = error ? 'warning' : 'healthy';
      } else {
        newHealth.supabase = 'error';
      }
    } catch (error) {
      newHealth.supabase = 'error';
    }

    // Check localStorage
    try {
      localStorage.setItem('health-check', 'ok');
      localStorage.removeItem('health-check');
      newHealth.localStorage = 'healthy';
    } catch (error) {
      newHealth.localStorage = 'error';
    }

    setHealth(newHealth);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const overallStatus = Object.values(health).every(s => s === 'healthy') 
    ? 'healthy' 
    : Object.values(health).some(s => s === 'error')
    ? 'error'
    : 'warning';

  // Only render in development
  if (!isDevelopment) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status indicator button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3 rounded-full shadow-lg transition-all
          ${overallStatus === 'healthy' ? 'bg-green-500 hover:bg-green-600' : ''}
          ${overallStatus === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          ${overallStatus === 'error' ? 'bg-red-500 hover:bg-red-600' : ''}
          text-white
        `}
        title="System Health"
      >
        <div className="w-6 h-6 flex items-center justify-center font-bold">
          {overallStatus === 'healthy' ? '✓' : overallStatus === 'error' ? '✗' : '!'}
        </div>
        
        {/* Pulse animation for errors */}
        {overallStatus !== 'healthy' && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(overallStatus)} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor(overallStatus)}`}></span>
          </span>
        )}
      </button>

      {/* Expanded status panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-72 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">
              System Health
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            {/* App Status */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">App</span>
              <div className="flex items-center gap-2">
                {getIcon(health.app)}
                <span className="text-xs text-gray-500 capitalize">{health.app}</span>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">API Keys</span>
              <div className="flex items-center gap-2">
                {getIcon(health.env)}
                <span className="text-xs text-gray-500 capitalize">{health.env}</span>
              </div>
            </div>

            {/* Supabase */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Supabase</span>
              <div className="flex items-center gap-2">
                {getIcon(health.supabase)}
                <span className="text-xs text-gray-500 capitalize">{health.supabase}</span>
              </div>
            </div>

            {/* LocalStorage */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-600 dark:text-gray-400">Storage</span>
              <div className="flex items-center gap-2">
                {getIcon(health.localStorage)}
                <span className="text-xs text-gray-500 capitalize">{health.localStorage}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={checkHealth}
              className="w-full py-1.5 px-3 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
            >
              Refresh Status
            </button>
          </div>

          <div className="mt-2 text-xs text-center text-gray-400">
            Dev Mode Only
          </div>
        </div>
      )}
    </div>
  );
}