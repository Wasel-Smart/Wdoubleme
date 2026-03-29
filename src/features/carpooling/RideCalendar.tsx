/**
 * RideCalendar — /features/carpooling/RideCalendar.tsx
 * Calendar view of available carpooling rides — plan ahead
 * ✅ Real backend fetch | ✅ Monthly calendar | ✅ Color-coded availability | ✅ Bilingual
 */

import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Users, Clock, Star, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CalendarRide {
  id: string; from: string; to: string;
  time: string; price_per_seat: number;
  seats_available: number;
  prayer_stops: boolean; gender_preference: string;
  date: string;
}

const DAYS_AR = ['أح', 'إث', 'ث', 'أر', 'خ', 'ج', 'س'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function RideCalendar() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [ridesByDay, setRidesByDay] = useState<Record<number, CalendarRide[]>>({});
  const [loading, setLoading] = useState(false);

  // ── Fetch rides for the visible month ──────────────────────────────────────
  const fetchMonthRides = useCallback(async () => {
    setLoading(true);
    try {
      const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips?from=&to=&date=${monthStr}&seats=1`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      // If the /trips endpoint doesn't support month prefix, fall back to all trips
      let trips: CalendarRide[] = [];
      if (res.ok) {
        const data = await res.json();
        trips = Array.isArray(data) ? data : [];
      }

      // Also fetch WITHOUT date filter to get all trips and filter client-side
      if (trips.length === 0) {
        const res2 = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` } }
        );
        if (res2.ok) {
          const all: any[] = await res2.json();
          trips = (Array.isArray(all) ? all : []).filter((t: any) => {
            if (!t?.date) return false;
            const d = new Date(t.date);
            return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
          });
        }
      }

      // Bucket by day-of-month
      const byDay: Record<number, CalendarRide[]> = {};
      for (const trip of trips) {
        if (!trip?.date) continue;
        const d = new Date(trip.date);
        if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) continue;
        const day = d.getDate();
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(trip);
      }
      setRidesByDay(byDay);
    } catch (err) {
      console.error('[RideCalendar] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => { fetchMonthRides(); }, [fetchMonthRides]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const isRamadan = viewMonth === 2 && viewYear === 2026;
  const selectedRides = selectedDay ? (ridesByDay[selectedDay] || []) : [];

  const t = {
    title:   ar ? 'تقويم الرحلات'    : 'Ride Calendar',
    subtitle:ar ? 'خطط رحلتك مسبقاً' : 'Plan your journey ahead',
    noRides: ar ? 'لا توجد رحلات في هذا اليوم' : 'No rides on this day',
    book:    ar ? 'احجز'             : 'Book',
    seats:   ar ? 'مقاعد'            : 'seats',
    prayer:  ar ? '🕌 مواقف صلاة'   : '🕌 Prayer stops',
    ramadan: ar ? '🌙 رمضان 1447'   : '🌙 Ramadan 1447',
    ridesAvail: (n: number) => ar ? `${n} رحلات` : `${n} rides`,
    selectDay: ar ? 'اختر يوماً لرؤية الرحلات' : 'Select a day to see rides',
    loading: ar ? 'جاري تحميل الرحلات...' : 'Loading rides...',
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">📅</div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg leading-tight">{t.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
          </div>
          <button onClick={fetchMonthRides} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {isRamadan && (
          <div className="mt-2 px-3 py-1.5 bg-purple-900/30 border border-purple-500/20 rounded-lg text-xs text-purple-300 flex items-center gap-2">
            <span>🌙</span><span>{t.ramadan}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Month navigator */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400">
              {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <span className="font-bold text-white">
              {ar ? MONTHS_AR[viewMonth] : MONTHS_EN[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400">
              {ar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {(ar ? DAYS_AR : DAYS_EN).map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-600 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />{t.loading}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayRides = ridesByDay[day] || [];
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = day === selectedDay;
                const hasPrayer = dayRides.some(r => r.prayer_stops);
                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative
                      ${isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : isToday ? 'bg-primary/20 text-primary border border-primary/30'
                        : dayRides.length > 0 ? 'bg-[#0B1120] text-white hover:bg-white/10 border border-[#1E293B]'
                        : 'text-slate-600 hover:bg-white/5'}`}
                  >
                    <span>{day}</span>
                    {dayRides.length > 0 && !isSelected && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(3, dayRides.length) }).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                    {hasPrayer && !isSelected && (
                      <div className="absolute top-0.5 right-0.5 text-[8px]">🕌</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Rides for selected day */}
        {selectedDay && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">
                {ar ? `رحلات ${selectedDay} ${MONTHS_AR[viewMonth]}` : `Rides for ${MONTHS_EN[viewMonth]} ${selectedDay}`}
              </p>
              <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">{t.ridesAvail(selectedRides.length)}</Badge>
            </div>

            {selectedRides.length === 0 ? (
              <Card className="bg-card border-border p-6 text-center">
                <p className="text-3xl mb-2">🚗</p>
                <p className="text-slate-400 text-sm">{t.noRides}</p>
                <Button size="sm" onClick={() => navigate('/app/offer-ride')} className="mt-3 bg-primary text-primary-foreground font-bold text-xs">
                  {ar ? 'كن أول من ينشر رحلة 🚀' : 'Be first to post a ride 🚀'}
                </Button>
              </Card>
            ) : (
              selectedRides.map((ride) => (
                <motion.div key={ride.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-card border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-white text-sm">{ride.from} → {ride.to}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ride.time}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ride.seats_available} {t.seats}</span>
                          {ride.prayer_stops && <span>🕌</span>}
                          {ride.gender_preference === 'women_only' && <span>🚺</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-lg">{formatCurrency(ride.price_per_seat)}</p>
                        <p className="text-[10px] text-slate-500">{ar ? 'لكل مقعد' : 'per seat'}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8"
                      onClick={() => navigate(`/app/carpooling/book?rideId=${ride.id}&from=${ride.from}&to=${ride.to}&date=${ride.date}&time=${ride.time}&price=${ride.price_per_seat}&seats=${ride.seats_available}`)}
                    >
                      {t.book} →
                    </Button>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!selectedDay && (
          <div className="text-center py-8 text-slate-500 text-sm">{t.selectDay}</div>
        )}
      </div>
    </div>
  );
}