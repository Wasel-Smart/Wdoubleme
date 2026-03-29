/**
 * BookingRequests — /features/carpooling/BookingRequests.tsx
 * Driver panel: view pending passenger booking requests and Accept / Reject.
 * Phase 1 Critical Fix — wires to PUT /trips/:tripId/bookings/:bookingId
 */

import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle, XCircle, Loader2, RefreshCw,
  ChevronLeft, Package, Calendar, Clock,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

type FilterTab = 'pending' | 'accepted' | 'rejected' | 'all';

interface PendingBooking {
  id: string;
  trip_id: string;
  user_id: string;
  passenger_name: string;
  passenger_phone: string;
  seats_requested: number;
  total_price: number;
  payment_method: string;
  status: string;
  notes: string;
  qr_code: string;
  created_at: string;
  trip?: {
    id: string;
    from: string;
    to: string;
    date?: string;
    departure_date?: string;
    time?: string;
    departure_time?: string;
    price_per_seat: number;
  };
}

export function BookingRequests() {
  const { language } = useLanguage();
  const { session } = useAuth();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterTab>('pending');

  const authHeaders = {
    Authorization: `Bearer ${session?.access_token ?? publicAnonKey}`,
    'Content-Type': 'application/json',
  };

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      // Fetch driver's own trips
      const tripsRes = await fetch(`${API}/trips/my`, { headers: authHeaders });
      const trips: any[] = tripsRes.ok ? await tripsRes.json() : [];
      setMyTrips(trips);

      // Fetch bookings for each trip and flatten
      const bookingsNested = await Promise.all(
        trips.map(async (trip: any) => {
          const bRes = await fetch(`${API}/trips/${trip.id}/bookings`, {
            headers: authHeaders,
          });
          if (!bRes.ok) return [];
          const bData: any[] = await bRes.json();
          return bData.map((b: any) => ({
            ...b,
            trip: {
              id: trip.id,
              from: trip.from || '',
              to: trip.to || '',
              date: trip.date || trip.departure_date || '',
              time: trip.time || trip.departure_time || '',
              price_per_seat: trip.price_per_seat || 0,
            },
          }));
        }),
      );
      setAllBookings(bookingsNested.flat());
    } catch (err) {
      console.error('[BookingRequests] load failed:', err);
      toast.error(ar ? 'فشل تحميل الطلبات' : 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (
    tripId: string,
    bookingId: string,
    newStatus: 'accepted' | 'rejected',
  ) => {
    setActionBusy((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`${API}/trips/${tripId}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === 'accepted'
            ? ar ? '✅ تم قبول الحجز' : '✅ Booking accepted'
            : ar ? '❌ تم رفض الحجز' : '❌ Booking rejected',
        );
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as any)?.error || 'Action failed');
      }
    } catch {
      toast.error(ar ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setActionBusy((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const pendingCount = allBookings.filter((b) => b.status === 'pending').length;

  const filtered = allBookings.filter(
    (b) => filter === 'all' || b.status === filter,
  );

  const FILTERS: { key: FilterTab; en: string; ar: string }[] = [
    { key: 'pending',  en: 'Pending',  ar: 'قيد الانتظار' },
    { key: 'accepted', en: 'Accepted', ar: 'مقبولة' },
    { key: 'rejected', en: 'Rejected', ar: 'مرفوضة' },
    { key: 'all',      en: 'All',      ar: 'الكل' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-foreground leading-tight">
                {ar ? 'طلبات الحجز' : 'Booking Requests'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0
                  ? ar
                    ? `${pendingCount} طلب في انتظار ردّك`
                    : `${pendingCount} request${pendingCount > 1 ? 's' : ''} awaiting your response`
                  : ar
                  ? 'قبول أو رفض طلبات المسافرين'
                  : 'Accept or reject passenger booking requests'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={load}
              disabled={loading}
              className="rounded-full"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(({ key, en, ar: arLabel }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {ar ? arLabel : en}
              {key === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 text-[9px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* No trips posted yet */}
        {!loading && myTrips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-bold text-base mb-1">
              {ar ? 'ما عندك رحلات منشورة' : 'No rides posted yet'}
            </h3>
            <p className="text-muted-foreground text-xs max-w-[220px] mb-4">
              {ar
                ? 'انشر رحلة أولاً لتبدأ باستقبال الحجوزات'
                : 'Post a ride first to start receiving bookings'}
            </p>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => navigate('/app/offer-ride')}
            >
              {ar ? '+ نشر رحلة' : '+ Post a Ride'}
            </Button>
          </div>
        )}

        {/* No bookings matching filter */}
        {!loading && myTrips.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold text-sm">
              {filter === 'pending'
                ? ar ? 'لا توجد طلبات في الانتظار' : 'No pending requests'
                : ar ? 'لا توجد نتائج' : 'No results for this filter'}
            </p>
          </div>
        )}

        {/* Booking cards */}
        <AnimatePresence>
          {!loading &&
            filtered.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
              >
                <Card className="bg-card border border-border overflow-hidden">
                  <div className="p-4 space-y-3">
                    {/* Route */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-0.5 h-4 bg-border" />
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">
                          {booking.trip?.from || '—'} → {booking.trip?.to || '—'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {booking.trip?.date || booking.trip?.departure_date || '—'}
                            {booking.trip?.time ? ` · ${booking.trip.time}` : ''}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} language={language} />
                    </div>

                    <div className="h-px bg-border" />

                    {/* Passenger info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {(booking.passenger_name || 'P').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {booking.passenger_name || (ar ? 'مسافر' : 'Passenger')}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {booking.passenger_phone || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-foreground font-medium">
                            {booking.seats_requested} {ar ? 'مقعد' : 'seat(s)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground capitalize">
                            {(booking.payment_method || 'cash').replace(/_/g, ' ')}
                          </span>
                        </div>
                        {booking.created_at && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(booking.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total price */}
                    <div className="flex items-center justify-between bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
                      <span className="text-xs text-muted-foreground">
                        {ar ? 'إجمالي السعر' : 'Total Price'}
                      </span>
                      <span className="text-sm font-black text-primary">
                        {formatCurrency(booking.total_price || 0)}
                      </span>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <p className="text-xs text-muted-foreground italic px-1">
                        "{booking.notes}"
                      </p>
                    )}

                    {/* Accept / Reject — only for pending */}
                    {booking.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          className="flex-1 h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl text-xs disabled:opacity-60"
                          onClick={() =>
                            handleAction(booking.trip_id, booking.id, 'rejected')
                          }
                          disabled={!!actionBusy[booking.id]}
                        >
                          {actionBusy[booking.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />
                              {ar ? 'رفض' : 'Reject'}
                            </>
                          )}
                        </Button>
                        <Button
                          className="flex-1 h-10 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs disabled:opacity-60"
                          onClick={() =>
                            handleAction(booking.trip_id, booking.id, 'accepted')
                          }
                          disabled={!!actionBusy[booking.id]}
                        >
                          {actionBusy[booking.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                              {ar ? 'قبول' : 'Accept'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
