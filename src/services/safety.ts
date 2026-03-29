import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const safetyAPI = {
  async reportIncident(type: 'police' | 'radar' | 'accident' | 'traffic' | 'barrier', location: { lat: number; lng: number }, description?: string) {
    const { token } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/hazards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type, location, description })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to report hazard');
    }

    return await response.json();
  },

  async getIncidents(lat?: number, lng?: number, radius?: number) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    if (radius) params.append('radius', radius.toString());

    const response = await fetchWithRetry(`${API_URL}/hazards?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch hazards');
    }

    return await response.json();
  },
  
  // Alias for backward compatibility if needed, but we prefer reportIncident
  async reportHazard(type: any, location: any, description: any) {
    return this.reportIncident(type, location, description);
  },
  
  async getHazards(lat?: number, lng?: number, radius?: number) {
    return this.getIncidents(lat, lng, radius);
  }
};
