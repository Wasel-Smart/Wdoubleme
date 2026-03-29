/**
 * Wasel — Domain Architecture Registry
 *
 * Single source of truth for domain ownership.
 * Every feature belongs to exactly ONE domain.
 * Cross-domain access is always through a public API (exported from index.ts).
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Domain         │  Owner path               │  Status       │
 * ├─────────────────────────────────────────────────────────────┤
 * │  auth           │  features/auth            │  LIVE         │
 * │  trips          │  features/trips           │  LIVE         │
 * │  packages       │  features/awasel          │  LIVE         │
 * │  returns        │  features/raje3           │  LIVE         │
 * │  wallet         │  features/wallet          │  LIVE         │
 * │  notifications  │  features/notifications   │  LIVE         │
 * │  profile        │  features/profile         │  LIVE         │
 * │  preferences    │  features/preferences     │  LIVE         │
 * │  legal          │  features/legal           │  LIVE         │
 * │  safety/trust   │  features/safety          │  LIVE         │
 * │  intelligence   │  features/intelligence    │  LIVE         │
 * │  payments       │  features/payments        │  LIVE         │
 * │  driver         │  features/driver          │  LIVE         │
 * │  admin          │  features/admin           │  RESTRICTED   │
 * └─────────────────────────────────────────────────────────────┘
 *
 * RULES:
 *  1. Features never import from each other directly.
 *     Use shared services/* or utils/* instead.
 *  2. Pages (src/pages/) are thin shells — no business logic.
 *  3. Components (src/components/) are UI primitives only.
 *  4. All data fetching lives in services/ or hooks/.
 *  5. All types are declared in types/ or feature/types.ts.
 */

// ── Core domain exports ───────────────────────────────────────────────────────

// Auth
export { LocalAuthProvider, useLocalAuth }     from '../contexts/LocalAuth';
export { AuthProvider, useAuth }               from '../contexts/AuthContext';

// Language / i18n
export { LanguageProvider, useLanguage }       from '../contexts/LanguageContext';

// Theme
export { ThemeProvider }                       from '../contexts/ThemeContext';

// Sidebar
export { SidebarProvider, useSidebar }         from '../contexts/SidebarContext';

// ── Feature domain public APIs ────────────────────────────────────────────────

// Wallet
export { WalletDashboard }                     from './wallet';

// Notifications
export { NotificationsPage }                   from './notifications/NotificationsPage';

// Legal
export { PrivacyPolicy }                       from './legal/PrivacyPolicy';
export { TermsOfService }                      from './legal/TermsOfService';

// ── Shared hook registry ──────────────────────────────────────────────────────
// All hooks are exported from src/hooks/index.ts — import from there.

// ── Service registry ──────────────────────────────────────────────────────────
// All services are in src/services/ — import directly.
// Never import a service inside a component — use a hook instead.

// ── Design system ────────────────────────────────────────────────────────────
// Primitive components: src/components/wasel-ds/
// Composite components: src/components/wasel-ui/
// Design tokens:        src/tokens/
// Global styles:        src/styles/globals.css
