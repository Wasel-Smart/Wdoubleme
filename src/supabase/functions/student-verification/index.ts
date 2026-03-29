/**
 * Student Verification Backend Service
 * Handles .edu email and student ID verification
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
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authHeader.split(' ')[1];
  const { data: authData, error } = await supabase.auth.getUser(accessToken);
  const user = authData?.user ?? null;

  if (error || !user) {
    return null;
  }

  return user;
}

// Check status
app.get("/make-server-0b1f4071/student-verification/status/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const verification = await kv.get(`student_verification:${userId}`);
    
    if (!verification) {
      return c.json({ status: 'none' });
    }

    return c.json(verification);
  } catch (error) {
    console.error('Error checking student verification:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

// Send email code
app.post("/make-server-0b1f4071/student-verification/send-email-code", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { user_id, edu_email } = await c.req.json();

    if (user.id !== user_id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    if (!edu_email || !edu_email.includes('.edu')) {
      return c.json({ error: 'Invalid .edu email address' }, 400);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const codeId = `email_verification_code:${user_id}`;
    await kv.set(codeId, {
      code,
      edu_email,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    console.log(`Student verification code for ${edu_email}: ${code}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return c.json({ error: 'Failed to send code' }, 500);
  }
});

// Verify email code
app.post("/make-server-0b1f4071/student-verification/verify-email-code", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { user_id, code } = await c.req.json();

    if (user.id !== user_id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const codeData = await kv.get(`email_verification_code:${user_id}`);
    
    if (!codeData) {
      return c.json({ error: 'Code not found or expired' }, 400);
    }

    if (new Date(codeData.expires_at) < new Date()) {
      return c.json({ error: 'Code expired' }, 400);
    }

    if (codeData.code !== code) {
      return c.json({ error: 'Invalid code' }, 400);
    }

    const verificationData = {
      user_id,
      status: 'verified',
      method: 'email',
      edu_email: codeData.edu_email,
      verified_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await kv.set(`student_verification:${user_id}`, verificationData);

    const profile = await kv.get(`profile:${user_id}`);
    if (profile) {
      profile.student_verified = true;
      profile.student_discount = 0.20;
      await kv.set(`profile:${user_id}`, profile);
    }

    await kv.del(`email_verification_code:${user_id}`);

    console.log(`Student verified: ${user_id}`);

    return c.json({ success: true, verification: verificationData });
  } catch (error) {
    console.error('Error verifying code:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

// Submit ID
app.post("/make-server-0b1f4071/student-verification/submit-id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { user_id, student_id_url } = await c.req.json();

    if (user.id !== user_id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const verificationData = {
      user_id,
      status: 'pending',
      method: 'id_upload',
      student_id_url,
      submitted_at: new Date().toISOString(),
    };

    await kv.set(`student_verification:${user_id}`, verificationData);

    console.log(`Student ID submitted for user ${user_id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error submitting student ID:', error);
    return c.json({ error: 'Failed to submit ID' }, 500);
  }
});

Deno.serve(app.fetch);