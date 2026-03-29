/**
 * WaselBus - Scheduled shuttle bus service
 * Book seats on fixed-schedule buses on popular routes
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import {
  Bus, Clock, MapPin, Users, Star, Wifi, Snowflake,
  Calendar, ArrowRight, CheckCircle, Zap, Shield, Coffee,
  Navigation, TrendingUp, DollarSign, Search, Filter,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors, WaselGradients } from '../../styles/wasel-design-system';
import { formatCurrency } from '../../utils/currency';
import { BookingModal } from '../../components/booking/BookingModal';
import { LiveTripTracking } from '../../components/booking/LiveTripTracking';

const C = WaselColors;

// ══════════════════════════════════════════════════════════════════════════════
// BUS ROUTES DATA
// ══════════════════════════════════════════════════════════════════════════════

interface BusRoute {
  id: string;
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  duration: string;
  distance: string;
  price: number;
  departures: string[];
  amenities: string[];
  seatsAvailable: number;
  totalSeats: number;
  rating: number;
  trips: number;
}

const BUS_ROUTES: BusRoute[] = [
  {
    id: 'amman-aqaba',
    from: 'Amman',
    fromAr: 'عمّان',
    to: 'Aqaba',
    toAr: 'العقبة',
    duration: '4h 30min',
    distance: '330 km',
    price: 12,
    departures: ['06:00', '09:00', '12:00', '15:00', '18:00'],
    amenities: ['AC', 'WiFi', 'Restroom', 'Reclining Seats'],
    seatsAvailable: 23,
    totalSeats: 50,
    rating: 4.8,
    trips: 1240,
  },
  {
    id: 'amman-irbid',
    from: 'Amman',
    fromAr: 'عمّان',
    to: 'Irbid',
    toAr: 'إربد',
    duration: '1h 15min',
    distance: '85 km',
    price: 4,
    departures: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    amenities: ['AC', 'WiFi', 'USB Charging'],
    seatsAvailable: 18,
    totalSeats: 40,
    rating: 4.7,
    trips: 3200,
  },
  {
    id: 'amman-zarqa',
    from: 'Amman',
    fromAr: 'عمّان',
    to: 'Zarqa',
    toAr: 'الزرقاء',
    duration: '40min',
    distance: '30 km',
    price: 2,
    departures: ['Every 30min'],
    amenities: ['AC', 'WiFi'],
    seatsAvailable: 32,
    totalSeats: 40,
    rating: 4.5,
    trips: 8500,
  },
  {
    id: 'amman-deadsea',
    from: 'Amman',
    fromAr: 'عمّان',
    to: 'Dead Sea',
    toAr: 'البحر الميت',
    duration: '1h',
    distance: '60 km',
    price: 5,
    departures: ['07:00', '10:00', '13:00', '16:00'],
    amenities: ['AC', 'WiFi', 'Refreshments'],
    seatsAvailable: 15,
    totalSeats: 30,
    rating: 4.9,
    trips: 890,
  },
  {
    id: 'amman-jerash',
    from: 'Amman',
    fromAr: 'عمّان',
    to: 'Jerash',
    toAr: 'جرش',
    duration: '1h 10min',
    distance: '50 km',
    price: 3.5,
    departures: ['08:00', '11:00', '14:00', '17:00'],
    amenities: ['AC', 'WiFi', 'Tour Guide'],
    seatsAvailable: 12,
    totalSeats: 35,
    rating: 4.6,
    trips: 1100,
  },
  {
    id: 'amman-petra',
    from: 'Amman',
    fromAr: 'عمّان',
    to: 'Petra',
    toAr: 'البتراء',
    duration: '3h 30min',
    distance: '250 km',
    price: 10,
    departures: ['06:00', '09:00', '12:00'],
    amenities: ['AC', 'WiFi', 'Restroom', 'Refreshments', 'Tour Guide'],
    seatsAvailable: 8,
    totalSeats: 45,
    rating: 4.9,
    trips: 650,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function WaselBus() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const filteredRoutes = BUS_ROUTES.filter(route => {
    const fromMatch = !searchFrom || route.from.toLowerCase().includes(searchFrom.toLowerCase()) || route.fromAr.includes(searchFrom);
    const toMatch = !searchTo || route.to.toLowerCase().includes(searchTo.toLowerCase()) || route.toAr.includes(searchTo);
    return fromMatch && toMatch;
  });

  const handleBookRoute = (route: BusRoute) => {
    setSelectedRoute(route);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (bookingData: any) => {
    console.log('Booking confirmed:', bookingData);
    alert(isAr
      ? `✅ تم تأكيد الحجز!\n\nالرحلة: ${selectedRoute?.fromAr} → ${selectedRoute?.toAr}\nالمقاعد: ${bookingData.seats}\nالإجمالي: ${formatCurrency(bookingData.totalPrice)}\n\nسيتم التواصل معك قريباً.`
      : `✅ Booking Confirmed!\n\nTrip: ${selectedRoute?.from} → ${selectedRoute?.to}\nSeats: ${bookingData.seats}\nTotal: ${formatCurrency(bookingData.totalPrice)}\n\nYou'll be contacted soon.`
    );
    setShowBookingModal(false);
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: C.bg }}
      dir={dir}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `${C.purple}20`,
                border: `2px solid ${C.purple}40`,
              }}
            >
              <Bus className="w-8 h-8" style={{ color: C.purple }} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {isAr ? 'حافلات واصل' : 'Wasel Bus'}
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {isAr
              ? 'حافلات مجدولة على المسارات الشائعة. مقاعد مضمونة، تكييف، واي فاي'
              : 'Scheduled buses on popular routes. Guaranteed seats, AC, WiFi'}
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Navigation, label: 'Routes', labelAr: 'مسارات', value: '6' },
              { icon: Bus, label: 'Buses', labelAr: 'حافلات', value: '25' },
              { icon: Users, label: 'Seats', labelAr: 'مقاعد', value: '1,000+' },
              { icon: Star, label: 'Rating', labelAr: 'التقييم', value: '4.8' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: C.purple }} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{isAr ? stat.labelAr : stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-2xl"
          style={{
            background: 'rgba(9,21,37,0.8)',
            border: `1px solid ${C.purple}20`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {isAr ? 'من' : 'From'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  placeholder={isAr ? 'عمّان' : 'Amman'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-slate-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {isAr ? 'إلى' : 'To'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  placeholder={isAr ? 'العقبة' : 'Aqaba'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-slate-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Routes */}
        <div className="space-y-4">
          {filteredRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-6 rounded-2xl border"
              style={{
                background: 'rgba(9,21,37,0.8)',
                borderColor: `${C.purple}20`,
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Route Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${C.purple}20`,
                        border: `1px solid ${C.purple}40`,
                      }}
                    >
                      <Bus className="w-6 h-6" style={{ color: C.purple }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {isAr ? route.fromAr : route.from}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-slate-500" />
                        <h3 className="text-xl font-bold text-white">
                          {isAr ? route.toAr : route.to}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {route.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          {route.distance}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" style={{ color: C.gold }} fill={C.gold} />
                          {route.rating}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {route.amenities.map((amenity, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: `${C.purple}15`,
                          color: C.purple,
                          border: `1px solid ${C.purple}30`,
                        }}
                      >
                        {amenity}
                      </div>
                    ))}
                  </div>

                  {/* Departures */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-slate-400 mb-2">
                      {isAr ? 'أوقات المغادرة' : 'Departure Times'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {route.departures.map((time, i) => (
                        <div
                          key={i}
                          className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seats Available */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" style={{ color: C.green }} />
                    <span className="text-slate-400">
                      {isAr ? 'مقاعد متاحة:' : 'Seats available:'}
                    </span>
                    <span className="font-bold text-white">
                      {route.seatsAvailable}/{route.totalSeats}
                    </span>
                  </div>
                </div>

                {/* Price & Book */}
                <div className="flex flex-col justify-between items-end">
                  <div className="text-right mb-4">
                    <div className="text-sm text-slate-400 mb-1">
                      {isAr ? 'السعر' : 'Price'}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(route.price)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? 'للشخص الواحد' : 'per person'}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBookRoute(route)}
                    className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2"
                    style={{
                      background: WaselGradients.purple,
                      boxShadow: `0 8px 24px ${C.purple}40`,
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isAr ? 'احجز الآن' : 'Book Now'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRoutes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? 'لم يتم العثور على مسارات' : 'No routes found'}
            </h3>
            <p className="text-slate-400">
              {isAr
                ? 'جرب البحث بمدينة أخرى'
                : 'Try searching with a different city'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoute && (
        <BookingModal
          route={selectedRoute}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}