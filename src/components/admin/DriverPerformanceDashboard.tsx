import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Star,
  Clock,
  Award,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  Zap
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
  LineChart,
  Line,
  Legend
} from 'recharts';

export function DriverPerformanceDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock Data
  const performanceData = [
    { name: 'Mon', completion: 92, acceptance: 88, rating: 4.8 },
    { name: 'Tue', completion: 94, acceptance: 85, rating: 4.7 },
    { name: 'Wed', completion: 91, acceptance: 90, rating: 4.9 },
    { name: 'Thu', completion: 95, acceptance: 89, rating: 4.8 },
    { name: 'Fri', completion: 89, acceptance: 82, rating: 4.6 },
    { name: 'Sat', completion: 96, acceptance: 92, rating: 4.9 },
    { name: 'Sun', completion: 93, acceptance: 91, rating: 4.8 },
  ];

  const topDrivers = [
    { id: 'D102', name: 'Ahmed Hassan', rating: 4.98, trips: 142, earnings: 5200, status: 'online' },
    { id: 'D452', name: 'Khalid Omar', rating: 4.95, trips: 135, earnings: 4850, status: 'busy' },
    { id: 'D789', name: 'Sara Ali', rating: 4.92, trips: 128, earnings: 4600, status: 'offline' },
    { id: 'D234', name: 'Mohammed Zaki', rating: 4.90, trips: 124, earnings: 4350, status: 'online' },
    { id: 'D567', name: 'Fahad Al-Sayed', rating: 4.88, trips: 118, earnings: 4100, status: 'busy' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            {language === 'ar' ? 'أداء السائقين' : 'Driver Performance'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor driver quality, acceptance rates, and top performers
          </p>
        </div>

        <div className="flex gap-2">
          {['overview', 'leaderboard', 'issues'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors capitalize',
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
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
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              +0.2
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">4.85</div>
          <div className="text-sm text-muted-foreground">Avg Driver Rating</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              +1.5%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">88.4%</div>
          <div className="text-sm text-muted-foreground">Acceptance Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              -0.5%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">3.2%</div>
          <div className="text-sm text-muted-foreground">Cancellation Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">6.5h</div>
          <div className="text-sm text-muted-foreground">Avg Daily Hours</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h3 className="text-lg font-bold mb-6">Weekly Performance Metrics</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Legend />
                <Line type="monotone" dataKey="acceptance" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="Acceptance Rate %" />
                <Line type="monotone" dataKey="completion" stroke="#22c55e" strokeWidth={3} dot={{r: 4}} name="Completion Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Drivers Leaderboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-0 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </h3>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {topDrivers.map((driver, index) => (
              <div key={driver.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {driver.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {driver.trips} Trips • JOD {driver.earnings}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400 fill-current" />
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{driver.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Driver Alerts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Performance Alerts
          </h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                        DA
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Driver Name {i}</div>
                        <div className="text-xs text-gray-500">ID: D-48{i}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100">Low Acceptance Rate</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      Medium
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 28, 2026</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">Under Review</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-primary hover:underline">Investigate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}