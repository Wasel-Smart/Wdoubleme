/**
 * Wasel Unified Booking Interface
 * Handles both Carpooling and On-Demand booking flows
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Users, DollarSign, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { rtl } from '@/utils/rtl';
import { useIframeSafeNavigate } from '@/utils/iframe-safe-navigation';
import ModeSwitch from '@/features/common/ModeSwitch';
import type { TripMode, Location } from '@/types/mobility-os';

interface UnifiedBookingProps {
  defaultMode?: TripMode;
}

export default function UnifiedBooking({ defaultMode = 'carpooling' }: UnifiedBookingProps) {
  const { t, language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const mountedRef = useRef(true);
  
  const [selectedMode, setSelectedMode] = useState<TripMode>(defaultMode);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Popular routes (for quick selection)
  const popularRoutes = [
    { from: 'Amman', to: 'Aqaba', fromAr: 'عمّان', toAr: 'العقبة', distance: 330 },
    { from: 'Amman', to: 'Irbid', fromAr: 'عمّان', toAr: 'إربد', distance: 85 },
    { from: 'Amman', to: 'Dead Sea', fromAr: 'عمّان', toAr: 'البحر الميت', distance: 60 },
    { from: 'Amman', to: 'Zarqa', fromAr: 'عمّان', toAr: 'الزرقاء', distance: 30 },
  ];
  
  const handleQuickRoute = (route: typeof popularRoutes[0]) => {
    setOrigin(language === 'ar' ? route.fromAr : route.from);
    setDestination(language === 'ar' ? route.toAr : route.to);
    
    // Estimate price based on mode
    if (selectedMode === 'carpooling') {
      const pricePerSeat = Math.ceil(route.distance * 0.025 + 3); // Rough estimate
      setPriceEstimate(pricePerSeat);
    } else if (selectedMode === 'on_demand') {
      const basePrice = route.distance * 0.50 + 2.5;
      setPriceEstimate(parseFloat(basePrice.toFixed(2)));
    }
  };
  
  const handleSearch = async () => {
    if (!origin || !destination) {
      return;
    }
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!mountedRef.current) return;
    
    setIsSearching(false);
    
    // Navigate to results based on mode
    if (selectedMode === 'carpooling') {
      navigate('/carpooling/search-results', {
        state: { origin, destination, passengers, departureDate }
      });
    } else if (selectedMode === 'on_demand') {
      navigate('/on-demand/request-ride', {
        state: { origin, destination, passengers }
      });
    } else if (selectedMode === 'scheduled') {
      navigate('/on-demand/schedule-ride', {
        state: { origin, destination, passengers, departureDate, departureTime }
      });
    }
  };
  
  const handleModeChange = (mode: TripMode) => {
    setSelectedMode(mode);
    setPriceEstimate(null);
  };
  
  // Get minimum date for departure (today for on-demand, tomorrow for carpooling)
  const getMinDate = () => {
    const tomorrow = new Date();
    if (selectedMode === 'carpooling') {
      tomorrow.setDate(tomorrow.getDate() + 1); // Carpooling requires 24h advance
    }
    return tomorrow.toISOString().split('T')[0];
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl font-bold mb-3 ${rtl.textAlign()}`}
          >
            {language === 'ar' ? 'وين رايح؟' : 'Where to?'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-white/80 text-lg ${rtl.textAlign()}`}
          >
            {language === 'ar' 
              ? 'اختار طريقة التنقل اللي تناسبك - سواء توفير أو سرعة'
              : 'Choose your travel mode - save money or get there fast'
            }
          </motion.p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Mode Switcher */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ModeSwitch 
            selectedMode={selectedMode} 
            onModeChange={handleModeChange}
            className="mb-6"
          />
        </motion.div>
        
        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-xl mb-6"
        >
          <h2 className={`text-xl font-bold mb-6 ${rtl.textAlign()}`}>
            {language === 'ar' ? 'تفاصيل الرحلة' : 'Trip Details'}
          </h2>
          
          <div className="space-y-4">
            {/* Origin */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${rtl.textAlign()}`}>
                {language === 'ar' ? 'من وين؟' : 'From'}
              </label>
              <div className="relative">
                <MapPin className={`absolute top-3.5 ${language === 'ar' ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`} />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={language === 'ar' ? 'موقع الانطلاق' : 'Pickup location'}
                  className={`
                    w-full ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-xl
                    bg-background border border-border
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${rtl.textAlign()}
                  `}
                />
              </div>
            </div>
            
            {/* Destination */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${rtl.textAlign()}`}>
                {language === 'ar' ? 'لوين؟' : 'To'}
              </label>
              <div className="relative">
                <MapPin className={`absolute top-3.5 ${language === 'ar' ? 'right-3' : 'left-3'} w-5 h-5 text-primary`} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={language === 'ar' ? 'موقع الوصول' : 'Destination'}
                  className={`
                    w-full ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-xl
                    bg-background border border-border
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${rtl.textAlign()}
                  `}
                />
              </div>
            </div>
            
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${rtl.textAlign()}`}>
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={getMinDate()}
                  className={`
                    w-full px-4 py-3 rounded-xl
                    bg-background border border-border
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                />
              </div>
              
              {(selectedMode === 'on_demand' || selectedMode === 'scheduled') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${rtl.textAlign()}`}>
                    {language === 'ar' ? 'الوقت' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-xl
                      bg-background border border-border
                      focus:outline-none focus:ring-2 focus:ring-primary
                    `}
                  />
                </div>
              )}
            </div>
            
            {/* Passengers */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${rtl.textAlign()}`}>
                {language === 'ar' ? 'عدد الركاب' : 'Passengers'}
              </label>
              <div className={`${rtl.flexRow()} gap-3`}>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPassengers(num)}
                    className={`
                      flex-1 py-3 rounded-xl font-medium transition-all
                      ${passengers === num
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-background border border-border hover:border-primary'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price Estimate */}
            <AnimatePresence>
              {priceEstimate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/10 border border-primary/20 rounded-xl p-4"
                >
                  <div className={`${rtl.flexRow()} items-center justify-between`}>
                    <div className={`${rtl.flexRow()} items-center gap-2`}>
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium">
                        {language === 'ar' ? 'السعر التقديري' : 'Estimated Price'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {priceEstimate} {language === 'ar' ? 'دينار' : 'JOD'}
                    </span>
                  </div>
                  {selectedMode === 'carpooling' && (
                    <p className={`text-xs text-muted-foreground mt-2 ${rtl.textAlign()}`}>
                      {language === 'ar' 
                        ? '* السعر للشخص الواحد (مشاركة التكلفة)'
                        : '* Price per person (cost-sharing)'
                      }
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!origin || !destination || isSearching}
              className={`
                w-full py-4 rounded-xl font-bold text-lg
                bg-gradient-to-r from-primary to-primary-dark text-white
                hover:shadow-xl transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${rtl.flexRow()} items-center justify-center gap-3
              `}
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
                </>
              ) : (
                <>
                  {selectedMode === 'on_demand' && <Zap className="w-5 h-5" />}
                  {language === 'ar' ? 'ابحث الآن' : 'Search Now'}
                </>
              )}
            </button>
          </div>
        </motion.div>
        
        {/* Popular Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h3 className={`text-lg font-bold mb-4 ${rtl.textAlign()}`}>
            {language === 'ar' ? 'وجهات شعبية' : 'Popular Routes'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularRoutes.map((route, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickRoute(route)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  p-4 rounded-xl bg-card border border-border
                  hover:border-primary hover:bg-card-hover
                  transition-all duration-200
                  ${rtl.textAlign()}
                `}
              >
                <div className={`${rtl.flexRow()} items-center gap-3 mb-2`}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {language === 'ar' 
                        ? `${route.fromAr} → ${route.toAr}`
                        : `${route.from} → ${route.to}`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {route.distance} {language === 'ar' ? 'كم' : 'km'}
                    </div>
                  </div>
                  <div className={`text-${language === 'ar' ? 'left' : 'right'}`}>
                    <div className="text-sm font-bold text-primary">
                      {selectedMode === 'carpooling' 
                        ? Math.ceil(route.distance * 0.025 + 3)
                        : parseFloat((route.distance * 0.50 + 2.5).toFixed(1))
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'دينار' : 'JOD'}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Mode Comparison Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-muted/30 border border-border rounded-2xl p-6 mb-12"
        >
          <h3 className={`text-lg font-bold mb-4 ${rtl.textAlign()}`}>
            {language === 'ar' ? 'قارن بين الخيارات' : 'Compare Options'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carpooling */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className={`${rtl.flexRow()} items-center gap-2 mb-3`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">
                  {language === 'ar' ? 'مشاركة رحلة' : 'Carpooling'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className={`${rtl.flexRow()} items-start gap-2`}>
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {language === 'ar' ? 'وفّر حتى ٧٠٪ من تكلفة التاكسي' : 'Save up to 70% vs taxi'}
                  </span>
                </div>
                <div className={`${rtl.flexRow()} items-start gap-2`}>
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {language === 'ar' ? 'مثالي للرحلات الطويلة (٥٠+ كم)' : 'Perfect for long trips (50+ km)'}
                  </span>
                </div>
                <div className={`${rtl.flexRow()} items-start gap-2`}>
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {language === 'ar' ? 'يتطلب حجز مسبق (٢٤ ساعة+)' : 'Requires advance booking (24h+)'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* On-Demand */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className={`${rtl.flexRow()} items-center gap-2 mb-3`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">
                  {language === 'ar' ? 'طلب فوري' : 'On-Demand'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className={`${rtl.flexRow()} items-start gap-2`}>
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {language === 'ar' ? 'توصيل فوري خلال <٥ دقايق' : 'Instant pickup in <5 min'}
                  </span>
                </div>
                <div className={`${rtl.flexRow()} items-start gap-2`}>
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {language === 'ar' ? 'سائقين محترفين + تتبع مباشر' : 'Professional drivers + live tracking'}
                  </span>
                </div>
                <div className={`${rtl.flexRow()} items-start gap-2`}>
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {language === 'ar' ? 'سعر أعلى (أسعار ديناميكية)' : 'Higher price (dynamic pricing)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
