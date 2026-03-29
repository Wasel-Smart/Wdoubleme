/**
 * useDashboardStats — React Query hook for passenger dashboard statistics
 *
 * Fetches the aggregated `/dashboard/stats` endpoint which returns
 * wallet balance, trip counts, total saved, CO₂, etc. in a single call.
 *
 * ✅ Auto-refetches every 30 s while the window is focused.
 * ✅ Structured fallback prevents render crashes on error.
 * ✅ Logs non-transient errors to console for debugging.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, fetchWithRetry, supabase } from '../services/core';

export interface DashboardStats {
  wallet_balance: number;
  total_trips: number;
  total_spent: number;
  total_saved: number;
  upcoming_trips: number;
  trips_as_driver: number;
  unread_notifications: number;
  has_active_trip: boolean;
  rating_as_passenger: number;
  rating_as_driver: number;
  co2_saved_kg: number;
  journey_streak: number;
  longest_streak: number;
  badges: string[];
}

const FALLBACK_STATS: DashboardStats = {
  wallet_balance: 0,
  total_trips: 0,
  total_spent: 0,
  total_saved: 0,
  upcoming_trips: 0,
  trips_as_driver: 0,
  unread_notifications: 0,
  has_active_trip: false,
  rating_as_passenger: 5.0,
  rating_as_driver: 0,
  co2_saved_kg: 0,
  journey_streak: 0,
  longest_streak: 0,
  badges: [],
};

export function useDashboardStats(): {
  stats: DashboardStats;
  loading: boolean;
  error: UseQueryResult['error'];
  refetch: UseQueryResult['refetch'];
} {
  const { session, user } = useAuth();

  const {
    data: stats = FALLBACK_STATS,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!session?.access_token || !user) return FALLBACK_STATS;

      // Try Edge Function first with reduced retries
      try {
        const res = await fetchWithRetry(
          `${API_URL}/dashboard/stats`, 
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
          // Using defaults: 5s timeout, 1 retry, 500ms backoff
        );

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        return data.stats ?? FALLBACK_STATS;
      } catch (error) {
        // Fallback to direct Supabase queries
        console.info('💡 [useDashboardStats] Using direct Supabase queries');
        
        try {
          // Fetch profile with wallet balance and trip stats
          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance, total_trips, trips_as_driver, trips_as_passenger, total_spent, total_earned, rating_as_driver, rating_as_passenger')
            .eq('id', user.id)
            .single();

          // Fetch upcoming trips count
          const { count: upcoming_trips } = await supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', user.id)
            .eq('status', 'scheduled');

          // Check for active trip
          const { data: activeTrips } = await supabase
            .from('trips')
            .select('id')
            .or(`driver_id.eq.${user.id},passenger_id.eq.${user.id}`)
            .eq('status', 'active')
            .limit(1);

          // Fetch notifications count
          const { count: unread_notifications } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

          const total_trips = profile?.trips_as_passenger || 0;
          const trips_as_driver = profile?.trips_as_driver || 0;
          const total_spent = profile?.total_spent || 0;

          return {
            wallet_balance: profile?.wallet_balance || 0,
            total_trips,
            total_spent,
            total_saved: total_spent * 0.15, // Estimate 15% savings
            upcoming_trips: upcoming_trips || 0,
            trips_as_driver,
            unread_notifications: unread_notifications || 0,
            has_active_trip: (activeTrips?.length || 0) > 0,
            rating_as_passenger: profile?.rating_as_passenger || 5.0,
            rating_as_driver: profile?.rating_as_driver || 0,
            co2_saved_kg: total_trips * 2.5, // Estimate 2.5kg CO2 saved per trip
            journey_streak: 0, // Placeholder for journey streak
            longest_streak: 0, // Placeholder for longest streak
            badges: [], // Placeholder for badges
          };
        } catch (dbError) {
          console.error('[useDashboardStats] Fallback query failed:', dbError);
          return FALLBACK_STATS;
        }
      }
    },
    enabled: !!user && !!session,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: false, // Disable React Query retries - we handle retries in fetchWithRetry
  });

  return { stats, loading, error, refetch };
}