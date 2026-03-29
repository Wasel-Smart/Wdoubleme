/**
 * Feature: Revenue
 * Strangler Fig barrel — re-exports from canonical locations.
 *
 * NOTE (Post-Pivot): DynamicPricing and SurgeAnalytics have been removed.
 * Wasel uses fixed cost-sharing pricing only (see /utils/costSharingCalculator.ts).
 * ❌ No surge pricing — ever. Cost-sharing is fixed (fuel cost doesn't change).
 */

// ── Subscription plans (Wasel Plus JOD 9.99/mo) ───────────────────────────────
export { SubscriptionPlans } from '../../components/revenue/SubscriptionPlans';

// ── Marketplace & loyalty (✅ keep) ───────────────────────────────────────────
export { MarketplaceAds } from '../../components/revenue/MarketplaceAds';
export { LoyaltyRewards } from '../../components/revenue/LoyaltyRewards';
export { CarbonOffset } from '../../components/revenue/CarbonOffset';
export { LoyaltyProgram } from '../../components/LoyaltyProgram';
export { ReferralProgram } from '../../components/ReferralProgram';
export { RevenueHub } from '../../components/RevenueHub';
