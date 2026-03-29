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

interface RefundRequest {
  paymentIntentId: string;
  tripId: string;
  amount?: number; // Optional: for partial refunds
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
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
    const { paymentIntentId, tripId, amount, reason }: RefundRequest = await req.json();

    if (!paymentIntentId || !tripId) {
      throw new Error('Missing required fields: paymentIntentId, tripId');
    }

    console.log(`Refunding payment: ${paymentIntentId} for trip: ${tripId}`);

    // Verify trip and authorization
    const { data: trip, error: tripError } = await supabaseUser
      .from('trips')
      .select('id, rider_id, driver_id, status, fare, payment_status')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      throw new Error('Trip not found');
    }

    // Check if user is authorized (rider, driver, or admin)
    const { data: profile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isRider = trip.rider_id === user.id;
    const isDriver = trip.driver_id === user.id;

    if (!isAdmin && !isRider && !isDriver) {
      throw new Error('Unauthorized to refund this payment');
    }

    // Verify payment was captured
    if (trip.payment_status !== 'captured') {
      throw new Error('Can only refund captured payments');
    }

    // Get payment record to check refund eligibility
    const { data: payment } = await supabaseUser
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Create refund
    const refundParams: any = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    console.log(`Refund created successfully: ${refund.id}, status: ${refund.status}`);

    // Update payment record
    const { error: updateError } = await supabaseUser
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refund.amount / 100,
        refund_id: refund.id,
      })
      .eq('payment_intent_id', paymentIntentId);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
    }

    // Update trip payment status
    await supabaseUser
      .from('trips')
      .update({
        payment_status: amount && amount < trip.fare ? 'partially_refunded' : 'refunded',
      })
      .eq('id', tripId);

    // Record transaction
    await supabaseUser.from('transactions').insert({
      user_id: user.id,
      trip_id: tripId,
      type: 'refund',
      amount: -(refund.amount / 100), // Negative for refund
      currency: refund.currency.toUpperCase(),
      status: refund.status,
      payment_intent_id: paymentIntentId,
      refund_id: refund.id,
      metadata: {
        reason: reason || 'requested_by_customer',
        refund_amount: refund.amount,
        original_charge: payment.amount,
        requested_by: user.id,
      },
    });

    // Send notification to rider
    if (trip.rider_id) {
      await supabaseUser.from('notifications').insert({
        user_id: trip.rider_id,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Your refund of ${(refund.amount / 100).toFixed(2)} ${refund.currency.toUpperCase()} has been processed.`,
        data: {
          trip_id: tripId,
          refund_id: refund.id,
          amount: refund.amount / 100,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        refund: {
          id: refund.id,
          status: refund.status,
          amount: refund.amount / 100,
          currency: refund.currency,
          reason: refund.reason,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing refund:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});