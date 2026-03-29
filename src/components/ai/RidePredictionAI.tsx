import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, TrendingUp, MapPin, Clock, Users, Zap, 
  Calendar, Route, AlertTriangle, DollarSign, ArrowUp, 
  ArrowDown, Activity, Target, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';

interface PredictionData {
  route: string;
  routeAr: string;
  predictedDemand: number;
  currentSupply: number;
  suggestedPrice: number;
  confidence: number;
  peakTime: string;
  trend: 'up' | 'down' | 'stable';
}

interface RecurringPattern {
  route: string;
  frequency: string;
  nextSuggested: string;
  timeSaved: string;
}

export function RidePredictionAI() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<'predictions' | 'recurring' | 'optimization'>('predictions');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '3h' | '6h' | '24h'>('3h');

  const predictions: PredictionData[] = [
    {
      route: 'Mall of Arabia → Downtown',
      routeAr: 'مول العرب ← وسط المدينة',
      predictedDemand: 85,
      currentSupply: 45,
      suggestedPrice: 45.5,
      confidence: 92,
      peakTime: '6:00 PM - 8:00 PM',
      trend: 'up'
    },
    {
      route: 'Airport → Business District',
      routeAr: 'المطار ← الحي التجاري',
      predictedDemand: 78,
      currentSupply: 60,
      suggestedPrice: 65.0,
      confidence: 88,
      peakTime: '7:00 AM - 9:00 AM',
      trend: 'up'
    },
    {
      route: 'University → Residential Area',
      routeAr: 'الجامعة ← المنطقة السكنية',
      predictedDemand: 62,
      currentSupply: 70,
      suggestedPrice: 28.0,
      confidence: 85,
      peakTime: '2:00 PM - 4:00 PM',
      trend: 'stable'
    },
    {
      route: 'Sports City → Marina',
      routeAr: 'المدينة الرياضية ← المارينا',
      predictedDemand: 45,
      currentSupply: 75,
      suggestedPrice: 38.0,
      confidence: 79,
      peakTime: '5:00 PM - 7:00 PM',
      trend: 'down'
    },
  ];

  const recurringPatterns: RecurringPattern[] = [
    {
      route: 'Home → Office (Mon-Fri)',
      frequency: '5 times/week',
      nextSuggested: 'Tomorrow 8:00 AM',
      timeSaved: '15 min/trip'
    },
    {
      route: 'Office → Gym (Mon, Wed, Fri)',
      frequency: '3 times/week',
      nextSuggested: 'Today 6:00 PM',
      timeSaved: '10 min/trip'
    },
    {
      route: 'Home → Mall (Weekends)',
      frequency: '2 times/week',
      nextSuggested: 'Saturday 2:00 PM',
      timeSaved: '12 min/trip'
    },
  ];

  const optimizationMetrics = {
    routeEfficiency: 87,
    avgWaitTime: '3.2 min',
    avgWaitTimeReduction: 45,
    priceAccuracy: 94,
    demandForecast: 91,
    driverUtilization: 82,
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'down':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {isRTL ? 'الذكاء الاصطناعي للتنبؤ بالرحلات' : 'Ride Prediction AI'}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'تحليل متقدم بالذكاء الاصطناعي للتنبؤ بالطلب، تحسين الأسعار، واقتراح الرحلات الذكية'
              : 'Advanced AI-powered demand forecasting, price optimization, and smart ride suggestions'}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'predictions'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{isRTL ? 'التنبؤات' : 'Predictions'}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'recurring'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{isRTL ? 'الرحلات المتكررة' : 'Recurring Trips'}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'optimization'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{isRTL ? 'التحسين' : 'Optimization'}</span>
            </div>
          </button>
        </div>

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Timeframe Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{isRTL ? 'الإطار الزمني:' : 'Timeframe:'}</span>
                  <div className="flex gap-2">
                    {(['1h', '3h', '6h', '24h'] as const).map((time) => (
                      <Button
                        key={time}
                        variant={selectedTimeframe === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictions List */}
            <div className="grid gap-4">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Route Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Route className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {isRTL ? prediction.routeAr : prediction.route}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-muted-foreground">{prediction.peakTime}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getTrendColor(prediction.trend)}>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(prediction.trend)}
                              <span className="capitalize">{prediction.trend}</span>
                            </div>
                          </Badge>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {isRTL ? 'الطلب المتوقع' : 'Predicted Demand'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="font-bold text-lg">{prediction.predictedDemand}%</span>
                            </div>
                            <Progress value={prediction.predictedDemand} className="mt-2 h-2" />
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {isRTL ? 'العرض الحالي' : 'Current Supply'}
                            </p>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-500" />
                              <span className="font-bold text-lg">{prediction.currentSupply}%</span>
                            </div>
                            <Progress value={prediction.currentSupply} className="mt-2 h-2" />
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {isRTL ? 'السعر المقترح' : 'Suggested Price'}
                            </p>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-orange-500" />
                              <span className="font-bold text-lg">SAR {prediction.suggestedPrice}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {isRTL ? 'الدقة' : 'Confidence'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-500" />
                              <span className="font-bold text-lg">{prediction.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Supply-Demand Gap Alert */}
                        {prediction.predictedDemand > prediction.currentSupply + 20 && (
                          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-orange-900 dark:text-orange-200">
                                {isRTL ? 'نقص متوقع في السائقين' : 'Driver Shortage Expected'}
                              </p>
                              <p className="text-orange-700 dark:text-orange-300">
                                {isRTL 
                                  ? 'يُنصح بزيادة الأسعار بنسبة 15-20% لجذب المزيد من السائقين'
                                  : 'Consider increasing prices by 15-20% to attract more drivers'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button className="w-full" variant="outline">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isRTL ? 'حجز بالسعر المحسّن' : 'Book with Optimized Price'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recurring Trips Tab */}
        {activeTab === 'recurring' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {isRTL ? 'اكتشاف تلقائي للأنماط' : 'Automatic Pattern Detection'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'اكتشفنا رحلاتك المتكررة ونقترح جدولة تلقائية لتوفير الوقت'
                        : 'We detected your recurring trips and suggest automatic scheduling to save time'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {recurringPatterns.map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{pattern.route}</h3>
                            <p className="text-sm text-muted-foreground">{pattern.frequency}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                          {isRTL ? 'موفر' : 'Time Saver'}: {pattern.timeSaved}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-muted-foreground">
                          {isRTL ? 'الرحلة القادمة المقترحة:' : 'Next Suggested:'}
                        </span>
                        <span className="font-semibold">{pattern.nextSuggested}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">
                          {isRTL ? 'تفعيل الجدولة التلقائية' : 'Enable Auto-Schedule'}
                        </Button>
                        <Button variant="outline">
                          {isRTL ? 'تخصيص' : 'Customize'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'كفاءة المسار' : 'Route Efficiency'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {optimizationMetrics.routeEfficiency}%
                  </div>
                  <Progress value={optimizationMetrics.routeEfficiency} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? '+12% من الشهر الماضي' : '+12% from last month'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'متوسط وقت الانتظار' : 'Avg Wait Time'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {optimizationMetrics.avgWaitTime}
                  </div>
                  <Progress value={100 - optimizationMetrics.avgWaitTimeReduction} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? `تحسن بنسبة ${optimizationMetrics.avgWaitTimeReduction}٪` 
                      : `${optimizationMetrics.avgWaitTimeReduction}% improvement`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'دقة التسعير' : 'Price Accuracy'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {optimizationMetrics.priceAccuracy}%
                  </div>
                  <Progress value={optimizationMetrics.priceAccuracy} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'دقة عالية جداً' : 'Very High Accuracy'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'توقع الطلب' : 'Demand Forecast'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {optimizationMetrics.demandForecast}%
                  </div>
                  <Progress value={optimizationMetrics.demandForecast} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'موثوقية ممتازة' : 'Excellent Reliability'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'استخدام السائقين' : 'Driver Utilization'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-cyan-600 mb-2">
                    {optimizationMetrics.driverUtilization}%
                  </div>
                  <Progress value={optimizationMetrics.driverUtilization} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? '+8% من الشهر الماضي' : '+8% from last month'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-purple-100">
                    {isRTL ? 'التوفير الإجمالي' : 'Total Savings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    SAR 12,450
                  </div>
                  <p className="text-sm text-purple-100">
                    {isRTL ? 'هذا الشهر من التحسينات' : 'This month from optimizations'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  {isRTL ? 'رؤى الذكاء الاصطناعي' : 'AI Insights'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <p className="text-sm">
                    {isRTL
                      ? 'الطلب على المطار يرتفع بنسبة 35% يوم الخميس والجمعة'
                      : 'Airport demand increases by 35% on Thursdays and Fridays'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <p className="text-sm">
                    {isRTL
                      ? 'المناطق التجارية تشهد ذروة الطلب من 12 ظهراً - 2 ظهراً'
                      : 'Business districts see peak demand from 12 PM - 2 PM'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <p className="text-sm">
                    {isRTL
                      ? 'الأيام الممطرة ترفع الطلب بنسبة 60% - يُنصح بزيادة الأسعار'
                      : 'Rainy days increase demand by 60% - consider surge pricing'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
