/**
 * ComingSoon Enhanced - Feature-specific placeholder pages
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router';
import {
  Sparkles, Bell, ArrowLeft, Clock, Rocket, Package, MessageCircle,
  Award, Share2, Wallet, Heart, Settings, Shield, Map,
  Moon, Users, Zap, Star, HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors } from '../../styles/wasel-design-system';

const C = WaselColors;

interface FeatureInfo {
  icon: any;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  eta: string;
  color: string;
}

const FEATURE_MAP: Record<string, FeatureInfo> = {
  'messages': {
    icon: MessageCircle,
    titleEn: 'In-App Messaging', titleAr: 'الرسائل الداخلية',
    descEn: 'Chat directly with drivers and passengers before and during trips',
    descAr: 'تواصل مباشرة مع السائقين والركاب قبل وأثناء الرحلة',
    eta: 'Q2 2026', color: C.cyan,
  },
  'awasel/track': {
    icon: Package,
    titleEn: 'Live Package Tracking', titleAr: 'تتبع الطرود المباشر',
    descEn: 'Track your package in real-time with GPS and QR code verification',
    descAr: 'تتبع طردك بالوقت الفعلي مع GPS والتحقق بكود QR',
    eta: 'April 2026', color: '#D9965B',
  },
  'badges': {
    icon: Award,
    titleEn: 'Achievement Badges', titleAr: 'شارات الإنجاز',
    descEn: 'Earn badges for completing trips, being a top driver, and more',
    descAr: 'اكسب شارات لإكمال الرحلات وكونك سائق متميز وأكثر',
    eta: 'May 2026', color: C.gold,
  },
  'referrals': {
    icon: Share2,
    titleEn: 'Referral Program', titleAr: 'برنامج الإحالة',
    descEn: 'Invite friends and earn JOD 10 for each new user',
    descAr: 'ادع أصدقاءك واربح 10 د.أ لكل مستخدم جديد',
    eta: 'April 2026', color: C.green,
  },
  'wallet': {
    icon: Wallet,
    titleEn: 'Digital Wallet', titleAr: 'المحفظة الرقمية',
    descEn: 'Store money, view earnings, and instant cashout',
    descAr: 'احفظ المال، راجع الأرباح، وسحب فوري',
    eta: 'Q2 2026', color: C.purple,
  },
  'favorites': {
    icon: Heart,
    titleEn: 'Favorite Routes', titleAr: 'المسارات المفضلة',
    descEn: 'Save your frequent routes and get notified of new rides',
    descAr: 'احفظ مساراتك المتكررة واستلم إشعارات بالرحلات الجديدة',
    eta: 'May 2026', color: C.red,
  },
  'settings': {
    icon: Settings,
    titleEn: 'App Settings', titleAr: 'إعدادات التطبيق',
    descEn: 'Customize notifications, privacy, language, and more',
    descAr: 'خصص الإشعارات والخصوصية واللغة وأكثر',
    eta: 'Q2 2026', color: '#64748B',
  },
  'cultural/prayer-stops': {
    icon: Moon,
    titleEn: 'Prayer Stop Planner', titleAr: 'مخطط وقفات الصلاة',
    descEn: 'Automatically find mosques along your route with prayer times',
    descAr: 'ابحث تلقائياً عن المساجد على مسارك مع أوقات الصلاة',
    eta: 'April 2026', color: C.gold,
  },
  'cultural/gender-preferences': {
    icon: Users,
    titleEn: 'Gender Preferences', titleAr: 'تفضيلات النوع',
    descEn: 'Filter rides by gender (women-only, men-only, or mixed)',
    descAr: 'فلتر الرحلات حسب النوع (نسائي، رجالي، أو مختلط)',
    eta: 'April 2026', color: C.purple,
  },
  'safety': {
    icon: Shield,
    titleEn: 'Safety Center', titleAr: 'مركز السلامة',
    descEn: 'SOS button, trip sharing, insurance claims, and safety tips',
    descAr: 'زر الطوارئ، مشاركة الرحلة، مطالبات التأمين، ونصائح السلامة',
    eta: 'Q2 2026', color: C.green,
  },
  'routes': {
    icon: Map,
    titleEn: 'Popular Routes', titleAr: 'المسارات الشائعة',
    descEn: 'Discover the most traveled routes and average prices',
    descAr: 'اكتشف المسارات الأكثر استخداماً ومتوسط الأسعار',
    eta: 'May 2026', color: C.cyan,
  },
  'help': {
    icon: HelpCircle,
    titleEn: 'Help Center', titleAr: 'مركز المساعدة',
    descEn: 'FAQs, guides, and 24/7 support chat',
    descAr: 'الأسئلة الشائعة، الأدلة، ودعم الدردشة 24/7',
    eta: 'April 2026', color: C.purple,
  },
  'default': {
    icon: Rocket,
    titleEn: 'Coming Soon', titleAr: 'قريباً',
    descEn: 'This feature is under development and will be available soon',
    descAr: 'هذه الميزة قيد التطوير وستكون متاحة قريباً',
    eta: 'Q2 2026', color: C.cyan,
  },
};

export function ComingSoonEnhanced() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const path = location.pathname.replace('/app/', '');
  const feature = FEATURE_MAP[path] || FEATURE_MAP['default'];
  const Icon = feature.icon;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: C.bg }}
      dir={dir}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl w-full"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-3xl mx-auto mb-8 flex items-center justify-center relative"
          style={{ background: `${feature.color}15`, border: `2px solid ${feature.color}30` }}
        >
          <Icon className="w-16 h-16" style={{ color: feature.color }} />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          {isAr ? feature.titleAr : feature.titleEn}
        </h1>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: `${C.cyan}20`, border: `1px solid ${C.cyan}40` }}>
          <Clock className="w-4 h-4" style={{ color: C.cyan }} />
          <span className="text-sm font-bold" style={{ color: C.cyan }}>
            {isAr ? 'قريباً' : 'Coming Soon'} · {feature.eta}
          </span>
        </div>

        <p className="text-xl mb-12 max-w-lg mx-auto leading-relaxed"
          style={{ color: 'rgba(148,163,184,0.75)' }}>
          {isAr ? feature.descAr : feature.descEn}
        </p>

        <div className="mb-12">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${feature.color}, ${feature.color}80)` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => alert(isAr ? 'سنرسل لك إشعار عند الإطلاق!' : "We'll notify you when it's ready!")}
            className="px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-lg"
            style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}CC)` }}
          >
            <Bell className="w-5 h-5" />
            {isAr ? 'أعلمني عند الإطلاق' : 'Notify me when ready'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app')}
            className="px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-lg"
            style={{ background: 'rgba(255,255,255,0.05)', border: `2px solid rgba(255,255,255,0.1)` }}
          >
            <ArrowLeft className="w-5 h-5" />
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </motion.button>
        </div>

        <div className="mt-12 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: feature.color }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
