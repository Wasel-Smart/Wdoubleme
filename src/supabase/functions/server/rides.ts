/**
 * Rides API - Real Database Integration
 * 
 * Full CRUD operations for rides with advanced search
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface Ride {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_rating: number;
  driver_avatar?: string;
  from_city: string;
  to_city: string;
  from_coords: { lat: number; lng: number };
  to_coords: { lat: number; lng: number };
  departure_date: string;
  departure_time: string;
  price_per_seat: number;
  available_seats: number;
  total_seats: number;
  vehicle_type: string;
  vehicle_model?: string;
  vehicle_color?: string;
  amenities: string[];
  gender_preference: string;
  prayer_stops: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  luggage_size: string;
  instant_booking: boolean;
  description?: string;
  status: string;
  created_at?: string;
  waypoints?: Array<{ city: string; coords: { lat: number; lng: number } }>;

  // ✨ NEW: Package capacity
  package_capacity?: number;  // How many packages this ride can carry
  package_price?: number;     // Price per package (JOD)
  available_packages?: number; // Remaining package slots
}

// ══════════════════════════════════════════════════════════════════════════════
// SEED DATA - Popular Jordan Routes
// ══════════════════════════════════════════════════════════════════════════════

const SEED_RIDES: Omit<Ride, 'id' | 'created_at'>[] = [
  {
    driver_id: 'driver_001',
    driver_name: 'أحمد حسن',
    driver_rating: 4.9,
    driver_avatar: 'https://i.pravatar.cc/150?u=ahmad',
    from_city: 'عمّان',
    to_city: 'العقبة',
    from_coords: { lat: 31.9454, lng: 35.9284 },
    to_coords: { lat: 29.5320, lng: 35.0063 },
    departure_date: '2026-03-20',
    departure_time: '08:00',
    price_per_seat: 12,
    available_seats: 3,
    total_seats: 3,
    vehicle_type: 'sedan',
    vehicle_model: 'Toyota Camry 2023',
    vehicle_color: 'أبيض',
    amenities: ['AC', 'WiFi', 'Phone Charger', 'Music'],
    gender_preference: 'mixed',
    prayer_stops: true,
    smoking_allowed: false,
    pets_allowed: false,
    luggage_size: 'medium',
    instant_booking: true,
    description: 'رحلة مريحة وآمنة من عمّان للعقبة. توقفات للصلاة. سائق محترف.',
    waypoints: [
      { city: 'معان', coords: { lat: 30.1962, lng: 35.7360 } },
    ],
    status: 'active',
    package_capacity: 2,
    package_price: 5,
    available_packages: 2,
  },
  {
    driver_id: 'driver_002',
    driver_name: 'فاطمة أحمد',
    driver_rating: 5.0,
    driver_avatar: 'https://i.pravatar.cc/150?u=fatima',
    from_city: 'عمّان',
    to_city: 'إربد',
    from_coords: { lat: 31.9454, lng: 35.9284 },
    to_coords: { lat: 32.5556, lng: 35.8500 },
    departure_date: '2026-03-20',
    departure_time: '15:00',
    price_per_seat: 4,
    available_seats: 2,
    total_seats: 3,
    vehicle_type: 'suv',
    vehicle_model: 'Hyundai Tucson 2024',
    vehicle_color: 'رمادي',
    amenities: ['AC', 'WiFi', 'Phone Charger'],
    gender_preference: 'women_only',
    prayer_stops: true,
    smoking_allowed: false,
    pets_allowed: false,
    luggage_size: 'large',
    instant_booking: true,
    description: 'رحلة نسائية فقط 🚺 من عمّان لإربد. مريحة وآمنة.',
    status: 'active',
  },
  {
    driver_id: 'driver_003',
    driver_name: 'محمد علي',
    driver_rating: 4.8,
    driver_avatar: 'https://i.pravatar.cc/150?u=mohammad',
    from_city: 'عمّان',
    to_city: 'البحر الميت',
    from_coords: { lat: 31.9454, lng: 35.9284 },
    to_coords: { lat: 31.5590, lng: 35.4732 },
    departure_date: '2026-03-21',
    departure_time: '10:00',
    price_per_seat: 7,
    available_seats: 3,
    total_seats: 3,
    vehicle_type: 'sedan',
    vehicle_model: 'Kia Optima 2023',
    vehicle_color: 'أسود',
    amenities: ['AC', 'Music'],
    gender_preference: 'mixed',
    prayer_stops: false,
    smoking_allowed: false,
    pets_allowed: false,
    luggage_size: 'small',
    instant_booking: true,
    description: 'رحلة سريعة للبحر الميت. مثالية لقضاء اليوم.',
    status: 'active',
  },
  {
    driver_id: 'driver_004',
    driver_name: 'يوسف خالد',
    driver_rating: 4.7,
    driver_avatar: 'https://i.pravatar.cc/150?u=youssef',
    from_city: 'عمّان',
    to_city: 'الزرقاء',
    from_coords: { lat: 31.9454, lng: 35.9284 },
    to_coords: { lat: 32.0728, lng: 36.0882 },
    departure_date: '2026-03-20',
    departure_time: '07:00',
    price_per_seat: 2,
    available_seats: 4,
    total_seats: 4,
    vehicle_type: 'van',
    vehicle_model: 'Hyundai H1',
    vehicle_color: 'أبيض',
    amenities: ['AC'],
    gender_preference: 'mixed',
    prayer_stops: false,
    smoking_allowed: false,
    pets_allowed: false,
    luggage_size: 'medium',
    instant_booking: true,
    description: 'رحلة يومية من عمّان للزرقاء. مناسبة للموظفين.',
    status: 'active',
  },
  {
    driver_id: 'driver_005',
    driver_name: 'سارة محمود',
    driver_rating: 4.9,
    driver_avatar: 'https://i.pravatar.cc/150?u=sara',
    from_city: 'عمّان',
    to_city: 'جرش',
    from_coords: { lat: 31.9454, lng: 35.9284 },
    to_coords: { lat: 32.2708, lng: 35.8992 },
    departure_date: '2026-03-22',
    departure_time: '09:00',
    price_per_seat: 5,
    available_seats: 2,
    total_seats: 3,
    vehicle_type: 'sedan',
    vehicle_model: 'Honda Accord 2023',
    vehicle_color: 'فضي',
    amenities: ['AC', 'WiFi', 'Phone Charger', 'Music'],
    gender_preference: 'women_only',
    prayer_stops: true,
    smoking_allowed: false,
    pets_allowed: false,
    luggage_size: 'medium',
    instant_booking: true,
    description: 'رحلة نسائية لجرش. زيارة الآثار والتسوق.',
    status: 'active',
  },
  {
    driver_id: 'driver_006',
    driver_name: 'عمر حسين',
    driver_rating: 4.6,
    driver_avatar: 'https://i.pravatar.cc/150?u=omar',
    from_city: 'عمّان',
    to_city: 'الكرك',
    from_coords: { lat: 31.9454, lng: 35.9284 },
    to_coords: { lat: 31.1853, lng: 35.7048 },
    departure_date: '2026-03-23',
    departure_time: '08:30',
    price_per_seat: 6,
    available_seats: 3,
    total_seats: 3,
    vehicle_type: 'suv',
    vehicle_model: 'Nissan Pathfinder',
    vehicle_color: 'أزرق',
    amenities: ['AC', 'Music'],
    gender_preference: 'mixed',
    prayer_stops: true,
    smoking_allowed: false,
    pets_allowed: false,
    luggage_size: 'large',
    instant_booking: true,
    description: 'رحلة مريحة للكرك. توقفات للصلاة والاستراحة.',
    status: 'active',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════��═════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Initialize seed data
app.post('/make-server-0b1f4071/rides/seed', async (c) => {
  try {
    console.log('[Rides] Seeding database with sample rides...');
    
    for (const ride of SEED_RIDES) {
      const id = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullRide: Ride = {
        ...ride,
        id,
        created_at: new Date().toISOString(),
      };
      
      await kv.set(`ride:${id}`, fullRide);
      console.log(`[Rides] ✓ Seeded ride: ${ride.from_city} → ${ride.to_city}`);
    }
    
    return c.json({
      success: true,
      message: 'Database seeded successfully',
      count: SEED_RIDES.length,
    });
  } catch (error) {
    console.error('[Rides] Seed error:', error);
    return c.json({ error: 'Failed to seed database' }, 500);
  }
});

// Search rides
app.post('/make-server-0b1f4071/rides/search', async (c) => {
  try {
    const body = await c.req.json();
    const { from, to, date, seats, gender_preference } = body;
    
    console.log('[Rides] Search request:', { from, to, date, seats, gender_preference });
    
    // Get all rides
    const allRides = await kv.getByPrefix('ride:');
    console.log(`[Rides] Found ${allRides.length} total rides`);
    
    // Filter rides
    let filtered = allRides.filter((ride: Ride) => {
      const matchesFrom = !from || ride.from_city.includes(from) || from.includes(ride.from_city);
      const matchesTo = !to || ride.to_city.includes(to) || to.includes(ride.to_city);
      const matchesDate = !date || ride.departure_date === date;
      const hasSeats = !seats || ride.available_seats >= seats;
      const matchesGender = !gender_preference || 
        gender_preference === 'mixed' ||
        ride.gender_preference === 'mixed' ||
        ride.gender_preference === gender_preference;
      const isActive = ride.status === 'active';
      
      return matchesFrom && matchesTo && matchesDate && hasSeats && matchesGender && isActive;
    });
    
    // Sort by departure time
    filtered.sort((a: Ride, b: Ride) => {
      const dateA = new Date(`${a.departure_date}T${a.departure_time}`);
      const dateB = new Date(`${b.departure_date}T${b.departure_time}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`[Rides] Returning ${filtered.length} filtered rides`);
    
    return c.json({
      success: true,
      rides: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('[Rides] Search error:', error);
    return c.json({ error: 'Search failed' }, 500);
  }
});

// Get single ride
app.get('/make-server-0b1f4071/rides/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const ride = await kv.get(`ride:${id}`);
    
    if (!ride) {
      return c.json({ error: 'Ride not found' }, 404);
    }
    
    return c.json({ success: true, ride });
  } catch (error) {
    console.error('[Rides] Get error:', error);
    return c.json({ error: 'Failed to get ride' }, 500);
  }
});

// Create ride
app.post('/make-server-0b1f4071/rides/create', async (c) => {
  try {
    const body = await c.req.json();
    const id = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const ride: Ride = {
      id,
      ...body,
      created_at: new Date().toISOString(),
      status: 'active',
    };
    
    await kv.set(`ride:${id}`, ride);
    
    console.log(`[Rides] ✓ Created ride: ${ride.from_city} → ${ride.to_city}`);
    
    return c.json({ success: true, ride });
  } catch (error) {
    console.error('[Rides] Create error:', error);
    return c.json({ error: 'Failed to create ride' }, 500);
  }
});

// Book ride
app.post('/make-server-0b1f4071/rides/:id/book', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { user_id, user_name, seats } = body;
    
    const ride = await kv.get(`ride:${id}`) as Ride;
    
    if (!ride) {
      return c.json({ error: 'Ride not found' }, 404);
    }
    
    if (ride.available_seats < seats) {
      return c.json({ error: 'Not enough seats available' }, 400);
    }
    
    // Update ride
    ride.available_seats -= seats;
    await kv.set(`ride:${id}`, ride);
    
    // Create booking
    const booking_id = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const booking = {
      id: booking_id,
      ride_id: id,
      user_id,
      user_name,
      seats,
      total_price: ride.price_per_seat * seats,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    
    await kv.set(`booking:${booking_id}`, booking);
    
    console.log(`[Rides] ✓ Booked ${seats} seat(s) for ride ${id}`);
    
    return c.json({ success: true, booking, ride });
  } catch (error) {
    console.error('[Rides] Booking error:', error);
    return c.json({ error: 'Booking failed' }, 500);
  }
});

// Get user bookings
app.get('/make-server-0b1f4071/rides/bookings/:user_id', async (c) => {
  try {
    const user_id = c.req.param('user_id');
    const allBookings = await kv.getByPrefix('booking:');
    
    const userBookings = allBookings.filter((b: any) => b.user_id === user_id);
    
    // Enrich with ride data
    const enriched = await Promise.all(
      userBookings.map(async (booking: any) => {
        const ride = await kv.get(`ride:${booking.ride_id}`);
        return { ...booking, ride };
      })
    );
    
    return c.json({ success: true, bookings: enriched });
  } catch (error) {
    console.error('[Rides] Get bookings error:', error);
    return c.json({ error: 'Failed to get bookings' }, 500);
  }
});

// Health check
app.get('/make-server-0b1f4071/rides/health', (c) => {
  return c.json({ status: 'healthy', service: 'rides' });
});

export default app;