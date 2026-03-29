/**
 * Loyalty Program Component
 * Bronze (5 trips): 5% discount
 * Silver (10 trips): 10% discount
 * Gold (20 trips): 15% discount + priority support
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Star, Trophy, Crown, Zap, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { isFeatureEnabled } from '../utils/featureFlags';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE = projectId ? `https://${projectId}.supabase.co/functions/v1/server` : '';

const TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    trips: 5,
    discount: 0.05,
    icon: Star,
    color: 'from-orange-600 to-amber-600',
    bgColor: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    benefits: ['5% off all rides', 'Earn 2x referral bonus', 'Birthday surprise'],
  },
  {
    id: 'silver',
    name: 'Silver',
    trips: 10,
    discount: 0.10,
    icon: Trophy,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20',
    benefits: ['10% off all rides', 'Earn 3x referral bonus', 'Priority matching', 'Exclusive promos'],
  },
  {
    id: 'gold',
    name: 'Gold',
    trips: 20,
    discount: 0.15,
    icon: Crown,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
    benefits: ['15% off all rides', 'Earn 5x referral bonus', 'Priority support 24/7', 'Free cancellations', 'VIP lounge access (airports)'],
  },
];

export function LoyaltyProgram() {
  const { user, session } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [userStats, setUserStats] = useState<{
    total_trips: number;
    current_tier: string;
    next_tier: string | null;
    trips_to_next: number;
    lifetime_savings: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loyaltyEnabled = isFeatureEnabled('ENABLE_LOYALTY_PROGRAM');

  useEffect(() => {
    if (user?.id && loyaltyEnabled) {
      fetchLoyaltyStatus();
    }
  }, [user?.id, loyaltyEnabled]);

  const fetchLoyaltyStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/loyalty/status/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching loyalty status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loyaltyEnabled) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{isRTL ? 'برنامج الولاء قادم قريباً!' : 'Loyalty Program Coming Soon!'}</h3>
          <p className="text-muted-foreground">
            {isRTL ? 'افتح مكافآت وخصومات حصرية. ينطلق في الأسبوع الثالث!' : 'Unlock exclusive rewards and discounts. Launching in Week 3!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">{isRTL ? 'جاري تحميل مكافآتك...' : 'Loading your rewards...'}</p>
        </CardContent>
      </Card>
    );
  }

  const currentTier = TIERS.find(t => t.id === userStats?.current_tier) || TIERS[0];
  const currentTierIndex = TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  const CurrentIcon = currentTier.icon;
  
  const progress = nextTier 
    ? ((userStats?.total_trips || 0) / nextTier.trips) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className={`bg-gradient-to-br ${currentTier.bgColor} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentTier.color} flex items-center justify-center`}>
                <CurrentIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentTier.name} {isRTL ? 'عضو' : 'Member'}</CardTitle>
                <CardDescription className="text-base">
                  {currentTier.discount * 100}% {isRTL ? 'خصم على جميع الرحلات' : 'off all rides'}
                </CardDescription>
              </div>
            </div>
            <Badge className={`text-lg px-4 py-1 bg-gradient-to-r ${currentTier.color} border-0 text-white`}>
              {userStats?.total_trips || 0} {isRTL ? 'رحلة' : 'Trips'}
            </Badge>
          </div>
        </CardHeader>

        {nextTier && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{isRTL ? `التقدم نحو ${nextTier.name}` : `Progress to ${nextTier.name}`}</span>
                <span className="text-muted-foreground">
                  {userStats?.trips_to_next || 0} {isRTL ? 'رحلة متبقية' : 'trips to go'}
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">
                {userStats?.total_trips || 0} / {nextTier.trips} trips
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Your Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {currentTier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {userStats?.lifetime_savings && userStats.lifetime_savings > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                💰 Lifetime Savings
              </p>
              <p className="text-2xl font-bold text-green-600">
                {userStats.lifetime_savings.toFixed(2)} JOD
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
          <CardDescription>Unlock more rewards as you ride</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {TIERS.map((tier, index) => {
            const TierIcon = tier.icon;
            const isCurrentTier = tier.id === currentTier.id;
            const isUnlocked = (userStats?.total_trips || 0) >= tier.trips;

            return (
              <div
                key={tier.id}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${isCurrentTier 
                    ? `bg-gradient-to-r ${tier.bgColor} border-current` 
                    : isUnlocked
                    ? 'bg-muted/50 border-transparent'
                    : 'bg-background border-dashed border-muted-foreground/30 opacity-60'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                      <TierIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{tier.name}</p>
                      <p className="text-sm text-muted-foreground">{tier.trips} trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {tier.discount * 100}%
                    </div>
                    <div className="text-xs text-muted-foreground">Discount</div>
                  </div>
                </div>

                <ul className="space-y-1 text-sm">
                  {tier.benefits.slice(0, 2).map((benefit, i) => (
                    <li key={i} className="text-muted-foreground">• {benefit}</li>
                  ))}
                  {tier.benefits.length > 2 && (
                    <li className="text-muted-foreground">
                      • +{tier.benefits.length - 2} more benefits
                    </li>
                  )}
                </ul>

                {isCurrentTier && (
                  <Badge className="mt-3 bg-gradient-to-r from-teal-600 to-blue-600 border-0">
                    Current Tier
                  </Badge>
                )}
                {!isUnlocked && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {tier.trips - (userStats?.total_trips || 0)} more trips to unlock
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <CardHeader>
          <CardTitle className="text-sm">How Loyalty Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Complete trips to earn loyalty points</p>
          <p>• Automatically upgrade to higher tiers</p>
          <p>• Discounts apply instantly at checkout</p>
          <p>• Benefits never expire (as long as you're active)</p>
          <p>• Refer friends to earn bonus points</p>
        </CardContent>
      </Card>
    </div>
  );
}