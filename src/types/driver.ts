/**
 * Driver-specific TypeScript types
 * Wassel Super App - Driver Interface
 */

export interface DriverProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  
  // License & Vehicle
  license_number: string;
  license_expiry: string;
  license_verified: boolean;
  vehicle_id: string;
  
  // Status
  status: 'offline' | 'online' | 'on_trip' | 'break';
  availability_status: 'available' | 'busy' | 'unavailable';
  current_location?: {
    lat: number;
    lng: number;
  };
  
  // Ratings & Stats
  rating: number;
  total_trips: number;
  total_earnings: number;
  acceptance_rate: number;
  cancellation_rate: number;
  
  // Shift Management
  shift_start?: string;
  shift_end?: string;
  hours_worked_today: number;
  
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  vin: string;
  
  // Categories
  category: 'economy' | 'premium' | 'luxury' | 'suv' | 'van';
  seats: number;
  
  // Verification
  insurance_verified: boolean;
  inspection_verified: boolean;
  registration_verified: boolean;
  
  // Documents
  insurance_expiry: string;
  registration_expiry: string;
  last_inspection: string;
  
  created_at: string;
  updated_at: string;
}

export interface RideRequest {
  id: string;
  passenger_id: string;
  passenger_name: string;
  passenger_rating: number;
  passenger_avatar?: string;
  
  // Trip Details
  pickup_location: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff_location: {
    address: string;
    lat: number;
    lng: number;
  };
  
  // Pricing
  estimated_fare: number;
  estimated_distance: number; // km
  estimated_duration: number; // minutes
  surge_multiplier: number;
  
  // Request Details
  seats_requested: number;
  special_requests?: string;
  service_type: 'standard' | 'premium' | 'luxury' | 'shared';
  
  // Timing
  pickup_time: string;
  request_expires_at: string;
  
  created_at: string;
}

export interface ActiveTrip {
  id: string;
  booking_id: string;
  
  // Passenger
  passenger_id: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_avatar?: string;
  
  // Locations
  pickup_location: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff_location: {
    address: string;
    lat: number;
    lng: number;
  };
  
  // Status
  status: 'accepted' | 'arriving' | 'arrived' | 'picked_up' | 'in_progress' | 'completed';
  
  // Navigation
  route_polyline?: string;
  current_step?: string;
  distance_remaining: number;
  time_remaining: number;
  
  // Pricing
  fare: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  
  // Timestamps
  accepted_at: string;
  arrived_at?: string;
  picked_up_at?: string;
  completed_at?: string;
}

export interface DriverEarnings {
  today: {
    trips: number;
    gross_earnings: number;
    net_earnings: number;
    tips: number;
    hours_online: number;
  };
  week: {
    trips: number;
    gross_earnings: number;
    net_earnings: number;
    tips: number;
    hours_online: number;
  };
  month: {
    trips: number;
    gross_earnings: number;
    net_earnings: number;
    tips: number;
    hours_online: number;
  };
  pending_payout: number;
  next_payout_date: string;
}

export interface HeatMapZone {
  id: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // meters
  demand_level: 'low' | 'medium' | 'high' | 'very_high';
  surge_multiplier: number;
  estimated_wait_time: number; // minutes
  active_riders: number;
  active_drivers: number;
}

export interface DriverShift {
  id: string;
  driver_id: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'break' | 'ended';
  
  // Stats for this shift
  trips_completed: number;
  earnings: number;
  distance_driven: number;
  hours_online: number;
  
  created_at: string;
  updated_at: string;
}
