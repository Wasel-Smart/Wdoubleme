import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = projectId ? `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071` : '';

interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  seats_requested: number;
  pickup_stop: string;
  dropoff_stop: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  total_price: number;
  created_at: string;
  updated_at: string;
}

export function useRealBookings() {
  const { user, session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (bookingData: {
    trip_id: string;
    seats_requested: number;
    pickup_stop?: string;
    dropoff_stop?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create booking');

      return { success: true, booking: data.booking };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update booking');

      return { success: true, booking: data.booking };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/bookings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');

      setBookings(data.bookings || []);
      return { success: true, bookings: data.bookings };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch user's bookings when user is available
  useEffect(() => {
    if (user?.id) {
      getUserBookings(user.id);
    }
  }, [user?.id]);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    getUserBookings,
  };
}