import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  type: 'identity' | 'driver_license' | 'vehicle_registration' | 'insurance' | 'background_check';
  documentUrl?: string;
  documentData?: {
    documentNumber?: string;
    expiryDate?: string;
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    [key: string]: any;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase with service role for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user with regular key
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

    // Parse request body
    const { type, documentUrl, documentData }: VerificationRequest = await req.json();

    if (!type) {
      throw new Error('Missing required field: type');
    }

    console.log(`Processing ${type} verification for user: ${user.id}`);

    // Get or create verification record
    const { data: existingVerification } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .single();

    const verificationData = {
      user_id: user.id,
      type,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      document_url: documentUrl,
      document_data: documentData,
      metadata: {
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      },
    };

    let verificationId: string;

    if (existingVerification) {
      // Update existing verification
      const { data, error } = await supabase
        .from('verifications')
        .update(verificationData)
        .eq('id', existingVerification.id)
        .select()
        .single();

      if (error) throw error;
      verificationId = data.id;
    } else {
      // Create new verification
      const { data, error } = await supabase
        .from('verifications')
        .insert(verificationData)
        .select()
        .single();

      if (error) throw error;
      verificationId = data.id;
    }

    // Auto-verify for testing/staging environment
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    
    if (!isProduction && documentData?.autoVerify === true) {
      console.log('Auto-verifying for non-production environment');
      
      await supabase
        .from('verifications')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: 'system',
          notes: 'Auto-verified in staging environment',
        })
        .eq('id', verificationId);

      // Update profile verification status
      const verificationField = `${type}_verified`;
      await supabase
        .from('profiles')
        .update({ [verificationField]: true })
        .eq('id', user.id);
    }

    // Create notification for admin review
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'verification_submitted',
      title: 'Verification Submitted',
      message: `Your ${type.replace('_', ' ')} verification has been submitted and is under review.`,
      data: {
        verification_id: verificationId,
        type,
      },
    });

    // Notify admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'verification_pending',
        title: 'New Verification Pending',
        message: `User ${user.email} submitted ${type} verification for review.`,
        data: {
          verification_id: verificationId,
          user_id: user.id,
          type,
        },
      }));

      await supabase.from('notifications').insert(adminNotifications);
    }

    // If this is identity verification, trigger additional checks
    if (type === 'identity' && isProduction) {
      // TODO: Integrate with identity verification service (e.g., Onfido, Jumio)
      // For now, just mark as pending manual review
      console.log('Identity verification requires manual review');
    }

    return new Response(
      JSON.stringify({
        success: true,
        verification: {
          id: verificationId,
          type,
          status: !isProduction && documentData?.autoVerify ? 'verified' : 'pending',
          message: 'Verification submitted successfully. You will be notified once reviewed.',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing verification:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process verification',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});