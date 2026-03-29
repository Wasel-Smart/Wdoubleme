/**
 * BookingModal - Universal booking modal for all services
 * Shows trip details, car info, route map, and driver contact
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, MapPin, Calendar, Clock, DollarSign, User, Car, Phone,
  MessageCircle, Navigation, Star, CheckCircle, AlertCircle,
  Share2, Map, Info, Shield, Users, Package, Send,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors, WaselGradients } from '../../styles/wasel-design-system';
import { formatCurrency } from '../../utils/currency';

const C = WaselColors;

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface Driver {
  id: string;
  name: string;
  nameAr: string;
  photo: string;
  rating: number;
  trips: number;
  verified: boolean;
  phone: string;
  whatsapp: string;
}

interface Vehicle {
  model: string;
  modelAr: string;
  plate: string;
  color: string;
  colorAr: string;
  year: number;
  seats: number;
  features: string[];
}

interface TripDetails {
  id: string;
  type: 'carpooling' | 'on-demand' | 'bus' | 'package';
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  date: string;
  time: string;
  price: number;
  distance: string;
  duration: string;
  driver?: Driver;
  vehicle?: Vehicle;
  availableSeats?: number;
  stops?: Array<{ name: string; nameAr: string; time: string }>;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDetails;
  onConfirm: (bookingData: any) => void;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function BookingModal({ isOpen, onClose, trip, onConfirm }: BookingModalProps) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const mountedRef = useRef(true);

  const [step, setStep] = useState<'details' | 'route' | 'confirm'>('details');
  const [numSeats, setNumSeats] = useState(1);
  const [notes, setNotes] = useState('');
  const [contactMethod, setContactMethod] = useState<'app' | 'whatsapp'>('app');

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!isOpen) return null;

  const handleContactDriver = (method: 'app' | 'whatsapp') => {
    if (method === 'whatsapp' && trip.driver?.whatsapp) {
      const message = isAr
        ? `مرحباً، أنا مهتم بالرحلة من ${trip.fromAr} إلى ${trip.toAr} في ${trip.date}`
        : `Hi, I'm interested in the trip from ${trip.from} to ${trip.to} on ${trip.date}`;
      
      window.open(`https://wa.me/${trip.driver.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      // Open in-app messages
      alert(isAr ? 'فتح الرسائل...' : 'Opening messages...');
    }
  };

  const handleConfirmBooking = () => {
    const bookingData = {
      tripId: trip.id,
      seats: numSeats,
      notes,
      contactMethod,
      totalPrice: trip.price * numSeats,
      timestamp: new Date().toISOString(),
    };
    
    onConfirm(bookingData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: C.bg,
            border: `1px solid ${C.cyan}40`,
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 p-6 border-b backdrop-blur-xl"
            style={{
              background: `${C.bg}f0`,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isAr ? 'تفاصيل الرحلة' : 'Trip Details'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isAr ? `من ${trip.fromAr} إلى ${trip.toAr}` : `From ${trip.from} to ${trip.to}`}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10"
              >
                <X className="w-6 h-6 text-slate-400" />
              </motion.button>
            </div>

            {/* Step Tabs */}
            <div className="flex gap-2 mt-4">
              {[
                { key: 'details', icon: Info, label: 'Details', labelAr: 'التفاصيل' },
                { key: 'route', icon: Map, label: 'Route', labelAr: 'المسار' },
                { key: 'confirm', icon: CheckCircle, label: 'Confirm', labelAr: 'تأكيد' },
              ].map((s) => {
                const Icon = s.icon;
                const isActive = step === s.key;
                return (
                  <motion.button
                    key={s.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(s.key as any)}
                    className="flex-1 px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    style={{
                      background: isActive ? WaselGradients.cyan : 'rgba(255,255,255,0.05)',
                      color: isActive ? 'white' : 'rgb(148, 163, 184)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? s.labelAr : s.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* STEP 1: DETAILS */}
            {step === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Route Info */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5" style={{ color: C.green }} />
                        <div>
                          <div className="text-sm text-slate-400">{isAr ? 'من' : 'From'}</div>
                          <div className="text-lg font-bold text-white">
                            {isAr ? trip.fromAr : trip.from}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: C.red }} />
                        <div>
                          <div className="text-sm text-slate-400">{isAr ? 'إلى' : 'To'}</div>
                          <div className="text-lg font-bold text-white">
                            {isAr ? trip.toAr : trip.to}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-400 mb-1">
                        {isAr ? 'المسافة' : 'Distance'}
                      </div>
                      <div className="text-xl font-bold text-white mb-2">{trip.distance}</div>
                      <div className="text-sm text-slate-400">{trip.duration}</div>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Calendar className="w-5 h-5 mb-2" style={{ color: C.cyan }} />
                    <div className="text-sm text-slate-400 mb-1">{isAr ? 'التاريخ' : 'Date'}</div>
                    <div className="font-bold text-white">{trip.date}</div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Clock className="w-5 h-5 mb-2" style={{ color: C.orange }} />
                    <div className="text-sm text-slate-400 mb-1">{isAr ? 'الوقت' : 'Time'}</div>
                    <div className="font-bold text-white">{trip.time}</div>
                  </div>
                </div>

                {/* Driver Info */}
                {trip.driver && (
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: `${C.cyan}40`,
                    }}
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" style={{ color: C.cyan }} />
                      {isAr ? 'السائق' : 'Driver'}
                    </h3>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{trip.driver.photo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-bold text-white">
                            {isAr ? trip.driver.nameAr : trip.driver.name}
                          </h4>
                          {trip.driver.verified && (
                            <Shield className="w-5 h-5" style={{ color: C.green }} />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" style={{ color: C.gold }} fill={C.gold} />
                            {trip.driver.rating}
                          </div>
                          <span>•</span>
                          <span>{trip.driver.trips} {isAr ? 'رحلة' : 'trips'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactDriver('app')}
                        className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                        style={{ background: WaselGradients.cyan }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        {isAr ? 'رسالة' : 'Message'}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactDriver('whatsapp')}
                        className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                        style={{ background: '#25D366' }}
                      >
                        <Phone className="w-5 h-5" />
                        {isAr ? 'واتساب' : 'WhatsApp'}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Vehicle Info */}
                {trip.vehicle && (
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: `${C.purple}40`,
                    }}
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Car className="w-5 h-5" style={{ color: C.purple }} />
                      {isAr ? 'السيارة' : 'Vehicle'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">{isAr ? 'الموديل' : 'Model'}</div>
                        <div className="font-bold text-white">
                          {isAr ? trip.vehicle.modelAr : trip.vehicle.model}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">{isAr ? 'اللون' : 'Color'}</div>
                        <div className="font-bold text-white">
                          {isAr ? trip.vehicle.colorAr : trip.vehicle.color}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">{isAr ? 'رقم اللوحة' : 'Plate'}</div>
                        <div className="font-bold text-white font-mono">{trip.vehicle.plate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">{isAr ? 'السنة' : 'Year'}</div>
                        <div className="font-bold text-white">{trip.vehicle.year}</div>
                      </div>
                    </div>

                    {trip.vehicle.features.length > 0 && (
                      <div>
                        <div className="text-sm text-slate-400 mb-2">{isAr ? 'الميزات' : 'Features'}</div>
                        <div className="flex flex-wrap gap-2">
                          {trip.vehicle.features.map((feature, i) => (
                            <div
                              key={i}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: `${C.purple}20`,
                                color: C.purple,
                              }}
                            >
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stops */}
                {trip.stops && trip.stops.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Navigation className="w-5 h-5" style={{ color: C.orange }} />
                      {isAr ? 'نقاط التوقف' : 'Stops'}
                    </h3>
                    <div className="space-y-2">
                      {trip.stops.map((stop, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                          <span className="text-white">{isAr ? stop.nameAr : stop.name}</span>
                          <span className="text-slate-400 text-sm">{stop.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: ROUTE MAP */}
            {step === 'route' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Map Placeholder */}
                <div
                  className="w-full h-96 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${C.cyan}40`,
                  }}
                >
                  <div className="text-center">
                    <Map className="w-16 h-16 mx-auto mb-4" style={{ color: C.cyan }} />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {isAr ? 'خريطة المسار' : 'Route Map'}
                    </h3>
                    <p className="text-slate-400 mb-4">
                      {isAr
                        ? `المسار من ${trip.fromAr} إلى ${trip.toAr}`
                        : `Route from ${trip.from} to ${trip.to}`}
                    </p>
                    <div className="text-sm text-slate-500">
                      {isAr
                        ? '(سيتم إضافة خريطة Google Maps هنا)'
                        : '(Google Maps integration will be added here)'}
                    </div>
                  </div>
                </div>

                {/* Route Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Navigation className="w-6 h-6 mx-auto mb-2" style={{ color: C.cyan }} />
                    <div className="text-sm text-slate-400 mb-1">{isAr ? 'المسافة' : 'Distance'}</div>
                    <div className="text-xl font-bold text-white">{trip.distance}</div>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: C.orange }} />
                    <div className="text-sm text-slate-400 mb-1">{isAr ? 'المدة' : 'Duration'}</div>
                    <div className="text-xl font-bold text-white">{trip.duration}</div>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: C.green }} />
                    <div className="text-sm text-slate-400 mb-1">{isAr ? 'التوقفات' : 'Stops'}</div>
                    <div className="text-xl font-bold text-white">{trip.stops?.length || 0}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFIRM */}
            {step === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Seats Selection */}
                {trip.availableSeats && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <label className="block text-sm font-medium text-slate-400 mb-3">
                      {isAr ? 'عدد المقاعد' : 'Number of Seats'}
                    </label>
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                        className="w-10 h-10 rounded-xl font-bold"
                        style={{ background: WaselGradients.cyan }}
                      >
                        -
                      </motion.button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-white">{numSeats}</div>
                        <div className="text-sm text-slate-400">
                          {isAr ? `من ${trip.availableSeats} متاح` : `of ${trip.availableSeats} available`}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNumSeats(Math.min(trip.availableSeats!, numSeats + 1))}
                        className="w-10 h-10 rounded-xl font-bold"
                        style={{ background: WaselGradients.cyan }}
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <label className="block text-sm font-medium text-slate-400 mb-3">
                    {isAr ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isAr ? 'أي ملاحظات للسائق...' : 'Any notes for the driver...'}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-slate-500"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>

                {/* Contact Method */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <label className="block text-sm font-medium text-slate-400 mb-3">
                    {isAr ? 'طريقة التواصل' : 'Contact Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setContactMethod('app')}
                      className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                      style={{
                        background: contactMethod === 'app' ? WaselGradients.cyan : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${contactMethod === 'app' ? C.cyan : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {isAr ? 'رسائل التطبيق' : 'In-App Chat'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setContactMethod('whatsapp')}
                      className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                      style={{
                        background: contactMethod === 'whatsapp' ? '#25D366' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${contactMethod === 'whatsapp' ? '#25D366' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <Phone className="w-5 h-5" />
                      {isAr ? 'واتساب' : 'WhatsApp'}
                    </motion.button>
                  </div>
                </div>

                {/* Price Summary */}
                <div
                  className="p-6 rounded-xl"
                  style={{
                    background: WaselGradients.cyan,
                    boxShadow: `0 8px 24px ${C.cyan}40`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">{isAr ? 'سعر المقعد' : 'Price per seat'}</span>
                    <span className="text-white font-bold">{formatCurrency(trip.price)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">{isAr ? 'عدد المقاعد' : 'Number of seats'}</span>
                    <span className="text-white font-bold">×{numSeats}</span>
                  </div>
                  <div className="border-t border-white/20 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(trip.price * numSeats)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className="sticky bottom-0 p-6 border-t backdrop-blur-xl"
            style={{
              background: `${C.bg}f0`,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex gap-3">
              {step !== 'details' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (step === 'route') setStep('details');
                    if (step === 'confirm') setStep('route');
                  }}
                  className="px-6 py-3 rounded-xl font-bold border"
                  style={{
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                >
                  {isAr ? 'السابق' : 'Back'}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step === 'details') setStep('route');
                  else if (step === 'route') setStep('confirm');
                  else handleConfirmBooking();
                }}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: WaselGradients.cyan,
                  boxShadow: `0 8px 24px ${C.cyan}40`,
                }}
              >
                {step === 'confirm' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {isAr ? 'تأكيد الحجز' : 'Confirm Booking'}
                  </>
                ) : (
                  <>
                    {isAr ? 'التالي' : 'Next'}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
