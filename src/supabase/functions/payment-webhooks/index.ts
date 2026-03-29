/**
 * Stripe Webhook Handler
 * Supabase Edge Function for processing Stripe payment events
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import Stripe from "npm:stripe@14.10.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'stripe-signature'],
  allowMethods: ['POST'],
}));

// Webhook endpoint
app.post('/make-server-0b1f4071/webhooks/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return c.json({ error: 'Missing signature or webhook secret' }, 400);
  }

  try {
    // Get raw body
    const body = await c.req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true, type: event.type });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 400);
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  const metadata = paymentIntent.metadata;
  const bookingId = metadata.booking_id;
  const tripId = metadata.trip_id;
  const userId = metadata.user_id;

  if (!bookingId || !tripId) {
    console.error('Missing booking_id or trip_id in payment metadata');
    return;
  }

  try {
    // Update booking payment status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_intent_id: paymentIntent.id,
        amount_paid: paymentIntent.amount / 100, // Convert from cents
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (bookingError) throw bookingError;

    // Update trip status to confirmed
    const { error: tripError } = await supabase
      .from('trips')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId);

    if (tripError) throw tripError;

    // Create notification for user
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment_received',
      title: 'Payment Successful',
      message: `Your payment of ${(paymentIntent.amount / 100).toFixed(2)} has been processed successfully.`,
      data: {
        booking_id: bookingId,
        trip_id: tripId,
        payment_intent_id: paymentIntent.id,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    // Send push notification
    await sendPushNotification(userId, {
      type: 'payment_received',
      title: 'Payment Successful',
      body: 'Your ride has been confirmed!',
      data: { booking_id: bookingId, trip_id: tripId },
    });

    console.log('Payment processed successfully for booking:', bookingId);
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  const metadata = paymentIntent.metadata;
  const bookingId = metadata.booking_id;
  const userId = metadata.user_id;

  try {
    // Update booking payment status
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'failed',
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) throw error;

    // Create notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again or use a different payment method.',
      data: {
        booking_id: bookingId,
        payment_intent_id: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    // Send push notification
    await sendPushNotification(userId, {
      type: 'payment_failed',
      title: 'Payment Failed',
      body: 'Please update your payment method',
      data: { booking_id: bookingId },
    });

    console.log('Payment failure processed for booking:', bookingId);
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment canceled:', paymentIntent.id);

  const metadata = paymentIntent.metadata;
  const bookingId = metadata.booking_id;

  try {
    await supabase
      .from('bookings')
      .update({
        payment_status: 'canceled',
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    console.log('Payment cancellation processed for booking:', bookingId);
  } catch (error) {
    console.error('Error processing canceled payment:', error);
  }
}

/**
 * Handle charge refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  try {
    // Find booking by payment intent
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (!booking) {
      console.error('Booking not found for payment intent:', paymentIntentId);
      return;
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        refund_amount: charge.amount_refunded / 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    // Create notification
    await supabase.from('notifications').insert({
      user_id: booking.passenger_id,
      type: 'payment_received',
      title: 'Refund Processed',
      message: `Your refund of ${(charge.amount_refunded / 100).toFixed(2)} has been processed.`,
      data: {
        booking_id: booking.id,
        charge_id: charge.id,
        refund_amount: charge.amount_refunded / 100,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    console.log('Refund processed for booking:', booking.id);
  } catch (error) {
    console.error('Error processing refund:', error);
  }
}

/**
 * Handle dispute created
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  console.log('Dispute created:', dispute.id);

  try {
    // Log dispute for admin review
    await supabase.from('disputes').insert({
      stripe_dispute_id: dispute.id,
      charge_id: dispute.charge as string,
      amount: dispute.amount / 100,
      reason: dispute.reason,
      status: dispute.status,
      evidence_due_by: new Date(dispute.evidence_details.due_by * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    // Notify admins
    console.log('Dispute logged for admin review');
  } catch (error) {
    console.error('Error processing dispute:', error);
  }
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const userId = subscription.metadata.user_id;

  try {
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      plan: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

    console.log('Subscription updated for user:', userId);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  try {
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log('Subscription canceled');
  } catch (error) {
    console.error('Error canceling subscription:', error);
  }
}

/**
 * Send push notification helper
 */
async function sendPushNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }
): Promise<void> {
  try {
    // Call push notification service
    await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        userId,
        notification,
      }),
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

Deno.serve(app.fetch);
