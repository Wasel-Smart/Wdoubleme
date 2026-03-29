/**
 * EidSeasonalBanner — /features/cultural/EidSeasonalBanner.tsx
 *
 * CQ Pillar IV: Religious & Seasonal Intelligence
 * - Eid Al-Fitr & Eid Al-Adha subtle celebratory UI
 * - Traffic-aware trip availability during Eid
 * - Graceful, non-intrusive notification design
 * - Dismiss-able with preference memory
 *
 * Seasons:
 *   Eid Al-Fitr 2026:  ~March 30 - April 2 (end of Ramadan 1447)
 *   Eid Al-Adha 2026:  ~June 6 - June 9
 *
 * ✅ Bilingual | ✅ RTL | ✅ Dark-first | ✅ Relative imports
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Season Detection ──────────────────────────────────────────────────────────

type Season = 'eid_fitr' | 'eid_adha' | 'ramadan' | 'none';

function detectSeason(): Season {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Ramadan 2026: Mar 1 – Mar 30
  if (month === 3 && day >= 1 && day <= 30) return 'ramadan';
  // Eid Al-Fitr 2026: Mar 30 – Apr 2
  if ((month === 3 && day >= 30) || (month === 4 && day <= 2)) return 'eid_fitr';
  // Eid Al-Adha 2026: Jun 6 – Jun 9
  if (month === 6 && day >= 6 && day <= 9) return 'eid_adha';

  return 'none';
}

// ─── Season Config ─────────────────────────────────────────────────────────────

const SEASON_CONFIG = {
  ramadan: {
    gradient: 'linear-gradient(135deg, rgba(88,28,135,0.5), rgba(55,48,163,0.4), rgba(11,17,32,0.95))',
    border: 'rgba(139,92,246,0.35)',
    emoji: '🌙',
    titleEn: 'Ramadan Mubarak',
    titleAr: 'رمضان مبارك',
    msgEn: 'Special Iftar & Suhoor rides available. 10% off all month.',
    msgAr: 'رحلات إفطار وسحور خاصة. خصم ١٠٪ طول الشهر.',
    tagEn: 'Ramadan 1447',
    tagAr: 'رمضان ١٤٤٧',
    tagColor: '#8B5CF6',
    stars: 5,
  },
  eid_fitr: {
    gradient: 'linear-gradient(135deg, rgba(180,83,9,0.4), rgba(120,53,15,0.35), rgba(11,17,32,0.95))',
    border: 'rgba(245,158,11,0.4)',
    emoji: '🌙✨',
    titleEn: 'Eid Al-Fitr Mubarak',
    titleAr: 'عيد الفطر المبارك',
    msgEn: 'High demand expected. Book your Eid trips early to secure a seat.',
    msgAr: 'طلب عالٍ متوقع. احجز رحلتك العيدية مبكراً لضمان مقعدك.',
    tagEn: 'Eid Al-Fitr 2026',
    tagAr: 'عيد الفطر ٢٠٢٦',
    tagColor: '#F59E0B',
    stars: 7,
  },
  eid_adha: {
    gradient: 'linear-gradient(135deg, rgba(5,150,105,0.4), rgba(6,78,59,0.35), rgba(11,17,32,0.95))',
    border: 'rgba(16,185,129,0.4)',
    emoji: '🌿✨',
    titleEn: 'Eid Al-Adha Mubarak',
    titleAr: 'عيد الأضحى المبارك',
    msgEn: 'Plan your Eid Al-Adha journey with Wasel. Family-friendly rides available.',
    msgAr: 'خطط لرحلتك في عيد الأضحى مع واصل. رحلات عائلية متاحة.',
    tagEn: 'Eid Al-Adha 2026',
    tagAr: 'عيد الأضحى ٢٠٢٦',
    tagColor: '#10B981',
    stars: 7,
  },
  none: null,
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface EidSeasonalBannerProps {
  /** Force a specific season for testing/preview */
  forceSeason?: Season;
  className?: string;
}

export function EidSeasonalBanner({ forceSeason, className = '' }: EidSeasonalBannerProps) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [dismissed, setDismissed] = useState(false);
  const [season] = useState<Season>(() => forceSeason || detectSeason());

  const config = SEASON_CONFIG[season];

  // Persist dismiss per season
  useEffect(() => {
    const key = `wasel_banner_dismissed_${season}`;
    try {
      if (localStorage.getItem(key) === 'true') setDismissed(true);
    } catch {}
  }, [season]);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(`wasel_banner_dismissed_${season}`, 'true'); } catch {}
  };

  if (!config || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden rounded-2xl ${className}`}
        style={{
          background: config.gradient,
          border: `1px solid ${config.border}`,
          margin: '0 0 16px 0',
        }}
        dir={ar ? 'rtl' : 'ltr'}
      >
        {/* Animated stars decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: config.stars }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + (i * 13) % 90}%`,
                opacity: 0.25,
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 15, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-4">
          <div className="flex items-start gap-3">
            {/* Emoji */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl flex-shrink-0 mt-0.5 leading-none"
            >
              {config.emoji}
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="font-black text-white"
                  style={{ fontWeight: 900, fontSize: '0.95rem' }}
                >
                  {ar ? config.titleAr : config.titleEn}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: config.tagColor,
                    border: `1px solid ${config.tagColor}40`,
                  }}
                >
                  {ar ? config.tagAr : config.tagEn}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'rgba(203,213,225,0.9)', fontSize: '0.78rem' }}
              >
                {ar ? config.msgAr : config.msgEn}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 mt-0.5"
              aria-label={ar ? 'إغلاق' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" style={{ color: 'rgba(148,163,184,0.8)' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
