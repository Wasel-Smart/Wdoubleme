/**
 * ComingSoon - Universal placeholder for features in development
 */

import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Bell } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const C = {
  cyan: '#00C8E8',
  gold: '#F0A830',
  bg: '#040C18',
};

const content = {
  ar: {
    title: 'قريباً...',
    subtitle: 'نحن نعمل على هذه الميزة',
    description: 'هذه الميزة قيد التطوير وستكون متاحة قريباً.',
    notify: 'أعلمني عند الإطلاق',
    back: 'العودة للرئيسية',
  },
  en: {
    title: 'Coming Soon...',
    subtitle: "We're working on this feature",
    description: 'This feature is under development and will be available soon.',
    notify: 'Notify me when ready',
    back: 'Back to Home',
  },
};

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: any;
}

export function ComingSoon({ title, description, icon: Icon = Sparkles }: ComingSoonProps) {
  const { language, dir } = useLanguage();
  const t = content[language as 'ar' | 'en'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }} dir={dir}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: `${C.cyan}20` }}
        >
          <Icon className="w-12 h-12" style={{ color: C.cyan }} />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          {title || t.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-400 mb-4">{t.subtitle}</p>

        {/* Description */}
        <p className="text-slate-500 mb-8">
          {description || t.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${C.cyan}, #0095b8)`,
              boxShadow: `0 8px 24px ${C.cyan}40`,
            }}
          >
            <Bell className="w-5 h-5" />
            {t.notify}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {t.back}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Animation */}
        <div className="mt-12 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: C.cyan }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
