/**
 * WaselCard — The signature card component matching the Wasel design system.
 *
 * Features:
 *  - Dark glassmorphic background
 *  - Background image with gradient overlay
 *  - Top-left accent badge (DAILY PATTERN / BEST PRICE / AI PICK)
 *  - Icon + Title + Arabic subtitle
 *  - Description text
 *  - Bold JOD pricing
 *  - Quick Book button with card accent color
 *  - Subtle hover lift effect
 */

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { ReactNode, ComponentType } from 'react';

export type WaselAccent = 'orange' | 'green' | 'cyan' | 'teal';

interface WaselCardProps {
  /** Background image URL */
  image?: string;
  /** Top-left badge */
  badge?: { label: string; icon?: ReactNode };
  /** Accent color theme */
  accent?: WaselAccent;
  /** Card icon (left of title) */
  icon?: ReactNode;
  /** English title */
  title: string;
  /** Arabic subtitle */
  titleAr?: string;
  /** Description text */
  description?: string;
  /** Price in JOD */
  price?: string;
  /** Button text */
  buttonText?: string;
  /** Button click handler */
  onAction?: () => void;
  /** Additional className */
  className?: string;
  /** Children for custom content */
  children?: ReactNode;
}

const accentColors: Record<WaselAccent, {
  badge: string;
  button: string;
  border: string;
  glow: string;
}> = {
  orange: {
    badge: 'bg-amber-500 text-white',
    button: 'bg-amber-500 hover:bg-amber-400 text-white',
    border: 'border-amber-500/15 hover:border-amber-500/30',
    glow: 'shadow-amber-500/10',
  },
  green: {
    badge: 'bg-emerald-500 text-white',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    border: 'border-emerald-500/15 hover:border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
  },
  cyan: {
    badge: 'bg-cyan-500 text-white',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-white',
    border: 'border-cyan-500/15 hover:border-cyan-500/30',
    glow: 'shadow-cyan-500/10',
  },
  teal: {
    badge: 'bg-teal-500 text-white',
    button: 'bg-teal-500 hover:bg-teal-400 text-white',
    border: 'border-teal-500/15 hover:border-teal-500/30',
    glow: 'shadow-teal-500/10',
  },
};

export function WaselCard({
  image,
  badge,
  accent = 'cyan',
  icon,
  title,
  titleAr,
  description,
  price,
  buttonText = 'Quick Book',
  onAction,
  className = '',
  children,
}: WaselCardProps) {
  const colors = accentColors[accent];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#111B2E] to-[#0D1526]
        border ${colors.border}
        shadow-lg ${colors.glow}
        transition-all duration-300
        ${className}
      `}
    >
      {/* Background Image */}
      {image && (
        <div className="relative h-28 sm:h-32 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1526] via-[#0D1526]/60 to-transparent" />
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className={`absolute top-3 left-3 z-10`}>
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            text-[10px] font-bold uppercase tracking-wider
            ${colors.badge}
            shadow-md
          `}>
            {badge.icon && <span className="text-[10px]">{badge.icon}</span>}
            {badge.label}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={`p-4 ${image ? '-mt-4 relative z-10' : ''}`}>
        {/* Title row */}
        <div className="flex items-start gap-2.5 mb-1.5">
          {icon && (
            <div className="mt-0.5 flex-shrink-0 text-slate-400">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">
              {title}
            </h3>
            {titleAr && (
              <p className="text-slate-500 text-xs mt-0.5" dir="rtl">
                {titleAr}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-slate-400 text-xs leading-relaxed mt-2 line-clamp-2">
            {description}
          </p>
        )}

        {/* Custom children */}
        {children}

        {/* Price + Button row */}
        {(price || onAction) && (
          <div className="flex items-end justify-between mt-4 pt-2">
            {price && (
              <span className="text-white font-bold text-lg tracking-tight">
                {price} <span className="text-xs font-semibold text-slate-400">JOD</span>
              </span>
            )}
            {onAction && (
              <button
                onClick={onAction}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                  text-xs font-bold tracking-wide
                  ${colors.button}
                  transition-all duration-200 hover:scale-105 active:scale-95
                  shadow-md
                `}
              >
                {buttonText}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
