/**
 * Route Intelligence Engine — Unit Tests
 *
 * Covers: trip scoring, package compatibility, multi-stop TSP optimization,
 * seat utilization, liquidity health, prayer stops, gender matching,
 * price scoring, and ranked match lists.
 *
 * Standard: The AI matching engine is the core product differentiator.
 * Every scoring function must be mathematically deterministic and tested
 * with boundary conditions covering the full 0-100 range.
 */
import { describe, it, expect } from 'vitest';
import {
  scoreTripForPassenger,
  checkPackageCompatibility,
  optimizeMultiStopRoute,
  scoreSeatUtilization,
  calculateLiquidityHealth,
  rankTripsForPassenger,
  rankTripsForPackage,
  calculatePrayerStops,
  calculateDetourTolerance,
  scoreTripMatch,
  type TripSummary,
  type PassengerRequest,
  type PackageSummary,
} from '../../../src/utils/routeIntelligence';

// ── Test fixtures ─────────────────────────────────────────────────────────────

const PERFECT_TRIP: TripSummary = {
  id: 'trip-1',
  originCity: 'Amman',
  destinationCity: 'Aqaba',
  country: 'JO',
  departureTime: '2026-06-15T08:00:00.000Z',
  availableSeats: 3,
  totalSeats: 4,
  allowsPackages: true,
  maxPackageWeightKg: 10,
  genderPreference: 'mixed',
  driverRating: 4.8,
  driverTrustScore: 90,
  pricePerSeatJOD: 12,
  estimatedArrivalTime: '2026-06-15T12:00:00.000Z',
};

const PERFECT_REQUEST: PassengerRequest = {
  id: 'req-1',
  originCity: 'Amman',
  destinationCity: 'Aqaba',
  country: 'JO',
  date: '2026-06-15',
  passengersCount: 2,
  genderPreference: 'mixed',
  maxPriceJOD: 15,
  minDriverRating: 4.0,
};

// ── 1. scoreTripForPassenger ──────────────────────────────────────────────────

describe('scoreTripForPassenger()', () => {
  it('returns overall score in 0-100 range', () => {
    const score = scoreTripForPassenger(PERFECT_TRIP, PERFECT_REQUEST);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it('exact route match scores high (>= 80)', () => {
    const score = scoreTripForPassenger(PERFECT_TRIP, PERFECT_REQUEST);
    expect(score.overall).toBeGreaterThanOrEqual(80);
  });

  it('route mismatch significantly lowers score', () => {
    const mismatch: PassengerRequest = {
      ...PERFECT_REQUEST,
      originCity: 'Irbid',
      destinationCity: 'Zarqa',
    };
    const score = scoreTripForPassenger(PERFECT_TRIP, mismatch);
    expect(score.overall).toBeLessThan(60);
  });

  it('gender conflict adds a warning', () => {
    const womenOnly: TripSummary = { ...PERFECT_TRIP, genderPreference: 'women_only' };
    const maleRequest: PassengerRequest = { ...PERFECT_REQUEST, genderPreference: 'men_only' };
    const score = scoreTripForPassenger(womenOnly, maleRequest);
    expect(score.warnings.length).toBeGreaterThan(0);
  });

  it('insufficient seats produces a warning', () => {
    const fullTrip: TripSummary = { ...PERFECT_TRIP, availableSeats: 1 };
    const bigGroup: PassengerRequest = { ...PERFECT_REQUEST, passengersCount: 3 };
    const score = scoreTripForPassenger(fullTrip, bigGroup);
    expect(score.warnings.some(w => w.includes('seats'))).toBe(true);
    expect(score.overall).toBeLessThan(50);
  });

  it('price over budget produces a warning', () => {
    const cheapMax: PassengerRequest = { ...PERFECT_REQUEST, maxPriceJOD: 5 };
    const score = scoreTripForPassenger(PERFECT_TRIP, cheapMax);
    expect(score.warnings.length).toBeGreaterThan(0);
  });

  it('returns reasons in Arabic when match is good', () => {
    const score = scoreTripForPassenger(PERFECT_TRIP, PERFECT_REQUEST);
    expect(score.reasonsAr.length).toBeGreaterThan(0);
  });

  it('seat utilization is calculated after booking', () => {
    const score = scoreTripForPassenger(PERFECT_TRIP, PERFECT_REQUEST);
    // Trip has 4 total, 3 available. After booking 2: (4-1)/4 = 75%
    expect(score.seatUtilization).toBeGreaterThan(50);
  });

  it('high-rated driver earns a reason', () => {
    const score = scoreTripForPassenger(PERFECT_TRIP, PERFECT_REQUEST);
    const hasRatingReason = score.reasons.some(r => r.includes('rated') || r.includes('rating'));
    expect(hasRatingReason).toBe(true);
  });

  it('detourKm is 0 for exact route match', () => {
    const score = scoreTripForPassenger(PERFECT_TRIP, PERFECT_REQUEST);
    expect(score.detourKm).toBe(0);
  });

  it('detourKm > 0 for partial route match', () => {
    const mismatch: PassengerRequest = {
      ...PERFECT_REQUEST,
      originCity: 'Irbid',
      destinationCity: 'Zarqa',
    };
    const score = scoreTripForPassenger(PERFECT_TRIP, mismatch);
    expect(score.detourKm).toBeGreaterThan(0);
  });
});

// ── 2. checkPackageCompatibility ──────────────────────────────────────────────

describe('checkPackageCompatibility()', () => {
  const PACKAGE: PackageSummary = {
    id: 'pkg-1',
    originCity: 'Amman',
    destinationCity: 'Aqaba',
    country: 'JO',
    weightKg: 3,
    neededBy: '2026-06-15T14:00:00.000Z',
    category: 'documents',
    fragile: false,
    declaredValueJOD: 50,
  };

  it('compatible package returns score 100 and no blockers', () => {
    const result = checkPackageCompatibility(PERFECT_TRIP, PACKAGE);
    expect(result.compatible).toBe(true);
    expect(result.score).toBe(100);
    expect(result.blockers.length).toBe(0);
  });

  it('package rejected when trip disallows packages', () => {
    const noPackages: TripSummary = { ...PERFECT_TRIP, allowsPackages: false };
    const result = checkPackageCompatibility(noPackages, PACKAGE);
    expect(result.compatible).toBe(false);
    expect(result.score).toBe(0);
  });

  it('package rejected when weight exceeds trip limit', () => {
    const heavyPkg: PackageSummary = { ...PACKAGE, weightKg: 20 };
    const result = checkPackageCompatibility(PERFECT_TRIP, heavyPkg);
    expect(result.compatible).toBe(false);
    expect(result.blockers.some(b => b.includes('weight'))).toBe(true);
  });

  it('package rejected when route does not match', () => {
    const wrongRoute: PackageSummary = {
      ...PACKAGE,
      originCity: 'Irbid',
      destinationCity: 'Zarqa',
    };
    const result = checkPackageCompatibility(PERFECT_TRIP, wrongRoute);
    expect(result.compatible).toBe(false);
  });

  it('package rejected when trip arrives after deadline', () => {
    const lateDeadline: PackageSummary = {
      ...PACKAGE,
      neededBy: '2026-06-15T10:00:00.000Z', // before trip arrival (12:00)
    };
    const result = checkPackageCompatibility(PERFECT_TRIP, lateDeadline);
    expect(result.compatible).toBe(false);
    expect(result.blockers.some(b => b.includes('deadline'))).toBe(true);
  });

  it('fragile package blocked by low-trust driver', () => {
    const lowTrustDriver: TripSummary = {
      ...PERFECT_TRIP,
      driverTrustScore: 50,
    };
    const fragilePkg: PackageSummary = { ...PACKAGE, fragile: true };
    const result = checkPackageCompatibility(lowTrustDriver, fragilePkg);
    expect(result.compatible).toBe(false);
    expect(result.blockers.some(b => b.includes('trust'))).toBe(true);
  });

  it('blockers are provided in Arabic too', () => {
    const noPackages: TripSummary = { ...PERFECT_TRIP, allowsPackages: false };
    const result = checkPackageCompatibility(noPackages, PACKAGE);
    expect(result.blockersAr.length).toBeGreaterThan(0);
  });

  it('detourKm is 0 for same-route package', () => {
    const result = checkPackageCompatibility(PERFECT_TRIP, PACKAGE);
    expect(result.detourKm).toBe(0);
  });
});

// ── 3. optimizeMultiStopRoute ─────────────────────────────────────────────────

describe('optimizeMultiStopRoute()', () => {
  const MATRIX: Record<string, Record<string, number>> = {
    Amman:  { Zarqa: 30, Irbid: 85, Aqaba: 330 },
    Zarqa:  { Amman: 30, Irbid: 80, Aqaba: 320 },
    Irbid:  { Amman: 85, Zarqa: 80, Aqaba: 380 },
    Aqaba:  { Amman: 330, Zarqa: 320, Irbid: 380 },
  };

  it('no waypoints returns direct route', () => {
    const result = optimizeMultiStopRoute('Amman', 'Aqaba', [], '2026-06-15T08:00:00Z', MATRIX);
    expect(result.orderedStops).toEqual(['Amman', 'Aqaba']);
    expect(result.totalDistanceKm).toBe(330);
  });

  it('returns origin and destination as first and last stops', () => {
    const result = optimizeMultiStopRoute(
      'Amman', 'Aqaba', ['Zarqa'], '2026-06-15T08:00:00Z', MATRIX,
    );
    expect(result.orderedStops[0]).toBe('Amman');
    expect(result.orderedStops[result.orderedStops.length - 1]).toBe('Aqaba');
  });

  it('includes all waypoints in the optimized route', () => {
    const result = optimizeMultiStopRoute(
      'Amman', 'Aqaba', ['Zarqa', 'Irbid'], '2026-06-15T08:00:00Z', MATRIX,
    );
    expect(result.orderedStops).toContain('Zarqa');
    expect(result.orderedStops).toContain('Irbid');
  });

  it('optimizationSaving is non-negative', () => {
    const result = optimizeMultiStopRoute(
      'Amman', 'Aqaba', ['Zarqa'], '2026-06-15T08:00:00Z', MATRIX,
    );
    expect(result.optimizationSaving).toBeGreaterThanOrEqual(0);
  });

  it('prayer stops suggested for long routes (>2 hours)', () => {
    const result = optimizeMultiStopRoute('Amman', 'Aqaba', [], '2026-06-15T08:00:00Z', MATRIX);
    // 330 km * 1.2 = ~396 min = 6.6 hours → should suggest prayer stops
    expect(result.prayerStopsSuggested).toBeGreaterThanOrEqual(3);
  });
});

// ── 4. scoreSeatUtilization ───────────────────────────────────────────────────

describe('scoreSeatUtilization()', () => {
  it('0/4 seats → score 0', () => {
    expect(scoreSeatUtilization(0, 4)).toBe(0);
  });

  it('4/4 seats → score 100', () => {
    expect(scoreSeatUtilization(4, 4)).toBe(100);
  });

  it('3/4 seats → score 90 (>= 75% utilization bracket)', () => {
    expect(scoreSeatUtilization(3, 4)).toBe(90);
  });

  it('2/4 seats → score 70 (>= 50% bracket)', () => {
    expect(scoreSeatUtilization(2, 4)).toBe(70);
  });

  it('1/4 seats → score 45 (>= 25% bracket)', () => {
    expect(scoreSeatUtilization(1, 4)).toBe(45);
  });

  it('0 total seats → score 0 (guard against division by zero)', () => {
    expect(scoreSeatUtilization(0, 0)).toBe(0);
  });

  it('score is always in 0-100 range', () => {
    for (let booked = 0; booked <= 7; booked++) {
      for (let total = 1; total <= 7; total++) {
        const score = scoreSeatUtilization(booked, total);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });
});

// ── 5. calculateLiquidityHealth ───────────────────────────────────────────────

describe('calculateLiquidityHealth() with numeric args', () => {
  it('returns a full LiquidityMetrics object', () => {
    const result = calculateLiquidityHealth(10, 40, 32);
    expect(typeof result).toBe('object');
  });

  it('healthy route: high utilization, many trips', () => {
    const result = calculateLiquidityHealth(15, 40, 34) as any;
    expect(result.status).toBe('healthy');
    expect(result.healthScore).toBeGreaterThanOrEqual(70);
  });

  it('critical route: low utilization, few trips', () => {
    const result = calculateLiquidityHealth(2, 10, 1) as any;
    expect(result.status).toBe('critical');
    expect(result.healthScore).toBeLessThanOrEqual(30);
  });
});

describe('calculateLiquidityHealth() with object arg', () => {
  it('returns a numeric health score from object input', () => {
    const score = calculateLiquidityHealth({
      activeTrips: 10,
      pendingRequests: 8,
      averageMatchTime: 5,
    });
    expect(typeof score).toBe('number');
    expect(score as number).toBeGreaterThanOrEqual(0);
    expect(score as number).toBeLessThanOrEqual(100);
  });
});

// ── 6. rankTripsForPassenger ──────────────────────────────────────────────────

describe('rankTripsForPassenger()', () => {
  it('returns trips sorted by score descending', () => {
    const badTrip: TripSummary = {
      ...PERFECT_TRIP,
      id: 'trip-bad',
      originCity: 'Irbid',
      destinationCity: 'Zarqa',
      driverRating: 2.0,
    };
    const ranked = rankTripsForPassenger([badTrip, PERFECT_TRIP], PERFECT_REQUEST);
    if (ranked.length >= 2) {
      expect(ranked[0].score.overall).toBeGreaterThanOrEqual(ranked[1].score.overall);
    }
  });

  it('filters out trips with score <= 30', () => {
    const terribleTrip: TripSummary = {
      ...PERFECT_TRIP,
      id: 'trip-terrible',
      originCity: 'Irbid',
      destinationCity: 'Zarqa',
      availableSeats: 0,
    };
    const ranked = rankTripsForPassenger([terribleTrip], PERFECT_REQUEST);
    for (const item of ranked) {
      expect(item.score.overall).toBeGreaterThan(30);
    }
  });

  it('returns empty array for empty input', () => {
    expect(rankTripsForPassenger([], PERFECT_REQUEST)).toEqual([]);
  });
});

// ── 7. rankTripsForPackage ────────────────────────────────────────────────────

describe('rankTripsForPackage()', () => {
  const PKG: PackageSummary = {
    id: 'pkg-rank',
    originCity: 'Amman',
    destinationCity: 'Aqaba',
    country: 'JO',
    weightKg: 2,
    neededBy: '2026-06-15T14:00:00.000Z',
    category: 'electronics',
    fragile: false,
    declaredValueJOD: 200,
  };

  it('only returns compatible trips', () => {
    const incompatible: TripSummary = { ...PERFECT_TRIP, allowsPackages: false };
    const ranked = rankTripsForPackage([incompatible], PKG);
    expect(ranked.length).toBe(0);
  });

  it('returns compatible trips sorted by score descending', () => {
    const goodTrip: TripSummary = { ...PERFECT_TRIP, id: 'trip-good', driverTrustScore: 95 };
    const okTrip: TripSummary = { ...PERFECT_TRIP, id: 'trip-ok', driverTrustScore: 75 };
    const ranked = rankTripsForPackage([okTrip, goodTrip], PKG);
    if (ranked.length >= 2) {
      expect(ranked[0].result.score).toBeGreaterThanOrEqual(ranked[1].result.score);
    }
  });
});

// ── 8. calculatePrayerStops ───────────────────────────────────────────────────

describe('calculatePrayerStops()', () => {
  it('returns an array', () => {
    const stops = calculatePrayerStops('2026-06-15T07:00:00.000Z', 300, 'JO');
    expect(Array.isArray(stops)).toBe(true);
  });

  it('each stop has required fields', () => {
    const stops = calculatePrayerStops('2026-06-15T07:00:00.000Z', 480, 'JO');
    for (const stop of stops) {
      expect(stop.name.length).toBeGreaterThan(0);
      expect(stop.nameAr.length).toBeGreaterThan(0);
      expect(stop.prayerTime).toBeTruthy();
      expect(stop.waitMinutes).toBeGreaterThan(0);
    }
  });

  it('very short trip (< 1 hour) has 0 prayer stops', () => {
    const stops = calculatePrayerStops('2026-06-15T22:30:00.000Z', 30, 'JO');
    expect(stops.length).toBe(0);
  });

  it('all prayer times fall within the trip window', () => {
    const departure = '2026-06-15T06:00:00.000Z';
    const durationMin = 360;
    const stops = calculatePrayerStops(departure, durationMin, 'JO');
    const depTs = new Date(departure).getTime();
    const endTs = depTs + durationMin * 60_000;

    for (const stop of stops) {
      const stopTs = new Date(stop.prayerTime).getTime();
      expect(stopTs).toBeGreaterThan(depTs);
      expect(stopTs).toBeLessThan(endTs);
    }
  });
});

// ── 9. calculateDetourTolerance ───────────────────────────────────────────────

describe('calculateDetourTolerance()', () => {
  it('returns 0 for 0 km route', () => {
    expect(calculateDetourTolerance(0)).toBe(0);
  });

  it('returns at least 10 km for any positive route', () => {
    expect(calculateDetourTolerance(50)).toBeGreaterThanOrEqual(10);
    expect(calculateDetourTolerance(1)).toBeGreaterThanOrEqual(10);
  });

  it('tolerance scales with route distance (~12%)', () => {
    const tolerance = calculateDetourTolerance(330); // Amman-Aqaba
    expect(tolerance).toBeCloseTo(330 * 0.12, 0);
  });
});

// ── 10. scoreTripMatch ────────────────────────────────────────────────────────

describe('scoreTripMatch()', () => {
  it('returns a number in 0-100 range', () => {
    const score = scoreTripMatch(PERFECT_TRIP, PERFECT_REQUEST);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('gender conflict caps score at 40', () => {
    const womenOnly: TripSummary = { ...PERFECT_TRIP, genderPreference: 'women_only' };
    const maleReq: PassengerRequest = { ...PERFECT_REQUEST, genderPreference: 'men_only' };
    const score = scoreTripMatch(womenOnly, maleReq);
    expect(score).toBeLessThanOrEqual(40);
  });

  it('route mismatch caps score at 65', () => {
    const wrongRoute: PassengerRequest = {
      ...PERFECT_REQUEST,
      originCity: 'Irbid',
      destinationCity: 'Zarqa',
    };
    const score = scoreTripMatch(PERFECT_TRIP, wrongRoute);
    expect(score).toBeLessThanOrEqual(65);
  });

  it('perfect match scores higher than 65', () => {
    const score = scoreTripMatch(PERFECT_TRIP, PERFECT_REQUEST);
    expect(score).toBeGreaterThan(65);
  });
});
