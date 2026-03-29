import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Navigation,
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

export function SupplyDemandDashboard() {
  const { language } = useLanguage();

  // Mock Data
  const supplyDemandData = [
    { time: '08:00', demand: 120, supply: 100 },
    { time: '10:00', demand: 150, supply: 140 },
    { time: '12:00', demand: 200, supply: 180 },
    { time: '14:00', demand: 180, supply: 190 },
    { time: '16:00', demand: 250, supply: 220 },
    { time: '18:00', demand: 320, supply: 280 }, // Gap here
    { time: '20:00', demand: 280, supply: 270 },
  ];

  const surgeZones = [
    { name: 'Abdali, Amman', multiplier: 1.8, demand: 'Very High' },
    { name: 'Downtown', multiplier: 1.5, demand: 'High' },
    { name: 'JLT', multiplier: 1.2, demand: 'Moderate' },
    { name: 'Deira', multiplier: 1.0, demand: 'Normal' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            {language === 'ar' ? 'العرض والطلب' : 'Supply & Demand'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Optimize driver allocation and surge pricing
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
           <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">1.2x</div>
          <div className="text-sm text-muted-foreground">Avg Surge Multiplier</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">4.5 min</div>
          <div className="text-sm text-muted-foreground">Avg Wait Time</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Navigation className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">92%</div>
          <div className="text-sm text-muted-foreground">Fulfilled Requests</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">8%</div>
          <div className="text-sm text-muted-foreground">Unfulfilled (Gap)</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply Demand Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h3 className="text-lg font-bold mb-6">Supply vs Demand (24h)</h3>
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={supplyDemandData}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Legend />
                <Area type="monotone" dataKey="demand" stroke="#ef4444" fillOpacity={1} fill="url(#colorDemand)" name="Demand (Riders)" />
                <Area type="monotone" dataKey="supply" stroke="#22c55e" fillOpacity={1} fill="url(#colorSupply)" name="Supply (Drivers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Surge Zones */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-0 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
             <h3 className="text-lg font-bold">Active Surge Zones</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
             {surgeZones.map((zone, i) => (
               <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                     <p className="font-medium">{zone.name}</p>
                     <p className={cn("text-xs font-semibold", 
                        zone.demand === 'Very High' ? 'text-red-600' : 
                        zone.demand === 'High' ? 'text-orange-600' : 'text-green-600'
                     )}>{zone.demand} Demand</p>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-lg font-bold">{zone.multiplier}x</span>
                     <span className="text-xs text-muted-foreground">Surge</span>
                  </div>
               </div>
             ))}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
             <button className="text-primary text-sm font-medium hover:underline">Manage Pricing Rules</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}