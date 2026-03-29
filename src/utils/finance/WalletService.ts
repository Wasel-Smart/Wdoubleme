/**
 * Wassel Finance & Wallet Service
 * 
 * Manages driver earnings, digital wallets, and payout processing.
 * Handles both standard trip fares and corporate payroll deductions.
 */

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'trip_fare' | 'corporate_deduction' | 'subsidy' | 'payout' | 'tip' | 'bonus';
  description: string;
  referenceId?: string; // e.g., tripId or invoiceId
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface DriverBalance {
  driverId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  currency: string;
}

class WalletServiceImpl {
  private static instance: WalletServiceImpl;
  
  // Mock ledger
  private driverBalances: Map<string, DriverBalance> = new Map();
  private transactions: WalletTransaction[] = [];

  private constructor() {
    // Seed with mock data for the pilot driver "Sameer K." (driver_001)
    this.seedMockData();
  }

  public static getInstance(): WalletServiceImpl {
    if (!WalletServiceImpl.instance) {
      WalletServiceImpl.instance = new WalletServiceImpl();
    }
    return WalletServiceImpl.instance;
  }

  /**
   * Credits a driver's wallet.
   * Used by HR Integration when a corporate ride is processed.
   */
  public async creditDriver(driverId: string, amount: number, category: WalletTransaction['category'], description: string, referenceId?: string): Promise<WalletTransaction> {
    const balance = this.driverBalances.get(driverId) || this.createEmptyBalance(driverId);
    
    // Simulate processing time/fee calculation could happen here
    // For corporate rides, we might put it in "pending" until the monthly invoice clears, 
    // BUT for the pilot, let's make it available immediately to delight the driver.
    
    balance.availableBalance += amount;
    balance.totalEarnings += amount;
    
    const transaction: WalletTransaction = {
      id: `txn_wal_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      type: 'credit',
      category,
      description,
      referenceId,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    this.transactions.unshift(transaction);
    this.driverBalances.set(driverId, balance);

    console.log(`[Wallet] 💰 Credited ${amount} JOD to driver ${driverId} via ${category}`);
    return transaction;
  }

  /**
   * Gets the current balance and transaction history for a driver.
   */
  public getDriverWallet(driverId: string): { balance: DriverBalance, history: WalletTransaction[] } {
    const balance = this.driverBalances.get(driverId) || this.createEmptyBalance(driverId);
    const history = this.transactions.filter(t => 
      // In a real DB, transactions would have a driverId column. 
      // For this mock, we assume all current transactions belong to the logged-in driver context or we filter if we added driverId to txn.
      // Let's assume the mock transactions are all for the current user for simplicity in this demo.
      true 
    );
    
    return { balance, history };
  }

  private createEmptyBalance(driverId: string): DriverBalance {
    return {
      driverId,
      availableBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      currency: 'JOD'
    };
  }

  private seedMockData() {
    // Driver: Sameer K.
    this.driverBalances.set('driver_001', {
      driverId: 'driver_001',
      availableBalance: 142.50,
      pendingBalance: 45.00,
      totalEarnings: 3250.00,
      currency: 'JOD'
    });
    
    // Seed some initial transactions
    this.transactions.push({
      id: 'txn_init_1',
      amount: 12.50,
      type: 'credit',
      category: 'trip_fare',
      description: 'Trip to Airport',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    });
  }
}

export const WalletService = WalletServiceImpl.getInstance();
