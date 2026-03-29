/**
 * MapStyles.ts — Wasel dark map theme
 * Used by WaselMap and any custom Google Maps usage across the app.
 */
export const WASEL_MAP_STYLE = [
  { elementType: 'geometry',                                  stylers: [{ color: '#0c1520' }] },
  { elementType: 'labels.icon',                               stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',                          stylers: [{ color: '#8590a2' }] },
  { elementType: 'labels.text.stroke',                        stylers: [{ color: '#0c1520' }] },
  { featureType: 'administrative',       elementType: 'geometry',            stylers: [{ color: '#1a2744' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c8d0db' }] },
  { featureType: 'administrative.country',  elementType: 'labels.text.fill', stylers: [{ color: '#aab4c0' }] },
  { featureType: 'poi',                  elementType: 'geometry',            stylers: [{ color: '#111B2E' }] },
  { featureType: 'poi',                  elementType: 'labels.text.fill',    stylers: [{ color: '#6b7a8d' }] },
  { featureType: 'poi.park',             elementType: 'geometry',            stylers: [{ color: '#0d2010' }] },
  { featureType: 'poi.park',             elementType: 'labels.text.fill',    stylers: [{ color: '#4a8860' }] },
  { featureType: 'road',                 elementType: 'geometry',            stylers: [{ color: '#1e2f4a' }] },
  { featureType: 'road',                 elementType: 'geometry.stroke',     stylers: [{ color: '#0f1a2e' }] },
  { featureType: 'road',                 elementType: 'labels.text.fill',    stylers: [{ color: '#9aa0a6' }] },
  { featureType: 'road.arterial',        elementType: 'geometry',            stylers: [{ color: '#223256' }] },
  { featureType: 'road.highway',         elementType: 'geometry',            stylers: [{ color: '#063040' }] },
  { featureType: 'road.highway',         elementType: 'geometry.stroke',     stylers: [{ color: '#04ADBF' }] },
  { featureType: 'road.highway',         elementType: 'labels.text.fill',    stylers: [{ color: '#f3d19c' }] },
  { featureType: 'road.local',           elementType: 'labels.text.fill',    stylers: [{ color: '#616c7c' }] },
  { featureType: 'transit',              elementType: 'geometry',            stylers: [{ color: '#111B2E' }] },
  { featureType: 'transit.station',      elementType: 'labels.text.fill',    stylers: [{ color: '#D9965B' }] },
  { featureType: 'water',                elementType: 'geometry',            stylers: [{ color: '#041828' }] },
  { featureType: 'water',                elementType: 'labels.text.fill',    stylers: [{ color: '#4e6d77' }] },
  { featureType: 'water',                elementType: 'labels.text.stroke',  stylers: [{ color: '#0c2030' }] },
];
