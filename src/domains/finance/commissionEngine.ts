/**
 * Commission Engine — Wasel Financial Domain
 *
 * Centralised, auditable, country-aware commission calculation.
 * All revenue flows pass through this engine.
 *
 * Revenue streams:
 *   1. Carpooling commission (12% standard, lower for premium users)
 *   2. Package delivery commission (20% standard)
 *   3. Insurance fees (flat JOD 0.50 / JOD 2.00)
 *   4. Subscription fees (Wasel Plus JOD 9.99/mo)
 *   5. Featured listing fees (JOD 1/listing)
 *   6. Verified driver badge (JOD 15/yr)
 *   7. Enterprise B2B contracts
 *
 * All calculations are idempotent and traceable.
 * All amounts returned in JOD (platform settlement currency).
 */

import type { CountryCode } from '../../utils/regionConfig';

// ─── Commission Rate Tables ───────────────────────────────────────────────────

/** Standard commission rates by service type */
export const STANDARD_COMMISSION_RATES = {
  carpooling: 0.12,             // 12%
  packageDelivery: 0.20,        // 20%
  schoolCarpooling: 0.15,       // 15%
  hospitalTransport: 0.15,      // 15%
  corporateCarpools: 0.20,      // 20% (higher B2B margin)
} as const;

/** Discounted rates for Wasel Plus subscribers */
export const PLUS_COMMISSION_RATES = {
  carpooling: 0.10,             // 10% (-2%)
  packageDelivery: 0.18,        // 18% (-2%)
  schoolCarpooling: 0.13,
  hospitalTransport: 0.13,
  corporateCarpools: 0.18,
} as const;

/**
 * Country-specific commission adjustment multipliers.
 * Applied on top of standard rates to reflect local market economics.
 *
 * Jordan:  1.00x (baseline)
 * Egypt:   0.85x (lower spending power, higher volume strategy)
 * Saudi:   1.10x (premium market, higher spend)
 * UAE:     1.20x (premium expat market)
 * Kuwait:  1.15x (high per-capita income)
 * Morocco: 0.90x (emerging market)
 * Tunisia: 0.90x (emerging market)
 */
export const COUNTRY_COMMISSION_MULTIPLIERS: Record<CountryCode, number> = {
  JO: 1.00,
  EG: 0.85,
  SA: 1.10,
  AE: 1.20,
  KW: 1.15,
  BH: 1.05,
  QA: 1.15,
  OM: 1.05,
  LB: 0.80,  // Economic instability — lower to drive adoption
  PS: 0.80,
  MA: 0.90,
  TN: 0.90,
  IQ: 0.85,
};

// ─── Flat Fees ────────────────────────────────────────────────────────────────

export const FLAT_FEES = {
  insurance_basic_jod:    0.50,  // Per package
  insurance_premium_jod:  2.00,  // Per package
  verified_badge_jod:    15.00,  // Per year (driver)
  featured_listing_jod:   1.00,  // Per ride listing
  cashOnArrivalDeposit:  20.00,  // Held deposit for COA payments
} as const;

// ─── Subscription Plans ───────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  priceJOD: number;
  billingCycle: 'monthly' | 'annual';
  discountRate: number;         // Applied to service commissions
  features: string[];
  featuresAr: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Wasel Free',
    nameAr: 'واصل مجاني',
    priceJOD: 0,
    billingCycle: 'monthly',
    discountRate: 0,
    features: ['Basic ride search', 'Package sending', 'Standard support'],
    featuresAr: ['بحث عن رحلات', 'إرسال طرود', 'دعم عادي'],
  },
  {
    id: 'plus_monthly',
    name: 'Wasel Plus',
    nameAr: 'واصل بلس',
    priceJOD: 9.99,
    billingCycle: 'monthly',
    discountRate: 0.10,         // 10% off all rides
    features: [
      '10% off all rides',
      'Priority booking',
      '2% lower commission on packages',
      'Premium support',
      'Carbon tracking',
    ],
    featuresAr: [
      'خصم 10% على الرحلات',
      'حجز ذو أولوية',
      'عمولة أقل على الطرود بنسبة 2%',
      'دعم متميز',
      'تتبع الكربون',
    ],
  },
  {
    id: 'plus_annual',
    name: 'Wasel Plus (Annual)',
    nameAr: 'واصل بلس (سنوي)',
    priceJOD: 99.00,            // JOD 8.25/mo — ~18% saving
    billingCycle: 'annual',
    discountRate: 0.10,
    features: [
      'All Plus benefits',
      '17% saving vs monthly',
      'Verified traveler badge',
    ],
    featuresAr: [
      'جميع مميزات بلس',
      'توفير 17% مقارنة بالشهري',
      'شارة مسافر موثق',
    ],
  },
];

// ─── Enterprise Billing ───────────────────────────────────────────────────────

export interface EnterpriseContract {
  id: string;
  companyName: string;
  country: CountryCode;
  employeeCount: number;
  monthlyFeePerEmployeeJOD: number;
  commissionRate: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
}

export const ENTERPRISE_PRICING = {
  baseMonthlyFeePerEmployee: 50,  // JOD 50/employee/month
  commissionRate: 0.20,           // 20% on all enterprise trips
  minEmployees: 10,
  discountTiers: [
    { minEmployees: 50,   discount: 0.10 },  // 10% off for 50+ employees
    { minEmployees: 100,  discount: 0.15 },  // 15% off for 100+
    { minEmployees: 250,  discount: 0.20 },  // 20% off for 250+
    { minEmployees: 500,  discount: 0.25 },  // 25% off for 500+
  ],
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceType = keyof typeof STANDARD_COMMISSION_RATES;

export interface CommissionBreakdown {
  grossAmountJOD: number;
  commissionRate: number;
  commissionJOD: number;
  driverEarnsJOD: number;
  countryMultiplier: number;
  isPlus: boolean;
  serviceType: ServiceType;
  auditTrail: {
    calculatedAt: string;
    version: string;
    inputs: Record<string, unknown>;
  };
}

export interface PackageCommissionBreakdown extends CommissionBreakdown {
  insuranceFeeJOD: number;
  platformTotalJOD: number;
  travelerEarnsJOD: number;
}

export interface TripRevenueReport {
  tripId: string;
  country: CountryCode;
  totalPassengerRevenue: number;
  totalPackageRevenue: number;
  totalInsuranceRevenue: number;
  totalCommissionJOD: number;
  totalDriverPayoutJOD: number;
  grossMarginPercent: number;
  bookingCount: number;
  packageCount: number;
}

// ─── Core Engine Functions ────────────────────────────────────────────────────

/**
 * Calculate commission for a carpooling booking.
 * @param grossAmountJOD - Total passenger payment in JOD
 * @param country        - Country of operation (applies multiplier)
 * @param isPlus         - Whether driver has Wasel Plus subscription
 * @param serviceType    - Type of service (default: carpooling)
 */
export function calculateCarpoolingCommission(
  grossAmountJOD: number,
  country: CountryCode = 'JO',
  isPlus = false,
  serviceType: ServiceType = 'carpooling',
): CommissionBreakdown {
  const baseRate = isPlus
    ? PLUS_COMMISSION_RATES[serviceType]
    : STANDARD_COMMISSION_RATES[serviceType];
  const multiplier = COUNTRY_COMMISSION_MULTIPLIERS[country];
  const effectiveRate = Math.min(baseRate * multiplier, 0.25);  // Cap at 25%

  const commissionJOD = roundJOD(grossAmountJOD * effectiveRate);
  const driverEarnsJOD = roundJOD(grossAmountJOD - commissionJOD);

  return {
    grossAmountJOD,
    commissionRate: effectiveRate,
    commissionJOD,
    driverEarnsJOD,
    countryMultiplier: multiplier,
    isPlus,
    serviceType,
    auditTrail: {
      calculatedAt: new Date().toISOString(),
      version: 'commission-engine-v2.0',
      inputs: { grossAmountJOD, country, isPlus, serviceType, baseRate, multiplier },
    },
  };
}

/**
 * Calculate commission for a Raje3 package delivery.
 * Commission is on the base package price (not insurance fee).
 */
export function calculatePackageCommission(
  basePriceJOD: number,
  insuranceTier: 'basic' | 'premium',
  country: CountryCode = 'JO',
  isPlus = false,
): PackageCommissionBreakdown {
  const base = calculateCarpoolingCommission(
    basePriceJOD,
    country,
    isPlus,
    'packageDelivery',
  );
  const insuranceFeeJOD = FLAT_FEES[`insurance_${insuranceTier}_jod` as keyof typeof FLAT_FEES] as number;
  const platformTotalJOD = roundJOD(base.commissionJOD + insuranceFeeJOD);
  const travelerEarnsJOD = base.driverEarnsJOD; // Traveler is the "driver" in package delivery

  return {
    ...base,
    insuranceFeeJOD,
    platformTotalJOD,
    travelerEarnsJOD,
  };
}

/**
 * Calculate total revenue for a completed trip.
 * Includes all bookings and packages on that trip.
 */
export function calculateTripRevenue(params: {
  tripId: string;
  country: CountryCode;
  bookings: Array<{ amountJOD: number; isPlus?: boolean }>;
  packages: Array<{ priceJOD: number; insuranceTier: 'basic' | 'premium'; isPlus?: boolean }>;
}): TripRevenueReport {
  const { tripId, country, bookings, packages } = params;

  let totalPassengerRevenue = 0;
  let totalPackageRevenue = 0;
  let totalInsuranceRevenue = 0;
  let totalCommissionJOD = 0;
  let totalDriverPayoutJOD = 0;

  for (const b of bookings) {
    const commission = calculateCarpoolingCommission(b.amountJOD, country, b.isPlus);
    totalPassengerRevenue += b.amountJOD;
    totalCommissionJOD += commission.commissionJOD;
    totalDriverPayoutJOD += commission.driverEarnsJOD;
  }

  for (const p of packages) {
    const commission = calculatePackageCommission(p.priceJOD, p.insuranceTier, country, p.isPlus);
    totalPackageRevenue += p.priceJOD;
    totalInsuranceRevenue += commission.insuranceFeeJOD;
    totalCommissionJOD += commission.commissionJOD + commission.insuranceFeeJOD;
    totalDriverPayoutJOD += commission.travelerEarnsJOD;
  }

  const totalRevenue = totalPassengerRevenue + totalPackageRevenue + totalInsuranceRevenue;
  const grossMarginPercent =
    totalRevenue > 0
      ? Math.round((totalCommissionJOD / totalRevenue) * 100 * 10) / 10
      : 0;

  return {
    tripId,
    country,
    totalPassengerRevenue,
    totalPackageRevenue,
    totalInsuranceRevenue,
    totalCommissionJOD,
    totalDriverPayoutJOD,
    grossMarginPercent,
    bookingCount: bookings.length,
    packageCount: packages.length,
  };
}

/**
 * Calculate enterprise monthly invoice.
 */
export function calculateEnterpriseMonthlyBill(contract: EnterpriseContract): {
  baseFeeJOD: number;
  discountJOD: number;
  totalFeeJOD: number;
  effectiveRatePerEmployee: number;
} {
  const { employeeCount, monthlyFeePerEmployeeJOD } = contract;
  const baseFeeJOD = employeeCount * monthlyFeePerEmployeeJOD;

  const discountTier = ENTERPRISE_PRICING.discountTiers
    .slice()
    .reverse()
    .find((tier) => employeeCount >= tier.minEmployees);

  const discountRate = discountTier?.discount ?? 0;
  const discountJOD = roundJOD(baseFeeJOD * discountRate);
  const totalFeeJOD = roundJOD(baseFeeJOD - discountJOD);
  const effectiveRatePerEmployee = roundJOD(totalFeeJOD / employeeCount);

  return { baseFeeJOD, discountJOD, totalFeeJOD, effectiveRatePerEmployee };
}

/**
 * Apply loyalty reward — reduce effective commission for high-volume drivers.
 * Tier: Bronze (5+ trips) 5% off, Silver (10+) 10% off, Gold (20+) 15% off.
 */
export function applyLoyaltyDiscount(
  commissionJOD: number,
  totalTripsAsDriver: number,
): { discountedCommission: number; discountPercent: number; tier: string } {
  let discountPercent = 0;
  let tier = 'none';

  if (totalTripsAsDriver >= 20) { discountPercent = 0.15; tier = 'gold';   }
  else if (totalTripsAsDriver >= 10) { discountPercent = 0.10; tier = 'silver'; }
  else if (totalTripsAsDriver >= 5)  { discountPercent = 0.05; tier = 'bronze'; }

  const discountedCommission = roundJOD(commissionJOD * (1 - discountPercent));
  return { discountedCommission, discountPercent, tier };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round to 3 decimal places (JOD standard) */
function roundJOD(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

/** Format for display */
export function formatCommissionSummary(breakdown: CommissionBreakdown): string {
  return (
    `Rate: ${(breakdown.commissionRate * 100).toFixed(1)}% | ` +
    `Commission: JOD ${breakdown.commissionJOD.toFixed(3)} | ` +
    `Driver earns: JOD ${breakdown.driverEarnsJOD.toFixed(3)}`
  );
}
