import { supabase } from '../utils/supabase/client';
import type {
  PriceCalculationResult,
  TripCreatePayload,
  TripSearchResult,
  TripUpdatePayload,
} from './trips';

type RawProfile = {
  id?: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  wallet_balance?: number | string | null;
  rating_as_driver?: number | string | null;
  rating?: number | string | null;
  total_trips?: number | string | null;
  trip_count?: number | string | null;
  id_verified?: boolean | null;
  is_verified?: boolean | null;
  sanad_verified?: boolean | null;
  verification_level?: string | null;
  wallet_status?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

type RawTrip = {
  id?: string;
  driver_id?: string;
  from_location?: string;
  to_location?: string;
  departure_date?: string;
  departure_time?: string;
  total_seats?: number | string;
  available_seats?: number | string;
  price_per_seat?: number | string;
  vehicle_model?: string | null;
  notes?: string | null;
  created_at?: string | null;
  status?: string | null;
};

type RawBooking = {
  id?: string;
  trip_id?: string;
  passenger_id?: string;
  seats_requested?: number | string;
  pickup_location?: string | null;
  dropoff_location?: string | null;
  price_per_seat?: number | string;
  total_price?: number | string;
  status?: string | null;
  created_at?: string | null;
};

type RawPackage = {
  id?: string;
  tracking_number?: string;
  sender_id?: string;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  origin_name?: string | null;
  origin_location?: string | null;
  destination_name?: string | null;
  destination_location?: string | null;
  size?: string | null;
  weight_kg?: number | string | null;
  description?: string | null;
  trip_id?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type RawNotification = {
  id?: string;
  user_id?: string;
  type?: string;
  title?: string;
  title_ar?: string | null;
  message?: string;
  message_ar?: string | null;
  read?: boolean | null;
  is_read?: boolean | null;
  read_at?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

function getDb() {
  if (!supabase) {
    throw new Error('Supabase client is not initialised');
  }

  return supabase as any;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatTime(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return '';

  const timeMatch = text.match(/^\d{2}:\d{2}/);
  if (timeMatch) return timeMatch[0];

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toISOString().slice(11, 16);
}

function mapTripRow(row: RawTrip, driverProfile?: RawProfile | null): TripSearchResult {
  const createdAt = String(row.created_at ?? new Date().toISOString());

  return {
    id: String(row.id ?? ''),
    from: String(row.from_location ?? ''),
    to: String(row.to_location ?? ''),
    date: String(row.departure_date ?? createdAt.slice(0, 10)),
    time: formatTime(row.departure_time),
    seats: toNumber(row.available_seats ?? row.total_seats, 0),
    price: toNumber(row.price_per_seat, 0),
    driver: {
      id: String(row.driver_id ?? driverProfile?.id ?? 'driver'),
      name: String(
        driverProfile?.full_name ||
        driverProfile?.email?.split('@')[0] ||
        'Wasel Driver',
      ),
      rating: toNumber(driverProfile?.rating_as_driver ?? driverProfile?.rating, 5),
      verified: Boolean(
        driverProfile?.id_verified ??
        driverProfile?.is_verified ??
        driverProfile?.sanad_verified ??
        false,
      ),
    },
  };
}

function buildTripNotes(payload: TripCreatePayload): string | null {
  const notes: string[] = [];

  if (payload.note?.trim()) notes.push(payload.note.trim());
  if (payload.acceptsPackages) {
    const packageLine = [
      `Packages enabled (${payload.packageCapacity ?? 'medium'})`,
      payload.packageNote?.trim() || '',
    ].filter(Boolean).join(': ');
    notes.push(packageLine);
  }
  if (payload.gender && payload.gender !== 'mixed') {
    notes.push(`Preference: ${payload.gender}`);
  }
  if (payload.prayer) {
    notes.push('Prayer stop requested');
  }

  return notes.length > 0 ? notes.join('\n') : null;
}

async function fetchProfilesByIds(ids: string[]): Promise<Record<string, RawProfile>> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return {};

  const db = getDb();
  const { data, error } = await db
    .from('profiles')
    .select('id, email, full_name, rating_as_driver, id_verified, sanad_verified')
    .in('id', uniqueIds);

  if (error) {
    return {};
  }

  return (Array.isArray(data) ? data : []).reduce((acc: Record<string, RawProfile>, item: RawProfile) => {
    if (item?.id) acc[item.id] = item;
    return acc;
  }, {});
}

export async function getDirectProfile(userId: string): Promise<RawProfile | null> {
  const db = getDb();
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as RawProfile | null) ?? null;
}

export async function updateDirectProfile(userId: string, updates: Record<string, unknown>) {
  const db = getDb();
  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as RawProfile | null;
}

export async function searchDirectTrips(
  from?: string,
  to?: string,
  date?: string,
  seats?: number,
): Promise<TripSearchResult[]> {
  const db = getDb();
  let query = db
    .from('trips')
    .select('id, driver_id, from_location, to_location, departure_date, departure_time, total_seats, available_seats, price_per_seat, vehicle_model, notes, created_at, status')
    .is('deleted_at', null);

  if (from) query = query.ilike('from_location', `%${from}%`);
  if (to) query = query.ilike('to_location', `%${to}%`);
  if (date) query = query.eq('departure_date', date);
  if (seats) query = query.gte('available_seats', seats);

  query = query.eq('status', 'published').order('departure_date').order('departure_time');

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = (Array.isArray(data) ? data : []) as RawTrip[];
  const profiles = await fetchProfilesByIds(rows.map((row) => String(row.driver_id ?? '')));

  return rows.map((row) => mapTripRow(row, profiles[String(row.driver_id ?? '')] ?? null));
}

export async function getDirectTripById(tripId: string): Promise<TripSearchResult | null> {
  const db = getDb();
  const { data, error } = await db
    .from('trips')
    .select('id, driver_id, from_location, to_location, departure_date, departure_time, total_seats, available_seats, price_per_seat, vehicle_model, notes, created_at, status')
    .eq('id', tripId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  const profiles = await fetchProfilesByIds([String((data as RawTrip).driver_id ?? '')]);
  return mapTripRow(data as RawTrip, profiles[String((data as RawTrip).driver_id ?? '')] ?? null);
}

export async function getDirectDriverTrips(userId: string): Promise<TripSearchResult[]> {
  const db = getDb();
  const { data, error } = await db
    .from('trips')
    .select('id, driver_id, from_location, to_location, departure_date, departure_time, total_seats, available_seats, price_per_seat, vehicle_model, notes, created_at, status')
    .eq('driver_id', userId)
    .order('departure_date', { ascending: false })
    .order('departure_time', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (Array.isArray(data) ? data : []) as RawTrip[];
  const profile = await getDirectProfile(userId).catch(() => null);
  return rows.map((row) => mapTripRow(row, profile));
}

export async function createDirectTrip(userId: string, tripData: TripCreatePayload): Promise<TripSearchResult> {
  const db = getDb();
  const vehicleParts = (tripData.carModel ?? '').trim().split(/\s+/).filter(Boolean);
  const [vehicleMake = null, ...vehicleRest] = vehicleParts;
  const { data, error } = await db
    .from('trips')
    .insert({
      driver_id: userId,
      from_location: tripData.from,
      to_location: tripData.to,
      departure_date: tripData.date,
      departure_time: tripData.time,
      total_seats: tripData.seats,
      available_seats: tripData.seats,
      price_per_seat: tripData.price,
      status: 'published',
      vehicle_make: vehicleMake,
      vehicle_model: vehicleRest.length > 0 ? vehicleRest.join(' ') : tripData.carModel ?? null,
      notes: buildTripNotes(tripData),
    })
    .select('id, driver_id, from_location, to_location, departure_date, departure_time, total_seats, available_seats, price_per_seat, vehicle_model, notes, created_at, status')
    .single();

  if (error) {
    throw error;
  }

  const profile = await getDirectProfile(userId).catch(() => null);
  return mapTripRow(data as RawTrip, profile);
}

export async function updateDirectTrip(
  tripId: string,
  updates: TripUpdatePayload,
): Promise<TripSearchResult> {
  const db = getDb();
  const payload: Record<string, unknown> = {};

  if (updates.from) payload.from_location = updates.from;
  if (updates.to) payload.to_location = updates.to;
  if (updates.date) payload.departure_date = updates.date;
  if (updates.time) payload.departure_time = updates.time;
  if (typeof updates.seats === 'number') {
    payload.total_seats = updates.seats;
    payload.available_seats = updates.seats;
  }
  if (typeof updates.price === 'number') payload.price_per_seat = updates.price;
  if (updates.carModel !== undefined) payload.vehicle_model = updates.carModel;
  if (updates.note !== undefined) payload.notes = updates.note;
  if (updates.status) {
    payload.status = updates.status === 'active' ? 'published' : updates.status;
  }

  const { data, error } = await db
    .from('trips')
    .update(payload)
    .eq('id', tripId)
    .select('id, driver_id, from_location, to_location, departure_date, departure_time, total_seats, available_seats, price_per_seat, vehicle_model, notes, created_at, status')
    .single();

  if (error) {
    throw error;
  }

  const profile = await getDirectProfile(String((data as RawTrip).driver_id ?? '')).catch(() => null);
  return mapTripRow(data as RawTrip, profile);
}

export async function deleteDirectTrip(tripId: string): Promise<{ success: boolean }> {
  const db = getDb();
  const { error } = await db
    .from('trips')
    .update({
      status: 'cancelled',
      deleted_at: new Date().toISOString(),
    })
    .eq('id', tripId);

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function createDirectBooking(input: {
  tripId: string;
  userId: string;
  seatsRequested: number;
  pickup?: string;
  dropoff?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  const { data: trip, error: tripError } = await db
    .from('trips')
    .select('id, available_seats, price_per_seat')
    .eq('id', input.tripId)
    .single();

  if (tripError) {
    throw tripError;
  }

  const availableSeats = toNumber(trip?.available_seats, 0);
  if (availableSeats < input.seatsRequested) {
    throw new Error('Not enough seats available');
  }

  const pricePerSeat = toNumber(trip?.price_per_seat, 0);
  const totalPrice = toNumber(input.metadata?.total_price, pricePerSeat * input.seatsRequested);

  const { data, error } = await db
    .from('bookings')
    .insert({
      trip_id: input.tripId,
      passenger_id: input.userId,
      seats_requested: input.seatsRequested,
      pickup_location: input.pickup,
      dropoff_location: input.dropoff,
      price_per_seat: pricePerSeat,
      total_price: totalPrice,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  await db
    .from('trips')
    .update({ available_seats: Math.max(availableSeats - input.seatsRequested, 0) })
    .eq('id', input.tripId);

  return {
    booking: data as RawBooking,
  };
}

export async function getDirectUserBookings(userId: string) {
  const db = getDb();
  const { data, error } = await db
    .from('bookings')
    .select('*')
    .eq('passenger_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

export async function getDirectTripBookings(tripId: string) {
  const db = getDb();
  const { data, error } = await db
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

export async function updateDirectBookingStatus(
  bookingId: string,
  status: 'accepted' | 'rejected' | 'cancelled',
) {
  const db = getDb();
  const mappedStatus = status === 'accepted'
    ? 'confirmed'
    : status === 'rejected'
      ? 'cancelled'
      : status;

  const { data, error } = await db
    .from('bookings')
    .update({ status: mappedStatus })
    .eq('id', bookingId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as RawBooking;
}

function packageSizeFromWeight(weightKg: number): 'small' | 'medium' | 'large' | 'extra_large' {
  if (weightKg <= 1) return 'small';
  if (weightKg <= 5) return 'medium';
  if (weightKg <= 12) return 'large';
  return 'extra_large';
}

export async function createDirectPackage(input: {
  userId: string;
  trackingNumber: string;
  from: string;
  to: string;
  weightKg: number;
  description: string;
  recipientName?: string;
  recipientPhone?: string;
}) {
  const db = getDb();
  const { data, error } = await db
    .from('packages')
    .insert({
      tracking_number: input.trackingNumber,
      qr_code: input.trackingNumber,
      sender_id: input.userId,
      receiver_name: input.recipientName || 'Recipient',
      receiver_phone: input.recipientPhone || '',
      origin_name: input.from,
      origin_location: input.from,
      destination_name: input.to,
      destination_location: input.to,
      size: packageSizeFromWeight(input.weightKg),
      weight_kg: input.weightKg,
      description: input.description,
      delivery_fee: 5,
      status: 'requested',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as RawPackage;
}

export async function getDirectPackageByTrackingId(trackingNumber: string) {
  const db = getDb();
  const { data, error } = await db
    .from('packages')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as RawPackage | null) ?? null;
}

export async function getDirectNotifications(userId: string) {
  const db = getDb();
  const { data, error } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? (data as RawNotification[]) : [];
}

export async function markDirectNotificationAsRead(notificationId: string, userId: string) {
  const db = getDb();
  const { data, error } = await db
    .from('notifications')
    .update({
      read: true,
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as RawNotification | null;
}

export async function createDirectNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
}) {
  const db = getDb();
  const { data, error } = await db
    .from('notifications')
    .insert({
      user_id: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      read: false,
      is_read: false,
      metadata: {
        priority: input.priority ?? 'medium',
        action_url: input.action_url,
      },
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as RawNotification;
}

export function calculateDirectPrice(
  type: 'passenger' | 'package',
  weight?: number,
  distanceKm?: number,
  basePrice?: number,
): PriceCalculationResult {
  const resolvedDistance = Math.max(1, toNumber(distanceKm, 8));
  const resolvedBase = Math.max(1, toNumber(basePrice, type === 'package' ? 3.5 : 2.5));
  const packageSurcharge = type === 'package' ? Math.max(0, toNumber(weight, 0.5) - 1) * 0.35 : 0;
  const distanceCharge = resolvedDistance * (type === 'package' ? 0.22 : 0.18);
  const price = Number((resolvedBase + distanceCharge + packageSurcharge).toFixed(3));

  return {
    price,
    currency: 'JOD',
    breakdown: {
      base: resolvedBase,
      distance: Number(distanceCharge.toFixed(3)),
      package: Number(packageSurcharge.toFixed(3)),
    },
  };
}
