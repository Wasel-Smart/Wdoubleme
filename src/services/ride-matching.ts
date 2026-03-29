/**
 * Ride Matching Algorithm
 * 
 * Intelligently matches riders with nearby available drivers
 * Considers: distance, rating, vehicle type, pricing, wait time
 */

import { supabase } from './core';
import { getDistance } from './realtime-tracking';

export interface MatchCriteria {
  riderId: string;
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
  vehicleType?: 'sedan' | 'suv' | 'van' | 'luxury' | 'electric';
  maxWaitTime?: number; // minutes
  minRating?: number;
  preferredDrivers?: string[];
  specialRequirements?: string[];
}

export interface DriverMatch {
  driverId: string;
  vehicleId: string;
  distance: number; // km
  eta: number; // minutes
  rating: number;
  totalTrips: number;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate: string;
  matchScore: number;
}

/**
 * Find best matching drivers for a ride request
 */
export async function findMatchingDrivers(
  criteria: MatchCriteria
): Promise<DriverMatch[]> {
  // 1. Get nearby available drivers
  const nearbyDrivers = await getNearbyAvailableDrivers(
    criteria.pickupLocation,
    criteria.maxWaitTime || 10
  );

  // 2. Filter by criteria
  let matches = nearbyDrivers
    .filter((driver) => {
      // Vehicle type filter
      if (criteria.vehicleType && driver.vehicleType !== criteria.vehicleType) {
        return false;
      }

      // Minimum rating filter
      if (criteria.minRating && driver.rating < criteria.minRating) {
        return false;
      }

      return true;
    })
    .map((driver) => {
      // 3. Calculate match score
      const matchScore = calculateMatchScore(driver, criteria);
      return { ...driver, matchScore };
    });

  // 4. Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // 5. Return top 5 matches
  return matches.slice(0, 5);
}

/**
 * Get nearby available drivers within search radius
 */
async function getNearbyAvailableDrivers(
  location: { lat: number; lng: number },
  maxWaitMinutes: number
): Promise<DriverMatch[]> {
  // Calculate search radius (km) based on max wait time
  // Assume average speed of 30 km/h in city
  const searchRadiusKm = (maxWaitMinutes / 60) * 30;

  // Use PostGIS to find drivers within radius
  const { data, error } = await supabase.rpc('find_nearby_drivers', {
    user_lat: location.lat,
    user_lng: location.lng,
    radius_km: searchRadiusKm,
  });

  if (error) {
    console.error('Error finding nearby drivers:', error);
    return [];
  }

  return (
    data?.map((driver: any) => ({
      driverId: driver.driver_id,
      vehicleId: driver.vehicle_id,
      distance: driver.distance_km,
      eta: Math.ceil((driver.distance_km / 30) * 60), // minutes
      rating: driver.rating,
      totalTrips: driver.total_trips,
      vehicleType: driver.vehicle_type,
      vehicleMake: driver.vehicle_make,
      vehicleModel: driver.vehicle_model,
      vehicleColor: driver.vehicle_color,
      licensePlate: driver.license_plate,
      matchScore: 0, // Will be calculated
    })) || []
  );
}

/**
 * Calculate match score for a driver (0-100)
 * Higher score = better match
 */
function calculateMatchScore(
  driver: DriverMatch,
  criteria: MatchCriteria
): number {
  let score = 100;

  // Distance penalty (closer is better)
  // Penalize 10 points per km
  score -= Math.min(driver.distance * 10, 40);

  // Rating bonus (higher is better)
  // 5.0 rating = +10 points, 4.0 rating = 0 points
  score += (driver.rating - 4.0) * 10;

  // Experience bonus (more trips = better)
  // +5 points for every 100 trips (max 15 points)
  score += Math.min(Math.floor(driver.totalTrips / 100) * 5, 15);

  // Preferred driver bonus
  if (criteria.preferredDrivers?.includes(driver.driverId)) {
    score += 20;
  }

  // Vehicle type preference
  if (criteria.vehicleType === driver.vehicleType) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Assign driver to trip
 */
export async function assignDriverToTrip(
  tripId: string,
  driverId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('trips')
    .update({
      driver_id: driverId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', tripId);

  if (error) {
    console.error('Error assigning driver to trip:', error);
    return false;
  }

  // Update driver status to busy
  await supabase
    .from('drivers')
    .update({ status: 'busy' })
    .eq('id', driverId);

  // Send notification to driver
  await notifyDriver(driverId, tripId);

  return true;
}

/**
 * Auto-match algorithm - broadcast to nearby drivers
 */
export async function broadcastTripToDrivers(
  tripId: string,
  criteria: MatchCriteria
): Promise<void> {
  const matches = await findMatchingDrivers(criteria);

  // Send push notification to all matching drivers
  for (const match of matches) {
    await notifyDriver(match.driverId, tripId);
  }

  // Set timeout to auto-cancel if no driver accepts
  setTimeout(async () => {
    const { data: trip } = await supabase
      .from('trips')
      .select('status')
      .eq('id', tripId)
      .single();

    if (trip?.status === 'pending') {
      await supabase
        .from('trips')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'No drivers available',
        })
        .eq('id', tripId);
    }
  }, 5 * 60 * 1000); // 5 minutes timeout
}

/**
 * Send notification to driver about new trip
 */
async function notifyDriver(driverId: string, tripId: string): Promise<void> {
  // Get trip details
  const { data: trip } = await supabase
    .from('trips')
    .select('*, profiles!rider_id(*)')
    .eq('id', tripId)
    .single();

  if (!trip) return;

  // Create notification
  await supabase.from('notifications').insert({
    user_id: driverId,
    title: 'New Ride Request',
    message: `Pickup: ${trip.pickup_address}`,
    type: 'trip',
    data: {
      tripId,
      pickupLocation: trip.pickup_location,
      pickupAddress: trip.pickup_address,
      estimatedFare: trip.total_fare,
    },
  });

  // TODO: Send push notification via FCM/OneSignal
  console.log('Push notification sent to driver:', driverId);
}

/**
 * SQL function to create in Supabase for finding nearby drivers
 * Run this in SQL Editor:
 */
export const NEARBY_DRIVERS_SQL_FUNCTION = `
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT
)
RETURNS TABLE (
  driver_id UUID,
  vehicle_id UUID,
  distance_km FLOAT,
  rating DECIMAL,
  total_trips INTEGER,
  vehicle_type TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  license_plate TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS driver_id,
    d.vehicle_id,
    ST_Distance(
      d.current_location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000 AS distance_km,
    d.rating,
    d.total_trips,
    v.vehicle_type,
    v.make AS vehicle_make,
    v.model AS vehicle_model,
    v.color AS vehicle_color,
    v.license_plate
  FROM drivers d
  INNER JOIN vehicles v ON v.id = d.vehicle_id
  WHERE 
    d.status = 'online'
    AND d.is_available = true
    AND d.current_location IS NOT NULL
    AND ST_DWithin(
      d.current_location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
`;
