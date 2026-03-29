/**
 * Prayer Times Widget
 * Displays current and upcoming prayer times with notifications
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, Clock, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl, flipX } from '../../utils/rtl';
import { WaselColors, WaselSpacing, WaselRadius } from '../../tokens/wasel-tokens';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import {
  fetchPrayerTimes,
  getNextPrayer,
  getTimeUntilPrayer,
  loadPrayerPreferences,
  savePrayerPreferences,
  type PrayerTimes,
  type PrayerPreferences,
} from '../../services/prayer-times';

export function PrayerTimesWidget() {
  const { language, t } = useLanguage();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [preferences, setPreferences] = useState<PrayerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [timeUntil, setTimeUntil] = useState<number>(0);

  const translations = {
    en: {
      prayerTimes: 'Prayer Times',
      nextPrayer: 'Next Prayer',
      minutesRemaining: 'minutes remaining',
      enableNotifications: 'Enable Notifications',
      enableTripPauses: 'Allow Trip Pauses',
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      loading: 'Loading prayer times...',
      error: 'Unable to load prayer times',
    },
    ar: {
      prayerTimes: 'مواقيت الصلاة',
      nextPrayer: 'الصلاة القادمة',
      minutesRemaining: 'دقيقة متبقية',
      enableNotifications: 'تفعيل الإشعارات',
      enableTripPauses: 'السماح بإيقاف الرحلات',
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
      loading: 'جاري تحميل مواقيت الصلاة...',
      error: 'تعذر تحميل مواقيت الصلاة',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    // Update next prayer every minute
    const interval = setInterval(() => {
      const next = getNextPrayer(prayerTimes);
      setNextPrayer(next);
      
      if (next) {
        setTimeUntil(getTimeUntilPrayer(next.time));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const [times, prefs] = await Promise.all([
        fetchPrayerTimes(position.coords.latitude, position.coords.longitude),
        loadPrayerPreferences(),
      ]);

      setPrayerTimes(times);
      setPreferences(prefs);

      const next = getNextPrayer(times);
      setNextPrayer(next);
      
      if (next) {
        setTimeUntil(getTimeUntilPrayer(next.time));
      }
    } catch (error) {
      console.error('Failed to load prayer times:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof PrayerPreferences, value: boolean) => {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await savePrayerPreferences(updated);
  };

  if (loading) {
    return (
      <Card
        className="p-6"
        style={{
          background: WaselColors.navyCard,
          borderRadius: WaselRadius.lg,
        }}
      >
        <div className={`${rtl.flex(language)} items-center gap-3`}>
          <Moon className="h-5 w-5 animate-pulse" style={{ color: WaselColors.teal }} />
          <p style={{ color: WaselColors.textSecondary }}>{txt.loading}</p>
        </div>
      </Card>
    );
  }

  if (!prayerTimes || !preferences) {
    return null;
  }

  const getPrayerIcon = (name: string) => {
    if (name === 'Fajr' || name === 'الفجر') return <Moon className="h-4 w-4" />;
    if (name === 'Maghrib' || name === 'المغرب') return <Sun className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          background: WaselColors.navyCard,
          borderRadius: WaselRadius.lg,
          border: `1px solid ${WaselColors.borderDark}`,
        }}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{
            background: `linear-gradient(135deg, ${WaselColors.teal}15, ${WaselColors.navyCard})`,
            borderBottom: `1px solid ${WaselColors.borderDark}`,
          }}
        >
          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <div className={`${rtl.flex(language)} items-center gap-3`}>
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `${WaselColors.teal}20`,
                }}
              >
                <Moon className="h-5 w-5" style={{ color: WaselColors.teal }} />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: WaselColors.textPrimary }}
                >
                  {txt.prayerTimes}
                </h3>
                <p className="text-sm" style={{ color: WaselColors.textSecondary }}>
                  {prayerTimes.date}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreferenceChange('enableNotifications', !preferences.enableNotifications)}
            >
              {preferences.enableNotifications ? (
                <Bell className="h-4 w-4" style={{ color: WaselColors.teal }} />
              ) : (
                <BellOff className="h-4 w-4" style={{ color: WaselColors.textSecondary }} />
              )}
            </Button>
          </div>

          {/* Next Prayer Highlight */}
          {nextPrayer && (
            <motion.div
              className="mt-4 p-4 rounded-lg"
              style={{
                background: `${WaselColors.teal}10`,
                border: `1px solid ${WaselColors.teal}30`,
              }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className={`${rtl.flex(language)} items-center justify-between`}>
                <div className={`${rtl.flex(language)} items-center gap-2`}>
                  {getPrayerIcon(nextPrayer.name)}
                  <span className="font-medium" style={{ color: WaselColors.textPrimary }}>
                    {txt.nextPrayer}: {txt[nextPrayer.name.toLowerCase() as keyof typeof txt] as string || nextPrayer.name}
                  </span>
                </div>
                <div className={rtl.text(language)}>
                  <span
                    className="text-xl font-bold"
                    style={{ color: WaselColors.teal }}
                  >
                    {nextPrayer.time}
                  </span>
                  <p className="text-xs" style={{ color: WaselColors.textSecondary }}>
                    {timeUntil} {txt.minutesRemaining}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Prayer Times Grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { name: 'fajr', time: prayerTimes.fajr, icon: <Moon className="h-4 w-4" /> },
            { name: 'sunrise', time: prayerTimes.sunrise, icon: <Sun className="h-4 w-4" /> },
            { name: 'dhuhr', time: prayerTimes.dhuhr, icon: <Sun className="h-4 w-4" /> },
            { name: 'asr', time: prayerTimes.asr, icon: <Sun className="h-4 w-4" /> },
            { name: 'maghrib', time: prayerTimes.maghrib, icon: <Moon className="h-4 w-4" /> },
            { name: 'isha', time: prayerTimes.isha, icon: <Moon className="h-4 w-4" /> },
          ].map((prayer) => {
            const isNext = nextPrayer?.name.toLowerCase() === prayer.name;
            return (
              <div
                key={prayer.name}
                className={`p-3 rounded-lg ${rtl.flex(language)} items-center justify-between`}
                style={{
                  background: isNext ? `${WaselColors.teal}15` : WaselColors.navyBase,
                  border: `1px solid ${isNext ? WaselColors.teal : WaselColors.borderDark}`,
                }}
              >
                <div className={`${rtl.flex(language)} items-center gap-2`}>
                  <span style={{ color: isNext ? WaselColors.teal : WaselColors.textSecondary }}>
                    {prayer.icon}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: isNext ? WaselColors.textPrimary : WaselColors.textSecondary }}
                  >
                    {txt[prayer.name as keyof typeof txt] as string}
                  </span>
                </div>
                <span
                  className="font-mono text-sm font-medium"
                  style={{ color: isNext ? WaselColors.teal : WaselColors.textPrimary }}
                >
                  {prayer.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div
          className="p-6"
          style={{
            borderTop: `1px solid ${WaselColors.borderDark}`,
            background: WaselColors.navyBase,
          }}
        >
          <div className="space-y-3">
            <div className={`${rtl.flex(language)} items-center justify-between`}>
              <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
                {txt.enableNotifications}
              </span>
              <Switch
                checked={preferences.enableNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('enableNotifications', checked)}
              />
            </div>
            <div className={`${rtl.flex(language)} items-center justify-between`}>
              <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
                {txt.enableTripPauses}
              </span>
              <Switch
                checked={preferences.enableTripPauses}
                onCheckedChange={(checked) => handlePreferenceChange('enableTripPauses', checked)}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}