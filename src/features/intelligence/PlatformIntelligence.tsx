/**
 * PlatformIntelligence - AI-powered features and analytics
 * Shows corridor intelligence, predictive analytics, demand heatmaps
 */

import { motion } from 'motion/react';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import {
  Brain, TrendingUp, Map, Zap, Target, BarChart3, LineChart,
  Navigation, Sparkles, Activity, Eye, Cpu, Network, Layers,
  ArrowRight, CheckCircle, Clock, MapPin, Users, Package,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors, WaselGradients } from '../../styles/wasel-design-system';

const C = WaselColors;

// ══════════════════════════════════════════════════════════════════════════════
// AI FEATURES DATA
// ══════════════════════════════════════════════════════════════════════════════

interface AIFeature {
  id: string;
  icon: any;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  color: string;
  gradient: string;
  status: 'active' | 'beta' | 'coming-soon';
  benefits: { en: string; ar: string }[];
  stats?: { label: string; value: string; labelAr: string }[];
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'corridor-intelligence',
    icon: Navigation,
    titleEn: 'Corridor Intelligence',
    titleAr: 'ذكاء المسارات',
    descEn: 'AI predicts demand on routes 24h-7d ahead. Pre-position drivers in high-demand areas.',
    descAr: 'الذكاء الاصطناعي يتنبأ بالطلب على المسارات قبل 24 ساعة-7 أيام. وضع السائقين مسبقاً في المناطق عالية الطلب.',
    color: C.cyan,
    gradient: WaselGradients.cyan,
    status: 'active',
    benefits: [
      { en: 'Forecast demand 7 days ahead', ar: 'توقع الطلب قبل 7 أيام' },
      { en: 'Pre-position drivers', ar: 'وضع السائقين مسبقاً' },
      { en: 'Optimize earnings', ar: 'تحسين الأرباح' },
      { en: 'Reduce wait times', ar: 'تقليل أوقات الانتظار' },
    ],
    stats: [
      { label: 'Accuracy', value: '87%', labelAr: 'الدقة' },
      { label: 'Routes Tracked', value: '50+', labelAr: 'مسارات متابعة' },
      { label: 'Predictions', value: '24/7', labelAr: 'التنبؤات' },
    ],
  },
  {
    id: 'smart-matching',
    icon: Target,
    titleEn: 'Smart Trip Matching',
    titleAr: 'مطابقة الرحلات الذكية',
    descEn: 'AI matches passengers with best driver based on ETA, rating, price, preferences.',
    descAr: 'الذكاء الاصطناعي يطابق الركاب مع أفضل سائق بناءً على وقت الوصول، التقييم، السعر، التفضيلات.',
    color: C.purple,
    gradient: WaselGradients.purple,
    status: 'active',
    benefits: [
      { en: 'Fastest pickup time', ar: 'أسرع وقت استلام' },
      { en: 'Best-rated drivers', ar: 'سائقين بأعلى تقييم' },
      { en: 'Cultural preferences', ar: 'تفضيلات ثقافية' },
      { en: '95% match success', ar: 'نجاح مطابقة 95%' },
    ],
    stats: [
      { label: 'Avg. Match Time', value: '<3s', labelAr: 'متوسط وقت المطابقة' },
      { label: 'Success Rate', value: '95%', labelAr: 'نسبة النجاح' },
      { label: 'Factors', value: '8', labelAr: 'العوامل' },
    ],
  },
  {
    id: 'demand-heatmap',
    icon: Map,
    titleEn: 'Live Demand Heatmap',
    titleAr: 'خريطة الطلب المباشرة',
    descEn: 'Real-time visualization of high-demand areas. Drivers see where to go for max earnings.',
    descAr: 'تصور فوري للمناطق عالية الطلب. السائقين يشوفون وين يروحوا لأقصى أرباح.',
    color: C.orange,
    gradient: WaselGradients.orange,
    status: 'active',
    benefits: [
      { en: 'Color-coded zones', ar: 'مناطق مرمزة بالألوان' },
      { en: 'Predicted earnings', ar: 'أرباح متوقعة' },
      { en: 'Surge indicators', ar: 'مؤشرات الزيادة' },
      { en: 'Live requests count', ar: 'عدد الطلبات المباشرة' },
    ],
    stats: [
      { label: 'Update Freq.', value: '30s', labelAr: 'تحديث كل' },
      { label: 'Zones', value: '25+', labelAr: 'مناطق' },
      { label: 'Drivers Using', value: '80%', labelAr: 'السائقين المستخدمين' },
    ],
  },
  {
    id: 'trip-clustering',
    icon: Network,
    titleEn: 'Multi-Service Clustering',
    titleAr: 'تجميع الخدمات المتعددة',
    descEn: 'Combine passengers + packages in one trip. Maximize revenue per route.',
    descAr: 'دمج الركاب + الطرود في رحلة واحدة. زيادة الإيرادات لكل مسار.',
    color: C.green,
    gradient: WaselGradients.green,
    status: 'beta',
    benefits: [
      { en: 'Combine passengers + packages', ar: 'دمج الركاب + الطرود' },
      { en: 'Optimize pickup routes', ar: 'تحسين مسارات الاستلام' },
      { en: '+40% earnings', ar: '+40% أرباح' },
      { en: 'Minimal detours', ar: 'أقل انحرافات' },
    ],
    stats: [
      { label: 'Earnings Boost', value: '+40%', labelAr: 'زيادة الأرباح' },
      { label: 'Clusters/Day', value: '150+', labelAr: 'تجميعات/يوم' },
      { label: 'Detour Time', value: '<5min', labelAr: 'وقت الانحراف' },
    ],
  },
  {
    id: 'dynamic-pricing',
    icon: TrendingUp,
    titleEn: 'Dynamic Pricing Engine',
    titleAr: 'محرك التسعير الديناميكي',
    descEn: 'AI calculates optimal price based on supply/demand, weather, events.',
    descAr: 'الذكاء الاصطناعي يحسب السعر الأمثل بناءً على العرض/الطلب، الطقس، الأحداث.',
    color: C.gold,
    gradient: WaselGradients.gold,
    status: 'beta',
    benefits: [
      { en: 'Fair prices for users', ar: 'أسعار عادلة للمستخدمين' },
      { en: 'Fair earnings for drivers', ar: 'أرباح عادلة للسائقين' },
      { en: 'Weather adjustments', ar: 'تعديلات الطقس' },
      { en: 'Event surge pricing', ar: 'تسعير زيادة الأحداث' },
    ],
    stats: [
      { label: 'Surge Range', value: '1.0-3.0×', labelAr: 'نطاق الزيادة' },
      { label: 'Factors', value: '5', labelAr: 'العوامل' },
      { label: 'Update Freq.', value: '1min', labelAr: 'تحديث كل' },
    ],
  },
  {
    id: 'predictive-analytics',
    icon: BarChart3,
    titleEn: 'Predictive Analytics',
    titleAr: 'التحليلات التنبؤية',
    descEn: 'Forecast future demand, optimize driver schedules, predict trends.',
    descAr: 'توقع الطلب المستقبلي، تحسين جداول السائقين، توقع الاتجاهات.',
    color: C.purple,
    gradient: WaselGradients.purple,
    status: 'coming-soon',
    benefits: [
      { en: 'Weekly demand forecasts', ar: 'توقعات الطلب الأسبوعية' },
      { en: 'Event impact analysis', ar: 'تحليل تأثير الأحداث' },
      { en: 'Seasonal trends', ar: 'الاتجاهات الموسمية' },
      { en: 'Driver recommendations', ar: 'توصيات للسائقين' },
    ],
    stats: [
      { label: 'Forecast Range', value: '30 days', labelAr: 'نطاق التوقع' },
      { label: 'Accuracy', value: '85%', labelAr: 'الدقة' },
      { label: 'Data Points', value: '1M+', labelAr: 'نقاط البيانات' },
    ],
  },
  {
    id: 'route-optimizer',
    icon: MapPin,
    titleEn: 'Route Optimizer',
    titleAr: 'محسّن المسارات',
    descEn: 'AI suggests best routes for drivers to maximize earnings per hour.',
    descAr: 'الذكاء الاصطناعي يقترح أفضل مسارات للسائقين لزيادة الأرباح بالساعة.',
    color: C.cyan,
    gradient: WaselGradients.cyan,
    status: 'coming-soon',
    benefits: [
      { en: 'Intra-city vs intercity', ar: 'داخل المدينة vs بين المدن' },
      { en: 'Earnings predictions', ar: 'توقعات الأرباح' },
      { en: 'Effort vs reward', ar: 'الجهد vs المكافأة' },
      { en: 'Mixed strategies', ar: 'استراتيجيات مختلطة' },
    ],
    stats: [
      { label: 'Strategies', value: '3', labelAr: 'الاستراتيجيات' },
      { label: 'Earnings Boost', value: '+25%', labelAr: 'زيادة الأرباح' },
      { label: 'Time Saved', value: '30min/day', labelAr: 'وقت موفر' },
    ],
  },
  {
    id: 'fraud-detection',
    icon: Eye,
    titleEn: 'Fraud Detection',
    titleAr: 'كشف الاحتيال',
    descEn: 'AI monitors suspicious activity, fake accounts, and payment fraud.',
    descAr: 'الذكاء الاصطناعي يراقب النشاط المشبوه، الحسابات المزيفة، واحتيال الدفع.',
    color: C.red,
    gradient: 'linear-gradient(135deg, #FF4444, #CC0000)',
    status: 'active',
    benefits: [
      { en: 'Detect fake accounts', ar: 'كشف الحسابات المزيفة' },
      { en: 'Payment fraud prevention', ar: 'منع احتيال الدفع' },
      { en: 'Suspicious behavior alerts', ar: 'تنبيهات السلوك المشبوه' },
      { en: '99.9% accuracy', ar: 'دقة 99.9%' },
    ],
    stats: [
      { label: 'Threats Blocked', value: '500+', labelAr: 'تهديدات محظورة' },
      { label: 'Accuracy', value: '99.9%', labelAr: 'الدقة' },
      { label: 'Response Time', value: '<1s', labelAr: 'وقت الاستجابة' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function PlatformIntelligence() {
  const navigate = useIframeSafeNavigate();
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const activeFeatures = AI_FEATURES.filter(f => f.status === 'active');
  const betaFeatures = AI_FEATURES.filter(f => f.status === 'beta');
  const comingSoonFeatures = AI_FEATURES.filter(f => f.status === 'coming-soon');

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
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background: `${C.purple}20`,
                border: `2px solid ${C.purple}40`,
              }}
            >
              <Brain className="w-8 h-8" style={{ color: C.purple }} />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ background: C.purple, opacity: 0.2 }}
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {isAr ? 'ذكاء المنصة' : 'Platform Intelligence'}
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {isAr
              ? 'ذكاء اصطناعي متطور يحسّن كل جانب من تجربتك. توقعات، تحسينات، وقرارات ذكية'
              : 'Advanced AI that optimizes every aspect of your experience. Predictions, optimizations, and smart decisions'}
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'AI Features', labelAr: 'ميزات الذكاء', value: '8' },
              { label: 'Active', labelAr: 'نشطة', value: activeFeatures.length.toString() },
              { label: 'Predictions/Day', labelAr: 'توقعات/يوم', value: '10K+' },
              { label: 'Accuracy', labelAr: 'الدقة', value: '87%' },
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
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{isAr ? stat.labelAr : stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Features */}
        {activeFeatures.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" style={{ color: C.green }} />
              {isAr ? 'نشط الآن' : 'Active Now'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFeatures.map((feature, index) => (
                <FeatureCard key={feature.id} feature={feature} index={index} isAr={isAr} />
              ))}
            </div>
          </div>
        )}

        {/* Beta Features */}
        {betaFeatures.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6" style={{ color: C.gold }} />
              {isAr ? 'تجريبي (Beta)' : 'Beta Testing'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {betaFeatures.map((feature, index) => (
                <FeatureCard key={feature.id} feature={feature} index={index} isAr={isAr} />
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Features */}
        {comingSoonFeatures.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6" style={{ color: C.cyan }} />
              {isAr ? 'قريباً' : 'Coming Soon'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonFeatures.map((feature, index) => (
                <FeatureCard key={feature.id} feature={feature} index={index} isAr={isAr} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-8 rounded-2xl text-center"
          style={{
            background: `${C.purple}10`,
            border: `1px solid ${C.purple}20`,
          }}
        >
          <Cpu className="w-12 h-12 mx-auto mb-4" style={{ color: C.purple }} />
          <h3 className="text-2xl font-bold text-white mb-3">
            {isAr ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            {isAr
              ? 'كل ميزة مصممة لجعل تجربتك أفضل. من التنبؤ بالطلب إلى التسعير الديناميكي، نستخدم الذكاء الاصطناعي لتحسين كل شيء'
              : 'Every feature designed to make your experience better. From demand forecasting to dynamic pricing, we use AI to optimize everything'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE CARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

function FeatureCard({ feature, index, isAr }: { feature: AIFeature; index: number; isAr: boolean }) {
  const Icon = feature.icon;
  const statusColors = {
    active: C.green,
    beta: C.gold,
    'coming-soon': C.cyan,
  };
  const statusLabels = {
    active: { en: 'Active', ar: 'نشط' },
    beta: { en: 'Beta', ar: 'تجريبي' },
    'coming-soon': { en: 'Soon', ar: 'قريباً' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative overflow-hidden rounded-2xl border"
      style={{
        background: 'rgba(9,21,37,0.8)',
        borderColor: `${feature.color}30`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: `${statusColors[feature.status]}20`,
            color: statusColors[feature.status],
            border: `1px solid ${statusColors[feature.status]}40`,
          }}
        >
          {isAr ? statusLabels[feature.status].ar : statusLabels[feature.status].en}
        </div>
      </div>

      <div className="p-6">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: `${feature.color}15`,
            border: `2px solid ${feature.color}30`,
          }}
        >
          <Icon className="w-7 h-7" style={{ color: feature.color }} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">
          {isAr ? feature.titleAr : feature.titleEn}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          {isAr ? feature.descAr : feature.descEn}
        </p>

        {/* Benefits */}
        <div className="space-y-2 mb-4">
          {feature.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-3 h-3 shrink-0" style={{ color: feature.color }} />
              <span>{isAr ? benefit.ar : benefit.en}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        {feature.stats && (
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
            {feature.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">
                  {isAr ? stat.labelAr : stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: feature.gradient }}
      />
    </motion.div>
  );
}
