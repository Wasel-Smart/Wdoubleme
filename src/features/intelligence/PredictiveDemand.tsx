/**
 * Predictive Demand Intelligence
 * Shows travelers where/when passengers are likely to book rides
 * Compatible with advance booking model (24h+ ahead)
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, MapPin, Calendar, Users, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { rtl } from '@/utils/rtl';
import { WaselColors, WaselSpacing } from '@/tokens/wasel-tokens';

interface DemandForecast {
  route: string;
  routeAr: string;
  date: string;
  demandLevel: 'high' | 'medium' | 'low';
  predictedPassengers: number;
  predictedPackages: number;
  earningsEstimate: number;
  confidence: number;
}

export function PredictiveDemand() {
  const { t, language, dir } = useLanguage();
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    // Mock predictive data - in production, fetch from AI endpoint
    const mockForecasts: DemandForecast[] = [
      {
        route: 'Amman → Aqaba',
        routeAr: 'عمّان ← العقبة',
        date: '2026-03-20',
        demandLevel: 'high',
        predictedPassengers: 8,
        predictedPackages: 3,
        earningsEstimate: 28,
        confidence: 87,
      },
      {
        route: 'Amman → Irbid',
        routeAr: 'عمّان ← إربد',
        date: '2026-03-18',
        demandLevel: 'medium',
        predictedPassengers: 5,
        predictedPackages: 2,
        earningsEstimate: 15,
        confidence: 72,
      },
      {
        route: 'Amman → Dead Sea',
        routeAr: 'عمّان ← البحر الميت',
        date: '2026-03-21',
        demandLevel: 'high',
        predictedPassengers: 6,
        predictedPackages: 1,
        earningsEstimate: 22,
        confidence: 81,
      },
    ];
    setForecasts(mockForecasts);
  }, []);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high':
        return WaselColors.success;
      case 'medium':
        return WaselColors.primaryTeal;
      case 'low':
        return WaselColors.textMuted;
      default:
        return WaselColors.textMuted;
    }
  };

  const getDemandLabel = (level: string) => {
    const labels = {
      high: { en: 'High Demand', ar: 'طلب عالي' },
      medium: { en: 'Medium Demand', ar: 'طلب متوسط' },
      low: { en: 'Low Demand', ar: 'طلب منخفض' },
    };
    return language === 'ar' ? labels[level as keyof typeof labels]?.ar : labels[level as keyof typeof labels]?.en;
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className={rtl.flex('items-center', 'gap-3')}>
          <TrendingUp className="w-8 h-8" style={{ color: WaselColors.primaryTeal }} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'توقعات الطلب الذكية' : 'Smart Demand Forecasts'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar'
                ? 'اعرف متى وين الركاب بدهم رحلات'
                : 'Know when and where passengers need rides'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border-b border-primary/20 p-4">
        <p className="text-sm text-foreground text-center">
          {language === 'ar'
            ? '💡 الذكاء الاصطناعي يحلل بيانات الرحلات السابقة لمساعدتك تخطط رحلتك الجاية'
            : '💡 AI analyzes historical trip data to help you plan your next ride'}
        </p>
      </div>

      {/* Forecasts Grid */}
      <div className="p-6 space-y-4">
        {forecasts.map((forecast, idx) => (
          <motion.div
            key={`${forecast.route}-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedRoute(selectedRoute === forecast.route ? null : forecast.route)}
          >
            {/* Route & Date */}
            <div className={rtl.flex('items-start', 'justify-between', 'mb-4')}>
              <div className={rtl.flex('items-center', 'gap-3')}>
                <MapPin className="w-6 h-6" style={{ color: WaselColors.primaryTeal }} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {language === 'ar' ? forecast.routeAr : forecast.route}
                  </h3>
                  <div className={rtl.flex('items-center', 'gap-2', 'mt-1')}>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(forecast.date).toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Demand Badge */}
              <div
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${getDemandColor(forecast.demandLevel)}20`,
                  color: getDemandColor(forecast.demandLevel),
                }}
              >
                {getDemandLabel(forecast.demandLevel)}
              </div>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={rtl.flex('items-center', 'gap-2')}>
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'ركاب متوقعين' : 'Expected Passengers'}
                  </p>
                  <p className="text-lg font-bold text-foreground">{forecast.predictedPassengers}</p>
                </div>
              </div>

              <div className={rtl.flex('items-center', 'gap-2')}>
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'طرود متوقعة' : 'Expected Packages'}
                  </p>
                  <p className="text-lg font-bold text-foreground">{forecast.predictedPackages}</p>
                </div>
              </div>
            </div>

            {/* Earnings Estimate */}
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className={rtl.flex('items-center', 'justify-between')}>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'ar' ? 'أرباح متوقعة' : 'Estimated Earnings'}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {forecast.earningsEstimate.toFixed(2)} {language === 'ar' ? 'دينار' : 'JOD'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'ar' ? 'دقة التوقع' : 'Confidence'}
                  </p>
                  <p className="text-xl font-bold text-foreground">{forecast.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedRoute === forecast.route && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <p className="text-sm text-muted-foreground mb-3">
                  {language === 'ar'
                    ? '📊 التوقعات مبنية على تحليل الرحلات السابقة، الأحداث، والعطل'
                    : '📊 Predictions based on historical trips, events, and holidays'}
                </p>
                <button
                  className="w-full py-3 rounded-lg font-medium transition-colors"
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
                  {language === 'ar' ? 'انشر رحلة لهذا الطريق' : 'Post Ride for This Route'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Disclaimer */}
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          {language === 'ar'
            ? '⚠️ التوقعات تقديرية وليست مضمونة. الطلب الفعلي قد يختلف.'
            : '⚠️ Forecasts are estimates and not guaranteed. Actual demand may vary.'}
        </p>
      </div>
    </div>
  );
}
