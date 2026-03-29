/**
 * Wasel Unified Mobility OS — Core Type Definitions
 * Version 4.0 — Hybrid Model (Carpooling + On-Demand)
 */

// ============================================================================
// TRIP MODES
// ============================================================================

export enum TripMode {
  CARPOOLING = 'carpooling',    // Advance booking, cost-sharing, casual drivers
  ON_DEMAND = 'on_demand',      // Real-time matching, professional drivers
  SCHEDULED = 'scheduled',      // Future on-demand booking
  PACKAGE = 'package',          // Package delivery
  RETURN = 'return',            // Raje3 e-commerce returns
}

export enum TripStatus {
  // Carpooling flow
  POSTED = 'posted',            // Driver posted ride
  BOOKED = 'booked',            // Passenger reserved seat
  CONFIRMED = 'confirmed',      // Driver accepted booking
  
  // On-demand flow
  REQUESTED = 'requested',      // Passenger requested ride
  MATCHED = 'matched',          // AI matched with driver
  ACCEPTED = 'accepted',        // Driver accepted request
  
  // Common flow
  PICKUP = 'pickup',            // Driver en route to pickup
  IN_PROGRESS = 'in_progress',  // Trip started
  COMPLETED = 'completed',      // Trip finished
  CANCELLED = 'cancelled',      // Trip cancelled
  DISPUTED = 'disputed',        // Dispute raised
}

// ============================================================================
// DRIVER TYPES
// ============================================================================

export enum DriverType {
  CASUAL = 'casual',            // Carpooling driver (occasional, cost-sharing)
  PROFESSIONAL = 'professional', // On-demand driver (full-time, verified)
  HYBRID = 'hybrid',            // Both carpooling + on-demand
}

export enum DriverStatus {
  OFFLINE = 'offline',          // Not accepting requests
  AVAILABLE = 'available',      // Online, waiting for requests
  EN_ROUTE = 'en_route',        // Going to pickup
  BUSY = 'busy',                // On trip
  BREAK = 'break',              // On break
}

export interface DriverProfile {
  id: string;
  userId: string;
  type: DriverType;
  status: DriverStatus;
  
  // Vehicle info
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    capacity: number;           // Max passengers
    vehicleType: 'economy' | 'comfort' | 'premium';
  };
  
  // Verification
  verified: boolean;
  documentsSubmitted: boolean;
  backgroundCheckPassed: boolean;
  insuranceValid: boolean;
  licenseValid: boolean;
  
  // Stats
  rating: number;               // 0-5 stars
  totalTrips: number;
  totalEarnings: number;        // JOD
  acceptanceRate: number;       // 0-100%
  cancellationRate: number;     // 0-100%
  
  // Location (real-time)
  currentLocation?: {
    lat: number;
    lng: number;
    heading: number;            // 0-360 degrees
    speed: number;              // km/h
    timestamp: string;
  };
  
  // Preferences
  preferences: {
    acceptCarpooling: boolean;
    acceptOnDemand: boolean;
    acceptPackages: boolean;
    genderPreference?: 'mixed' | 'women_only' | 'men_only' | 'family_only';
    maxDetourMinutes: number;
    prayerStopsEnabled: boolean;
  };
  
  // Earnings
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    avgPerTrip: number;
    avgPerHour: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TRIP TYPES
// ============================================================================

export interface BaseTrip {
  id: string;
  mode: TripMode;
  status: TripStatus;
  
  // Locations
  origin: Location;
  destination: Location;
  waypoints?: Location[];       // Intermediate stops
  
  // Participants
  driverId: string;
  passengers: Passenger[];
  packages?: Package[];
  
  // Timing
  scheduledDeparture?: string;  // ISO timestamp (carpooling)
  requestedAt?: string;         // ISO timestamp (on-demand)
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Pricing
  pricing: TripPricing;
  
  // Route
  route?: RouteData;
  
  // Metadata
  distance: number;             // km
  duration: number;             // minutes
  
  createdAt: string;
  updatedAt: string;
}

export interface CarpoolingTrip extends BaseTrip {
  mode: TripMode.CARPOOLING;
  
  // Carpooling specific
  seatsAvailable: number;
  seatsBooked: number;
  pricePerSeat: number;         // JOD
  departureTime: string;        // ISO timestamp
  
  // Options
  prayerStopsEnabled: boolean;
  prayerStops?: PrayerStop[];
  genderPreference?: 'mixed' | 'women_only' | 'men_only' | 'family_only';
  smokingAllowed: boolean;
  petsAllowed: boolean;
  childrenAllowed: boolean;
  
  // Cost breakdown
  fuelCost: number;             // JOD
  tollsCost: number;            // JOD
  totalCost: number;            // JOD
  costPerSeat: number;          // JOD (includes 20% buffer)
}

export interface OnDemandTrip extends BaseTrip {
  mode: TripMode.ON_DEMAND;
  
  // On-demand specific
  requesterId: string;
  
  // Matching
  matchedDrivers?: string[];    // IDs of drivers offered the trip
  matchScore?: number;          // 0-100
  estimatedWaitTime?: number;   // minutes
  
  // Dynamic pricing
  baseFare: number;             // JOD
  surgeMultiplier: number;      // 1.0 - 3.0
  weatherBonus: number;         // 1.0 - 1.5
  eventBonus: number;           // 1.0 - 2.0
  finalPrice: number;           // JOD
  
  // Real-time tracking
  driverLocation?: {
    lat: number;
    lng: number;
    heading: number;
    eta: number;                // minutes
  };
}

export interface ScheduledTrip extends BaseTrip {
  mode: TripMode.SCHEDULED;
  
  // Future on-demand booking
  scheduledPickupTime: string;  // ISO timestamp
  reminderSent: boolean;
  
  // Inherits on-demand pricing
  baseFare: number;
  estimatedPrice: number;       // May change based on actual demand
}

// ============================================================================
// PRICING
// ============================================================================

export interface TripPricing {
  mode: TripMode;
  
  // Carpooling pricing
  carpooling?: {
    fuelCost: number;           // JOD
    tollsCost: number;          // JOD
    totalCost: number;          // JOD
    seatsAvailable: number;
    pricePerSeat: number;       // JOD
    driverBuffer: number;       // 20% (wear-and-tear compensation)
  };
  
  // On-demand pricing
  onDemand?: {
    baseFare: number;           // JOD (distance + time)
    distanceFare: number;       // JOD (km × rate)
    timeFare: number;           // JOD (min × rate)
    surgeMultiplier: number;    // 1.0 - 3.0
    weatherBonus: number;       // 1.0 - 1.5
    eventBonus: number;         // 1.0 - 2.0
    finalPrice: number;         // JOD
    estimatedDriverEarnings: number; // JOD (after 22% commission)
  };
  
  // Commission
  platformCommission: number;   // JOD
  commissionRate: number;       // % (12% carpooling, 22% on-demand)
  
  // Payment
  paymentMethod: 'card' | 'cash' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'disputed';
}

export interface DynamicPricingFactors {
  timestamp: string;
  location: Location;
  
  // Demand/Supply
  passengersWaiting: number;
  driversAvailable: number;
  demandSupplyRatio: number;    // passengers / drivers
  
  // External factors
  weather: 'clear' | 'rain' | 'snow' | 'storm';
  trafficLevel: 'light' | 'moderate' | 'heavy';
  isRushHour: boolean;
  isHoliday: boolean;
  isMajorEvent: boolean;        // Concert, sports, etc.
  
  // Calculated multipliers
  surgeMultiplier: number;      // 1.0 - 3.0
  weatherMultiplier: number;    // 1.0 - 1.5
  eventMultiplier: number;      // 1.0 - 2.0
  
  // Final price impact
  basePrice: number;            // JOD
  adjustedPrice: number;        // JOD
}

// ============================================================================
// MATCHING
// ============================================================================

export interface MatchRequest {
  tripId: string;
  passengerId: string;
  mode: TripMode;
  
  origin: Location;
  destination: Location;
  requestedAt: string;
  
  // Preferences
  maxWaitTime: number;          // minutes
  maxPrice: number;             // JOD
  vehiclePreference?: 'economy' | 'comfort' | 'premium';
  genderPreference?: 'mixed' | 'women_only' | 'men_only' | 'family_only';
  
  // Package info (if applicable)
  hasPackage: boolean;
  packageSize?: 'small' | 'medium' | 'large';
}

export interface MatchResult {
  matchId: string;
  tripId: string;
  driverId: string;
  score: number;                // 0-100
  
  // Match factors
  factors: {
    distanceToPickup: number;   // km
    eta: number;                // minutes
    routeEfficiency: number;    // 0-100 (minimal detour)
    driverRating: number;       // 0-5
    priceMatch: number;         // 0-100
    preferenceMatch: number;    // 0-100 (gender, vehicle type, etc.)
  };
  
  // Estimated details
  estimatedPickupTime: string;  // ISO timestamp
  estimatedPrice: number;       // JOD
  estimatedDuration: number;    // minutes
  
  // Driver info
  driver: {
    id: string;
    name: string;
    photo: string;
    rating: number;
    totalTrips: number;
    vehicle: {
      make: string;
      model: string;
      color: string;
      plateNumber: string;
    };
  };
  
  expiresAt: string;            // Match offer expires in 60 seconds
}

// ============================================================================
// PREDICTIVE ANALYTICS
// ============================================================================

export interface CorridorIntelligence {
  corridorId: string;
  name: string;                 // e.g., "Amman → Aqaba"
  
  origin: Location;
  destination: Location;
  distance: number;             // km
  
  // Historical data
  avgTripsPerDay: number;
  avgTripsPerWeek: number;
  peakDays: string[];           // ['friday', 'saturday']
  peakHours: number[];          // [17, 18, 19] (5-7 PM)
  
  // Predictions (next 24h)
  predictedDemand: {
    timestamp: string;
    hour: number;
    passengers: number;
    confidence: number;         // 0-100%
  }[];
  
  // Current state
  currentDemand: number;        // passengers waiting
  currentSupply: number;        // drivers available
  demandSupplyRatio: number;
  
  // Recommendations
  recommendations: {
    driversNeeded: number;
    suggestedIncentive: number; // JOD
    surgeMultiplier: number;
    message: string;            // "High demand expected Friday 5-7 PM"
  };
  
  updatedAt: string;
}

export interface DemandHeatmap {
  timestamp: string;
  resolution: 'city' | 'district' | 'neighborhood';
  
  zones: {
    zoneId: string;
    name: string;
    center: Location;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    
    // Demand metrics
    passengersWaiting: number;
    driversAvailable: number;
    demandLevel: 'low' | 'medium' | 'high' | 'critical';
    surgeMultiplier: number;
    
    // Predictions
    predictedEarnings: number;  // JOD per hour
    recommendedAction: 'stay' | 'move_here' | 'avoid';
    
    // Visual
    color: string;              // For heatmap visualization
    intensity: number;          // 0-100
  }[];
}

// ============================================================================
// CLUSTERING
// ============================================================================

export interface TripCluster {
  clusterId: string;
  driverId: string;
  mode: TripMode;
  
  // Combined services
  passengers: Passenger[];
  packages: Package[];
  returnItems?: ReturnItem[];   // Raje3
  
  // Route optimization
  optimizedRoute: {
    waypoints: Location[];
    totalDistance: number;      // km
    totalDuration: number;      // minutes
    totalDetour: number;        // minutes (vs direct route)
  };
  
  // Revenue
  passengerRevenue: number;     // JOD
  packageRevenue: number;       // JOD
  returnRevenue: number;        // JOD
  totalRevenue: number;         // JOD
  platformCommission: number;   // JOD
  driverEarnings: number;       // JOD
  
  // Efficiency
  revenuePerKm: number;         // JOD/km
  revenuePerMinute: number;     // JOD/min
  utilizationRate: number;      // 0-100% (seats filled + cargo)
  
  status: 'planning' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  district?: string;
  landmark?: string;
  placeId?: string;             // Google Places ID
}

export interface Passenger {
  id: string;
  userId: string;
  name: string;
  photo?: string;
  rating: number;
  phone: string;
  
  pickupLocation: Location;
  dropoffLocation: Location;
  
  status: 'pending' | 'confirmed' | 'picked_up' | 'dropped_off' | 'cancelled';
  
  // Payment
  fare: number;                 // JOD
  paymentMethod: 'card' | 'cash' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  
  // Preferences
  genderPreference?: 'mixed' | 'women_only' | 'men_only' | 'family_only';
  specialRequests?: string;
  
  bookedAt: string;
}

export interface Package {
  id: string;
  senderId: string;
  recipientId?: string;
  
  pickupLocation: Location;
  deliveryLocation: Location;
  
  // Package details
  size: 'small' | 'medium' | 'large';
  weight: number;               // kg
  description: string;
  value: number;                // JOD (for insurance)
  fragile: boolean;
  
  // Verification
  pickupCode: string;           // QR code
  deliveryCode: string;         // QR code
  pickupVerified: boolean;
  deliveryVerified: boolean;
  
  // Tracking
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  photos?: string[];
  
  // Pricing
  fee: number;                  // JOD
  insurance: number;            // JOD
  
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  id: string;
  customerId: string;
  merchantId: string;
  
  pickupLocation: Location;
  returnLocation: Location;
  
  // Item details
  orderNumber: string;
  itemDescription: string;
  returnReason: string;
  value: number;                // JOD
  
  // Verification
  pickupCode: string;
  deliveryCode: string;
  pickupVerified: boolean;
  deliveryVerified: boolean;
  
  // Pricing
  fee: number;                  // JOD (cheaper than standard package)
  
  status: 'pending' | 'picked_up' | 'in_transit' | 'returned' | 'cancelled';
  
  createdAt: string;
  updatedAt: string;
}

export interface RouteData {
  origin: Location;
  destination: Location;
  waypoints: Location[];
  
  // Route details
  distance: number;             // km
  duration: number;             // minutes
  polyline: string;             // Encoded polyline
  
  // Traffic
  trafficLevel: 'light' | 'moderate' | 'heavy';
  delayMinutes: number;
  
  // Prayer stops (if applicable)
  prayerStops?: PrayerStop[];
  
  // Optimization
  alternativeRoutes?: RouteData[];
}

export interface PrayerStop {
  id: string;
  name: string;
  location: Location;
  prayerTime: string;           // e.g., "Asr"
  scheduledTime: string;        // ISO timestamp
  duration: number;             // minutes (typically 15-20)
  
  // Mosque info
  facilities: {
    parking: boolean;
    restrooms: boolean;
    wudu: boolean;               // Ablution area
    womenSection: boolean;
  };
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface NotificationPayload {
  type: 'trip_matched' | 'driver_arriving' | 'trip_started' | 'trip_completed' | 
        'surge_alert' | 'demand_alert' | 'incentive_available' | 'payment_received';
  
  recipientId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  
  // Delivery
  channels: ('push' | 'sms' | 'email')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  createdAt: string;
}

// ============================================================================
// DRIVER INCENTIVES
// ============================================================================

export interface DriverIncentive {
  id: string;
  type: 'referral' | 'weekend_guarantee' | 'corridor_bonus' | 'peak_hour_bonus' | 'new_driver_bonus';
  
  title: string;
  description: string;
  
  // Requirements
  requirements: {
    minTrips?: number;
    timeRange?: { start: string; end: string };
    corridors?: string[];
    minRating?: number;
  };
  
  // Reward
  reward: {
    type: 'fixed' | 'percentage' | 'guaranteed_earnings';
    amount: number;             // JOD
  };
  
  // Status
  active: boolean;
  expiresAt?: string;
  
  // Stats
  claimedBy: number;            // Number of drivers who claimed
  totalPaid: number;            // JOD
  
  createdAt: string;
}

// ============================================================================
// ADMIN ANALYTICS
// ============================================================================

export interface PlatformMetrics {
  timestamp: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  // Users
  totalUsers: number;
  activePassengers: number;
  activeDrivers: number;
  newSignups: number;
  
  // Trips
  totalTrips: number;
  carpoolingTrips: number;
  onDemandTrips: number;
  packageDeliveries: number;
  returnDeliveries: number;
  
  // Revenue
  grossRevenue: number;         // JOD
  platformCommission: number;   // JOD
  driverEarnings: number;       // JOD
  avgRevenuePerTrip: number;    // JOD
  
  // Performance
  avgWaitTime: number;          // minutes (on-demand)
  matchSuccessRate: number;     // 0-100%
  bookingSuccessRate: number;   // 0-100% (carpooling)
  cancellationRate: number;     // 0-100%
  
  // Efficiency
  avgUtilization: number;       // 0-100% (seats + cargo)
  avgSurgeMultiplier: number;   // 1.0 - 3.0
  
  // Satisfaction
  avgPassengerRating: number;   // 0-5
  avgDriverRating: number;      // 0-5
}

export interface CorridorMetrics extends PlatformMetrics {
  corridorId: string;
  corridorName: string;
  
  // Corridor-specific
  avgTripsPerDay: number;
  peakDemandHours: number[];
  avgPricePerTrip: number;      // JOD
  liquidity: number;            // 0-100% (supply meets demand)
}
