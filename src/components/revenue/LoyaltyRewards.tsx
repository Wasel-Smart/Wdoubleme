import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Gift, Trophy, Star, Zap, Crown, Award, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface Reward {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  points: number;
  type: 'discount' | 'free-ride' | 'upgrade' | 'cashback';
  value: number;
  icon: any;
}

interface Achievement {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  points: number;
  progress: number;
  target: number;
  icon: any;
  unlocked: boolean;
}

export function LoyaltyRewards() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [userPoints, setUserPoints] = useState(2450);
  const [userLevel, setUserLevel] = useState(3);
  const [nextLevelPoints, setNextLevelPoints] = useState(3000);

  const levels = [
    { level: 1, name: { en: 'Bronze', ar: 'برونزي' }, color: 'from-amber-600 to-amber-800', minPoints: 0 },
    { level: 2, name: { en: 'Silver', ar: 'فضي' }, color: 'from-gray-400 to-gray-600', minPoints: 500 },
    { level: 3, name: { en: 'Gold', ar: 'ذهبي' }, color: 'from-yellow-400 to-yellow-600', minPoints: 1500 },
    { level: 4, name: { en: 'Platinum', ar: 'بلاتيني' }, color: 'from-blue-400 to-indigo-600', minPoints: 3000 },
    { level: 5, name: { en: 'Diamond', ar: 'ماسي' }, color: 'from-cyan-400 to-blue-600', minPoints: 5000 },
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      name: { en: '10% Discount', ar: 'خصم 10%' },
      description: { en: 'On your next ride', ar: 'على رحلتك القادمة' },
      points: 200,
      type: 'discount',
      value: 10,
      icon: Gift,
    },
    {
      id: '2',
      name: { en: 'Free Ride', ar: 'رحلة مجانية' },
      description: { en: 'Up to $25 value', ar: 'بقيمة تصل إلى 94 ر.س' },
      points: 500,
      type: 'free-ride',
      value: 25,
      icon: Zap,
    },
    {
      id: '3',
      name: { en: 'Luxury Upgrade', ar: 'ترقية فاخرة' },
      description: { en: 'Free upgrade to luxury', ar: 'ترقية مجانية للفئة الفاخرة' },
      points: 800,
      type: 'upgrade',
      value: 0,
      icon: Crown,
    },
    {
      id: '4',
      name: { en: '$50 Cashback', ar: 'استرداد 187 ر.س' },
      description: { en: 'Direct to your wallet', ar: 'مباشرة إلى محفظتك' },
      points: 1000,
      type: 'cashback',
      value: 50,
      icon: TrendingUp,
    },
    {
      id: '5',
      name: { en: '25% Discount', ar: 'خصم 25%' },
      description: { en: 'On 5 rides', ar: 'على 5 رحلات' },
      points: 600,
      type: 'discount',
      value: 25,
      icon: Sparkles,
    },
    {
      id: '6',
      name: { en: 'VIP Month', ar: 'شهر VIP' },
      description: { en: 'Premium features for 30 days', ar: 'ميزات بريميوم لمدة 30 يوم' },
      points: 1500,
      type: 'upgrade',
      value: 0,
      icon: Award,
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      name: { en: 'Early Bird', ar: 'الطائر المبكر' },
      description: { en: 'Complete 5 morning rides', ar: 'أكمل 5 رحلات صباحية' },
      points: 100,
      progress: 3,
      target: 5,
      icon: Star,
      unlocked: false,
    },
    {
      id: '2',
      name: { en: 'Road Warrior', ar: 'محارب الطريق' },
      description: { en: 'Complete 50 total rides', ar: 'أكمل 50 رحلة إجمالية' },
      points: 300,
      progress: 50,
      target: 50,
      icon: Trophy,
      unlocked: true,
    },
    {
      id: '3',
      name: { en: 'Social Butterfly', ar: 'فراشة اجتماعية' },
      description: { en: 'Refer 10 friends', ar: 'أحل 10 أصدقاء' },
      points: 500,
      progress: 7,
      target: 10,
      icon: Gift,
      unlocked: false,
    },
    {
      id: '4',
      name: { en: 'Green Champion', ar: 'بطل البيئة' },
      description: { en: 'Save 100kg CO2', ar: 'وفر 100 كجم CO2' },
      points: 200,
      progress: 68,
      target: 100,
      icon: Sparkles,
      unlocked: false,
    },
  ];

  const handleRedeem = (reward: Reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(userPoints - reward.points);
      toast.success(
        isRTL 
          ? `تم استبدال ${reward.name.ar} بنجاح!` 
          : `Successfully redeemed ${reward.name.en}!`
      );
    } else {
      toast.error(
        isRTL 
          ? 'نقاط غير كافية!' 
          : 'Insufficient points!'
      );
    }
  };

  const currentLevelInfo = levels.find(l => l.level === userLevel);
  const nextLevelInfo = levels.find(l => l.level === userLevel + 1);
  const levelProgress = nextLevelInfo 
    ? ((userPoints - currentLevelInfo!.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo!.minPoints)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            {isRTL ? 'برنامج المكافآت' : 'Loyalty & Rewards'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'اربح نقاط مع كل رحلة واستبدلها بمكافآت رائعة' 
              : 'Earn points with every ride and redeem them for amazing rewards'}
          </p>
        </motion.div>

        {/* User Points & Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-amber-500/50 shadow-xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentLevelInfo?.color} opacity-10`} />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentLevelInfo?.color} flex items-center justify-center`}>
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    {isRTL ? currentLevelInfo?.name.ar : currentLevelInfo?.name.en}
                    <Badge variant="outline" className="text-lg">
                      {isRTL ? `المستوى ${userLevel}` : `Level ${userLevel}`}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {isRTL ? `لديك ${userPoints.toLocaleString()} نقطة` : `You have ${userPoints.toLocaleString()} points`}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-500">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? 'نقطة' : 'Points'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {nextLevelInfo && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {isRTL 
                        ? `التقدم إلى ${nextLevelInfo.name.ar}` 
                        : `Progress to ${nextLevelInfo.name.en}`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {nextLevelInfo.minPoints - userPoints} {isRTL ? 'نقطة متبقية' : 'points to go'}
                    </span>
                  </div>
                  <Progress value={levelProgress} className="h-3" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isRTL ? 'مستويات الولاء' : 'Loyalty Tiers'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {levels.map((level, idx) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Card className={`text-center ${
                  level.level === userLevel ? 'border-2 border-amber-500 shadow-lg' : ''
                } ${level.level > userLevel ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center mx-auto mb-3`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="font-bold mb-1">
                      {isRTL ? level.name.ar : level.name.en}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {level.minPoints.toLocaleString()} {isRTL ? 'نقطة' : 'pts'}
                    </div>
                    {level.level === userLevel && (
                      <Badge className="mt-2 bg-amber-500">
                        {isRTL ? 'الحالي' : 'Current'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isRTL ? 'الإنجازات' : 'Achievements'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, idx) => {
              const Icon = achievement.icon;
              const progressPercent = (achievement.progress / achievement.target) * 100;
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                >
                  <Card className={achievement.unlocked ? 'border-2 border-green-500/50 bg-green-500/5' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-full ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          } flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {isRTL ? achievement.name.ar : achievement.name.en}
                            </CardTitle>
                            <CardDescription>
                              {isRTL ? achievement.description.ar : achievement.description.en}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={achievement.unlocked ? 'default' : 'outline'}>
                          +{achievement.points}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isRTL ? 'التقدم' : 'Progress'}
                          </span>
                          <span className="font-medium">
                            {achievement.progress} / {achievement.target}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Rewards Catalog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isRTL ? 'كتالوج المكافآت' : 'Rewards Catalog'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward, idx) => {
              const Icon = reward.icon;
              const canAfford = userPoints >= reward.points;
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`h-full ${!canAfford ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                            canAfford 
                              ? 'from-primary to-purple-600' 
                              : 'from-gray-400 to-gray-600'
                          } flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {isRTL ? reward.name.ar : reward.name.en}
                            </CardTitle>
                            <CardDescription>
                              {isRTL ? reward.description.ar : reward.description.en}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={canAfford ? 'default' : 'secondary'} className="text-base">
                          {reward.points} {isRTL ? 'نقطة' : 'points'}
                        </Badge>
                        {reward.type === 'cashback' && (
                          <span className="text-lg font-bold text-primary">
                            {isRTL ? `${reward.value * 3.75} ر.س` : `$${reward.value}`}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className="w-full"
                        variant={canAfford ? 'default' : 'outline'}
                      >
                        {canAfford 
                          ? (isRTL ? 'استبدل الآن' : 'Redeem Now')
                          : (isRTL ? 'نقاط غير كافية' : 'Insufficient Points')
                        }
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Ways to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRTL ? 'طرق ربح النقاط' : 'Ways to Earn Points'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: { en: 'Complete Rides', ar: 'أكمل الرحلات' },
                points: { en: '10 pts per ride', ar: '10 نقاط لكل رحلة' },
                icon: Zap,
              },
              {
                title: { en: 'Refer Friends', ar: 'أحل الأصدقاء' },
                points: { en: '100 pts per referral', ar: '100 نقطة لكل إحالة' },
                icon: Gift,
              },
              {
                title: { en: 'Rate Drivers', ar: 'قيّم السائقين' },
                points: { en: '5 pts per rating', ar: '5 نقاط لكل تقييم' },
                icon: Star,
              },
            ].map((way, idx) => {
              const Icon = way.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {isRTL ? way.title.ar : way.title.en}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? way.points.ar : way.points.en}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
