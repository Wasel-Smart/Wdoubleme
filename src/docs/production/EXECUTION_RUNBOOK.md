# Wasel Execution Runbook

## 1. Passenger Flow

### Find Trip -> Book Seat -> Pay -> Track Trip

1. User signs in with OTP.
2. System creates or resolves `users` record.
3. OTP success upgrades verification to `level_1`.
4. Passenger opens trip search.
5. API returns only `trips.trip_status in ('open','booked')`.
6. Passenger chooses seat.
7. Booking endpoint validates:
- user not blocked
- verification at least `level_1`
- seat available
- wallet balance sufficient or top-up intent completed
8. `app_book_trip` debits wallet and creates `bookings`.
9. Client subscribes to:
- `trip:{tripId}:presence`
- `trip:{tripId}:bookings`
10. Driver starts trip and system updates trip status to `in_progress`.
11. Upon completion:
- trip -> `completed`
- booking -> `completed`
- `app_credit_driver_earnings` credits driver wallet

## 2. Driver Flow

### Create Trip -> Accept Bookings -> Drive -> Receive Earnings

1. User completes SANAD verification.
2. Admin reviews driver documents and vehicle registration.
3. Admin approves driver:
- driver status -> `approved`
- user verification level -> `level_3`
- admin log written
4. Driver creates trip.
5. `app_create_trip` inserts trip and `trip_presence`.
6. Passengers book seats.
7. Driver monitors booking roster in real time.
8. Driver starts trip:
- status -> `in_progress`
- presence feed starts heartbeat writes
9. Driver completes trip.
10. System credits earnings from completed bookings to driver wallet.

## 3. Package Flow

### Create Shipment -> Assign Trip -> Deliver Package

1. Sender creates package request.
2. Package stored in `packages` with status `created`.
3. Dispatcher or auto-matcher assigns package to eligible trip.
4. `app_assign_package_to_trip`:
- validates package capacity
- debits sender wallet
- sets package status to `assigned`
- writes package event
5. Driver picks up package:
- package status -> `in_transit`
- event added
6. Delivery confirmation:
- package status -> `delivered`
- `app_confirm_package_delivery` credits driver wallet
- delivery event recorded

## 4. SANAD Verification Workflow

### Verification Center UI

Display:

- verification status
- identity level
- document upload status
- next required action

### Flow

1. User enters national ID.
2. API creates pending `verification_records`.
3. Edge function starts SANAD session with provider reference.
4. User completes SANAD challenge.
5. SANAD callback endpoint validates signature.
6. System updates:
- `verification_records.sanad_status`
- `users.sanad_verified_status`
- `users.verification_level = level_2`
7. If driver documents are approved, admin promotes to `level_3`.

## 5. Wallet Core Logic

### Supported actions

- add funds
- withdraw funds
- transfer funds
- pay for ride
- pay for package
- receive driver earnings

### Rules

- all actions create `transactions`
- transfers create one debit and one credit
- ride and package payments are debits on customer wallet
- driver earnings are credits on driver wallet
- withdrawals require OTP step-up

## 6. Admin Control Panel

### Modules

- user management
- driver approval queue
- trip monitoring
- payment monitoring
- verification monitoring
- fraud monitoring
- live operations

### Admin actions

- approve driver
- reject verification
- freeze wallet
- block user
- reverse transaction
- mark package dispute
- inspect trip telemetry

Every admin action must:

- execute server-side only
- write `admin_logs`
- return audit reference to UI

## 7. Real-Time Dashboard Feed

Metrics to publish every 5 to 15 seconds:

- active drivers
- active trips
- passengers traveling
- packages moving
- wallet transactions in last hour
- verification queue count
- fraud queue count

Source of truth:

- SQL materialized or cached aggregate queries from trips, bookings, packages, transactions, and drivers

## 8. Security Implementation Checklist

- OTP on login and sensitive finance actions
- JWT auth on all protected APIs
- RLS enabled on all core tables
- national ID encrypted before persistence
- payment tokens stored as provider references only
- transfer and withdrawal rate limiting
- admin actions logged
- suspicious activity workflow for repeated failures, rapid transfers, and abnormal booking/payment behavior

## 9. Deployment Readiness

### Required environments

- local
- staging
- production

### Required secrets

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SANAD_BASE_URL`
- `SANAD_CLIENT_ID`
- `SANAD_CLIENT_SECRET`
- `SANAD_WEBHOOK_SECRET`
- `PAYMENT_GATEWAY_SECRET`
- `LOCAL_GATEWAY_SECRET`
- `SMS_PROVIDER_KEY`
- `APP_ENCRYPTION_KEY`

### Monitoring

- Sentry frontend error tracking
- edge function latency dashboards
- failed payment alerting
- failed verification alerting
- database backup success alerting

## 10. First Implementation Sprint

Ship in this order:

1. apply `20260327090000_production_operating_model.sql`
2. wrap SQL functions with edge functions under `/functions`
3. connect wallet UI to canonical `/wallet` endpoints
4. connect verification center to SANAD adapter
5. enforce driver approval workflow in admin
6. switch trip and package booking flows to wallet-first execution
7. publish live ops metrics to realtime dashboard
