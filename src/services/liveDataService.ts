/**
 * LiveDataService — Believable Real-Time Data Illusion
 *
 * Simulates Supabase Realtime subscriptions with:
 *  - Smart interval-based data drift (seats, prices, driver positions)
 *  - Deterministic seed so data looks consistent across rerenders
 *  - Realistic Jordan geography (real lat/lng corridors)
 *  - Wallet transactions that accumulate naturally
 *  - Recent trips that complete over time
 */

import { getRuntimeModeDescription, getRuntimeModeLabel } from '../utils/runtimeMode';

// ── Jordan coordinate corridors ────────────────────────────────────────────
export const JORDAN_COORDS = {
  amman:    { lat: 31.9454, lng: 35.9284, name: 'Amman',    nameAr: 'عمّان'    },
  aqaba:    { lat: 29.5268, lng: 35.0068, name: 'Aqaba',    nameAr: 'العقبة'   },
  irbid:    { lat: 32.5556, lng: 35.8500, name: 'Irbid',    nameAr: 'إربد'     },
  deadSea:  { lat: 31.5500, lng: 35.4700, name: 'Dead Sea', nameAr: 'البحر الميت'},
  petra:    { lat: 30.3285, lng: 35.4444, name: 'Petra',    nameAr: 'البتراء'  },
  wadiRum:  { lat: 29.5756, lng: 35.4221, name: 'Wadi Rum', nameAr: 'وادي رم' },
  zarqa:    { lat: 32.0726, lng: 36.0878, name: 'Zarqa',    nameAr: 'الزرقاء' },
  madaba:   { lat: 31.7157, lng: 35.7930, name: 'Madaba',   nameAr: 'مادبا'    },
  karak:    { lat: 31.1853, lng: 35.7028, name: 'Karak',    nameAr: 'الكرك'    },
  ajloun:   { lat: 32.3333, lng: 35.7500, name: 'Ajloun',   nameAr: 'عجلون'   },
};

export type CityKey = keyof typeof JORDAN_COORDS;

// ── Driver seed data ───────────────────────────────────────────────────────
const DRIVER_NAMES = [
  { name: 'Ahmad Al-Rashid',  nameAr: 'أحمد الراشد',   rating: 4.92, trips: 847, avatar: 'AR' },
  { name: 'Mohammad Khalil',  nameAr: 'محمد خليل',      rating: 4.87, trips: 634, avatar: 'MK' },
  { name: 'Sara Al-Hassan',   nameAr: 'سارة الحسن',     rating: 4.95, trips: 412, avatar: 'SH' },
  { name: 'Khalid Nasser',    nameAr: 'خالد ناصر',      rating: 4.78, trips: 1203, avatar: 'KN' },
  { name: 'Rania Mahmoud',    nameAr: 'رانيا محمود',    rating: 4.90, trips: 298, avatar: 'RM' },
  { name: 'Omar Al-Zoubi',    nameAr: 'عمر الزعبي',     rating: 4.85, trips: 567, avatar: 'OZ' },
  { name: 'Lina Barakat',     nameAr: 'لينا بركات',     rating: 4.88, trips: 189, avatar: 'LB' },
  { name: 'Faisal Haddad',    nameAr: 'فيصل حداد',      rating: 4.73, trips: 922, avatar: 'FH' },
];

// ── Live ride pool ─────────────────────────────────────────────────────────
export interface LiveRide {
  id: string;
  driver: { name: string; nameAr: string; rating: number; trips: number; avatar: string; verified: boolean };
  from: string; fromAr: string; fromKey: CityKey;
  to: string;   toAr: string;   toKey: CityKey;
  fromCoord: { lat: number; lng: number };
  toCoord:   { lat: number; lng: number };
  driverCoord: { lat: number; lng: number }; // Live driver position
  date: string;
  departureTime: string;
  seatsAvailable: number;
  totalSeats: number;
  pricePerSeat: number;
  distanceKm: number;
  durationMin: number;
  genderPref: 'mixed' | 'women_only' | 'family_only';
  amenities: string[];
  prayerStop: boolean;
  status: 'available' | 'filling' | 'nearly_full';
  bookedCount: number;
  lastActivity: Date;
  surgeMultiplier: number;
}

// ── Live stats ─────────────────────────────────────────────────────────────
export interface LivePlatformStats {
  activeDrivers: number;
  ridesPostedToday: number;
  passengersMatchedToday: number;
  avgWaitMinutes: number;
  topCorridorLoad: number; // 0-100%
  liveRevenue: number; // JOD today
}

export const LIVE_DATA_SOURCE_LABEL = getRuntimeModeLabel();
export const LIVE_DATA_SOURCE_DESCRIPTION = getRuntimeModeDescription();

// ── Wallet transaction ─────────────────────────────────────────────────────
export interface LiveTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  desc: string; descAr: string;
  time: Date;
  status: 'completed' | 'pending';
  icon: string;
}

// ── User stats ─────────────────────────────────────────────────────────────
export interface LiveUserStats {
  totalTrips: number;
  totalSaved: number;        // JOD
  rating: number;
  pkgsDelivered: number;
  walletBalance: number;     // JOD
  trustScore: number;
  transactions: LiveTransaction[];
  recentTrips: LiveRecentTrip[];
}

export interface LiveRecentTrip {
  id: string;
  emoji: string;
  route: string; routeAr: string;
  date: string;
  price: number;
  status: 'confirmed' | 'completed' | 'in_progress' | 'delivered';
  driverName: string;
}

// ── Deterministic pseudo-random ───────────────────────────────────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function nudgeCoord(base: { lat: number; lng: number }, seedOffset: number, maxDelta = 0.05) {
  const dx = (seededRandom(seedOffset) - 0.5) * maxDelta * 2;
  const dy = (seededRandom(seedOffset + 1) - 0.5) * maxDelta * 2;
  return { lat: base.lat + dx, lng: base.lng + dy };
}

// ── Route definitions ──────────────────────────────────────────────────────
const ROUTE_POOL = [
  { from: 'amman' as CityKey, to: 'aqaba'   as CityKey, dist: 330, price: 8,  dur: 240 },
  { from: 'amman' as CityKey, to: 'irbid'   as CityKey, dist: 85,  price: 3,  dur: 90  },
  { from: 'amman' as CityKey, to: 'deadSea' as CityKey, dist: 60,  price: 5,  dur: 70  },
  { from: 'amman' as CityKey, to: 'petra'   as CityKey, dist: 250, price: 12, dur: 200 },
  { from: 'amman' as CityKey, to: 'wadiRum' as CityKey, dist: 320, price: 15, dur: 230 },
  { from: 'amman' as CityKey, to: 'zarqa'   as CityKey, dist: 30,  price: 2,  dur: 35  },
  { from: 'amman' as CityKey, to: 'karak'   as CityKey, dist: 140, price: 6,  dur: 130 },
  { from: 'irbid' as CityKey, to: 'amman'   as CityKey, dist: 85,  price: 3,  dur: 90  },
  { from: 'aqaba' as CityKey, to: 'amman'   as CityKey, dist: 330, price: 8,  dur: 240 },
  { from: 'amman' as CityKey, to: 'madaba'  as CityKey, dist: 35,  price: 2.5, dur: 40 },
  { from: 'amman' as CityKey, to: 'ajloun'  as CityKey, dist: 75,  price: 4,  dur: 80  },
];

const AMENITY_POOL = [
  'AC', 'WiFi', 'Prayer Stop', 'Music OK', 'Non-smoking', 'Pet-friendly', 'Luggage OK',
];

// ── Time helpers ───────────────────────────────────────────────────────────
function getNextDepartureTimes(): string[] {
  const now = new Date();
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    const t = new Date(now);
    t.setMinutes(0, 0, 0);
    t.setHours(now.getHours() + h + 1);
    if (h % 3 === 0 || h < 4) {
      times.push(t.toLocaleTimeString('en-JO', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }
  }
  return times;
}

// ── Generate live ride pool ────────────────────────────────────────────────
function generateRides(seed: number): LiveRide[] {
  const rides: LiveRide[] = [];
  const times = getNextDepartureTimes();

  ROUTE_POOL.forEach((route, ri) => {
    const repeatCount = ri < 3 ? 4 : 2; // Top routes have more rides
    for (let i = 0; i < repeatCount; i++) {
      const rideSeed = seed + ri * 100 + i * 13;
      const driverIdx = Math.floor(seededRandom(rideSeed) * DRIVER_NAMES.length);
      const driver = DRIVER_NAMES[driverIdx];
      const totalSeats = [3, 4, 5][Math.floor(seededRandom(rideSeed + 2) * 3)];
      const booked = Math.floor(seededRandom(rideSeed + 3) * totalSeats);
      const seatsAvail = totalSeats - booked;
      const surgeMul = seededRandom(rideSeed + 5) > 0.7 ? 1 + seededRandom(rideSeed + 6) * 0.5 : 1.0;
      const fromC = JORDAN_COORDS[route.from];
      const toC   = JORDAN_COORDS[route.to];
      // Driver is somewhere along the route
      const progress = seededRandom(rideSeed + 7);
      const driverLat = fromC.lat + (toC.lat - fromC.lat) * progress;
      const driverLng = fromC.lng + (toC.lng - fromC.lng) * progress;

      const amenityCount = 2 + Math.floor(seededRandom(rideSeed + 8) * 3);
      const amenities = AMENITY_POOL.filter((_, ai) => seededRandom(rideSeed + ai + 10) > 0.5).slice(0, amenityCount);

      rides.push({
        id: `ride_${route.from}_${route.to}_${i}_${seed}`,
        driver: { ...driver, verified: seededRandom(rideSeed + 11) > 0.2 },
        from: fromC.name, fromAr: fromC.nameAr, fromKey: route.from,
        to:   toC.name,   toAr:   toC.nameAr,   toKey:   route.to,
        fromCoord: nudgeCoord(fromC, rideSeed + 15),
        toCoord:   nudgeCoord(toC,   rideSeed + 16),
        driverCoord: { lat: driverLat, lng: driverLng },
        date: new Date().toLocaleDateString('en-JO', { weekday: 'short', day: '2-digit', month: 'short' }),
        departureTime: times[Math.floor(seededRandom(rideSeed + 20) * times.length)] || '09:00 AM',
        seatsAvailable: Math.max(1, seatsAvail),
        totalSeats,
        pricePerSeat: +(route.price * surgeMul * (1 + (seededRandom(rideSeed + 4) - 0.5) * 0.1)).toFixed(2),
        distanceKm: route.dist,
        durationMin: route.dur,
        genderPref: (['mixed', 'mixed', 'mixed', 'women_only', 'family_only'] as const)[Math.floor(seededRandom(rideSeed + 12) * 5)],
        amenities,
        prayerStop: seededRandom(rideSeed + 13) > 0.4,
        status: seatsAvail <= 1 ? 'nearly_full' : seatsAvail <= totalSeats / 2 ? 'filling' : 'available',
        bookedCount: booked,
        lastActivity: new Date(Date.now() - seededRandom(rideSeed + 14) * 3600000),
        surgeMultiplier: +surgeMul.toFixed(2),
      });
    }
  });

  return rides;
}

function generateUserStats(seed: number): LiveUserStats {
  return {
    totalTrips: 12 + Math.floor(seededRandom(seed) * 3),
    totalSaved: +(156 + seededRandom(seed + 1) * 20).toFixed(2),
    rating: +(4.7 + seededRandom(seed + 2) * 0.25).toFixed(2),
    pkgsDelivered: 5 + Math.floor(seededRandom(seed + 3) * 2),
    walletBalance: +(47.5 + seededRandom(seed + 4) * 5).toFixed(3),
    trustScore: 87 + Math.floor(seededRandom(seed + 5) * 5),
    transactions: generateTransactions(seed),
    recentTrips: generateRecentTrips(seed),
  };
}

function generateTransactions(seed: number): LiveTransaction[] {
  const pool = [
    { type: 'debit'  as const, desc: 'Ride: Amman → Aqaba',   descAr: 'رحلة: عمّان → العقبة',   amount: 8.0,   icon: '🚗' },
    { type: 'credit' as const, desc: 'Wallet top-up',          descAr: 'شحن المحفظة',             amount: 20.0,  icon: '💳' },
    { type: 'credit' as const, desc: 'Package delivery bonus', descAr: 'مكافأة توصيل طرد',        amount: 4.0,   icon: '📦' },
    { type: 'debit'  as const, desc: 'Ride: Amman → Irbid',    descAr: 'رحلة: عمّان → إربد',     amount: 3.0,   icon: '🎓' },
    { type: 'credit' as const, desc: 'Referral bonus',         descAr: 'مكافأة الإحالة',           amount: 5.0,   icon: '🎁' },
    { type: 'debit'  as const, desc: 'Bus: Amman → Dead Sea',  descAr: 'حافلة: عمّان → البحر الميت', amount: 7.0, icon: '🌊' },
    { type: 'credit' as const, desc: 'Trip refund',            descAr: 'استرداد رحلة',             amount: 3.5,   icon: '↩️' },
    { type: 'debit'  as const, desc: 'Wasel Plus subscription',descAr: 'اشتراك واصل بلس',    amount: 12.99, icon: '💎' },
  ];

  return pool.map((t, i) => ({
    id: `tx_${seed}_${i}`,
    ...t,
    amount: +(t.amount * (0.95 + seededRandom(seed + i) * 0.1)).toFixed(3),
    time: new Date(Date.now() - (i + 1) * seededRandom(seed + i + 5) * 86400000 * 2),
    status: i < 6 ? 'completed' as const : 'pending' as const,
  }));
}

function generateRecentTrips(seed: number): LiveRecentTrip[] {
  const pool = [
    { emoji: '🚗', route: 'Amman → Aqaba',    routeAr: 'عمّان → العقبة',      price: 8,    status: 'confirmed'   as const, driverName: 'Ahmad Al-Rashid' },
    { emoji: '📦', route: 'Amman → Irbid',    routeAr: 'عمّان → إربد',        price: 3,    status: 'delivered'   as const, driverName: 'Sara Al-Hassan'  },
    { emoji: '🚌', route: 'Amman → Dead Sea', routeAr: 'عمّان → البحر الميت', price: 7,    status: 'completed'   as const, driverName: 'Wasel Bus'   },
    { emoji: '🚗', route: 'Irbid → Amman',    routeAr: 'إربد → عمّان',        price: 3,    status: 'completed'   as const, driverName: 'Khalid Nasser'   },
    { emoji: '🔄', route: 'Return: Aqaba',    routeAr: 'إرجاع: العقبة',       price: 4,    status: 'in_progress' as const, driverName: 'Faisal Haddad'   },
  ];

  const dates = ['Today', 'Fri 21 Mar', 'Mon 17 Mar', 'Sat 15 Mar', 'Tue 11 Mar'];

  return pool.map((t, i) => ({
    id: `trip_${seed}_${i}`,
    ...t,
    price: +(t.price * (0.95 + seededRandom(seed + i + 20) * 0.1)).toFixed(2),
    date: dates[i] || `${i + 1}d ago`,
  }));
}

function generatePlatformStats(seed: number): LivePlatformStats {
  const hour = new Date().getHours();
  const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 20);
  const base = isPeakHour ? 1.4 : 1.0;

  return {
    activeDrivers: Math.floor((284 + seededRandom(seed) * 40) * base),
    ridesPostedToday: Math.floor(1247 + seededRandom(seed + 1) * 80),
    passengersMatchedToday: Math.floor(3891 + seededRandom(seed + 2) * 200),
    avgWaitMinutes: +(3.2 + seededRandom(seed + 3) * 2.5 / base).toFixed(1),
    topCorridorLoad: Math.floor(62 + seededRandom(seed + 4) * 30),
    liveRevenue: +(8420 + seededRandom(seed + 5) * 500).toFixed(0),
  };
}

// ── Service class ──────────────────────────────────────────────────────────
class LiveDataServiceClass {
  private _seed = Date.now() % 10000;
  private _rides: LiveRide[] = [];
  private _userStats: LiveUserStats | null = null;
  private _platformStats: LivePlatformStats | null = null;
  private _listeners: Map<string, Set<(data: any) => void>> = new Map();
  private _intervals: ReturnType<typeof setInterval>[] = [];
  private _initialized = false;

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Initial data
    this._rides = generateRides(this._seed);
    this._userStats = generateUserStats(this._seed);
    this._platformStats = generatePlatformStats(this._seed);

    // Tick: Update ride seat availability (every 8-15s, one ride at a time)
    this._intervals.push(setInterval(() => {
      if (!this._rides.length) return;
      const idx = Math.floor(Math.random() * this._rides.length);
      const ride = this._rides[idx];

      // Simulate a booking
      if (ride.seatsAvailable > 1 && Math.random() > 0.4) {
        ride.seatsAvailable = Math.max(1, ride.seatsAvailable - 1);
        ride.bookedCount++;
        ride.lastActivity = new Date();
        ride.status = ride.seatsAvailable === 1 ? 'nearly_full' : 'filling';
      }

      this._emit('rides', [...this._rides]);
    }, 9000));

    // Tick: Drift driver coordinates (every 5s)
    this._intervals.push(setInterval(() => {
      this._rides.forEach(ride => {
        const toC = JORDAN_COORDS[ride.toKey];
        const fromC = JORDAN_COORDS[ride.fromKey];
        // Nudge driver toward destination
        const dlat = (toC.lat - ride.driverCoord.lat) * 0.02 + (Math.random() - 0.5) * 0.003;
        const dlng = (toC.lng - ride.driverCoord.lng) * 0.02 + (Math.random() - 0.5) * 0.003;
        ride.driverCoord = {
          lat: ride.driverCoord.lat + dlat,
          lng: ride.driverCoord.lng + dlng,
        };
      });
      this._emit('driver_positions', this._rides.map(r => ({ id: r.id, coord: r.driverCoord })));
    }, 5000));

    // Tick: Platform stats (every 12s)
    this._intervals.push(setInterval(() => {
      if (!this._platformStats) return;
      this._platformStats = {
        ...this._platformStats,
        activeDrivers: Math.max(100, this._platformStats.activeDrivers + Math.floor((Math.random() - 0.3) * 5)),
        ridesPostedToday: this._platformStats.ridesPostedToday + (Math.random() > 0.6 ? 1 : 0),
        passengersMatchedToday: this._platformStats.passengersMatchedToday + Math.floor(Math.random() * 3),
        avgWaitMinutes: +(Math.max(1.5, this._platformStats.avgWaitMinutes + (Math.random() - 0.5) * 0.3)).toFixed(1),
        topCorridorLoad: Math.min(99, Math.max(20, this._platformStats.topCorridorLoad + Math.floor((Math.random() - 0.4) * 4))),
        liveRevenue: this._platformStats.liveRevenue + Math.floor(Math.random() * 15),
      };
      this._emit('platform_stats', { ...this._platformStats });
    }, 12000));

    // Tick: User wallet micro-transactions (every 30s)
    this._intervals.push(setInterval(() => {
      if (!this._userStats) return;
      if (Math.random() > 0.7) {
        const delta = Math.random() > 0.5 ? +(Math.random() * 2).toFixed(3) : -(+(Math.random() * 0.5).toFixed(3));
        this._userStats.walletBalance = +(this._userStats.walletBalance + delta).toFixed(3);
        this._emit('user_stats', { ...this._userStats });
      }
    }, 30000));
  }

  destroy() {
    this._intervals.forEach(clearInterval);
    this._intervals = [];
    this._initialized = false;
    this._listeners.clear();
  }

  private _emit(channel: string, data: any) {
    const listeners = this._listeners.get(channel);
    if (listeners) listeners.forEach(fn => { try { fn(data); } catch {} });
  }

  subscribe<T>(channel: string, callback: (data: T) => void): () => void {
    if (!this._listeners.has(channel)) this._listeners.set(channel, new Set());
    this._listeners.get(channel)!.add(callback as any);
    return () => { this._listeners.get(channel)?.delete(callback as any); };
  }

  // ── Public getters ─────────────────────────────────────────────────────

  getRides(): LiveRide[] {
    return this._rides;
  }

  getUserStats(): LiveUserStats {
    if (!this._userStats) this._userStats = generateUserStats(this._seed);
    return this._userStats!;
  }

  getPlatformStats(): LivePlatformStats {
    if (!this._platformStats) this._platformStats = generatePlatformStats(this._seed);
    return this._platformStats!;
  }

  getRideById(id: string): LiveRide | undefined {
    return this._rides.find(r => r.id === id);
  }

  getRidesByRoute(fromKey: CityKey, toKey: CityKey): LiveRide[] {
    return this._rides.filter(r => r.fromKey === fromKey && r.toKey === toKey);
  }

  /** Simulate booking a seat — returns a fake booking ref */
  async bookSeat(rideId: string, seats: number = 1): Promise<{ ref: string; success: boolean }> {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const ride = this._rides.find(r => r.id === rideId);
    if (ride && ride.seatsAvailable >= seats) {
      ride.seatsAvailable -= seats;
      ride.bookedCount += seats;
      ride.lastActivity = new Date();
      ride.status = ride.seatsAvailable === 0 ? 'nearly_full' : ride.seatsAvailable <= 1 ? 'nearly_full' : 'filling';
      this._emit('rides', [...this._rides]);
      return { ref: `WDM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`, success: true };
    }
    return { ref: '', success: false };
  }

  /** Simulate payment processing */
  async processPayment(amount: number, method: string): Promise<{
    success: boolean;
    transactionId: string;
    receiptRef: string;
    timestamp: Date;
  }> {
    // Simulate gateway delay
    await new Promise(r => setTimeout(r, 800));
    if (Math.random() > 0.05) { // 95% success rate
      const txId = `TXN-${Date.now().toString(36).toUpperCase()}`;
      // Update user wallet if paying from wallet
      if (method === 'wallet' && this._userStats) {
        this._userStats.walletBalance = +(this._userStats.walletBalance - amount).toFixed(3);
        this._emit('user_stats', { ...this._userStats });
      }
      return {
        success: true,
        transactionId: txId,
        receiptRef: `RCP-${Math.floor(Math.random() * 900000 + 100000)}`,
        timestamp: new Date(),
      };
    }
    throw new Error('Payment declined. Please try again.');
  }
}

export const LiveDataService = new LiveDataServiceClass();

// ── React hooks ────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

export function useLiveRides(fromKey?: CityKey, toKey?: CityKey) {
  const [rides, setRides] = useState<LiveRide[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    LiveDataService.init();

    // Simulate network fetch delay
    const t = setTimeout(() => {
      if (!mountedRef.current) return;
      const all = fromKey && toKey
        ? LiveDataService.getRidesByRoute(fromKey, toKey)
        : LiveDataService.getRides();
      setRides(all.length > 0 ? all : LiveDataService.getRides());
      setLoading(false);
    }, 600 + Math.random() * 400);

    const unsub = LiveDataService.subscribe<LiveRide[]>('rides', data => {
      if (!mountedRef.current) return;
      const filtered = fromKey && toKey
        ? data.filter(r => r.fromKey === fromKey && r.toKey === toKey)
        : data;
      setRides(filtered.length > 0 ? filtered : data);
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(t);
      unsub();
    };
  }, [fromKey, toKey]);

  return { rides, loading };
}

export function useLiveUserStats() {
  const [stats, setStats] = useState<LiveUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    LiveDataService.init();

    const t = setTimeout(() => {
      if (!mountedRef.current) return;
      setStats(LiveDataService.getUserStats());
      setLoading(false);
    }, 500 + Math.random() * 300);

    const unsub = LiveDataService.subscribe<LiveUserStats>('user_stats', data => {
      if (mountedRef.current) setStats({ ...data });
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(t);
      unsub();
    };
  }, []);

  return { stats, loading };
}

export function useLivePlatformStats() {
  const [stats, setStats] = useState<LivePlatformStats | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    LiveDataService.init();

    if (mountedRef.current) setStats(LiveDataService.getPlatformStats());

    const unsub = LiveDataService.subscribe<LivePlatformStats>('platform_stats', data => {
      if (mountedRef.current) setStats({ ...data });
    });

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, []);

  return stats;
}
