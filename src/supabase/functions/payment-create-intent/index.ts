/**
 * Supabase Edge Function: Create Payment Intent
 * 
 * Handles Stripe payment intent creation for trip payments
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const { data: authData, error: userError } = await supabaseUser.auth.getUser();
    const user = authData?.user ?? null;

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { amount, currency, tripId, customerId, metadata } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!currency) {
      throw new Error('Currency is required');
    }

    if (!tripId) {
      throw new Error('Trip ID is required');
    }

    console.log(`Creating payment intent for trip ${tripId}, amount: ${amount} ${currency}`);

    // Verify trip exists and user is authorized
    const { data: trip, error: tripError } = await supabaseUser
      .from('trips')
      .select('id, rider_id, driver_id, fare, status')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      throw new Error('Trip not found');
    }

    if (trip.rider_id !== user.id) {
      throw new Error('Unauthorized: You are not the rider for this trip');
    }

    // Verify amount matches trip fare
    if (Math.abs(amount - trip.fare) > 0.01) {
      throw new Error('Amount does not match trip fare');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        tripId,
        riderId: user.id,
        driverId: trip.driver_id,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual', // Capture after trip completion
      description: `Wassel Trip Payment - ${tripId}`,
    });

    // Record payment in database
    const { error: dbError } = await supabaseUser.from('payments').insert({
      user_id: user.id,
      trip_id: tripId,
      payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: currency.toUpperCase(),
      status: paymentIntent.status,
      payment_method: 'card',
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Failed to record payment in database:', dbError);
      // Don't fail the payment intent creation
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Payment intent creation failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});