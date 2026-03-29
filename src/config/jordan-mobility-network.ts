/**
 * Jordan Mobility Network - 12 Core Routes
 * Pre-configured routes with coordinates, distances, and pricing
 */

export interface JordanRoute {
  id: string;
  origin: string;
  destination: string;
  originAr: string;
  destinationAr: string;
  distance: number; // km
  duration: number; // minutes
  baseFare: number; // JOD
  coordinates: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
  popularity: 'high' | 'medium' | 'low';
  category: 'intercity' | 'regional' | 'local';
}

export const JORDAN_MOBILITY_NETWORK: JordanRoute[] = [
  // ═══════════════════════════════════════════════════════════════
  // AMMAN HUB (Capital - Main Hub)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'amman-irbid',
    origin: 'Amman',
    destination: 'Irbid',
    originAr: 'عمّان',
    destinationAr: 'إربد',
    distance: 85,
    duration: 70,
    baseFare: 6.0,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 32.5556, lng: 35.8500 },
    },
    popularity: 'high',
    category: 'intercity',
  },
  {
    id: 'amman-zarqa',
    origin: 'Amman',
    destination: 'Zarqa',
    originAr: 'عمّان',
    destinationAr: 'الزرقاء',
    distance: 25,
    duration: 30,
    baseFare: 3.0,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 32.0728, lng: 36.0882 },
    },
    popularity: 'high',
    category: 'regional',
  },
  {
    id: 'amman-aqaba',
    origin: 'Amman',
    destination: 'Aqaba',
    originAr: 'عمّان',
    destinationAr: 'العقبة',
    distance: 330,
    duration: 240,
    baseFare: 25.0,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 29.5267, lng: 35.0081 },
    },
    popularity: 'high',
    category: 'intercity',
  },
  {
    id: 'amman-jerash',
    origin: 'Amman',
    destination: 'Jerash',
    originAr: 'عمّان',
    destinationAr: 'جرش',
    distance: 48,
    duration: 45,
    baseFare: 4.5,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 32.2718, lng: 35.8965 },
    },
    popularity: 'medium',
    category: 'regional',
  },
  {
    id: 'amman-ajloun',
    origin: 'Amman',
    destination: 'Ajloun',
    originAr: 'عمّان',
    destinationAr: 'عجلون',
    distance: 73,
    duration: 65,
    baseFare: 5.5,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 32.3326, lng: 35.7519 },
    },
    popularity: 'medium',
    category: 'regional',
  },
  {
    id: 'amman-madaba',
    origin: 'Amman',
    destination: 'Madaba',
    originAr: 'عمّان',
    destinationAr: 'مادبا',
    distance: 33,
    duration: 35,
    baseFare: 3.5,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 31.7197, lng: 35.7936 },
    },
    popularity: 'high',
    category: 'regional',
  },
  {
    id: 'amman-karak',
    origin: 'Amman',
    destination: 'Karak',
    originAr: 'عمّان',
    destinationAr: 'الكرك',
    distance: 120,
    duration: 90,
    baseFare: 9.0,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 31.1853, lng: 35.7048 },
    },
    popularity: 'medium',
    category: 'intercity',
  },
  {
    id: 'amman-tafila',
    origin: 'Amman',
    destination: 'Tafila',
    originAr: 'عمّان',
    destinationAr: 'الطفيلة',
    distance: 183,
    duration: 135,
    baseFare: 14.0,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 30.8375, lng: 35.6042 },
    },
    popularity: 'low',
    category: 'intercity',
  },
  {
    id: 'amman-maan',
    origin: 'Amman',
    destination: "Ma'an",
    originAr: 'عمّان',
    destinationAr: 'معان',
    distance: 218,
    duration: 165,
    baseFare: 16.0,
    coordinates: {
      origin: { lat: 31.9454, lng: 35.9284 },
      destination: { lat: 30.1962, lng: 35.7360 },
    },
    popularity: 'medium',
    category: 'intercity',
  },

  // ═══════════════════════════════════════════════════════════════
  // NORTHERN ROUTES (Irbid Hub)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'irbid-zarqa',
    origin: 'Irbid',
    destination: 'Zarqa',
    originAr: 'إربد',
    destinationAr: 'الزرقاء',
    distance: 78,
    duration: 60,
    baseFare: 6.0,
    coordinates: {
      origin: { lat: 32.5556, lng: 35.8500 },
      destination: { lat: 32.0728, lng: 36.0882 },
    },
    popularity: 'medium',
    category: 'regional',
  },
  {
    id: 'irbid-ajloun',
    origin: 'Irbid',
    destination: 'Ajloun',
    originAr: 'إربد',
    destinationAr: 'عجلون',
    distance: 28,
    duration: 30,
    baseFare: 3.0,
    coordinates: {
      origin: { lat: 32.5556, lng: 35.8500 },
      destination: { lat: 32.3326, lng: 35.7519 },
    },
    popularity: 'high',
    category: 'local',
  },

  // ═══════════════════════════════════════════════════════════════
  // EASTERN ROUTES (Zarqa Hub)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'zarqa-mafraq',
    origin: 'Zarqa',
    destination: 'Mafraq',
    originAr: 'الزرقاء',
    destinationAr: 'المفرق',
    distance: 55,
    duration: 50,
    baseFare: 4.5,
    coordinates: {
      origin: { lat: 32.0728, lng: 36.0882 },
      destination: { lat: 32.3406, lng: 36.2074 },
    },
    popularity: 'medium',
    category: 'regional',
  },
];

/**
 * Get route by ID
 */
export function getRoute(routeId: string): JordanRoute | undefined {
  return JORDAN_MOBILITY_NETWORK.find((r) => r.id === routeId);
}

/**
 * Get all routes from a city
 */
export function getRoutesFrom(city: string): JordanRoute[] {
  return JORDAN_MOBILITY_NETWORK.filter(
    (r) => r.origin.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Get all routes to a city
 */
export function getRoutesTo(city: string): JordanRoute[] {
  return JORDAN_MOBILITY_NETWORK.filter(
    (r) => r.destination.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Get route between two cities (bidirectional)
 */
export function getRouteBetween(
  city1: string,
  city2: string
): JordanRoute | undefined {
  const c1 = city1.toLowerCase();
  const c2 = city2.toLowerCase();
  
  return JORDAN_MOBILITY_NETWORK.find(
    (r) =>
      (r.origin.toLowerCase() === c1 && r.destination.toLowerCase() === c2) ||
      (r.origin.toLowerCase() === c2 && r.destination.toLowerCase() === c1)
  );
}

/**
 * Get all unique cities
 */
export function getAllCities(): string[] {
  const cities = new Set<string>();
  JORDAN_MOBILITY_NETWORK.forEach((r) => {
    cities.add(r.origin);
    cities.add(r.destination);
  });
  return Array.from(cities).sort();
}

/**
 * Get popular routes
 */
export function getPopularRoutes(): JordanRoute[] {
  return JORDAN_MOBILITY_NETWORK.filter((r) => r.popularity === 'high');
}

/**
 * Calculate fare based on distance and passengers
 */
export function calculateFare(
  distance: number,
  passengers: number = 1,
  mode: 'carpooling' | 'on-demand' = 'carpooling'
): number {
  if (mode === 'carpooling') {
    // Fuel-based cost sharing
    const fuelCost = distance * 0.072; // JOD per km
    const buffer = 1.2;
    return Math.ceil((fuelCost * buffer) / passengers);
  } else {
    // On-demand dynamic pricing
    const baseFare = distance * 0.5 + 2.0; // Base + per km
    return Math.ceil(baseFare);
  }
}
