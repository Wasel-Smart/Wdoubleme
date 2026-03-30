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
    labelAr: 'ابحث عن رحلة',
    path: '/find-ride',
    description: 'Search verified intercity rides',
    descriptionAr: 'ابحث عن رحلات موثقة بين المدن',
    accent: 'cyan',
  },
  {
    id: 'post',
    label: 'Offer Ride',
    labelAr: 'أضف رحلتك',
    path: '/offer-ride',
    description: 'Share seats and open package capacity',
    descriptionAr: 'شارك المقاعد وافتح سعة للطرود',
    accent: 'gold',
  },
  {
    id: 'packages',
    label: 'Packages',
    labelAr: 'الطرود',
    path: '/packages',
    description: 'Send and track parcels on live routes',
    descriptionAr: 'أرسل وتتبع الطرود عبر المسارات المباشرة',
    accent: 'gold',
  },
  {
    id: 'trips',
    label: 'My Trips',
    labelAr: 'رحلاتي',
    path: '/my-trips',
    description: 'Manage your active and past bookings',
    descriptionAr: 'أدر رحلاتك الحالية والسابقة',
    accent: 'cyan',
  },
  {
    id: 'bus',
    label: 'Bus',
    labelAr: 'الحافلات',
    path: '/bus',
    description: 'Book scheduled intercity coaches',
    descriptionAr: 'احجز حافلات جدولية بين المدن',
    accent: 'cyan',
  },
];
