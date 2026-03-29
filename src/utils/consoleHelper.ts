/**
 * Wassel App - Console Logger
 * Provides helpful debugging information in the browser console
 */

// Only run in development
if (import.meta.env.DEV) {
  const styles = {
    title: 'font-size: 20px; font-weight: bold; color: #4F46E5;',
    success: 'color: #10b981; font-weight: bold;',
    warning: 'color: #f59e0b; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    info: 'color: #3b82f6;',
    muted: 'color: #9ca3af;',
  };

  console.log('%c🚀 Wassel App', styles.title);
  console.log('%cVersion: 2.0.0', styles.muted);
  console.log('%cEnvironment: Development', styles.muted);
  console.log('');

  // Check environment variables
  console.log('%c📋 Environment Variables:', styles.info);
  const envCheck = {
    'Google Maps API': !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    'Stripe': !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    'Supabase': !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Google OAuth': !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
  };

  Object.entries(envCheck).forEach(([key, value]) => {
    const style = value ? styles.success : styles.error;
    const icon = value ? '✓' : '✗';
    console.log(`  ${icon} %c${key}: %c${value ? 'Configured' : 'Missing'}`, styles.muted, style);
  });

  console.log('');

  // Check localStorage
  console.log('%c💾 LocalStorage:', styles.info);
  try {
    const language = localStorage.getItem('wasel-language');
    console.log(`  • Language: %c${language || 'default (en)'}`, styles.muted);
    
    const authToken = localStorage.getItem('wasel-auth-token');
    console.log(`  • Auth Token: %c${authToken ? 'Present' : 'Not logged in'}`, styles.muted);
  } catch (error) {
    console.log('  %c✗ LocalStorage Error:', styles.error, error);
  }

  console.log('');

  // Helpful commands
  console.log('%c🔧 Helpful Commands:', styles.info);
  console.log('');
  console.log('%c  Clear localStorage:', styles.muted);
  console.log('    localStorage.clear()');
  console.log('');
  console.log('%c  Check Supabase client:', styles.muted);
  console.log('    import { supabase } from "./utils/supabase/client"');
  console.log('    await supabase.auth.getSession()');
  console.log('');
  console.log('%c  Test environment variables:', styles.muted);
  console.log('    console.table({');
  console.log('      googleMaps: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,');
  console.log('      stripe: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,');
  console.log('    })');
  console.log('');

  // Add global helper functions
  (window as any).wasselDebug = {
    clearCache: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('%c✓ Cache cleared!', styles.success);
      console.log('%cReload the page to continue.', styles.muted);
    },
    
    checkEnv: () => {
      console.table(envCheck);
    },
    
    getSession: async () => {
      try {
        const { supabase } = await import('./supabase/client');
        const { data, error } = await supabase.auth.getSession();
        console.log('%cSession:', styles.info, data);
        if (error) console.log('%cError:', styles.error, error);
        return data;
      } catch (error) {
        console.log('%cError loading Supabase:', styles.error, error);
      }
    },

    testIntegrations: () => {
      console.log('%c🧪 Testing Integrations...', styles.info);
      console.log('');
      
      // Google Maps
      if (typeof google !== 'undefined' && google.maps) {
        console.log('%c✓ Google Maps:', styles.success, 'Loaded');
      } else {
        console.log('%c○ Google Maps:', styles.warning, 'Not loaded yet (normal on initial page)');
      }
      
      // Stripe
      if (typeof window.Stripe !== 'undefined') {
        console.log('%c✓ Stripe:', styles.success, 'Loaded');
      } else {
        console.log('%c○ Stripe:', styles.warning, 'Not loaded yet (loads on payment pages)');
      }
      
      // Supabase
      import('./supabase/client').then(({ supabase }) => {
        if (supabase) {
          console.log('%c✓ Supabase:', styles.success, 'Connected');
        } else {
          console.log('%c✗ Supabase:', styles.error, 'Not connected');
        }
      });
    },

    help: () => {
      console.log('%c🆘 Wassel Debug Helper', styles.title);
      console.log('');
      console.log('%cAvailable commands:', styles.info);
      console.log('');
      console.log('  %cwasselDebug.clearCache()%c      - Clear all cached data', styles.success, styles.muted);
      console.log('  %cwasselDebug.checkEnv()%c        - Check environment variables', styles.success, styles.muted);
      console.log('  %cwasselDebug.getSession()%c      - Get current Supabase session', styles.success, styles.muted);
      console.log('  %cwasselDebug.testIntegrations()%c - Test API integrations', styles.success, styles.muted);
      console.log('  %cwasselDebug.help()%c            - Show this help message', styles.success, styles.muted);
      console.log('');
    },
  };

  console.log('%c💡 Type %cwasselDebug.help()%c for helpful debugging commands', 
    styles.info, 
    'color: #10b981; font-weight: bold; font-family: monospace;',
    styles.info
  );
  console.log('');
}

// Export empty object to make this a valid module
export {};