/**
 * Country API - Regionalization Endpoints
 * 
 * Provides REST API for country detection, configuration,
 * currency conversion, and feature flag resolution.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Redis-like cache using Deno KV
const kv = await Deno.openKv();

// ============================================================================
// HELPER: Cache Get/Set
// ============================================================================

async function getCache<T>(key: string): Promise<T | null> {
  const result = await kv.get<T>([key]);
  return result.value;
}

async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  await kv.set([key], value, { expireIn: ttlSeconds * 1000 });
}

// ============================================================================
// HANDLER: GET /countries/active
// ============================================================================

async function getActiveCountries() {
  try {
    // Check cache first
    const cached = await getCache<any[]>('countries:active');
    if (cached) {
      return { data: cached, cached: true };
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .in('status', ['active', 'coming_soon', 'beta'])
      .order('priority', { ascending: true });

    if (error) throw error;

    // Cache for 1 hour
    await setCache('countries:active', data, 3600);

    return { data, cached: false };
  } catch (error) {
    console.error('Error fetching active countries:', error);
    throw new Error('Failed to fetch countries');
  }
}

// ============================================================================
// HANDLER: GET /config/country/:iso
// ============================================================================

async function getCountryConfig(iso: string) {
  try {
    // Check cache first
    const cacheKey = `country:config:${iso}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return { data: cached, cached: true };
    }

    // Fetch country
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('*')
      .eq('iso_alpha2', iso)
      .single();

    if (countryError) throw countryError;
    if (!country) throw new Error(`Country ${iso} not found`);

    // Fetch configs
    const { data: configs } = await supabase
      .from('country_configs')
      .select('key, value')
      .eq('country_id', country.id);

    // Fetch currency
    const { data: currency } = await supabase
      .from('currencies')
      .select('*')
      .eq('code', country.default_currency_code)
      .single();

    // Fetch feature flags
    const { data: featureFlags } = await supabase
      .from('country_feature_flags')
      .select('flag_key, enabled, variant, rollout_percentage')
      .eq('country_id', country.id);

    // Fetch available services
    const { data: services } = await supabase
      .from('country_services')
      .select('service_id, priority, rollout_percentage')
      .eq('country_id', country.id)
      .eq('enabled', true)
      .order('priority', { ascending: true });

    // Build response
    const response = {
      country,
      currency,
      configs: configs?.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {}) || {},
      featureFlags: featureFlags?.reduce((acc, f) => ({ ...acc, [f.flag_key]: f }), {}) || {},
      services: services?.map(s => s.service_id) || [],
    };

    // Cache for 1 hour
    await setCache(cacheKey, response, 3600);

    return { data: response, cached: false };
  } catch (error) {
    console.error(`Error fetching config for ${iso}:`, error);
    throw new Error(`Failed to fetch country config for ${iso}`);
  }
}

// ============================================================================
// HANDLER: POST /currency/convert
// ============================================================================

async function convertCurrency(body: any) {
  const { amount, from, to } = body;

  if (!amount || !from || !to) {
    throw new Error('Missing required fields: amount, from, to');
  }

  // Same currency = no conversion
  if (from === to) {
    return { amount, from, to, converted: amount, rate: 1 };
  }

  try {
    // Check cache first
    const cacheKey = `exchange:${from}:${to}`;
    const cachedRate = await getCache<number>(cacheKey);

    let rate: number;

    if (cachedRate) {
      rate = cachedRate;
    } else {
      // Fetch from database
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency_code', from)
        .eq('to_currency_code', to)
        .eq('is_active', true)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        throw new Error(`No exchange rate found for ${from} to ${to}`);
      }

      rate = data.rate;

      // Cache for 5 minutes (rates change frequently)
      await setCache(cacheKey, rate, 300);
    }

    const converted = amount * rate;

    return {
      amount,
      from,
      to,
      converted: Number(converted.toFixed(8)),
      rate,
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error('Failed to convert currency');
  }
}

// ============================================================================
// HANDLER: POST /geo/detect
// ============================================================================

async function detectCountryFromIP(ip: string) {
  try {
    // Use ipapi.co for IP geolocation
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason || 'IP detection failed');
    }

    const iso = data.country_code;

    // Check if country is supported
    const { data: country, error } = await supabase
      .from('countries')
      .select('*')
      .eq('iso_alpha2', iso)
      .eq('status', 'active')
      .single();

    if (error || !country) {
      // Return default (Jordan)
      return { detected: false, fallback: 'JO', reason: 'Country not supported' };
    }

    return {
      detected: true,
      country: iso,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('IP detection error:', error);
    return { detected: false, fallback: 'JO', reason: 'Detection failed' };
  }
}

// ============================================================================
// HANDLER: GET /zones/:countryIso
// ============================================================================

async function getServiceZones(iso: string, serviceType?: string) {
  try {
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('iso_alpha2', iso)
      .single();

    if (!country) {
      throw new Error(`Country ${iso} not found`);
    }

    let query = supabase
      .from('service_zones')
      .select('*')
      .eq('country_id', country.id)
      .eq('enabled', true);

    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data, error } = await query.order('priority', { ascending: true });

    if (error) throw error;

    return { zones: data || [] };
  } catch (error) {
    console.error(`Error fetching zones for ${iso}:`, error);
    throw new Error('Failed to fetch service zones');
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/country-api', '');
    const method = req.method;

    // Route: GET /countries/active
    if (path === '/countries/active' && method === 'GET') {
      const result = await getActiveCountries();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: GET /config/country/:iso
    if (path.startsWith('/config/country/') && method === 'GET') {
      const iso = path.split('/').pop()!.toUpperCase();
      const result = await getCountryConfig(iso);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /currency/convert
    if (path === '/currency/convert' && method === 'POST') {
      const body = await req.json();
      const result = await convertCurrency(body);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /geo/detect
    if (path === '/geo/detect' && method === 'POST') {
      const body = await req.json();
      const ip = body.ip || req.headers.get('x-forwarded-for') || 'unknown';
      const result = await detectCountryFromIP(ip);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: GET /zones/:iso
    if (path.startsWith('/zones/') && method === 'GET') {
      const iso = path.split('/').pop()!.toUpperCase();
      const serviceType = url.searchParams.get('type') || undefined;
      const result = await getServiceZones(iso, serviceType);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});