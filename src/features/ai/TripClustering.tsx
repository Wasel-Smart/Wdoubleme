/**
 * Smart Trip Clustering Visualization
 * Shows how AI combines passengers + packages for maximum efficiency
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Package, MapPin, TrendingUp, DollarSign, Clock, Route } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ClusterOpportunity {
  tripId: string;
  route: string;
  currentRevenue: number;
  potentialRevenue: number;
  additionalRevenue: number;
  passengers: number;
  packages: number;
  recommendation: string;
}

interface RoutePoint {
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  type: 'pickup' | 'dropoff';
  itemId: string;
  itemType: 'passenger' | 'package';
  estimatedTime: string;
}

interface ClusterDetails {
  tripId: string;
  driverId: string;
  passengers: any[];
  packages: any[];
  optimizedRoute: RoutePoint[];
  totalRevenue: number;
  totalDistance: number;
  totalDuration: number;
  efficiency: number;
}

interface TripClusteringProps {
  driverId: string;
}

export function TripClustering({ driverId }: TripClusteringProps) {
  const [opportunities, setOpportunities] = useState<ClusterOpportunity[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ClusterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/clustering/opportunities/${driverId}`,
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
        throw new Error(error.error || 'Failed to fetch opportunities');
      }

      const data = await response.json();
      
      if (mountedRef.current) {
        setOpportunities(data.opportunities || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error fetching clustering opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load opportunities');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const createCluster = async (tripId: string) => {
    try {
      setError('');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/clustering/create/${tripId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!mountedRef.current) return;

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create cluster');
      }

      const data = await response.json();
      
      if (mountedRef.current) {
        setSelectedCluster(data.cluster);
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error creating cluster:', err);
        setError(err instanceof Error ? err.message : 'Failed to create cluster');
      }
    }
  };

  useEffect(() => {
    fetchOpportunities();

    // Refresh every 3 minutes
    const interval = setInterval(fetchOpportunities, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [driverId]);

  if (loading && opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحليل الفرص...</p>
          <p className="text-sm text-gray-500">Analyzing opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">تجميع الرحلات الذكي</h2>
            <p className="text-purple-100">Smart Trip Clustering</p>
            <p className="text-sm text-purple-200 mt-1">
              Maximize earnings by combining passengers & packages
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">لا توجد فرص تجميع حاليًا</p>
          <p className="text-sm text-gray-500">Post trips to see clustering opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp.tripId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* Route Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{opp.route}</h3>
                  <p className="text-sm text-gray-500">{opp.recommendation}</p>
                </div>
                <div className="flex gap-2">
                  {opp.passengers > 0 && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  {opp.packages > 0 && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Revenue:</span>
                  <span className="font-semibold text-gray-700">JOD {opp.currentRevenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Potential Revenue:</span>
                  <span className="font-bold text-green-600">JOD {opp.potentialRevenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Additional:</span>
                  <span className="font-bold text-purple-600">+JOD {opp.additionalRevenue.toFixed(2)}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{opp.passengers} passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">{opp.packages} packages</span>
                  </div>
                </div>
              </div>

              {/* Revenue Increase Indicator */}
              {opp.additionalRevenue > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-purple-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        +{Math.round((opp.additionalRevenue / Math.max(opp.currentRevenue, 1)) * 100)}% increase
                      </p>
                      <p className="text-xs text-green-600">Extra earnings potential</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => createCluster(opp.tripId)}
                disabled={opp.passengers === 0 && opp.packages === 0}
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-colors ${
                  opp.passengers > 0 || opp.packages > 0
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {opp.additionalRevenue > 20 ? '🔥 Accept Clustering' : 'View Details'}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cluster Details Modal */}
      <AnimatePresence>
        {selectedCluster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCluster(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-t-xl">
                <h3 className="text-2xl font-bold mb-2">Optimized Trip Cluster</h3>
                <p className="text-purple-100">AI-optimized route for maximum efficiency</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      JOD {selectedCluster.totalRevenue.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Route className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedCluster.totalDistance.toFixed(1)} km
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(selectedCluster.totalDuration)} min
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Efficiency</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(selectedCluster.efficiency * 100)}%
                    </p>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-6 h-6 text-blue-500" />
                      <span className="font-semibold text-gray-700">Passengers</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedCluster.passengers.length}
                    </p>
                  </div>

                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-6 h-6 text-green-500" />
                      <span className="font-semibold text-gray-700">Packages</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {selectedCluster.packages.length}
                    </p>
                  </div>
                </div>

                {/* Optimized Route */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">مسار محسّن | Optimized Route</h4>
                  <div className="space-y-3">
                    {selectedCluster.optimizedRoute.map((point, index) => (
                      <div key={`${point.itemId}-${index}`} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              point.type === 'pickup'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            <MapPin className="w-5 h-5" />
                          </div>
                          {index < selectedCluster.optimizedRoute.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 my-1" />
                          )}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700">
                              {point.type === 'pickup' ? 'Pick up' : 'Drop off'}{' '}
                              {point.itemType === 'passenger' ? (
                                <Users className="inline w-4 h-4 text-blue-500" />
                              ) : (
                                <Package className="inline w-4 h-4 text-green-500" />
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(point.estimatedTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{point.location.address}</p>
                          <p className="text-xs text-gray-500">{point.location.city}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCluster(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    إلغاء | Cancel
                  </button>
                  <button className="flex-1 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors">
                    قبول التجميع | Accept Cluster
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
