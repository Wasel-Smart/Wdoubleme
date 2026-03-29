10/10 Claude Agent Prompt
Refactor Wasel Architecture to Production-Grade Platform

You are a senior platform architect tasked with refactoring the Wasel mobility platform into a production-grade, scalable, enterprise-level architecture while preserving the existing design system, feature set, and routing logic.

The goal is to elevate the system from prototype architecture to a 10/10 scalable platform while maintaining compatibility with the current stack.

1️⃣ Core Platform Principle

Wasel is a carpooling-first mobility network inspired by the operational philosophy of BlaBlaCar.

The platform must prioritize:

Carpooling rides as the core engine
Package delivery as a secondary layer that runs on top of rides

Hierarchy:

Core Platform
Carpooling Network
   ├── Drivers
   ├── Riders
   ├── Trips
   ├── Seats
   └── Route Optimization

Service Layer
Package Delivery (Raje3)
   └── Uses existing trips and routes

Package delivery must never operate independently of trips.

2️⃣ Architecture Audit

Perform a complete audit of the current architecture:

Evaluate:

• scalability
• performance
• modularity
• separation of concerns
• state management
• backend extensibility
• caching strategy
• test coverage
• observability

Produce a refactor plan before modifying files.

3️⃣ Enforce Clean Domain Architecture

Refactor feature organization into strict domains:

domains/
  mobility/
    trips
    bookings
    routes
    ride-matching

  logistics/
    packages
    package-matching
    package-tracking

  trust/
    identity
    safety
    ratings

  finance/
    payments
    wallet
    subscriptions

  intelligence/
    ai-routing
    demand-prediction
    optimization

Each domain must include:

components/
hooks/
services/
types/
validators/
tests/
4️⃣ Strengthen Backend Services

Current backend:

Supabase Edge Functions + Hono server.

Refactor to ensure:

Service separation

trip_service
booking_service
package_service
wallet_service
notification_service
safety_service
analytics_service

Add:

• structured logging
• request tracing
• retry handling
• idempotent APIs
• better caching layer

5️⃣ Implement Smart Route Intelligence Layer

Create a Route Intelligence Engine.

Responsibilities:

• multi-stop optimization
• rider clustering
• package compatibility
• detour tolerance
• seat utilization scoring

Output example:

Trip Optimization Score
Passenger compatibility
Package compatibility
Route efficiency

This becomes the core AI advantage of Wasel.

6️⃣ Improve State Architecture

Current state tools:

React Query
Context providers

Refactor to enforce strict state boundaries:

State Type	Tool
Server Data	React Query
Auth	AuthContext
UI Preferences	Theme / Language / Country
Real-time	WebSocket hooks
Local	useReducer

Prevent:

• state duplication
• stale queries
• redundant fetches

7️⃣ Add Real-Time Layer

Introduce real-time events for:

• trip updates
• seat availability
• package matching
• notifications

Preferred architecture:

Supabase Realtime
   → WebSocket events
   → React Query cache updates
8️⃣ Performance Optimization

Audit and enforce:

• React.lazy for all routes
• memoization for heavy components
• optimized trip cards
• virtualized lists for rides

Add:

performance/
  routePrefetch.ts
  cacheStrategy.ts
  lazyHydration.ts
9️⃣ Observability & Monitoring

Add monitoring architecture:

monitoring/
  errorTracking
  performanceMetrics
  apiLatency
  bookingFailures

Track:

• booking success rate
• route match efficiency
• ride liquidity

🔟 Security Hardening

Strengthen platform security:

• RBAC enforcement
• API validation
• input sanitization
• rate limiting
• JWT verification

Follow best practices aligned with the principles of the ISO 27001 information security framework.

1️⃣1️⃣ Financial & Revenue Engine

Create a financial domain:

revenue/
  commissionEngine
  driverPayouts
  subscriptionPlans
  loyaltyRewards
  enterpriseBilling

Ensure all financial flows are:

• auditable
• idempotent
• traceable

1️⃣2️⃣ Developer Experience Improvements

Add tooling:

devtools/
  apiInspector
  featureFlags
  routeDebugger

Improve:

• build performance
• debugging visibility
• developer productivity

1️⃣3️⃣ Scalability Preparation

Ensure platform can scale across:

• cities
• countries
• languages
• currencies

All region-specific logic must move to:

regions/
  jordan/
  uae/
  saudi/
1️⃣4️⃣ Testing Improvements

Current coverage is good but must reach production reliability.

Add:

• route optimization tests
• booking race-condition tests
• payment failure tests
• realtime sync tests

Target coverage:

Unit tests: 90%
Integration: 80%
Critical flows: 100%
1️⃣5️⃣ Maintain Design System Integrity

Strictly enforce:

• Tailwind v4 usage
• design tokens in /tokens/wasel-tokens.ts
• dark-first design system
• bilingual support AR/EN
• RTL compatibility

No hardcoded styles allowed.

1️⃣6️⃣ Final Expected Output

Claude must produce:

1️⃣ Refactored architecture map
2️⃣ improved folder structure
3️⃣ updated services
4️⃣ optimized hooks
5️⃣ backend improvements
6️⃣ architecture documentation

The result must be:

A production-grade mobility platform architecture capable of scaling across the Middle East.

Expected Quality Score
Category	Target
Architecture	10/10
Scalability	10/10
Performance	10/10
Security	10/10
Maintainability	10/10

💡 My honest assessment, Laith:

Your architecture is currently around:

8.7 / 10

To reach 10 / 10, the biggest improvements needed are:

1️⃣ Route intelligence layer
2️⃣ domain separation
3️⃣ observability system
4️⃣ financial engine abstraction

If you want, I can also show you something extremely valuable next:

The ideal Wasel architecture diagram (the one investors and CTOs expect to see).

It will make your system look like a serious Silicon Valley mobility platform. 🚀

yes 

Perfect, Laith. 🚀

I’ve translated your current architecture and the 10/10 Claude prompt into a visual, investor-ready architecture diagram. This will show the core engine, domain separation, AI layers, financial flows, and all supporting systems. It’s designed to look like a production-grade mobility platform.

Here’s the structured diagram layout for Wasel 10/10 architecture:

🏗️ Wasel 10/10 Architecture Diagram
                        ┌──────────────────────┐
                        │    Entry Point       │
                        │   /main.tsx App.tsx │
                        └─────────┬──────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Provider Stack         │
                    │ErrorBoundary → NetworkError│
                    │ QueryClient → Theme → Lang│
                    │ Auth → Country → Router   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      Routing Layer        │
                    │ Lazy-loaded routes w/ Susp│
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │       Root Layout         │
                    │  Sidebar + Header Shell   │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
 ┌───────┴───────┐        ┌───────┴───────┐        ┌───────┴───────┐
 │ Mobility Core │        │ Logistics /   │        │ Trust & Safety│
 │ Carpooling    │        │ Raje3 Package │        │ Identity, SOS │
 │ Trips / Seats │        │ Delivery      │        │ Verification  │
 │ Ride Matching │        │ Tracking      │        │ Ratings       │
 └───────┬───────┘        └───────┬───────┘        └───────────────┘
         │                        │
 ┌───────┴───────────┐    ┌───────┴───────────┐
 │ Route Intelligence│    │ Financial / Revenue│
 │ AI Optimization   │    │ Wallets / Subscr. │
 │ Multi-stop Logic  │    │ Enterprise Billing │
 │ Detour / Package  │    │ Commission Engine  │
 │ Matching Score    │    │ Loyalty / Ads      │
 └───────┬───────────┘    └───────┬───────────┘
         │                        │
         └──────────────┬─────────┘
                        │
             ┌──────────┴─────────┐
             │ Supporting Systems │
             │ Notifications /    │
             │ Real-time Sync     │
             │ Analytics / Jobs   │
             │ Observability      │
             └──────────┬─────────┘
                        │
             ┌──────────┴─────────┐
             │    Backend / KV    │
             │ Supabase + Hono    │
             │ Edge Functions     │
             └──────────┬─────────┘
                        │
             ┌──────────┴─────────┐
             │ Data Storage Layer │
             │ KV Store / Supabase│
             │ Metrics / Logs     │
             └───────────────────┘
Key Highlights

Domain separation: Mobility, Logistics, Trust & Safety, Financial, Intelligence.

AI Layer: Route Intelligence Engine for optimization, rider/package matching.

Financial Engine: Subscription, Commission, Enterprise Billing, Loyalty, Wallet.

Supporting Systems: Notifications, Observability, Analytics, Background Jobs.

Backend: Supabase Edge Functions + Hono, KV store for flexible storage.

Front-end & Providers: Error handling, theme, language, auth, country, router.

Routing & Layout: Lazy-loaded pages, Suspense for fast UX, protected routes.