/**
 * Payment Gateways - Middle East & International
 * Comprehensive payment options including CliQ, Mada, and premium subscriptions
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  Globe,
  Crown,
  Check,
  Plus,
  Star,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

// Payment Gateway Options for Middle East
const paymentGateways = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '💳',
    region: 'International',
    methods: ['Visa', 'Mastercard', 'Amex'],
    features: ['Instant processing', '3D Secure', 'Refunds'],
    popular: true
  },
  {
    id: 'mada',
    name: 'Mada',
    logo: '🇸🇦',
    region: 'Saudi Arabia',
    methods: ['Mada Cards'],
    features: ['Saudi standard', 'Fast approval'],
    popular: true
  },
  {
    id: 'cliq',
    name: 'CliQ',
    logo: '⚡',
    region: 'Jordan',
    methods: ['Instant bank transfer'],
    features: ['Real-time', 'No fees', 'Bank account'],
    popular: true
  },
  {
    id: 'paytabs',
    name: 'PayTabs',
    logo: '💰',
    region: 'Middle East',
    methods: ['Cards', 'Apple Pay', 'STC Pay'],
    features: ['Local processing', 'Multi-currency']
  },
  {
    id: 'checkout',
    name: 'Checkout.com',
    logo: '✓',
    region: 'International',
    methods: ['Cards', 'Digital wallets'],
    features: ['Low fees', 'Fast settlement']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'P',
    region: 'International',
    methods: ['PayPal balance', 'Cards'],
    features: ['Buyer protection', 'Wide acceptance']
  },
  {
    id: 'telr',
    name: 'Telr',
    logo: '🏦',
    region: 'UAE',
    methods: ['Cards', 'Apple Pay', 'Google Pay'],
    features: ['UAE focused', 'Multi-currency']
  },
  {
    id: 'amazon-payments',
    name: 'Amazon Payment Services',
    logo: '📦',
    region: 'Middle East',
    methods: ['Cards', 'Installments', 'KNET'],
    features: ['Formerly PAYFORT', 'Installments']
  },
  {
    id: 'fawry',
    name: 'Fawry',
    logo: '🇪🇬',
    region: 'Egypt',
    methods: ['Cash', 'Cards', 'Wallets'],
    features: ['Cash payments', 'Egypt leader']
  },
  {
    id: 'tap',
    name: 'Tap Payments',
    logo: '👆',
    region: 'Middle East',
    methods: ['Cards', 'Apple Pay', 'Benefit'],
    features: ['MENA focused', 'Multi-currency']
  },
  {
    id: 'hyperpay',
    name: 'HyperPay',
    logo: '⚡',
    region: 'Middle East',
    methods: ['Cards', 'STC Pay', 'Mada'],
    features: ['Regional leader', 'Multiple options']
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    logo: '',
    region: 'International',
    methods: ['Apple Wallet'],
    features: ['One-tap', 'Secure', 'Fast']
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    logo: 'G',
    region: 'International',
    methods: ['Google Wallet'],
    features: ['Android', 'Quick pay']
  },
  {
    id: 'stc-pay',
    name: 'STC Pay',
    logo: '📱',
    region: 'Saudi Arabia',
    methods: ['Mobile wallet'],
    features: ['Popular in KSA', 'Instant']
  },
  {
    id: 'knet',
    name: 'KNET',
    logo: '🇰🇼',
    region: 'Kuwait',
    methods: ['Bank cards'],
    features: ['Kuwait standard', 'Secure']
  },
  {
    id: 'benefit',
    name: 'Benefit',
    logo: '🇧🇭',
    region: 'Bahrain',
    methods: ['Debit cards'],
    features: ['Bahrain standard', 'Reliable']
  }
];

// Premium Subscription Plans
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Basic features for casual users',
    features: [
      'Basic ride sharing',
      'Standard support',
      '5% transaction fee',
      'Basic safety features',
      'Standard search'
    ],
    limits: '5 rides per month',
    popular: false
  },
  {
    id: 'premium',
    name: 'Wasel Premium',
    price: 9.990,
    period: 'month',
    description: 'Enhanced features for regular users',
    features: [
      'All Free features',
      'Priority support 24/7',
      '2% transaction fee',
      'Advanced safety features',
      'Priority booking',
      'Ride scheduling',
      'Cancellation protection',
      'Premium badge'
    ],
    limits: 'Unlimited rides',
    popular: true,
    savings: 'Save 24 JOD yearly'
  },
  {
    id: 'vip',
    name: 'Wasel VIP',
    price: 19.990,
    period: 'month',
    description: 'Ultimate experience for power users',
    features: [
      'All Premium features',
      'VIP concierge service',
      'No transaction fees',
      'Luxury vehicle access',
      'Insurance included',
      'Airport lounge access',
      'Personal account manager',
      'Exclusive events',
      'VIP badge with priority'
    ],
    limits: 'Unlimited everything',
    popular: false,
    savings: 'Save 48 JOD yearly'
  }
];

export function PaymentGateways() {
  const { t, language } = useLanguage();
  const [selectedGateway, setSelectedGateway] = useState<string>('stripe');
  const [showCliqDialog, setShowCliqDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [cliqAlias, setCliqAlias] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleCliqPayment = async () => {
    if (!cliqAlias) {
      toast.error(language === 'ar' ? 'حط اسمك المستعار في CliQ' : 'Please enter your CliQ alias');
      return;
    }

    setLoading(true);
    try {
      // Simulate CliQ payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(language === 'ar' ? 'تم بدء الدفع عبر CliQ! تحقق من تطبيقك البنكي للموافقة.' : 'CliQ payment initiated! Check your banking app to approve.');
      setShowCliqDialog(false);
      setCliqAlias('');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل بدء الدفع عبر CliQ' : 'Failed to initiate CliQ payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(true);
    try {
      // Simulate subscription purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(language === 'ar' ? `تم الاشتراك في خطة ${plan.name} بنجاح!` : `Successfully subscribed to ${plan.name} plan!`);
      setShowSubscriptionDialog(false);
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل معالجة الاشتراك' : 'Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <Badge className="mb-4 text-lg px-4 py-2">
            <Globe className="w-4 h-4 mr-2" />
            Global & Regional Payment Solutions
          </Badge>
        </motion.div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Payment Methods
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose from international and regional payment gateways trusted across the Middle East
        </p>
      </div>

      {/* Premium Subscription Section */}
      <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950 border-2 border-amber-300 dark:border-amber-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-500" />
              <div>
                <CardTitle className="text-2xl">Premium Subscriptions</CardTitle>
                <CardDescription>Unlock exclusive features and benefits</CardDescription>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={() => setShowSubscriptionDialog(true)}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 rounded-xl border-2 backdrop-blur-sm ${
                  plan.popular
                    ? 'bg-white/80 dark:bg-gray-900/80 border-primary shadow-lg'
                    : 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-purple-500 px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {plan.savings}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    if (plan.id !== 'free') setShowSubscriptionDialog(true);
                  }}
                  disabled={plan.id === 'free'}
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Select Plan'}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateways Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Payment Methods</h2>
          <Badge variant="outline">
            {paymentGateways.length} Options
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentGateways.map((gateway) => (
            <motion.div
              key={gateway.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedGateway === gateway.id
                    ? 'border-2 border-primary shadow-lg'
                    : 'hover:border-primary/50'
                } ${gateway.popular ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950' : ''}`}
                onClick={() => setSelectedGateway(gateway.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-2xl border">
                        {gateway.logo}
                      </div>
                      <div>
                        <h3 className="font-bold">{gateway.name}</h3>
                        <p className="text-xs text-muted-foreground">{gateway.region}</p>
                      </div>
                    </div>
                    {gateway.popular && (
                      <Badge variant="default" className="text-xs">
                        <Star className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Methods:</p>
                      <div className="flex flex-wrap gap-1">
                        {gateway.methods.map((method, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Features:</p>
                      <ul className="space-y-1">
                        {gateway.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1 text-xs">
                            <Check className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {gateway.id === 'cliq' && (
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCliqDialog(true);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Pay with CliQ
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security Features */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-300 dark:border-green-700">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">Secure Payment Processing</h3>
              <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  PCI DSS Level 1 Compliant
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  256-bit SSL Encryption
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  3D Secure Authentication
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Fraud Detection AI
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Instant Refund Processing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Multi-currency Support
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CliQ Payment Dialog */}
      <Dialog open={showCliqDialog} onOpenChange={setShowCliqDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Pay with CliQ
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Instant Bank Transfer
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    CliQ enables real-time payments between bank accounts in Jordan. 
                    Enter your CliQ alias (mobile number, email, or national ID).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliq-alias">CliQ Alias</Label>
              <Input
                id="cliq-alias"
                placeholder="Mobile number, email, or national ID"
                value={cliqAlias}
                onChange={(e) => setCliqAlias(e.target.value)}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
              <p className="text-xs text-muted-foreground">
                Example: +962791234567 or email@example.com
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Amount:</span>
                <span className="font-bold text-lg">50.00 JOD</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCliqDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCliqPayment} disabled={loading}>
              {loading ? 'Processing...' : 'Send Payment Request'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              Choose Your Premium Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 p-3 bg-muted rounded-lg">
              <span className={billingCycle === 'monthly' ? 'font-bold' : 'text-muted-foreground'}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <span className={billingCycle === 'yearly' ? 'font-bold' : 'text-muted-foreground'}>
                Yearly (Save 20%)
              </span>
            </div>

            {/* Plan Selection */}
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              {subscriptionPlans.filter(p => p.id !== 'free').map((plan) => (
                <Label
                  key={plan.id}
                  htmlFor={plan.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{plan.name}</span>
                      {plan.popular && (
                        <Badge className="bg-gradient-to-r from-primary to-purple-500">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl">
                      ${billingCycle === 'yearly' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            {/* Selected Plan Features */}
            {selectedPlan && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">What's included:</h4>
                <div className="grid gap-2">
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup defaultValue="stripe">
                <Label
                  htmlFor="stripe-sub"
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
                >
                  <RadioGroupItem value="stripe" id="stripe-sub" />
                  <CreditCard className="w-5 h-5" />
                  <span>Credit/Debit Card</span>
                </Label>
                <Label
                  htmlFor="cliq-sub"
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
                >
                  <RadioGroupItem value="cliq" id="cliq-sub" />
                  <Zap className="w-5 h-5" />
                  <span>CliQ (Jordan)</span>
                </Label>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
              <Crown className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}