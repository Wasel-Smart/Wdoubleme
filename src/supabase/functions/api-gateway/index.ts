/**
 * Supabase Edge Function: API Gateway
 * 
 * Central API gateway that routes requests, handles authentication,
 * rate limiting, logging, and provides a unified API interface
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 600,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Information
app.get('/', (c) => {
  return c.json({
    name: 'Wassel API Gateway',
    version: '1.0.0',
    documentation: 'https://wassel4.online/api/docs',
    endpoints: {
      auth: '/auth/*',
      trips: '/trips/*',
      bookings: '/bookings/*',
      payments: '/payments/*',
      users: '/users/*',
      messages: '/messages/*',
      notifications: '/notifications/*',
      realtime: '/realtime/*',
      analytics: '/analytics/*',
      admin: '/admin/*',
    },
  });
});

// ==================== MIDDLEWARE ====================

/**
 * Rate limiting middleware
 */
async function rateLimitMiddleware(c: any, next: any) {
  const endpoint = c.req.path;
  const authHeader = c.req.header('Authorization');
  
  try {
    // Call rate limiter service
    const response = await fetch(
      `${supabaseUrl}/functions/v1/rate-limiter?action=check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || '',
        },
        body: JSON.stringify({ endpoint }),
      }
    );

    const result = await response.json();

    // Set rate limit headers
    if (result.remaining !== undefined) {
      c.header('X-RateLimit-Limit', result.limit?.toString() || '100');
      c.header('X-RateLimit-Remaining', result.remaining.toString());
      c.header('X-RateLimit-Reset', result.resetAt?.toString() || '');
    }

    if (!result.allowed) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        },
        429
      );
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Continue on error to avoid blocking legitimate requests
  }

  await next();
}

/**
 * Authentication middleware
 */
async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  try {
    // Validate session
    const response = await fetch(
      `${supabaseUrl}/functions/v1/session-management?action=validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    );

    const result = await response.json();

    if (!result.valid) {
      return c.json({ error: result.error || 'Invalid session' }, 401);
    }

    // Store user info in context
    c.set('user', result.session);
  } catch (error) {
    console.error('Auth validation failed:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }

  await next();
}

/**
 * Logging middleware
 */
async function apiLoggingMiddleware(c: any, next: any) {
  const startTime = Date.now();
  
  await next();
  
  const responseTime = Date.now() - startTime;
  const user = c.get('user');

  // Log API request
  try {
    await supabase.from('api_logs').insert({
      endpoint: c.req.path,
      method: c.req.method,
      response_time: responseTime,
      status_code: c.res.status,
      user_id: user?.userId || null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
}

// Apply global middleware
app.use('*', apiLoggingMiddleware);

// ==================== PUBLIC ROUTES (No Auth Required) ====================

/**
 * Authentication Routes
 */
app.post('/auth/signup', async (c) => {
  return await proxyToMainServer(c, '/auth/signup');
});

app.post('/auth/login', async (c) => {
  return await proxyToMainServer(c, '/auth/login');
});

app.post('/auth/forgot-password', async (c) => {
  return await proxyToMainServer(c, '/auth/forgot-password');
});

/**
 * Trip Search (Public)
 */
app.get('/trips/search', rateLimitMiddleware, async (c) => {
  return await proxyToMainServer(c, '/trips/search');
});

/**
 * System Status (Public)
 */
app.get('/status', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/system-monitoring?action=health`
  );
  return c.json(await response.json());
});

// ==================== PROTECTED ROUTES (Auth Required) ====================

app.use('/users/*', authMiddleware, rateLimitMiddleware);
app.use('/trips/*', authMiddleware, rateLimitMiddleware);
app.use('/bookings/*', authMiddleware, rateLimitMiddleware);
app.use('/payments/*', authMiddleware, rateLimitMiddleware);
app.use('/messages/*', authMiddleware, rateLimitMiddleware);
app.use('/notifications/*', authMiddleware, rateLimitMiddleware);
app.use('/analytics/*', authMiddleware, rateLimitMiddleware);
app.use('/realtime/*', authMiddleware);

/**
 * User Profile Routes
 */
app.get('/users/:userId', async (c) => {
  const userId = c.req.param('userId');
  return await proxyToMainServer(c, `/profile/${userId}`);
});

app.put('/users/:userId', async (c) => {
  const userId = c.req.param('userId');
  return await proxyToMainServer(c, `/profile/${userId}`, 'PUT');
});

/**
 * Trip Management Routes
 */
app.post('/trips', async (c) => {
  return await proxyToMainServer(c, '/trips', 'POST');
});

app.get('/trips/:tripId', async (c) => {
  const tripId = c.req.param('tripId');
  return await proxyToMainServer(c, `/trips/${tripId}`);
});

app.put('/trips/:tripId', async (c) => {
  const tripId = c.req.param('tripId');
  return await proxyToMainServer(c, `/trips/${tripId}`, 'PUT');
});

/**
 * Booking Routes
 */
app.post('/bookings', async (c) => {
  return await proxyToMainServer(c, '/bookings', 'POST');
});

app.get('/bookings/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  return await proxyToMainServer(c, `/bookings/user/${userId}`);
});

app.put('/bookings/:bookingId', async (c) => {
  const bookingId = c.req.param('bookingId');
  return await proxyToMainServer(c, `/bookings/${bookingId}`, 'PUT');
});

/**
 * Payment Routes
 */
app.post('/payments/create-intent', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/payment-create-intent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': c.req.header('Authorization')!,
      },
      body: JSON.stringify(await c.req.json()),
    }
  );
  return c.json(await response.json());
});

app.post('/payments/process', async (c) => {
  return await proxyToMainServer(c, '/payments/process', 'POST');
});

/**
 * Real-time Tracking Routes
 */
app.post('/realtime/update', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/realtime-tracking?action=update`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': c.req.header('Authorization')!,
      },
      body: JSON.stringify(await c.req.json()),
    }
  );
  return c.json(await response.json());
});

app.get('/realtime/stream/:tripId', async (c) => {
  const tripId = c.req.param('tripId');
  const response = await fetch(
    `${supabaseUrl}/functions/v1/realtime-tracking?action=stream&tripId=${tripId}`,
    {
      headers: {
        'Authorization': c.req.header('Authorization')!,
      },
    }
  );
  
  // Return SSE stream
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

/**
 * Phone Verification Routes
 */
app.post('/verify/phone/send', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/phone-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': c.req.header('Authorization')!,
      },
      body: JSON.stringify({
        action: 'send',
        ...(await c.req.json()),
      }),
    }
  );
  return c.json(await response.json());
});

app.post('/verify/phone/verify', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/phone-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': c.req.header('Authorization')!,
      },
      body: JSON.stringify({
        action: 'verify',
        ...(await c.req.json()),
      }),
    }
  );
  return c.json(await response.json());
});

/**
 * Voice Call Routes
 */
app.post('/calls/initiate', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/voice-call`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': c.req.header('Authorization')!,
      },
      body: JSON.stringify({
        action: 'initiate',
        ...(await c.req.json()),
      }),
    }
  );
  return c.json(await response.json());
});

/**
 * Analytics Routes
 */
app.get('/analytics/driver', async (c) => {
  const period = c.req.query('period') || 'week';
  const action = c.req.query('action') || 'overview';
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/driver-analytics?action=${action}&period=${period}`,
    {
      headers: {
        'Authorization': c.req.header('Authorization')!,
      },
    }
  );
  return c.json(await response.json());
});

app.get('/analytics/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  return await proxyToMainServer(c, `/analytics/${userId}`);
});

/**
 * Messages Routes
 */
app.post('/messages', async (c) => {
  return await proxyToMainServer(c, '/messages', 'POST');
});

app.get('/messages/conversation/:userId1/:userId2', async (c) => {
  const userId1 = c.req.param('userId1');
  const userId2 = c.req.param('userId2');
  return await proxyToMainServer(c, `/messages/conversation/${userId1}/${userId2}`);
});

/**
 * Notifications Routes
 */
app.get('/notifications/:userId', async (c) => {
  const userId = c.req.param('userId');
  return await proxyToMainServer(c, `/notifications/${userId}`);
});

app.put('/notifications/:notificationId/read', async (c) => {
  const notificationId = c.req.param('notificationId');
  return await proxyToMainServer(c, `/notifications/${notificationId}/read`, 'PUT');
});

// ==================== ADMIN ROUTES ====================

app.use('/admin/*', authMiddleware, rateLimitMiddleware);

app.get('/admin/metrics', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/system-monitoring?action=metrics`
  );
  return c.json(await response.json());
});

app.get('/admin/errors', async (c) => {
  const limit = c.req.query('limit') || '50';
  const response = await fetch(
    `${supabaseUrl}/functions/v1/system-monitoring?action=logs&limit=${limit}`
  );
  return c.json(await response.json());
});

app.get('/admin/rate-limits', async (c) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/rate-limiter?action=stats`,
    {
      headers: {
        'Authorization': c.req.header('Authorization')!,
      },
    }
  );
  return c.json(await response.json());
});

// ==================== ERROR HANDLING ====================

app.onError((err, c) => {
  console.error('API Gateway error:', err);
  
  // Report error to monitoring
  fetch(`${supabaseUrl}/functions/v1/system-monitoring?action=report-error`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: err.message,
      stack: err.stack,
      severity: 'error',
      context: {
        path: c.req.path,
        method: c.req.method,
      },
    }),
  }).catch(console.error);

  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
      timestamp: new Date().toISOString(),
    },
    500
  );
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Proxy request to main server
 */
async function proxyToMainServer(c: any, path: string, method?: string) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/make-server-0b1f4071${path}`,
    {
      method: method || c.req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': c.req.header('Authorization') || '',
      },
      body: method === 'GET' ? undefined : JSON.stringify(await c.req.json()),
    }
  );

  return c.json(await response.json(), response.status);
}

// Start server
Deno.serve(app.fetch);
