/**
 * Trip Injection Engine for Wassel
 * Generates synthetic trips to ensure marketplace is always active
 * Gradually replaced by real driver trips as platform grows
 */

export interface City {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  isHub: boolean;
}

export interface SyntheticTrip {
  id: string;
  type: 'passenger' | 'shared' | 'package' | 'return';
  departureCity: City;
  destinationCity: City;
  departureTime: string;
  arrivalTime: string;
  availableSeats?: number;
  cargoCapacity?: number;
  distance: number;
  duration: number; // minutes
  basePrice: number;
  pricePerSeat?: number;
  driverProfile: SyntheticDriverProfile;
  vehicleInfo: VehicleInfo;
  isSynthetic: boolean; // Internal flag only
  priority: number; // Lower priority than real trips
  createdAt: string;
  expiresAt: string;
}

export interface SyntheticDriverProfile {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
  photoUrl: string;
  joinedDate: string;
  languages: string[];
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: 'sedan' | 'suv' | 'van' | 'truck';
  verified: boolean;
}

// Major cities in Jordan (expandable to regional routes)
export const JORDAN_CITIES: City[] = [
  { id: 'amman', nameEn: 'Amman', nameAr: 'عمان', lat: 31.9454, lng: 35.9284, isHub: true },
  { id: 'irbid', nameEn: 'Irbid', nameAr: 'إربد', lat: 32.5556, lng: 35.8500, isHub: true },
  { id: 'zarqa', nameEn: 'Zarqa', nameAr: 'الزرقاء', lat: 32.0728, lng: 36.0880, isHub: true },
  { id: 'aqaba', nameEn: 'Aqaba', nameAr: 'العقبة', lat: 29.5269, lng: 35.0063, isHub: true },
  { id: 'madaba', nameEn: 'Madaba', nameAr: 'مادبا', lat: 31.7197, lng: 35.7956, isHub: false },
  { id: 'karak', nameEn: 'Karak', nameAr: 'الكرك', lat: 31.1853, lng: 35.7047, isHub: false },
  { id: 'mafraq', nameEn: 'Mafraq', nameAr: 'المفرق', lat: 32.3409, lng: 36.2078, isHub: false },
  { id: 'salt', nameEn: 'Salt', nameAr: 'السلط', lat: 32.0392, lng: 35.7272, isHub: false },
  { id: 'jerash', nameEn: 'Jerash', nameAr: 'جرش', lat: 32.2808, lng: 35.8992, isHub: false },
  { id: 'ajloun', nameEn: 'Ajloun', nameAr: 'عجلون', lat: 32.3326, lng: 35.7519, isHub: false },
];

// Regional expansion cities (future)
export const REGIONAL_CITIES: City[] = [
  { id: 'damascus', nameEn: 'Damascus', nameAr: 'دمشق', lat: 33.5138, lng: 36.2765, isHub: true },
  { id: 'beirut', nameEn: 'Beirut', nameAr: 'بيروت', lat: 33.8938, lng: 35.5018, isHub: true },
  { id: 'riyadh', nameEn: 'Riyadh', nameAr: 'الرياض', lat: 24.7136, lng: 46.6753, isHub: true },
  { id: 'jeddah', nameEn: 'Jeddah', nameAr: 'جدة', lat: 21.2854, lng: 39.2376, isHub: true },
];

// Synthetic driver profiles (realistic but generated)
const DRIVER_FIRST_NAMES_AR = ['محمد', 'أحمد', 'خالد', 'عمر', 'علي', 'يوسف', 'حسن', 'سعيد', 'كريم', 'طارق'];
const DRIVER_FIRST_NAMES_EN = ['Mohammad', 'Ahmad', 'Khalid', 'Omar', 'Ali', 'Youssef', 'Hassan', 'Saeed', 'Karim', 'Tarek'];
const DRIVER_LAST_NAMES_AR = ['العمري', 'الحسيني', 'المصري', 'الأردني', 'السعدي', 'الخطيب', 'النجار', 'الشامي'];

const VEHICLE_MAKES = ['Toyota', 'Hyundai', 'Kia', 'Nissan', 'Chevrolet', 'Ford'];
const VEHICLE_MODELS = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
  Kia: ['Optima', 'Cerato', 'Sportage', 'Sorento'],
  Nissan: ['Altima', 'Sentra', 'X-Trail', 'Pathfinder'],
  Chevrolet: ['Malibu', 'Cruze', 'Traverse'],
  Ford: ['Fusion', 'Focus', 'Explorer'],
};
const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red'];

// Time slots for trip distribution
const TIME_SLOTS = [
  { name: 'early-morning', start: '05:00', end: '08:00', label: 'Early Morning' },
  { name: 'morning', start: '08:00', end: '12:00', label: 'Morning' },
  { name: 'afternoon', start: '12:00', end: '17:00', label: 'Afternoon' },
  { name: 'evening', start: '17:00', end: '21:00', label: 'Evening' },
  { name: 'night', start: '21:00', end: '23:59', label: 'Night' },
];

/**
 * Calculate distance between two cities (Haversine formula)
 */
function calculateDistance(city1: City, city2: City): number {
  const R = 6371; // Earth's radius in km
  const dLat = (city2.lat - city1.lat) * Math.PI / 180;
  const dLon = (city2.lng - city1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(city1.lat * Math.PI / 180) * Math.cos(city2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate estimated duration based on distance
 */
function calculateDuration(distance: number): number {
  // Average speed: 80 km/h on highways, 60 km/h in cities
  const avgSpeed = distance > 50 ? 80 : 60;
  return Math.round((distance / avgSpeed) * 60); // minutes
}

/**
 * Calculate price based on distance and trip type
 */
function calculatePrice(distance: number, type: SyntheticTrip['type']): number {
  const basePricePerKm = type === 'package' ? 0.3 : 0.5; // JOD per km
  const basePrice = distance * basePricePerKm;
  
  // Add demand multiplier based on distance
  const demandMultiplier = distance > 200 ? 1.3 : distance > 100 ? 1.2 : 1.1;
  
  return Math.round(basePrice * demandMultiplier * 10) / 10; // Round to 1 decimal
}

/**
 * Generate synthetic driver profile
 */
function generateDriverProfile(): SyntheticDriverProfile {
  const firstNameAr = DRIVER_FIRST_NAMES_AR[Math.floor(Math.random() * DRIVER_FIRST_NAMES_AR.length)];
  const firstNameEn = DRIVER_FIRST_NAMES_EN[Math.floor(Math.random() * DRIVER_FIRST_NAMES_EN.length)];
  const lastNameAr = DRIVER_LAST_NAMES_AR[Math.floor(Math.random() * DRIVER_LAST_NAMES_AR.length)];
  
  // High ratings (4.6 - 5.0) for trust
  const rating = Math.round((4.6 + Math.random() * 0.4) * 10) / 10;
  
  // Established drivers (50-500 trips)
  const totalTrips = Math.floor(50 + Math.random() * 450);
  
  // Joined 6 months to 3 years ago
  const joinedMonthsAgo = Math.floor(6 + Math.random() * 30);
  const joinedDate = new Date();
  joinedDate.setMonth(joinedDate.getMonth() - joinedMonthsAgo);
  
  return {
    id: `synthetic-driver-${Math.random().toString(36).substr(2, 9)}`,
    name: `${firstNameEn} ${lastNameAr}`,
    rating,
    totalTrips,
    verified: true,
    photoUrl: `https://i.pravatar.cc/150?u=${firstNameEn}`,
    joinedDate: joinedDate.toISOString(),
    languages: ['Arabic', 'English'],
  };
}

/**
 * Generate synthetic vehicle info
 */
function generateVehicleInfo(tripType: SyntheticTrip['type']): VehicleInfo {
  const make = VEHICLE_MAKES[Math.floor(Math.random() * VEHICLE_MAKES.length)];
  const models = VEHICLE_MODELS[make as keyof typeof VEHICLE_MODELS];
  const model = models[Math.floor(Math.random() * models.length)];
  const year = 2018 + Math.floor(Math.random() * 6); // 2018-2023
  const color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];
  
  // Generate realistic plate number
  const plateNumber = `${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
  
  // Determine vehicle type based on trip type
  let type: VehicleInfo['type'] = 'sedan';
  if (tripType === 'package') {
    type = Math.random() > 0.5 ? 'van' : 'truck';
  } else if (tripType === 'shared') {
    type = Math.random() > 0.7 ? 'van' : Math.random() > 0.5 ? 'suv' : 'sedan';
  } else {
    type = Math.random() > 0.7 ? 'suv' : 'sedan';
  }
  
  return {
    make,
    model,
    year,
    color,
    plateNumber,
    type,
    verified: true,
  };
}

/**
 * Generate departure time for a time slot
 */
function generateDepartureTime(slot: typeof TIME_SLOTS[0], dateOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + dateOffset);
  
  const [startHour, startMin] = slot.start.split(':').map(Number);
  const [endHour, endMin] = slot.end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const randomMinutes = startMinutes + Math.random() * (endMinutes - startMinutes);
  
  const hour = Math.floor(randomMinutes / 60);
  const min = Math.floor(randomMinutes % 60);
  
  date.setHours(hour, min, 0, 0);
  return date.toISOString();
}

/**
 * Generate a synthetic trip
 */
export function generateSyntheticTrip(
  departureCity: City,
  destinationCity: City,
  timeSlot: typeof TIME_SLOTS[0],
  type: SyntheticTrip['type'],
  dateOffset: number = 0
): SyntheticTrip {
  const distance = calculateDistance(departureCity, destinationCity);
  const duration = calculateDuration(distance);
  const basePrice = calculatePrice(distance, type);
  
  const departureTime = generateDepartureTime(timeSlot, dateOffset);
  const arrivalTime = new Date(new Date(departureTime).getTime() + duration * 60000).toISOString();
  
  const driverProfile = generateDriverProfile();
  const vehicleInfo = generateVehicleInfo(type);
  
  // Determine capacity based on trip type and vehicle
  let availableSeats: number | undefined;
  let cargoCapacity: number | undefined;
  
  if (type === 'package') {
    cargoCapacity = vehicleInfo.type === 'truck' ? 1000 : vehicleInfo.type === 'van' ? 500 : 200; // kg
  } else {
    if (vehicleInfo.type === 'van') {
      availableSeats = 6 + Math.floor(Math.random() * 3); // 6-8 seats
    } else if (vehicleInfo.type === 'suv') {
      availableSeats = 4 + Math.floor(Math.random() * 3); // 4-6 seats
    } else {
      availableSeats = 3 + Math.floor(Math.random() * 2); // 3-4 seats
    }
  }
  
  const pricePerSeat = type === 'shared' ? Math.round(basePrice / (availableSeats || 4) * 10) / 10 : undefined;
  
  // Set expiration (trips expire after 24 hours if not booked)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  return {
    id: `synthetic-trip-${Math.random().toString(36).substr(2, 12)}`,
    type,
    departureCity,
    destinationCity,
    departureTime,
    arrivalTime,
    availableSeats,
    cargoCapacity,
    distance: Math.round(distance),
    duration,
    basePrice,
    pricePerSeat,
    driverProfile,
    vehicleInfo,
    isSynthetic: true,
    priority: 10, // Lower priority than real trips (real trips = 1-5)
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Generate baseline trips for major city pairs
 */
export function generateBaselineTrips(
  cities: City[] = JORDAN_CITIES,
  daysAhead: number = 7
): SyntheticTrip[] {
  const trips: SyntheticTrip[] = [];
  
  // Major hub-to-hub routes (more frequent)
  const hubCities = cities.filter(c => c.isHub);
  
  for (let i = 0; i < hubCities.length; i++) {
    for (let j = 0; j < hubCities.length; j++) {
      if (i === j) continue;
      
      const departureCity = hubCities[i];
      const destinationCity = hubCities[j];
      
      // Generate trips for each day
      for (let day = 0; day < daysAhead; day++) {
        // Hub routes: 3-4 trips per day (morning, afternoon, evening, night)
        const numTrips = 3 + Math.floor(Math.random() * 2);
        const selectedSlots = TIME_SLOTS.slice(0, numTrips);
        
        selectedSlots.forEach(slot => {
          // Passenger trip
          trips.push(generateSyntheticTrip(departureCity, destinationCity, slot, 'passenger', day));
          
          // Shared ride (70% chance)
          if (Math.random() > 0.3) {
            trips.push(generateSyntheticTrip(departureCity, destinationCity, slot, 'shared', day));
          }
          
          // Package delivery (40% chance)
          if (Math.random() > 0.6) {
            trips.push(generateSyntheticTrip(departureCity, destinationCity, slot, 'package', day));
          }
        });
        
        // Return trips (50% chance)
        if (Math.random() > 0.5) {
          trips.push(generateSyntheticTrip(destinationCity, departureCity, TIME_SLOTS[2], 'return', day));
        }
      }
    }
  }
  
  // Secondary routes (hub to non-hub)
  const nonHubCities = cities.filter(c => !c.isHub);
  
  hubCities.forEach(hub => {
    nonHubCities.forEach(secondary => {
      for (let day = 0; day < daysAhead; day++) {
        // 1-2 trips per day for secondary routes
        const numTrips = 1 + Math.floor(Math.random() * 2);
        const selectedSlots = [TIME_SLOTS[1], TIME_SLOTS[2]].slice(0, numTrips);
        
        selectedSlots.forEach(slot => {
          // To hub
          trips.push(generateSyntheticTrip(secondary, hub, slot, 'passenger', day));
          
          // From hub
          trips.push(generateSyntheticTrip(hub, secondary, slot, 'passenger', day));
        });
      }
    });
  });
  
  return trips;
}

/**
 * Check if search demand exists but no trips available
 */
export function shouldInjectTrips(
  searchResults: any[],
  minResultsThreshold: number = 3
): boolean {
  return searchResults.length < minResultsThreshold;
}

/**
 * Generate trips dynamically based on search demand
 */
export function generateDynamicTrips(
  departureCity: City,
  destinationCity: City,
  searchDate?: Date,
  count: number = 5
): SyntheticTrip[] {
  const trips: SyntheticTrip[] = [];
  const dateOffset = searchDate ? Math.floor((searchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Distribute across different time slots
  const slots = [...TIME_SLOTS].sort(() => Math.random() - 0.5).slice(0, count);
  
  slots.forEach(slot => {
    const tripType: SyntheticTrip['type'] = 
      Math.random() > 0.5 ? 'shared' : Math.random() > 0.3 ? 'passenger' : 'package';
    
    trips.push(generateSyntheticTrip(departureCity, destinationCity, slot, tripType, dateOffset));
  });
  
  return trips;
}

/**
 * Merge real and synthetic trips, prioritizing real trips
 */
export function mergeTrips(
  realTrips: any[],
  syntheticTrips: SyntheticTrip[],
  minResults: number = 5
): any[] {
  // Start with real trips (priority 1-5)
  let mergedTrips = [...realTrips];
  
  // If we don't have enough real trips, add synthetic ones
  if (mergedTrips.length < minResults) {
    const neededCount = minResults - mergedTrips.length;
    const selectedSynthetic = syntheticTrips
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
      .slice(0, neededCount);
    
    mergedTrips = [...mergedTrips, ...selectedSynthetic];
  }
  
  // Sort by departure time
  return mergedTrips.sort((a, b) => 
    new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );
}

/**
 * Clean up expired synthetic trips
 */
export function cleanupExpiredTrips(trips: SyntheticTrip[]): SyntheticTrip[] {
  const now = new Date();
  return trips.filter(trip => new Date(trip.expiresAt) > now);
}

/**
 * Get trip injection statistics
 */
export function getTripInjectionStats(trips: SyntheticTrip[]) {
  const now = new Date();
  const activeTrips = trips.filter(t => new Date(t.expiresAt) > now);
  
  return {
    total: trips.length,
    active: activeTrips.length,
    expired: trips.length - activeTrips.length,
    byType: {
      passenger: activeTrips.filter(t => t.type === 'passenger').length,
      shared: activeTrips.filter(t => t.type === 'shared').length,
      package: activeTrips.filter(t => t.type === 'package').length,
      return: activeTrips.filter(t => t.type === 'return').length,
    },
    byRoute: activeTrips.reduce((acc, trip) => {
      const route = `${trip.departureCity.nameEn} → ${trip.destinationCity.nameEn}`;
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
