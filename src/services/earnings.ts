import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const earningsAPI = {
  async getEarnings() {
    const { token, userId } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/earnings/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch earnings');
    return res.json();
  },

  async getHistory(weeks = 8) {
    const { token, userId } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/earnings/${userId}/history?weeks=${weeks}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch earnings history');
    return res.json();
  },

  async recordEarning(payload: {
    amount: number;
    type?: 'trip' | 'subscription' | 'surge' | 'tip';
    description?: string;
    tripId?: string;
    aiBoost?: number;
  }) {
    const { token, userId } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/earnings/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId, ...payload }),
    });
    if (!res.ok) throw new Error('Failed to record earning');
    return res.json();
  },

  async setWeeklyGoal(goal: number) {
    const { token, userId } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/earnings/${userId}/goal`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ weeklyGoal: goal }),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },
};
