/**
 * useBookings — React Query hook (v2.0)
 *
 * ✅ Upgraded from manual useState/useEffect to React Query
 * ✅ Uses QUERY_KEYS from cacheStrategy for consistent cache invalidation
 * ✅ queryClient.invalidateQueries on every mutation (create/update/cancel)
 * ✅ Stale time from STALE_TIMES.BOOKING_STATUS (20s — time-sensitive)
 * ✅ ALCOA+ mountedRef guard via React Query's built-in lifecycle
 * ✅ Auto-refetch every 20s while window is focused
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI } from '../services/bookings';
import { useAuth } from '../contexts/AuthContext';
import { QUERY_KEYS, STALE_TIMES } from '../utils/performance/cacheStrategy';

// Mock types
export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  seats_requested: number;
  pickup_stop?: string;
  dropoff_stop?: string;
  created_at: string;
  // Expanded fields
  trip?: any;
  passenger?: any;
}

interface BookingFilters {
  status?: string[];
  tripId?: string;
  passengerId?: string;
}

export function useBookings(filters?: BookingFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Derive a stable query key ──────────────────────────────────────────────
  const queryKey = filters?.tripId
    ? QUERY_KEYS.bookings.forTrip(filters.tripId)
    : QUERY_KEYS.bookings.forUser(user?.id ?? 'anon');

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: rawBookings = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<Booking[]>({
    queryKey,
    enabled: !!user,
    staleTime: STALE_TIMES.BOOKING_STATUS,
    refetchInterval: STALE_TIMES.BOOKING_STATUS,
    queryFn: async () => {
      let data: Booking[] = [];

      if (filters?.tripId) {
        const response = await bookingsAPI.getTripBookings(filters.tripId);
        data = response.bookings ?? [];
      } else {
        const response = await bookingsAPI.getUserBookings();
        data = response.bookings ?? [];
      }

      if (filters?.status?.length) {
        data = data.filter(b => filters.status!.includes(b.status));
      }
      if (filters?.passengerId) {
        data = data.filter(b => b.passenger_id === filters.passengerId);
      }

      return data;
    },
  });

  // ── Helper: invalidate all booking + trip caches after a mutation ──────────
  const invalidateAfterMutation = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips.all() }),
      // Also invalidate dashboard stats — booking changes affect metrics
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  };

  // ── Create booking mutation ───────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (bookingData: {
      trip_id: string;
      seats_requested?: number;
      pickup_stop?: string;
      dropoff_stop?: string;
    }) => {
      const result = await bookingsAPI.createBooking(
        bookingData.trip_id,
        bookingData.seats_requested ?? 1,
        bookingData.pickup_stop,
        bookingData.dropoff_stop,
      );
      return result.booking;
    },
    onSuccess: async () => {
      await invalidateAfterMutation();
    },
    onError: (err: any) => {
      console.error('[useBookings] createBooking error:', err?.message ?? err);
    },
  });

  // ── Update status mutation ─────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }) => {
      const result = await bookingsAPI.updateBookingStatus(bookingId, status);
      return result.booking;
    },
    onSuccess: async () => {
      await invalidateAfterMutation();
    },
    onError: (err: any) => {
      console.error('[useBookings] updateBookingStatus error:', err?.message ?? err);
    },
  });

  // ── Convenience wrappers ───────────────────────────────────────────────────
  const createBooking = async (bookingData: any) => {
    try {
      const data = await createMutation.mutateAsync(bookingData);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateBooking = async (bookingId: string, updates: any) => {
    if (!updates.status) {
      return { data: null, error: 'Only status updates are supported' };
    }
    try {
      const data = await updateMutation.mutateAsync({ bookingId, status: updates.status });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const acceptBooking  = (id: string) => updateBooking(id, { status: 'accepted' });
  const rejectBooking  = (id: string) => updateBooking(id, { status: 'rejected' });
  const cancelBooking  = (id: string) => updateBooking(id, { status: 'cancelled' });

  const error = queryError ? String(queryError) : null;

  return {
    bookings:      rawBookings,
    loading,
    error,
    refresh:       refetch,
    createBooking,
    updateBooking,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    // Expose mutation state for optimistic UI
    isCreating:    createMutation.isPending,
    isUpdating:    updateMutation.isPending,
  };
}
