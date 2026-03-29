import { API_URL, fetchWithRetry, getAuthDetails, publicAnonKey } from './core';

export const tripsAPI = {
  async createTrip(tripData: any) {
    const { token } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tripData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create trip');
    }

    return await response.json();
  },

  async searchTrips(from?: string, to?: string, date?: string, seats?: number) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (date) params.append('date', date);
    if (seats) params.append('seats', seats.toString());

    const response = await fetchWithRetry(`${API_URL}/trips/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search trips');
    }

    return await response.json();
  },

  async getTripById(tripId: string) {
    const response = await fetchWithRetry(`${API_URL}/trips/${tripId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trip');
    }

    return await response.json();
  },

  async getDriverTrips() {
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/trips/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch driver trips');
    }

    return await response.json();
  },

  async updateTrip(tripId: string, updates: any) {
    const { token } = await getAuthDetails();
    
    const response = await fetchWithRetry(`${API_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update trip');
    }

    return await response.json();
  },

  async deleteTrip(tripId: string) {
    const { token } = await getAuthDetails();
    
    const response = await fetchWithRetry(`${API_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete trip');
    }

    return await response.json();
  },

  async publishTrip(tripId: string) {
     const { token } = await getAuthDetails();
    
    const response = await fetchWithRetry(`${API_URL}/trips/${tripId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish trip');
    }

    return await response.json();
  },
  
  async calculatePrice(type: 'passenger' | 'package', weight?: number, distance_km?: number, base_price?: number) {
    const response = await fetchWithRetry(`${API_URL}/trips/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, weight, distance_km, base_price })
    });
    
    if (!response.ok) {
        throw new Error('Failed to calculate price');
    }
    
    return await response.json();
  }
};
