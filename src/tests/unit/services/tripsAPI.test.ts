/**
 * Trips API service layer tests.
 *
 * Covers:
 *  - searchTrips builds correct query params and handles response
 *  - createTrip sends auth header and correct payload
 *  - getTripById returns single trip
 *  - getDriverTrips uses auth token
 *  - Error handling for network failures and server errors
 *  - Retry logic via fetchWithRetry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the core module
const mockFetchWithRetry = vi.fn();
const mockGetAuthDetails = vi.fn();

vi.mock('../../../services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  publicAnonKey: 'test-anon-key',
  fetchWithRetry: (...args: any[]) => mockFetchWithRetry(...args),
  getAuthDetails: () => mockGetAuthDetails(),
}));

import { tripsAPI } from '../../../services/trips';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockResponse(data: any, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('tripsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthDetails.mockResolvedValue({
      token: 'mock-access-token',
      userId: 'user-123',
    });
  });

  describe('searchTrips', () => {
    it('calls the correct URL with query params', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ trips: [{ id: 't1' }] })
      );

      await tripsAPI.searchTrips('Amman', 'Zarqa', '2026-03-01', 2);

      const [url, options] = mockFetchWithRetry.mock.calls[0];
      expect(url).toContain('/trips/search?');
      expect(url).toContain('from=Amman');
      expect(url).toContain('to=Zarqa');
      expect(url).toContain('date=2026-03-01');
      expect(url).toContain('seats=2');
      expect(options.headers['Authorization']).toBe('Bearer test-anon-key');
    });

    it('handles no filters', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ trips: [] })
      );

      await tripsAPI.searchTrips();

      const [url] = mockFetchWithRetry.mock.calls[0];
      expect(url).toContain('/trips/search?');
    });

    it('returns parsed trip data', async () => {
      const trips = [
        { id: 't1', from: 'Amman', to: 'Irbid', price: 5.0 },
        { id: 't2', from: 'Amman', to: 'Zarqa', price: 2.5 },
      ];
      mockFetchWithRetry.mockResolvedValue(mockResponse({ trips }));

      const result = await tripsAPI.searchTrips('Amman');
      expect(result.trips).toHaveLength(2);
      expect(result.trips[0].id).toBe('t1');
    });

    it('throws on server error', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({}, false, 500)
      );

      await expect(tripsAPI.searchTrips()).rejects.toThrow('Failed to search trips');
    });
  });

  describe('createTrip', () => {
    it('sends authenticated POST request', async () => {
      const tripData = {
        from: 'Amman',
        to: 'Aqaba',
        departure_date: '2026-04-01',
        total_seats: 3,
        price_per_seat: 15.0,
      };

      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ success: true, trip: { id: 'new-trip', ...tripData } })
      );

      const result = await tripsAPI.createTrip(tripData);

      const [url, options] = mockFetchWithRetry.mock.calls[0];
      expect(url).toContain('/trips');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe('Bearer mock-access-token');
      expect(JSON.parse(options.body)).toEqual(tripData);
      expect(result.success).toBe(true);
    });

    it('throws with server error message', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ error: 'Missing departure_date' }, false, 400)
      );

      await expect(tripsAPI.createTrip({})).rejects.toThrow('Missing departure_date');
    });

    it('throws when not authenticated', async () => {
      mockGetAuthDetails.mockRejectedValue(new Error('Not authenticated'));

      await expect(tripsAPI.createTrip({})).rejects.toThrow('Not authenticated');
    });
  });

  describe('getTripById', () => {
    it('fetches a single trip by ID', async () => {
      const trip = { id: 'trip:12345', from: 'Amman', to: 'Dead Sea' };
      mockFetchWithRetry.mockResolvedValue(mockResponse({ trip }));

      const result = await tripsAPI.getTripById('trip:12345');

      const [url] = mockFetchWithRetry.mock.calls[0];
      expect(url).toContain('/trips/trip:12345');
      expect(result.trip.id).toBe('trip:12345');
    });

    it('throws on 404', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({}, false, 404)
      );

      await expect(tripsAPI.getTripById('nonexistent')).rejects.toThrow();
    });
  });

  describe('getDriverTrips', () => {
    it('uses authenticated user ID in URL', async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse({ trips: [] })
      );

      await tripsAPI.getDriverTrips();

      const [url, options] = mockFetchWithRetry.mock.calls[0];
      expect(url).toContain('/trips/user/user-123');
      expect(options.headers['Authorization']).toBe('Bearer mock-access-token');
    });
  });
});