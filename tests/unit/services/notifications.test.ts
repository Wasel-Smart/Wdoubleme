import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchWithRetry = vi.fn();
const mockGetAuthDetails = vi.fn();
const memoryStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();

vi.mock('../../../src/services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  fetchWithRetry: (...args: any[]) => mockFetchWithRetry(...args),
  getAuthDetails: () => mockGetAuthDetails(),
}));

import { notificationsAPI } from '../../../src/services/notifications';

function response(data: any, ok = true) {
  return {
    ok,
    json: async () => data,
  };
}

describe('notificationsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', { localStorage: memoryStorage } as any);
    memoryStorage.clear();
  });

  it('stores a local fallback notification when auth is unavailable', async () => {
    mockGetAuthDetails.mockRejectedValue(new Error('no session'));

    const result = await notificationsAPI.createNotification({
      title: 'Ride posted',
      message: 'Your ride is live',
      type: 'booking',
    });

    expect(result.source).toBe('local');
    expect(JSON.parse(window.localStorage.getItem('wasel-local-notifications') || '[]')).toHaveLength(1);
  });

  it('returns local notifications when the server list is unavailable', async () => {
    window.localStorage.setItem(
      'wasel-local-notifications',
      JSON.stringify([{ id: 'local-1', title: 'Saved', message: 'Offline', source: 'local' }]),
    );
    mockGetAuthDetails.mockResolvedValue({ token: 'token-123', userId: 'user-123' });
    mockFetchWithRetry.mockResolvedValue(response({}, false));

    const result = await notificationsAPI.getNotifications();

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].title).toBe('Saved');
  });

  it('persists server push notifications to the local queue for continuity', async () => {
    mockGetAuthDetails.mockResolvedValue({ token: 'token-123', userId: 'user-123' });
    mockFetchWithRetry.mockResolvedValue(
      response({ notification: { id: 'notif-1' } })
    );

    const result = await notificationsAPI.createNotification({
      title: 'Package matched',
      message: 'A ride accepted your parcel',
      type: 'booking',
      priority: 'high',
    });

    expect(result.source).toBe('server');
    expect(JSON.parse(window.localStorage.getItem('wasel-local-notifications') || '[]')[0].id).toBe('notif-1');
  });
});
