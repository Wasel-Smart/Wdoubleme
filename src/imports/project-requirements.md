Project: Wasel
Architecture Constraint: Maintain full alignment with SmarT e-SOSTAC framework
Objective: Deliver a fully functional, beta-ready prototype with stable booking flow, clean architecture, and consistent UI system.

1. ARCHITECTURE ENFORCEMENT — SmarT e-SOSTAC Alignment

Ensure every screen, component, and interaction maps to one of the following layers:

S — Situation

Dashboard: Active trips, availability, system status.

RecommendedForYou based on routes + behavior.

Real-time booking state visibility.

O — Objectives

Clear conversion goal: Book seat / Offer ride.

KPIs visible in driver analytics (seat fill %, completion rate).

S — Strategy

Core focus: Daily commute + structured routes only.

No on-demand taxi logic.

Remove feature drift.

T — Tactics

Booking lifecycle:

Search route

View details

Book seat

Driver Accept/Reject

Confirmed trip

Completion

CostSharing component integrated before payment.

MosqueDirectory + PopularRoutes as discovery drivers.

A — Action

Clear primary CTA hierarchy:

Primary: Book Seat

Secondary: Offer Ride

Tertiary: Save / Share

All buttons must have loading + disabled states.

No ambiguous interaction.

C — Control

Implement GET /trips/my as unified source of truth.

Ensure seat restoration on cancellation.

Add clear success / failure UI states.

Ensure no duplicate state handling across components.

2. BOOKING FLOW — MUST BE STABLE

Enforce strict booking logic:

Prevent double submission.

Accept/Reject must pass correct booking ID.

Real-time seat decrement on confirm.

Real-time seat increment on cancellation.

Consistent trip status badges:

Pending

Accepted

Rejected

Cancelled

Completed

No UI state should update without backend confirmation.

3. UI SYSTEM CONSISTENCY

Replace all hardcoded hex with token system.

Enforce spacing scale (4/8/16/24/32).

Standardize:

Badge styles

Button variants

Input fields

Error messages

Arabic language consistency:
Choose one:

MSA (recommended for scale), OR

Jordanian Ammiyah
Apply globally.

4. CLEAN ARCHITECTURE REQUIREMENTS

Remove completely:

ARNavigation

VoiceCommands

dynamic-pricing

EarningsGuaranteeTracker

Ensure:

No broken imports.

No unused components.

No dead routes.

No duplicate booking logic.

5. DASHBOARD STRUCTURE (BETA READY)

Dashboard must include:

Active Trips

My Trips (GET /trips/my)

RecommendedForYou

Quick Actions

Seat availability summary

Layout must be responsive and modular.

6. DELIVERY STANDARD

Output must represent:

Production-structured prototype

Clean modular hierarchy

No feature confusion

Stable core commute logic

Beta-ready flow validation

Do not redesign branding.
Do not add new speculative features.
Stabilize. Align. Simplify. Prepare for scale.