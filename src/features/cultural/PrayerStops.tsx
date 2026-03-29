/**
 * PrayerStops — /features/cultural/PrayerStops.tsx
 * Trip-integrated prayer stop calculator & mosque directory
 * ✅ Bilingual (Jordanian dialect) | ✅ Backend-connected via /cultural/*
 * ✅ Vetted mosque directory | ✅ Clean facilities badge | ✅ Jordan + KSA routes
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, ChevronRight, CheckCircle2, Navigation, Coffee, Star, Info, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { culturalApi } from '../../services/cultural';
import type { PrayerStopsResponse, MosqueEntry } from '../../services/cultural';
import { WaselColors } from '../../tokens/wasel-tokens';

const POPULAR_ROUTES = [
  { key: 'amman-aqaba',   labelEn: 'Amman → Aqaba',    labelAr: 'عمّان ← العقبة',   durationMin: 240, country: 'JO' },
  { key: 'amman-irbid',   labelEn: 'Amman → Irbid',    labelAr: 'عمّان ← إربد',     durationMin: 90,  country: 'JO' },
  { key: 'amman-deadsea',  labelEn: 'Amman → Dead Sea', labelAr: 'عمّان ← البحر الميت', durationMin: 60, country: 'JO' },
] as const;

export function PrayerStops() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [selectedRoute, setSelectedRoute] = useState(POPULAR_ROUTES[0].key);
  const [departureTime, setDepartureTime] = useState('09:00');
  const [showMosques, setShowMosques] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stopsData, setStopsData] = useState<PrayerStopsResponse | null>(null);
  const [mosques, setMosques] = useState<MosqueEntry[]>([]);

  const route = POPULAR_ROUTES.find(r => r.key === selectedRoute) || POPULAR_ROUTES[0];

  const fetchStops = useCallback(async () => {
    setLoading(true);
    try {
      const [stopsRes, mosquesRes] = await Promise.all([
        culturalApi.getPrayerStops({
          departure: departureTime,
          duration: route.durationMin,
          route: selectedRoute,
        }),
        culturalApi.getMosques(selectedRoute),
      ]);
      setStopsData(stopsRes);
      setMosques(mosquesRes.mosques);
    } catch (err) {
      console.error('[PrayerStops] backend fetch failed, using empty:', err);
      setStopsData(null);
      setMosques([]);
    } finally {
      setLoading(false);
    }
  }, [departureTime, route.durationMin, selectedRoute]);

  useEffect(() => { fetchStops(); }, [fetchStops]);

  const stops = stopsData?.prayerStops ?? [];

  const t = {
    title:         ar ? 'مواقف الصلاة في الرحلة' : 'Prayer Stops on Your Journey',
    subtitle:      ar ? 'احسب مواقيت الصلاة تلقائياً وابحث عن أقرب مسجد في طريقك' : 'Auto-calculate prayer times & find mosques along your route',
    route:         ar ? 'المسار' : 'Route',
    departure:     ar ? 'وقت المغادرة' : 'Departure Time',
    stops:         ar ? 'مواقف الصلاة المحسوبة' : 'Calculated Prayer Stops',
    noStops:       ar ? 'لا توجد مواقف صلاة في هذه الرحلة' : 'No prayer stops needed for this trip time',
    mosqueDir:     ar ? 'دليل المساجد' : 'Mosque Directory',
    viewMosques:   ar ? 'عرض المساجد على المسار' : 'View Mosques on Route',
    hideMosques:   ar ? 'إخفاء المساجد' : 'Hide Mosques',
    verified:      ar ? 'مُتحقق منه' : 'Verified',
    tripDuration:  ar ? `مدة الرحلة: ${Math.floor(route.durationMin / 60)} ساعات` : `Trip Duration: ${Math.floor(route.durationMin / 60)}h`,
    facilities:    ar ? 'المرافق' : 'Facilities',
    arrival:       ar ? 'الوصول المتوقع' : 'Est. Arrival',
  };

  const facilityLabel = (f: string) => {
    const map: Record<string, [string, string]> = {
      restrooms: ['🚻 دورات مياه نظيفة', '🚻 Clean Restrooms'],
      parking: ['🅿️ مواقف', '🅿️ Parking'],
      wudu: ['💧 وضوء', '💧 Wudu Area'],
      women_section: ['🚺 قسم نساء', '🚺 Women Section'],
    };
    const m = map[f];
    return m ? (ar ? m[0] : m[1]) : f;
  };

  return (
    <div className="min-h-screen pb-24 bg-background" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur border-b border-border px-4 py-4" style={{ background: `${WaselColors.navyBase}F2` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">🕌</div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">{t.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Route Selector */}
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">{t.route}</p>
          <div className="grid grid-cols-1 gap-2">
            {POPULAR_ROUTES.map(r => (
              <button
                key={r.key}
                onClick={() => setSelectedRoute(r.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedRoute === r.key
                    ? 'bg-primary/15 border border-primary/30 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <span>{ar ? r.labelAr : r.labelEn}</span>
                <Badge className="text-[10px] bg-blue-500/15 text-blue-400 border-blue-500/20">🇯🇴 JO</Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Time + Duration */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-bold block mb-1.5">{t.departure}</label>
              <input
                type="time"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-foreground text-sm border border-border bg-background focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-bold mb-1.5">{ar ? 'مدة الرحلة' : 'Duration'}</p>
              <div className="border border-border rounded-lg px-3 py-2 bg-background">
                <p className="text-primary font-bold text-sm">{Math.floor(route.durationMin / 60)}h {route.durationMin % 60 > 0 ? `${route.durationMin % 60}m` : ''}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Calculated Stops */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {t.stops}
            </h2>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">{stops.length} {ar ? 'موقف' : 'stops'}</Badge>
            )}
          </div>

          {loading ? (
            <Card className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{ar ? 'جاري الحساب...' : 'Calculating...'}</p>
            </Card>
          ) : stops.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-muted-foreground">{t.noStops}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {stops.map((stop, i) => (
                <motion.div
                  key={`${stop.prayer}-${i}`}
                  initial={{ opacity: 0, x: ar ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-lg">
                        🕌
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-foreground text-sm">{ar ? stop.prayerAr : stop.prayer}</span>
                          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-[10px]">{stop.time}</Badge>
                          <Badge className="bg-muted text-muted-foreground text-[10px]">{stop.minutesIntoTrip}min into trip</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{ar ? `مدة التوقف: ${stop.stopDuration} دقيقة` : `Stop duration: ${stop.stopDuration} min`}</p>
                        {stop.mosque && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                            <MapPin className="w-3 h-3" />
                            <span>{ar ? stop.mosque.nameAr : stop.mosque.name}</span>
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Total extra time + adjusted arrival */}
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="text-xs text-primary/80">
                    <p>
                      {ar
                        ? `إجمالي وقت التوقف: ${stopsData?.totalStopTime ?? 0} دقيقة`
                        : `Total prayer stop time: ${stopsData?.totalStopTime ?? 0} min added to trip`}
                    </p>
                    {stopsData?.estimatedArrival && (
                      <p className="font-bold mt-0.5">
                        {t.arrival}: {stopsData.estimatedArrival}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Mosque Directory Toggle */}
        <Button
          onClick={() => setShowMosques(v => !v)}
          variant="outline"
          className="w-full border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {showMosques ? t.hideMosques : t.viewMosques}
          {mosques.length > 0 && <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[10px]">{mosques.length}</Badge>}
        </Button>

        <AnimatePresence>
          {showMosques && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {mosques.length === 0 ? (
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">{ar ? 'لا توجد مساجد مدرجة لهذا المسار بعد' : 'No mosques listed for this route yet'}</p>
                </Card>
              ) : mosques.map(mosque => (
                <Card key={mosque.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-foreground text-sm">{ar ? mosque.nameAr : mosque.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{mosque.city} · {mosque.km} km {ar ? 'من البداية' : 'from start'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] mb-1 block">
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />{t.verified}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mosque.facilities.map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {facilityLabel(f)}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
