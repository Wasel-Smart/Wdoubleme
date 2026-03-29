/**
 * Responsive Button Component
 * Platform-optimized (iOS/Android/Web) with accessibility
 */

import { type ReactNode, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { TOUCH_TARGET, ANIMATION, TYPOGRAPHY, detectPlatform, SPACING } from '../utils/responsive';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
  className?: string;
  ariaLabel?: string;
}

export function ResponsiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  style,
  className,
  ariaLabel,
}: ResponsiveButtonProps) {
  const platform = detectPlatform();
  const isDisabled = disabled || loading;

  // Variant styles
  const variantStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #00C8E8, #00A0C0)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: platform.isAndroid ? '0 2px 8px rgba(0, 200, 232, 0.3)' : 'none',
    },
    secondary: {
      background: '#F1F5F9',
      color: '#0F172A',
      border: '1px solid #E2E8F0',
      boxShadow: 'none',
    },
    outline: {
      background: 'transparent',
      color: '#00C8E8',
      border: '2px solid #00C8E8',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: '#64748B',
      border: 'none',
      boxShadow: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: platform.isAndroid ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none',
    },
  };

  // Size styles (responsive)
  const sizeStyles: Record<ButtonSize, CSSProperties> = {
    sm: {
      minHeight: TOUCH_TARGET.min - 4,
      padding: `${SPACING[2]}px ${SPACING[3]}px`,
      fontSize: platform.isMobile ? TYPOGRAPHY.fontSize.sm.mobile : TYPOGRAPHY.fontSize.sm.desktop,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      borderRadius: 8,
    },
    md: {
      minHeight: TOUCH_TARGET.button,
      padding: `${SPACING[3]}px ${SPACING[5]}px`,
      fontSize: platform.isMobile ? TYPOGRAPHY.fontSize.base.mobile : TYPOGRAPHY.fontSize.base.desktop,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      borderRadius: 12,
    },
    lg: {
      minHeight: TOUCH_TARGET.button + 8,
      padding: `${SPACING[4]}px ${SPACING[6]}px`,
      fontSize: platform.isMobile ? TYPOGRAPHY.fontSize.lg.mobile : TYPOGRAPHY.fontSize.lg.desktop,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      borderRadius: 14,
    },
    xl: {
      minHeight: TOUCH_TARGET.button + 16,
      padding: `${SPACING[5]}px ${SPACING[8]}px`,
      fontSize: platform.isMobile ? TYPOGRAPHY.fontSize.xl.mobile : TYPOGRAPHY.fontSize.xl.desktop,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      borderRadius: 16,
    },
  };

  // Platform-specific adjustments
  const platformAdjustments: CSSProperties = {
    // iOS: Subtle shadows, rounded corners
    ...(platform.isIOS && variant === 'primary' ? {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    } : {}),
    // Android: Material elevation
    ...(platform.isAndroid && variant === 'primary' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)',
    } : {}),
  };

  const buttonStyle: CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...platformAdjustments,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[2],
    fontFamily: TYPOGRAPHY.sans,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: ANIMATION.transition(['transform', 'box-shadow', 'opacity'], ANIMATION.duration.fast),
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none',
    ...style,
  };

  // Haptic feedback (iOS only)
  const handleClick = () => {
    if (isDisabled) return;
    
    // Trigger haptic feedback on iOS
    if (platform.isIOS && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.();
  };

  // Hover effects (desktop only)
  const hoverEffects = !platform.isMobile && !isDisabled ? {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === 'primary' || variant === 'danger') {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.background = '#E2E8F0';
      } else if (variant === 'ghost') {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string;
      if (variant === 'secondary') {
        e.currentTarget.style.background = '#F1F5F9';
      } else if (variant === 'ghost') {
        e.currentTarget.style.background = 'transparent';
      }
    },
  } : {};

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      style={buttonStyle}
      className={className}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...hoverEffects}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 20} />
        </motion.div>
      )}

      {/* Icon (left) */}
      {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}

      {/* Button text */}
      {!loading && <span>{children}</span>}

      {/* Icon (right) */}
      {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </motion.button>
  );
}

/**
 * Icon-only button (square)
 */
interface ResponsiveIconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel: string; // Required for accessibility
  style?: CSSProperties;
}

export function ResponsiveIconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  ariaLabel,
  style,
}: ResponsiveIconButtonProps) {
  const platform = detectPlatform();
  const isDisabled = disabled || loading;

  const sizeMap = {
    sm: TOUCH_TARGET.min,
    md: TOUCH_TARGET.button,
    lg: TOUCH_TARGET.button + 8,
    xl: TOUCH_TARGET.button + 16,
  };

  const iconSize = sizeMap[size];

  return (
    <ResponsiveButton
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      loading={loading}
      ariaLabel={ariaLabel}
      style={{
        width: iconSize,
        height: iconSize,
        padding: 0,
        ...style,
      }}
    >
      {icon}
    </ResponsiveButton>
  );
}
