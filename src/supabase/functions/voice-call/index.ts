/**
 * Supabase Edge Function: Voice Call
 * 
 * Handles Twilio Voice API for driver-rider communication
 * Provides anonymous calling to protect privacy
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
const TWILIO_APP_URL = Deno.env.get('TWILIO_APP_URL') || 'https://wassel4.online';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const { data: authData, error: userError } = await supabase.auth.getUser();
    const user = authData?.user ?? null;

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, to, tripId, callSid } = await req.json();

    console.log(`Voice call action: ${action} for trip: ${tripId}`);

    // Handle different actions
    switch (action) {
      case 'initiate':
        return await initiateCall(to, tripId, user.id);
      
      case 'twiml':
        return await generateTwiML(req);
      
      case 'status':
        return await updateCallStatus(callSid, req);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Voice call error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Voice call failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Initiate a voice call through Twilio
 */
async function initiateCall(to: string, tripId: string, userId: string) {
  // Format phone numbers
  const formattedTo = to.startsWith('+') ? to : `+${to}`;

  // Create call through Twilio
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
  
  const formData = new URLSearchParams({
    To: formattedTo,
    From: TWILIO_PHONE_NUMBER!,
    Url: `${TWILIO_APP_URL}/functions/v1/voice-call/twiml?tripId=${tripId}&userId=${userId}`,
    StatusCallback: `${TWILIO_APP_URL}/functions/v1/voice-call/status`,
    StatusCallbackEvent: 'initiated,ringing,answered,completed',
    Record: 'false', // Disable recording for privacy
    Timeout: '30', // 30 second timeout
  });

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate call');
  }

  const result = await response.json();

  // Log call in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  await supabase.from('call_logs').insert({
    call_sid: result.sid,
    from_user_id: userId,
    to_phone: formattedTo,
    trip_id: tripId,
    status: result.status,
    direction: 'outbound',
    created_at: new Date().toISOString(),
  });

  return new Response(
    JSON.stringify({
      success: true,
      callSid: result.sid,
      status: result.status,
      message: 'Call initiated successfully',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Generate TwiML for call instructions
 */
async function generateTwiML(req: Request) {
  const url = new URL(req.url);
  const tripId = url.searchParams.get('tripId');
  const userId = url.searchParams.get('userId');

  // Generate TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">Connecting you with your Wassel contact. Please hold.</Say>
  <Dial timeout="30" callerId="${TWILIO_PHONE_NUMBER}">
    <Number>${url.searchParams.get('to') || ''}</Number>
  </Dial>
  <Say voice="alice">The call has ended. Thank you for using Wassel.</Say>
</Response>`;

  return new Response(twiml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/xml',
    },
    status: 200,
  });
}

/**
 * Update call status callback
 */
async function updateCallStatus(callSid: string, req: Request) {
  const formData = await req.formData();
  const status = formData.get('CallStatus');
  const duration = formData.get('CallDuration');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  await supabase
    .from('call_logs')
    .update({
      status: status as string,
      duration: duration ? parseInt(duration as string) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('call_sid', callSid);

  console.log(`Call ${callSid} status updated to: ${status}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Call status updated',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}