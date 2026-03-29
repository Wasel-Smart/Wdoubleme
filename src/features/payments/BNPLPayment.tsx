/**
 * Buy-Now-Pay-Later (BNPL) Component
 * Installment payment options with clear breakdowns
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CreditCard, Info, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { WaselColors, WaselRadius } from '../../tokens/wasel-tokens';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';

interface BNPLOption {
  id: string;
  name: string;
  installments: number;
  interestRate: number;
  processingFee: number;
  minAmount: number;
  maxAmount: number;
}

interface BNPLPaymentProps {
  amount: number;
  currency?: string;
  onConfirm: (optionId: string, installments: number) => Promise<void>;
  onCancel?: () => void;
}

const bnplProviders: BNPLOption[] = [
  {
    id: 'tabby',
    name: 'Tabby',
    installments: 4,
    interestRate: 0,
    processingFee: 0,
    minAmount: 25,
    maxAmount: 5000,
  },
  {
    id: 'tamara',
    name: 'Tamara',
    installments: 3,
    interestRate: 0,
    processingFee: 0,
    minAmount: 50,
    maxAmount: 3000,
  },
  {
    id: 'postpay',
    name: 'Postpay',
    installments: 4,
    interestRate: 0,
    processingFee: 2,
    minAmount: 30,
    maxAmount: 2500,
  },
];

export function BNPLPayment({
  amount,
  currency = 'JOD',
  onConfirm,
  onCancel,
}: BNPLPaymentProps) {
  const { language } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<BNPLOption | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  const translations = {
    en: {
      title: 'Buy Now, Pay Later',
      subtitle: 'Split your payment into easy installments',
      totalAmount: 'Total Amount',
      selectProvider: 'Select Payment Plan',
      installments: 'installments',
      perInstallment: 'per installment',
      interestFree: 'Interest-Free',
      processingFee: 'Processing Fee',
      eligibility: 'Eligibility Check',
      agreeToTerms: 'I agree to the BNPL terms and conditions',
      confirm: 'Continue with',
      cancel: 'Cancel',
      processing: 'Processing...',
      breakdown: 'Payment Breakdown',
      today: 'Today',
      remaining: 'remaining',
      noFees: 'No hidden fees',
      autoDebit: 'Auto-debit from linked card',
    },
    ar: {
      title: 'اشترِ الآن وادفع لاحقاً',
      subtitle: 'قسّم دفعتك إلى أقساط سهلة',
      totalAmount: 'المبلغ الإجمالي',
      selectProvider: 'اختر خطة الدفع',
      installments: 'أقساط',
      perInstallment: 'لكل قسط',
      interestFree: 'بدون فوائد',
      processingFee: 'رسوم المعالجة',
      eligibility: 'فحص الأهلية',
      agreeToTerms: 'أوافق على شروط وأحكام الدفع الآجل',
      confirm: 'المتابعة مع',
      cancel: 'إلغاء',
      processing: 'جاري المعالجة...',
      breakdown: 'تفصيل الدفع',
      today: 'اليوم',
      remaining: 'المتبقي',
      noFees: 'بدون رسوم مخفية',
      autoDebit: 'خصم تلقائي من البطاقة المربوطة',
    },
  };

  const txt = translations[language];

  const calculateInstallment = (option: BNPLOption) => {
    const totalWithFees = amount + option.processingFee;
    return totalWithFees / option.installments;
  };

  const isEligible = (option: BNPLOption) => {
    return amount >= option.minAmount && amount <= option.maxAmount;
  };

  const handleConfirm = async () => {
    if (!selectedOption) {
      toast.error(
        language === 'ar'
          ? 'اختار خطة الدفع'
          : 'Please select a payment plan'
      );
      return;
    }

    if (!agreedToTerms) {
      toast.error(
        language === 'ar'
          ? 'لازم توافق على الشروط'
          : 'Please agree to the terms'
      );
      return;
    }

    try {
      setProcessing(true);
      await onConfirm(selectedOption.id, selectedOption.installments);
      toast.success(
        language === 'ar'
          ? 'تم تأكيد خطة الدفع'
          : 'Payment plan confirmed'
      );
    } catch (error) {
      console.error('BNPL confirmation error:', error);
      toast.error(
        language === 'ar'
          ? 'فشل تأكيد خطة الدفع'
          : 'Failed to confirm payment plan'
      );
    } finally {
      setProcessing(false);
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
            background: `linear-gradient(135deg, ${WaselColors.teal}15, ${WaselColors.navyCard})`,
            borderBottom: `1px solid ${WaselColors.borderDark}`,
          }}
        >
          <div className={`${rtl.flex(language)} items-center gap-3 mb-2`}>
            <div
              className="p-2 rounded-lg"
              style={{
                background: `${WaselColors.teal}20`,
              }}
            >
              <Calendar className="h-5 w-5" style={{ color: WaselColors.teal }} />
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
            className="p-4 rounded-lg mb-6"
            style={{
              background: `${WaselColors.teal}10`,
              border: `1px solid ${WaselColors.teal}30`,
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
                style={{ color: WaselColors.teal }}
              >
                {amount.toFixed(3)} {currency}
              </span>
            </div>
          </div>

          {/* Provider Options */}
          <h4
            className="font-medium mb-4"
            style={{ color: WaselColors.textPrimary }}
          >
            {txt.selectProvider}
          </h4>

          <div className="space-y-3">
            {bnplProviders.map((option) => {
              const eligible = isEligible(option);
              const installmentAmount = calculateInstallment(option);
              const isSelected = selectedOption?.id === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => eligible && setSelectedOption(option)}
                  disabled={!eligible}
                  className={`w-full p-4 rounded-lg transition-all ${rtl.text(language)}`}
                  style={{
                    background: isSelected
                      ? `${WaselColors.teal}20`
                      : WaselColors.navyBase,
                    border: `2px solid ${
                      isSelected
                        ? WaselColors.teal
                        : eligible
                        ? WaselColors.borderDark
                        : WaselColors.borderDark
                    }`,
                    opacity: eligible ? 1 : 0.5,
                    cursor: eligible ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div className={`${rtl.flex(language)} items-start justify-between gap-4`}>
                    <div className={`${rtl.text(language)} flex-1`}>
                      {/* Provider Name */}
                      <div className={`${rtl.flex(language)} items-center gap-2 mb-2`}>
                        <CreditCard
                          className="h-4 w-4"
                          style={{
                            color: isSelected ? WaselColors.teal : WaselColors.textSecondary,
                          }}
                        />
                        <span
                          className="font-medium"
                          style={{
                            color: isSelected ? WaselColors.teal : WaselColors.textPrimary,
                          }}
                        >
                          {option.name}
                        </span>
                      </div>

                      {/* Installment Info */}
                      <div className="space-y-1">
                        <p
                          className="text-sm"
                          style={{ color: WaselColors.textSecondary }}
                        >
                          {option.installments} {txt.installments} × {installmentAmount.toFixed(3)} {currency}
                        </p>

                        {/* Interest Free Badge */}
                        {option.interestRate === 0 && (
                          <div
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                            style={{
                              background: `${WaselColors.success}20`,
                              color: WaselColors.success,
                            }}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {txt.interestFree}
                          </div>
                        )}

                        {/* Processing Fee */}
                        {option.processingFee > 0 && (
                          <p
                            className="text-xs"
                            style={{ color: WaselColors.textSecondary }}
                          >
                            {txt.processingFee}: {option.processingFee} {currency}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <div
                          className="p-1 rounded-full"
                          style={{
                            background: WaselColors.teal,
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" style={{ color: WaselColors.navyCard }} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Payment Breakdown */}
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <h5
                className="font-medium mb-3"
                style={{ color: WaselColors.textPrimary }}
              >
                {txt.breakdown}
              </h5>
              <div
                className="p-4 rounded-lg space-y-3"
                style={{
                  background: WaselColors.navyBase,
                  border: `1px solid ${WaselColors.borderDark}`,
                }}
              >
                <div className={`${rtl.flex(language)} items-center justify-between`}>
                  <span className="text-sm" style={{ color: WaselColors.textSecondary }}>
                    {txt.today}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: WaselColors.textPrimary }}
                  >
                    {calculateInstallment(selectedOption).toFixed(3)} {currency}
                  </span>
                </div>
                <div className={`${rtl.flex(language)} items-center justify-between`}>
                  <span className="text-sm" style={{ color: WaselColors.textSecondary }}>
                    {selectedOption.installments - 1} {txt.remaining}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: WaselColors.textPrimary }}
                  >
                    {(calculateInstallment(selectedOption) * (selectedOption.installments - 1)).toFixed(3)} {currency}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div
                className={`mt-3 p-3 rounded-lg ${rtl.flex(language)} items-start gap-2`}
                style={{
                  background: `${WaselColors.info}10`,
                  border: `1px solid ${WaselColors.info}30`,
                }}
              >
                <Info
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
                  style={{ color: WaselColors.info }}
                />
                <div className="text-xs space-y-1" style={{ color: WaselColors.textSecondary }}>
                  <p>✓ {txt.noFees}</p>
                  <p>✓ {txt.autoDebit}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Agreement */}
          <div className={`mt-6 ${rtl.flex(language)} items-start gap-3`}>
            <Checkbox
              id="agree-bnpl"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              disabled={!selectedOption}
            />
            <label
              htmlFor="agree-bnpl"
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
              disabled={processing}
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
            disabled={!selectedOption || !agreedToTerms || processing}
            className="flex-1"
            style={{
              background:
                selectedOption && agreedToTerms
                  ? WaselColors.teal
                  : WaselColors.borderDark,
              color: WaselColors.navyCard,
            }}
          >
            {processing
              ? txt.processing
              : selectedOption
              ? `${txt.confirm} ${selectedOption.name}`
              : txt.confirm}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
