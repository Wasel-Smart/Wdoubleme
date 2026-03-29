import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Crown, 
  TrendingUp, 
  Store, 
  Trophy, 
  Leaf, 
  DollarSign, 
  Target, 
  Gift, 
  Zap,
  ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RevenueHubProps {
  onNavigate?: (page: string) => void;
}

export function RevenueHub({ onNavigate }: RevenueHubProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  // Use provided onNavigate or fallback to router navigation
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Fallback to router navigation
      navigate(`/app/revenue/${page}`);
    }
  };

  const features = [
    {
      id: 'subscriptions',
      title: { en: 'Premium Plans', ar: 'الخطط المميزة' },
      description: { en: 'Save up to 60% on fees', ar: 'وفر حتى 60% على الرسوم' },
      icon: Crown,
      color: 'from-amber-400 to-orange-600',
      badge: { en: 'Save $200/yr', ar: 'وفر 750 ر.س/سنة' },
      stats: { en: '10K+ subscribers', ar: '10 آلاف+ مشترك' },
    },
    {
      // dynamic-pricing removed — no surge pricing in carpooling model
      id: 'marketplace-ads',
      title: { en: 'Advertise Here', ar: 'أعلن هنا' },
      description: { en: 'Reach millions of riders', ar: 'وصول لملايين الركاب' },
      icon: Store,
      color: 'from-purple-400 to-pink-600',
      badge: { en: 'For business', ar: 'للأعمال' },
      stats: { en: '5M+ impressions', ar: '5 مليون+ ظهور' },
    },
    {
      id: 'loyalty-rewards',
      title: { en: 'Rewards', ar: 'المكافآت' },
      description: { en: 'Earn points, get rewards', ar: 'اربح نقاط واحصل على مكافآت' },
      icon: Trophy,
      color: 'from-emerald-400 to-teal-600',
      badge: { en: 'Gold level', ar: 'المستوى الذهبي' },
      stats: { en: '2,450 points', ar: '2,450 نقطة' },
    },
    {
      id: 'carbon-offset',
      title: { en: 'Go Green', ar: 'أصبح أخضر' },
      description: { en: 'Offset your carbon footprint', ar: 'عوض بصمتك الكربونية' },
      icon: Leaf,
      color: 'from-green-400 to-emerald-600',
      badge: { en: 'Eco-friendly', ar: 'صديق للبيئة' },
      stats: { en: '287kg CO2 saved', ar: '287 كجم CO2 محفوظ' },
    },
  ];

  const quickStats = [
    {
      label: { en: 'Revenue Growth', ar: 'نمو الإيرادات' },
      value: '+45%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      label: { en: 'Active Campaigns', ar: 'الحملات النشطة' },
      value: '12',
      trend: 'up',
      icon: Target,
    },
    {
      label: { en: 'Rewards Earned', ar: 'المكافآت المكتسبة' },
      value: '2.4K',
      trend: 'up',
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              {isRTL ? 'مركز الإيرادات والنمو' : 'Revenue & Growth Hub'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? 'استكشف ميزات مبتكرة لتحسين تجربتك وتوفير المال' 
                : 'Explore innovative features to enhance your experience and save money'}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white">
            {isRTL ? 'جديد' : 'New'}
          </Badge>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? stat.label.ar : stat.label.en}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleNavigate(feature.id)}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline">
                      {isRTL ? feature.badge.ar : feature.badge.en}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {isRTL ? feature.title.ar : feature.title.en}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? feature.description.ar : feature.description.en}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isRTL ? feature.stats.ar : feature.stats.en}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Value Proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 md:p-8"
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">
            {isRTL ? 'لماذا الترقية؟' : 'Why Upgrade?'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {isRTL 
              ? 'انضم إلى آلاف المستخدمين الذين يوفرون المال ويستمتعون بتجربة أفضل' 
              : 'Join thousands of users who are saving money and enjoying a better experience'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: '40-60%', label: { en: 'Fee Savings', ar: 'توفير الرسوم' } },
              { value: '24/7', label: { en: 'Support', ar: 'الدعم' } },
              { value: '100+', label: { en: 'Features', ar: 'الميزات' } },
              { value: '10K+', label: { en: 'Happy Users', ar: 'مستخدم سعيد' } },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? item.label.ar : item.label.en}
                </div>
              </div>
            ))}
          </div>
          <Button 
            onClick={() => handleNavigate('subscriptions')}
            className="mt-6 bg-gradient-to-r from-primary to-purple-600 text-white"
            size="lg"
          >
            {isRTL ? 'استكشف الخطط' : 'Explore Plans'}
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}