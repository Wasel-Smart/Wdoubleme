/**
 * Enhanced Burger Menu - Priority-Based Service Organization
 * 
 * Services classified by Application Priority Sequence
 * Organized for optimal user experience and business goals
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { SERVICES_BY_PRIORITY, getServicesByCategory, type ServiceDefinition } from '../config/services-priority';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface EnhancedBurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedBurgerMenu({ isOpen, onClose }: EnhancedBurgerMenuProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isRTL = language === 'ar';

  const content = {
    ar: {
      title: 'الخدمات',
      subtitle: 'مرتبة حسب الأولوية',
      core: 'الخدمات الأساسية',
      premium: 'الخدمات المميزة',
      specialized: 'الخدمات المتخصصة',
      admin: 'الإدارة',
      close: 'إغلاق',
      viewAll: 'عرض الكل',
      priority: 'الأولوية',
      enabled: 'متاح',
      comingSoon: 'قريباً',
    },
    en: {
      title: 'Services',
      subtitle: 'Organized by Priority',
      core: 'Core Services',
      premium: 'Premium Services',
      specialized: 'Specialized Services',
      admin: 'Administration',
      close: 'Close',
      viewAll: 'View All',
      priority: 'Priority',
      enabled: 'Available',
      comingSoon: 'Coming Soon',
    },
  };

  const t = content[language];

  const handleServiceClick = (service: ServiceDefinition) => {
    if (!service.enabled) return;
    
    navigate(service.route);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return '🎯';
      case 'premium': return '⭐';
      case 'specialized': return '🔧';
      case 'admin': return '⚙️';
      default: return '📱';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'from-blue-600 to-cyan-600';
      case 'premium': return 'from-purple-600 to-pink-600';
      case 'specialized': return 'from-green-600 to-emerald-600';
      case 'admin': return 'from-gray-600 to-gray-700';
      default: return 'from-blue-600 to-cyan-600';
    }
  };

  const categories = [
    { id: 'core', name: t.core, count: getServicesByCategory('core').length },
    { id: 'premium', name: t.premium, count: getServicesByCategory('premium').length },
    { id: 'specialized', name: t.specialized, count: getServicesByCategory('specialized').length },
    { id: 'admin', name: t.admin, count: getServicesByCategory('admin').length },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: isRTL ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-full max-w-md bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 shadow-2xl z-50 overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 shadow-lg z-10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-black text-white">{t.title}</h2>
                  <p className="text-sm text-blue-100">{t.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Critical Services (P1) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                  <h3 className="text-lg font-bold text-white">
                    {isRTL ? 'خدمات حرجة' : 'Critical Services'}
                  </h3>
                  <Badge variant="destructive" className="ml-auto">P1</Badge>
                </div>
                
                <div className="space-y-2">
                  {SERVICES_BY_PRIORITY.filter(s => s.priority <= 3 && s.enabled).map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                      language={language}
                    />
                  ))}
                </div>
              </div>

              {/* High Priority (P2) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  <h3 className="text-lg font-bold text-white">
                    {isRTL ? 'أولوية عالية' : 'High Priority'}
                  </h3>
                  <Badge variant="default" className="ml-auto bg-blue-600">P2</Badge>
                </div>
                
                <div className="space-y-2">
                  {SERVICES_BY_PRIORITY.filter(s => s.priority >= 4 && s.priority <= 7 && s.enabled).map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                      language={language}
                    />
                  ))}
                </div>
              </div>

              {/* Medium Priority (P3) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  <h3 className="text-lg font-bold text-white">
                    {isRTL ? 'أولوية متوسطة' : 'Medium Priority'}
                  </h3>
                  <Badge variant="default" className="ml-auto bg-purple-600">P3</Badge>
                </div>
                
                <div className="space-y-2">
                  {SERVICES_BY_PRIORITY.filter(s => s.priority >= 8 && s.priority <= 12 && s.enabled).map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                      language={language}
                    />
                  ))}
                </div>
              </div>

              {/* Categories Overview */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">
                  {isRTL ? 'حسب الفئة' : 'By Category'}
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => (
                    <Card
                      key={category.id}
                      className={`p-4 bg-gradient-to-br ${getCategoryColor(category.id)} border-0 cursor-pointer hover:scale-105 transition-transform`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="text-3xl mb-2">{getCategoryIcon(category.id)}</div>
                      <h4 className="text-white font-bold text-sm">{category.name}</h4>
                      <p className="text-white/80 text-xs mt-1">{category.count} {t.enabled}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10 text-center text-white/40 text-xs">
              <p>Wasel © 2026</p>
                <p className="mt-1">{isRTL ? 'شريكك الذكي بالتنقل' : 'Your Smart Mobility Partner'}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Service Card Component
function ServiceCard({
  service,
  onClick,
  language,
}: {
  service: ServiceDefinition;
  onClick: () => void;
  language: 'ar' | 'en';
}) {
  const isRTL = language === 'ar';
  const name = language === 'ar' ? service.nameAr : service.nameEn;

  return (
    <motion.div
      whileHover={{ scale: service.enabled ? 1.02 : 1 }}
      whileTap={{ scale: service.enabled ? 0.98 : 1 }}
      onClick={onClick}
      className={`
        p-4 rounded-xl border-2 transition-all
        ${service.enabled 
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500 cursor-pointer' 
          : 'bg-gray-800/30 border-gray-700 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{service.icon}</div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-bold">{name}</h4>
            {service.badge && (
              <Badge 
                variant="default" 
                className={`text-xs ${
                  service.badge === 'LIVE' ? 'bg-red-600' : 
                  service.badge === 'AI' ? 'bg-purple-600' : 
                  'bg-blue-600'
                }`}
              >
                {service.badge}
              </Badge>
            )}
          </div>
          <p className="text-white/60 text-xs mt-0.5">{service.description}</p>
        </div>

        {service.enabled ? (
          <ChevronRight className={`w-5 h-5 text-cyan-400 ${isRTL ? 'rotate-180' : ''}`} />
        ) : (
          <span className="text-white/40 text-xs">{language === 'ar' ? 'قريباً' : 'Soon'}</span>
        )}
      </div>

      {/* Priority indicator */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${
              service.priority <= 3 ? 'from-red-500 to-orange-500' :
              service.priority <= 7 ? 'from-blue-500 to-cyan-500' :
              service.priority <= 12 ? 'from-purple-500 to-pink-500' :
              'from-gray-500 to-gray-600'
            }`}
            style={{ width: `${Math.max(20, 100 - service.priority * 5)}%` }}
          />
        </div>
        <span className="text-white/30 text-[10px]">P{service.priority}</span>
      </div>
    </motion.div>
  );
}
