// Trip Analytics Service
// NOTE: This service handles trip history analytics (client-side computation).
// For event-tracking analytics, see services/analytics.ts (server-side reporting).
export interface TripAnalytics {
  totalTrips: number;
  totalDistance: number;
  totalSpent: number;
  totalEarned: number;
  carbonSaved: number;
  averageRating: number;
  totalRides: number;
  totalDrives: number;
  monthlyData: MonthlyData[];
  topRoutes: RouteStats[];
  categoryBreakdown: CategoryStats;
}

export interface MonthlyData {
  month: string;
  trips: number;
  spent: number;
  earned: number;
  distance: number;
}

export interface RouteStats {
  route: string;
  count: number;
  avgPrice: number;
  lastUsed: Date;
}

export interface CategoryStats {
  wasel: number;
  awasel: number;
  byTime: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export interface TripHistory {
  id: string;
  type: 'wasel' | 'awasel' | 'raje3';
  role: 'driver' | 'passenger';
  from: string;
  to: string;
  date: Date;
  price: number;
  distance: number;
  rating?: number;
  status: 'completed' | 'cancelled' | 'upcoming';
}

class TripAnalyticsService {
  // Calculate total analytics from trip history
  calculateAnalytics(trips: TripHistory[]): TripAnalytics {
    const completedTrips = trips.filter(t => t.status === 'completed');
    
    const totalTrips = completedTrips.length;
    const totalDistance = completedTrips.reduce((sum, t) => sum + t.distance, 0);
    
    const asPassenger = completedTrips.filter(t => t.role === 'passenger');
    const asDriver = completedTrips.filter(t => t.role === 'driver');
    
    const totalSpent = asPassenger.reduce((sum, t) => sum + t.price, 0);
    const totalEarned = asDriver.reduce((sum, t) => sum + t.price, 0);
    
    // Calculate carbon saved (average 0.12 kg CO2 per km for carpooling)
    const carbonSaved = totalDistance * 0.12;
    
    // Calculate average rating
    const ratedTrips = completedTrips.filter(t => t.rating);
    const averageRating = ratedTrips.length > 0
      ? ratedTrips.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTrips.length
      : 0;
    
    // Monthly data (last 6 months)
    const monthlyData = this.calculateMonthlyData(completedTrips);
    
    // Top routes
    const topRoutes = this.calculateTopRoutes(completedTrips);
    
    // Category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(completedTrips);
    
    return {
      totalTrips,
      totalDistance: Math.round(totalDistance),
      totalSpent: Math.round(totalSpent),
      totalEarned: Math.round(totalEarned),
      carbonSaved: Math.round(carbonSaved * 10) / 10,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRides: asPassenger.length,
      totalDrives: asDriver.length,
      monthlyData,
      topRoutes,
      categoryBreakdown
    };
  }

  private calculateMonthlyData(trips: TripHistory[]): MonthlyData[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyMap = new Map<string, MonthlyData>();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyMap.set(monthKey, {
        month: monthKey,
        trips: 0,
        spent: 0,
        earned: 0,
        distance: 0
      });
    }
    
    // Aggregate trip data
    trips.forEach(trip => {
      const tripDate = new Date(trip.date);
      const monthKey = `${months[tripDate.getMonth()]} ${tripDate.getFullYear()}`;
      const data = monthlyMap.get(monthKey);
      
      if (data) {
        data.trips++;
        data.distance += trip.distance;
        if (trip.role === 'passenger') {
          data.spent += trip.price;
        } else {
          data.earned += trip.price;
        }
      }
    });
    
    return Array.from(monthlyMap.values());
  }

  private calculateTopRoutes(trips: TripHistory[]): RouteStats[] {
    const routeMap = new Map<string, { count: number; totalPrice: number; lastUsed: Date }>();
    
    trips.forEach(trip => {
      const routeKey = `${trip.from} → ${trip.to}`;
      const existing = routeMap.get(routeKey);
      
      if (existing) {
        existing.count++;
        existing.totalPrice += trip.price;
        if (trip.date > existing.lastUsed) {
          existing.lastUsed = trip.date;
        }
      } else {
        routeMap.set(routeKey, {
          count: 1,
          totalPrice: trip.price,
          lastUsed: trip.date
        });
      }
    });
    
    const routes: RouteStats[] = Array.from(routeMap.entries()).map(([route, data]) => ({
      route,
      count: data.count,
      avgPrice: Math.round(data.totalPrice / data.count),
      lastUsed: data.lastUsed
    }));
    
    return routes.sort((a, b) => b.count - a.count).slice(0, 5);
  }

  private calculateCategoryBreakdown(trips: TripHistory[]): CategoryStats {
    const wasel = trips.filter(t => t.type === 'wasel').length;
    const awasel = trips.filter(t => t.type === 'awasel' || t.type === 'raje3').length;
    
    const byTime = {
      morning: 0,   // 6-12
      afternoon: 0, // 12-17
      evening: 0,   // 17-21
      night: 0      // 21-6
    };
    
    trips.forEach(trip => {
      const hour = new Date(trip.date).getHours();
      if (hour >= 6 && hour < 12) byTime.morning++;
      else if (hour >= 12 && hour < 17) byTime.afternoon++;
      else if (hour >= 17 && hour < 21) byTime.evening++;
      else byTime.night++;
    });
    
    return { wasel, awasel, byTime };
  }

  // Generate expense report
  generateExpenseReport(trips: TripHistory[], startDate: Date, endDate: Date): string {
    const filteredTrips = trips.filter(t => 
      t.status === 'completed' &&
      t.role === 'passenger' &&
      t.date >= startDate && 
      t.date <= endDate
    );
    
    let report = `Wasel Expense Report\n`;
    report += `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n`;
    report += `Total Trips: ${filteredTrips.length}\n`;
    report += `Total Amount: ${filteredTrips.reduce((sum, t) => sum + t.price, 0)} JOD\n\n`;
    report += `Breakdown:\n`;
    report += `Date\t\tRoute\t\t\t\tAmount\n`;
    report += `${'='.repeat(60)}\n`;
    
    filteredTrips.forEach(trip => {
      report += `${trip.date.toLocaleDateString()}\t${trip.from} → ${trip.to}\t\t${trip.price} JOD\n`;
    });
    
    return report;
  }

  // Get mock trip history — Jordan locations, JOD pricing
  getMockTripHistory(): TripHistory[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'wasel',
        role: 'passenger',
        from: 'Abdoun, Amman',
        to: 'Downtown Amman',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        price: 3.5,
        distance: 12,
        rating: 5,
        status: 'completed'
      },
      {
        id: '2',
        type: 'awasel',
        role: 'driver',
        from: 'Amman',
        to: 'Aqaba',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        price: 28.0,
        distance: 335,
        rating: 4.8,
        status: 'completed'
      },
      {
        id: '3',
        type: 'wasel',
        role: 'passenger',
        from: 'Zarqa',
        to: 'Amman Queen Alia Airport',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        price: 7.5,
        distance: 38,
        rating: 4.5,
        status: 'completed'
      },
      {
        id: '4',
        type: 'wasel',
        role: 'driver',
        from: 'Sweifieh, Amman',
        to: 'University of Jordan',
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        price: 2.5,
        distance: 9,
        rating: 5,
        status: 'completed'
      },
      {
        id: '5',
        type: 'awasel',
        role: 'passenger',
        from: 'Amman',
        to: 'Irbid',
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        price: 8.0,
        distance: 90,
        rating: 4.9,
        status: 'completed'
      },
      {
        id: '6',
        type: 'wasel',
        role: 'passenger',
        from: 'Jabal Amman',
        to: 'Mecca Mall',
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        price: 4.0,
        distance: 14,
        rating: 4.7,
        status: 'completed'
      },
      {
        id: '7',
        type: 'wasel',
        role: 'driver',
        from: 'Khalda, Amman',
        to: 'Rainbow Street',
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        price: 2.0,
        distance: 7,
        rating: 5,
        status: 'completed'
      },
      {
        id: '8',
        type: 'awasel',
        role: 'passenger',
        from: 'Amman',
        to: 'Madaba',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        price: 6.5,
        distance: 30,
        rating: 4.6,
        status: 'completed'
      },
      {
        id: '9',
        type: 'wasel',
        role: 'passenger',
        from: 'Jubeiha, Amman',
        to: 'City Mall',
        date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        price: 3.0,
        distance: 11,
        rating: 4.8,
        status: 'completed'
      },
      {
        id: '10',
        type: 'wasel',
        role: 'driver',
        from: 'Wadi Seer, Amman',
        to: 'Amman Bus Station',
        date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        price: 3.5,
        distance: 13,
        rating: 5,
        status: 'completed'
      }
    ];
  }
}

/** Singleton instance of the trip-level analytics service. */
export const tripAnalyticsService = new TripAnalyticsService();

/** Alias used by UI components */
export const analyticsService = tripAnalyticsService;