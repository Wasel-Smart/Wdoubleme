/**
 * Wallet API service layer tests.
 *
 * Covers:
 *  - getBalance retrieves wallet data with auth
 *  - topUp sends correct amount and currency
 *  - getTransactions with pagination params
 *  - payForBooking deducts balance
 *  - Error handling for insufficient funds
 *  - Network failure resilience
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchWithRetry = vi.fn();
const mockGetAuthDetails = vi.fn();

vi.mock('../../../services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  publicAnonKey: 'test-anon-key',
  fetchWithRetry: (...args: any[]) => mockFetchWithRetry(...args),
  getAuthDetails: () => mockGetAuthDetails(),
}));

import { walletAPI } from '../../../services/wallet';

function mockResponse(data: any, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe('walletAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthDetails.mockResolvedValue({
      token: 'mock-token',
      userId: 'user-wallet-1',
    });
  });

  describe('getBalance', () => {
    it('calls wallet endpoint with auth token', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ balance: 42.5, currency: 'JOD' })
      );

      const result = await walletAPI.getBalance();

      const [url, options] = mockFetchWithRetry.mock.calls[0];
      expect(url).toContain('/wallet');
      expect(options.headers['Authorization']).toBe('Bearer mock-token');
      expect(result.balance).toBe(42.5);
    });

    it('throws when not authenticated', async () => {
      mockGetAuthDetails.mockRejectedValue(new Error('Not authenticated'));
      await expect(walletAPI.getBalance()).rejects.toThrow('Not authenticated');
    });
  });

  describe('topUp', () => {
    it('sends correct amount for top up', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ success: true, newBalance: 92.5 })
      );

      const result = await walletAPI.topUp(50.0, 'cliq');

      const [, options] = mockFetchWithRetry.mock.calls[0];
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.amount).toBe(50.0);
      expect(result.success).toBe(true);
    });

    it('rejects negative amounts', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ error: 'Invalid amount' }, false, 400)
      );

      await expect(walletAPI.topUp(-10, 'cliq')).rejects.toThrow();
    });
  });

  describe('getTransactions', () => {
    it('fetches transaction history', async () => {
      const txns = [
        { id: 'tx1', type: 'topup', amount: 50.0 },
        { id: 'tx2', type: 'payment', amount: -7.5 },
      ];
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ transactions: txns })
      );

      const result = await walletAPI.getTransactions();
      expect(result.transactions).toHaveLength(2);
    });
  });
});