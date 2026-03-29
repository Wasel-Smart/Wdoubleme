/**
 * Feature: Premium
 * Barrel re-exports for premium/engagement features.
 *
 * NOTE: ARNavigation and AIVoiceCommands removed (not needed for BlaBlaCar carpooling MVP).
 */

// ── Gamification (community trust, not gig bonuses) ──────────────────────────
export { GamificationHub } from '../../components/gamification/GamificationHub';

// ── In-trip entertainment ─────────────────────────────────────────────────────
export { InRideEntertainment } from '../../components/entertainment/InRideEntertainment';

// ── AI ride prediction ────────────────────────────────────────────────────────
export { RidePredictionAI } from '../../components/ai/RidePredictionAI';

// ── Carbon tracking (eco-carpooling) ──────────────────────────────────────────
export { CarbonTracking } from './CarbonTracking';

// ── Social community hub ──────────────────────────────────────────────────────
export { SocialHub } from '../../components/social/SocialHub';

// ── Wasel Plus dashboard ──────────────────────────────────────────────────────
export { Dashboard as PremiumDashboard } from './Dashboard';
