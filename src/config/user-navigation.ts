export interface CoreNavItem {
  id: string;
  label: string;
  labelAr: string;
  path: string;
  description: string;
  descriptionAr: string;
  accent: 'cyan' | 'gold';
}

export const CORE_NAV_ITEMS: CoreNavItem[] = [
  {
    id: 'find',
    label: 'Find Ride',
    labelAr: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø±Ø­Ù„Ø©',
    path: '/find-ride',
    description: 'Search active rides across the network',
    descriptionAr: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø±Ø­Ù„Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø© Ø¹Ø¨Ø± Ø§Ù„Ø´Ø¨ÙƒØ©',
    accent: 'cyan',
  },
  {
    id: 'post',
    label: 'Offer Ride',
    labelAr: 'Ø£Ø¶Ù Ø±Ø­Ù„ØªÙƒ',
    path: '/offer-ride',
    description: 'Share seats and earn on your route',
    descriptionAr: 'Ø´Ø§Ø±Ùƒ Ø§Ù„Ù…Ù‚Ø§Ø¹Ø¯ ÙˆØ§ÙƒØ³Ø¨ Ù…Ù† Ø±Ø­Ù„ØªÙƒ',
    accent: 'gold',
  },
  {
    id: 'packages',
    label: 'Packages',
    labelAr: 'Ø·Ø±ÙˆØ¯',
    path: '/packages',
    description: 'Send, track, and manage deliveries',
    descriptionAr: 'Ø£Ø±Ø³Ù„ ÙˆØªØªØ¨Ø¹ ÙˆØ§Ø¯ÙØ± Ø§Ù„Ø·Ø±ÙˆØ¯',
    accent: 'gold',
  },
];
