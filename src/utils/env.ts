/**
 * Safe environment variable access utility
 * Prevents errors when import.meta.env is undefined
 */

/**
 * Safely get an environment variable
 * @param key - The environment variable key
 * @param defaultValue - Default value if not found
 * @returns The environment variable value or default
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  try {
    if (typeof import.meta === 'undefined' || typeof import.meta.env === 'undefined') {
      return defaultValue;
    }
    return (import.meta.env[key] as string) || defaultValue;
  } catch (error) {
    console.warn(`Failed to access environment variable: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Check if we're in production mode
 */
export function isProd(): boolean {
  try {
    return typeof import.meta !== 'undefined' && 
           typeof import.meta.env !== 'undefined' && 
           import.meta.env.PROD === true;
  } catch {
    return false;
  }
}

/**
 * Check if we're in development mode
 */
export function isDev(): boolean {
  try {
    return typeof import.meta !== 'undefined' && 
           typeof import.meta.env !== 'undefined' && 
           import.meta.env.DEV === true;
  } catch {
    return false;
  }
}

/**
 * Get the current mode (development, production, etc.)
 */
export function getMode(): string {
  try {
    if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
      return import.meta.env.MODE || 'development';
    }
    return 'development';
  } catch {
    return 'development';
  }
}

/**
 * Check if an environment variable is set
 */
export function hasEnv(key: string): boolean {
  try {
    return typeof import.meta !== 'undefined' && 
           typeof import.meta.env !== 'undefined' && 
           !!import.meta.env[key];
  } catch {
    return false;
  }
}

/**
 * Get all common environment variables
 */
export function getConfig() {
  return {
    // Mode
    mode: getMode(),
    isProd: isProd(),
    isDev: isDev(),
    
    // Supabase
    supabaseUrl: getEnv('VITE_SUPABASE_URL'),
    supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
    
    // Google Maps
    googleMapsApiKey: getEnv('VITE_GOOGLE_MAPS_API_KEY'),
    
    // Stripe
    stripePublishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY'),
    
    // Firebase
    firebaseApiKey: getEnv('VITE_FIREBASE_API_KEY'),
    firebaseAuthDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    firebaseProjectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    firebaseStorageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    firebaseMessagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    firebaseAppId: getEnv('VITE_FIREBASE_APP_ID'),
    firebaseVapidKey: getEnv('VITE_FIREBASE_VAPID_KEY'),
    
    // Sentry
    sentryDsn: getEnv('VITE_SENTRY_DSN'),
    
    // Analytics
    gaMeasurementId: getEnv('VITE_GA_MEASUREMENT_ID'),
    
    // App
    appUrl: getEnv('VITE_APP_URL', 'http://localhost:5173'),
    appName: getEnv('VITE_APP_NAME', 'Wasel'),
  };
}
