/**
 * Third-Party Integrations Service
 * 
 * Centralized service for all external API integrations.
 * Ready for production - just add API keys to environment variables.
 */

// ============ CONFIGURATION ============

// Safe environment variable access with multiple fallback strategies
const getEnv = (key: string): string => {
  // Strategy 1: Try import.meta.env (Vite)
  try {
    if (import.meta?.env?.[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    // Silent fail
  }

  // Strategy 2: Try window env (if set)
  try {
    if (typeof window !== 'undefined' && (window as any).__env?.[key]) {
      return (window as any).__env[key];
    }
  } catch (e) {
    // Silent fail
  }

  // Strategy 3: Return empty string
  return '';
};

const googleMapsApiKey = (typeof __GOOGLE_MAPS_API_KEY__ !== 'undefined' ? __GOOGLE_MAPS_API_KEY__ : '')
  || getEnv('VITE_GOOGLE_MAPS_API_KEY');
const stripePublishableKey = (typeof __STRIPE_PUBLISHABLE_KEY__ !== 'undefined' ? __STRIPE_PUBLISHABLE_KEY__ : '')
  || getEnv('VITE_STRIPE_PUBLISHABLE_KEY');
const twilioAccountSid = (typeof __TWILIO_ACCOUNT_SID__ !== 'undefined' ? __TWILIO_ACCOUNT_SID__ : '')
  || getEnv('VITE_TWILIO_ACCOUNT_SID');
const googleClientId = (typeof __GOOGLE_CLIENT_ID__ !== 'undefined' ? __GOOGLE_CLIENT_ID__ : '')
  || getEnv('VITE_GOOGLE_CLIENT_ID');
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Log configuration status (only in development, never print key values)
if (import.meta?.env?.DEV) {
  console.log('[Wasel Integrations]', {
    googleMaps: Boolean(googleMapsApiKey),
    stripe: Boolean(stripePublishableKey),
    twilio: Boolean(twilioAccountSid),
    googleOAuth: Boolean(googleClientId),
    supabase: Boolean(supabaseUrl) && Boolean(supabaseAnonKey),
  });
}

export const INTEGRATION_CONFIG = {
  // Google Maps — Wasel production key (compile-time injected via vite.config define)
  googleMaps: {
    apiKey: googleMapsApiKey,
    enabled: Boolean(googleMapsApiKey),
    libraries: ['places', 'geometry', 'directions'],
  },
  
  // Stripe Payments — test mode keys
  stripe: {
    publishableKey: stripePublishableKey,
    enabled: Boolean(stripePublishableKey),
    testMode: getEnv('VITE_STRIPE_MODE', 'test') !== 'live',
  },
  
  // Twilio (SMS/Voice) — Account SID is safe on the client; auth token stays backend-only
  twilio: {
    accountSid: twilioAccountSid,
    enabled: Boolean(twilioAccountSid),
  },
  
  // SendGrid (Email)
  sendgrid: {
    apiKey: getEnv('VITE_SENDGRID_API_KEY'),
    enabled: !!getEnv('VITE_SENDGRID_API_KEY'),
  },
  
  // Firebase (Push Notifications)
  firebase: {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    vapidKey: getEnv('VITE_FIREBASE_VAPID_KEY'),
    enabled: !!getEnv('VITE_FIREBASE_API_KEY') && !!getEnv('VITE_FIREBASE_PROJECT_ID'),
  },
  
  // Google OAuth — both Client IDs
  googleOAuth: {
    clientId: googleClientId,
    clientIdAlt: getEnv('VITE_GOOGLE_CLIENT_ID_ALT'),
    enabled: Boolean(googleClientId),
  },
  
  // Supabase
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    enabled: Boolean(supabaseUrl) && Boolean(supabaseAnonKey),
  },
  
  // Identity Verification (Jumio)
  jumio: {
    apiKey: getEnv('VITE_JUMIO_API_KEY'),
    apiSecret: getEnv('VITE_JUMIO_API_SECRET'),
    enabled: !!getEnv('VITE_JUMIO_API_KEY'),
  },
  
  // Analytics
  mixpanel: {
    token: getEnv('VITE_MIXPANEL_TOKEN'),
    enabled: !!getEnv('VITE_MIXPANEL_TOKEN'),
  },
  
  // Error Tracking
  sentry: {
    dsn: getEnv('VITE_SENTRY_DSN'),
    enabled: !!getEnv('VITE_SENTRY_DSN'),
  },
};

// ============ GOOGLE MAPS SERVICE ============

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

export interface GeocodingResult {
  address: string;
  coordinates: { lat: number; lng: number };
  placeId: string;
}

export const mapsService = {
  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>
  ): Promise<RouteResult> {
    if (!INTEGRATION_CONFIG.googleMaps.enabled) {
      // Fallback: simple calculation
      return this.calculateRouteFallback(origin, destination);
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.lat},${origin.lng}&` +
        `destination=${destination.lat},${destination.lng}&` +
        `key=${INTEGRATION_CONFIG.googleMaps.apiKey}`
      );

      const data = await response.json();
      
      if (data.status === 'OK') {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: leg.distance.value,
          duration: leg.duration.value,
          polyline: route.overview_polyline.points,
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions,
            distance: step.distance.value,
            duration: step.duration.value,
          })),
        };
      }
      
      throw new Error(data.status);
    } catch (error) {
      console.error('Maps API error:', error);
      return this.calculateRouteFallback(origin, destination);
    }
  },

  calculateRouteFallback(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): RouteResult {
    // Haversine formula for distance
    const R = 6371e3; // Earth radius in meters
    const φ1 = (origin.lat * Math.PI) / 180;
    const φ2 = (destination.lat * Math.PI) / 180;
    const Δφ = ((destination.lat - origin.lat) * Math.PI) / 180;
    const Δλ = ((destination.lng - origin.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    const duration = distance / 13.89; // Assume 50 km/h average speed

    return {
      distance: Math.round(distance),
      duration: Math.round(duration),
      polyline: '',
      steps: [
        {
          instruction: `Head to ${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`,
          distance: Math.round(distance),
          duration: Math.round(duration),
        },
      ],
    };
  },

  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!INTEGRATION_CONFIG.googleMaps.enabled) {
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(address)}&` +
        `key=${INTEGRATION_CONFIG.googleMaps.apiKey}`
      );

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          placeId: result.place_id,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<string | null> {
    if (!INTEGRATION_CONFIG.googleMaps.enabled) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `latlng=${lat},${lng}&` +
        `key=${INTEGRATION_CONFIG.googleMaps.apiKey}`
      );

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },
};

// ============ PAYMENT SERVICE (STRIPE) ============

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export const paymentService = {
  async createPaymentIntent(
    amount: number,
    currency: string = 'jod',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    if (!INTEGRATION_CONFIG.stripe.enabled) {
      // Fallback: mock payment
      return {
        id: `pi_mock_${Date.now()}`,
        clientSecret: 'mock_secret',
        amount,
        currency,
        status: 'succeeded',
      };
    }

    try {
      // Call your backend to create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, metadata }),
      });

      return await response.json();
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  },

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!INTEGRATION_CONFIG.stripe.enabled) {
      return { success: true };
    }

    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, paymentMethodId }),
      });

      return await response.json();
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return { success: false, error: 'Payment failed' };
    }
  },

  async refund(
    paymentIntentId: string,
    amount?: number
  ): Promise<{ success: boolean; refundId?: string }> {
    if (!INTEGRATION_CONFIG.stripe.enabled) {
      return { success: true, refundId: `re_mock_${Date.now()}` };
    }

    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('Refund failed:', error);
      return { success: false };
    }
  },
};

// ============ SMS SERVICE (TWILIO) ============

export const smsService = {
  async sendVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.twilio.enabled) {
      console.log(`[Mock SMS] Code ${code} to ${phoneNumber}`);
      return true;
    }

    try {
      const response = await fetch('/api/sms/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      });

      return response.ok;
    } catch (error) {
      console.error('SMS send failed:', error);
      return false;
    }
  },

  async sendTripNotification(
    phoneNumber: string,
    message: string
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.twilio.enabled) {
      console.log(`[Mock SMS] ${message} to ${phoneNumber}`);
      return true;
    }

    try {
      const response = await fetch('/api/sms/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message }),
      });

      return response.ok;
    } catch (error) {
      console.error('SMS send failed:', error);
      return false;
    }
  },

  async initiateCall(
    fromNumber: string,
    toNumber: string
  ): Promise<{ callSid: string } | null> {
    if (!INTEGRATION_CONFIG.twilio.enabled) {
      console.log(`[Mock Call] From ${fromNumber} to ${toNumber}`);
      return { callSid: `CA_mock_${Date.now()}` };
    }

    try {
      const response = await fetch('/api/voice/initiate-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromNumber, to: toNumber }),
      });

      return await response.json();
    } catch (error) {
      console.error('Call initiation failed:', error);
      return null;
    }
  },
};

// ============ EMAIL SERVICE (SENDGRID) ============

export const emailService = {
  async sendVerificationEmail(
    email: string,
    verificationLink: string
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.sendgrid.enabled) {
      console.log(`[Mock Email] Verification link sent to ${email}`);
      return true;
    }

    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationLink }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  },

  async sendTripReceipt(
    email: string,
    tripId: string,
    receiptData: any
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.sendgrid.enabled) {
      console.log(`[Mock Email] Receipt sent to ${email} for trip ${tripId}`);
      return true;
    }

    try {
      const response = await fetch('/api/email/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tripId, receiptData }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  },

  async sendPasswordReset(
    email: string,
    resetLink: string
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.sendgrid.enabled) {
      console.log(`[Mock Email] Password reset sent to ${email}`);
      return true;
    }

    try {
      const response = await fetch('/api/email/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetLink }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  },
};

// ============ PUSH NOTIFICATION SERVICE (FIREBASE) ============

export const pushNotificationService = {
  async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.firebase.enabled) {
      console.log(`[Mock Push] ${notification.title} to user ${userId}`);
      return true;
    }

    try {
      const response = await fetch('/api/notifications/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notification }),
      });

      return response.ok;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  },

  async subscribeToTopic(
    userId: string,
    topic: string
  ): Promise<boolean> {
    if (!INTEGRATION_CONFIG.firebase.enabled) {
      return true;
    }

    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic }),
      });

      return response.ok;
    } catch (error) {
      console.error('Topic subscription failed:', error);
      return false;
    }
  },
};

// ============ IDENTITY VERIFICATION SERVICE (JUMIO) ============

export const identityVerificationService = {
  async initiateVerification(
    userId: string,
    userInfo: {
      firstName: string;
      lastName: string;
      country: string;
    }
  ): Promise<{ verificationId: string; redirectUrl: string } | null> {
    if (!INTEGRATION_CONFIG.jumio.enabled) {
      return {
        verificationId: `jm_mock_${Date.now()}`,
        redirectUrl: '/verification/mock',
      };
    }

    try {
      const response = await fetch('/api/verification/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userInfo }),
      });

      return await response.json();
    } catch (error) {
      console.error('Identity verification initiation failed:', error);
      return null;
    }
  },

  async checkVerificationStatus(
    verificationId: string
  ): Promise<{
    status: 'pending' | 'approved' | 'rejected';
    details?: any;
  }> {
    if (!INTEGRATION_CONFIG.jumio.enabled) {
      return { status: 'approved' };
    }

    try {
      const response = await fetch(
        `/api/verification/status/${verificationId}`
      );

      return await response.json();
    } catch (error) {
      console.error('Verification status check failed:', error);
      return { status: 'pending' };
    }
  },
};

// ============ ANALYTICS SERVICE (MIXPANEL) ============

export const analyticsService = {
  track(
    event: string,
    properties?: Record<string, any>
  ): void {
    if (!INTEGRATION_CONFIG.mixpanel.enabled) {
      console.log(`[Analytics] ${event}`, properties);
      return;
    }

    try {
      // Mixpanel tracking
      (window as any).mixpanel?.track(event, properties);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  },

  identify(userId: string, userProperties?: Record<string, any>): void {
    if (!INTEGRATION_CONFIG.mixpanel.enabled) {
      return;
    }

    try {
      (window as any).mixpanel?.identify(userId);
      if (userProperties) {
        (window as any).mixpanel?.people.set(userProperties);
      }
    } catch (error) {
      console.error('Analytics identify failed:', error);
    }
  },

  setUserProperty(property: string, value: any): void {
    if (!INTEGRATION_CONFIG.mixpanel.enabled) {
      return;
    }

    try {
      (window as any).mixpanel?.people.set({ [property]: value });
    } catch (error) {
      console.error('Analytics set property failed:', error);
    }
  },
};

// ============ ERROR TRACKING SERVICE (SENTRY) ============

export const errorTrackingService = {
  captureException(error: Error, context?: Record<string, any>): void {
    if (!INTEGRATION_CONFIG.sentry.enabled) {
      console.error('[Error]', error, context);
      return;
    }

    try {
      (window as any).Sentry?.captureException(error, { extra: context });
    } catch (e) {
      console.error('Error tracking failed:', e);
    }
  },

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!INTEGRATION_CONFIG.sentry.enabled) {
      console.log(`[${level.toUpperCase()}]`, message);
      return;
    }

    try {
      (window as any).Sentry?.captureMessage(message, level);
    } catch (error) {
      console.error('Message tracking failed:', error);
    }
  },

  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!INTEGRATION_CONFIG.sentry.enabled) {
      return;
    }

    try {
      (window as any).Sentry?.setUser(user);
    } catch (error) {
      console.error('Set user failed:', error);
    }
  },
};

// ============ INTEGRATION STATUS CHECK ============

export function checkIntegrationStatus() {
  return {
    googleMaps: INTEGRATION_CONFIG.googleMaps.enabled,
    stripe: INTEGRATION_CONFIG.stripe.enabled,
    twilio: INTEGRATION_CONFIG.twilio.enabled,
    sendgrid: INTEGRATION_CONFIG.sendgrid.enabled,
    firebase: INTEGRATION_CONFIG.firebase.enabled,
    jumio: INTEGRATION_CONFIG.jumio.enabled,
    mixpanel: INTEGRATION_CONFIG.mixpanel.enabled,
    sentry: INTEGRATION_CONFIG.sentry.enabled,
  };
}

export function getIntegrationHealth(): {
  healthy: number;
  total: number;
  percentage: number;
  missing: string[];
} {
  const status = checkIntegrationStatus();
  const entries = Object.entries(status);
  const healthy = entries.filter(([_, enabled]) => enabled).length;
  const missing = entries
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name);

  return {
    healthy,
    total: entries.length,
    percentage: Math.round((healthy / entries.length) * 100),
    missing,
  };
}