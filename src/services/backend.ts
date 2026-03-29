/**
 * Wasel Production Backend API Client
 * Version: 10.0.0
 * Complete integration with production backend
 */

import { supabase } from '@/utils/supabase/client';

// ── API Configuration ────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server`;

// ── Helper: Get Auth Token ───────────────────────────────────────────────────
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// ── Helper: Fetch with Auth ──────────────────────────────────────────────────
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface Profile {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  country?: string;
  wallet_balance: number;
  total_trips: number;
  rating_as_driver: number;
  rating_as_passenger: number;
  language: 'en' | 'ar';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// ── Profile API ──────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const response = await fetchWithAuth(`/profile/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Profile not found' };
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch profile' };
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
  try {
    const response = await fetchWithAuth(`/profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' };
  }
}

// ── File Upload API ──────────────────────────────────────────────────────────

export async function uploadFile(
  file: File,
  bucket: 'profile-photos' | 'driver-documents' | 'trip-receipts' | 'vehicle-photos'
): Promise<ApiResponse<{ url: string; filename: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetchWithAuth(`/uploads/${bucket}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('File upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to upload file' };
  }
}

// ── Notification API ─────────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/notifications/send-email', {
      method: 'POST',
      body: JSON.stringify({ to, subject, html }),
    });
    
    const data = await response.json();
    return { success: data.success, error: data.success ? undefined : 'Failed to send email' };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendSMS(
  to: string,
  message: string
): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/notifications/send-sms', {
      method: 'POST',
      body: JSON.stringify({ to, message }),
    });
    
    const data = await response.json();
    return { success: data.success, error: data.success ? undefined : 'Failed to send SMS' };
  } catch (error) {
    console.error('Send SMS error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send SMS' };
  }
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string
): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/notifications/send-push', {
      method: 'POST',
      body: JSON.stringify({ userId, title, body }),
    });
    
    const data = await response.json();
    return { success: data.success, error: data.success ? undefined : 'Failed to send notification' };
  } catch (error) {
    console.error('Send push notification error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send notification' };
  }
}

export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  try {
    const response = await fetchWithAuth('/notifications');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark as read' };
  }
}

// ── Chat/Messages API ────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'image' | 'location' = 'text'
): Promise<ApiResponse<Message>> {
  try {
    const response = await fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, receiverId, content, type }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send message' };
  }
}

export async function getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
  try {
    const response = await fetchWithAuth(`/messages/${conversationId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get messages error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch messages' };
  }
}

export async function markMessageAsRead(messageId: string): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Mark message as read error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark as read' };
  }
}

// ── Real-time Chat Subscription ──────────────────────────────────────────────

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Active Trip API ──────────────────────────────────────────────────────────

export async function getActiveTrip(): Promise<ApiResponse<any>> {
  try {
    const response = await fetchWithAuth('/active-trip');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.trip };
  } catch (error) {
    console.error('Get active trip error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch active trip' };
  }
}

export async function setActiveTrip(trip: any): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/active-trip', {
      method: 'POST',
      body: JSON.stringify(trip),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Set active trip error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to set active trip' };
  }
}

export async function clearActiveTrip(): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/active-trip', {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Clear active trip error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to clear active trip' };
  }
}

// ── Dashboard Stats API ──────────────────────────────────────────────────────

export interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  walletBalance: number;
  rating: number;
}

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    const response = await fetchWithAuth('/dashboard/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
  }
}

// ── Background Jobs (Admin Only) ─────────────────────────────────────────────

export async function triggerTripReminders(): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/jobs/trip-reminders', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Trigger trip reminders error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to trigger job' };
  }
}

export async function triggerSessionCleanup(): Promise<ApiResponse> {
  try {
    const response = await fetchWithAuth('/jobs/cleanup-sessions', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Trigger session cleanup error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to trigger job' };
  }
}

// ── Health Check ─────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<ApiResponse<{
  status: string;
  version: string;
  features: Record<string, boolean>;
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Health check error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Backend unavailable',
      data: {
        status: 'unhealthy',
        version: 'unknown',
        features: {
          payments: false,
          email: false,
          sms: false,
          uploads: false,
          webhooks: false,
          backgroundJobs: false,
        },
      },
    };
  }
}

// ── Export All ───────────────────────────────────────────────────────────────

export const BackendAPI = {
  // Profile
  getProfile,
  updateProfile,
  
  // Files
  uploadFile,
  
  // Notifications
  sendEmail,
  sendSMS,
  sendPushNotification,
  getNotifications,
  markNotificationAsRead,
  
  // Chat
  sendMessage,
  getMessages,
  markMessageAsRead,
  subscribeToMessages,
  
  // Active Trip
  getActiveTrip,
  setActiveTrip,
  clearActiveTrip,
  
  // Dashboard
  getDashboardStats,
  
  // Background Jobs
  triggerTripReminders,
  triggerSessionCleanup,
  
  // Health
  checkBackendHealth,
};

export default BackendAPI;