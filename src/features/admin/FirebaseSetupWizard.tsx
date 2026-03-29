/**
 * Firebase Setup Wizard Component
 * 
 * Guides developers through Firebase configuration
 * Shows setup status and provides direct links to Firebase Console
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { isFirebaseEnabled, getNotificationToken, initializeFirebase } from '@/config/firebase';
import { INTEGRATION_CONFIG } from '@/services/integrations';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'incomplete' | 'in-progress';
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export function FirebaseSetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    const config = INTEGRATION_CONFIG.firebase;
    
    const setupSteps: SetupStep[] = [
      {
        id: 'web-app',
        title: '1. Register Web App',
        description: 'Create a web app in Firebase Console',
        status: config.appId && !config.appId.includes('TODO') ? 'complete' : 'incomplete',
        action: {
          label: 'Open Firebase Console',
          url: 'https://console.firebase.google.com/project/wasel-planning-with-ai/settings/general',
        },
      },
      {
        id: 'vapid',
        title: '2. Generate VAPID Key',
        description: 'Generate web push notification key',
        status: config.vapidKey && !config.vapidKey.includes('TODO') ? 'complete' : 'incomplete',
        action: {
          label: 'Generate Key',
          url: 'https://console.firebase.google.com/project/wasel-planning-with-ai/settings/cloudmessaging',
        },
      },
      {
        id: 'env',
        title: '3. Update .env.local',
        description: 'Add credentials to environment file',
        status: config.enabled ? 'complete' : 'incomplete',
        action: {
          label: 'View Template',
          onClick: () => {
            alert('Check .env.example for the template, then create .env.local with your credentials');
          },
        },
      },
      {
        id: 'service-worker',
        title: '4. Update Service Worker',
        description: 'Add web app ID to service worker',
        status: 'incomplete', // We can't check this automatically
          action: {
            label: 'View Instructions',
            onClick: () => {
              alert('Open /public/firebase-messaging-sw.js and replace the placeholder Firebase app ID with your production web app ID from Firebase Console.');
            },
          },
        },
      {
        id: 'test',
        title: '5. Test Notifications',
        description: 'Request permission and get FCM token',
        status: fcmToken ? 'complete' : 'incomplete',
        action: {
          label: 'Test Now',
          onClick: testNotifications,
        },
      },
    ];

    setSteps(setupSteps);
  };

  const testNotifications = async () => {
    setTesting(true);
    try {
      // Initialize Firebase
      const app = await initializeFirebase();
      if (!app) {
        alert('❌ Firebase not configured. Check .env.local file.');
        return;
      }

      // Request notification permission and get token
      const token = await getNotificationToken();
      if (token) {
        setFcmToken(token);
        alert('✅ Success! FCM token generated. Check console for details.');
        console.log('FCM Token:', token);
        checkSetupStatus(); // Re-check status
      } else {
        alert('❌ Could not get FCM token. Check browser console for errors.');
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert(`❌ Test failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const copyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      alert('✅ FCM token copied to clipboard!');
    }
  };

  const allComplete = steps.every(s => s.status === 'complete');
  const completedCount = steps.filter(s => s.status === 'complete').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔥 Firebase Setup Wizard</h1>
        <p className="text-muted-foreground">
          Follow these steps to configure Firebase for push notifications
        </p>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Setup Progress</h2>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {steps.length} complete
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all duration-300"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          {allComplete && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="size-5" />
              <span className="font-medium">Setup complete! 🎉</span>
            </div>
          )}
        </div>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-6">
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">
                {step.status === 'complete' ? (
                  <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="size-6 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>

                {/* Action Button */}
                {step.action && step.status !== 'complete' && (
                  <div className="pt-2">
                    {step.action.url ? (
                      <a
                        href={step.action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        {step.action.label}
                        <ExternalLink className="size-4" />
                      </a>
                    ) : (
                      <Button
                        onClick={step.action.onClick}
                        size="sm"
                        disabled={step.id === 'test' && testing}
                      >
                        {step.id === 'test' && testing ? 'Testing...' : step.action.label}
                      </Button>
                    )}
                  </div>
                )}

                {/* Success Message */}
                {step.status === 'complete' && step.id !== 'test' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="size-4" />
                    <span>Configured</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FCM Token Display */}
      {fcmToken && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">FCM Token</h3>
              <Button onClick={copyToken} size="sm" variant="outline">
                <Copy className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <code className="text-xs break-all">{fcmToken}</code>
            </div>
            <div className="text-sm text-muted-foreground">
              Use this token to send test notifications from Firebase Console → Cloud Messaging
            </div>
          </div>
        </Card>
      )}

      {/* Configuration Details */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Configuration</h3>
          <div className="space-y-2 text-sm">
            <ConfigRow
              label="API Key"
              value={INTEGRATION_CONFIG.firebase.apiKey}
              secure
            />
            <ConfigRow
              label="Project ID"
              value={INTEGRATION_CONFIG.firebase.projectId}
            />
            <ConfigRow
              label="Sender ID"
              value={INTEGRATION_CONFIG.firebase.messagingSenderId}
            />
            <ConfigRow
              label="App ID"
              value={INTEGRATION_CONFIG.firebase.appId}
              highlight={INTEGRATION_CONFIG.firebase.appId?.includes('TODO')}
            />
            <ConfigRow
              label="VAPID Key"
              value={INTEGRATION_CONFIG.firebase.vapidKey}
              secure
              highlight={INTEGRATION_CONFIG.firebase.vapidKey?.includes('TODO')}
            />
            <ConfigRow
              label="Storage Bucket"
              value={INTEGRATION_CONFIG.firebase.storageBucket}
            />
            <ConfigRow
              label="Auth Domain"
              value={INTEGRATION_CONFIG.firebase.authDomain}
            />
          </div>
        </div>
      </Card>

      {/* Help Card */}
      <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <div className="flex items-start gap-4">
          <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Need Help?</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Read <code>/QUICK_START.md</code> for a 3-minute guide</li>
              <li>Check <code>/FIREBASE_SETUP_GUIDE.md</code> for detailed instructions</li>
              <li>See <code>/INTEGRATION_CHECKLIST.md</code> for a task list</li>
              <li>Open browser console (F12) to see detailed logs</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ConfigRow({
  label,
  value,
  secure = false,
  highlight = false,
}: {
  label: string;
  value?: string;
  secure?: boolean;
  highlight?: boolean;
}) {
  const [show, setShow] = useState(false);

  const displayValue = value
    ? secure && !show
      ? '••••••••••••••••••••'
      : value
    : '❌ Not set';

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="font-medium">{label}:</span>
      <div className="flex items-center gap-2">
        <code
          className={`text-xs ${
            highlight ? 'text-orange-600 dark:text-orange-400 font-bold' : ''
          }`}
        >
          {displayValue}
        </code>
        {secure && value && (
          <button
            onClick={() => setShow(!show)}
            className="text-xs text-primary hover:underline"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}
