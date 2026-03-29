import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AdminAction =
  | 'suspend_user'
  | 'ban_user'
  | 'activate_user'
  | 'verify_document'
  | 'reject_document'
  | 'resolve_dispute'
  | 'approve_driver'
  | 'reject_driver'
  | 'issue_refund'
  | 'send_warning';

interface AdminActionRequest {
  action: AdminAction;
  targetUserId?: string;
  verificationId?: string;
  disputeId?: string;
  reason: string;
  duration?: number; // For suspensions (in days)
  notes?: string;
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

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin user
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

    // Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Parse request body
    const {
      action,
      targetUserId,
      verificationId,
      disputeId,
      reason,
      duration,
      notes,
    }: AdminActionRequest = await req.json();

    if (!action || !reason) {
      throw new Error('Missing required fields: action, reason');
    }

    console.log(`Admin ${user.email} performing action: ${action}`);

    let result: any = { success: true };

    switch (action) {
      case 'suspend_user':
        if (!targetUserId) throw new Error('targetUserId required');
        const suspendUntil = duration
          ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
          : null;

        await supabase
          .from('profiles')
          .update({
            status: 'suspended',
            suspended_until: suspendUntil,
            suspended_reason: reason,
            suspended_by: user.id,
            suspended_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);

        // Notify user
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'account_suspended',
          title: 'Account Suspended',
          message: `Your account has been suspended. Reason: ${reason}`,
          data: { reason, until: suspendUntil, suspended_by: user.id },
        });

        result.message = 'User suspended successfully';
        break;

      case 'ban_user':
        if (!targetUserId) throw new Error('targetUserId required');

        await supabase
          .from('profiles')
          .update({
            status: 'banned',
            banned_reason: reason,
            banned_by: user.id,
            banned_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);

        // Disable auth account
        await supabase.auth.admin.updateUserById(targetUserId, {
          ban_duration: 'none', // Permanent ban
        });

        // Notify user
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'account_banned',
          title: 'Account Banned',
          message: `Your account has been permanently banned. Reason: ${reason}`,
          data: { reason, banned_by: user.id },
        });

        result.message = 'User banned successfully';
        break;

      case 'activate_user':
        if (!targetUserId) throw new Error('targetUserId required');

        await supabase
          .from('profiles')
          .update({
            status: 'active',
            suspended_until: null,
            suspended_reason: null,
            banned_reason: null,
          })
          .eq('id', targetUserId);

        // Re-enable auth account if banned
        await supabase.auth.admin.updateUserById(targetUserId, {
          ban_duration: '0h', // Remove ban
        });

        // Notify user
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'account_activated',
          title: 'Account Activated',
          message: 'Your account has been reactivated. Welcome back!',
          data: { activated_by: user.id },
        });

        result.message = 'User activated successfully';
        break;

      case 'verify_document':
        if (!verificationId) throw new Error('verificationId required');

        const { data: verification } = await supabase
          .from('verifications')
          .update({
            status: 'verified',
            verified_at: new Date().toISOString(),
            verified_by: user.id,
            notes: notes || reason,
          })
          .eq('id', verificationId)
          .select()
          .single();

        if (verification) {
          // Update profile verification status
          const verificationField = `${verification.type}_verified`;
          await supabase
            .from('profiles')
            .update({ [verificationField]: true })
            .eq('id', verification.user_id);

          // Notify user
          await supabase.from('notifications').insert({
            user_id: verification.user_id,
            type: 'verification_approved',
            title: 'Verification Approved',
            message: `Your ${verification.type.replace('_', ' ')} verification has been approved!`,
            data: { verification_id: verificationId, type: verification.type },
          });
        }

        result.message = 'Document verified successfully';
        break;

      case 'reject_document':
        if (!verificationId) throw new Error('verificationId required');

        const { data: rejectedVerification } = await supabase
          .from('verifications')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString(),
            rejected_by: user.id,
            rejection_reason: reason,
            notes,
          })
          .eq('id', verificationId)
          .select()
          .single();

        if (rejectedVerification) {
          // Notify user
          await supabase.from('notifications').insert({
            user_id: rejectedVerification.user_id,
            type: 'verification_rejected',
            title: 'Verification Rejected',
            message: `Your ${rejectedVerification.type.replace('_', ' ')} verification was rejected. Reason: ${reason}`,
            data: { verification_id: verificationId, reason },
          });
        }

        result.message = 'Document rejected';
        break;

      case 'resolve_dispute':
        if (!disputeId) throw new Error('disputeId required');

        const { data: dispute } = await supabase
          .from('disputes')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
            resolution: reason,
            admin_notes: notes,
          })
          .eq('id', disputeId)
          .select()
          .single();

        if (dispute) {
          // Notify involved parties
          const notifyUsers = [dispute.complainant_id, dispute.respondent_id].filter(Boolean);
          const notifications = notifyUsers.map((userId) => ({
            user_id: userId,
            type: 'dispute_resolved',
            title: 'Dispute Resolved',
            message: `Dispute #${disputeId} has been resolved. Resolution: ${reason}`,
            data: { dispute_id: disputeId, resolution: reason },
          }));

          await supabase.from('notifications').insert(notifications);
        }

        result.message = 'Dispute resolved successfully';
        break;

      case 'approve_driver':
        if (!targetUserId) throw new Error('targetUserId required');

        await supabase
          .from('profiles')
          .update({
            driver_approved: true,
            driver_approved_at: new Date().toISOString(),
            driver_approved_by: user.id,
          })
          .eq('id', targetUserId);

        // Notify driver
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'driver_approved',
          title: 'Driver Application Approved',
          message: 'Congratulations! Your driver application has been approved. You can now start accepting rides.',
          data: { approved_by: user.id },
        });

        result.message = 'Driver approved successfully';
        break;

      case 'reject_driver':
        if (!targetUserId) throw new Error('targetUserId required');

        await supabase
          .from('profiles')
          .update({
            driver_approved: false,
            driver_rejected_at: new Date().toISOString(),
            driver_rejection_reason: reason,
          })
          .eq('id', targetUserId);

        // Notify driver
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'driver_rejected',
          title: 'Driver Application Rejected',
          message: `Your driver application was not approved. Reason: ${reason}`,
          data: { reason },
        });

        result.message = 'Driver application rejected';
        break;

      case 'send_warning':
        if (!targetUserId) throw new Error('targetUserId required');

        await supabase.from('admin_actions').insert({
          admin_id: user.id,
          user_id: targetUserId,
          action_type: 'warning',
          reason,
          notes,
        });

        // Notify user
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'warning',
          title: 'Warning',
          message: `Warning: ${reason}. Please review our community guidelines.`,
          data: { reason, issued_by: user.id },
        });

        result.message = 'Warning sent successfully';
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: action,
      target_user_id: targetUserId,
      verification_id: verificationId,
      dispute_id: disputeId,
      reason,
      notes,
      metadata: {
        duration,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error performing admin action:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform admin action',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});