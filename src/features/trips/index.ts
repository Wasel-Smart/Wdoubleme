/**
 * Feature: Trips — Barrel re-exports
 * ✅ POST-PIVOT CLEAN (Sprint 1 Complete)
 * All on-demand matching, real-time requests, and gig-economy
 * exports have been removed. Only carpooling-relevant exports remain.
 *
 * ❌ REMOVED (on-demand / gig model):
 *   FindRide            → on-demand matching (contradicts BlaBlaCar pivot)
 *   RideRequests        → instant accept/reject (not advance booking)
 *   HeatMap             → demand zones (no surge pricing)
 *   DynamicPricing      → surge pricing (fixed cost-sharing only)
 */

// ─── Map ─────────────────────────────────────────────────────────────────────
export { MapWrapper } from '../../components/MapWrapper';
export type { MapMode } from '../../components/MapWrapper';

// ─── Carpooling trip components ───────────────────────────────────────────────
export { MyTrips } from '../../components/MyTrips';
export { LiveTripTracking } from '../../components/LiveTripTracking';
export { LiveTrip } from '../../components/LiveTrip';
export { LiveTripMap } from '../../components/LiveTripMap';
export { PopularRoutes } from '../../components/PopularRoutes';
export { CancelTrip } from '../../components/CancelTrip';
export { JourneyProgress } from '../../components/JourneyProgress';

// ─── Ride Filters ─────────────────────────────────────────────────────────────
export { RideFilters } from '../../components/RideFilters';
export { AdvancedFilters } from '../../components/AdvancedFilters';

// ─── Analytics ────────────────────────────────────────────────────────────────
export { TripAnalytics, TripAnalyticsEnhanced } from '../../components/TripAnalytics';
export { TripsAnalyticsDashboard } from '../../components/TripsAnalyticsDashboard';