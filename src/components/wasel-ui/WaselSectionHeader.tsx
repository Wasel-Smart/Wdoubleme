/**
 * WaselSectionHeader — Bilingual section header matching the screenshot.
 *
 * Layout: [Icon] Title (English)
 *               Subtitle (Arabic)    [Badge]
 */

import type { ReactNode } from 'react';
import { WaselBadge } from './WaselBadge';

interface WaselSectionHeaderProps {
  icon?: ReactNode;
  title: string;
  titleAr?: string;
  badge?: 'live' | 'ai' | 'new' | 'hot';
  badgeLabel?: string;
  className?: string;
  children?: ReactNode;
}

export function WaselSectionHeader({
  icon,
  title,
  titleAr,
  badge,
  badgeLabel,
  className = '',
  children,
}: WaselSectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
          {titleAr && (
            <p className="text-slate-500 text-sm mt-0.5" dir="rtl">{titleAr}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge && <WaselBadge variant={badge} label={badgeLabel} />}
        {children}
      </div>
    </div>
  );
}
