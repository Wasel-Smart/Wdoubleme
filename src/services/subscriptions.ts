import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const subscriptionsAPI = {
  async getPlans() {
    const res = await fetchWithRetry(`${API_URL}/subscriptions/plans`, {
      headers: { 'Authorization': `Bearer ${(await getAuthDetails()).token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
  },

  async getUserSubscriptions() {
    const { token, userId } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/subscriptions/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    return res.json();
  },

  async subscribe(planId: string, paymentMethod = 'wallet', autoRenew = true) {
    const { token, userId } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId, planId, paymentMethod, autoRenew }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to subscribe');
    }
    return res.json();
  },

  async cancelSubscription(subId: string) {
    const { token } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/subscriptions/${subId}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
  },

  async useRide(subId: string) {
    const { token } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/subscriptions/${subId}/use-ride`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to use ride');
    return res.json();
  },

  async getStats() {
    const { token } = await getAuthDetails();
    const res = await fetchWithRetry(`${API_URL}/subscriptions/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch subscription stats');
    return res.json();
  },
};
