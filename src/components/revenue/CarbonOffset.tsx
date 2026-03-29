import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Leaf, TreePine, Globe, Heart, TrendingDown, Award, Zap, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface CarbonProject {
  id: string;
  name: { en: string; ar: string };
  location: { en: string; ar: string };
  description: { en: string; ar: string };
  costPerTon: number;
  impact: string;
  verified: boolean;
  progress: number;
  target: number;
}

export function CarbonOffset() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [userCO2Saved, setUserCO2Saved] = useState(287); // kg
  const [treesPlanted, setTreesPlanted] = useState(12);
  const [offsetEnabled, setOffsetEnabled] = useState(true);
  const [monthlyContribution, setMonthlyContribution] = useState(5); // USD

  const projects: CarbonProject[] = [
    {
      id: '1',
      name: { en: 'Saudi Arabia Reforestation', ar: 'إعادة التشجير في السعودية' },
      location: { en: 'Riyadh & Jeddah', ar: 'الرياض وجدة' },
      description: { 
        en: 'Planting native trees in desert regions', 
        ar: 'زراعة الأشجار المحلية في المناطق الصحراوية' 
      },
      costPerTon: 15,
      impact: '1 tree = 22kg CO2/year',
      verified: true,
      progress: 12500,
      target: 20000,
    },
    {
      id: '2',
      name: { en: 'UAE Solar Energy', ar: 'الطاقة الشمسية في الإمارات' },
      location: { en: 'Dubai & Abu Dhabi', ar: 'دبي وأبو ظبي' },
      description: { 
        en: 'Supporting solar panel installations', 
        ar: 'دعم تركيب الألواح الشمسية' 
      },
      costPerTon: 20,
      impact: 'Powers 1000+ homes',
      verified: true,
      progress: 8750,
      target: 15000,
    },
    {
      id: '3',
      name: { en: 'Jordan Solar Energy', ar: 'الطاقة الشمسية في الأردن' },
      location: { en: 'Amman & Zarqa', ar: 'عمّان والزرقاء' },
      description: { 
        en: 'Supporting solar panel installations', 
        ar: 'دعم تركيب الألواح الشمسية' 
      },
      costPerTon: 18,
      impact: '50MW capacity',
      verified: true,
      progress: 6200,
      target: 10000,
    },
  ];

  const impactStats = [
    {
      value: userCO2Saved,
      unit: 'kg',
      label: { en: 'CO2 Offset', ar: 'تعويض CO2' },
      icon: TrendingDown,
      color: 'from-green-400 to-emerald-600',
    },
    {
      value: treesPlanted,
      unit: '',
      label: { en: 'Trees Planted', ar: 'أشجار مزروعة' },
      icon: TreePine,
      color: 'from-lime-400 to-green-600',
    },
    {
      value: Math.round(userCO2Saved / 22),
      unit: '',
      label: { en: 'Trees Equivalent', ar: 'معادل الأشجار' },
      icon: Leaf,
      color: 'from-teal-400 to-cyan-600',
    },
    {
      value: monthlyContribution * 12,
      unit: '$',
      label: { en: 'Annual Impact', ar: 'التأثير السنوي' },
      icon: Heart,
      color: 'from-rose-400 to-pink-600',
    },
  ];

  const handleToggleOffset = () => {
    setOffsetEnabled(!offsetEnabled);
    toast.success(
      offsetEnabled
        ? (isRTL ? 'تم تعطيل تعويض الكربون' : 'Carbon offset disabled')
        : (isRTL ? 'تم تفعيل تعويض الكربون' : 'Carbon offset enabled')
    );
  };

  const handleContribute = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast.success(
      isRTL 
        ? `شكراً لمساهمتك في ${project?.name.ar}!` 
        : `Thank you for contributing to ${project?.name.en}!`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-green-600" />
            {isRTL ? 'تعويض الكربون' : 'Carbon Offset Program'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'اجعل رحلاتك خضراء وساهم في حماية البيئة' 
              : 'Make your rides green and contribute to environmental protection'}
          </p>
        </motion.div>

        {/* Toggle Carbon Offset */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-green-500/50 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-600" />
                    {isRTL ? 'التعويض التلقائي للكربون' : 'Auto Carbon Offset'}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {isRTL 
                      ? `${monthlyContribution * 3.75} ر.س شهرياً - يعوض حوالي ${Math.round(monthlyContribution * 0.67)} كجم CO2 لكل رحلة` 
                      : `$${monthlyContribution}/month - Offsets ~${Math.round(monthlyContribution * 0.67)}kg CO2 per ride`}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleToggleOffset}
                  variant={offsetEnabled ? 'default' : 'outline'}
                  className={offsetEnabled ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {offsetEnabled 
                    ? (isRTL ? 'مفعّل' : 'Enabled')
                    : (isRTL ? 'معطّل' : 'Disabled')
                  }
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {impactStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {stat.unit === '$' && stat.unit}
                      {stat.value.toLocaleString()}
                      {stat.unit !== '$' && stat.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? stat.label.ar : stat.label.en}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                {isRTL ? 'تأثيرك البيئي' : 'Your Environmental Impact'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="text-4xl mb-2">🌍</div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(userCO2Saved / 1000).toFixed(1)} {isRTL ? 'طن' : 'tons'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'معادل 50 شجرة لمدة عام' 
                      : 'Equal to 50 trees for 1 year'}
                  </div>
                </div>
                
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="text-4xl mb-2">🚗</div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round(userCO2Saved / 2.3)} {isRTL ? 'كم' : 'km'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'مسافة سيارة تم توفيرها' 
                      : 'Car miles saved'}
                  </div>
                </div>
                
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="text-4xl mb-2">💨</div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round(userCO2Saved * 0.4)} {isRTL ? 'م³' : 'm³'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'هواء نظيف محفوظ' 
                      : 'Clean air preserved'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Carbon Offset Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            {isRTL ? 'المشاريع البيئية' : 'Environmental Projects'}
            <Badge variant="outline" className="text-xs">
              {isRTL ? 'معتمدة' : 'Verified'}
            </Badge>
          </h2>
          <div className="space-y-4">
            {projects.map((project, idx) => {
              const progressPercent = (project.progress / project.target) * 100;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">
                              {isRTL ? project.name.ar : project.name.en}
                            </CardTitle>
                            {project.verified && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                                <Zap className="w-3 h-3 mr-1" />
                                {isRTL ? 'معتمد' : 'Verified'}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {isRTL ? project.location.ar : project.location.en}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {isRTL ? `${project.costPerTon * 3.75} ر.س` : `$${project.costPerTon}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? 'لكل طن CO2' : 'per ton CO2'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? project.description.ar : project.description.en}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{isRTL ? 'التأثير:' : 'Impact:'}</span>
                        <span className="text-muted-foreground">{project.impact}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            {isRTL ? 'التقدم' : 'Progress'}
                          </span>
                          <span className="font-medium">
                            {project.progress.toLocaleString()} / {project.target.toLocaleString()} {isRTL ? 'طن' : 'tons'}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>

                      <Button
                        onClick={() => handleContribute(project.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isRTL ? 'ساهم الآن' : 'Contribute Now'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRTL ? 'كيف يعمل؟' : 'How It Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: { en: 'Book a Ride', ar: 'احجز رحلة' },
                description: { en: 'Use Wasel for your trips', ar: 'استخدم واصل لرحلاتك' },
              },
              {
                step: '2',
                title: { en: 'Calculate CO2', ar: 'احسب CO2' },
                description: { en: 'We measure your carbon footprint', ar: 'نقيس بصمتك الكربونية' },
              },
              {
                step: '3',
                title: { en: 'Auto Offset', ar: 'تعويض تلقائي' },
                description: { en: 'Small fee funds green projects', ar: 'رسوم صغيرة تمول المشاريع الخضراء' },
              },
              {
                step: '4',
                title: { en: 'Track Impact', ar: 'تتبع التأثير' },
                description: { en: 'See your environmental contribution', ar: 'شاهد مساهمتك البيئية' },
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">
                  {isRTL ? item.title.ar : item.title.en}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? item.description.ar : item.description.en}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'لماذا تعويض الكربون؟' : 'Why Carbon Offset?'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: '🌱',
                    text: { en: 'Fight climate change effectively', ar: 'حارب تغير المناخ بفعالية' },
                  },
                  {
                    icon: '🌍',
                    text: { en: 'Support verified green projects', ar: 'ادعم المشاريع الخضراء المعتمدة' },
                  },
                  {
                    icon: '💚',
                    text: { en: 'Make every ride eco-friendly', ar: 'اجعل كل رحلة صديقة للبيئة' },
                  },
                  {
                    icon: '⭐',
                    text: { en: 'Earn extra loyalty points', ar: 'اربح نقاط ولاء إضافية' },
                  },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-green-500/5 rounded-lg">
                    <div className="text-3xl">{benefit.icon}</div>
                    <p className="text-sm font-medium">
                      {isRTL ? benefit.text.ar : benefit.text.en}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
