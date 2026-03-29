/**
 * Push Notification Service
 * 
 * Supports multiple providers:
 * - Firebase Cloud Messaging (FCM) for iOS/Android
 * - OneSignal (alternative)
 * - Web Push API for PWA
 */

import { supabase } from './core';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  clickAction?: string;
  priority?: 'high' | 'normal';
}

export interface PushToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}

/**
 * Register push notification token
 */
export async function registerPushToken(
  tokenData: PushToken
): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({
      user_id: tokenData.userId,
      token: tokenData.token,
      platform: tokenData.platform,
      device_id: tokenData.deviceId,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to register push token:', error);
    throw error;
  }
}

/**
 * Remove push notification token
 */
export async function unregisterPushToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('token', token);

  if (error) {
    console.error('Failed to unregister push token:', error);
  }
}

/**
 * Send push notification to specific user
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotification
): Promise<void> {
  // Get user's active push tokens
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!tokens || tokens.length === 0) {
    console.log('No push tokens found for user:', userId);
    return;
  }

  // Send to all user's devices
  await Promise.all(
    tokens.map((token) =>
      sendToDevice(token.token, token.platform, notification)
    )
  );

  // Store notification in database
  await supabase.from('notifications').insert({
    user_id: userId,
    title: notification.title,
    message: notification.body,
    type: notification.data?.type || 'info',
    data: notification.data,
    created_at: new Date().toISOString(),
  });
}

/**
 * Send push notification to multiple users
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  notification: PushNotification
): Promise<void> {
  await Promise.all(
    userIds.map((userId) => sendPushNotification(userId, notification))
  );
}

/**
 * Send notification to device using FCM
 */
async function sendToDevice(
  token: string,
  platform: string,
  notification: PushNotification
): Promise<void> {
  const fcmServerKey = import.meta.env.VITE_FCM_SERVER_KEY;

  if (!fcmServerKey) {
    console.warn('FCM_SERVER_KEY not configured');
    return;
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        to: token,
        priority: notification.priority || 'high',
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon-192.png',
          image: notification.image,
          badge: notification.badge,
          sound: notification.sound || 'default',
          click_action: notification.clickAction,
        },
        data: notification.data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('FCM error:', error);

      // If token is invalid, deactivate it
      if (
        error.results?.[0]?.error === 'NotRegistered' ||
        error.results?.[0]?.error === 'InvalidRegistration'
      ) {
        await unregisterPushToken(token);
      }
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

/**
 * Request permission and get FCM token (client-side)
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return null;
  }

  if (Notification.permission === 'granted') {
    return await getToken();
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getToken();
    }
  }

  return null;
}

/**
 * Get FCM token (client-side)
 */
async function getToken(): Promise<string | null> {
  try {
    // This is a placeholder - actual implementation depends on Firebase SDK
    // In real app, use:
    // import { getMessaging, getToken } from 'firebase/messaging';
    // const messaging = getMessaging();
    // return await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });

    console.warn('FCM token generation not implemented - add Firebase SDK');
    return null;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Send trip notification
 */
export async function sendTripNotification(
  userId: string,
  type: 'trip_request' | 'trip_accepted' | 'driver_arriving' | 'trip_started' | 'trip_completed' | 'trip_cancelled',
  tripData: any
): Promise<void> {
  const notifications = {
    trip_request: {
      title: 'New Trip Request',
      titleAr: 'طلب رحلة جديد',
      body: `Pickup: ${tripData.pickupAddress}`,
      bodyAr: `الاستلام: ${tripData.pickupAddress}`,
    },
    trip_accepted: {
      title: 'Trip Accepted',
      titleAr: 'تم قبول الرحلة',
      body: `Your driver is on the way`,
      bodyAr: 'السائق في الطريق إليك',
    },
    driver_arriving: {
      title: 'Driver Arriving',
      titleAr: 'السائق قادم',
      body: `Your driver will arrive in ${tripData.eta} minutes`,
      bodyAr: `سيصل السائق خلال ${tripData.eta} دقيقة`,
    },
    trip_started: {
      title: 'Trip Started',
      titleAr: 'بدأت الرحلة',
      body: 'Your trip has started',
      bodyAr: 'بدأت رحلتك',
    },
    trip_completed: {
      title: 'Trip Completed',
      titleAr: 'اكتملت الرحلة',
      body: `Fare: ${tripData.fare} JOD`,
      bodyAr: `الأجرة: ${tripData.fare} دينار`,
    },
    trip_cancelled: {
      title: 'Trip Cancelled',
      titleAr: 'تم إلغاء الرحلة',
      body: tripData.reason || 'The trip has been cancelled',
      bodyAr: tripData.reason || 'تم إلغاء الرحلة',
    },
  };

  const notification = notifications[type];

  // Get user language preference
  const { data: profile } = await supabase
    .from('profiles')
    .select('language')
    .eq('id', userId)
    .single();

  const isArabic = profile?.language === 'ar';

  await sendPushNotification(userId, {
    title: isArabic ? notification.titleAr : notification.title,
    body: isArabic ? notification.bodyAr : notification.body,
    data: {
      type: 'trip',
      tripId: tripData.tripId,
      action: type,
    },
    icon: '/icon-192.png',
    sound: 'default',
    clickAction: `/trips/${tripData.tripId}`,
    priority: 'high',
  });
}

/**
 * Send payment notification
 */
export async function sendPaymentNotification(
  userId: string,
  type: 'payment_success' | 'payment_failed' | 'refund_processed',
  paymentData: any
): Promise<void> {
  const notifications = {
    payment_success: {
      title: 'Payment Successful',
      titleAr: 'تم الدفع بنجاح',
      body: `Amount: ${paymentData.amount} ${paymentData.currency}`,
      bodyAr: `المبلغ: ${paymentData.amount} ${paymentData.currency}`,
    },
    payment_failed: {
      title: 'Payment Failed',
      titleAr: 'فشل الدفع',
      body: 'Please try again or use a different payment method',
      bodyAr: 'يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى',
    },
    refund_processed: {
      title: 'Refund Processed',
      titleAr: 'تمت معالجة الاسترداد',
      body: `Amount: ${paymentData.amount} ${paymentData.currency}`,
      bodyAr: `المبلغ: ${paymentData.amount} ${paymentData.currency}`,
    },
  };

  const notification = notifications[type];

  const { data: profile } = await supabase
    .from('profiles')
    .select('language')
    .eq('id', userId)
    .single();

  const isArabic = profile?.language === 'ar';

  await sendPushNotification(userId, {
    title: isArabic ? notification.titleAr : notification.title,
    body: isArabic ? notification.bodyAr : notification.body,
    data: {
      type: 'payment',
      transactionId: paymentData.transactionId,
      action: type,
    },
    icon: '/icon-192.png',
  });
}

/**
 * Send promotional notification
 */
export async function sendPromoNotification(
  userIds: string[],
  promoData: {
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    promoCode?: string;
    image?: string;
  }
): Promise<void> {
  // Get users with their language preferences
  const { data: users } = await supabase
    .from('profiles')
    .select('id, language')
    .in('id', userIds);

  if (!users) return;

  // Send to each user in their preferred language
  await Promise.all(
    users.map((user) => {
      const isArabic = user.language === 'ar';
      return sendPushNotification(user.id, {
        title: isArabic ? promoData.titleAr : promoData.title,
        body: isArabic ? promoData.messageAr : promoData.message,
        data: {
          type: 'promotion',
          promoCode: promoData.promoCode,
        },
        image: promoData.image,
        icon: '/icon-192.png',
        clickAction: '/promotions',
      });
    })
  );
}

/**
 * Setup service worker for push notifications (client-side)
 */
export async function setupServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Handle foreground messages (client-side)
 */
export function onForegroundMessage(
  callback: (payload: any) => void
): () => void {
  // This is a placeholder - actual implementation depends on Firebase SDK
  // In real app, use:
  // import { getMessaging, onMessage } from 'firebase/messaging';
  // const messaging = getMessaging();
  // return onMessage(messaging, callback);

  console.warn('Foreground message handling not implemented - add Firebase SDK');
  return () => {};
}
