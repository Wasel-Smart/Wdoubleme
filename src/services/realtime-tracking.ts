/**
 * Real-time Location Tracking Service
 * 
 * Handles live driver location updates during active trips
 * Uses Supabase Realtime for WebSocket connections
 */

import { supabase } from './core';

export interface LocationUpdate {
  driverId: string;
  tripId?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
  coordinates?: { lat: number; lng: number };
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  trip_id?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  heading?: number;
  speed?: number;
  accuracy?: number;
  updated_at: string;
}

export interface TripStatus {
  status: 'pending' | 'accepted' | 'arriving' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  eta?: number;
  distance?: number;
}

/**
 * Subscribe to driver location updates for a specific trip
 */
export function subscribeToDriverLocation(
  tripId: string,
  callback: (location: DriverLocation) => void
): () => void {
  const channel = supabase
    .channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'driver_locations',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        callback(payload.new as DriverLocation);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to nearby available drivers (for rider looking for a ride)
 */
export function subscribeToNearbyDrivers(
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  },
  callback: (drivers: DriverLocation[]) => void
): () => void {
  // Subscribe to driver location updates
  const channel = supabase
    .channel('nearby-drivers')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'driver_locations',
      },
      async () => {
        // Fetch updated list of nearby drivers
        const drivers = await getNearbyDrivers(bounds);
        callback(drivers);
      }
    )
    .subscribe();

  // Initial fetch
  getNearbyDrivers(bounds).then(callback);

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Update driver's current location
 */
export async function updateDriverLocation(
  driverId: string,
  location: LocationUpdate
): Promise<void> {
  const { error } = await supabase.from('driver_locations').upsert({
    driver_id: driverId,
    trip_id: location.tripId,
    location: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
    },
    heading: location.heading,
    speed: location.speed,
    accuracy: location.accuracy,
    updated_at: location.timestamp,
  });

  if (error) {
    console.error('Failed to update driver location:', error);
    throw error;
  }
}

/**
 * Get nearby available drivers within bounds
 */
export async function getNearbyDrivers(bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}): Promise<DriverLocation[]> {
  const { data, error } = await supabase
    .from('driver_locations')
    .select('*')
    .gte('location->coordinates->1', bounds.minLat)
    .lte('location->coordinates->1', bounds.maxLat)
    .gte('location->coordinates->0', bounds.minLng)
    .lte('location->coordinates->0', bounds.maxLng)
    .gt('updated_at', new Date(Date.now() - 60000).toISOString()); // Last 1 minute

  if (error) {
    console.error('Failed to fetch nearby drivers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Start tracking driver location (called by driver app)
 */
export class DriverLocationTracker {
  private watchId: number | null = null;
  private driverId: string;
  private tripId?: string;
  private updateInterval: number;

  constructor(driverId: string, updateInterval = 5000) {
    this.driverId = driverId;
    this.updateInterval = updateInterval;
  }

  start(tripId?: string) {
    this.tripId = tripId;

    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handleLocationUpdate(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocation not supported');
    }
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private async handleLocationUpdate(position: GeolocationPosition) {
    const location: LocationUpdate = {
      driverId: this.driverId,
      tripId: this.tripId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp).toISOString(),
    };

    try {
      await updateDriverLocation(this.driverId, location);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }
}

/**
 * Subscribe to trip status updates
 */
export function subscribeToTripStatus(
  tripId: string,
  callback: (trip: any) => void
): () => void {
  const channel = supabase
    .channel(`trip-status-${tripId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Calculate ETA based on current location and destination
 */
export async function calculateETA(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number; route: any }> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.lat},${origin.lng}&` +
      `destination=${destination.lat},${destination.lng}&` +
      `mode=driving&` +
      `key=${apiKey}`
  );

  const data = await response.json();

  if (data.status !== 'OK' || !data.routes?.[0]) {
    throw new Error('Failed to calculate route');
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    distance: leg.distance.value, // meters
    duration: leg.duration.value, // seconds
    route: route.overview_polyline.points,
  };
}

/**
 * Get distance between two points (Haversine formula)
 */
export function getDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Monitor pickup zone for driver arrival
 */
export function monitorPickupZone(
  tripId: string,
  pickupLocation: { lat: number; lng: number },
  radius: number,
  onDriverNearby: () => void
): () => void {
  let hasNotified = false;
  
  const unsubscribe = subscribeToDriverLocation(
    tripId,
    (location) => {
      if (hasNotified) return;
      
      const distance = getDistance(
        pickupLocation,
        {
          lat: location.location.coordinates[1],
          lng: location.location.coordinates[0]
        }
      );
      
      // Convert radius to km and check if driver is nearby
      if (distance <= radius / 1000) {
        hasNotified = true;
        onDriverNearby();
      }
    }
  );
  
  return unsubscribe;
}

/**
 * Send emergency SOS alert
 */
export async function sendEmergencySOS(
  tripId: string,
  location: { lat: number; lng: number },
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('emergency_alerts').insert({
      trip_id: tripId,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      reason,
      status: 'active',
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    
    // In production: Also trigger emergency services API, notify contacts, etc.
    return true;
  } catch (error) {
    console.error('Failed to send emergency SOS:', error);
    return false;
  }
}

/**
 * Real-time tracking service object
 */
export const realTimeTrackingService = {
  subscribeToDriverLocation,
  subscribeToNearbyDrivers,
  subscribeToTripStatus,
  updateDriverLocation,
  getNearbyDrivers,
  calculateETA,
  getDistance,
  monitorPickupZone,
  sendEmergencySOS,
  DriverLocationTracker
};