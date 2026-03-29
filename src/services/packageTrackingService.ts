/**
 * Package Tracking Service
 * Secure package delivery system with QR codes and escrow payments
 * Links packages to rides with full transparency for sender
 */

import { generateId } from '../utils/api';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PackageTracking {
  id: string;
  trackingCode: string; // QR code content
  qrCodeUrl: string; // QR code image URL
  
  // Package details
  senderId: string;
  receiverId?: string;
  from: string;
  to: string;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  value: number;
  insurance: boolean;
  description?: string;
  
  // Linked ride
  rideId?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  vehicleInfo?: string;
  
  // Financial
  price: number;
  insuranceCost: number;
  totalCost: number;
  paymentStatus: 'pending' | 'escrowed' | 'released' | 'refunded';
  paymentMethod?: string;
  
  // Tracking
  status: PackageStatus;
  currentLocation?: { lat: number; lng: number };
  
  // Timestamps
  createdAt: Date;
  pickedUpAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  
  // Security
  pickupVerificationCode: string; // 6-digit code for pickup
  deliveryVerificationCode: string; // 6-digit code for delivery
  pickupVerified: boolean;
  deliveryVerified: boolean;
  
  // Photos
  pickupPhoto?: string;
  deliveryPhoto?: string;
  
  // Communication
  senderCanContactDriver: boolean;
  lastUpdated: Date;
}

export type PackageStatus =
  | 'created' // Package registered, waiting for traveler
  | 'matched' // Matched with a traveler/ride
  | 'pickup_scheduled' // Pickup time scheduled
  | 'picked_up' // Package picked up by traveler (QR verified)
  | 'in_transit' // Package is traveling
  | 'near_destination' // Package is near destination
  | 'delivered' // Package delivered (QR verified)
  | 'cancelled' // Package delivery cancelled
  | 'disputed'; // Dispute raised

export interface PackageStatusUpdate {
  packageId: string;
  status: PackageStatus;
  timestamp: Date;
  location?: { lat: number; lng: number };
  note?: string;
  photo?: string;
}

export interface PackagePaymentEscrow {
  packageId: string;
  amount: number;
  senderPaid: boolean;
  heldInEscrow: boolean;
  releasedToDriver: boolean;
  releaseConditions: {
    deliveryVerified: boolean;
    photoProvided: boolean;
    noDisputes: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PACKAGE TRACKING SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export class PackageTrackingService {
  private static instance: PackageTrackingService;
  private packages: Map<string, PackageTracking> = new Map();
  private escrows: Map<string, PackagePaymentEscrow> = new Map();

  private constructor() {}

  static getInstance(): PackageTrackingService {
    if (!PackageTrackingService.instance) {
      PackageTrackingService.instance = new PackageTrackingService();
    }
    return PackageTrackingService.instance;
  }

  /**
   * Create a new package with tracking code
   */
  async createPackage(params: {
    senderId: string;
    from: string;
    to: string;
    size: 'small' | 'medium' | 'large';
    value: number;
    insurance: boolean;
    description?: string;
  }): Promise<PackageTracking> {
    const packageId = generateId('pkg');
    const trackingCode = this.generateTrackingCode();
    const pickupCode = this.generateVerificationCode();
    const deliveryCode = this.generateVerificationCode();

    // Calculate pricing
    const basePrice = this.calculateBasePrice(params.size);
    const insuranceCost = params.insurance ? params.value * 0.01 : 0; // 1% of value
    const totalCost = basePrice + insuranceCost;

    const pkg: PackageTracking = {
      id: packageId,
      trackingCode,
      qrCodeUrl: this.generateQRCodeUrl(trackingCode),
      
      senderId: params.senderId,
      from: params.from,
      to: params.to,
      size: params.size,
      value: params.value,
      insurance: params.insurance,
      description: params.description,
      
      price: basePrice,
      insuranceCost,
      totalCost,
      paymentStatus: 'pending',
      
      status: 'created',
      
      createdAt: new Date(),
      lastUpdated: new Date(),
      
      pickupVerificationCode: pickupCode,
      deliveryVerificationCode: deliveryCode,
      pickupVerified: false,
      deliveryVerified: false,
      
      senderCanContactDriver: false,
    };

    this.packages.set(packageId, pkg);
    return pkg;
  }

  /**
   * Link package to a ride
   */
  async linkPackageToRide(packageId: string, rideDetails: {
    rideId: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverPhoto?: string;
    vehicleInfo?: string;
  }): Promise<PackageTracking> {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error('Package not found');

    pkg.rideId = rideDetails.rideId;
    pkg.driverId = rideDetails.driverId;
    pkg.driverName = rideDetails.driverName;
    pkg.driverPhone = rideDetails.driverPhone;
    pkg.driverPhoto = rideDetails.driverPhoto;
    pkg.vehicleInfo = rideDetails.vehicleInfo;
    pkg.status = 'matched';
    pkg.senderCanContactDriver = true;
    pkg.lastUpdated = new Date();

    this.packages.set(packageId, pkg);
    return pkg;
  }

  /**
   * Process payment and hold in escrow
   */
  async processPayment(packageId: string, paymentMethod: string): Promise<PackagePaymentEscrow> {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error('Package not found');

    // Create escrow
    const escrow: PackagePaymentEscrow = {
      packageId,
      amount: pkg.totalCost,
      senderPaid: true,
      heldInEscrow: true,
      releasedToDriver: false,
      releaseConditions: {
        deliveryVerified: false,
        photoProvided: false,
        noDisputes: false,
      },
    };

    pkg.paymentStatus = 'escrowed';
    pkg.paymentMethod = paymentMethod;
    pkg.lastUpdated = new Date();

    this.packages.set(packageId, pkg);
    this.escrows.set(packageId, escrow);

    return escrow;
  }

  /**
   * Verify pickup with QR code
   */
  async verifyPickup(packageId: string, verificationCode: string, photo?: string): Promise<boolean> {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error('Package not found');

    if (pkg.pickupVerificationCode !== verificationCode) {
      return false;
    }

    pkg.pickupVerified = true;
    pkg.status = 'picked_up';
    pkg.pickedUpAt = new Date();
    pkg.pickupPhoto = photo;
    pkg.lastUpdated = new Date();

    this.packages.set(packageId, pkg);
    return true;
  }

  /**
   * Update package location during transit
   */
  async updateLocation(packageId: string, location: { lat: number; lng: number }): Promise<void> {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error('Package not found');

    pkg.currentLocation = location;
    
    // Check if near destination
    if (this.isNearDestination(location, pkg.to)) {
      pkg.status = 'near_destination';
    } else if (pkg.status === 'picked_up') {
      pkg.status = 'in_transit';
      pkg.inTransitAt = new Date();
    }

    pkg.lastUpdated = new Date();
    this.packages.set(packageId, pkg);
  }

  /**
   * Verify delivery with QR code and release payment
   */
  async verifyDelivery(
    packageId: string, 
    verificationCode: string, 
    photo?: string
  ): Promise<{ verified: boolean; paymentReleased: boolean }> {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error('Package not found');

    if (pkg.deliveryVerificationCode !== verificationCode) {
      return { verified: false, paymentReleased: false };
    }

    // Verify delivery
    pkg.deliveryVerified = true;
    pkg.status = 'delivered';
    pkg.deliveredAt = new Date();
    pkg.deliveryPhoto = photo;
    pkg.lastUpdated = new Date();

    // Release payment from escrow to driver
    const escrow = this.escrows.get(packageId);
    if (escrow && escrow.heldInEscrow) {
      escrow.releaseConditions.deliveryVerified = true;
      escrow.releaseConditions.photoProvided = !!photo;
      escrow.releaseConditions.noDisputes = true; // Check for disputes in real system

      // Check if all conditions met
      if (this.canReleasePayment(escrow)) {
        escrow.releasedToDriver = true;
        escrow.heldInEscrow = false;
        pkg.paymentStatus = 'released';
        
        this.escrows.set(packageId, escrow);
      }
    }

    this.packages.set(packageId, pkg);

    return { 
      verified: true, 
      paymentReleased: pkg.paymentStatus === 'released' 
    };
  }

  /**
   * Get package tracking info
   */
  getPackage(packageId: string): PackageTracking | undefined {
    return this.packages.get(packageId);
  }

  /**
   * Get package by tracking code
   */
  getPackageByTrackingCode(trackingCode: string): PackageTracking | undefined {
    return Array.from(this.packages.values()).find(
      pkg => pkg.trackingCode === trackingCode
    );
  }

  /**
   * Get all packages for a sender
   */
  getSenderPackages(senderId: string): PackageTracking[] {
    return Array.from(this.packages.values()).filter(
      pkg => pkg.senderId === senderId
    );
  }

  /**
   * Get all packages for a driver
   */
  getDriverPackages(driverId: string): PackageTracking[] {
    return Array.from(this.packages.values()).filter(
      pkg => pkg.driverId === driverId
    );
  }

  /**
   * Get escrow status
   */
  getEscrowStatus(packageId: string): PackagePaymentEscrow | undefined {
    return this.escrows.get(packageId);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private generateTrackingCode(): string {
    // Format: WSL-PKG-XXXXXX (e.g., WSL-PKG-A1B2C3)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'WSL-PKG-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateVerificationCode(): string {
    // 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateQRCodeUrl(trackingCode: string): string {
    // Use QR code API (e.g., qrcode.react or external service)
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trackingCode)}`;
  }

  private calculateBasePrice(size: 'small' | 'medium' | 'large'): number {
    switch (size) {
      case 'small': return 3.0; // JOD
      case 'medium': return 5.0;
      case 'large': return 8.0;
      default: return 3.0;
    }
  }

  private isNearDestination(
    currentLocation: { lat: number; lng: number },
    destination: string
  ): boolean {
    // Simple distance check (would use actual coordinates in production)
    // For now, return false (would need geocoding)
    return false;
  }

  private canReleasePayment(escrow: PackagePaymentEscrow): boolean {
    return (
      escrow.releaseConditions.deliveryVerified &&
      escrow.releaseConditions.photoProvided &&
      escrow.releaseConditions.noDisputes
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

export const packageTrackingService = PackageTrackingService.getInstance();
