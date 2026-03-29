/**
 * Wasel Organic Growth Engine
 * 
 * Implements the "Shine From Within" philosophy:
 * Quality (95%+) × Delight × Community × Transparency = Organic Growth
 */

export interface GrowthMetrics {
  viralCoefficient: number; // Goal: > 1.5
  npsScore: number;        // Goal: > 70
  retentionRate: number;   // Goal: > 80%
  referralRate: number;    // Goal: > 30%
}

export class OrganicGrowthEngine {
  private static instance: OrganicGrowthEngine;
  
  // Simulation state
  private delightProbability = 0.10; // 10% chance for random surprise
  private currentNPS = 72;
  private totalReferrals = 1250;
  private totalUsers = 850;

  private constructor() {}

  public static getInstance(): OrganicGrowthEngine {
    if (!OrganicGrowthEngine.instance) {
      OrganicGrowthEngine.instance = new OrganicGrowthEngine();
    }
    return OrganicGrowthEngine.instance;
  }

  /**
   * Calculates the current Viral Coefficient (K-factor)
   * K = i * c
   * i = number of invites sent by each customer
   * c = conversion rate of each invite
   */
  public calculateViralCoefficient(invitesSent: number, invitesConverted: number, activeUsers: number): number {
    if (activeUsers === 0) return 0;
    
    // Average invites per user
    const i = invitesSent / activeUsers;
    // Conversion rate
    const c = invitesSent > 0 ? invitesConverted / invitesSent : 0;
    
    return parseFloat((i * c).toFixed(2));
  }

  /**
   * Determines if a "Delight Moment" should be triggered for a user.
   * "Surprise Randomly - 10% free rides, unpredictable delight"
   */
  public checkForDelightMoment(userId: string): { triggered: boolean; type?: 'free_ride' | 'upgrade' | 'gift' } {
    // In a real app, check user history to ensure they haven't been delighted too recently
    // For now, simple probability
    const roll = Math.random();
    
    if (roll < this.delightProbability) {
      const types: ('free_ride' | 'upgrade' | 'gift')[] = ['free_ride', 'upgrade', 'gift'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      console.log(`[OrganicGrowth] ✨ Delight triggered for ${userId}: ${type}`);
      return { triggered: true, type };
    }
    
    return { triggered: false };
  }

  /**
   * Evaluates if a user qualifies for "Advocate" status (VIP).
   * "Reward Advocates - VIP status for 5+ referrals"
   */
  public checkAdvocateStatus(referralCount: number): boolean {
    return referralCount >= 5;
  }

  /**
   * Returns current growth metrics for the "Radical Transparency" dashboard.
   */
  public getTransparencyMetrics(): GrowthMetrics {
    // In a real app, these would be calculated from DB
    return {
      viralCoefficient: 1.5,
      npsScore: this.currentNPS,
      retentionRate: 0.85,
      referralRate: 0.35
    };
  }

  /**
   * Records a new NPS rating and updates the rolling average.
   */
  public recordNPS(score: number): void {
    // Simple moving average simulation
    this.currentNPS = Math.round((this.currentNPS * 0.9) + (score * 10 * 0.1));
  }
}

export const OrganicGrowth = OrganicGrowthEngine.getInstance();
