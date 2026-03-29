/**
 * LEVEL 5: VISUAL STABILITY PERFECTION
 * Skeleton loaders and layout stability system
 * ENHANCED: Better CLS prevention with explicit sizing
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component for loading states
 * Prevents layout shift by reserving space
 * ENHANCED: Always sets explicit dimensions to prevent CLS
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: ''
  };

  // ENHANCED: Always provide explicit dimensions
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
    // Prevent layout shift with these properties
    minHeight: height || (variant === 'text' ? '1rem' : '20px'),
    flexShrink: 0, // Prevent shrinking
    willChange: 'auto' // Don't hint at changes (prevents unnecessary repaints)
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
      aria-busy="true"
    />
  );
};

/**
 * Card skeleton for consistent loading states
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-lg border p-4 space-y-3 ${className}`}>
    <div className="flex items-center space-x-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={100} />
    <div className="flex space-x-2">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </div>
);

/**
 * List skeleton for consistent loading states
 */
export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 3, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
        <Skeleton variant="rounded" width={60} height={24} />
      </div>
    ))}
  </div>
);

/**
 * Table skeleton for consistent loading states
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4 p-3 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width="100%" height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width="100%" height={16} />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Dashboard skeleton for consistent loading states
 */
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="space-y-2">
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="text" width="50%" height={20} />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={28} />
        </div>
      ))}
    </div>

    {/* Content Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>

    {/* Table */}
    <div className="rounded-lg border p-4">
      <Skeleton variant="text" width="30%" height={24} className="mb-4" />
      <TableSkeleton rows={5} columns={4} />
    </div>
  </div>
);

/**
 * Profile skeleton for consistent loading states
 */
export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header with avatar */}
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={100} height={100} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
      </div>
    </div>

    {/* Tabs */}
    <div className="flex space-x-4 border-b">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="text" width={100} height={32} />
      ))}
    </div>

    {/* Content */}
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="20%" height={16} />
          <Skeleton variant="rounded" width="100%" height={40} />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Form skeleton for consistent loading states
 */
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 4,
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="rounded" width="100%" height={40} />
      </div>
    ))}
    <div className="flex space-x-3 pt-4">
      <Skeleton variant="rounded" width={120} height={40} />
      <Skeleton variant="rounded" width={120} height={40} />
    </div>
  </div>
);

/**
 * Layout Stability Manager
 * Prevents CLS (Cumulative Layout Shift)
 */
export class LayoutStabilityManager {
  private observer: ResizeObserver | null = null;
  private elements: Map<HTMLElement, DOMRect> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      this.observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement;
          const rect = entry.contentRect;
          
          // Store initial dimensions
          if (!this.elements.has(element)) {
            this.elements.set(element, rect);
          }
        });
      });
    }
  }

  /**
   * Reserve space for element before it loads
   */
  reserveSpace(element: HTMLElement, width?: number, height?: number): void {
    if (width) {
      element.style.minWidth = `${width}px`;
    }
    if (height) {
      element.style.minHeight = `${height}px`;
    }
  }

  /**
   * Observe element for layout shifts
   */
  observe(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  /**
   * Stop observing element
   */
  unobserve(element: HTMLElement): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  /**
   * Disconnect observer
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

// Export singleton instance
export const layoutStability = new LayoutStabilityManager();

/**
 * React hook for layout stability
 */
import { useEffect, useRef } from 'react';

export function useLayoutStability(width?: number, height?: number) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Reserve space
    layoutStability.reserveSpace(element, width, height);
    
    // Observe for shifts
    layoutStability.observe(element);

    return () => {
      layoutStability.unobserve(element);
    };
  }, [width, height]);

  return elementRef;
}

// Add CSS for wave animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes skeleton-wave {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .skeleton-wave {
      background: linear-gradient(
        90deg,
        rgba(229, 231, 235, 1) 0%,
        rgba(243, 244, 246, 1) 50%,
        rgba(229, 231, 235, 1) 100%
      );
      background-size: 200% 100%;
      animation: skeleton-wave 1.5s ease-in-out infinite;
    }
    
    .dark .skeleton-wave {
      background: linear-gradient(
        90deg,
        rgba(55, 65, 81, 1) 0%,
        rgba(75, 85, 99, 1) 50%,
        rgba(55, 65, 81, 1) 100%
      );
      background-size: 200% 100%;
    }
  `;
  document.head.appendChild(styleSheet);
}