/**
 * Google Maps Integration for Wasel | واصل
 * Live tracking, route visualization, distance calculation
 */

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  polyline: string; // encoded polyline
}

/**
 * Load Google Maps JavaScript API
 */
export async function loadGoogleMaps(): Promise<typeof google> {
  if (typeof google !== 'undefined' && google.maps) {
    return google;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize a Google Map instance
 */
export async function initializeMap(
  container: HTMLElement,
  center: Location,
  zoom: number = 12
): Promise<google.maps.Map> {
  await loadGoogleMaps();
  
  return new google.maps.Map(container, {
    center: { lat: center.lat, lng: center.lng },
    zoom,
    styles: [
      // Dark mode map style
      { elementType: 'geometry', stylers: [{ color: '#212121' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
  });
}

/**
 * Add a marker to the map
 */
export function addMarker(
  map: google.maps.Map,
  location: Location,
  options?: {
    icon?: string;
    title?: string;
    label?: string;
    color?: string;
  }
): google.maps.Marker {
  const marker = new google.maps.Marker({
    position: { lat: location.lat, lng: location.lng },
    map,
    title: options?.title,
    label: options?.label,
    icon: options?.icon || {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: options?.color || '#00C8E8',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    },
  });

  return marker;
}

/**
 * Draw a route between two points
 */
export async function drawRoute(
  map: google.maps.Map,
  origin: Location,
  destination: Location,
  waypoints?: Location[]
): Promise<{ polyline: google.maps.Polyline; routeInfo: RouteInfo }> {
  await loadGoogleMaps();

  const directionsService = new google.maps.DirectionsService();
  
  const request: google.maps.DirectionsRequest = {
    origin: { lat: origin.lat, lng: origin.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    waypoints: waypoints?.map(wp => ({
      location: { lat: wp.lat, lng: wp.lng },
      stopover: true,
    })),
    travelMode: google.maps.TravelMode.DRIVING,
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        const route = result.routes[0];
        const leg = route.legs[0];

        // Draw polyline
        const polyline = new google.maps.Polyline({
          path: route.overview_path,
          geodesic: true,
          strokeColor: '#00C8E8',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });

        // Calculate total distance and duration
        let totalDistance = 0;
        let totalDuration = 0;
        route.legs.forEach(leg => {
          totalDistance += leg.distance?.value || 0;
          totalDuration += leg.duration?.value || 0;
        });

        const routeInfo: RouteInfo = {
          distance: totalDistance / 1000, // convert to km
          duration: totalDuration / 60, // convert to minutes
          polyline: route.overview_polyline,
        };

        resolve({ polyline, routeInfo });
      } else {
        reject(new Error(`Directions request failed: ${status}`));
      }
    });
  });
}

/**
 * Calculate distance between two points
 */
export async function calculateDistance(
  origin: Location,
  destination: Location
): Promise<number> {
  await loadGoogleMaps();

  const service = new google.maps.DistanceMatrixService();

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const distance = response.rows[0].elements[0].distance.value / 1000; // km
          resolve(distance);
        } else {
          reject(new Error(`Distance calculation failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Track live location (driver tracking)
 */
export function trackLiveLocation(
  map: google.maps.Map,
  onLocationUpdate: (location: Location) => void,
  options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }
): number {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      onLocationUpdate(location);
    },
    (error) => {
      console.error('Geolocation error:', error);
    },
    {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 5000,
      maximumAge: options?.maximumAge ?? 0,
    }
  );

  return watchId;
}

/**
 * Stop tracking location
 */
export function stopTrackingLocation(watchId: number) {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<Location> {
  await loadGoogleMaps();

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address,
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(location: Location): Promise<string> {
  await loadGoogleMaps();

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat: location.lat, lng: location.lng } },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Common Jordan city coordinates for quick reference
 */
export const JORDAN_CITIES: Record<string, Location> = {
  Amman: { lat: 31.9454, lng: 35.9284, address: 'Amman, Jordan' },
  Aqaba: { lat: 29.5320, lng: 35.0063, address: 'Aqaba, Jordan' },
  Irbid: { lat: 32.5556, lng: 35.8500, address: 'Irbid, Jordan' },
  Zarqa: { lat: 32.0667, lng: 36.1000, address: 'Zarqa, Jordan' },
  Madaba: { lat: 31.7197, lng: 35.7956, address: 'Madaba, Jordan' },
  Salt: { lat: 32.0333, lng: 35.7272, address: 'Salt, Jordan' },
  Jerash: { lat: 32.2722, lng: 35.8911, address: 'Jerash, Jordan' },
  'Dead Sea': { lat: 31.5500, lng: 35.4833, address: 'Dead Sea, Jordan' },
  Petra: { lat: 30.3285, lng: 35.4444, address: 'Petra, Jordan' },
  'Wadi Rum': { lat: 29.5750, lng: 35.4167, address: 'Wadi Rum, Jordan' },
  Karak: { lat: 31.1853, lng: 35.7050, address: 'Karak, Jordan' },
  "Ma'an": { lat: 30.1962, lng: 35.7340, address: "Ma'an, Jordan" },
};
