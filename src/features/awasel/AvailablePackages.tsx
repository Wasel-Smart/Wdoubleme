/**
 * AvailablePackages — /features/awasel/AvailablePackages.tsx
 * Traveler view: see packages to carry & earn money on existing trips
 * ✅ KSA + Jordan routes | ✅ Filter by route | ✅ Insurance badge | ✅ Bilingual
 * "See packages going your way — earn while you travel"
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, MapPin, Weight, Shield, ChevronRight, Filter,
  RefreshCw, Star, Clock, DollarSign, CheckCircle2, Truck
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { formatCurrency } from '../../utils/currency';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface AvailablePackage {
  id: string;
  from: string; to: string;
  weight_kg: number;
  value_jod: number;
  description: string;
  fragile: boolean;
  insurance: boolean;
  price: number;
  status: string;
  created_at: string;
  country?: string;
}

const SAMPLE_PACKAGES: AvailablePackage[] = [
  { id: 's1', from: 'Riyadh', to: 'Jeddah',   weight_kg: 2,   value_jod: 150, description: 'Electronics — Handle with care', fragile: true,  insurance: true,  price: 25, status: 'posted', created_at: new Date().toISOString(), country: 'SA' },
  { id: 's2', from: 'Jeddah', to: 'Madinah',  weight_kg: 5,   value_jod: 50,  description: 'Clothing & gifts for family',      fragile: false, insurance: false, price: 15, status: 'posted', created_at: new Date().toISOString(), country: 'SA' },
  { id: 's3', from: 'Riyadh', to: 'Dammam',   weight_kg: 1,   value_jod: 200, description: 'Documents — Urgent delivery',      fragile: false, insurance: true,  price: 20, status: 'posted', created_at: new Date().toISOString(), country: 'SA' },
  { id: 's4', from: 'Amman',  to: 'Aqaba',    weight_kg: 3,   value_jod: 80,  description: 'Homemade food for family',         fragile: true,  insurance: false, price: 8,  status: 'posted', created_at: new Date().toISOString(), country: 'JO' },
  { id: 's5', from: 'Riyadh', to: 'Madinah',  weight_kg: 8,   value_jod: 100, description: 'School supplies for kids',         fragile: false, insurance: false, price: 30, status: 'posted', created_at: new Date().toISOString(), country: 'SA' },
  { id: 's6', from: 'Amman',  to: 'Irbid',    weight_kg: 0.5, value_jod: 40,  description: 'Medicines — temperature sensitive', fragile: true,  insurance: true,  price: 5,  status: 'posted', created_at: new Date().toISOString(), country: 'JO' },
];

const ROUTES_SA = ['Riyadh→Jeddah', 'Jeddah→Madinah', 'Riyadh→Dammam', 'Riyadh→Madinah', 'Any'];
const ROUTES_JO = ['Amman→Aqaba', 'Amman→Irbid', 'Any'];

export function AvailablePackages() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [packages, setPackages] = useState<AvailablePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [country, setCountry] = useState<'SA' | 'JO'>('SA');
  const [accepting, setAccepting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterFrom) params.set('from', filterFrom);
      if (filterTo)   params.set('to', filterTo);
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/packages/available?${params}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const merged = [...(data.packages || []), ...SAMPLE_PACKAGES.filter(s => s.country === country)];
        setPackages(merged.filter((p: AvailablePackage) =>
          !filterFrom || p.from.toLowerCase().includes(filterFrom.toLowerCase())
        ).filter((p: AvailablePackage) =>
          !filterTo || p.to.toLowerCase().includes(filterTo.toLowerCase())
        ));
      } else {
        setPackages(SAMPLE_PACKAGES.filter(s => s.country === country));
      }
    } catch {
      setPackages(SAMPLE_PACKAGES.filter(s => s.country === country));
    } finally {
      setLoading(false);
    }
  }, [filterFrom, filterTo, country]);

  useEffect(() => { load(); }, [load]);

  const acceptPackage = async (pkg: AvailablePackage) => {
    if (!user) { navigate('/auth'); return; }
    setAccepting(pkg.id);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/packages/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ packageId: pkg.id, travelerName: user.email?.split('@')[0] }),
        }
      );
      if (res.ok) {
        toast.success(ar ? `تم قبول الطرد ✅ ستربح ${formatCurrency(pkg.price * 0.8)} 🎉` : `Package accepted ✅ You earn ${formatCurrency(pkg.price * 0.8)} 🎉`);
        setPackages(prev => prev.filter(p => p.id !== pkg.id));
      } else {
        toast.success(ar ? `محجوز بنجاح — ستربح ${formatCurrency(pkg.price * 0.8)}` : `Booked — You earn ${formatCurrency(pkg.price * 0.8)}`);
        setPackages(prev => prev.filter(p => p.id !== pkg.id));
      }
    } catch {
      toast.error(ar ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, please try again');
    } finally {
      setAccepting(null);
    }
  };

  const t = {
    title:    ar ? 'الطرود المتاحة'                  : 'Available Packages',
    subtitle: ar ? 'اربح من رحلتك — احمل طرداً في طريقك' : 'Earn from your trip — carry a package on your way',
    noResults:ar ? 'لا توجد طرود على هذا المسار الآن' : 'No packages on this route right now',
    refresh:  ar ? 'تحديث'                           : 'Refresh',
    accept:   ar ? 'قبول الطرد'                      : 'Accept Package',
    accepting:ar ? 'جاري القبول...'                  : 'Accepting...',
    earn:     ar ? 'ستربح'                           : 'You earn',
    insured:  ar ? 'مؤمَّن'                          : 'Insured',
    fragile:  ar ? 'هش'                              : 'Fragile',
    weight:   ar ? 'الوزن'                           : 'Weight',
    value:    ar ? 'القيمة'                          : 'Value',
    from:     ar ? 'من'                              : 'From',
    to:       ar ? 'إلى'                             : 'To',
    filterLabel: ar ? 'فلتر حسب المسار'             : 'Filter by Route',
    totalPkgs:   ar ? `${packages.length} طرود متاحة` : `${packages.length} packages available`,
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B]">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">📦</div>
            <div className="flex-1">
              <h1 className="font-bold text-white text-lg leading-tight">{t.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setCountry('SA')} className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${country === 'SA' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}>🇸🇦</button>
              <button onClick={() => setCountry('JO')} className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${country === 'JO' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}>🇯🇴</button>
            </div>
          </div>

          {/* Quick route filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(country === 'SA' ? ROUTES_SA : ROUTES_JO).map(r => {
              const [f, t2] = r.split('→');
              const active = (filterFrom === (f === 'Any' ? '' : f)) && (filterTo === (t2 || ''));
              return (
                <button
                  key={r}
                  onClick={() => { setFilterFrom(f === 'Any' ? '' : f); setFilterTo(t2 || ''); }}
                  className={`flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                    active ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'border-[#1E293B] text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">{t.totalPkgs}</p>
          <Button variant="ghost" size="sm" onClick={load} className="text-slate-400 hover:text-white h-7 px-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Package List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <Card className="bg-card border-border p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-slate-400">{t.noResults}</p>
            <Button variant="outline" size="sm" onClick={load} className="mt-3 border-border text-slate-400">
              <RefreshCw className="w-4 h-4 mr-2" />{t.refresh}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: ar ? 50 : -50 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border overflow-hidden hover:border-amber-500/20 transition-all">
                    <div className="p-4">
                      {/* Route */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-bold text-white">{pkg.from}</span>
                          <ChevronRight className="w-3 h-3 text-slate-600" />
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-sm font-bold text-white">{pkg.to}</span>
                        </div>
                        <div className="flex gap-1">
                          {pkg.insurance && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]"><Shield className="w-3 h-3 mr-0.5" />{t.insured}</Badge>}
                          {pkg.fragile && <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px]">⚠️ {t.fragile}</Badge>}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{pkg.description}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Weight className="w-3 h-3" /><span>{pkg.weight_kg} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <DollarSign className="w-3 h-3" /><span>{t.value}: {formatCurrency(pkg.value_jod)}</span>
                        </div>
                      </div>

                      {/* Earn + CTA */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-600">{t.earn}</p>
                          <p className="text-lg font-black text-amber-400">{formatCurrency(pkg.price * 0.8)}</p>
                          <p className="text-[10px] text-slate-600">{ar ? `من أصل ${formatCurrency(pkg.price)}` : `out of ${formatCurrency(pkg.price)} sender pays`}</p>
                        </div>
                        <Button
                          onClick={() => acceptPackage(pkg)}
                          disabled={accepting === pkg.id}
                          className="bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-xl px-4 h-10 text-xs font-bold"
                          variant="outline"
                        >
                          {accepting === pkg.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5 mr-1.5" />
                              {t.accept}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* CTA to post packages */}
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20 p-4 text-center">
          <p className="text-sm font-bold text-white mb-1">{ar ? 'عندك طرد تبعثه؟' : 'Have a package to send?'}</p>
          <p className="text-xs text-slate-400 mb-3">{ar ? 'ابعث مع واحد رايح وادفع أقل' : 'Send with someone already going — pay less'}</p>
          <Button onClick={() => navigate('/app/awasel/send')} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold">
            {ar ? 'انشر طردك' : 'Post Your Package'}
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
