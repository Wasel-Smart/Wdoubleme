import { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, TrendingDown, Award, DollarSign, Trees, Globe, Heart, Target, CheckCircle2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';

export function CarbonTracking() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const stats = {
    totalSaved: 287, // kg CO2
    treesEquivalent: 13,
    monthlyGoal: 500,
    rank: 142,
    offsetCredits: 45.50,
    trips: 245,
  };

  const achievements = [
    { title: 'Eco Warrior', titleAr: 'محارب البيئة', threshold: 100, unlocked: true },
    { title: 'Green Hero', titleAr: 'بطل أخضر', threshold: 250, unlocked: true },
    { title: 'Planet Saver', titleAr: 'منقذ الكوكب', threshold: 500, unlocked: false },
  ];

  const offsetOptions = [
    { name: 'Plant 10 Trees', nameAr: 'زراعة 10 أشجار', cost: 25, kg: 100 },
    { name: 'Solar Energy', nameAr: 'طاقة شمسية', cost: 50, kg: 250 },
    { name: 'Ocean Cleanup', nameAr: 'تنظيف المحيطات', cost: 100, kg: 500 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {isRTL ? 'تتبع البصمة الكربونية' : 'Carbon Footprint Tracker'}
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <TrendingDown className="w-12 h-12 mx-auto opacity-80" />
                <div className="text-5xl font-bold">{stats.totalSaved}</div>
                <p className="text-green-100">kg CO₂ {isRTL ? 'تم توفيره' : 'Saved'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <Trees className="w-12 h-12 mx-auto text-green-600" />
              <div className="text-4xl font-bold text-green-600">{stats.treesEquivalent}</div>
              <p className="text-muted-foreground">{isRTL ? 'أشجار مزروعة' : 'Trees Planted Equivalent'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <Award className="w-12 h-12 mx-auto text-orange-600" />
              <div className="text-4xl font-bold text-orange-600">#{stats.rank}</div>
              <p className="text-muted-foreground">{isRTL ? 'ترتيبك' : 'Your Rank'}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'هدف هذا الشهر' : 'Monthly Goal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{stats.totalSaved} / {stats.monthlyGoal} kg</span>
                <span className="text-sm text-muted-foreground">{Math.round((stats.totalSaved / stats.monthlyGoal) * 100)}%</span>
              </div>
              <Progress value={(stats.totalSaved / stats.monthlyGoal) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              {isRTL ? 'تعويض الكربون' : 'Carbon Offset Marketplace'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {offsetOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <h3 className="font-semibold">{isRTL ? option.nameAr : option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.kg} kg CO₂</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  SAR {option.cost}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الإنجازات البيئية' : 'Eco Achievements'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${achievement.unlocked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <div className="flex items-center gap-3">
                  {achievement.unlocked ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Target className="w-5 h-5 text-gray-400" />}
                  <div>
                    <p className="font-semibold">{isRTL ? achievement.titleAr : achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.threshold} kg CO₂</p>
                  </div>
                </div>
                {achievement.unlocked && <Badge className="bg-green-600 text-white">{isRTL ? 'مكتمل' : 'Unlocked'}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
