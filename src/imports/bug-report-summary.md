🔴 P0 — Critical Blockers (Core Loop Broken)
1. GET /packages/my — Server Endpoint Missing + No Sender History UI
The server stores packages as package:${sender_id}:${pkgId} but there is no /packages/my endpoint to retrieve them. AvailablePackages.tsx is the traveler's view (packages to carry), not the sender's history. A sender who posts a package has no way to see its status. This is the original P0 item from the prior gap analysis — still unbuilt.

2. CostSharing.tsx — Exists But Never Integrated Anywhere
/features/payments/CostSharing.tsx was created but is imported by zero files. The project-requirements.md (line 47) explicitly requires "CostSharing component integrated before payment." BookRide.tsx has a 3-step booking flow with a payment confirmation step that has its own inline price display but never renders CostSharing. The component is an orphan.

🟠 P1 — Functional Gaps (Required but Missing)
3. StatusBadge — Not Replacing statusBadgeClass() in MyTrips.tsx
The local function statusBadgeClass() still lives at line 70 of MyTrips.tsx and is still called at lines 358 (UpcomingCard) and 569 (DriverTripCard). StatusBadge was never imported into MyTrips.tsx. The plan says "replace all inline badge styling across app" — this is the primary callsite and it was not migrated.

4. AIStatusBar Still Active in Two Files
Removed from Dashboard.tsx ✅, but still imported and rendered in:

/components/admin/AdminDashboard.tsx line 27 (import) + line 373 (<AIStatusBar mode="admin" />)
/components/driver/DriverDashboard.tsx line 24 (import) + line 488 (<AIStatusBar mode="driver" />)
5. booking-requests and mosque-directory Missing from Sidebar
Both new features are routed and accessible by direct URL, but neither appears in Sidebar.tsx. The mainMenuItems array has no entry for booking-requests. Drivers who post rides have no persistent navigation path to their booking management panel — it only surfaces through Dashboard's QuickActions grid and the MyTrips "Bookings" button on DriverTripCard.

6. BookingRequests.tsx — Dead/Broken Destructuring in Filter Tabs
Line 201: {FILTERS.map(({ key, en, arLabel = ar ? '' : en }) => { — arLabel is not a property on the FILTERS objects, so the destructured default is always evaluated, making it dead/confusing code. The actual label rendering on line 213 does FILTERS.find(f => f.key === key)?.ar — correct, but the enclosing destructure calls ar (a hook-derived variable) at map-call time rather than render time, which is fine functionally but the arLabel default is evaluated eagerly inside the map callback's argument destruction. Minor code quality issue but visible in a code review.

🟡 P2 — Architecture Compliance (Stale References)
7. RootLayout.tsx — Stale Deleted-Feature References
Three live references to deleted files/routes:

Line 45: ar-navigation and voice-commands still in premiumPages Set
Lines 65–66: ar-navigation-pro → premium/ar-navigation and advanced-voice-commands → premium/voice-commands still in the aliases record
Line 51: dynamic-pricing still in the revenuePages Set (file deleted)
All three cause silent dead routing — they'll still redirect correctly to /app/dashboard via the router's Navigate catch, but the logic is misleading and the page set membership is wrong.

8. RevenueHub.tsx — dynamic-pricing Nav Item Points to Deleted Route
Line 50: { id: 'dynamic-pricing', title: { en: 'Live Pricing', ar: 'التسعير المباشر' }, ... } — the nav entry still exists in the Revenue Hub's menu, pointing to a route that no longer exists (will silent-redirect to dashboard).

9. DriverOnboarding.tsx — Gig-Economy Language Still Present
Lines 367–375 contain an "Earnings Guarantee" section that shows "2,000 JOD Minimum Earnings Guarantee." This is explicitly in the Guidelines.md list of things to remove: "Remove: Minimum earnings guarantee" and "Remove feature drift." It positions Wasel as a gig platform, not a carpooling one.

🔵 P3 — UI System Compliance (Token Violations Remaining)
10. Hardcoded Hex in 6 User-Facing Components
File	Count	Severity
/components/OfferRide.tsx	20+	🔴 Critical — primary driver form
/components/Header.tsx	3	🟠 High — global chrome
/components/NetworkErrorHandler.tsx	4	🟠 High — error overlay
/components/ErrorBoundary.tsx	5	🟠 High — crash screen
/components/LoadingSpinner.tsx	1	🟡 Medium — global loading
/components/MyTrips.tsx line 441	1	🟡 Medium — bg-[#1E293B] in ActiveTripCard AvatarFallback
/components/LandingPage.tsx	9	🔵 Low — marketing page
11. Arabic Dialect Not Globally Standardized
project-requirements.md lines 117–123 demands a single choice: "MSA (recommended for scale) OR Jordanian Ammiyah — Apply globally." Currently Dashboard uses Ammiyah (رايح فين؟), while BookRide.tsx, MosqueDirectory.tsx and the newer components use more neutral/MSA Arabic. No consistent decision is enforced anywhere.

Summary Table
#	Gap	Location	Phase	Impact
1	GET /packages/my missing + no sender history UI	Server + Raje3 features	P0	Sender has no package tracking
2	CostSharing never integrated into BookRide	BookRide.tsx	P0	Req spec line 47 violated
3	statusBadgeClass() not replaced by StatusBadge	MyTrips.tsx lines 70, 358, 569	P1	Inconsistent badge system
4	AIStatusBar still in Admin + Driver dashboards	AdminDashboard.tsx, DriverDashboard.tsx	P1	AI drift in non-dashboard pages
5	booking-requests + mosque-directory absent from Sidebar	Sidebar.tsx	P1	Feature unreachable from nav
6	Dead destructuring bug in BookingRequests filter tabs	BookingRequests.tsx line 201	P1	Code quality / confusing
7	Stale ar-navigation, voice-commands, dynamic-pricing in RootLayout	RootLayout.tsx lines 45, 51, 65–66	P2	Dead routing logic
8	dynamic-pricing nav item in RevenueHub	RevenueHub.tsx line 50	P2	Dead route in UI
9	Gig-economy "Earnings Guarantee" in DriverOnboarding	DriverOnboarding.tsx lines 367–375	P2	Brand/pivot contradiction
10	40+ hardcoded hex values in 6 files	OfferRide, Header, NetworkErrorHandler, ErrorBoundary, LoadingSpinner, MyTrips	P3	Token system violated
11	Arabic dialect not globally consistent (Ammiyah vs. MSA)	All bilingual components	P3	Inconsistent UX copy
home
