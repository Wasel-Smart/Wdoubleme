/**
 * ActiveTripBanner — Sticky animated live-trip strip for the Dashboard
 *
 * ✅ Polls active_trip:{userId} from server every 10 s
 * ✅ Animated ETA countdown (simulated)
 * ✅ Pulsing green "LIVE" indicator
 * ✅ Driver avatar + route summary
 * ✅ Status progression: en_route_to_pickup → driver_arrived → en_route → arriving
 * ✅ "Track Live" → /app/live-trip
 * ✅ Dismiss clears the banner locally (does NOT end the trip)
 * ✅ Full dark Wasel design system
 * ✅ Bilingual (EN / AR)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { flushSync } from 'react-dom';
import {
  Navigation, ChevronRight, X, Radio, MapPin, User,
  Clock, Car, ArrowRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { activeTripAPI, ActiveTrip, TripStatus } from '../services/activeTrip';

// ─── Status labels ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TripStatus, { en: string; ar: string; color: string }> = {
  en_route_to_pickup: { en: 'Driver en route to you', ar: 'السائق في الط��يق إليك', color: 'text-amber-400' },
  driver_arrived:     { en: 'Driver has arrived!',    ar: 'وصل السائق!',           color: 'text-green-400'  },
  en_route:           { en: 'On the way',              ar: 'في الطريق',              color: 'text-primary'    },
  arriving:           { en: 'Almost there',            ar: 'على وشك الوصول',        color: 'text-teal-400'   },
  completed:          { en: 'Trip completed',          ar: 'اكتملت الرحلة',         color: 'text-slate-400'  },
};

// ─── ETA countdown ──────────────────────────────────────────────────────────────

function useEtaCountdown(initialEta: string) {
  // Parse minutes from strings like "3 min", "9 min"
  const parseMinutes = (s: string) => parseInt(s.replace(/\D/g, '')) || 5;

  const [seconds, setSeconds] = useState(() => parseMinutes(initialEta) * 60);

  useEffect(() => {
    setSeconds(parseMinutes(initialEta) * 60);
  }, [initialEta]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return seconds > 60
    ? `${mins} min`
    : seconds > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : 'Arriving…';
}

// ─── Banner inner ──────────────────────────────────────────────────────────────

function BannerContent({
  trip,
  onNavigate,
  onDismiss,
}: {
  trip: ActiveTrip;
  onNavigate: () => void;
  onDismiss: () => void;
}) {
  const eta = useEtaCountdown(trip.eta);
  const status = STATUS_LABEL[trip.status] ?? STATUS_LABEL.en_route_to_pickup;

  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      onClick={onNavigate}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A1A] via-[#0B1F2A] to-[#0B1120]" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />

      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />

      <div className="relative z-10 px-4 py-3 flex items-center gap-3">
        {/* Live pulse */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Live</span>
        </div>

        {/* Driver avatar */}
        <Avatar className="w-9 h-9 border border-primary/20 flex-shrink-0">
          <AvatarImage src={trip.driver.img} alt={trip.driver.name} />
          <AvatarFallback className="bg-[#1E293B] text-white text-xs font-bold">
            {trip.driver.initials || trip.driver.name[0]}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${status.color}`}>
              {status.en}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
            <span className="text-slate-500 truncate">{trip.from}</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
            <span className="text-slate-300 font-medium truncate">{trip.to}</span>
          </div>
        </div>

        {/* ETA */}
        <div className="flex-shrink-0 text-right mr-1">
          <div className="text-lg font-black text-white tabular-nums leading-none">{eta}</div>
          <div className="text-[9px] text-slate-500 font-medium">ETA · وقت الوصول</div>
        </div>

        {/* Track button */}
        <Button
          size="sm"
          className="flex-shrink-0 h-8 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold rounded-lg shadow-none"
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
        >
          <Radio className="w-3 h-3 mr-1 animate-pulse" />
          Track
        </Button>

        {/* Dismiss */}
        <button
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          aria-label="Dismiss active trip banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

interface ActiveTripBannerProps {
  /** Poll interval in ms (default 10 000) */
  pollInterval?: number;
}

export function ActiveTripBanner({ pollInterval = 10_000 }: ActiveTripBannerProps) {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<ActiveTrip | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastTripId = useRef<string | null>(null);
  const dismissedTripId = useRef<string | null>(null);

  const fetchTrip = useCallback(async () => {
    const active = await activeTripAPI.getActiveTrip();

    // If a new trip appeared after dismiss, show it again.
    // This must be resilient to in-flight fetches completing after a user dismisses.
    if (active) {
      // If the user dismissed before the first fetch completed, bind the dismissal to this trip id.
      if (dismissedTripId.current === '__pending__') {
        dismissedTripId.current = active.id;
      }
      if (dismissedTripId.current && active.id !== dismissedTripId.current) {
        dismissedTripId.current = null;
        setDismissed(false);
      }
      lastTripId.current = active.id;
    }

    setTrip(active);
    setLoading(false);
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchTrip();
    const id = setInterval(fetchTrip, pollInterval);
    return () => clearInterval(id);
  }, [fetchTrip, pollInterval]);

  const handleNavigate = () => navigate('/app/live-trip');
  const handleDismiss = () => {
    // If we don't know the trip id yet (e.g. user dismissed quickly),
    // mark as pending and bind on the next successful fetch.
    dismissedTripId.current = trip?.id ?? lastTripId.current ?? dismissedTripId.current ?? '__pending__';

    // Ensure the DOM updates synchronously for deterministic tests and snappy UX.
    flushSync(() => {
      setDismissed(true);
      // Hide immediately; background polling can keep `trip` updated without re-showing until a new id arrives.
      setTrip(null);
    });
  };

  const visible = !loading && !!trip && !dismissed && trip.status !== 'completed';

  return (
    <div data-testid="active-trip-banner">
      {visible ? (
        <div
          key={trip!.id}
          className="overflow-hidden"
        >
          <BannerContent
            trip={trip!}
            onNavigate={handleNavigate}
            onDismiss={handleDismiss}
          />
        </div>
      ) : null}
    </div>
  );
}
