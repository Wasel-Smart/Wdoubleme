/**
 * useCommunityStats — Fetches real community impact data from the backend
 * Used by Dashboard's CommunityImpactBanner and LiveRouteActivity
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

export interface CommunityStats {
  total_passengers: number;
  total_saved_jod: number;
  co2_saved_kg: number;
  active_rides: number;
  total_trips_completed: number;
  packages_delivered: number;
}

export interface RouteActivity {
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  count: number;
}

const FALLBACK_STATS: CommunityStats = {
  total_passengers: 0,
  total_saved_jod: 0,
  co2_saved_kg: 0,
  active_rides: 0,
  total_trips_completed: 0,
  packages_delivered: 0,
};

export function useCommunityStats() {
  const { data: stats = FALLBACK_STATS, isLoading } = useQuery<CommunityStats>({
    queryKey: ['community-stats'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/community/stats`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch {
        return FALLBACK_STATS;
      }
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return { stats, loading: isLoading };
}

export function useRouteActivity() {
  const { data, isLoading } = useQuery<{ routes: RouteActivity[]; totalActive: number }>({
    queryKey: ['route-activity'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/community/route-activity`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch {
        return { routes: [], totalActive: 0 };
      }
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return { routes: data?.routes ?? [], totalActive: data?.totalActive ?? 0, loading: isLoading };
}

export function useJourneyStreak() {
  const { user, session } = useAuth();

  const { data, isLoading } = useQuery<{
    currentStreak: number;
    longestStreak: number;
    badges: string[];
    totalWeeksActive: number;
  }>({
    queryKey: ['journey-streak', user?.id],
    queryFn: async () => {
      if (!user?.id || !session?.access_token) {
        return { currentStreak: 0, longestStreak: 0, badges: [], totalWeeksActive: 0 };
      }
      try {
        const res = await fetch(`${API_URL}/community/streak/${user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch {
        return { currentStreak: 0, longestStreak: 0, badges: [], totalWeeksActive: 0 };
      }
    },
    enabled: !!user?.id && !!session?.access_token,
    staleTime: 120_000,
  });

  return {
    streak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    badges: data?.badges ?? [],
    totalWeeksActive: data?.totalWeeksActive ?? 0,
    loading: isLoading,
  };
}
