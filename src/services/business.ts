import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const businessAPI = {
  async registerBusiness(data: { name: string; type: string; license_number: string }) {
    const { token } = await getAuthDetails();
    const response = await fetchWithRetry(`${API_URL}/business/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register business');
    }
    return await response.json();
  },
  
  async getBusinessProfile(businessId: string) {
    const { token } = await getAuthDetails();
    const response = await fetchWithRetry(`${API_URL}/business/${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch business profile');
    return await response.json();
  },

  async getAvailablePrograms() {
      // For Business Ecosystem
      const { token } = await getAuthDetails();
      const response = await fetchWithRetry(`${API_URL}/business/programs`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      return await response.json();
  }
};
