// AI-Powered Trip Matching Service
export interface UserPreferences {
  smoking: boolean;
  music: boolean;
  pets: boolean;
  conversation: 'quiet' | 'moderate' | 'chatty';
  temperature: 'cold' | 'moderate' | 'warm';
}

export interface TripMatch {
  tripId: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  compatibilityScore: number;
  matchReasons: string[];
  price: number;
  departureTime: string;
  availableSeats: number;
  vehicleType: string;
  verified: boolean;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  address: string;
}

// Calculate route compatibility (0-100)
function calculateRouteCompatibility(
  userRoute: { from: RoutePoint; to: RoutePoint },
  tripRoute: { from: RoutePoint; to: RoutePoint; stops?: RoutePoint[] }
): number {
  // Simple distance-based calculation
  const startDistance = getDistance(userRoute.from, tripRoute.from);
  const endDistance = getDistance(userRoute.to, tripRoute.to);
  
  // If stops exist, check if user's start/end are near any stops
  let nearStop = false;
  if (tripRoute.stops && tripRoute.stops.length > 0) {
    nearStop = tripRoute.stops.some(stop => 
      getDistance(userRoute.from, stop) < 5 || 
      getDistance(userRoute.to, stop) < 5
    );
  }
  
  // Score based on proximity (within 5km is good)
  const startScore = Math.max(0, 100 - (startDistance * 10));
  const endScore = Math.max(0, 100 - (endDistance * 10));
  const stopBonus = nearStop ? 20 : 0;
  
  return Math.min(100, (startScore + endScore) / 2 + stopBonus);
}

// Calculate preference compatibility (0-100)
function calculatePreferenceCompatibility(
  userPrefs: UserPreferences,
  driverPrefs: UserPreferences
): number {
  let score = 100;
  
  // Critical preferences (smoking, pets)
  if (userPrefs.smoking !== driverPrefs.smoking) score -= 30;
  if (userPrefs.pets !== driverPrefs.pets) score -= 20;
  
  // Moderate preferences (music, conversation)
  if (userPrefs.music !== driverPrefs.music) score -= 10;
  if (userPrefs.conversation !== driverPrefs.conversation) score -= 10;
  if (userPrefs.temperature !== driverPrefs.temperature) score -= 10;
  
  return Math.max(0, score);
}

// Calculate price compatibility (0-100)
function calculatePriceCompatibility(
  userMaxPrice: number,
  tripPrice: number
): number {
  if (tripPrice > userMaxPrice) return 0;
  
  // Better score if price is lower
  const priceDiff = userMaxPrice - tripPrice;
  const percentSaving = (priceDiff / userMaxPrice) * 100;
  
  return Math.min(100, 70 + percentSaving);
}

// Calculate rating compatibility (0-100)
function calculateRatingCompatibility(
  driverRating: number,
  userMinRating: number = 4.0
): number {
  if (driverRating < userMinRating) return 0;
  
  // Scale from min rating to 5.0
  return ((driverRating - userMinRating) / (5.0 - userMinRating)) * 100;
}

// Helper function to calculate distance between two points (in km)
function getDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Main matching function
export function matchTrips(
  userRoute: { from: RoutePoint; to: RoutePoint },
  userPreferences: UserPreferences,
  userMaxPrice: number,
  userMinRating: number,
  availableTrips: any[]
): TripMatch[] {
  const matches: TripMatch[] = [];
  
  for (const trip of availableTrips) {
    // Calculate individual compatibility scores
    const routeScore = calculateRouteCompatibility(userRoute, {
      from: trip.from,
      to: trip.to,
      stops: trip.stops
    });
    
    const prefScore = calculatePreferenceCompatibility(
      userPreferences,
      trip.driverPreferences
    );
    
    const priceScore = calculatePriceCompatibility(userMaxPrice, trip.price);
    const ratingScore = calculateRatingCompatibility(trip.driverRating, userMinRating);
    
    // Weighted overall score
    const overallScore = (
      routeScore * 0.40 +      // Route is most important
      prefScore * 0.25 +       // Preferences are important
      ratingScore * 0.20 +     // Rating matters
      priceScore * 0.15        // Price is factor
    );
    
    // Only include if score is above threshold
    if (overallScore >= 50) {
      const matchReasons: string[] = [];
      
      if (routeScore >= 80) matchReasons.push('Perfect route match');
      if (prefScore >= 90) matchReasons.push('Great compatibility');
      if (trip.driverRating >= 4.7) matchReasons.push('Highly rated driver');
      if (trip.verified) matchReasons.push('Verified profile');
      if (priceScore >= 85) matchReasons.push('Great price');
      
      matches.push({
        tripId: trip.id,
        driverId: trip.driverId,
        driverName: trip.driverName,
        driverRating: trip.driverRating,
        compatibilityScore: Math.round(overallScore),
        matchReasons,
        price: trip.price,
        departureTime: trip.departureTime,
        availableSeats: trip.availableSeats,
        vehicleType: trip.vehicleType,
        verified: trip.verified
      });
    }
  }
  
  // Sort by compatibility score
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

// Generate smart suggestions
export function generateSuggestions(userHistory: any[]): string[] {
  const suggestions: string[] = [];
  
  // Analyze frequently used routes
  const routeFrequency = new Map<string, number>();
  userHistory.forEach(trip => {
    const routeKey = `${trip.from.address}-${trip.to.address}`;
    routeFrequency.set(routeKey, (routeFrequency.get(routeKey) || 0) + 1);
  });
  
  // Find most common route
  let maxFreq = 0;
  let mostCommonRoute = '';
  routeFrequency.forEach((freq, route) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mostCommonRoute = route;
    }
  });
  
  if (maxFreq >= 3) {
    suggestions.push(`Set up recurring trip for ${mostCommonRoute}?`);
  }
  
  // Check for time patterns
  const morningTrips = userHistory.filter(trip => {
    const hour = new Date(trip.departureTime).getHours();
    return hour >= 6 && hour <= 9;
  });
  
  if (morningTrips.length >= 3) {
    suggestions.push('You often travel in the morning. Enable morning commute alerts?');
  }
  
  return suggestions;
}
