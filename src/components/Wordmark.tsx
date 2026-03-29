import { motion } from 'motion/react';
import { SimplifiedIcon } from './SimplifiedIcon';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: {
    english: 'text-lg',
    arabic: 'text-base',
    icon: 'sm' as const,
    gap: 'gap-2',
  },
  md: {
    english: 'text-2xl',
    arabic: 'text-xl',
    icon: 'md' as const,
    gap: 'gap-3',
  },
  lg: {
    english: 'text-4xl',
    arabic: 'text-3xl',
    icon: 'lg' as const,
    gap: 'gap-4',
  },
  xl: {
    english: 'text-5xl',
    arabic: 'text-4xl',
    icon: 'lg' as const,
    gap: 'gap-5',
  },
};

/**
 * Wasel Wordmark - Bilingual logotype
 * 
 * Features:
 *   - Bilingual: English "Wasel" + Arabic "واصل"
 *   - Can include simplified icon
 *   - Horizontal or vertical orientation
 *   - Multiple size options
 */
export function Wordmark({ 
  size = 'md', 
  showIcon = true, 
  orientation = 'horizontal',
  className = '',
  animate = false 
}: WordmarkProps) {
  const config = sizeMap[size];
  
  const content = (
    <div 
      className={`
        flex items-center justify-center
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${config.gap}
        ${className}
      `}
    >
      {showIcon && (
        <SimplifiedIcon 
          size={config.icon} 
          className="flex-shrink-0"
          animate={animate}
        />
      )}
      
      <div className={`
        flex items-baseline
        ${orientation === 'vertical' ? 'flex-col text-center' : 'flex-row'}
        gap-2
      `}>
        {/* English */}
        <span className={`
          ${config.english} 
          font-bold 
          bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent
          tracking-tight
        `}>
          Wasel
        </span>
        
        {/* Arabic */}
        <span className={`
          ${config.arabic} 
          font-bold 
          text-secondary
          tracking-wide
        `} style={{ fontFamily: 'system-ui, -apple-system' }}>
          واصل
        </span>
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}