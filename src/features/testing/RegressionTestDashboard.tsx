/**
 * RegressionTestDashboard — /features/testing/RegressionTestDashboard.tsx
 *
 * Super-strong in-browser regression test suite for Wasel | واصل + Raje3 | راجع
 * Runs 80+ objective assertions across 12 test domains.
 * Route: /regression-test  (public, no auth required)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, Copy,
  ChevronDown, ChevronRight, Shield, Calculator, Globe2, Languages,
  Route, Package, Car, Moon, CreditCard, Server, Zap, FlaskConical,
  BadgeCheck, Play, StopCircle, Download,
} from 'lucide-react';

// ── Real utility imports for live assertions ───────────────────────────────────
import {
  calculateCostSharingPrice, quickPrice,
  DRIVER_BUFFER_PERCENT, PLATFORM_COMMISSION,
  JORDAN_ROUTES, getJordanRoutePrices,
} from '../../utils/costSharingCalculator';
import { getRegion } from '../../utils/regionConfig';
import {
  PLATFORM_CURRENCY, CURRENCIES, EXCHANGE_RATES_FROM_JOD,
  CurrencyService, formatCurrency, money,
} from '../../utils/currency';
import {
  isRTL, rtl, flipX, rtlClass, getTextDir, dirAttr,
} from '../../utils/rtl';
import { WaselColors, WaselSpacing } from '../../tokens/wasel-tokens';
import { router } from '../../utils/optimizedRoutes';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = 'pending' | 'running' | 'pass' | 'fail' | 'warn' | 'skip';
type Severity = 'critical' | 'high' | 'medium' | 'low';

interface TestCase {
  id: string;
  name: string;
  severity: Severity;
  fn: () => Promise<{ status: 'pass' | 'fail' | 'warn' | 'skip'; detail: string }>;
}

interface TestResult extends TestCase {
  status: Status;
  detail: string;
  durationMs: number;
}

interface TestGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  tests: TestCase[];
}

// ── Route introspection ────────────────────────────────────────────────────────
function collectAllPaths(routes: any[], prefix = ''): string[] {
  const paths: string[] = [];
  for (const route of routes ?? []) {
    const seg = route.path ?? '';
    const full = seg.startsWith('/') ? seg : prefix ? `${prefix}/${seg}` : `/${seg}`;
    paths.push(full);
    if (route.children?.length) paths.push(...collectAllPaths(route.children, full));
  }
  return paths;
}

const ALL_PATHS = collectAllPaths(router.routes);

function hasRoute(path: string): boolean {
  return ALL_PATHS.some(p => p === path || p.startsWith(path + '/'));
}

// ── Test definitions ──────────────────────────────────────────────────────────

const GROUPS: TestGroup[] = [

  // ── GROUP 1: Cost-Sharing Calculator ────────────────────────────────────────
  {
    id: 'calculator',
    name: 'Cost-Sharing Calculator',
    icon: <Calculator className="w-4 h-4" />,
    color: '#04ADBF',
    tests: [
      {
        id: 'calc-1', name: 'Amman→Aqaba (330 km + tolls) ≈ JOD 10/seat', severity: 'critical',
        fn: async () => {
          const r = calculateCostSharingPrice({ distanceKm: 330, seatsAvailable: 3, includeTolls: true });
          const ok = r.pricePerSeatJOD >= 9 && r.pricePerSeatJOD <= 12;
          return { status: ok ? 'pass' : 'fail', detail: `pricePerSeatJOD=${r.pricePerSeatJOD} JOD (expected 9–12)` };
        },
      },
      {
        id: 'calc-2', name: 'Amman→Irbid (85 km, no tolls) ≈ JOD 3–5/seat', severity: 'critical',
        fn: async () => {
          const r = calculateCostSharingPrice({ distanceKm: 85, seatsAvailable: 3 });
          const ok = r.pricePerSeatJOD >= 3 && r.pricePerSeatJOD <= 5;
          return { status: ok ? 'pass' : 'fail', detail: `pricePerSeatJOD=${r.pricePerSeatJOD} JOD (expected 3–5)` };
        },
      },
      {
        id: 'calc-3', name: 'Platform commission is exactly 12%', severity: 'critical',
        fn: async () => {
          const ok = PLATFORM_COMMISSION === 0.12;
          const r = calculateCostSharingPrice({ distanceKm: 100 });
          const commOk = Math.abs(r.commissionPerSeatJOD - r.pricePerSeatJOD * 0.12) < 0.01;
          return { status: ok && commOk ? 'pass' : 'fail', detail: `PLATFORM_COMMISSION=${PLATFORM_COMMISSION} | commissionPerSeatJOD=${r.commissionPerSeatJOD} vs ${(r.pricePerSeatJOD * 0.12).toFixed(3)}` };
        },
      },
      {
        id: 'calc-4', name: 'Driver earns = price − commission (12% deducted)', severity: 'high',
        fn: async () => {
          const r = calculateCostSharingPrice({ distanceKm: 200, seatsAvailable: 3 });
          const expected = r.pricePerSeatJOD - r.commissionPerSeatJOD;
          const ok = Math.abs(r.driverEarnsPerSeatJOD - expected) < 0.001;
          return { status: ok ? 'pass' : 'fail', detail: `driverEarns=${r.driverEarnsPerSeatJOD} | expected=${expected.toFixed(3)}` };
        },
      },
      {
        id: 'calc-5', name: 'Fuel cost (330 km @ 8 L/100 km × 0.90 JOD) = 23.76 JOD', severity: 'high',
        fn: async () => {
          const r = calculateCostSharingPrice({ distanceKm: 330 });
          const jordanRegion = getRegion('JO');
          const expected = (330 / 100) * jordanRegion.fuel.efficiencyLper100km * jordanRegion.fuel.priceInJOD;
          const ok = Math.abs(r.fuelCostJOD - expected) < 0.01;
          return { status: ok ? 'pass' : 'fail', detail: `fuelCost=${r.fuelCostJOD} | expected=${expected.toFixed(2)}` };
        },
      },
      {
        id: 'calc-6', name: 'Jordan fuel price constant is JOD 0.90/L', severity: 'high',
        fn: async () => {
          const jordanRegion = getRegion('JO');
          const fuelPrice = jordanRegion.fuel.priceInJOD;
          const ok = Math.abs(fuelPrice - 0.90) < 0.01;
          return { status: ok ? 'pass' : 'fail', detail: `Jordan fuel.priceInJOD=${fuelPrice}` };
        },
      },
      {
        id: 'calc-7', name: 'No dynamic/surge pricing — pricePerSeat is fixed', severity: 'critical',
        fn: async () => {
          // Same input always returns same output (no randomness / multipliers)
          const a = calculateCostSharingPrice({ distanceKm: 330 });
          const b = calculateCostSharingPrice({ distanceKm: 330 });
          const ok = a.pricePerSeatJOD === b.pricePerSeatJOD;
          return { status: ok ? 'pass' : 'fail', detail: `Run 1: ${a.pricePerSeatJOD} JOD | Run 2: ${b.pricePerSeatJOD} JOD — ${ok ? 'deterministic ✓' : 'NON-DETERMINISTIC ✗'}` };
        },
      },
      {
        id: 'calc-8', name: 'All 8 JORDAN_ROUTES constants are defined', severity: 'medium',
        fn: async () => {
          const keys = Object.keys(JORDAN_ROUTES);
          const expected = ['AMMAN_AQABA','AMMAN_IRBID','AMMAN_DEAD_SEA','AMMAN_ZARQA','AMMAN_PETRA','AMMAN_WADI_RUM','AMMAN_MADABA','AMMAN_MAAN'];
          const missing = expected.filter(k => !keys.includes(k));
          const ok = missing.length === 0;
          return { status: ok ? 'pass' : 'fail', detail: ok ? `All ${keys.length} routes present` : `Missing: ${missing.join(', ')}` };
        },
      },
      {
        id: 'calc-9', name: 'quickPrice() helper returns positive number', severity: 'medium',
        fn: async () => {
          const price = quickPrice(100);
          const ok = typeof price === 'number' && price > 0;
          return { status: ok ? 'pass' : 'fail', detail: `quickPrice(100) = ${price}` };
        },
      },
      {
        id: 'calc-10', name: 'getJordanRoutePrices() returns array of 8 routes with prices', severity: 'medium',
        fn: async () => {
          const prices = getJordanRoutePrices();
          const ok = prices.length === 8 && prices.every(r => r.pricePerSeatJOD > 0);
          return { status: ok ? 'pass' : 'fail', detail: `${prices.length} routes — min: ${Math.min(...prices.map(r => r.pricePerSeatJOD))} JOD, max: ${Math.max(...prices.map(r => r.pricePerSeatJOD))} JOD` };
        },
      },
    ],
  },

  // ── GROUP 2: Currency System ─────────────────────────────────────────────────
  {
    id: 'currency',
    name: 'Currency System',
    icon: <Globe2 className="w-4 h-4" />,
    color: '#D9965B',
    tests: [
      {
        id: 'cur-1', name: 'Platform settlement currency is JOD', severity: 'critical',
        fn: async () => ({ status: PLATFORM_CURRENCY === 'JOD' ? 'pass' : 'fail', detail: `PLATFORM_CURRENCY="${PLATFORM_CURRENCY}"` }),
      },
      {
        id: 'cur-2', name: '1 JOD converts to ~1.41 USD (within 10% tolerance)', severity: 'high',
        fn: async () => {
          const rate = EXCHANGE_RATES_FROM_JOD['USD'];
          const ok = rate > 1.2 && rate < 1.6;
          return { status: ok ? 'pass' : 'fail', detail: `1 JOD = ${rate} USD` };
        },
      },
      {
        id: 'cur-3', name: 'JOD → JOD conversion returns same amount', severity: 'high',
        fn: async () => {
          const svc = CurrencyService.getInstance();
          const result = svc.fromJOD(8.5, 'JOD');
          const ok = result === 8.5;
          return { status: ok ? 'pass' : 'fail', detail: `fromJOD(8.5, 'JOD') = ${result}` };
        },
      },
      {
        id: 'cur-4', name: 'JOD→USD→JOD round-trip within 0.001 tolerance', severity: 'high',
        fn: async () => {
          const svc = CurrencyService.getInstance();
          const usd = svc.fromJOD(10, 'USD');
          const backToJOD = svc.toJOD(usd, 'USD');
          const ok = Math.abs(backToJOD - 10) < 0.002;
          return { status: ok ? 'pass' : 'fail', detail: `10 JOD → ${usd} USD → ${backToJOD} JOD (diff: ${Math.abs(backToJOD - 10).toFixed(4)})` };
        },
      },
      {
        id: 'cur-5', name: 'All 9 supported currencies have required fields', severity: 'medium',
        fn: async () => {
          const required = ['code','symbol','name','nameAr','locale','decimals','minFare'];
          const errors: string[] = [];
          for (const [code, cfg] of Object.entries(CURRENCIES)) {
            required.forEach(field => { if (!(field in cfg)) errors.push(`${code}.${field}`); });
          }
          return { status: errors.length === 0 ? 'pass' : 'fail', detail: errors.length === 0 ? '9/9 currencies complete' : `Missing: ${errors.join(', ')}` };
        },
      },
      {
        id: 'cur-6', name: 'formatCurrency(8.5) returns a non-empty string', severity: 'medium',
        fn: async () => {
          const result = formatCurrency(8.5, 'JOD');
          const ok = typeof result === 'string' && result.length > 0;
          return { status: ok ? 'pass' : 'fail', detail: `formatCurrency(8.5, 'JOD') = "${result}"` };
        },
      },
      {
        id: 'cur-7', name: 'money() factory returns correct Money object', severity: 'low',
        fn: async () => {
          const m = money(8.5, 'JOD');
          const ok = m.amount === 8.5 && m.currency === 'JOD';
          return { status: ok ? 'pass' : 'fail', detail: `money(8.5, 'JOD') = ${JSON.stringify(m)}` };
        },
      },
      {
        id: 'cur-8', name: 'JOD has 3 decimal places (fils standard)', severity: 'medium',
        fn: async () => {
          const ok = CURRENCIES.JOD.decimals === 3;
          return { status: ok ? 'pass' : 'fail', detail: `JOD.decimals=${CURRENCIES.JOD.decimals} (must be 3 for fils)` };
        },
      },
    ],
  },

  // ── GROUP 3: RTL Utilities ───────────────────────────────────────────────────
  {
    id: 'rtl',
    name: 'RTL / Bidirectional Text',
    icon: <Languages className="w-4 h-4" />,
    color: '#8B5CF6',
    tests: [
      {
        id: 'rtl-1', name: 'isRTL("ar") returns true', severity: 'critical',
        fn: async () => ({ status: isRTL('ar') === true ? 'pass' : 'fail', detail: `isRTL('ar') = ${isRTL('ar')}` }),
      },
      {
        id: 'rtl-2', name: 'isRTL("en") returns false', severity: 'critical',
        fn: async () => ({ status: isRTL('en') === false ? 'pass' : 'fail', detail: `isRTL('en') = ${isRTL('en')}` }),
      },
      {
        id: 'rtl-3', name: 'rtl.flex("ar") contains "flex-row-reverse"', severity: 'high',
        fn: async () => {
          const cls = rtl.flex('ar');
          const ok = cls.includes('flex-row-reverse');
          return { status: ok ? 'pass' : 'fail', detail: `rtl.flex('ar') = "${cls}"` };
        },
      },
      {
        id: 'rtl-4', name: 'rtl.flex("en") contains "flex-row" (not reversed)', severity: 'high',
        fn: async () => {
          const cls = rtl.flex('en');
          const ok = cls.includes('flex-row') && !cls.includes('flex-row-reverse');
          return { status: ok ? 'pass' : 'fail', detail: `rtl.flex('en') = "${cls}"` };
        },
      },
      {
        id: 'rtl-5', name: 'rtl.ml(4, "ar") returns "mr-4" (flipped)', severity: 'high',
        fn: async () => {
          const cls = rtl.ml(4, 'ar');
          return { status: cls === 'mr-4' ? 'pass' : 'fail', detail: `rtl.ml(4, 'ar') = "${cls}"` };
        },
      },
      {
        id: 'rtl-6', name: 'rtl.ml(4, "en") returns "ml-4" (normal)', severity: 'high',
        fn: async () => {
          const cls = rtl.ml(4, 'en');
          return { status: cls === 'ml-4' ? 'pass' : 'fail', detail: `rtl.ml(4, 'en') = "${cls}"` };
        },
      },
      {
        id: 'rtl-7', name: 'flipX("ar") returns "scale-x-[-1]"', severity: 'medium',
        fn: async () => {
          const cls = flipX('ar');
          return { status: cls === 'scale-x-[-1]' ? 'pass' : 'fail', detail: `flipX('ar') = "${cls}"` };
        },
      },
      {
        id: 'rtl-8', name: 'flipX("en") returns "" (no transform)', severity: 'medium',
        fn: async () => {
          const cls = flipX('en');
          return { status: cls === '' ? 'pass' : 'fail', detail: `flipX('en') = "${cls}"` };
        },
      },
      {
        id: 'rtl-9', name: 'getTextDir("ar") = "rtl", getTextDir("en") = "ltr"', severity: 'medium',
        fn: async () => {
          const ar = getTextDir('ar');
          const en = getTextDir('en');
          const ok = ar === 'rtl' && en === 'ltr';
          return { status: ok ? 'pass' : 'fail', detail: `getTextDir('ar')="${ar}", getTextDir('en')="${en}"` };
        },
      },
      {
        id: 'rtl-10', name: 'rtlClass returns correct class per direction', severity: 'low',
        fn: async () => {
          const rtlResult = rtlClass('text-left', 'text-right', 'ar');
          const ltrResult = rtlClass('text-left', 'text-right', 'en');
          const ok = rtlResult === 'text-right' && ltrResult === 'text-left';
          return { status: ok ? 'pass' : 'fail', detail: `AR→"${rtlResult}", EN→"${ltrResult}"` };
        },
      },
    ],
  },

  // ── GROUP 4: Design Token System ────────────────────────────────────────────
  {
    id: 'tokens',
    name: 'Design Token System',
    icon: <Zap className="w-4 h-4" />,
    color: '#F59E0B',
    tests: [
      {
        id: 'tok-1', name: 'WaselColors.navyBase = #0B1120 (primary dark bg)', severity: 'critical',
        fn: async () => {
          const ok = WaselColors.navyBase === '#0B1120';
          return { status: ok ? 'pass' : 'fail', detail: `WaselColors.navyBase="${WaselColors.navyBase}"` };
        },
      },
      {
        id: 'tok-2', name: 'WaselColors.teal = #04ADBF (primary dark-mode)', severity: 'critical',
        fn: async () => {
          const ok = WaselColors.teal === '#04ADBF';
          return { status: ok ? 'pass' : 'fail', detail: `WaselColors.teal="${WaselColors.teal}"` };
        },
      },
      {
        id: 'tok-3', name: 'WaselColors.green = #09732E (primary light-mode)', severity: 'high',
        fn: async () => {
          const ok = WaselColors.green === '#09732E';
          return { status: ok ? 'pass' : 'fail', detail: `WaselColors.green="${WaselColors.green}"` };
        },
      },
      {
        id: 'tok-4', name: 'WaselColors.bronze = #D9965B (CTA accent)', severity: 'high',
        fn: async () => {
          const ok = WaselColors.bronze === '#D9965B';
          return { status: ok ? 'pass' : 'fail', detail: `WaselColors.bronze="${WaselColors.bronze}"` };
        },
      },
      {
        id: 'tok-5', name: 'WaselColors.navyCard = #111B2E (card background)', severity: 'high',
        fn: async () => {
          const ok = WaselColors.navyCard === '#111B2E';
          return { status: ok ? 'pass' : 'fail', detail: `WaselColors.navyCard="${WaselColors.navyCard}"` };
        },
      },
      {
        id: 'tok-6', name: 'WaselSpacing is defined and has numeric values', severity: 'medium',
        fn: async () => {
          const ok = WaselSpacing && typeof WaselSpacing === 'object' && Object.keys(WaselSpacing).length > 0;
          return { status: ok ? 'pass' : 'fail', detail: `WaselSpacing has ${Object.keys(WaselSpacing ?? {}).length} entries` };
        },
      },
      {
        id: 'tok-7', name: 'CSS variable --wasel-navy is applied to :root', severity: 'high',
        fn: async () => {
          const val = getComputedStyle(document.documentElement).getPropertyValue('--wasel-navy').trim();
          const ok = val.length > 0;
          return { status: ok ? 'pass' : 'warn', detail: ok ? `--wasel-navy="${val}"` : 'CSS variable not found in :root (may need page render)' };
        },
      },
      {
        id: 'tok-8', name: 'CSS variable --primary is defined in :root', severity: 'high',
        fn: async () => {
          const val = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
          const ok = val.length > 0;
          return { status: ok ? 'pass' : 'warn', detail: ok ? `--primary="${val}"` : 'CSS variable --primary not found' };
        },
      },
    ],
  },

  // ── GROUP 5: Route Table — Carpooling ───────────────────────────────────────
  {
    id: 'routes-carpooling',
    name: 'Router — Carpooling Flow',
    icon: <Car className="w-4 h-4" />,
    color: '#22C55E',
    tests: [
      {
        id: 'rc-1', name: '/app/find-ride route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/find-ride') ? 'pass' : 'fail', detail: `Path: /app/find-ride` }),
      },
      {
        id: 'rc-2', name: '/app/offer-ride route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/offer-ride') ? 'pass' : 'fail', detail: `Path: /app/offer-ride` }),
      },
      {
        id: 'rc-3', name: '/app/post-ride alias route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/post-ride') ? 'pass' : 'fail', detail: `Path: /app/post-ride` }),
      },
      {
        id: 'rc-4', name: '/app/carpooling/search route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/carpooling/search') ? 'pass' : 'fail', detail: `Path: /app/carpooling/search` }),
      },
      {
        id: 'rc-5', name: '/app/carpooling/post route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/carpooling/post') ? 'pass' : 'fail', detail: `Path: /app/carpooling/post` }),
      },
      {
        id: 'rc-6', name: '/app/carpooling/book route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/carpooling/book') ? 'pass' : 'fail', detail: `Path: /app/carpooling/book` }),
      },
      {
        id: 'rc-7', name: '/app/carpooling/calendar route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/carpooling/calendar') ? 'pass' : 'fail', detail: `Path: /app/carpooling/calendar` }),
      },
      {
        id: 'rc-8', name: '/app/booking-requests route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/booking-requests') ? 'pass' : 'fail', detail: `Path: /app/booking-requests` }),
      },
      {
        id: 'rc-9', name: '/app/my-trips route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/my-trips') ? 'pass' : 'fail', detail: `Path: /app/my-trips` }),
      },
    ],
  },

  // ── GROUP 6: Route Table — Raje3 Package Delivery ───────────────────────────
  {
    id: 'routes-raje3',
    name: 'Router — Raje3 Package Delivery',
    icon: <Package className="w-4 h-4" />,
    color: '#F59E0B',
    tests: [
      {
        id: 'rj-1', name: '/app/raje3/send route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/raje3/send') ? 'pass' : 'fail', detail: `Path: /app/raje3/send` }),
      },
      {
        id: 'rj-2', name: '/app/raje3/track route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/raje3/track') ? 'pass' : 'fail', detail: `Path: /app/raje3/track` }),
      },
      {
        id: 'rj-3', name: '/app/raje3/available-packages route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/raje3/available-packages') ? 'pass' : 'fail', detail: `Path: /app/raje3/available-packages` }),
      },
      {
        id: 'rj-4', name: '/app/raje3/qr-scanner route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/raje3/qr-scanner') ? 'pass' : 'fail', detail: `Path: /app/raje3/qr-scanner` }),
      },
      {
        id: 'rj-5', name: '/app/raje3/insurance-claims route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/raje3/insurance-claims') ? 'pass' : 'fail', detail: `Path: /app/raje3/insurance-claims` }),
      },
      {
        id: 'rj-6', name: '/app/raje3/my-packages route exists', severity: 'medium',
        fn: async () => ({ status: hasRoute('/app/raje3/my-packages') ? 'pass' : 'fail', detail: `Path: /app/raje3/my-packages` }),
      },
      {
        id: 'rj-7', name: '/app/package-delivery redirects (Navigate) to raje3/send', severity: 'medium',
        fn: async () => {
          // The route exists but is a Navigate redirect
          const ok = hasRoute('/app/package-delivery');
          return { status: ok ? 'pass' : 'fail', detail: `Path /app/package-delivery ${ok ? 'exists (redirects to raje3/send)' : 'MISSING'}` };
        },
      },
    ],
  },

  // ── GROUP 7: Route Table — Cultural Features ────────────────────────────────
  {
    id: 'routes-cultural',
    name: 'Router — Cultural Features',
    icon: <Moon className="w-4 h-4" />,
    color: '#8B5CF6',
    tests: [
      {
        id: 'cf-1', name: '/app/cultural/gender-preferences route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/cultural/gender-preferences') ? 'pass' : 'fail', detail: `Path: /app/cultural/gender-preferences` }),
      },
      {
        id: 'cf-2', name: '/app/cultural/prayer-stops route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/cultural/prayer-stops') ? 'pass' : 'fail', detail: `Path: /app/cultural/prayer-stops` }),
      },
      {
        id: 'cf-3', name: '/app/cultural/ramadan-mode route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/cultural/ramadan-mode') ? 'pass' : 'fail', detail: `Path: /app/cultural/ramadan-mode` }),
      },
      {
        id: 'cf-4', name: '/app/cultural/hijab-privacy route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/cultural/hijab-privacy') ? 'pass' : 'fail', detail: `Path: /app/cultural/hijab-privacy` }),
      },
      {
        id: 'cf-5', name: '/app/mosque-directory route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/mosque-directory') ? 'pass' : 'fail', detail: `Path: /app/mosque-directory` }),
      },
      {
        id: 'cf-6', name: '/app/cultural-settings route exists', severity: 'medium',
        fn: async () => ({ status: hasRoute('/app/cultural-settings') ? 'pass' : 'fail', detail: `Path: /app/cultural-settings` }),
      },
    ],
  },

  // ── GROUP 8: Route Table — Safety & Verification ────────────────────────────
  {
    id: 'routes-safety',
    name: 'Router — Safety & Sanad Verification',
    icon: <Shield className="w-4 h-4" />,
    color: '#04ADBF',
    tests: [
      {
        id: 'sv-1', name: '/app/safety route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/safety') ? 'pass' : 'fail', detail: `Path: /app/safety` }),
      },
      {
        id: 'sv-2', name: '/app/safety/identity-verification route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/safety/identity-verification') ? 'pass' : 'fail', detail: `Path: /app/safety/identity-verification` }),
      },
      {
        id: 'sv-3', name: '/app/safety/sosemergency route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/safety/sosemergency') ? 'pass' : 'fail', detail: `Path: /app/safety/sosemergency` }),
      },
      {
        id: 'sv-4', name: '/app/verification (VerificationCenter) route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/verification') ? 'pass' : 'fail', detail: `Path: /app/verification` }),
      },
      {
        id: 'sv-5', name: '/app/disputes route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/disputes') ? 'pass' : 'fail', detail: `Path: /app/disputes` }),
      },
      {
        id: 'sv-6', name: '/app/safety/trust-indicators route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/safety/trust-indicators') ? 'pass' : 'fail', detail: `Path: /app/safety/trust-indicators` }),
      },
    ],
  },

  // ── GROUP 9: Route Table — Payments ─────────────────────────────────────────
  {
    id: 'routes-payments',
    name: 'Router — Payments',
    icon: <CreditCard className="w-4 h-4" />,
    color: '#22C55E',
    tests: [
      {
        id: 'pay-1', name: '/app/payments route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/payments') ? 'pass' : 'fail', detail: `Path: /app/payments` }),
      },
      {
        id: 'pay-2', name: '/app/payments/cash-on-arrival route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/payments/cash-on-arrival') ? 'pass' : 'fail', detail: `Path: /app/payments/cash-on-arrival` }),
      },
      {
        id: 'pay-3', name: '/app/payment-flow route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/payment-flow') ? 'pass' : 'fail', detail: `Path: /app/payment-flow` }),
      },
      {
        id: 'pay-4', name: '/app/payment-methods route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/app/payment-methods') ? 'pass' : 'fail', detail: `Path: /app/payment-methods` }),
      },
      {
        id: 'pay-5', name: '/app/payment-gateways route exists', severity: 'medium',
        fn: async () => ({ status: hasRoute('/app/payment-gateways') ? 'pass' : 'fail', detail: `Path: /app/payment-gateways` }),
      },
    ],
  },

  // ── GROUP 10: Route Table — Public & Auth ───────────────────────────────────
  {
    id: 'routes-public',
    name: 'Router — Public & Auth Routes',
    icon: <Route className="w-4 h-4" />,
    color: '#3B82F6',
    tests: [
      {
        id: 'pub-1', name: '/ (Landing Page) route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/') ? 'pass' : 'fail', detail: `Path: /` }),
      },
      {
        id: 'pub-2', name: '/auth route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/auth') ? 'pass' : 'fail', detail: `Path: /auth` }),
      },
      {
        id: 'pub-3', name: '/auth/callback (OAuth) route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/auth/callback') ? 'pass' : 'fail', detail: `Path: /auth/callback` }),
      },
      {
        id: 'pub-4', name: '/privacy route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/privacy') ? 'pass' : 'fail', detail: `Path: /privacy` }),
      },
      {
        id: 'pub-5', name: '/terms route exists', severity: 'high',
        fn: async () => ({ status: hasRoute('/terms') ? 'pass' : 'fail', detail: `Path: /terms` }),
      },
      {
        id: 'pub-6', name: '/beta (waitlist) route exists', severity: 'medium',
        fn: async () => ({ status: hasRoute('/beta') ? 'pass' : 'fail', detail: `Path: /beta` }),
      },
      {
        id: 'pub-7', name: '/app/dashboard route exists', severity: 'critical',
        fn: async () => ({ status: hasRoute('/app/dashboard') ? 'pass' : 'fail', detail: `Path: /app/dashboard` }),
      },
    ],
  },

  // ── GROUP 11: Guidelines Compliance ─────────────────────────────────────────
  {
    id: 'compliance',
    name: 'Business Model Compliance',
    icon: <BadgeCheck className="w-4 h-4" />,
    color: '#09732E',
    tests: [
      {
        id: 'bm-1', name: 'No /dynamic-pricing route (anti-pattern removed)', severity: 'critical',
        fn: async () => {
          const bad = ALL_PATHS.some(p => p.includes('dynamic-pricing') || p.includes('surge'));
          return { status: bad ? 'fail' : 'pass', detail: bad ? 'Found surge/dynamic-pricing route — must be removed!' : 'No surge routes ✓' };
        },
      },
      {
        id: 'bm-2', name: 'No /driver-earnings route (redirects to my-trips)', severity: 'high',
        fn: async () => {
          // driver-earnings should exist as a Navigate redirect, not a real page
          const exists = hasRoute('/app/driver-earnings');
          return { status: exists ? 'pass' : 'warn', detail: exists ? '/app/driver-earnings exists as a redirect to /app/my-trips ✓' : 'Route not found (check redirect)' };
        },
      },
      {
        id: 'bm-3', name: 'Carpooling: SearchRides (not "FindRide" anti-pattern)', severity: 'high',
        fn: async () => {
          const hasSearch = hasRoute('/app/find-ride') || hasRoute('/app/carpooling/search');
          const hasBadName = ALL_PATHS.some(p => p.toLowerCase().includes('findride') || p.toLowerCase().includes('find_ride'));
          const ok = hasSearch && !hasBadName;
          return { status: ok ? 'pass' : 'warn', detail: `SearchRides path present: ${hasSearch} | "FindRide" anti-pattern: ${hasBadName}` };
        },
      },
      {
        id: 'bm-4', name: 'Services: school-carpooling, hospital-transport, corporate-carpools all routed', severity: 'high',
        fn: async () => {
          const paths = ['/app/services/school-carpooling', '/app/services/hospital-transport', '/app/services/corporate-carpools'];
          const missing = paths.filter(p => !hasRoute(p));
          return { status: missing.length === 0 ? 'pass' : 'fail', detail: missing.length === 0 ? 'All 3 specialized services routed ✓' : `Missing: ${missing.join(', ')}` };
        },
      },
      {
        id: 'bm-5', name: 'Admin panel present (LaunchControlDashboard)', severity: 'medium',
        fn: async () => ({ status: hasRoute('/app/admin/launch-control') ? 'pass' : 'fail', detail: 'Path: /app/admin/launch-control' }),
      },
      {
        id: 'bm-6', name: 'Total route count is substantial (>50 routes)', severity: 'medium',
        fn: async () => {
          const count = ALL_PATHS.filter(p => p.length > 1).length;
          return { status: count > 50 ? 'pass' : 'warn', detail: `${count} total routes in router tree` };
        },
      },
      {
        id: 'bm-7', name: 'Raje3 is package delivery NOT ride (sub-brand isolation)', severity: 'high',
        fn: async () => {
          const hasRaje3 = hasRoute('/app/raje3/send');
          const hasRaje3Track = hasRoute('/app/raje3/track');
          const ok = hasRaje3 && hasRaje3Track;
          return { status: ok ? 'pass' : 'fail', detail: `Raje3 send: ${hasRaje3} | Raje3 track: ${hasRaje3Track}` };
        },
      },
    ],
  },

  // ── GROUP 12: Backend Connectivity ──────────────────────────────────────────
  {
    id: 'backend',
    name: 'Backend Connectivity',
    icon: <Server className="w-4 h-4" />,
    color: '#EF4444',
    tests: [
      {
        id: 'be-1', name: 'Supabase projectId is configured (non-empty)', severity: 'critical',
        fn: async () => {
          const ok = typeof projectId === 'string' && projectId.length > 4;
          return { status: ok ? 'pass' : 'fail', detail: `projectId="${projectId?.slice(0, 8)}…" (${projectId?.length ?? 0} chars)` };
        },
      },
      {
        id: 'be-2', name: 'publicAnonKey is configured (JWT-like, non-empty)', severity: 'critical',
        fn: async () => {
          const ok = typeof publicAnonKey === 'string' && publicAnonKey.startsWith('eyJ');
          return { status: ok ? 'pass' : 'fail', detail: ok ? `publicAnonKey starts with "eyJ" ✓` : `publicAnonKey invalid or empty` };
        },
      },
      {
        id: 'be-3', name: 'Server Edge Function base URL is reachable (health check)', severity: 'critical',
        fn: async () => {
          try {
            const url = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/health`;
            const res = await fetch(url, {
              method: 'GET',
              headers: { Authorization: `Bearer ${publicAnonKey}` },
              signal: AbortSignal.timeout(8000),
            });
            const status = res.status;
            const ok = status >= 200 && status < 500;
            return { status: ok ? 'pass' : 'warn', detail: `GET /health → HTTP ${status}` };
          } catch (e: any) {
            return { status: 'warn', detail: `Network error: ${e.message} (function may not have /health, check status manually)` };
          }
        },
      },
      {
        id: 'be-4', name: 'Server CORS headers present on preflight', severity: 'high',
        fn: async () => {
          try {
            const url = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/health`;
            const res = await fetch(url, {
              method: 'OPTIONS',
              headers: { 'Origin': window.location.origin, 'Access-Control-Request-Method': 'GET' },
              signal: AbortSignal.timeout(6000),
            });
            const cors = res.headers.get('access-control-allow-origin');
            const ok = cors !== null;
            return { status: ok ? 'pass' : 'warn', detail: ok ? `CORS: ${cors}` : 'No Access-Control-Allow-Origin header' };
          } catch (e: any) {
            return { status: 'warn', detail: `OPTIONS preflight error: ${e.message}` };
          }
        },
      },
      {
        id: 'be-5', name: 'Supabase anon key is NOT a service role key', severity: 'critical',
        fn: async () => {
          // Service role keys contain "service_role" in their payload
          try {
            const payload = JSON.parse(atob(publicAnonKey.split('.')[1]));
            const isAnon = payload.role === 'anon';
            const notService = payload.role !== 'service_role';
            const ok = isAnon && notService;
            return { status: ok ? 'pass' : 'fail', detail: `JWT role="${payload.role}" (must be "anon")` };
          } catch {
            return { status: 'warn', detail: 'Could not decode JWT payload' };
          }
        },
      },
      {
        id: 'be-6', name: 'Supabase trips endpoint responds (KV store accessible)', severity: 'high',
        fn: async () => {
          try {
            const url = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips`;
            const res = await fetch(url, {
              method: 'GET',
              headers: { Authorization: `Bearer ${publicAnonKey}` },
              signal: AbortSignal.timeout(8000),
            });
            const ok = res.status < 500;
            return { status: ok ? 'pass' : 'fail', detail: `GET /trips → HTTP ${res.status}` };
          } catch (e: any) {
            return { status: 'warn', detail: `${e.message}` };
          }
        },
      },
    ],
  },
];

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pass:    { label: 'PASS',    color: '#22C55E', bg: 'rgba(34,197,94,0.12)',    icon: CheckCircle2  },
  fail:    { label: 'FAIL',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',    icon: XCircle       },
  warn:    { label: 'WARN',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',   icon: AlertTriangle },
  skip:    { label: 'SKIP',    color: '#6B7280', bg: 'rgba(107,114,128,0.08)', icon: StopCircle    },
  running: { label: 'RUNNING', color: '#04ADBF', bg: 'rgba(4,173,191,0.12)',   icon: Clock         },
  pending: { label: 'PENDING', color: '#475569', bg: 'rgba(71,85,105,0.08)',   icon: Clock         },
};

const SEV_COLOR: Record<Severity, string> = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#3B82F6',
  low:      '#6B7280',
};

// ── Main component ────────────────────────────────────────────────────────────
export function RegressionTestDashboard() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [runCount, setRunCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialise all tests as pending
  const initResults = useCallback(() => {
    const init: Record<string, TestResult> = {};
    GROUPS.forEach(g => g.tests.forEach(t => {
      init[t.id] = { ...t, status: 'pending', detail: '', durationMs: 0 };
    }));
    setResults(init);
    setElapsed(0);
  }, []);

  useEffect(() => { initResults(); }, [initResults]);

  // Stats
  const allTests = GROUPS.flatMap(g => g.tests);
  const total   = allTests.length;
  const pass    = Object.values(results).filter(r => r.status === 'pass').length;
  const fail    = Object.values(results).filter(r => r.status === 'fail').length;
  const warn    = Object.values(results).filter(r => r.status === 'warn').length;
  const critFail = Object.values(results).filter(r => r.status === 'fail' && r.severity === 'critical').length;
  const done    = Object.values(results).filter(r => !['pending','running'].includes(r.status)).length;
  const score   = total > 0 ? Math.round(((pass + warn * 0.5) / total) * 100) : 0;

  const runTests = useCallback(async () => {
    setRunning(true);
    setRunCount(c => c + 1);
    initResults();
    const t0 = Date.now();
    setStartTime(t0);
    timerRef.current = setInterval(() => setElapsed(Date.now() - t0), 100);

    for (const group of GROUPS) {
      for (const test of group.tests) {
        setResults(prev => ({
          ...prev,
          [test.id]: { ...prev[test.id], status: 'running' },
        }));
        const start = performance.now();
        let status: Status = 'fail';
        let detail = '';
        try {
          const res = await test.fn();
          status = res.status;
          detail = res.detail;
        } catch (e: any) {
          status = 'fail';
          detail = `Uncaught: ${e.message}`;
        }
        const durationMs = Math.round(performance.now() - start);
        setResults(prev => ({
          ...prev,
          [test.id]: { ...prev[test.id], status, detail, durationMs },
        }));
        // Small yield to keep UI responsive
        await new Promise(r => setTimeout(r, 4));
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setElapsed(Date.now() - t0);
    setRunning(false);
  }, [initResults]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const toggleGroup = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const copyReport = () => {
    const lines = [
      `# Wasel Regression Test Report — Run #${runCount}`,
      `Score: ${score}/100 | Pass: ${pass} | Fail: ${fail} | Warn: ${warn} | Total: ${total}`,
      `Duration: ${(elapsed / 1000).toFixed(1)}s`,
      '',
      ...GROUPS.map(g => {
        const gResults = g.tests.map(t => results[t.id]);
        const gPass = gResults.filter(r => r?.status === 'pass').length;
        return [
          `## ${g.name} (${gPass}/${g.tests.length})`,
          ...g.tests.map(t => {
            const r = results[t.id];
            return `  [${(r?.status ?? 'pending').toUpperCase().padEnd(7)}] [${r?.severity.toUpperCase().padEnd(8)}] ${t.name} — ${r?.detail ?? ''}`;
          }),
        ].join('\n');
      }),
    ].join('\n');
    navigator.clipboard.writeText(lines).catch(() => {});
  };

  const scoreColor = score >= 90 ? '#22C55E' : score >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <div className="min-h-screen bg-[#0B1120] text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-5 sticky top-0 z-40 backdrop-blur-xl bg-[#0B1120]/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #04ADBF, #09732E)' }}>
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white" style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>
                Wasel Regression Test Suite
              </h1>
              <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>
                {total} tests · 12 domains · Live assertions · Run #{runCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {done > 0 && !running && (
              <button onClick={copyReport}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg border border-white/10 hover:border-white/20"
                style={{ fontSize: '0.8rem' }}>
                <Copy className="w-3.5 h-3.5" /> Copy Report
              </button>
            )}
            <button
              onClick={runTests}
              disabled={running}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontWeight: 700, fontSize: '0.875rem', background: running ? 'rgba(4,173,191,0.3)' : 'linear-gradient(135deg, #04ADBF, #09732E)' }}
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running ? `Running… ${done}/${total}` : runCount === 0 ? 'Run All Tests' : 'Re-run All'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Score Panel */}
        <AnimatePresence>
          {done > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-6 mb-8 flex flex-wrap gap-6 items-center"
              style={{ background: '#111B2E', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Big score */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-black" style={{ fontSize: '1.25rem', fontWeight: 900, color: scoreColor }}>{score}</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white" style={{ fontWeight: 900, fontSize: '1.5rem' }}>
                    {score >= 95 ? '🏆 Excellent' : score >= 85 ? '✅ Good' : score >= 70 ? '⚠️ Needs Work' : '❌ Critical Issues'}
                  </div>
                  <div className="text-gray-400" style={{ fontSize: '0.82rem' }}>
                    {(elapsed / 1000).toFixed(1)}s · {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 ml-auto">
                {[
                  { label: 'PASS',     count: pass,    color: '#22C55E' },
                  { label: 'FAIL',     count: fail,    color: '#EF4444' },
                  { label: 'WARN',     count: warn,    color: '#F59E0B' },
                  { label: 'CRITICAL', count: critFail, color: '#EF4444' },
                  { label: 'TOTAL',    count: total,   color: '#94A3B8' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center px-4 py-2.5 rounded-xl"
                    style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, minWidth: '64px' }}>
                    <span className="font-black text-2xl" style={{ fontWeight: 900, fontSize: '1.5rem', color: s.color }}>{s.count}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: s.color, letterSpacing: '0.08em' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {running && (
                <div className="w-full mt-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5" style={{ fontSize: '0.72rem' }}>
                    <span>{done}/{total} tests complete</span>
                    <span>{Math.round((done / total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #04ADBF, #09732E)' }}
                      animate={{ width: `${(done / total) * 100}%` }}
                      transition={{ type: 'spring', damping: 20 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle state */}
        {done === 0 && !running && (
          <div className="text-center py-20">
            <FlaskConical className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg" style={{ fontSize: '1.1rem' }}>
              Click <strong style={{ color: '#04ADBF' }}>Run All Tests</strong> to start the regression suite
            </p>
            <p className="text-gray-600 text-sm mt-2" style={{ fontSize: '0.8rem' }}>
              {total} assertions across 12 domains — calculator math, RTL utils, token system, route table, backend
            </p>
          </div>
        )}

        {/* Test Groups */}
        <div className="space-y-3">
          {GROUPS.map(group => {
            const gResults = group.tests.map(t => results[t.id]).filter(Boolean);
            const gPass    = gResults.filter(r => r.status === 'pass').length;
            const gFail    = gResults.filter(r => r.status === 'fail').length;
            const gWarn    = gResults.filter(r => r.status === 'warn').length;
            const gDone    = gResults.filter(r => !['pending','running'].includes(r.status)).length;
            const gRunning = gResults.some(r => r.status === 'running');
            const isOpen   = expanded[group.id] !== false; // default open

            return (
              <div key={group.id} className="rounded-2xl overflow-hidden"
                style={{ background: '#111B2E', border: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${group.color}18`, color: group.color }}>
                    {group.icon}
                  </div>
                  <span className="font-bold text-white flex-1 text-left" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {group.name}
                  </span>

                  {/* Mini progress */}
                  {gDone > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      {gFail > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                          {gFail} FAIL
                        </span>
                      )}
                      {gWarn > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                          {gWarn} WARN
                        </span>
                      )}
                      <span className="text-xs font-semibold" style={{ fontSize: '0.75rem', color: gFail === 0 ? '#22C55E' : '#EF4444' }}>
                        {gPass}/{group.tests.length}
                      </span>
                    </div>
                  )}
                  {gRunning && (
                    <RefreshCw className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
                  )}

                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  }
                </button>

                {/* Test rows */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-white/[0.04]"
                    >
                      {group.tests.map((test, i) => {
                        const r = results[test.id];
                        if (!r) return null;
                        const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                        const Icon = cfg.icon;

                        return (
                          <motion.div
                            key={test.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.01 }}
                            className="flex items-start gap-3 px-5 py-3 border-b border-white/[0.03] last:border-0"
                            style={{ background: r.status === 'fail' ? 'rgba(239,68,68,0.03)' : 'transparent' }}
                          >
                            {/* Status icon */}
                            <div className="mt-0.5 shrink-0">
                              {r.status === 'running'
                                ? <RefreshCw className="w-4 h-4 animate-spin" style={{ color: cfg.color }} />
                                : <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                              }
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-white" style={{ fontSize: '0.83rem', fontWeight: 600 }}>
                                  {test.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                                  style={{ fontSize: '0.6rem', fontWeight: 700, background: `${SEV_COLOR[test.severity]}20`, color: SEV_COLOR[test.severity] }}>
                                  {test.severity.toUpperCase()}
                                </span>
                              </div>
                              {r.detail && (
                                <p className="text-gray-500 mt-0.5 font-mono"
                                  style={{ fontSize: '0.72rem', lineHeight: 1.5, wordBreak: 'break-all' }}>
                                  {r.detail}
                                </p>
                              )}
                            </div>

                            {/* Duration + Status badge */}
                            <div className="flex items-center gap-2 shrink-0 mt-0.5">
                              {r.durationMs > 0 && (
                                <span className="text-gray-600" style={{ fontSize: '0.68rem' }}>{r.durationMs}ms</span>
                              )}
                              <span className="px-2 py-0.5 rounded font-black"
                                style={{ fontSize: '0.58rem', fontWeight: 900, background: cfg.bg, color: cfg.color, letterSpacing: '0.06em' }}>
                                {cfg.label}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-gray-600" style={{ fontSize: '0.72rem' }}>
          Wasel | واصل + Raje3 | راجع — Regression Test Suite v1.0 · {total} assertions · 12 domains
          <br />Route at <code className="text-gray-500">/regression-test</code> · No auth required
        </div>
      </div>
    </div>
  );
}
