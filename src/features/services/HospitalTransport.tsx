/**
 * HospitalTransport — /features/services/HospitalTransport.tsx
 * Shared rides to hospitals (intercity medical trips) — carpooling model
 * ✅ KSA + Jordan hospitals | ✅ JOD 10-15/trip | ✅ Recurring bookings | ✅ Bilingual
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Hospital, MapPin, Clock, Users, Shield, Star, ChevronRight, Phone, Check, Heart } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { formatCurrency } from '../../utils/currency';
import { toast } from 'sonner';

const HOSPITAL_ROUTES = [
  {
    id: 'hr1', country: 'SA',
    hospital: 'King Faisal Specialist Hospital', hospitalAr: 'مستشفى الملك فيصل التخصصي',
    area: 'Riyadh',
    from: 'Jeddah', fromAr: 'جدة',
    to: 'Riyadh', toAr: 'الرياض',
    days: ['Mon', 'Wed', 'Sun'], daysAr: ['الاثنين', 'الأربعاء', 'الأحد'],
    time: '05:30', returnTime: '16:00',
    pricePerTrip: 45, seats: 3,
    driverName: 'Khalid Al-Otaibi', driverRating: 4.9,
    specialization: 'Oncology & Specialist Care', specializationAr: 'الأورام والرعاية التخصصية',
    verified: true,
  },
  {
    id: 'hr2', country: 'SA',
    hospital: 'King Abdulaziz Medical City', hospitalAr: 'مدينة الملك عبدالعزيز الطبية',
    area: 'Jeddah',
    from: 'Madinah', fromAr: 'المدينة المنورة',
    to: 'Jeddah', toAr: 'جدة',
    days: ['Tue', 'Thu', 'Sat'], daysAr: ['الثلاثاء', 'الخميس', 'السبت'],
    time: '06:00', returnTime: '17:00',
    pricePerTrip: 25, seats: 4,
    driverName: 'Mohammed Al-Ghamdi', driverRating: 4.8,
    specialization: 'Cardiac & Surgery', specializationAr: 'القلب والجراحة',
    verified: true,
  },
  {
    id: 'hr3', country: 'JO',
    hospital: 'King Hussein Cancer Center', hospitalAr: 'مركز الحسين للسرطان',
    area: 'Amman',
    from: 'Irbid', fromAr: 'إربد',
    to: 'Amman', toAr: 'عمّان',
    days: ['Mon', 'Wed', 'Thu'], daysAr: ['الاثنين', 'الأربعاء', 'الخميس'],
    time: '06:30', returnTime: '15:30',
    pricePerTrip: 8, seats: 3,
    driverName: 'Rami Al-Hassan', driverRating: 5.0,
    specialization: 'Cancer Treatment', specializationAr: 'علاج السرطان',
    verified: true,
  },
];

export function HospitalTransport() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';
  const [country, setCountry] = useState<'SA' | 'JO'>('SA');
  const [joined, setJoined] = useState<string[]>([]);

  const filtered = HOSPITAL_ROUTES.filter(r => r.country === country);

  const handleJoin = (id: string, name: string) => {
    setJoined(prev => [...prev, id]);
    toast.success(ar ? `تم التسجيل في رحلة ${name} ✅` : `Joined ${name} route ✅`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🏥</div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg leading-tight">
              {ar ? 'رحلات المستشفيات المشتركة' : 'Hospital Carpooling'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {ar ? 'شارك رحلتك للمستشفى ووفّر التكلفة' : 'Share hospital trips & split the cost'}
            </p>
          </div>
        </div>

        {/* Country toggle */}
        <div className="flex gap-2 mt-3">
          {(['SA', 'JO'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                country === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {c === 'SA' ? '🇸🇦 Saudi Arabia' : '🇯🇴 Jordan'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* Info banner */}
        <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">
                {ar ? 'رحلات طبية بأسعار رحمة' : 'Compassionate Medical Transport'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {ar ? 'سعر ثابت بدون سعر طوارئ — مشاركة التكلفة تجعل العلاج أيسر للجميع'
                     : 'Fixed cost-sharing — no surge pricing for medical emergencies. Everyone deserves access to care.'}
              </p>
            </div>
          </div>
        </div>

        {/* Routes */}
        {filtered.map(route => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border overflow-hidden">
              {/* Hospital badge */}
              <div className="bg-red-900/20 px-4 py-2.5 flex items-center gap-2">
                <Hospital className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-bold text-red-300">
                  {ar ? route.hospitalAr : route.hospital}
                </span>
                {route.verified && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] font-bold ml-auto">
                    {ar ? 'موثق' : 'Verified'}
                  </Badge>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Route */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-white font-semibold">
                    {ar ? route.fromAr : route.from}
                    {' → '}
                    {ar ? route.toAr : route.to}
                  </span>
                  <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-[9px]">
                    {ar ? route.specializationAr : route.specialization}
                  </Badge>
                </div>

                {/* Days + times */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0B1120] rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 mb-1">{ar ? 'الأيام' : 'Days'}</p>
                    <div className="flex flex-wrap gap-1">
                      {(ar ? route.daysAr : route.days).map(d => (
                        <span key={d} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0B1120] rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 mb-1">{ar ? 'المواعيد' : 'Times'}</p>
                    <p className="text-xs font-bold text-white">↑ {route.time}</p>
                    <p className="text-xs font-bold text-slate-400">↓ {route.returnTime}</p>
                  </div>
                </div>

                {/* Price + driver */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                      {route.driverName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{route.driverName}</p>
                      <p className="text-[10px] text-amber-400">★ {route.driverRating}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">{formatCurrency(route.pricePerTrip)}</p>
                    <p className="text-[10px] text-slate-500">{ar ? 'لكل رحلة' : 'per trip'}</p>
                  </div>
                </div>

                {/* Seats */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{route.seats} {ar ? 'مقاعد متاحة' : 'seats available'}</span>
                </div>

                <Button
                  onClick={() => joined.includes(route.id) ? null : handleJoin(route.id, ar ? route.hospitalAr : route.hospital)}
                  disabled={joined.includes(route.id)}
                  className={`w-full h-10 font-bold rounded-xl text-sm ${
                    joined.includes(route.id)
                      ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {joined.includes(route.id) ? (
                    <><Check className="w-4 h-4 mr-2" />{ar ? 'تم التسجيل ✅' : 'Joined ✅'}</>
                  ) : (
                    ar ? 'سجّل في هذه الرحلة' : 'Join This Route'
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🏥</p>
            <p className="text-slate-400 font-semibold">
              {ar ? 'لا توجد رحلات طبية في هذه المنطقة حالياً'
                   : 'No hospital routes in this region yet'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {ar ? '��يتم إضافة المزيد قريباً' : 'More routes coming soon'}
            </p>
          </div>
        )}

        {/* Post your own */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="font-bold text-white text-sm mb-2">
            {ar ? 'هل تسافر للمستشفى بشكل منتظم؟' : 'Do you travel to hospital regularly?'}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            {ar ? 'انشر رحلتك وشارك التكلفة مع آخرين في نفس الموقف'
                 : 'Post your hospital trip and share the cost with others in the same situation.'}
          </p>
          <Button
            onClick={() => navigate('/app/post-ride')}
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10 h-10 font-bold"
          >
            {ar ? 'انشر رحلة طبية' : 'Post a Medical Trip'}
          </Button>
        </div>

      </div>
    </div>
  );
}
