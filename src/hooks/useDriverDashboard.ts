/**
 * useDriverDashboard — React Query hook for the Driver Dashboard
 *
 * Calls GET /driver/dashboard which returns:
 *  - profile: driver profile with rating, status, acceptance_rate
 *  - earnings: today / week / month breakdowns (net after 15% commission)
 *
 * ✅ React Query for caching + auto-refetch (30 s)
 * ✅ Structured fallback prevents render crashes on error / empty state
 * ✅ Exposes updateStatus() mutation for online/offline/busy toggle
 * ✅ Exposes refetch() for manual pull-to-refresh
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, fetchWithRetry } from '../services/core';

// ── Domain types ──────────────────────────────────────────────────────────────

export type DriverStatus = 'online' | 'offline' | 'busy';

export interface DriverProfile {
  id: string;
  full_name: string;
  rating: number;
  rating_as_driver: number;
  trips_as_driver: number;
  total_trips: number;
  acceptance_rate: number;
  cancellation_rate: number;
  status: DriverStatus;
  avatar_url?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  wallet_balance: number;
  total_earned: number;
}

export interface EarningsPeriod {
  trips: number;
  gross_earnings: number;
  net_earnings: number;
  tips: number;
  hours_online: number;
}

export interface DriverEarnings {
  today: EarningsPeriod;
  week: EarningsPeriod;
  month: EarningsPeriod;
  pending_payout: number;
  next_payout_date: string;
}

export interface DriverDashboardData {
  profile: DriverProfile;
  earnings: DriverEarnings;
}

// ── Fallback / empty state ────────────────────────────────────────────────────

const EMPTY_PERIOD: EarningsPeriod = {
  trips: 0,
  gross_earnings: 0,
  net_earnings: 0,
  tips: 0,
  hours_online: 0,
};

const FALLBACK: DriverDashboardData = {
  profile: {
    id: '',
    full_name: 'Driver',
    rating: 5.0,
    rating_as_driver: 5.0,
    trips_as_driver: 0,
    total_trips: 0,
    acceptance_rate: 100,
    cancellation_rate: 0,
    status: 'offline',
    wallet_balance: 0,
    total_earned: 0,
  },
  earnings: {
    today: EMPTY_PERIOD,
    week: EMPTY_PERIOD,
    month: EMPTY_PERIOD,
    pending_payout: 0,
    next_payout_date: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  },
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDriverDashboard() {
  const { session, user } = useAuth();
  const queryClient = useQueryClient();

  const QUERY_KEY = ['driver-dashboard', user?.id] as const;

  const {
    data = FALLBACK,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<DriverDashboardData>({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<DriverDashboardData> => {
      if (!session?.access_token) return FALLBACK;

      const res = await fetchWithRetry(`${API_URL}/driver/dashboard`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('[useDriverDashboard] Server error:', res.status, body);
        return FALLBACK;
      }

      const json = await res.json();
      return {
        profile: { ...FALLBACK.profile, ...json.profile },
        earnings: { ...FALLBACK.earnings, ...json.earnings },
      };
    },
    enabled: !!user && !!session,
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  /**
   * Toggle driver availability: online → offline → busy
   * Optimistically updates the local cache so the UI responds immediately.
   */
  const updateStatus = useCallback(
    async (status: DriverStatus): Promise<boolean> => {
      if (!session?.access_token) return false;

      // Optimistic update
      queryClient.setQueryData<DriverDashboardData>(QUERY_KEY, (prev) =>
        prev ? { ...prev, profile: { ...prev.profile, status } } : prev,
      );

      try {
        const res = await fetchWithRetry(`${API_URL}/driver/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          // Rollback optimistic update on failure
          await queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
          return false;
        }
        return true;
      } catch (err) {
        console.error('[useDriverDashboard] updateStatus error:', err);
        await queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
        return false;
      }
    },
    [session?.access_token, queryClient, QUERY_KEY],
  );

  return { ...data, loading, error, refetch, updateStatus };
}
