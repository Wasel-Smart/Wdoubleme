/**
 * Wasel Mode Switcher
 * Toggle between Carpooling and On-Demand modes
 */

import { motion } from 'motion/react';
import { Car, Zap, Package, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { rtl } from '@/utils/rtl';
import type { TripMode } from '@/types/mobility-os';

interface ModeSwitchProps {
  selectedMode: TripMode;
  onModeChange: (mode: TripMode) => void;
  className?: string;
}

export default function ModeSwitch({ selectedMode, onModeChange, className = '' }: ModeSwitchProps) {
  const { t, language } = useLanguage();
  
  const modes = [
    {
      id: 'carpooling' as TripMode,
      icon: Car,
      titleEn: 'Carpooling',
      titleAr: 'مشاركة رحلة',
      descEn: 'Save money, advance booking',
      descAr: 'وفّر المصاري، حجز مسبق',
      color: 'from-teal-500 to-cyan-500',
      badge: 'Best Price',
      badgeAr: 'أرخص سعر',
    },
    {
      id: 'on_demand' as TripMode,
      icon: Zap,
      titleEn: 'On-Demand',
      titleAr: 'طلب فوري',
      descEn: 'Fast pickup, <5 min wait',
      descAr: 'توصيل سريع، <٥ دقايق',
      color: 'from-purple-500 to-pink-500',
      badge: 'Fastest',
      badgeAr: 'أسرع',
    },
    {
      id: 'scheduled' as TripMode,
      icon: Calendar,
      titleEn: 'Scheduled',
      titleAr: 'موعد محدد',
      descEn: 'Book for later',
      descAr: 'احجز لوقت لاحق',
      color: 'from-blue-500 to-indigo-500',
      badge: 'Plan Ahead',
      badgeAr: 'خطط مسبقاً',
    },
    {
      id: 'package' as TripMode,
      icon: Package,
      titleEn: 'Package',
      titleAr: 'طرد',
      descEn: 'Send parcels',
      descAr: 'أرسل طرود',
      color: 'from-amber-500 to-orange-500',
      badge: 'Delivery',
      badgeAr: 'توصيل',
    },
  ];
  
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const Icon = mode.icon;
          
          return (
            <motion.button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative overflow-hidden rounded-2xl p-4 transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-br ' + mode.color + ' text-white shadow-xl ring-2 ring-white/20' 
                  : 'bg-card hover:bg-card-hover border border-border'
                }
              `}
            >
              {/* Badge */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'}
                    px-2 py-1 rounded-full text-xs font-medium
                    bg-white/20 backdrop-blur-sm
                  `}
                >
                  {language === 'ar' ? mode.badgeAr : mode.badge}
                </motion.div>
              )}
              
              {/* Icon */}
              <div className={`mb-3 ${rtl.flexRow()} items-center gap-2`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-primary'}`} />
              </div>
              
              {/* Title */}
              <h3 className={`
                text-sm font-bold mb-1 ${rtl.textAlign()}
                ${isSelected ? 'text-white' : 'text-foreground'}
              `}>
                {language === 'ar' ? mode.titleAr : mode.titleEn}
              </h3>
              
              {/* Description */}
              <p className={`
                text-xs ${rtl.textAlign()}
                ${isSelected ? 'text-white/80' : 'text-muted-foreground'}
              `}>
                {language === 'ar' ? mode.descAr : mode.descEn}
              </p>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="mode-indicator"
                  className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Mode explanation */}
      <motion.div
        key={selectedMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 p-4 rounded-xl bg-muted/30 border border-border"
      >
        {selectedMode === 'carpooling' && (
          <div className={rtl.textAlign()}>
            <p className="text-sm text-foreground">
              {language === 'ar' 
                ? '💰 شارك الرحلة مع مسافرين آخرين ووفّر حتى ٧٠٪ من تكلفة التاكسي. مثالي للرحلات الطويلة (عمان → العقبة، إربد، البحر الميت).'
                : '💰 Share rides with other travelers and save up to 70% vs taxi. Perfect for long intercity trips (Amman → Aqaba, Irbid, Dead Sea).'
              }
            </p>
          </div>
        )}
        
        {selectedMode === 'on_demand' && (
          <div className={rtl.textAlign()}>
            <p className="text-sm text-foreground">
              {language === 'ar'
                ? '⚡ احصل على سيارة فوراً خلال أقل من ٥ دقائق. سائقين محترفين، تتبع مباشر، وصول سريع. للرحلات داخل المدينة والبين المدن.'
                : '⚡ Get a ride instantly in under 5 minutes. Professional drivers, live tracking, fast pickup. For intra-city and intercity trips.'
              }
            </p>
          </div>
        )}
        
        {selectedMode === 'scheduled' && (
          <div className={rtl.textAlign()}>
            <p className="text-sm text-foreground">
              {language === 'ar'
                ? '📅 احجز رحلتك لوقت لاحق (٢٤ ساعة - ٣٠ يوم مقدماً). مثالي لرحلات المطار، المواعيد المهمة، والتخطيط المسبق.'
                : '📅 Book your ride in advance (24 hours - 30 days ahead). Perfect for airport trips, important appointments, and planning ahead.'
              }
            </p>
          </div>
        )}
        
        {selectedMode === 'package' && (
          <div className={rtl.textAlign()}>
            <p className="text-sm text-foreground">
              {language === 'ar'
                ? '📦 أرسل طرودك مع مسافرين أو سائقين رايحين على نفس الوجهة. توصيل بنفس اليوم، تتبع مباشر، تأمين شامل حتى ١٠٠ دينار.'
                : '📦 Send packages with travelers or drivers already going to your destination. Same-day delivery, live tracking, insurance up to JOD 100.'
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
