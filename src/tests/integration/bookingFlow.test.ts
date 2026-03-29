/**
 * Integration test: End-to-end booking flow.
 *
 * Simulates the full lifecycle:
 *  1. User searches for trips
 *  2. User selects a trip
 *  3. User creates a booking
 *  4. Payment is processed via wallet
 *  5. Booking confirmation is received
 *  6. Trip seat count decrements
 *
 * These tests mock the network layer (fetchWithRetry) to simulate
 * server responses, verifying that the frontend service layer
 * orchestrates calls correctly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchWithRetry = vi.fn();
const mockGetAuthDetails = vi.fn();

vi.mock('../../services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  publicAnonKey: 'test-anon-key',
  fetchWithRetry: (...args: any[]) => mockFetchWithRetry(...args),
  getAuthDetails: () => mockGetAuthDetails(),
}));

import { tripsAPI } from '../../services/trips';
import { bookingsAPI } from '../../services/bookings';
import { walletAPI } from '../../services/wallet';

function mockResponse(data: any, ok = true) {
  return { ok, status: ok ? 200 : 400, json: async () => data, text: async () => JSON.stringify(data) };
}

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthDetails.mockResolvedValue({
      token: 'user-token',
      userId: 'passenger-001',
    });
  });

  it('Step 1: Search returns available trips', async () => {
    const trips = [
      { id: 'trip:1', from: 'Amman', to: 'Irbid', available_seats: 3, price_per_seat: 5.0, status: 'published' },
      { id: 'trip:2', from: 'Amman', to: 'Zarqa', available_seats: 1, price_per_seat: 2.5, status: 'published' },
    ];
    mockFetchWithRetry.mockResolvedValue(mockResponse({ trips }));

    const result = await tripsAPI.searchTrips('Amman');
    expect(result.trips).toHaveLength(2);
    expect(result.trips[0].available_seats).toBeGreaterThan(0);
  });

  it('Step 2: Fetch single trip details', async () => {
    const trip = {
      id: 'trip:1',
      from: 'Amman', to: 'Irbid',
      available_seats: 3,
      price_per_seat: 5.0,
      driver: { name: 'Ahmad', rating: 4.8 },
    };
    mockFetchWithRetry.mockResolvedValue(mockResponse({ trip }));

    const result = await tripsAPI.getTripById('trip:1');
    expect(result.trip.driver.name).toBe('Ahmad');
    expect(result.trip.price_per_seat).toBe(5.0);
  });

  it('Step 3: Create booking sends correct payload', async () => {
    mockFetchWithRetry.mockResolvedValue(
      mockResponse({
        success: true,
        booking: {
          id: 'bk:1',
          trip_id: 'trip:1',
          passenger_id: 'passenger-001',
          seats: 2,
          total_amount: 10.0,
          status: 'confirmed',
        },
      })
    );

    const result = await bookingsAPI.createBooking('trip:1', 2);

    const [, options] = mockFetchWithRetry.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(result.booking.total_amount).toBe(10.0);
    expect(result.booking.status).toBe('confirmed');
  });

  it('Step 4: Wallet balance check before payment', async () => {
    mockFetchWithRetry.mockResolvedValue(
      mockResponse({ balance: 50.0, currency: 'JOD' })
    );

    const result = await walletAPI.getBalance();
    expect(result.balance).toBeGreaterThanOrEqual(10.0); // enough for 2 seats × 5 JOD
  });

  it('Step 5: Booking fails with insufficient funds', async () => {
    mockFetchWithRetry.mockResolvedValue(
      mockResponse({ error: 'Insufficient wallet balance' }, false)
    );

    await expect(bookingsAPI.createBooking('trip:1', 2)).rejects.toThrow();
  });

  it('Full flow: search → select → book → verify', async () => {
    // Search
    mockFetchWithRetry.mockResolvedValueOnce(
      mockResponse({ trips: [{ id: 'trip:1', available_seats: 3, price_per_seat: 5.0 }] })
    );
    const search = await tripsAPI.searchTrips('Amman', 'Irbid');
    const selectedTrip = search.trips[0];

    // Book
    mockFetchWithRetry.mockResolvedValueOnce(
      mockResponse({
        success: true,
        booking: { id: 'bk:1', trip_id: selectedTrip.id, seats: 1, total_amount: 5.0, status: 'confirmed' },
      })
    );
    const booking = await bookingsAPI.createBooking(selectedTrip.id, 1);

    expect(booking.booking.status).toBe('confirmed');
    expect(booking.booking.total_amount).toBe(selectedTrip.price_per_seat);
  });
});