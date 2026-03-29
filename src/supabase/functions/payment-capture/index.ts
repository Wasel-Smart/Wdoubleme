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

interface CaptureRequest {
  paymentIntentId: string;
  amount?: number; // Optional: for partial captures
  tripId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
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

    // Parse request body
    const { paymentIntentId, amount, tripId }: CaptureRequest = await req.json();

    if (!paymentIntentId || !tripId) {
      throw new Error('Missing required fields: paymentIntentId, tripId');
    }

    console.log(`Capturing payment: ${paymentIntentId} for trip: ${tripId}`);

    // Verify trip belongs to user or user is driver
    const { data: trip, error: tripError } = await supabaseUser
      .from('trips')
      .select('id, rider_id, driver_id, status, fare')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      throw new Error('Trip not found');
    }

    if (trip.rider_id !== user.id && trip.driver_id !== user.id) {
      throw new Error('Unauthorized to capture payment for this trip');
    }

    // Only allow capture for completed trips
    if (trip.status !== 'completed') {
      throw new Error('Can only capture payment for completed trips');
    }

    // Capture the payment intent
    const captureAmount = amount || undefined; // Undefined = capture full amount
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: captureAmount,
    });

    console.log(`Payment captured successfully: ${paymentIntent.id}, status: ${paymentIntent.status}`);

    // Update payment record in database
    const { error: updateError } = await supabaseUser
      .from('payments')
      .update({
        status: paymentIntent.status,
        captured_at: new Date().toISOString(),
        amount_captured: paymentIntent.amount_received / 100, // Convert from cents
      })
      .eq('payment_intent_id', paymentIntentId);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
      // Don't throw - payment was captured successfully
    }

    // Update trip payment status
    await supabaseUser
      .from('trips')
      .update({ payment_status: 'captured' })
      .eq('id', tripId);

    // Record transaction
    await supabaseUser.from('transactions').insert({
      user_id: user.id,
      trip_id: tripId,
      type: 'payment_capture',
      amount: paymentIntent.amount_received / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'completed',
      payment_intent_id: paymentIntentId,
      metadata: {
        captured_amount: paymentIntent.amount_received,
        original_amount: paymentIntent.amount,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount_captured: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error capturing payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});