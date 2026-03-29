/**
 * Supabase Edge Function: Driver Analytics
 * 
 * Provides comprehensive analytics and insights for drivers
 * Including earnings, ratings, performance metrics, and trends
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: authData, error: userError } = await supabaseUser.auth.getUser();
    const user = authData?.user ?? null;

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'overview';
    const period = url.searchParams.get('period') || 'week'; // day, week, month, year, all

    console.log(`Driver analytics request: ${action}, period: ${period}`);

    // Handle different analytics requests
    switch (action) {
      case 'overview':
        return await getDriverOverview(user.id, period, supabase);
      
      case 'earnings':
        return await getEarningsBreakdown(user.id, period, supabase);
      
      case 'performance':
        return await getPerformanceMetrics(user.id, period, supabase);
      
      case 'ratings':
        return await getRatingsAnalysis(user.id, period, supabase);
      
      case 'trips':
        return await getTripAnalytics(user.id, period, supabase);
      
      case 'heatmap':
        return await getHeatmapData(user.id, period, supabase);
      
      case 'comparison':
        return await getMarketComparison(user.id, period, supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Driver analytics error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Analytics failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Get comprehensive driver overview
 */
async function getDriverOverview(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  // Get earnings summary
  const { data: earnings } = await supabase
    .from('earnings')
    .select('amount, type, created_at')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const totalEarnings = earnings?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const tripEarnings = earnings?.filter((e: any) => e.type === 'trip')
    .reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const bonuses = earnings?.filter((e: any) => e.type === 'bonus')
    .reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const tips = earnings?.filter((e: any) => e.type === 'tip')
    .reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

  // Get trip statistics
  const { data: trips, count: totalTrips } = await supabase
    .from('trips')
    .select('*, bookings(*)', { count: 'exact' })
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const completedTrips = trips?.filter((t: any) => t.status === 'completed').length || 0;
  const canceledTrips = trips?.filter((t: any) => t.status === 'canceled').length || 0;
  const completionRate = totalTrips ? (completedTrips / totalTrips) * 100 : 0;

  // Calculate total distance and time
  const totalDistance = trips?.reduce((sum: number, t: any) => sum + (t.distance || 0), 0) || 0;
  const totalDuration = trips?.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0;

  // Get ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating, created_at')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const averageRating = ratings && ratings.length > 0
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
    : 0;

  // Calculate online hours
  const { data: onlineStatus } = await supabase
    .from('driver_status_logs')
    .select('status, created_at')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)
    .order('created_at', { ascending: true });

  const onlineHours = calculateOnlineHours(onlineStatus);

  // Calculate hourly rate
  const hourlyRate = onlineHours > 0 ? totalEarnings / onlineHours : 0;

  return new Response(
    JSON.stringify({
      success: true,
      period,
      dateRange,
      overview: {
        earnings: {
          total: totalEarnings,
          trips: tripEarnings,
          bonuses,
          tips,
          hourlyRate,
        },
        trips: {
          total: totalTrips,
          completed: completedTrips,
          canceled: canceledTrips,
          completionRate,
        },
        performance: {
          averageRating,
          totalRatings: ratings?.length || 0,
          totalDistance: Math.round(totalDistance * 100) / 100,
          totalDuration: Math.round(totalDuration / 60), // minutes
          onlineHours: Math.round(onlineHours * 100) / 100,
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
 * Get detailed earnings breakdown
 */
async function getEarningsBreakdown(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  const { data: earnings } = await supabase
    .from('earnings')
    .select('*')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)
    .order('created_at', { ascending: true });

  // Group by day/week/month
  const grouped = groupByTimePeriod(earnings, period);

  // Calculate trends
  const trend = calculateTrend(grouped);

  // Calculate breakdown by type
  const breakdown = {
    trips: earnings?.filter((e: any) => e.type === 'trip').reduce((sum: number, e: any) => sum + e.amount, 0) || 0,
    bonuses: earnings?.filter((e: any) => e.type === 'bonus').reduce((sum: number, e: any) => sum + e.amount, 0) || 0,
    tips: earnings?.filter((e: any) => e.type === 'tip').reduce((sum: number, e: any) => sum + e.amount, 0) || 0,
    incentives: earnings?.filter((e: any) => e.type === 'incentive').reduce((sum: number, e: any) => sum + e.amount, 0) || 0,
  };

  return new Response(
    JSON.stringify({
      success: true,
      period,
      earnings: {
        total: Object.values(breakdown).reduce((sum: number, val: number) => sum + val, 0),
        breakdown,
        timeline: grouped,
        trend,
      },
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
async function getPerformanceMetrics(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  // Get acceptance rate
  const { data: rideRequests } = await supabase
    .from('ride_requests')
    .select('status, created_at')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const accepted = rideRequests?.filter((r: any) => r.status === 'accepted').length || 0;
  const acceptanceRate = rideRequests && rideRequests.length > 0
    ? (accepted / rideRequests.length) * 100
    : 0;

  // Get cancellation rate
  const { data: trips } = await supabase
    .from('trips')
    .select('status, cancellation_reason, created_at')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const driverCancellations = trips?.filter((t: any) => 
    t.status === 'canceled' && t.cancellation_reason?.includes('driver')
  ).length || 0;
  const cancellationRate = trips && trips.length > 0
    ? (driverCancellations / trips.length) * 100
    : 0;

  // Get average response time
  const { data: responses } = await supabase
    .from('ride_requests')
    .select('created_at, responded_at')
    .eq('driver_id', userId)
    .not('responded_at', 'is', null)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const avgResponseTime = responses && responses.length > 0
    ? responses.reduce((sum: number, r: any) => {
        const diff = new Date(r.responded_at).getTime() - new Date(r.created_at).getTime();
        return sum + diff;
      }, 0) / responses.length / 1000
    : 0;

  return new Response(
    JSON.stringify({
      success: true,
      period,
      performance: {
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        totalRequests: rideRequests?.length || 0,
        acceptedRequests: accepted,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get ratings analysis
 */
async function getRatingsAnalysis(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating, comment, created_at')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)
    .order('created_at', { ascending: false });

  // Calculate distribution
  const distribution = {
    5: ratings?.filter((r: any) => r.rating === 5).length || 0,
    4: ratings?.filter((r: any) => r.rating === 4).length || 0,
    3: ratings?.filter((r: any) => r.rating === 3).length || 0,
    2: ratings?.filter((r: any) => r.rating === 2).length || 0,
    1: ratings?.filter((r: any) => r.rating === 1).length || 0,
  };

  const average = ratings && ratings.length > 0
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
    : 0;

  // Get recent comments
  const recentComments = ratings
    ?.filter((r: any) => r.comment && r.comment.trim().length > 0)
    .slice(0, 10)
    .map((r: any) => ({
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
    })) || [];

  return new Response(
    JSON.stringify({
      success: true,
      period,
      ratings: {
        average: Math.round(average * 100) / 100,
        total: ratings?.length || 0,
        distribution,
        recentComments,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get trip analytics
 */
async function getTripAnalytics(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  // Peak hours analysis
  const hourlyDistribution = Array(24).fill(0);
  trips?.forEach((trip: any) => {
    const hour = new Date(trip.created_at).getHours();
    hourlyDistribution[hour]++;
  });

  const peakHours = hourlyDistribution
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Most common routes
  const routeFrequency: Record<string, number> = {};
  trips?.forEach((trip: any) => {
    const route = `${trip.pickup_address} → ${trip.dropoff_address}`;
    routeFrequency[route] = (routeFrequency[route] || 0) + 1;
  });

  const topRoutes = Object.entries(routeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([route, count]) => ({ route, count }));

  return new Response(
    JSON.stringify({
      success: true,
      period,
      analytics: {
        peakHours,
        topRoutes,
        hourlyDistribution,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get heatmap data for demand analysis
 */
async function getHeatmapData(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  const { data: trips } = await supabase
    .from('trips')
    .select('pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const heatmapPoints = [];
  
  trips?.forEach((trip: any) => {
    if (trip.pickup_latitude && trip.pickup_longitude) {
      heatmapPoints.push({
        lat: trip.pickup_latitude,
        lng: trip.pickup_longitude,
        type: 'pickup',
      });
    }
    if (trip.dropoff_latitude && trip.dropoff_longitude) {
      heatmapPoints.push({
        lat: trip.dropoff_latitude,
        lng: trip.dropoff_longitude,
        type: 'dropoff',
      });
    }
  });

  return new Response(
    JSON.stringify({
      success: true,
      period,
      heatmap: heatmapPoints,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get market comparison data
 */
async function getMarketComparison(userId: string, period: string, supabase: any) {
  const dateRange = getDateRange(period);

  // Get driver's stats
  const { data: driverEarnings } = await supabase
    .from('earnings')
    .select('amount')
    .eq('driver_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const driverTotal = driverEarnings?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

  // Get market averages (anonymized)
  const { data: marketEarnings } = await supabase
    .from('earnings')
    .select('driver_id, amount')
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  // Group by driver
  const driverTotals: Record<string, number> = {};
  marketEarnings?.forEach((e: any) => {
    driverTotals[e.driver_id] = (driverTotals[e.driver_id] || 0) + e.amount;
  });

  const allTotals = Object.values(driverTotals);
  const marketAverage = allTotals.length > 0
    ? allTotals.reduce((sum: number, val: number) => sum + val, 0) / allTotals.length
    : 0;

  // Calculate percentile
  const sortedTotals = allTotals.sort((a, b) => a - b);
  const driverPercentile = sortedTotals.findIndex(val => val >= driverTotal) / sortedTotals.length * 100;

  return new Response(
    JSON.stringify({
      success: true,
      period,
      comparison: {
        driverEarnings: driverTotal,
        marketAverage,
        percentile: Math.round(driverPercentile),
        totalDrivers: allTotals.length,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Helper functions
function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  let start: Date;

  switch (period) {
    case 'day':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      start = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      start = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      start = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      start = new Date(0); // All time
  }

  return {
    start: start.toISOString(),
    end: new Date().toISOString(),
  };
}

function groupByTimePeriod(data: any[], period: string): any[] {
  // Group data by day/week/month based on period
  // Implementation depends on requirements
  return data || [];
}

function calculateTrend(data: any[]): { direction: string; percentage: number } {
  if (!data || data.length < 2) {
    return { direction: 'stable', percentage: 0 };
  }

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.amount, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.amount, 0) / secondHalf.length;

  const percentage = ((secondAvg - firstAvg) / firstAvg) * 100;

  return {
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
    percentage: Math.abs(Math.round(percentage)),
  };
}

function calculateOnlineHours(statusLogs: any[]): number {
  if (!statusLogs || statusLogs.length === 0) return 0;

  let totalHours = 0;
  let onlineStart: Date | null = null;

  statusLogs.forEach((log: any) => {
    if (log.status === 'online' && !onlineStart) {
      onlineStart = new Date(log.created_at);
    } else if (log.status === 'offline' && onlineStart) {
      const onlineEnd = new Date(log.created_at);
      const hours = (onlineEnd.getTime() - onlineStart.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
      onlineStart = null;
    }
  });

  // If still online, count until now
  if (onlineStart) {
    const hours = (new Date().getTime() - onlineStart.getTime()) / (1000 * 60 * 60);
    totalHours += hours;
  }

  return totalHours;
}