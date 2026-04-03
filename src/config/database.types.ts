/**
 * Wasel — Supabase Database Types
 * Single source of truth for all database row shapes.
 *
 * To regenerate from live schema:
 *   npx supabase gen types typescript --project-id <id> > src/config/database.types.ts
 *
 * IMPORTANT: Every service that calls Supabase directly MUST import these
 * types — never use `any` for database row access.
 */

// ── Wallet rows ───────────────────────────────────────────────────────────────

export interface WalletRow {
  wallet_id: string;
  user_id: string;
  balance: number | null;
  pending_balance: number | null;
  wallet_status: string | null;
  currency_code: string | null;
  auto_top_up_enabled: boolean | null;
  auto_top_up_amount: number | null;
  auto_top_up_threshold: number | null;
  pin_hash: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Transaction rows ──────────────────────────────────────────────────────────

export interface TransactionMetadata {
  description?: string;
  note?: string;
  bank_account?: string;
  requested_via?: string;
  [key: string]: unknown;
}

export interface TransactionRow {
  transaction_id: string;
  wallet_id: string;
  amount: number | null;
  direction: 'credit' | 'debit' | null;
  transaction_type: string | null;
  transaction_status: string | null;
  payment_method: string | null;
  reference_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: TransactionMetadata | null;
}

// ── Payment method rows ───────────────────────────────────────────────────────

export interface PaymentMethodRow {
  payment_method_id: string;
  user_id: string;
  method_type: string | null;
  provider: string | null;
  token_reference: string | null;
  is_default: boolean | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── User rows ─────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  role: string | null;
  verification_level: string | null;
  sanad_verified: boolean | null;
  verified: boolean | null;
  wallet_balance: number | null;
  trip_count: number | null;
  rating: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Driver rows ───────────────────────────────────────────────────────────────

export interface DriverRow {
  driver_id: string;
  user_id: string;
  license_number: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  status: 'active' | 'inactive' | 'suspended' | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Trip rows ─────────────────────────────────────────────────────────────────

export interface TripRow {
  trip_id: string;
  driver_id: string | null;
  origin: string | null;
  destination: string | null;
  departure_time: string | null;
  available_seats: number | null;
  total_seats: number | null;
  price_per_seat: number | null;
  status: 'open' | 'full' | 'completed' | 'cancelled' | null;
  allows_packages: boolean | null;
  gender_preference: 'mixed' | 'women_only' | 'men_only' | 'family_only' | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Booking rows ──────────────────────────────────────────────────────────────

export interface BookingRow {
  booking_id: string;
  trip_id: string | null;
  user_id: string | null;
  seats_requested: number | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  booking_status: string | null;
  status: string | null;
  total_price: number | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: Record<string, unknown> | null;
}

// ── Verification rows ─────────────────────────────────────────────────────────

export interface VerificationRow {
  id: string;
  user_id: string;
  sanad_status: 'pending' | 'verified' | 'failed' | null;
  document_status: 'pending' | 'verified' | 'failed' | null;
  verification_level: string | null;
  verification_timestamp: string | null;
  failure_reason: string | null;
  updated_at: string | null;
}

// ── Package rows ──────────────────────────────────────────────────────────────

export interface PackageRow {
  package_id: string;
  sender_id: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  origin: string | null;
  destination: string | null;
  weight_kg: number | null;
  description: string | null;
  fragile: boolean | null;
  declared_value: number | null;
  status: 'pending' | 'matched' | 'in_transit' | 'delivered' | 'cancelled' | null;
  trip_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Database interface (mirrors Supabase generated shape) ────────────────────

export interface Database {
  public: {
    Tables: {
      wallets: { Row: WalletRow };
      transactions: { Row: TransactionRow };
      payment_methods: { Row: PaymentMethodRow };
      users: { Row: UserRow };
      drivers: { Row: DriverRow };
      trips: { Row: TripRow };
      bookings: { Row: BookingRow };
      verifications: { Row: VerificationRow };
      packages: { Row: PackageRow };
    };
  };
}
