import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  Trash2,
  Plus
} from 'lucide-react';
import {
  generateBaselineTrips,
  generateDynamicTrips,
  getTripInjectionStats,
  cleanupExpiredTrips,
  JORDAN_CITIES,
  SyntheticTrip,
  City
} from '../../utils/tripInjectionEngine';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { areSyntheticTripsEnabled } from '../../utils/runtimeMode';

export function TripInjectionDashboard() {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(areSyntheticTripsEnabled);
  const [syntheticTrips, setSyntheticTrips] = useState<SyntheticTrip[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minResults, setMinResults] = useState(5);
  const [daysAhead, setDaysAhead] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize baseline trips on mount
  useEffect(() => {
    if (areSyntheticTripsEnabled && isActive && syntheticTrips.length === 0) {
      regenerateBaselineTrips();
    }
  }, [isActive, syntheticTrips.length]);

  // Auto-cleanup expired trips every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setSyntheticTrips(prev => cleanupExpiredTrips(prev));
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const regenerateBaselineTrips = () => {
    if (!areSyntheticTripsEnabled) return;
    setIsGenerating(true);
    setTimeout(() => {
      const trips = generateBaselineTrips(JORDAN_CITIES, daysAhead);
      setSyntheticTrips(trips);
      setIsGenerating(false);
    }, 1000);
  };

  const addDynamicTrips = (departure: City, destination: City, count: number = 5) => {
    const newTrips = generateDynamicTrips(departure, destination, undefined, count);
    setSyntheticTrips(prev => [...prev, ...newTrips]);
  };

  const clearAllTrips = () => {
    if (confirm('Are you sure you want to delete all synthetic trips?')) {
      setSyntheticTrips([]);
    }
  };

  const cleanupExpired = () => {
    setSyntheticTrips(prev => cleanupExpiredTrips(prev));
  };

  const stats = getTripInjectionStats(syntheticTrips);

  const filteredTrips = syntheticTrips.filter(trip => {
    const routeMatch = selectedRoute === 'all' || 
      `${trip.departureCity.nameEn} → ${trip.destinationCity.nameEn}` === selectedRoute;
    const typeMatch = selectedType === 'all' || trip.type === selectedType;
    const isActive = new Date(trip.expiresAt) > new Date();
    return routeMatch && typeMatch && isActive;
  });

  const routes = Object.keys(stats.byRoute);

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
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'لوحة حقن الرحلات' : 'Trip Injection Dashboard'}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'إدارة الرحلات الاصطناعية لضمان توفر السوق دائمًا'
              : 'Manage synthetic trips to ensure marketplace is always active'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            disabled={!areSyntheticTripsEnabled}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
              isActive
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-gray-300 text-gray-700',
              !areSyntheticTripsEnabled && 'opacity-60 cursor-not-allowed'
            )}
          >
            {isActive ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'متوقف' : 'Paused')}
          </button>
        </div>
      </motion.div>

      {!areSyntheticTripsEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
        >
          <div className="font-semibold text-amber-300">Synthetic trips are disabled</div>
          <p className="text-sm mt-1 text-amber-100/90">
            This internal tool now stays off by default. Enable it only in non-production environments with
            ` VITE_ENABLE_SYNTHETIC_TRIPS=true `.
          </p>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{stats.active}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Trips</div>
          <div className="text-xs text-muted-foreground mt-1">Currently available</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{stats.byType.passenger + stats.byType.shared}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Passenger Trips</div>
          <div className="text-xs text-muted-foreground mt-1">Rides & Shared</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-purple-600">{stats.byType.package}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Package Deliveries</div>
          <div className="text-xs text-muted-foreground mt-1">Cargo trips</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600">{stats.expired}</span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Expired Trips</div>
          <div className="text-xs text-muted-foreground mt-1">Need cleanup</div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          {language === 'ar' ? 'إعدادات التحكم' : 'Control Settings'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ar' ? 'الحد الأدنى للنتائج' : 'Minimum Results'}
            </label>
            <input
              type="number"
              value={minResults}
              onChange={(e) => setMinResults(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              min="1"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ar' ? 'الأيام القادمة' : 'Days Ahead'}
            </label>
            <input
              type="number"
              value={daysAhead}
              onChange={(e) => setDaysAhead(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              min="1"
              max="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  {language === 'ar' ? 'نشط' : 'Active'}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="w-5 h-5" />
                  {language === 'ar' ? 'متوقف' : 'Paused'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={regenerateBaselineTrips}
            disabled={isGenerating || !areSyntheticTripsEnabled}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn('w-5 h-5', isGenerating && 'animate-spin')} />
            {isGenerating ? (language === 'ar' ? 'جاري الإنشاء...' : 'Generating...') : (language === 'ar' ? 'إعادة إنشاء الرحلات' : 'Regenerate Baseline')}
          </button>

          <button
            onClick={cleanupExpired}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            {language === 'ar' ? 'حذف المنتهية' : 'Cleanup Expired'}
          </button>

          <button
            onClick={clearAllTrips}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            {language === 'ar' ? 'حذف الكل' : 'Clear All'}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
            {language === 'ar' ? 'المسار:' : 'Route:'}
          </span>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="all">{language === 'ar' ? 'الكل' : 'All Routes'}</option>
            {routes.map(route => (
              <option key={route} value={route}>{route} ({stats.byRoute[route]})</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
            {language === 'ar' ? 'النوع:' : 'Type:'}
          </span>
          {['all', 'passenger', 'shared', 'package', 'return'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                selectedType === type
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
              )}
            >
              {type === 'all' ? (language === 'ar' ? 'الكل' : 'All') : type}
            </button>
          ))}
        </div>
      </div>

      {/* Trip List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold">
            {language === 'ar' ? 'الرحلات النشطة' : 'Active Trips'} ({filteredTrips.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Route</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Departure</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Driver</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Capacity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredTrips.slice(0, 50).map((trip) => {
                const hoursUntilExpiry = Math.round(
                  (new Date(trip.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
                );

                return (
                  <tr key={trip.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {trip.departureCity.nameEn} → {trip.destinationCity.nameEn}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trip.distance} km • {trip.duration} min
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        trip.type === 'passenger' && 'bg-blue-100 text-blue-700',
                        trip.type === 'shared' && 'bg-green-100 text-green-700',
                        trip.type === 'package' && 'bg-purple-100 text-purple-700',
                        trip.type === 'return' && 'bg-orange-100 text-orange-700'
                      )}>
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {new Date(trip.departureTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={trip.driverProfile.photoUrl}
                          alt={trip.driverProfile.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="text-sm font-medium">{trip.driverProfile.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            ⭐ {trip.driverProfile.rating} • {trip.driverProfile.totalTrips} trips
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {trip.vehicleInfo.year} {trip.vehicleInfo.make} {trip.vehicleInfo.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trip.vehicleInfo.color} • {trip.vehicleInfo.type}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {trip.availableSeats ? (
                        <span className="text-sm">{trip.availableSeats} seats</span>
                      ) : (
                        <span className="text-sm">{trip.cargoCapacity} kg</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-primary">
                        {trip.basePrice} JOD
                      </div>
                      {trip.pricePerSeat && (
                        <div className="text-xs text-muted-foreground">
                          {trip.pricePerSeat} JOD/seat
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm',
                        hoursUntilExpiry < 6 ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {hoursUntilExpiry}h
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'لا توجد رحلات نشطة' : 'No active trips'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          {language === 'ar' ? 'كيف يعمل؟' : 'How It Works'}
        </h3>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-semibold">✅ Synthetic trips are ONLY shown to users</span> - They never know these are platform-generated
          </p>
          <p>
            <span className="font-semibold">✅ Real driver trips always take priority</span> - Synthetic trips have priority 10 vs real trips 1-5
          </p>
          <p>
            <span className="font-semibold">✅ Gradually replaced by real supply</span> - As more drivers join, synthetic trips are phased out
          </p>
          <p>
            <span className="font-semibold">✅ Always maintain minimum results</span> - Ensure users never see empty search results
          </p>
          <p className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-orange-600">⚠️ Important:</span> Synthetic trips expire after 24 hours if not booked. They cannot actually be booked - they serve as placeholder listings to make the marketplace appear active.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
