/**
 * Push Notification Campaign Backend
 * Create, schedule, and send notification campaigns
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

// Get audience users
async function getAudienceUsers(audienceType: string): Promise<string[]> {
  const now = new Date();
  const allProfiles = await kv.getByPrefix('profile:');
  
  switch (audienceType) {
    case 'all':
      return allProfiles.map((p: any) => p.id);
      
    case 'new_riders':
      return allProfiles.filter((p: any) => {
        const created = new Date(p.created_at);
        const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      }).map((p: any) => p.id);
      
    case 'new_riders_no_trip':
      return allProfiles.filter((p: any) => {
        const created = new Date(p.created_at);
        const daysAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo < 7 && (p.trips_as_passenger || 0) === 0;
      }).map((p: any) => p.id);
      
    case 'inactive_riders':
      // Get all users with trips
      const allTrips = await kv.getByPrefix('trip:');
      const recentTripUserIds = new Set(
        allTrips
          .filter((t: any) => {
            const created = new Date(t.created_at);
            const daysAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo < 7;
          })
          .map((t: any) => t.driver_id)
      );
      
      return allProfiles.filter((p: any) => 
        (p.trips_as_passenger || 0) > 0 && !recentTripUserIds.has(p.id)
      ).map((p: any) => p.id);
      
    case 'active_riders':
      return allProfiles.filter((p: any) => 
        (p.trips_as_passenger || 0) >= 2
      ).map((p: any) => p.id);
      
    case 'new_drivers':
      return allProfiles.filter((p: any) => {
        const created = new Date(p.created_at);
        const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24 && p.role === 'driver';
      }).map((p: any) => p.id);
      
    case 'students':
      return allProfiles.filter((p: any) => p.student_verified === true).map((p: any) => p.id);
      
    default:
      return [];
  }
}

// Send push notification
async function sendPushNotification(userId: string, title: string, message: string) {
  // In production, use Firebase Cloud Messaging
  // For now, create in-app notification
  const notificationId = `notification:${Date.now()}:${userId}`;
  await kv.set(notificationId, {
    id: notificationId,
    user_id: userId,
    type: 'campaign',
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  });
  
  console.log(`Notification sent to ${userId}: ${title}`);
}

// Create campaign
app.post("/make-server-0b1f4071/campaigns/create", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const campaignData = await c.req.json();
    
    const campaignId = `campaign:${Date.now()}`;
    const campaign = {
      id: campaignId,
      ...campaignData,
      status: 'draft',
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    await kv.set(campaignId, campaign);

    console.log(`Campaign created: ${campaignId}`);

    return c.json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
});

// List campaigns
app.get("/make-server-0b1f4071/campaigns/list", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const campaigns = await kv.getByPrefix('campaign:');
    
    campaigns.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ campaigns });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return c.json({ error: 'Failed to list campaigns' }, 500);
  }
});

// Send campaign
app.post("/make-server-0b1f4071/campaigns/send/:campaignId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const campaignId = c.req.param('campaignId');
    const campaign = await kv.get(campaignId);
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    // Get target users
    const targetUserIds = await getAudienceUsers(campaign.audience);
    
    // Send notifications
    let sentCount = 0;
    for (const userId of targetUserIds) {
      try {
        await sendPushNotification(userId, campaign.title, campaign.message);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${userId}:`, error);
      }
    }

    // Update campaign status
    campaign.status = 'sent';
    campaign.sent_at = new Date().toISOString();
    campaign.sent_count = sentCount;
    await kv.set(campaignId, campaign);

    console.log(`Campaign ${campaignId} sent to ${sentCount} users`);

    return c.json({ success: true, sent_count: sentCount });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return c.json({ error: 'Failed to send campaign' }, 500);
  }
});

// Cron job: Process scheduled campaigns (call this every 5 minutes)
app.get("/make-server-0b1f4071/campaigns/process-scheduled", async (c) => {
  try {
    const campaigns = await kv.getByPrefix('campaign:');
    const now = new Date();
    
    for (const campaign of campaigns) {
      if (campaign.status === 'draft' && campaign.schedule_type === 'scheduled') {
        const scheduledTime = new Date(campaign.scheduled_time);
        
        if (scheduledTime <= now) {
          // Send campaign
          const targetUserIds = await getAudienceUsers(campaign.audience);
          
          let sentCount = 0;
          for (const userId of targetUserIds) {
            try {
              await sendPushNotification(userId, campaign.title, campaign.message);
              sentCount++;
            } catch (error) {
              console.error(`Failed to send to ${userId}:`, error);
            }
          }

          // Update status
          campaign.status = 'sent';
          campaign.sent_at = new Date().toISOString();
          campaign.sent_count = sentCount;
          await kv.set(campaign.id, campaign);

          console.log(`Scheduled campaign ${campaign.id} sent to ${sentCount} users`);
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing scheduled campaigns:', error);
    return c.json({ error: 'Failed to process campaigns' }, 500);
  }
});

Deno.serve(app.fetch);