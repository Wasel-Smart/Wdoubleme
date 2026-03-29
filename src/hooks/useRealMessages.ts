import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { localMessagesService } from '../services/localMessages';

// Build Supabase URL from project ID
const supabaseUrl = projectId ? `https://${projectId}.supabase.co` : '';
const API_BASE = `${supabaseUrl}/functions/v1/make-server-0b1f4071`;

// Flag to determine if we should use local service (no console spam)
const USE_LOCAL_SERVICE = !projectId || !supabaseUrl;

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  trip_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useRealMessages() {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (data: {
    recipient_id: string;
    trip_id?: string;
    content: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use local service if backend not configured
      if (USE_LOCAL_SERVICE) {
        const result = await localMessagesService.sendMessage({
          sender_id: user?.id || 'current_user',
          recipient_id: data.recipient_id,
          trip_id: data.trip_id,
          content: data.content,
        });
        return result;
      }

      // Try backend API
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Fallback to local service silently
        const result = await localMessagesService.sendMessage({
          sender_id: user?.id || 'current_user',
          recipient_id: data.recipient_id,
          trip_id: data.trip_id,
          content: data.content,
        });
        return result;
      }

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to send message');

      return { success: true, message: responseData.message };
    } catch (err: any) {
      // If it's a JSON parsing error or network error, use local service silently
      if (err.message.includes('JSON') || err.message.includes('fetch')) {
        const result = await localMessagesService.sendMessage({
          sender_id: user?.id || 'current_user',
          recipient_id: data.recipient_id,
          trip_id: data.trip_id,
          content: data.content,
        });
        return result;
      }
      
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getConversation = async (userId1: string, userId2: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use local service if backend not configured
      if (USE_LOCAL_SERVICE) {
        const result = await localMessagesService.getConversation(userId1, userId2);
        if (result.success && result.messages) {
          setMessages(result.messages);
        }
        return result;
      }

      // Try backend API
      const response = await fetch(
        `${API_BASE}/messages/conversation/${userId1}/${userId2}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Fallback to local service silently
        const result = await localMessagesService.getConversation(userId1, userId2);
        if (result.success && result.messages) {
          setMessages(result.messages);
        }
        return result;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');

      setMessages(data.messages || []);
      return { success: true, messages: data.messages };
    } catch (err: any) {
      // If it's a JSON parsing error or network error, use local service silently
      if (err.message.includes('JSON') || err.message.includes('fetch')) {
        const result = await localMessagesService.getConversation(userId1, userId2);
        if (result.success && result.messages) {
          setMessages(result.messages);
        }
        return result;
      }
      
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    getConversation,
  };
}