/**
 * useRealTrips — React Query v5 hook for live trip data
 *
 * Migration from useState/useEffect to React Query:
 *  - Automatic caching, deduplication, background refetch
 *  - staleTime: 30s (trips don't change second-to-second)
 *  - Backward-compatible interface: same { trips, loading, error, fetchTrips, refetch }
 *  - mountedRef guards replaced by React Query's built-in cancellation
 *  - No implicit `any` — all types explicit
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = projectId
  ? `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`
  : '';

// ─── Domain models ────────────────────────────────────────────────────────────

export interface TripStop {
  lat: number;
  lng: number;
  label: string;
}

export interface TripPreferences {
  smoking_allowed: boolean;
  pets_allowed:    boolean;
  music_allowed:   boolean;
}

export interface TripDriver {
  full_name:        string;
  rating_as_driver: number;
  total_trips:      number;
  avatar_url?:      string;
}

export type TripType   = 'wasel' | 'awasel' | 'raje3';
export type TripStatus = 'active' | 'full' | 'completed' | 'cancelled';

export interface RealTrip {
  id:               string;
  driver_id:        string;
  from_location:    string;
  to_location:      string;
  departure_date:   string;
  departure_time:   string;
  return_date?:     string;
  return_time?:     string;
  available_seats:  number;
  total_seats:      number;
  price_per_seat:   number;
  currency:         string;
  status:           TripStatus;
  trip_type:        TripType;
  stops?:           TripStop[];
  preferences?:     TripPreferences;
  vehicle_model?:   string;
  notes?:           string;
  accept_packages?: boolean;
  driver?:          TripDriver;
  created_at:       string;
  updated_at:       string;
}

// ─── Search parameters ────────────────────────────────────────────────────────

export interface TripSearchParams {
  from?:     string;
  to?:       string;
  date?:     string;
  tripType?: TripType;
  minSeats?: number;
}

// ─── Hook options / return ────────────────────────────────────────────────────

export interface UseRealTripsOptions extends TripSearchParams {
  /**
   * When true, fetches only the current user's posted trips.
   * Requires auth. Default: false.
   */
  driverOnly?: boolean;
  /**
   * When false, suppresses the automatic fetch on mount.
   * Default: true.
   */
  autoFetch?: boolean;
}

export interface UseRealTripsReturn {
  trips:      RealTrip[];
  loading:    boolean;
  error:      string | null;
  /** Run a fresh search with optional parameter overrides. */
  fetchTrips: (searchParams?: Partial<TripSearchParams>) => Promise<void>;
  /** Re-run the last search with the same parameters. */
  refetch:    () => Promise<void>;
}

// ─── Query key builder ────────────────────────────────────────────────────────

function buildQueryKey(options: UseRealTripsOptions): readonly unknown[] {
  return [
    'realTrips',
    options.driverOnly ?? false,
    options.from        ?? '',
    options.to          ?? '',
    options.date        ?? '',
    options.tripType    ?? '',
    options.minSeats    ?? 1,
  ] as const;
}

// ─── Fetch function ───────────────────────────────────────────────────────────

async function fetchTripsFromApi(
  options: UseRealTripsOptions,
  token: string,
): Promise<RealTrip[]> {
  let endpoint: string;

  if (options.driverOnly) {
    endpoint = `${API_BASE}/trips/my`;
  } else {
    const params = new URLSearchParams();
    if (options.from)     params.set('from',       options.from);
    if (options.to)       params.set('to',         options.to);
    if (options.date)     params.set('date',        options.date);
    if (options.tripType) params.set('trip_type',   options.tripType);
    if (options.minSeats) params.set('min_seats',   String(options.minSeats));
    endpoint = `${API_BASE}/trips?${params.toString()}`;
  }

  const res = await fetch(endpoint, {
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(
      (body as { error?: string }).error ?? `Server responded with ${res.status}`,
    );
  }

  const data = await res.json();

  // The trips endpoint may return an array directly or { trips: [...] }
  if (Array.isArray(data)) return data as RealTrip[];
  if (Array.isArray(data.trips)) return data.trips as RealTrip[];
  if (Array.isArray(data.data)) return data.data as RealTrip[];
  return [];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRealTrips(options: UseRealTripsOptions = {}): UseRealTripsReturn {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = session?.access_token ?? publicAnonKey;

  const queryKey = buildQueryKey(options);
  const enabled  = options.autoFetch !== false;

  const { data, isLoading, error, refetch: rqRefetch } = useQuery<RealTrip[], Error>({
    queryKey,
    enabled,
    staleTime:   30_000,   // 30 s — trip listings don't change second-to-second
    gcTime:      5 * 60_000, // keep in cache 5 min after unmount
    retry:       2,
    queryFn:     () => fetchTripsFromApi(options, token),
  });

  const trips: RealTrip[] = data ?? [];
  const errorMsg: string | null = error instanceof Error ? error.message : null;

  /**
   * Imperative search — merges new params, updates the cache key,
   * and triggers a fresh fetch without needing a component re-render.
   */
  const fetchTrips = useCallback(
    async (searchParams: Partial<TripSearchParams> = {}): Promise<void> => {
      const merged: UseRealTripsOptions = { ...options, ...searchParams };
      const key = buildQueryKey(merged);
      await queryClient.fetchQuery<RealTrip[], Error>({
        queryKey: key,
        staleTime: 0, // always fresh on imperative call
        queryFn:   () => fetchTripsFromApi(merged, token),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, token, JSON.stringify(options)],
  );

  const refetch = useCallback(async (): Promise<void> => {
    await rqRefetch();
  }, [rqRefetch]);

  return { trips, loading: isLoading, error: errorMsg, fetchTrips, refetch };
}
