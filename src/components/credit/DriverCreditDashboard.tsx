import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, TrendingUp, CreditCard, Calculator, 
  FileText, CheckCircle2, Clock, AlertCircle, Award,
  Car, Home, Smartphone, Briefcase, PiggyBank, Calendar,
  Shield, Target, Zap, Users, ArrowRight, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoanProduct {
  id: string;
  name: string;
  nameAr: string;
  icon: any;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  term: string;
  termAr: string;
  color: string;
  popular?: boolean;
}

interface CreditApplication {
  id: string;
  type: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
  monthlyPayment: number;
}

export function DriverCreditDashboard() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [loanAmount, setLoanAmount] = useState([25000]);
  const [loanTerm, setLoanTerm] = useState([24]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const creditScore = {
    score: 785,
    max: 850,
    rating: 'Excellent',
    ratingAr: 'ممتاز',
    change: '+15',
    factors: [
      { name: 'Trip History', nameAr: 'سجل الرحلات', score: 95, color: 'bg-green-500' },
      { name: 'Payment Record', nameAr: 'سجل الدفع', score: 88, color: 'bg-blue-500' },
      { name: 'Account Age', nameAr: 'عمر الحساب', score: 75, color: 'bg-purple-500' },
      { name: 'Income Stability', nameAr: 'استقرار الدخل', score: 92, color: 'bg-orange-500' }
    ]
  };

  const financialStats = {
    availableCredit: 50000,
    usedCredit: 15000,
    monthlyIncome: 12500,
    totalLoans: 2,
    onTimePayments: 24,
    missedPayments: 0
  };

  const loanProducts: LoanProduct[] = [
    {
      id: '1',
      name: 'Vehicle Financing',
      nameAr: 'تمويل المركبات',
      icon: Car,
      minAmount: 20000,
      maxAmount: 150000,
      interestRate: 4.5,
      term: '12-60 months',
      termAr: '12-60 شهر',
      color: 'from-blue-500 to-cyan-600',
      popular: true
    },
    {
      id: '2',
      name: 'Quick Cash Loan',
      nameAr: 'قرض نقدي سريع',
      icon: Zap,
      minAmount: 500,
      maxAmount: 5000,
      interestRate: 2.0,
      term: '1-6 months',
      termAr: '1-6 أشهر',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: '3',
      name: 'Business Expansion',
      nameAr: 'توسيع الأعمال',
      icon: Briefcase,
      minAmount: 10000,
      maxAmount: 100000,
      interestRate: 5.5,
      term: '24-48 months',
      termAr: '24-48 شهر',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: '4',
      name: 'Emergency Fund',
      nameAr: 'صندوق الطوارئ',
      icon: Shield,
      minAmount: 1000,
      maxAmount: 10000,
      interestRate: 1.5,
      term: '3-12 months',
      termAr: '3-12 شهر',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: '5',
      name: 'Home Improvement',
      nameAr: 'تحسين المنزل',
      icon: Home,
      minAmount: 5000,
      maxAmount: 50000,
      interestRate: 4.0,
      term: '12-36 months',
      termAr: '12-36 شهر',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      id: '6',
      name: 'Electronics Purchase',
      nameAr: 'شراء الإلكترونيات',
      icon: Smartphone,
      minAmount: 2000,
      maxAmount: 15000,
      interestRate: 3.0,
      term: '6-24 months',
      termAr: '6-24 شهر',
      color: 'from-cyan-500 to-teal-600'
    }
  ];

  const applications: CreditApplication[] = [
    {
      id: '1',
      type: 'Vehicle Financing',
      amount: 45000,
      status: 'approved',
      date: '2026-01-15',
      monthlyPayment: 1250
    },
    {
      id: '2',
      type: 'Quick Cash Loan',
      amount: 3000,
      status: 'pending',
      date: '2026-02-01',
      monthlyPayment: 520
    }
  ];

  const calculateMonthlyPayment = () => {
    const amount = loanAmount[0];
    const months = loanTerm[0];
    const rate = 0.045 / 12; // 4.5% annual rate
    const payment = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return payment;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900 dark:to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {isRTL ? 'لوحة معلومات الائتمان' : 'Credit & Lending Dashboard'}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'الوصول إلى التمويل الفوري، قروض السيارات، وخيارات الائتمان المرنة للسائقين'
              : 'Access instant financing, vehicle loans, and flexible credit options for drivers'}
          </p>
        </motion.div>

        {/* Credit Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-emerald-100 mb-2">{isRTL ? 'درجة الائتمان الخاصة بك' : 'Your Credit Score'}</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-bold">{creditScore.score}</span>
                      <span className="text-2xl text-emerald-100">/ {creditScore.max}</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 mt-2">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {creditScore.change} {isRTL ? 'هذا الشهر' : 'this month'}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">{isRTL ? creditScore.ratingAr : creditScore.rating}</span>
                    </div>
                    <p className="text-sm text-emerald-100">
                      {isRTL 
                        ? 'درجة ائتمان ممتازة! أنت مؤهل للحصول على أفضل الأسعار.'
                        : 'Excellent credit score! You qualify for the best rates.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold mb-3">{isRTL ? 'عوامل الدرجة' : 'Score Factors'}</p>
                  {creditScore.factors.map((factor, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{isRTL ? factor.nameAr : factor.name}</span>
                        <span className="font-semibold">{factor.score}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${factor.color}`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{isRTL ? 'الائتمان المتاح' : 'Available Credit'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  SAR {(financialStats.availableCredit - financialStats.usedCredit).toLocaleString()}
                </div>
                <Progress 
                  value={((financialStats.availableCredit - financialStats.usedCredit) / financialStats.availableCredit) * 100} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL ? 'من' : 'of'} SAR {financialStats.availableCredit.toLocaleString()} {isRTL ? 'إجمالي الحد' : 'total limit'}
                </p>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{isRTL ? 'الدخل الشهري' : 'Monthly Income'}</span>
                  <span className="font-semibold">SAR {financialStats.monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{isRTL ? 'الدفعات في الوقت المحدد' : 'On-Time Payments'}</span>
                  <Badge className="bg-green-100 text-green-700">
                    {financialStats.onTimePayments}/24
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              {isRTL ? 'حاسبة القروض' : 'Loan Calculator'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-3 block">
                    {isRTL ? 'مبلغ القرض' : 'Loan Amount'}
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-emerald-600">
                      SAR {loanAmount[0].toLocaleString()}
                    </span>
                  </div>
                  <Slider 
                    value={loanAmount} 
                    onValueChange={setLoanAmount}
                    min={1000}
                    max={150000}
                    step={1000}
                    className="mt-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>SAR 1,000</span>
                    <span>SAR 150,000</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-3 block">
                    {isRTL ? 'مدة القرض (أشهر)' : 'Loan Term (Months)'}
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-teal-600">
                      {loanTerm[0]}
                    </span>
                    <span className="text-muted-foreground">{isRTL ? 'أشهر' : 'months'}</span>
                  </div>
                  <Slider 
                    value={loanTerm} 
                    onValueChange={setLoanTerm}
                    min={6}
                    max={60}
                    step={6}
                    className="mt-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>6 {isRTL ? 'أشهر' : 'months'}</span>
                    <span>60 {isRTL ? 'شهر' : 'months'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-semibold mb-4">{isRTL ? 'ملخص الدفع' : 'Payment Summary'}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
                    <span className="text-muted-foreground">{isRTL ? 'الدفعة الشهرية' : 'Monthly Payment'}</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      SAR {Math.round(calculateMonthlyPayment()).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المبلغ' : 'Total Amount'}</span>
                    <span className="font-semibold">SAR {loanAmount[0].toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{isRTL ? 'مدة القرض' : 'Loan Term'}</span>
                    <span className="font-semibold">{loanTerm[0]} {isRTL ? 'شهر' : 'months'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{isRTL ? 'سعر الفائدة' : 'Interest Rate'}</span>
                    <span className="font-semibold">4.5% {isRTL ? 'سنوياً' : 'APR'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-emerald-200 dark:border-emerald-800">
                    <span className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الدفع' : 'Total Payment'}</span>
                    <span className="font-bold text-lg">
                      SAR {Math.round(calculateMonthlyPayment() * loanTerm[0]).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  {isRTL ? 'تقديم طلب' : 'Apply Now'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{isRTL ? 'منتجات القروض' : 'Loan Products'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loanProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedProduct === product.id ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${product.color} rounded-xl`}>
                        <product.icon className="w-6 h-6 text-white" />
                      </div>
                      {product.popular && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                          {isRTL ? 'شائع' : 'Popular'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {isRTL ? product.nameAr : product.name}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center justify-between">
                        <span>{isRTL ? 'المبلغ' : 'Amount'}</span>
                        <span className="font-semibold text-foreground">
                          SAR {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{isRTL ? 'الفائدة' : 'Rate'}</span>
                        <span className="font-semibold text-emerald-600">{product.interestRate}% APR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{isRTL ? 'المدة' : 'Term'}</span>
                        <span className="font-semibold text-foreground">
                          {isRTL ? product.termAr : product.term}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      {isRTL ? 'تفاصيل' : 'Learn More'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Applications History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              {isRTL ? 'سجل الطلبات' : 'Application History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{app.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        SAR {app.amount.toLocaleString()} • {app.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getStatusColor(app.status)}>
                      {app.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {app.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {app.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                    {app.status === 'approved' && (
                      <p className="text-sm text-muted-foreground">
                        SAR {app.monthlyPayment}/mo
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">{isRTL ? 'معلومات مهمة' : 'Important Information'}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {isRTL ? 'معدلات الفائدة بناءً على درجة الائتمان الخاصة بك وتاريخ الدفع' : 'Interest rates based on your credit score and payment history'}</li>
                  <li>• {isRTL ? 'الموافقة الفورية للقروض حتى 50,000 ريال' : 'Instant approval for loans up to SAR 50,000'}</li>
                  <li>• {isRTL ? 'لا توجد رسوم مخفية أو غرامات الدفع المبكر' : 'No hidden fees or early payment penalties'}</li>
                  <li>• {isRTL ? 'التحويل المباشر إلى حسابك المصرفي خلال 24 ساعة' : 'Direct transfer to your bank account within 24 hours'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
