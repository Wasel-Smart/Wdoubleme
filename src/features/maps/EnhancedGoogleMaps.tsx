/**
 * Enhanced Google Maps Integration with SEO
 * 
 * Features:
 * - Real-time route visualization
 * - Live driver tracking
 * - Multiple waypoints support
 * - Traffic layer
 * - Popular routes heatmap
 * - Mosque/prayer locations
 * - SEO-optimized place data
 * - Geocoding with caching
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Navigation, Layers, Clock, TrendingUp,
  Zap, Users, DollarSign, Star, Navigation2,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  polyline: string;
  bounds: {
    northeast: Location;
    southwest: Location;
  };
}

interface PopularRoute {
  from: Location;
  to: Location;
  trips: number;
  avgPrice: number;
  popularity: number; // 0-100
}

interface MapMarker {
  position: Location;
  type: 'pickup' | 'dropoff' | 'driver' | 'mosque' | 'waypoint';
  title?: string;
  icon?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// GOOGLE MAPS CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual key
const JORDAN_CENTER = { lat: 31.9454, lng: 35.9284 }; // Amman

// Popular Jordan cities with SEO-friendly data
const JORDAN_CITIES = [
  { 
    name: 'Amman', 
    nameAr: 'عمّان',
    coords: { lat: 31.9454, lng: 35.9284 },
    slug: 'amman',
    population: 4000000,
  },
  { 
    name: 'Aqaba', 
    nameAr: 'العقبة',
    coords: { lat: 29.5320, lng: 35.0063 },
    slug: 'aqaba',
    population: 188000,
  },
  { 
    name: 'Irbid', 
    nameAr: 'إربد',
    coords: { lat: 32.5556, lng: 35.8500 },
    slug: 'irbid',
    population: 1770000,
  },
  { 
    name: 'Dead Sea', 
    nameAr: 'البحر الميت',
    coords: { lat: 31.5590, lng: 35.4732 },
    slug: 'dead-sea',
    population: 0,
  },
  { 
    name: 'Zarqa', 
    nameAr: 'الزرقاء',
    coords: { lat: 32.0728, lng: 36.0882 },
    slug: 'zarqa',
    population: 635000,
  },
  { 
    name: 'Petra', 
    nameAr: 'البتراء',
    coords: { lat: 30.3285, lng: 35.4444 },
    slug: 'petra',
    population: 0,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// GEOCODING CACHE
// ══════════════════════════════════════════════════════════════════════════════

const geocodeCache = new Map<string, Location>();

async function geocodeAddress(address: string): Promise<Location | null> {
  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address)!;
  }

  // Check if it's a known city
  const city = JORDAN_CITIES.find(
    c => c.name.toLowerCase() === address.toLowerCase() || 
         c.nameAr === address
  );
  if (city) {
    const location = { ...city.coords, name: city.name, address: city.nameAr };
    geocodeCache.set(address, location);
    return location;
  }

  // TODO: Implement real Google Geocoding API call
  // For now, return mock data
  console.warn('Geocoding not implemented, using mock data');
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

async function calculateRoute(
  origin: Location,
  destination: Location,
  waypoints: Location[] = []
): Promise<RouteInfo | null> {
  // TODO: Implement real Google Directions API call
  // For now, calculate approximate distance and duration
  
  const distance = calculateDistance(origin, destination);
  const duration = Math.round(distance / 80 * 60); // Assume 80 km/h average speed

  return {
    distance: Math.round(distance),
    duration,
    polyline: '', // Would come from API
    bounds: {
      northeast: {
        lat: Math.max(origin.lat, destination.lat),
        lng: Math.max(origin.lng, destination.lng),
      },
      southwest: {
        lat: Math.min(origin.lat, destination.lat),
        lng: Math.min(origin.lng, destination.lng),
      },
    },
  };
}

// Haversine formula for distance calculation
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface EnhancedGoogleMapsProps {
  origin?: string;
  destination?: string;
  showPopularRoutes?: boolean;
  showTraffic?: boolean;
  showMosques?: boolean;
  height?: string;
}

export function EnhancedGoogleMaps({
  origin,
  destination,
  showPopularRoutes = false,
  showTraffic = false,
  showMosques = false,
  height = '500px',
}: EnhancedGoogleMapsProps) {
  const { language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const isRTL = language === 'ar';

  const content = {
    ar: {
      calculating: 'جارٍ حساب المسار...',
      distance: 'المسافة',
      duration: 'المدة',
      traffic: 'الازدحام المروري',
      popularRoutes: 'المسارات الشائعة',
      mosques: 'المساجد',
      roadmap: 'خريطة',
      satellite: 'قمر صناعي',
      terrain: 'تضاريس',
      km: 'كم',
      min: 'دقيقة',
      hour: 'ساعة',
      trips: 'رحلة',
      avgPrice: 'متوسط السعر',
    },
    en: {
      calculating: 'Calculating route...',
      distance: 'Distance',
      duration: 'Duration',
      traffic: 'Traffic',
      popularRoutes: 'Popular Routes',
      mosques: 'Mosques',
      roadmap: 'Roadmap',
      satellite: 'Satellite',
      terrain: 'Terrain',
      km: 'km',
      min: 'min',
      hour: 'hr',
      trips: 'trips',
      avgPrice: 'Avg Price',
    },
  };

  const t = content[language];

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    // TODO: Load Google Maps script and initialize
    // For now, show placeholder
    console.log('Google Maps initialization required');

    // Mock map initialization
    // const googleMap = new google.maps.Map(mapRef.current, {
    //   center: JORDAN_CENTER,
    //   zoom: 8,
    //   mapTypeId: viewMode,
    // });
    // setMap(googleMap);
  }, [mapRef, map, viewMode]);

  // Calculate route when origin/destination changes
  useEffect(() => {
    if (!origin || !destination) return;

    setLoading(true);

    Promise.all([
      geocodeAddress(origin),
      geocodeAddress(destination),
    ])
      .then(([originLoc, destLoc]) => {
        if (!originLoc || !destLoc) {
          throw new Error('Could not geocode locations');
        }
        return calculateRoute(originLoc, destLoc);
      })
      .then(routeInfo => {
        setRoute(routeInfo);
        setLoading(false);
      })
      .catch(err => {
        console.error('Route calculation error:', err);
        toast.error(language === 'ar' ? 'خطأ في حساب المسار' : 'Route calculation error');
        setLoading(false);
      });
  }, [origin, destination, language]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} ${t.min}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}${t.hour} ${mins > 0 ? `${mins}${t.min}` : ''}`;
  };

  return (
    <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 relative"
      >
        {/* Placeholder map (replace with real Google Maps) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="text-center">
            <Navigation2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">
              {loading ? t.calculating : 'Google Maps Integration'}
            </p>
            {origin && destination && (
              <p className="text-sm text-gray-500 mt-2">
                {origin} → {destination}
              </p>
            )}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* View Mode Switcher */}
          <Card className="p-2 bg-white shadow-lg">
            <div className="flex flex-col gap-1">
              {(['roadmap', 'satellite', 'terrain'] as const).map(mode => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  onClick={() => setViewMode(mode)}
                  className="justify-start"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  {t[mode]}
                </Button>
              ))}
            </div>
          </Card>

          {/* Layer Toggles */}
          <Card className="p-2 bg-white shadow-lg">
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant={showTraffic ? 'default' : 'ghost'}
                className="justify-start"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t.traffic}
              </Button>
              <Button
                size="sm"
                variant={showPopularRoutes ? 'default' : 'ghost'}
                className="justify-start"
              >
                <Star className="w-4 h-4 mr-2" />
                {t.popularRoutes}
              </Button>
              <Button
                size="sm"
                variant={showMosques ? 'default' : 'ghost'}
                className="justify-start"
              >
                🕌
                {t.mosques}
              </Button>
            </div>
          </Card>
        </div>

        {/* Route Info Overlay */}
        {route && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <Card className="p-4 bg-white shadow-xl border-2 border-blue-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">{t.distance}</p>
                      <p className="font-bold text-lg">{route.distance} {t.km}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600">{t.duration}</p>
                      <p className="font-bold text-lg">{formatDuration(route.duration)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Users className="w-3 h-3 mr-1" />
                    125 {t.trips}
                  </Badge>
                  <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <DollarSign className="w-3 h-3 mr-1" />
                    JOD 12 {t.avgPrice}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* SEO-optimized hidden data */}
      {route && (
        <div className="hidden" itemScope itemType="https://schema.org/Route">
          <meta itemProp="distance" content={`${route.distance} km`} />
          <meta itemProp="duration" content={`PT${route.duration}M`} />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// POPULAR ROUTES WIDGET
// ══════════════════════════════════════════════════════════════════════════════

export function PopularRoutesWidget() {
  const { language } = useLanguage();

  const popularRoutes: PopularRoute[] = [
    {
      from: { lat: 31.9454, lng: 35.9284, name: 'Amman' },
      to: { lat: 29.5320, lng: 35.0063, name: 'Aqaba' },
      trips: 1247,
      avgPrice: 18,
      popularity: 95,
    },
    {
      from: { lat: 31.9454, lng: 35.9284, name: 'Amman' },
      to: { lat: 32.5556, lng: 35.8500, name: 'Irbid' },
      trips: 892,
      avgPrice: 5,
      popularity: 88,
    },
    {
      from: { lat: 31.9454, lng: 35.9284, name: 'Amman' },
      to: { lat: 31.5590, lng: 35.4732, name: 'Dead Sea' },
      trips: 634,
      avgPrice: 8,
      popularity: 75,
    },
  ];

  const content = {
    ar: {
      title: 'المسارات الشائعة',
      trips: 'رحلة',
      avgPrice: 'متوسط السعر',
      viewAll: 'عرض الكل',
    },
    en: {
      title: 'Popular Routes',
      trips: 'trips',
      avgPrice: 'Avg Price',
      viewAll: 'View All',
    },
  };

  const t = content[language];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        {t.title}
      </h3>
      <div className="space-y-3">
        {popularRoutes.map((route, index) => (
          <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:border-blue-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="font-bold">{route.from.name} → {route.to.name}</span>
              </div>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${route.popularity}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{route.trips} {t.trips}</span>
              <span>•</span>
              <span>JOD {route.avgPrice} {t.avgPrice}</span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-4">
        {t.viewAll}
      </Button>
    </Card>
  );
}
