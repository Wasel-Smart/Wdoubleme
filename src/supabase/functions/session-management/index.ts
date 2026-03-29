/**
 * Supabase Edge Function: Session Management
 * 
 * Handles secure session management with refresh token rotation,
 * session timeout, cross-device logout, and security monitoring
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Session configuration
const SESSION_CONFIG = {
  accessTokenDuration: 3600, // 1 hour in seconds
  refreshTokenDuration: 604800, // 7 days in seconds
  maxConcurrentSessions: 5, // Max sessions per user
  sessionTimeout: 1800, // 30 minutes of inactivity
  enableRefreshRotation: true, // Rotate refresh tokens on use
};

// Security settings
const SECURITY_CONFIG = {
  detectSuspiciousActivity: true,
  requireReauthForSensitive: true,
  logAllSessions: true,
  maxFailedAttempts: 5,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'create':
        return await createSession(req, supabase);
      
      case 'refresh':
        return await refreshSession(req, supabase);
      
      case 'validate':
        return await validateSession(req, supabase);
      
      case 'revoke':
        return await revokeSession(req, supabase);
      
      case 'revoke-all':
        return await revokeAllSessions(req, supabase);
      
      case 'list':
        return await listActiveSessions(req, supabase);
      
      case 'update-activity':
        return await updateSessionActivity(req, supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Session management error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Session management failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Create a new session after authentication
 */
async function createSession(req: Request, supabase: any) {
  const body = await req.json();
  const { userId, metadata } = body;

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get device and location info
  const deviceInfo = extractDeviceInfo(req);
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Check for suspicious activity
  if (SECURITY_CONFIG.detectSuspiciousActivity) {
    const suspicious = await checkSuspiciousLogin(userId, deviceInfo, ipAddress, supabase);
    if (suspicious) {
      await logSecurityEvent(userId, 'suspicious_login', { deviceInfo, ipAddress }, supabase);
      
      // Could require additional verification here
      console.warn(`Suspicious login attempt for user ${userId}`);
    }
  }

  // Check concurrent session limit
  await enforceSessionLimit(userId, supabase);

  // Generate session tokens
  const sessionId = generateSessionId();
  const accessToken = generateToken('access');
  const refreshToken = generateToken('refresh');

  const expiresAt = new Date(Date.now() + SESSION_CONFIG.accessTokenDuration * 1000);
  const refreshExpiresAt = new Date(Date.now() + SESSION_CONFIG.refreshTokenDuration * 1000);

  // Store session
  const sessionData = {
    id: sessionId,
    user_id: userId,
    access_token: await hashToken(accessToken),
    refresh_token: await hashToken(refreshToken),
    device_info: deviceInfo,
    ip_address: ipAddress,
    metadata: metadata || {},
    expires_at: expiresAt.toISOString(),
    refresh_expires_at: refreshExpiresAt.toISOString(),
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_sessions')
    .insert(sessionData);

  if (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }

  // Log session creation
  if (SECURITY_CONFIG.logAllSessions) {
    await logSessionEvent(userId, sessionId, 'created', { deviceInfo, ipAddress }, supabase);
  }

  console.log(`Session created for user ${userId}: ${sessionId}`);

  return new Response(
    JSON.stringify({
      success: true,
      session: {
        id: sessionId,
        accessToken,
        refreshToken,
        expiresAt: expiresAt.toISOString(),
        expiresIn: SESSION_CONFIG.accessTokenDuration,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Refresh an existing session with token rotation
 */
async function refreshSession(req: Request, supabase: any) {
  const body = await req.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const hashedToken = await hashToken(refreshToken);

  // Find session by refresh token
  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('refresh_token', hashedToken)
    .gt('refresh_expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    throw new Error('Invalid or expired refresh token');
  }

  // Check if session is revoked
  if (session.revoked) {
    throw new Error('Session has been revoked');
  }

  // Generate new tokens
  const newAccessToken = generateToken('access');
  const newRefreshToken = SESSION_CONFIG.enableRefreshRotation 
    ? generateToken('refresh') 
    : refreshToken;

  const expiresAt = new Date(Date.now() + SESSION_CONFIG.accessTokenDuration * 1000);
  const refreshExpiresAt = SESSION_CONFIG.enableRefreshRotation
    ? new Date(Date.now() + SESSION_CONFIG.refreshTokenDuration * 1000)
    : new Date(session.refresh_expires_at);

  // Update session
  const updates: any = {
    access_token: await hashToken(newAccessToken),
    expires_at: expiresAt.toISOString(),
    last_activity: new Date().toISOString(),
    refresh_count: (session.refresh_count || 0) + 1,
  };

  if (SESSION_CONFIG.enableRefreshRotation) {
    updates.refresh_token = await hashToken(newRefreshToken);
    updates.refresh_expires_at = refreshExpiresAt.toISOString();
  }

  const { error: updateError } = await supabase
    .from('user_sessions')
    .update(updates)
    .eq('id', session.id);

  if (updateError) {
    console.error('Failed to refresh session:', updateError);
    throw new Error('Failed to refresh session');
  }

  // Log refresh
  await logSessionEvent(session.user_id, session.id, 'refreshed', {}, supabase);

  console.log(`Session refreshed for user ${session.user_id}: ${session.id}`);

  return new Response(
    JSON.stringify({
      success: true,
      session: {
        id: session.id,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt.toISOString(),
        expiresIn: SESSION_CONFIG.accessTokenDuration,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Validate session and check for timeout
 */
async function validateSession(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing authorization header');
  }

  const accessToken = authHeader.split(' ')[1];
  const hashedToken = await hashToken(accessToken);

  // Find session by access token
  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('access_token', hashedToken)
    .single();

  if (error || !session) {
    throw new Error('Invalid session');
  }

  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    throw new Error('Session expired');
  }

  // Check if revoked
  if (session.revoked) {
    throw new Error('Session revoked');
  }

  // Check for inactivity timeout
  const lastActivity = new Date(session.last_activity);
  const inactiveSeconds = (Date.now() - lastActivity.getTime()) / 1000;
  
  if (inactiveSeconds > SESSION_CONFIG.sessionTimeout) {
    // Revoke session due to inactivity
    await supabase
      .from('user_sessions')
      .update({
        revoked: true,
        revoked_reason: 'inactivity_timeout',
        revoked_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    throw new Error('Session expired due to inactivity');
  }

  return new Response(
    JSON.stringify({
      success: true,
      valid: true,
      session: {
        id: session.id,
        userId: session.user_id,
        expiresAt: session.expires_at,
        lastActivity: session.last_activity,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Revoke a specific session (logout)
 */
async function revokeSession(req: Request, supabase: any) {
  const body = await req.json();
  const { sessionId } = body;
  const authHeader = req.headers.get('Authorization');

  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  // Verify user owns this session
  const user = await getUserFromAuth(authHeader, supabase);
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('user_sessions')
    .update({
      revoked: true,
      revoked_reason: 'user_logout',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to revoke session:', error);
    throw new Error('Failed to revoke session');
  }

  await logSessionEvent(user.id, sessionId, 'revoked', {}, supabase);

  console.log(`Session revoked: ${sessionId}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Session revoked successfully',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Revoke all sessions for a user (logout from all devices)
 */
async function revokeAllSessions(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  const user = await getUserFromAuth(authHeader, supabase);
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('user_sessions')
    .update({
      revoked: true,
      revoked_reason: 'user_logout_all',
      revoked_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('revoked', false);

  if (error) {
    console.error('Failed to revoke all sessions:', error);
    throw new Error('Failed to revoke all sessions');
  }

  await logSessionEvent(user.id, 'all', 'revoked_all', {}, supabase);

  console.log(`All sessions revoked for user ${user.id}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'All sessions revoked successfully',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * List all active sessions for a user
 */
async function listActiveSessions(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  const user = await getUserFromAuth(authHeader, supabase);
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('id, device_info, ip_address, created_at, last_activity, revoked')
    .eq('user_id', user.id)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .order('last_activity', { ascending: false });

  if (error) {
    console.error('Failed to list sessions:', error);
    throw new Error('Failed to list sessions');
  }

  return new Response(
    JSON.stringify({
      success: true,
      sessions: sessions || [],
      count: sessions?.length || 0,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Update session activity timestamp
 */
async function updateSessionActivity(req: Request, supabase: any) {
  const body = await req.json();
  const { sessionId } = body;

  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  const { error } = await supabase
    .from('user_sessions')
    .update({
      last_activity: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to update session activity:', error);
    throw new Error('Failed to update session activity');
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Session activity updated',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Enforce concurrent session limit
 */
async function enforceSessionLimit(userId: string, supabase: any) {
  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error || !sessions) return;

  // If at limit, revoke oldest session
  if (sessions.length >= SESSION_CONFIG.maxConcurrentSessions) {
    const oldestSession = sessions[0];
    
    await supabase
      .from('user_sessions')
      .update({
        revoked: true,
        revoked_reason: 'max_sessions_exceeded',
        revoked_at: new Date().toISOString(),
      })
      .eq('id', oldestSession.id);

    console.log(`Revoked oldest session due to limit: ${oldestSession.id}`);
  }
}

/**
 * Check for suspicious login activity
 */
async function checkSuspiciousLogin(
  userId: string,
  deviceInfo: any,
  ipAddress: string,
  supabase: any
): Promise<boolean> {
  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from('user_sessions')
    .select('device_info, ip_address, created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 86400 * 1000).toISOString())
    .limit(10);

  if (!recentSessions || recentSessions.length === 0) {
    return false; // First login, not suspicious
  }

  // Check for different location/device
  const differentIP = !recentSessions.some((s: any) => s.ip_address === ipAddress);
  const differentDevice = !recentSessions.some((s: any) => 
    s.device_info?.userAgent === deviceInfo.userAgent
  );

  return differentIP && differentDevice;
}

// Helper functions

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function generateToken(type: 'access' | 'refresh'): string {
  const prefix = type === 'access' ? 'at_' : 'rt_';
  return `${prefix}${btoa(crypto.randomUUID() + Date.now()).replace(/=/g, '')}`;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function extractDeviceInfo(req: Request): any {
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return {
    userAgent,
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    device: detectDevice(userAgent),
  };
}

function detectBrowser(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function detectOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function detectDevice(ua: string): string {
  if (ua.includes('Mobile')) return 'Mobile';
  if (ua.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}

async function getUserFromAuth(authHeader: string | null, supabase: any) {
  if (!authHeader) return null;

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  const { data: authData } = await supabaseUser.auth.getUser();
  return authData?.user ?? null;
}

async function logSessionEvent(
  userId: string,
  sessionId: string,
  eventType: string,
  metadata: any,
  supabase: any
) {
  try {
    await supabase
      .from('session_logs')
      .insert({
        user_id: userId,
        session_id: sessionId,
        event_type: eventType,
        metadata,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log session event:', error);
  }
}

async function logSecurityEvent(
  userId: string,
  eventType: string,
  metadata: any,
  supabase: any
) {
  try {
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        type: eventType,
        metadata,
        severity: 'medium',
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}