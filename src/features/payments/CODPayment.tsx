/**
 * Cash on Delivery (COD) Component
 * Enables COD payment with confirmation workflows
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Banknote, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { WaselColors, WaselRadius } from '../../tokens/wasel-tokens';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';

interface CODPaymentProps {
  amount: number;
  currency?: string;
  onConfirm: (amount: number) => Promise<void>;
  onCancel?: () => void;
  requiresDriverConfirmation?: boolean;
}

export function CODPayment({
  amount,
  currency = 'JOD',
  onConfirm,
  onCancel,
  requiresDriverConfirmation = true,
}: CODPaymentProps) {
  const { language } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const [exactAmount, setExactAmount] = useState(true);
  const [changeFor, setChangeFor] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const translations = {
    en: {
      title: 'Cash on Delivery',
      subtitle: 'Pay with cash when you receive your order',
      totalAmount: 'Total Amount',
      exactChange: 'I have exact change',
      changeFor: 'I need change for',
      agreeToTerms: 'I agree to pay the exact amount in cash',
      driverConfirmation: 'Driver will confirm receipt of payment',
      confirmPayment: 'Confirm Cash Payment',
      cancel: 'Cancel',
      preparing: 'Preparing...',
      warning: 'Please ensure you have the exact amount ready',
      tip: 'Cash payments are subject to driver availability',
    },
    ar: {
      title: 'الدفع عند الاستلام',
      subtitle: 'ادفع نقداً عند استلام طلبك',
      totalAmount: 'المبلغ الإجمالي',
      exactChange: 'لدي المبلغ الدقيق',
      changeFor: 'أحتاج صرف لـ',
      agreeToTerms: 'أوافق على دفع المبلغ الدقيق نقداً',
      driverConfirmation: 'سيؤكد السائق استلام الدفعة',
      confirmPayment: 'تأكيد الدفع النقدي',
      cancel: 'إلغاء',
      preparing: 'جاري التحضير...',
      warning: 'تأكد عندك الفلوس الكافية',
      tip: 'الدفع نقداً حسب الاتفاق مع المسافر',
    },
  };

  const txt = translations[language];

  const handleConfirm = async () => {
    if (!agreedToTerms) {
      toast.error(
        language === 'ar'
          ? 'لازم توافق على الشروط'
          : 'Please agree to the terms'
      );
      return;
    }

    try {
      setConfirming(true);
      await onConfirm(amount);
      toast.success(
        language === 'ar'
          ? 'تم تأكيد الدفع النقدي'
          : 'Cash payment confirmed'
      );
    } catch (error) {
      console.error('COD confirmation error:', error);
      toast.error(
        language === 'ar'
          ? 'فشل تأكيد الدفع'
          : 'Failed to confirm payment'
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          background: WaselColors.navyCard,
          borderRadius: WaselRadius.lg,
          border: `1px solid ${WaselColors.borderDark}`,
        }}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{
            background: `linear-gradient(135deg, ${WaselColors.bronze}15, ${WaselColors.navyCard})`,
            borderBottom: `1px solid ${WaselColors.borderDark}`,
          }}
        >
          <div className={`${rtl.flex(language)} items-center gap-3 mb-2`}>
            <div
              className="p-2 rounded-lg"
              style={{
                background: `${WaselColors.bronze}20`,
              }}
            >
              <Banknote className="h-5 w-5" style={{ color: WaselColors.bronze }} />
            </div>
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: WaselColors.textPrimary }}
              >
                {txt.title}
              </h3>
              <p className="text-sm" style={{ color: WaselColors.textSecondary }}>
                {txt.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="p-6">
          <div
            className="p-4 rounded-lg mb-4"
            style={{
              background: `${WaselColors.bronze}10`,
              border: `1px solid ${WaselColors.bronze}30`,
            }}
          >
            <div className={`${rtl.flex(language)} items-center justify-between`}>
              <span
                className="text-sm"
                style={{ color: WaselColors.textSecondary }}
              >
                {txt.totalAmount}
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: WaselColors.bronze }}
              >
                {amount.toFixed(3)} {currency}
              </span>
            </div>
          </div>

          {/* Change Options */}
          <div className="space-y-4">
            <div className={`${rtl.flex(language)} items-start gap-3`}>
              <Checkbox
                id="exact-change"
                checked={exactAmount}
                onCheckedChange={(checked) => setExactAmount(checked as boolean)}
              />
              <label
                htmlFor="exact-change"
                className="text-sm cursor-pointer flex-1"
                style={{ color: WaselColors.textPrimary }}
              >
                {txt.exactChange}
              </label>
            </div>

            {!exactAmount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label
                  className="text-sm"
                  style={{ color: WaselColors.textSecondary }}
                >
                  {txt.changeFor}
                </label>
                <div className={`${rtl.flex(language)} gap-2`}>
                  <Input
                    type="number"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 50' : 'e.g., 50'}
                    className={rtl.text(language)}
                    style={{
                      background: WaselColors.navyBase,
                      borderColor: WaselColors.borderDark,
                      color: WaselColors.textPrimary,
                    }}
                  />
                  <span
                    className="px-3 py-2 rounded-lg"
                    style={{
                      background: WaselColors.navyBase,
                      color: WaselColors.textSecondary,
                    }}
                  >
                    {currency}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Warning */}
          <div
            className={`mt-4 p-3 rounded-lg ${rtl.flex(language)} items-start gap-2`}
            style={{
              background: `${WaselColors.warning}10`,
              border: `1px solid ${WaselColors.warning}30`,
            }}
          >
            <AlertCircle
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              style={{ color: WaselColors.warning }}
            />
            <p className="text-xs" style={{ color: WaselColors.textSecondary }}>
              {txt.warning}
            </p>
          </div>

          {/* Driver Confirmation Notice */}
          {requiresDriverConfirmation && (
            <div
              className={`mt-3 p-3 rounded-lg ${rtl.flex(language)} items-start gap-2`}
              style={{
                background: `${WaselColors.teal}10`,
                border: `1px solid ${WaselColors.teal}30`,
              }}
            >
              <CheckCircle2
                className="h-4 w-4 flex-shrink-0 mt-0.5"
                style={{ color: WaselColors.teal }}
              />
              <p className="text-xs" style={{ color: WaselColors.textSecondary }}>
                {txt.driverConfirmation}
              </p>
            </div>
          )}

          {/* Agreement */}
          <div className={`mt-6 ${rtl.flex(language)} items-start gap-3`}>
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label
              htmlFor="agree-terms"
              className="text-sm cursor-pointer flex-1"
              style={{ color: WaselColors.textPrimary }}
            >
              {txt.agreeToTerms}
            </label>
          </div>
        </div>

        {/* Actions */}
        <div
          className="p-6 flex gap-3"
          style={{
            borderTop: `1px solid ${WaselColors.borderDark}`,
            background: WaselColors.navyBase,
          }}
        >
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={confirming}
              className="flex-1"
              style={{
                borderColor: WaselColors.borderDark,
                color: WaselColors.textSecondary,
              }}
            >
              {txt.cancel}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={!agreedToTerms || confirming}
            className="flex-1"
            style={{
              background: agreedToTerms ? WaselColors.bronze : WaselColors.borderDark,
              color: WaselColors.navyCard,
            }}
          >
            {confirming ? txt.preparing : txt.confirmPayment}
          </Button>
        </div>

        {/* Tip */}
        <div
          className="p-4 text-center"
          style={{
            borderTop: `1px solid ${WaselColors.borderDark}`,
            background: WaselColors.navyBase,
          }}
        >
          <p className="text-xs" style={{ color: WaselColors.textSecondary }}>
            {txt.tip}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
