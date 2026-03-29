/**
 * Live Chat Service
 * Real-time messaging for driver-passenger communication
 */

import { supabase } from '../utils/supabase/client';

export interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  message_type: 'text' | 'location' | 'image' | 'system';
  media_url?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  is_read: boolean;
  created_at: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'driver' | 'passenger';
  online: boolean;
}

class LiveChatService {
  private subscriptions = new Map<string, () => void>();

  /**
   * Subscribe to chat messages for a trip
   */
  subscribeToMessages(
    tripId: string,
    callback: (message: ChatMessage) => void
  ): () => void {
    const channel = supabase
      .channel(`chat:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      channel.unsubscribe();
      this.subscriptions.delete(tripId);
    };

    this.subscriptions.set(tripId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Send a text message
   */
  async sendMessage(
    tripId: string,
    senderId: string,
    recipientId: string,
    message: string
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          trip_id: tripId,
          sender_id: senderId,
          recipient_id: recipientId,
          message,
          message_type: 'text',
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Send location share
   */
  async sendLocation(
    tripId: string,
    senderId: string,
    recipientId: string,
    location: { lat: number; lng: number; address?: string }
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          trip_id: tripId,
          sender_id: senderId,
          recipient_id: recipientId,
          message: location.address || 'Shared location',
          message_type: 'location',
          location,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending location:', error);
      return null;
    }
  }

  /**
   * Send image
   */
  async sendImage(
    tripId: string,
    senderId: string,
    recipientId: string,
    imageFile: File
  ): Promise<ChatMessage | null> {
    try {
      // Upload image to storage
      const fileName = `${tripId}/${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      // Create message with image URL
      const { data, error } = await supabase
        .from('messages')
        .insert({
          trip_id: tripId,
          sender_id: senderId,
          recipient_id: recipientId,
          message: 'Sent an image',
          message_type: 'image',
          media_url: urlData.publicUrl,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending image:', error);
      return null;
    }
  }

  /**
   * Send system message (automated)
   */
  async sendSystemMessage(
    tripId: string,
    message: string
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          trip_id: tripId,
          sender_id: 'system',
          recipient_id: 'all',
          message,
          message_type: 'system',
          is_read: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending system message:', error);
      return null;
    }
  }

  /**
   * Get chat history for a trip
   */
  async getChatHistory(tripId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(tripId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('trip_id', tripId)
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(tripId: string, userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Subscribe to typing indicator
   */
  subscribeToTyping(
    tripId: string,
    callback: (isTyping: boolean, userId: string) => void
  ): () => void {
    const channel = supabase
      .channel(`typing:${tripId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Handle typing indicators
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            callback(presence.typing, presence.user_id);
          });
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    tripId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channel = supabase.channel(`typing:${tripId}`);
    
    await channel.track({
      user_id: userId,
      typing: isTyping,
      online_at: new Date().toISOString(),
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Get conversation participants
   */
  async getParticipants(tripId: string): Promise<ChatUser[]> {
    try {
      // Get trip details to find driver and passenger
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          rider_id,
          driver_id,
          rider:riders!trips_rider_id_fkey (
            full_name,
            profile_image
          ),
          driver:drivers!trips_driver_id_fkey (
            full_name,
            profile_image
          )
        `)
        .eq('id', tripId)
        .single();

      if (tripError) throw tripError;

      const participants: ChatUser[] = [];

      if (tripData.rider) {
        participants.push({
          id: tripData.rider_id,
          name: tripData.rider.full_name,
          avatar: tripData.rider.profile_image,
          type: 'passenger',
          online: true, // TODO: Implement online status
        });
      }

      if (tripData.driver) {
        participants.push({
          id: tripData.driver_id,
          name: tripData.driver.full_name,
          avatar: tripData.driver.profile_image,
          type: 'driver',
          online: true, // TODO: Implement online status
        });
      }

      return participants;
    } catch (error) {
      console.error('Error getting participants:', error);
      return [];
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
  }
}

export const liveChatService = new LiveChatService();
