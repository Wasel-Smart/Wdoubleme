import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Crosshair, TrendingUp, TrendingDown, Info, Globe, 
  Smartphone, Shield, Zap, Layout, Users, Award, 
  CheckCircle2, XCircle, AlertTriangle, Briefcase, 
  MapPin, Wallet, Truck, Accessibility
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export function CompetitiveIntelligenceDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Comparison Data
  const featureComparison = [
    { feature: 'Ride Hailing (City)', wasel: true, blablacar: false, uber: true, careem: true },
    { feature: 'Inter-city Carpooling', wasel: true, blablacar: true, uber: false, careem: true },
    { feature: 'Package Delivery', wasel: true, blablacar: false, uber: true, careem: true },
    { feature: 'Medical Transport', wasel: true, blablacar: false, uber: true, careem: false },
    { feature: 'Women-only Rides', wasel: true, blablacar: true, uber: false, careem: false },
    { feature: 'Digital Wallet', wasel: true, blablacar: false, uber: true, careem: true },
    { feature: 'Social/Community Hub', wasel: true, blablacar: true, uber: false, careem: false },
    { feature: 'Gamification/Rewards', wasel: true, blablacar: false, uber: true, careem: true },
    { feature: 'AR Navigation', wasel: true, blablacar: false, uber: false, careem: false },
    { feature: 'Accessibility (100%)', wasel: true, blablacar: false, uber: true, careem: false },
  ];

  const radarData = [
    { subject: 'Price Affordability', A: 95, B: 85, C: 60, fullMark: 100 },
    { subject: 'User Experience', A: 98, B: 70, C: 85, fullMark: 100 },
    { subject: 'Feature Set', A: 90, B: 40, C: 80, fullMark: 100 },
    { subject: 'Trust & Safety', A: 92, B: 88, C: 85, fullMark: 100 },
    { subject: 'Local Relevance', A: 100, B: 20, C: 90, fullMark: 100 },
    { subject: 'Accessibility', A: 100, B: 60, C: 75, fullMark: 100 },
  ];

  const pricingData = [
    { name: 'Amman -> Zarqa', Wasel: 3.5, BlaBlaCar: 4.0, Bus: 1.5 },
    { name: 'Amman -> Irbid', Wasel: 6.0, BlaBlaCar: 7.5, Bus: 3.0 },
    { name: 'Amman -> Aqaba', Wasel: 18.0, BlaBlaCar: 22.0, Bus: 12.0 },
    { name: 'Queen Alia Airport', Wasel: 15.0, BlaBlaCar: 'N/A', Bus: 3.5 },
  ];

  return (
    <div className="p-6 space-y-8 max-w-[1800px] mx-auto bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <Crosshair className="w-8 h-8 text-[#008080]" />
            {language === 'ar' ? 'ذكاء المنافسين: وصل مقابل بلابلاكار' : 'Competitive Intelligence: Wasel vs BlaBlaCar'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Deep dive analysis of Wasel's strategic positioning against global giant BlaBlaCar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#008080] text-white px-3 py-1 text-sm">Wasel: Market Leader (Projected)</Badge>
        </div>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#008080] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Fit (MENA)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#008080]">98%</div>
            <p className="text-xs text-muted-foreground mt-1">vs BlaBlaCar 35%</p>
            <Progress value={98} className="h-1 mt-2 bg-teal-100" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Super App</div>
            <p className="text-xs text-muted-foreground mt-1">vs Single Vertical</p>
             <Progress value={100} className="h-1 mt-2 bg-blue-100" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">10-15%</div>
            <p className="text-xs text-muted-foreground mt-1">vs BlaBlaCar ~18-20%</p>
             <Progress value={75} className="h-1 mt-2 bg-purple-100" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accessibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground mt-1">Level 6 Compliance</p>
             <Progress value={100} className="h-1 mt-2 bg-green-100" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deep-dive" className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="deep-dive">⚔️ Deep Dive: Wasel vs BlaBlaCar</TabsTrigger>
          <TabsTrigger value="matrix">📊 Feature Matrix</TabsTrigger>
          <TabsTrigger value="pricing">💰 Pricing Analysis</TabsTrigger>
          <TabsTrigger value="tech">⚡ Tech & UX</TabsTrigger>
        </TabsList>

        {/* TAB 1: DEEP DIVE COMPARISON */}
        <TabsContent value="deep-dive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Wasel Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-t-[#008080] overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#008080]">Wasel (وصل)</h2>
                    <Badge variant="outline" className="mt-1 border-[#008080] text-[#008080]">The Challenger</Badge>
                  </div>
                  <Globe className="w-10 h-10 text-[#008080] opacity-20" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#008080]">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Super App Strategy</h4>
                      <p className="text-sm text-muted-foreground">Seamlessly integrates Ride-hailing, Carpooling, Delivery, and Payments in one ecosystem.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#008080]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Hyper-Local Focus</h4>
                      <p className="text-sm text-muted-foreground">Built specifically for Jordanian/MENA culture. Supports cash, local wallets (JoMoPay), and understands local addresses.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#008080]">
                      <Accessibility className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Inclusive by Design</h4>
                      <p className="text-sm text-muted-foreground">100% Accessibility Compliance. Dedicated Medical Transport. Safe rides for women.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-teal-50/50 dark:bg-teal-900/10 border-t border-teal-100 dark:border-teal-900/20">
                <div className="flex justify-between items-center text-sm font-medium">
                   <span>Brand Identity Score</span>
                   <span className="text-[#008080]">100/100</span>
                </div>
                <Progress value={100} className="h-1.5 mt-2 bg-teal-200" />
              </div>
            </motion.div>

            {/* BlaBlaCar Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-t-blue-500 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600">BlaBlaCar</h2>
                    <Badge variant="outline" className="mt-1 border-blue-500 text-blue-500">The Incumbent</Badge>
                  </div>
                  <Globe className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Niche Focus</h4>
                      <p className="text-sm text-muted-foreground">Primarily long-distance carpooling. Limited intra-city options. No delivery or payment ecosystem.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Global Generic</h4>
                      <p className="text-sm text-muted-foreground">One-size-fits-all approach. Lacks deep integration with local cultural nuances and payment systems.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Legacy Infrastructure</h4>
                      <p className="text-sm text-muted-foreground">Slower innovation cycle. Older tech stack compared to Wasel's modern React/Supabase architecture.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20">
                <div className="flex justify-between items-center text-sm font-medium">
                   <span>Local Market Adaptation</span>
                   <span className="text-blue-600">35/100</span>
                </div>
                <Progress value={35} className="h-1.5 mt-2 bg-blue-200" />
              </div>
            </motion.div>
          </div>

          {/* Radar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                 <CardTitle className="text-lg">Competitive Radar</CardTitle>
                 <CardDescription>Multi-dimensional analysis</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid gridType="polygon" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Wasel" dataKey="A" stroke="#008080" fill="#008080" fillOpacity={0.5} />
                      <Radar name="BlaBlaCar" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Why Wasel Wins in MENA</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#008080] shrink-0" />
                    <div>
                      <span className="font-semibold block">Integrated Ecosystem</span>
                      <span className="text-sm text-muted-foreground">Users don't just want a ride; they want to pay bills, send packages, and order food. Wasel creates a "sticky" ecosystem that BlaBlaCar cannot match.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#008080] shrink-0" />
                    <div>
                      <span className="font-semibold block">Trust & Social Validation</span>
                      <span className="text-sm text-muted-foreground">Wasel's "Ride Social" features, verified community badges, and family tracking address the specific trust deficits in the region.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#008080] shrink-0" />
                    <div>
                      <span className="font-semibold block">Agility & Tech</span>
                      <span className="text-sm text-muted-foreground">Built on a modern stack (React, Supabase, Edge Functions), Wasel iterates 4x faster than legacy competitors.</span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: FEATURE MATRIX */}
        <TabsContent value="matrix">
           <Card>
             <CardHeader>
               <CardTitle>Feature Parity Matrix</CardTitle>
               <CardDescription>Comparing key capabilities across major players</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="border-b border-gray-200 dark:border-gray-700">
                       <th className="text-left py-4 px-4">Feature</th>
                       <th className="text-center py-4 px-4 text-[#008080] font-bold bg-teal-50/50 dark:bg-teal-900/10">Wasel</th>
                       <th className="text-center py-4 px-4 text-blue-600">BlaBlaCar</th>
                       <th className="text-center py-4 px-4 text-black dark:text-gray-300">Uber</th>
                       <th className="text-center py-4 px-4 text-green-600">Careem</th>
                     </tr>
                   </thead>
                   <tbody>
                     {featureComparison.map((item, index) => (
                       <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                         <td className="py-3 px-4 font-medium">{item.feature}</td>
                         <td className="text-center py-3 px-4 bg-teal-50/30 dark:bg-teal-900/5">
                           {item.wasel ? <CheckCircle2 className="w-5 h-5 text-[#008080] mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                         </td>
                         <td className="text-center py-3 px-4">
                           {item.blablacar ? <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                         </td>
                         <td className="text-center py-3 px-4">
                           {item.uber ? <CheckCircle2 className="w-5 h-5 text-black dark:text-gray-300 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                         </td>
                         <td className="text-center py-3 px-4">
                           {item.careem ? <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* TAB 3: PRICING */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Price Comparison (JOD)</CardTitle>
                <CardDescription>Average cost per seat for popular routes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pricingData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend />
                    <Bar dataKey="Wasel" fill="#008080" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="BlaBlaCar" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="Bus" fill="#9ca3af" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
               <CardHeader>
                 <CardTitle>Pricing Strategy</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                       <TrendingDown className="w-5 h-5" />
                       Wasel Advantage
                    </h3>
                    <p className="text-sm mt-2 text-green-700 dark:text-green-400">
                       Wasel takes a lower commission (12%) compared to BlaBlaCar's global standard (~18%+), allowing us to be cheaper for riders while drivers earn more.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-muted-foreground">Booking Fee</span>
                       <div className="text-right">
                          <div className="font-bold text-[#008080]">0.50 JOD</div>
                          <div className="text-xs text-muted-foreground line-through">1.00 JOD (Competitor)</div>
                       </div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-muted-foreground">Cancellation Policy</span>
                       <div className="text-right">
                          <div className="font-bold text-[#008080]">Flexible</div>
                          <div className="text-xs text-muted-foreground">Full refund 24h prior</div>
                       </div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-muted-foreground">Dynamic Pricing</span>
                       <div className="text-right">
                          <div className="font-bold text-[#008080]">Capped</div>
                          <div className="text-xs text-muted-foreground">Prevents price gouging</div>
                       </div>
                    </div>
                 </div>
               </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: TECH */}
        <TabsContent value="tech">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Zap className="text-yellow-500" />
                       Performance
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between mb-1">
                             <span className="text-sm font-medium">App Load Time</span>
                             <span className="text-sm font-bold text-green-600">0.8s</span>
                          </div>
                          <Progress value={95} className="h-2 bg-green-100" />
                       </div>
                       <div>
                          <div className="flex justify-between mb-1">
                             <span className="text-sm font-medium">Real-time Sync</span>
                             <span className="text-sm font-bold text-green-600">~50ms</span>
                          </div>
                          <Progress value={98} className="h-2 bg-green-100" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Shield className="text-[#008080]" />
                       Reliability
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm">99.9% Uptime SLA</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm">Edge Network Distribution</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm">Offline Mode Support</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Users className="text-purple-500" />
                       Accessibility
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-center py-4">
                       <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                       <p className="text-sm text-muted-foreground">WCAG 2.1 AA Compliant</p>
                       <p className="text-xs text-muted-foreground mt-2">BlaBlaCar: Standard (~80%)</p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}