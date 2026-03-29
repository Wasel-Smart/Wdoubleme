/**
 * Wasel Design System — Icon Set
 * Simple, line-based, consistent 2px stroke
 */

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const d = (size = 24, color = 'currentColor', sw = 2) =>
  ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const IconHome = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

export const IconMapPin = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);

export const IconNavigation = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

export const IconClock = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconStar = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconUser = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconPackage = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const IconActivity = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const IconShield = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconCheck = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconChevronRight = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconChevronDown = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconSearch = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconCar = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h11l4 4 2 3v3h-2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export const IconWallet = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <rect x="1" y="4" width="22" height="16" rx="3" />
    <path d="M1 10h22" />
    <circle cx="17.5" cy="15" r="1.5" fill={color} stroke="none" />
  </svg>
);

export const IconBell = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export const IconMenu = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const IconArrowRight = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const IconPhone = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.06 2.18 2 2 0 012.03 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);

export const IconGrid = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...d(size, color, strokeWidth)}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
