/**
 * LiveTripMap — Real-time trip tracking powered by WaselMap
 *
 * Wraps WaselMap with trip-specific controls:
 * - Route visualisation (pickup → waypoints → dropoff)
 * - Live GPS sharing with pulse ring
 * - Driver / passenger mode
 * - Hazard alerts (accidents, police, radars)
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Radar, MapPin, Navigation2, Clock3, Route } from 'lucide-react';
import { WaselMap, type WaselMapRoute, type WaselMapHazard } from './WaselMap';
import { Badge } from './ui/badge';

interface TripLocation {
  lat: number;
  lng: number;
  label: string;
}

interface LiveTripMapProps {
  tripId: string;
  route: Omit<TripLocation, 'type'>[];
  isDriver?: boolean;
  allowLocationSharing?: boolean;
  onShareLocation?: (loc: { lat: number; lng: number }) => void;
}

export function LiveTripMap({
  tripId,
  route,
  isDriver = false,
  allowLocationSharing = true,
  onShareLocation,
}: LiveTripMapProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [liveSpeed,  setLiveSpeed]  = useState<number | null>(null);

  const mapRoute: WaselMapRoute[] = route.map(r => ({
    lat: r.lat, lng: r.lng, label: r.label,
  }));

  // Sample hazards along the route (would come from server in production)
  const hazards: WaselMapHazard[] = route.length > 0
    ? [
        {
          lat: route[0].lat + 0.002,
          lng: route[0].lng + 0.002,
          type: 'radar',
          name: 'Speed Camera Ahead | كاميرا سرعة',
        },
      ]
    : [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-[#04ADBF]" />
          <h3 className="font-semibold text-white text-sm">
            Live Trip Map | خريطة الرحلة المباشرة
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isTracking && (
            <Badge className="bg-[#04ADBF] text-white text-xs flex items-center gap-1.5 px-2 py-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Tracking
            </Badge>
          )}
          <Badge variant="outline" className="text-xs border-white/20 text-slate-400">
            {isDriver ? 'Traveler Mode' : 'Passenger Mode'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/60 px-3 py-2.5 backdrop-blur-md">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <Route className="w-3.5 h-3.5 text-cyan-400" />
            Route
          </div>
          <p className="text-sm font-semibold text-white">{route[0]?.label} to {route[route.length - 1]?.label}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-2.5 backdrop-blur-md">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#D9965B]" />
            Stops
          </div>
          <p className="text-sm font-semibold text-white">{route.length} operational checkpoints</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-2.5 backdrop-blur-md">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <Clock3 className="w-3.5 h-3.5 text-emerald-400" />
            Sharing
          </div>
          <p className="text-sm font-semibold text-white">{allowLocationSharing ? 'Encrypted live updates on' : 'Live updates paused'}</p>
        </div>
      </div>

      {/* WaselMap */}
      <WaselMap
        center={route.length > 0 ? { lat: route[0].lat, lng: route[0].lng } : undefined}
        zoom={route.length >= 2 ? 11 : 13}
        height={480}
        className="w-full"
        route={mapRoute}
        extraHazards={hazards}
        showTraffic={true}
        showMosques={true}
        showRadars={true}
        autoTrack={false}
        onLocationUpdate={loc => {
          setIsTracking(true);
          setLiveSpeed(loc.speed != null ? Math.round(loc.speed * 3.6) : null);
          onShareLocation?.({ lat: loc.lat, lng: loc.lng });
        }}
      />

      {/* Route stops */}
      {route.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Route Stops | محطات الطريق</p>
          <div className="space-y-1.5">
            {route.map((stop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8"
                style={{ background: 'var(--wasel-glass-md)' }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0
                      ? 'bg-[#09732E] text-white'
                      : i === route.length - 1
                        ? 'bg-[#D9965B] text-white'
                        : 'bg-[#04ADBF]/20 text-[#04ADBF] border border-[#04ADBF]/30'
                  }`}
                >
                  {i === 0 ? 'A' : i === route.length - 1 ? 'B' : i}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{stop.label}</p>
                  <p className="text-slate-500 text-xs">
                    {i === 0 ? 'Starting Point | نقطة الانطلاق'
                     : i === route.length - 1 ? 'Destination | الوجهة'
                     : `Waypoint ${i} | نقطة مرور ${i}`}
                  </p>
                </div>
                <MapPin className={`w-4 h-4 shrink-0 ${
                  i === 0 ? 'text-[#09732E]' : i === route.length - 1 ? 'text-[#D9965B]' : 'text-[#04ADBF]'
                }`} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Safety notice */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ background: 'rgba(9,115,46,0.1)', borderColor: 'rgba(9,115,46,0.25)' }}
      >
        <ShieldCheck className="w-5 h-5 text-[#09732E] shrink-0" />
        <p className="text-xs text-slate-300">
          Trip <strong className="text-white">{tripId}</strong> · Location is encrypted and only shared with your trip companions | موقعك مشفّر ولا يُشارك إلا مع رفاق الرحلة
        </p>
      </div>
    </div>
  );
}
