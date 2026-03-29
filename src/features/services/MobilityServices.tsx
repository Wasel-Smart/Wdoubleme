/**
 * MobilityServices - All Wasel transportation services
 * Shows carpooling, on-demand, packages, and future services
 */

import { motion } from 'motion/react';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import {
  Car, Zap, Package, Bus, Plane, Ship, Bike, Truck,
  Clock, MapPin, Users, Shield, Star, TrendingUp,
  ArrowRight, Sparkles, CheckCircle, Globe, Navigation,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors, WaselGradients } from '../../styles/wasel-design-system';

const C = WaselColors;

// ══════════════════════════════════════════════════════════════════════════════
// SERVICE DATA
// ══════════════════════════════════════════════════════════════════════════════

interface Service {
  id: string;
  icon: any;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  color: string;
  gradient: string;
  route?: string;
  status: 'active' | 'coming-soon';
  features: { en: string; ar: string }[];
  stats?: { label: string; value: string; labelAr: string }[];
}

const SERVICES: Service[] = [
  {
    id: 'carpooling',
    icon: Car,
    titleEn: 'Wasel | واصل',
    titleAr: 'واصل | Carpooling',
    descEn: 'Share rides with travelers already going your way. Save money, meet people.',
    descAr: 'شارك الرحلات مع مسافرين رايحين نفس وجهتك. وفر فلوس وتعرف على ناس.',
    color: C.cyan,
    gradient: WaselGradients.cyan,
    route: '/app/find-ride',
    status: 'active',
    features: [
      { en: 'Advance booking (24h+)', ar: 'حجز مسبق (24 ساعة+)' },
      { en: 'Cost-sharing model', ar: 'نموذج تقاسم التكلفة' },
      { en: 'Intercity trips', ar: 'رحلات بين المدن' },
      { en: 'Community-driven', ar: 'يعتمد على المجتمع' },
    ],
    stats: [
      { label: 'Active Routes', value: '50+', labelAr: 'مسارات نشطة' },
      { label: 'Avg. Savings', value: '60%', labelAr: 'متوسط التوفير' },
      { label: 'Drivers', value: '1,200+', labelAr: 'سائق' },
    ],
  },
  {
    id: 'on-demand',
    icon: Zap,
    titleEn: 'On-Demand Rides',
    titleAr: 'رحلات فورية',
    descEn: 'Request a ride now. Professional drivers, real-time matching, <5 min wait.',
    descAr: 'اطلب رحلة الآن. سائقين محترفين، مطابقة فورية، انتظار أقل من 5 دقائق.',
    color: C.orange,
    gradient: WaselGradients.orange,
    route: '/app/services/on-demand-rides',
    status: 'active',
    features: [
      { en: 'Real-time matching', ar: 'مطابقة فورية' },
      { en: 'Professional drivers', ar: 'سائقين محترفين' },
      { en: '<5 min wait time', ar: 'انتظار أقل من 5 دقائق' },
      { en: 'Dynamic pricing', ar: 'تسعير ديناميكي' },
    ],
    stats: [
      { label: 'Avg. Wait', value: '<5min', labelAr: 'متوسط الانتظار' },
      { label: 'Match Rate', value: '95%', labelAr: 'نسبة المطابقة' },
      { label: 'Drivers', value: '500+', labelAr: 'سائق' },
    ],
  },
  {
    id: 'awasel',
    icon: Package,
    titleEn: 'Awasel | أوصل',
    titleAr: 'أوصل | Package Delivery',
    descEn: 'Send packages with travelers already going there. Cheaper than couriers.',
    descAr: 'ابعث طرودك مع مسافرين رايحين هناك. أرخص من شركات التوصيل.',
    color: '#D9965B',
    gradient: 'linear-gradient(135deg, #D9965B, #B87A47)',
    route: '/app/awasel/send',
    status: 'active',
    features: [
      { en: 'QR code verification', ar: 'تحقق بكود QR' },
      { en: 'Real-time tracking', ar: 'تتبع فوري' },
      { en: 'Insurance coverage', ar: 'تغطية تأمينية' },
      { en: 'Same-day delivery', ar: 'توصيل نفس اليوم' },
    ],
    stats: [
      { label: 'Avg. Price', value: 'JOD 5', labelAr: 'متوسط السعر' },
      { label: 'Savings', value: '60%', labelAr: 'التوفير' },
      { label: 'Packages/Day', value: '200+', labelAr: 'طرد/يوم' },
    ],
  },
  {
    id: 'wasel-bus',
    icon: Bus,
    titleEn: 'Wasel Bus',
    titleAr: 'حافلات واصل',
    descEn: 'Scheduled shuttle buses on popular routes. Guaranteed seats, AC, WiFi.',
    descAr: 'حافلات مجدولة على المسارات الشائعة. مقاعد مضمونة، تكييف، واي فاي.',
    color: C.purple,
    gradient: WaselGradients.purple,
    status: 'coming-soon',
    features: [
      { en: 'Fixed schedules', ar: 'جداول ثابتة' },
      { en: 'Guaranteed seats', ar: 'مقاعد مضمونة' },
      { en: 'AC + WiFi', ar: 'تكييف + واي فاي' },
      { en: 'Popular routes only', ar: 'مسارات شائعة فقط' },
    ],
    stats: [
      { label: 'Routes', value: '10', labelAr: 'مسارات' },
      { label: 'Capacity', value: '50/bus', labelAr: 'السعة' },
      { label: 'Frequency', value: 'Hourly', labelAr: 'التردد' },
    ],
  },
  {
    id: 'wasel-delivery',
    icon: Truck,
    titleEn: 'Wasel Delivery',
    titleAr: 'توصيل واصل',
    descEn: 'Dedicated package delivery service. Professional couriers, same-day delivery.',
    descAr: 'خدمة توصيل طرود مخصصة. مندوبين محترفين، توصيل نفس اليوم.',
    color: C.green,
    gradient: WaselGradients.green,
    status: 'coming-soon',
    features: [
      { en: 'Professional couriers', ar: 'مندوبين محترفين' },
      { en: 'Same-day delivery', ar: 'توصيل نفس اليوم' },
      { en: 'Live tracking', ar: 'تتبع مباشر' },
      { en: 'Insurance included', ar: 'تأمين مشمول' },
    ],
    stats: [
      { label: 'Delivery Time', value: '<2h', labelAr: 'وقت التوصيل' },
      { label: 'Coverage', value: '5 cities', labelAr: 'التغطية' },
      { label: 'Success Rate', value: '99%', labelAr: 'نسبة النجاح' },
    ],
  },
  {
    id: 'wasel-bike',
    icon: Bike,
    titleEn: 'Wasel Bike',
    titleAr: 'دراجات واصل',
    descEn: 'Bike-sharing for short trips. Eco-friendly, healthy, affordable.',
    descAr: 'مشاركة الدراجات للرحلات القصيرة. صديقة للبيئة، صحية، رخيصة.',
    color: C.cyan,
    gradient: WaselGradients.cyan,
    status: 'coming-soon',
    features: [
      { en: 'Unlock with app', ar: 'افتح بالتطبيق' },
      { en: 'Pay per minute', ar: 'ادفع بالدقيقة' },
      { en: 'Eco-friendly', ar: 'صديقة للبيئة' },
      { en: 'City-wide stations', ar: 'محطات في كل المدينة' },
    ],
    stats: [
      { label: 'Stations', value: '50+', labelAr: 'محطات' },
      { label: 'Bikes', value: '500+', labelAr: 'دراجات' },
      { label: 'Price', value: 'JOD 0.10/min', labelAr: 'السعر' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function MobilityServices() {
  const navigate = useIframeSafeNavigate();
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const handleServiceClick = (service: Service) => {
    if (service.status === 'active' && service.route) {
      navigate(service.route);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: C.bg }}
      dir={dir}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `${C.cyan}20`,
                border: `2px solid ${C.cyan}40`,
              }}
            >
              <Globe className="w-8 h-8" style={{ color: C.cyan }} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {isAr ? 'خدمات التنقل' : 'Mobility Services'}
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {isAr
              ? 'منصة متكاملة للنقل الذكي. اختر الخدمة المناسبة لاحتياجاتك'
              : 'Complete intelligent transportation platform. Choose the service that fits your needs'}
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: 'Services', labelAr: 'خدمات', value: '6' },
              { label: 'Active', labelAr: 'نشطة', value: '3' },
              { label: 'Users', labelAr: 'مستخدمين', value: '10K+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{isAr ? stat.labelAr : stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            const isActive = service.status === 'active';

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={isActive ? { scale: 1.02, y: -4 } : {}}
                onClick={() => handleServiceClick(service)}
                className={`relative overflow-hidden rounded-2xl border ${
                  isActive ? 'cursor-pointer' : 'opacity-75'
                }`}
                style={{
                  background: 'rgba(9,21,37,0.8)',
                  borderColor: `${service.color}30`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {isActive ? (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        background: `${C.green}20`,
                        color: C.green,
                        border: `1px solid ${C.green}40`,
                      }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {isAr ? 'نشط' : 'Active'}
                    </div>
                  ) : (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        background: `${C.orange}20`,
                        color: C.orange,
                        border: `1px solid ${C.orange}40`,
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      {isAr ? 'قريباً' : 'Soon'}
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div className="p-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: `${service.color}15`,
                      border: `2px solid ${service.color}30`,
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: service.color }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isAr ? service.titleAr : service.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {isAr ? service.descAr : service.descEn}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3 h-3 shrink-0" style={{ color: service.color }} />
                        <span>{isAr ? feature.ar : feature.en}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  {service.stats && (
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                      {service.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="text-sm font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-slate-500">
                            {isAr ? stat.labelAr : stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  {isActive && service.route && (
                    <motion.div
                      whileHover={{ x: isAr ? -4 : 4 }}
                      className="mt-4 flex items-center gap-2 text-sm font-bold"
                      style={{ color: service.color }}
                    >
                      <span>{isAr ? 'ابدأ الآن' : 'Get Started'}</span>
                      <ArrowRight className="w-4 h-4" style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
                    </motion.div>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ background: service.gradient }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Coming Soon Services Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-2xl text-center"
          style={{
            background: `${C.cyan}10`,
            border: `1px solid ${C.cyan}20`,
          }}
        >
          <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: C.cyan }} />
          <h3 className="text-lg font-bold text-white mb-2">
            {isAr ? 'المزيد قريباً!' : 'More Coming Soon!'}
          </h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            {isAr
              ? 'نعمل على إضافة المزيد من خدمات التنقل لجعل تنقلك أسهل وأرخص'
              : "We're working on adding more mobility services to make your transportation easier and cheaper"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}