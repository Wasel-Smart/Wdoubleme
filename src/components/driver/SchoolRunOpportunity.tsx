import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Car, 
  Users, 
  MapPin, 
  Calculator, 
  CheckCircle2, 
  ArrowRight,
  School,
  TrendingUp,
  Banknote,
  Clock
} from 'lucide-react';
import { Progress } from '../ui/progress';

export function SchoolRunOpportunity() {
  // State for calculator
  const [loanAmount, setLoanAmount] = useState(220);
  const [studentCount, setStudentCount] = useState(3);
  const [feePerStudent, setFeePerStudent] = useState(80); // Market rate assumption
  const [distance, setDistance] = useState(15); // Daily km

  // Calculations
  const monthlyIncome = studentCount * feePerStudent;
  const loanCoverage = (monthlyIncome / loanAmount) * 100;
  const netProfit = monthlyIncome - loanAmount;
  const annualBenefit = monthlyIncome * 9; // 9 months of school

  // Message based on coverage
  const getCoverageMessage = () => {
    if (loanCoverage >= 100) return "Car Loan Fully Covered! 🚗✅";
    if (loanCoverage >= 80) return "Almost Covered! 👌";
    return "Great Contribution to Loan";
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Strategic Growth
            </Badge>
            <Badge variant="outline" className="border-white/20 text-white/70">
              Asset-Light Model
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Let Your School Run Pay Your Car Loan
          </CardTitle>
          <CardDescription className="text-slate-400 text-lg max-w-2xl">
            Dedicate 90 minutes a day to a fixed school route. Cover your monthly bank payment. 
            Everything else you earn is pure profit.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="h-full border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                Profitability Calculator
              </CardTitle>
              <CardDescription>
                Adjust the values to match your situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Loan Amount Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Banknote className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Monthly Car Loan Payment</label>
                      <p className="text-xs text-muted-foreground">Your fixed bank obligation</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {loanAmount} JOD
                  </span>
                </div>
                <Slider
                  defaultValue={[loanAmount]}
                  min={100}
                  max={500}
                  step={10}
                  onValueChange={(val) => setLoanAmount(val[0])}
                  className="py-2"
                />
              </div>

              <Separator />

              {/* Student Count Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Number of Students</label>
                      <p className="text-xs text-muted-foreground">Siblings or neighbors (Max 4)</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {studentCount} Students
                  </span>
                </div>
                <Slider
                  defaultValue={[studentCount]}
                  min={1}
                  max={4}
                  step={1}
                  onValueChange={(val) => setStudentCount(val[0])}
                  className="py-2"
                />
              </div>

              <Separator />

              {/* Fee Per Student Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Monthly Fee Per Student</label>
                      <p className="text-xs text-muted-foreground">Based on distance & market rate</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {feePerStudent} JOD
                  </span>
                </div>
                <Slider
                  defaultValue={[feePerStudent]}
                  min={50}
                  max={150}
                  step={5}
                  onValueChange={(val) => setFeePerStudent(val[0])}
                  className="py-2"
                />
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-950 text-white border-slate-800 shadow-xl h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-emerald-400">Projected Outcome</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Monthly Income from School Run</p>
                <div className="text-5xl font-black text-white mb-2">
                  {monthlyIncome} <span className="text-xl font-medium text-slate-500">JOD</span>
                </div>
                <Badge variant={loanCoverage >= 100 ? "default" : "secondary"} className={loanCoverage >= 100 ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                  {getCoverageMessage()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Loan Payment Deduction</span>
                  <span className="text-red-400 font-medium">-{loanAmount} JOD</span>
                </div>
                <Separator className="bg-slate-800" />
                <div className="flex justify-between items-end">
                  <span className="text-slate-400">Net Profit (School Run Only)</span>
                  <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {netProfit > 0 ? '+' : ''}{netProfit} JOD
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  *Fuel and maintenance costs vary. This calculation focuses on covering your fixed asset cost.
                </p>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-900/50 p-6 border-t border-slate-800">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-semibold shadow-lg shadow-emerald-900/20">
                Find School Routes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Why It Works Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Only 90 Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Just one trip in the morning (7:00 AM) and one in the afternoon (2:30 PM). Your entire day is free for other work.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Guaranteed Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Parents pay monthly upfront. No chasing fares, no cancellations, no waiting for ride requests.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-lg">Zero Customer Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We match you with students in your neighborhood. You don't need to find passengers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

