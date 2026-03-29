/**
 * Responsive Card Component
 * Adapts to mobile/tablet/desktop with platform-specific optimizations
 */

import { type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { LAYOUT, ANIMATION, detectPlatform, SPACING } from '../utils/responsive';

interface ResponsiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  hover?: boolean;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  style?: CSSProperties;
  className?: string;
}

export function ResponsiveCard({
  children,
  onClick,
  hover = false,
  elevated = false,
  padding = 'md',
  radius = 'lg',
  style,
  className,
}: ResponsiveCardProps) {
  const platform = detectPlatform();
  const isClickable = !!onClick;

  // Platform-specific styles
  const platformStyles = {
    ios: {
      background: '#FFFFFF',
      border: '0.5px solid rgba(0, 0, 0, 0.06)',
      boxShadow: elevated ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
    },
    android: {
      background: '#FFFFFF',
      border: 'none',
      boxShadow: elevated 
        ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)' 
        : '0 1px 3px rgba(0, 0, 0, 0.08)',
    },
    web: {
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: elevated ? LAYOUT.shadow.md : LAYOUT.shadow.sm,
    },
  };

  const currentPlatformStyle = platform.isIOS
    ? platformStyles.ios
    : platform.isAndroid
    ? platformStyles.android
    : platformStyles.web;

  // Padding map
  const paddingMap = {
    none: 0,
    sm: SPACING[4],
    md: platform.isMobile ? SPACING[4] : SPACING[6],
    lg: platform.isMobile ? SPACING[6] : SPACING[8],
  };

  // Border radius map
  const radiusMap = {
    sm: 8,
    md: 12,
    lg: platform.isMobile ? LAYOUT.cardRadius.mobile : LAYOUT.cardRadius.desktop,
    xl: 24,
  };

  const cardStyle: CSSProperties = {
    ...currentPlatformStyle,
    borderRadius: radiusMap[radius],
    padding: paddingMap[padding],
    cursor: isClickable ? 'pointer' : 'default',
    WebkitTapHighlightColor: 'transparent',
    userSelect: isClickable ? 'none' : 'auto',
    transition: ANIMATION.transition(['transform', 'box-shadow', 'border-color'], ANIMATION.duration.fast),
    ...style,
  };

  // Hover effects (desktop only)
  const hoverEffects = hover && !platform.isMobile ? {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = LAYOUT.shadow.lg;
      e.currentTarget.style.borderColor = 'rgba(0, 200, 232, 0.2)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = currentPlatformStyle.boxShadow;
      e.currentTarget.style.borderColor = currentPlatformStyle.border.split(' ').pop() || 'transparent';
    },
  } : {};

  const Component = isClickable ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      style={{
        ...cardStyle,
        border: cardStyle.border,
        textAlign: 'left',
      }}
      className={className}
      {...hoverEffects}
    >
      {children}
    </Component>
  );
}

/**
 * Grid layout for responsive cards
 */
interface ResponsiveCardGridProps {
  children: ReactNode;
  columns?: { mobile: number; tablet?: number; desktop?: number };
  gap?: number;
  style?: CSSProperties;
}

export function ResponsiveCardGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap,
  style,
}: ResponsiveCardGridProps) {
  const platform = detectPlatform();

  const gridGap = gap || (platform.isMobile ? LAYOUT.gridGap.mobile : platform.isTablet ? LAYOUT.gridGap.tablet : LAYOUT.gridGap.desktop);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${
          platform.isMobile
            ? columns.mobile
            : platform.isTablet
            ? columns.tablet || columns.mobile
            : columns.desktop || columns.tablet || columns.mobile
        }, 1fr)`,
        gap: gridGap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * List layout for responsive cards (vertical stacking)
 */
interface ResponsiveCardListProps {
  children: ReactNode;
  gap?: number;
  style?: CSSProperties;
}

export function ResponsiveCardList({ children, gap, style }: ResponsiveCardListProps) {
  const platform = detectPlatform();
  const listGap = gap || (platform.isMobile ? SPACING[3] : SPACING[4]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: listGap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
