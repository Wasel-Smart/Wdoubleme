/**
 * Enhanced Trip Card with WhatsApp Integration
 * 
 * Features:
 * - WhatsApp direct contact button
 * - In-app messaging option
 * - Share trip via WhatsApp
 * - Engagement tracking
 * - SEO-optimized data attributes
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin, Calendar, Users, Star, Shield, Clock,
  Phone, MessageCircle, Share2, Heart, CheckCircle2,
  Car, Navigation, DollarSign, Award, Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { 
  sendWhatsAppMessage, 
  shareRideViaWhatsApp 
} from '../utils/whatsappIntegration';

// WhatsApp icon SVG
const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export interface TripData {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  driver: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    trips: number;
    verified: boolean;
    responseTime?: number; // in minutes
  };
  features?: {
    womenOnly?: boolean;
    prayerStops?: boolean;
    instantBooking?: boolean;
    ac?: boolean;
    wifi?: boolean;
    music?: boolean;
  };
  vehicleType?: 'sedan' | 'suv' | 'van';
  distance?: number; // in km
  duration?: number; // in hours
}

interface TripCardProps {
  trip: TripData;
  onBook?: (tripId: string) => void;
  onMessage?: (tripId: string, driverId: string) => void;
  compact?: boolean;
}

export function TripCardWithWhatsApp({ trip, onBook, onMessage, compact = false }: TripCardProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isRTL = language === 'ar';

  const content = {
    ar: {
      from: 'من',
      to: 'إلى',
      seats: 'مقاعد',
      available: 'متاح',
      verified: 'موثّق',
      rating: 'التقييم',
      trips: 'رحلات',
      contactWhatsApp: 'تواصل واتساب',
      sendMessage: 'أرسل رسالة',
      share: 'شارك',
      bookNow: 'احجز الآن',
      perSeat: 'للمقعد',
      womenOnly: 'نسائية فقط',
      prayerStops: 'وقفات صلاة',
      instantBooking: 'حجز فوري',
      responseTime: 'يرد خلال',
      minutes: 'دقيقة',
      loginRequired: 'يجب تسجيل الدخول أولاً',
      copiedToClipboard: 'تم النسخ!',
      sharedSuccessfully: 'تم المشاركة!',
    },
    en: {
      from: 'From',
      to: 'To',
      seats: 'seats',
      available: 'available',
      verified: 'Verified',
      rating: 'Rating',
      trips: 'trips',
      contactWhatsApp: 'Contact WhatsApp',
      sendMessage: 'Send Message',
      share: 'Share',
      bookNow: 'Book Now',
      perSeat: 'per seat',
      womenOnly: 'Women Only',
      prayerStops: 'Prayer Stops',
      instantBooking: 'Instant Booking',
      responseTime: 'Responds in',
      minutes: 'min',
      loginRequired: 'Please login first',
      copiedToClipboard: 'Copied!',
      sharedSuccessfully: 'Shared!',
    },
  };

  const t = content[language];

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    // Track engagement
    trackEngagement('whatsapp_click', trip.id);

    const message = language === 'ar'
      ? `مرحباً ${trip.driver.name}، أنا مهتم برحلتك من ${trip.from} إلى ${trip.to} بتاريخ ${trip.date}. هل المقاعد متاحة؟`
      : `Hello ${trip.driver.name}, I'm interested in your trip from ${trip.from} to ${trip.to} on ${trip.date}. Are seats still available?`;

    sendWhatsAppMessage(trip.driver.phone, message);
    
    toast.success(
      language === 'ar' 
        ? '🚀 جارٍ فتح واتساب...' 
        : '🚀 Opening WhatsApp...'
    );
  };

  // Handle in-app message
  const handleInAppMessage = () => {
    if (!user) {
      toast.error(t.loginRequired);
      return;
    }

    trackEngagement('message_click', trip.id);
    onMessage?.(trip.id, trip.driver.id);
  };

  // Handle share
  const handleShare = () => {
    trackEngagement('share_click', trip.id);

    shareRideViaWhatsApp({
      from: trip.from,
      to: trip.to,
      date: trip.date,
      time: trip.time,
      price: trip.price,
      availableSeats: trip.availableSeats,
      driverName: trip.driver.name,
      lang: language,
    });

    toast.success(t.sharedSuccessfully);
  };

  // Handle booking
  const handleBook = () => {
    if (!user) {
      toast.error(t.loginRequired);
      return;
    }

    trackEngagement('booking_click', trip.id);
    onBook?.(trip.id);
  };

  // Handle favorite
  const handleFavorite = () => {
    if (!user) {
      toast.error(t.loginRequired);
      return;
    }

    setIsFavorited(!isFavorited);
    trackEngagement('favorite_click', trip.id);
    
    toast.success(
      isFavorited
        ? (language === 'ar' ? 'تم الإزالة من المفضلة' : 'Removed from favorites')
        : (language === 'ar' ? 'تم الإضافة للمفضلة' : 'Added to favorites')
    );
  };

  // Track engagement (send to analytics)
  const trackEngagement = (action: string, tripId: string) => {
    // TODO: Send to analytics backend
    console.log('Engagement tracked:', { action, tripId, userId: user?.id, timestamp: new Date() });
    
    // Example: Track with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        trip_id: tripId,
        user_id: user?.id,
        route: `${trip.from} → ${trip.to}`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // SEO-optimized data attributes
      data-trip-id={trip.id}
      data-route={`${trip.from}-${trip.to}`}
      data-price={trip.price}
      data-date={trip.date}
      itemScope
      itemType="https://schema.org/BusTrip"
    >
      <Card className={`overflow-hidden border-2 transition-all ${
        isHovered ? 'border-blue-400 shadow-xl' : 'border-gray-200 shadow-md'
      } ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="font-bold text-lg" itemProp="departureLocation">{trip.from}</span>
                <Navigation className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span className="font-bold text-lg" itemProp="arrivalLocation">{trip.to}</span>
              </div>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span itemProp="departureTime">{trip.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{trip.time}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleFavorite}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Features badges */}
          {trip.features && (
            <div className="flex flex-wrap gap-2">
              {trip.features.womenOnly && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0">
                  👩 {t.womenOnly}
                </Badge>
              )}
              {trip.features.prayerStops && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
                  🕌 {t.prayerStops}
                </Badge>
              )}
              {trip.features.instantBooking && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                  ⚡ {t.instantBooking}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Driver info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
              {trip.driver.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold" itemProp="provider">{trip.driver.name}</h4>
                {trip.driver.verified && (
                  <Badge variant="default" className="bg-blue-600 gap-1">
                    <Shield className="w-3 h-3" />
                    {t.verified}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                    <span itemProp="ratingValue">{trip.driver.rating}</span>
                  </span>
                </div>
                <span>•</span>
                <span>{trip.driver.trips} {t.trips}</span>
                {trip.driver.responseTime && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">
                      {t.responseTime} {trip.driver.responseTime} {t.minutes}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Seats and Price */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{t.seats}</p>
                <p className="font-bold text-lg">
                  {trip.availableSeats} {t.available}
                  <span className="text-gray-400 text-sm ml-1">/ {trip.totalSeats}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{t.perSeat}</p>
              <p className="font-bold text-2xl text-green-600" itemProp="price">
                JOD {trip.price}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp Contact Button */}
            <Button
              onClick={handleWhatsAppContact}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2"
            >
              <WhatsAppIcon />
              {t.contactWhatsApp}
            </Button>

            {/* In-App Message Button */}
            <Button
              onClick={handleInAppMessage}
              variant="outline"
              className="gap-2 border-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t.sendMessage}
            </Button>

            {/* Share Button */}
            <Button
              onClick={handleShare}
              variant="outline"
              className="gap-2 border-2"
            >
              <Share2 className="w-4 h-4" />
              {t.share}
            </Button>

            {/* Book Now Button */}
            <Button
              onClick={handleBook}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.bookNow}
            </Button>
          </div>

          {/* Additional info */}
          {trip.distance && trip.duration && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
              <span>🛣️ {trip.distance} km</span>
              <span>⏱️ {trip.duration}h</span>
              {trip.vehicleType && (
                <span>
                  <Car className="w-4 h-4 inline mr-1" />
                  {trip.vehicleType}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SEO-hidden structured data */}
        <meta itemProp="offers" itemScope itemType="https://schema.org/Offer" content="" />
        <meta itemProp="priceCurrency" content="JOD" />
        <meta itemProp="availability" content={trip.availableSeats > 0 ? 'InStock' : 'OutOfStock'} />
      </Card>
    </motion.div>
  );
}
