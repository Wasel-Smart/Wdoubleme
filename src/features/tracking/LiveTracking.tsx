/**
 * Live Tracking - Real-time trip tracking with Google Maps + WhatsApp
 * Enhanced engagement and communication
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone, MessageCircle, Navigation, Clock, User, Package as PackageIcon } from 'lucide-react';
import { initializeMap, addMarker, drawRoute, trackLiveLocation, stopTrackingLocation, type Location } from '@/utils/googleMapsIntegration';
import { sendWhatsAppMessage, requestDriverCall } from '@/utils/whatsappIntegration';
import { WaselColors as C } from '@/styles/wasel-design-system';

interface LiveTrackingProps {
  tripId: string;
  driverName: string;
  driverPhone: string;
  driverPhoto?: string;
  passengerName: string;
  origin: Location;
  destination: Location;
  hasPackage?: boolean;
  packageDetails?: string;
}

export function LiveTracking({
  tripId,
  driverName,
  driverPhone,
  driverPhoto,
  passengerName,
  origin,
  destination,
  hasPackage = false,
  packageDetails,
}: LiveTrackingProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location>(origin);
  const [eta, setEta] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const watchIdRef = useRef<number>();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    initializeMap(mapRef.current, origin, 12).then((mapInstance) => {
      setMap(mapInstance);

      // Add origin marker
      addMarker(mapInstance, origin, {
        title: isAr ? 'نقطة الانطلاق' : 'Origin',
        color: C.green,
        label: 'A',
      });

      // Add destination marker
      addMarker(mapInstance, destination, {
        title: isAr ? 'الوجهة' : 'Destination',
        color: C.cyan,
        label: 'B',
      });

      // Draw route
      drawRoute(mapInstance, origin, destination).then(({ routeInfo }) => {
        setDistance(routeInfo.distance);
        setEta(routeInfo.duration);
      });

      // Start tracking driver location (simulated for demo)
      // In production, this would come from real-time database
      watchIdRef.current = trackLiveLocation(
        mapInstance,
        (location) => {
          setDriverLocation(location);
          // Update driver marker
          addMarker(mapInstance, location, {
            title: driverName,
            color: '#FF9900',
            icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          });
        }
      );
    });

    return () => {
      if (watchIdRef.current) {
        stopTrackingLocation(watchIdRef.current);
      }
    };
  }, []);

  const handleCallDriver = () => {
    window.open(`tel:${driverPhone}`, '_self');
  };

  const handleWhatsAppDriver = () => {
    sendWhatsAppMessage(
      driverPhone,
      isAr
        ? `مرحباً ${driverName}، أنا ${passengerName}. أين أنت الآن؟`
        : `Hi ${driverName}, this is ${passengerName}. Where are you now?`
    );
  };

  const handleRequestCall = () => {
    requestDriverCall(driverPhone, passengerName, language);
  };

  return (
    <div className="min-h-screen bg-[#040C18] text-white">
      {/* Map Container */}
      <div className="relative">
        <div ref={mapRef} className="w-full h-[60vh]" />

        {/* Floating Status Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4 right-4 rounded-2xl p-5"
          style={{
            background: 'rgba(10,22,40,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,200,232,0.2)',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Driver Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
              style={{
                background: `linear-gradient(135deg, ${C.cyan}, ${C.green})`,
              }}
            >
              {driverPhoto ? (
                <img src={driverPhoto} alt={driverName} className="w-full h-full rounded-full object-cover" />
              ) : (
                driverName.charAt(0)
              )}
            </div>

            {/* Driver Info */}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{driverName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {isAr ? 'وقت الوصول المتوقع:' : 'ETA:'} {eta.toFixed(0)} {isAr ? 'دقيقة' : 'min'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>
                  {distance.toFixed(1)} {isAr ? 'كم' : 'km'} {isAr ? 'متبقية' : 'away'}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(0,200,117,0.2)',
                color: C.green,
                border: '1px solid rgba(0,200,117,0.3)',
              }}
            >
              {isAr ? '🚗 في الطريق' : '🚗 On the way'}
            </div>
          </div>

          {/* Package Info */}
          {hasPackage && (
            <div
              className="mb-4 p-3 rounded-lg flex items-center gap-3"
              style={{
                background: 'rgba(217,149,91,0.1)',
                border: '1px solid rgba(217,149,91,0.2)',
              }}
            >
              <PackageIcon className="w-5 h-5" style={{ color: '#D9965B' }} />
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: '#D9965B' }}>
                  {isAr ? '📦 طرد مع هذه الرحلة' : '📦 Package with this trip'}
                </div>
                {packageDetails && (
                  <div className="text-xs text-gray-400 mt-1">{packageDetails}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCallDriver}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${C.green}, #00A060)`,
                boxShadow: `0 4px 16px ${C.green}40`,
              }}
            >
              <Phone className="w-5 h-5" />
              <span>{isAr ? 'اتصل' : 'Call'}</span>
            </button>

            <button
              onClick={handleWhatsAppDriver}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
              }}
            >
              <MessageCircle className="w-5 h-5" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Trip Details Section */}
      <div className="p-4 space-y-4">
        {/* Route Info */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(10,22,40,0.5)',
            border: '1px solid rgba(0,200,232,0.1)',
          }}
        >
          <h3 className="font-bold text-lg mb-4" style={{ color: C.cyan }}>
            {isAr ? 'تفاصيل الرحلة' : 'Trip Details'}
          </h3>

          <div className="space-y-3">
            {/* Origin */}
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,200,117,0.2)', color: C.green }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400">{isAr ? 'من' : 'From'}</div>
                <div className="font-medium">{origin.address || 'Origin Location'}</div>
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,200,232,0.2)', color: C.cyan }}
              >
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400">{isAr ? 'إلى' : 'To'}</div>
                <div className="font-medium">{destination.address || 'Destination Location'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: 'rgba(10,22,40,0.5)',
            border: '1px solid rgba(0,200,232,0.1)',
          }}
        >
          <p className="text-sm text-gray-400 mb-3">
            {isAr
              ? 'هل تحتاج مساعدة؟ تواصل مع الدعم'
              : 'Need help? Contact support'}
          </p>
          <button
            onClick={() => sendWhatsAppMessage('+962790000000', isAr ? 'أحتاج مساعدة في رحلتي' : 'I need help with my trip')}
            className="px-6 py-2.5 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'rgba(0,200,232,0.2)',
              color: C.cyan,
              border: `1px solid ${C.cyan}40`,
            }}
          >
            {isAr ? '💬 واتساب الدعم' : '💬 WhatsApp Support'}
          </button>
        </div>
      </div>
    </div>
  );
}
