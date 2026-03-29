/**
 * Wasel API — Shared Utilities
 * Common helpers, clients, and types used by all service modules.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// ── Environment Variables ────────────────────────────────────────────────────
export const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
export const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
export const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
export const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
export const STRIPE_PUBLISHABLE_KEY = Deno.env.get('STRIPE_PUBLISHABLE_KEY') || '';
export const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
// Twilio — live credentials (Account SID public, auth token backend-only)
export const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
export const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
export const TWILIO_API_KEY_SID = Deno.env.get('TWILIO_API_KEY_SID') || '';
export const TWILIO_API_SECRET = Deno.env.get('TWILIO_API_SECRET') || '';
export const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
// Google Maps (server-side geocoding)
export const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';

// ── Supabase Client (singleton) ──────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Re-export KV for convenience ─────────────────────────────────────────────
export { kv };

// ── CORS Headers ─────────────────────────────────────────────────────────────
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, stripe-signature',
};

// ── Logging Helpers ──────────────────────────────────────────────────────────
export function logInfo(msg: string) {
  console.log(`[INFO] ${msg}`);
}

export function logError(msg: string, err?: unknown) {
  console.error(`[ERROR] ${msg}`, err instanceof Error ? err.message : err);
}

// ── Rate Limit (stub — replace with real implementation) ─────────────────────
export async function checkRateLimit(_key: string, _max: number, _window: number): Promise<boolean> {
  return true;
}

// ── Auth Helper ──────────────────────────────────────────────────────────────
export async function getUserIdFromToken(authHeader: string | null | undefined): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data?.user?.id ?? null;
}

// ── Auto-confirm Email ───────────────────────────────────────────────────────
export async function autoConfirmEmail(email: string): Promise<boolean> {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) { logError('Failed to list users', error); return false; }
    const user = users?.users?.find((u) => u.email === email);
    if (!user) { logInfo(`User not found: ${email}`); return false; }
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (updateError) { logError('Failed to confirm email', updateError); return false; }
    logInfo(`Email auto-confirmed: ${email}`);
    return true;
  } catch (error) {
    logError('Auto-confirm email failed', error);
    return false;
  }
}

// ── Email Service (SendGrid) ─────────────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      logInfo('SendGrid not configured - email not sent (dev mode)');
      return false;
    }
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@wasel.app', name: 'Wasel | واصل' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!response.ok) { logError('SendGrid error', new Error(await response.text())); return false; }
    logInfo(`Email sent to ${to}`);
    return true;
  } catch (error) { logError('Email sending failed', error); return false; }
}

// ── SMS Service (Twilio) ─────────────────────────────────────────────────────
export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      logInfo('Twilio not configured - SMS not sent (dev mode)');
      return false;
    }
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: message }),
      }
    );
    if (!response.ok) { logError('Twilio error', new Error(await response.text())); return false; }
    logInfo(`SMS sent to ${to}`);
    return true;
  } catch (error) { logError('SMS sending failed', error); return false; }
}

// ── Push Notification Service ────────────────────────────────────────────────
export async function sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
  try {
    const notifId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await kv.set(`notification:${userId}:${notifId}`, {
      id: notifId, user_id: userId, title, message: body,
      type: 'push', is_read: false, created_at: new Date().toISOString(),
    });
    logInfo(`Notification stored for ${userId}: ${title}`);
    return true;
  } catch (error) { logError('Push notification failed', error); return false; }
}

// ── JSON Response Helper ─────────────────────────────────────────────────────
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export function errorResponse(error: string, status = 500): Response {
  return jsonResponse({ error }, status);
}

// ── File Upload Handler ──────────────────────────────────────────────────────
export async function handleFileUpload(req: Request, userId: string, bucket: string): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return errorResponse('No file provided', 400);
    if (file.size > 10 * 1024 * 1024) return errorResponse('File too large (max 10MB)', 400);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) return errorResponse('Invalid file type', 400);
    const ext = file.name.split('.').pop();
    const filename = `${userId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, await file.arrayBuffer(), { contentType: file.type, upsert: false });
    if (error) throw error;
    const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(filename);
    const publicUrl = publicUrlResult.data?.publicUrl ?? '';
    logInfo(`File uploaded: ${filename}`);
    // Use optional chaining: TypeScript cannot narrow `data` after the sibling
    // `if (error) throw error` check when destructured from a discriminated union.
    return jsonResponse({ success: true, url: publicUrl, filename: data?.path ?? filename });
  } catch (error) {
    logError('File upload failed', error);
    return errorResponse('Upload failed');
  }
}
