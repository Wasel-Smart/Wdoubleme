/**
 * PaymentFlow — Canonical Payment Orchestrator
 *
 * Replaces the scattered payment components with a single entry point.
 * Accepts a `mode` prop to render the correct sub-experience.
 *
 * Sub-components it delegates to (Strangler Fig — still exist as legacy):
 *  - Payments          → mode="overview"
 *  - PaymentMethodList → mode="methods"
 *  - PaymentGateways   → mode="gateways"
 *  - SplitPayment      → mode="split"
 *  - PromoCodesManager → mode="promos"
 *  - StripePaymentForm → mode="checkout"
 */

import { useState, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard, Wallet, SplitSquareHorizontal, Tag,
  ShoppingCart, Building2, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AutoHideTabBar } from '../../components/ui/auto-hide-tab-bar';

// ─── Lazy-loaded sub-components ───────────────────────────────────────────────
const Payments          = lazy(() => import('../../components/Payments').then(m => ({ default: m.Payments })));
const PaymentMethodList = lazy(() => import('./PaymentMethodList').then(m => ({ default: m.PaymentMethodList })));
const PaymentGateways   = lazy(() => import('../../components/PaymentGateways').then(m => ({ default: m.PaymentGateways })));
const SplitPayment      = lazy(() => import('../../components/SplitPayment').then(m => ({ default: m.SplitPayment })));
const PromoCodesManager = lazy(() => import('../../components/PromoCodesManager').then(m => ({ default: m.PromoCodesManager })));
const StripePaymentForm = lazy(() => import('../../components/StripePaymentForm').then(m => ({ default: m.StripePaymentForm })));

// ─── Types ────────────────────────────────────────────────────────────────────
export type PaymentMode =
  | 'overview'
  | 'methods'
  | 'gateways'
  | 'split'
  | 'promos'
  | 'checkout';

interface PaymentFlowProps {
  /** Which payment experience to show. Defaults to 'overview'. */
  mode?: PaymentMode;
  /** Required when mode='checkout' */
  amount?: number;
  /** Required when mode='checkout' */
  tripId?: string;
  /** Callback after successful payment */
  onSuccess?: () => void;
  /** Callback to navigate away */
  onNavigate?: (page: string) => void;
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { mode: PaymentMode; label: { en: string; ar: string }; icon: React.ElementType }[] = [
  { mode: 'overview',  label: { en: 'Overview',  ar: 'نظرة عامة'   }, icon: Wallet },
  { mode: 'methods',   label: { en: 'Methods',   ar: 'طرق الدفع'    }, icon: CreditCard },
  { mode: 'gateways',  label: { en: 'Gateways',  ar: 'البوابات'     }, icon: Building2 },
  { mode: 'split',     label: { en: 'Split Pay', ar: 'تقسيم الدفع'  }, icon: SplitSquareHorizontal },
  { mode: 'promos',    label: { en: 'Promos',    ar: 'العروض'        }, icon: Tag },
  { mode: 'checkout',  label: { en: 'Checkout',  ar: 'الدفع'        }, icon: ShoppingCart },
];

// ─── Mini loading fallback ────────────────────────────────────────────────────
const SubLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function PaymentFlow({
  mode: initialMode = 'overview',
  amount,
  tripId,
  onSuccess,
  onNavigate,
}: PaymentFlowProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [activeMode, setActiveMode] = useState<PaymentMode>(initialMode);

  const renderContent = () => {
    switch (activeMode) {
      case 'overview':
        return <Payments />;
      case 'methods':
        return <PaymentMethodList />;
      case 'gateways':
        return <PaymentGateways />;
      case 'split':
        return (
          <SplitPayment 
            tripId={tripId || 'demo-trip'}
            totalAmount={amount || 25.00}
            driverName="Demo Driver"
          />
        );
      case 'promos':
        return <PromoCodesManager />;
      case 'checkout':
        return (
          <StripePaymentForm
            amount={amount ?? 0}
            tripId={tripId ?? ''}
            onSuccess={onSuccess}
          />
        );
      default:
        return <Payments />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            {isRTL ? 'المدفوعات' : 'Payments'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'إدارة جميع طرق الدفع والمعاملات' : 'Manage all payment methods and transactions'}
          </p>
        </div>
      </motion.div>

      {/* Auto-Hide Tab Navigation */}
      <AutoHideTabBar 
        triggerZoneHeight={180}
        alwaysShowOnMobile={false}
      >
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide max-w-5xl mx-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.mode;
            return (
              <motion.button
                key={tab.mode}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveMode(tab.mode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isRTL ? tab.label.ar : tab.label.en}
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </motion.button>
            );
          })}
        </div>
      </AutoHideTabBar>

      {/* Content */}
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<SubLoader />}>
          {renderContent()}
        </Suspense>
      </motion.div>
    </div>
  );
}