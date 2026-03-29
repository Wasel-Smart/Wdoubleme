import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Siren, Activity, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function SafetyIncidentsDashboard() {
  const { language } = useLanguage();

  const incidents = [
    { type: 'Accident', count: 12 },
    { type: 'Harassment', count: 3 },
    { type: 'Lost Item', count: 45 },
    { type: 'Verbal Dispute', count: 18 },
    { type: 'Vehicle Issue', count: 32 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-600" />
          {language === 'ar' ? 'السلامة والحوادث' : 'Safety & Incidents'}
        </h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse flex items-center gap-2">
           <Siren className="w-5 h-5" /> Emergency Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active SOS', value: '0', icon: <Siren className="text-red-500" />, color: 'bg-red-50 border-red-200' },
          { label: 'Open Incidents', value: '8', icon: <FileText className="text-orange-500" />, color: 'bg-white' },
          { label: 'Avg Response', value: '2m 14s', icon: <Activity className="text-blue-500" />, color: 'bg-white' },
          { label: 'Safety Score', value: '98.5%', icon: <CheckCircle className="text-green-500" />, color: 'bg-white' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-xl border ${stat.color} dark:bg-gray-800 dark:border-gray-700`}>
            <div className="flex justify-between items-center mb-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4">Incident Types (Last 30 Days)</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidents} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                     <XAxis type="number" />
                     <YAxis dataKey="type" type="category" width={100} />
                     <Tooltip />
                     <Bar dataKey="count" fill="#3b82f6" barSize={20} radius={[0, 4, 4, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4">Recent Emergency Alerts</h3>
            <div className="space-y-4">
               <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                     <CheckCircle className="w-4 h-4 text-green-600" />
                     <span className="font-bold text-green-700 dark:text-green-400">All Clear</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300">No active SOS alerts at this time.</p>
               </div>
               
               <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg opacity-60">
                  <div className="flex justify-between mb-1">
                     <span className="font-bold text-sm">Resolved SOS #4921</span>
                     <span className="text-xs">2h ago</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">False alarm triggered by rider in Downtown.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
