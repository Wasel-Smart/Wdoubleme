/**
 * Real-Time Analytics Dashboard
 * Comprehensive KPI tracking with live metrics for Wasel carpooling platform
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  Package, 
  DollarSign,
  MapPin,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';

interface KPIMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface LiveMetric {
  timestamp: string;
  event: string;
  user: string;
  route: string;
  amount?: number;
}

export default function RealTimeAnalyticsDashboard() {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [liveEvents, setLiveEvents] = useState<LiveMetric[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newEvent: LiveMetric = {
        timestamp: new Date().toISOString(),
        event: ['Ride Booked', 'Package Sent', 'Payment Completed', 'Ride Posted'][Math.floor(Math.random() * 4)],
        user: `User${Math.floor(Math.random() * 1000)}`,
        route: ['Amman → Aqaba', 'Amman → Irbid', 'Amman → Dead Sea', 'Irbid → Zarqa'][Math.floor(Math.random() * 4)],
        amount: Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 3 : undefined
      };

      setLiveEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // KPI Metrics
  const kpiMetrics: KPIMetric[] = [
    {
      label: t('Total Rides Today'),
      value: '247',
      change: 12.5,
      trend: 'up',
      icon: <Car className="w-5 h-5" />
    },
    {
      label: t('Active Travelers'),
      value: '89',
      change: 8.3,
      trend: 'up',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: t('Packages Delivered'),
      value: '156',
      change: 15.7,
      trend: 'up',
      icon: <Package className="w-5 h-5" />
    },
    {
      label: t('Revenue (JOD)'),
      value: '1,847',
      change: 9.2,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: t('Avg Response Time'),
      value: '2.3s',
      change: -18.5,
      trend: 'up',
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: t('Booking Success Rate'),
      value: '87%',
      change: 3.2,
      trend: 'up',
      icon: <Activity className="w-5 h-5" />
    },
    {
      label: t('Active Routes'),
      value: '34',
      change: 5.1,
      trend: 'up',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      label: t('Alerts'),
      value: '3',
      change: -2,
      trend: 'neutral',
      icon: <AlertCircle className="w-5 h-5" />
    }
  ];

  // Popular Routes Data
  const popularRoutes = [
    { route: 'Amman → Aqaba', rides: 45, revenue: 540, growth: 12 },
    { route: 'Amman → Irbid', rides: 38, revenue: 228, growth: 8 },
    { route: 'Amman → Dead Sea', rides: 32, revenue: 224, growth: 15 },
    { route: 'Irbid → Zarqa', rides: 18, revenue: 90, growth: -3 },
    { route: 'Amman → Zarqa', rides: 24, revenue: 96, growth: 5 }
  ];

  return (
    <div className={rtl.flex('col gap-6')} dir={dir}>
      {/* Header */}
      <div className={rtl.flex('row items-center justify-between')}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('Real-Time Analytics')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Live performance monitoring and KPI tracking')}
          </p>
        </div>
        <Badge variant={isLive ? "default" : "secondary"} className="gap-2">
          <span className={isLive ? "animate-pulse w-2 h-2 bg-green-500 rounded-full" : "w-2 h-2 bg-gray-400 rounded-full"} />
          {isLive ? t('Live') : t('Paused')}
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className={rtl.flex('row items-start justify-between')}>
                <div className={rtl.flex('col gap-2')}>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <div className={rtl.flex('row items-center gap-1')}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`text-sm ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {metric.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t('Overview')}</TabsTrigger>
          <TabsTrigger value="routes">{t('Popular Routes')}</TabsTrigger>
          <TabsTrigger value="live">{t('Live Events')}</TabsTrigger>
          <TabsTrigger value="performance">{t('Performance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Today\'s Highlights')}</h3>
              <div className="space-y-3">
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('Peak Hour')}</span>
                  <span className="font-medium">2:00 PM - 4:00 PM</span>
                </div>
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('Most Active Route')}</span>
                  <span className="font-medium">Amman → Aqaba</span>
                </div>
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('Top Traveler')}</span>
                  <span className="font-medium">Ahmed M. (12 rides)</span>
                </div>
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('Avg Trip Duration')}</span>
                  <span className="font-medium">3.2 hours</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Operational Status')}</h3>
              <div className="space-y-3">
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('System Health')}</span>
                  <Badge variant="default" className="bg-green-500">Excellent</Badge>
                </div>
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('API Uptime')}</span>
                  <span className="font-medium">99.97%</span>
                </div>
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('Active Users Now')}</span>
                  <span className="font-medium">342</span>
                </div>
                <div className={rtl.flex('row justify-between items-center')}>
                  <span className="text-muted-foreground">{t('Server Load')}</span>
                  <span className="font-medium">42% CPU</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Top 5 Routes Today')}</h3>
            <div className="space-y-4">
              {popularRoutes.map((route, idx) => (
                <div key={route.route} className={rtl.flex('row items-center gap-4')}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={rtl.flex('row justify-between items-center mb-1')}>
                      <span className="font-medium">{route.route}</span>
                      <span className="text-sm text-muted-foreground">JOD {route.revenue}</span>
                    </div>
                    <div className={rtl.flex('row gap-4 text-sm text-muted-foreground')}>
                      <span>{route.rides} {t('rides')}</span>
                      <span className={route.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {route.growth > 0 ? '+' : ''}{route.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Live Event Stream')}</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {liveEvents.map((event, idx) => (
                <motion.div
                  key={`${event.timestamp}-${idx}`}
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-muted/50 rounded-lg"
                >
                  <div className={rtl.flex('row justify-between items-start')}>
                    <div>
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.user} • {event.route}
                      </p>
                    </div>
                    <div className={rtl.flex('col items-end gap-1')}>
                      {event.amount && (
                        <span className="text-sm font-medium text-green-600">
                          +JOD {event.amount}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Response Times')}</h3>
              <div className="space-y-3">
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">API Avg</span>
                  <span className="font-medium text-green-600">1.8s</span>
                </div>
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">Database Avg</span>
                  <span className="font-medium text-green-600">0.4s</span>
                </div>
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">Page Load</span>
                  <span className="font-medium text-green-600">1.2s</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Error Rates')}</h3>
              <div className="space-y-3">
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">4xx Errors</span>
                  <span className="font-medium">0.3%</span>
                </div>
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">5xx Errors</span>
                  <span className="font-medium text-green-600">0.01%</span>
                </div>
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">Timeouts</span>
                  <span className="font-medium text-green-600">0.02%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Capacity')}</h3>
              <div className="space-y-3">
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">Memory</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className={rtl.flex('row justify-between')}>
                  <span className="text-sm text-muted-foreground">Bandwidth</span>
                  <span className="font-medium">1.2 GB/hr</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}