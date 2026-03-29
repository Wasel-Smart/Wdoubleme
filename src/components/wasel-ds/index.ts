/**
 * Wasel Design System — Barrel v1.0
 * Import everything DS-layer from this single entry point.
 *
 * Layers:
 *  tokens       — DS constants (colors, spacing, radius, typography, shadows)
 *  DSButtons    — Button, ButtonGroup
 *  DSCards      — StatusCard, SurfaceCard, RideCard
 *  DSIcons      — Full icon set (line-based, 2px stroke)
 *  DSInputs     — DSInput, DSSearchInput, DSTextarea, DSOTPInput, DSInputLabel, DSInputGroup
 *  DSForms      — DSRideSearchForm, DSOfferRideForm, DSLoginForm, DSPackageForm
 *  DSNotifications — DSToast, DSToastContainer, DSNotifCard, DSAlertBanner, useDSToast
 *  DSMapUI      — DSMapUI
 *  DSBottomNav  — DSBottomNav
 *  DSMobileScreen — DSMobileScreen
 *  WaselLogo    — WaselMark, WaselWordmark, WaselLogotype
 */

// ── Tokens ────────────────────────────────────────────────────────────────────
export { DS } from './tokens';
export type { } from './tokens';

// ── Buttons ───────────────────────────────────────────────────────────────────
export { Button, ButtonGroup } from './DSButtons';

// ── Cards ─────────────────────────────────────────────────────────────────────
export { StatusCard, SurfaceCard, RideCard } from './DSCards';

// ── Icons ─────────────────────────────────────────────────────────────────────
export {
  IconHome, IconMapPin, IconNavigation, IconClock, IconStar, IconUser,
  IconPackage, IconActivity, IconShield, IconCheck, IconChevronRight,
  IconChevronDown, IconSearch, IconCar, IconWallet, IconBell, IconMenu,
  IconArrowRight, IconPhone, IconGrid,
} from './DSIcons';

// ── Inputs ────────────────────────────────────────────────────────────────────
export {
  DSInput, DSSearchInput, DSTextarea, DSOTPInput, DSInputLabel, DSInputGroup,
} from './DSInputs';

// ── Forms ─────────────────────────────────────────────────────────────────────
export {
  DSRideSearchForm, DSOfferRideForm, DSLoginForm, DSPackageForm,
} from './DSForms';

// ── Notifications ─────────────────────────────────────────────────────────────
export {
  DSToast, DSToastContainer, DSNotifCard, DSAlertBanner, useDSToast,
} from './DSNotifications';
export type { ToastVariant } from './DSNotifications';

// ── Map ───────────────────────────────────────────────────────────────────────
export { DSMapUI } from './DSMapUI';

// ── Navigation ────────────────────────────────────────────────────────────────
export { DSBottomNav } from './DSBottomNav';

// ── Mobile Screen ─────────────────────────────────────────────────────────────
export { DSMobileScreen } from './DSMobileScreen';

// ── Logo ──────────────────────────────────────────────────────────────────────
export { WaselMark, WaselLogo } from './WaselLogo';
