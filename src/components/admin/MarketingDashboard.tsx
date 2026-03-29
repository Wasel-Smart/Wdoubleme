import { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Users, Target, MousePointer, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function MarketingDashboard() {
  const { language } = useLanguage();
  
  const data = [
    { name: 'Social', spend: 4000, leads: 2400 },
    { name: 'Search', spend: 3000, leads: 1398 },
    { name: 'Email', spend: 2000, leads: 9800 },
    { name: 'Referral', spend: 2780, leads: 3908 },
    { name: 'Offline', spend: 1890, leads: 4800 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Megaphone className="w-8 h-8 text-primary" />
        {language === 'ar' ? 'التسويق' : 'Marketing Performance'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: 'JOD 12,450', icon: <TrendingUp className="text-blue-500" />, change: '+12%' },
          { label: 'Total Leads', value: '18,245', icon: <Users className="text-green-500" />, change: '+8%' },
          { label: 'CAC', value: 'JOD 15.40', icon: <Target className="text-red-500" />, change: '-2%' },
          { label: 'CTR', value: '2.4%', icon: <MousePointer className="text-purple-500" />, change: '+0.4%' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{stat.icon}</div>
              <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[400px]">
        <h3 className="text-lg font-bold mb-4">Campaign Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff' }} />
            <Bar dataKey="spend" fill="#3b82f6" name="Spend (JOD)" />
            <Bar dataKey="leads" fill="#22c55e" name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}