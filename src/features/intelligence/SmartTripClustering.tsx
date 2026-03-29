/**
 * Smart Trip Clustering
 * AI-powered multi-service trip optimization
 * Helps travelers combine passengers + packages + return trips
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Users, Package, ArrowLeftRight, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { rtl } from '@/utils/rtl';
import { WaselColors } from '@/tokens/wasel-tokens';

interface ClusterSuggestion {
  id: string;
  passengers: number;
  packages: number;
  returnTrips: number;
  totalEarnings: number;
  efficiency: number; // percentage
  route: string;
  routeAr: string;
}

export function SmartTripClustering() {
  const { t, language, dir } = useLanguage();
  const [suggestions, setSuggestions] = useState<ClusterSuggestion[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    // Mock clustering suggestions
    const mockSuggestions: ClusterSuggestion[] = [
      {
        id: '1',
        passengers: 3,
        packages: 2,
        returnTrips: 1,
        totalEarnings: 35.5,
        efficiency: 92,
        route: 'Amman → Aqaba',
        routeAr: 'عمّان ← العقبة',
      },
      {
        id: '2',
        passengers: 2,
        packages: 1,
        returnTrips: 0,
        totalEarnings: 18.0,
        efficiency: 78,
        route: 'Amman → Irbid',
        routeAr: 'عمّان ← إربد',
      },
    ];
    setSuggestions(mockSuggestions);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className={rtl.flex('items-center', 'gap-3')}>
          <Sparkles className="w-8 h-8" style={{ color: WaselColors.accentBronze }} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'تجميع الرحلات الذكي' : 'Smart Trip Clustering'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' ? 'زوّد أرباحك بدمج ركاب وطرود' : 'Maximize earnings by combining passengers & packages'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Info */}
      <div className="bg-primary/10 border-b border-primary/20 p-4">
        <p className="text-sm text-foreground text-center">
          {language === 'ar'
            ? '🤖 الذكاء الاصطناعي يقترح أحسن طريقة لملى مقاعدك وزيادة أرباحك'
            : '🤖 AI suggests the best way to fill your seats and increase your earnings'}
        </p>
      </div>

      {/* Suggestions */}
      <div className="p-6 space-y-4">
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedCluster(selectedCluster === suggestion.id ? null : suggestion.id)}
          >
            {/* Route & Efficiency */}
            <div className={rtl.flex('items-start', 'justify-between', 'mb-4')}>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {language === 'ar' ? suggestion.routeAr : suggestion.route}
                </h3>
                <div className={rtl.flex('items-center', 'gap-2')}>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        suggestion.efficiency >= 85
                          ? WaselColors.success
                          : suggestion.efficiency >= 70
                            ? WaselColors.accentBronze
                            : WaselColors.textMuted,
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'كفاءة' : 'Efficiency'}: {suggestion.efficiency}%
                  </p>
                </div>
              </div>

              {/* Earnings */}
              <div
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: `${WaselColors.success}20`,
                }}
              >
                <p className="text-xs text-muted-foreground text-center">
                  {language === 'ar' ? 'مجموع الأرباح' : 'Total Earnings'}
                </p>
                <p className="text-xl font-bold text-center" style={{ color: WaselColors.success }}>
                  {suggestion.totalEarnings.toFixed(1)} {language === 'ar' ? 'د.أ' : 'JOD'}
                </p>
              </div>
            </div>

            {/* Cluster Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              {/* Passengers */}
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${WaselColors.primaryTeal}20` }}
                >
                  <Users className="w-6 h-6" style={{ color: WaselColors.primaryTeal }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{suggestion.passengers}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'ركاب' : 'Passengers'}</p>
              </div>

              {/* Packages */}
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${WaselColors.accentBronze}20` }}
                >
                  <Package className="w-6 h-6" style={{ color: WaselColors.accentBronze }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{suggestion.packages}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'طرود' : 'Packages'}</p>
              </div>

              {/* Return Trips */}
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${WaselColors.success}20` }}
                >
                  <ArrowLeftRight className="w-6 h-6" style={{ color: WaselColors.success }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{suggestion.returnTrips}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'رجوع' : 'Returns'}</p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedCluster === suggestion.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-border space-y-3"
              >
                <div className={rtl.flex('items-center', 'justify-between', 'text-sm')}>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'أرباح الركاب:' : 'Passenger earnings:'}
                  </span>
                  <span className="font-medium text-foreground">
                    {(suggestion.passengers * 8).toFixed(1)} {language === 'ar' ? 'د.أ' : 'JOD'}
                  </span>
                </div>
                <div className={rtl.flex('items-center', 'justify-between', 'text-sm')}>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'أرباح الطرود:' : 'Package earnings:'}
                  </span>
                  <span className="font-medium text-foreground">
                    {(suggestion.packages * 5).toFixed(1)} {language === 'ar' ? 'د.أ' : 'JOD'}
                  </span>
                </div>
                <div className={rtl.flex('items-center', 'justify-between', 'text-sm')}>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'أرباح الرجوع:' : 'Return earnings:'}
                  </span>
                  <span className="font-medium text-foreground">
                    {(suggestion.returnTrips * 3.5).toFixed(1)} {language === 'ar' ? 'د.أ' : 'JOD'}
                  </span>
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
                  {language === 'ar' ? 'قبول التجميع الذكي' : 'Accept Smart Clustering'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <div className="p-6 bg-card border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          {language === 'ar' ? 'كيف يشتغل؟' : 'How It Works?'}
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {language === 'ar'
              ? '1️⃣ الذكاء الاصطناعي يحلل طلبات الركاب والطرود على طريقك'
              : '1️⃣ AI analyzes passenger and package requests along your route'}
          </p>
          <p>
            {language === 'ar'
              ? '2️⃣ يقترح أحسن تجميع لزيادة أرباحك'
              : '2️⃣ Suggests optimal clustering to maximize your earnings'}
          </p>
          <p>
            {language === 'ar'
              ? '3️⃣ توافق على التجميع وتنشر رحلتك'
              : '3️⃣ You accept the clustering and post your ride'}
          </p>
        </div>
      </div>
    </div>
  );
}
