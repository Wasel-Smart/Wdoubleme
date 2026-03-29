import { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  MoreHorizontal,
  Search,
  Filter
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

export function CustomerSupportDashboard() {
  const { language } = useLanguage();

  // Mock Data
  const ticketStats = [
    { name: 'Open', value: 45, color: '#ef4444' },
    { name: 'In Progress', value: 28, color: '#eab308' },
    { name: 'Resolved', value: 120, color: '#22c55e' },
  ];

  const recentTickets = [
    { id: 'T-1024', user: 'Ahmed H.', issue: 'Refund Request', priority: 'High', status: 'Open', time: '10 mins ago' },
    { id: 'T-1023', user: 'Sarah M.', issue: 'Driver Complaint', priority: 'Medium', status: 'In Progress', time: '25 mins ago' },
    { id: 'T-1022', user: 'John D.', issue: 'App Glitch', priority: 'Low', status: 'Open', time: '1 hour ago' },
    { id: 'T-1021', user: 'Fatima S.', issue: 'Lost Item', priority: 'High', status: 'Resolved', time: '2 hours ago' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            {language === 'ar' ? 'دعم العملاء' : 'Customer Support'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage support tickets, response times, and agent performance
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Create Ticket
          </button>
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
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
              +5
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">45</div>
          <div className="text-sm text-muted-foreground">Open Tickets</div>
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
             <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              -2m
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">12m</div>
          <div className="text-sm text-muted-foreground">Avg Response Time</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">94%</div>
          <div className="text-sm text-muted-foreground">Resolution Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
           <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <User className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">4.8</div>
          <div className="text-sm text-muted-foreground">CSAT Score</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
             <h3 className="text-lg font-bold">Recent Tickets</h3>
             <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Filter className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Search className="w-4 h-4" /></button>
             </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
             {recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                         {ticket.user.charAt(0)}
                      </div>
                      <div>
                         <p className="font-medium text-sm">{ticket.issue} <span className="text-xs text-gray-500">({ticket.id})</span></p>
                         <p className="text-xs text-muted-foreground">{ticket.user} • {ticket.time}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={cn("px-2 py-1 text-xs font-semibold rounded-full",
                         ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                         ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      )}>
                         {ticket.priority}
                      </span>
                      <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border",
                         ticket.status === 'Open' ? 'bg-white border-red-200 text-red-700' :
                         ticket.status === 'In Progress' ? 'bg-white border-yellow-200 text-yellow-700' : 'bg-white border-green-200 text-green-700'
                      )}>
                         {ticket.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                   </div>
                </div>
             ))}
          </div>
        </motion.div>

        {/* Ticket Stats Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-bold mb-4 w-full text-left">Ticket Status Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={ticketStats}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                  >
                     {ticketStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                  <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
