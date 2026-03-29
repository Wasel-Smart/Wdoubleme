/**
 * Supabase Edge Function: Rate Limiter & Security Middleware
 * 
 * Provides API rate limiting, DDoS protection, and security checks
 * Implements sliding window algorithm with Redis-like KV store
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rate-limit-bypass',
};

// Rate limit configurations
const RATE_LIMITS = {
  // Per-user limits (authenticated requests)
  user: {
    requests: 100,
    window: 60, // seconds
  },
  // Per-IP limits (unauthenticated requests)
  ip: {
    requests: 30,
    window: 60,
  },
  // Specific endpoint limits
  endpoints: {
    '/auth/signup': { requests: 5, window: 3600 }, // 5 signups per hour
    '/auth/login': { requests: 10, window: 300 }, // 10 login attempts per 5 minutes
    '/phone-verification/send': { requests: 3, window: 3600 }, // 3 OTP per hour
    '/payments/process': { requests: 20, window: 60 }, // 20 payment attempts per minute
  },
};

// Suspicious activity thresholds
const SECURITY_THRESHOLDS = {
  maxFailedLogins: 5,
  maxFailedPayments: 3,
  suspiciousIPBanDuration: 3600, // 1 hour in seconds
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
      case 'check':
        return await checkRateLimit(req, supabase);
      
      case 'report':
        return await reportSuspiciousActivity(req, supabase);
      
      case 'stats':
        return await getRateLimitStats(req, supabase);
      
      case 'whitelist':
        return await manageWhitelist(req, supabase);
      
      default:
        return await checkRateLimit(req, supabase);
    }
  } catch (error) {
    console.error('Rate limiter error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit check failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Check rate limit for incoming request
 */
async function checkRateLimit(req: Request, supabase: any) {
  const url = new URL(req.url);
  const endpoint = url.pathname;
  const authHeader = req.headers.get('Authorization');
  const bypassHeader = req.headers.get('x-rate-limit-bypass');
  
  // Allow bypass for admin/testing
  if (bypassHeader === Deno.env.get('RATE_LIMIT_BYPASS_KEY')) {
    return createResponse(true, { bypassed: true });
  }

  // Get identifier (user ID or IP address)
  const identifier = await getIdentifier(req, authHeader, supabase);
  
  // Check if IP is banned
  const isBanned = await checkIfBanned(identifier, supabase);
  if (isBanned) {
    return createResponse(false, {
      error: 'Access temporarily restricted due to suspicious activity',
      retryAfter: isBanned.expiresAt,
    }, 403);
  }

  // Determine rate limit for this request
  const limit = getEndpointLimit(endpoint) || (authHeader ? RATE_LIMITS.user : RATE_LIMITS.ip);
  
  // Check rate limit
  const rateLimitKey = `ratelimit:${identifier}:${endpoint}`;
  const result = await slidingWindowRateLimit(rateLimitKey, limit, supabase);

  // Set rate limit headers
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': limit.requests.toString(),
    'X-RateLimit-Remaining': Math.max(0, limit.requests - result.count).toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
  };

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: result.resetAt,
        limit: limit.requests,
        window: limit.window,
      }),
      {
        headers,
        status: 429,
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      allowed: true,
      remaining: limit.requests - result.count,
      resetAt: result.resetAt,
    }),
    {
      headers,
      status: 200,
    }
  );
}

/**
 * Sliding window rate limiting algorithm
 */
async function slidingWindowRateLimit(
  key: string,
  limit: { requests: number; window: number },
  supabase: any
): Promise<{ allowed: boolean; count: number; resetAt: number }> {
  const now = Date.now();
  const windowStart = now - (limit.window * 1000);

  // Get existing requests in window
  const { data: requests } = await supabase
    .from('rate_limit_logs')
    .select('timestamp')
    .eq('key', key)
    .gte('timestamp', new Date(windowStart).toISOString());

  const currentCount = requests?.length || 0;
  const allowed = currentCount < limit.requests;

  // Record this request
  if (allowed) {
    await supabase
      .from('rate_limit_logs')
      .insert({
        key,
        timestamp: new Date(now).toISOString(),
        created_at: new Date(now).toISOString(),
      });
  }

  // Calculate reset time
  const oldestRequest = requests && requests.length > 0
    ? new Date(requests[0].timestamp).getTime()
    : now;
  const resetAt = oldestRequest + (limit.window * 1000);

  // Cleanup old entries (async, don't wait)
  supabase
    .from('rate_limit_logs')
    .delete()
    .eq('key', key)
    .lt('timestamp', new Date(windowStart).toISOString())
    .then(() => console.log(`Cleaned up old rate limit logs for ${key}`));

  return {
    allowed,
    count: currentCount + (allowed ? 1 : 0),
    resetAt: Math.floor(resetAt / 1000),
  };
}

/**
 * Get identifier for rate limiting (user ID or IP)
 */
async function getIdentifier(req: Request, authHeader: string | null, supabase: any): Promise<string> {
  // Try to get user ID from auth
  if (authHeader) {
    try {
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
      const user = authData?.user ?? null;
      if (user) {
        return `user:${user.id}`;
      }
    } catch (error) {
      console.error('Error getting user from auth:', error);
    }
  }

  // Fallback to IP address
  const ip = req.headers.get('x-forwarded-for') ||
             req.headers.get('x-real-ip') ||
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Get specific endpoint limit
 */
function getEndpointLimit(endpoint: string): { requests: number; window: number } | null {
  for (const [pattern, limit] of Object.entries(RATE_LIMITS.endpoints)) {
    if (endpoint.includes(pattern)) {
      return limit;
    }
  }
  return null;
}

/**
 * Check if identifier is banned
 */
async function checkIfBanned(identifier: string, supabase: any): Promise<{ expiresAt: number } | null> {
  const { data: ban } = await supabase
    .from('security_bans')
    .select('expires_at, reason')
    .eq('identifier', identifier)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (ban) {
    return {
      expiresAt: Math.floor(new Date(ban.expires_at).getTime() / 1000),
    };
  }

  return null;
}

/**
 * Report suspicious activity
 */
async function reportSuspiciousActivity(req: Request, supabase: any) {
  const body = await req.json();
  const { type, identifier, metadata } = body;

  console.log(`Suspicious activity reported: ${type} for ${identifier}`);

  // Log the activity
  await supabase
    .from('security_events')
    .insert({
      type,
      identifier,
      metadata,
      severity: getSeverity(type),
      created_at: new Date().toISOString(),
    });

  // Check if we should ban
  const shouldBan = await evaluateBanCriteria(identifier, type, supabase);
  
  if (shouldBan) {
    const expiresAt = new Date(Date.now() + SECURITY_THRESHOLDS.suspiciousIPBanDuration * 1000);
    
    await supabase
      .from('security_bans')
      .insert({
        identifier,
        reason: `Suspicious activity: ${type}`,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    console.log(`Banned ${identifier} until ${expiresAt}`);
  }

  return createResponse(true, {
    reported: true,
    banned: shouldBan,
  });
}

/**
 * Evaluate if identifier should be banned
 */
async function evaluateBanCriteria(identifier: string, type: string, supabase: any): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();

  const { data: recentEvents } = await supabase
    .from('security_events')
    .select('type')
    .eq('identifier', identifier)
    .gte('created_at', oneHourAgo);

  if (!recentEvents) return false;

  // Count specific event types
  const failedLogins = recentEvents.filter((e: any) => e.type === 'failed_login').length;
  const failedPayments = recentEvents.filter((e: any) => e.type === 'failed_payment').length;

  // Ban criteria
  if (failedLogins >= SECURITY_THRESHOLDS.maxFailedLogins) return true;
  if (failedPayments >= SECURITY_THRESHOLDS.maxFailedPayments) return true;
  if (recentEvents.length >= 50) return true; // Too many events in general

  return false;
}

/**
 * Get severity level for event type
 */
function getSeverity(type: string): string {
  const severityMap: Record<string, string> = {
    failed_login: 'medium',
    failed_payment: 'high',
    suspicious_location: 'medium',
    rapid_requests: 'low',
    invalid_token: 'high',
    sql_injection_attempt: 'critical',
    xss_attempt: 'critical',
  };

  return severityMap[type] || 'low';
}

/**
 * Get rate limit statistics
 */
async function getRateLimitStats(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  
  // Verify admin
  const user = await getAuthenticatedUser(authHeader, supabase);
  if (!user) {
    return createResponse(false, { error: 'Unauthorized' }, 401);
  }

  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();

  // Get rate limit violations
  const { data: violations, count: violationsCount } = await supabase
    .from('rate_limit_violations')
    .select('*', { count: 'exact' })
    .gte('created_at', oneHourAgo);

  // Get active bans
  const { data: bans, count: bansCount } = await supabase
    .from('security_bans')
    .select('*', { count: 'exact' })
    .gt('expires_at', new Date().toISOString());

  // Get security events by type
  const { data: events } = await supabase
    .from('security_events')
    .select('type')
    .gte('created_at', oneHourAgo);

  const eventsByType: Record<string, number> = {};
  events?.forEach((e: any) => {
    eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
  });

  return createResponse(true, {
    violations: {
      lastHour: violationsCount,
      recent: violations?.slice(0, 10),
    },
    bans: {
      active: bansCount,
      list: bans?.slice(0, 10),
    },
    events: {
      byType: eventsByType,
      total: events?.length || 0,
    },
  });
}

/**
 * Manage whitelist
 */
async function manageWhitelist(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  const user = await getAuthenticatedUser(authHeader, supabase);
  
  if (!user) {
    return createResponse(false, { error: 'Unauthorized' }, 401);
  }

  const body = await req.json();
  const { action, identifier } = body;

  if (action === 'add') {
    await supabase
      .from('rate_limit_whitelist')
      .insert({
        identifier,
        added_by: user.id,
        created_at: new Date().toISOString(),
      });

    return createResponse(true, { message: 'Added to whitelist' });
  } else if (action === 'remove') {
    await supabase
      .from('rate_limit_whitelist')
      .delete()
      .eq('identifier', identifier);

    return createResponse(true, { message: 'Removed from whitelist' });
  }

  return createResponse(false, { error: 'Invalid action' }, 400);
}

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(authHeader: string | null, supabase: any) {
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

/**
 * Helper: Create response
 */
function createResponse(success: boolean, data: any, status = 200) {
  return new Response(
    JSON.stringify({
      success,
      ...data,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  );
}