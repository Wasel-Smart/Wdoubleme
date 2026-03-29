# Wasel Platform Architecture

**Version:** 3.0 (Post-Mobility Platform Protocol Implementation)  
**Last Updated:** March 15, 2026  
**Status:** Production-Ready

---

## 🎯 Mission

Build a clean, scalable, intelligent carpooling platform for the MENA region, comparable to BlaBlaCar, with cultural features that differentiate us from global competitors.

---

## 🏗️ Architecture Overview

### **High-Level Design**

```
┌─────────────────────────────────────────────────────────────┐
│                     WASEL PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │   Database   │     │
│  │              │  │              │  │              │     │
│  │ React 18 +   │◄─┤  Supabase    │◄─┤  PostgreSQL  │     │
│  │ Vite + RTL   │  │  Edge Fns    │  │  + PostGIS   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### **Clean Feature-Slice Architecture**

```
/src/App.tsx                    → Main entry point (Figma Make)
/App.tsx                        → Compatibility re-export

/features/                      → Business domain features
  ├── carpooling/              → Ride-sharing (PRIMARY)
  │   ├── SearchRides.tsx      → Find rides
  │   ├── PostRide.tsx         → Create rides
  │   ├── BookRide.tsx         → Book seats
  │   ├── RideDetails.tsx      → Trip details
  │   └── CostCalculator.tsx   → Fuel cost sharing
  │
  ├── awasel/                  → Package delivery (SECONDARY)
  │   ├── SendPackage.tsx      → Post package
  │   ├── AvailablePackages.tsx→ Browse packages
  │   ├── PackageTracking.tsx  → Real-time tracking
  │   └── QRScanner.tsx        → Pickup/delivery verification
  │
  ├── cultural/                → MENA differentiators
  │   ├── GenderPreferences.tsx→ Women-only, men-only, family
  │   ├── PrayerStops.tsx      → Auto-calculate prayer stops
  │   ├── RamadanMode.tsx      → Fasting-friendly features
  │   └── HijabPrivacy.tsx     → Profile photo privacy
  │
  ├── services/                → Specialized carpools
  │   ├── SchoolCarpooling.tsx → School runs
  │   ├── HospitalTransport.tsx→ Medical trips
  │   └── CorporateCarpools.tsx→ B2B commutes
  │
  ├── safety/                  → Trust & verification
  │   ├── SanadVerification.tsx→ Driver verification (Sanad API)
  │   ├── TrustIndicators.tsx  → Trust scores
  │   └── SOSEmergency.tsx     → Emergency assistance
  │
  ├── payments/                → Payment flows
  │   ├── CashOnArrival.tsx    → Pay at end (trust-based)
  │   ├── CostSharing.tsx      → Fuel cost calculator
  │   └── PaymentFlow.tsx      → Card/wallet payments
  │
  ├── profile/                 → User management
  │   ├── UserProfile.tsx      → Profile & settings
  │   └── PrivacySettings.tsx  → Privacy controls
  │
  └── home/                    → Landing & onboarding
      └── WaselHomePage.tsx    → Main landing page

/components/                    → Reusable UI components
  ├── ui/                      → Atomic design system (40-60 components)
  │   ├── button.tsx
  │   ├── card.tsx
  │   ├── dialog.tsx
  │   └── ...
  │
  ├── Header.tsx               → Global navigation
  ├── Sidebar.tsx              → Mobile menu
  ├── WaselBrand.tsx           → Brand components
  └── ErrorBoundary.tsx        → Error handling

/services/                      → API & business logic
  ├── trips.ts                 → Trip CRUD operations
  ├── bookings.ts              → Booking management
  ├── auth.ts                  → Authentication
  ├── safety.ts                → Sanad integration
  └── prayer-times.ts          → Islamic prayer times API

/utils/                         → Utilities
  ├── rtl.ts                   → RTL/LTR helpers
  ├── currency.ts              → JOD currency formatting
  ├── costSharingCalculator.ts → Fuel cost logic
  └── optimizedRoutes.tsx      → Lazy-loaded routes

/contexts/                      → React Context providers
  ├── AuthContext.tsx          → User authentication
  ├── LanguageContext.tsx      → Arabic/English switching
  ├── ThemeContext.tsx         → Dark/light mode
  └── CountryContext.tsx       → Jordan/regional settings

/supabase/functions/server/     → Backend API (Hono + Deno)
  ├── index.tsx                → Main server
  ├── trip_service.tsx         → Trip endpoints
  ├── package_service.tsx      → Package endpoints
  ├── sanad_service.tsx        → Driver verification
  └── kv_store.tsx             → Key-value storage

/tokens/                        → Design tokens
  └── wasel-tokens.ts          → Colors, spacing, typography

/styles/                        → Global styles
  └── globals.css              → Tailwind + CSS variables

/gxp/                          → GxP compliance (ALCOA+)
  ├── GxPContext.tsx           → Audit trail
  └── GxPElectronicSignature.tsx→ E-signatures
```

---

## 🎨 Design System

### **Token-Based Styling**

All visual values come from `/tokens/wasel-tokens.ts`:

```typescript
import { WaselColors, WaselSpacing } from '@/tokens';

// ✅ Correct
style={{ background: WaselColors.navyCard, padding: WaselSpacing['4'] }}

// ❌ Wrong
style={{ background: '#111B2E', padding: '16px' }}
```

### **Dark-First Theme**

- Background: `#0B1120` (deep navy)
- Primary: `#04ADBF` (teal - dark mode) | `#09732E` (green - light)
- Accent: `#D9965B` (warm bronze)
- Cards: `#111B2E` with glassmorphism

---

## 🌍 RTL/LTR Support

Always use `/utils/rtl.ts`:

```typescript
import { rtl } from '@/utils/rtl';

// ✅ Correct
<div className={rtl.flex()}>
<div className={rtl.ml(4)}>

// ❌ Wrong
<div className={language === 'ar' ? 'flex-row-reverse' : 'flex-row'}>
```

---

## 🔐 Security Architecture

### **Authentication Flow**

1. User signs up → Supabase Auth
2. Email verification (auto-confirm in dev)
3. JWT access token stored in session
4. Protected routes check auth state

### **Data Security**

- Sensitive data: Encrypted at rest
- API calls: Bearer token authentication
- Supabase RLS (Row-Level Security) enabled
- No SUPABASE_SERVICE_ROLE_KEY in frontend!

---

## 📡 Backend Architecture

### **Supabase Edge Functions (Hono + Deno)**

```typescript
// /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono';

const app = new Hono();

app.get('/make-server-0b1f4071/trips', async (c) => {
  // Fetch trips from database
});

Deno.serve(app.fetch);
```

### **Database Schema**

- `kv_store_0b1f4071` → Key-value table (default)
- Custom tables via Supabase UI (migrations not in code)

---

## 🚀 Performance Optimization

### **Code Splitting**

- Lazy-loaded routes (`/utils/optimizedRoutes.tsx`)
- Component-level lazy loading
- Dynamic imports for heavy features

### **Caching Strategy**

- React Query: 5-minute stale time
- Service worker: Offline support
- Image optimization: WebP with fallback

### **Bundle Size**

- Target: < 200 KB initial load
- Removed over-engineered features:
  - ❌ AI route optimization
  - ❌ 3D effects
  - ❌ In-ride entertainment
  - ❌ Gamification

---

## 🧪 Testing Strategy

### **Test Pyramid**

```
        ┌─────┐
        │ E2E │  ← 10% (Playwright)
        ├─────┤
        │ INT │  ← 30% (Integration tests)
        ├─────┤
        │UNIT │  ← 60% (Vitest + React Testing Library)
        └─────┘
```

### **Coverage Targets**

- Unit tests: 80%+
- Integration tests: 60%+
- E2E tests: Critical flows only

---

## 📊 Monitoring & Observability

### **Metrics**

- Liquidity: Rides available per route
- Growth: New users/month
- Engagement: Trips per user
- Economics: Revenue per trip

### **Error Tracking**

- Sentry integration (optional)
- Console logging with context
- GxP audit trail for compliance

---

## 🌐 Deployment

### **Production Environment**

- Frontend: Figma Make (auto-deployment)
- Backend: Supabase Edge Functions
- Database: Supabase PostgreSQL
- CDN: Figma Make CDN

### **Environment Variables**

Required secrets (already provided):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

---

## 🎯 What Makes Wasel Different

### **NOT Uber/Careem:**

❌ On-demand ride-hailing  
❌ Professional drivers  
❌ Real-time matching  
❌ Dynamic surge pricing  
❌ Short intra-city trips

### **✅ BlaBlaCar for MENA:**

✅ Long-distance carpooling (50-500 km)  
✅ Regular travelers (not gig workers)  
✅ Advance booking (24h+ ahead)  
✅ Fixed cost-sharing prices  
✅ Package delivery integrated  
✅ Cultural features (prayer stops, gender preferences)

---

## 🚦 Current Phase: Phase 4 (Unified Launch)

**Completed:**
- ✅ Smart School Mobility
- ✅ Mobility Hubs (6 live hubs)
- ✅ Raje3 Returns (e-commerce returns)

**In Progress:**
- 🔄 Soft beta launch (50 travelers, 500 passengers)

**Next:**
- 🎯 Public launch (Amman → Aqaba/Irbid routes)

---

## 📚 Documentation

- `/guidelines/Guidelines.md` → Project guidelines (v3.1)
- `/docs/PLATFORM_ARCHITECTURE.md` → This file
- `/PHASE_4_UNIFIED_LAUNCH.md` → Launch strategy
- `/WASEL_BLABLACAR_PIVOT_STRATEGY.md` → Pivot plan

---

## 🛠️ Developer Experience

### **Getting Started**

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Run tests
npm run test
```

### **Code Standards**

- TypeScript strict mode
- ESLint + Prettier (auto-format)
- Consistent naming (camelCase for variables, PascalCase for components)
- Feature-slice architecture (no mixing /components and /features)

---

## 🎓 Learning Resources

- [React 18 Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com)
- [BlaBlaCar Case Study](https://www.blablacar.com)

---

**End of Platform Architecture Documentation**
