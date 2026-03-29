import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Users,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
  Navigation,
  Phone,
  MessageSquare,
  DollarSign,
  Award,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';

interface LiveRide {
  id: string;
  riderId: string;
  riderName: string;
  driverId: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  status: 'searching' | 'accepted' | 'arriving' | 'picked-up' | 'in-progress' | 'completed';
  startTime: string;
  eta: number; // minutes
  distance: number; // km
  fare: number;
  lat: number;
  lng: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function RealTimeOperationsDashboard() {
  const { language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCity, setSelectedCity] = useState('amman');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const refreshTimer = setInterval(() => {
      // In production, this would fetch fresh data from the API
    }, 30000);
    return () => clearInterval(refreshTimer);
  }, [autoRefresh]);

  // Mock live data (in production, this comes from WebSocket/API)
  const liveStats = {
    activeRides: 247,
    waitingRiders: 18,
    availableDrivers: 342,
    busyDrivers: 247,
    offlineDrivers: 89,
    avgWaitTime: 4.2, // minutes
    avgRideTime: 18.5, // minutes
    ridesCompletedToday: 3847,
    revenueToday: 52340, // JOD
    currentHourRides: 68,
    supplyDemandRatio: 18.9, // drivers per waiting rider
    platformUptime: 99.97,
    avgRating: 4.82,
    activeIssues: 3,
    criticalAlerts: 1,
  };

  const liveRides: LiveRide[] = [
    {
      id: 'R1001',
      riderId: 'U5847',
      riderName: 'Ahmed Hassan',
      driverId: 'D2341',
      driverName: 'Mohammad Ali',
      pickup: 'Abdali, Amman',
      dropoff: 'Business Bay',
      status: 'in-progress',
      startTime: '2026-01-30T10:15:00Z',
      eta: 12,
      distance: 8.5,
      fare: 45,
      lat: 25.0775,
      lng: 55.1398,
    },
    {
      id: 'R1002',
      riderId: 'U4523',
      riderName: 'Fatima Al-Maktoum',
      driverId: 'D1987',
      driverName: 'Khalid Omar',
      pickup: '7th Circle, Amman',
      dropoff: 'University of Jordan',
      status: 'picked-up',
      startTime: '2026-01-30T10:18:00Z',
      eta: 8,
      distance: 3.2,
      fare: 28,
      lat: 25.1972,
      lng: 55.2744,
    },
    {
      id: 'R1003',
      riderId: 'U8234',
      riderName: 'John Smith',
      driverId: 'D4432',
      driverName: 'Ali Abdullah',
      pickup: 'JBR Beach',
      dropoff: 'Palm Jumeirah',
      status: 'arriving',
      startTime: '2026-01-30T10:20:00Z',
      eta: 3,
      distance: 6.7,
      fare: 38,
      lat: 25.0783,
      lng: 55.1357,
    },
  ];

  const alerts: Alert[] = [
    {
      id: 'A001',
      type: 'critical',
      title: 'High Demand in Marina',
      message: 'Surge in ride requests. 42 waiting riders, only 12 available drivers nearby.',
      timestamp: '2026-01-30T10:15:00Z',
      resolved: false,
    },
    {
      id: 'A002',
      type: 'warning',
      title: 'Driver Shortage - Business Bay',
      message: '15 waiting riders, 8 available drivers. Consider surge pricing.',
      timestamp: '2026-01-30T10:18:00Z',
      resolved: false,
    },
    {
      id: 'A003',
      type: 'info',
      title: 'Peak Hour Starting',
      message: 'Evening peak hour beginning. Expected 2x demand increase.',
      timestamp: '2026-01-30T10:10:00Z',
      resolved: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'searching': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'arriving': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'picked-up': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'in-progress': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-orange-500 bg-orange-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'info': return <Activity className="w-5 h-5 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-red-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'لوحة العمليات المباشرة' : 'Real-Time Operations'}
            </h1>
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            {' • '}
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              autoRefresh
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700'
            )}
          >
            <Activity className={cn('w-5 h-5', autoRefresh && 'animate-pulse')} />
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </button>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="amman">Amman</option>
            <option value="zarqa">Zarqa</option>
          </select>
        </div>
      </motion.div>

      {/* Critical Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {alerts.filter(a => !a.resolved).map(alert => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border-2',
                getAlertColor(alert.type)
              )}
            >
              <div className="mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-lg">{alert.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
              <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100">
                Resolve
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-600" />
            <span className="text-4xl font-bold text-green-600">{liveStats.activeRides}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Rides</div>
          <div className="text-xs text-muted-foreground mt-1">In progress right now</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-6 border border-yellow-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-4xl font-bold text-yellow-600">{liveStats.waitingRiders}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Waiting Riders</div>
          <div className="text-xs text-muted-foreground mt-1">Avg wait: {liveStats.avgWaitTime} min</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Car className="w-8 h-8 text-blue-600" />
            <span className="text-4xl font-bold text-blue-600">{liveStats.availableDrivers}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Drivers</div>
          <div className="text-xs text-muted-foreground mt-1">
            {liveStats.busyDrivers} busy • {liveStats.offlineDrivers} offline
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-purple-600">
              {(liveStats.revenueToday / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue Today</div>
          <div className="text-xs text-muted-foreground mt-1">
            {liveStats.ridesCompletedToday} rides completed
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Supply/Demand Ratio</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold mt-2">{liveStats.supplyDemandRatio}:1</div>
          <div className="text-xs text-green-600 mt-1">Healthy</div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Platform Uptime</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold mt-2">{liveStats.platformUptime}%</div>
          <div className="text-xs text-green-600 mt-1">Operational</div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Rating</span>
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold mt-2">{liveStats.avgRating}</div>
          <div className="text-xs text-yellow-600 mt-1">⭐⭐⭐⭐⭐</div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Hour</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-2">{liveStats.currentHourRides}</div>
          <div className="text-xs text-primary mt-1">Rides/hour</div>
        </div>
      </div>

      {/* Active Rides Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Active Rides Monitor
          </h3>
          <span className="text-sm text-muted-foreground">
            Showing {liveRides.length} of {liveStats.activeRides} active rides
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ride ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rider</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Driver</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Route</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">ETA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Distance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fare</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {liveRides.map(ride => (
                <tr key={ride.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3 font-mono text-sm font-medium">{ride.id}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium border capitalize',
                      getStatusColor(ride.status)
                    )}>
                      {ride.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{ride.riderName}</div>
                    <div className="text-xs text-muted-foreground">{ride.riderId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{ride.driverName}</div>
                    <div className="text-xs text-muted-foreground">{ride.driverId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-green-600" />
                        {ride.pickup}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Navigation className="w-3 h-3 text-red-600" />
                        {ride.dropoff}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{ride.eta} min</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{ride.distance} km</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-primary">{ride.fare} JOD</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">API Server</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Operational</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Database</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Operational</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Payment Gateway</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Operational</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">GPS Tracking</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Operational</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Messaging</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Operational</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Notifications</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Operational</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
