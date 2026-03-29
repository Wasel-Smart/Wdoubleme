/**
 * MosqueDirectory — /features/routes/MosqueDirectory.tsx
 * Prayer-stop mosque directory along Wasel's priority routes.
 * Structured placeholder data ready for API integration.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Star, Clock, Search, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';

type Amenity = 'parking' | 'restrooms' | 'wudu' | 'women_section' | 'ac';

interface Mosque {
  id: string;
  nameEn: string;
  nameAr: string;
  route: string;
  routeAr: string;
  city: string;
  cityAr: string;
  distanceFromAmman: number;
  rating: number;
  amenities: Amenity[];
  lat: number;
  lng: number;
}

const MOSQUES: Mosque[] = [
  {
    id: '1',
    nameEn: 'Al-Hussein Mosque',
    nameAr: 'مسجد الحسين',
    route: 'Amman → Aqaba',
    routeAr: 'عمّان ← العقبة',
    city: 'Qatrana',
    cityAr: 'القطرانة',
    distanceFromAmman: 130,
    rating: 4.8,
    amenities: ['parking', 'restrooms', 'wudu', 'ac'],
    lat: 31.25,
    lng: 36.06,
  },
  {
    id: '2',
    nameEn: 'Al-Nour Mosque',
    nameAr: 'مسجد النور',
    route: 'Amman → Aqaba',
    routeAr: 'عمّان ← العقبة',
    city: "Ma'an",
    cityAr: 'معان',
    distanceFromAmman: 220,
    rating: 4.7,
    amenities: ['parking', 'restrooms', 'wudu', 'women_section'],
    lat: 30.19,
    lng: 35.73,
  },
  {
    id: '3',
    nameEn: 'Al-Rahman Mosque',
    nameAr: 'مسجد الرحمن',
    route: 'Amman → Irbid',
    routeAr: 'عمّان ← إربد',
    city: 'Zarqa',
    cityAr: 'الزرقاء',
    distanceFromAmman: 30,
    rating: 4.6,
    amenities: ['parking', 'restrooms', 'wudu', 'ac'],
    lat: 32.07,
    lng: 36.09,
  },
  {
    id: '4',
    nameEn: 'Al-Aqsa Mosque',
    nameAr: 'مسجد الأقصى',
    route: 'Amman → Irbid',
    routeAr: 'عمّان ← إربد',
    city: 'Jerash',
    cityAr: 'جرش',
    distanceFromAmman: 52,
    rating: 4.9,
    amenities: ['parking', 'restrooms', 'wudu', 'women_section', 'ac'],
    lat: 32.28,
    lng: 35.9,
  },
  {
    id: '5',
    nameEn: 'King Abdullah Mosque',
    nameAr: 'مسجد الملك عبدالله',
    route: 'Amman → Dead Sea',
    routeAr: 'عمّان ← البحر الميت',
    city: 'Amman South',
    cityAr: 'جنوب عمّان',
    distanceFromAmman: 15,
    rating: 5.0,
    amenities: ['parking', 'restrooms', 'wudu', 'women_section', 'ac'],
    lat: 31.95,
    lng: 35.93,
  },
  {
    id: '6',
    nameEn: 'Al-Hashimiyya Mosque',
    nameAr: 'مسجد الهاشمية',
    route: 'Amman → Petra',
    routeAr: 'عمّان ← البتراء',
    city: 'Shoubak',
    cityAr: 'الشوبك',
    distanceFromAmman: 190,
    rating: 4.5,
    amenities: ['parking', 'restrooms', 'wudu'],
    lat: 30.53,
    lng: 35.56,
  },
];

const AMENITY_META: Record<Amenity, { en: string; ar: string; icon: string }> = {
  parking:       { en: 'Parking',         ar: 'موقف سيارات',    icon: '🚗' },
  restrooms:     { en: 'Restrooms',       ar: 'دورات مياه',     icon: '🚻' },
  wudu:          { en: 'Wudu Area',       ar: 'مكان للوضوء',   icon: '🚿' },
  women_section: { en: "Women's Section", ar: 'قسم النساء',     icon: '🧕' },
  ac:            { en: 'Air Conditioned', ar: 'مكيّف',          icon: '❄️' },
};

const ROUTE_FILTERS = [
  { en: 'All Routes',        ar: 'كل الطرق',            key: 'All' },
  { en: 'Amman → Aqaba',    ar: 'عمّان ← العقبة',      key: 'Amman → Aqaba' },
  { en: 'Amman → Irbid',    ar: 'عمّان ← إربد',        key: 'Amman → Irbid' },
  { en: 'Amman → Dead Sea', ar: 'عمّان ← البحر الميت', key: 'Amman → Dead Sea' },
  { en: 'Amman → Petra',    ar: 'عمّان ← البتراء',     key: 'Amman → Petra' },
];

export function MosqueDirectory() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';

  const [search, setSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('All');

  const filtered = MOSQUES.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      m.nameEn.toLowerCase().includes(q) ||
      m.nameAr.includes(search) ||
      m.city.toLowerCase().includes(q) ||
      m.cityAr.includes(search);
    const matchRoute = selectedRoute === 'All' || m.route === selectedRoute;
    return matchSearch && matchRoute;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Title row */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg text-foreground leading-tight">
                {ar ? '🕌 دليل المساجد' : '🕌 Mosque Directory'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {ar
                  ? 'مساجد مدروسة على طول مسارات واصل'
                  : 'Vetted prayer stops along Wasel routes'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ar ? 'ابحث عن مسجد أو مدينة…' : 'Search mosque or city…'}
              className="pl-9 h-9 bg-card border-border text-sm rounded-xl"
            />
          </div>

          {/* Route filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ROUTE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedRoute(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedRoute === f.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {ar ? f.ar : f.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        <p className="text-xs text-muted-foreground px-1">
          {ar
            ? `${filtered.length} مسجد على مساراتك`
            : `${filtered.length} mosque${filtered.length !== 1 ? 's' : ''} on your routes`}
        </p>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🕌</div>
            <p className="text-foreground font-semibold text-sm">
              {ar ? 'لا توجد نتائج' : 'No mosques found'}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {ar ? 'جرّب بحثاً مختلفاً' : 'Try a different search'}
            </p>
          </div>
        )}

        {filtered.map((mosque, i) => (
          <motion.div
            key={mosque.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="bg-card border border-border overflow-hidden hover:border-primary/30 transition-all">
              <div className="p-4 space-y-3">
                {/* Name + rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground">
                      {ar ? mosque.nameAr : mosque.nameEn}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {ar ? mosque.cityAr : mosque.city}
                        {' · '}
                        {mosque.distanceFromAmman}{' '}
                        {ar ? 'كم من عمّان' : 'km from Amman'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-400">{mosque.rating}</span>
                  </div>
                </div>

                {/* Route badge */}
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  🛣️ {ar ? mosque.routeAr : mosque.route}
                </Badge>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5">
                  {mosque.amenities.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 border border-border text-muted-foreground"
                    >
                      {AMENITY_META[a].icon} {ar ? AMENITY_META[a].ar : AMENITY_META[a].en}
                    </span>
                  ))}
                </div>

                {/* Prayer time + directions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {ar ? 'مفتوح جميع أوقات الصلاة' : 'Open all prayer times'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs rounded-full border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${mosque.lat},${mosque.lng}`,
                        '_blank',
                      )
                    }
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    {ar ? 'الاتجاهات' : 'Directions'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}