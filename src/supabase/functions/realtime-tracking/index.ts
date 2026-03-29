/**
 * Supabase Edge Function: Real-time Location Tracking
 * 
 * Handles real-time location updates for active trips
 * Uses Server-Sent Events (SSE) for efficient live updates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationUpdate {
  tripId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'update';

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: authData, error: userError } = await supabaseUser.auth.getUser();
    const user = authData?.user ?? null;

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Handle different actions
    switch (action) {
      case 'update':
        return await updateLocation(req, user.id, supabase);
      
      case 'stream':
        return await streamLocation(req, user.id, supabase);
      
      case 'get':
        return await getLocation(req, user.id, supabase);
      
      case 'history':
        return await getLocationHistory(req, user.id, supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Real-time tracking error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Tracking failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Update driver/rider location
 */
async function updateLocation(req: Request, userId: string, supabase: any) {
  const body: LocationUpdate = await req.json();
  
  const {
    tripId,
    latitude,
    longitude,
    heading,
    speed,
    accuracy,
  } = body;

  // Validate input
  if (!tripId || !latitude || !longitude) {
    throw new Error('Missing required fields: tripId, latitude, longitude');
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Invalid coordinates');
  }

  console.log(`Location update for trip ${tripId}: ${latitude}, ${longitude}`);

  // Verify user is authorized for this trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id, driver_id, rider_id, status')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error('Trip not found');
  }

  if (trip.driver_id !== userId && trip.rider_id !== userId) {
    throw new Error('Unauthorized: Not a participant in this trip');
  }

  if (trip.status !== 'active' && trip.status !== 'in_progress') {
    throw new Error('Trip is not active');
  }

  // Store location update
  const locationData = {
    trip_id: tripId,
    user_id: userId,
    latitude,
    longitude,
    heading,
    speed,
    accuracy,
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from('location_updates')
    .insert(locationData);

  if (insertError) {
    console.error('Error storing location:', insertError);
    throw new Error('Failed to store location');
  }

  // Update trip's current location
  const { error: tripUpdateError } = await supabase
    .from('trips')
    .update({
      current_latitude: latitude,
      current_longitude: longitude,
      last_location_update: new Date().toISOString(),
    })
    .eq('id', tripId);

  if (tripUpdateError) {
    console.error('Error updating trip location:', tripUpdateError);
  }

  // Calculate ETA if driver location
  if (trip.driver_id === userId) {
    await calculateAndUpdateETA(tripId, latitude, longitude, supabase);
  }

  // Broadcast update via Supabase Realtime
  await supabase
    .from('location_broadcasts')
    .insert({
      trip_id: tripId,
      user_id: userId,
      location: {
        latitude,
        longitude,
        heading,
        speed,
        accuracy,
      },
      timestamp: new Date().toISOString(),
    });

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Location updated successfully',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Stream location updates via Server-Sent Events (SSE)
 */
async function streamLocation(req: Request, userId: string, supabase: any) {
  const url = new URL(req.url);
  const tripId = url.searchParams.get('tripId');

  if (!tripId) {
    throw new Error('Missing tripId parameter');
  }

  // Verify user is authorized for this trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id, driver_id, rider_id')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error('Trip not found');
  }

  if (trip.driver_id !== userId && trip.rider_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', tripId })}\n\n`)
      );

      // Subscribe to location updates
      const channel = supabase
        .channel(`location:${tripId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'location_broadcasts',
            filter: `trip_id=eq.${tripId}`,
          },
          (payload: any) => {
            const data = {
              type: 'location_update',
              tripId,
              location: payload.new.location,
              userId: payload.new.user_id,
              timestamp: payload.new.timestamp,
            };

            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            } catch (err) {
              console.error('Error sending SSE:', err);
            }
          }
        )
        .subscribe();

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (err) {
          clearInterval(keepAlive);
          channel.unsubscribe();
        }
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        channel.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Get current location for a trip
 */
async function getLocation(req: Request, userId: string, supabase: any) {
  const url = new URL(req.url);
  const tripId = url.searchParams.get('tripId');

  if (!tripId) {
    throw new Error('Missing tripId parameter');
  }

  // Get latest location
  const { data: location, error } = await supabase
    .from('location_updates')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching location:', error);
    throw new Error('Location not found');
  }

  return new Response(
    JSON.stringify({
      success: true,
      location,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get location history for a trip
 */
async function getLocationHistory(req: Request, userId: string, supabase: any) {
  const url = new URL(req.url);
  const tripId = url.searchParams.get('tripId');
  const limit = parseInt(url.searchParams.get('limit') || '100');

  if (!tripId) {
    throw new Error('Missing tripId parameter');
  }

  // Verify authorization
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id, driver_id, rider_id')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error('Trip not found');
  }

  if (trip.driver_id !== userId && trip.rider_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Get location history
  const { data: locations, error } = await supabase
    .from('location_updates')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })
    .limit(Math.min(limit, 1000));

  if (error) {
    console.error('Error fetching location history:', error);
    throw new Error('Failed to fetch location history');
  }

  return new Response(
    JSON.stringify({
      success: true,
      locations,
      count: locations?.length || 0,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Calculate and update ETA based on current location
 */
async function calculateAndUpdateETA(
  tripId: string,
  currentLat: number,
  currentLng: number,
  supabase: any
) {
  try {
    // Get trip destination
    const { data: trip } = await supabase
      .from('trips')
      .select('destination_latitude, destination_longitude, estimated_duration')
      .eq('id', tripId)
      .single();

    if (!trip) return;

    // Use Google Maps Distance Matrix API to calculate ETA
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return;
    }

    const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${currentLat},${currentLng}&destinations=${trip.destination_latitude},${trip.destination_longitude}&key=${GOOGLE_MAPS_API_KEY}&mode=driving&traffic_model=best_guess&departure_time=now`;

    const response = await fetch(distanceMatrixUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const durationInTraffic = data.rows[0].elements[0].duration_in_traffic?.value ||
                                 data.rows[0].elements[0].duration?.value;
      
      const etaMinutes = Math.ceil(durationInTraffic / 60);

      // Update trip with new ETA
      await supabase
        .from('trips')
        .update({
          estimated_arrival: new Date(Date.now() + durationInTraffic * 1000).toISOString(),
          eta_minutes: etaMinutes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId);

      console.log(`ETA updated for trip ${tripId}: ${etaMinutes} minutes`);
    }
  } catch (error) {
    console.error('Error calculating ETA:', error);
  }
}