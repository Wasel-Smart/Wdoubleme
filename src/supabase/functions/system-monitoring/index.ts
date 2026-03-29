/**
 * Supabase Edge Function: System Monitoring & Health Checks
 * 
 * Provides comprehensive system monitoring, health checks, and alerting
 * Tracks API performance, database health, and system metrics
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Health check thresholds
const HEALTH_THRESHOLDS = {
  responseTime: {
    good: 100, // ms
    warning: 500,
    critical: 1000,
  },
  errorRate: {
    good: 0.01, // 1%
    warning: 0.05, // 5%
    critical: 0.1, // 10%
  },
  databaseConnections: {
    warning: 80, // 80% of max
    critical: 95, // 95% of max
  },
};

// Services to monitor
const MONITORED_SERVICES = [
  { name: 'Main API', url: '/functions/v1/server/health', critical: true },
  { name: 'Payment Service', url: '/functions/v1/payment-create-intent', critical: true },
  { name: 'SMS Service', url: '/functions/v1/sms-send', critical: false },
  { name: 'Email Service', url: '/functions/v1/email-send', critical: false },
  { name: 'Real-time Tracking', url: '/functions/v1/realtime-tracking', critical: true },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'health';

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'health':
        return await performHealthCheck(supabase);
      
      case 'metrics':
        return await getSystemMetrics(supabase);
      
      case 'logs':
        return await getErrorLogs(req, supabase);
      
      case 'alerts':
        return await getActiveAlerts(supabase);
      
      case 'report-error':
        return await reportError(req, supabase);
      
      case 'performance':
        return await getPerformanceMetrics(req, supabase);
      
      case 'uptime':
        return await getUptimeStats(supabase);
      
      default:
        return await performHealthCheck(supabase);
    }
  } catch (error) {
    console.error('Monitoring error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Monitoring failed',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Perform comprehensive health check
 */
async function performHealthCheck(supabase: any) {
  const startTime = Date.now();
  const checks: any[] = [];

  // 1. Database Health
  const dbHealth = await checkDatabaseHealth(supabase);
  checks.push({
    name: 'Database',
    status: dbHealth.status,
    responseTime: dbHealth.responseTime,
    details: dbHealth.details,
  });

  // 2. Auth Service
  const authHealth = await checkAuthService(supabase);
  checks.push({
    name: 'Authentication',
    status: authHealth.status,
    responseTime: authHealth.responseTime,
    details: authHealth.details,
  });

  // 3. Storage Service
  const storageHealth = await checkStorageService(supabase);
  checks.push({
    name: 'Storage',
    status: storageHealth.status,
    responseTime: storageHealth.responseTime,
    details: storageHealth.details,
  });

  // 4. External Services
  const externalChecks = await checkExternalServices();
  checks.push(...externalChecks);

  // 5. Check KV Store
  const kvHealth = await checkKVStore(supabase);
  checks.push({
    name: 'KV Store',
    status: kvHealth.status,
    responseTime: kvHealth.responseTime,
    details: kvHealth.details,
  });

  // Calculate overall health
  const failedChecks = checks.filter(c => c.status === 'unhealthy').length;
  const degradedChecks = checks.filter(c => c.status === 'degraded').length;
  
  let overallStatus = 'healthy';
  if (failedChecks > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedChecks > 0) {
    overallStatus = 'degraded';
  }

  const totalTime = Date.now() - startTime;

  // Store health check result
  await supabase
    .from('health_checks')
    .insert({
      status: overallStatus,
      response_time: totalTime,
      checks: checks,
      timestamp: new Date().toISOString(),
    });

  // Trigger alerts if unhealthy
  if (overallStatus === 'unhealthy') {
    await triggerAlert('System Health Critical', `${failedChecks} service(s) are unhealthy`, 'critical', supabase);
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalTime,
      checks,
      summary: {
        total: checks.length,
        healthy: checks.filter(c => c.status === 'healthy').length,
        degraded: degradedChecks,
        unhealthy: failedChecks,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: overallStatus === 'healthy' ? 200 : 503,
    }
  );
}

/**
 * Check database health and performance
 */
async function checkDatabaseHealth(supabase: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Test query
    const { data, error } = await supabase
      .from('kv_store_0b1f4071')
      .select('key')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        details: { error: error.message },
      };
    }

    // Check response time
    let status = 'healthy';
    if (responseTime > HEALTH_THRESHOLDS.responseTime.critical) {
      status = 'unhealthy';
    } else if (responseTime > HEALTH_THRESHOLDS.responseTime.warning) {
      status = 'degraded';
    }

    return {
      status,
      responseTime,
      details: {
        connected: true,
        latency: `${responseTime}ms`,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Check auth service
 */
async function checkAuthService(supabase: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    // List users with limit to test auth service
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        details: { error: error.message },
      };
    }

    return {
      status: responseTime < HEALTH_THRESHOLDS.responseTime.warning ? 'healthy' : 'degraded',
      responseTime,
      details: { operational: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Check storage service
 */
async function checkStorageService(supabase: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    // List buckets to test storage service
    const { data, error } = await supabase.storage.listBuckets();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'degraded', // Storage is not critical
        responseTime,
        details: { error: error.message },
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: {
        bucketsCount: data?.length || 0,
      },
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Check external services (Stripe, Twilio, Google Maps)
 */
async function checkExternalServices(): Promise<any[]> {
  const checks = [];

  // Check Stripe
  if (Deno.env.get('STRIPE_SECRET_KEY')) {
    const stripeCheck = await checkStripe();
    checks.push({
      name: 'Stripe',
      status: stripeCheck.status,
      responseTime: stripeCheck.responseTime,
      details: stripeCheck.details,
    });
  }

  // Check Twilio
  if (Deno.env.get('TWILIO_ACCOUNT_SID')) {
    const twilioCheck = await checkTwilio();
    checks.push({
      name: 'Twilio',
      status: twilioCheck.status,
      responseTime: twilioCheck.responseTime,
      details: twilioCheck.details,
    });
  }

  // Check Google Maps
  if (Deno.env.get('GOOGLE_MAPS_API_KEY')) {
    const mapsCheck = await checkGoogleMaps();
    checks.push({
      name: 'Google Maps',
      status: mapsCheck.status,
      responseTime: mapsCheck.responseTime,
      details: mapsCheck.details,
    });
  }

  return checks;
}

/**
 * Check Stripe API
 */
async function checkStripe(): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Simple balance check
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        details: { statusCode: response.status },
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { operational: true },
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Check Twilio API
 */
async function checkTwilio(): Promise<any> {
  const startTime = Date.now();
  
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        },
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        details: { statusCode: response.status },
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { operational: true },
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Check Google Maps API
 */
async function checkGoogleMaps(): Promise<any> {
  const startTime = Date.now();
  
  try {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Dubai&key=${apiKey}`
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        details: { statusCode: response.status },
      };
    }

    const data = await response.json();
    
    return {
      status: data.status === 'OK' ? 'healthy' : 'degraded',
      responseTime,
      details: { status: data.status },
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Check KV Store
 */
async function checkKVStore(supabase: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Test write and read
    const testKey = 'health_check_test';
    const testValue = { timestamp: new Date().toISOString() };

    const { error: writeError } = await supabase
      .from('kv_store_0b1f4071')
      .upsert({
        key: testKey,
        value: testValue,
        updated_at: new Date().toISOString(),
      });

    if (writeError) throw writeError;

    const { data, error: readError } = await supabase
      .from('kv_store_0b1f4071')
      .select('value')
      .eq('key', testKey)
      .single();

    if (readError) throw readError;

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < HEALTH_THRESHOLDS.responseTime.warning ? 'healthy' : 'degraded',
      responseTime,
      details: {
        readWrite: 'operational',
        latency: `${responseTime}ms`,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Get system metrics
 */
async function getSystemMetrics(supabase: any) {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400 * 1000).toISOString();

  // Get error counts
  const { count: errorsLastHour } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneHourAgo);

  const { count: errorsLastDay } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneDayAgo);

  // Get request counts
  const { count: requestsLastHour } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneHourAgo);

  // Calculate error rate
  const errorRate = requestsLastHour > 0 ? (errorsLastHour / requestsLastHour) : 0;

  // Get average response time
  const { data: recentRequests } = await supabase
    .from('api_logs')
    .select('response_time')
    .gte('created_at', oneHourAgo)
    .limit(100);

  const avgResponseTime = recentRequests && recentRequests.length > 0
    ? recentRequests.reduce((sum: number, r: any) => sum + r.response_time, 0) / recentRequests.length
    : 0;

  // Get active users
  const { count: activeUsers } = await supabase
    .from('user_activity')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', oneHourAgo);

  return new Response(
    JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        errors: {
          lastHour: errorsLastHour || 0,
          lastDay: errorsLastDay || 0,
          rate: Math.round(errorRate * 10000) / 100, // percentage
        },
        requests: {
          lastHour: requestsLastHour || 0,
          avgResponseTime: Math.round(avgResponseTime),
        },
        users: {
          active: activeUsers || 0,
        },
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get error logs
 */
async function getErrorLogs(req: Request, supabase: any) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const severity = url.searchParams.get('severity');

  let query = supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 500));

  if (severity) {
    query = query.eq('severity', severity);
  }

  const { data: logs, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      logs: logs || [],
      count: logs?.length || 0,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get active alerts
 */
async function getActiveAlerts(supabase: any) {
  const { data: alerts, error } = await supabase
    .from('system_alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      alerts: alerts || [],
      count: alerts?.length || 0,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Report an error
 */
async function reportError(req: Request, supabase: any) {
  const body = await req.json();
  const {
    message,
    stack,
    severity = 'error',
    context,
    userId,
  } = body;

  const errorLog = {
    message,
    stack,
    severity,
    context,
    user_id: userId,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('error_logs')
    .insert(errorLog);

  if (error) {
    console.error('Failed to log error:', error);
  }

  // Trigger alert for critical errors
  if (severity === 'critical') {
    await triggerAlert('Critical Error', message, 'critical', supabase);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Error logged successfully',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(req: Request, supabase: any) {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || 'hour'; // hour, day, week

  const periodMap: Record<string, number> = {
    hour: 3600,
    day: 86400,
    week: 604800,
  };

  const seconds = periodMap[period] || 3600;
  const startTime = new Date(Date.now() - seconds * 1000).toISOString();

  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .gte('timestamp', startTime)
    .order('timestamp', { ascending: true });

  return new Response(
    JSON.stringify({
      success: true,
      period,
      metrics: metrics || [],
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get uptime statistics
 */
async function getUptimeStats(supabase: any) {
  const oneDayAgo = new Date(Date.now() - 86400 * 1000).toISOString();
  const oneWeekAgo = new Date(Date.now() - 604800 * 1000).toISOString();

  // Get health checks
  const { data: dayChecks } = await supabase
    .from('health_checks')
    .select('status')
    .gte('timestamp', oneDayAgo);

  const { data: weekChecks } = await supabase
    .from('health_checks')
    .select('status')
    .gte('timestamp', oneWeekAgo);

  const calculateUptime = (checks: any[]) => {
    if (!checks || checks.length === 0) return 100;
    const healthy = checks.filter(c => c.status === 'healthy').length;
    return (healthy / checks.length) * 100;
  };

  const dayUptime = calculateUptime(dayChecks);
  const weekUptime = calculateUptime(weekChecks);

  return new Response(
    JSON.stringify({
      success: true,
      uptime: {
        last24Hours: Math.round(dayUptime * 100) / 100,
        last7Days: Math.round(weekUptime * 100) / 100,
      },
      checks: {
        last24Hours: dayChecks?.length || 0,
        last7Days: weekChecks?.length || 0,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Trigger an alert
 */
async function triggerAlert(title: string, message: string, severity: string, supabase: any) {
  try {
    await supabase
      .from('system_alerts')
      .insert({
        title,
        message,
        severity,
        status: 'active',
        created_at: new Date().toISOString(),
      });

    console.log(`Alert triggered: [${severity}] ${title}`);

    // In production, send notifications via SMS/Email to admins
    // await sendAlertNotification(title, message, severity);
  } catch (error) {
    console.error('Failed to trigger alert:', error);
  }
}