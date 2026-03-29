import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateTrip = vi.fn();
const mockFetchWithRetry = vi.fn();
const mockGetAuthDetails = vi.fn();

vi.mock('../../../services/trips', () => ({
  tripsAPI: {
    createTrip: (...args: any[]) => mockCreateTrip(...args),
  },
}));

vi.mock('../../../services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  fetchWithRetry: (...args: any[]) => mockFetchWithRetry(...args),
  getAuthDetails: () => mockGetAuthDetails(),
}));

import {
  createConnectedPackage,
  createConnectedRide,
  getConnectedPackages,
  getConnectedRides,
  getPackageByTrackingId,
} from '../../../services/journeyLogistics';

function response(data: any, ok = true) {
  return {
    ok,
    json: async () => data,
  };
}

describe('journeyLogistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockGetAuthDetails.mockResolvedValue({ token: 'token-123', userId: 'user-123' });
  });

  it('creates a ride through the server and stores the normalized result locally', async () => {
    mockCreateTrip.mockResolvedValue({
      id: 'trip-1',
      from_location: 'Amman',
      to_location: 'Aqaba',
      departure_date: '2026-04-01',
      departure_time: '07:00',
      available_seats: 3,
      price_per_seat: 8,
      vehicle_model: 'Toyota Camry',
      notes: 'Morning ride',
      created_at: '2026-03-27T00:00:00Z',
    });

    const created = await createConnectedRide({
      from: 'Amman',
      to: 'Aqaba',
      date: '2026-04-01',
      time: '07:00',
      seats: 3,
      price: 8,
      gender: 'mixed',
      prayer: true,
      carModel: 'Toyota Camry',
      note: 'Morning ride',
      acceptsPackages: true,
      packageCapacity: 'medium',
      packageNote: 'Small parcels only',
    });

    expect(mockCreateTrip).toHaveBeenCalledOnce();
    expect(created.id).toBe('trip-1');
    expect(getConnectedRides()).toHaveLength(1);
    expect(getConnectedRides()[0].from).toBe('Amman');
  });

  it('falls back to local package tracking when auth or server is unavailable', async () => {
    mockGetAuthDetails.mockRejectedValue(new Error('not signed in'));

    const created = await createConnectedPackage({
      from: 'Amman',
      to: 'Irbid',
      weight: '<1 kg',
      note: 'Documents',
    });

    expect(created.trackingId).toMatch(/^PKG-/);
    expect(getConnectedPackages()).toHaveLength(1);
    expect(getConnectedPackages()[0].status).toBe('searching');
  });

  it('creates a package via the server when recipient details are present', async () => {
    mockFetchWithRetry.mockResolvedValue(
      response({
        package: {
          id: 'pkg-remote',
          tracking_code: 'PKG-54321',
          from: 'Amman',
          to: 'Aqaba',
          status: 'pending',
          created_at: '2026-03-27T00:00:00Z',
        },
      })
    );

    const created = await createConnectedPackage({
      from: 'Amman',
      to: 'Aqaba',
      weight: '2',
      note: 'Gift',
      recipientName: 'Sara Ali',
      recipientPhone: '+962790000000',
    });

    expect(mockFetchWithRetry).toHaveBeenCalledWith(
      expect.stringContaining('/packages'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(created.trackingId).toBe('PKG-54321');
  });

  it('looks up remote package tracking when local state is empty', async () => {
    mockFetchWithRetry.mockResolvedValue(
      response({
        id: 'pkg-remote',
        tracking_code: 'PKG-67890',
        from: 'Amman',
        to: 'Dead Sea',
        status: 'delivered',
        created_at: '2026-03-27T00:00:00Z',
      })
    );

    const found = await getPackageByTrackingId('pkg-67890');

    expect(found?.trackingId).toBe('PKG-67890');
    expect(found?.status).toBe('delivered');
  });
});
