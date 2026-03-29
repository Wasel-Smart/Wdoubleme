System Objective:
Stabilize the Wasel prototype and enforce SmarT e-SOSTAC architectural compliance. Deliver a fully functional, beta-ready booking flow with clean component structure, real API wiring, and consistent UI tokens.

🔴 PHASE 1 — CRITICAL FIXES (App currently broken)
1. Driver Accept/Reject Flow

Create a new BookingRequests panel under Driver Dashboard.

UI must:

Display pending booking cards.

Include Accept / Reject buttons.

Show passenger name, trip ID, seat count, pickup location.

Wire to backend:

Fix server keying bug (ensure booking ID is correctly passed).

Accept → PATCH/PUT status = “accepted”

Reject → PATCH/PUT status = “rejected”

Remove any legacy booking modal logic.

2. Seat Restoration Logic

Update PUT /bookings/:id cancel

Add seat increment logic:

On cancel → increase trip.availableSeats += booking.seatsBooked

Ensure idempotency (prevent double increment).

Reflect restored seats immediately in UI.

3. GET /trips/my Endpoint

Create standalone server endpoint:

GET /trips/my

Returns trips created by logged-in user.

Remove dependency on global /trips filtering.

Wire MyTrips screen to this endpoint.

🟠 PHASE 2 — REQUIRED BUILD (Functional Alignment)
4. RecommendedForYou → Dashboard

Integrate RecommendedForYou component into Dashboard.

Data source: real API.

Position below main search section.

5. Replace Dashboard Mock Data

Remove all hardcoded trip arrays.

Use GET /trips live call.

Implement loading + empty + error states.

6. Remove AI Components from Dashboard

Delete:

AIStatusBar

AICommuteOptimizer
Remove imports and references.

7. CostSharing Component

Create:
/features/payments/CostSharing.tsx

Display:

Total trip cost

Cost per passenger

Seats booked

Accept props from trip object.

Token-based styling only.

8. MosqueDirectory Component

Create:
/features/routes/MosqueDirectory.tsx

Static data placeholder (structured for API later).

List format with:

Mosque name

Distance

Location button

Use shared card component.

🟡 PHASE 3 — ARCHITECTURE CLEANUP

Delete permanently:

ARNavigation

VoiceCommands

dynamic-pricing

EarningsGuaranteeTracker

Remove:

Imports

Routes

Feature flags

Dead state logic

Ensure folder structure remains modular and feature-based.

🔵 PHASE 4 — UI POLISH & DESIGN SYSTEM COMPLIANCE
10. Token Compliance

Replace all hardcoded hex values in MyTrips

Use design tokens (colors, spacing, typography).

Ensure dark/light compatibility.

11. Status Badge Standardization

Create shared component:
/components/StatusBadge.tsx

Accepts:

status type

label

Map status to semantic tokens (success, warning, danger, neutral).

Replace all inline badge styling across app.

12. Arabic Localization Audit

Review all Arabic strings.

Standardize dialect (Modern Standard Arabic only).

Ensure:

Consistent terminology for Trip, Booking, Cancel, Accept, Reject.

Proper RTL alignment.

No mixed slang.

FINAL REQUIREMENTS

Maintain SmarT e-SOSTAC structural integrity.

No mock data in production flows.

No unused imports.

No duplicated components.

Ensure booking lifecycle:
Create → Request → Accept/Reject → Cancel → Seat Restore → Status Update works end-to-end.

Deliver stable, clean, production-structured prototype ready for beta validation.