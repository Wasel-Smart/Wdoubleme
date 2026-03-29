# Wasel — Jordan's Intercity Mobility Platform

Corridor-first ride marketplace connecting passengers, drivers, businesses, and schools across Jordan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 6 |
| Routing | React Router 7 (lazy-loaded routes) |
| Styling | Tailwind CSS 4 + Wasel Design System |
| Data | Supabase (Postgres + Realtime + Auth) |
| State | TanStack Query v5 |
| UI Primitives | Radix UI |
| Payments | Stripe |
| Notifications | Firebase Cloud Messaging |
| Error Monitoring | Sentry |
| Testing | Vitest + Playwright |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your keys in .env

# 3. Run in development
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run type-check` | TypeScript check only |
| `npm run verify` | Full verification: types + tests + build |

---

## Project Structure

```
src/
├── App.tsx              # App root with ErrorBoundary
├── wasel-routes.tsx     # All routes (lazy-loaded)
├── main.tsx             # React DOM entry point
│
├── pages/               # Top-level page components
├── layouts/             # WaselRoot layout + header
├── features/            # Feature modules (auth, wallet, trips…)
├── components/          # Shared UI components
│   ├── wasel-ds/        # Wasel Design System primitives
│   └── wasel-ui/        # Wasel-branded composites
├── contexts/            # React contexts (Auth, Language, Theme)
├── hooks/               # Custom React hooks
├── services/            # API & data services
├── utils/               # Utilities & helpers
├── types/               # TypeScript types
├── styles/              # Global CSS + design tokens
├── tokens/              # Design token definitions
├── config/              # App configuration
├── supabase/            # DB schema & migrations
└── locales/             # i18n translations
```

---

## Core Services

| Service | Path |
|---|---|
| Find a Ride | `/find-ride` |
| Offer a Ride | `/offer-ride` |
| Package Lanes (Awasel) | `/packages` |
| Raje3 Returns | `/raje3` |
| Business Accounts | `/services/corporate` |
| School Transport | `/services/school` |
| Innovation Hub | `/innovation-hub` |
| Core Wallet | `/wallet` |
| Trust Center | `/trust` |

---

## Environment Variables

See `.env.example` for all required and optional variables.  
**Never commit `.env` files.** They are in `.gitignore`.

---

## Deployment

```bash
npm run build
# Output: /build
# Deploy /build to your static host (Vercel, Netlify, Cloudflare Pages, etc.)
```

Recommended: Set `VITE_APP_URL` to your production domain before building.
