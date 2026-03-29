/**
 * Enhanced Send Package
 * Create package with automatic tracking code, QR generation, and secure payment escrow
 */

import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { packageTrackingService } from '../../services/packageTrackingService';
import { orchestrator } from '../../services/serviceOrchestrator';
import { getAllCities } from '../../config/jordan-mobility-network';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../components/hooks/useTranslation';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import {
  Package,
  MapPin,
  DollarSign,
  Shield,
  QrCode,
  CheckCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { toast } from 'sonner';

export function EnhancedSendPackage() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const cities = getAllCities();

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    size: 'small' as 'small' | 'medium' | 'large',
    value: '',
    insurance: false,
    description: '',
  });

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [createdPackage, setCreatedPackage] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePrice = () => {
    const basePrice = formData.size === 'small' ? 3.0 : 
                     formData.size === 'medium' ? 5.0 : 8.0;
    const insuranceCost = formData.insurance && formData.value 
      ? parseFloat(formData.value) * 0.01 
      : 0;
    return { basePrice, insuranceCost, total: basePrice + insuranceCost };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create package with tracking code
      const pkg = await packageTrackingService.createPackage({
        senderId: user.id,
        from: formData.from,
        to: formData.to,
        size: formData.size,
        value: parseFloat(formData.value) || 0,
        insurance: formData.insurance,
        description: formData.description,
      });

      // 2. Orchestrate services (automatic matching with travelers)
      await orchestrator.orchestrateSendPackage(user.id, {
        from: formData.from,
        to: formData.to,
        size: formData.size,
        value: parseFloat(formData.value) || 0,
        insurance: formData.insurance,
      });

      setCreatedPackage(pkg);
      setStep('payment');

      toast.success(isArabic ? 'تم إنشاء الطرد بنجاح!' : 'Package created successfully!');
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!createdPackage) return;

    setIsSubmitting(true);

    try {
      // Process payment and hold in escrow
      await packageTrackingService.processPayment(createdPackage.id, paymentMethod);

      setStep('success');
      
      toast.success(
        isArabic 
          ? 'تم الدفع بنجاح! مبلغك محفوظ حتى التسليم'
          : 'Payment successful! Your money is held until delivery'
      );
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(isArabic ? 'فشل الدفع' : 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricing = calculatePrice();

  if (step === 'payment' && createdPackage) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isArabic ? 'الطرد جاهز!' : 'Package Ready!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'أكمل الدفع لتفعيل التتبع' : 'Complete payment to activate tracking'}
            </p>
          </div>

          {/* Tracking Code */}
          <div className="mb-6 p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-xl border-2 border-teal-200 dark:border-teal-800">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isArabic ? 'رمز التتبع' : 'Your Tracking Code'}
              </div>
              <div className="text-3xl font-mono font-bold text-teal-600">
                {createdPackage.trackingCode}
              </div>
            </div>
            <img 
              src={createdPackage.qrCodeUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto border-4 border-white dark:border-gray-800 rounded-xl shadow-lg"
            />
          </div>

          {/* Pricing */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'سعر التوصيل' : 'Delivery Price'}
                </span>
                <span className="font-semibold">JOD {createdPackage.price.toFixed(2)}</span>
              </div>
              {createdPackage.insurance && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'التأمين (1%)' : 'Insurance (1%)'}
                  </span>
                  <span className="font-semibold">JOD {createdPackage.insuranceCost.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">{isArabic ? 'المجموع' : 'Total'}</span>
                <span className="font-bold text-teal-600">
                  JOD {createdPackage.totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                  {isArabic ? '🔒 مبلغك محفوظ بأمان' : '🔒 Your Money is Secure'}
                </div>
                <div className="text-emerald-700 dark:text-emerald-300">
                  {isArabic 
                    ? 'لن يتم تحويل المبلغ للسائق إلا بعد تأكيد التسليم بالصورة والرمز'
                    : 'Payment will only be released to driver after confirmed delivery with photo and code'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Button
              onClick={() => handlePayment('card')}
              disabled={isSubmitting}
              className="w-full h-auto py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">
                  {isArabic ? 'الدفع بالبطاقة' : 'Pay with Card'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
            <Button
              onClick={() => handlePayment('cash')}
              disabled={isSubmitting}
              variant="outline"
              className="w-full h-auto py-4"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">
                  {isArabic ? 'الدفع نقداً عند الاستلام' : 'Cash on Pickup'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'success' && createdPackage) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {isArabic ? '✅ تم بنجاح!' : '✅ Success!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isArabic 
              ? 'طردك في طريقه! ستتلقى إشعارات مباشرة بكل التحديثات'
              : 'Your package is on its way! You\'ll receive live updates'}
          </p>

          <div className="mb-8 p-6 bg-teal-50 dark:bg-teal-950 rounded-xl">
            <QrCode className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {isArabic ? 'رمز التتبع' : 'Tracking Code'}
            </div>
            <div className="text-2xl font-mono font-bold text-teal-600 mb-4">
              {createdPackage.trackingCode}
            </div>
            <Button
              onClick={() => navigate(`/package-tracking/${createdPackage.id}`)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isArabic ? 'تتبع الطرد' : 'Track Package'}
            </Button>
          </div>

          <div className="space-y-3 text-sm text-left">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold mb-1">
                  {isArabic ? 'تتبع مباشر' : 'Live Tracking'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'شوف موقع طردك لحظة بلحظة' : 'See your package location in real-time'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold mb-1">
                  {isArabic ? 'اتصال مباشر' : 'Direct Contact'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'اتصل بالسائق مباشرة إذا احتجت' : 'Contact driver directly if needed'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold mb-1">
                  {isArabic ? 'الأمان الكامل' : 'Full Security'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'رموز تحقق + صور + مبلغ محفوظ' : 'Verification codes + Photos + Secured payment'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              onClick={() => {
                setStep('details');
                setCreatedPackage(null);
                setFormData({
                  from: '',
                  to: '',
                  size: 'small',
                  value: '',
                  insurance: false,
                  description: '',
                });
              }}
              variant="outline"
              className="flex-1"
            >
              {isArabic ? 'إرسال طرد آخر' : 'Send Another Package'}
            </Button>
            <Button
              onClick={() => navigate('/my-trips')}
              className="flex-1"
            >
              {isArabic ? 'طرودي' : 'My Packages'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 1: Package Details Form
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'إرسال طرد' : 'Send Package'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic 
              ? 'وصّل طردك مع المسافرين بأمان وسعر أقل'
              : 'Deliver your package with travelers securely at lower cost'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">
                <MapPin className="w-4 h-4 inline mr-2" />
                {isArabic ? 'من' : 'From'}
              </Label>
              <Select value={formData.from} onValueChange={(value) => setFormData({ ...formData, from: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر المدينة' : 'Select city'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="to">
                <MapPin className="w-4 h-4 inline mr-2" />
                {isArabic ? 'إلى' : 'To'}
              </Label>
              <Select value={formData.to} onValueChange={(value) => setFormData({ ...formData, to: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر المدينة' : 'Select city'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size">
                <Package className="w-4 h-4 inline mr-2" />
                {isArabic ? 'الحجم' : 'Size'}
              </Label>
              <Select value={formData.size} onValueChange={(value: any) => setFormData({ ...formData, size: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{isArabic ? 'صغير (JOD 3)' : 'Small (JOD 3)'}</SelectItem>
                  <SelectItem value="medium">{isArabic ? 'متوسط (JOD 5)' : 'Medium (JOD 5)'}</SelectItem>
                  <SelectItem value="large">{isArabic ? 'كبير (JOD 8)' : 'Large (JOD 8)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">
                <DollarSign className="w-4 h-4 inline mr-2" />
                {isArabic ? 'القيمة (JOD)' : 'Value (JOD)'}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="50.00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Insurance */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-teal-600" />
              <div>
                <div className="font-semibold">
                  {isArabic ? 'تأمين على الطرد' : 'Package Insurance'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? '1% من القيمة' : '1% of value'}
                </div>
              </div>
            </div>
            <Switch
              checked={formData.insurance}
              onCheckedChange={(checked) => setFormData({ ...formData, insurance: checked })}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              <Info className="w-4 h-4 inline mr-2" />
              {isArabic ? 'وصف الطرد (اختياري)' : 'Package Description (Optional)'}
            </Label>
            <Textarea
              id="description"
              placeholder={isArabic ? 'مثال: ملابس، كتب، هدايا...' : 'e.g., Clothes, Books, Gifts...'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-teal-50 dark:bg-teal-950 rounded-xl border border-teal-200 dark:border-teal-800">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'سعر التوصيل' : 'Delivery Price'}
                </span>
                <span className="font-semibold">JOD {pricing.basePrice.toFixed(2)}</span>
              </div>
              {formData.insurance && formData.value && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'التأمين' : 'Insurance'}
                  </span>
                  <span className="font-semibold">JOD {pricing.insuranceCost.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">{isArabic ? 'المجموع' : 'Total'}</span>
                <span className="font-bold text-teal-600">JOD {pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.from || !formData.to || !formData.value}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <>{isArabic ? 'جاري الإنشاء...' : 'Creating...'}</>
            ) : (
              <>
                {isArabic ? 'متابعة للدفع' : 'Continue to Payment'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
