/**
 * Payment Method List
 * 
 * Comprehensive payment management including:
 * - Credit/Debit Cards (Stripe)
 * - Digital Wallets (Apple Pay, Google Pay)
 * - BNPL: Tabby (4 interest-free payments)
 * - BNPL: Tamara (Pay in 3, Pay in 30 days)
 * - Wasel Wallet (Real Balance)
 * - CliQ Bank Transfer
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Wallet,
  Smartphone,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Gift,
  TrendingDown,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useWallet } from '../../hooks/useWallet';
import { walletApi } from '../../services/walletApi';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bnpl' | 'digital_wallet' | 'bank_transfer';
  provider?: 'stripe' | 'tabby' | 'tamara' | 'apple_pay' | 'google_pay' | 'wasel' | 'cliq';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName?: string;
  email?: string;
  alias?: string;
  balance?: number; // Added for wallet
}

export function PaymentMethodList() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { wallet, loading: walletLoading } = useWallet(); // Real wallet data
  const isRTL = language === 'ar';
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadPaymentMethods();
  }, [wallet]); // Reload when wallet data changes

  const loadPaymentMethods = async () => {
    setLoading(true);
    
    // Load from backend if authenticated, otherwise seed defaults
    try {
      if (user?.id) {
        const { methods } = await walletApi.getPaymentMethods(user.id);
        setPaymentMethods(methods || []);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('[PaymentMethodList] backend fetch failed, using defaults:', err);
    }

    // Fallback: default wallet-only entry
    const fallbackMethods: PaymentMethod[] = [
      {
        id: 'wallet-1',
        type: 'wallet',
        provider: 'wasel',
        isDefault: true,
        holderName: 'Wasel Wallet',
        balance: wallet?.balance || 0,
      },
    ];

    setPaymentMethods(fallbackMethods);
    setLoading(false);
  };

  const handleSetDefault = async (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(m => ({ ...m, isDefault: m.id === methodId }))
    );
    toast.success(isRTL ? 'تم تحديث طريقة الدفع الافتراضية' : 'Default payment method updated');
  };

  const handleDelete = async (methodId: string) => {
    const confirmed = window.confirm(
      isRTL 
        ? 'هل أنت متأكد من إزالة طريقة الدفع هذه؟'
        : 'Are you sure you want to remove this payment method?'
    );
    if (!confirmed) return;

    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
    toast.success(isRTL ? 'تمت إزالة طريقة الدفع' : 'Payment method removed');
  };

  const handleAddTabby = () => {
    toast.info(isRTL ? 'رح تنتقل عـ Tabby...' : 'Redirecting to Tabby...');
    // In production: window.location.href = tabbyCheckoutUrl;
  };

  const handleAddTamara = () => {
    toast.info(isRTL ? 'رح تنتقل عـ Tamara...' : 'Redirecting to Tamara...');
    // In production: window.location.href = tamaraCheckoutUrl;
  };

  const handleAddCliQ = () => {
    toast.info(isRTL ? 'أدخل اسمك المستعار في CliQ للربط مع حسابك البنكي' : 'Enter your CliQ alias to link your bank account');
    // In production: initiate CliQ/JoPACC bank account linking flow
  };

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const isTabby = method.provider === 'tabby';
    const isTamara = method.provider === 'tamara';
    const isApplePay = method.provider === 'apple_pay';
    const isGooglePay = method.provider === 'google_pay';
    const isWaselWallet = method.provider === 'wasel';
    const isCliQ = method.provider === 'cliq';

    return (
      <motion.div
        key={method.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`hover:shadow-lg transition-all ${method.isDefault ? 'border-2 border-primary' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isTabby ? 'bg-[#3EFFC4]/10' :
                  isTamara ? 'bg-[#00BF6F]/10' :
                  isApplePay ? 'bg-black dark:bg-white' :
                  isGooglePay ? 'bg-gradient-to-r from-blue-500 to-green-500' :
                  isWaselWallet ? 'bg-gradient-to-br from-[#008080] to-teal-600' :
                  isCliQ ? 'bg-gradient-to-br from-blue-600 to-cyan-500' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {isTabby ? (
                    <span className="text-2xl font-bold text-[#3EFFC4]">T</span>
                  ) : isTamara ? (
                    <span className="text-2xl font-bold text-[#00BF6F]">ت</span>
                  ) : isApplePay ? (
                    <Smartphone className={`w-7 h-7 ${language === 'ar' ? 'text-black' : 'text-white dark:text-black'}`} />
                  ) : isGooglePay ? (
                    <Wallet className="w-7 h-7 text-white" />
                  ) : isWaselWallet ? (
                    <Wallet className="w-7 h-7 text-white" />
                  ) : isCliQ ? (
                    <Zap className="w-7 h-7 text-white" />
                  ) : (
                    <CreditCard className="w-7 h-7 text-gray-600" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">
                      {isTabby && 'Tabby'}
                      {isTamara && 'Tamara'}
                      {isApplePay && 'Apple Pay'}
                      {isGooglePay && 'Google Pay'}
                      {isWaselWallet && (isRTL ? 'محفظة واصل' : 'Wasel Wallet')}
                      {isCliQ && 'CliQ'}
                      {method.type === 'card' && `${method.brand} •••• ${method.last4}`}
                    </span>
                    {method.isDefault && (
                      <Badge className="bg-primary text-white">
                        <Star className="w-3 h-3 mr-1" />
                        {isRTL ? 'افتراضي' : 'Default'}
                      </Badge>
                    )}
                    {isCliQ && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {isRTL ? 'الأردن' : 'Jordan'}
                      </Badge>
                    )}
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm text-muted-foreground">
                    {isTabby && (isRTL ? 'ادفع على 4 دفعات بدون فوائد' : 'Pay in 4 interest-free payments')}
                    {isTamara && (isRTL ? 'ادفع على 3 دفعات أو خلال 30 يوم' : 'Pay in 3 or Pay in 30 days')}
                    {isApplePay && (isRTL ? 'الدفع السريع من أبل' : 'Fast and secure Apple payments')}
                    {isGooglePay && (isRTL ? 'الدفع السريع من جوجل' : 'Fast and secure Google payments')}
                    {isWaselWallet && (
                      <span className="font-bold text-teal-600">
                        {isRTL ? 'الرصيد: ' : 'Balance: '} {method.balance?.toFixed(3)} JOD
                      </span>
                    )}
                    {isCliQ && (isRTL ? 'تحويل بنكي فوري - JoPACC' : 'Instant bank transfer - JoPACC')}
                    {method.type === 'card' && `${isRTL ? 'تنتهي' : 'Expires'} ${method.expiryMonth}/${method.expiryYear}`}
                  </p>

                  {/* Additional Info */}
                  {(isTabby || isTamara) && method.email && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.email}
                    </p>
                  )}
                  {isCliQ && method.alias && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {isRTL ? 'الاسم المستعار: ' : 'Alias: '}{method.alias}
                    </p>
                  )}
                  {method.holderName && !isTabby && !isTamara && !isCliQ && !isWaselWallet && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.holderName}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    {isRTL ? 'تعيين كافتراضي' : 'Set Default'}
                  </Button>
                )}
                {method.type !== 'wallet' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008080] to-teal-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {isRTL ? 'طرق الدفع' : 'Payment Methods'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'إدارة طرق الدفع المحفوظة لديك' : 'Manage your saved payment methods'}
          </p>
        </div>
      </motion.div>

      {/* BNPL Promotional Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {isRTL ? '🎉 اشتر الآن وادفع لاحقاً!' : '🎉 Buy Now, Pay Later!'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {isRTL 
                    ? 'قسّم رحلاتك بدون فوائد مع Tabby و Tamara. دفعات مرنة تناسب ميزانيتك.'
                    : 'Split your rides into interest-free payments with Tabby & Tamara. Flexible payments that fit your budget.'
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white/50">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {isRTL ? 'بدون فوائد' : '0% Interest'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/50">
                    <Clock className="w-3 h-3 mr-1" />
                    {isRTL ? 'موافقة فورية' : 'Instant Approval'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/50">
                    <Shield className="w-3 h-3 mr-1" />
                    {isRTL ? 'آمن 100%' : '100% Secure'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{isRTL ? 'الكل' : 'All'}</TabsTrigger>
          <TabsTrigger value="cards">{isRTL ? 'البطاقات' : 'Cards'}</TabsTrigger>
          <TabsTrigger value="bnpl">{isRTL ? 'ادفع لاحقاً' : 'BNPL'}</TabsTrigger>
          <TabsTrigger value="wallets">{isRTL ? 'المحافظ' : 'Wallets'}</TabsTrigger>
        </TabsList>

        {/* All Methods Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Current Methods */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              {isRTL ? 'طرق الدفع المحفوظة' : 'Saved Payment Methods'}
            </h2>
            {paymentMethods.map(renderPaymentMethodCard)}
          </div>

          {/* Add New Section */}
          <div className="space-y-3 pt-6 border-t">
            <h2 className="text-lg font-semibold">
              {isRTL ? 'إضافة طريقة دفع جديدة' : 'Add New Payment Method'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Add Tabby */}
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#3EFFC4]" onClick={handleAddTabby}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#3EFFC4]/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#3EFFC4]">T</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">Tabby</h3>
                        <Badge className="bg-[#3EFFC4] text-black text-xs">
                          {isRTL ? 'شائع' : 'Popular'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isRTL ? 'قسّم مشترياتك على 4 دفعات' : 'Split your purchases into 4 payments'}
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>✓ {isRTL ? 'بدون فوائد أو رسوم خفية' : '0% interest, no hidden fees'}</li>
                        <li>✓ {isRTL ? 'موافقة فورية' : 'Instant approval'}</li>
                        <li>✓ {isRTL ? 'ادفع كل أسبوعين' : 'Pay every 2 weeks'}</li>
                      </ul>
                      <div className="flex items-center gap-1 text-primary font-medium mt-3 text-sm">
                        {isRTL ? 'إضافة Tabby' : 'Add Tabby'}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Tamara */}
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#00BF6F]" onClick={handleAddTamara}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#00BF6F]/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#00BF6F]">ت</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">Tamara</h3>
                        <Badge className="bg-[#00BF6F] text-white text-xs">
                          {isRTL ? 'مرن' : 'Flexible'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isRTL ? 'ادفع على 3 دفعات أو خلال 30 يوم' : 'Pay in 3 or within 30 days'}
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>✓ {isRTL ? 'خطط دفع مرنة' : 'Flexible payment plans'}</li>
                        <li>✓ {isRTL ? 'موافقة سريعة' : 'Fast approval'}</li>
                        <li>✓ {isRTL ? 'أشتر الآن، ادفع لاحقاً' : 'Shop now, pay later'}</li>
                      </ul>
                      <div className="flex items-center gap-1 text-primary font-medium mt-3 text-sm">
                        {isRTL ? 'إضافة Tamara' : 'Add Tamara'}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add CliQ (JoPACC) */}
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500" onClick={handleAddCliQ}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/10 to-cyan-500/10 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">CliQ</h3>
                        <Badge className="bg-blue-500 text-white text-xs">
                          {isRTL ? 'الأردن' : 'Jordan'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isRTL ? 'تحويل بنكي فوري عبر JoPACC' : 'Instant bank transfer via JoPACC'}
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>✓ {isRTL ? 'تحويل فوري بدون رسوم' : 'Zero-fee instant transfers'}</li>
                        <li>✓ {isRTL ? 'جميع البنوك الأردنية مدعومة' : 'All Jordanian banks supported'}</li>
                        <li>✓ {isRTL ? 'استخدم رقم الهاتف أو البريد أو الهوية' : 'Use mobile, email, or national ID'}</li>
                      </ul>
                      <div className="flex items-center gap-1 text-primary font-medium mt-3 text-sm">
                        {isRTL ? 'ربط حساب CliQ' : 'Link CliQ Account'}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Credit Card */}
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{isRTL ? 'بطاقة ائتمان / مدى' : 'Credit / Debit Card'}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isRTL ? 'أضف بطاقة Visa أو Mastercard أو Amex' : 'Add a Visa, Mastercard, or Amex card'}
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>✓ {isRTL ? 'مشفرة وآمنة 100%' : '100% encrypted and secure'}</li>
                        <li>✓ {isRTL ? 'مصادقة 3D Secure' : '3D Secure authentication'}</li>
                        <li>✓ {isRTL ? 'دفع فوري' : 'Instant payment'}</li>
                      </ul>
                      <div className="flex items-center gap-1 text-primary font-medium mt-3 text-sm">
                        {isRTL ? 'إضافة بطاقة' : 'Add Card'}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-3">
          {paymentMethods
            .filter(m => m.type === 'card')
            .map(renderPaymentMethodCard)}
          
          <Card className="border-2 border-dashed hover:border-primary transition-all cursor-pointer">
            <CardContent className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold mb-1">
                {isRTL ? 'إضافة بطاقة جديدة' : 'Add New Card'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'Visa, Mastercard, Amex' : 'Visa, Mastercard, Amex'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BNPL Tab */}
        <TabsContent value="bnpl" className="space-y-4">
          {/* Saved BNPL Methods */}
          <div className="space-y-3">
            {paymentMethods
              .filter(m => m.type === 'bnpl')
              .map(renderPaymentMethodCard)}
          </div>

          {/* Add BNPL */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={handleAddTabby}>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#3EFFC4]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-[#3EFFC4]">T</span>
                </div>
                <h3 className="font-bold mb-2">Tabby</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL ? '4 دفعات بدون فوائد' : '4 interest-free payments'}
                </p>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {isRTL ? 'إضافة Tabby' : 'Add Tabby'}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={handleAddTamara}>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#00BF6F]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-[#00BF6F]">ت</span>
                </div>
                <h3 className="font-bold mb-2">Tamara</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL ? 'ادفع على 3 أو خلال 30 يوم' : 'Pay in 3 or in 30 days'}
                </p>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {isRTL ? 'إضافة Tamara' : 'Add Tamara'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-3">
          {paymentMethods
            .filter(m => m.type === 'wallet' || m.type === 'digital_wallet' || m.type === 'bank_transfer')
            .map(renderPaymentMethodCard)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
