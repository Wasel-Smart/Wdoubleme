/**
 * W Mobility Platform - Real-time Subscriptions
 * Live updates for trips, driver locations, messages, and notifications
 */

import { supabase } from './backend-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =====================================================
// TYPES
// =====================================================

type SubscriptionCallback<T = any> = (payload: T) => void;

interface TripUpdate {
  id: string;
  status: string;
  driver_id?: string;
  [key: string]: any;
}

interface DriverLocationUpdate {
  driver_id: string;
  location: any;
  heading?: number;
  speed_kmh?: number;
  status: string;
}

interface MessageUpdate {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  trip_id?: string;
  created_at: string;
}

interface NotificationUpdate {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
}

// =====================================================
// TRIP SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to a specific trip's updates
 */
export function subscribeTripUpdates(
  tripId: string,
  onUpdate: SubscriptionCallback<TripUpdate>
): RealtimeChannel {
  const channel = supabase
    .channel(`trip:${tripId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`
      },
      (payload) => {
        console.log('Trip update:', payload);
        onUpdate(payload.new as TripUpdate);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to trip bookings for a specific trip
 */
export function subscribeTripBookings(
  tripId: string,
  onUpdate: SubscriptionCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`trip-bookings:${tripId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trip_bookings',
        filter: `trip_id=eq.${tripId}`
      },
      (payload) => {
        console.log('Booking update:', payload);
        onUpdate(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to available trips (for search results)
 */
export function subscribeAvailableTrips(
  filters: {
    mode?: 'carpooling' | 'on_demand';
    corridor?: string;
  },
  onUpdate: SubscriptionCallback
): RealtimeChannel {
  const channel = supabase
    .channel('available-trips')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
        filter: filters.mode ? `mode=eq.${filters.mode}` : undefined
      },
      (payload) => {
        // Only notify about posted/available trips
        if (payload.new && (payload.new as any).status === 'posted') {
          onUpdate(payload);
        }
      }
    )
    .subscribe();

  return channel;
}

// =====================================================
// DRIVER LOCATION SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to a specific driver's location updates
 */
export function subscribeDriverLocation(
  driverId: string,
  onUpdate: SubscriptionCallback<DriverLocationUpdate>
): RealtimeChannel {
  const channel = supabase
    .channel(`driver-location:${driverId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'driver_locations',
        filter: `driver_id=eq.${driverId}`
      },
      (payload) => {
        onUpdate(payload.new as DriverLocationUpdate);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to all online drivers in a region (for heatmap)
 */
export function subscribeNearbyDrivers(
  onUpdate: SubscriptionCallback<DriverLocationUpdate>
): RealtimeChannel {
  const channel = supabase
    .channel('nearby-drivers')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'driver_locations',
        filter: 'status=eq.online'
      },
      (payload) => {
        onUpdate(payload.new as DriverLocationUpdate);
      }
    )
    .subscribe();

  return channel;
}

// =====================================================
// MESSAGE SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to messages for a user
 */
export function subscribeMessages(
  userId: string,
  onNewMessage: SubscriptionCallback<MessageUpdate>
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        onNewMessage(payload.new as MessageUpdate);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to a specific conversation
 */
export function subscribeConversation(
  userId: string,
  otherUserId: string,
  onMessage: SubscriptionCallback<MessageUpdate>
): RealtimeChannel {
  const channel = supabase
    .channel(`conversation:${userId}:${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        const msg = payload.new as MessageUpdate;
        // Filter for messages between these two users
        if (
          (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === userId)
        ) {
          onMessage(msg);
        }
      }
    )
    .subscribe();

  return channel;
}

// =====================================================
// NOTIFICATION SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to notifications for a user
 */
export function subscribeNotifications(
  userId: string,
  onNotification: SubscriptionCallback<NotificationUpdate>
): RealtimeChannel {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as NotificationUpdate);
      }
    )
    .subscribe();

  return channel;
}

// =====================================================
// PACKAGE TRACKING SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to package updates
 */
export function subscribePackageTracking(
  packageId: string,
  onUpdate: SubscriptionCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`package:${packageId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'packages',
        filter: `id=eq.${packageId}`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
}

// =====================================================
// DEMAND FORECAST SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to demand forecast updates (for driver heatmap)
 */
export function subscribeDemandForecasts(
  corridor: string,
  onUpdate: SubscriptionCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`demand:${corridor}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'demand_forecasts',
        filter: `corridor=eq.${corridor}`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll(): void {
  supabase.removeAllChannels();
}

/**
 * Get channel status
 */
export function getChannelStatus(channel: RealtimeChannel): string {
  return channel.state;
}

// =====================================================
// PRESENCE (Online/Offline Status)
// =====================================================

/**
 * Track user presence (online/offline)
 */
export function trackUserPresence(
  userId: string,
  userData: {
    name: string;
    avatar?: string;
    status?: 'online' | 'away' | 'busy';
  }
): RealtimeChannel {
  const channel = supabase
    .channel('online-users')
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Online users:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          ...userData,
          online_at: new Date().toISOString()
        });
      }
    });

  return channel;
}

/**
 * Track driver online status
 */
export function trackDriverPresence(
  driverId: string,
  driverData: {
    name: string;
    vehicle: string;
    status: 'online' | 'busy' | 'in_trip';
    location?: { lat: number; lng: number };
  }
): RealtimeChannel {
  const channel = supabase
    .channel('online-drivers')
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Online drivers:', state);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          driver_id: driverId,
          ...driverData,
          online_at: new Date().toISOString()
        });
      }
    });

  return channel;
}

// =====================================================
// BROADCAST (Real-time Events)
// =====================================================

/**
 * Broadcast a real-time event (e.g., trip matched, driver arriving)
 */
export function broadcastEvent(
  channel: string,
  event: string,
  payload: any
): Promise<void> {
  const ch = supabase.channel(channel);
  
  return new Promise((resolve, reject) => {
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const result = await ch.send({
          type: 'broadcast',
          event,
          payload
        });
        
        if (result === 'ok') {
          resolve();
        } else {
          reject(new Error('Failed to broadcast event'));
        }
        
        // Cleanup
        supabase.removeChannel(ch);
      }
    });
  });
}

/**
 * Listen for broadcast events
 */
export function listenToBroadcast(
  channel: string,
  event: string,
  callback: SubscriptionCallback
): RealtimeChannel {
  const ch = supabase
    .channel(channel)
    .on('broadcast', { event }, (payload) => {
      callback(payload.payload);
    })
    .subscribe();

  return ch;
}

// =====================================================
// EXPORT
// =====================================================

export default {
  subscribeTripUpdates,
  subscribeTripBookings,
  subscribeAvailableTrips,
  subscribeDriverLocation,
  subscribeNearbyDrivers,
  subscribeMessages,
  subscribeConversation,
  subscribeNotifications,
  subscribePackageTracking,
  subscribeDemandForecasts,
  unsubscribe,
  unsubscribeAll,
  getChannelStatus,
  trackUserPresence,
  trackDriverPresence,
  broadcastEvent,
  listenToBroadcast
};
