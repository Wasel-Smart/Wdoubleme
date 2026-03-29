/**
 * useMyTrips — aggregated hook for the MyTrips page
 *
 * Calls GET /my-trips which returns all bookings (as passenger) and
 * all trips (as driver) with full details embedded in one round-trip.
 *
 * ✅ React Query for caching + polling (20 s)
 * ✅ Supabase Realtime subscription on kv_store_0b1f4071:
 *    fires instant cache invalidation whenever a booking or trip row
 *    changes — no manual refresh needed.
 * ✅ cancelBooking / cancelDriverTrip with optimistic invalidation
 * ✅ Proper cleanup of Realtime channel on unmount
 */

import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, fetchWithRetry } from '../services/core';
import { supabase } from '../utils/supabase/client';
import type { ActiveTrip } from '../services/activeTrip';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MyTripDriver {
  name: string;
  initials: string;
  rating: number;
  trips: number;
  img: string;
}

export interface MyTripRecord {
  id: string;
  trip_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  seats_requested: number;
  total_price: number;
  pickup_stop: string;
  dropoff_stop: string;
  created_at: string;
  updated_at: string;
  trip: {
    id: string;
    from?: string;
    from_location?: string;
    to?: string;
    to_location?: string;
    departure_date?: string;
    departure_time?: string;
    price_per_seat?: number;
    vehicle_model?: string;
    status?: string;
    trip_type?: 'wasel' | 'awasel' | 'raje3';
    driver: MyTripDriver;
  };
}

export interface DriverTripRecord {
  id: string;
  from?: string;
  from_location?: string;
  to?: string;
  to_location?: string;
  departure_date?: string;
  departure_time?: string;
  price_per_seat?: number;
  total_seats?: number;
  available_seats?: number;
  status?: string;
  trip_type?: 'wasel' | 'awasel' | 'raje3';
  vehicle_model?: string;
  passengers: Array<{ name: string; initials: string; seats: number }>;
  created_at: string;
}

export interface MyTripsData {
  upcoming: MyTripRecord[];
  active: ActiveTrip | null;
  completed: MyTripRecord[];
  driver_trips: DriverTripRecord[];
}

const EMPTY: MyTripsData = {
  upcoming: [],
  active: null,
  completed: [],
  driver_trips: [],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMyTrips() {
  const { session, user } = useAuth();
  const queryClient = useQueryClient();

  const QUERY_KEY = ['my-trips', user?.id] as const;
  const DASHBOARD_KEY = ['dashboard-stats', user?.id] as const;

  const {
    data = EMPTY,
    isLoading: loading,
    isFetching: refreshing,
    error,
    refetch,
  } = useQuery<MyTripsData>({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<MyTripsData> => {
      if (!session?.access_token) return EMPTY;

      const res = await fetchWithRetry(`${API_URL}/my-trips`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('[useMyTrips] Server error:', res.status, body);
        return EMPTY;
      }

      const json = await res.json();
      return {
        upcoming: json.upcoming ?? [],
        active: json.active ?? null,
        completed: json.completed ?? [],
        driver_trips: json.driver_trips ?? [],
      };
    },
    enabled: !!user && !!session,
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

  // ── Supabase Realtime — instant invalidation on booking/trip row changes ──

  useEffect(() => {
    if (!user || !supabase) return;

    const channelName = `my-trips-realtime:${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kv_store_0b1f4071',
        },
        (payload) => {
          const key: string =
            (payload.new as Record<string, unknown>)?.key as string ??
            (payload.old as Record<string, unknown>)?.key as string ??
            '';

          const relevant =
            key.startsWith('booking:') ||
            key.startsWith('trip:') ||
            key.startsWith(`active_trip:${user.id}`);

          if (relevant) {
            console.log('[useMyTrips] Realtime change detected →', key);
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [...DASHBOARD_KEY] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, queryClient]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const cancelBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      try {
        const res = await fetchWithRetry(`${API_URL}/bookings/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        if (res.ok) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] }),
            queryClient.invalidateQueries({ queryKey: [...DASHBOARD_KEY] }),
          ]);
          return true;
        }
        const body = await res.json().catch(() => ({}));
        console.error('[useMyTrips] cancelBooking failed:', res.status, body);
        return false;
      } catch (err) {
        console.error('[useMyTrips] cancelBooking error:', err);
        return false;
      }
    },
    [session?.access_token, queryClient, QUERY_KEY, DASHBOARD_KEY],
  );

  const cancelDriverTrip = useCallback(
    async (tripId: string): Promise<boolean> => {
      try {
        const res = await fetchWithRetry(`${API_URL}/trips/${tripId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        if (res.ok) {
          await queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
          return true;
        }
        const body = await res.json().catch(() => ({}));
        console.error('[useMyTrips] cancelDriverTrip failed:', res.status, body);
        return false;
      } catch (err) {
        console.error('[useMyTrips] cancelDriverTrip error:', err);
        return false;
      }
    },
    [session?.access_token, queryClient, QUERY_KEY],
  );

  return { ...data, loading, refreshing, error, refetch, cancelBooking, cancelDriverTrip };
}
