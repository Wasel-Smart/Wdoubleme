/**
 * Ramadan Mode Banner
 * Displays during Ramadan with respectful UI adjustments
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, Clock, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { WaselColors, WaselRadius } from '../../tokens/wasel-tokens';
import { Button } from '../../components/ui/button';
import {
  isRamadan,
  getRamadanDay,
  daysRemainingInRamadan,
  getRamadanGreeting,
  loadRamadanPreferences,
  type RamadanPreferences,
} from '../../services/ramadan';

export function RamadanModeBanner() {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [preferences, setPreferences] = useState<RamadanPreferences | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [ramadanDay, setRamadanDay] = useState<number | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const translations = {
    en: {
      greeting: getRamadanGreeting('en'),
      day: 'Day',
      daysRemaining: 'days remaining',
      peakHoursWarning: 'Peak hours before Iftar - expect delays',
      blessedMonth: 'We wish you a blessed Ramadan',
      dismiss: 'Dismiss',
    },
    ar: {
      greeting: getRamadanGreeting('ar'),
      day: 'اليوم',
      daysRemaining: 'يوم متبقي',
      peakHoursWarning: 'ساعات الذروة قبل الإفطار - توقع تأخيرات',
      blessedMonth: 'نتمنى لك رمضان مبارك',
      dismiss: 'إغلاق',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prefs = await loadRamadanPreferences();
    setPreferences(prefs);

    if (prefs.autoEnableMode && isRamadan()) {
      setIsActive(true);
      setRamadanDay(getRamadanDay());
      setDaysRemaining(daysRemainingInRamadan());
    }
  };

  if (!isActive || dismissed || !preferences) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${WaselColors.navyCard}, ${WaselColors.teal}15)`,
          borderRadius: WaselRadius.lg,
          border: `1px solid ${WaselColors.teal}30`,
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-2 left-4 opacity-20">
          <Moon className="h-8 w-8" style={{ color: WaselColors.teal }} />
        </div>
        <div className="absolute bottom-2 right-4 opacity-20">
          <Star className="h-6 w-6" style={{ color: WaselColors.bronze }} />
        </div>

        <div className={`${rtl.flex(language)} items-start justify-between relative z-10`}>
          <div className="flex-1">
            {/* Greeting */}
            <div className={`${rtl.flex(language)} items-center gap-3 mb-2`}>
              <div
                className="p-2 rounded-full"
                style={{
                  background: `${WaselColors.teal}20`,
                }}
              >
                <Moon className="h-5 w-5" style={{ color: WaselColors.teal }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: WaselColors.textPrimary }}
              >
                {txt.greeting}
              </h3>
            </div>

            {/* Ramadan Info */}
            <div className={`${rtl.flex(language)} items-center gap-4 mt-3 flex-wrap`}>
              {ramadanDay && (
                <div className={`${rtl.flex(language)} items-center gap-2`}>
                  <Calendar className="h-4 w-4" style={{ color: WaselColors.bronze }} />
                  <span className="text-sm" style={{ color: WaselColors.textSecondary }}>
                    {txt.day} {ramadanDay}
                  </span>
                </div>
              )}
              
              {daysRemaining && (
                <div className={`${rtl.flex(language)} items-center gap-2`}>
                  <Clock className="h-4 w-4" style={{ color: WaselColors.bronze }} />
                  <span className="text-sm" style={{ color: WaselColors.textSecondary }}>
                    {daysRemaining} {txt.daysRemaining}
                  </span>
                </div>
              )}
            </div>

            {/* Blessed message */}
            <p
              className="mt-2 text-sm"
              style={{ color: WaselColors.textSecondary }}
            >
              {txt.blessedMonth}
            </p>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="ml-2"
          >
            <X className="h-4 w-4" style={{ color: WaselColors.textSecondary }} />
          </Button>
        </div>

        {/* Animated stars decoration */}
        <motion.div
          className="absolute top-4 right-20 opacity-40"
          animate={{
            y: [0, -5, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Star className="h-3 w-3" style={{ color: WaselColors.bronze }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Calendar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}