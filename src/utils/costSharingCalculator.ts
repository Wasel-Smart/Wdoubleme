/**
 * Cost-Sharing Calculator for Wasel | واصل
 * Implements the BlaBlaCar-style fuel cost-sharing model.
 * Now supports all MENA + Egypt countries.
 *
 * Rules (from Guidelines v3):
 *  - All amounts stored as JOD (settlement currency)
 *  - Fuel prices sourced from /utils/regionConfig.ts (single source of truth)
 *  - No dynamic / surge pricing — price is fixed at post time
 *  - Commission: 12% deducted from passenger payment, sent to platform
 */

import { getRegion } from './regionConfig';
import type { CountryCode } from './regionConfig';

// ─── Constants ───────────────────────────────────────────────────────────────

export const DRIVER_BUFFER_PERCENT     = 0.20;   // Wear-and-tear buffer
export const PLATFORM_COMMISSION       = 0.12;   // 12% Wasel fee
export const DEFAULT_SEATS             = 3;      // Typical sedan

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CostSharingInput {
  /** Route distance in kilometres */
  distanceKm: number;
  /** Country of operation (defaults to Jordan) */
  country?: CountryCode;
  /** Number of seats the driver is offering (excluding themselves) */
  seatsAvailable?: number;
  /** Override fuel price in JOD per litre (uses country config by default) */
  fuelPriceJODPerLitre?: number;
  /** Override fuel efficiency in L/100 km (uses country config by default) */
  fuelEfficiencyLper100km?: number;
  /** Include toll charge (uses route config or flat JOD 2) */
  includeTolls?: boolean;
  /** Toll cost in local currency (converted to JOD internally) */
  tollCostLocal?: number;
  /** Driver buffer percent for wear-and-tear (default: 0.20) */
  driverBuffer?: number;
}

export interface CostSharingResult {
  /** Suggested price to charge each passenger (rounded to nearest 0.5 JOD) */
  pricePerSeatJOD: number;
  /** Total fuel cost for the trip in JOD */
  fuelCostJOD: number;
  /** Toll cost in JOD (0 if includeTolls=false) */
  tollsCostJOD: number;
  /** Total trip cost including buffer in JOD */
  totalCostWithBufferJOD: number;
  /** Platform commission per seat in JOD */
  commissionPerSeatJOD: number;
  /** Amount driver receives per seat (price minus commission) */
  driverEarnsPerSeatJOD: number;
  /** Passenger net cost if all seats filled in JOD */
  passengerCostIfFullJOD: number;
  /** Country used for this calculation */
  country: CountryCode;
  /** Fuel price used (JOD/L) */
  fuelPriceUsedJOD: number;
}

// ──��� Core function ────────────────────────────────────────────────────────────

/**
 * Calculate the recommended cost-sharing price per seat.
 * Automatically uses the country's fuel price and efficiency.
 */
export function calculateCostSharingPrice(input: CostSharingInput): CostSharingResult {
  const country = input.country ?? 'JO';
  const region = getRegion(country);

  const seatsAvailable = input.seatsAvailable ?? DEFAULT_SEATS;
  const driverBuffer   = input.driverBuffer   ?? DRIVER_BUFFER_PERCENT;

  // Use country config as defaults (overrideable)
  const fuelPriceJOD = input.fuelPriceJODPerLitre ?? region.fuel.priceInJOD;
  const efficiency   = input.fuelEfficiencyLper100km ?? region.fuel.efficiencyLper100km;

  // 1. Fuel cost
  const totalFuelLitres = (input.distanceKm / 100) * efficiency;
  const fuelCostJOD     = totalFuelLitres * fuelPriceJOD;

  // 2. Tolls — convert local toll to JOD using regionConfig
  let tollsCostJOD = 0;
  if (input.includeTolls) {
    if (input.tollCostLocal) {
      // Convert local currency toll to JOD
      tollsCostJOD = input.tollCostLocal * region.fuel.priceInJOD / region.fuel.pricePerLitre;
    } else {
      tollsCostJOD = 2.00; // Default JOD 2 flat (Jordan/generic)
    }
  }

  // 3. Total cost, split across seats (driver covers 1 share implicitly)
  const totalBaseCost   = fuelCostJOD + tollsCostJOD;
  const costPerSeat     = totalBaseCost / seatsAvailable;

  // 4. Add buffer for wear-and-tear
  const pricePerSeatRaw = costPerSeat * (1 + driverBuffer);

  // 5. Round up to nearest 0.5 (cleaner UX)
  const pricePerSeatJOD = Math.ceil(pricePerSeatRaw * 2) / 2;

  // 6. Derived values
  const commissionPerSeatJOD   = Math.round(pricePerSeatJOD * PLATFORM_COMMISSION * 1000) / 1000;
  const driverEarnsPerSeatJOD  = Math.round((pricePerSeatJOD - commissionPerSeatJOD) * 1000) / 1000;
  const totalCostWithBufferJOD = Math.round(totalBaseCost * (1 + driverBuffer) * 1000) / 1000;
  const passengerCostIfFullJOD = pricePerSeatJOD * seatsAvailable;

  return {
    pricePerSeatJOD,
    fuelCostJOD:          Math.round(fuelCostJOD    * 1000) / 1000,
    tollsCostJOD:         Math.round(tollsCostJOD   * 1000) / 1000,
    totalCostWithBufferJOD,
    commissionPerSeatJOD,
    driverEarnsPerSeatJOD,
    passengerCostIfFullJOD,
    country,
    fuelPriceUsedJOD: fuelPriceJOD,
  };
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

/** Quick price for any country route */
export function quickPrice(
  distanceKm: number,
  country: CountryCode = 'JO',
  seats = 3,
  includeTolls = false,
): number {
  return calculateCostSharingPrice({ distanceKm, country, seatsAvailable: seats, includeTolls }).pricePerSeatJOD;
}

// ─── Jordan routes (backwards compatibility) ──────────────────────────────────

export const JORDAN_ROUTES = {
  AMMAN_AQABA:    { distanceKm: 330, includeTolls: true,  label: 'Amman → Aqaba',     labelAr: 'عمّان → العقبة' },
  AMMAN_IRBID:    { distanceKm: 85,  includeTolls: false, label: 'Amman → Irbid',     labelAr: 'عمّان → إربد'  },
  AMMAN_DEAD_SEA: { distanceKm: 60,  includeTolls: false, label: 'Amman → Dead Sea',  labelAr: 'عمّان → البحر الميت' },
  AMMAN_ZARQA:    { distanceKm: 30,  includeTolls: false, label: 'Amman → Zarqa',     labelAr: 'عمّان → الزرقاء' },
  AMMAN_PETRA:    { distanceKm: 250, includeTolls: false, label: 'Amman → Petra',     labelAr: 'عمّان → البتراء' },
  AMMAN_WADI_RUM: { distanceKm: 320, includeTolls: false, label: 'Amman → Wadi Rum',  labelAr: 'عمّان → وادي رم' },
  AMMAN_MADABA:   { distanceKm: 33,  includeTolls: false, label: 'Amman → Madaba',    labelAr: 'عمّان → مادبا'  },
  AMMAN_MAAN:     { distanceKm: 210, includeTolls: false, label: "Amman → Ma'an",     labelAr: 'عمّان → معان'  },
} as const;

// ─── Egypt routes ─────────────────────────────────────────────────────────────

export const EGYPT_ROUTES = {
  CAIRO_ALEXANDRIA:  { distanceKm: 220, includeTolls: true,  label: 'Cairo → Alexandria', labelAr: 'القاهرة → الإسكندرية' },
  CAIRO_SHARM:       { distanceKm: 480, includeTolls: false, label: 'Cairo → Sharm El-Sheikh', labelAr: 'القاهرة → شرم الشيخ' },
  CAIRO_HURGHADA:    { distanceKm: 390, includeTolls: false, label: 'Cairo → Hurghada', labelAr: 'القاهرة → الغردقة' },
  CAIRO_PORT_SAID:   { distanceKm: 180, includeTolls: true,  label: 'Cairo → Port Said', labelAr: 'القاهرة → بورسعيد' },
  CAIRO_SUEZ:        { distanceKm: 130, includeTolls: true,  label: 'Cairo → Suez',    labelAr: 'القاهرة → السويس' },
  CAIRO_LUXOR:       { distanceKm: 650, includeTolls: false, label: 'Cairo → Luxor',   labelAr: 'القاهرة → الأقصر' },
  CAIRO_MANSOURA:    { distanceKm: 120, includeTolls: false, label: 'Cairo → Mansoura', labelAr: 'القاهرة → المنصورة' },
} as const;

// ─── Saudi Arabia routes ──────────────────────────────────────────────────────

export const SAUDI_ROUTES = {
  RIYADH_JEDDAH:    { distanceKm: 950, includeTolls: false, label: 'Riyadh → Jeddah',  labelAr: 'الرياض → جدة' },
  RIYADH_DAMMAM:    { distanceKm: 400, includeTolls: false, label: 'Riyadh → Dammam',  labelAr: 'الرياض → الدمام' },
  JEDDAH_MECCA:     { distanceKm: 80,  includeTolls: false, label: 'Jeddah → Mecca',   labelAr: 'جدة → مكة المكرمة' },
  JEDDAH_MEDINA:    { distanceKm: 420, includeTolls: false, label: 'Jeddah → Medina',  labelAr: 'جدة → المدينة المنورة' },
  JEDDAH_TAIF:      { distanceKm: 90,  includeTolls: false, label: 'Jeddah → Taif',    labelAr: 'جدة → الطائف' },
  DAMMAM_KHOBAR:    { distanceKm: 15,  includeTolls: false, label: 'Dammam → Khobar',  labelAr: 'الدمام → الخبر' },
} as const;

// ─── UAE routes ───────────────────────────────────────────────────────────────

export const UAE_ROUTES = {
  DUBAI_ABU_DHABI:  { distanceKm: 150, includeTolls: true,  label: 'Dubai → Abu Dhabi', labelAr: 'دبي → أبوظبي' },
  DUBAI_SHARJAH:    { distanceKm: 30,  includeTolls: true,  label: 'Dubai → Sharjah',   labelAr: 'دبي → الشارقة' },
  DUBAI_AJMAN:      { distanceKm: 50,  includeTolls: false, label: 'Dubai → Ajman',     labelAr: 'دبي → عجمان' },
  ABU_DHABI_AL_AIN: { distanceKm: 150, includeTolls: false, label: 'Abu Dhabi → Al Ain', labelAr: 'أبوظبي → العين' },
  DUBAI_FUJAIRAH:   { distanceKm: 130, includeTolls: false, label: 'Dubai → Fujairah',  labelAr: 'دبي → الفجيرة' },
} as const;

// ─── Morocco routes ───────────────────────────────────────────────────────────

export const MOROCCO_ROUTES = {
  CASABLANCA_MARRAKECH: { distanceKm: 240, includeTolls: true,  label: 'Casablanca → Marrakech', labelAr: 'الدار البيضاء → مراكش' },
  CASABLANCA_RABAT:     { distanceKm: 90,  includeTolls: true,  label: 'Casablanca → Rabat',    labelAr: 'الدار البيضاء → الرباط' },
  CASABLANCA_FEZ:       { distanceKm: 300, includeTolls: true,  label: 'Casablanca → Fez',      labelAr: 'الدار البيضاء → فاس' },
  CASABLANCA_TANGIER:   { distanceKm: 340, includeTolls: true,  label: 'Casablanca → Tangier',  labelAr: 'الدار البيضاء → طنجة' },
} as const;

// ─── Multi-country route price calculator ─────────────────────────────────────

type RoutePreset = { distanceKm: number; includeTolls: boolean; label: string; labelAr: string };

export function getCountryRoutePrices(country: CountryCode, routes: Record<string, RoutePreset>): Array<{
  key: string; label: string; labelAr: string;
  distanceKm: number; pricePerSeatJOD: number; fuelCostJOD: number; country: CountryCode;
}> {
  return Object.entries(routes).map(([key, route]) => {
    const result = calculateCostSharingPrice({
      distanceKm: route.distanceKm,
      country,
      seatsAvailable: 3,
      includeTolls: route.includeTolls,
    });
    return {
      key,
      label: route.label,
      labelAr: route.labelAr,
      distanceKm: route.distanceKm,
      pricePerSeatJOD: result.pricePerSeatJOD,
      fuelCostJOD: result.fuelCostJOD,
      country,
    };
  });
}

/** Get Jordan route prices (backwards compat) */
export function getJordanRoutePrices() {
  return getCountryRoutePrices('JO', JORDAN_ROUTES as Record<string, RoutePreset>);
}

/** Get Egypt route prices */
export function getEgyptRoutePrices() {
  return getCountryRoutePrices('EG', EGYPT_ROUTES as Record<string, RoutePreset>);
}

/** Get Saudi Arabia route prices */
export function getSaudiRoutePrices() {
  return getCountryRoutePrices('SA', SAUDI_ROUTES as Record<string, RoutePreset>);
}

/** Get UAE route prices */
export function getUAERoutePrices() {
  return getCountryRoutePrices('AE', UAE_ROUTES as Record<string, RoutePreset>);
}

/** Get Morocco route prices */
export function getMoroccoRoutePrices() {
  return getCountryRoutePrices('MA', MOROCCO_ROUTES as Record<string, RoutePreset>);
}