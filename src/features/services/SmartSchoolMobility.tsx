/**
 * SmartSchoolMobility — /features/services/SmartSchoolMobility.tsx
 * 
 * Smart School Mobility Network: Revolutionary hybrid scheduled/on-demand school transport
 * using Sanad-vetted drivers to fix shortages, safety, attendance, and parent anxiety.
 * 
 * Features:
 * - QR/NFC student tracking (pickup/drop-off)
 * - Live GPS + parent notifications
 * - AI routing to fill seats
 * - Attendance log to school dashboard
 * - Vetted driver pool (same as carpooling)
 * - Supplemental marketplace (parents/teachers as backups)
 * 
 * ✅ Phase 4: Smart School Mobility as foundation layer
 * ✅ Unified Day-1 launch with carpooling
 * ✅ Bilingual: Arabic (Jordanian dialect) + English
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  School,
  Bus,
  Users,
  Calendar,
  Shield,
  Star,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  QrCode,
  Bell,
  TrendingUp,
  AlertCircle,
  Phone,
  Map,
  Zap,
  Eye,
  ScanFace,
  Radio,
  Navigation,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { formatCurrency } from '../../utils/currency';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SchoolRoute {
  id: string;
  school: string;
  schoolAr: string;
  area: string;
  areaAr: string;
  driverName: string;
  driverNameAr: string;
  busNumber: string;
  seatsAvailable: number;
  seatsTotal: number;
  morningPickup: string;
  afternoonDropoff: string;
  monthlyPrice: number;
  rating: number;
  verified: boolean;
  sanadVerified: boolean;
  route: string[];
  routeAr: string[];
  features: string[];
}

interface StudentStatus {
  id: string;
  name: string;
  nameAr: string;
  grade: string;
  school: string;
  status: 'waiting' | 'on_bus' | 'at_school' | 'delivered';
  busNumber: string;
  eta: string;
  location: string;
  lastUpdate: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const SCHOOL_ROUTES: SchoolRoute[] = [
  {
    id: 'sm1',
    school: 'Amman Baccalaureate School',
    schoolAr: 'مدرسة عمان البكالوريا',
    area: 'Abdoun → ABS',
    areaAr: 'عبدون ← المدرسة',
    driverName: 'Ahmad Al-Rashidi',
    driverNameAr: 'أحمد الرشيدي',
    busNumber: 'BUS-102',
    seatsAvailable: 2,
    seatsTotal: 7,
    morningPickup: '06:45',
    afternoonDropoff: '14:30',
    monthlyPrice: 75,
    rating: 4.9,
    verified: true,
    sanadVerified: true,
    route: ['Abdoun Circle', 'Rainbow St', 'Sweifieh', 'ABS'],
    routeAr: ['دوار عبدون', 'شارع الرينبو', 'السويفية', 'المدرسة'],
    features: ['qr_tracking', 'live_gps', 'parent_notifications', 'ai_camera'],
  },
  {
    id: 'sm2',
    school: 'Irbid National School',
    schoolAr: 'المدرسة الوطنية إربد',
    area: 'Irbid Center → INS',
    areaAr: 'وسط إربد ← المدرسة',
    driverName: 'Rima Abu-Hassan',
    driverNameAr: 'ريما أبو حسن',
    busNumber: 'BUS-205',
    seatsAvailable: 3,
    seatsTotal: 6,
    morningPickup: '07:00',
    afternoonDropoff: '13:30',
    monthlyPrice: 65,
    rating: 5.0,
    verified: true,
    sanadVerified: true,
    route: ['Irbid Center', 'University St', 'Yarmouk University', 'INS'],
    routeAr: ['وسط إربد', 'شارع الجامعة', 'جامعة اليرموك', 'المدرسة'],
    features: ['qr_tracking', 'live_gps', 'parent_notifications'],
  },
  {
    id: 'sm3',
    school: 'King Abdullah II School',
    schoolAr: 'مدرسة الملك عبدالله الثاني',
    area: 'Zarqa → KAIS',
    areaAr: 'الزرقاء ← المدرسة',
    driverName: 'Khalid Al-Shammari',
    driverNameAr: 'خالد الشمري',
    busNumber: 'BUS-308',
    seatsAvailable: 1,
    seatsTotal: 8,
    morningPickup: '06:30',
    afternoonDropoff: '14:00',
    monthlyPrice: 70,
    rating: 4.8,
    verified: true,
    sanadVerified: true,
    route: ['Zarqa Gate', 'Hashemite University', 'KAIS'],
    routeAr: ['بوابة الزرقاء', 'الجامعة الهاشمية', 'المدرسة'],
    features: ['qr_tracking', 'live_gps', 'parent_notifications', 'ai_camera', 'seatbelt_sensors'],
  },
];

const STUDENT_STATUS_SAMPLE: StudentStatus[] = [
  {
    id: 's1',
    name: 'Layla Ahmed',
    nameAr: 'ليلى أحمد',
    grade: 'KG2',
    school: 'ABS',
    status: 'on_bus',
    busNumber: 'BUS-102',
    eta: '7 min',
    location: 'Rainbow St',
    lastUpdate: 'Just now',
  },
  {
    id: 's2',
    name: 'Omar Khaled',
    nameAr: 'عمر خالد',
    grade: 'Grade 5',
    school: 'ABS',
    status: 'at_school',
    busNumber: 'BUS-102',
    eta: '—',
    location: 'ABS Campus',
    lastUpdate: '2 min ago',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function SmartSchoolMobility() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'routes' | 'tracking' | 'stats'>('routes');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [enrolledRoutes, setEnrolledRoutes] = useState<string[]>([]);

  const t = {
    title: ar ? 'شبكة النقل المدرسي الذكي' : 'Smart School Mobility Network',
    subtitle: ar
      ? 'نقل مدرسي آمن وموثوق مع تتبع حي وإشعارات للأهالي'
      : 'Safe, reliable school transport with live tracking & parent notifications',
    routes: ar ? 'المسارات' : 'Routes',
    tracking: ar ? 'التتبع المباشر' : 'Live Tracking',
    stats: ar ? 'الإحصائيات' : 'Statistics',
    perMonth: ar ? 'دينار/شهر' : 'JOD/month',
    morning: ar ? 'الصباح' : 'Morning',
    afternoon: ar ? 'بعد الظهر' : 'Afternoon',
    seatsLeft: ar ? 'مقاعد متبقية' : 'seats left',
    enroll: ar ? 'سجّل طفلك' : 'Enroll Child',
    enrolled: ar ? 'مسجّل ✅' : 'Enrolled ✅',
    verified: ar ? 'سائق موثّق' : 'Verified Driver',
    sanadVerified: ar ? 'موثّق عبر سند 🇯🇴' : 'Sanad Verified 🇯🇴',
    viewRoute: ar ? 'عرض المسار' : 'View Route',
    liveGPS: ar ? 'GPS حي' : 'Live GPS',
    qrTracking: ar ? 'تتبع QR' : 'QR Tracking',
    aiCamera: ar ? 'كاميرا ذكية' : 'AI Camera',
    parentNotifications: ar ? 'إشعارات الأهل' : 'Parent Alerts',
    seatbeltSensors: ar ? 'حساس حزام الأمان' : 'Seatbelt Sensors',
    benefits: {
      safe: ar ? 'آمن 100%' : '100% Safe',
      safeDesc: ar ? 'سائقون موثّقون عبر سند' : 'Sanad-verified drivers',
      tracked: ar ? 'تتبع مباشر' : 'Live Tracked',
      trackedDesc: ar ? 'GPS + إشعارات فورية' : 'GPS + instant alerts',
      affordable: ar ? 'وفّر ٤٠٪' : 'Save 40%',
      affordableDesc: ar ? 'أرخص من النقل المدرسي' : 'vs. traditional bus',
      smart: ar ? 'ذكي' : 'Smart',
      smartDesc: ar ? 'AI للتوجيه الأمثل' : 'AI route optimization',
    },
    studentStatus: ar ? 'حالة الطالب' : 'Student Status',
    eta: ar ? 'الوقت المتوقع' : 'ETA',
    lastUpdate: ar ? 'آخر تحديث' : 'Last Update',
    callDriver: ar ? 'اتصل بالسائق' : 'Call Driver',
    attendanceRate: ar ? 'معدل الحضور' : 'Attendance Rate',
    onTimeRate: ar ? 'معدل الالتزام بالوقت' : 'On-Time Rate',
    parentSatisfaction: ar ? 'رضا الأهل' : 'Parent Satisfaction',
    totalRides: ar ? 'إجمالي الرحلات' : 'Total Rides',
  };

  const statusIcon = (status: StudentStatus['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'on_bus':
        return <Bus className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'at_school':
        return <School className="w-5 h-5 text-green-400" />;
      case 'delivered':
        return <Check className="w-5 h-5 text-green-500" />;
    }
  };

  const statusColor = (status: StudentStatus['status']) => {
    switch (status) {
      case 'waiting':
        return 'border-l-yellow-400';
      case 'on_bus':
        return 'border-l-blue-400';
      case 'at_school':
        return 'border-l-green-400';
      case 'delivered':
        return 'border-l-green-500';
    }
  };

  const featureIcon = (feature: string) => {
    switch (feature) {
      case 'qr_tracking':
        return <QrCode className="w-3.5 h-3.5" />;
      case 'live_gps':
        return <Navigation className="w-3.5 h-3.5" />;
      case 'parent_notifications':
        return <Bell className="w-3.5 h-3.5" />;
      case 'ai_camera':
        return <Eye className="w-3.5 h-3.5" />;
      case 'seatbelt_sensors':
        return <Shield className="w-3.5 h-3.5" />;
      default:
        return <Zap className="w-3.5 h-3.5" />;
    }
  };

  const featureLabel = (feature: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      qr_tracking: { en: 'QR Scan', ar: 'مسح QR' },
      live_gps: { en: 'Live GPS', ar: 'GPS حي' },
      parent_notifications: { en: 'Alerts', ar: 'إشعارات' },
      ai_camera: { en: 'AI Cam', ar: 'كاميرا AI' },
      seatbelt_sensors: { en: 'Seatbelt', ar: 'حزام أمان' },
    };
    return ar ? labels[feature]?.ar || feature : labels[feature]?.en || feature;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="wasel-container mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
              🚌
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-white text-lg">{t.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
            </div>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
              {ar ? 'سند موثّق 🇯🇴' : 'Sanad Verified 🇯🇴'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="wasel-container mx-auto p-4 space-y-4">
        {/* Benefits Banner */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🛡️', label: t.benefits.safe, desc: t.benefits.safeDesc },
              { icon: '📍', label: t.benefits.tracked, desc: t.benefits.trackedDesc },
              { icon: '💰', label: t.benefits.affordable, desc: t.benefits.affordableDesc },
              { icon: '🤖', label: t.benefits.smart, desc: t.benefits.smartDesc },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="text-2xl">{b.icon}</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-yellow-400">{b.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="routes">{t.routes}</TabsTrigger>
            <TabsTrigger value="tracking">{t.tracking}</TabsTrigger>
            <TabsTrigger value="stats">{t.stats}</TabsTrigger>
          </TabsList>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-4 mt-4">
            {SCHOOL_ROUTES.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="bg-card border-border p-4 hover:border-yellow-500/20 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm">
                          {ar ? route.schoolAr : route.school}
                        </p>
                        {route.sanadVerified && (
                          <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[9px] px-1.5 py-0">
                            🇯🇴
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ar ? route.areaAr : route.area}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-black text-yellow-400">
                        {formatCurrency(route.monthlyPrice)}
                      </p>
                      <p className="text-[10px] text-slate-600">{t.perMonth}</p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-[#0B1120]/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {(ar ? route.driverNameAr : route.driverName).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">
                        {ar ? route.driverNameAr : route.driverName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{route.busNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          {route.rating}
                        </span>
                      </div>
                    </div>
                    {route.verified && (
                      <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.morningPickup} {t.morning}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.afternoonDropoff} {t.afternoon}
                    </span>
                  </div>

                  {/* Seats Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">{t.seatsLeft}</span>
                      <span className="font-semibold text-slate-300">
                        {route.seatsAvailable}/{route.seatsTotal}
                      </span>
                    </div>
                    <Progress
                      value={((route.seatsTotal - route.seatsAvailable) / route.seatsTotal) * 100}
                      className="h-1.5"
                    />
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {route.features.map((f) => (
                      <Badge
                        key={f}
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 gap-1 border-slate-700 text-slate-400"
                      >
                        {featureIcon(f)}
                        {featureLabel(f)}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-[#1E293B] text-slate-400 hover:bg-white/5"
                      onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                    >
                      <Map className="w-3 h-3 mr-1" />
                      {t.viewRoute}
                    </Button>
                    <Button
                      onClick={() =>
                        setEnrolledRoutes((prev) =>
                          enrolledRoutes.includes(route.id)
                            ? prev
                            : [...prev, route.id]
                        )
                      }
                      size="sm"
                      className={`flex-1 text-xs font-bold ${
                        enrolledRoutes.includes(route.id)
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25'
                      }`}
                      variant={enrolledRoutes.includes(route.id) ? 'outline' : 'default'}
                    >
                      {enrolledRoutes.includes(route.id) ? t.enrolled : t.enroll}
                    </Button>
                  </div>

                  {/* Route Details (Expandable) */}
                  <AnimatePresence>
                    {selectedRoute === route.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-[#1E293B]"
                      >
                        <p className="text-xs font-semibold text-slate-400 mb-2">
                          {ar ? 'محطات المسار:' : 'Route Stops:'}
                        </p>
                        <div className="space-y-1.5">
                          {(ar ? route.routeAr : route.route).map((stop, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  idx === 0
                                    ? 'bg-green-400'
                                    : idx === route.route.length - 1
                                    ? 'bg-red-400'
                                    : 'bg-slate-600'
                                }`}
                              />
                              <span>{stop}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4 mt-4">
            {STUDENT_STATUS_SAMPLE.map((student) => (
              <Card
                key={student.id}
                className={`bg-card border-border border-l-4 ${statusColor(student.status)} p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-white text-sm">
                      {ar ? student.nameAr : student.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.school} • {student.grade}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] ${
                      student.status === 'at_school' || student.status === 'delivered'
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : student.status === 'on_bus'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    }`}
                    variant="outline"
                  >
                    {student.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#0B1120]/50 rounded-lg mb-3">
                  {statusIcon(student.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {student.status === 'on_bus'
                        ? ar
                          ? 'في الطريق'
                          : 'En route'
                        : student.status === 'at_school'
                        ? ar
                          ? 'وصل المدرسة بسلام'
                          : 'Arrived safely at school'
                        : ar
                        ? 'بانتظار الحافلة'
                        : 'Waiting for pickup'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.lastUpdate}: {student.lastUpdate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-[#1E293B] pt-3">
                  <div className="space-y-1">
                    <p className="text-slate-500">{t.eta}:</p>
                    <p className="font-semibold text-white">{student.eta}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-slate-500">{ar ? 'الموقع' : 'Location'}:</p>
                    <p className="font-semibold text-white">{student.location}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Live Map Placeholder */}
            <Card className="h-[300px] bg-card border-border flex items-center justify-center border-dashed">
              <div className="text-center text-slate-500">
                <Radio className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                <p className="font-semibold">{ar ? 'خريطة مباشرة' : 'Live Map'}</p>
                <p className="text-xs mt-1">{ar ? 'تتبع GPS فوري' : 'Real-time GPS tracking'}</p>
              </div>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-green-400">96.5%</p>
                <p className="text-xs text-slate-500 mt-1">{t.attendanceRate}</p>
              </Card>

              <Card className="bg-card border-border p-4 text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-400">94.2%</p>
                <p className="text-xs text-slate-500 mt-1">{t.onTimeRate}</p>
              </Card>

              <Card className="bg-card border-border p-4 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2 fill-yellow-400" />
                <p className="text-2xl font-black text-yellow-400">4.9</p>
                <p className="text-xs text-slate-500 mt-1">{t.parentSatisfaction}</p>
              </Card>

              <Card className="bg-card border-border p-4 text-center">
                <Bus className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-black text-primary">1,247</p>
                <p className="text-xs text-slate-500 mt-1">{t.totalRides}</p>
              </Card>
            </div>

            {/* Impact Banner */}
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  🌟
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-400 text-sm mb-1">
                    {ar ? 'تأثير إيجابي على التعليم' : 'Positive Educational Impact'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {ar
                      ? 'تحسين معدل الحضور بنسبة 21% وتقليل التأخير بنسبة 44% مقارنة بالنقل التقليدي'
                      : '21% attendance improvement, 44% tardiness reduction vs. traditional transport'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 p-4 text-center">
          <p className="font-bold text-white mb-2">
            {ar ? 'هل أنت سائق موثّق عبر سند؟' : 'Sanad-Verified Driver?'}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            {ar
              ? 'انضم لشبكة النقل المدرسي واكسب دخل إضافي'
              : 'Join our school network and earn supplemental income'}
          </p>
          <Button
            onClick={() => navigate('/app/driver/onboarding')}
            className="w-full bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/30"
          >
            <Shield className="w-4 h-4 mr-2" />
            {ar ? 'سجّل كسائق مدرسة' : 'Register as School Driver'}
          </Button>
        </Card>
      </div>
    </div>
  );
}