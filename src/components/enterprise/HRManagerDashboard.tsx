import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../ui/table';
import { 
  Building2, 
  Users, 
  Wallet, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText 
} from 'lucide-react';
import { HRIntegration, DeductionTransaction } from '../../utils/enterprise/HRIntegrationService';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface CompanyInvoice {
  id: string;
  month: string;
  totalTrips: number;
  totalAmount: number;
  companySubsidyTotal: number;
  employeeShareTotal: number;
  status: 'pending' | 'approved' | 'paid';
  erpReferenceId?: string;
}

export function HRManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'invoices'>('overview');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([]);
  
  // Mock data
  const companyName = "Tech Jordan Inc.";
  const totalEmployees = 145;
  const activeRiders = 82;

  useEffect(() => {
    // Simulate fetching aggregate data
    setTimeout(() => {
      setInvoices([
        {
          id: 'inv_2023_10',
          month: 'October 2023',
          totalTrips: 1250,
          totalAmount: 4500.00,
          companySubsidyTotal: 1800.00,
          employeeShareTotal: 2700.00,
          status: 'paid',
          erpReferenceId: 'SAP_INV_9921'
        },
        {
          id: 'inv_2023_11',
          month: 'November 2023',
          totalTrips: 1320,
          totalAmount: 4850.00,
          companySubsidyTotal: 1940.00,
          employeeShareTotal: 2910.00,
          status: 'pending'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleApproveInvoice = (id: string) => {
    toast.success('Invoice Approved', {
      description: `Invoice ${id} has been sent to Finance for processing.`
    });
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'approved', erpReferenceId: `SAP_INV_${Date.now()}` } : inv
    ));
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-500" />
            {companyName} <span className="text-slate-400 font-normal text-lg">| HR Portal</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Manage employee transport benefits and reconcile monthly invoices.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
             <FileText className="w-4 h-4" /> Policy Settings
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
             <Users className="w-4 h-4" /> Manage Roster
           </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm font-medium">Total Active Riders</p>
            <h3 className="text-3xl font-bold text-white mt-2">{activeRiders}</h3>
            <p className="text-xs text-emerald-400 mt-1">56% of workforce</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm font-medium">Total Commutes (Nov)</p>
            <h3 className="text-3xl font-bold text-white mt-2">1,320</h3>
            <p className="text-xs text-emerald-400 mt-1">+5.4% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm font-medium">Projected Subsidy</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-2">1,940 JOD</h3>
            <p className="text-xs text-slate-500 mt-1">Pending approval</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
             <p className="text-slate-400 text-sm font-medium">Carbon Saved</p>
             <h3 className="text-3xl font-bold text-green-500 mt-2">4.2 Tons</h3>
             <p className="text-xs text-slate-500 mt-1">Equivalent to 210 trees</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management Section */}
      <Card className="border-slate-800 bg-slate-950">
        <CardHeader>
          <CardTitle>Monthly Billing & Reconciliation</CardTitle>
          <CardDescription>
            Review and approve monthly transport invoices before they are sent to Finance/SAP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Invoice Month</TableHead>
                <TableHead className="text-slate-400">Total Rides</TableHead>
                <TableHead className="text-slate-400">Total Cost</TableHead>
                <TableHead className="text-slate-400 text-emerald-500">Company Share</TableHead>
                <TableHead className="text-slate-400 text-indigo-400">Employee Share</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="border-slate-800 hover:bg-slate-900/50">
                  <TableCell className="font-medium text-white">{inv.month}</TableCell>
                  <TableCell className="text-slate-300">{inv.totalTrips}</TableCell>
                  <TableCell className="text-slate-300">{inv.totalAmount.toFixed(2)} JOD</TableCell>
                  <TableCell className="text-emerald-400 font-bold">-{inv.companySubsidyTotal.toFixed(2)} JOD</TableCell>
                  <TableCell className="text-indigo-400">-{inv.employeeShareTotal.toFixed(2)} JOD</TableCell>
                  <TableCell>
                    {inv.status === 'paid' && (
                      <Badge className="bg-green-900 text-green-300 hover:bg-green-900 border-green-700">Paid</Badge>
                    )}
                    {inv.status === 'approved' && (
                      <Badge className="bg-blue-900 text-blue-300 hover:bg-blue-900 border-blue-700">Processing</Badge>
                    )}
                    {inv.status === 'pending' && (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500 hover:bg-yellow-950">Action Req</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {inv.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApproveInvoice(inv.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 items-center">
                        <span className="text-xs text-slate-500 font-mono">{inv.erpReferenceId}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Roster Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
             <CardTitle className="text-lg">Top Commuters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      EMP
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Employee #{1000 + i}</p>
                      <p className="text-xs text-slate-500">Engineering</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">42 Rides</p>
                    <p className="text-xs text-emerald-400">Saved 120kg CO2</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
             <CardTitle className="text-lg">Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
               <div className="flex gap-3 p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                 <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                 <div>
                   <h4 className="text-sm font-medium text-red-400">Budget Exceeded</h4>
                   <p className="text-xs text-slate-400 mt-1">3 employees have attempted to book rides exceeding their monthly allowance.</p>
                 </div>
               </div>
               <div className="flex gap-3 p-3 bg-yellow-950/20 border border-yellow-900/50 rounded-lg">
                 <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                 <div>
                   <h4 className="text-sm font-medium text-yellow-400">Late Invoice Approval</h4>
                   <p className="text-xs text-slate-400 mt-1">November invoice is pending approval. Auto-processing in 2 days.</p>
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
