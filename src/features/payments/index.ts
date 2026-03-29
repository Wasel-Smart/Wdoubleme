/**
 * Feature: Payments
 * Strangler Fig barrel — re-exports from original locations.
 * PaymentFlow is the canonical orchestrator (Phase 3 consolidation — COMPLETE).
 */

// ─── CANONICAL ORCHESTRATOR (Phase 3 ✅) ──────────────────────────────────────
// Use PaymentFlow for ALL payment experiences. Pass the `mode` prop:
//   - mode="overview"  → Wallet dashboard
//   - mode="methods"   → Payment method management
//   - mode="gateways"  → Gateway selection (CliQ, Mada, Stripe, etc.)
//   - mode="split"     → Split payment with friends
//   - mode="promos"    → Promo code management
//   - mode="checkout"  → Stripe checkout form
export { PaymentFlow } from './PaymentFlow';
export type { PaymentMode } from './PaymentFlow';

// ─── CANONICAL COMPONENTS (Phase 2) ───────────────────────────────────────────
export { PaymentMethodList } from './PaymentMethodList';

// ─── NEW: CULTURALLY-ALIGNED PAYMENT METHODS ──────────────────────────────────
export { CODPayment } from './CODPayment';
export { BNPLPayment } from './BNPLPayment';

// ─── LEGACY COMPONENTS (deprecated — use PaymentFlow instead) ─────────────────
// These still exist for backward compatibility but should NOT be used directly.
// They are lazy-loaded inside PaymentFlow.
export { Payments } from '../../components/Payments';
export { PaymentGateways } from '../../components/PaymentGateways';
export { SplitPayment } from '../../components/SplitPayment';
export { PromoCodesManager } from '../../components/PromoCodesManager';
export { StripePaymentForm } from '../../components/StripePaymentForm';

// ─── DEPRECATED ALIASES (Phase 2 naming cleanup) ──────────────────────────────
export { PaymentMethodList as PaymentMethodsEnhanced } from './PaymentMethodList';