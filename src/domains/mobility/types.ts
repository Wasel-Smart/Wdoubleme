/**
 * Mobility Domain Types — Wasel | واصل
 *
 * Core type system for the carpooling network.
 * Hierarchy: Trip → Seats → Bookings → Passengers → Route → Stops
 *
 * These types are the contract between frontend, backend, and services.
 * All monetary values are in JOD (platform settlement currency).
 */

import type { SupportedCurrency } from '../../utils/currency';
import type { CountryCode } from '../../utils/regionConfig';

// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type TripStatus =
  | 'draft'        // Driver creating, not yet published
  | 'published'    // Open for bookings
  | 'full'         // All seats booked (may still accept packages)
  | 'in_progress'  // Trip has started
  | 'completed'    // Trip finished, payouts processed
  | 'cancelled';   // Cancelled by driver or admin

export type BookingStatus =
  | 'pending'      // Awaiting driver confirmation
  | 'confirmed'    // Driver accepted
  | 'rejected'     // Driver rejected
  | 'cancelled'    // Passenger cancelled (before trip)
  | 'no_show'      // Passenger didn't appear at pickup
  | 'completed';   // Trip completed, review period open

export type GenderPreference =
  | 'mixed'
  | 'women_only'
  | 'men_only'
  | 'family_only';

export type PaymentMethod =
  | 'online'           // Card / Apple Pay / Google Pay
  | 'cash_on_pickup'   // Cash handed over before trip
  | 'cash_on_arrival'  // Cash at destination (trust-based, deposit required)
  | 'wallet'           // Wasel in-app wallet
  | 'bnpl';            // Buy-now-pay-later (Tamara/Tabby)

export type SeatPosition =
  | 'front'
  | 'back_left'
  | 'back_center'
  | 'back_right'
  | 'third_row_left'
  | 'third_row_right';

export type VerificationLevel = 'none' | 'phone' | 'id' | 'sanad' | 'full';

export type StopType =
  | 'origin'
  | 'waypoint'
  | 'destination'
  | 'prayer_stop'
  | 'rest_stop';

// ─── Geographic ───────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface RouteStop {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  country: CountryCode;
  coordinates?: GeoCoordinates;
  type: StopType;
  /** ISO timestamp — when the trip is expected to reach this stop */
  estimatedArrival?: string;
  /** Minutes since previous stop */
  durationFromPrevMin?: number;
  /** Notes for passengers at this stop */
  notes?: string;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export interface Route {
  id: string;
  origin: RouteStop;
  destination: RouteStop;
  waypoints: RouteStop[];
  prayerStops: RouteStop[];
  totalDistanceKm: number;
  estimatedDurationMin: number;
  hasTolls: boolean;
  /** Toll amount in local country currency */
  tollCostLocal: number;
  country: CountryCode;
  /** True if trip crosses a national border */
  isCrossBorder: boolean;
}

// ─── Seat ─────────────────────────────────────────────────────────────────────

export interface Seat {
  id: string;
  tripId: string;
  position: SeatPosition;
  status: 'available' | 'booked' | 'reserved' | 'blocked';
  passengerId?: string;
  bookingId?: string;
}

// ─── Trip ─────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  driverId: string;

  // Route
  route: Route;

  // Timing
  departureTime: string;        // ISO 8601
  estimatedArrival: string;     // ISO 8601

  // Seats
  totalSeats: number;
  availableSeats: number;
  seats: Seat[];

  // Pricing (cost-sharing model — no surge)
  pricePerSeatJOD: number;
  displayCurrency: SupportedCurrency;
  paymentMethods: PaymentMethod[];

  // Preferences
  genderPreference: GenderPreference;
  allowsSmoking: boolean;
  allowsPets: boolean;
  allowsPackages: boolean;
  maxPackageWeightKg: number;

  // Status
  status: TripStatus;

  // Cultural
  hasPrayerStops: boolean;
  isRamadanMode: boolean;

  // Recurrence (school runs, corporate carpools)
  isRecurring: boolean;
  recurringDays?: number[];     // 0=Sun … 6=Sat

  // Metadata
  createdAt: string;
  updatedAt: string;
  country: CountryCode;

  // Aggregates (from joins)
  driver?: TravelerProfile;
  activePackages?: number;      // Packages booked on this trip
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  seatIds: string[];
  seatsBooked: number;

  // Financials — all in JOD
  totalAmountJOD: number;
  commissionJOD: number;
  driverEarnsJOD: number;
  depositJOD: number;           // For cash-on-arrival

  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed' | 'held';

  // Status
  status: BookingStatus;

  // Review (filled after trip completion)
  rating?: number;              // 1-5
  review?: string;

  // Timestamps
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationReason?: string;

  // Joined data
  trip?: Trip;
  passenger?: TravelerProfile;
}

// ─── Traveler Profile ─────────────────────────────────────────────────────────

export interface TravelerProfile {
  id: string;
  userId: string;
  displayName: string;
  /** Phone in E.164 format */
  phone: string;
  avatarUrl?: string;
  bio?: string;
  verificationLevel: VerificationLevel;
  trustScore: number;           // 0-100 (Sanad score)
  rating: number;               // 0.0-5.0
  totalTripsAsDriver: number;
  totalTripsAsPassenger: number;
  totalPackagesDelivered: number;
  joinedAt: string;
  country: CountryCode;
  preferredLanguage: 'ar' | 'en';
  genderPreference: GenderPreference;
  isVerifiedDriver: boolean;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  vehiclePlate?: string;
}

// ─── Search & Input ───────────────────────────────────────────────────────────

export interface TripSearchFilters {
  originCity: string;
  destinationCity: string;
  country: CountryCode;
  date: string;                 // YYYY-MM-DD
  passengers: number;
  genderPreference?: GenderPreference;
  maxPriceJOD?: number;
  minRating?: number;
  allowsPackages?: boolean;
  paymentMethod?: PaymentMethod;
  sortBy?: 'price_asc' | 'price_desc' | 'departure_asc' | 'rating_desc' | 'seats_desc';
}

export interface PostTripInput {
  originCity: string;
  destinationCity: string;
  originCityAr: string;
  destinationCityAr: string;
  waypoints?: string[];
  country: CountryCode;
  departureTime: string;
  availableSeats: number;
  pricePerSeatJOD: number;
  genderPreference: GenderPreference;
  allowsSmoking: boolean;
  allowsPets: boolean;
  allowsPackages: boolean;
  maxPackageWeightKg?: number;
  paymentMethods: PaymentMethod[];
  notes?: string;
  isRecurring?: boolean;
  recurringDays?: number[];
  vehicleInfo?: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
}

export interface BookTripInput {
  tripId: string;
  seatsRequested: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  pickupStop?: string;
  dropoffStop?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type TripNotificationType =
  | 'booking_request'          // New booking request for driver
  | 'booking_confirmed'        // Passenger's booking confirmed
  | 'booking_rejected'         // Passenger's booking rejected
  | 'trip_reminder_24h'        // 24h before trip
  | 'trip_reminder_1h'         // 1h before trip
  | 'trip_started'             // Driver started the trip
  | 'trip_completed'           // Trip completed
  | 'trip_cancelled_driver'    // Driver cancelled
  | 'trip_cancelled_passenger' // Passenger cancelled
  | 'review_requested';        // Post-trip review prompt

export interface TripNotification {
  id: string;
  type: TripNotificationType;
  tripId: string;
  bookingId?: string;
  recipientId: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  read: boolean;
  createdAt: string;
}

// ─── KV Storage Keys ──────────────────────────────────────────────────────────
// Naming convention for kv_store_0b1f4071 keys

export const KV_KEYS = {
  trip: (id: string) => `trip:${id}`,
  tripsForRoute: (country: CountryCode, origin: string, dest: string) =>
    `trips:${country}:${origin}:${dest}`,
  booking: (id: string) => `booking:${id}`,
  bookingsForTrip: (tripId: string) => `bookings:trip:${tripId}`,
  bookingsForUser: (userId: string) => `bookings:user:${userId}`,
  travelerProfile: (userId: string) => `traveler:${userId}`,
  tripCalendar: (userId: string, month: string) => `calendar:${userId}:${month}`,
} as const;
