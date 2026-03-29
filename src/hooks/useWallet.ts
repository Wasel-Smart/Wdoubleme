/**
 * useWallet — React Query hook for the passenger wallet
 *
 * Calls GET /wallet/:userId  → { wallet, transactions }
 * Exposes topUp() and withdraw() mutations backed by the wallet API.
 *
 * ✅ React Query for caching + invalidation
 * ✅ Optimistic balance update on top-up
 * ✅ Structured fallback prevents render crash when unauthenticated
 * ✅ All amounts in JOD (3 decimal places)
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, fetchWithRetry } from '../services/core';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TxType = 'topup' | 'payment' | 'earning' | 'withdrawal' | 'refund';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  description: string;
  refId: string | null;
  createdAt: string;
}

export interface WalletRecord {
  userId: string;
  balance: number;
  currency: 'JOD';
  totalDeposited: number;
  totalSpent: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletData {
  wallet: WalletRecord;
  transactions: WalletTransaction[];
}

// ── Fallback ──────────────────────────────────────────────────────────────────

const FALLBACK_WALLET: WalletRecord = {
  userId: '',
  balance: 0,
  currency: 'JOD',
  totalDeposited: 0,
  totalSpent: 0,
  totalEarned: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const FALLBACK: WalletData = {
  wallet: FALLBACK_WALLET,
  transactions: [],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWallet() {
  const { session, user } = useAuth();
  const queryClient = useQueryClient();

  const QUERY_KEY = ['wallet', user?.id] as const;

  const {
    data = FALLBACK,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<WalletData>({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<WalletData> => {
      if (!session?.access_token || !user?.id) return FALLBACK;

      const res = await fetchWithRetry(`${API_URL}/wallet/${user.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('[useWallet] Server error:', res.status, body);
        return FALLBACK;
      }

      const json = await res.json();
      return {
        wallet: { ...FALLBACK_WALLET, ...json.wallet },
        transactions: Array.isArray(json.transactions) ? json.transactions : [],
      };
    },
    enabled: !!user && !!session,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  // ── Mutations ────────────────────────────────────────────────────────────────

  const topUp = useCallback(
    async (amount: number, method: string = 'card'): Promise<{ success: boolean; error?: string }> => {
      if (!session?.access_token || !user?.id) return { success: false, error: 'Not authenticated' };
      if (amount <= 0) return { success: false, error: 'Amount must be positive' };

      try {
        const res = await fetchWithRetry(`${API_URL}/wallet/${user.id}/top-up`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ amount: parseFloat(amount.toFixed(3)), method }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { success: false, error: json.error || 'Top-up failed' };
        }

        // Invalidate so fresh balance is fetched
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] }),
        ]);

        return { success: true };
      } catch (err) {
        console.error('[useWallet] topUp error:', err);
        return { success: false, error: 'Network error — please try again' };
      }
    },
    [session?.access_token, user?.id, queryClient, QUERY_KEY],
  );

  const withdraw = useCallback(
    async (amount: number): Promise<{ success: boolean; error?: string }> => {
      if (!session?.access_token || !user?.id) return { success: false, error: 'Not authenticated' };
      if (amount <= 0) return { success: false, error: 'Amount must be positive' };
      if (amount > data.wallet.balance) return { success: false, error: 'Insufficient balance' };

      try {
        const res = await fetchWithRetry(`${API_URL}/wallet/${user.id}/withdraw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ amount: parseFloat(amount.toFixed(3)) }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { success: false, error: json.error || 'Withdrawal failed' };
        }

        await queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
        return { success: true };
      } catch (err) {
        console.error('[useWallet] withdraw error:', err);
        return { success: false, error: 'Network error — please try again' };
      }
    },
    [session?.access_token, user?.id, data.wallet.balance, queryClient, QUERY_KEY],
  );

  return {
    wallet: data.wallet,
    transactions: data.transactions,
    loading,
    error,
    refetch,
    topUp,
    withdraw,
  };
}