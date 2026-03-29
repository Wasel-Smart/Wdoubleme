/**
 * Logistics Domain Types — Raje3 | راجع
 *
 * Package delivery via existing travelers.
 *
 * ⚠️ CRITICAL ARCHITECTURE RULE:
 * Packages ALWAYS travel on existing carpool trips.
 * A package cannot be posted or matched without an active trip.
 * Raje3 is a service LAYER on top of Wasel carpooling — never standalone.
 *
 * Flow:
 *   Sender posts package → System finds matching trips (Wasel) →
 *   Traveler accepts → QR pickup → In-transit → QR delivery → Payout
 */

import type { CountryCode } from '../../utils/regionConfig';
import type { PaymentMethod } from '../mobility/types';

// ─── Package Lifecycle ────────────────────────────────────────────────────────

export type PackageStatus =
  | 'draft'           // Sender still editing
  | 'pending_match'   // Published, waiting for traveler match
  | 'matched'         // Traveler accepted, pending pickup
  | 'pickup_pending'  // Traveler en route to pickup
  | 'picked_up'       // QR scan confirmed at pickup — traveler has package
  | 'in_transit'      // On the carpool trip
  | 'delivered'       // QR scan confirmed at destination
  | 'delivery_failed' // Traveler couldn't deliver
  | 'cancelled'       // Sender cancelled before match
  | 'claim_open'      // Insurance claim filed
  | 'claim_resolved'; // Claim settled

// ─── Package Classification ───────────────────────────────────────────────────

export type PackageCategory =
  | 'documents'       // Legal papers, letters, contracts
  | 'electronics'     // Phones, tablets, small devices
  | 'clothing'        // Clothes, fabrics
  | 'food'            // Sealed/packaged food only (no perishables)
  | 'medicine'        // OTC meds (prescription requires verification)
  | 'gifts'           // Wrapped presents
  | 'small_parcels'   // General small boxes
  | 'books'           // Books, magazines, educational materials
  | 'cosmetics'       // Beauty products
  | 'other';          // Catch-all — must add description

/** Categories that require declaration or are restricted */
export const RESTRICTED_CATEGORIES: PackageCategory[] = ['medicine'];

/** Categories not eligible for basic insurance (need premium) */
export const HIGH_RISK_CATEGORIES: PackageCategory[] = ['electronics'];

export type PackageSize =
  | 'envelope'        // < 0.5 kg — documents / letters
  | 'small'           // 0.5–2 kg — small box / pouch
  | 'medium'          // 2–5 kg — medium box
  | 'large';          // 5–15 kg — large bag/box (max accepted)

export const PACKAGE_SIZE_MAX_WEIGHT: Record<PackageSize, number> = {
  envelope: 0.5,
  small:    2,
  medium:   5,
  large:    15,
};

// ─── Insurance ────────────────────────────────────────────────────────────────

export type InsuranceTier = 'basic' | 'premium';

export interface InsuranceConfig {
  tier: InsuranceTier;
  /** Cost in JOD per package */
  costJOD: number;
  /** Maximum coverage in JOD */
  coverageJOD: number;
  description: string;
  descriptionAr: string;
}

export const INSURANCE_TIERS: Record<InsuranceTier, InsuranceConfig> = {
  basic: {
    tier: 'basic',
    costJOD: 0.50,
    coverageJOD: 100,
    description: 'Basic coverage up to JOD 100',
    descriptionAr: 'تغطية أساسية حتى 100 دينار',
  },
  premium: {
    tier: 'premium',
    costJOD: 2.00,
    coverageJOD: 1000,
    description: 'Premium coverage up to JOD 1,000',
    descriptionAr: 'تغطية متميزة حتى 1,000 دينار',
  },
};

// ─── QR Verification ──────────────────────────────────────────────────────────

export type VerificationEvent = 'pickup' | 'delivery';

export interface QRVerificationRecord {
  packageId: string;
  event: VerificationEvent;
  /** The QR code string (UUID-based, single-use) */
  qrCode: string;
  verifiedBy: string;           // userId of traveler (pickup) or recipient (delivery)
  verifiedAt: string;           // ISO timestamp
  coordinates?: { lat: number; lng: number };
  photoUrl?: string;            // Optional photo proof
  tripId: string;               // The carpool trip this package is on
}

// ─── Core Package Entity ──────────────────────────────────────────────────────

export interface Package {
  id: string;
  senderId: string;

  /** The carpool trip this package travels on (mandatory link to Wasel) */
  tripId?: string;
  travelerId?: string;          // Set when a trip is matched

  // ── Route (must match an existing trip's route) ──
  originCity: string;
  originCityAr: string;
  destinationCity: string;
  destinationCityAr: string;
  country: CountryCode;

  // ── Package details ──
  category: PackageCategory;
  size: PackageSize;
  weightKg: number;
  description: string;
  specialInstructions?: string;
  fragile: boolean;
  requiresRefrigeration: boolean;
  restrictedContents: boolean;  // Flagged for review

  // ── Recipient ──
  recipientName: string;
  recipientPhone: string;       // E.164 format
  recipientNotes?: string;

  // ── Timing ──
  neededBy: string;             // ISO — deadline for delivery
  matchedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;

  // ── Pricing (all in JOD) ──
  priceJOD: number;             // What sender pays
  travelerEarnsJOD: number;     // After platform commission
  commissionJOD: number;        // 20% platform fee
  insurancePaidJOD: number;     // 0.50 basic / 2.00 premium
  totalChargeJOD: number;       // priceJOD + insurancePaidJOD

  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'held' | 'released' | 'refunded';

  // ── Insurance ──
  declaredValueJOD: number;
  insuranceTier: InsuranceTier;

  // ── QR Verification ──
  pickupQRCode?: string;
  deliveryQRCode?: string;
  pickupVerification?: QRVerificationRecord;
  deliveryVerification?: QRVerificationRecord;

  // ── Status ──
  status: PackageStatus;

  // ── Metadata ──
  createdAt: string;
  updatedAt: string;
}

// ─── Package Match Result ─────────────────────────────────────────────────────

export interface PackageMatchResult {
  tripId: string;
  travelerId: string;
  compatibilityScore: number;   // 0-100
  arrivalBeforeDeadline: boolean;
  travelerRating: number;
  travelerTrustScore: number;
  estimatedDelivery: string;    // ISO timestamp
  /** Extra km the traveler would go off-route (usually 0 if same route) */
  detourKm: number;
  travelerEarnsJOD: number;
}

// ─── Send Package Input ───────────────────────────────────────────────────────

export interface SendPackageInput {
  originCity: string;
  destinationCity: string;
  country: CountryCode;
  category: PackageCategory;
  size: PackageSize;
  weightKg: number;
  description: string;
  fragile: boolean;
  declaredValueJOD: number;
  insuranceTier: InsuranceTier;
  neededBy: string;
  recipientName: string;
  recipientPhone: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
}

// ─── Package Search / Filters ─────────────────────────────────────────────────

export interface PackageSearchFilters {
  originCity: string;
  destinationCity: string;
  country: CountryCode;
  neededBy: string;
  maxWeightKg?: number;
  category?: PackageCategory;
}

/** What travelers see when browsing available packages */
export interface PackageListingView {
  id: string;
  originCity: string;
  originCityAr: string;
  destinationCity: string;
  destinationCityAr: string;
  category: PackageCategory;
  size: PackageSize;
  weightKg: number;
  fragile: boolean;
  neededBy: string;
  travelerEarnsJOD: number;     // Highlighted earning potential
  description: string;          // Sender's description (no PII)
  insured: boolean;
}

// ─── Insurance Claim ─────────────────────────────────────────────────────────

export type ClaimStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'paid';

export type ClaimReason =
  | 'lost'
  | 'damaged'
  | 'delayed'
  | 'wrong_delivery'
  | 'other';

export interface InsuranceClaim {
  id: string;
  packageId: string;
  claimantId: string;           // sender's userId
  reason: ClaimReason;
  description: string;
  evidenceUrls: string[];       // Photos, receipts
  claimedAmountJOD: number;
  approvedAmountJOD?: number;
  status: ClaimStatus;
  resolvedAt?: string;
  resolverNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Pricing Calculator ───────────────────────────────────────────────────────

export interface PackagePriceBreakdown {
  basePrice: number;            // JOD
  weightSurcharge: number;      // JOD (above 2 kg)
  distanceSurcharge: number;    // JOD (above 100 km)
  fragileSurcharge: number;     // JOD 0.50 if fragile
  insuranceCost: number;        // JOD
  totalSenderPays: number;      // JOD
  travelerEarns: number;        // JOD (after 20% commission)
  platformEarns: number;        // JOD (commission + insurance)
}

/**
 * Calculate package pricing for a given route.
 * Base: JOD 3 for first kg, JOD 0.50/kg after that, distance surcharge > 100 km.
 */
export function calculatePackagePrice(
  weightKg: number,
  distanceKm: number,
  fragile: boolean,
  insuranceTier: InsuranceTier,
): PackagePriceBreakdown {
  const COMMISSION_RATE = 0.20;
  const BASE = 3;
  const PER_KG_OVER_1 = 0.50;
  const KM_SURCHARGE_RATE = 0.01;   // JOD per km over 100

  const weightSurcharge = Math.max(0, (weightKg - 1) * PER_KG_OVER_1);
  const distanceSurcharge = Math.max(0, (distanceKm - 100) * KM_SURCHARGE_RATE);
  const fragileSurcharge = fragile ? 0.50 : 0;
  const insuranceCost = INSURANCE_TIERS[insuranceTier].costJOD;

  const basePrice = Math.max(BASE, Math.ceil(BASE + weightSurcharge + distanceSurcharge + fragileSurcharge));
  const totalSenderPays = basePrice + insuranceCost;
  const platformCommission = Math.round(basePrice * COMMISSION_RATE * 100) / 100;
  const travelerEarns = Math.round((basePrice - platformCommission) * 100) / 100;
  const platformEarns = Math.round((platformCommission + insuranceCost) * 100) / 100;

  return {
    basePrice,
    weightSurcharge,
    distanceSurcharge,
    fragileSurcharge,
    insuranceCost,
    totalSenderPays,
    travelerEarns,
    platformEarns,
  };
}

// ─── KV Storage Keys ──────────────────────────────────────────────────────────

export const LOGISTICS_KV_KEYS = {
  package: (id: string) => `pkg:${id}`,
  packagesForRoute: (country: CountryCode, origin: string, dest: string) =>
    `pkgs:${country}:${origin}:${dest}`,
  packagesForSender: (userId: string) => `pkgs:sender:${userId}`,
  packagesForTraveler: (userId: string) => `pkgs:traveler:${userId}`,
  packagesForTrip: (tripId: string) => `pkgs:trip:${tripId}`,
  claim: (id: string) => `claim:${id}`,
  claimsForPackage: (packageId: string) => `claims:pkg:${packageId}`,
  qrVerification: (packageId: string, event: VerificationEvent) =>
    `qr:${packageId}:${event}`,
} as const;
