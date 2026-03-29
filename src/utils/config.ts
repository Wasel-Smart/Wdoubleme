/**
 * Application Configuration
 * Central configuration file for environment-specific settings
 */

// Environment detection
export const isDevelopment = import.meta.env?.DEV ?? false;
export const isProduction = import.meta.env?.PROD ?? true;

// Logging configuration
export const enableDebugLogs = isDevelopment;
export const enableInfoLogs = true;
export const enableErrorLogs = true;

// Feature flags for staging/production
export const featureFlags = {
  // Core features (always enabled)
  authentication: true,
  tripBooking: true,
  messaging: true,
  payments: true,
  
  // Premium features
  businessAccounts: true,
  recurringTrips: true,
  splitPayments: true,
  referralProgram: true,
  
  // Beta features (can be toggled for staging)
  aiMatching: isDevelopment, // Only in dev for now
  advancedAnalytics: true,
  
  // Debug features (dev only)
  debugPanel: isDevelopment,
  mockData: isDevelopment,
};

// API Configuration
export const apiConfig = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Performance monitoring
export const performanceConfig = {
  enableMetrics: isProduction,
  sampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
};

// Security configuration
export const securityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes in ms
  sessionTimeout: 3600000, // 1 hour in ms
  requireEmailVerification: isProduction,
};

// Map configuration
export const mapConfig = {
  defaultCenter: { lat: 25.2048, lng: 55.2708 }, // Dubai
  defaultZoom: 12,
  markerClusterEnabled: true,
};

// Notification configuration
export const notificationConfig = {
  enablePushNotifications: true,
  enableEmailNotifications: isProduction,
  enableSMSNotifications: isProduction,
};

// Application metadata
export const appMetadata = {
  name: 'Wassel',
  version: '1.0.0-staging',
  environment: isProduction ? 'production' : 'development',
  supportedLanguages: ['en', 'ar'],
  defaultLanguage: 'en',
  supportedCurrencies: ['JOD', 'AED', 'SAR', 'EGP', 'KWD', 'BHD', 'QAR', 'OMR', 'USD'],
  defaultCurrency: 'JOD',
};

// Logger utility with environment awareness
export const logger = {
  debug: (...args: any[]) => {
    if (enableDebugLogs) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (enableInfoLogs) {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    if (enableErrorLogs) {
      console.error('[ERROR]', ...args);
    }
  },
};