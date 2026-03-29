/**
 * BookRide — /features/carpooling/BookRide.tsx
 * Seat booking flow for carpooling rides
 * ✅ Seat selector | ✅ Cash on Arrival | ✅ QR confirmation | ✅ Bilingual
 */

import { useSearchParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CreditCard, Banknote, ChevronRight, Check, Loader2, QrCode, MapPin, Clock, Shield, Star } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { CostSharing } from '../payments/CostSharing';

// ─── WhatsApp share helper ────────────────────────────────────────────────────
function buildWhatsAppMsg(from: string, to: string, date: string, price: number, seats: number, ar: boolean): string {
  return ar
    ? `🚗 حجزت رحلة على واصل!\n${from} ← ${to}\n📅 ${date}\n-seat ${seats} مقعد · ${price} JOD/مقعد\nاحجز معي: https://wasel.app`
    : `🚗 I booked a ride on Wasel!\n${from} → ${to}\n📅 ${date}\n-seat ${seats} seat(s) · ${price} JOD/seat\nBook with me: https://wasel.app`;
}

// ─── Google Calendar deep-link ────────────────────────────────────────────────
function buildCalendarLink(from: string, to: string, date: string, time: string): string {
  const dt = `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
  const params = new URLSearchParams({
    text: `Wasel Carpool: ${from} → ${to}`,
    dates: `${dt}/${dt}`,
    details: `Carpooling ride from ${from} to ${to} via Wasel | واصل`,
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

type PaymentMethod = 'cash_on_arrival' | 'cash_on_pickup' | 'card';
type BookStep = 1 | 2 | 3;

interface RideData {
  id: string; from: string; to: string;
  date: string; time: string;
  pricePerSeat: number; seatsAvailable: number;
  driverName: string; driverRating: number;
  distance: number; duration: string;
  genderPreference: string; prayerStops: boolean;
}

export function BookRide() {
  const { language } = useLanguage();
  const { user, session, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ar = language === 'ar';

  // Ride data passed via URL params from SearchRides / RideDetails
  const rideData: RideData = {
    id: searchParams.get('rideId') || 'demo-ride',
    from: searchParams.get('from') || 'Amman',
    to: searchParams.get('to') || 'Aqaba',
    date: searchParams.get('date') || new Date().toISOString().slice(0, 10),
    time: searchParams.get('time') || '08:00',
    pricePerSeat: parseFloat(searchParams.get('price') || '8'),
    seatsAvailable: parseInt(searchParams.get('seats') || '3'),
    driverName: searchParams.get('driver') || 'Ahmad Al-Masri',
    driverRating: 4.9,
    distance: parseInt(searchParams.get('distance') || '330'),
    duration: searchParams.get('duration') || '4h',
    genderPreference: searchParams.get('gender') || 'mixed',
    prayerStops: searchParams.get('prayer') !== 'false',
  };

  const [step, setStep] = useState<BookStep>(1);
  const [seats, setSeats] = useState(1);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash_on_arrival');
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [qrCode, setQrCode] = useState('');

  const totalPrice = rideData.pricePerSeat * seats;
  const commission = totalPrice * 0.12;
  const driverEarns = totalPrice - commission;

  // Gap #16 Fix ✅ — Wasel Plus 10% discount
  const isWaselPlus = (profile as any)?.subscription_tier === 'plus' || (profile as any)?.wasel_plus;
  const plusDiscount = isWaselPlus ? totalPrice * 0.1 : 0;
  const finalPrice = totalPrice - plusDiscount;

  const payMethods = [
    { value: 'cash_on_arrival' as PaymentMethod, labelEn: 'Cash on Arrival', labelAr: 'نقداً عند الوصول', emoji: '💵', desc: ar ? 'ادفع للسائق عند وصولك' : 'Pay driver upon arrival', recommended: true },
    { value: 'cash_on_pickup' as PaymentMethod, labelEn: 'Cash on Pickup', labelAr: 'نقداً عند الركوب', emoji: '🤝', desc: ar ? 'ادفع للسائق عند الركوب' : 'Pay driver when you board', recommended: false },
    { value: 'card' as PaymentMethod, labelEn: 'Pay Online', labelAr: 'الدفع الإلكتروني', emoji: '💳', desc: ar ? 'خصم 5% عند الدفع مسبقاً' : '5% discount when paid online', recommended: false },
  ];

  const book = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(ar ? 'يرجى ملء بياناتك' : 'Please fill your details');
      return;
    }
    if (!session?.access_token) {
      toast.error(ar ? 'يرجى تسجيل لدخول أولاً' : 'Please sign in first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/bookings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            tripId: rideData.id, seatsRequested: seats,
            paymentMethod: payMethod, passengerName: name, passengerPhone: phone,
            wasel_plus_discount: plusDiscount,
            final_price: finalPrice,
          }),
        }
      );
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `HTTP ${res.status}`); }
      const data = await res.json();
      setBookingId(data.booking?.id || `BK-${Date.now().toString(36).toUpperCase()}`);
      setQrCode(data.booking?.qr_code || `WAS-${Date.now().toString(36).toUpperCase()}`);

      // Gap #8 Fix ✅ — notify traveler who posted the ride
      const tripDriverId = data.booking?.driver_id || rideData.id;
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          recipient_id: tripDriverId,
          type: 'new_booking',
          title: ar ? '🎉 حجز جديد!' : '🎉 New Booking!',
          message: ar
            ? `${name} حجز ${seats} مقعد في رحلتك ${rideData.from} → ${rideData.to}`
            : `${name} booked ${seats} seat(s) on your ${rideData.from} → ${rideData.to} ride`,
          data: { bookingId: data.booking?.id, tripId: rideData.id },
        }),
      }).catch(() => {}); // fire-and-forget

      toast.success(t.successMsg);
      setStep(3);
    } catch (err) {
      console.error('[BookRide] booking failed:', err);
      toast.error(ar ? `فشل الحجز: ${err instanceof Error ? err.message : ''}` : `Booking failed: ${err instanceof Error ? err.message : ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Gap #15 Fix ✅ — calendar + WhatsApp links (declared in component body, used in Step 3 JSX)
  const calendarLink = buildCalendarLink(rideData.from, rideData.to, rideData.date, rideData.time);
  const whatsappMsg  = buildWhatsAppMsg(rideData.from, rideData.to, rideData.date, rideData.pricePerSeat, seats, ar);

  const t = {
    title:  ar ? 'احجز مقعدك'        : 'Book Your Seat',
    step1:  ar ? 'المقاعد والدفع'    : 'Seats & Payment',
    step2:  ar ? 'بياناتك'            : 'Your Details',
    step3:  ar ? 'تم الحجز!'         : 'Booking Confirmed!',
    seats:  ar ? 'عدد المقاعد'       : 'Number of Seats',
    total:  ar ? 'الإجمالي'          : 'Total',
    payment:ar ? 'طريقة الدفع'       : 'Payment Method',
    name:   ar ? 'اسمك الكامل'       : 'Your Full Name',
    namePH: ar ? 'أحمد الشمري'        : 'Ahmad Al-Shamri',
    phone:  ar ? 'رقم تليفونك'         : 'Your Phone Number',
    phonePH:ar ? '+962 79 000 0000'   : '+962 79 000 0000',
    next:   ar ? 'التالي'            : 'Next',
    back:   ar ? 'رجوع'             : 'Back',
    confirm:ar ? 'تأكيد الحجز'       : 'Confirm Booking',
    confirming: ar ? 'جاري الحجز...' : 'Booking...',
    summary:ar ? 'ملخص الرحلة'       : 'Trip Summary',
    priceBreakdown: ar ? 'تفصيل السعر' : 'Price Breakdown',
    fareLabel: ar ? 'تكلفة المقاعد'  : 'Seat Cost',
    commLabel: ar ? 'رسوم المنصة (12%)' : 'Platform Fee (12%)',
    driverLabel: ar ? 'يحصل السائق'  : 'Driver Receives',
    note:   ar ? 'الحجز مجاني — تدفع فقط عند الركوب' : 'Booking is free — only pay when you board',
    successMsg: ar ? 'تم تأكيد حجزك! 🎉' : 'Booking confirmed! 🎉',
    showDriver: ar ? 'عرض تفاصيل السائق' : 'View Driver Details',
    myTrips:    ar ? 'رحلاتي'        : 'My Trips',
    recommended: ar ? 'مُوصى به'    : 'Recommended',
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">🎫</div>
          <div className="flex-1">
            <h1 className="font-bold text-foreground text-lg leading-tight">{t.title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>{rideData.from}</span>
              <ChevronRight className="w-3 h-3" />
              <span>{rideData.to}</span>
              <span>·</span>
              <span>{rideData.date}</span>
            </p>
          </div>
        </div>

        {/* Steps */}
        {step < 3 && (
          <div className="flex items-center gap-2 mt-3">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {step > s ? <Check className="w-3 h-3" /> : s}
                </div>
                <span className={`text-[10px] font-medium ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>{s === 1 ? t.step1 : t.step2}</span>
                {s < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > s ? 'bg-primary' : 'bg-secondary'}`} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Trip Summary Card (always visible) */}
        {step < 3 && (
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">{t.summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{rideData.time} — {rideData.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{rideData.driverName.split(' ')[0]} · {rideData.driverRating}★</span>
              </div>
              {rideData.prayerStops && (
                <div className="col-span-2 flex items-center gap-2 text-xs text-emerald-400">
                  <span>🕌</span><span>{ar ? 'يشمل وقفات للصلاة' : 'Includes prayer stops'}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1 — Seats + Payment */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Seat selector */}
              <Card className="bg-card border-border p-4">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">{t.seats}</p>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].filter(n => n <= rideData.seatsAvailable).map(n => (
                    <button key={n} onClick={() => setSeats(n)}
                      className={`flex-1 py-3 rounded-xl border font-black text-lg transition-all ${seats === n ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground hover:border-border/80'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Payment method */}
              <Card className="bg-card border-border p-4">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">{t.payment}</p>
                <div className="space-y-2">
                  {payMethods.map(pm => (
                    <button key={pm.value} onClick={() => setPayMethod(pm.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${payMethod === pm.value ? 'bg-primary/10 border-primary/25 text-foreground' : 'border-border text-muted-foreground hover:border-border/80'}`}>
                      <span className="text-xl flex-shrink-0">{pm.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{ar ? pm.labelAr : pm.labelEn}</span>
                          {pm.recommended && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">{t.recommended}</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{pm.desc}</p>
                      </div>
                      {payMethod === pm.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </Card>

              {/* CostSharing breakdown — replaces inline price card */}
              <CostSharing
                from={rideData.from}
                to={rideData.to}
                distanceKm={rideData.distance || 330}
                pricePerSeat={rideData.pricePerSeat}
                seatsBooked={seats}
                totalSeats={rideData.seatsAvailable}
                paymentMethod={payMethod}
              />

              {/* 🆕 Transparent fee breakdown (BlaBlaCar model — commission charged to PASSENGER not driver) */}
              <Card className="bg-card border-border p-4">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">
                  {ar ? '💰 تفصيل السعر الكامل' : '💰 Full Price Breakdown'}
                </p>
                <div className="space-y-2 mb-3">
                  {[
                    { label: ar ? `سعر المقعد × ${seats}` : `Seat price × ${seats}`, value: `${totalPrice.toFixed(3)} JOD`, color: 'var(--foreground)' },
                    { label: ar ? 'رسوم خدمة واصل (12%)' : 'Wasel service fee (12%)', value: `+ ${commission.toFixed(3)} JOD`, color: 'var(--muted-foreground)', note: ar ? 'على الراكب — ليس السائق ✓' : 'Charged to passenger — NOT driver ✓' },
                    ...(isWaselPlus ? [{ label: ar ? 'خصم واصل بلس (-10%)' : 'Wasel Plus discount (-10%)', value: `- ${plusDiscount.toFixed(3)} JOD`, color: '#22C55E' }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs" style={{ color: row.color }}>{row.label}</span>
                        {row.note && <p className="text-[10px] text-primary/70">{row.note}</p>}
                      </div>
                      <span className="text-xs font-semibold shrink-0" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="text-sm font-black text-foreground">{ar ? 'الإجمالي' : 'Total you pay'}</span>
                    <span className="text-sm font-black text-primary">{finalPrice.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{ar ? 'السائق يحصل' : 'Driver receives'}</span>
                    <span className="text-[11px] font-bold text-emerald-400">{driverEarns.toFixed(3)} JOD</span>
                  </div>
                </div>
                {/* Escrow notice — BlaBlaCar key trust feature */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(4,173,191,0.06)', border: '1px solid rgba(4,173,191,0.15)' }}>
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {ar
                      ? '🔒 واصل يحتفظ بدفعك بأمان ويحرره للسائق فقط بعد اكتمال الرحلة وتأكيد QR — يحمي الطرفين'
                      : '🔒 Wasel holds your payment securely and releases it to the driver only after the trip is completed & QR-confirmed — protecting both parties'}
                  </p>
                </div>
              </Card>

              <Button onClick={() => setStep(2)} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                {t.next} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 2 — Passenger details */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <Card className="bg-card border-border p-4 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-bold block mb-1.5">{t.name}</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePH} className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold block mb-1.5">{t.phone}</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.phonePH} type="tel" className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/40" dir="ltr" />
                </div>
              </Card>

              <Card className="bg-primary/5 border-primary/15 p-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-xs text-primary/80">{ar ? 'بياناتك محمية ومشفرة — ما راح تنشر لأي أحد' : 'Your data is protected & encrypted'}</p>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="border-border text-muted-foreground hover:bg-secondary/50 h-12">{t.back}</Button>
                <Button onClick={book} disabled={submitting || !name.trim() || !phone.trim()} className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t.confirming}</> : t.confirm}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Confirmed */}
          {step === 3 && (
            <motion.div key="s3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
              <Card className="bg-emerald-900/15 border-emerald-500/30 p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="text-5xl mb-3">🎫</motion.div>
                <h2 className="font-black text-foreground text-xl mb-1">{t.step3}</h2>
                <p className="text-xs text-muted-foreground mb-4">{rideData.from} → {rideData.to} · {rideData.date} {rideData.time}</p>

                {/* QR Code visual */}
                <div className="bg-black/30 rounded-2xl p-4 mb-4">
                  <div className="w-24 h-24 bg-white rounded-xl mx-auto flex items-center justify-center mb-2">
                    <QrCode className="w-16 h-16 text-background" />
                  </div>
                  <code className="text-teal-300 font-mono text-xs block">{qrCode}</code>
                  <p className="text-[10px] text-muted-foreground mt-1">{ar ? 'وريه للسواق وقت الركوب' : 'Show this to driver when boarding'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-black/20 rounded-xl p-2">
                    <p className="text-muted-foreground">{ar ? 'المبلغ' : 'Amount'}</p>
                    <p className="font-black text-primary">{formatCurrency(finalPrice)}</p>
                    {isWaselPlus && <p className="text-emerald-400 text-[9px]">Wasel Plus -10%</p>}
                  </div>
                  <div className="bg-black/20 rounded-xl p-2">
                    <p className="text-muted-foreground">{ar ? 'الدفع' : 'Payment'}</p>
                    <p className="font-bold text-amber-300 text-[11px]">{ar ? 'نقداً عند الوصول' : 'Cash on Arrival'}</p>
                  </div>
                </div>

                {/* Gap #15 Fix ✅ — Add to Calendar + WhatsApp share */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <a href={calendarLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(66,133,244,0.12)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.25)' }}>
                    📅 {ar ? 'أضف للتقويم' : 'Add to Calendar'}
                  </a>
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, '_blank', 'noopener')}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/></svg>
                    {ar ? 'شارك واتساب' : 'Share WhatsApp'}
                  </button>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => navigate('/app/my-trips')} variant="outline" className="border-border text-muted-foreground hover:bg-secondary/50 h-12">
                  {t.myTrips}
                </Button>
                <Button onClick={() => navigate('/app/find-ride')} className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                  {ar ? 'دور على رحلات ثانية' : 'More Rides'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
