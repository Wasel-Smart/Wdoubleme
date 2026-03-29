/**
 * Interactive Demand Heatmap
 * Real-time visualization of high-demand areas for drivers
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { MapPin, TrendingUp, DollarSign, Users, Navigation } from 'lucide-react';

interface RouteIntelligence {
  route: string;
  currentSupply: number;
  forecastedDemand: number;
  supplyGap: number;
  recommendedDrivers: number;
  incentiveAmount: number;
  peakHours: string[];
  averageRevenue: number;
}

interface HeatmapData {
  date: string;
  routes: RouteIntelligence[];
  summary: {
    totalDemand: number;
    totalSupply: number;
    totalGap: number;
    driversNeeded: number;
  };
}

export function DemandHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/analytics/demand-heatmap?date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!mountedRef.current) return;

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch heatmap');
      }

      const result = await response.json();
      
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error fetching demand heatmap:', err);
        setError(err instanceof Error ? err.message : 'Failed to load heatmap');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHeatmap();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchHeatmap, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const getHeatColor = (supplyGap: number): string => {
    if (supplyGap >= 20) return 'bg-red-500';
    if (supplyGap >= 10) return 'bg-orange-500';
    if (supplyGap >= 5) return 'bg-yellow-500';
    if (supplyGap > 0) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const getHeatLabel = (supplyGap: number): string => {
    if (supplyGap >= 20) return 'Very High Demand';
    if (supplyGap >= 10) return 'High Demand';
    if (supplyGap >= 5) return 'Moderate Demand';
    if (supplyGap > 0) return 'Low Demand';
    return 'No Demand';
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل خريطة الطلب...</p>
          <p className="text-sm text-gray-500">Loading demand heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 mb-2">خطأ في تحميل البيانات</p>
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchHeatmap}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">خريطة الطلب الحية</h2>
          <p className="text-sm text-gray-500">Live Demand Heatmap</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchHeatmap}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Demand</p>
              <p className="text-2xl font-bold text-blue-600">{data.summary.totalDemand}</p>
              <p className="text-xs text-gray-500">passengers</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Current Supply</p>
              <p className="text-2xl font-bold text-green-600">{data.summary.totalSupply}</p>
              <p className="text-xs text-gray-500">seats available</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Supply Gap</p>
              <p className="text-2xl font-bold text-orange-600">{data.summary.totalGap}</p>
              <p className="text-xs text-gray-500">unmet demand</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 border border-purple-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Drivers Needed</p>
              <p className="text-2xl font-bold text-purple-600">{data.summary.driversNeeded}</p>
              <p className="text-xs text-gray-500">opportunities</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Heat Legend */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">مستويات الطلب | Demand Levels</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Very High (20+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">High (10-19)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Moderate (5-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Low (1-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">No Demand</span>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.routes.map((route, index) => (
          <motion.div
            key={route.route}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
          >
            {/* Route Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{route.route}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 ${getHeatColor(route.supplyGap)} text-white text-xs font-semibold rounded`}>
                    {getHeatLabel(route.supplyGap)}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Demand:</span>
                <span className="font-semibold text-blue-600">{route.forecastedDemand} passengers</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Supply:</span>
                <span className="font-semibold text-green-600">{route.currentSupply} seats</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Gap:</span>
                <span className="font-semibold text-orange-600">{route.supplyGap} unmet</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Revenue:</span>
                <span className="font-semibold text-purple-600">JOD {route.averageRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Incentive */}
            {route.incentiveAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Incentive: JOD {route.incentiveAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600">Bonus for this route today</p>
                  </div>
                </div>
              </div>
            )}

            {/* Peak Hours */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-2">Peak Hours:</p>
              <div className="flex flex-wrap gap-1">
                {route.peakHours.map((hour) => (
                  <span
                    key={hour}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            {route.supplyGap > 0 && (
              <button className="w-full mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                {route.supplyGap > 10 ? '🔥 Go Now!' : 'View Details'}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* No Routes */}
      {data.routes.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد بيانات متاحة لهذا التاريخ</p>
          <p className="text-sm text-gray-400">No data available for this date</p>
        </div>
      )}
    </div>
  );
}
