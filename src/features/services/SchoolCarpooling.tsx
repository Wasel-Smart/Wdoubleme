/**
 * SchoolCarpooling — /features/services/SchoolCarpooling.tsx
 * Parents share school runs (recurring Mon-Fri, subscription model)
 * ✅ JOD 30/child/month | ✅ KSA + Jordan | ✅ Verified parents | ✅ Bilingual
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { School, Users, Calendar, Shield, Star, ChevronRight, Clock, MapPin, Check } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { formatCurrency } from '../../utils/currency';

const SCHOOLS_SA = [
  { name: 'Al-Noor International School', nameAr: 'مدرسة النور الدولية', area: 'Riyadh North' },
  { name: 'King Khalid School',             nameAr: 'مدرسة الملك خالد',      area: 'Jeddah' },
  { name: 'Al-Manahil School',              nameAr: 'مدارس المناهل',          area: 'Riyadh East' },
];

const ROUTES_SAMPLE = [
  { id: 'sc1', school: 'Al-Noor International School', schoolAr: 'مدرسة النور الدولية', area: 'Riyadh North', children: 3, seats: 2, morningTime: '06:45', afternoonTime: '14:30', pricePerChild: 30, driverName: 'Khalid Al-Shammari', rating: 4.9, verified: true, country: 'SA' },
  { id: 'sc2', school: 'Irbid Girls School',          schoolAr: 'مدرسة إربد للبنات',    area: 'Irbid',       children: 2, seats: 3, morningTime: '07:00', afternoonTime: '13:30', pricePerChild: 25, driverName: 'Rima Abu-Hassan', rating: 5.0, verified: true, country: 'JO' },
  { id: 'sc3', school: 'King Khalid School',           schoolAr: 'مدرسة الملك خالد',     area: 'Jeddah',      children: 4, seats: 1, morningTime: '06:30', afternoonTime: '14:00', pricePerChild: 28, driverName: 'Sara Al-Qahtani', rating: 4.8, verified: true, country: 'SA' },
];

export function SchoolCarpooling() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';
  const [country, setCountry] = useState<'SA' | 'JO'>('SA');
  const [joined, setJoined] = useState<string[]>([]);

  const filtered = ROUTES_SAMPLE.filter(r => r.country === country);

  const t = {
    title:   ar ? 'مشاركة رحلات المدرسة'         : 'School Carpooling',
    subtitle:ar ? 'اشترك مع أولياء أمور أطفال مدرستك' : 'Share school runs with other parents in your area',
    perMonth:ar ? 'دينار/شهر/طفل'                : 'JOD/month/child',
    morning: ar ? 'الصباح'                        : 'Morning',
    afternoon:ar ? 'بعد ��لظهر'                   : 'Afternoon',
    children:ar ? 'أطفال'                         : 'children',
    seatsLeft:ar ? 'مقاعد متبقية'                 : 'seats left',
    join:    ar ? 'انضم لهذه المجموعة'             : 'Join This Group',
    joined:  ar ? 'تم الانضمام ✅'                : 'Joined ✅',
    create:  ar ? 'أنشئ مجموعة جديدة'             : 'Create New Group',
    verified:ar ? 'أهل متحققون'                   : 'Verified Parents',
    benefit1:ar ? 'وفّر ٦٠٪ مقارنة بالتوصيل المدرسي' : 'Save 60% vs school bus',
    benefit2:ar ? 'سائقون متحققون ومعتمدون'        : 'Verified & trusted drivers',
    benefit3:ar ? 'تتبع مباشر للرحلة'             : 'Live trip tracking',
    benefit4:ar ? 'إشعار عند وصول الطفل'           : 'Arrival notification',
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">🏫</div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg">{t.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
          </div>
          <div className="flex gap-1">
            {(['SA','JO'] as const).map(c => (
              <button key={c} onClick={() => setCountry(c)} className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all border ${country === c ? 'bg-primary/20 border-primary/30 text-primary' : 'border-[#1E293B] text-slate-500'}`}>
                {c === 'SA' ? '🇸🇦' : '🇯🇴'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Benefits */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-[#111B2E] border-blue-500/20 p-4">
          <div className="grid grid-cols-2 gap-2">
            {[t.benefit1, t.benefit2, t.benefit3, t.benefit4].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />{b}
              </div>
            ))}
          </div>
        </Card>

        {/* Pricing */}
        <Card className="bg-card border-border p-4 text-center">
          <p className="text-3xl font-black text-primary mb-1">{formatCurrency(30)}</p>
          <p className="text-xs text-slate-500">{t.perMonth}</p>
          <Badge className="mt-2 bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">{ar ? 'اشتراك شهري' : 'Monthly subscription'}</Badge>
        </Card>

        {/* Active Groups */}
        {filtered.map((group, i) => (
          <motion.div key={group.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="bg-card border-border p-4 hover:border-blue-500/20 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-white text-sm">{ar ? group.schoolAr : group.school}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{group.area}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black text-primary">{formatCurrency(group.pricePerChild)}</p>
                  <p className="text-[10px] text-slate-600">{t.perMonth}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{group.morningTime} / {group.afternoonTime}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{group.seatsLeft} {t.seatsLeft}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{group.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">{t.verified}</span>
                </div>
                <Button
                  onClick={() => setJoined(prev => joined.includes(group.id) ? prev : [...prev, group.id])}
                  size="sm"
                  className={`h-8 px-4 text-xs font-bold rounded-xl ${joined.includes(group.id) ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-primary/15 text-primary hover:bg-primary/25 border-0 shadow-none'}`}
                  variant={joined.includes(group.id) ? 'outline' : 'default'}
                >
                  {joined.includes(group.id) ? t.joined : t.join}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        <Button onClick={() => navigate('/app/post-ride')} variant="outline" className="w-full border-[#1E293B] text-slate-300 hover:bg-white/5 h-12">
          <School className="w-4 h-4 mr-2" />{t.create}
        </Button>
      </div>
    </div>
  );
}