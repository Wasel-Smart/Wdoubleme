import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const referralAPI = {
  /** GET /referrals/code — get or create the current user's referral code */
  async getReferralCode() {
    const { token } = await getAuthDetails();
    const response = await fetchWithRetry(`${API_URL}/referrals/code`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch referral code');
    const data = await response.json();
    return {
      referral_code:     data.code,
      referral_count:    data.totalReferrals    ?? 0,
      referral_earnings: data.totalEarned        ?? 0,
      share_url:         data.shareUrl           ?? null,
    };
  },

  /** POST /referrals/apply — apply a referral code at signup */
  async applyReferralCode(code: string) {
    const { token } = await getAuthDetails();
    const response = await fetchWithRetry(`${API_URL}/referrals/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to apply referral code');
    }
    return response.json();
  },

  /** GET /referrals/stats — detailed stats with referral list */
  async getStats() {
    const { token } = await getAuthDetails();
    const response = await fetchWithRetry(`${API_URL}/referrals/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch referral stats');
    return response.json();
  },

  /** GET /referrals/leaderboard — top referrers */
  async getLeaderboard() {
    const { token } = await getAuthDetails();
    const response = await fetchWithRetry(`${API_URL}/referrals/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },
};