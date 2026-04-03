export interface CoreNavItem {
  id: string;
  label: string;
  labelAr: string;
  path: string;
  description: string;
  descriptionAr: string;
  accent: 'cyan' | 'gold';
  requiresAuth?: boolean;
}

export const CORE_NAV_ITEMS: CoreNavItem[] = [
  {
    id: 'find',
    label: 'Route',
    labelAr: 'Route',
    path: '/find-ride',
    description: 'Search shared corridors and auto-grouped rides',
    descriptionAr: 'Search shared corridors and auto-grouped rides',
    accent: 'cyan',
  },
  {
    id: 'movement',
    label: 'Network',
    labelAr: 'Network',
    path: '/mobility-os',
    description: 'See the live network, busiest lanes, and calm windows',
    descriptionAr: 'See the live network, busiest lanes, and calm windows',
    accent: 'gold',
  },
  {
    id: 'trips',
    label: 'Trips',
    labelAr: 'Trips',
    path: '/my-trips',
    description: 'Track your booked movement and active trips',
    descriptionAr: 'Track your booked movement and active trips',
    accent: 'cyan',
    requiresAuth: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    labelAr: 'Profile',
    path: '/profile',
    description: 'Manage your trust, identity, and movement profile',
    descriptionAr: 'Manage your trust, identity, and movement profile',
    accent: 'gold',
    requiresAuth: true,
  },
];
