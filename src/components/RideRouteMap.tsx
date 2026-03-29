/**
 * RideRouteMap
 *
 * Compact route preview for ride cards.
 * It now reuses the branded WaselMap implementation so every map surface
 * across rides, trips, and packages shares the same visual language.
 */

import { type LiveRide } from '../services/liveDataService';
import { WaselMap } from './WaselMap';

interface RideRouteMapProps {
  ride: LiveRide;
  height?: number;
  showDriver?: boolean;
  interactive?: boolean;
  className?: string;
}

export function RideRouteMap({
  ride,
  height = 180,
  showDriver = true,
  interactive = false,
  className = '',
}: RideRouteMapProps) {
  const route = [
    { lat: ride.fromCoord.lat, lng: ride.fromCoord.lng, label: ride.from },
    { lat: ride.toCoord.lat, lng: ride.toCoord.lng, label: ride.to },
  ];

  const markers = showDriver
    ? [
        {
          lat: ride.driverCoord.lat,
          lng: ride.driverCoord.lng,
          label: 'Driver',
          type: 'waypoint' as const,
        },
      ]
    : [];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#040C18',
        border: '1px solid rgba(0,200,232,0.12)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.28)',
      }}
    >
      <WaselMap
        center={ride.driverCoord}
        height="100%"
        route={route}
        markers={markers}
        compact={!interactive}
        showMosques={false}
        showRadars={interactive}
        autoTrack={false}
        className="h-full w-full"
      />

      <div
        style={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          zIndex: 22,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(8,18,34,0.86)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,200,232,0.16)',
          color: '#D7E7F7',
          fontFamily: "-apple-system,'Inter','Cairo',sans-serif",
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
          boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
        }}
      >
        <span style={{ color: '#00C8E8' }}>{ride.distanceKm} km</span>
        <span style={{ color: 'rgba(255,255,255,0.22)' }}>•</span>
        <span>
          {Math.floor(ride.durationMin / 60)}h {ride.durationMin % 60}m
        </span>
      </div>
    </div>
  );
}
