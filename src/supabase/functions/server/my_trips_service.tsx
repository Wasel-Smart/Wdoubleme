/**
 * My Trips Service - Get all user's trips (as passenger and driver)
 * 
 * Returns:
 * - upcoming: Future trips (as passenger)
 * - active: Currently active trip (if any)
 * - completed: Past trips (as passenger)
 * - driver_trips: Trips posted as driver
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// TEST ENDPOINT - Remove after debugging
app.get('/make-server-0b1f4071/test-my-trips', (c) => {
  console.log('[TEST] My trips service is loaded!');
  return c.json({ 
    message: 'My trips service is working!',
    timestamp: new Date().toISOString() 
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface MyTripDriver {
  name: string;
  initials: string;
  rating: number;
  trips: number;
  img: string;
}

interface MyTripRecord {
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

interface DriverTripRecord {
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

interface ActiveTrip {
  id: string;
  trip_id: string;
  status: string;
  driver: {
    name: string;
    phone: string;
    rating: number;
    img: string;
  };
  vehicle: {
    model: string;
    plate: string;
    color: string;
  };
  from: string;
  to: string;
  pickup_time: string;
  eta_minutes: number;
  current_location?: { lat: number; lng: number };
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /make-server-0b1f4071/my-trips
 * Get all trips for current user (as passenger and driver)
 */
app.get('/make-server-0b1f4071/my-trips', async (c) => {
  console.log('[my-trips] ========================================');
  console.log('[my-trips] REQUEST RECEIVED!');
  console.log('[my-trips] ========================================');
  
  try {
    // For demo, we'll use a mock user ID
    // In production, extract from JWT token
    const mockUserId = 'user_001';

    console.log('[my-trips] Fetching trips for user:', mockUserId);

    // Get all bookings for this user
    const bookingKeys = await kv.getByPrefix(`booking:${mockUserId}:`);
    console.log('[my-trips] Found bookings:', bookingKeys.length);

    // Get all rides posted by this user (as driver)
    const driverRideKeys = await kv.getByPrefix(`ride:`);
    console.log('[my-trips] Total rides in DB:', driverRideKeys.length);

    // Get active trip if any
    const activeTrip = await kv.get(`active_trip:${mockUserId}`);
    console.log('[my-trips] Active trip:', activeTrip ? 'YES' : 'NO');

    // Process bookings (as passenger)
    const upcoming: MyTripRecord[] = [];
    const completed: MyTripRecord[] = [];

    for (const bookingValue of bookingKeys) {
      const booking = bookingValue as any;
      
      // Get the related ride (use ride_id field from booking)
      const rideId = booking.ride_id || booking.trip_id;
      const ride = await kv.get(`ride:${rideId}`);
      if (!ride) {
        console.log(`[my-trips] Ride not found for booking: ${booking.id}, ride_id: ${rideId}`);
        continue;
      }

      const rideData = ride as any;

      const record: MyTripRecord = {
        id: booking.id,
        trip_id: booking.trip_id,
        status: booking.status || 'pending',
        seats_requested: booking.seats_requested || 1,
        total_price: booking.total_price || 0,
        pickup_stop: booking.pickup_stop || rideData.from_city || 'N/A',
        dropoff_stop: booking.dropoff_stop || rideData.to_city || 'N/A',
        created_at: booking.created_at || new Date().toISOString(),
        updated_at: booking.updated_at || new Date().toISOString(),
        trip: {
          id: rideData.id,
          from: rideData.from_city,
          from_location: rideData.from_city,
          to: rideData.to_city,
          to_location: rideData.to_city,
          departure_date: rideData.departure_date,
          departure_time: rideData.departure_time,
          price_per_seat: rideData.price_per_seat,
          vehicle_model: rideData.vehicle_model,
          status: rideData.status,
          trip_type: 'wasel',
          driver: {
            name: rideData.driver_name || 'Unknown Driver',
            initials: getInitials(rideData.driver_name || 'UD'),
            rating: rideData.driver_rating || 4.5,
            trips: 120,
            img: rideData.driver_avatar || `https://i.pravatar.cc/150?u=${rideData.driver_id}`,
          },
        },
      };

      // Categorize by status and date
      const isCompleted = booking.status === 'completed' || booking.status === 'cancelled';
      const isPast = new Date(rideData.departure_date) < new Date();

      if (isCompleted || isPast) {
        completed.push(record);
      } else {
        upcoming.push(record);
      }
    }

    // Process trips posted by this user (as driver)
    const driverTrips: DriverTripRecord[] = [];
    
    for (const tripValue of driverRideKeys) {
      const trip = tripValue as any;
      
      // Only include trips posted by this driver
      if (trip.driver_id !== mockUserId) continue;

      // Get all bookings for this trip
      const tripBookings = await kv.getByPrefix(`booking:`) as any[];
      const passengers = tripBookings
        .filter((b: any) => b.trip_id === trip.id && b.status === 'accepted')
        .map((b: any) => ({
          name: b.passenger_name || 'Passenger',
          initials: getInitials(b.passenger_name || 'P'),
          seats: b.seats_requested || 1,
        }));

      const driverTrip: DriverTripRecord = {
        id: trip.id,
        from: trip.from_city,
        from_location: trip.from_city,
        to: trip.to_city,
        to_location: trip.to_city,
        departure_date: trip.departure_date,
        departure_time: trip.departure_time,
        price_per_seat: trip.price_per_seat,
        total_seats: trip.total_seats,
        available_seats: trip.available_seats,
        status: trip.status,
        trip_type: 'wasel',
        vehicle_model: trip.vehicle_model,
        passengers,
        created_at: trip.created_at || new Date().toISOString(),
      };

      driverTrips.push(driverTrip);
    }

    // Sort by date
    upcoming.sort((a, b) => {
      const aTime = a.trip.departure_date ? new Date(a.trip.departure_date).getTime() : 0;
      const bTime = b.trip.departure_date ? new Date(b.trip.departure_date).getTime() : 0;
      return aTime - bTime;
    });

    completed.sort((a, b) => {
      const aTime = a.trip.departure_date ? new Date(a.trip.departure_date).getTime() : 0;
      const bTime = b.trip.departure_date ? new Date(b.trip.departure_date).getTime() : 0;
      return bTime - aTime;
    });

    driverTrips.sort((a, b) => {
      const aTime = a.departure_date ? new Date(a.departure_date).getTime() : 0;
      const bTime = b.departure_date ? new Date(b.departure_date).getTime() : 0;
      return aTime - bTime;
    });

    const response = {
      upcoming,
      active: activeTrip as ActiveTrip | null,
      completed,
      driver_trips: driverTrips,
    };

    console.log('[my-trips] Returning:', {
      upcoming: upcoming.length,
      active: activeTrip ? 'yes' : 'no',
      completed: completed.length,
      driver_trips: driverTrips.length,
    });

    return c.json(response);
  } catch (error) {
    console.error('[my-trips] Error:', error);
    return c.json(
      {
        error: 'Failed to fetch trips',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;