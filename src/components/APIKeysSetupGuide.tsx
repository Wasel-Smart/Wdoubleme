/**
 * API Keys Setup Guide Component
 * 
 * Displays comprehensive setup instructions for all API integrations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Map,
  CreditCard,
  Phone,
  Database,
  Lock
} from 'lucide-react';
import { validateIntegrations, type IntegrationStatus } from '../utils/integrationValidator';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

export function APIKeysSetupGuide() {
  const report = validateIntegrations();
  const [copiedKey, setCopiedKey] = useState<string>('');

  const handleCopy = async (text: string, label: string) => {
    await copyToClipboard(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const getStatusColor = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'configured': return 'bg-blue-500';
      case 'missing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (key: string) => {
    switch (key) {
      case 'googleMaps':
      case 'googleOAuth':
        return Map;
      case 'stripe':
        return CreditCard;
      case 'twilio':
        return Phone;
      case 'supabase':
        return Database;
      default:
        return Lock;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integration Status Dashboard</CardTitle>
              <CardDescription>
                Configure API keys to enable all Wasel features
              </CardDescription>
            </div>
            <Badge 
              variant={report.overall === 'healthy' ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {report.readyForProduction ? '✓ Production Ready' : '⚠ Setup Required'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{report.summary.configured}</div>
              <div className="text-sm text-muted-foreground">Configured</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500">{report.summary.missing}</div>
              <div className="text-sm text-muted-foreground">Missing</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">{report.summary.critical}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{report.summary.criticalMissing}</div>
              <div className="text-sm text-muted-foreground">Critical Missing</div>
            </div>
          </div>

          {report.summary.criticalMissing > 0 && (
            <Alert className="mt-4 border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> {report.summary.criticalMissing} critical integration(s) 
                must be configured before the app can function properly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Integration Cards */}
      <div className="grid gap-4">
        {report.integrations.map((integration) => {
          const Icon = getIcon(integration.key);
          return (
            <Card key={integration.key} className={integration.critical && !integration.configured ? 'border-red-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${integration.configured ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Icon className={`w-5 h-5 ${integration.configured ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.message}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.critical && (
                      <Badge variant="destructive" className="text-xs">
                        Critical
                      </Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`}></div>
                      <span className="text-sm font-medium capitalize">{integration.status}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {integration.details && (
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(integration.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-mono text-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to configure your API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="twilio">Twilio</TabsTrigger>
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <h3 className="font-semibold">Google Maps & OAuth Configuration</h3>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">1. API Key Configuration</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">VITE_GOOGLE_MAPS_API_KEY</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('YOUR_GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
                    >
                      {copiedKey === 'Google Maps API Key' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    YOUR_GOOGLE_MAPS_API_KEY
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">2. OAuth Client ID</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', 'Google Client ID')}
                    >
                      {copiedKey === 'Google Client ID' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
                  </code>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Add authorized redirect URIs in Google Cloud Console:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><code className="text-xs">https://wasel4.online/auth/callback</code></li>
                    <li><code className="text-xs">VITE_SUPABASE_URL/auth/v1/callback</code></li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Google Cloud Console
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="stripe" className="space-y-4">
              <h3 className="font-semibold">Stripe Payment Configuration</h3>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">1. Publishable Key (Frontend)</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('pk_test_or_pk_live_from_stripe_dashboard', 'Stripe Publishable Key')}
                    >
                      {copiedKey === 'Stripe Publishable Key' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    pk_test_or_pk_live_from_stripe_dashboard
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">2. Secret Key (Backend Only)</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">STRIPE_SECRET_KEY</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('sk_live_or_sk_test_from_stripe_dashboard', 'Stripe Secret Key')}
                    >
                      {copiedKey === 'Stripe Secret Key' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    sk_live_or_sk_test_from_stripe_dashboard
                  </code>
                </div>
              </div>

              <Alert className="border-yellow-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Mode:</strong> These are test keys. Switch to live keys before production launch.
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stripe Dashboard
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="twilio" className="space-y-4">
              <h3 className="font-semibold">Twilio SMS & Voice Configuration</h3>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">1. Account SID (Frontend)</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">VITE_TWILIO_ACCOUNT_SID</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('YOUR_TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
                    >
                      {copiedKey === 'Twilio Account SID' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    YOUR_TWILIO_ACCOUNT_SID
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">2. Auth Token (Backend Only)</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">TWILIO_AUTH_TOKEN</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('YOUR_TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
                    >
                      {copiedKey === 'Twilio Auth Token' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    YOUR_TWILIO_AUTH_TOKEN
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">3. API Key (Backend)</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">TWILIO_API_KEY_SID</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('YOUR_TWILIO_API_KEY_SID', 'Twilio API Key SID')}
                    >
                      {copiedKey === 'Twilio API Key SID' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    YOUR_TWILIO_API_KEY_SID
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">4. API Secret (Backend)</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">TWILIO_API_KEY_SECRET</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy('YOUR_TWILIO_API_KEY_SECRET', 'Twilio API Secret')}
                    >
                      {copiedKey === 'Twilio API Secret' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <code className="text-xs block text-muted-foreground break-all">
                    YOUR_TWILIO_API_KEY_SECRET
                  </code>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Twilio Console
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="supabase" className="space-y-4">
              <h3 className="font-semibold">Supabase Backend Configuration</h3>
              
              <Alert className="border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Configure Supabase URL and anon key via environment variables.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Project URL:</span>
                  <code className="ml-2 text-xs">VITE_SUPABASE_URL</code>
                </div>
                <div>
                  <span className="font-medium">Project ID:</span>
                  <code className="ml-2 text-xs">{'<your-project-id>'}</code>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className="ml-2" variant="default">Configured via .env</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://supabase.com/dashboard/project/your-project-id" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase Dashboard
                </a>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
