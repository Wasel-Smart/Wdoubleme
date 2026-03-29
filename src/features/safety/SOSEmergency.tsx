import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Phone, MapPin, Shield, X, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface SOSEmergencyProps {
  tripId?: string;
  driverId?: string;
  currentLocation?: { lat: number; lng: number };
}

export function SOSEmergency({ tripId, driverId, currentLocation }: SOSEmergencyProps) {
  const { t, language, dir } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [alertSent, setAlertSent] = useState(false);

  const emergencyContacts: EmergencyContact[] = [
    {
      name: language === 'ar' ? 'الدفاع المدني' : 'Civil Defense',
      phone: '911',
      relationship: language === 'ar' ? 'طوارئ' : 'Emergency',
    },
    {
      name: language === 'ar' ? 'أمي - سارة' : 'Mom - Sara',
      phone: '+962 79 123 4567',
      relationship: language === 'ar' ? 'عائلة' : 'Family',
    },
  ];

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sendEmergencyAlert();
    }
  }, [countdown]);

  const handleSOSPress = () => {
    setCountdown(5); // 5-second countdown
  };

  const cancelSOS = () => {
    setCountdown(null);
  };

  const sendEmergencyAlert = async () => {
    setCountdown(null);
    setAlertSent(true);

    // Send emergency alert to:
    // 1. Emergency contacts
    // 2. Platform support team
    // 3. Other trip participants
    // 4. Local authorities (optional)

    const alertData = {
      tripId,
      driverId,
      location: currentLocation,
      timestamp: new Date().toISOString(),
      userId: 'current-user-id', // Get from auth context
    };

    console.log('🚨 EMERGENCY ALERT SENT:', alertData);

    // TODO: API call to backend
    // await api.post('/emergency/sos', alertData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const shareLocation = () => {
    if (navigator.share && currentLocation) {
      navigator.share({
        title: language === 'ar' ? 'موقعي الحالي' : 'My Current Location',
        text: language === 'ar' ? 'أنا في حالة طوارئ' : "I'm in an emergency",
        url: `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`,
      });
    }
  };

  return (
    <>
      {/* SOS Button (Fixed Position) */}
      {!isActive && !alertSent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            onClick={() => setIsActive(true)}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
          >
            <Shield className="h-8 w-8" />
          </Button>
        </motion.div>
      )}

      {/* SOS Modal */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            dir={dir}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="p-6 border-red-500 border-2">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActive(false)}
                  className={`absolute ${rtl.right(4)} top-4`}
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600">
                    {language === 'ar' ? 'طوارئ SOS' : 'SOS Emergency'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'ar'
                      ? 'اضغط على الزر عشان ترسل تنبيه للأشخاص المقربين والدعم الفني'
                      : 'Press the button to send alert to emergency contacts and support team'}
                  </p>
                </div>

                {countdown !== null ? (
                  /* Countdown Active */
                  <div className="text-center">
                    <div className="text-6xl font-bold text-red-600 mb-4 animate-pulse">
                      {countdown}
                    </div>
                    <p className="text-lg mb-6">
                      {language === 'ar'
                        ? 'جاري إرسال التنبيه...'
                        : 'Sending alert...'}
                    </p>
                    <Button
                      onClick={cancelSOS}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                ) : (
                  /* SOS Options */
                  <div className="space-y-4">
                    <Button
                      onClick={handleSOSPress}
                      className="w-full bg-red-600 hover:bg-red-700 h-16 text-lg"
                    >
                      <AlertTriangle className={`h-6 w-6 ${rtl.mr(2)}`} />
                      {language === 'ar' ? 'أرسل تنبيه طوارئ' : 'Send Emergency Alert'}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={shareLocation}
                        className="h-12"
                      >
                        <MapPin className={`h-5 w-5 ${rtl.mr(2)}`} />
                        {language === 'ar' ? 'شارك الموقع' : 'Share Location'}
                      </Button>

                      <Button variant="outline" className="h-12">
                        <Phone className={`h-5 w-5 ${rtl.mr(2)}`} />
                        {language === 'ar' ? 'اتصل بـ 911' : 'Call 911'}
                      </Button>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">
                        {language === 'ar' ? 'جهات الاتصال الطارئة' : 'Emergency Contacts'}
                      </h3>
                      <div className="space-y-2">
                        {emergencyContacts.map((contact, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-sm">{contact.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {contact.phone}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Info */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar'
                          ? '⚡ سيتم إرسال موقعك الحالي وتفاصيل الرحلة لجهات الاتصال والدعم الفني فوراً'
                          : '⚡ Your current location and trip details will be sent immediately to contacts and support'}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Sent Confirmation */}
      <AnimatePresence>
        {alertSent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-4 bg-green-600 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6" />
                <div>
                  <div className="font-semibold">
                    {language === 'ar' ? '✅ تم إرسال التنبيه' : '✅ Alert Sent'}
                  </div>
                  <div className="text-sm opacity-90">
                    {language === 'ar'
                      ? 'الدعم الفني على الطريق'
                      : 'Support team notified'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlertSent(false)}
                  className="text-white hover:text-white/80"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}