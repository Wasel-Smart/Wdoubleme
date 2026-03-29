/**
 * Service Orchestration Engine
 * Automatically activates and coordinates services based on user actions
 * 
 * This is the "hidden engine" that runs behind the simple 5-button UI
 */

import { getRouteBetween, calculateFare } from '../config/jordan-mobility-network';
import { buildBusinessAccountSnapshot, buildSchoolTransportSnapshot } from './corridorOperations';

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ServiceType =
  | 'ride-sharing'
  | 'package-delivery'
  | 'seat-booking'
  | 'driver-matching'
  | 'route-intelligence'
  | 'prayer-integration'
  | 'gender-preferences'
  | 'price-calculation'
  | 'payment-processing'
  | 'real-time-tracking'
  | 'notification-delivery'
  | 'trust-verification'
  | 'business-accounts'
  | 'school-transport'
  | 'subscription-planning'
  | 'guardian-verification';

export interface ServiceActivation {
  service: ServiceType;
  triggered: Date;
  status: 'active' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

export interface OrchestrationContext {
  userId: string;
  action:
    | 'find-ride'
    | 'offer-ride'
    | 'send-package'
    | 'view-trips'
    | 'update-profile'
    | 'business-commute'
    | 'school-transport';
  data: Record<string, any>;
  activatedServices: ServiceActivation[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export class ServiceOrchestrator {
  private static instance: ServiceOrchestrator;
  private activeContexts: Map<string, OrchestrationContext> = new Map();

  private constructor() {}

  static getInstance(): ServiceOrchestrator {
    if (!ServiceOrchestrator.instance) {
      ServiceOrchestrator.instance = new ServiceOrchestrator();
    }
    return ServiceOrchestrator.instance;
  }

  /**
   * Orchestrate services for "Find Ride" action
   */
  async orchestrateFindRide(userId: string, searchParams: {
    from: string;
    to: string;
    date: Date;
    passengers: number;
    preferences?: {
      gender?: 'mixed' | 'women_only' | 'men_only';
      prayerStops?: boolean;
    };
  }): Promise<OrchestrationContext> {
    const context: OrchestrationContext = {
      userId,
      action: 'find-ride',
      data: searchParams,
      activatedServices: [],
    };

    // 1. Route Intelligence
    this.activateService(context, 'route-intelligence', async () => {
      const route = getRouteBetween(searchParams.from, searchParams.to);
      return { route, distance: route?.distance || 0 };
    });

    // 2. Price Calculation
    this.activateService(context, 'price-calculation', async () => {
      const route = getRouteBetween(searchParams.from, searchParams.to);
      const fare = route 
        ? calculateFare(route.distance, searchParams.passengers, 'carpooling')
        : 0;
      return { fare, perPerson: fare };
    });

    // 3. Driver Matching
    this.activateService(context, 'driver-matching', async () => {
      // AI matching algorithm runs in background
      return { matchingInProgress: true };
    });

    // 4. Gender Preferences (if specified)
    if (searchParams.preferences?.gender) {
      this.activateService(context, 'gender-preferences', async () => {
        return { preference: searchParams.preferences?.gender };
      });
    }

    // 5. Prayer Integration (if requested)
    if (searchParams.preferences?.prayerStops) {
      this.activateService(context, 'prayer-integration', async () => {
        return { prayerStopsEnabled: true };
      });
    }

    // 6. Ride Sharing Service
    this.activateService(context, 'ride-sharing', async () => {
      return { searchActive: true };
    });

    this.activeContexts.set(userId, context);
    return context;
  }

  /**
   * Orchestrate services for "Offer Ride" action
   */
  async orchestrateOfferRide(userId: string, rideParams: {
    from: string;
    to: string;
    date: Date;
    availableSeats: number;
    vehicleType: string;
    preferences?: {
      gender?: 'mixed' | 'women_only' | 'men_only';
      prayerStops?: boolean;
      smokingAllowed?: boolean;
    };
  }): Promise<OrchestrationContext> {
    const context: OrchestrationContext = {
      userId,
      action: 'offer-ride',
      data: rideParams,
      activatedServices: [],
    };

    // 1. Route Intelligence
    this.activateService(context, 'route-intelligence', async () => {
      const route = getRouteBetween(rideParams.from, rideParams.to);
      return { route, optimizedPath: true };
    });

    // 2. Price Calculation (auto-calculate recommended price)
    this.activateService(context, 'price-calculation', async () => {
      const route = getRouteBetween(rideParams.from, rideParams.to);
      const fare = route 
        ? calculateFare(route.distance, 1, 'carpooling')
        : 0;
      return { recommendedPrice: fare };
    });

    // 3. Seat Booking Management
    this.activateService(context, 'seat-booking', async () => {
      return { 
        availableSeats: rideParams.availableSeats,
        bookingSystemActive: true 
      };
    });

    // 4. Driver Matching (match with passengers)
    this.activateService(context, 'driver-matching', async () => {
      return { searchingForPassengers: true };
    });

    // 5. Gender Preferences
    if (rideParams.preferences?.gender) {
      this.activateService(context, 'gender-preferences', async () => {
        return { driverPreference: rideParams.preferences?.gender };
      });
    }

    // 6. Prayer Integration
    if (rideParams.preferences?.prayerStops) {
      this.activateService(context, 'prayer-integration', async () => {
        return { prayerStopsPlanned: true };
      });
    }

    // 7. Notification Service (notify potential passengers)
    this.activateService(context, 'notification-delivery', async () => {
      return { notificationsScheduled: true };
    });

    this.activeContexts.set(userId, context);
    return context;
  }

  /**
   * Orchestrate services for "Send Package" action
   */
  async orchestrateSendPackage(userId: string, packageParams: {
    from: string;
    to: string;
    size: 'small' | 'medium' | 'large';
    value: number;
    insurance: boolean;
  }): Promise<OrchestrationContext> {
    const context: OrchestrationContext = {
      userId,
      action: 'send-package',
      data: packageParams,
      activatedServices: [],
    };

    // 1. Route Intelligence (find available travelers)
    this.activateService(context, 'route-intelligence', async () => {
      const route = getRouteBetween(packageParams.from, packageParams.to);
      return { route, searchingTravelers: true };
    });

    // 2. Package Delivery Service
    this.activateService(context, 'package-delivery', async () => {
      return { 
        packageRegistered: true,
        trackingEnabled: true 
      };
    });

    // 3. Driver Matching (match with travelers)
    this.activateService(context, 'driver-matching', async () => {
      return { matchingWithTravelers: true };
    });

    // 4. Price Calculation
    this.activateService(context, 'price-calculation', async () => {
      const basePrice = packageParams.size === 'small' ? 3 : 
                       packageParams.size === 'medium' ? 5 : 8;
      const insuranceCost = packageParams.insurance ? 0.5 : 0;
      return { 
        totalCost: basePrice + insuranceCost,
        breakdown: { base: basePrice, insurance: insuranceCost }
      };
    });

    // 5. Trust Verification (verify sender/receiver)
    this.activateService(context, 'trust-verification', async () => {
      return { verificationRequired: true };
    });

    // 6. Real-time Tracking
    this.activateService(context, 'real-time-tracking', async () => {
      return { trackingActive: true };
    });

    this.activeContexts.set(userId, context);
    return context;
  }

  /**
   * Orchestrate services for booking confirmation
   */
  async orchestrateBooking(userId: string, bookingParams: {
    rideId: string;
    seats: number;
    paymentMethod: string;
  }): Promise<OrchestrationContext> {
    const context: OrchestrationContext = {
      userId,
      action: 'find-ride',
      data: bookingParams,
      activatedServices: [],
    };

    // 1. Seat Booking
    this.activateService(context, 'seat-booking', async () => {
      return { 
        seatsReserved: bookingParams.seats,
        bookingConfirmed: true 
      };
    });

    // 2. Payment Processing
    this.activateService(context, 'payment-processing', async () => {
      return { 
        paymentMethod: bookingParams.paymentMethod,
        paymentStatus: 'pending'
      };
    });

    // 3. Notification Delivery (confirm to passenger + driver)
    this.activateService(context, 'notification-delivery', async () => {
      return { 
        passengerNotified: true,
        driverNotified: true
      };
    });

    // 4. Real-time Tracking (activate on booking)
    this.activateService(context, 'real-time-tracking', async () => {
      return { trackingEnabled: true };
    });

    return context;
  }

  /**
   * Orchestrate recurring business mobility and return logistics
   */
  async orchestrateBusinessCommute(userId: string, params: {
    companyName: string;
    corridorId: string;
    employees: number;
    monthlyCommuteDays: number;
    returnVolumePerWeek: number;
  }): Promise<OrchestrationContext> {
    const context: OrchestrationContext = {
      userId,
      action: 'business-commute',
      data: params,
      activatedServices: [],
    };

    const snapshot = await buildBusinessAccountSnapshot(params.corridorId);

    await this.activateService(context, 'business-accounts', async () => ({
      companyName: params.companyName,
      corridor: snapshot.corridor.id,
      employees: params.employees,
      recurringDays: params.monthlyCommuteDays,
    }));

    await this.activateService(context, 'route-intelligence', async () => ({
      corridor: snapshot.corridor.id,
      healthScore: snapshot.liquidity.healthScore,
      topPassengerMatch: snapshot.passengerMatches[0]?.trip.id,
    }));

    await this.activateService(context, 'price-calculation', async () => ({
      monthlyInvoiceJOD: snapshot.monthlyInvoiceJOD,
      seatYield: snapshot.seatYield.map((seat) => seat.price),
      savingsPercent: snapshot.estimatedSavingsPercent,
    }));

    await this.activateService(context, 'seat-booking', async () => ({
      availableRecurringSeats: snapshot.liquidity.totalSeats - snapshot.liquidity.bookedSeats,
      monthlyCommuteDays: params.monthlyCommuteDays,
    }));

    await this.activateService(context, 'notification-delivery', async () => ({
      employeeAlerts: params.employees,
      dispatchWindows: ['05:45', '16:15'],
    }));

    await this.activateService(context, 'payment-processing', async () => ({
      billingModel: 'monthly-invoice',
      escrowEnabled: true,
    }));

    if (params.returnVolumePerWeek > 0) {
      await this.activateService(context, 'package-delivery', async () => ({
        weeklyReturnVolume: params.returnVolumePerWeek,
        attachRatePercent: snapshot.packageOps.attachRatePercent,
        trackingCode: snapshot.packageOps.tracking.trackingCode,
      }));

      await this.activateService(context, 'real-time-tracking', async () => ({
        trackingEnabled: true,
        trackingStatus: snapshot.packageOps.tracking.status,
      }));
    }

    await this.activateService(context, 'trust-verification', async () => ({
      verifiedDrivers: snapshot.fleetDrivers.length,
      policy: 'corporate-lane',
    }));

    this.activeContexts.set(userId, context);
    return context;
  }

  /**
   * Orchestrate recurring school transport with guardian controls
   */
  async orchestrateSchoolTransport(userId: string, params: {
    corridorId: string;
    pickup: string;
    schoolLocation: string;
    studentsCount: number;
    days: string[];
    roundTrip: boolean;
    guardiansPerStudent: number;
  }): Promise<OrchestrationContext> {
    const context: OrchestrationContext = {
      userId,
      action: 'school-transport',
      data: params,
      activatedServices: [],
    };

    const snapshot = await buildSchoolTransportSnapshot(params.corridorId);

    await this.activateService(context, 'school-transport', async () => ({
      route: snapshot.route.id,
      students: params.studentsCount,
      pickup: params.pickup,
      schoolLocation: params.schoolLocation,
    }));

    await this.activateService(context, 'route-intelligence', async () => ({
      corridor: snapshot.route.id,
      healthScore: snapshot.liquidity.healthScore,
      preferredWindow: snapshot.morningWindow,
    }));

    await this.activateService(context, 'subscription-planning', async () => ({
      operatingDays: params.days,
      standardJOD: snapshot.subscriptionPricing.standard,
      premiumJOD: snapshot.subscriptionPricing.premium,
      roundTrip: params.roundTrip,
    }));

    await this.activateService(context, 'guardian-verification', async () => ({
      guardiansPerStudent: params.guardiansPerStudent,
      guardianCoveragePercent: snapshot.guardianCoveragePercent,
    }));

    await this.activateService(context, 'notification-delivery', async () => ({
      guardianNotifications: params.studentsCount * Math.max(1, params.guardiansPerStudent),
      afternoonWindow: snapshot.afternoonWindow,
    }));

    await this.activateService(context, 'real-time-tracking', async () => ({
      liveRouteTracking: true,
      prayerStops: snapshot.prayerStops.length,
    }));

    await this.activateService(context, 'trust-verification', async () => ({
      childSafetyChecks: true,
      recommendedVehicle: snapshot.recommendedVehicle,
    }));

    this.activeContexts.set(userId, context);
    return context;
  }

  /**
   * Get active services for a user
   */
  getActiveServices(userId: string): ServiceActivation[] {
    const context = this.activeContexts.get(userId);
    return context?.activatedServices || [];
  }

  /**
   * Get orchestration context
   */
  getContext(userId: string): OrchestrationContext | undefined {
    return this.activeContexts.get(userId);
  }

  /**
   * Clear context (after trip completion)
   */
  clearContext(userId: string): void {
    this.activeContexts.delete(userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async activateService(
    context: OrchestrationContext,
    service: ServiceType,
    handler: () => Promise<any>
  ): Promise<void> {
    const activation: ServiceActivation = {
      service,
      triggered: new Date(),
      status: 'active',
      metadata: {},
    };

    try {
      const result = await handler();
      activation.status = 'completed';
      activation.metadata = result;
    } catch (error) {
      activation.status = 'failed';
      activation.metadata = { error: String(error) };
    }

    context.activatedServices.push(activation);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

export const orchestrator = ServiceOrchestrator.getInstance();
