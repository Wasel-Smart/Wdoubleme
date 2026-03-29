/**
 * GoogleMapComponent — now powered by WaselMap
 *
 * This file keeps its original export interface for backwards compatibility
 * while delegating all rendering to the new WaselMap world-class component.
 */

export { WaselMap as GoogleMapComponent } from './WaselMap';
export type { WaselMapProps as GoogleMapComponentProps } from './WaselMap';

// Keep old Hazard type for imports that reference it
export interface Hazard {
  id?: string;
  type: 'accident' | 'construction' | 'traffic' | 'police' | 'road_closure' | 'radar' | 'barrier';
  location: { lat: number; lng: number };
  severity?: 'low' | 'medium' | 'high';
  description: string;
  reportedAt?: string;
  reportedBy?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}