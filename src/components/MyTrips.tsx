/**
 * MyTrips — Wasel trip history & management
 *
 * ✅ Fully connected to real backend via useMyTrips()
 * ✅ Tabs: Upcoming | Active | Completed | As Driver
 * ✅ Cancel booking (passenger) with confirmation
 * ✅ Cancel trip (driver) with confirmation
 * ✅ Skeleton loaders during fetch
 * ✅ Graceful empty states per tab with CTA
 * ✅ JOD currency | Jordanian cities | Bilingual labels
 * ✅ Dark Wasel design system
 */

import { useState, useCallback, forwardRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Calendar, Users, Star, Clock, Car, ChevronRight,
  Radio, Phone, MessageSquare, X, ArrowRight, Shield,
  CheckCircle, TrendingUp, Wallet, Leaf, Navigation,
  Package, Award, Zap, AlertTriangle, ReceiptText, Filter,
  Loader2, RefreshCw, XCircle, PlusCircle, Search,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useNavigate } from 'react-router';
import { WaselBadge } from './wasel-ui/WaselBadge';
import { WaselSectionHeader } from './wasel-ui/WaselSectionHeader';
import { useMyTrips } from '../hooks/useMyTrips';
import type { MyTripRecord, DriverTripRecord } from '../hooks/useMyTrips';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { API_BASE_URL } from '../utils/api';
import { supabase } from '../utils/supabase/client';
import { AutoHideTabBar } from './ui/auto-hide-tab-bar';
import { StatusBadge } from './StatusBadge';

const MY_TRIPS_TAB_KEY = 'wasel-my-trips-tab';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtFrom(record: MyTripRecord) {
  return record.trip?.from || record.trip?.from_location || record.pickup_stop || '—';
}

function fmtTo(record: MyTripRecord) {
  return record.trip?.to || record.trip?.to_location || record.dropoff_stop || '—';
}

function fmtDate(record: MyTripRecord) {
  const raw = record.trip?.departure_date;
  if (!raw) return 'Date TBA';
  try {
    return new Date(raw).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return raw; }
}

function fmtDriverFrom(t: DriverTripRecord) {
  return t.from || t.from_location || '—';
}

function fmtDriverTo(t: DriverTripRecord) {
  return t.to || t.to_location || '—';
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function TripSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full bg-secondary/50" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3 bg-secondary/50" />
          <Skeleton className="h-2 w-1/2 bg-secondary/50" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full bg-secondary/50" />
      </div>
      <Skeleton className="h-2 w-full bg-secondary/50" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-xl bg-secondary/50" />
        <Skeleton className="h-8 flex-1 rounded-xl bg-secondary/50" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = forwardRef<HTMLDivElement, {
  icon: React.ElementType;
  title: string;
  titleAr: string;
  subtitle: string;
  action?: React.ReactNode;
}>(({ icon: Icon, title, titleAr, subtitle, action }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-foreground font-bold text-base mb-0.5">{title}</h3>
      <p className="text-muted-foreground text-sm mb-0.5" dir="rtl">{titleAr}</p>
      <p className="text-muted-foreground text-xs max-w-56 mb-4">{subtitle}</p>
      {action}
    </motion.div>
  );
});
EmptyState.displayName = 'EmptyState';

// ─── Rating modal ────────────────────────────────────────────────────────────

function RatingModal({
  record,
  value,
  comment,
  busy,
  onChangeValue,
  onChangeComment,
  onSubmit,
  onClose,
  language,
}: {
  record: MyTripRecord | null;
  value: number;
  comment: string;
  busy: boolean;
  onChangeValue: (v: number) => void;
  onChangeComment: (c: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  language: string;
}) {
  const ar = language === 'ar';
  const from = record?.trip?.from || record?.trip?.from_location || '—';
  const to = record?.trip?.to || record?.trip?.to_location || '—';
  const driver = record?.trip?.driver;

  const labels = ['', ar ? 'سيء' : 'Poor', ar ? 'مقبول' : 'Fair', ar ? 'جيد' : 'Good', ar ? 'ممتاز' : 'Great', ar ? 'رائع!' : 'Excellent!'];

  return (
    <AnimatePresence>
      {record && (
        <motion.div
          key="rating-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl"
            dir={ar ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-4xl mb-3"
              >⭐</motion.div>
              <h3 className="text-foreground font-black text-lg">
                {ar ? 'قيّم رحلتك' : 'Rate Your Trip'}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                {from} → {to}
                {driver?.name && driver.name !== 'Driver' ? ` · ${driver.name}` : ''}
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-3 mb-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => onChangeValue(n)}
                  className="transition-transform hover:scale-125 active:scale-95"
                  aria-label={`${n} star`}
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-700 hover:text-slate-500'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Label */}
            <p className="text-center text-sm font-semibold text-amber-300 mb-4 h-5">
              {value > 0 ? labels[value] : ''}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={e => onChangeComment(e.target.value)}
              placeholder={ar ? 'أضف تعليقاً (اختياري)...' : 'Add a comment (optional)...'}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none resize-none mb-4 transition-colors"
              dir={ar ? 'rtl' : 'ltr'}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 h-11 border border-border text-muted-foreground hover:text-foreground rounded-xl"
                onClick={onClose}
                disabled={busy}
              >
                {ar ? 'تخطّ' : 'Skip'}
              </Button>
              <Button
                className="flex-1 h-11 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 font-bold rounded-xl disabled:opacity-50"
                onClick={onSubmit}
                disabled={busy || value === 0}
              >
                {busy
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : (ar ? 'إرسال التقييم' : 'Submit Rating')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Cancel confirm dialog ────────────────────────────────────────────────────

function CancelDialog({
  open,
  label,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.88, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 text-center shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{label}</h3>
            <p className="text-muted-foreground text-xs mb-6">
              This action cannot be undone. A cancellation fee may apply if the trip starts soon.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 h-11 border border-border text-muted-foreground hover:text-foreground rounded-xl"
                onClick={onClose}
                disabled={busy}
              >
                Keep It
              </Button>
              <Button
                className="flex-1 h-11 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl disabled:opacity-60"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Upcoming trip card ──────────────────────────────────────────────────────

function UpcomingCard({ record, onTrack, onCancel }: {
  record: MyTripRecord;
  onTrack: () => void;
  onCancel: (id: string) => void;
}) {
  const from = fmtFrom(record);
  const to = fmtTo(record);
  const driver = record.trip?.driver;
  const { language } = useLanguage();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl bg-card border border-border p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-11 h-11 border border-primary/20 flex-shrink-0">
          <AvatarImage src={driver?.img} alt={driver?.name} />
          <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
            {driver?.initials || 'WD'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-foreground font-bold text-sm truncate">{driver?.name || 'Driver TBA'}</span>
            {driver?.rating ? (
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="text-xs text-amber-400">{driver.rating.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">{record.trip?.vehicle_model || 'Vehicle TBA'}</p>
        </div>
        <StatusBadge status={record.status} language={language} />
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground truncate">{from}</span>
        <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
        <span className="text-white font-medium truncate">{to}</span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(record)}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{record.seats_requested} seat{record.seats_requested > 1 ? 's' : ''}</span>
        <span className="text-emerald-400 font-bold">{record.total_price.toFixed(3)} JOD</span>
      </div>

      {/* Booking code */}
      <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5">
        <Shield className="w-3 h-3 text-primary flex-shrink-0" />
        <span className="text-[10px] text-slate-500 font-mono">
          Booking: <strong className="text-slate-300">{record.id.substring(0, 16).toUpperCase()}</strong>
        </span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          size="sm"
          className="h-9 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-xs font-bold"
          onClick={onTrack}
        >
          <Radio className="w-3 h-3 mr-1 animate-pulse" /> Track Live
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 border border-orange-500/20 text-orange-400 hover:bg-orange-500/5 rounded-xl text-xs font-bold"
          onClick={() => onCancel(record.id)}
        >
          <X className="w-3 h-3 mr-1" /> Cancel
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Active trip card ─────────────────────────────────────────────────────────

function ActiveTripCard({ trip, onTrack }: { trip: ActiveTrip; onTrack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-[#0B2A1A] to-[#0B1F2A] border border-emerald-500/20 p-4 space-y-3 relative overflow-hidden"
    >
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live Trip</span>
          <WaselBadge variant="live" label="NOW" />
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 truncate">{trip.from}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <span className="text-white font-bold truncate">{trip.to}</span>
        </div>

        {/* Driver */}
        <div className="flex items-center gap-2">
          <Avatar className="w-9 h-9 border border-primary/20">
            <AvatarImage src={trip.driver.img} />
            <AvatarFallback className="bg-secondary text-foreground text-xs">
              {trip.driver.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{trip.driver.name}</p>
            <p className="text-slate-500 text-xs">{trip.vehicle.model} · {trip.vehicle.plate}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white font-black text-lg">{trip.eta}</p>
            <p className="text-slate-500 text-[10px]">ETA</p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onTrack}
          className="w-full h-10 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-sm"
        >
          <Navigation className="w-3.5 h-3.5 mr-2" />
          Open Live Tracking
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Completed trip card ──────────────────────────────────────────────────────

function CompletedCard({ record, onRate }: { record: MyTripRecord; onRate: (record: MyTripRecord) => void }) {
  const from = fmtFrom(record);
  const to = fmtTo(record);
  const savedEst = ((record.total_price || 0) * 0.42).toFixed(3);
  const canRate = !record.rated && (record.status === 'completed' || record.status === 'accepted');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground truncate">{from}</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
            <span className="text-white font-medium truncate">{to}</span>
          </div>
          <p className="text-muted-foreground text-[10px] mt-0.5">{fmtDate(record)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-foreground font-bold text-sm">{(record.total_price || 0).toFixed(3)} JOD</p>
          <p className="text-emerald-400 text-[10px] font-medium">-{savedEst} saved</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Leaf className="w-3 h-3 text-emerald-500" />
        <span className="text-emerald-500">–42% CO₂</span>
        <span>·</span>
        <span>{record.seats_requested} seat{record.seats_requested > 1 ? 's' : ''}</span>
        {record.trip?.driver?.name && (
          <>
            <span>·</span>
            <span>with {record.trip.driver.name}</span>
          </>
        )}
      </div>

      {/* Rate Trip Button */}
      {canRate && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRate(record)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition-colors"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          Rate this trip
        </motion.button>
      )}
      {record.rated && (
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-600">
          <Star className="w-3 h-3 fill-slate-600 text-slate-600" />
          Already rated
        </div>
      )}
    </motion.div>
  );
}

// ─── Driver trip card ────────────────────────────────────────────────────────

function DriverTripCard({ trip, onCancel }: {
  trip: DriverTripRecord;
  onCancel: (id: string) => void;
}) {
  const from = fmtDriverFrom(trip);
  const to = fmtDriverTo(trip);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const booked = (trip.total_seats || 0) - (trip.available_seats || 0);
  const earnings = booked * (trip.price_per_seat || 0);
  const isCancelled = trip.status === 'cancelled';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground truncate">{from}</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
            <span className="text-white font-semibold truncate">{to}</span>
          </div>
          <p className="text-muted-foreground text-[10px]">
            {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBA'}
            {trip.departure_time ? ` · ${trip.departure_time}` : ''}
          </p>
        </div>
        <StatusBadge status={trip.status || 'active'} language={language} />
      </div>

      {/* Seats + earnings */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5">
          <Users className="w-3 h-3 text-primary" />
          <span className="text-foreground">{booked}/{trip.total_seats || 4} seats</span>
        </div>
        <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5">
          <Wallet className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-bold">{earnings.toFixed(3)} JOD earned</span>
        </div>
      </div>

      {/* Passengers */}
      {trip.passengers && trip.passengers.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[10px]">Passengers:</span>
          <div className="flex -space-x-1.5">
            {trip.passengers.slice(0, 5).map((p, i) => (
              <Avatar key={i} className="w-6 h-6 border border-card">
                <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
                  {p.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {trip.passengers.length > 5 && (
            <span className="text-slate-500 text-[10px]">+{trip.passengers.length - 5} more</span>
          )}
        </div>
      )}

      {/* Actions — only for non-cancelled trips */}
      {!isCancelled && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-9 border border-violet-500/20 text-violet-400 hover:bg-violet-500/5 rounded-xl text-xs font-bold"
            onClick={() => navigate('/app/booking-requests')}
          >
            <Users className="w-3 h-3 mr-1" /> {booked > 0 ? `${booked} Booked` : 'Bookings'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 border border-orange-500/20 text-orange-400 hover:bg-orange-500/5 rounded-xl text-xs font-bold"
            onClick={() => onCancel(trip.id)}
          >
            <XCircle className="w-3 h-3 mr-1" /> Cancel
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'upcoming',    label: 'Upcoming',   labelAr: 'جاي'   },
  { id: 'active',      label: 'Active',     labelAr: 'شغّال'      },
  { id: 'completed',   label: 'Completed',  labelAr: 'خلص'    },
  { id: 'as-driver',   label: 'As Driver',  labelAr: 'كسواق'     },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Main component ───────────────────────────────────────────────────────────

export function MyTrips() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Allow ?tab=as-driver (or any valid tab) from OfferRide redirect
  const initialTab = (): TabId => {
    const param = searchParams.get('tab') as TabId | null;
    if (param && TABS.some(t => t.id === param)) return param;
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(MY_TRIPS_TAB_KEY) as TabId | null;
      if (saved && TABS.some(t => t.id === saved)) return saved;
    }
    return 'upcoming';
  };

  const { session } = useAuth();
  const { language } = useLanguage();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; type: 'booking' | 'trip' } | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<MyTripRecord | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingBusy, setRatingBusy] = useState(false);
  const [autoPrompted, setAutoPrompted] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => new Date());

  const {
    upcoming, active, completed, driver_trips,
    loading, refreshing, error, refetch,
    cancelBooking, cancelDriverTrip,
  } = useMyTrips();

  // Auto-pop rating dialog for the most recent unrated completed trip
  useEffect(() => {
    if (autoPrompted || loading || completed.length === 0) return;
    const unrated = completed.find(
      (t) => !t.rated && (t.status === 'completed' || t.status === 'accepted'),
    );
    if (unrated) {
      // Small delay so the page renders first
      const timer = setTimeout(() => {
        setRatingTarget(unrated);
        setRatingValue(5);
        setRatingComment('');
        setAutoPrompted(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [completed, loading, autoPrompted]);

  // Tab counts
  const counts: Record<TabId, number> = {
    upcoming:  upcoming.length,
    active:    active ? 1 : 0,
    completed: completed.length,
    'as-driver': driver_trips.length,
  };
  const totalTripsManaged = upcoming.length + completed.length + driver_trips.length + (active ? 1 : 0);
  const nextUpcoming = upcoming[0] ?? null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MY_TRIPS_TAB_KEY, tab);
    }
  }, [tab]);

  useEffect(() => {
    if (!loading) {
      setLastRefreshAt(new Date());
    }
  }, [loading, refreshing, totalTripsManaged]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    const ok = cancelTarget.type === 'booking'
      ? await cancelBooking(cancelTarget.id)
      : await cancelDriverTrip(cancelTarget.id);
    setCancelBusy(false);
    setCancelTarget(null);
    if (ok) {
      toast.success('Cancelled successfully · تم الإلغاء بنجاح');
    } else {
      toast.error('Failed to cancel — please try again.');
    }
  }, [cancelTarget, cancelBooking, cancelDriverTrip]);

  // ── Rating submission ───────────────────────────────────────────────────────
  const submitRating = useCallback(async () => {
    if (!ratingTarget || !session?.access_token) return;
    setRatingBusy(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/rides/rate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            tripId: ratingTarget.trip_id,
            bookingId: ratingTarget.id,
            rateeId: ratingTarget.trip?.driver?.id || ratingTarget.trip_id,
            rating: ratingValue,
            comment: ratingComment,
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(language === 'ar' ? '⭐ شكراً على تقييمك!' : '⭐ Thanks for rating!');
      setRatingTarget(null);
      setRatingComment('');
      setRatingValue(5);
      refetch();
    } catch (err) {
      console.error('[MyTrips] rating failed:', err);
      toast.error(language === 'ar' ? 'فشل التقييم' : 'Rating failed');
    } finally {
      setRatingBusy(false);
    }
  }, [ratingTarget, session, ratingValue, ratingComment, refetch, language]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground text-xs" dir="rtl">رحلاتي</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {refreshing ? 'Syncing latest trip activity...' : `Last synced ${lastRefreshAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => refetch()}
          >
            <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tab bar with Auto-Hide */}
        <AutoHideTabBar 
          triggerZoneHeight={120}
          alwaysShowOnMobile={false}
        >
          <div className="flex gap-1 -mx-1 overflow-x-auto scrollbar-hide pb-px max-w-5xl mx-auto">
            {TABS.map(({ id, label, labelAr }) => {
              const isActive = tab === id;
              const count = counts[id];
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                  <span className="text-[10px]" dir="rtl">{labelAr}</span>
                  {count > 0 && (
                    <span className={`h-4 min-w-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </AutoHideTabBar>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Upcoming', value: upcoming.length, tone: 'text-sky-300' },
            { label: 'Active', value: active ? 1 : 0, tone: 'text-emerald-300' },
            { label: 'Completed', value: completed.length, tone: 'text-amber-300' },
            { label: 'Driving', value: driver_trips.length, tone: 'text-cyan-300' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-3">
              <div className={`text-lg font-black ${item.tone}`}>{item.value}</div>
              <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-foreground font-bold">Trip command center</div>
              <div className="text-muted-foreground text-xs mt-1">
                {nextUpcoming
                  ? `Next trip: ${fmtFrom(nextUpcoming)} to ${fmtTo(nextUpcoming)} on ${fmtDate(nextUpcoming)}`
                  : 'Your next booking, active trip, and driver activity all stay synced here.'}
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px]">
              {totalTripsManaged} managed
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" className="rounded-xl font-bold" onClick={() => navigate('/app/find-ride')}>
              <Search className="w-3.5 h-3.5 mr-2" /> Find a Ride
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl font-bold" onClick={() => navigate('/app/offer-ride')}>
              <PlusCircle className="w-3.5 h-3.5 mr-2" /> Offer a Ride
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl font-bold" onClick={() => setTab(active ? 'active' : 'upcoming')}>
              <Navigation className="w-3.5 h-3.5 mr-2" /> Focus current trip
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-semibold">Failed to load trips</p>
            <Button size="sm" variant="ghost" className="text-red-400 mt-2" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </div>
        )}

        {/* SKELETONS */}
        {loading && (
          <AnimatePresence>
            {[1, 2, 3].map((i) => <TripSkeleton key={i} />)}
          </AnimatePresence>
        )}

        {/* UPCOMING */}
        {!loading && tab === 'upcoming' && (
          <AnimatePresence>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming trips"
                titleAr="ما في رحلات جاية"
                subtitle="Book your next Wasel trip and it will appear here."
                action={
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                    onClick={() => navigate('/app/find-ride')}
                  >
                    <Search className="w-3.5 h-3.5 mr-2" /> Find a Ride
                  </Button>
                }
              />
            ) : (
              upcoming.map((r) => (
                <UpcomingCard
                  key={r.id}
                  record={r}
                  onTrack={() => navigate('/app/live-trip')}
                  onCancel={(id) => setCancelTarget({ id, type: 'booking' })}
                />
              ))
            )}
          </AnimatePresence>
        )}

        {/* ACTIVE */}
        {!loading && tab === 'active' && (
          <AnimatePresence>
            {!active ? (
              <EmptyState
                icon={Radio}
                title="No active trip"
                titleAr="ما في رحلة شغّالة"
                subtitle="Your active ride will appear here once confirmed."
                action={
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                    onClick={() => navigate('/app/find-ride')}
                  >
                    <Zap className="w-3.5 h-3.5 mr-2" /> Book Now
                  </Button>
                }
              />
            ) : (
              <ActiveTripCard
                key={active.id}
                trip={active}
                onTrack={() => navigate('/app/live-trip')}
              />
            )}
          </AnimatePresence>
        )}

        {/* COMPLETED */}
        {!loading && tab === 'completed' && (
          <AnimatePresence>
            {completed.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No completed trips yet"
                titleAr="ما في رحلات خلصت لسّه"
                subtitle="Your trip history will build up here after each ride."
              />
            ) : (
              completed.map((r) => <CompletedCard key={r.id} record={r} onRate={setRatingTarget} />)
            )}
          </AnimatePresence>
        )}

        {/* AS DRIVER */}
        {!loading && tab === 'as-driver' && (
          <AnimatePresence>
            {driver_trips.length === 0 ? (
              <EmptyState
                icon={Car}
                title="You haven't offered any trips"
                titleAr="لم تقدم أي رحلة بعد"
                subtitle="Offer a ride to earn money and share costs."
                action={
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                    onClick={() => navigate('/app/offer-ride')}
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-2" /> Offer a Ride
                  </Button>
                }
              />
            ) : (
              driver_trips.map((t) => (
                <DriverTripCard
                  key={t.id}
                  trip={t}
                  onCancel={(id) => setCancelTarget({ id, type: 'trip' })}
                />
              ))
            )}
          </AnimatePresence>
        )}

      </div>

      {/* Cancel confirmation dialog */}
      <CancelDialog
        open={!!cancelTarget}
        label={cancelTarget?.type === 'booking' ? 'Cancel this booking?' : 'Cancel this trip?'}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        busy={cancelBusy}
      />

      {/* ── Rating dialog ── */}
      <RatingModal
        record={ratingTarget}
        value={ratingValue}
        comment={ratingComment}
        busy={ratingBusy}
        onChangeValue={setRatingValue}
        onChangeComment={setRatingComment}
        onSubmit={submitRating}
        onClose={() => { setRatingTarget(null); setRatingValue(5); setRatingComment(''); }}
        language={language}
      />
    </div>
  );
}
