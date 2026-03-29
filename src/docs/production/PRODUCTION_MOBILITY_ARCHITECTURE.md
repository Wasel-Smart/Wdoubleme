# Wasel Production Mobility Architecture

## 1. Target System

This platform is implemented as a unified mobility and logistics operating system with one financial core and one identity trust model:

- Identity authority: SANAD + OTP
- Financial authority: wallet-ledger and payment ecosystem
- Operational authority: trip engine + package engine
- Governance authority: admin control plane + audit logs

## 2. Runtime Topology

### Frontend

- Vite + React client
- Mobile-first route groups for passenger, driver, package, wallet, and admin
- Supabase auth session on client
- Wallet, booking, and verification flows call API gateway or edge functions only

### Application Layer

- Supabase Edge Functions are the execution boundary for:
- OTP request/verify
- SANAD verification orchestration
- wallet top-up, transfer, withdrawal, and payout orchestration
- trip create/book/start/complete flows
- package assign/in-transit/delivery flows
- admin moderation and approvals
- real-time metrics aggregation

### Data Layer

- Supabase Postgres is the source of truth
- Realtime channels publish trip presence, wallet events, package events, and admin live metrics
- Row-level security enforces actor isolation
- Admin access is granted through app role checks, not client trust

### External Integrations

- SANAD adapter:
- `POST /api/v1/verification/sanad/start`
- `POST /api/v1/verification/sanad/callback`
- Payment adapters:
- card gateway
- local gateway
- future government payment APIs
- OTP provider:
- SMS provider for login and high-risk actions

## 3. Canonical Domain Model

### Identity

- `users`
- `verification_records`
- `otp_sessions`

Verification ladder:

- `level_0`: unverified
- `level_1`: phone verified
- `level_2`: SANAD verified
- `level_3`: full driver verified

### Driver Operations

- `drivers`
- `vehicles`
- `trips`
- `trip_presence`

### Passenger Operations

- `bookings`

### Package Logistics

- `packages`
- `package_events`

### Financial System

- `wallets`
- `transactions`
- `payment_methods`

### Governance

- `admin_logs`

## 4. Non-Negotiable Rules

### Identity gates

- Any ride booking requires at least `level_1`
- Wallet transfer and withdrawal require OTP step-up
- Driver onboarding requires `level_2` before document review
- Driver activation requires `level_3`

### Financial rules

- Every money movement must create a `transactions` row
- Wallet balance is the result of posted credits minus posted debits
- Ride booking debits passenger wallet first; external payment rails top up wallet or settle intent before booking completion
- Package booking uses the same wallet-first model
- Driver earnings are wallet credits, not direct balance mutation

### Operational rules

- Trips only accept bookings in `open` or `booked`
- Package assignment only succeeds when trip package capacity exists
- Delivery completion is the trigger for package driver earnings
- Booking completion is the trigger for ride driver earnings

### Governance rules

- All privileged admin actions write `admin_logs`
- User blocking freezes trip and payment privileges
- Suspicious wallet patterns route to admin review

## 5. Service Boundaries

### Identity Service

Responsibilities:

- OTP enrollment and verification
- SANAD request generation
- SANAD callback validation
- verification level state transitions
- document review events

Writes:

- `users`
- `verification_records`
- `otp_sessions`
- `admin_logs`

### Wallet Service

Responsibilities:

- add funds
- withdraw funds
- transfer funds
- ride payment capture
- package payment capture
- driver earning credit
- refunds and reversals

Writes:

- `wallets`
- `transactions`
- `admin_logs`

### Trip Service

Responsibilities:

- create trip
- search trip
- reserve seat
- update lifecycle
- live trip status

Writes:

- `trips`
- `bookings`
- `trip_presence`
- `admin_logs`

### Package Service

Responsibilities:

- create package
- assign package to trip
- progress tracking
- confirm delivery

Writes:

- `packages`
- `package_events`
- `transactions`
- `admin_logs`

### Admin Service

Responsibilities:

- approve drivers
- block users
- monitor payments
- monitor verification
- operational analytics

Writes:

- `admin_logs`
- governed domain tables

## 6. Real-Time Channels

Realtime event topics:

- `trip:{trip_id}:presence`
- `trip:{trip_id}:bookings`
- `package:{package_id}:events`
- `wallet:{wallet_id}:transactions`
- `admin:ops:live`

Client payloads:

- keep under 2 KB
- publish IDs and summary state, not full PII

## 7. Security Model

### Authentication

- Supabase auth session
- OTP for first-factor login on phone-based flows

### Authorization

- Row-level security on all core tables
- `users.role` is the application role source
- server-side functions re-check role and ownership before write actions

### Sensitive data handling

- National ID stored encrypted or pre-encrypted before persistence
- National ID search uses hash column only
- Payment tokens never stored raw in application tables

### Fraud controls

- velocity checks on top-up, transfer, and withdrawal
- OTP step-up on transfer and withdrawal
- admin freeze on suspicious accounts
- immutable transaction log

## 8. Production Services to Implement Next

Priority order:

1. SANAD edge adapter with signed callback verification
2. wallet orchestration edge service wrapping SQL functions
3. trip booking API using `app_book_trip`
4. package assignment and delivery APIs
5. admin approval APIs
6. real-time ops aggregator

## 9. Deployment Shape

- Frontend: Vercel or Netlify
- Backend: Supabase project with isolated prod environment
- Secrets:
- SANAD client credentials
- payment gateway secrets
- SMS API key
- app encryption key
- Monitoring:
- Sentry for frontend
- Supabase logs
- uptime checks on edge functions
- scheduled backup verification

## 10. Exit Criteria For Production Readiness

- all privileged flows executed through API gateway or edge function
- wallet and booking operations fully auditable
- SANAD and OTP verification enforced by policy and API
- driver approval changes verification to `level_3`
- real-time dashboard shows active trips, active drivers, moving packages, and wallet throughput
