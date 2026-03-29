/**
 * activeTripAPI — unit tests
 *
 * Covers the full CRUD surface of the service layer,
 * mocking `fetchWithRetry` and `getAuthDetails` so no
 * real network calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock core utilities ───────────────────────────────────────────────────────
vi.mock('../../../services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  getAuthDetails: vi.fn().mockResolvedValue({ token: 'test-token', userId: 'user-123' }),
  fetchWithRetry: vi.fn(),
}));

import { activeTripAPI, ActiveTrip } from '../../../services/activeTrip';
import { fetchWithRetry } from '../../../services/core';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockFetch = fetchWithRetry as unknown as ReturnType<typeof vi.fn>;

function okResponse(body: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(body),
  };
}

function errResponse(status = 500) {
  return { ok: false, status };
}

const SAMPLE_TRIP: Omit<ActiveTrip, 'userId' | 'startedAt'> = {
  id: 'passenger_trip:1234',
  from: '7th Circle',
  to: 'Abdali',
  driver: {
    name: 'Ahmad Khalil',
    nameAr: 'أحمد خليل',
    rating: 4.92,
    trips: 1847,
    img: 'https://i.pravatar.cc/150?u=ah',
    phone: '+962 79 123 4567',
    initials: 'AK',
  },
  vehicle: { model: 'Toyota Corolla', color: 'White', plate: '50·12345', year: 2022 },
  price: 1.85,
  passengers: 1,
  eta: '3 min',
  duration: '22 min',
  status: 'en_route_to_pickup',
  shareCode: 'WA-1234',
  tier: 'economy',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('activeTripAPI', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getActiveTrip ──────────────────────────────────────────────────────────

  describe('getActiveTrip()', () => {
    it('returns the active trip when server responds with one', async () => {
      const serverTrip = { ...SAMPLE_TRIP, userId: 'user-123', startedAt: '2026-01-01T00:00:00Z' };
      mockFetch.mockResolvedValue(okResponse({ activeTrip: serverTrip }));

      const result = await activeTripAPI.getActiveTrip();

      expect(result).toEqual(serverTrip);
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/active-trip'),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
      );
    });

    it('returns null when server responds with activeTrip: null', async () => {
      mockFetch.mockResolvedValue(okResponse({ activeTrip: null }));
      const result = await activeTripAPI.getActiveTrip();
      expect(result).toBeNull();
    });

    it('returns null on a non-ok response without throwing', async () => {
      mockFetch.mockResolvedValue(errResponse(401));
      const result = await activeTripAPI.getActiveTrip();
      expect(result).toBeNull();
    });

    it('returns null and logs on network error without throwing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('network error'));
      const result = await activeTripAPI.getActiveTrip();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('getActiveTrip'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  // ── setActiveTrip ──────────────────────────────────────────────────────────

  describe('setActiveTrip()', () => {
    it('persists and returns the created active trip', async () => {
      const created = { ...SAMPLE_TRIP, userId: 'user-123', startedAt: '2026-01-01T00:00:00Z' };
      mockFetch.mockResolvedValue(okResponse({ activeTrip: created }));

      const result = await activeTripAPI.setActiveTrip(SAMPLE_TRIP);

      expect(result).toEqual(created);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/active-trip'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(SAMPLE_TRIP),
        })
      );
    });

    it('returns null on server error without throwing', async () => {
      mockFetch.mockResolvedValue(errResponse(500));
      const result = await activeTripAPI.setActiveTrip(SAMPLE_TRIP);
      expect(result).toBeNull();
    });

    it('returns null and logs on fetch rejection', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
      const result = await activeTripAPI.setActiveTrip(SAMPLE_TRIP);
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ── patchActiveTrip ────────────────────────────────────────────────────────

  describe('patchActiveTrip()', () => {
    it('sends a PATCH with the partial update', async () => {
      const updates = { status: 'en_route' as const };
      const patched = { ...SAMPLE_TRIP, ...updates, userId: 'user-123', startedAt: '2026-01-01T00:00:00Z' };
      mockFetch.mockResolvedValue(okResponse({ activeTrip: patched }));

      const result = await activeTripAPI.patchActiveTrip(updates);

      expect(result?.status).toBe('en_route');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/active-trip'),
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(updates) })
      );
    });

    it('returns null on 404 without throwing', async () => {
      mockFetch.mockResolvedValue(errResponse(404));
      const result = await activeTripAPI.patchActiveTrip({ status: 'arriving' });
      expect(result).toBeNull();
    });
  });

  // ── clearActiveTrip ────────────────────────────────────────────────────────

  describe('clearActiveTrip()', () => {
    it('calls DELETE and returns true on success', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const result = await activeTripAPI.clearActiveTrip();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/active-trip'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('returns false on server error without throwing', async () => {
      mockFetch.mockResolvedValue(errResponse(500));
      const result = await activeTripAPI.clearActiveTrip();
      expect(result).toBe(false);
    });

    it('returns false and logs on network error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('offline'));
      const result = await activeTripAPI.clearActiveTrip();
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});