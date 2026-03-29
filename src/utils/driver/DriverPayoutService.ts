/**
 * Driver Payout Service
 * 
 * Manages the crediting of driver wallets from various sources:
 * - Direct passenger payments
 * - Enterprise payroll deductions
 * - Corporate subsidies
 */

export interface WalletTransaction {
  id: string;
  driverId: string;
  amount: number;
  type: 'trip_fare' | 'tip' | 'bonus' | 'adjustment';
  source: 'passenger_cash' | 'passenger_card' | 'enterprise_payroll' | 'corporate_subsidy';
  referenceId: string; // Links to Trip ID or HR Transaction ID
  timestamp: string;
  status: 'pending' | 'cleared';
}

export interface DriverWallet {
  driverId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  transactions: WalletTransaction[];
}

class DriverPayoutServiceImpl {
  private static instance: DriverPayoutServiceImpl;
  private wallets: Map<string, DriverWallet> = new Map();

  private constructor() {
    // Seed with a mock wallet for the demo driver
    this.wallets.set('driver_001', {
      driverId: 'driver_001',
      balance: 1450.75,
      pendingBalance: 0,
      currency: 'JOD',
      transactions: []
    });
  }

  public static getInstance(): DriverPayoutServiceImpl {
    if (!DriverPayoutServiceImpl.instance) {
      DriverPayoutServiceImpl.instance = new DriverPayoutServiceImpl();
    }
    return DriverPayoutServiceImpl.instance;
  }

  /**
   * Credits a driver's wallet for an Enterprise trip.
   * Handles both the employee share (deducted from payroll) and the company subsidy.
   */
  public async creditEnterpriseTrip(
    driverId: string, 
    amount: number, 
    tripId: string, 
    breakdown: { employeeShare: number; subsidy: number }
  ): Promise<void> {
    console.log(`[Payout] 💰 Processing Enterprise Payout for Driver ${driverId}: ${amount} JOD`);

    // 1. Credit Employee Share
    this.addTransaction(driverId, {
      amount: breakdown.employeeShare,
      type: 'trip_fare',
      source: 'enterprise_payroll',
      referenceId: tripId,
      status: 'cleared' // Assumes payroll deduction is guaranteed
    });

    // 2. Credit Company Subsidy
    this.addTransaction(driverId, {
      amount: breakdown.subsidy,
      type: 'trip_fare',
      source: 'corporate_subsidy',
      referenceId: tripId,
      status: 'cleared' // Corporate contracts are guaranteed
    });

    // Simulate platform fee deduction (20%)
    const platformFee = amount * 0.20;
    this.addTransaction(driverId, {
      amount: -platformFee,
      type: 'adjustment',
      source: 'passenger_card', // Internal
      referenceId: `fee_${tripId}`,
      status: 'cleared'
    });
  }

  public getWallet(driverId: string): DriverWallet | undefined {
    return this.wallets.get(driverId);
  }

  private addTransaction(driverId: string, tx: Omit<WalletTransaction, 'id' | 'timestamp'>) {
    const wallet = this.wallets.get(driverId);
    if (!wallet) return; // In production, create if not exists

    const transaction: WalletTransaction = {
      ...tx,
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    wallet.transactions.unshift(transaction);
    
    // Update balances
    if (transaction.status === 'cleared') {
      wallet.balance += transaction.amount;
    } else {
      wallet.pendingBalance += transaction.amount;
    }
  }
}

export const DriverPayoutService = DriverPayoutServiceImpl.getInstance();
