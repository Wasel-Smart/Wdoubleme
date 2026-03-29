/**
 * Simplified Navigation
 * Uses the shared core navigation model so home/mobile/action surfaces stay aligned.
 */

import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Search, Car, Package, Home, Wallet, Activity } from 'lucide-react';
import { useTranslation } from './hooks/useTranslation';
import { cn } from '../components/ui/utils';
import { CORE_NAV_ITEMS } from '../config/user-navigation';

interface NavAction {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  description: string;
  descriptionAr: string;
}

const ICONS = {
  home: Home,
  find: Search,
  post: Car,
  packages: Package,
  wallet: Wallet,
  'mobility-os': Activity,
} as const;

const NAV_ACTIONS: NavAction[] = CORE_NAV_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
  labelAr: item.labelAr,
  icon: ICONS[item.id as keyof typeof ICONS],
  path: item.path,
  color: item.accent === 'gold' ? 'from-amber-500 to-orange-500' : 'from-teal-500 to-cyan-500',
  description: item.description,
  descriptionAr: item.descriptionAr,
}));

interface SimplifiedNavigationProps {
  variant?: 'grid' | 'list' | 'mobile';
  className?: string;
}

export function SimplifiedNavigation({
  variant = 'grid',
  className,
}: SimplifiedNavigationProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isArabic = language === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (variant === 'mobile') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 safe-area-pb">
        <div
          className="grid gap-0"
          style={{ gridTemplateColumns: `repeat(${NAV_ACTIONS.length}, minmax(0, 1fr))` }}
        >
          {NAV_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <action.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">
                {isArabic ? action.labelAr : action.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  if (variant === 'list') {
    return (
      <nav className={cn('space-y-2', className)}>
        {NAV_ACTIONS.map((action) => (
          <motion.button
            key={action.id}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                action.color,
              )}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900 dark:text-white">
                {isArabic ? action.labelAr : action.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isArabic ? action.descriptionAr : action.description}
              </div>
            </div>
          </motion.button>
        ))}
      </nav>
    );
  }

  return (
    <motion.nav
      className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {NAV_ACTIONS.map((action) => (
        <motion.button
          key={action.id}
          onClick={() => navigate(action.path)}
          className="group relative overflow-hidden rounded-2xl aspect-square bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 hover:border-transparent transition-all shadow-sm hover:shadow-xl"
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity',
              action.color,
            )}
          />

          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">
            <action.icon className="w-10 h-10 md:w-12 md:h-12" />
            <div className="text-center">
              <div className="font-bold text-base md:text-lg">
                {isArabic ? action.labelAr : action.label}
              </div>
              <div className="text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                {isArabic ? action.descriptionAr : action.description}
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.nav>
  );
}
