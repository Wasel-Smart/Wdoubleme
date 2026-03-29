# Wasel | واصل — Project Guidelines v4.0

**MAJOR UPDATE:** March 15, 2026 — Unified Mobility OS (Hybrid Model)  
**FROM:** Single-service carpooling platform  
**TO:** Dual-mode Mobility OS (Carpooling + On-Demand)

---

## Brand & Identity

### **Unified Mobility OS: Wasel | واصل**

**Mission:** Create Jordan's most intelligent, efficient, and culturally-respectful transportation network

**Tagline:** "Your Intelligent Mobility Companion" / "شريكك الذكي بالتنقل"

**Dual-Mode Architecture:**

1. **🚗 Carpooling Mode** (BlaBlaCar Model)
   - Advance booking (24h+ ahead)
   - Cost-sharing among casual drivers
   - Long-distance intercity (50-500 km)
   - Fixed fuel-based pricing
   - Community-driven trust model

2. **⚡ On-Demand Mode** (Uber Model)
   - Real-time matching (<5 min)
   - Professional vetted drivers
   - Intra-city + intercity trips
   - Dynamic AI-powered pricing
   - Instant ride requests

3. **📦 Package Delivery** (Integrated)
   - Send via carpoolers OR on-demand drivers
   - QR verification + GPS tracking
   - Same-day + scheduled delivery

4. **🕌 Cultural Intelligence** (Competitive Advantage)
   - Prayer time integration
   - Gender preference options
   - Ramadan-friendly features
   - Hijab privacy settings

**Target Users:**

- Casual travelers (carpooling)
- Professional drivers (on-demand)
- Daily commuters (both modes)
- Package senders/receivers
- Students, families, tourists, business travelers

**Core Values:**

- **Language**: Bilingual — Arabic (Jordanian dialect, NOT MSA) + English
- **Currency**: JOD (Jordanian Dinar) as platform settlement currency. Use `/utils/currency.ts`
- **Culture**: Built for Middle East (prayer stops, gender segregation, Ramadan mode)
- **Intelligence**: AI-powered predictive analytics, smart matching, dynamic optimization
- **Choice**: Users pick the mode that fits their needs (cost vs speed)
- **Safety**: Trust-based community + professional driver vetting

---

## 🎯 What We Are NOW (Hybrid Model)

### **✅ Carpooling Mode (Existing):**

```
✅ Long-distance ride-sharing (BlaBlaCar model)
✅ Advance booking (24h+ ahead)
✅ Cost-sharing among regular people
✅ Fixed fuel-based pricing (no surge)
✅ Intercity trips (50-500 km)
✅ Package delivery via travelers
```

### **✅ On-Demand Mode (NEW):**

```
✅ Real-time ride matching (Uber model)
✅ Professional driver network
✅ Dynamic AI pricing (surge when needed)
✅ Intra-city + intercity coverage
✅ <5 minute wait times
✅ Predictive demand heatmaps
```

### **✅ Unified Intelligence Layer (NEW):**

```
✅ Predictive corridor intelligence
✅ Multi-service trip clustering (rides + packages)
✅ Smart driver positioning
✅ Return trip optimization (Raje3)
✅ Real-time supply-demand balancing
✅ AI-powered route optimization
```

---

## Business Model (Dual Revenue Streams)

### **Revenue Model:**

#### **1. Carpooling Commission (30% of revenue)**

```
Model: Cost-sharing (driver covers fuel, passengers split cost)
Commission: 12% per booking
Average trip: Amman → Aqaba (330 km), JOD 8/seat
Revenue per trip: JOD 2.88 (12% of JOD 8 × 3 seats)

Example:
- Driver posts ride: Amman → Aqaba, 3 seats, JOD 8/seat
- 3 passengers book
- Total passenger payment: JOD 24
- Wasel commission: JOD 2.88
- Driver receives: JOD 21.12
- Driver's fuel cost: ~JOD 25
- Net cost to driver: JOD 3.88 (acceptable, was going anyway)
```

#### **2. On-Demand Commission (40% of revenue) — NEW**

```
Model: Professional driver service (Uber-style)
Commission: 22% per ride
Average trip: Amman Shmeisani → Abdali (5 km), JOD 3.50
Revenue per trip: JOD 0.77 (22% of JOD 3.50)

Intercity on-demand:
- Amman → Dead Sea (60 km), JOD 25
- Commission: JOD 5.50 (22%)
- Driver receives: JOD 19.50
- Driver's cost: ~JOD 8 (fuel + time)
- Driver profit: JOD 11.50

Dynamic pricing:
- Base fare: Distance + time
- Surge multiplier: 1.0× - 3.0× (based on demand)
- Weather surge: +20% (rain/snow)
- Event surge: +50% (concerts, holidays)
```

#### **3. Package Delivery Commission (20% of revenue)**

```
Model: Travelers OR on-demand drivers carry packages
Commission: 20% per package
Insurance: JOD 0.50 per package (covers up to JOD 100)
Average package: JOD 5 (sender pays)
Revenue: JOD 1.00 (commission) + JOD 0.50 (insurance) = JOD 1.50/package

Carpooling delivery:
- Traveler earns JOD 4 extra income
- Package delivered along existing route

On-demand delivery:
- Driver earns full fare + package fee
- Dedicated delivery or combined with passenger
```

#### **4. Premium Features (10% of revenue)**

```
- Verified Driver Badge: JOD 15/year
- Priority Dispatch: JOD 2.99/month (on-demand drivers)
- Featured Ride Listings: JOD 1/listing (carpooling)
- Wasel Plus Subscription: JOD 12.99/month (10% off all rides, priority booking)
- Premium Insurance: JOD 2/trip (covers up to JOD 1,000)
- Corporate Accounts: Custom B2B pricing
```

---

## Architecture (Unified Mobility OS)

### **Trip Types:**

```typescript
enum TripMode {
  CARPOOLING = 'carpooling',    // Advance booking, cost-sharing
  ON_DEMAND = 'on_demand',       // Real-time matching, professional
  SCHEDULED = 'scheduled',       // Future on-demand booking
  PACKAGE = 'package',           // Package delivery
  RETURN = 'return',             // Raje3 e-commerce returns
}

enum TripStatus {
  // Carpooling flow
  POSTED = 'posted',             // Driver posted ride
  BOOKED = 'booked',             // Passenger reserved seat
  CONFIRMED = 'confirmed',       // Driver accepted booking
  
  // On-demand flow
  REQUESTED = 'requested',       // Passenger requested ride
  MATCHED = 'matched',           // AI matched with driver
  ACCEPTED = 'accepted',         // Driver accepted request
  
  // Common flow
  PICKUP = 'pickup',             // Driver en route to pickup
  IN_PROGRESS = 'in_progress',   // Trip started
  COMPLETED = 'completed',       // Trip finished
  CANCELLED = 'cancelled',       // Trip cancelled
  DISPUTED = 'disputed',         // Dispute raised
}
```

### **Backend Modules (Upgraded):**

```
/supabase/functions/server/
  ├── auth/              → User authentication (passengers + drivers)
  ├── users/             → User profiles, preferences, verification
  ├── drivers/           → Driver onboarding, documents, earnings
  ├── trips/             → Trip orchestration (carpooling + on-demand)
  ├── packages/          → Package delivery + tracking
  ├── pricing/           → Dynamic pricing engine (NEW)
  ├── matching/          → AI matching algorithm (NEW)
  ├── routing/           → Route optimization + corridor intelligence (NEW)
  ├── analytics/         → Predictive demand forecasting (NEW)
  ├── payments/          → Payment processing (JOD + multi-gateway)
  ├── notifications/     → Real-time push + SMS
  ├── admin/             → Admin dashboard + fraud detection
  └── index.tsx          → Hono server orchestration
```

### **Frontend Structure:**

```
/features/
  ✅ CORE (Dual-Mode):
  carpooling/          → SearchRides, PostRide, BookRide, RideCalendar
  on-demand/           → RequestRide, LiveTracking, DriverMatching (NEW)
  awasel/              → SendPackage, PackageTracking, QRScanner
  raje3/               → E-commerce returns auto-matching
  
  ✅ INTELLIGENCE (NEW):
  ai/                  → PredictiveDemand, SmartMatching, RouteOptimization
  heatmaps/            → DriverHeatmap, DemandVisualization
  pricing/             → DynamicPricingDisplay, SurgeAlerts
  
  ✅ DRIVER TOOLS (NEW):
  driver-dashboard/    → EarningsDashboard, HeatmapView, IncentiveTracker
  driver-onboarding/   → DocumentUpload, BackgroundCheck, Training
  
  ✅ CULTURAL:
  cultural/            → GenderPreferences, PrayerStops, RamadanMode, HijabPrivacy
  
  ✅ SHARED:
  payments/            → PaymentFlow, CashOnArrival, InsuranceClaims
  profile/             → UserProfile, TrustScore, Reviews, Verification
  safety/              → SafetyCenter, DisputeCenter, TripVerification
  common/              → Header, Sidebar, Logo, ModeSwitch (NEW)
```

---

## AI Intelligence Layer (NEW)

### **1. Predictive Corridor Intelligence**

```typescript
// File: /features/ai/PredictiveCorridorIntelligence.tsx
// Forecast demand 24h-7d ahead per route

Capabilities:
- Historical trip data analysis
- Event-based demand prediction (holidays, concerts, sports)
- Weather impact modeling
- University schedule integration
- Pre-position drivers in high-demand corridors

Example:
Route: Amman → Aqaba
Date: Friday, March 21 (weekend)
Predicted demand: 85 passengers
Available supply: 12 drivers (36 seats)
Action: Send notification to 8 additional drivers
Incentive: "Drive to Aqaba Friday morning, guaranteed JOD 30 earnings"
```

### **2. Smart Trip Matching**

```typescript
// File: /features/matching/SmartTripMatching.tsx
// Match passengers with best driver (ETA, rating, price, preferences)

Matching Factors:
1. Distance to pickup (minimize wait time)
2. Route efficiency (minimize detour)
3. Driver rating (prefer 4.8+ stars)
4. Gender preference (respect cultural needs)
5. Package capacity (if carrying package)
6. Vehicle type (economy, comfort, premium)

Algorithm:
- Real-time driver location tracking
- Calculate ETA for all available drivers
- Score each driver (0-100)
- Match with highest score
- Fallback to next best if declined
```

### **3. Multi-Service Trip Clustering**

```typescript
// File: /features/ai/TripClustering.tsx
// Combine multiple passengers + packages in one trip

Example Cluster:
Driver: Ahmad (Amman → Aqaba)
Passengers:
  - Sarah (pickup Amman 8th Circle, drop Aqaba city center)
  - Khalid (pickup Amman Swefieh, drop Aqaba South Beach)
Packages:
  - Package A (Amman Mecca Mall → Aqaba)
  - Package B (Raje3 return: Aqaba → Amman)

Route Optimization:
1. Pickup Sarah (8th Circle)
2. Pickup Khalid (Swefieh) — 5 min detour
3. Pickup Package A (Mecca Mall) — 3 min detour
4. Drive to Aqaba (4h)
5. Drop Package A (Aqaba city) — on route
6. Drop Sarah (city center)
7. Drop Khalid (South Beach) — 10 min detour
8. Pickup Package B (return to Amman)

Total revenue:
- Passengers: JOD 16 (JOD 8 × 2)
- Packages: JOD 8 (JOD 4 × 2)
- Driver earnings: JOD 19.20 (after 20% commission)
- Platform revenue: JOD 4.80
```

### **4. Dynamic Pricing Engine**

```typescript
// File: /features/pricing/DynamicPricingEngine.tsx
// Calculate optimal price based on supply/demand

Pricing Formula (On-Demand Mode):
base_fare = distance_km × JOD 0.50 + time_min × JOD 0.10
demand_multiplier = passengers_waiting / drivers_available
surge_multiplier = max(1.0, min(3.0, demand_multiplier))
weather_bonus = is_bad_weather ? 1.2 : 1.0
event_bonus = is_major_event ? 1.5 : 1.0

final_price = base_fare × surge_multiplier × weather_bonus × event_bonus

Example:
Trip: Amman Abdali → Queen Alia Airport (35 km, 30 min)
Base: (35 × 0.50) + (30 × 0.10) = JOD 20.50
Normal demand: 1.0× → JOD 20.50
High demand (New Year): 1.5× → JOD 30.75
Rainy weather: 1.2× → JOD 36.90
```

### **5. Return Trip Optimization (Raje3)**

```typescript
// File: /features/raje3/ReturnTripOptimization.tsx
// Auto-match e-commerce returns with existing trips

Scenario:
- Customer in Aqaba wants to return item to Amman
- System finds driver going Aqaba → Amman today
- Auto-match return package with driver
- Customer pays JOD 4 (vs JOD 12 courier)
- Driver earns extra JOD 3.20
- Platform earns JOD 0.80 commission

Matching logic:
1. Detect return request location (Aqaba)
2. Query trips: destination = Amman, date = today/tomorrow
3. Check package capacity (small/medium/large)
4. Auto-match with best route (minimal detour)
5. Send notification to driver + customer
6. QR pickup verification
```

---

## Driver Economy Tools (NEW)

### **1. Interactive Demand Heatmap**

```typescript
// File: /features/driver-dashboard/DemandHeatmap.tsx
// Real-time visualization of high-demand areas

Features:
- Color-coded zones (green = low, yellow = medium, red = high)
- Predicted earnings per zone
- Live passenger requests count
- Surge multiplier indicators
- "Go here now" recommendations

Example:
Location: Amman
Time: Friday 6:00 PM
Heatmap:
  - Abdali (red): 15 requests, 2.5× surge, predicted JOD 45/hour
  - Shmeisani (yellow): 8 requests, 1.2× surge, predicted JOD 25/hour
  - Swefieh (green): 2 requests, 1.0× surge, predicted JOD 15/hour

Recommendation: "Drive to Abdali now for guaranteed JOD 45/hour"
```

### **2. Earnings Dashboard**

```typescript
// File: /features/driver-dashboard/EarningsDashboard.tsx
// Transparent earnings tracking + predictions

Metrics:
- Today's earnings: JOD 65 (8 trips)
- This week: JOD 320 (45 trips)
- This month: JOD 1,250 (180 trips)
- Average per trip: JOD 6.95
- Average per hour: JOD 22.50
- Top earning hours: Fri 6-9 PM, Sat 8-11 AM

Predictions:
- Finish today at JOD 80 (2 more trips needed)
- Reach JOD 400 this week (10 more trips)
- Monthly goal: JOD 1,500 (85% achieved)

Incentives active:
- Referral bonus: Refer 3 drivers → earn JOD 30
- Weekend guarantee: 15 trips Fri-Sun → earn minimum JOD 200
```

### **3. Route Optimizer**

```typescript
// File: /features/driver-dashboard/RouteOptimizer.tsx
// Suggest best routes for maximum earnings

Input: Driver location (Amman), Available time (4 hours)
AI Recommendation:

Option 1: Intra-city on-demand (Amman)
- 8-10 short trips (avg 15 min each)
- Predicted earnings: JOD 70-85
- Effort: High (frequent pickups)

Option 2: Intercity carpooling (Amman → Dead Sea)
- 1 long trip (60 km, 1h)
- 3 passengers × JOD 7 = JOD 21
- 1 package: JOD 4
- Total: JOD 25 (one-way) + return empty
- Predicted earnings: JOD 25
- Effort: Low (single trip)

Option 3: Mixed strategy
- 2 intra-city trips (JOD 15)
- 1 intercity trip to Aqaba (JOD 55)
- Predicted earnings: JOD 70
- Effort: Medium

Recommendation: Option 3 (best balance of earnings + effort)
```

---

## Cultural Features (Preserved + Enhanced)

### **1. Gender Preferences** 🚺🚹

```typescript
enum GenderPreference {
  MIXED = "mixed",              // Default
  WOMEN_ONLY = "women_only",    // Female driver + female passengers
  MEN_ONLY = "men_only",        // All male
  FAMILY_ONLY = "family_only",  // Related passengers only
}

// Works in BOTH carpooling and on-demand modes
// File: /features/cultural/GenderPreferences.tsx
```

### **2. Prayer Time Integration** 🕌

```typescript
// File: /features/cultural/PrayerStops.tsx
// Auto-calculate prayer stops for long trips

Carpooling mode:
- Driver posts ride with prayer stop option
- System calculates prayer times en route
- Auto-suggests mosques along route

On-demand mode:
- Passenger requests prayer stop
- Driver accepts (optional)
- Route adjusts to nearest mosque
- Wait time: 15-20 minutes
- No extra charge for prayer stops
```

### **3. Ramadan Mode** 🌙

```typescript
// File: /features/cultural/RamadanMode.tsx
// Fasting-friendly features during Ramadan

Features (both modes):
- Iftar-timed rides (arrive before sunset)
- No food/drinks in car during fasting hours
- Suhoor trips (early morning 3-4 AM)
- 10% discount on all rides
- Taraweeh prayer coordination (post-iftar trips)

Ramadan 2026: March 1 - March 30
```

---

## Pricing Models Comparison

### **Carpooling Mode (Cost-Sharing):**

```
Pricing: Fixed, fuel-based calculation
Formula: (fuel_cost + tolls) / seats × 1.2 buffer
No surge, no dynamic pricing
Transparent cost breakdown

Example: Amman → Aqaba (330 km)
Fuel: 26.4 L × JOD 0.90 = JOD 23.76
Seats: 3
Price: JOD 23.76 / 3 × 1.2 = JOD 9.50
Rounded: JOD 10/seat
```

### **On-Demand Mode (Dynamic Pricing):**

```
Pricing: Dynamic, AI-calculated
Formula: (distance + time) × surge × weather × event
Surge: 1.0× - 3.0×
Real-time adjustments

Example: Amman Abdali → Airport (35 km, 30 min)
Base: JOD 20.50
Normal: JOD 20.50 (1.0×)
Rush hour: JOD 30.75 (1.5×)
New Year: JOD 61.50 (3.0×)
```

---

## Success Metrics (Updated)

### **Carpooling Metrics:**

```
- Rides available per route: Target 10+ rides/week
- Traveler-to-passenger ratio: Target 1:10
- Booking success rate: Target 80%+
```

### **On-Demand Metrics (NEW):**

```
- Average wait time: Target <5 minutes
- Match success rate: Target 95%+
- Driver utilization: Target 75%+ (hours active)
- Passenger-to-driver ratio: Target 3:1 (peak), 1:1 (off-peak)
```

### **Unified Platform Metrics:**

```
- Monthly Active Users: Target 50,000 (Year 1)
- Trips per month: Target 100,000 (60% on-demand, 40% carpooling)
- Revenue per user: Target JOD 25/month
- Driver earnings: Target JOD 1,200/month (full-time professional)
- Platform GMV: Target JOD 1.5M/month (Year 1)
```

---

## Technical Stack (Updated)

- **Frontend**: React 18 + Vite + React Router 6 (use `react-router`, NOT `react-router-dom`)
- **Styling**: Tailwind CSS v4 + tokens from `/tokens/wasel-tokens.ts`
- **Animation**: Motion (`import { motion } from 'motion/react'`)
- **Backend**: Supabase Edge Functions + Hono (Deno) at `/supabase/functions/server/`
- **Real-time**: Supabase Realtime for live driver tracking, demand updates
- **AI/ML**: TensorFlow.js for predictive analytics (demand forecasting, route optimization)
- **Maps**: Google Maps API for routing, geocoding, heatmaps
- **State**: React Query + Zustand for complex state management
- **Routing**: Lazy-loaded routes in `/utils/optimizedRoutes.ts`

---

## Development Roadmap

### **Phase 4.1: Unified Architecture (Weeks 1-2)**

- ✅ Update Guidelines to hybrid model
- 🔄 Create dual-mode trip type system
- 🔄 Build AI matching engine
- 🔄 Implement dynamic pricing engine
- 🔄 Add real-time driver tracking

### **Phase 4.2: Driver Tools (Weeks 3-4)**

- 🔄 Build demand heatmap
- 🔄 Create earnings dashboard
- 🔄 Add route optimizer
- 🔄 Implement incentive system
- 🔄 Driver onboarding flow (documents, verification, training)

### **Phase 4.3: Intelligence Layer (Weeks 5-6)**

- 🔄 Predictive corridor forecasting
- 🔄 Multi-service trip clustering
- 🔄 Return trip auto-matching
- 🔄 Smart driver positioning
- 🔄 Real-time supply-demand balancing

### **Phase 4.4: UI/UX Redesign (Weeks 7-8)**

- 🔄 Mode switcher (carpooling ↔ on-demand)
- 🔄 Unified booking flow
- 🔄 Live tracking interface
- 🔄 Driver heatmap visualization
- 🔄 Predictive insights dashboard

### **Phase 4.5: Testing & Launch (Weeks 9-10)**

- 🔄 Soft beta (100 drivers, 1,000 passengers)
- 🔄 Load testing (1,000 concurrent requests)
- 🔄 AI model tuning
- 🔄 Public launch

---

## 🎯 Critical Reminders

### **What Makes Wasel Unique (Hybrid Advantage):**

1. ✅ **Dual-mode flexibility** — Users choose cost (carpooling) OR speed (on-demand)
2. ✅ **Cultural intelligence** — Prayer stops, gender preferences (NO competitor has this)
3. ✅ **Unified package delivery** — Integrated with both modes
4. ✅ **AI predictive analytics** — Pre-position drivers, forecast demand
5. ✅ **Multi-service clustering** — Maximize revenue per trip
6. ✅ **Return trip optimization** — Raje3 integration
7. ✅ **Transparent pricing** — Users understand cost breakdown

### **Development Priorities:**

1. 🔥 **Build AI matching engine** (Week 1-2)
2. 🔥 **Implement dynamic pricing** (Week 1-2)
3. 🔥 **Add real-time tracking** (Week 2-3)
4. 🔥 **Create demand heatmap** (Week 3-4)
5. 🔥 **Build driver dashboard** (Week 3-4)
6. 🔥 **Launch soft beta** (Week 9)

---

**Version:** 4.0 (Unified Mobility OS — Hybrid Model)  
**Last Updated:** March 15, 2026  
**Next Review:** After soft beta launch (Week 10)
