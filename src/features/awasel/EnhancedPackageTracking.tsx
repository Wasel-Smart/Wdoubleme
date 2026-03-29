/**
 * Enhanced Package Tracking
 * Full transparency for package sender with live updates, QR codes, and secure payment
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  packageTrackingService, 
  PackageTracking, 
  PackagePaymentEscrow 
} from '../../services/packageTrackingService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Package,
  MapPin,
  User,
  Car,
  Phone,
  MessageSquare,
  Shield,
  DollarSign,
  QrCode,
  Camera,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Eye,
  Copy,
  Download,
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { useTranslation } from '../../components/hooks/useTranslation';

interface EnhancedPackageTrackingProps {
  packageId: string;
  onClose?: () => void;
}

export function EnhancedPackageTracking({ packageId, onClose }: EnhancedPackageTrackingProps) {
  const { t, language } = useTranslation();
  const isArabic = language === 'ar';

  const [pkg, setPkg] = useState<PackageTracking | undefined>();
  const [escrow, setEscrow] = useState<PackagePaymentEscrow | undefined>();
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load package data
    const packageData = packageTrackingService.getPackage(packageId);
    setPkg(packageData);

    const escrowData = packageTrackingService.getEscrowStatus(packageId);
    setEscrow(escrowData);

    // Set up real-time updates (polling every 10 seconds)
    const interval = setInterval(() => {
      const updated = packageTrackingService.getPackage(packageId);
      setPkg(updated);
    }, 10000);

    return () => clearInterval(interval);
  }, [packageId]);

  const copyTrackingCode = () => {
    if (pkg) {
      navigator.clipboard.writeText(pkg.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    if (pkg) {
      const link = document.createElement('a');
      link.href = pkg.qrCodeUrl;
      link.download = `wasel-package-${pkg.trackingCode}.png`;
      link.click();
    }
  };

  const getStatusColor = (status: PackageTracking['status']) => {
    switch (status) {
      case 'created': return 'bg-gray-500';
      case 'matched': return 'bg-blue-500';
      case 'pickup_scheduled': return 'bg-indigo-500';
      case 'picked_up': return 'bg-purple-500';
      case 'in_transit': return 'bg-amber-500';
      case 'near_destination': return 'bg-orange-500';
      case 'delivered': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      case 'disputed': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: PackageTracking['status']) => {
    const labels: Record<PackageTracking['status'], { en: string; ar: string }> = {
      created: { en: 'Waiting for Traveler', ar: 'بانتظار المسافر' },
      matched: { en: 'Matched with Traveler', ar: 'تم الربط مع مسافر' },
      pickup_scheduled: { en: 'Pickup Scheduled', ar: 'تم جدولة الاستلام' },
      picked_up: { en: 'Picked Up', ar: 'تم الاستلام' },
      in_transit: { en: 'In Transit', ar: 'قيد التوصيل' },
      near_destination: { en: 'Near Destination', ar: 'قريب من الوجهة' },
      delivered: { en: 'Delivered', ar: 'تم التوصيل' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
      disputed: { en: 'Disputed', ar: 'نزاع' },
    };
    return isArabic ? labels[status].ar : labels[status].en;
  };

  const getPaymentStatusLabel = (status: PackageTracking['paymentStatus']) => {
    const labels: Record<PackageTracking['paymentStatus'], { en: string; ar: string }> = {
      pending: { en: 'Payment Pending', ar: 'الدفع معلق' },
      escrowed: { en: 'Held Securely', ar: 'محفوظ بأمان' },
      released: { en: 'Released to Driver', ar: 'تم تحويله للسائق' },
      refunded: { en: 'Refunded', ar: 'تم الاسترجاع' },
    };
    return isArabic ? labels[status].ar : labels[status].en;
  };

  if (!pkg) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Package not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tracking Code */}
      <Card className="p-6 bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {isArabic ? 'تتبع الطرد' : 'Package Tracking'}
            </h2>
            <p className="text-teal-100 text-sm">
              {isArabic ? 'تتبع مباشر مع الأمان الكامل' : 'Live tracking with full security'}
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          )}
        </div>

        {/* Tracking Code */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-teal-100 mb-1">
                {isArabic ? 'رمز التتبع' : 'Tracking Code'}
              </div>
              <div className="text-2xl font-mono font-bold tracking-wider">
                {pkg.trackingCode}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyTrackingCode}
                className="text-white hover:bg-white/20"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQRCode(!showQRCode)}
                className="text-white hover:bg-white/20"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center gap-3">
          <Badge className={cn("text-white", getStatusColor(pkg.status))}>
            {getStatusLabel(pkg.status)}
          </Badge>
          <Badge className="bg-white/20 text-white">
            {pkg.from} → {pkg.to}
          </Badge>
        </div>
      </Card>

      {/* QR Code Display */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 text-center">
              <h3 className="font-semibold mb-4">
                {isArabic ? 'رمز الاستجابة السريعة' : 'QR Code'}
              </h3>
              <img 
                src={pkg.qrCodeUrl} 
                alt="Package QR Code"
                className="w-64 h-64 mx-auto border-4 border-gray-200 dark:border-gray-700 rounded-xl"
              />
              <Button onClick={downloadQRCode} className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                {isArabic ? 'تحميل' : 'Download'}
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {isArabic 
                  ? 'استخدم هذا الرمز للتحقق من الاستلام والتسليم'
                  : 'Use this code to verify pickup and delivery'}
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Information (if matched) */}
      {pkg.driverId && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold">
              {isArabic ? 'معلومات السائق' : 'Driver Information'}
            </h3>
            <Badge className="bg-emerald-500 text-white ml-auto">
              {isArabic ? 'متصل' : 'Connected'}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {pkg.driverPhoto ? (
                <img 
                  src={pkg.driverPhoto} 
                  alt={pkg.driverName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
              )}
              <div>
                <div className="font-semibold text-lg">{pkg.driverName}</div>
                {pkg.vehicleInfo && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {pkg.vehicleInfo}
                  </div>
                )}
              </div>
            </div>

            {pkg.senderCanContactDriver && (
              <div className="flex gap-2">
                <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                  <Phone className="w-4 h-4 mr-2" />
                  {isArabic ? 'اتصل' : 'Call'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isArabic ? 'رسالة' : 'Message'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Payment Security */}
      <Card className="p-6 border-2 border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold">
            {isArabic ? 'الأمان المالي' : 'Payment Security'}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-950 rounded-xl">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'حالة الدفع' : 'Payment Status'}
              </div>
              <div className="font-semibold text-lg">
                {getPaymentStatusLabel(pkg.paymentStatus)}
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-teal-600" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'السعر' : 'Price'}
              </div>
              <div className="font-semibold">JOD {pkg.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'التأمين' : 'Insurance'}
              </div>
              <div className="font-semibold">
                {pkg.insurance ? `JOD ${pkg.insuranceCost.toFixed(2)}` : '-'}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'المجموع' : 'Total'}
              </div>
              <div className="font-bold text-xl text-teal-600">
                JOD {pkg.totalCost.toFixed(2)}
              </div>
            </div>
          </div>

          {escrow && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                    {isArabic ? '💰 مبلغك محفوظ بأمان' : '💰 Your money is held securely'}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300">
                    {isArabic 
                      ? 'سيتم تحويل المبلغ للسائق فقط بعد تأكيد التسليم بالصورة'
                      : 'Payment will be released to driver only after verified delivery with photo'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Verification Codes */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold">
            {isArabic ? 'رموز التحقق' : 'Verification Codes'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {isArabic ? 'رمز الاستلام' : 'Pickup Code'}
            </div>
            <div className="text-2xl font-mono font-bold text-purple-600">
              {pkg.pickupVerificationCode}
            </div>
            {pkg.pickupVerified && (
              <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto mt-2" />
            )}
          </div>
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {isArabic ? 'رمز التسليم' : 'Delivery Code'}
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-600">
              {pkg.deliveryVerificationCode}
            </div>
            {pkg.deliveryVerified && (
              <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto mt-2" />
            )}
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 text-center">
          {isArabic 
            ? 'شارك هذه الرموز مع المستلم فقط'
            : 'Share these codes with receiver only'}
        </p>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold">
            {isArabic ? 'تسلسل الأحداث' : 'Timeline'}
          </h3>
        </div>

        <div className="space-y-4">
          <TimelineItem
            icon={Package}
            label={isArabic ? 'تم إنشاء الطرد' : 'Package Created'}
            time={pkg.createdAt}
            completed={true}
          />
          {pkg.status !== 'created' && (
            <TimelineItem
              icon={Car}
              label={isArabic ? 'تم الربط مع سائق' : 'Matched with Driver'}
              time={pkg.lastUpdated}
              completed={true}
            />
          )}
          {pkg.pickedUpAt && (
            <TimelineItem
              icon={CheckCircle}
              label={isArabic ? 'تم الاستلام' : 'Picked Up'}
              time={pkg.pickedUpAt}
              completed={true}
              photo={pkg.pickupPhoto}
            />
          )}
          {pkg.inTransitAt && (
            <TimelineItem
              icon={MapPin}
              label={isArabic ? 'قيد التوصيل' : 'In Transit'}
              time={pkg.inTransitAt}
              completed={true}
            />
          )}
          {pkg.deliveredAt && (
            <TimelineItem
              icon={CheckCircle}
              label={isArabic ? 'تم التوصيل' : 'Delivered'}
              time={pkg.deliveredAt}
              completed={true}
              photo={pkg.deliveryPhoto}
            />
          )}
        </div>
      </Card>

      {/* Current Location (if in transit) */}
      {pkg.currentLocation && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold">
              {isArabic ? 'الموقع الحالي' : 'Current Location'}
            </h3>
            <Badge className="bg-amber-500 text-white ml-auto animate-pulse">
              {isArabic ? 'مباشر' : 'Live'}
            </Badge>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lat: {pkg.currentLocation.lat.toFixed(4)}, Lng: {pkg.currentLocation.lng.toFixed(4)}
            </p>
            <Button variant="link" className="mt-2">
              <Eye className="w-4 h-4 mr-2" />
              {isArabic ? 'عرض على الخريطة' : 'View on Map'}
            </Button>
          </div>
        </Card>
      )}

      {/* Package Details */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">
          {isArabic ? 'تفاصيل الطرد' : 'Package Details'}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'الحجم' : 'Size'}
            </div>
            <div className="font-semibold capitalize">{pkg.size}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'القيمة' : 'Value'}
            </div>
            <div className="font-semibold">JOD {pkg.value}</div>
          </div>
          {pkg.description && (
            <div className="col-span-2">
              <div className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'الوصف' : 'Description'}
              </div>
              <div className="font-semibold">{pkg.description}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE ITEM
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  time: Date;
  completed: boolean;
  photo?: string;
}

function TimelineItem({ icon: Icon, label, time, completed, photo }: TimelineItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        completed ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
      )}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {time.toLocaleString()}
        </div>
        {photo && (
          <img 
            src={photo} 
            alt={label}
            className="mt-2 w-32 h-32 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
          />
        )}
      </div>
    </div>
  );
}
