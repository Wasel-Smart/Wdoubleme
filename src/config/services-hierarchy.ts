/**
 * Wasel Services Hierarchy - OPTIMIZED CORE SERVICES
 * Tier-based structure focused on scalable, high-ROI services
 * 
 * TIER STRUCTURE:
 * 🥇 TIER 1: Core Peer-to-Peer & Daily Mobility
 * 🥈 TIER 2: Employee / B2B Transport
 * 🥉 TIER 3: Delivery & Logistics
 * 🏅 TIER 4: Regulated / Specialized Transport
 * 🏗️ TIER 5: Premium Services / B2B Add-ons
 * 🏗️ TIER 6: Vehicle / Rental Support
 */

import { 
  Car, Users, Crown, Briefcase, Building2, Heart,
  Key, Bike, Truck as TruckIcon, Plane,
  Package, ShoppingBag, Cpu,
  Stethoscope, GraduationCap as School,
  Bus, Globe, Clock, MapPin, Repeat, Calendar
} from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  image: string;
  color: string;
  category: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  priority: 'high' | 'medium' | 'low';
  features: string[];
  route: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  color: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  priority: 'high' | 'medium' | 'low';
  services: Service[];
}

export const serviceCategories: ServiceCategory[] = [
  // ====================================
  // 🥇 TIER 1: CORE PEER-TO-PEER & DAILY MOBILITY
  // ====================================
  {
    id: 'core-mobility',
    name: 'Ride-Sharing & Daily Commute',
    nameAr: 'مشاركة الرحلات والتنقل اليومي',
    description: 'Core peer-to-peer mobility services',
    descriptionAr: 'خدمات التنقل الأساسية بين الأفراد',
    icon: Users,
    color: 'from-teal-500 to-teal-700',
    tier: 1,
    priority: 'high',
    services: [
      {
        id: 'intercity',
        name: 'Inter-City Rides',
        nameAr: 'رحلات بين المدن',
        description: 'Long-distance carpooling between cities',
        descriptionAr: 'مشاركة رحلات طويلة بين المدن',
        icon: Globe,
        image: 'https://images.unsplash.com/photo-1762474147857-161b9d4fbf1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FkJTIwdHJpcCUyMGludGVyY2l0eSUyMGhpZ2h3YXklMjBqb3VybmV5fGVufDF8fHx8MTc3MDc0MDY3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-blue-500 to-cyan-600',
        category: 'core-mobility',
        tier: 1,
        priority: 'high',
        features: ['Affordable travel', 'Pre-booking', 'Route optimization', 'Multiple stops'],
        route: '/intercity'
      },
      {
        id: 'carpool',
        name: 'Carpool / Seat Sharing',
        nameAr: 'مشاركة السيارة',
        description: 'Share rides with verified travelers',
        descriptionAr: 'شارك الرحلات مع مسافرين موثوقين',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1561065475-b0dc9f889ee7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMGNhcnBvb2wlMjBzaGFyaW5nJTIwcmlkZXxlbnwxfHx8fDE3NzA3NDA2NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-teal-500 to-teal-700',
        category: 'core-mobility',
        tier: 1,
        priority: 'high',
        features: ['Cost sharing', 'Verified drivers', 'Real-time tracking', 'Flexible schedules'],
        route: '/carpool'
      },
      {
        id: 'daily-commute',
        name: 'Daily Go & Return Commute',
        nameAr: 'تنقل يومي ذهاب وعودة',
        description: 'Scheduled, reliable daily work commute',
        descriptionAr: 'تنقل يومي مجدول وموثوق للعمل',
        icon: Clock,
        image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWlseSUyMGNvbW11dGUlMjB3b3JrJTIwdHJhbnNwb3J0fGVufDF8fHx8MTc2NzMxOTAzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-green-500 to-emerald-600',
        category: 'core-mobility',
        tier: 1,
        priority: 'high',
        features: ['Fixed schedules', 'Morning pickup & evening return', 'Monthly subscriptions', 'Guaranteed service'],
        route: '/daily-commute'
      },
      {
        id: 'recurring-trips',
        name: 'Recurring Trips',
        nameAr: 'رحلات متكررة',
        description: 'Set up regular trips that repeat automatically',
        descriptionAr: 'إعداد رحلات منتظمة تتكرر تلقائياً',
        icon: Repeat,
        image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN1cnJpbmclMjBzY2hlZHVsZSUyMHdvcmt8ZW58MXx8fHwxNzY3MzE5MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-purple-500 to-indigo-600',
        category: 'core-mobility',
        tier: 1,
        priority: 'high',
        features: ['Weekly patterns', 'Auto-booking', 'Predictable costs', 'Easy management'],
        route: '/recurring-trips'
      },
      {
        id: 'scheduled-trips',
        name: 'Scheduled Trips',
        nameAr: 'رحلات مجدولة',
        description: 'Book trips in advance for future dates',
        descriptionAr: 'احجز رحلات مسبقاً لتواريخ مستقبلية',
        icon: Calendar,
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMHNjaGVkdWxlJTIwcGxhbm5pbmd8ZW58MXx8fHwxNzY3MzE5MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-blue-500 to-cyan-600',
        category: 'core-mobility',
        tier: 1,
        priority: 'high',
        features: ['Advance booking', 'Best rates', 'Guaranteed availability', 'Calendar integration'],
        route: '/scheduled-trips'
      }
    ]
  },

  // ====================================
  // 🥈 TIER 2: EMPLOYEE / B2B TRANSPORT
  // ====================================
  {
    id: 'employee-transport',
    name: 'Employee Transport',
    nameAr: 'نقل الموظفين',
    description: 'Dedicated commute solutions for businesses',
    descriptionAr: 'حلول تنقل مخصصة للشركات',
    icon: Building2,
    color: 'from-violet-500 to-indigo-600',
    tier: 2,
    priority: 'high',
    services: [
      {
        id: 'employee-bus',
        name: 'Employee Private Bus',
        nameAr: 'حافلة موظفين خاصة',
        description: 'Company-dedicated employee transport buses (2-50 seats)',
        descriptionAr: 'حافلات نقل موظفين مخصصة للشركة (٢-٥٠ مقعد)',
        icon: Bus,
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXBsb3llZSUyMGJ1cyUyMGNvbW11dGV8ZW58MXx8fHwxNzY3MzE5MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-blue-600 to-indigo-700',
        category: 'employee-transport',
        tier: 2,
        priority: 'high',
        features: ['Variable capacity (2-50 seats)', 'Fixed routes', 'Corporate contracts', 'Most economical per employee'],
        route: '/employee-bus'
      },
      {
        id: 'employee-car-shared',
        name: 'Employee Private Car – Shared',
        nameAr: 'سيارة خاصة للموظفين - مشتركة',
        description: 'Cost-optimized ride sharing with other employees',
        descriptionAr: 'مشاركة رحلة موفرة للتكلفة مع موظفين آخرين',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwb29sJTIwY29tbXV0ZSUyMHdvcmtlcnN8ZW58MXx8fHwxNzY3MzE5MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-teal-500 to-cyan-600',
        category: 'employee-transport',
        tier: 2,
        priority: 'high',
        features: ['Medium capacity (4-6 seats)', 'Shared costs', 'Flexible pickup points', 'Mid-range pricing'],
        route: '/employee-car-shared'
      },
      {
        id: 'employee-car-personal',
        name: 'Employee Private Car – Personal',
        nameAr: 'سيارة خاصة للموظفين - شخصية',
        description: 'Fully private, premium transport for employees',
        descriptionAr: 'نقل خاص وفاخر بالكامل للموظفين',
        icon: Car,
        image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcml2YXRlJTIwY2FyJTIwZHJpdmVyJTIwbHV4dXJ5fGVufDF8fHx8MTc2NzMxOTAzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-amber-500 to-yellow-600',
        category: 'employee-transport',
        tier: 2,
        priority: 'high',
        features: ['Private vehicle (1-3 seats)', 'Executive comfort', 'Premium service', 'Highest privacy'],
        route: '/employee-car-personal'
      }
    ]
  },

  // ====================================
  // 🥉 TIER 3: DELIVERY & LOGISTICS
  // ====================================
  {
    id: 'delivery',
    name: 'Delivery & Logistics',
    nameAr: 'التوصيل والخدمات اللوجستية',
    description: 'Fast and reliable delivery services',
    descriptionAr: 'خدمات توصيل سريعة وموثوقة',
    icon: Package,
    color: 'from-blue-500 to-cyan-500',
    tier: 3,
    priority: 'high',
    services: [
      {
        id: 'package-delivery',
        name: 'Package Delivery',
        nameAr: 'توصيل الطرود',
        description: 'Same-day & next-day delivery',
        descriptionAr: 'توصيل في نفس اليوم أو اليوم التالي',
        icon: Package,
        image: 'https://images.unsplash.com/photo-1758523670564-d1d6a734dc0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VyaWVyJTIwZGVsaXZlcnklMjBwYWNrYWdlJTIwc2VydmljZXxlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-blue-500 to-cyan-500',
        category: 'delivery',
        tier: 3,
        priority: 'high',
        features: ['Real-time tracking', 'Proof of delivery', 'Insurance available', 'Scheduled delivery'],
        route: '/delivery'
      },
      {
        id: 'express-delivery',
        name: 'Express Delivery',
        nameAr: 'التوصيل السريع',
        description: 'Urgent deliveries within hours',
        descriptionAr: 'توصيل عاجل خلال ساعات',
        icon: Cpu,
        image: 'https://images.unsplash.com/photo-1766421687400-e7e742d6f39d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleHByZXNzJTIwZGVsaXZlcnklMjBmYXN0JTIwY291cmllciUyMG1vdG9yY3ljbGV8ZW58MXx8fHwxNzcwMjUwMzA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-red-500 to-orange-600',
        category: 'delivery',
        tier: 3,
        priority: 'high',
        features: ['1-3 hour delivery', 'Priority handling', 'Direct routes', 'Premium service'],
        route: '/express-delivery'
      },
      {
        id: 'food-delivery',
        name: 'Food & Grocery Delivery',
        nameAr: 'توصيل الطعام والبقالة',
        description: 'Hot food & fresh groceries delivered fast',
        descriptionAr: 'طعام ساخن وبقالة طازجة توصيل سريع',
        icon: ShoppingBag,
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaXZlcnklMjBiYWclMjBncm9jZXJ5fGVufDF8fHx8MTc2OTY0MzI3MHww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-green-500 to-emerald-600',
        category: 'delivery',
        tier: 3,
        priority: 'medium',
        features: ['Temperature controlled', 'Fast delivery', 'Restaurant partnerships', 'Fresh guarantee'],
        route: '/food-delivery'
      },
      {
        id: 'freight',
        name: 'Freight & Cargo',
        nameAr: 'الشحن والبضائع',
        description: 'Heavy cargo logistics for businesses',
        descriptionAr: 'خدمات لوجستية للبضائع الثقيلة للشركات',
        icon: TruckIcon,
        image: 'https://images.unsplash.com/photo-1597266833335-ccd08f703654?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVpZ2h0JTIwdHJ1Y2slMjBjYXJnbyUyMGxvZ2lzdGljc3xlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-slate-600 to-slate-800',
        category: 'delivery',
        tier: 3,
        priority: 'medium',
        features: ['Large shipments', 'B2B logistics', 'Customs clearance', 'Loading service'],
        route: '/freight'
      }
    ]
  },

  // ====================================
  // 🏅 TIER 4: REGULATED / SPECIALIZED TRANSPORT
  // ====================================
  {
    id: 'specialized',
    name: 'Specialized Transport',
    nameAr: 'النقل المتخصص',
    description: 'Regulated transport for specific needs',
    descriptionAr: 'نقل منظم لاحتياجات محددة',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    tier: 4,
    priority: 'medium',
    services: [
      {
        id: 'school',
        name: 'School Transport',
        nameAr: 'نقل المدارس',
        description: 'Safe student commute services',
        descriptionAr: 'خدمات نقل آمنة للطلاب',
        icon: School,
        image: 'https://images.unsplash.com/photo-1764083029047-6c9b160d3554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBidXMlMjBjaGlsZHJlbiUyMHN0dWRlbnRzfGVufDF8fHx8MTc3MDI1MDMwNXww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-yellow-400 to-amber-600',
        category: 'specialized',
        tier: 4,
        priority: 'medium',
        features: ['Door-to-door service', 'GPS tracking', 'Background-checked drivers', 'Parent notifications'],
        route: '/school'
      },
      {
        id: 'medical',
        name: 'Medical Transport',
        nameAr: 'النقل الطبي',
        description: 'Non-emergency medical transport',
        descriptionAr: 'نقل طبي غير طارئ',
        icon: Stethoscope,
        image: 'https://images.unsplash.com/photo-1619618691037-751d1e6c9ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdHJhbnNwb3J0JTIwd2hlZWxjaGFpciUyMGFjY2Vzc2libGV8ZW58MXx8fHwxNzcwMjUwMzA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-red-500 to-rose-700',
        category: 'specialized',
        tier: 4,
        priority: 'medium',
        features: ['Wheelchair accessible', 'Trained staff', 'Hospital transfers', 'Dialysis transport'],
        route: '/medical'
      },
      {
        id: 'elderly',
        name: 'Elderly Care Transport',
        nameAr: 'نقل كبار السن',
        description: 'Comfortable rides for seniors',
        descriptionAr: 'رحلات مريحة لكبار السن',
        icon: Heart,
        image: 'https://images.unsplash.com/photo-1768528388214-1c465f4950ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZSUyMHNlbmlvciUyMHRyYW5zcG9ydHxlbnwxfHx8fDE3NzAyNTAzMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-purple-400 to-pink-500',
        category: 'specialized',
        tier: 4,
        priority: 'medium',
        features: ['Assisted entry/exit', 'Patient drivers', 'Medical appointments', 'Companion service'],
        route: '/elderly'
      }
    ]
  },

  // ====================================
  // 🏗️ TIER 5: PREMIUM SERVICES / B2B ADD-ONS
  // ====================================
  {
    id: 'premium-chauffeur',
    name: 'Premium Chauffeur Services',
    nameAr: 'خدمات السائقين الفاخرة',
    description: 'Professional drivers for executives and VIPs',
    descriptionAr: 'سائقون محترفون للمديرين والشخصيات الهامة',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    tier: 5,
    priority: 'medium',
    services: [
      {
        id: 'airport',
        name: 'Airport Transfer',
        nameAr: 'نقل المطار',
        description: 'Reliable airport pickup & drop-off',
        descriptionAr: 'استقبال وتوصيل موثوق للمطار',
        icon: Plane,
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwdHJhbnNmZXIlMjBjYXJ8ZW58MXx8fHwxNzY5NjQzMDYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-sky-500 to-blue-600',
        category: 'premium-chauffeur',
        tier: 5,
        priority: 'medium',
        features: ['Flight tracking', 'Meet & greet', 'Fixed rates', '24/7 available'],
        route: '/airport'
      },
      {
        id: 'corporate',
        name: 'Corporate Transport',
        nameAr: 'نقل الشركات',
        description: 'Business transportation solutions',
        descriptionAr: 'حلول نقل الأعمال',
        icon: Briefcase,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMGNhciUyMG1lZXRpbmd8ZW58MXx8fHwxNzY5NjQzMDMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-slate-700 to-slate-900',
        category: 'premium-chauffeur',
        tier: 5,
        priority: 'medium',
        features: ['Corporate accounts', 'Monthly packages', 'Invoice billing', 'Multiple users'],
        route: '/corporate'
      },
      {
        id: 'hourly-chauffeur',
        name: 'Hourly Chauffeur',
        nameAr: 'سائق بالساعة',
        description: 'Hire a professional driver by the hour',
        descriptionAr: 'استأجر سائق محترف بالساعة',
        icon: Clock,
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkcml2ZXIlMjB1bmlmb3JtfGVufDF8fHx8MTc2OTY0MzEyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-indigo-500 to-purple-600',
        category: 'premium-chauffeur',
        tier: 5,
        priority: 'low',
        features: ['Flexible hours', 'Professional drivers', 'Multiple stops', 'No surge pricing'],
        route: '/hourly-chauffeur'
      },
      {
        id: 'luxury',
        name: 'Luxury Chauffeur',
        nameAr: 'سائق فاخر',
        description: 'Premium vehicles with professional chauffeurs',
        descriptionAr: 'سيارات فاخرة مع سائقين محترفين',
        icon: Crown,
        image: 'https://images.unsplash.com/photo-1764090317825-9b76e437c8d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBibGFjayUyMGNhciUyMGNoYXVmZmV1cnxlbnwxfHx8fDE3NjczMTkwMzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-amber-500 to-yellow-600',
        category: 'premium-chauffeur',
        tier: 5,
        priority: 'low',
        features: ['Premium vehicles', 'Professional drivers', 'VIP service', 'Airport meet & greet'],
        route: '/luxury'
      }
    ]
  },

  // ====================================
  // 🏗️ TIER 6: VEHICLE / RENTAL SUPPORT
  // ====================================
  {
    id: 'rentals',
    name: 'Vehicle Rentals',
    nameAr: 'تأجير المركبات',
    description: 'Self-drive vehicles for any duration',
    descriptionAr: 'مركبات للقيادة الذاتية لأي مدة',
    icon: Key,
    color: 'from-indigo-500 to-purple-600',
    tier: 6,
    priority: 'low',
    services: [
      {
        id: 'car-rental',
        name: 'Car Rental',
        nameAr: 'تأجير السيارات',
        description: 'Self-drive cars for any duration',
        descriptionAr: 'سيارات للقيادة الذاتية لأي مدة',
        icon: Car,
        image: 'https://images.unsplash.com/photo-1604445415362-2a9840bd5ff6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xkaW5nJTIwY2FyJTIwa2V5cyUyMHJlbnRhbHxlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-blue-600 to-indigo-700',
        category: 'rentals',
        tier: 6,
        priority: 'low',
        features: ['Hourly/daily/weekly', 'Economy to luxury', 'Unlimited mileage', 'Insurance included'],
        route: '/car-rental'
      },
      {
        id: 'van-rental',
        name: 'Van & Minibus Rental',
        nameAr: 'تأجير الفانات والحافلات الصغيرة',
        description: 'Large vehicles for groups and cargo',
        descriptionAr: 'مركبات كبيرة للمجموعات والبضائع',
        icon: Bus,
        image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNwcmludGVyJTIwdmFuJTIwd2hpdGV8ZW58MXx8fHwxNzY5NjQzMTUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-cyan-600 to-blue-700',
        category: 'rentals',
        tier: 6,
        priority: 'low',
        features: ['7-15 seaters', 'Extra luggage space', 'GPS included', 'Group travel'],
        route: '/van-rental'
      },
      {
        id: 'truck-rental',
        name: 'Truck Rental',
        nameAr: 'تأجير الشاحنات',
        description: 'Self-drive trucks for moving & cargo',
        descriptionAr: 'شاحنات للنقل والبضائع',
        icon: TruckIcon,
        image: 'https://images.unsplash.com/photo-1597266833335-ccd08f703654?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVpZ2h0JTIwdHJ1Y2slMjBjYXJnbyUyMGxvZ2lzdGljc3xlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-slate-600 to-slate-800',
        category: 'rentals',
        tier: 6,
        priority: 'low',
        features: ['Various sizes', 'Moving equipment', 'Loading assistance', 'Flexible rental'],
        route: '/truck-rental'
      },
      {
        id: 'motorcycle-rental',
        name: 'Motorcycle / Scooter Rental',
        nameAr: 'تأجير الدراجات النارية',
        description: 'Two-wheelers for quick city travel',
        descriptionAr: 'مركبات ذات عجلتين للتنقل السريع في المدينة',
        icon: Bike,
        image: 'https://images.unsplash.com/photo-1704613268754-2f25a521930b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcmVudGFsJTIwc3BvcnQlMjBiaWtlfGVufDF8fHx8MTc2OTY0MDMzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        color: 'from-orange-500 to-red-600',
        category: 'rentals',
        tier: 6,
        priority: 'low',
        features: ['Sport bikes & scooters', 'Helmets included', 'Hourly/daily rates', 'City-friendly'],
        route: '/motorcycle-rental'
      }
    ]
  }
];

// Flat list of all services for easy lookup
export const allServices: Service[] = serviceCategories.flatMap(cat => cat.services);

// Get services by tier
export function getServicesByTier(tier: 1 | 2 | 3 | 4 | 5 | 6): Service[] {
  return allServices.filter(service => service.tier === tier);
}

// Get services by priority
export function getServicesByPriority(priority: 'high' | 'medium' | 'low'): Service[] {
  return allServices.filter(service => service.priority === priority);
}

// Get services by category
export function getServicesByCategory(categoryId: string): Service[] {
  const category = serviceCategories.find(cat => cat.id === categoryId);
  return category?.services || [];
}

// Get service by ID
export function getServiceById(serviceId: string): Service | undefined {
  return allServices.find(service => service.id === serviceId);
}

// Get category for a service
export function getCategoryForService(serviceId: string): ServiceCategory | undefined {
  return serviceCategories.find(cat => 
    cat.services.some(service => service.id === serviceId)
  );
}

// Get high priority services (Tier 1-3)
export function getHighPriorityServices(): Service[] {
  return allServices.filter(service => service.tier <= 3);
}

// Get core services (Tier 1)
export function getCoreServices(): Service[] {
  return getServicesByTier(1);
}

// Export summary for quick reference
export const serviceSummary = {
  totalCategories: serviceCategories.length,
  totalServices: allServices.length,
  tier1Services: getServicesByTier(1).length,
  tier2Services: getServicesByTier(2).length,
  tier3Services: getServicesByTier(3).length,
  tier4Services: getServicesByTier(4).length,
  tier5Services: getServicesByTier(5).length,
  tier6Services: getServicesByTier(6).length,
  highPriorityServices: getServicesByPriority('high').length,
  mediumPriorityServices: getServicesByPriority('medium').length,
  lowPriorityServices: getServicesByPriority('low').length,
  categories: serviceCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    tier: cat.tier,
    priority: cat.priority,
    serviceCount: cat.services.length
  }))
};