import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { HRIntegration, DeductionTransaction, EmployeeProfile } from '../../utils/enterprise/HRIntegrationService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, Building, Wallet, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#6366f1', '#10b981']; // Indigo (Employee), Emerald (Subsidy)

interface PayrollDashboardProps {
  employeeId: string;
}

export function PayrollDeductionDashboard({ employeeId }: PayrollDashboardProps) {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [transactions, setTransactions] = useState<DeductionTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from the secure HR link
    setTimeout(() => {
      const emp = HRIntegration.getEmployeeProfile(employeeId);
      const txs = HRIntegration.getMonthlyStatement(employeeId);
      if (emp) setProfile(emp);
      setTransactions(txs);
      setLoading(false);
    }, 800);
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
        <Building className="w-6 h-6 mr-2" /> Connecting to SAP SuccessFactors...
      </div>
    );
  }

  if (!profile) return <div className="text-red-400">Employee record not found. Please contact HR.</div>;

  const totalSpent = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const employeeShareTotal = transactions.reduce((acc, t) => acc + t.employeeShare, 0);
  const subsidyTotal = transactions.reduce((acc, t) => acc + t.companySubsidy, 0);

  const pieData = [
    { name: 'Your Contribution', value: employeeShareTotal },
    { name: 'Company Subsidy', value: subsidyTotal },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-400" />
            Corporate Commute
          </h2>
          <p className="text-slate-400 text-sm">Linked to: {profile.department} (ID: {profile.employeeId})</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-300">
          <Download className="w-4 h-4" /> Export Statement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">Monthly Allowance</p>
                <h3 className="text-2xl font-bold text-white mt-2">{profile.monthlyBudget} JOD</h3>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(profile.currentSpend / profile.monthlyBudget) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {((profile.currentSpend / profile.monthlyBudget) * 100).toFixed(0)}% used this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">Payroll Deduction</p>
                <h3 className="text-2xl font-bold text-indigo-400 mt-2">-{employeeShareTotal.toFixed(2)} JOD</h3>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Will be deducted from next salary cycle</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 h-full flex items-center justify-between">
            <div className="w-1/2">
              <p className="text-slate-400 text-sm font-medium mb-1">Cost Split</p>
              <div className="space-y-2">
                <div className="flex items-center text-xs text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                  You: {((employeeShareTotal / totalSpent) * 100 || 0).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  Co: {((subsidyTotal / totalSpent) * 100 || 0).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="w-1/2 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Commutes</CardTitle>
          <CardDescription className="text-slate-400">Processed through HR SAP Integration</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No rides this month yet.</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Commute to Office</p>
                      <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{tx.totalAmount.toFixed(2)} JOD</p>
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <span className="text-indigo-400">You: {tx.employeeShare.toFixed(2)}</span>
                      <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        -{tx.companySubsidy.toFixed(2)} Sub
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-amber-500">Payroll Sync Status</h4>
          <p className="text-xs text-amber-500/80 mt-1">
            Your next payroll deduction is scheduled for 25th of this month. All rides taken after the 20th will appear in next month's statement.
          </p>
        </div>
      </div>
    </div>
  );
}
