/**
 * AI Route Optimization Engine
 * Smart dispatch, predictive ETA, and driver performance scoring
 */

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Brain, 
  Route, 
  Clock, 
  TrendingUp, 
  MapPin,
  Zap,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';

interface RouteOptimization {
  routeId: string;
  origin: string;
  destination: string;
  originalETA: string;
  optimizedETA: string;
  timeSaved: number;
  fuelSaved: number;
  confidence: number;
  stops: string[];
}

interface DriverScore {
  driverId: string;
  name: string;
  score: number;
  totalTrips: number;
  rating: number;
  onTimeRate: number;
  cancellationRate: number;
  trend: 'up' | 'down' | 'neutral';
}

export default function AIRouteOptimization() {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('routes');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Mock route optimizations
  const routeOptimizations: RouteOptimization[] = [
    {
      routeId: 'R001',
      origin: 'Amman',
      destination: 'Aqaba',
      originalETA: '4h 30m',
      optimizedETA: '4h 05m',
      timeSaved: 25,
      fuelSaved: 2.3,
      confidence: 94,
      stops: ['Desert Highway Rest Stop', 'Ma\'an Gas Station']
    },
    {
      routeId: 'R002',
      origin: 'Amman',
      destination: 'Irbid',
      originalETA: '1h 45m',
      optimizedETA: '1h 30m',
      timeSaved: 15,
      fuelSaved: 1.2,
      confidence: 88,
      stops: ['Zarqa Checkpoint']
    },
    {
      routeId: 'R003',
      origin: 'Amman',
      destination: 'Dead Sea',
      originalETA: '1h 15m',
      optimizedETA: '1h 00m',
      timeSaved: 15,
      fuelSaved: 0.9,
      confidence: 91,
      stops: []
    }
  ];

  // Mock driver performance scores
  const driverScores: DriverScore[] = [
    {
      driverId: 'D001',
      name: 'Ahmed Hassan',
      score: 98,
      totalTrips: 156,
      rating: 4.9,
      onTimeRate: 97,
      cancellationRate: 1.2,
      trend: 'up'
    },
    {
      driverId: 'D002',
      name: 'Sara Mahmoud',
      score: 95,
      totalTrips: 203,
      rating: 4.8,
      onTimeRate: 94,
      cancellationRate: 2.1,
      trend: 'up'
    },
    {
      driverId: 'D003',
      name: 'Omar Ali',
      score: 92,
      totalTrips: 127,
      rating: 4.7,
      onTimeRate: 91,
      cancellationRate: 3.5,
      trend: 'neutral'
    },
    {
      driverId: 'D004',
      name: 'Layla Ibrahim',
      score: 89,
      totalTrips: 98,
      rating: 4.6,
      onTimeRate: 88,
      cancellationRate: 4.2,
      trend: 'down'
    }
  ];

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
  };

  return (
    <div className={rtl.flex('col gap-6')} dir={dir}>
      {/* Header */}
      <div className={rtl.flex('row items-center justify-between')}>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            {t('AI Route Optimization')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Smart dispatch engine with predictive analytics')}
          </p>
        </div>
        <Button onClick={handleOptimizeRoute} disabled={isOptimizing}>
          {isOptimizing ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              {t('Optimizing...')}
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              {t('Optimize All Routes')}
            </>
          )}
        </Button>
      </div>

      {/* AI Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className={rtl.flex('row items-start justify-between')}>
            <div>
              <p className="text-sm text-muted-foreground">{t('Routes Optimized')}</p>
              <p className="text-3xl font-bold mt-1">347</p>
              <p className="text-sm text-green-600 mt-1">+23% this week</p>
            </div>
            <Route className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className={rtl.flex('row items-start justify-between')}>
            <div>
              <p className="text-sm text-muted-foreground">{t('Time Saved')}</p>
              <p className="text-3xl font-bold mt-1">87h</p>
              <p className="text-sm text-green-600 mt-1">2,145 min total</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className={rtl.flex('row items-start justify-between')}>
            <div>
              <p className="text-sm text-muted-foreground">{t('Fuel Saved')}</p>
              <p className="text-3xl font-bold mt-1">234L</p>
              <p className="text-sm text-green-600 mt-1">JOD 210 saved</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className={rtl.flex('row items-start justify-between')}>
            <div>
              <p className="text-sm text-muted-foreground">{t('AI Accuracy')}</p>
              <p className="text-3xl font-bold mt-1">94%</p>
              <p className="text-sm text-green-600 mt-1">ETA prediction</p>
            </div>
            <Target className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="routes">{t('Route Optimization')}</TabsTrigger>
          <TabsTrigger value="drivers">{t('Driver Performance')}</TabsTrigger>
          <TabsTrigger value="dispatch">{t('Smart Dispatch')}</TabsTrigger>
          <TabsTrigger value="insights">{t('AI Insights')}</TabsTrigger>
        </TabsList>

        {/* Route Optimization Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Optimized Routes Today')}</h3>
            <div className="space-y-4">
              {routeOptimizations.map((route, idx) => (
                <motion.div
                  key={route.routeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className={rtl.flex('row items-start justify-between mb-3')}>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {route.origin} → {route.destination}
                      </h4>
                      <p className="text-sm text-muted-foreground">Route ID: {route.routeId}</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {route.confidence}% Confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Original ETA')}</p>
                      <p className="font-medium line-through text-muted-foreground">{route.originalETA}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Optimized ETA')}</p>
                      <p className="font-medium text-green-600">{route.optimizedETA}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Time Saved')}</p>
                      <p className="font-medium">{route.timeSaved} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Fuel Saved')}</p>
                      <p className="font-medium">{route.fuelSaved}L</p>
                    </div>
                  </div>

                  {route.stops.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">{t('Recommended Stops')}:</p>
                      <div className={rtl.flex('row gap-2 flex-wrap')}>
                        {route.stops.map(stop => (
                          <Badge key={stop} variant="outline">
                            <MapPin className="w-3 h-3 mr-1" />
                            {stop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Driver Performance Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Top Performing Drivers')}</h3>
            <div className="space-y-4">
              {driverScores.map((driver, idx) => (
                <motion.div
                  key={driver.driverId}
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className={rtl.flex('row items-start justify-between mb-3')}>
                    <div className={rtl.flex('row items-center gap-3')}>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{driver.name}</h4>
                        <p className="text-sm text-muted-foreground">{driver.totalTrips} trips</p>
                      </div>
                    </div>
                    <div className={rtl.flex('col items-end gap-1')}>
                      <div className={rtl.flex('row items-center gap-2')}>
                        <Award className={`w-5 h-5 ${
                          driver.score >= 95 ? 'text-yellow-500' :
                          driver.score >= 90 ? 'text-gray-400' :
                          'text-orange-500'
                        }`} />
                        <span className="text-2xl font-bold">{driver.score}</span>
                      </div>
                      <Badge variant={
                        driver.trend === 'up' ? 'default' :
                        driver.trend === 'down' ? 'destructive' :
                        'secondary'
                      }>
                        {driver.trend === 'up' ? '↑' : driver.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Rating')}</p>
                      <p className="font-medium">⭐ {driver.rating}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('On-Time Rate')}</p>
                      <p className="font-medium text-green-600">{driver.onTimeRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Cancellations')}</p>
                      <p className="font-medium">{driver.cancellationRate}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Smart Dispatch Tab */}
        <TabsContent value="dispatch" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Smart Dispatch Engine')}</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className={rtl.flex('row items-start gap-3')}>
                  <Zap className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      {t('AI Matching Algorithm Active')}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {t('Automatically matching passengers with optimal drivers based on route, time, and preferences')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-3">{t('Matching Criteria')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className={rtl.flex('row items-center gap-2')}>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{t('Route compatibility (98% match)')}</span>
                    </li>
                    <li className={rtl.flex('row items-center gap-2')}>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{t('Time window alignment (95% match)')}</span>
                    </li>
                    <li className={rtl.flex('row items-center gap-2')}>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{t('Gender preferences (100% respected)')}</span>
                    </li>
                    <li className={rtl.flex('row items-center gap-2')}>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{t('Driver rating threshold (4.5+)')}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-3">{t('Today\'s Performance')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className={rtl.flex('row justify-between')}>
                      <span className="text-muted-foreground">{t('Total Matches')}</span>
                      <span className="font-medium">247</span>
                    </li>
                    <li className={rtl.flex('row justify-between')}>
                      <span className="text-muted-foreground">{t('Success Rate')}</span>
                      <span className="font-medium text-green-600">94%</span>
                    </li>
                    <li className={rtl.flex('row justify-between')}>
                      <span className="text-muted-foreground">{t('Avg Match Time')}</span>
                      <span className="font-medium">1.2s</span>
                    </li>
                    <li className={rtl.flex('row justify-between')}>
                      <span className="text-muted-foreground">{t('AI Confidence')}</span>
                      <span className="font-medium">92%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('AI-Generated Insights')}</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className={rtl.flex('row items-start gap-3')}>
                  <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      {t('Peak Demand Prediction')}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {t('AI predicts 32% increase in Amman → Aqaba bookings this Friday. Recommend recruiting 5 additional drivers.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className={rtl.flex('row items-start gap-3')}>
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      {t('Route Efficiency Alert')}
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {t('Irbid → Zarqa route showing 18% longer travel times. Suggest alternative via Highway 40 to save 12 minutes.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className={rtl.flex('row items-start gap-3')}>
                  <Brain className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      {t('Cost Optimization Opportunity')}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {t('By grouping 4 pending Amman → Dead Sea requests, estimated fuel savings: JOD 18 per trip.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}