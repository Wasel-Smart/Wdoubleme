import { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Pause,
  Target,
  Award,
  Zap,
  Calendar,
  BarChart3,
  Eye,
  Settings
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface City {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  phase: 'planning' | 'pre-launch' | 'month-1' | 'month-2' | 'month-3' | 'scaling' | 'mature';
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  launchDate?: string;
  metrics: CityMetrics;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  milestones: Milestone[];
}

interface CityMetrics {
  riders: number;
  drivers: number;
  rides: number;
  revenue: number;
  riderRating: number;
  driverRating: number;
  cac: number;
  ltv: number;
  contributionMargin: number;
  monthlyGrowth: number;
}

interface Milestone {
  id: string;
  name: string;
  target: string;
  actual?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  dueDate: string;
}

export function CityLaunchTracker() {
  const { language } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>('amman');
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'playbook'>('overview');

  // City data
  const cities: City[] = [
    {
      id: 'dubai',
      name: 'Dubai',
      nameAr: 'دبي',
      country: 'UAE',
      phase: 'month-3',
      status: 'in-progress',
      launchDate: '2026-01-15',
      metrics: {
        riders: 4850,
        drivers: 487,
        rides: 38650,
        revenue: 526000,
        riderRating: 4.82,
        driverRating: 4.79,
        cac: 23,
        ltv: 342,
        contributionMargin: 8.7,
        monthlyGrowth: 22.5,
      },
      budget: {
        allocated: 575000,
        spent: 458000,
        remaining: 117000,
      },
      milestones: [
        { id: 'm1', name: '100 Riders, 50 Drivers', target: '100/50', actual: '127/62', status: 'completed', dueDate: '2026-02-14' },
        { id: 'm2', name: '4.8+ Ratings Both Sides', target: '4.8', actual: '4.81', status: 'completed', dueDate: '2026-02-14' },
        { id: 'm3', name: '1,000 Riders, 200 Drivers', target: '1000/200', actual: '1247/218', status: 'completed', dueDate: '2026-03-15' },
        { id: 'm4', name: 'Positive Contribution Margin', target: '>0%', actual: '8.7%', status: 'completed', dueDate: '2026-03-15' },
        { id: 'm5', name: '5,000 Riders, 500 Drivers', target: '5000/500', actual: '4850/487', status: 'in-progress', dueDate: '2026-04-15' },
        { id: 'm6', name: 'CAC < $25', target: '<$25', actual: '$23', status: 'completed', dueDate: '2026-04-15' },
      ],
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi',
      nameAr: 'أبو ظبي',
      country: 'UAE',
      phase: 'pre-launch',
      status: 'in-progress',
      launchDate: '2026-05-01',
      metrics: {
        riders: 0,
        drivers: 0,
        rides: 0,
        revenue: 0,
        riderRating: 0,
        driverRating: 0,
        cac: 0,
        ltv: 0,
        contributionMargin: 0,
        monthlyGrowth: 0,
      },
      budget: {
        allocated: 500000,
        spent: 87000,
        remaining: 413000,
      },
      milestones: [
        { id: 'ad1', name: 'Local Permits Secured', target: 'Complete', actual: undefined, status: 'in-progress', dueDate: '2026-04-15' },
        { id: 'ad2', name: 'Hire City Manager', target: 'Hired', actual: 'In interviews', status: 'in-progress', dueDate: '2026-04-20' },
        { id: 'ad3', name: 'Recruit First 20 Drivers', target: '20', actual: '8', status: 'in-progress', dueDate: '2026-04-25' },
        { id: 'ad4', name: 'Insurance Partnership', target: 'Signed', actual: undefined, status: 'pending', dueDate: '2026-04-20' },
        { id: 'ad5', name: 'Launch Beta', target: '100 riders', actual: undefined, status: 'pending', dueDate: '2026-05-15' },
      ],
    },
    {
      id: 'sharjah',
      name: 'Sharjah',
      nameAr: 'الشارقة',
      country: 'UAE',
      phase: 'planning',
      status: 'not-started',
      launchDate: '2026-07-01',
      metrics: {
        riders: 0,
        drivers: 0,
        rides: 0,
        revenue: 0,
        riderRating: 0,
        driverRating: 0,
        cac: 0,
        ltv: 0,
        contributionMargin: 0,
        monthlyGrowth: 0,
      },
      budget: {
        allocated: 500000,
        spent: 0,
        remaining: 500000,
      },
      milestones: [
        { id: 'sh1', name: 'Market Research', target: 'Complete', actual: undefined, status: 'pending', dueDate: '2026-05-15' },
        { id: 'sh2', name: 'Regulatory Approval', target: 'Approved', actual: undefined, status: 'pending', dueDate: '2026-06-01' },
        { id: 'sh3', name: 'Pre-Launch Setup', target: 'Complete', actual: undefined, status: 'pending', dueDate: '2026-06-25' },
      ],
    },
    {
      id: 'riyadh',
      name: 'Riyadh',
      nameAr: 'الرياض',
      country: 'Saudi Arabia',
      phase: 'planning',
      status: 'not-started',
      launchDate: '2027-01-01',
      metrics: {
        riders: 0,
        drivers: 0,
        rides: 0,
        revenue: 0,
        riderRating: 0,
        driverRating: 0,
        cac: 0,
        ltv: 0,
        contributionMargin: 0,
        monthlyGrowth: 0,
      },
      budget: {
        allocated: 2500000,
        spent: 0,
        remaining: 2500000,
      },
      milestones: [],
    },
    {
      id: 'amman',
      name: 'Amman',
      nameAr: 'عمان',
      country: 'Jordan',
      phase: 'planning',
      status: 'not-started',
      launchDate: '2027-01-01',
      metrics: {
        riders: 0,
        drivers: 0,
        rides: 0,
        revenue: 0,
        riderRating: 0,
        driverRating: 0,
        cac: 0,
        ltv: 0,
        contributionMargin: 0,
        monthlyGrowth: 0,
      },
      budget: {
        allocated: 2500000,
        spent: 0,
        remaining: 2500000,
      },
      milestones: [],
    },
  ];

  const selectedCityData = cities.find(c => c.id === selectedCity) || cities[0];

  // Growth chart data
  const growthData = [
    { month: 'Jan', riders: 127, drivers: 62, revenue: 17 },
    { month: 'Feb', riders: 847, drivers: 142, revenue: 92 },
    { month: 'Mar', riders: 2340, drivers: 298, revenue: 278 },
    { month: 'Apr', riders: 4850, drivers: 487, revenue: 526 },
  ];

  // Phase progress
  const phaseData = [
    { name: 'Pre-Launch', value: 1, color: '#3B82F6' },
    { name: 'Month 1-3', value: 1, color: '#10B981' },
    { name: 'Scaling', value: 0, color: '#F59E0B' },
    { name: 'Planning', value: 2, color: '#6B7280' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6B7280'];

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'planning': return 'Planning';
      case 'pre-launch': return 'Pre-Launch (30 days)';
      case 'month-1': return 'Month 1: Soft Launch';
      case 'month-2': return 'Month 2: Controlled Expansion';
      case 'month-3': return 'Month 3: Public Launch';
      case 'scaling': return 'Scaling Phase';
      case 'mature': return 'Mature Market';
      default: return phase;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delayed': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'not-started': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'متتبع إطلاق المدن' : 'City Launch Tracker'}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'نموذج النمو القابل للتكرار والفعال من حيث رأس المال'
              : 'Replicable, capital-efficient growth model'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {['overview', 'details', 'playbook'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                viewMode === mode
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </motion.div>

      {/* City Selection */}
      <div className="flex flex-wrap gap-3">
        {cities.map(city => (
          <button
            key={city.id}
            onClick={() => setSelectedCity(city.id)}
            className={cn(
              'px-6 py-3 rounded-xl transition-all',
              selectedCity === city.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 hover:shadow-md'
            )}
          >
            <div className="text-left">
              <div className="font-bold">{city.name}</div>
              <div className="text-xs opacity-80">{getPhaseLabel(city.phase)}</div>
            </div>
          </button>
        ))}
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">
                  {selectedCityData.metrics.riders.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Riders</div>
              <div className="text-xs text-muted-foreground mt-1">
                +{selectedCityData.metrics.monthlyGrowth}% monthly
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-green-600">
                  {selectedCityData.metrics.drivers.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Drivers</div>
              <div className="text-xs text-muted-foreground mt-1">
                ⭐ {selectedCityData.metrics.driverRating} avg rating
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">
                  ${(selectedCityData.metrics.revenue / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Revenue</div>
              <div className="text-xs text-muted-foreground mt-1">
                {selectedCityData.metrics.contributionMargin}% margin
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold text-orange-600">
                  {selectedCityData.metrics.ltv > 0 ? (selectedCityData.metrics.ltv / selectedCityData.metrics.cac).toFixed(1) : '0'}:1
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">LTV/CAC Ratio</div>
              <div className="text-xs text-muted-foreground mt-1">
                CAC: ${selectedCityData.metrics.cac}
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-4">Growth Trajectory</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="riders" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="drivers" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Phase Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-4">Cities by Phase</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={phaseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {phaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* All Cities Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold">All Cities Overview</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">City</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phase</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Riders</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Drivers</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Revenue</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Budget</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Launch Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {cities.map(city => (
                    <tr key={city.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 font-medium">{city.name}</td>
                      <td className="px-4 py-3 text-sm">{getPhaseLabel(city.phase)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium border capitalize', getStatusColor(city.status))}>
                          {city.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">{city.metrics.riders.toLocaleString()}</td>
                      <td className="px-4 py-3">{city.metrics.drivers.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        ${(city.metrics.revenue / 1000).toFixed(0)}K
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          ${(city.budget.spent / 1000).toFixed(0)}K / ${(city.budget.allocated / 1000).toFixed(0)}K
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(city.budget.spent / city.budget.allocated) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {city.launchDate ? new Date(city.launchDate).toLocaleDateString() : 'TBD'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {viewMode === 'details' && (
        <>
          {/* City Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6">{selectedCityData.name} Launch Progress</h3>

            {/* Milestones */}
            <div className="space-y-4">
              {selectedCityData.milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-900/50"
                >
                  <div className="mt-1">
                    {getMilestoneStatusIcon(milestone.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{milestone.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <span className="ml-2 font-medium">{milestone.target}</span>
                      </div>
                      {milestone.actual && (
                        <div>
                          <span className="text-muted-foreground">Actual:</span>
                          <span className="ml-2 font-medium text-primary">{milestone.actual}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Budget Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4">Budget Allocation</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${(selectedCityData.budget.allocated / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Allocated</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  ${(selectedCityData.budget.spent / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Spent</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${(selectedCityData.budget.remaining / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(selectedCityData.budget.spent / selectedCityData.budget.allocated) * 100}%` }}
              >
                {Math.round((selectedCityData.budget.spent / selectedCityData.budget.allocated) * 100)}%
              </div>
            </div>
          </motion.div>
        </>
      )}

      {viewMode === 'playbook' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-6">90-Day City Launch Playbook</h3>
          
          <div className="space-y-6">
            {/* Pre-Launch */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="text-xl font-bold mb-3 text-blue-600">Pre-Launch (30 days)</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Secure local permits and licenses</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Hire city manager</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Partner with insurance provider</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Recruit first 20 drivers</span>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-blue-600">Budget: $100K</div>
            </div>

            {/* Month 1 */}
            <div className="border-l-4 border-green-500 pl-6">
              <h4 className="text-xl font-bold mb-3 text-green-600">Month 1: Soft Launch</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-green-600 mt-0.5" />
                  <span><strong>Goal:</strong> 100 riders, 50 drivers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Invite-only beta launch</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Gather feedback and iterate</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Achieve 4.8+ ratings both sides</span>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-green-600">Budget: $25K</div>
            </div>

            {/* Month 2 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h4 className="text-xl font-bold mb-3 text-purple-600">Month 2: Controlled Expansion</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span><strong>Goal:</strong> 1,000 riders, 200 drivers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span>Open referral program</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span>Launch PR campaign</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span>Maintain quality standards</span>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-purple-600">Budget: $75K</div>
            </div>

            {/* Month 3 */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h4 className="text-xl font-bold mb-3 text-orange-600">Month 3: Public Launch</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span><strong>Goal:</strong> 5,000 riders, 500 drivers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span>Public availability</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span>Selective paid advertising</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
                  <span>Achieve positive contribution margin</span>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-orange-600">Budget: $300K</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
            <div className="font-bold text-lg mb-2">Total Investment: $500K per city</div>
            <div className="text-sm text-muted-foreground">
              6x more capital efficient than traditional launch ($3M+)
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}