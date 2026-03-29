/**
 * Driver Earnings Guarantee System
 * Tracks founding driver program and calculates guarantee payouts
 * 
 * Guarantee: 2,000 JOD for completing 100 trips in first month
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Helper: Get authenticated user
async function getAuthenticatedUser(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: authData, error } = await supabase.auth.getUser(token);
  const user = authData?.user ?? null;
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Check if driver is eligible for guarantee program
app.get("/make-server-0b1f4071/earnings-guarantee/eligibility/:driverId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const driverId = c.req.param('driverId');
    
    // Only driver themselves or admin can check
    if (user.id !== driverId && !await isAdmin(user.id)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    // Check if driver enrolled in guarantee program
    const { data: enrollment, error } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .eq('key', `guarantee_enrollment:${driverId}`)
      .single();
    
    if (error || !enrollment) {
      return c.json({ 
        eligible: false,
        reason: 'Not enrolled in founding driver program'
      });
    }
    
    const enrollmentData = enrollment.value as any;
    
    // Check if guarantee period expired
    const enrolledDate = new Date(enrollmentData.enrolled_at);
    const expiryDate = new Date(enrolledDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month period
    
    const now = new Date();
    if (now > expiryDate) {
      return c.json({
        eligible: false,
        reason: 'Guarantee period expired',
        enrolled_at: enrollmentData.enrolled_at,
        expired_at: expiryDate.toISOString()
      });
    }
    
    // Get driver trip count
    const { data: trips } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .like('key', `trip:%`)
      .eq('value->>driver_id', driverId)
      .gte('value->>created_at', enrollmentData.enrolled_at)
      .eq('value->>status', 'completed');
    
    const tripCount = trips?.length || 0;
    const tripsRequired = 100;
    const guaranteeAmount = 2000; // JOD
    
    // Calculate actual earnings
    let actualEarnings = 0;
    if (trips) {
      for (const trip of trips) {
        const tripData = trip.value as any;
        actualEarnings += (tripData.price_per_seat * (tripData.total_seats - tripData.available_seats)) * 0.85; // 85% commission
      }
    }
    
    // Calculate payout needed
    const payoutNeeded = Math.max(0, guaranteeAmount - actualEarnings);
    
    return c.json({
      eligible: true,
      driver_id: driverId,
      guarantee_amount: guaranteeAmount,
      trips_completed: tripCount,
      trips_required: tripsRequired,
      trips_progress: (tripCount / tripsRequired) * 100,
      actual_earnings: actualEarnings,
      payout_needed: payoutNeeded,
      guarantee_triggers: tripCount >= tripsRequired,
      enrolled_at: enrollmentData.enrolled_at,
      expires_at: expiryDate.toISOString(),
      days_remaining: Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error('Error checking guarantee eligibility:', error);
    return c.json({ error: 'Failed to check eligibility' }, 500);
  }
});

// Enroll driver in guarantee program (admin only)
app.post("/make-server-0b1f4071/earnings-guarantee/enroll", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    
    if (!user || !await isAdmin(user.id)) {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }
    
    const { driver_id, guarantee_amount = 2000, trips_required = 100 } = await c.req.json();
    
    if (!driver_id) {
      return c.json({ error: 'driver_id is required' }, 400);
    }
    
    // Check if already enrolled
    const { data: existing } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .eq('key', `guarantee_enrollment:${driver_id}`)
      .single();
    
    if (existing) {
      return c.json({ error: 'Driver already enrolled in guarantee program' }, 400);
    }
    
    // Enroll driver
    const enrollmentData = {
      driver_id,
      guarantee_amount,
      trips_required,
      enrolled_at: new Date().toISOString(),
      status: 'active'
    };
    
    const { error } = await supabase
      .from('kv_store_0b1f4071')
      .insert({
        key: `guarantee_enrollment:${driver_id}`,
        value: enrollmentData
      });
    
    if (error) {
      console.error('Error enrolling driver:', error);
      return c.json({ error: 'Failed to enroll driver' }, 500);
    }
    
    // Send notification to driver
    await supabase
      .from('kv_store_0b1f4071')
      .insert({
        key: `notification:${Date.now()}:${driver_id}`,
        value: {
          id: `notification:${Date.now()}:${driver_id}`,
          user_id: driver_id,
          type: 'guarantee_enrolled',
          title: 'Earnings Guarantee Activated! 💰',
          message: `You're enrolled in the Founding Driver program. Complete ${trips_required} trips and earn a guaranteed ${guarantee_amount} JOD!`,
          data: { guarantee_amount, trips_required },
          read: false,
          created_at: new Date().toISOString()
        }
      });
    
    console.log(`Driver ${driver_id} enrolled in guarantee program`);
    
    return c.json({
      success: true,
      enrollment: enrollmentData
    });
  } catch (error) {
    console.error('Error enrolling driver:', error);
    return c.json({ error: 'Failed to enroll driver' }, 500);
  }
});

// Calculate and process guarantee payout (admin only)
app.post("/make-server-0b1f4071/earnings-guarantee/process-payout/:driverId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    
    if (!user || !await isAdmin(user.id)) {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }
    
    const driverId = c.req.param('driverId');
    
    // Get enrollment data
    const { data: enrollment, error: enrollError } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .eq('key', `guarantee_enrollment:${driverId}`)
      .single();
    
    if (enrollError || !enrollment) {
      return c.json({ error: 'Driver not enrolled in guarantee program' }, 404);
    }
    
    const enrollmentData = enrollment.value as any;
    
    // Check if already paid
    if (enrollmentData.status === 'paid') {
      return c.json({ error: 'Guarantee already paid to this driver' }, 400);
    }
    
    // Get trip count and earnings
    const { data: trips } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .like('key', `trip:%`)
      .eq('value->>driver_id', driverId)
      .gte('value->>created_at', enrollmentData.enrolled_at)
      .eq('value->>status', 'completed');
    
    const tripCount = trips?.length || 0;
    const tripsRequired = enrollmentData.trips_required;
    
    // Check if trips requirement met
    if (tripCount < tripsRequired) {
      return c.json({ 
        error: `Driver has only completed ${tripCount}/${tripsRequired} trips. Guarantee not triggered.` 
      }, 400);
    }
    
    // Calculate actual earnings
    let actualEarnings = 0;
    if (trips) {
      for (const trip of trips) {
        const tripData = trip.value as any;
        const tripRevenue = (tripData.price_per_seat * (tripData.total_seats - tripData.available_seats));
        actualEarnings += tripRevenue * 0.85; // 85% driver commission
      }
    }
    
    const guaranteeAmount = enrollmentData.guarantee_amount;
    const payoutAmount = Math.max(0, guaranteeAmount - actualEarnings);
    
    if (payoutAmount === 0) {
      // Driver earned more than guarantee - no payout needed
      await supabase
        .from('kv_store_0b1f4071')
        .update({
          value: {
            ...enrollmentData,
            status: 'completed',
            actual_earnings: actualEarnings,
            payout_amount: 0,
            completed_at: new Date().toISOString(),
            note: 'Driver exceeded guarantee earnings'
          }
        })
        .eq('key', `guarantee_enrollment:${driverId}`);
      
      return c.json({
        success: true,
        message: 'Guarantee completed - no payout needed',
        actual_earnings: actualEarnings,
        guarantee_amount: guaranteeAmount,
        payout_amount: 0
      });
    }
    
    // Record payout
    const payoutData = {
      driver_id: driverId,
      guarantee_amount: guaranteeAmount,
      actual_earnings: actualEarnings,
      payout_amount: payoutAmount,
      trips_completed: tripCount,
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      status: 'pending_payment'
    };
    
    await supabase
      .from('kv_store_0b1f4071')
      .insert({
        key: `guarantee_payout:${Date.now()}:${driverId}`,
        value: payoutData
      });
    
    // Update enrollment status
    await supabase
      .from('kv_store_0b1f4071')
      .update({
        value: {
          ...enrollmentData,
          status: 'paid',
          actual_earnings: actualEarnings,
          payout_amount: payoutAmount,
          paid_at: new Date().toISOString()
        }
      })
      .eq('key', `guarantee_enrollment:${driverId}`);
    
    // Notify driver
    await supabase
      .from('kv_store_0b1f4071')
      .insert({
        key: `notification:${Date.now()}:${driverId}`,
        value: {
          id: `notification:${Date.now()}:${driverId}`,
          user_id: driverId,
          type: 'guarantee_payout',
          title: 'Guarantee Payout Approved! 🎉',
          message: `Congratulations! You've completed ${tripCount} trips and earned your ${guaranteeAmount} JOD guarantee. Payout of ${payoutAmount} JOD is being processed.`,
          data: { payout_amount: payoutAmount, actual_earnings: actualEarnings },
          read: false,
          created_at: new Date().toISOString()
        }
      });
    
    console.log(`Guarantee payout processed for driver ${driverId}: ${payoutAmount} JOD`);
    
    return c.json({
      success: true,
      payout: payoutData
    });
  } catch (error) {
    console.error('Error processing guarantee payout:', error);
    return c.json({ error: 'Failed to process payout' }, 500);
  }
});

// Get all enrolled drivers (admin only)
app.get("/make-server-0b1f4071/earnings-guarantee/enrolled", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    
    if (!user || !await isAdmin(user.id)) {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }
    
    const { data: enrollments } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .like('key', 'guarantee_enrollment:%');
    
    if (!enrollments) {
      return c.json({ drivers: [] });
    }
    
    const drivers = [];
    
    for (const enrollment of enrollments) {
      const enrollmentData = enrollment.value as any;
      const driverId = enrollmentData.driver_id;
      
      // Get trip count
      const { data: trips } = await supabase
        .from('kv_store_0b1f4071')
        .select('value')
        .like('key', `trip:%`)
        .eq('value->>driver_id', driverId)
        .gte('value->>created_at', enrollmentData.enrolled_at)
        .eq('value->>status', 'completed');
      
      const tripCount = trips?.length || 0;
      
      // Calculate earnings
      let actualEarnings = 0;
      if (trips) {
        for (const trip of trips) {
          const tripData = trip.value as any;
          actualEarnings += (tripData.price_per_seat * (tripData.total_seats - tripData.available_seats)) * 0.85;
        }
      }
      
      drivers.push({
        ...enrollmentData,
        trips_completed: tripCount,
        actual_earnings: actualEarnings,
        payout_needed: Math.max(0, enrollmentData.guarantee_amount - actualEarnings),
        eligible_for_payout: tripCount >= enrollmentData.trips_required
      });
    }
    
    return c.json({ drivers });
  } catch (error) {
    console.error('Error fetching enrolled drivers:', error);
    return c.json({ error: 'Failed to fetch enrolled drivers' }, 500);
  }
});

// Helper: Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('kv_store_0b1f4071')
    .select('value')
    .eq('key', `profile:${userId}`)
    .single();
  
  return profile?.value?.role === 'admin';
}

Deno.serve(app.fetch);