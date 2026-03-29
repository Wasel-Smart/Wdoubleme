import { motion } from 'motion/react';

interface SimplifiedIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

/**
 * Simplified Wasel Icon - Optimized for small sizes
 * 
 * Design Concept:
 * - Circular road/path forming a "W" shape
 * - Two connection points representing carpooling/shared journey
 * - Minimalist 2-color design that scales perfectly
 * - Works in monochrome and at 16px
 */
export function SimplifiedIcon({ size = 'md', className = '', animate = false }: SimplifiedIconProps) {
  const iconElement = (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap[size]} ${className}`}
    >
      {/* Outer circle - represents journey/completeness */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        stroke="currentColor" 
        strokeWidth="3"
        fill="none"
        className="text-primary"
      />
      
      {/* Inner path forming "W" shape - represents road/route */}
      <path 
        d="M 25 35 L 35 60 L 50 40 L 65 60 L 75 35" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        className="text-secondary"
      />
      
      {/* Connection dots - represents people/carpooling nodes */}
      <circle cx="35" cy="60" r="5" fill="currentColor" className="text-secondary" />
      <circle cx="65" cy="60" r="5" fill="currentColor" className="text-secondary" />
      <circle cx="50" cy="40" r="5" fill="currentColor" className="text-primary" />
      
      {/* Subtle road lines */}
      <line x1="25" y1="35" x2="27" y2="38" stroke="currentColor" strokeWidth="2" className="text-primary opacity-60" />
      <line x1="75" y1="35" x2="73" y2="38" stroke="currentColor" strokeWidth="2" className="text-primary opacity-60" />
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="inline-flex items-center justify-center"
      >
        {iconElement}
      </motion.div>
    );
  }

  return iconElement;
}