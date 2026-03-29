/**
 * Unit tests for TripAnalyticsService (services/analyticsService.ts)
 *
 * Guards against the export-name collision that existed when both
 * analytics.ts and analyticsService.ts exported `analyticsService`.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  tripAnalyticsService,
  analyticsService,
  type TripHistory,
} from '../../../services/analyticsService';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeTrip(overrides: Partial<TripHistory> = {}): TripHistory {
  return {
    id: `trip-${Math.random().toString(36).slice(2)}`,
    type: 'wasel',
    role: 'passenger',
    from: 'Amman',
    to: 'Zarqa',
    date: new Date('2026-01-15T09:00:00'),
    price: 5,
    distance: 20,
    rating: 5,
    status: 'completed',
    ...overrides,
  };
}

// ─── Export identity ──────────────────────────────────────────────────────────

describe('Module exports', () => {
  it('tripAnalyticsService and the deprecated analyticsService are the same instance', () => {
    // Ensures the backward-compat alias works and no double instantiation occurred
    expect(tripAnalyticsService).toBe(analyticsService);
  });
});

// ─── calculateAnalytics ───────────────────────────────────────────────────────

describe('TripAnalyticsService.calculateAnalytics', () => {
  it('returns zeroed result for empty trip list', () => {
    const result = tripAnalyticsService.calculateAnalytics([]);
    expect(result.totalTrips).toBe(0);
    expect(result.totalDistance).toBe(0);
    expect(result.totalSpent).toBe(0);
    expect(result.totalEarned).toBe(0);
    expect(result.carbonSaved).toBe(0);
    expect(result.averageRating).toBe(0);
  });

  it('excludes non-completed trips', () => {
    const trips = [
      makeTrip({ status: 'cancelled' }),
      makeTrip({ status: 'upcoming' }),
    ];
    const result = tripAnalyticsService.calculateAnalytics(trips);
    expect(result.totalTrips).toBe(0);
  });

  it('correctly accumulates distance and price for completed trips', () => {
    const trips = [
      makeTrip({ role: 'passenger', price: 10, distance: 30, status: 'completed' }),
      makeTrip({ role: 'passenger', price: 15, distance: 50, status: 'completed' }),
    ];
    const result = tripAnalyticsService.calculateAnalytics(trips);
    expect(result.totalTrips).toBe(2);
    expect(result.totalDistance).toBe(80);
    expect(result.totalSpent).toBe(25);
    expect(result.totalEarned).toBe(0);
  });

  it('separates driver earnings from passenger spend', () => {
    const trips = [
      makeTrip({ role: 'driver', price: 20, status: 'completed' }),
      makeTrip({ role: 'passenger', price: 8, status: 'completed' }),
    ];
    const result = tripAnalyticsService.calculateAnalytics(trips);
    expect(result.totalEarned).toBe(20);
    expect(result.totalSpent).toBe(8);
    expect(result.totalDrives).toBe(1);
    expect(result.totalRides).toBe(1);
  });

  it('calculates carbon saved at 0.12 kg per km', () => {
    const trips = [makeTrip({ distance: 100, status: 'completed' })];
    const result = tripAnalyticsService.calculateAnalytics(trips);
    expect(result.carbonSaved).toBe(12); // 100 * 0.12
  });

  it('calculates average rating correctly', () => {
    const trips = [
      makeTrip({ rating: 4, status: 'completed' }),
      makeTrip({ rating: 5, status: 'completed' }),
    ];
    const result = tripAnalyticsService.calculateAnalytics(trips);
    expect(result.averageRating).toBe(4.5);
  });

  it('handles trips without a rating', () => {
    const trips = [
      makeTrip({ rating: undefined, status: 'completed' }),
    ];
    expect(() =>
      tripAnalyticsService.calculateAnalytics(trips)
    ).not.toThrow();
  });
});

// ─── generateExpenseReport ────────────────────────────────────────────────────

describe('TripAnalyticsService.generateExpenseReport', () => {
  const trips: TripHistory[] = [
    makeTrip({
      role: 'passenger',
      price: 7,
      status: 'completed',
      date: new Date('2026-01-10'),
    }),
    makeTrip({
      role: 'driver', // Should NOT appear in expense report
      price: 50,
      status: 'completed',
      date: new Date('2026-01-12'),
    }),
  ];

  it('returns a non-empty string', () => {
    const report = tripAnalyticsService.generateExpenseReport(
      trips,
      new Date('2026-01-01'),
      new Date('2026-01-31')
    );
    expect(typeof report).toBe('string');
    expect(report.length).toBeGreaterThan(0);
  });

  it('uses JOD as the currency unit', () => {
    const report = tripAnalyticsService.generateExpenseReport(
      trips,
      new Date('2026-01-01'),
      new Date('2026-01-31')
    );
    expect(report).toContain('JOD');
  });

  it('includes only passenger trips in the report', () => {
    const report = tripAnalyticsService.generateExpenseReport(
      trips,
      new Date('2026-01-01'),
      new Date('2026-01-31')
    );
    expect(report).toContain('Total Trips: 1');
  });

  it('returns empty breakdown when date range excludes all trips', () => {
    const report = tripAnalyticsService.generateExpenseReport(
      trips,
      new Date('2025-01-01'),
      new Date('2025-01-02')
    );
    expect(report).toContain('Total Trips: 0');
  });
});

// ─── getMockTripHistory ───────────────────────────────────────────────────────

describe('TripAnalyticsService.getMockTripHistory', () => {
  it('returns an array of trips', () => {
    const history = tripAnalyticsService.getMockTripHistory();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
  });

  it('each trip has required fields', () => {
    const history = tripAnalyticsService.getMockTripHistory();
    for (const trip of history) {
      expect(trip).toHaveProperty('id');
      expect(trip).toHaveProperty('from');
      expect(trip).toHaveProperty('to');
      expect(trip).toHaveProperty('price');
      expect(trip).toHaveProperty('distance');
      expect(trip).toHaveProperty('status');
      expect(trip).toHaveProperty('role');
    }
  });

  it('all mock trips are marked as completed', () => {
    const history = tripAnalyticsService.getMockTripHistory();
    expect(history.every(t => t.status === 'completed')).toBe(true);
  });
});
