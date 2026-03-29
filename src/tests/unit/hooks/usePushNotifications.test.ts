/**
 * usePushNotifications — unit tests
 *
 * Validates permission management, notify(), and all trip-event
 * convenience helpers. The browser Notification API is mocked
 * via vitest's global setup so no real OS notifications fire.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePushNotifications } from '../../../hooks/usePushNotifications';

// ── Mock core services (push-pref persistence) ─────────────────────────────────
vi.mock('../../../services/core', () => ({
  API_URL: 'https://test.supabase.co/functions/v1/server',
  getAuthDetails: vi.fn().mockResolvedValue({ token: 'tok' }),
  fetchWithRetry: vi.fn().mockResolvedValue({ ok: true }),
}));

// ── Notification API mock ─────────────────────────────────────────────────────

const mockClose = vi.fn();
const MockNotification = vi.fn().mockImplementation((_title: string, _opts: NotificationOptions) => ({
  close: mockClose,
  onclick: null as (() => void) | null,
}));

// Attach static props
Object.defineProperty(MockNotification, 'permission', {
  get: () => notifPermission,
  configurable: true,
});
MockNotification.requestPermission = vi.fn();

let notifPermission: NotificationPermission = 'default';

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  notifPermission = 'default';
  vi.clearAllMocks();

  // Install mock onto global
  (global as any).Notification = MockNotification;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  delete (global as any).Notification;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function grantPermission() {
  notifPermission = 'granted';
  MockNotification.requestPermission.mockResolvedValue('granted');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('usePushNotifications()', () => {
  // ── Initial state ────────────────────────────────────────────────────────

  it('reports isSupported=true when Notification is in window', () => {
    const { result } = renderHook(() => usePushNotifications());
    expect(result.current.isSupported).toBe(true);
  });

  it('reads the initial permission from Notification.permission', () => {
    notifPermission = 'denied';
    const { result } = renderHook(() => usePushNotifications());
    expect(result.current.permission).toBe('denied');
  });

  // ── requestPermission ────────────────────────────────────────────────────

  it('requestPermission() calls Notification.requestPermission and updates state', async () => {
    MockNotification.requestPermission.mockResolvedValue('granted');
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const perm = await result.current.requestPermission();
      expect(perm).toBe('granted');
    });

    expect(result.current.permission).toBe('granted');
    expect(MockNotification.requestPermission).toHaveBeenCalledOnce();
  });

  it('requestPermission() returns "denied" when isSupported=false', async () => {
    delete (global as any).Notification;
    const { result } = renderHook(() => usePushNotifications());

    const perm = await act(async () => result.current.requestPermission());
    expect(perm).toBe('denied');
  });

  // ── notify() ─────────────────────────────────────────────────────────────

  it('notify() creates a Notification when permission is granted', () => {
    grantPermission();
    const { result } = renderHook(() => usePushNotifications());
    // Manually set permission state to 'granted'
    act(() => { notifPermission = 'granted'; });

    act(() => {
      result.current.notify({ title: 'Test', body: 'Hello' });
    });

    // Notification constructor is called
    expect(MockNotification).toHaveBeenCalledWith('Test', expect.objectContaining({ body: 'Hello' }));
  });

  it('notify() returns null and does NOT create a Notification when permission is "default"', () => {
    const { result } = renderHook(() => usePushNotifications());

    let notif: any;
    act(() => { notif = result.current.notify({ title: 'Blocked' }); });

    expect(notif).toBeNull();
    expect(MockNotification).not.toHaveBeenCalled();
  });

  it('notify() auto-closes the notification after 8 s', () => {
    grantPermission();
    const { result } = renderHook(() => usePushNotifications());
    act(() => { notifPermission = 'granted'; });

    act(() => { result.current.notify({ title: 'Auto close test' }); });
    expect(mockClose).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(8_000); });
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('notify() wires onClick and focuses window on click', () => {
    grantPermission();
    const focusSpy = vi.spyOn(window, 'focus').mockImplementation(() => {});
    const onClick = vi.fn();
    const { result } = renderHook(() => usePushNotifications());
    act(() => { notifPermission = 'granted'; });

    let notifInstance: any;
    act(() => { notifInstance = result.current.notify({ title: 'Click me', onClick }); });

    // Simulate click
    notifInstance.onclick();
    expect(focusSpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  // ── Trip-event helpers ────────────────────────────────────────────────────

  describe('trip event helpers', () => {
    function grantedHook() {
      act(() => { notifPermission = 'granted'; });
      return renderHook(() => usePushNotifications());
    }

    it('notifyTripConfirmed fires notification with driver name and ETA', () => {
      const { result } = grantedHook();
      act(() => { result.current.notifyTripConfirmed('Ahmad', '3 min'); });
      expect(MockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Ride Confirmed'),
        expect.objectContaining({ body: expect.stringContaining('Ahmad'), tag: 'trip-confirmed' })
      );
    });

    it('notifyDriverApproaching fires notification with driver name', () => {
      const { result } = grantedHook();
      act(() => { result.current.notifyDriverApproaching('Sami'); });
      expect(MockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Approaching'),
        expect.objectContaining({ body: expect.stringContaining('Sami'), tag: 'driver-approaching' })
      );
    });

    it('notifyDriverArrived fires notification with driver name', () => {
      const { result } = grantedHook();
      act(() => { result.current.notifyDriverArrived('Rami'); });
      expect(MockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Arrived'),
        expect.objectContaining({ body: expect.stringContaining('Rami'), tag: 'driver-arrived' })
      );
    });

    it('notifyTripStarted fires notification with trip-started tag', () => {
      const { result } = grantedHook();
      act(() => { result.current.notifyTripStarted(); });
      expect(MockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Started'),
        expect.objectContaining({ tag: 'trip-started' })
      );
    });

    it('notifyTripCompleted fires notification with price and trip-completed tag', () => {
      const { result } = grantedHook();
      act(() => { result.current.notifyTripCompleted('1.850'); });
      expect(MockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Complete'),
        expect.objectContaining({
          body: expect.stringContaining('1.850'),
          tag: 'trip-completed',
        })
      );
    });

    it('trip helpers return null and do not fire when permission is default', () => {
      const { result } = renderHook(() => usePushNotifications());
      act(() => { result.current.notifyTripConfirmed('X', '5 min'); });
      expect(MockNotification).not.toHaveBeenCalled();
    });
  });
});