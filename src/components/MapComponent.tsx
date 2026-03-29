/**
 * MapComponent (DEPRECATED)
 * 
 * This component has been replaced by MapWrapper.
 * This file exists only for backwards compatibility.
 * 
 * @deprecated Use MapWrapper instead
 */

import { MapWrapper, MapMode } from './MapWrapper';

interface LatLng {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  center?: LatLng;
  zoom?: number;
  markers?: LatLng[];
  height?: string | number;
  className?: string;
}

/**
 * Legacy MapComponent - redirects to MapWrapper with 'static' mode
 */
export function MapComponent(props: MapComponentProps) {
  return <MapWrapper mode="static" {...props} />;
}
