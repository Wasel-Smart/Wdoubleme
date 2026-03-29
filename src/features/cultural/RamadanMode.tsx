/**
 * RamadanMode — /features/cultural/RamadanMode.tsx
 * Full Ramadan mode: iftar-timed rides, suhoor trips, fasting-friendly features
 * ✅ Ramadan 2026: March 1 - March 30 | ✅ Backend-connected | ✅ Bilingual
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Clock, Star, ChevronRight, Bell, Coffee, Check, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { culturalApi } from '../../services/cultural';
import type { RamadanResponse } from '../../services/cultural';

interface RamadanPrefs {
  ramadanModeEnabled: boolean;
  iftarRideNotif: boolean;
  suhoorTrips: boolean;
  noFoodInCar: boolean;
  preferFastingDrivers: boolean;
  autoDiscount: boolean;
}

export function RamadanMode() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';

  const [ramadanData, setRamadanData] = useState<RamadanResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [prefs, setPrefs] = useState<RamadanPrefs>(() => {
    try {
      const saved = localStorage.getItem('wasel_ramadan_prefs');
      return saved ? JSON.parse(saved) : {
        ramadanModeEnabled: true,
        iftarRideNotif: true,
        suhoorTrips: false,
        noFoodInCar: true,
        preferFastingDrivers: false,
        autoDiscount: true,
      };
    } catch { return { ramadanModeEnabled: true, iftarRideNotif: true, suhoorTrips: false, noFoodInCar: true, preferFastingDrivers: false, autoDiscount: true }; }
  });

  const [saved, setSaved] = useState(false);

  // Fetch Ramadan status from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await culturalApi.getRamadanStatus();
        if (!cancelled) {
          setRamadanData(data);
          // Auto-enable if it's actually Ramadan
          if (data.isRamadan && !prefs.ramadanModeEnabled) {
            setPrefs(p => ({ ...p, ramadanModeEnabled: true }));
          }
        }
      } catch (err) {
        console.error('[RamadanMode] backend fetch failed:', err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const active = ramadanData?.isRamadan ?? false;
  const iftarTime = ramadanData?.iftarTime ?? '18:00';
  const suhoorTime = ramadanData?.suhoorTime ?? '04:40';
  const discountPct = ramadanData?.features?.discountPercent ?? 0;

  // Calculate Ramadan day
  const ramadanDay = (() => {
    if (!active || !ramadanData?.startDate) return 0;
    const start = new Date(ramadanData.startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  })();

  const savePrefs = (next: RamadanPrefs) => {
    setPrefs(next);
    localStorage.setItem('wasel_ramadan_prefs', JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof RamadanPrefs) => savePrefs({ ...prefs, [key]: !prefs[key] });

  const t = {
    title:          ar ? 'وضع رمضان 🌙'               : 'Ramadan Mode 🌙',
    subtitle:       ar ? 'رحلات صيام-صديقة خلال الشهر الكريم' : 'Fasting-friendly rides during the holy month',
    activeLabel:    ar ? `رمضان ${1447} — اليوم ${ramadanDay}` : `Ramadan 1447 — Day ${ramadanDay}`,
    notActive:      ar ? 'رمضان ليس نشطاً حالياً (1 مارس — 30 مارس 2026)' : 'Ramadan is not active right now (Mar 1 – Mar 30, 2026)',
    iftarRides:     ar ? 'رحلات الإفطار'               : 'Iftar Rides',
    iftarDesc:      ar ? `احجز رحلتك قبل الإفطار — الوصول قبل ${iftarTime}` : `Book to arrive before Iftar at ${iftarTime}`,
    suhoor:         ar ? 'رحلات السحور'                : 'Suhoor Trips',
    suhoorDesc:     ar ? `رحلات مبكرة — المغادرة في ${suhoorTime}` : `Early departures at ${suhoorTime}`,
    noFood:         ar ? 'منع الأكل والشرب في السيارة'  : 'No Food/Drinks in Car',
    noFoodDesc:     ar ? 'يلتزم السائق والركاب بعدم تناول الطعام' : 'Driver & passengers respect fasting',
    fastingDriver:  ar ? 'تفضيل السائقين الصائمين'      : 'Prefer Fasting Drivers',
    fastingDriverDesc: ar ? 'يُظهر لك السائقين الصائمين أولاً' : 'Shows fasting drivers first in search',
    discount:       ar ? `خصم رمضان ${discountPct}%`    : `Ramadan ${discountPct}% Discount`,
    discountDesc:   ar ? 'خصم تلقائي على جميع الرحلات' : 'Auto-applied on all rides during Ramadan',
    iftarCountdown: ar ? 'الإفطار بعد'                 : 'Iftar in',
    bookIftarRide:  ar ? 'احجز رحلة إفطار'             : 'Book Iftar Ride',
    bookSuhoor:     ar ? 'احجز رحلة سحور'              : 'Book Suhoor Ride',
    saved:          ar ? '✅ تم الحفظ'                 : '✅ Saved',
    loading:        ar ? 'جاري التحميل...'             : 'Loading...',
  };

  // Countdown to Iftar
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [h, m] = iftarTime.split(':').map(Number);
      const iftar = new Date(now);
      iftar.setHours(h, m, 0, 0);
      if (iftar < now) iftar.setDate(iftar.getDate() + 1);
      const diff = iftar.getTime() - now.getTime();
      const dh = Math.floor(diff / 3600000);
      const dm = Math.floor((diff % 3600000) / 60000);
      const ds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${dh}:${String(dm).padStart(2, '0')}:${String(ds).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [iftarTime]);

  const toggleItems = [
    { key: 'iftarRideNotif',       label: t.iftarRides,      desc: t.iftarDesc,      emoji: '🌅' },
    { key: 'suhoorTrips',          label: t.suhoor,          desc: t.suhoorDesc,      emoji: '🌙' },
    { key: 'noFoodInCar',          label: t.noFood,          desc: t.noFoodDesc,      emoji: '🚫' },
    { key: 'preferFastingDrivers', label: t.fastingDriver,   desc: t.fastingDriverDesc, emoji: '🤲' },
    { key: 'autoDiscount',         label: t.discount,        desc: t.discountDesc,    emoji: '🎁' },
  ] as const;

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-background" />
        <div className="relative px-4 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/10">
              🌙
            </div>
            <div>
              <h1 className="font-bold text-foreground text-xl leading-tight">{t.title}</h1>
              <p className="text-xs text-purple-300/80 mt-0.5">{t.subtitle}</p>
            </div>
          </div>

          {active ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs font-bold">
                  {t.activeLabel}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-purple-300/60 font-medium mb-1">{t.iftarCountdown}</p>
                  <p className="text-xl font-black text-amber-300 tabular-nums">{countdown}</p>
                  <p className="text-[10px] text-amber-300/60">{ar ? `الإفطار: ${iftarTime}` : `Iftar: ${iftarTime}`}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-purple-300/60 font-medium mb-1">{ar ? 'السحور' : 'Suhoor'}</p>
                  <p className="text-xl font-black text-indigo-300">{suhoorTime}</p>
                  <p className="text-[10px] text-indigo-300/60">{ar ? 'آخر وقت للسحور' : 'Last suhoor time'}</p>
                </div>
              </div>
              {/* Backend message */}
              {ramadanData?.messages && (
                <p className="text-xs text-purple-200/70 mt-3 text-center">
                  {ar ? ramadanData.messages.ar : ramadanData.messages.en}
                </p>
              )}
            </motion.div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-400" />
                {t.notActive}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Master Toggle */}
      <div className="px-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-lg">🌙</div>
              <div>
                <p className="font-bold text-foreground text-sm">{ar ? 'تفعيل وضع رمضان' : 'Enable Ramadan Mode'}</p>
                <p className="text-xs text-muted-foreground">{ar ? 'خصائص الصيام وجدول العبادة' : 'Fasting features & worship schedule'}</p>
              </div>
            </div>
            <Switch checked={prefs.ramadanModeEnabled} onCheckedChange={() => toggle('ramadanModeEnabled')} />
          </div>
        </Card>

        {/* Feature Toggles */}
        <AnimatePresence>
          {prefs.ramadanModeEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3"
            >
              {toggleItems.map(item => (
                <Card key={item.key} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-lg flex-shrink-0">{item.emoji}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                    </div>
                    <Switch checked={prefs[item.key as keyof RamadanPrefs] as boolean} onCheckedChange={() => toggle(item.key as keyof RamadanPrefs)} />
                  </div>
                </Card>
              ))}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => navigate('/app/find-ride')}
                  className="bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 h-12 flex-col gap-1 rounded-xl text-xs font-bold"
                  variant="outline"
                >
                  <span className="text-base">🌅</span>
                  {t.bookIftarRide}
                </Button>
                <Button
                  onClick={() => navigate('/app/find-ride')}
                  className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 h-12 flex-col gap-1 rounded-xl text-xs font-bold"
                  variant="outline"
                >
                  <span className="text-base">🌙</span>
                  {t.bookSuhoor}
                </Button>
              </div>

              {/* Save Confirmation */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 py-2 text-green-400 text-sm font-bold"
                  >
                    <Check className="w-4 h-4" />
                    {t.saved}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
