/**
 * Bookings Service - Manage trip bookings
 * 
 * Endpoints:
 * - PUT /bookings/:id - Update booking status (e.g., cancel)
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * PUT /make-server-0b1f4071/bookings/:id
 * Update booking status (cancel, confirm, etc.)
 */
app.put('/make-server-0b1f4071/bookings/:id', async (c) => {
  try {
    const bookingId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    console.log('[bookings] Updating booking:', bookingId, 'to status:', status);

    // Find the booking across all user bookings
    const allBookings = await kv.getByPrefix('booking:');
    const booking = allBookings.find((b: any) => b.id === bookingId);

    if (!booking) {
      console.error('[bookings] Booking not found:', bookingId);
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Update the booking
    const bookingData = booking as any;
    const userId = bookingData.user_id || 'user_001';
    const key = `booking:${userId}:${bookingId}`;

    const updated = {
      ...bookingData,
      status,
      updated_at: new Date().toISOString(),
    };

    await kv.set(key, updated);

    // If canceling, free up the seats on the trip
    if (status === 'cancelled') {
      const tripKey = `trip:${bookingData.trip_id}`;
      const trip = await kv.get(tripKey);
      
      if (trip) {
        const tripData = trip as any;
        const updatedTrip = {
          ...tripData,
          available_seats: (tripData.available_seats || 0) + (bookingData.seats_requested || 1),
        };
        await kv.set(tripKey, updatedTrip);
        console.log('[bookings] Freed up seats on trip:', tripKey);
      }
    }

    console.log('[bookings] Updated booking successfully');

    return c.json({
      success: true,
      booking: updated,
    });
  } catch (error) {
    console.error('[bookings] Error:', error);
    return c.json(
      {
        error: 'Failed to update booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
