/**
 * RouteDetails — /features/routes/RouteDetails.tsx
 * Full route info page: distance, duration, stops, typical prices, prayer stops
 * ✅ Jordan Tier-1 launch routes | ✅ Bilingual | ✅ Deep-link to SearchRides
 */

import { useParams } from 'react-router';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { motion } from 'motion/react';
import {
  ArrowLeft, MapPin, Clock, Fuel, Users, Star, Moon,
  ChevronRight, Building2, Navigation, Calendar, Shield, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/currency';

// ── Route data for Jordan Tier-1 routes ─────────────────────────────────────

interface RouteStop {
  nameEn: string;
  nameAr: string;
  type: 'city' | 'mosque' | 'rest';
}

interface RouteInfo {
  id: string;
  fromEn: string; fromAr: string;
  toEn: string;   toAr: string;
  km: number;
  durationH: number;
  priceMin: number;
  priceMax: number;
  tier: 'launch' | 'expand';
  stops: RouteStop[];
  highlights: { en: string; ar: string }[];
  prayerStopsCount: number;
  weeklyRides: string;
  avgRating: number;
}

const ROUTES: RouteInfo[] = [
  {
    id: 'amman-aqaba',
    fromEn: 'Amman', fromAr: 'عمّان',
    toEn:   'Aqaba',  toAr:  'العقبة',
    km: 330, durationH: 4,
    priceMin: 8, priceMax: 10,
    tier: 'launch',
    prayerStopsCount: 2,
    weeklyRides: '50+',
    avgRating: 4.8,
    stops: [
      { nameEn: 'Ma\'an',          nameAr: 'معان',         type: 'city'   },
      { nameEn: 'Al-Hasa Mosque',  nameAr: 'مسجد الحسا',  type: 'mosque' },
      { nameEn: 'Quweira',         nameAr: 'القويرة',     type: 'rest'   },
    ],
    highlights: [
      { en: 'Beach weekends & port visits', ar: 'عطلات الشاطئ وزيارات الميناء' },
      { en: 'Desert highway scenery',       ar: 'مناظر الطريق الصحراوي'        },
      { en: 'Wadi Rum gateway',             ar: 'بوابة وادي رم'                },
    ],
  },
  {
    id: 'amman-irbid',
    fromEn: 'Amman', fromAr: 'عمّان',
    toEn:   'Irbid',  toAr:  'إربد',
    km: 85, durationH: 1.5,
    priceMin: 3, priceMax: 5,
    tier: 'launch',
    prayerStopsCount: 1,
    weeklyRides: '100+',
    avgRating: 4.9,
    stops: [
      { nameEn: 'Jerash',    nameAr: 'جرش',   type: 'city'   },
      { nameEn: 'Ajloun',    nameAr: 'عجلون', type: 'rest'   },
    ],
    highlights: [
      { en: 'Yarmouk University students', ar: 'طلاب جامعة اليرموك'  },
      { en: 'Daily commuter route',        ar: 'طريق المسافرين اليومي' },
      { en: 'Northern Jordan gateway',     ar: 'بوابة شمال الأردن'   },
    ],
  },
  {
    id: 'amman-dead-sea',
    fromEn: 'Amman',    fromAr: 'عمّان',
    toEn:   'Dead Sea', toAr:  'البحر الميت',
    km: 60, durationH: 1,
    priceMin: 5, priceMax: 7,
    tier: 'launch',
    prayerStopsCount: 0,
    weeklyRides: '30+',
    avgRating: 4.7,
    stops: [
      { nameEn: 'Airport Highway',  nameAr: 'طريق المطار', type: 'rest' },
      { nameEn: 'Sweimeh',          nameAr: 'الصوامع',    type: 'city' },
    ],
    highlights: [
      { en: 'Tourists & spa visits', ar: 'سياحة وزيارات المنتجعات' },
      { en: 'Weekend getaway',       ar: 'عطلة نهاية الأسبوع'      },
      { en: 'Lowest point on Earth', ar: 'أخفض نقطة على الأرض'    },
    ],
  },
  {
    id: 'amman-zarqa',
    fromEn: 'Amman', fromAr: 'عمّان',
    toEn:   'Zarqa',  toAr:  'الزرقا',
    km: 30, durationH: 0.5,
    priceMin: 2, priceMax: 3,
    tier: 'launch',
    prayerStopsCount: 0,
    weeklyRides: '200+',
    avgRating: 4.6,
    stops: [
      { nameEn: 'Russeifa', nameAr: 'رصيفة', type: 'city' },
    ],
    highlights: [
      { en: 'Daily commuters & family',   ar: 'مسافرون يوميون وعائلات' },
      { en: 'Industrial zone workers',    ar: 'عمال المنطقة الصناعية'  },
      { en: 'Most frequent Wasel route',  ar: 'أكثر مسار في واصل'     },
    ],
  },
];

const stopTypeIcon = (type: RouteStop['type']) => {
  if (type === 'mosque') return '🕌';
  if (type === 'rest')   return '☕';
  return '📍';
};

export function RouteDetails() {
  const { id } = useParams<{ id?: string }>();
  const navigate  = useIframeSafeNavigate();
  const { language, dir } = useLanguage();
  const ar = language === 'ar';

  // Find by param or default to first route
  const route = ROUTES.find(r => r.id === id) || ROUTES[0];

  const durationLabel = route.durationH < 1
    ? `${Math.round(route.durationH * 60)} ${ar ? 'دق' : 'min'}`
    : `${route.durationH}${ar ? 'س' : 'h'}`;

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={dir}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">
              {ar ? route.fromAr : route.fromEn} → {ar ? route.toAr : route.toEn}
            </h1>
            <p className="text-xs text-slate-400">{route.km} km · {durationLabel}</p>
          </div>
          {route.tier === 'launch' && (
            <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
              🚀 {ar ? 'إطلاق' : 'Launch'}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* Route selector strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROUTES.map(r => (
            <button
              key={r.id}
              onClick={() => navigate(`/app/routes/${r.id}`)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${r.id === route.id ? 'bg-primary/15 border-primary/30 text-primary' : 'border-[#1E293B] text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
            >
              {ar ? r.fromAr : r.fromEn} → {ar ? r.toAr : r.toEn}
            </button>
          ))}
        </div>

        {/* Stats hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          key={route.id}
          className="grid grid-cols-4 gap-2"
        >
          {[
            { icon: Navigation, label: ar ? 'مسافة' : 'Distance', value: `${route.km} km`, color: 'text-primary' },
            { icon: Clock,      label: ar ? 'مدة'    : 'Duration', value: durationLabel,    color: 'text-amber-400' },
            { icon: Fuel,       label: ar ? 'سعر'    : 'From',     value: `${route.priceMin} JOD`, color: 'text-emerald-400' },
            { icon: Star,       label: ar ? 'تقييم'  : 'Rating',   value: route.avgRating.toString(), color: 'text-amber-400' },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Price Range */}
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">{ar ? 'نطاق السعر / مقعد' : 'Price range / seat'}</p>
              <p className="text-2xl font-black text-primary">
                {formatCurrency(route.priceMin)} – {formatCurrency(route.priceMax)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {ar ? '✅ تقاسم ثابت — بدون سعر ديناميكي' : '✅ Fixed cost-sharing — no surge pricing'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">{ar ? 'رحلات/أسبوع' : 'Rides/week'}</p>
              <p className="text-2xl font-black text-emerald-400">{route.weeklyRides}</p>
            </div>
          </div>
        </Card>

        {/* Route Stops */}
        <Card className="bg-card border-border p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {ar ? 'المحطات' : 'Route Stops'}
          </h3>
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#1E293B]" />
            <div className="space-y-3">
              {/* Origin */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center relative z-10 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-bold text-white">{ar ? route.fromAr : route.fromEn}</span>
                <Badge className="ml-auto bg-primary/15 text-primary border-primary/20 text-[10px]">
                  {ar ? 'انطلاق' : 'Depart'}
                </Badge>
              </div>

              {/* Intermediate stops */}
              {route.stops.map(stop => (
                <div key={stop.nameEn} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1E293B] border border-[#2E3F56] flex items-center justify-center relative z-10 shrink-0 text-xs">
                    {stopTypeIcon(stop.type)}
                  </div>
                  <span className="text-sm text-slate-300">{ar ? stop.nameAr : stop.nameEn}</span>
                  {stop.type === 'mosque' && (
                    <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                      {ar ? 'صلاة' : 'Prayer'}
                    </Badge>
                  )}
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center relative z-10 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-bold text-white">{ar ? route.toAr : route.toEn}</span>
                <Badge className="ml-auto bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
                  {ar ? 'وصول' : 'Arrive'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Cultural Features */}
        {route.prayerStopsCount > 0 && (
          <Card className="bg-amber-500/5 border-amber-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🕌</span>
              <h3 className="text-sm font-bold text-amber-300">
                {ar ? 'وقفات الصلاة' : 'Prayer Stops'}
              </h3>
              <Badge className="ml-auto bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs">
                {route.prayerStopsCount} {ar ? 'وقفة' : 'stops'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {ar
                ? `الرحلة تشمل ${route.prayerStopsCount} وقفة صلاة في مساجد معتمدة على الطريق`
                : `Trip includes ${route.prayerStopsCount} prayer stop(s) at vetted mosques along the route`}
            </p>
            <button
              onClick={() => navigate('/app/mosque-directory')}
              className="mt-2 text-[11px] text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1"
            >
              {ar ? 'دليل المساجد' : 'Mosque Directory'} <ChevronRight className="w-3 h-3" />
            </button>
          </Card>
        )}

        {/* Highlights */}
        <Card className="bg-card border-border p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            {ar ? 'لماذا هذا المسار؟' : 'Why this route?'}
          </h3>
          <div className="space-y-2">
            {route.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {ar ? h.ar : h.en}
              </div>
            ))}
          </div>
        </Card>

        {/* Also send packages */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-300">
                {ar ? 'راجع | ابعث طرد على هالطريق' : 'Raje3 | Send a package this route'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {ar ? 'مع مسافر رايح هناك أصلاً' : 'With a traveler already going there'}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/app/awasel/send?from=${route.fromEn}&to=${route.toEn}`)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold h-8 rounded-xl"
            >
              {ar ? 'ابعث' : 'Send'} <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </Card>

        {/* CTA */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/app/find-ride?from=${route.fromEn}&to=${route.toEn}`)}
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            style={{ fontWeight: 700 }}
          >
            <Users className="w-4 h-4 mr-2" />
            {ar ? 'دور على رحلة' : 'Find a Ride'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/app/offer-ride?from=${route.fromEn}&to=${route.toEn}`)}
            className="flex-1 h-12 border-primary/30 text-primary hover:bg-primary/10 font-bold rounded-xl"
            style={{ fontWeight: 700 }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {ar ? 'انشر رحلة' : 'Post a Ride'}
          </Button>
        </div>
      </div>
    </div>
  );
}