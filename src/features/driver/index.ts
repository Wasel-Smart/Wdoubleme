/**
 * Feature: Driver → Traveler
 * ✅ POST-PIVOT CLEAN (Sprint 1 Complete)
 *
 * ❌ PERMANENTLY REMOVED (on-demand / gig model):
 *   DriverDashboard         → replaced by /app/my-trips?tab=as-driver
 *   DriverApp               → replaced by /app/my-trips?tab=as-driver
 *   DriverWallet            → replaced by /app/my-earnings (TravelerEarnings)
 *   RideRequests            → instant accept/reject (not advance booking)
 *   HeatMap                 → demand zones (no surge pricing)
 *   DriverIncentives        → sign-up bonuses (gig model, not carpooling)
 *   QuestRewards            → gamification for gig workers
 *   EarningsGuaranteeTracker → minimum earnings guarantee (gig model)
 *   DynamicPricing          → surge pricing (fixed cost-sharing only)
 *   SurgeAnalytics          → surge analytics (fixed cost-sharing only)
 *   AIVoiceCommands         → over-engineered for MVP
 *   ARNavigation            → not needed (travelers use personal GPS)
 *
 * ✅ CARPOOLING EQUIVALENTS:
 *   Post ride    → /features/carpooling/PostRide
 *   Search rides → /features/carpooling/SearchRides
 *   Book ride    → /features/carpooling/BookRide
 *   Earnings     → /features/carpooling/TravelerEarnings
 *   My trips     → /components/MyTrips
 */

// ─── Carpooling-compatible traveler tools ─────────────────────────────────────
export { SchoolRunOpportunity } from '../../components/driver/SchoolRunOpportunity';