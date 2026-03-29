import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsAPI } from '../services/trips';
import { toast } from 'sonner';

export interface Trip {
  id: string;
  driver_id: string;
  from: string;
  to: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: string;
  total_seats?: number;
  trip_type?: 'wasel' | 'raje3';
  stops?: Array<{ lat: number; lng: number; label: string }>;
  preferences?: {
    smoking_allowed: boolean;
    pets_allowed: boolean;
    music_allowed: boolean;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
  };
  created_at?: string;
  updated_at?: string;
}

export function useTrips(filters?: {
  status?: string[];
  driverId?: string;
  fromDate?: string;
}) {
  const queryClient = useQueryClient();

  const {
    data: trips = [],
    isLoading: loading,
    error: errorObj,
    refetch,
  } = useQuery({
    queryKey: ['trips', filters],
    queryFn: async () => {
      let data: Trip[] = [];
      if (filters?.driverId) {
        const response = await tripsAPI.getDriverTrips();
        data = response.trips || [];
      } else {
        const response = await tripsAPI.searchTrips(
          undefined,
          undefined,
          filters?.fromDate
        );
        data = response.trips || [];
      }

      // Client-side filtering
      if (filters?.status && filters.status.length > 0) {
        data = data.filter((trip) => filters.status?.includes(trip.status));
      }

      if (filters?.fromDate) {
        data = data.filter((trip) => trip.departure_date >= filters.fromDate!);
      }

      return data;
    },
  });

  const createTripMutation = useMutation({
    mutationFn: (tripData: any) => tripsAPI.createTrip(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create trip');
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ tripId, updates }: { tripId: string; updates: any }) =>
      tripsAPI.updateTrip(tripId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update trip');
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: (tripId: string) => tripsAPI.deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete trip');
    },
  });

  const publishTripMutation = useMutation({
    mutationFn: (tripId: string) => tripsAPI.publishTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip published successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to publish trip');
    },
  });

  return {
    trips,
    loading,
    error: errorObj ? (errorObj as Error).message : null,
    refresh: refetch,
    createTrip: async (tripData: any) => {
        try {
            const result = await createTripMutation.mutateAsync(tripData);
            return { data: result.trip, error: null };
        } catch (e: any) {
            return { data: null, error: e.message };
        }
    },
    updateTrip: async (tripId: string, updates: any) => {
         try {
            const result = await updateTripMutation.mutateAsync({ tripId, updates });
            return { data: result.trip, error: null };
        } catch (e: any) {
            return { data: null, error: e.message };
        }
    },
    deleteTrip: deleteTripMutation.mutateAsync,
    publishTrip: publishTripMutation.mutateAsync,
  };
}

export function useSearchTrips(searchParams: {
  from?: string;
  to?: string;
  departureDate?: string;
  seats?: number;
}) {
  const {
    data: trips = [],
    isLoading: loading,
    error: errorObj,
    refetch: searchTrips,
  } = useQuery({
    queryKey: ['searchTrips', searchParams],
    queryFn: async () => {
      const response = await tripsAPI.searchTrips(
        searchParams.from,
        searchParams.to,
        searchParams.departureDate,
        searchParams.seats
      );
      return response.trips || [];
    },
    enabled: false, // Don't fetch automatically, wait for user action if desired, or set true
  });

  return {
    trips,
    loading,
    error: errorObj ? (errorObj as Error).message : null,
    searchTrips,
  };
}

export function useTrip(tripId: string | null) {
  const {
    data: trip = null,
    isLoading: loading,
    error: errorObj,
    refetch,
  } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      const response = await tripsAPI.getTripById(tripId);
      return response.trip;
    },
    enabled: !!tripId,
  });

  return {
    trip,
    loading,
    error: errorObj ? (errorObj as Error).message : null,
    refresh: refetch,
  };
}