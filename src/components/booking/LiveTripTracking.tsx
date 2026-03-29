/**
 * LiveTripTracking - Real-time trip tracking with driver location
 * Shows live map, driver location, ETA, and direct messaging
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Navigation, Clock, Phone, MessageCircle, User,
  Car, Star, AlertCircle, CheckCircle, Share2, MoreVertical,
  ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors, WaselGradients } from '../../styles/wasel-design-system';
import { formatCurrency } from '../../utils/currency';

const C = WaselColors;

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface TripStatus {
  current: 'requested' | 'accepted' | 'arriving' | 'pickup' | 'in_progress' | 'completed';
  eta: number; // minutes
  distance: number; // km
  driverLocation: { lat: number; lng: number };
  passengerLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
}

interface ActiveTrip {
  id: string;
  type: 'carpooling' | 'on-demand' | 'bus';
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  driver: {
    id: string;
    name: string;
    nameAr: string;
    photo: string;
    rating: number;
    phone: string;
    whatsapp: string;
  };
  vehicle: {
    model: string;
    modelAr: string;
    plate: string;
    color: string;
    colorAr: string;
  };
  price: number;
  status: TripStatus;
}

interface LiveTripTrackingProps {
  trip: ActiveTrip;
  onClose: () => void;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function LiveTripTracking({ trip, onClose }: LiveTripTrackingProps) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const mountedRef = useRef(true);

  const [expanded, setExpanded] = useState(true);
  const [status, setStatus] = useState(trip.status);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!mountedRef.current) return;

      setStatus((prev) => ({
        ...prev,
        eta: Math.max(0, prev.eta - 1),
        distance: Math.max(0, prev.distance - 0.1),
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status.current) {
      case 'requested':
        return {
          label: isAr ? 'تم الطلب' : 'Requested',
          labelAr: 'تم الطلب',
          color: C.orange,
          icon: Clock,
        };
      case 'accepted':
        return {
          label: isAr ? 'تم القبول' : 'Accepted',
          labelAr: 'تم القبول',
          color: C.cyan,
          icon: CheckCircle,
        };
      case 'arriving':
        return {
          label: isAr ? 'في الطريق إليك' : 'Driver Arriving',
          labelAr: 'في الطريق إليك',
          color: C.purple,
          icon: Navigation,
        };
      case 'pickup':
        return {
          label: isAr ? 'جاهز للانطلاق' : 'Ready for Pickup',
          labelAr: 'جاهز للانطلاق',
          color: C.green,
          icon: MapPin,
        };
      case 'in_progress':
        return {
          label: isAr ? 'الرحلة قيد التنفيذ' : 'Trip in Progress',
          labelAr: 'الرحلة قيد التنفيذ',
          color: C.green,
          icon: Car,
        };
      case 'completed':
        return {
          label: isAr ? 'اكتملت' : 'Completed',
          labelAr: 'اكتملت',
          color: C.green,
          icon: CheckCircle,
        };
      default:
        return {
          label: isAr ? 'قيد المعالجة' : 'Processing',
          labelAr: 'قيد المعالجة',
          color: C.cyan,
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleContactDriver = (method: 'call' | 'message' | 'whatsapp') => {
    switch (method) {
      case 'call':
        window.location.href = `tel:${trip.driver.phone}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${trip.driver.whatsapp}`, '_blank');
        break;
      case 'message':
        // Open in-app messages
        alert(isAr ? 'فتح الرسائل...' : 'Opening messages...');
        break;
    }
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: isAr ? 'موقع الرحلة' : 'Trip Location',
        text: isAr
          ? `أنا في رحلة من ${trip.fromAr} إلى ${trip.toAr}`
          : `I'm on a trip from ${trip.from} to ${trip.to}`,
      });
    } else {
      alert(isAr ? 'تم نسخ الرابط' : 'Link copied');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" dir={dir}>
      {/* Map Background */}
      <div className="flex-1 relative" style={{ background: C.bg }}>
        {/* Map Placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 mx-auto mb-4" style={{ color: C.cyan }} />
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? 'خريطة حية' : 'Live Map'}
            </h3>
            <p className="text-slate-400">
              {isAr
                ? 'تتبع موقع السائق في الوقت الفعلي'
                : 'Track driver location in real-time'}
            </p>
            <div className="mt-4 text-sm text-slate-500">
              {isAr
                ? '(سيتم إضافة خريطة Google Maps هنا)'
                : '(Google Maps integration will be added here)'}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 rounded-xl backdrop-blur-xl flex items-center gap-2"
            style={{
              background: `${statusInfo.color}40`,
              border: `1px solid ${statusInfo.color}`,
            }}
          >
            <StatusIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
            <span className="font-bold text-white">{statusInfo.label}</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl backdrop-blur-xl"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* ETA Badge */}
        {status.eta > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 left-4 px-4 py-3 rounded-xl backdrop-blur-xl"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${C.cyan}40`,
            }}
          >
            <div className="text-sm text-slate-400 mb-1">{isAr ? 'وقت الوصول المتوقع' : 'ETA'}</div>
            <div className="text-2xl font-bold text-white">{status.eta} {isAr ? 'دقيقة' : 'min'}</div>
          </motion.div>
        )}
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative"
        style={{
          background: C.bg,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(!expanded)}
            className="w-12 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.3)' }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Driver Info */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{trip.driver.photo}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  {isAr ? trip.driver.nameAr : trip.driver.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" style={{ color: C.gold }} fill={C.gold} />
                    {trip.driver.rating}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    {isAr ? trip.vehicle.modelAr : trip.vehicle.model}
                  </div>
                  <span>•</span>
                  <span className="font-mono">{trip.vehicle.plate}</span>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContactDriver('call')}
                className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ background: WaselGradients.green }}
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">{isAr ? 'اتصال' : 'Call'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContactDriver('message')}
                className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ background: WaselGradients.cyan }}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{isAr ? 'رسالة' : 'Chat'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContactDriver('whatsapp')}
                className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ background: '#25D366' }}
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </motion.button>
            </div>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {/* Trip Details */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5" style={{ color: C.green }} />
                      <div>
                        <div className="text-xs text-slate-400">{isAr ? 'من' : 'From'}</div>
                        <div className="font-bold text-white">
                          {isAr ? trip.fromAr : trip.from}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5" style={{ color: C.red }} />
                      <div>
                        <div className="text-xs text-slate-400">{isAr ? 'إلى' : 'To'}</div>
                        <div className="font-bold text-white">
                          {isAr ? trip.toAr : trip.to}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">{isAr ? 'السعر' : 'Price'}</div>
                      <div className="font-bold text-white">{formatCurrency(trip.price)}</div>
                    </div>
                  </div>
                </div>

                {/* Share Location */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareLocation}
                  className="w-full px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Share2 className="w-5 h-5" />
                  {isAr ? 'مشاركة الموقع' : 'Share Location'}
                </motion.button>

                {/* Safety Info */}
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: `${C.orange}15`,
                    border: `1px solid ${C.orange}40`,
                  }}
                >
                  <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: C.orange }} />
                  <div className="flex-1 text-sm">
                    <div className="font-bold text-white mb-1">
                      {isAr ? 'نصيحة أمان' : 'Safety Tip'}
                    </div>
                    <div className="text-slate-400">
                      {isAr
                        ? 'شارك رحلتك مع صديق. نحن نتتبع رحلتك للسلامة.'
                        : 'Share your trip with a friend. We track your trip for safety.'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
