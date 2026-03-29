/**
 * Service Priority Configuration for Wasel
 * 
 * CLASSIFICATION: Application Priority Sequence
 * Services ordered by business criticality and user demand
 */

export interface ServiceDefinition {
  id: string;
  priority: number;
  category: 'core' | 'premium' | 'specialized' | 'admin';
  nameEn: string;
  nameAr: string;
  icon: string;
  route: string;
  description: string;
  enabled: boolean;
  badge?: string;
}

/**
 * PRIORITY CLASSIFICATION
 * 
 * P1 (1-3): CRITICAL - Mobility OS & Core Marketplace
 * P2 (4-7): HIGH - Primary Revenue Drivers
 * P3 (8-12): MEDIUM - Value-Add Services
 * P4 (13-16): LOW - Specialized/Admin
 */

export const SERVICES_BY_PRIORITY: ServiceDefinition[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // P1: CRITICAL - Mobility OS & Core (Non-Negotiable)
  // ══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'mobility-os',
    priority: 1,
    category: 'core',
    nameEn: 'Mobility OS',
    nameAr: 'نظام التنقل',
    icon: '🎛️',
    route: '/app/mobility-os',
    description: 'Real-time transportation control system',
    enabled: true,
    badge: 'LIVE',
  },
  
  {
    id: 'find-ride',
    priority: 2,
    category: 'core',
    nameEn: 'Find Ride',
    nameAr: 'ابحث عن رحلة',
    icon: '🔍',
    route: '/app/find-ride',
    description: 'Search intercity rides',
    enabled: true,
  },
  
  {
    id: 'offer-ride',
    priority: 3,
    category: 'core',
    nameEn: 'Offer Ride',
    nameAr: 'اعرض رحلة',
    icon: '🚗',
    route: '/app/offer-ride',
    description: 'Post your trip',
    enabled: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // P2: HIGH - Primary Revenue Drivers
  // ══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'packages',
    priority: 4,
    category: 'core',
    nameEn: 'Awasel Packages',
    nameAr: 'طرود واصل',
    icon: '📦',
    route: '/app/packages',
    description: 'Send packages with travelers',
    enabled: true,
  },
  
  {
    id: 'bus',
    priority: 5,
    category: 'core',
    nameEn: 'WaselBus',
    nameAr: 'باص واصل',
    icon: '🚌',
    route: '/app/bus',
    description: 'Book intercity buses',
    enabled: true,
  },
  
  {
    id: 'driver-dashboard',
    priority: 6,
    category: 'core',
    nameEn: 'Driver Dashboard',
    nameAr: 'لوحة السائق',
    icon: '👤',
    route: '/app/driver',
    description: 'Driver earnings & analytics',
    enabled: true,
  },
  
  {
    id: 'payments',
    priority: 7,
    category: 'premium',
    nameEn: 'Payment Ecosystem',
    nameAr: 'نظام الدفع',
    icon: '💳',
    route: '/app/payments',
    description: 'Secure payment management',
    enabled: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // P3: MEDIUM - Value-Add Services
  // ══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'analytics',
    priority: 8,
    category: 'premium',
    nameEn: 'Engagement Analytics',
    nameAr: 'تحليلات التفاعل',
    icon: '📊',
    route: '/app/analytics',
    description: 'Platform performance insights',
    enabled: true,
    badge: 'AI',
  },
  
  {
    id: 'safety',
    priority: 9,
    category: 'core',
    nameEn: 'Safety Center',
    nameAr: 'مركز الأمان',
    icon: '🛡️',
    route: '/app/safety',
    description: 'Trust & safety features',
    enabled: true,
  },
  
  {
    id: 'moderation',
    priority: 10,
    category: 'admin',
    nameEn: 'Content Moderation',
    nameAr: 'فحص المحتوى',
    icon: '🔒',
    route: '/app/moderation',
    description: 'AI-powered safety',
    enabled: true,
    badge: 'AI',
  },
  
  {
    id: 'wasel-plus',
    priority: 11,
    category: 'premium',
    nameEn: 'Wasel Plus',
    nameAr: 'واصل بلس',
    icon: '⭐',
    route: '/app/plus',
    description: 'Premium membership',
    enabled: true,
  },
  
  {
    id: 'profile',
    priority: 12,
    category: 'core',
    nameEn: 'My Profile',
    nameAr: 'ملفي الشخصي',
    icon: '👤',
    route: '/app/profile',
    description: 'Account settings',
    enabled: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // P4: LOW - Specialized/Admin
  // ══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'school-transport',
    priority: 13,
    category: 'specialized',
    nameEn: 'School Transport',
    nameAr: 'نقل مدرسي',
    icon: '🎒',
    route: '/app/services/school',
    description: 'Safe school rides',
    enabled: true,
  },
  
  {
    id: 'corporate',
    priority: 14,
    category: 'specialized',
    nameEn: 'Corporate',
    nameAr: 'الشركات',
    icon: '🏢',
    route: '/app/services/corporate',
    description: 'Business accounts',
    enabled: true,
  },
  
  {
    id: 'raje3',
    priority: 15,
    category: 'specialized',
    nameEn: 'Raje3 Returns',
    nameAr: 'رجع - الإرجاع',
    icon: '🔄',
    route: '/app/raje3',
    description: 'E-commerce returns',
    enabled: true,
  },
  
  {
    id: 'admin',
    priority: 16,
    category: 'admin',
    nameEn: 'Admin Dashboard',
    nameAr: 'لوحة الإدارة',
    icon: '⚙️',
    route: '/app/admin',
    description: 'Platform management',
    enabled: true,
  },
];

/**
 * Get services by category
 */
export function getServicesByCategory(category: ServiceDefinition['category']): ServiceDefinition[] {
  return SERVICES_BY_PRIORITY.filter(s => s.category === category && s.enabled);
}

/**
 * Get enabled services sorted by priority
 */
export function getEnabledServices(): ServiceDefinition[] {
  return SERVICES_BY_PRIORITY.filter(s => s.enabled).sort((a, b) => a.priority - b.priority);
}

/**
 * Get service by ID
 */
export function getServiceById(id: string): ServiceDefinition | undefined {
  return SERVICES_BY_PRIORITY.find(s => s.id === id);
}
