/**
 * Firebase Configuration for Wasel Web App
 * 
 * This file provides Firebase initialization for the web application.
 * The google-services.json file in /imports is for Android apps only.
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Select project: wasel-planning-with-ai
 * 3. Click "Add app" → Select Web (</>) icon
 * 4. Register app with nickname "Wasel Web"
 * 5. Copy the config values to .env.local
 * 6. Enable Cloud Messaging (FCM) for push notifications
 * 7. Generate VAPID key in Project Settings → Cloud Messaging
 */

import { INTEGRATION_CONFIG } from '@/services/integrations';

// ============================================================================
// FIREBASE WEB CONFIG (Auto-loaded from environment variables)
// ============================================================================

/**
 * Firebase configuration object for web
 * Values come from INTEGRATION_CONFIG which reads from env vars
 */
export const firebaseConfig = {
  apiKey: INTEGRATION_CONFIG.firebase.apiKey,
  authDomain: `${INTEGRATION_CONFIG.firebase.projectId}.firebaseapp.com`,
  projectId: INTEGRATION_CONFIG.firebase.projectId,
  storageBucket: `${INTEGRATION_CONFIG.firebase.projectId}.firebasestorage.app`,
  messagingSenderId: INTEGRATION_CONFIG.firebase.messagingSenderId,
  appId: INTEGRATION_CONFIG.firebase.appId,
  // measurementId is optional (for Google Analytics)
  // measurementId: 'G-XXXXXXXXXX',
};

/**
 * VAPID key for web push notifications
 */
export const firebaseVapidKey = INTEGRATION_CONFIG.firebase.vapidKey;

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseEnabled = (): boolean => {
  return INTEGRATION_CONFIG.firebase.enabled;
};

/**
 * Get Firebase project info from android google-services.json
 * (For reference only - web app uses environment variables)
 */
export const androidFirebaseInfo = {
  projectNumber: '',
  projectId: '',
  storageBucket: '',
  androidPackageName: '',
  androidApiKey: '',
  androidAppId: '',
};

// ============================================================================
// FIREBASE INITIALIZATION HELPERS
// ============================================================================

/**
 * Initialize Firebase (lazy loaded when needed)
 * Call this before using Firebase services
 */
export const initializeFirebase = async () => {
  if (!isFirebaseEnabled()) {
    console.warn('[Firebase] Not configured. Add Firebase env vars to enable push notifications.');
    return null;
  }

  try {
    // Dynamically import Firebase to reduce bundle size
    const { initializeApp, getApps } = await import('firebase/app');
    
    // Check if already initialized
    if (getApps().length > 0) {
      console.log('[Firebase] Already initialized');
      return getApps()[0];
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('[Firebase] Initialized successfully:', firebaseConfig.projectId);
    
    return app;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return null;
  }
};

/**
 * Initialize Firebase Cloud Messaging (FCM)
 * Returns messaging instance or null if not supported/configured
 */
export const initializeMessaging = async () => {
  if (!isFirebaseEnabled()) {
    return null;
  }

  try {
    const app = await initializeFirebase();
    if (!app) return null;

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('[Firebase] Service workers not supported');
      return null;
    }

    // Check if Notification API is supported
    if (!('Notification' in window)) {
      console.warn('[Firebase] Notifications not supported');
      return null;
    }

    // Dynamically import messaging
    const { getMessaging, isSupported } = await import('firebase/messaging');
    
    // Check if FCM is supported in this browser
    const supported = await isSupported();
    if (!supported) {
      console.warn('[Firebase] Cloud Messaging not supported in this browser');
      return null;
    }

    const messaging = getMessaging(app);
    console.log('[Firebase] Messaging initialized');
    
    return messaging;
  } catch (error) {
    console.error('[Firebase] Messaging initialization failed:', error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 * Returns token or null if permission denied/error
 */
export const getNotificationToken = async (): Promise<string | null> => {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) return null;

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Firebase] Notification permission denied');
      return null;
    }

    // Get FCM token
    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
    });

    console.log('[Firebase] FCM token obtained');
    return token;
  } catch (error) {
    console.error('[Firebase] Failed to get notification token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = async (
  callback: (payload: any) => void
): Promise<(() => void) | null> => {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) return null;

    const { onMessage } = await import('firebase/messaging');
    
    // Set up message listener
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Firebase] Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firebase] Failed to set up message listener:', error);
    return null;
  }
};

// ============================================================================
// SETUP INSTRUCTIONS (COMMENT)
// ============================================================================

/**
 * HOW TO SET UP FIREBASE FOR WEB:
 * 
 * 1. Firebase Console Setup:
 *    - Go to: https://console.firebase.google.com/project/wasel-planning-with-ai
 *    - Click "Add app" (top of page)
 *    - Select Web (</>) icon
 *    - App nickname: "Wasel Web"
 *    - Check "Also set up Firebase Hosting" if needed
 *    - Click "Register app"
 * 
 * 2. Copy Web Config:
 *    - Firebase will show you a config object
 *    - Copy these values to .env.local:
 *      VITE_FIREBASE_API_KEY=AIzaSy...
 *      VITE_FIREBASE_APP_ID=1:631682127784:web:...
 *      VITE_FIREBASE_PROJECT_ID=wasel-planning-with-ai
 *      VITE_FIREBASE_MESSAGING_SENDER_ID=631682127784
 * 
 * 3. Enable Cloud Messaging:
 *    - Go to: Project Settings → Cloud Messaging
 *    - Under "Web configuration", click "Generate key pair"
 *    - Copy the VAPID key to .env.local:
 *      VITE_FIREBASE_VAPID_KEY=BJ3...
 * 
 * 4. Add Service Worker:
 *    - Create /public/firebase-messaging-sw.js (see below)
 * 
 * 5. Test Push Notifications:
 *    - Run: npm run dev
 *    - Open browser console
 *    - Allow notifications when prompted
 *    - Check console for FCM token
 *    - Test from Firebase Console → Cloud Messaging → Send test message
 * 
 * NOTE: The google-services.json file in /imports is for the Android app only.
 * It cannot be used directly for the web app. You need to register a separate
 * web app in the Firebase console to get web-specific credentials.
 */

/**
 * SERVICE WORKER CODE (create /public/firebase-messaging-sw.js):
 * 
 * ```javascript
 * // Give the service worker access to Firebase Messaging.
 * importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
 * importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
 * 
 * // Initialize Firebase in the service worker
 * firebase.initializeApp({
 *   apiKey: 'YOUR_FIREBASE_WEB_API_KEY',
 *   authDomain: 'YOUR_PROJECT.firebaseapp.com',
 *   projectId: 'YOUR_PROJECT_ID',
 *   storageBucket: 'YOUR_PROJECT.appspot.com',
 *   messagingSenderId: 'YOUR_SENDER_ID',
 *   appId: 'YOUR_WEB_APP_ID',
 * });
 * 
 * // Retrieve an instance of Firebase Messaging
 * const messaging = firebase.messaging();
 * 
 * // Handle background messages
 * messaging.onBackgroundMessage((payload) => {
 *   console.log('Received background message:', payload);
 *   
 *   const notificationTitle = payload.notification.title;
 *   const notificationOptions = {
 *     body: payload.notification.body,
 *     icon: '/icon-512.png',
 *     badge: '/icon-192.png',
 *     data: payload.data,
 *   };
 * 
 *   self.registration.showNotification(notificationTitle, notificationOptions);
 * });
 * ```
 */

export default {
  firebaseConfig,
  firebaseVapidKey,
  isFirebaseEnabled,
  initializeFirebase,
  initializeMessaging,
  getNotificationToken,
  onForegroundMessage,
};
