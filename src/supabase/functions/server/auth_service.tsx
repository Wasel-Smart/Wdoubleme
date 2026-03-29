/**
 * Auth Service — Wasel | واصل
 * Handles signup (with admin email auto-confirm), login, and email confirmation
 */

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const auth = new Hono();

// Helper: admin client (service role — can call auth.admin.*)
function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

// Helper: anon client (generates user-scoped JWTs on sign-in)
function anonClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
}

// ── POST /auth/signup ────────────────────────────────────────────────────────
auth.post('/make-server-0b1f4071/auth/signup', async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const sb = adminClient();
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName || '', name: fullName || '' },
      email_confirm: true,
    });

    if (error) {
      console.log(`[auth] signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`[auth] signup ok: ${email}`);
    return c.json({
      success: true,
      user: { id: data?.user?.id, email: data?.user?.email },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signup failed';
    return c.json({ error: msg }, 500);
  }
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
auth.post('/make-server-0b1f4071/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Auto-confirm email if not yet confirmed (dev convenience)
    const sb = adminClient();
    const { data: listData } = await sb.auth.admin.listUsers();
    if (listData?.users) {
      // Let TypeScript infer the User type — do NOT annotate the callback param
      const existing = listData.users.find(u => u.email === email);
      if (existing && !existing.email_confirmed_at) {
        console.log(`[auth] auto-confirming email for ${email}`);
        await sb.auth.admin.updateUserById(existing.id, { email_confirm: true });
      }
    }

    const anon = anonClient();
    const { data, error } = await anon.auth.signInWithPassword({ email, password });

    if (error) {
      console.log(`[auth] login error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }

    console.log(`[auth] login ok: ${email}`);
    return c.json({
      success: true,
      session: {
        access_token: data?.session?.access_token,
        refresh_token: data?.session?.refresh_token,
        expires_in: data?.session?.expires_in,
        token_type: data?.session?.token_type,
      },
      user: {
        id: data?.user?.id,
        email: data?.user?.email,
        user_metadata: data?.user?.user_metadata,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return c.json({ error: msg }, 500);
  }
});

// ── POST /auth/confirm-email ─────────────────────────────────────────────────
auth.post('/make-server-0b1f4071/auth/confirm-email', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const sb = adminClient();
    const { data: listData, error: listError } = await sb.auth.admin.listUsers();
    if (listError) {
      return c.json({ error: listError.message }, 500);
    }

    // Infer User type from supabase-js — no manual annotation
    const user = listData?.users?.find(u => u.email === email);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const { error: updateError } = await sb.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (updateError) {
      return c.json({ error: updateError.message }, 500);
    }

    console.log(`[auth] email confirmed: ${email}`);
    return c.json({ success: true, message: 'Email confirmed' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Email confirmation failed';
    return c.json({ error: msg }, 500);
  }
});

// ── GET /auth/profile ────────────────────────────────────────────────────────
auth.get('/make-server-0b1f4071/auth/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const sb = adminClient();
    // Avoid nested destructuring of `data` — getUser() can return data:null on error,
    // which would throw "Cannot destructure property 'user' of null" at the type level.
    const { data: authData, error } = await sb.auth.getUser(accessToken);
    const user = authData?.user ?? null;

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch profile';
    return c.json({ error: msg }, 500);
  }
});

export default auth;