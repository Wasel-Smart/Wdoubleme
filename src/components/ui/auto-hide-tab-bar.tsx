/**
 * AutoHideTabBar — Auto-hiding tab navigation with smooth animations
 *
 * Features:
 * - Shows when mouse enters trigger zone (top 150px of viewport)
 * - Hides when mouse leaves OR when clicking anywhere
 * - Smooth fade + slide animations
 * - Works on both desktop (hover) and mobile (tap)
 * - Distraction-free full-screen viewing experience
 * - Includes subtle hint indicator when hidden
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './utils';

interface AutoHideTabBarProps {
  /** The tab buttons/navigation content */
  children: React.ReactNode;
  /** Height of the trigger zone in pixels (default: 150) */
  triggerZoneHeight?: number;
  /** Additional classes for the container */
  className?: string;
  /** Position of the tab bar (default: 'top') */
  position?: 'top' | 'bottom';
  /** Show permanently on mobile (default: false) */
  alwaysShowOnMobile?: boolean;
  /** Show hint indicator when hidden (default: true) */
  showHint?: boolean;
}

export function AutoHideTabBar({
  children,
  triggerZoneHeight = 150,
  className,
  position = 'top',
  alwaysShowOnMobile = false,
  showHint = true,
}: AutoHideTabBarProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);
  const [showHintIndicator, setShowHintIndicator] = React.useState(true);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMobile = React.useMemo(() => {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  }, []);

  // Clear any pending hide timeout
  const clearHideTimeout = React.useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Show tab bar
  const show = React.useCallback(() => {
    clearHideTimeout();
    setIsVisible(true);
    setShowHintIndicator(false);
  }, [clearHideTimeout]);

  // Hide tab bar with optional delay
  const hide = React.useCallback((delay = 0) => {
    clearHideTimeout();
    if (delay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        // Show hint again after hiding
        setTimeout(() => setShowHintIndicator(true), 500);
      }, delay);
    } else {
      setIsVisible(false);
      setTimeout(() => setShowHintIndicator(true), 500);
    }
  }, [clearHideTimeout]);

  // Handle mouse movement (desktop)
  React.useEffect(() => {
    if (isMobile && alwaysShowOnMobile) {
      setIsVisible(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const threshold = position === 'top' ? triggerZoneHeight : window.innerHeight - triggerZoneHeight;
      
      if (position === 'top') {
        // Show when mouse is near the top
        if (e.clientY < threshold) {
          show();
        } else if (isVisible && e.clientY > threshold + 50) {
          // Hide with small buffer zone (50px) to prevent flickering
          hide(300); // 300ms delay before hiding
        }
      } else {
        // Show when mouse is near the bottom
        if (e.clientY > threshold) {
          show();
        } else if (isVisible && e.clientY < threshold - 50) {
          hide(300);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearHideTimeout();
    };
  }, [isVisible, position, triggerZoneHeight, show, hide, clearHideTimeout, isMobile, alwaysShowOnMobile]);

  // Handle clicks anywhere (hide tab bar)
  React.useEffect(() => {
    if (isMobile && alwaysShowOnMobile) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't hide if clicking on the tab bar itself
      if (target.closest('[data-auto-hide-tab-bar]')) {
        return;
      }
      hide();
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [hide, isMobile, alwaysShowOnMobile]);

  // Handle touch events (mobile)
  React.useEffect(() => {
    if (alwaysShowOnMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const threshold = position === 'top' ? triggerZoneHeight : window.innerHeight - triggerZoneHeight;
      
      if (position === 'top') {
        if (touch.clientY < threshold) {
          setIsTouched(true);
          show();
        }
      } else {
        if (touch.clientY > threshold) {
          setIsTouched(true);
          show();
        }
      }
    };

    const handleTouchEnd = () => {
      if (isTouched) {
        setIsTouched(false);
        // Keep visible for a moment after touch
        hide(2000); // Hide after 2 seconds
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouched, position, triggerZoneHeight, show, hide, alwaysShowOnMobile]);

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      y: position === 'top' ? -20 : 20,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const hintVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <>
      {/* Hint Indicator */}
      {showHint && !isVisible && showHintIndicator && (
        <AnimatePresence>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={hintVariants}
            className={cn(
              'fixed z-40 left-1/2 -translate-x-1/2 pointer-events-none',
              position === 'top' ? 'top-2' : 'bottom-2'
            )}
          >
            <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
              {position === 'top' ? (
                <>
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                  Move cursor here for tabs
                </>
              ) : (
                <>
                  <ChevronUp className="w-3 h-3 animate-bounce" />
                  Move cursor here for tabs
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Tab Bar */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            data-auto-hide-tab-bar
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            className={cn(
              'fixed z-50 left-0 right-0 px-4 py-3',
              position === 'top' ? 'top-0' : 'bottom-0',
              // Backdrop blur for better visibility
              'backdrop-blur-xl bg-background/80 border-b border-border/50',
              position === 'bottom' && 'border-t border-b-0',
              // Shadow for depth
              position === 'top' ? 'shadow-lg shadow-black/5' : 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]',
              className
            )}
            // Prevent clicks from propagating to the window click handler
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Export a hook for manual control if needed
export function useAutoHideTabBar() {
  const [isVisible, setIsVisible] = React.useState(false);

  return {
    isVisible,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(prev => !prev),
  };
}