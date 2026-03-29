import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface BurgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function BurgerMenu({ isOpen, onClick, className = '' }: BurgerMenuProps) {
  const { language } = useLanguage();

  return (
    <button
      onClick={onClick}
      className={`
        relative w-10 h-10 flex items-center justify-center
        rounded-xl transition-all duration-300
        hover:bg-white/5
        active:scale-95
        ${className}
      `}
      aria-label={
        isOpen
          ? (language === 'ar' ? 'سكّر القائمة' : 'Close menu')
          : (language === 'ar' ? 'افتح القائمة' : 'Open menu')
      }
      aria-expanded={isOpen}
    >
      <div className="w-6 h-5 relative flex flex-col justify-center">
        {/* Top line */}
        <motion.span
          className="absolute w-6 h-0.5 bg-slate-400 rounded-full"
          animate={{
            rotate: isOpen ? (language === 'ar' ? -45 : 45) : 0,
            y: isOpen ? 0 : -8,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        
        {/* Middle line */}
        <motion.span
          className="absolute w-6 h-0.5 bg-slate-400 rounded-full"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? (language === 'ar' ? 10 : -10) : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        
        {/* Bottom line */}
        <motion.span
          className="absolute w-6 h-0.5 bg-slate-400 rounded-full"
          animate={{
            rotate: isOpen ? (language === 'ar' ? 45 : -45) : 0,
            y: isOpen ? 0 : 8,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
    </button>
  );
}