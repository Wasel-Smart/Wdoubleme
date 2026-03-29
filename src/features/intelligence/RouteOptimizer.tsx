/**
 * AI Route Optimizer
 * Suggests optimal routes with prayer stops, package pickups, and passenger pickups
 * Compatible with advance booking carpooling model
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navigation, MapPin, Clock, DollarSign, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { rtl } from '@/utils/rtl';
import { WaselColors } from '@/tokens/wasel-tokens';

interface OptimizedRoute {
  id: string;
  name: string;
  nameAr: string;
  distance: number;
  duration: number; // minutes
  stops: RouteStop[];
  savings: number; // JOD
  efficiency: number; // percentage
}

interface RouteStop {
  type: 'passenger' | 'package' | 'prayer' | 'rest';
  location: string;
  locationAr: string;
  duration: number; // minutes
  icon: string;
}

export function RouteOptimizer() {
  const { t, language, dir } = useLanguage();
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    // Mock optimized routes
    const mockRoutes: OptimizedRoute[] = [
      {
        id: '1',
        name: 'Amman → Aqaba (Optimized)',
        nameAr: 'عمّان ← العقبة (محسّن)',
        distance: 335,
        duration: 245,
        savings: 4.5,
        efficiency: 94,
        stops: [
          {
            type: 'passenger',
            location: 'Amman - Circle 7',
            locationAr: 'عمّان - الدوار السابع',
            duration: 5,
            icon: '👤',
          },
          {
            type: 'prayer',
            location: 'Dhiban Mosque',
            locationAr: 'مسجد ذيبان',
            duration: 15,
            icon: '🕌',
          },
          {
            type: 'package',
            location: 'Ma\'an Logistics',
            locationAr: 'لوجستيات معان',
            duration: 8,
            icon: '📦',
          },
          {
            type: 'rest',
            location: 'Rest Stop - Qatrana',
            locationAr: 'استراحة القطرانة',
            duration: 10,
            icon: '☕',
          },
        ],
      },
      {
        id: '2',
        name: 'Amman → Aqaba (Direct)',
        nameAr: 'عمّان ← العقبة (مباشر)',
        distance: 330,
        duration: 230,
        savings: 0,
        efficiency: 68,
        stops: [],
      },
    ];
    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0].id); // Select optimized by default
  }, []);

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'passenger':
        return '👤';
      case 'package':
        return '📦';
      case 'prayer':
        return '🕌';
      case 'rest':
        return '☕';
      default:
        return '📍';
    }
  };

  const getStopLabel = (type: string) => {
    const labels = {
      passenger: { en: 'Passenger Pickup', ar: 'استلام راكب' },
      package: { en: 'Package Pickup', ar: 'استلام طرد' },
      prayer: { en: 'Prayer Stop', ar: 'وقفة صلاة' },
      rest: { en: 'Rest Stop', ar: 'استراحة' },
    };
    return language === 'ar' ? labels[type as keyof typeof labels]?.ar : labels[type as keyof typeof labels]?.en;
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className={rtl.flex('items-center', 'gap-3')}>
          <Navigation className="w-8 h-8" style={{ color: WaselColors.primaryTeal }} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'محسّن الطرق الذكي' : 'AI Route Optimizer'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' ? 'احسب أسرع وأوفر طريق مع الوقفات' : 'Calculate fastest & cheapest route with stops'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Info */}
      <div className="bg-success/10 border-b border-success/20 p-4">
        <p className="text-sm text-foreground text-center">
          {language === 'ar'
            ? '✨ الذكاء الاصطناعي يحسب أحسن طريق يدمج الركاب، الطرود، والوقفات'
            : '✨ AI calculates optimal route combining passengers, packages, and stops'}
        </p>
      </div>

      {/* Route Comparison */}
      <div className="p-6 space-y-4">
        {routes.map((route, idx) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-6 cursor-pointer transition-all ${
              selectedRoute === route.id ? 'ring-2' : ''
            }`}
            style={{
              ringColor: selectedRoute === route.id ? WaselColors.primaryTeal : 'transparent',
            }}
            onClick={() => setSelectedRoute(route.id)}
          >
            {/* Route Header */}
            <div className={rtl.flex('items-start', 'justify-between', 'mb-4')}>
              <div className="flex-1">
                <div className={rtl.flex('items-center', 'gap-2', 'mb-2')}>
                  <h3 className="text-lg font-semibold text-foreground">
                    {language === 'ar' ? route.nameAr : route.name}
                  </h3>
                  {route.efficiency >= 85 && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${WaselColors.success}20`,
                        color: WaselColors.success,
                      }}
                    >
                      {language === 'ar' ? 'موصى به' : 'Recommended'}
                    </span>
                  )}
                </div>

                {/* Route Stats */}
                <div className={rtl.flex('items-center', 'gap-4', 'flex-wrap')}>
                  <div className={rtl.flex('items-center', 'gap-1')}>
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {route.distance} {language === 'ar' ? 'كم' : 'km'}
                    </span>
                  </div>
                  <div className={rtl.flex('items-center', 'gap-1')}>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(route.duration / 60)}h {route.duration % 60}m
                    </span>
                  </div>
                  <div className={rtl.flex('items-center', 'gap-1')}>
                    <Zap className="w-4 h-4" style={{ color: WaselColors.success }} />
                    <span className="text-sm font-medium" style={{ color: WaselColors.success }}>
                      {route.efficiency}% {language === 'ar' ? 'كفاءة' : 'efficiency'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Badge */}
              {route.savings > 0 && (
                <div
                  className="px-4 py-2 rounded-lg text-center"
                  style={{ backgroundColor: `${WaselColors.success}20` }}
                >
                  <p className="text-xs text-muted-foreground">{language === 'ar' ? 'توفير' : 'Savings'}</p>
                  <p className="text-xl font-bold" style={{ color: WaselColors.success }}>
                    +{route.savings.toFixed(1)} {language === 'ar' ? 'د.أ' : 'JOD'}
                  </p>
                </div>
              )}
            </div>

            {/* Stops Timeline */}
            {selectedRoute === route.id && route.stops.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-border"
              >
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  {language === 'ar' ? 'الوقفات المخططة' : 'Planned Stops'}
                </h4>
                <div className="space-y-3">
                  {route.stops.map((stop, stopIdx) => (
                    <div key={`${stop.location}-${stopIdx}`} className={rtl.flex('items-start', 'gap-3')}>
                      {/* Stop Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${WaselColors.primaryTeal}20` }}
                      >
                        <span className="text-xl">{getStopIcon(stop.type)}</span>
                      </div>

                      {/* Stop Details */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {language === 'ar' ? stop.locationAr : stop.location}
                        </p>
                        <div className={rtl.flex('items-center', 'gap-2', 'mt-1')}>
                          <span className="text-xs text-muted-foreground">{getStopLabel(stop.type)}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {stop.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-3 rounded-lg font-medium mt-4 transition-opacity"
                  style={{
                    backgroundColor: WaselColors.primaryTeal,
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {language === 'ar' ? 'استخدم هذا الطريق' : 'Use This Route'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Benefits */}
      <div className="p-6 bg-card border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          {language === 'ar' ? 'فوائد التحسين الذكي' : 'Smart Optimization Benefits'}
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {language === 'ar'
              ? '💰 زيادة الأرباح بدمج طلبات الركاب والطرود على نفس الطريق'
              : '💰 Increase earnings by combining passenger and package requests on same route'}
          </p>
          <p>
            {language === 'ar'
              ? '🕌 وقفات صلاة محسوبة تلقائياً حسب وقت الرحلة'
              : '🕌 Prayer stops calculated automatically based on trip time'}
          </p>
          <p>
            {language === 'ar'
              ? '⏱️ توفير الوقت بترتيب الوقفات بطريقة ذكية'
              : '⏱️ Save time by arranging stops intelligently'}
          </p>
        </div>
      </div>
    </div>
  );
}
