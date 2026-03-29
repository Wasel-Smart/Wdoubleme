import { useState } from 'react';
import { motion } from 'motion/react';
import { Box, Activity, Smartphone, Layers, MousePointer } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

export function ProductAnalyticsDashboard() {
  const { language } = useLanguage();

  const funnelData = [
    { step: 'App Open', count: 15000 },
    { step: 'Search Ride', count: 12000 },
    { step: 'Select Type', count: 9500 },
    { step: 'Confirm', count: 8200 },
    { step: 'Complete', count: 7800 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Box className="w-8 h-8 text-primary" />
        {language === 'ar' ? 'تحليلات المنتج' : 'Product Analytics'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
            { label: 'App Crashes', value: '0.02%', icon: <Activity className="text-red-500" /> },
            { label: 'Avg Load Time', value: '0.8s', icon: <Smartphone className="text-green-500" /> },
            { label: 'API Latency', value: '120ms', icon: <Layers className="text-blue-500" /> },
            { label: 'Conversion', value: '52%', icon: <MousePointer className="text-purple-500" /> },
         ].map((stat, i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
               <div className="flex justify-between items-center mb-2">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{stat.icon}</div>
               </div>
               <div className="text-2xl font-bold">{stat.value}</div>
               <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
         ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
         <h3 className="text-lg font-bold mb-4">Booking Conversion Funnel</h3>
         <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
