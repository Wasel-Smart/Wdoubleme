/**
 * Integration Status Dashboard
 * Shows which APIs are configured and working
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Map, 
  CreditCard, 
  MessageSquare, 
  Mail, 
  Bell, 
  Shield, 
  BarChart3, 
  Bug,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { checkIntegrationStatus, getIntegrationHealth, INTEGRATION_CONFIG } from '../services/integrations';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

export function IntegrationStatusDashboard() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [health, setHealth] = useState({ healthy: 0, total: 0, percentage: 0, missing: [] as string[] });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setStatus(checkIntegrationStatus());
    setHealth(getIntegrationHealth());
  }, []);

  const handleCopy = async (text: string, label: string) => {
    await copyToClipboard(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const integrations = [
    {
      name: 'Google Maps',
      key: 'googleMaps',
      icon: Map,
      description: 'Maps, routing, geocoding',
      envVar: 'VITE_GOOGLE_MAPS_API_KEY',
      setupUrl: 'https://console.cloud.google.com/apis/credentials',
      configured: INTEGRATION_CONFIG.googleMaps.apiKey,
      critical: true,
    },
    {
      name: 'Stripe',
      key: 'stripe',
      icon: CreditCard,
      description: 'Payment processing',
      envVar: 'VITE_STRIPE_PUBLISHABLE_KEY',
      setupUrl: 'https://dashboard.stripe.com/apikeys',
      configured: INTEGRATION_CONFIG.stripe.publishableKey,
      critical: true,
      testMode: INTEGRATION_CONFIG.stripe.testMode,
    },
    {
      name: 'Twilio',
      key: 'twilio',
      icon: MessageSquare,
      description: 'SMS & voice calls',
      envVar: 'VITE_TWILIO_ACCOUNT_SID',
      setupUrl: 'https://console.twilio.com/',
      configured: INTEGRATION_CONFIG.twilio.accountSid,
      critical: true,
    },
    {
      name: 'SendGrid',
      key: 'sendgrid',
      icon: Mail,
      description: 'Email notifications',
      envVar: 'VITE_SENDGRID_API_KEY',
      setupUrl: 'https://app.sendgrid.com/settings/api_keys',
      configured: INTEGRATION_CONFIG.sendgrid.apiKey,
      critical: false,
    },
    {
      name: 'Firebase',
      key: 'firebase',
      icon: Bell,
      description: 'Push notifications',
      envVar: 'VITE_FIREBASE_API_KEY',
      setupUrl: 'https://console.firebase.google.com/',
      configured: INTEGRATION_CONFIG.firebase.apiKey,
      critical: false,
    },
    {
      name: 'Jumio',
      key: 'jumio',
      icon: Shield,
      description: 'Identity verification',
      envVar: 'VITE_JUMIO_API_KEY',
      setupUrl: 'https://www.jumio.com/',
      configured: INTEGRATION_CONFIG.jumio.apiKey,
      critical: false,
    },
    {
      name: 'Mixpanel',
      key: 'mixpanel',
      icon: BarChart3,
      description: 'Analytics tracking',
      envVar: 'VITE_MIXPANEL_TOKEN',
      setupUrl: 'https://mixpanel.com/',
      configured: INTEGRATION_CONFIG.mixpanel.token,
      critical: false,
    },
    {
      name: 'Sentry',
      key: 'sentry',
      icon: Bug,
      description: 'Error tracking',
      envVar: 'VITE_SENTRY_DSN',
      setupUrl: 'https://sentry.io/',
      configured: INTEGRATION_CONFIG.sentry.dsn,
      critical: false,
    },
  ];

  const criticalMissing = integrations.filter(i => i.critical && !status[i.key]);
  const optionalMissing = integrations.filter(i => !i.critical && !status[i.key]);

  return (
    <div className="space-y-6 p-6">
      {/* Header with Overall Status */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Integration Status</h2>
        <p className="text-muted-foreground">
          Monitor and configure your external API integrations
        </p>
      </div>

      {/* Overall Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Health</span>
            <Badge variant={health.percentage === 100 ? 'default' : health.percentage >= 50 ? 'secondary' : 'destructive'}>
              {health.healthy}/{health.total} Configured
            </Badge>
          </CardTitle>
          <CardDescription>
            {health.percentage}% of integrations are active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                health.percentage === 100 ? 'bg-green-500' :
                health.percentage >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${health.percentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {health.percentage === 100 ? (
              '✅ All integrations configured!'
            ) : (
              `${health.missing.length} integration${health.missing.length !== 1 ? 's' : ''} need${health.missing.length === 1 ? 's' : ''} configuration`
            )}
          </p>
        </CardContent>
      </Card>

      {/* Critical Missing Integrations */}
      {criticalMissing.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Integrations Missing</AlertTitle>
          <AlertDescription>
            The following critical services are not configured: {criticalMissing.map(i => i.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConfigured = status[integration.key];

          return (
            <Card key={integration.key} className={isConfigured ? 'border-green-500' : integration.critical ? 'border-red-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                  {isConfigured ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant={isConfigured ? 'default' : 'secondary'}>
                    {isConfigured ? '✅ Configured' : '❌ Not Configured'}
                  </Badge>
                  {integration.critical && !isConfigured && (
                    <Badge variant="destructive">Critical</Badge>
                  )}
                  {integration.testMode && (
                    <Badge variant="outline">Test Mode</Badge>
                  )}
                </div>

                {/* Configuration Details */}
                {isConfigured ? (
                  <div className="text-sm space-y-1">
                    <p className="text-green-600 dark:text-green-400">
                      ✓ API key configured
                    </p>
                    {integration.configured && (
                      <p className="font-mono text-xs text-muted-foreground">
                        {integration.configured.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm space-y-2">
                    <p className="text-muted-foreground">
                      Set environment variable:
                    </p>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {integration.envVar}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(integration.envVar, integration.name)}
                      >
                        {copied === integration.name ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Setup Link */}
                {!isConfigured && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(integration.setupUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Get API Key
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
          <CardDescription>
            Follow these steps to configure missing integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Create .env file</h4>
            <p className="text-sm text-muted-foreground">
              Create a <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in your project root if it doesn't exist.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">2. Add API keys</h4>
            <p className="text-sm text-muted-foreground">
              Add each missing environment variable to your .env file:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1">
              {optionalMissing.concat(criticalMissing).map(i => (
                <div key={i.key}>{i.envVar}=your_api_key_here</div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. Restart development server</h4>
            <p className="text-sm text-muted-foreground">
              After adding keys, restart your dev server to load the new environment variables.
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription>
              The .env file contains API keys. Make sure it's listed in .gitignore and never commit it to version control.
              Secret keys (Stripe secret, Twilio auth token) must be configured in Supabase Dashboard, not in .env.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation & Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('/.env', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View .env Template
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('/BACKEND_SECRETS.txt', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Backend Secrets Guide
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('/🔍_COMPLETE_APPLICATION_AUDIT.md', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Complete Application Audit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}