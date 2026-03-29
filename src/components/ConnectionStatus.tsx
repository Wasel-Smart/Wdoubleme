/**
 * Connection Status Indicator
 * Shows real-time connection health and performance metrics
 */

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Activity, Clock, Zap } from 'lucide-react';
import { getConnectionMetrics } from '../utils/supabase/client';
import { networkMonitor } from '../utils/performanceOptimizer';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

type NetworkQuality = 'fast' | 'medium' | 'slow' | 'offline';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [quality, setQuality] = useState<NetworkQuality>('fast');
  const [metrics, setMetrics] = useState({
    queuedRequests: 0,
    connectionHealthy: true,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update network quality
    const unsubscribe = networkMonitor.onQualityChange((newQuality) => {
      setQuality(newQuality);
    });

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      const currentMetrics = getConnectionMetrics();
      setMetrics({
        queuedRequests: currentMetrics.queuedRequests,
        connectionHealthy: currentMetrics.connectionHealthy,
      });
      setQuality(networkMonitor.getQuality());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Don't show if everything is perfect
  if (isOnline && quality === 'fast' && metrics.queuedRequests === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (quality === 'slow') return 'text-yellow-500';
    if (quality === 'medium') return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (quality === 'slow') return 'Slow Connection';
    if (quality === 'medium') return 'Medium Speed';
    return 'Connected';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className="bg-card border-border shadow-lg cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="p-3 flex items-center gap-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <span className="text-sm font-medium text-[#F1F5F9]">
            {getStatusText()}
          </span>
          
          {metrics.queuedRequests > 0 && (
            <Badge variant="secondary" className="ml-2">
              {metrics.queuedRequests} queued
            </Badge>
          )}
        </div>

        {showDetails && (
          <div className="border-t border-[#1E293B] p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Network Quality:</span>
              <Badge variant={quality === 'fast' ? 'default' : 'secondary'}>
                <Zap className="h-3 w-3 mr-1" />
                {quality.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Backend Status:</span>
              <Badge variant={metrics.connectionHealthy ? 'default' : 'destructive'}>
                <Activity className="h-3 w-3 mr-1" />
                {metrics.connectionHealthy ? 'Healthy' : 'Checking...'}
              </Badge>
            </div>

            {metrics.queuedRequests > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Queued Requests:</span>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {metrics.queuedRequests}
                </Badge>
              </div>
            )}

            <div className="pt-2 border-t border-[#1E293B]">
              <p className="text-xs text-[#64748B]">
                {isOnline
                  ? metrics.queuedRequests > 0
                    ? 'Requests will be processed when connection improves'
                    : 'All systems operational'
                  : 'Working offline. Changes will sync when online.'}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}