/**
 * Wasel UI Components — Barrel v2.0
 * Brand-opinionated components built on top of wasel-ds tokens.
 * Dark glassmorphic style. Used in dashboard surfaces.
 */

// ── Cards ─────────────────────────────────────────────────────────────────────
export { WaselCard } from './WaselCard';
export type { WaselAccent } from './WaselCard';

// ── Badges ────────────────────────────────────────────────────────────────────
export { WaselBadge } from './WaselBadge';

// ── Section Headers ───────────────────────────────────────────────────────────
export { WaselSectionHeader } from './WaselSectionHeader';

// ── AI Recommendations ────────────────────────────────────────────────────────
export { AIRecommendations } from './AIRecommendations';

// ── Trip Card (carpooling listing) ────────────────────────────────────────────
export { WaselTripCard } from './WaselTripCard';
export type { WaselTripCardProps, TripDriver, TripFeatures } from './WaselTripCard';

// ── Driver Card ───────────────────────────────────────────────────────────────
export { WaselDriverCard } from './WaselDriverCard';
export type { WaselDriverCardProps, DriverStats, DriverVehicle } from './WaselDriverCard';

// ── Stats ─────────────────────────────────────────────────────────────────────
export { WaselStatsRow, WaselStatCard, WaselKPIBanner } from './WaselStatsRow';
export type { StatItem } from './WaselStatsRow';

// ── Inputs (dark-surface) ─────────────────────────────────────────────────────
export { WaselInput, WaselSearchBar, WaselSelect, WaselToggle, WaselChipGroup } from './WaselInput';
