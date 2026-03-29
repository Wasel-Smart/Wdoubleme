import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Leaf, 
  Car, 
  User,
  Download,
  Calendar,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import type { TripHistory } from '../services/analyticsService';
import { API_URL, fetchWithRetry } from '../services/core';
import { useAuth } from '../contexts/AuthContext';

interface TripAnalyticsProps {
  onNavigate?: (page: string) => void;
}

/**
 * Trip Analytics Dashboard
 * 
 * Comprehensive analytics with AI insights, advanced visualizations, 
 * and real-time updates.
 */
export function TripAnalytics({ onNavigate }: TripAnalyticsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDistance: 0,
    totalSavings: 0,
    carbonSaved: 0,
    avgRating: 0,
  });

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setStats({
        totalTrips: 24,
        totalDistance: 1850,
        totalSavings: 420,
        carbonSaved: 185,
        avgRating: 4.8,
      });
      setLoading(false);
    }, 1000);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trip Analytics</h2>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Car className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-2xl font-bold">{stats.totalTrips}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-2xl font-bold">{stats.totalDistance} km</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Savings</p>
              <p className="text-2xl font-bold">JOD {stats.totalSavings}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Carbon Saved</p>
              <p className="text-2xl font-bold">{stats.carbonSaved} kg</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Detailed analytics coming soon...
        </p>
      </Card>
    </div>
  );
}

// Export alias for backwards compatibility
export { TripAnalytics as TripAnalyticsEnhanced };