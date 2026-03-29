/**
 * Supabase Edge Function: Phone Verification
 * 
 * Handles OTP generation and verification via SMS
 * Part of the authentication and security system
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OTP expiration time in minutes
const OTP_EXPIRY_MINUTES = 10;

// Rate limiting: max OTP requests per phone number per hour
const MAX_OTP_PER_HOUR = 3;

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

    const { action, phoneNumber, otp } = await req.json();

    console.log(`Phone verification action: ${action} for user: ${user.id}`);

    // Handle different actions
    switch (action) {
      case 'send':
        return await sendOTP(phoneNumber, user.id, supabase);
      
      case 'verify':
        return await verifyOTP(phoneNumber, otp, user.id, supabase);
      
      case 'resend':
        return await resendOTP(phoneNumber, user.id, supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Phone verification failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Generate and send OTP
 */
async function sendOTP(phoneNumber: string, userId: string, supabase: any) {
  // Validate phone number format
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error('Invalid phone number');
  }

  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  // Check rate limiting
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentOTPs, error: rateLimitError } = await supabase
    .from('phone_verifications')
    .select('id')
    .eq('phone_number', formattedPhone)
    .gte('created_at', oneHourAgo);

  if (rateLimitError) {
    console.error('Rate limit check error:', rateLimitError);
  }

  if (recentOTPs && recentOTPs.length >= MAX_OTP_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Store OTP in database
  const { error: insertError } = await supabase
    .from('phone_verifications')
    .insert({
      user_id: userId,
      phone_number: formattedPhone,
      otp: otp, // In production, hash this!
      expires_at: expiresAt,
      verified: false,
      attempts: 0,
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error('Error storing OTP:', insertError);
    throw new Error('Failed to generate OTP');
  }

  // Send OTP via Twilio
  const message = `Your Wassel verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`;
  
  try {
    await sendSMS(formattedPhone, message);
  } catch (smsError) {
    console.error('SMS sending failed:', smsError);
    // In staging, continue without SMS
    if (Deno.env.get('ENVIRONMENT') === 'production') {
      throw new Error('Failed to send verification SMS');
    }
  }

  console.log(`OTP sent to ${formattedPhone}: ${Deno.env.get('ENVIRONMENT') === 'production' ? '******' : otp}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Verification code sent successfully',
      // Only include OTP in non-production for testing
      ...(Deno.env.get('ENVIRONMENT') !== 'production' && { otp }),
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Verify OTP
 */
async function verifyOTP(phoneNumber: string, otp: string, userId: string, supabase: any) {
  if (!otp || otp.length !== 6) {
    throw new Error('Invalid OTP format');
  }

  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  // Get the latest OTP for this phone number
  const { data: verification, error: fetchError } = await supabase
    .from('phone_verifications')
    .select('*')
    .eq('phone_number', formattedPhone)
    .eq('user_id', userId)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !verification) {
    throw new Error('No pending verification found');
  }

  // Check if OTP is expired
  if (new Date(verification.expires_at) < new Date()) {
    throw new Error('Verification code has expired. Please request a new one.');
  }

  // Check attempt limit (max 3 attempts)
  if (verification.attempts >= 3) {
    throw new Error('Maximum verification attempts exceeded. Please request a new code.');
  }

  // Verify OTP
  if (verification.otp !== otp) {
    // Increment attempts
    await supabase
      .from('phone_verifications')
      .update({
        attempts: verification.attempts + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', verification.id);

    throw new Error('Invalid verification code');
  }

  // Mark as verified
  const { error: updateError } = await supabase
    .from('phone_verifications')
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', verification.id);

  if (updateError) {
    console.error('Error updating verification:', updateError);
    throw new Error('Failed to verify phone');
  }

  // Update user profile
  await supabase
    .from('profiles')
    .update({
      phone: formattedPhone,
      phone_verified: true,
      phone_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`Phone verified successfully for user: ${userId}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber: formattedPhone,
      verified: true,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Resend OTP
 */
async function resendOTP(phoneNumber: string, userId: string, supabase: any) {
  // Mark existing OTPs as expired
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  
  await supabase
    .from('phone_verifications')
    .update({ verified: false })
    .eq('phone_number', formattedPhone)
    .eq('user_id', userId)
    .eq('verified', false);

  // Send new OTP
  return await sendOTP(phoneNumber, userId, supabase);
}

/**
 * Helper function to send SMS via Twilio
 */
async function sendSMS(to: string, message: string) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams({
    To: to,
    From: TWILIO_PHONE_NUMBER!,
    Body: message,
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
    throw new Error(error.message || 'SMS sending failed');
  }

  return await response.json();
}