import { SmartPricingEngine } from '../utils/pricing/SeatPricing';
import {
  calculateLiquidityHealth,
  calculatePrayerStops,
  rankTripsForPackage,
  rankTripsForPassenger,
  type PackageCompatibilityResult,
  type PackageSummary,
  type PassengerRequest,
  type PrayerStop,
  type TripOptimizationScore,
  type TripSummary,
} from '../utils/routeIntelligence';
import { getActiveRegions, getTier1Routes } from '../utils/regionConfig';
import { packageTrackingService, type PackagePaymentEscrow, type PackageTracking } from './packageTrackingService';

export interface InnovationCorridor {
  routeId: string;
  title: string;
  titleAr: string;
  demand: number;
  seatSupply: number;
  bookedSeats: number;
  status: 'healthy' | 'low' | 'critical' | 'oversupply';
  healthScore: number;
  businessUseCase: string;
  schoolUseCase: string;
}

export interface InnovationSnapshot {
  activeRegionCount: number;
  firstMoverClaim: string;
  passengerMatches: Array<{ trip: TripSummary; score: TripOptimizationScore }>;
  packageMatches: Array<{ trip: TripSummary; result: PackageCompatibilityResult }>;
  prayerStops: PrayerStop[];
  liquidity: ReturnType<typeof calculateLiquidityHealth>;
  seatYield: ReturnType<typeof SmartPricingEngine.calculateSharedRidePricing>;
  businessSeatYield: ReturnType<typeof SmartPricingEngine.calculateSharedRidePricing>;
  schoolPricing: ReturnType<typeof SmartPricingEngine.calculateSchoolSubscription>;
  corridors: InnovationCorridor[];
  packageOps: {
    tracking: PackageTracking;
    escrow: PackagePaymentEscrow;
    returnWindowHours: number;
    insuredValueJOD: number;
  };
}

function buildTripSummaries(): TripSummary[] {
  const now = new Date();
  const plusHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'jo-amm-aqb-1',
      originCity: 'Amman',
      destinationCity: 'Aqaba',
      country: 'JO',
      departureTime: plusHours(12),
      availableSeats: 3,
      totalSeats: 4,
      allowsPackages: true,
      maxPackageWeightKg: 8,
      genderPreference: 'mixed',
      driverRating: 4.9,
      driverTrustScore: 92,
      pricePerSeatJOD: 8.4,
      estimatedArrivalTime: plusHours(16),
      waypoints: ['Karak'],
    },
    {
      id: 'jo-amm-irb-1',
      originCity: 'Amman',
      destinationCity: 'Irbid',
      country: 'JO',
      departureTime: plusHours(3),
      availableSeats: 2,
      totalSeats: 4,
      allowsPackages: true,
      maxPackageWeightKg: 5,
      genderPreference: 'women_only',
      driverRating: 4.8,
      driverTrustScore: 88,
      pricePerSeatJOD: 4.2,
      estimatedArrivalTime: plusHours(5),
      waypoints: ['Jerash'],
    },
    {
      id: 'jo-zrq-amm-1',
      originCity: 'Zarqa',
      destinationCity: 'Amman',
      country: 'JO',
      departureTime: plusHours(1),
      availableSeats: 4,
      totalSeats: 4,
      allowsPackages: false,
      maxPackageWeightKg: 0,
      genderPreference: 'family_only',
      driverRating: 4.6,
      driverTrustScore: 81,
      pricePerSeatJOD: 2.1,
      estimatedArrivalTime: plusHours(2),
      waypoints: ['University of Jordan'],
    },
  ];
}

function buildCorridors(): InnovationCorridor[] {
  const liquidityInputs = [
    {
      routeId: 'JO_AMM_AQB',
      title: 'Amman to Aqaba',
      titleAr: 'عمّان إلى العقبة',
      demand: 48,
      seatSupply: 44,
      bookedSeats: 36,
      businessUseCase: 'Corporate travel and port logistics',
      schoolUseCase: 'Weekend boarding-school transfers',
    },
    {
      routeId: 'JO_AMM_IRB',
      title: 'Amman to Irbid',
      titleAr: 'عمّان إلى إربد',
      demand: 62,
      seatSupply: 56,
      bookedSeats: 43,
      businessUseCase: 'University and staff commuter corridor',
      schoolUseCase: 'Campus and private-school recurring runs',
    },
    {
      routeId: 'JO_AMM_ZRQ',
      title: 'Amman to Zarqa',
      titleAr: 'عمّان إلى الزرقاء',
      demand: 31,
      seatSupply: 40,
      bookedSeats: 18,
      businessUseCase: 'Factory and industrial shift transport',
      schoolUseCase: 'Family shuttle and after-school pooling',
    },
  ];

  return liquidityInputs.map((corridor) => {
    const liquidity = calculateLiquidityHealth(12, corridor.seatSupply, corridor.bookedSeats);
    return {
      ...corridor,
      status: liquidity.status,
      healthScore: liquidity.healthScore,
    };
  });
}

export async function buildInnovationSnapshot(): Promise<InnovationSnapshot> {
  const trips = buildTripSummaries();
  const today = new Date().toISOString().slice(0, 10);

  const passengerRequest: PassengerRequest = {
    id: 'innovation-passenger',
    originCity: 'Amman',
    destinationCity: 'Aqaba',
    country: 'JO',
    date: today,
    passengersCount: 1,
    genderPreference: 'mixed',
    maxPriceJOD: 9,
    minDriverRating: 4.5,
    requiresPackageCarriage: true,
    packageWeightKg: 2,
  };

  const packageRequest: PackageSummary = {
    id: 'innovation-package',
    originCity: 'Amman',
    destinationCity: 'Aqaba',
    country: 'JO',
    weightKg: 2,
    neededBy: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    category: 'return',
    fragile: true,
    declaredValueJOD: 80,
  };

  const passengerMatches = rankTripsForPassenger(trips, passengerRequest);
  const packageMatches = rankTripsForPackage(trips, packageRequest);
  const corridors = buildCorridors();
  const seatYield = SmartPricingEngine.calculateSharedRidePricing(32, 4);
  const businessSeatYield = SmartPricingEngine.calculateSharedRidePricing(54, 4);
  const schoolPricing = SmartPricingEngine.calculateSchoolSubscription(18, 5, true);
  const liquidity = calculateLiquidityHealth(16, 56, 43);
  const prayerStops = calculatePrayerStops(`${today}T06:00:00.000Z`, 245, 'JO');

  const tracking = await packageTrackingService.createPackage({
    senderId: 'innovation-lab',
    from: 'Amman',
    to: 'Aqaba',
    size: 'medium',
    value: 80,
    insurance: true,
    description: 'Insured Raje3 return routed through an active traveler lane',
  });
  const escrow = await packageTrackingService.processPayment(tracking.id, 'wallet');

  return {
    activeRegionCount: getActiveRegions().length,
    firstMoverClaim: 'First corridor-commerce mobility operating model for the Middle East',
    passengerMatches,
    packageMatches,
    prayerStops,
    liquidity,
    seatYield,
    businessSeatYield,
    schoolPricing,
    corridors,
    packageOps: {
      tracking,
      escrow,
      returnWindowHours: 18,
      insuredValueJOD: tracking.value,
    },
  };
}

export function getJordanLaunchRoutes() {
  return getTier1Routes('JO');
}
