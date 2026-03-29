/**
 * Wallet API Service — Wasel
 * Frontend API layer for the enterprise wallet system.
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/wallet`;

async function getAuthHeaders() {
  // Use the singleton Supabase client to get the session token
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        };
      }
    }
  } catch { /* fallback */ }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
  };
}

export interface WalletData {
  wallet: any;
  balance: number;
  pendingBalance: number;
  rewardsBalance: number;
  total_earned: number;
  total_spent: number;
  total_deposited: number;
  currency: string;
  pinSet: boolean;
  autoTopUp: boolean;
  transactions: any[];
  activeEscrows: any[];
  activeRewards: any[];
  subscription: any | null;
}

export interface InsightsData {
  thisMonthSpent: number;
  lastMonthSpent: number;
  thisMonthEarned: number;
  changePercent: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: { month: string; spent: number; earned: number }[];
  totalTransactions: number;
  carbonSaved: number;
}

export const walletApi = {
  async getWallet(userId: string): Promise<WalletData> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch wallet: ${res.status}`);
    return res.json();
  },

  async getTransactions(userId: string, page = 1, limit = 20, type?: string) {
    const headers = await getAuthHeaders();
    let url = `${BASE}/${userId}/transactions?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
    return res.json();
  },

  async topUp(userId: string, amount: number, paymentMethod: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/top-up`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount, paymentMethod }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Top-up failed: ${res.status}`);
    }
    return res.json();
  },

  async withdraw(userId: string, amount: number, bankAccount: string, method = 'bank_transfer') {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/withdraw`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount, bankAccount, method }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Withdrawal failed: ${res.status}`);
    }
    return res.json();
  },

  async sendMoney(userId: string, recipientId: string, amount: number, note?: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ recipientId, amount, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Send failed: ${res.status}`);
    }
    return res.json();
  },

  async getRewards(userId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/rewards`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch rewards: ${res.status}`);
    return res.json();
  },

  async claimReward(userId: string, rewardId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/rewards/claim`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rewardId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Claim failed: ${res.status}`);
    }
    return res.json();
  },

  async getSubscription(userId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/subscription`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch subscription: ${res.status}`);
    return res.json();
  },

  async subscribe(userId: string, planName: string, price: number) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/subscribe`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planName, price }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Subscribe failed: ${res.status}`);
    }
    return res.json();
  },

  async getInsights(userId: string): Promise<InsightsData> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/insights`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch insights: ${res.status}`);
    return res.json();
  },

  async setPin(userId: string, pin: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/pin/set`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Set PIN failed: ${res.status}`);
    }
    return res.json();
  },

  async verifyPin(userId: string, pin: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/pin/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `PIN verification failed: ${res.status}`);
    }
    return res.json();
  },

  async setAutoTopUp(userId: string, enabled: boolean, amount: number, threshold: number) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/auto-topup`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ enabled, amount, threshold }),
    });
    if (!res.ok) throw new Error(`Failed to update auto top-up: ${res.status}`);
    return res.json();
  },

  async getPaymentMethods(userId: string): Promise<{ methods: any[] }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/payment-methods`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch payment methods: ${res.status}`);
    return res.json();
  },

  async addPaymentMethod(userId: string, method: { type: string; provider: string; [key: string]: any }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/payment-methods`, {
      method: 'POST',
      headers,
      body: JSON.stringify(method),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Add payment method failed: ${res.status}`);
    }
    return res.json();
  },

  async deletePaymentMethod(userId: string, methodId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/payment-methods/${methodId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(`Failed to delete payment method: ${res.status}`);
    return res.json();
  },

  async getTrustScore(userId: string): Promise<{ totalTrips: number; cashRating: number; onTimePayments: number; deposit: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/${userId}/trust-score`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch trust score: ${res.status}`);
    return res.json();
  },
};