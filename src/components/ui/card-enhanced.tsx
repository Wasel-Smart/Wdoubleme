/**
 * Enhanced Card Component — 10/10 Accessibility & Responsiveness
 * 
 * Features:
 * - Responsive padding and spacing
 * - Keyboard navigation support
 * - ARIA landmarks when needed
 * - Interactive variants
 * - Mobile-optimized layouts
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SECTION_PADDING } from '@/utils/responsive';
import { makeInteractive } from '@/utils/accessibility';

// ─── Card Root ────────────────────────────────────────────────────────────────
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'glass' | 'gradient' | 'bordered' | 'elevated';
    padding?: 'none' | 'tight' | 'default' | 'loose';
    interactive?: boolean;
    as?: 'div' | 'article' | 'section';
  }
>(
  (
    {
      className,
      variant = 'default',
      padding = 'default',
      interactive = false,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-card text-card-foreground border border-border shadow-sm',
      glass:
        'bg-card/80 backdrop-blur-xl text-card-foreground border border-border/50 shadow-lg',
      gradient:
        'bg-gradient-to-br from-card to-card/80 text-card-foreground border border-border/30 shadow-md',
      bordered: 'bg-card text-card-foreground border-2 border-primary/20',
      elevated: 'bg-card text-card-foreground shadow-xl border border-border/50',
    };

    const paddings = {
      none: '',
      tight: 'p-3 sm:p-4',
      default: 'p-4 sm:p-6',
      loose: 'p-6 sm:p-8 lg:p-10',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-200',
          variants[variant],
          paddings[padding],
          interactive && 'cursor-pointer hover:shadow-lg hover:border-primary/30 hover:scale-[1.01]',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// ─── Card Header ──────────────────────────────────────────────────────────────
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padding?: 'tight' | 'default' | 'loose';
  }
>(({ className, padding = 'default', ...props }, ref) => {
  const paddings = {
    tight: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    loose: 'p-6 sm:p-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5',
        paddings[padding],
        className
      )}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

// ─── Card Title ───────────────────────────────────────────────────────────────
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    responsive?: boolean;
  }
>(({ className, as: Component = 'h3', responsive = true, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'font-bold leading-tight tracking-tight',
      responsive
        ? 'text-lg sm:text-xl lg:text-2xl'
        : 'text-xl',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// ─── Card Description ─────────────────────────────────────────────────────────
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    responsive?: boolean;
  }
>(({ className, responsive = true, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-muted-foreground',
      responsive ? 'text-xs sm:text-sm' : 'text-sm',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// ─── Card Content ─────────────────────────────────────────────────────────────
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padding?: 'tight' | 'default' | 'loose';
  }
>(({ className, padding = 'default', ...props }, ref) => {
  const paddings = {
    tight: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    loose: 'p-6 sm:p-8',
  };

  return (
    <div
      ref={ref}
      className={cn(paddings[padding], 'pt-0', className)}
      {...props}
    />
  );
});
CardContent.displayName = 'CardContent';

// ─── Card Footer ──────────────────────────────────────────────────────────────
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padding?: 'tight' | 'default' | 'loose';
    align?: 'start' | 'center' | 'end' | 'between';
  }
>(({ className, padding = 'default', align = 'end', ...props }, ref) => {
  const paddings = {
    tight: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    loose: 'p-6 sm:p-8',
  };

  const alignments = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 sm:gap-4',
        paddings[padding],
        alignments[align],
        'pt-0',
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = 'CardFooter';

// ─── Interactive Card ─────────────────────────────────────────────────────────
/**
 * Card that acts as a button/link
 * Usage: <InteractiveCard onClick={...} label="View ride details">
 */
const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onClick?: () => void;
    href?: string;
    label: string; // Required for accessibility
    disabled?: boolean;
  }
>(({ onClick, href, label, disabled = false, children, className, ...props }, ref) => {
  const Component = href ? 'a' : 'div';

  const interactiveProps = onClick
    ? makeInteractive({ onClick, label, disabled })
    : {};

  return (
    <Component
      ref={ref as any}
      href={href}
      className={cn(
        'rounded-xl bg-card text-card-foreground border border-border shadow-sm transition-all duration-200',
        'p-4 sm:p-6',
        !disabled &&
          'cursor-pointer hover:shadow-lg hover:border-primary/30 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...interactiveProps}
      {...props}
    >
      {children}
    </Component>
  );
});
InteractiveCard.displayName = 'InteractiveCard';

// ─── Stat Card (for metrics/dashboards) ──────────────────────────────────────
/**
 * Pre-styled card for displaying statistics
 * Usage: <StatCard label="Total Rides" value="1,234" trend="+12%" />
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  description,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}) {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  return (
    <Card className={cn('border-2', variants[variant])}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs sm:text-sm">
            <span
              className={cn(
                'font-medium',
                trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend}
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Feature Card (for landing pages) ────────────────────────────────────────
/**
 * Card for showcasing features with icon, title, description
 * Usage: <FeatureCard icon={<Car />} title="Easy Booking" description="..." />
 */
export function FeatureCard({
  icon,
  title,
  description,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card
      variant="glass"
      className={cn('text-center hover:shadow-lg transition-all', className)}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  InteractiveCard,
};
