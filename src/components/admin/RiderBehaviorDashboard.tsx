import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  UserPlus,
  UserMinus,
  Activity,
  ShoppingBag,
  Clock,
  MapPin,
  Heart,
  Smartphone
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function RiderBehaviorDashboard() {
  const { language } = useLanguage();

  // Mock Data
  const retentionData = [
    { name: 'Week 1', retained: 100 },
    { name: 'Week 2', retained: 85 },
    { name: 'Week 3', retained: 72 },
    { name: 'Week 4', retained: 65 },
    { name: 'Week 5', retained: 60 },
    { name: 'Week 6', retained: 58 },
  ];

  const segmentData = [
    { name: 'Power Users', value: 15, color: '#3b82f6' },
    { name: 'Regulars', value: 35, color: '#22c55e' },
    { name: 'Casual', value: 30, color: '#eab308' },
    { name: 'At Risk', value: 20, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            {language === 'ar' ? 'سلوك الركاب' : 'Rider Behavior'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze user retention, segmentation, and booking patterns
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">1,240</div>
          <div className="text-sm text-muted-foreground">New Riders (Week)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">65%</div>
          <div className="text-sm text-muted-foreground">Retention Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">JOD 450</div>
          <div className="text-sm text-muted-foreground">Lifetime Value (LTV)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <UserMinus className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
              -2%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">4.2%</div>
          <div className="text-sm text-muted-foreground">Churn Rate</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Cohort */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h3 className="text-lg font-bold mb-6">User Retention (Weeks)</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Bar dataKey="retained" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} name="% Retained" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Segments */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-bold mb-2 w-full text-left">User Segmentation</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Legend layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Top Destinations
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium">Abdali Mall - Entrance {i}</span>
                <div className="w-1/2 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${100 - i * 15}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Churn Risk Factors
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm font-medium">High Cancellation (Driver)</span>
                <span className="text-sm font-bold text-red-600">High Risk</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-sm font-medium">Long Wait Times (&gt;8 min)</span>
                <span className="text-sm font-bold text-orange-600">Medium Risk</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-sm font-medium">Payment Failures</span>
                <span className="text-sm font-bold text-yellow-600">Low Risk</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}