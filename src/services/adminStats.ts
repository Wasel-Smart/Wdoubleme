import { API_URL, fetchWithRetry, getAuthDetails, publicAnonKey } from './core';

/**
 * Admin stats routes now require authentication via requireAuth() middleware.
 * Falls back to publicAnonKey only if no session is available (will 401 on server).
 */
async function adminHeaders(): Promise<Record<string, string>> {
  try {
    const { token } = await getAuthDetails();
    return { 'Authorization': `Bearer ${token}` };
  } catch {
    // Not logged in — use anon key (server will reject with 401 if auth required)
    return { 'Authorization': `Bearer ${publicAnonKey}` };
  }
}

export const adminStatsAPI = {
  async getOverview() {
    const res = await fetchWithRetry(`${API_URL}/admin/overview`, {
      headers: await adminHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return res.json();
  },

  async getEconomyLoop() {
    const res = await fetchWithRetry(`${API_URL}/admin/economy-loop`, {
      headers: await adminHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch economy loop data');
    return res.json();
  },

  async getLiveFeed() {
    const res = await fetchWithRetry(`${API_URL}/admin/live-feed`, {
      headers: await adminHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch live feed');
    return res.json();
  },
};