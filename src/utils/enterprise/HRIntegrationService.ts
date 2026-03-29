/**
 * Wassel Enterprise HR Integration Service
 * 
 * seamless connection between Wassel's ride ecosystem and corporate ERPs (SAP, Oracle, Workday).
 * Handles automated payroll deductions, subsidy calculations, and compliance reporting.
 */

import { WalletService } from '../../utils/finance/WalletService';

export type HRSystemType = 'SAP_SUCCESSFACTORS' | 'ORACLE_HCM' | 'WORKDAY' | 'MENA_ITECH';

export interface EmployeeProfile {
  id: string;
  companyId: string;
  employeeId: string; // The ID in the HR system
  name: string;
  email: string;
  department: string;
  role: string;
  subsidyTier: 'standard' | 'premium' | 'executive';
  monthlyBudget: number; // Max deduction allowed
  currentSpend: number;
}

export interface DeductionTransaction {
  id: string;
  employeeId: string;
  tripId: string;
  totalAmount: number;
  employeeShare: number;
  companySubsidy: number;
  timestamp: string;
  status: 'pending' | 'posted' | 'reconciled';
  erpReferenceId?: string; // ID returned from SAP/Oracle
}

export interface CompanyPolicy {
  id: string;
  name: string;
  hrSystem: HRSystemType;
  subsidyPercentage: number; // e.g., 0.5 for 50%
  maxSubsidyPerRide: number; // e.g., 5 JOD
  allowWeekends: boolean;
}

class HRIntegrationServiceImpl {
  private static instance: HRIntegrationServiceImpl;
  
  // Mock database for the pilot
  private employees: Map<string, EmployeeProfile> = new Map();
  private transactions: DeductionTransaction[] = [];
  
  private constructor() {
    // Seed with dummy data for the pilot
    this.seedMockData();
  }

  public static getInstance(): HRIntegrationServiceImpl {
    if (!HRIntegrationServiceImpl.instance) {
      HRIntegrationServiceImpl.instance = new HRIntegrationServiceImpl();
    }
    return HRIntegrationServiceImpl.instance;
  }

  /**
   * Connects to the external HR system.
   * In a real implementation, this would handle OAuth/API keys.
   */
  public async connectToERP(companyId: string, system: HRSystemType): Promise<boolean> {
    console.log(`[HR-Link] 🔗 Initializing secure handshake with ${system} for company ${companyId}...`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
    console.log(`[HR-Link] ✅ Connection established. Token: secure_token_${Math.random().toString(36).substring(7)}`);
    return true;
  }

  /**
   * Validates an employee's eligibility for a corporate ride.
   * Checks budget caps and policy restrictions.
   */
  public async validateEligibility(employeeId: string): Promise<{ eligible: boolean; reason?: string; remainingBudget?: number }> {
    const employee = this.employees.get(employeeId);
    
    if (!employee) {
      return { eligible: false, reason: 'Employee not found in HR records' };
    }

    const remaining = employee.monthlyBudget - employee.currentSpend;
    if (remaining <= 0) {
      return { eligible: false, reason: 'Monthly transport allowance exceeded', remainingBudget: 0 };
    }

    return { eligible: true, remainingBudget: remaining };
  }

  /**
   * Calculates the split between Employee Pay and Company Subsidy based on policy.
   */
  public calculateSplit(totalAmount: number, employeeId: string): { employeePay: number; companyPay: number } {
    const employee = this.employees.get(employeeId);
    // Default policy for pilot: 40% company subsidy up to 3 JOD
    const subsidyRate = employee?.subsidyTier === 'executive' ? 1.0 : 0.4;
    const maxSubsidy = employee?.subsidyTier === 'executive' ? 100 : 3.0;

    let companyPay = totalAmount * subsidyRate;
    if (companyPay > maxSubsidy) companyPay = maxSubsidy;
    
    const employeePay = totalAmount - companyPay;

    return {
      employeePay: parseFloat(employeePay.toFixed(2)),
      companyPay: parseFloat(companyPay.toFixed(2))
    };
  }

  /**
   * Executes the payroll deduction transaction.
   * This posts the "Employee Share" to the HR system's ledger.
   */
  public async processDeduction(employeeId: string, tripId: string, totalAmount: number, driverId: string): Promise<DeductionTransaction> {
    const { employeePay, companyPay } = this.calculateSplit(totalAmount, employeeId);
    
    // Simulate API call to SAP/Oracle
    console.log(`[HR-Link] 💸 Posting deduction to Payroll Ledger: ${employeePay} JOD for ${employeeId}`);
    
    // Credit the driver's wallet via the central Finance Service
    // We credit the *full* amount (Employee + Company share) because the platform fronts the subsidy
    await WalletService.creditDriver(
      driverId, 
      totalAmount, 
      'corporate_deduction', 
      `Corporate Ride - ${employeeId} (${companyPay.toFixed(2)} JOD Subsidized)`,
      tripId
    );

    const transaction: DeductionTransaction = {
      id: `txn_${Math.random().toString(36).substring(2, 9)}`,
      employeeId,
      tripId,
      totalAmount,
      employeeShare: employeePay,
      companySubsidy: companyPay,
      timestamp: new Date().toISOString(),
      status: 'posted',
      erpReferenceId: `SAP_${Date.now()}`
    };

    // Update local state
    this.transactions.unshift(transaction);
    const employee = this.employees.get(employeeId);
    if (employee) {
      employee.currentSpend += employeePay;
    }

    return transaction;
  }

  /**
   * Retrieves the monthly statement for the employee dashboard.
   */
  public getMonthlyStatement(employeeId: string): DeductionTransaction[] {
    return this.transactions.filter(t => t.employeeId === employeeId);
  }

  public getEmployeeProfile(id: string): EmployeeProfile | undefined {
    return this.employees.get(id);
  }

  private seedMockData() {
    this.employees.set('emp_001', {
      id: 'emp_001',
      companyId: 'comp_tech_jordan',
      employeeId: '10045',
      name: 'Layla Al-Fayez',
      email: 'layla@techjordan.com',
      department: 'Engineering',
      role: 'Senior Developer',
      subsidyTier: 'standard',
      monthlyBudget: 150, // JOD
      currentSpend: 45.50
    });

    this.employees.set('emp_002', {
      id: 'emp_002',
      companyId: 'comp_tech_jordan',
      employeeId: '10099',
      name: 'Omar Khalil',
      email: 'omar@techjordan.com',
      department: 'Sales',
      role: 'Director',
      subsidyTier: 'executive',
      monthlyBudget: 500,
      currentSpend: 120.00
    });
  }
}

export const HRIntegration = HRIntegrationServiceImpl.getInstance();
