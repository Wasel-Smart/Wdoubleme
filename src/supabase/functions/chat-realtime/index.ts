/**
 * Supabase Edge Function: Real-time Chat Service
 * 
 * Provides real-time messaging between riders and drivers
 * Supports text messages, images, location sharing, and typing indicators
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user ?? null;
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'send';

    switch (action) {
      case 'send':
        return await sendMessage(req, supabase, user.id);
      
      case 'get-conversation':
        return await getConversation(req, supabase, user.id);
      
      case 'get-conversations':
        return await getConversations(supabase, user.id);
      
      case 'mark-read':
        return await markMessagesAsRead(req, supabase, user.id);
      
      case 'typing':
        return await sendTypingIndicator(req, supabase, user.id);
      
      case 'delete':
        return await deleteMessage(req, supabase, user.id);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Chat error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Chat operation failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Send a message
 */
async function sendMessage(req: Request, supabase: any, userId: string) {
  const {
    tripId,
    recipientId,
    message,
    type = 'text', // text, image, location, system
    metadata = {},
  } = await req.json();

  if (!recipientId || !message) {
    throw new Error('Missing required fields');
  }

  // Create conversation if it doesn't exist
  const conversationId = `trip_${tripId}`;
  
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .upsert({
      id: conversationId,
      trip_id: tripId,
      participant_ids: [userId, recipientId],
      last_message: message,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (convError && convError.code !== '23505') { // Ignore duplicate key error
    throw convError;
  }

  // Insert message
  const { data: newMessage, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      recipient_id: recipientId,
      message,
      type,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (msgError) throw msgError;

  // Send push notification to recipient
  await sendPushNotification(supabase, recipientId, {
    title: 'New Message',
    body: message,
    data: {
      type: 'chat_message',
      conversationId,
      messageId: newMessage.id,
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: newMessage,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get conversation messages
 */
async function getConversation(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const before = url.searchParams.get('before'); // For pagination

  if (!conversationId) {
    throw new Error('Missing conversation ID');
  }

  // Verify user is participant
  const { data: conversation } = await supabase
    .from('conversations')
    .select('participant_ids')
    .eq('id', conversationId)
    .single();

  if (!conversation || !conversation.participant_ids.includes(userId)) {
    throw new Error('Unauthorized access to conversation');
  }

  // Get messages
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data: messages, error } = await query;

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      messages: messages.reverse(), // Oldest first
      hasMore: messages.length === limit,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Get all user conversations
 */
async function getConversations(supabase: any, userId: string) {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  // Get unread counts
  const conversationIds = conversations.map((c: any) => c.id);
  const { data: unreadCounts } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .eq('recipient_id', userId)
    .eq('is_read', false);

  const unreadMap = (unreadCounts || []).reduce((acc: any, msg: any) => {
    acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
    return acc;
  }, {});

  const enrichedConversations = conversations.map((conv: any) => ({
    ...conv,
    unread_count: unreadMap[conv.id] || 0,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      conversations: enrichedConversations,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Mark messages as read
 */
async function markMessagesAsRead(req: Request, supabase: any, userId: string) {
  const { conversationId } = await req.json();

  if (!conversationId) {
    throw new Error('Missing conversation ID');
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Messages marked as read',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Send typing indicator
 */
async function sendTypingIndicator(req: Request, supabase: any, userId: string) {
  const { conversationId, isTyping } = await req.json();

  if (!conversationId) {
    throw new Error('Missing conversation ID');
  }

  // Broadcast via Supabase Realtime (or store in a temp table)
  const { error } = await supabase
    .from('typing_indicators')
    .upsert({
      conversation_id: conversationId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Delete a message
 */
async function deleteMessage(req: Request, supabase: any, userId: string) {
  const { messageId } = await req.json();

  if (!messageId) {
    throw new Error('Missing message ID');
  }

  // Soft delete - update message content
  const { error } = await supabase
    .from('messages')
    .update({
      message: '[Message deleted]',
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('sender_id', userId); // Only sender can delete

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Message deleted',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Send push notification
 */
async function sendPushNotification(supabase: any, userId: string, notification: any) {
  try {
    // Get user's push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!tokens || tokens.length === 0) return;

    // Send via OneSignal, FCM, or your push service
    // This is a placeholder - implement based on your push service
    console.log('Sending push notification:', { userId, notification, tokens });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}