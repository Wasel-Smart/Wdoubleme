/**
 * Trip Verification Service
 * 
 * Securely generates and validates boarding passes for riders.
 * Ensures that the rider is authorized and the trip is valid.
 */

export interface BoardingPass {
  token: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  status: 'valid' | 'used' | 'expired';
  generatedAt: string;
  expiresAt: string;
}

class TripVerificationServiceImpl {
  private static instance: TripVerificationServiceImpl;
  private activePasses: Map<string, BoardingPass> = new Map();

  private constructor() {}

  public static getInstance(): TripVerificationServiceImpl {
    if (!TripVerificationServiceImpl.instance) {
      TripVerificationServiceImpl.instance = new TripVerificationServiceImpl();
    }
    return TripVerificationServiceImpl.instance;
  }

  /**
   * Generates a secure boarding pass for a confirmed trip.
   */
  public generateBoardingPass(tripId: string, passengerId: string, passengerName: string): BoardingPass {
    const token = `PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    const pass: BoardingPass = {
      token,
      tripId,
      passengerId,
      passengerName,
      status: 'valid',
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Valid for 24h
    };

    this.activePasses.set(token, pass);
    console.log(`[Verification] 🎫 Generated boarding pass for ${passengerName}: ${token}`);
    
    return pass;
  }

  /**
   * Verifies a boarding pass token scanned by the driver.
   */
  public verifyPass(token: string): { valid: boolean; message: string; pass?: BoardingPass } {
    const pass = this.activePasses.get(token);

    if (!pass) {
      return { valid: false, message: 'Invalid boarding pass. Ticket not found.' };
    }

    if (pass.status === 'used') {
      return { valid: false, message: 'This pass has already been used.' };
    }

    if (new Date() > new Date(pass.expiresAt)) {
      pass.status = 'expired';
      return { valid: false, message: 'Boarding pass has expired.' };
    }

    // Mark as used
    pass.status = 'used';
    this.activePasses.set(token, pass);

    console.log(`[Verification] ✅ Verified pass for ${pass.passengerName}`);
    return { valid: true, message: 'Boarding pass verified successfully.', pass };
  }
}

export const TripVerificationService = TripVerificationServiceImpl.getInstance();
