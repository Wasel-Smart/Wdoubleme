/**
 * Integration Configuration Validator
 * 
 * Validates all third-party API integrations and provides detailed status
 */

import { INTEGRATION_CONFIG } from '../services/integrations';

export interface IntegrationStatus {
  name: string;
  key: string;
  configured: boolean;
  enabled: boolean;
  critical: boolean;
  testable: boolean;
  status: 'active' | 'configured' | 'missing' | 'error';
  message?: string;
  details?: Record<string, any>;
}

export interface IntegrationReport {
  timestamp: string;
  overall: 'healthy' | 'warning' | 'critical';
  readyForProduction: boolean;
  integrations: IntegrationStatus[];
  summary: {
    total: number;
    configured: number;
    missing: number;
    critical: number;
    criticalMissing: number;
  };
}

/**
 * Validate all integrations and return comprehensive status report
 */
export function validateIntegrations(): IntegrationReport {
  const integrations: IntegrationStatus[] = [
    // Google Maps
    {
      name: 'Google Maps API',
      key: 'googleMaps',
      configured: !!INTEGRATION_CONFIG.googleMaps.apiKey,
      enabled: INTEGRATION_CONFIG.googleMaps.enabled,
      critical: true,
      testable: true,
      status: INTEGRATION_CONFIG.googleMaps.enabled ? 'active' : 'missing',
      message: INTEGRATION_CONFIG.googleMaps.enabled 
        ? 'Maps, routing, and geocoding ready' 
        : 'Required for core trip functionality',
      details: {
        libraries: INTEGRATION_CONFIG.googleMaps.libraries,
        apiKey: INTEGRATION_CONFIG.googleMaps.apiKey ? '✓ Configured' : '✗ Missing'
      }
    },

    // Google OAuth
    {
      name: 'Google OAuth',
      key: 'googleOAuth',
      configured: !!INTEGRATION_CONFIG.googleOAuth.clientId,
      enabled: INTEGRATION_CONFIG.googleOAuth.enabled,
      critical: false,
      testable: true,
      status: INTEGRATION_CONFIG.googleOAuth.enabled ? 'configured' : 'missing',
      message: INTEGRATION_CONFIG.googleOAuth.enabled 
        ? 'Social login available' 
        : 'Optional - enables Google Sign-In',
      details: {
        clientId: INTEGRATION_CONFIG.googleOAuth.clientId ? '✓ Configured' : '✗ Missing',
        note: 'Requires redirect URI configuration in Google Cloud Console'
      }
    },

    // Stripe
    {
      name: 'Stripe Payments',
      key: 'stripe',
      configured: !!INTEGRATION_CONFIG.stripe.publishableKey,
      enabled: INTEGRATION_CONFIG.stripe.enabled,
      critical: true,
      testable: true,
      status: INTEGRATION_CONFIG.stripe.enabled ? 'active' : 'missing',
      message: INTEGRATION_CONFIG.stripe.enabled 
        ? `Payment processing ready (${INTEGRATION_CONFIG.stripe.testMode ? 'TEST MODE' : 'LIVE MODE'})` 
        : 'Required for payment processing',
      details: {
        mode: INTEGRATION_CONFIG.stripe.testMode ? 'Test' : 'Live',
        publishableKey: INTEGRATION_CONFIG.stripe.publishableKey ? '✓ Configured' : '✗ Missing',
        warning: INTEGRATION_CONFIG.stripe.testMode ? 'Switch to live keys before production' : undefined
      }
    },

    // Twilio
    {
      name: 'Twilio SMS & Voice',
      key: 'twilio',
      configured: !!INTEGRATION_CONFIG.twilio.accountSid,
      enabled: INTEGRATION_CONFIG.twilio.enabled,
      critical: true,
      testable: true,
      status: INTEGRATION_CONFIG.twilio.enabled ? 'active' : 'missing',
      message: INTEGRATION_CONFIG.twilio.enabled 
        ? 'SMS verification and notifications ready' 
        : 'Required for phone verification',
      details: {
        accountSid: INTEGRATION_CONFIG.twilio.accountSid ? '✓ Configured' : '✗ Missing',
        note: 'Auth token must be configured in server environment'
      }
    },

    // Supabase
    {
      name: 'Supabase Backend',
      key: 'supabase',
      configured: !!INTEGRATION_CONFIG.supabase.url && !!INTEGRATION_CONFIG.supabase.anonKey,
      enabled: INTEGRATION_CONFIG.supabase.enabled,
      critical: true,
      testable: true,
      status: INTEGRATION_CONFIG.supabase.enabled ? 'active' : 'missing',
      message: INTEGRATION_CONFIG.supabase.enabled 
        ? 'Database and auth fully operational' 
        : 'Core backend infrastructure required',
      details: {
        url: INTEGRATION_CONFIG.supabase.url ? '✓ Configured' : '✗ Missing',
        anonKey: INTEGRATION_CONFIG.supabase.anonKey ? '✓ Configured' : '✗ Missing'
      }
    },

    // SendGrid (Optional)
    {
      name: 'SendGrid Email',
      key: 'sendgrid',
      configured: !!INTEGRATION_CONFIG.sendgrid.apiKey,
      enabled: INTEGRATION_CONFIG.sendgrid.enabled,
      critical: false,
      testable: false,
      status: INTEGRATION_CONFIG.sendgrid.enabled ? 'configured' : 'missing',
      message: INTEGRATION_CONFIG.sendgrid.enabled 
        ? 'Email notifications available' 
        : 'Optional - for transactional emails',
    },

    // Firebase (Optional)
    {
      name: 'Firebase Push Notifications',
      key: 'firebase',
      configured: !!INTEGRATION_CONFIG.firebase.apiKey && !!INTEGRATION_CONFIG.firebase.projectId,
      enabled: INTEGRATION_CONFIG.firebase.enabled,
      critical: false,
      testable: false,
      status: INTEGRATION_CONFIG.firebase.enabled ? 'configured' : 'missing',
      message: INTEGRATION_CONFIG.firebase.enabled 
        ? 'Push notifications available' 
        : 'Optional - for mobile push notifications',
    },

    // Jumio (Optional)
    {
      name: 'Jumio Identity Verification',
      key: 'jumio',
      configured: !!INTEGRATION_CONFIG.jumio.apiKey,
      enabled: INTEGRATION_CONFIG.jumio.enabled,
      critical: false,
      testable: false,
      status: INTEGRATION_CONFIG.jumio.enabled ? 'configured' : 'missing',
      message: INTEGRATION_CONFIG.jumio.enabled 
        ? 'Identity verification available' 
        : 'Optional - for driver background checks',
    }
  ];

  // Calculate summary
  const total = integrations.length;
  const configured = integrations.filter(i => i.configured).length;
  const missing = integrations.filter(i => !i.configured).length;
  const critical = integrations.filter(i => i.critical).length;
  const criticalMissing = integrations.filter(i => i.critical && !i.configured).length;

  // Determine overall status
  let overall: 'healthy' | 'warning' | 'critical';
  if (criticalMissing > 0) {
    overall = 'critical';
  } else if (missing > 0) {
    overall = 'warning';
  } else {
    overall = 'healthy';
  }

  const readyForProduction = criticalMissing === 0;

  return {
    timestamp: new Date().toISOString(),
    overall,
    readyForProduction,
    integrations,
    summary: {
      total,
      configured,
      missing,
      critical,
      criticalMissing
    }
  };
}

/**
 * Get a specific integration status
 */
export function getIntegrationStatus(key: string): IntegrationStatus | undefined {
  const report = validateIntegrations();
  return report.integrations.find(i => i.key === key);
}

/**
 * Check if all critical integrations are configured
 */
export function areCriticalIntegrationsConfigured(): boolean {
  const report = validateIntegrations();
  return report.summary.criticalMissing === 0;
}

/**
 * Get human-readable summary
 */
export function getIntegrationSummary(): string {
  const report = validateIntegrations();
  const { configured, total, criticalMissing } = report.summary;
  
  if (criticalMissing > 0) {
    return `⚠️ ${criticalMissing} critical integration(s) missing. App may not function correctly.`;
  }
  
  if (configured === total) {
    return `✅ All ${total} integrations configured and ready for production.`;
  }
  
  return `⚡ ${configured}/${total} integrations configured. ${total - configured} optional integration(s) missing.`;
}

/**
 * Log integration status to console (development only)
 */
export function logIntegrationStatus(): void {
  if (import.meta?.env?.DEV) {
    const report = validateIntegrations();
    
    console.group('🔌 Integration Status Report');
    console.log(`Overall: ${report.overall.toUpperCase()}`);
    console.log(`Production Ready: ${report.readyForProduction ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Configured: ${report.summary.configured}/${report.summary.total}`);
    
    if (report.summary.criticalMissing > 0) {
      console.warn(`Critical Missing: ${report.summary.criticalMissing}`);
    }
    
    console.groupCollapsed('Details');
    report.integrations.forEach(integration => {
      const icon = integration.configured ? '✅' : integration.critical ? '❌' : '⚠️';
      console.log(`${icon} ${integration.name}: ${integration.message}`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Auto-log on import in development
if (import.meta?.env?.DEV) {
  logIntegrationStatus();
}
