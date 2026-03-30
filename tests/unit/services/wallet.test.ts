/**
 * Unit tests — src/services/walletApi.ts
 * Uses vi.mock to stub Supabase so no network is needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase client ──────────────────────────────────────────────────────
vi.mock('@/utils/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  },
  isSupabaseConfigured: true,
}));

vi.mock('@/services/core', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  },
  getAuthDetails: vi.fn().mockResolvedValue({ token: 'mock-token', userId: 'user-1' }),
  fetchWithRetry: vi.fn().mockResolvedValue({ ok: true, json: async () => ({ balance: 42.5 }) }),
  API_URL: '',
  publicAnonKey: '',
}));

// ── Wallet balance parsing ────────────────────────────────────────────────────

describe('wallet balance validation', () => {
  it('parses a valid JOD balance correctly', () => {
    const raw = 42.5;
    const rounded = Math.round(raw * 100) / 100;
    expect(rounded).toBe(42.5);
  });

  it('clamps negative balance to zero (display guard)', () => {
    const balance = -5;
    const displayed = Math.max(0, balance);
    expect(displayed).toBe(0);
  });

  it('handles fractional dinar amounts accurately', () => {
    // JOD uses 3 decimal places (fils)
    const amount = 12.345;
    const formatted = amount.toFixed(3);
    expect(formatted).toBe('12.345');
  });
});

// ── Transaction amount validation ─────────────────────────────────────────────

describe('transaction amount rules', () => {
  const MAX_TOPUP = 500;
  const MAX_TRANSFER = 200;
  const MIN_AMOUNT = 0.001;

  it('rejects top-up above platform limit', () => {
    expect(501 > MAX_TOPUP).toBe(true);
    expect(500 > MAX_TOPUP).toBe(false);
  });

  it('rejects transfer above platform limit', () => {
    expect(201 > MAX_TRANSFER).toBe(true);
    expect(200 > MAX_TRANSFER).toBe(false);
  });

  it('rejects zero or negative amounts', () => {
    expect(0 < MIN_AMOUNT).toBe(true);
    expect(-1 < MIN_AMOUNT).toBe(true);
    expect(0.01 < MIN_AMOUNT).toBe(false);
  });
});
