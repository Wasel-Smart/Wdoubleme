/**
 * React Query hooks for AI Intelligence Layer
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys (for cache management)
// ─────────────────────────────────────────────────────────────────────────────

export const queryKeys = {
  demandHeatmap: (date: string) => ['demand-heatmap', date] as const,
  routeForecast: (route: string, days: number) => ['route-forecast', route, days] as const,
  driverRecommendations: (driverId: string, location: string) => ['driver-recommendations', driverId, location] as const,
  clusteringOpportunities: (driverId: string) => ['clustering-opportunities', driverId] as const,
  tripDetails: (tripId: string) => ['trip-details', tripId] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

async function fetchDemandHeatmap(date: string) {
  const response = await fetch(
    `${API_BASE}/analytics/demand-heatmap?date=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch heatmap');
  }

  return response.json();
}

async function fetchRouteForecast(route: string, days: number) {
  const response = await fetch(
    `${API_BASE}/analytics/forecast/${encodeURIComponent(route)}?days=${days}`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch forecast');
  }

  return response.json();
}

async function fetchDriverRecommendations(driverId: string, location: string) {
  const response = await fetch(
    `${API_BASE}/analytics/driver-recommendations/${driverId}?location=${encodeURIComponent(location)}`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch recommendations');
  }

  return response.json();
}

async function fetchClusteringOpportunities(driverId: string) {
  const response = await fetch(
    `${API_BASE}/clustering/opportunities/${driverId}`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch opportunities');
  }

  return response.json();
}

async function createClusteredTrip(tripId: string) {
  const response = await fetch(
    `${API_BASE}/clustering/create/${tripId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create cluster');
  }

  return response.json();
}

async function recordTripAnalytics(data: {
  route: string;
  passengers: number;
  mode: string;
  revenue: number;
  weather?: string;
  isEvent?: boolean;
  eventType?: string;
}) {
  const response = await fetch(
    `${API_BASE}/analytics/record-trip`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record trip');
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// React Query Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get demand heatmap with caching
 * Auto-refreshes every 5 minutes
 */
export function useDemandHeatmap(date: string) {
  return useQuery({
    queryKey: queryKeys.demandHeatmap(date),
    queryFn: () => fetchDemandHeatmap(date),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    retry: 2,
  });
}

/**
 * Get route forecast with caching
 * Cached for 10 minutes
 */
export function useRouteForecast(route: string, days: number = 7) {
  return useQuery({
    queryKey: queryKeys.routeForecast(route, days),
    queryFn: () => fetchRouteForecast(route, days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!route,
  });
}

/**
 * Get driver recommendations with caching
 * Auto-refreshes every 3 minutes
 */
export function useDriverRecommendations(driverId: string, location: string = 'Amman') {
  return useQuery({
    queryKey: queryKeys.driverRecommendations(driverId, location),
    queryFn: () => fetchDriverRecommendations(driverId, location),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refetch every 3 minutes
    enabled: !!driverId,
  });
}

/**
 * Get clustering opportunities with caching
 * Auto-refreshes every 3 minutes
 */
export function useClusteringOpportunities(driverId: string) {
  return useQuery({
    queryKey: queryKeys.clusteringOpportunities(driverId),
    queryFn: () => fetchClusteringOpportunities(driverId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refetch every 3 minutes
    enabled: !!driverId,
  });
}

/**
 * Create clustered trip mutation
 * Invalidates clustering opportunities cache on success
 */
export function useCreateCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClusteredTrip,
    onSuccess: (data, tripId) => {
      // Invalidate clustering opportunities to refresh data
      queryClient.invalidateQueries({ queryKey: ['clustering-opportunities'] });
      
      // Show success notification (bilingual)
      toast.success('تم تجميع الرحلة بنجاح | Cluster created successfully', {
        description: data.summary ? `Revenue: ${data.summary.totalRevenue}` : undefined,
      });
    },
    onError: (error: any) => {
      // Show error notification (bilingual)
      toast.error('فشل تجميع الرحلة | Failed to create cluster', {
        description: error.message || 'Please try again',
      });
    },
  });
}

/**
 * Record trip analytics mutation
 * No cache invalidation needed (write-only)
 */
export function useRecordTrip() {
  return useMutation({
    mutationFn: recordTripAnalytics,
    onSuccess: (data) => {
      toast.success('تم تسجيل الرحلة | Trip analytics recorded', {
        description: 'Data saved for future predictions',
      });
    },
    onError: (error: any) => {
      toast.error('فشل تسجيل البيانات | Failed to record trip', {
        description: error.message || 'Please try again',
      });
    },
  });
}

/**
 * Prefetch demand heatmap (useful for tab switching)
 */
export function usePrefetchHeatmap(date: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.demandHeatmap(date),
      queryFn: () => fetchDemandHeatmap(date),
      staleTime: 3 * 60 * 1000,
    });
  };
}