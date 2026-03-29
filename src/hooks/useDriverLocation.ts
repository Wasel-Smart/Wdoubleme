/**
 * Real-time Driver Location Hook
 * Uses Supabase Realtime for live location updates
 */

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
}

interface UseDriverLocationOptions {
  tripId: string;
  enabled?: boolean;
  onLocationUpdate?: (location: DriverLocation) => void;
  fallbackToSimulation?: boolean; // For development/testing
}

/**
 * Subscribe to real-time driver location updates
 * Falls back to simulation if Realtime is not configured
 */
export function useDriverLocation({
  tripId,
  enabled = true,
  onLocationUpdate,
  fallbackToSimulation = true,
}: UseDriverLocationOptions) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const channelRef = useRef<any>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !tripId) return;

    let isUsingSimulation = false;

    // Try to subscribe to Realtime channel
    const channel = supabase
      .channel(`driver-location:${tripId}`)
      .on('broadcast', { event: 'location-update' }, (payload) => {
        if (!mountedRef.current) return;

        const newLocation = payload.payload as DriverLocation;
        setLocation(newLocation);
        setIsConnected(true);
        setError(null);

        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }
      })
      .subscribe((status) => {
        if (!mountedRef.current) return;

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);

          // Fallback to simulation if Realtime fails
          if (fallbackToSimulation && !isUsingSimulation) {
            console.warn(
              `[useDriverLocation] Realtime connection failed for trip ${tripId}. Falling back to simulation.`
            );
            isUsingSimulation = true;
            startSimulation();
          } else {
            setError('Failed to connect to real-time location updates');
          }
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [tripId, enabled, onLocationUpdate, fallbackToSimulation]);

  /**
   * Simulate driver location updates (for development/testing)
   */
  const startSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    // Initial location (random near Amman)
    let currentLocation: DriverLocation = {
      lat: 31.9539 + (Math.random() - 0.5) * 0.1,
      lng: 35.9106 + (Math.random() - 0.5) * 0.1,
      heading: Math.random() * 360,
      speed: 40 + Math.random() * 20,
      timestamp: new Date().toISOString(),
    };

    setLocation(currentLocation);

    // Update every 3 seconds
    simulationIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;

      // Simulate movement (random walk)
      const deltaLat = (Math.random() - 0.5) * 0.001; // ~100m
      const deltaLng = (Math.random() - 0.5) * 0.001;

      currentLocation = {
        lat: currentLocation.lat + deltaLat,
        lng: currentLocation.lng + deltaLng,
        heading: Math.atan2(deltaLng, deltaLat) * (180 / Math.PI),
        speed: 30 + Math.random() * 30,
        timestamp: new Date().toISOString(),
      };

      setLocation(currentLocation);

      if (onLocationUpdate) {
        onLocationUpdate(currentLocation);
      }
    }, 3000);

    setError('Using simulated location (Realtime not connected)');
  };

  return {
    location,
    isConnected,
    error,
    isSimulated: !!simulationIntervalRef.current,
  };
}

/**
 * Broadcast driver location (for driver app)
 * This should be called from the driver's mobile app
 */
export async function broadcastDriverLocation(
  tripId: string,
  location: DriverLocation
): Promise<void> {
  const channel = supabase.channel(`driver-location:${tripId}`);

  await channel.send({
    type: 'broadcast',
    event: 'location-update',
    payload: location,
  });
}
