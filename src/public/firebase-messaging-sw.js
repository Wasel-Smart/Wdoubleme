/**
 * Firebase Cloud Messaging Service Worker
 * 
 * This service worker handles background push notifications when the app
 * is not in the foreground or the browser tab is closed.
 * 
 * IMPORTANT: This file must be in /public/ so it's accessible at the root URL.
 * Service workers can only control pages within their scope.
 * 
 * Setup: Replace YOUR_WEB_APP_ID with the actual web app ID from Firebase Console
 */

// Import Firebase scripts (compat version works in service workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// These values match the android google-services.json project
firebase.initializeApp({
  apiKey: 'AIzaSyATb1EX3IOnLbY4i5BoAhYIHOJSdeXOtrk',
  authDomain: 'wasel-planning-with-ai.firebaseapp.com',
  projectId: 'wasel-planning-with-ai',
  storageBucket: 'wasel-planning-with-ai.firebasestorage.app',
  messagingSenderId: '631682127784',
  // ⚠️ TODO: Replace with your web app ID from Firebase Console
  // Get it from: https://console.firebase.google.com/project/wasel-planning-with-ai/settings/general
  // After clicking "Add app" → Web (</> icon)
  appId: 'TODO_REGISTER_WEB_APP_IN_FIREBASE_CONSOLE',
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  
  // Extract notification data
  const notificationTitle = payload.notification?.title || 'واصل | Wasel';
  const notificationOptions = {
    body: payload.notification?.body || 'رسالة جديدة',
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'wasel-notification',
    data: payload.data || {},
    // Arabic text direction
    dir: 'auto',
    // Action buttons (optional)
    actions: [
      {
        action: 'open',
        title: 'افتح',
        icon: '/icon-192.png',
      },
      {
        action: 'close',
        title: 'إغلاق',
      },
    ],
    // Vibration pattern (200ms on, 100ms off, 200ms on)
    vibrate: [200, 100, 200],
    // Badge on app icon (Android)
    badge: '/icon-192.png',
    // Silent notification (no sound/vibration)
    silent: payload.data?.silent === 'true',
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  
  event.notification.close();

  // Get the action clicked
  const action = event.action;
  const data = event.notification.data || {};
  
  // Handle different actions
  if (action === 'close') {
    return; // Just close the notification
  }

  // Open or focus the app
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close (analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification);
  
  // Optional: Send analytics event
  // const data = event.notification.data || {};
  // fetch('/api/analytics/notification-dismissed', {
  //   method: 'POST',
  //   body: JSON.stringify({ notificationId: data.id }),
  // });
});

// Service worker install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Service worker activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Service worker fetch event (optional - for offline support)
self.addEventListener('fetch', (event) => {
  // Let the browser handle all fetch requests normally
  // We're only using this service worker for push notifications
  return;
});

console.log('[SW] Firebase Messaging Service Worker loaded');