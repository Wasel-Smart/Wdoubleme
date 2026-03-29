/**
 * Loyalty Program Backend
 * Calculate tier, apply discounts, track savings
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"],
}));

async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const accessToken = authHeader.split(' ')[1];
  const { data: authData, error } = await supabase.auth.getUser(accessToken);
  const user = authData?.user ?? null;
  if (error || !user) return null;
  return user;
}

const TIERS = [
  { id: 'none', trips: 0, discount: 0 },
  { id: 'bronze', trips: 5, discount: 0.05 },
  { id: 'silver', trips: 10, discount: 0.10 },
  { id: 'gold', trips: 20, discount: 0.15 },
];

function calculateTier(totalTrips: number): { current_tier: string; discount: number; next_tier: string | null; trips_to_next: number } {
  let currentTier = TIERS[0];
  
  for (const tier of TIERS) {
    if (totalTrips >= tier.trips) {
      currentTier = tier;
    }
  }

  const currentIndex = TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;
  const tripsToNext = nextTier ? nextTier.trips - totalTrips : 0;

  return {
    current_tier: currentTier.id,
    discount: currentTier.discount,
    next_tier: nextTier?.id || null,
    trips_to_next: Math.max(0, tripsToNext),
  };
}

// Get loyalty status
app.get("/make-server-0b1f4071/loyalty/status/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const profile = await kv.get(`profile:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const totalTrips = (profile.trips_as_driver || 0) + (profile.trips_as_passenger || 0);
    const tierInfo = calculateTier(totalTrips);

    const loyaltyData = {
      total_trips: totalTrips,
      ...tierInfo,
      lifetime_savings: profile.loyalty_savings || 0,
    };

    return c.json(loyaltyData);
  } catch (error) {
    console.error('Error fetching loyalty status:', error);
    return c.json({ error: 'Failed to fetch status' }, 500);
  }
});

// Apply loyalty discount to booking
app.post("/make-server-0b1f4071/loyalty/apply-discount", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { user_id, original_price } = await c.req.json();

    if (user.id !== user_id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const profile = await kv.get(`profile:${user_id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const totalTrips = (profile.trips_as_driver || 0) + (profile.trips_as_passenger || 0);
    const tierInfo = calculateTier(totalTrips);

    const discountAmount = original_price * tierInfo.discount;
    const finalPrice = original_price - discountAmount;

    // Track lifetime savings
    profile.loyalty_savings = (profile.loyalty_savings || 0) + discountAmount;
    await kv.set(`profile:${user_id}`, profile);

    return c.json({
      original_price,
      discount_percentage: tierInfo.discount * 100,
      discount_amount: discountAmount,
      final_price: finalPrice,
      current_tier: tierInfo.current_tier,
    });
  } catch (error) {
    console.error('Error applying loyalty discount:', error);
    return c.json({ error: 'Failed to apply discount' }, 500);
  }
});

// Update tier after trip completion
app.post("/make-server-0b1f4071/loyalty/update-tier", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { user_id } = await c.req.json();

    const profile = await kv.get(`profile:${user_id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const totalTrips = (profile.trips_as_driver || 0) + (profile.trips_as_passenger || 0);
    const oldTier = profile.loyalty_tier || 'none';
    const newTierInfo = calculateTier(totalTrips);

    // Check if tier upgraded
    if (newTierInfo.current_tier !== oldTier && newTierInfo.current_tier !== 'none') {
      profile.loyalty_tier = newTierInfo.current_tier;
      await kv.set(`profile:${user_id}`, profile);

      // Send congratulations notification
      const notificationId = `notification:${Date.now()}:${user_id}`;
      await kv.set(notificationId, {
        id: notificationId,
        user_id,
        type: 'tier_upgrade',
        title: `Upgraded to ${newTierInfo.current_tier.charAt(0).toUpperCase() + newTierInfo.current_tier.slice(1)}! 🎉`,
        message: `You now get ${newTierInfo.discount * 100}% off all rides!`,
        read: false,
        created_at: new Date().toISOString(),
      });

      console.log(`User ${user_id} upgraded to ${newTierInfo.current_tier}`);
    }

    return c.json({
      success: true,
      old_tier: oldTier,
      new_tier: newTierInfo.current_tier,
      upgraded: newTierInfo.current_tier !== oldTier,
    });
  } catch (error) {
    console.error('Error updating tier:', error);
    return c.json({ error: 'Failed to update tier' }, 500);
  }
});

Deno.serve(app.fetch);