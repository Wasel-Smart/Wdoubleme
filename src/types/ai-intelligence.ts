/**
 * Type Definitions for AI Intelligence Layer
 * Comprehensive types for all AI features
 */

// ─────────────────────────────────────────────────────────────────────────────
// DEMAND HEATMAP TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RouteIntelligence {
  route: string;
  currentSupply: number;
  forecastedDemand: number;
  supplyGap: number;
  recommendedDrivers: number;
  incentiveAmount: number;
  peakHours: string[];
  averageRevenue: number;
}

export interface DemandHeatmapSummary {
  totalDemand: number;
  totalSupply: number;
  totalGap: number;
  driversNeeded: number;
}

export interface DemandHeatmapResponse {
  success: boolean;
  date: string;
  routes: RouteIntelligence[];
  summary: DemandHeatmapSummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTIVE ANALYTICS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DemandFactors {
  historical: number;
  dayOfWeek: number;
  weather: number;
  events: number;
  seasonal: number;
}

export interface DemandForecast {
  route: string;
  date: string;
  predictedPassengers: number;
  predictedRevenue: number;
  confidence: number; // 0-1
  surgeMultiplier: number;
  factors: DemandFactors;
}

export interface RouteForecastResponse {
  success: boolean;
  route: string;
  forecasts: DemandForecast[];
  historicalTrips: number;
}

export interface HistoricalTrip {
  route: string;
  date: string;
  passengers: number;
  mode: 'carpooling' | 'on_demand';
  revenue: number;
  weather?: 'clear' | 'rain' | 'snow';
  isEvent?: boolean;
  eventType?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER RECOMMENDATIONS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DriverRecommendation {
  route: string;
  expectedEarnings: string;
  passengersWaiting: number;
  incentive: string | null;
  recommendation: string;
  peakHours: string[];
}

export interface DriverRecommendationsResponse {
  success: boolean;
  driverId: string;
  currentLocation: string;
  currentHour: number;
  opportunities: DriverRecommendation[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIP CLUSTERING TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface PassengerRequest {
  id: string;
  userId: string;
  pickup: Location;
  dropoff: Location;
  passengers: number;
  requestedAt: string;
  maxWaitTime: number; // minutes
  genderPreference?: 'mixed' | 'women_only' | 'men_only';
  prayerStop?: boolean;
}

export interface PackageRequest {
  id: string;
  senderId: string;
  pickup: Location;
  dropoff: Location;
  size: 'small' | 'medium' | 'large';
  weight: number; // kg
  value: number; // JOD
  requestedAt: string;
  isReturn?: boolean; // Raje3 return
}

export interface RoutePoint {
  location: Location;
  type: 'pickup' | 'dropoff';
  itemId: string;
  itemType: 'passenger' | 'package';
  estimatedTime: string;
}

export interface ClusterDetails {
  tripId: string;
  driverId: string;
  passengers: PassengerRequest[];
  packages: PackageRequest[];
  optimizedRoute: RoutePoint[];
  totalRevenue: number;
  totalDistance: number;
  totalDuration: number;
  efficiency: number; // 0-1
}

export interface ClusterOpportunity {
  tripId: string;
  route: string;
  currentRevenue: number;
  potentialRevenue: number;
  additionalRevenue: number;
  passengers: number;
  packages: number;
  recommendation: string;
}

export interface ClusteredTripResponse {
  success: boolean;
  cluster: ClusterDetails;
  summary: {
    passengers: number;
    packages: number;
    totalRevenue: string;
    totalDistance: string;
    totalDuration: string;
    efficiencyScore: string;
  };
}

export interface ClusteringOpportunitiesResponse {
  success: boolean;
  driverId: string;
  opportunities: ClusterOpportunity[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RAJE3 RETURN MATCHING TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ReturnMatchResult {
  tripId: string;
  driverId: string;
  pickupTime: string;
  estimatedArrival: string;
  distance: string;
  cost: string;
  savings: string;
}

export interface Raje3MatchResponse {
  success: boolean;
  match?: ReturnMatchResult;
  error?: string;
  recommendation?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE TRACKING TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  photo?: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
}

export interface TripLocation {
  lat: number;
  lng: number;
  address: string;
}

export type TripStatus = 
  | 'matched' 
  | 'accepted' 
  | 'pickup' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface TripDetails {
  id: string;
  status: TripStatus;
  driver: DriverInfo;
  pickup: TripLocation;
  dropoff: TripLocation;
  estimatedArrival: string;
  fare: number;
  distance: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// EARNINGS & DASHBOARD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  avgPerTrip: number;
  avgPerHour: number;
  totalTrips: number;
  topEarningHours: string[];
  predictions: {
    todayTarget: number;
    weekTarget: number;
    monthTarget: number;
  };
}

export interface Incentive {
  id: string;
  type: 'referral' | 'weekend_guarantee' | 'peak_bonus' | 'milestone';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  reward: number;
  progress: number;
  target: number;
  expiresAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICING ENGINE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PricingFactors {
  baseFare: number;
  demandMultiplier: number;
  surgeMultiplier: number;
  weatherBonus: number;
  eventBonus: number;
}

export interface PriceCalculation {
  distance: number; // km
  duration: number; // minutes
  mode: 'carpooling' | 'on_demand';
  factors: PricingFactors;
  finalPrice: number; // JOD
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface APISuccess<T> {
  success: true;
  data: T;
}

export type APIResponse<T> = APISuccess<T> | APIError;

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS RECORDING TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RecordTripRequest {
  route: string;
  passengers: number;
  mode: 'carpooling' | 'on_demand';
  revenue: number;
  weather?: 'clear' | 'rain' | 'snow';
  isEvent?: boolean;
  eventType?: string;
}

export interface RecordTripResponse {
  success: boolean;
  trip: HistoricalTrip;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRIDOR INTELLIGENCE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CorridorIntelligence {
  route: string;
  currentSupply: number;
  forecastedDemand: number;
  supplyGap: number;
  recommendedDrivers: number;
  incentiveAmount: number;
  peakHours: string[];
  averageRevenue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type WeatherType = 'clear' | 'rain' | 'snow';
export type TripMode = 'carpooling' | 'on_demand';
export type GenderPreference = 'mixed' | 'women_only' | 'men_only' | 'family_only';
export type PackageSize = 'small' | 'medium' | 'large';
export type IncentiveType = 'referral' | 'weekend_guarantee' | 'peak_bonus' | 'milestone';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ALL
// ─────────────────────────────────────────────────────────────────────────────

export type {
  // Re-export for convenience
  DemandHeatmapResponse as Heatmap,
  RouteForecastResponse as Forecast,
  ClusteredTripResponse as Cluster,
  Raje3MatchResponse as Raje3Match,
};
