/**
 * Unit tests for type guards in types/index.ts
 *
 * Type guards are runtime-critical: they determine whether untrusted API
 * responses are treated as known shapes. Any regression here causes silent
 * data corruption rather than a thrown error.
 */

import { describe, it, expect } from 'vitest';
import { isProfile, isTrip, isBooking, isMessage } from '../../../types/index';

// ─── isProfile ────────────────────────────────────────────────────────────────

describe('isProfile', () => {
  it('returns true for a valid profile-shaped object', () => {
    const profile = { id: 'u1', email: 'test@wasel.com', full_name: 'Test User' };
    expect(isProfile(profile)).toBe(true);
  });

  it('returns false when id is missing', () => {
    expect(isProfile({ email: 'x@x.com', full_name: 'X' })).toBe(false);
  });

  it('returns false when email is missing', () => {
    expect(isProfile({ id: '1', full_name: 'X' })).toBe(false);
  });

  it('returns false when full_name is missing', () => {
    expect(isProfile({ id: '1', email: 'x@x.com' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isProfile(null)).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(isProfile('string')).toBe(false);
    expect(isProfile(42)).toBe(false);
    expect(isProfile(undefined)).toBe(false);
  });
});

// ─── isTrip ───────────────────────────────────────────────────────────────────

describe('isTrip', () => {
  it('returns true for a valid trip-shaped object', () => {
    const trip = {
      id: 't1',
      driver_id: 'u1',
      from_location: 'Amman',
      to_location: 'Aqaba',
    };
    expect(isTrip(trip)).toBe(true);
  });

  it('returns false when driver_id is missing', () => {
    expect(isTrip({ id: 't1', from_location: 'A', to_location: 'B' })).toBe(false);
  });

  it('returns false when from_location is missing', () => {
    expect(isTrip({ id: 't1', driver_id: 'u1', to_location: 'B' })).toBe(false);
  });

  it('returns false when to_location is missing', () => {
    expect(isTrip({ id: 't1', driver_id: 'u1', from_location: 'A' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isTrip(null)).toBe(false);
  });
});

// ─── isBooking ────────────────────────────────────────────────────────────────

describe('isBooking', () => {
  it('returns true for a valid booking-shaped object', () => {
    const booking = { id: 'b1', trip_id: 't1', passenger_id: 'u1' };
    expect(isBooking(booking)).toBe(true);
  });

  it('returns false when trip_id is missing', () => {
    expect(isBooking({ id: 'b1', passenger_id: 'u1' })).toBe(false);
  });

  it('returns false when passenger_id is missing', () => {
    expect(isBooking({ id: 'b1', trip_id: 't1' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isBooking(null)).toBe(false);
  });
});

// ─── isMessage ────────────────────────────────────────────────────────────────

describe('isMessage', () => {
  it('returns true for a valid message-shaped object', () => {
    const msg = {
      id: 'm1',
      sender_id: 'u1',
      recipient_id: 'u2',
      content: 'Hello',
    };
    expect(isMessage(msg)).toBe(true);
  });

  it('returns false when content is missing', () => {
    expect(isMessage({ id: 'm1', sender_id: 'u1', recipient_id: 'u2' })).toBe(false);
  });

  it('returns false when sender_id is missing', () => {
    expect(isMessage({ id: 'm1', recipient_id: 'u2', content: 'Hi' })).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isMessage({})).toBe(false);
  });

  it('returns false for null', () => {
    expect(isMessage(null)).toBe(false);
  });
});
