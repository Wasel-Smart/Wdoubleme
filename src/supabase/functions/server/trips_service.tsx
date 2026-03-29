/**
 * Trips Service - Manage trips posted by drivers
 * 
 * Endpoints:
 * - PUT /trips/:id - Update trip status (e.g., cancel)
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * PUT /make-server-0b1f4071/trips/:id
 * Update trip status (cancel, complete, etc.)
 */
app.put('/make-server-0b1f4071/trips/:id', async (c) => {
  try {
    const tripId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    console.log('[trips] Updating trip:', tripId, 'to status:', status);

    // Get the trip
    const tripKey = `trip:${tripId}`;
    const trip = await kv.get(tripKey);

    if (!trip) {
      console.error('[trips] Trip not found:', tripId);
      return c.json({ error: 'Trip not found' }, 404);
    }

    // Update the trip
    const tripData = trip as any;
    const updated = {
      ...tripData,
      status,
      updated_at: new Date().toISOString(),
    };

    await kv.set(tripKey, updated);

    // If canceling, also cancel all associated bookings
    if (status === 'cancelled') {
      const allBookings = await kv.getByPrefix('booking:');
      const tripBookings = allBookings.filter((b: any) => b.trip_id === tripId);

      for (const booking of tripBookings) {
        const bookingData = booking as any;
        const userId = bookingData.user_id || 'user_001';
        const bookingKey = `booking:${userId}:${bookingData.id}`;
        
        const updatedBooking = {
          ...bookingData,
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        };
        
        await kv.set(bookingKey, updatedBooking);
      }

      console.log('[trips] Cancelled all bookings for trip:', tripId);
    }

    console.log('[trips] Updated trip successfully');

    return c.json({
      success: true,
      trip: updated,
    });
  } catch (error) {
    console.error('[trips] Error:', error);
    return c.json(
      {
        error: 'Failed to update trip',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
