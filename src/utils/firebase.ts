/**
 * Firebase Integration for Wassel
 * Provides authentication, analytics, and messaging
 */

// Note: Firebase SDK will be loaded from CDN or npm install
// This is a configuration and utility file

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration (load from environment variables)
export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

let firebaseApp: any = null;
let analytics: any = null;
let messaging: any = null;

/**
 * Initialize Firebase
 */
export async function initializeFirebase() {
  // Check if Firebase is configured
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase not configured. Skipping initialization.');
    return null;
  }

  try {
    // Dynamically import Firebase (lazy loading)
    const { initializeApp } = await import('firebase/app');
    const { getAnalytics, logEvent } = await import('firebase/analytics');
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

    // Initialize Firebase App
    firebaseApp = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');

    // Initialize Analytics (if measurementId provided)
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(firebaseApp);
      console.log('Firebase Analytics initialized');
    }

    // Initialize Cloud Messaging
    if ('Notification' in window && 'serviceWorker' in navigator) {
      messaging = getMessaging(firebaseApp);
      console.log('Firebase Messaging initialized');
    }

    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

/**
 * Analytics tracking
 */
export const FirebaseAnalytics = {
  /**
   * Log a custom event
   */
  logEvent: async (eventName: string, eventParams?: Record<string, any>) => {
    if (!analytics) return;

    try {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  },

  /**
   * Track page view
   */
  logPageView: async (pageName: string, pageTitle?: string) => {
    if (!analytics) return;

    try {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, 'page_view', {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    } catch (error) {
      console.error('Failed to log page view:', error);
    }
  },

  /**
   * Track user action
   */
  logAction: async (action: string, category?: string, label?: string) => {
    if (!analytics) return;

    try {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, action, {
        event_category: category,
        event_label: label,
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  },

  /**
   * Set user properties
   */
  setUserProperties: async (properties: Record<string, any>) => {
    if (!analytics) return;

    try {
      const { setUserProperties } = await import('firebase/analytics');
      setUserProperties(analytics, properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  },

  /**
   * Track ride booking
   */
  logRideBooked: async (rideType: string, price: number) => {
    await FirebaseAnalytics.logEvent('ride_booked', {
      ride_type: rideType,
      price: price,
      currency: 'JOD',
    });
  },

  /**
   * Track service usage
   */
  logServiceUsed: async (serviceName: string) => {
    await FirebaseAnalytics.logEvent('service_used', {
      service_name: serviceName,
    });
  },
};

/**
 * Push Notifications via Firebase Cloud Messaging
 */
export const FirebaseMessaging = {
  /**
   * Request notification permission
   */
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Get FCM token
   */
  getToken: async (): Promise<string | null> => {
    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    try {
      const { getToken } = await import('firebase/messaging');
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.error('VAPID key not configured');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  },

  /**
   * Listen for foreground messages
   */
  onMessage: async (callback: (payload: any) => void) => {
    if (!messaging) return;

    try {
      const { onMessage } = await import('firebase/messaging');
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('Failed to listen for messages:', error);
    }
  },

  /**
   * Subscribe to topic
   */
  subscribeToTopic: async (topic: string): Promise<boolean> => {
    const token = await FirebaseMessaging.getToken();
    if (!token) return false;

    try {
      // This should be done on the backend
      // Frontend just provides the token
      console.log('Subscribe to topic:', topic, 'with token:', token);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return false;
    }
  },
};

/**
 * Firebase Performance Monitoring
 */
export const FirebasePerformance = {
  /**
   * Track custom trace
   */
  trace: async (name: string, fn: () => Promise<any>) => {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      await FirebaseAnalytics.logEvent('performance_trace', {
        trace_name: name,
        duration: duration,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      await FirebaseAnalytics.logEvent('performance_trace_error', {
        trace_name: name,
        duration: duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  },
};

/**
 * Initialize all Firebase services
 */
export async function initializeAllFirebaseServices() {
  await initializeFirebase();

  // Request notification permission
  if (messaging) {
    const hasPermission = await FirebaseMessaging.requestPermission();
    if (hasPermission) {
      const token = await FirebaseMessaging.getToken();
      if (token) {
        // Store token for sending to backend
        console.log('FCM Token obtained:', token);
      }
    }
  }

  // Set up message listener
  if (messaging) {
    FirebaseMessaging.onMessage((payload) => {
      // Handle foreground messages
      const { notification } = payload;
      if (notification) {
        // Show notification
        new Notification(notification.title || 'Wassel', {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
        });
      }
    });
  }

  return {
    app: firebaseApp,
    analytics,
    messaging,
  };
}

export default {
  initialize: initializeFirebase,
  analytics: FirebaseAnalytics,
  messaging: FirebaseMessaging,
  performance: FirebasePerformance,
};