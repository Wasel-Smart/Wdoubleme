/**
 * Raje3Returns — /features/awasel/Raje3Returns.tsx
 * 
 * Raje3 (راجع): Automated returns system for e-commerce packages.
 * Seamlessly bundle return packages with existing carpooling trips.
 * 
 * Features:
 * - Auto-match return packages with existing routes
 * - QR code pickup/delivery verification
 * - Insurance coverage up to JOD 100
 * - Real-time tracking
 * - Commission: 20% + JOD 0.50 insurance
 * - Traveler earns extra income carrying returns
 * 
 * Use Cases:
 * - E-commerce returns (wrong size, defective, changed mind)
 * - Store-to-warehouse returns
 * - Exchange items between cities
 * 
 * ✅ Phase 4: Raje3 as integrated package delivery feature
 * ✅ Bilingual: Arabic (Jordanian dialect) + English
 */

import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReturnPackage {
  id: string;
  itemName: string;
  itemNameAr: string;
  reason: string;
  reasonAr: string;
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  weight: number;
  size: 'small' | 'medium' | 'large';
  price: number;
  insurance: number;
  matchedRoute: {
    driverName: string;
    driverNameAr: string;
    departureTime: string;
    rating: number;
    verified: boolean;
  } | null;
  status: 'pending' | 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const RETURN_PACKAGES: ReturnPackage[] = [
  {
    id: 'ret1',
    itemName: 'Nike Sneakers (Wrong Size)',
    itemNameAr: 'حذاء نايك (مقاس خطأ)',
    reason: 'Wrong size',
    reasonAr: 'مقاس خطأ',
    from: 'Irbid',
    fromAr: 'إربد',
    to: 'Amman (Nike Store)',
    toAr: 'عمان (محل نايك)',
    weight: 1.2,
    size: 'medium',
    price: 5,
    insurance: 0.5,
    matchedRoute: {
      driverName: 'Ahmad Al-Rashidi',
      driverNameAr: 'أحمد الرشيدي',
      departureTime: 'Tomorrow 08:00',
      rating: 4.9,
      verified: true,
    },
    status: 'matched',
    createdAt: '2 hours ago',
    estimatedDelivery: 'Tomorrow by 11:00',
  },
  {
    id: 'ret2',
    itemName: 'Samsung Phone (Defective)',
    itemNameAr: 'جوال سامسونج (معطل)',
    reason: 'Defective',
    reasonAr: 'معطل',
    from: 'Zarqa',
    fromAr: 'الزرقاء',
    to: 'Amman (Service Center)',
    toAr: 'عمان (مركز صيانة)',
    weight: 0.5,
    size: 'small',
    price: 3,
    insurance: 0.5,
    matchedRoute: {
      driverName: 'Rima Abu-Hassan',
      driverNameAr: 'ريما أبو حسن',
      departureTime: 'Today 15:00',
      rating: 5.0,
      verified: true,
    },
    status: 'in_transit',
    createdAt: '5 hours ago',
    estimatedDelivery: 'Today by 17:00',
  },
  {
    id: 'ret3',
    itemName: 'Zara Dress (Changed Mind)',
    itemNameAr: 'فستان زارا (غيرت رأيي)',
    reason: 'Changed mind',
    reasonAr: 'غيرت رأيي',
    from: 'Aqaba',
    fromAr: 'العقبة',
    to: 'Amman (Zara)',
    toAr: 'عمان (زارا)',
    weight: 0.8,
    size: 'small',
    price: 8,
    insurance: 0.5,
    matchedRoute: null,
    status: 'pending',
    createdAt: '30 min ago',
    estimatedDelivery: 'Within 2 days',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Raje3Returns() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'send' | 'my_returns'>('send');
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  // Send Return Form
  const [itemName, setItemName] = useState('');
  const [reason, setReason] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [weight, setWeight] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small');

  const t = {
    title: ar ? 'راجع - إرجاع الطرود' : 'Raje3 - Package Returns',
    subtitle: ar
      ? 'أرجع مشترياتك مع مسافرين رايحين نفس الوجهة'
      : 'Return your purchases with travelers heading the same way',
    send: ar ? 'أرسل إرجاع' : 'Send Return',
    myReturns: ar ? 'إرجاعاتي' : 'My Returns',
    itemName: ar ? 'اسم المنتج' : 'Item Name',
    reason: ar ? 'سبب الإرجاع' : 'Return Reason',
    from: ar ? 'من' : 'From',
    to: ar ? 'إلى' : 'To',
    weight: ar ? 'الوزن (كغ)' : 'Weight (kg)',
    size: ar ? 'الحجم' : 'Size',
    small: ar ? 'صغير' : 'Small',
    medium: ar ? 'متوسط' : 'Medium',
    large: ar ? 'كبير' : 'Large',
    calculatePrice: ar ? 'احسب السعر' : 'Calculate Price',
    submitReturn: ar ? 'أرسل الإرجاع' : 'Submit Return',
    price: ar ? 'السعر' : 'Price',
    insurance: ar ? 'تأمين' : 'Insurance',
    total: ar ? 'الإجمالي' : 'Total',
    status: ar ? 'الحالة' : 'Status',
    pending: ar ? 'بانتظار مسافر' : 'Pending match',
    matched: ar ? 'تم التطابق' : 'Matched',
    picked_up: ar ? 'تم الاستلام' : 'Picked up',
    in_transit: ar ? 'في الطريق' : 'In transit',
    delivered: ar ? 'تم التسليم' : 'Delivered',
    driver: ar ? 'المسافر' : 'Traveler',
    departure: ar ? 'المغادرة' : 'Departure',
    eta: ar ? 'الوصول المتوقع' : 'ETA',
    trackPackage: ar ? 'تتبع الطرد' : 'Track Package',
    viewDetails: ar ? 'عرض التفاصيل' : 'View Details',
    hideDetails: ar ? 'إخفاء التفاصيل' : 'Hide Details',
    benefits: {
      fast: ar ? 'أسرع' : 'Faster',
      fastDesc: ar ? 'نفس يوم الإرجاع' : 'Same-day returns',
      cheap: ar ? 'أرخص' : 'Cheaper',
      cheapDesc: ar ? 'وفّر ٦٠٪' : 'Save 60%',
      safe: ar ? 'آمن' : 'Safe',
      safeDesc: ar ? 'تأمين + QR' : 'Insured + QR',
      eco: ar ? 'بيئي' : 'Eco',
      ecoDesc: ar ? 'صديق للبيئة' : 'Eco-friendly',
    },
    howItWorks: ar ? 'كيف يعمل؟' : 'How it works?',
    step1: ar ? 'أدخل تفاصيل المنتج' : 'Enter product details',
    step2: ar ? 'نطابق مع مسافر' : 'We match with traveler',
    step3: ar ? 'استلام بـ QR' : 'QR pickup',
    step4: ar ? 'تتبع مباشر' : 'Live tracking',
    step5: ar ? 'تسليم بـ QR' : 'QR delivery',
    popularReasons: ar ? 'أسباب شائعة' : 'Popular Reasons',
    wrongSize: ar ? 'مقاس خطأ' : 'Wrong size',
    defective: ar ? 'معطل' : 'Defective',
    changedMind: ar ? 'غيرت رأيي' : 'Changed mind',
    wrongItem: ar ? 'منتج خطأ' : 'Wrong item',
  };

  const statusColor = (status: ReturnPackage['status']) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-400';
      case 'matched':
        return 'border-l-blue-400';
      case 'picked_up':
        return 'border-l-purple-400';
      case 'in_transit':
        return 'border-l-primary';
      case 'delivered':
        return 'border-l-green-400';
    }
  };

  const statusIcon = (status: ReturnPackage['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'matched':
        return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
      case 'picked_up':
        return <QrCode className="w-5 h-5 text-purple-400" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-primary animate-pulse" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    }
  };

  const statusLabel = (status: ReturnPackage['status']) => {
    return t[status] || status;
  };

  const sizePrice = (s: 'small' | 'medium' | 'large') => {
    const prices = { small: 3, medium: 5, large: 8 };
    return prices[s];
  };

  const calculateTotal = () => {
    const basePrice = sizePrice(size);
    const insurancePrice = 0.5;
    return basePrice + insurancePrice;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="wasel-container mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
              📦
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-white text-lg">{t.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
            </div>
            <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[10px]">
              {ar ? 'إرجاع مجاني' : 'Free returns'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="wasel-container mx-auto p-4 space-y-4">
        {/* Benefits Banner */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '⚡', label: t.benefits.fast, desc: t.benefits.fastDesc },
              { icon: '💰', label: t.benefits.cheap, desc: t.benefits.cheapDesc },
              { icon: '🛡️', label: t.benefits.safe, desc: t.benefits.safeDesc },
              { icon: '🌱', label: t.benefits.eco, desc: t.benefits.ecoDesc },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="text-2xl">{b.icon}</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-purple-400">{b.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['send', 'my_returns'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className={`flex-1 text-sm font-bold ${
                activeTab === tab
                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  : 'border-[#1E293B] text-slate-400 hover:bg-white/5'
              }`}
            >
              {tab === 'send' ? t.send : t.myReturns}
            </Button>
          ))}
        </div>

        {/* Send Return Tab */}
        {activeTab === 'send' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* How It Works */}
            <Card className="bg-card border-border p-4">
              <p className="text-sm font-bold text-white mb-3">{t.howItWorks}</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { icon: '📝', label: t.step1 },
                  { icon: '🔍', label: t.step2 },
                  { icon: '📷', label: t.step3 },
                  { icon: '📍', label: t.step4 },
                  { icon: '✅', label: t.step5 },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[70px]">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                      {step.icon}
                    </div>
                    <p className="text-[9px] text-slate-500 text-center">{step.label}</p>
                    {i < 4 && (
                      <ChevronRight className="w-3 h-3 text-slate-600 absolute translate-x-[75px] -translate-y-2" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Form */}
            <Card className="bg-card border-border p-4">
              <div className="space-y-3">
                {/* Item Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                    {t.itemName}
                  </label>
                  <Input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={ar ? 'مثال: حذاء نايك' : 'e.g., Nike Sneakers'}
                    className="bg-[#0B1120] border-[#1E293B]"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                    {t.reason}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[
                      { value: 'wrong_size', label: t.wrongSize },
                      { value: 'defective', label: t.defective },
                      { value: 'changed_mind', label: t.changedMind },
                      { value: 'wrong_item', label: t.wrongItem },
                    ].map((r) => (
                      <Button
                        key={r.value}
                        onClick={() => setReason(r.value)}
                        variant="outline"
                        size="sm"
                        className={`text-xs ${
                          reason === r.value
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'border-[#1E293B] text-slate-400'
                        }`}
                      >
                        {r.label}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={ar ? 'وضّح السبب...' : 'Explain reason...'}
                    className="bg-[#0B1120] border-[#1E293B] min-h-[60px]"
                  />
                </div>

                {/* From/To */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                      {t.from}
                    </label>
                    <Input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder={ar ? 'إربد' : 'Irbid'}
                      className="bg-[#0B1120] border-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                      {t.to}
                    </label>
                    <Input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder={ar ? 'عمان' : 'Amman'}
                      className="bg-[#0B1120] border-[#1E293B]"
                    />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                    {t.weight}
                  </label>
                  <Input
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    type="number"
                    step="0.1"
                    placeholder="1.5"
                    className="bg-[#0B1120] border-[#1E293B]"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                    {t.size}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((s) => (
                      <Button
                        key={s}
                        onClick={() => setSize(s)}
                        variant="outline"
                        className={`text-xs ${
                          size === s
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'border-[#1E293B] text-slate-400'
                        }`}
                      >
                        {t[s]}
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {formatCurrency(sizePrice(s))}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <Card className="bg-[#0B1120] border-purple-500/20 p-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t.price}:</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(sizePrice(size))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t.insurance}:</span>
                      <span className="font-semibold text-white">{formatCurrency(0.5)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#1E293B]">
                      <span className="font-bold text-white">{t.total}:</span>
                      <span className="font-black text-purple-400 text-base">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Submit */}
                <Button
                  className="w-full bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 h-12"
                  disabled={!itemName || !reason || !from || !to || !weight}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t.submitReturn}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* My Returns Tab */}
        {activeTab === 'my_returns' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {RETURN_PACKAGES.map((pkg, i) => (
              <Card
                key={pkg.id}
                className={`bg-card border-border border-l-4 ${statusColor(pkg.status)} p-4`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm mb-1">
                      {ar ? pkg.itemNameAr : pkg.itemName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3" />
                      {ar ? pkg.fromAr : pkg.from} → {ar ? pkg.toAr : pkg.to}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] ${
                      pkg.status === 'delivered'
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : pkg.status === 'in_transit'
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : pkg.status === 'matched'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    }`}
                    variant="outline"
                  >
                    {statusLabel(pkg.status)}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 p-3 bg-[#0B1120]/50 rounded-lg mb-3">
                  {statusIcon(pkg.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {pkg.status === 'pending'
                        ? ar
                          ? 'بحث عن مسافر...'
                          : 'Finding traveler...'
                        : pkg.status === 'matched'
                        ? ar
                          ? 'تم التطابق مع مسافر!'
                          : 'Matched with traveler!'
                        : pkg.status === 'in_transit'
                        ? ar
                          ? 'في الطريق'
                          : 'En route'
                        : ar
                        ? 'تم التسليم بنجاح'
                        : 'Delivered successfully'}
                    </p>
                    <p className="text-xs text-slate-500">{pkg.createdAt}</p>
                  </div>
                </div>

                {/* Matched Driver */}
                {pkg.matchedRoute && (
                  <div className="flex items-center justify-between text-xs border-t border-[#1E293B] pt-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400">
                        {(ar ? pkg.matchedRoute.driverNameAr : pkg.matchedRoute.driverName).charAt(
                          0
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {ar ? pkg.matchedRoute.driverNameAr : pkg.matchedRoute.driverName}
                        </p>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          {pkg.matchedRoute.rating}
                        </div>
                      </div>
                    </div>
                    {pkg.matchedRoute.verified && (
                      <Shield className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                )}

                {/* ETA */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>{t.eta}:</span>
                  <span className="font-semibold text-white">{pkg.estimatedDelivery}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-[#1E293B] text-slate-400 hover:bg-white/5"
                    onClick={() =>
                      setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)
                    }
                  >
                    {expandedPackage === pkg.id ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        {t.hideDetails}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        {t.viewDetails}
                      </>
                    )}
                  </Button>
                  {pkg.status !== 'pending' && (
                    <Button
                      onClick={() => navigate(`/app/track/${pkg.id}`)}
                      size="sm"
                      className="flex-1 text-xs font-bold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
                    >
                      {t.trackPackage}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedPackage === pkg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-[#1E293B]"
                    >
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{ar ? 'السبب' : 'Reason'}:</span>
                          <span className="text-white">{ar ? pkg.reasonAr : pkg.reason}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.weight}:</span>
                          <span className="text-white">{pkg.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.size}:</span>
                          <span className="text-white capitalize">{pkg.size}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#1E293B]">
                          <span className="text-slate-500">{t.price}:</span>
                          <span className="text-white">{formatCurrency(pkg.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.insurance}:</span>
                          <span className="text-white">{formatCurrency(pkg.insurance)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-[#1E293B]">
                          <span className="text-white">{t.total}:</span>
                          <span className="text-purple-400">
                            {formatCurrency(pkg.price + pkg.insurance)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Stats Banner */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-black text-purple-400">94%</p>
              <p className="text-[10px] text-slate-500">{ar ? 'نسبة النجاح' : 'Success Rate'}</p>
            </div>
            <div>
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-black text-blue-400">4h</p>
              <p className="text-[10px] text-slate-500">
                {ar ? 'متوسط التسليم' : 'Avg Delivery'}
              </p>
            </div>
            <div>
              <Package className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-black text-green-400">2.4k</p>
              <p className="text-[10px] text-slate-500">
                {ar ? 'إرجاعات ناجحة' : 'Returns Done'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}