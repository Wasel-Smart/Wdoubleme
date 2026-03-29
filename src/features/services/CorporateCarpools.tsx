/**
 * CorporateCarpools — /features/services/CorporateCarpools.tsx
 * B2B employee carpools for long commutes
 * ✅ JOD 50/employee/month | ✅ 20% commission | ✅ KSA + Jordan | ✅ Bilingual
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Building2, Users, MapPin, ChevronRight, Check, Star, Clock, TrendingDown } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { formatCurrency } from '../../utils/currency';
import { toast } from 'sonner';

const CORPORATE_ROUTES = [
  {
    id: 'cr1', country: 'SA',
    company: 'Saudi Aramco', companyAr: 'أرامكو السعودية',
    from: 'Dammam', fromAr: 'الدمام',
    to: 'Dhahran', toAr: 'الظهران',
    distance: 30, duration: '35min',
    employees: 24, seatsLeft: 3,
    pricePerMonth: 200, pricePerRide: 10,
    schedule: 'Mon–Thu 07:00 / 16:00', scheduleAr: 'الإثنين–الخميس ٠٧:٠٠ / ١٦:٠٠',
    driverName: 'Fahad Al-Rashidi', rating: 4.9,
    savings: 65,
  },
  {
    id: 'cr2', country: 'SA',
    company: 'SABIC HQ', companyAr: 'سابك',
    from: 'Riyadh North', fromAr: 'شمال الرياض',
    to: 'King Abdullah Financial District', toAr: 'المركز المالي',
    distance: 25, duration: '40min',
    employees: 18, seatsLeft: 2,
    pricePerMonth: 150, pricePerRide: 8,
    schedule: 'Sun–Thu 07:30 / 17:00', scheduleAr: 'الأحد–الخميس ٠٧:٣٠ / ٠٧:٣٠',
    driverName: 'Nasser Al-Shammari', rating: 4.8,
    savings: 60,
  },
  {
    id: 'cr3', country: 'JO',
    company: 'Zain Jordan HQ', companyAr: 'زين الأردن',
    from: 'Zarqa', fromAr: 'الزرقاء',
    to: 'Amman Business District', toAr: 'منطقة أعمال عمّان',
    distance: 35, duration: '45min',
    employees: 12, seatsLeft: 4,
    pricePerMonth: 50, pricePerRide: 3,
    schedule: 'Sun–Thu 07:00 / 17:00', scheduleAr: 'الأحد–الخميس ٠٧:٠٠ / ٠٧:٠٠',
    driverName: 'Omar Al-Khatib', rating: 5.0,
    savings: 70,
  },
];

export function CorporateCarpools() {
  const { language } = useLanguage();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';
  const [country, setCountry] = useState<'SA' | 'JO'>('SA');
  const [joined, setJoined] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState('');

  const filtered = CORPORATE_ROUTES.filter(r =>
    r.country === country &&
    (companySearch === '' || r.company.toLowerCase().includes(companySearch.toLowerCase()) ||
     r.companyAr.includes(companySearch))
  );

  const handleJoin = (id: string, company: string) => {
    setJoined(prev => [...prev, id]);
    toast.success(ar ? `تم التسجيل في كاربول ${company} ✅` : `Joined ${company} carpool ✅`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">🏢</div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg leading-tight">
              {ar ? 'كاربول الشركات' : 'Corporate Carpools'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {ar ? 'شارك رحلة الموظفين ووفّر ٦٠٪' : 'Share employee commutes — save 60%'}
            </p>
          </div>
          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 text-[10px] font-bold">B2B</Badge>
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

        {/* Search */}
        <div className="mt-3">
          <Input
            value={companySearch}
            onChange={e => setCompanySearch(e.target.value)}
            placeholder={ar ? 'ابحث عن شركتك...' : 'Search your company...'}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '60%', labelEn: 'Cost Saved', labelAr: 'توفير التكلفة' },
            { value: '20%', labelEn: 'Commission', labelAr: 'عمولة المنصة' },
            { value: '0',   labelEn: 'Setup Cost', labelAr: 'تكلفة الإعداد' },
          ].map(s => (
            <div key={s.labelEn} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-black text-primary">{s.value}</p>
              <p className="text-[10px] text-slate-500">{ar ? s.labelAr : s.labelEn}</p>
            </div>
          ))}
        </div>

        {/* Routes */}
        {filtered.map(route => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border overflow-hidden">
              {/* Company header */}
              <div className="bg-blue-900/20 px-4 py-2.5 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">
                  {ar ? route.companyAr : route.company}
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] font-bold ml-auto">
                  {ar ? `وفّر ${route.savings}٪` : `Save ${route.savings}%`}
                </Badge>
              </div>

              <div className="p-4 space-y-3">
                {/* Route */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-white font-semibold">
                    {ar ? route.fromAr : route.from} → {ar ? route.toAr : route.to}
                  </span>
                  <span className="text-xs text-slate-500">{route.distance} km</span>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ar ? route.scheduleAr : route.schedule}</span>
                </div>

                {/* Employees + price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{route.employees} {ar ? 'موظف' : 'employees'}</span>
                    <span className="text-emerald-400">· {route.seatsLeft} {ar ? 'متبقي' : 'seats left'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{formatCurrency(route.pricePerMonth)}</p>
                    <p className="text-[10px] text-slate-500">{ar ? 'شهرياً/موظف' : '/mo per employee'}</p>
                  </div>
                </div>

                {/* Driver */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                    {route.driverName.charAt(0)}
                  </div>
                  <span className="text-xs text-slate-400">{route.driverName}</span>
                  <span className="text-xs text-amber-400">★ {route.rating}</span>
                </div>

                <Button
                  onClick={() => joined.includes(route.id) ? null : handleJoin(route.id, ar ? route.companyAr : route.company)}
                  disabled={joined.includes(route.id)}
                  className={`w-full h-10 font-bold rounded-xl text-sm ${
                    joined.includes(route.id)
                      ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {joined.includes(route.id) ? (
                    <><Check className="w-4 h-4 mr-2" />{ar ? 'تم الانضمام ✅' : 'Joined ✅'}</>
                  ) : (
                    ar ? 'انضم لكاربول الشركة' : 'Join Company Carpool'
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🏢</p>
            <p className="text-slate-400 font-semibold">
              {ar ? 'لم نجد كاربول لشركتك بعد' : 'No carpool found for your company yet'}
            </p>
          </div>
        )}

        {/* Set up corporate account */}
        <Card className="bg-card border-border p-4">
          <h3 className="font-bold text-white text-sm mb-2">
            {ar ? 'هل تريد إعداد كاربول لشركتك؟' : 'Set up carpools for your company?'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {ar
              ? 'تواصل معنا لعقد B2B — ٥٠ دينار/موظف/شهر + ٢٠٪ عمولة. لا تكاليف إعداد.'
              : 'Contact us for a B2B contract — JOD 50/employee/month + 20% commission. Zero setup cost.'}
          </p>
          <Button
            onClick={() => navigate('/app/business')}
            variant="outline"
            className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-10 font-bold"
          >
            {ar ? 'تواصل مع فريق المبيعات' : 'Contact Sales Team'}
          </Button>
        </Card>

      </div>
    </div>
  );
}
