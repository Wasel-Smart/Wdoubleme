Now we move to the highest level architecture for Wasel — what I call the Wasel Super-Algorithm (Mobility Intelligence System).
This model transforms Wasel from a ride app into a predictive mobility network Wasel Autonomous Mobility System  

Act as a Principal Mobility Systems Architect, Senior Backend Engineer, Data Scientist, and AI Optimization Engineer.

Your task is to design and generate a complete enterprise-grade architecture for the Wasel (واصل) platform.

Wasel is an intelligent inter-city ride-sharing and package delivery ecosystem that connects drivers, passengers, and senders within a unified mobility marketplace.

The platform must support passenger rides, package delivery, and return-trip optimization (Raje3) while maximizing driver profit, seat occupancy, and network efficiency.

The system must be scalable, data-driven, and algorithmically optimized.

PLATFORM OBJECTIVE

Design a Mobility Intelligence Platform that:

• matches passengers and packages with drivers
• predicts demand between cities
• optimizes routes and seat utilization
• minimizes empty return trips
• recommends profitable trips to drivers

The system must operate similarly in intelligence level to global ride platforms while focusing on inter-city mobility.

SYSTEM ARCHITECTURE

Design a modular microservice architecture with the following services:

User Service
Driver Service
Vehicle Service
Trip Service
Booking Service
Package Service
Matching Engine
Route Optimization Engine
Pricing Engine
Demand Prediction Engine
Recommendation Engine
Analytics Service

All services must communicate via REST APIs and support horizontal scaling.

DATABASE DESIGN

Create a clean normalized relational database schema with optimized indexing.

Main entities:

Users
Drivers
Vehicles
Cities
Routes
Trips
Bookings
Packages
Payments
Ratings

Trips table example fields:

trip_id
driver_id
origin_city_id
destination_city_id
departure_time
available_seats
package_capacity
trip_status

Bookings table:

booking_id
trip_id
user_id
seats_reserved
booking_status
price

Packages table:

package_id
trip_id
sender_id
receiver_phone
weight
delivery_status

DATA QUALITY PIPELINE

Design a structured data cleaning and validation pipeline.

Stages:

Raw Data
Validation Layer
Normalization Layer
Duplicate Detection
Data Integrity Checks
Analytics Warehouse

Ensure:

• unique user identifiers
• standardized city identifiers
• consistent timestamps
• valid booking states

TRIP MATCHING ALGORITHM

Build a matching engine that assigns riders and packages to the most efficient trip.

Matching Score:

MatchScore =
(SeatAvailability × 0.30)

(RouteCompatibility × 0.25)

(DriverRating × 0.20)

(PickupDistance × 0.15)

(TimeProximity × 0.10)

Trips with the highest score should be selected automatically.

RETURN TRIP OPTIMIZATION (RAJE3)

Implement a return-trip intelligence engine.

If a driver creates a trip from City A → City B:

The system must analyze demand for City B → City A.

If return demand exists:

• recommend a return trip
• reserve passengers or packages
• maximize driver utilization

Goal:

Eliminate empty return journeys.

DEMAND PREDICTION ENGINE

Build a demand forecasting model for routes.

DemandScore =

(HistoricalBookings × 0.35)

(TimeOfDayPattern × 0.25)

(DayOfWeekDemand × 0.20)

(SeasonalFactor × 0.10)

(PackageRequests × 0.10)

High demand routes should trigger:

• driver recommendations
• dynamic trip creation
• promotional pricing

TRIP EFFICIENCY SCORE

Calculate a Trip Efficiency Score (TES).

TES =

(SeatFillRate × 0.35)

(PackageUtilization × 0.25)

(DriverRating × 0.15)

(RouteDemand × 0.25)

Trips with the highest TES should be ranked first in search results.

DRIVER PROFIT OPTIMIZATION

Create an algorithm recommending profitable routes.

DriverProfitScore =

(ExpectedFare × 0.40)

(DemandProbability × 0.25)

(ReturnTripProbability × 0.25)

(DistanceCost × -0.10)

Drivers should see recommended routes ranked by expected earnings.

ROUTE NETWORK MODEL

Represent the transportation network as a graph.

Cities = Nodes
Routes = Edges

Use graph algorithms to optimize:

• route discovery
• demand clustering
• trip planning
• multi-stop optimization

AUTONOMOUS TRIP CREATION

Design a system that generates optimized trips automatically based on predicted demand.

Example:

If predicted demand:

Amman → Irbid
Passengers: 8
Packages: 3

Automatically create:

Trip 1
Trip 2

Drivers receive notifications to accept the trip.

DYNAMIC PRICING ENGINE

Implement demand-based pricing.

Price =

BaseFare + (Distance × Rate) × DemandMultiplier

DemandMultiplier increases when:

Demand > Available Drivers.

ANALYTICS DASHBOARD

Generate operational analytics including:

Daily Trips
Seat Utilization
Package Utilization
Driver Earnings
Demand by City
Route Performance

These metrics should guide platform optimization.

SCALABILITY REQUIREMENTS

Ensure the platform can support:

• millions of users
• thousands of simultaneous tr