# Wasel — Production Architecture

## Domain Structure

The application is organized into **14 domains**. Each domain owns its routes,
components, hooks, and types. Cross-domain communication happens only through
`services/` or `utils/` — never by importing across feature folders.

```
src/
├── App.tsx                   # Root: ErrorBoundary + Providers
├── main.tsx                  # Entry: Sentry init + React mount + Web Vitals
├── wasel-routes.tsx          # All routes (lazy-loaded, no ghost redirects)
│
├── pages/                    # Thin page shells — no business logic
│   ├── WaselLanding.tsx      # /
│   ├── WaselAuth.tsx         # /auth
│   ├── WaselDashboard.tsx    # /dashboard
│   ├── WaselServicePage.tsx  # /find-ride, /offer-ride, /packages, /bus
│   ├── WaselInnovationHub.tsx # /innovation-hub
│   └── WaselTrustCenter.tsx  # /trust
│
├── layouts/
│   └── WaselRoot.tsx         # Header + nav + mobile drawer + outlet
│
├── features/                 # Domain modules (one folder = one domain)
│   ├── auth/                 # Sign in, register, OAuth
│   ├── trips/                # MyTripsPage, trip history
│   ├── awasel/               # Package delivery (Awasel brand)
│   ├── raje3/                # Return matching
│   ├── wallet/               # Payments, escrow, earnings
│   ├── notifications/        # Notification center
│   ├── profile/              # ProfilePage (identity, stats, verification)
│   ├── preferences/          # SettingsPage (all app settings)
│   ├── legal/                # PrivacyPolicy, TermsOfService
│   ├── safety/               # Trust center
│   ├── intelligence/         # AI route optimization, demand prediction
│   ├── payments/             # Stripe integration
│   ├── driver/               # Driver dashboard, vehicle, earnings
│   └── admin/                # Admin-only tools (restricted)
│
├── components/               # Shared UI only — no business logic
│   ├── wasel-ds/             # Design System primitives (DS*)
│   └── wasel-ui/             # Branded composites (Wasel*)
│
├── contexts/                 # React contexts (auth, language, theme)
├── hooks/                    # Custom hooks (data access layer)
├── services/                 # API clients and data services
├── utils/                    # Pure utilities (no React)
├── types/                    # TypeScript types
├── styles/                   # Global CSS + design tokens
├── tokens/                   # Design token definitions
├── config/                   # App configuration
├── supabase/                 # DB schema and migrations
└── locales/                  # i18n translation files
```

---

## Architecture Rules

### 1 — Domain isolation
Features never import from each other. Use `services/` or `utils/` for shared logic.

```
✅  import { authAPI } from '../../services/auth';
❌  import { something } from '../wallet/internal';
```

### 2 — Thin pages
Pages are shells that compose feature components. No business logic in pages.

```tsx
// ✅ Correct
export default function ProfilePage() {
  return <UserProfileFeature />;
}

// ❌ Wrong — business logic in a page
export default function ProfilePage() {
  const [data, setData] = useState(...);
  useEffect(() => { fetch(...) }, []);
  ...
}
```

### 3 — Hook-first data access
Components never call services directly. They use hooks.

```
✅  const { trips } = useMyTrips();
❌  const trips = await tripsService.getAll();  // in a component
```

### 4 — Route completeness
Every route resolves to a real component. No `RedirectTo` for missing pages.

```
✅  path: 'profile' → ProfilePage
❌  path: 'profile' → RedirectTo('/dashboard')  // ghost route
```

### 5 — Type safety
`strict: true` in tsconfig. No `any` without explicit justification comment.

---

## Production Hardening Checklist

| Concern | Status | Implementation |
|---|---|---|
| Error monitoring | ✅ LIVE | Sentry initialized in `main.tsx` |
| CSP headers | ✅ LIVE | `src/public/_headers` + `vercel.json` |
| Input sanitization | ✅ LIVE | `utils/sanitize.ts` throughout forms |
| Auth rate limiting | ✅ LIVE | `utils/security.ts` checkRateLimit |
| Password strength | ✅ LIVE | `utils/security.ts` checkPasswordStrength |
| TypeScript strict | ✅ LIVE | `tsconfig.json` strict: true |
| Feature flags | ✅ LIVE | `utils/featureFlags.ts` phase-based |
| Web Vitals | ✅ LIVE | `main.tsx` — CLS, INP, FCP, LCP, TTFB |
| Route completeness | ✅ LIVE | All routes resolve — no ghost redirects |
| Chunk splitting | ✅ LIVE | `vite.config.ts` — 7 vendor chunks |
| PWA manifest | ✅ LIVE | `src/public/manifest.json` |
| Security headers | ✅ LIVE | `_headers` + `vercel.json` |

---

## Deployment

```bash
# Build
npm run build

# Verify before shipping
npm run verify   # type-check + test + build

# Output → /build (static files, deploy anywhere)
```

Hosts: Vercel (vercel.json configured), Netlify (_headers configured), Cloudflare Pages.
