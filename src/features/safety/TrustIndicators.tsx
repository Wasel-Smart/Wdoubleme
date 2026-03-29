import React from 'react';
import { motion } from 'motion/react';
import { Shield, Star, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';

interface TrustIndicatorsProps {
  userId: string;
  userType: 'driver' | 'passenger';
  stats: {
    rating: number;
    totalTrips: number;
    completionRate: number;
    responseTime?: number; // minutes
    verified: boolean;
    joinedDate: string;
    reviewCount: number;
  };
  verifications?: {
    identity: boolean;
    phone: boolean;
    email: boolean;
    driverLicense?: boolean;
    vehicle?: boolean;
  };
  badges?: string[];
}

export function TrustIndicators({
  userId,
  userType,
  stats,
  verifications,
  badges = [],
}: TrustIndicatorsProps) {
  const { t, language, dir } = useLanguage();

  // Calculate trust score (0-100)
  const calculateTrustScore = () => {
    let score = 0;

    // Base score from rating (40 points)
    score += (stats.rating / 5) * 40;

    // Trip history (20 points)
    const tripScore = Math.min(stats.totalTrips / 50, 1) * 20;
    score += tripScore;

    // Completion rate (20 points)
    score += stats.completionRate * 0.2;

    // Verifications (20 points)
    if (verifications) {
      const verifiedCount = Object.values(verifications).filter(Boolean).length;
      const totalVerifications = Object.keys(verifications).length;
      score += (verifiedCount / totalVerifications) * 20;
    }

    return Math.round(score);
  };

  const trustScore = calculateTrustScore();

  const getTrustLevel = (score: number) => {
    if (score >= 90)
      return {
        label: language === 'ar' ? 'موثوق جداً' : 'Highly Trusted',
        color: 'text-green-500',
        icon: '🌟',
      };
    if (score >= 75)
      return {
        label: language === 'ar' ? 'موثوق' : 'Trusted',
        color: 'text-blue-500',
        icon: '✅',
      };
    if (score >= 50)
      return {
        label: language === 'ar' ? 'جيد' : 'Good',
        color: 'text-yellow-500',
        icon: '👍',
      };
    return {
      label: language === 'ar' ? 'جديد' : 'New',
      color: 'text-gray-500',
      icon: '🆕',
    };
  };

  const trustLevel = getTrustLevel(trustScore);

  const getExperienceLevel = (trips: number) => {
    if (trips >= 100)
      return {
        label: language === 'ar' ? 'محترف' : 'Professional',
        badge: '🏆',
      };
    if (trips >= 50)
      return {
        label: language === 'ar' ? 'متمرس' : 'Experienced',
        badge: '⭐',
      };
    if (trips >= 20)
      return {
        label: language === 'ar' ? 'متوسط' : 'Intermediate',
        badge: '✨',
      };
    return {
      label: language === 'ar' ? 'مبتدئ' : 'Beginner',
      badge: '🌱',
    };
  };

  const experienceLevel = getExperienceLevel(stats.totalTrips);

  return (
    <div className="space-y-4" dir={dir}>
      {/* Trust Score Card */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${trustLevel.color}`} />
            <span className="font-semibold">
              {language === 'ar' ? 'درجة الثقة' : 'Trust Score'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{trustLevel.icon}</span>
            <span className={`font-bold text-xl ${trustLevel.color}`}>{trustScore}%</span>
          </div>
        </div>

        <Progress value={trustScore} className="h-2 mb-2" />

        <div className="flex items-center justify-between text-sm">
          <span className={trustLevel.color}>{trustLevel.label}</span>
          {stats.verified && (
            <Badge className="bg-green-500">
              <CheckCircle className={`h-3 w-3 ${rtl.mr(1)}`} />
              {language === 'ar' ? 'موثّق' : 'Verified'}
            </Badge>
          )}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Rating */}
        <div className="p-3 rounded-lg border text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-bold">{stats.rating.toFixed(1)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'ar' ? 'التقييم' : 'Rating'}
          </div>
          <div className="text-xs text-muted-foreground">
            ({stats.reviewCount} {language === 'ar' ? 'تقييم' : 'reviews'})
          </div>
        </div>

        {/* Total Trips */}
        <div className="p-3 rounded-lg border text-center">
          <div className="text-xl font-bold text-primary mb-1">{stats.totalTrips}</div>
          <div className="text-xs text-muted-foreground">
            {language === 'ar' ? 'رحلة' : 'Trips'}
          </div>
          <div className="text-xs font-medium">{experienceLevel.badge}</div>
        </div>

        {/* Completion Rate */}
        <div className="p-3 rounded-lg border text-center">
          <div className="text-xl font-bold text-green-500 mb-1">
            {stats.completionRate}%
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'ar' ? 'الإنجاز' : 'Completion'}
          </div>
        </div>
      </div>

      {/* Verifications */}
      {verifications && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">
            {language === 'ar' ? 'التوثيقات' : 'Verifications'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {verifications.identity && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{language === 'ar' ? 'الهوية' : 'Identity'}</span>
              </div>
            )}
            {verifications.phone && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{language === 'ar' ? 'الهاتف' : 'Phone'}</span>
              </div>
            )}
            {verifications.email && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{language === 'ar' ? 'البريد' : 'Email'}</span>
              </div>
            )}
            {verifications.driverLicense && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{language === 'ar' ? 'رخصة قيادة' : 'License'}</span>
              </div>
            )}
            {verifications.vehicle && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{language === 'ar' ? 'السيارة' : 'Vehicle'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">
            {language === 'ar' ? 'الشارات' : 'Badges'}
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Award className={`h-3 w-3 ${rtl.mr(1)}`} />
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Member Since */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        {language === 'ar' ? 'عضو منذ' : 'Member since'}{' '}
        {new Date(stats.joinedDate).toLocaleDateString(
          language === 'ar' ? 'ar-JO' : 'en-US',
          { year: 'numeric', month: 'long' }
        )}
      </div>
    </div>
  );
}