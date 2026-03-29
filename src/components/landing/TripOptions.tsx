import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, CheckCircle, TrendingDown, Users, Clock,
  MapPin, Calendar, DollarSign, Zap, Star, Route,
  Navigation, Sparkles, Award, Shield,
  Heart, ThumbsUp, Repeat, TrendingUp, Info,
  ArrowRightLeft, Brain, HelpCircle, BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect, useRef, useMemo } from 'react';
import { WaselBadge } from '../wasel-ui/WaselBadge';
import { WaselSectionHeader } from '../wasel-ui/WaselSectionHeader';

// ─── Animated Counter with description ────────────────────────────────────────

function Counter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(end * easeOutQuart));
      if (percentage < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Tooltip component ────────────────────────────────────────────────────────

function Tooltip({ text, textAr, children }: { text: string; textAr?: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 sm:w-64 px-3 py-2 rounded-xl bg-[#1E293B] border border-[#334155] shadow-xl text-left pointer-events-none"
          >
            <span className="text-[11px] text-slate-200 leading-relaxed block">{text}</span>
            {textAr && <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5" dir="rtl">{textAr}</span>}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-[#1E293B] border-r border-b border-[#334155] rotate-45" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// ─── Stat card with full description ──────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  color: string;
  delay: number;
}

function StatCard({ icon: Icon, value, suffix, label, labelAr, description, descriptionAr, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-card border border-border p-5 group hover:border-muted-foreground/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <Tooltip text={description} textAr={descriptionAr}>
          <button className="p-1 text-slate-600 hover:text-slate-400 transition-colors" tabIndex={0} aria-label={`Info: ${label}`}>
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
        <Counter end={value} suffix={suffix} duration={1800} />
      </div>
      <div className="text-sm text-slate-300 font-medium">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5" dir="rtl">{labelAr}</div>
      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed line-clamp-2">{description}</p>
    </motion.div>
  );
}

// ─── Trip Card Component ──────────────────────────────────────────────────────

interface TripCardProps {
  type: 'wasel' | 'awasel';
  title: string;
  arabicTitle: string;
  description: string;
  descriptionAr: string;
  gradient: string;
  borderColor: string;
  accentBg: string;
  accentText: string;
  features: { icon: any; title: string; titleAr: string; description: string }[];
  useCases: { en: string; ar: string }[];
  stats: { icon: any; label: string; labelAr: string; value: number; suffix: string; description: string; descriptionAr: string; color: string }[];
  routes: { from: string; fromAr: string; to: string; toAr: string; price: string; savings?: string }[];
  imageUrl: string;
  index: number;
}

function TripCard({
  type, title, arabicTitle, description, descriptionAr, gradient,
  borderColor, accentBg, accentText, features, useCases, stats, routes, imageUrl, index
}: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group"
    >
      <div className={`rounded-3xl bg-gradient-to-br from-[#111B2E] to-[#0D1526] border ${borderColor} overflow-hidden hover:border-opacity-60 transition-all shadow-xl`}>
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={`${title} service`}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-40`} />
          
          {/* Icon Badge Overlay */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute top-4 left-4 w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
          >
            {type === 'wasel' ? <ArrowRight className="w-7 h-7 text-white" /> : <ArrowRightLeft className="w-7 h-7 text-white" />}
          </motion.div>
        </div>

        {/* Header */}
        <div className={`relative bg-gradient-to-br ${gradient} p-8 sm:p-10 overflow-hidden`}>
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }} />

          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-1 text-white">{title}</h2>
            <p className="text-xl font-bold text-white/70 mb-3">{arabicTitle}</p>
            <p className="text-white/85 text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
            <p className="text-white/50 text-xs max-w-sm mx-auto mt-1" dir="rtl">{descriptionAr}</p>
          </div>
        </div>

        {/* Stats Bar — Every stat has description + Arabic */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-[#1E293B]">
          {stats.map((stat, idx) => (
            <Tooltip key={idx} text={stat.description} textAr={stat.descriptionAr}>
              <div className="text-center cursor-help w-full" tabIndex={0}>
                <div className={`text-xl sm:text-2xl font-bold text-white mb-0.5 flex items-center justify-center gap-1`}>
                  <Counter end={stat.value} suffix={stat.suffix} duration={1500} />
                </div>
                <div className="text-[11px] text-slate-300 font-medium">{stat.label}</div>
                <div className="text-[9px] text-slate-600" dir="rtl">{stat.labelAr}</div>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* Features */}
        <div className="p-5 sm:p-6">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accentText}`} />
            Key Features
          </h3>
          <p className="text-[10px] text-slate-600 mb-4" dir="rtl">الميزات الرئيسية</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`flex items-start gap-3 p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] hover:border-[#334155] transition-all`}
              >
                <div className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-4 h-4 ${accentText}`} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-xs">{feature.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5" dir="rtl">{feature.titleAr}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Popular Routes */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Route className={`w-4 h-4 ${accentText}`} />
              Popular Routes in Jordan
            </h3>
            <p className="text-[10px] text-slate-600 mb-3" dir="rtl">مسارات شائعة في الأردن</p>

            <div className="space-y-2">
              {routes.map((route, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRoute(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedRoute === idx
                      ? `${borderColor} bg-white/5`
                      : 'border-[#1E293B] hover:border-[#334155] bg-[#0B1120]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${selectedRoute === idx ? accentText : 'text-slate-500'}`} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {route.from} → {route.to}
                        </div>
                        <div className="text-[10px] text-slate-600" dir="rtl">
                          {route.fromAr} ← {route.toAr}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className={`text-lg font-bold ${accentText}`}>{route.price}</div>
                      {route.savings && (
                        <div className="text-[10px] text-emerald-400 font-medium">Save {route.savings}</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Use Cases — Expandable */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B1120] border border-[#1E293B] hover:border-[#334155] transition-colors mb-3"
            >
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className={`w-4 h-4 ${accentText}`} />
                  Perfect For
                </h3>
                <p className="text-[10px] text-slate-600" dir="rtl">مثالي لـ</p>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ArrowRight className={`w-4 h-4 ${accentText} rotate-90`} />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                    {useCases.map((uc, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center gap-2 p-2.5 bg-[#0B1120] rounded-lg border border-[#1E293B]"
                      >
                        <CheckCircle className={`w-4 h-4 ${accentText} flex-shrink-0`} />
                        <div className="min-w-0">
                          <span className="text-xs text-slate-300 block truncate">{uc.en}</span>
                          <span className="text-[10px] text-slate-600 block" dir="rtl">{uc.ar}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
            <Button className={`w-full bg-gradient-to-r ${gradient} text-white text-sm h-12 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold`}>
              Choose {title} • اختر {arabicTitle}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function TripOptions() {
  const tripTypes: TripCardProps[] = [
    {
      type: 'wasel',
      title: 'Wasel',
      arabicTitle: 'واصل',
      description: 'One-way carpooling trips — share a ride to any single destination across Jordan at the lowest per-seat cost.',
      descriptionAr: 'رحلات مشاركة ذهاب فقط — شارك ال��حلة إلى أي وجهة في الأردن بأقل تكلفة.',
      gradient: 'from-[#00C9A7] to-[#06B6D4]',
      borderColor: 'border-primary/20',
      accentBg: 'bg-primary/10',
      accentText: 'text-primary',
      stats: [
        {
          icon: Users, value: 35000, suffix: '+', label: 'Active Riders', labelAr: 'راكب نشط',
          description: 'Total Wasel riders who completed at least one trip this month across all Jordanian cities.',
          descriptionAr: 'إجمالي ركاب واصل الذين أكملوا رحلة واحدة على الأقل هذا الشهر.',
          color: 'text-primary'
        },
        {
          icon: TrendingDown, value: 70, suffix: '%', label: 'Avg. Savings', labelAr: 'متوسط التوفير',
          description: 'Average percentage riders save vs. solo taxi fares on the same route. Calculated from 50K+ completed trips.',
          descriptionAr: 'متوسط نسبة التوفير مقارنة بأسعار التاكسي الفردي على نفس المسار.',
          color: 'text-emerald-400'
        },
        {
          icon: Star, value: 49, suffix: '', label: '4.9 / 5 Rating', labelAr: 'تقييم ٤.٩ من ٥',
          description: 'Aggregate star rating from both riders and drivers, updated daily. Based on 12K+ verified reviews.',
          descriptionAr: 'تقييم النجوم الإجمالي من الركاب والسائقين، يُحدّث يوميًا.',
          color: 'text-amber-400'
        },
      ],
      features: [
        { icon: Clock, title: 'Flexible Scheduling', titleAr: 'جدولة مرنة', description: 'Book a seat for any time that suits you — morning commute, afternoon run, or late evening.' },
        { icon: Brain, title: 'AI Instant Matching', titleAr: 'مطابقة ذكية فورية', description: 'Our AI finds compatible riders heading your way within seconds, minimizing wait time.' },
        { icon: DollarSign, title: 'Pay Per Seat', titleAr: 'ادفع لكل مقعد', description: 'No hidden fees. You pay a fixed per-seat price in JOD — lower commitment, zero contracts.' },
        { icon: Zap, title: '30-Second Booking', titleAr: 'حجز في ٣٠ ثانية', description: 'From search to confirmed seat in under 30 seconds. The fastest booking in Jordan.' },
      ],
      useCases: [
        { en: 'Airport transfers (Queen Alia)', ar: 'التوصيل للمطار (الملكة علياء)' },
        { en: 'One-time business meetings', ar: 'اجتماعات عمل لمرة واحدة' },
        { en: 'Shopping trips to City Mall', ar: 'رحلات تسوق إلى سيتي مول' },
        { en: 'Medical appointments', ar: 'مواعيد طبية' },
        { en: 'University commutes', ar: 'التنقل للجامعة' },
        { en: 'Weekend Dead Sea visits', ar: 'زيارات البحر الميت في العطلة' },
      ],
      routes: [
        { from: 'Amman', fromAr: 'عمان', to: 'Zarqa', toAr: 'الزرقاء', price: '1.50 JOD', savings: '65%' },
        { from: 'Amman', fromAr: 'عمان', to: 'Irbid', toAr: 'إربد', price: '3.00 JOD', savings: '70%' },
        { from: 'Amman', fromAr: 'عمان', to: 'Aqaba', toAr: 'العقبة', price: '12.00 JOD', savings: '60%' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1759696302360-69e7b2121736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwb29sJTIwY2FycG9vbGluZyUyMHBlb3BsZSUyMHNoYXJpbmclMjByaWRlJTIwaGlnaHdheXxlbnwxfHx8fDE3NzE5MjYyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      index: 0,
    },
    {
      type: 'awasel',
      title: 'Awasel',
      arabicTitle: 'أوصل',
      description: 'Send packages with travelers already heading your way — faster and cheaper than couriers.',
      descriptionAr: 'ابعث طرودك مع مسافرين رايحين وجهتك — أسرع وأرخص من شركات الشحن.',
      gradient: 'from-[#04ADBF] to-[#09732E]',
      borderColor: 'border-primary/20',
      accentBg: 'bg-primary/10',
      accentText: 'text-primary',
      stats: [
        {
          icon: Users, value: 35000, suffix: '+', label: 'Active Riders', labelAr: 'راكب نشط',
          description: 'Total Wasel riders who completed at least one trip this month across all Jordanian cities.',
          descriptionAr: 'إجمالي ركاب واصل الذين أكملوا رحلة واحدة على الأقل هذا الشهر.',
          color: 'text-primary'
        },
        {
          icon: TrendingDown, value: 15, suffix: '%', label: 'Extra Savings', labelAr: 'توفير إضافي',
          description: 'The additional discount you get by bundling outbound + return vs. booking two separate one-way Wasel trips.',
          descriptionAr: 'الخصم الإضافي عند حجز الذهاب والعودة معًا مقارنة بحجز رحلتين منفصلتين.',
          color: 'text-emerald-400'
        },
        {
          icon: Star, value: 49, suffix: '', label: '4.9 / 5 Rating', labelAr: 'تقييم ٤.٩ من ٥',
          description: 'Average satisfaction rating from Awasel senders. Travelers are rated after each delivery.',
          descriptionAr: 'متوسط تقييم رضا مرسلي أوصل بعد إتمام التوصيل.',
          color: 'text-amber-400'
        },
      ],
      features: [
        { icon: Repeat, title: 'Round-Trip Convenience', titleAr: 'راحة الذهاب والعودة', description: 'Book both legs in one tap. Your return ride is guaranteed and pre-confirmed.' },
        { icon: TrendingDown, title: 'Bundle Discount', titleAr: 'خصم الحزمة', description: 'Save an additional 15% on combined fare vs. two separate one-way bookings.' },
        { icon: Users, title: 'Same Driver Option', titleAr: 'خيار نفس السائق', description: 'Request the same driver for your return trip — familiarity and comfort.' },
        { icon: Calendar, title: 'Scheduled Returns', titleAr: 'عودة مجدولة', description: 'Set your return pickup time at booking. Driver arrives exactly when you need.' },
      ],
      useCases: [
        { en: 'Daily work commutes (7th Circle → KHBP)', ar: 'التنقل اليومي للعمل' },
        { en: 'University daily (Khalda → UJ)', ar: 'الجامعة يوميًا' },
        { en: 'Weekly client visits', ar: 'زيارات أسبوعية للعملاء' },
        { en: 'Regular medical check-ups', ar: 'فحوصات طبية دورية' },
        { en: 'Gym / fitness classes', ar: 'نادي رياضي / لياقة' },
        { en: 'School pickup & dropoff', ar: 'توصيل المدرسة ذهاب وعودة' },
      ],
      routes: [
        { from: 'Amman', fromAr: 'عمان', to: 'Zarqa', toAr: 'الزرقاء', price: '2.50 JOD', savings: '15% off' },
        { from: 'Amman', fromAr: 'عمان', to: 'Salt', toAr: 'السلط', price: '2.80 JOD', savings: '15% off' },
        { from: 'Irbid', fromAr: 'إربد', to: 'Amman', toAr: 'عمان', price: '5.10 JOD', savings: '15% off' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1663668112782-ac5599d3b018?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB0cnVuayUyMHBhY2thZ2VzJTIwbHVnZ2FnZSUyMHRyYXZlbCUyMHJvYWQlMjB0cmlwfGVufDF8fHx8MTc3MTkyNjU1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      index: 1,
    },
  ];

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-5"
          >
            <Award className="w-3.5 h-3.5" />
            Choose Your Journey Style • اختر أسلوب رحلتك
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white"
          >
            Flexible Trip Options
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Choose the journey that fits your needs — whether it's a one-time trip or a regular commute. 
            All prices in JOD (Jordanian Dinar), all rides verified and insured.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs text-slate-600 mt-2" dir="rtl"
          >
            اختر الرحلة التي تناسب احتياجاتك — سواء كانت رحلتك — مرة وحدة أو تنقل يومي.
          </motion.p>
        </div>

        {/* Trip Type Cards */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {tripTypes.map((trip) => (
            <TripCard key={trip.type} {...trip} />
          ))}
        </div>

        {/* Trust Indicators — every one described */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-5xl mx-auto"
        >
          {[
            {
              icon: Shield, label: 'Verified Drivers', labelAr: 'سائقون موثقون',
              desc: 'Every driver passes a background check, license verification, and vehicle inspection before accepting rides.',
              color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20'
            },
            {
              icon: Star, label: '4.9/5 Rating', labelAr: 'تقييم ٤.٩ من ٥',
              desc: 'Aggregate platform rating from 12K+ verified rider and driver reviews, updated in real-time.',
              color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20'
            },
            {
              icon: Heart, label: '99% Satisfaction', labelAr: '٩٩٪ رضا',
              desc: 'Percentage of riders who rated their experience 4 stars or above after completing a trip.',
              color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20'
            },
            {
              icon: ThumbsUp, label: '63K+ Trips', labelAr: '+٦٣ ألف رحلة',
              desc: 'Total trips completed across all routes in Jordan since launch — and growing daily.',
              color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20'
            },
          ].map((item, idx) => (
            <Tooltip key={idx} text={item.desc}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className={`text-center p-5 rounded-2xl bg-card border ${item.border} cursor-help w-full`}
                tabIndex={0}
              >
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="font-bold text-white text-sm">{item.label}</div>
                <div className="text-[10px] text-slate-600 mt-0.5" dir="rtl">{item.labelAr}</div>
              </motion.div>
            </Tooltip>
          ))}
        </motion.div>
      </div>
    </section>
  );
}