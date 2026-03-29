/**
 * Wasel Admin Dashboard — Carpooling Command Center
 *
 * Aligned with BlaBlaCar model: advance booking, cost-sharing,
 * route liquidity, cultural features, and package delivery metrics.
 * "Share the Journey, Share the Cost"
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  Users, Car, DollarSign, Activity, LayoutDashboard, TrendingUp,
  ShieldAlert, MapPin, AlertTriangle, Download, Package, Calendar,
  CircleDollarSign, BarChart3, Route, RefreshCw, Target, Sparkles,
  ArrowUpRight, TrendingDown, Globe, Clock, CheckCircle2, Heart,
  Moon, Fuel, Star, UserCheck, Search, BookOpen, Truck, Shield,
} from 'lucide-react';
import { GoogleMapComponent } from '../GoogleMapComponent';
import { useAuth } from '../../contexts/AuthContext';

// Import existing detailed dashboards
import { FinancialDashboard } from './FinancialDashboard';
import { FraudDetectionDashboard } from './FraudDetectionDashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  availableRides: number;
  bookingsToday: number;
  activeRoutes: number;
  bookingSuccessRate: number;
  travelerCount: number;
  passengerCount: number;
  packagesDelivered: number;
  revenueToday: number;
  avgCostPerSeat: number;
  culturalUsage: number;
}

interface RouteMetric {
  route: string;
  routeAr: string;
  distance: string;
  ridesThisWeek: number;
  target: number;
  avgPrice: string;
  bookingRate: number;
  trend: string;
  trendUp: boolean;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

// Route Liquidity Panel
const RouteLiquidityPanel = ({ stats }: { stats: DashboardStats }) => {
  const metrics = [
    { label: 'Available Rides', value: stats.availableRides.toString(), icon: Car, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
    { label: 'Bookings Today', value: stats.bookingsToday.toString(), icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    { label: 'Traveler:Passenger Ratio', value: `1:${Math.round(stats.passengerCount / Math.max(stats.travelerCount, 1))}`, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
    { label: 'Booking Success Rate', value: `${stats.bookingSuccessRate}%`, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  ];

  return (
    <Card className="border border-primary/15 overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-slate-900 to-[#1A1F36] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-bold uppercase tracking-wider">
              Route Liquidity Monitor
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px] font-bold">
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              LIVE
            </Badge>
          </div>
          <h2 className="text-xl font-black text-white mt-2">Carpooling Operations Dashboard</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">
            "شارك الرحلة، وفّر المصاري" — Share the Journey, Share the Cost
          </p>
        </div>
      </div>

      <CardContent className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${m.bg} border ${m.border} rounded-xl p-4 text-center`}
            >
              <Icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
              <p className="text-lg font-black text-foreground leading-tight">{m.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-snug">{m.label}</p>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// KPI Card
const KPICard = ({
  label, value, delta, deltaPositive, icon: Icon, color, sub,
}: {
  label: string; value: string; delta: string; deltaPositive: boolean;
  icon: React.ElementType; color: string; sub?: string;
}) => (
  <Card className={`border-l-4 ${color} shadow-sm hover:shadow-md transition-shadow`}>
    <CardContent className="p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-black mt-1 text-foreground">{value}</h3>
        <p className={`text-xs flex items-center mt-1 font-bold ${deltaPositive ? 'text-green-600' : 'text-red-500'}`}>
          {deltaPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {delta}
        </p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="p-3 rounded-full bg-secondary/50">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

// Popular Routes Map
const PopularRoutesMap = () => (
  <Card className="lg:col-span-2 shadow-sm h-[560px] flex flex-col border border-border/60 overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40 p-5">
      <div>
        <CardTitle className="text-base font-black flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Popular Routes Map
        </CardTitle>
        <CardDescription className="text-xs">Active carpooling routes across Jordan</CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">Amman</Badge>
        <Badge variant="outline" className="text-[10px]">Aqaba</Badge>
        <Badge variant="outline" className="text-[10px]">Irbid</Badge>
      </div>
    </CardHeader>
    <CardContent className="flex-1 p-0 relative">
      <GoogleMapComponent
        className="w-full h-full"
        center={{ lat: 31.5, lng: 36.2 }}
        zoom={8}
      />
      {/* Route legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border/60 p-3 rounded-xl shadow-lg text-xs space-y-2">
        <p className="font-bold text-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
          <Route className="w-3 h-3 text-primary" /> Route Legend
        </p>
        {[
          { color: 'bg-primary', label: 'Amman → Aqaba (330 km)' },
          { color: 'bg-blue-500', label: 'Amman → Irbid (85 km)' },
          { color: 'bg-amber-500', label: 'Amman → Dead Sea (60 km)' },
          { color: 'bg-green-500', label: 'Amman → Zarqa (30 km)' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur border border-border/60 px-3 py-2 rounded-xl shadow-lg text-xs font-bold">
        <span className="text-primary">47</span> Rides Today · <span className="text-amber-500">12</span> Routes · <span className="text-green-600">82%</span> Booked
      </div>
    </CardContent>
  </Card>
);

// Recent Activity Panel
const RecentActivityPanel = () => (
  <div className="space-y-4">
    <Card className="border border-border/60 h-[270px] flex flex-col shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto space-y-3 flex-1 p-4 pt-0">
        {[
          { msg: 'New ride posted', sub: 'Ahmad K. · Amman → Aqaba · 3 seats · JOD 8/seat', color: 'bg-primary', time: '2m' },
          { msg: 'Seat booked', sub: 'Sara M. booked Amman → Irbid · JOD 4 · Fri 3 PM', color: 'bg-green-500', time: '5m' },
          { msg: 'Package accepted', sub: 'Khalid T. carrying 2kg to Aqaba · JOD 5', color: 'bg-amber-500', time: '8m' },
          { msg: 'Ride completed', sub: 'Amman → Dead Sea · 4 passengers · JOD 20 total', color: 'bg-blue-500', time: '15m' },
          { msg: 'New review ⭐⭐⭐⭐⭐', sub: 'Fatima H. rated Omar S. 5 stars', color: 'bg-violet-500', time: '22m' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm pb-3 border-b border-border/40 last:border-0">
            <div className={`mt-1.5 min-w-[7px] h-[7px] rounded-full ${item.color} flex-shrink-0`} />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-xs">{item.msg}</p>
              <p className="text-muted-foreground text-[10px]">{item.sub}</p>
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className="border border-border/60 h-[270px] flex flex-col shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600">
          <AlertTriangle className="w-4 h-4" /> Attention Needed
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto space-y-3 flex-1 p-4 pt-0">
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Low Ride Supply</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Amman → Petra: Only 2 rides this week (target: 10)</p>
          <Badge className="mt-1.5 bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Needs Travelers</Badge>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl">
          <p className="text-xs font-bold text-red-800 dark:text-red-300">Booking Failure</p>
          <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">3 passengers couldn't find rides Amman → Madaba today</p>
          <Badge className="mt-1.5 bg-red-100 text-red-700 border-red-200 text-[10px]">Unmatched</Badge>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
          <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Package Dispute</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">User #2431 filed claim: package delayed 2 hours</p>
          <Badge className="mt-1.5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Pending Review</Badge>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Route Performance Table
const RoutePerformanceTable = () => {
  const routes: RouteMetric[] = [
    { route: 'Amman → Aqaba', routeAr: 'عمّان → العقبة', distance: '330 km', ridesThisWeek: 24, target: 10, avgPrice: 'JOD 8', bookingRate: 87, trend: '+6 rides', trendUp: true },
    { route: 'Amman → Irbid', routeAr: 'عمّان → إربد', distance: '85 km', ridesThisWeek: 38, target: 10, avgPrice: 'JOD 4', bookingRate: 92, trend: '+12 rides', trendUp: true },
    { route: 'Amman → Dead Sea', routeAr: 'عمّان → البحر الميت', distance: '60 km', ridesThisWeek: 15, target: 10, avgPrice: 'JOD 5', bookingRate: 78, trend: '+3 rides', trendUp: true },
    { route: 'Amman → Zarqa', routeAr: 'عمّان → الزرقاء', distance: '30 km', ridesThisWeek: 42, target: 10, avgPrice: 'JOD 2.5', bookingRate: 95, trend: '+8 rides', trendUp: true },
    { route: 'Amman → Petra', routeAr: 'عمّان → البتراء', distance: '250 km', ridesThisWeek: 4, target: 10, avgPrice: 'JOD 7', bookingRate: 50, trend: '-2 rides', trendUp: false },
    { route: 'Amman → Madaba', routeAr: 'عمّان → مادبا', distance: '33 km', ridesThisWeek: 8, target: 10, avgPrice: 'JOD 2', bookingRate: 62, trend: '+1 ride', trendUp: true },
  ];

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              Route Performance
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">Weekly ride supply vs target (10+ rides/week)</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">This Week</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs text-muted-foreground">
                <th className="text-left p-4 font-semibold">Route</th>
                <th className="text-left p-4 font-semibold">Distance</th>
                <th className="text-left p-4 font-semibold">Rides/Week</th>
                <th className="text-left p-4 font-semibold">Avg Price</th>
                <th className="text-left p-4 font-semibold">Booking Rate</th>
                <th className="text-left p-4 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.route} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-foreground text-sm">{r.route}</p>
                    <p className="text-[10px] text-muted-foreground" dir="rtl">{r.routeAr}</p>
                  </td>
                  <td className="p-4 text-muted-foreground">{r.distance}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-black ${r.ridesThisWeek >= r.target ? 'text-green-600' : 'text-red-500'}`}>
                        {r.ridesThisWeek}
                      </span>
                      <span className="text-[10px] text-muted-foreground">/ {r.target}</span>
                    </div>
                    <Progress value={(r.ridesThisWeek / r.target) * 100} className="h-1.5 mt-1 max-w-[80px]" />
                  </td>
                  <td className="p-4 font-semibold text-foreground">{r.avgPrice}</td>
                  <td className="p-4">
                    <span className={`font-bold ${r.bookingRate >= 80 ? 'text-green-600' : r.bookingRate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      {r.bookingRate}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold flex items-center gap-1 ${r.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                      {r.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {r.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Package Delivery Panel
const PackageDeliveryPanel = () => (
  <div className="space-y-6">
    {/* Package KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Packages This Week', value: '89', icon: Package, color: 'text-primary', trend: '+23%' },
        { label: 'Avg Delivery Price', value: 'JOD 5', icon: DollarSign, color: 'text-green-600', trend: 'Stable' },
        { label: 'On-Time Delivery', value: '94%', icon: Clock, color: 'text-amber-600', trend: '+2%' },
        { label: 'Insurance Claims', value: '2', icon: Shield, color: 'text-red-500', trend: '-1' },
      ].map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.label} className="border border-border/60">
            <CardContent className="p-4 text-center">
              <Icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
              <p className="text-2xl font-black text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{m.label}</p>
              <p className="text-[10px] font-bold text-green-600 mt-0.5">{m.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>

    {/* Recent Packages */}
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <CardTitle className="text-base font-black flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          Recent Package Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {[
            { sender: 'Noor A.', traveler: 'Ahmad K.', route: 'Amman → Aqaba', weight: '2 kg', price: 'JOD 5', status: 'Delivered', statusColor: 'bg-green-500' },
            { sender: 'Fatima H.', traveler: 'Khalid T.', route: 'Amman → Irbid', weight: '1.5 kg', price: 'JOD 3', status: 'In Transit', statusColor: 'bg-blue-500' },
            { sender: 'Omar S.', traveler: 'Sara M.', route: 'Zarqa → Amman', weight: '3 kg', price: 'JOD 4', status: 'Picked Up', statusColor: 'bg-amber-500' },
            { sender: 'Layla K.', traveler: 'Hassan B.', route: 'Amman → Dead Sea', weight: '0.5 kg', price: 'JOD 2', status: 'Delivered', statusColor: 'bg-green-500' },
          ].map((pkg, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${pkg.statusColor}`} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{pkg.route}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {pkg.sender} → {pkg.traveler} · {pkg.weight}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{pkg.price}</p>
                <Badge variant="outline" className="text-[10px]">{pkg.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Revenue Breakdown */}
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base font-bold">Package Revenue Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-3">
        {[
          { label: 'Commission (20%)', value: 'JOD 89', desc: '89 packages × avg JOD 1 commission' },
          { label: 'Insurance Fees', value: 'JOD 44.50', desc: '89 packages × JOD 0.50/package' },
          { label: 'Total Package Revenue', value: 'JOD 133.50', desc: 'This week' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
            <div>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-sm font-black text-primary">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// Cultural Features Panel
const CulturalFeaturesPanel = () => (
  <div className="space-y-6">
    {/* Cultural KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Prayer Stop Requests', value: '156', icon: '🕌', sub: 'This week', trend: '+18%' },
        { label: 'Women-Only Rides', value: '34%', icon: '🚺', sub: 'Of all bookings', trend: '+5%' },
        { label: 'Ramadan Mode Users', value: '1,204', icon: '🌙', sub: 'Active this month', trend: '+340%' },
        { label: 'Privacy Settings', value: '28%', icon: '🧕', sub: 'Photo hidden', trend: 'Stable' },
      ].map((m) => (
        <Card key={m.label} className="border border-border/60">
          <CardContent className="p-4 text-center">
            <span className="text-2xl block mb-2">{m.icon}</span>
            <p className="text-2xl font-black text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">{m.label}</p>
            <p className="text-[10px] text-muted-foreground">{m.sub}</p>
            <p className="text-[10px] font-bold text-green-600 mt-0.5">{m.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Gender Preferences Breakdown */}
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Gender Preference Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          {[
            { label: 'Mixed (Default)', pct: 45, color: 'bg-primary' },
            { label: 'Women Only (نساء فقط)', pct: 34, color: 'bg-pink-500' },
            { label: 'Men Only (رجال فقط)', pct: 14, color: 'bg-blue-500' },
            { label: 'Family Only (عائلات)', pct: 7, color: 'bg-amber-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="font-black text-foreground">{item.pct}%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2.5">
                <div className={`${item.color} h-2.5 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" />
            Ramadan Mode Stats
          </CardTitle>
          <CardDescription className="text-xs">Ramadan 2026: March 1 – March 30</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3">
          {[
            { label: 'Iftar-Timed Rides', value: '312', desc: 'Arrive before sunset' },
            { label: 'Suhoor Trips (3-4 AM)', value: '48', desc: 'Early morning rides' },
            { label: 'No Food/Drink Rides', value: '89%', desc: 'Fasting-friendly opted in' },
            { label: 'Ramadan Discount Used', value: '156', desc: '10% off applied' },
            { label: 'Prayer Stops Added', value: '+42%', desc: 'vs non-Ramadan' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <span className="text-sm font-black text-primary">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    {/* Popular Mosque Stops */}
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          🕌 Most-Used Prayer Stops Along Routes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {[
            { name: 'مسجد الحسين', nameEn: 'Al-Hussein Mosque', route: 'Amman → Aqaba', stops: 48, rating: 4.8 },
            { name: 'مسجد الملك عبدالله', nameEn: 'King Abdullah Mosque', route: 'Amman → Irbid', stops: 36, rating: 4.9 },
            { name: 'مسجد أبو درويش', nameEn: 'Abu Darwish Mosque', route: 'Amman → Dead Sea', stops: 22, rating: 4.7 },
          ].map((mosque) => (
            <div key={mosque.name} className="p-4 rounded-xl border border-border/60 bg-secondary/20">
              <p className="font-bold text-foreground text-sm" dir="rtl">{mosque.name}</p>
              <p className="text-xs text-muted-foreground">{mosque.nameEn}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Route: {mosque.route}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-bold text-primary">{mosque.stops} stops/week</span>
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500" /> {mosque.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Cost Sharing Panel
const CostSharingPanel = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      {/* How Cost Sharing Works */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Fuel className="w-4 h-4 text-primary" />
            Cost Sharing Model
          </CardTitle>
          <CardDescription className="text-xs">Fixed prices based on fuel cost — no surge pricing</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs font-bold text-primary mb-2">Example: Amman → Aqaba (330 km)</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Fuel cost (26.4L × JOD 0.90)</span><span className="font-bold">JOD 23.76</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">÷ 3 seats</span><span className="font-bold">JOD 7.92</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">+ 20% buffer (wear & tear)</span><span className="font-bold">JOD 9.50</span></div>
              <div className="border-t border-border/40 pt-1 flex justify-between text-sm">
                <span className="font-bold text-foreground">Price per seat</span>
                <span className="font-black text-primary">≈ JOD 10</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl">
            <p className="text-xs font-bold text-green-700 dark:text-green-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> No Dynamic Pricing
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">
              Cost-sharing is fixed — fuel cost doesn't change based on demand. This builds trust.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Revenue per Route */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-primary" />
            Revenue per Route (12% Commission)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3">
          {[
            { route: 'Amman → Aqaba', seats: 3, price: 8, rides: 24, commission: 2.88 },
            { route: 'Amman → Irbid', seats: 3, price: 4, rides: 38, commission: 1.44 },
            { route: 'Amman → Dead Sea', seats: 3, price: 5, rides: 15, commission: 1.80 },
            { route: 'Amman → Zarqa', seats: 3, price: 2.5, rides: 42, commission: 0.90 },
          ].map((r) => {
            const weeklyRevenue = (r.commission * r.seats * r.rides).toFixed(0);
            return (
              <div key={r.route} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{r.route}</span>
                  <p className="text-[10px] text-muted-foreground">
                    JOD {r.price}/seat × {r.seats} seats × {r.rides} rides/wk
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-primary">JOD {weeklyRevenue}</span>
                  <p className="text-[10px] text-muted-foreground">/week</p>
                </div>
              </div>
            );
          })}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Total Weekly Ride Revenue</span>
            <span className="text-lg font-black text-primary">JOD 475</span>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Traveler & Passenger Stats */}
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Community Stats
        </CardTitle>
        <CardDescription className="text-xs">Traveler-to-passenger ratio target: 1:10</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Travelers', value: '148', trend: '+32 this month', up: true },
            { label: 'Active Passengers', value: '1,420', trend: '+380 this month', up: true },
            { label: 'Avg Trips/Traveler', value: '3.8/mo', trend: 'Target: 4+', up: true },
            { label: 'Avg Trips/Passenger', value: '0.9/mo', trend: 'Target: 1+', up: false },
          ].map((s) => (
            <div key={s.label} className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{s.label}</p>
              <p className={`text-[10px] font-bold mt-1 ${s.up ? 'text-green-600' : 'text-amber-600'}`}>{s.trend}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Carpooling Ticker
const CarpoolTicker = () => {
  const items = [
    '🚗 47 rides available today',
    '📦 12 packages in transit',
    '🕌 156 prayer stops this week',
    '🚺 34% women-only rides',
    '✅ 82% booking success rate',
    '💰 Avg JOD 5.50/seat',
    '🌙 Ramadan Mode: 1,204 users',
    '⭐ 4.8 avg traveler rating',
  ];

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-xl py-2 px-0">
      <div className="flex gap-8 animate-[ticker_25s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-[11px] font-semibold text-slate-300 flex-shrink-0">
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    availableRides: 47,
    bookingsToday: 34,
    activeRoutes: 12,
    bookingSuccessRate: 82,
    travelerCount: 148,
    passengerCount: 1420,
    packagesDelivered: 89,
    revenueToday: 475,
    avgCostPerSeat: 5.5,
    culturalUsage: 67,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        availableRides: prev.availableRides + Math.floor(Math.random() * 3 - 1),
        bookingsToday: prev.bookingsToday + (Math.random() > 0.6 ? 1 : 0),
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">

      {/* Top Navigation */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground">Wasel Admin</h1>
              <p className="text-[10px] text-muted-foreground font-medium">Carpooling Operations Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-bold">
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              LIVE
            </Badge>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-black">AD</div>
              <span className="text-sm font-semibold">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1920px] mx-auto space-y-6">

        {/* Route Liquidity Health */}
        <RouteLiquidityPanel stats={stats} />

        {/* KPI Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Active Routes"
            value={stats.activeRoutes.toString()}
            delta="+2 new routes this month"
            deltaPositive
            icon={Route}
            color="border-l-primary"
          />
          <KPICard
            label="Today's Revenue"
            value={`JOD ${stats.revenueToday}`}
            delta="+15% vs last week"
            deltaPositive
            icon={DollarSign}
            color="border-l-green-500"
            sub="12% commission on rides"
          />
          <KPICard
            label="Packages Delivered"
            value={stats.packagesDelivered.toString()}
            delta="+23% this week"
            deltaPositive
            icon={Package}
            color="border-l-amber-500"
            sub="20% commission + insurance"
          />
          <KPICard
            label="Avg Cost/Seat"
            value={`JOD ${stats.avgCostPerSeat}`}
            delta="Fixed cost-sharing"
            deltaPositive
            icon={Fuel}
            color="border-l-blue-500"
            sub="No surge pricing ✓"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="overview" className="px-5 py-2 font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="routes" className="px-5 py-2 font-semibold">
              <Route className="w-3.5 h-3.5 mr-1.5" /> Routes & Bookings
            </TabsTrigger>
            <TabsTrigger value="packages" className="px-5 py-2 font-semibold">
              <Package className="w-3.5 h-3.5 mr-1.5" /> Packages
            </TabsTrigger>
            <TabsTrigger value="cultural" className="px-5 py-2 font-semibold">
              <Heart className="w-3.5 h-3.5 mr-1.5" /> Cultural
            </TabsTrigger>
            <TabsTrigger value="cost-sharing" className="px-5 py-2 font-semibold">
              <Fuel className="w-3.5 h-3.5 mr-1.5" /> Cost Sharing
            </TabsTrigger>
            <TabsTrigger value="revenue" className="px-5 py-2 font-semibold">Revenue</TabsTrigger>
            <TabsTrigger value="trust" className="px-5 py-2 font-semibold">Trust & Safety</TabsTrigger>
          </TabsList>

          {/* 1. Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PopularRoutesMap />
              <RecentActivityPanel />
            </div>
            <CarpoolTicker />
          </TabsContent>

          {/* 2. Routes & Bookings */}
          <TabsContent value="routes" className="space-y-6">
            <RoutePerformanceTable />
          </TabsContent>

          {/* 3. Package Delivery */}
          <TabsContent value="packages" className="space-y-6">
            <PackageDeliveryPanel />
          </TabsContent>

          {/* 4. Cultural Features */}
          <TabsContent value="cultural" className="space-y-6">
            <CulturalFeaturesPanel />
          </TabsContent>

          {/* 5. Cost Sharing */}
          <TabsContent value="cost-sharing" className="space-y-6">
            <CostSharingPanel />
          </TabsContent>

          {/* 6. Revenue Analytics */}
          <TabsContent value="revenue">
            <FinancialDashboard />
          </TabsContent>

          {/* 7. Trust & Safety */}
          <TabsContent value="trust">
            <FraudDetectionDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
