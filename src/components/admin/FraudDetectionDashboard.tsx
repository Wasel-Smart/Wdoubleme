import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Map, CreditCard, Lock, UserX, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export function FraudDetectionDashboard() {
  const { language } = useLanguage();
  
  const data = [
    { name: 'Payment Fraud', value: 45, color: '#ef4444' },
    { name: 'GPS Spoofing', value: 25, color: '#f59e0b' },
    { name: 'Fake Accounts', value: 20, color: '#3b82f6' },
    { name: 'Promo Abuse', value: 10, color: '#8b5cf6' },
  ];

  const alerts = [
    { id: 'F-101', type: 'Payment', desc: 'Multiple failed attempts from IP 192.168.1.1', severity: 'Critical', time: '10 min ago' },
    { id: 'F-102', type: 'GPS', desc: 'Driver speed > 200km/h impossible', severity: 'High', time: '25 min ago' },
    { id: 'F-103', type: 'Account', desc: 'Duplicate device ID detected', severity: 'Medium', time: '1 hour ago' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        {language === 'ar' ? 'كشف الاحتيال' : 'Fraud Detection'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Blocked Attempts', value: '142', icon: <Lock className="text-red-500" /> },
          { label: 'Suspicious IPs', value: '24', icon: <Map className="text-orange-500" /> },
          { label: 'Failed Payments', value: 'JOD 4.2k', icon: <CreditCard className="text-yellow-500" /> },
          { label: 'Banned Users', value: '18', icon: <UserX className="text-gray-500" /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Fraud Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-red-500" /> Recent Alerts
          </h3>
          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{alert.type} Fraud</span>
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">{alert.severity}</span>
                   </div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">{alert.desc}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}