import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Eye, 
  Scale, 
  DollarSign, 
  Activity,
  BrainCircuit,
  Siren,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { API_URL, getAuthDetails } from '../../services/core';

// Types for our Risk Agent
interface RiskFactor {
  id: string;
  category: 'Competitive' | 'Regulatory' | 'Financial' | 'Market';
  name: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  impactScore: number; // 1-10
  probabilityScore: number; // 1-10
  trend: 'stable' | 'increasing' | 'decreasing';
  lastUpdated: string;
}

interface SmartAlert {
  id: string;
  type: 'price_war' | 'regulatory' | 'burn_rate' | 'market_threat';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface StrategicRecommendation {
  id: string;
  category: 'Growth' | 'Cost' | 'differentiation' | 'Expansion';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  impact: string;
}

export function StrategicRiskDashboard() {
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(65); // Overall risk score (0-100)
  
  // Mock Data (simulating the Agent's output)
  const [risks, setRisks] = useState<RiskFactor[]>([
    {
      id: 'r1',
      category: 'Regulatory',
      name: 'Licensing Delay Risk',
      description: 'Potential 4-6 week delay in transport authority approval.',
      riskLevel: 'High',
      impactScore: 9,
      probabilityScore: 8,
      trend: 'increasing',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'r2',
      category: 'Financial',
      name: 'Operational Burn Rate',
      description: 'Burn rate approaching 205K JOD/year limit.',
      riskLevel: 'Medium',
      impactScore: 7,
      probabilityScore: 6,
      trend: 'stable',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'r3',
      category: 'Competitive',
      name: 'Uber Pricing Aggression',
      description: 'Competitor lowering base fares in West Amman.',
      riskLevel: 'Medium',
      impactScore: 6,
      probabilityScore: 5,
      trend: 'decreasing',
      lastUpdated: '4 hours ago'
    },
    {
      id: 'r4',
      category: 'Market',
      name: 'New Entrant "GoRide"',
      description: 'Rumors of new local competitor launching in Q3.',
      riskLevel: 'Low',
      impactScore: 4,
      probabilityScore: 3,
      trend: 'stable',
      lastUpdated: '1 day ago'
    }
  ]);

  const [alerts, setAlerts] = useState<SmartAlert[]>([
    {
      id: 'a1',
      type: 'regulatory',
      severity: 'critical',
      message: 'CRITICAL: Licensing approval deadline approaching (14 days remaining)',
      timestamp: '10 mins ago',
      status: 'new'
    },
    {
      id: 'a2',
      type: 'price_war',
      severity: 'warning',
      message: 'Careem launching 20% off promo weekend',
      timestamp: '2 hours ago',
      status: 'new'
    }
  ]);

  const [recommendations, setRecommendations] = useState<StrategicRecommendation[]>([
    {
      id: 'rec1',
      category: 'Cost',
      title: 'Optimize Insurance Model',
      description: 'Switch to pay-per-trip insurance to reduce fixed overhead.',
      priority: 'High',
      impact: 'Save 12K JOD/year'
    },
    {
      id: 'rec2',
      category: 'Growth',
      title: 'Launch "Wasel Pink"',
      description: 'Accelerate women-only service to differentiate from Uber.',
      priority: 'High',
      impact: 'Capture 15% niche market'
    },
    {
      id: 'rec3',
      category: 'differentiation',
      title: 'Legal Acceleration Strategy',
      description: 'Engage stakeholders for fast-track licensing review.',
      priority: 'Medium',
      impact: 'Reduce delay by 2 weeks'
    }
  ]);

  const burnRateData = [
    { month: 'Jan', actual: 12000, projected: 11000 },
    { month: 'Feb', actual: 13500, projected: 12500 },
    { month: 'Mar', actual: 15000, projected: 14000 },
    { month: 'Apr', actual: 18000, projected: 16000 },
    { month: 'May', actual: 17500, projected: 17000 },
    { month: 'Jun', actual: 19000, projected: 18000 },
  ];

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const { token } = await getAuthDetails();
      
      const response = await fetch(`${API_URL}/admin/risk-intelligence`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          if (data.analysis.riskScore) setRiskScore(data.analysis.riskScore);
          if (data.analysis.risks) setRisks(data.analysis.risks);
          if (data.analysis.alerts) setAlerts(data.analysis.alerts);
          if (data.analysis.recommendations) setRecommendations(data.analysis.recommendations);
        }
      }
    } catch (error) {
      console.error('Failed to fetch risk intelligence:', error);
      // Fallback to initial mock data if fetch fails (e.g. auth error or network issue)
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <div className="relative">
          <BrainCircuit className="w-16 h-16 text-primary animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
        </div>
        <h3 className="text-xl font-semibold animate-pulse">Agent Initializing...</h3>
        <p className="text-muted-foreground">Scanning market signals, competitor pricing, and regulatory databases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Agent Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 text-white p-6 rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Strategic Risk & Intelligence Agent</h2>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Autonomous agent continuously monitoring competitive threats, regulatory compliance, and financial health to ensure Wasel's survival and growth.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            MONITORING ACTIVE
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Overall Risk Score</div>
            <div className={`text-2xl font-bold ${riskScore > 70 ? 'text-red-500' : riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
              {riskScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts Section */}
      {alerts.length > 0 && (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'} className="border-l-4">
              <Siren className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {alert.severity === 'critical' ? 'CRITICAL ALERT' : 'INTELLIGENCE ALERT'}
                <span className="text-xs font-normal opacity-70"> • {alert.timestamp}</span>
              </AlertTitle>
              <AlertDescription>
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Risk Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Regulatory Risk */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="w-4 h-4" /> Regulatory Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-red-600">High</span>
              <span className="text-xs text-red-600 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Increasing
              </span>
            </div>
            <Progress value={85} className="h-1.5 bg-red-100" indicatorClassName="bg-red-500" />
            <p className="text-xs text-muted-foreground mt-3">
              Licensing approval delayed. Expected resolution: <span className="font-semibold text-foreground">4-6 weeks</span>.
            </p>
          </CardContent>
        </Card>

        {/* Financial Risk */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Financial Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-yellow-600">Medium</span>
              <span className="text-xs text-gray-500 font-medium flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" /> Stable
              </span>
            </div>
            <Progress value={65} className="h-1.5 bg-yellow-100" indicatorClassName="bg-yellow-500" />
            <p className="text-xs text-muted-foreground mt-3">
              Monthly burn: <span className="font-semibold text-foreground">18.5K JOD</span>. Runway: <span className="font-semibold text-foreground">9 months</span>.
            </p>
          </CardContent>
        </Card>

        {/* Competitive Threat */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" /> Competitive Threat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-blue-600">Medium</span>
              <span className="text-xs text-green-600 font-medium flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" /> Decreasing
              </span>
            </div>
            <Progress value={45} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-500" />
            <p className="text-xs text-muted-foreground mt-3">
              Uber price cuts in West Amman. Wasel retention remains <span className="font-semibold text-foreground">92%</span>.
            </p>
          </CardContent>
        </Card>

        {/* Market / Copycat */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" /> Copycat Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-green-600">Low</span>
              <span className="text-xs text-gray-500 font-medium flex items-center">
                <Activity className="w-3 h-3 mr-1" /> Stable
              </span>
            </div>
            <Progress value={20} className="h-1.5 bg-green-100" indicatorClassName="bg-green-500" />
            <p className="text-xs text-muted-foreground mt-3">
              No significant new entrants detected. Barrier to entry remains <span className="font-semibold text-foreground">High</span>.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Factors Detail List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Risk Monitoring</CardTitle>
            <CardDescription>Real-time assessment of strategic threats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {risks.map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-full ${
                      risk.category === 'Regulatory' ? 'bg-red-100 text-red-600' :
                      risk.category === 'Financial' ? 'bg-yellow-100 text-yellow-600' :
                      risk.category === 'Competitive' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {risk.category === 'Regulatory' ? <Scale className="w-4 h-4" /> :
                       risk.category === 'Financial' ? <DollarSign className="w-4 h-4" /> :
                       risk.category === 'Competitive' ? <Eye className="w-4 h-4" /> :
                       <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{risk.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`${getRiskColor(risk.riskLevel)} border-0`}>
                          {risk.riskLevel} Risk
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Updated {risk.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground mb-1">Impact Score</div>
                    <div className="font-bold text-lg">{risk.impactScore}/10</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Burn Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Burn Rate Forecast</CardTitle>
            <CardDescription>Actual vs Projected (JOD)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burnRateData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#ef4444" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} />
                <Area type="monotone" dataKey="projected" stroke="#94a3b8" strokeDasharray="5 5" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" /> Actual Spend
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-slate-400 border-dashed rounded-full" /> Projected Limit
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
            Agent Strategic Recommendations
          </CardTitle>
          <CardDescription>AI-generated mitigation strategies based on current risk profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    {rec.category}
                  </Badge>
                  {rec.priority === 'High' && (
                    <Badge className="bg-red-100 text-red-600 dark:bg-red-900/20 hover:bg-red-200">High Priority</Badge>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  Impact: {rec.impact}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}