import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { HRIntegration, DeductionTransaction } from '../../utils/enterprise/HRIntegrationService';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  month: string;
  totalAmount: number;
  status: 'pending' | 'paid';
  rideCount: number;
  subsidyTotal: number;
  dueDate: string;
}

export function EnterpriseAdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 142,
    activeRiders: 89,
    totalCommutes: 1250,
    carbonSaved: 4500 // kg
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2023-10',
      month: 'October 2023',
      totalAmount: 4250.00,
      status: 'pending',
      rideCount: 450,
      subsidyTotal: 1200.00, // The company's subsidy portion
      dueDate: '2023-11-05'
    },
    {
      id: 'INV-2023-09',
      month: 'September 2023',
      totalAmount: 3890.50,
      status: 'paid',
      rideCount: 410,
      subsidyTotal: 1050.00,
      dueDate: '2023-10-05'
    }
  ]);

  const handleApproveInvoice = (id: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Processing payment via bank transfer...',
        success: () => {
          setInvoices(prev => prev.map(inv => 
            inv.id === id ? { ...inv, status: 'paid' } : inv
          ));
          return 'Invoice approved! Payment initiated.';
        },
        error: 'Payment failed'
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            HR Admin Portal
          </h2>
          <p className="text-muted-foreground">Manage corporate commute program and billing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Reports
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" /> Manage Employees
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                <h3 className="text-2xl font-bold">{stats.activeRiders} / {stats.totalEmployees}</h3>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 flex items-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commutes</p>
                <h3 className="text-2xl font-bold">{stats.totalCommutes}</h3>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg. 24 mins/ride
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CO₂ Saved</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.carbonSaved} kg</h3>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Equivalent to 200 trees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subsidy Spend</p>
                <h3 className="text-2xl font-bold text-indigo-600">
                  {invoices.reduce((acc, i) => acc + (i.status === 'paid' ? i.subsidyTotal : 0), 0).toFixed(0)} JOD
                </h3>
              </div>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Year to Date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Invoices</CardTitle>
          <CardDescription>Review and approve monthly transportation invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <motion.div 
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{invoice.month} Invoice</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Ref: {invoice.id}</span>
                      <span>•</span>
                      <span>{invoice.rideCount} Rides</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-lg">{invoice.totalAmount.toFixed(2)} JOD</p>
                    <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                  </div>

                  {invoice.status === 'pending' ? (
                    <Button 
                      onClick={() => handleApproveInvoice(invoice.id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Approve Payment
                    </Button>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
        <div>
          <h4 className="font-medium text-amber-800 dark:text-amber-400">Payroll Sync Scheduled</h4>
          <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">
            The next automated sync with SAP SuccessFactors is scheduled for Oct 25th at 02:00 AM. 
            Ensure all employee budget adjustments are finalized before then.
          </p>
        </div>
      </div>
    </div>
  );
}
