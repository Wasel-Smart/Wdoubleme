// ============================================================================
// WASEL SUPER APP — TYPE DEFINITIONS
// Comprehensive type system for maximum type safety
// ============================================================================

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type Language = 'en' | 'ar';
export type Currency = 'JOD' | 'AED' | 'SAR' | 'KWD' | 'BHD' | 'EGP' | 'QAR' | 'OMR';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: Gender;
  
  // Verification Status
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  driver_license_verified: boolean;
  
  // Trip Statistics
  total_trips: number;
  trips_as_driver: number;
  trips_as_passenger: number;
  
  // Ratings
  rating_as_driver: number;
  rating_as_passenger: number;
  total_ratings_received: number;
  
  // Preferences
  smoking_allowed: boolean;
  pets_allowed: boolean;
  music_allowed: boolean;
  max_2_back_seat: boolean;
  language: Language;
  currency: Currency;
  
  // Settings
  notification_enabled: boolean;
  location_sharing_enabled: boolean;
  auto_accept_bookings: boolean;
  
  // Financial
  wallet_balance: number;
  total_earned: number;
  total_spent: number;
  
  // Vehicle Information
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_plate_number?: string;
  vehicle_seats?: number;
  
  // Metadata
  bio?: string;
  interests?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_active_at: string;
  deleted_at?: string;
}

export interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: Gender;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  music_allowed?: boolean;
  max_2_back_seat?: boolean;
  language?: Language;
  currency?: Currency;
  notification_enabled?: boolean;
  location_sharing_enabled?: boolean;
  auto_accept_bookings?: boolean;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_plate_number?: string;
  vehicle_seats?: number;
  bio?: string;
  interests?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// ============================================================================
// TRIP TYPES
// ============================================================================

export type TripStatus = 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled';
export type TripType = 'one-time' | 'recurring' | 'scheduled' | 'return';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';
export type MusicPreference = 'yes' | 'no' | 'ask';
export type ConversationLevel = 'quiet' | 'moderate' | 'chatty';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Waypoint {
  location: string;
  coordinates: Coordinates;
  stopover_duration_minutes?: number;
}

export interface Trip {
  id: string;
  driver_id: string;
  
  // Route Information
  from_location: string;
  to_location: string;
  from_coordinates?: Coordinates;
  to_coordinates?: Coordinates;
  distance_km?: number;
  estimated_duration_minutes?: number;
  waypoints?: Waypoint[];
  
  // Schedule
  departure_date: string;
  departure_time: string;
  arrival_time?: string;
  
  // Capacity & Pricing
  total_seats: number;
  available_seats: number;
  price_per_seat: number;
  currency: Currency;
  
  // Trip Type
  trip_type: TripType;
  recurrence_pattern?: RecurrencePattern;
  recurrence_days?: number[];
  
  // Status
  status: TripStatus;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  
  // Preferences
  smoking_allowed: boolean;
  pets_allowed: boolean;
  luggage_allowed: boolean;
  music_preference?: MusicPreference;
  conversation_level?: ConversationLevel;
  
  // Additional Info
  notes?: string;
  vehicle_info?: string;
  amenities?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  
  // Populated fields
  driver?: {
    name: string;
    initials: string;
    rating: number;
    trips: number;
    phone?: string;
    avatar_url?: string;
  };
}

export interface TripCreate {
  from_location: string;
  to_location: string;
  from_coordinates?: Coordinates;
  to_coordinates?: Coordinates;
  departure_date: string;
  departure_time: string;
  total_seats: number;
  price_per_seat: number;
  currency?: Currency;
  trip_type?: TripType;
  recurrence_pattern?: RecurrencePattern;
  recurrence_days?: number[];
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  luggage_allowed?: boolean;
  music_preference?: MusicPreference;
  conversation_level?: ConversationLevel;
  notes?: string;
  vehicle_info?: string;
  amenities?: string[];
  waypoints?: Waypoint[];
}

export interface TripSearchParams {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
  max_price?: number;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  
  // Booking Details
  seats_requested: number;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_coordinates?: Coordinates;
  dropoff_coordinates?: Coordinates;
  
  // Pricing
  price_per_seat: number;
  total_price: number;
  currency: Currency;
  platform_fee: number;
  
  // Status
  status: BookingStatus;
  
  // Payment
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_intent_id?: string;
  paid_at?: string;
  
  // Cancellation
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  
  // Special Requests
  special_requests?: string;
  luggage_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  completed_at?: string;
  
  // Populated fields
  passenger?: Profile;
  trip?: Trip;
}

export interface BookingCreate {
  trip_id: string;
  seats_requested: number;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_coordinates?: Coordinates;
  dropoff_coordinates?: Coordinates;
  special_requests?: string;
  luggage_count?: number;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type MessageType = 'text' | 'system' | 'location' | 'image' | 'file';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  trip_id?: string;
  booking_id?: string;
  
  // Message Content
  content: string;
  message_type: MessageType;
  metadata?: Record<string, unknown>;
  
  // Status
  read: boolean;
  read_at?: string;
  delivered: boolean;
  delivered_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Populated fields
  sender?: Profile;
  recipient?: Profile;
}

export interface MessageCreate {
  recipient_id: string;
  trip_id?: string;
  booking_id?: string;
  content: string;
  message_type?: MessageType;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export type ReviewRole = 'driver' | 'passenger';

export interface Review {
  id: string;
  trip_id: string;
  booking_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  
  // Review Type
  role: ReviewRole;
  
  // Ratings (1-5 scale)
  overall_rating: number;
  punctuality_rating?: number;
  communication_rating?: number;
  cleanliness_rating?: number;
  safety_rating?: number;
  
  // Review Content
  comment?: string;
  tags?: string[];
  
  // Visibility
  is_public: boolean;
  is_reported: boolean;
  report_reason?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Populated fields
  reviewer?: Profile;
  reviewee?: Profile;
}

export interface ReviewCreate {
  trip_id: string;
  booking_id?: string;
  reviewee_id: string;
  role: ReviewRole;
  overall_rating: number;
  punctuality_rating?: number;
  communication_rating?: number;
  cleanliness_rating?: number;
  safety_rating?: number;
  comment?: string;
  tags?: string[];
  is_public?: boolean;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'booking_request'
  | 'booking_accepted'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'new_message'
  | 'trip_reminder'
  | 'trip_cancelled'
  | 'trip_completed'
  | 'payment_received'
  | 'payment_failed'
  | 'review_received'
  | 'system_update'
  | 'promo_offer'
  | 'safety_alert';

export interface Notification {
  id: string;
  user_id: string;
  
  // Notification Type
  type: NotificationType;
  
  // Content
  title: string;
  message: string;
  icon?: string;
  action_url?: string;
  
  // Related Entities
  trip_id?: string;
  booking_id?: string;
  message_id?: string;
  
  // Metadata
  data?: Record<string, unknown>;
  
  // Status
  read: boolean;
  read_at?: string;
  delivered: boolean;
  delivered_at?: string;
  
  // Delivery Method
  sent_push: boolean;
  sent_email: boolean;
  sent_sms: boolean;
  
  // Timestamps
  created_at: string;
  expires_at?: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'payout'
  | 'wallet_topup'
  | 'wallet_withdrawal'
  | 'platform_fee'
  | 'commission'
  | 'bonus'
  | 'penalty';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface Transaction {
  id: string;
  user_id: string;
  booking_id?: string;
  
  // Transaction Type
  type: TransactionType;
  
  // Amount
  amount: number;
  currency: Currency;
  
  // Payment Details
  payment_method?: string;
  payment_provider?: string;
  payment_intent_id?: string;
  external_transaction_id?: string;
  
  // Status
  status: TransactionStatus;
  
  // Description
  description?: string;
  metadata?: Record<string, unknown>;
  
  // Timestamps
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// FAVORITE TYPES
// ============================================================================

export type FavoriteType = 'user' | 'location' | 'route';

export interface Favorite {
  id: string;
  user_id: string;
  
  // Favorite Type
  type: FavoriteType;
  
  // Reference (depends on type)
  favorite_user_id?: string;
  location_name?: string;
  location_coordinates?: Coordinates;
  route_from?: string;
  route_to?: string;
  
  // Metadata
  nickname?: string;
  notes?: string;
  
  // Timestamps
  created_at: string;
  
  // Populated fields
  favorite_user?: Profile;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface NavigationProps {
  onNavigate: (page: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormFieldError {
  field: string;
  message: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<{ data: T | null; error: string | null }>;

// Make all properties of T optional and nullable
export type PartialNullable<T> = {
  [P in keyof T]?: T[P] | null;
};

// Extract specific keys from T
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isProfile(value: unknown): value is Profile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'full_name' in value
  );
}

export function isTrip(value: unknown): value is Trip {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'driver_id' in value &&
    'from_location' in value &&
    'to_location' in value
  );
}

export function isBooking(value: unknown): value is Booking {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'trip_id' in value &&
    'passenger_id' in value
  );
}

export function isMessage(value: unknown): value is Message {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'sender_id' in value &&
    'recipient_id' in value &&
    'content' in value
  );
}

// ============================================================================
// DISCRIMINATED UNION TYPES
// ============================================================================

export type AuthAction =
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP'; payload: { email: string; password: string; fullName: string } }
  | { type: 'UPDATE_PROFILE'; payload: ProfileUpdate }
  | { type: 'REFRESH_SESSION' };

export type TripAction =
  | { type: 'CREATE_TRIP'; payload: TripCreate }
  | { type: 'UPDATE_TRIP'; payload: { id: string; updates: Partial<Trip> } }
  | { type: 'CANCEL_TRIP'; payload: { id: string; reason: string } }
  | { type: 'COMPLETE_TRIP'; payload: { id: string } };

export type BookingAction =
  | { type: 'CREATE_BOOKING'; payload: BookingCreate }
  | { type: 'ACCEPT_BOOKING'; payload: { id: string } }
  | { type: 'REJECT_BOOKING'; payload: { id: string; reason: string } }
  | { type: 'CANCEL_BOOKING'; payload: { id: string; reason: string } };

// ============================================================================
// CONSTANTS
// ============================================================================

export const CURRENCIES: Currency[] = ['JOD', 'AED', 'SAR', 'KWD', 'BHD', 'EGP', 'QAR', 'OMR'];
export const LANGUAGES: Language[] = ['en', 'ar'];
export const TRIP_STATUSES: TripStatus[] = ['draft', 'published', 'in-progress', 'completed', 'cancelled'];
export const BOOKING_STATUSES: BookingStatus[] = ['pending', 'accepted', 'rejected', 'cancelled', 'completed'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'refunded', 'failed'];