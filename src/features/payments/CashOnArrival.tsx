/**
 * CashOnArrival — /features/payments/CashOnArrival.tsx
 * Cash payment options for the 40% unbanked Jordan users
 * ✅ COA | ✅ Cash on Pickup | ✅ Backend trust score | ✅ Bilingual | ✅ Token-compliant
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banknote, Shield, Check, Info, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { formatCurrency } from '../../utils/currency';
import { walletApi } from '../../services/walletApi';
import { toast } from 'sonner';

type PayOption = 'cash_on_arrival' | 'cash_on_pickup' | 'online_discount';

interface TrustInfo {
  totalTrips: number;
  cashRating: number;
  onTimePayments: number;
  deposit: number;
}

export function CashOnArrival() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useIframeSafeNavigate();
  const ar = language === 'ar';

  const [selected, setSelected] = useState<PayOption>('cash_on_arrival');
  const [coaEnabled, setCoaEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [trustInfo, setTrustInfo] = useState<TrustInfo>({ totalTrips: 0, cashRating: 0, onTimePayments: 0, deposit: 0 });
  const [loadingTrust, setLoadingTrust] = useState(true);

  // Fetch trust score from backend
  useEffect(() => {
    if (!user?.id) { setLoadingTrust(false); return; }
    (async () => {
      try {
        const data = await walletApi.getTrustScore(user.id);
        setTrustInfo(data);
      } catch (err) {
        console.error('[CashOnArrival] trust score fetch failed:', err);
      } finally {
        setLoadingTrust(false);
      }
    })();
  }, [user?.id]);

  const save = () => {
    localStorage.setItem('wasel_payment_pref', selected);
    setSaved(true);
    toast.success(ar ? 'تم حفظ طريقة الدفع ✅' : 'Payment preference saved ✅');
    setTimeout(() => setSaved(false), 3000);
  };

  const t = {
    title:    ar ? 'طرق الدفع النقدية'                : 'Cash Payment Options',
    subtitle: ar ? 'ادفع بالكاش — بدون بطاقة بنكية'  : 'Pay with cash — no bank card required',
    badge:    ar ? '٤٠٪ من المستخدمين يفضلون النقد'   : '40% of users prefer cash',
    coa:      ar ? 'نقداً عند الوصول'                 : 'Cash on Arrival',
    coaDesc:  ar ? 'ادفع للسائق عند وصولك للوجهة'     : 'Pay the driver when you reach your destination',
    cop:      ar ? 'نقداً عند الركوب'                  : 'Cash on Pickup',
    copDesc:  ar ? 'ادفع للسائق قبل بدء الرحلة'       : 'Pay the driver before the trip starts',
    online:   ar ? 'دفع إلكتروني (خصم 5%)'            : 'Pay Online (5% discount)',
    onlineDesc:ar ? 'ادفع بالبطاقة أو Apple Pay ووفّر 5%' : 'Pay by card or Apple Pay and save 5%',
    trust:    ar ? 'نقاط الثقة النقدية'               : 'Cash Trust Score',
    trustDesc:ar ? 'كلما دفعت في الوقت سجّلت نقاطاً أعلى' : 'On-time payments build your cash trust score',
    trips:    ar ? 'رحلات بالنقد'                     : 'Cash Trips',
    onTime:   ar ? 'دفعات في الوقت'                   : 'On-time Payments',
    deposit:  ar ? 'وديعة مطلوبة'                     : 'Required Deposit',
    howCOA:   ar ? 'كيف تعمل "نقداً عند الوصول"؟'    : 'How does Cash on Arrival work?',
    step1:    ar ? 'احجز رحلتك'                       : 'Book your ride',
    step2:    ar ? 'ركب مع السائق'                    : 'Board with driver',
    step3:    ar ? 'ادفع عند الوصول'                  : 'Pay upon arrival',
    step4:    ar ? 'السائق يؤكد الاستلام'             : 'Driver confirms payment',
    coaToggle:ar ? 'أتيح للسائقين قبول COA'           : 'Allow drivers to accept COA',
    save:     ar ? 'حفظ التفضيل'                      : 'Save Preference',
    saved:    ar ? '✅ تم الحفظ'                     : '✅ Saved',
    example:  ar ? 'مثال للرحلة'                      : 'Example Trip',
    exRoute:  ar ? 'عمّان → العقبة · ١٠ دنانير'      : 'Amman → Aqaba · JOD 10',
    exCOA:    ar ? 'ادفع ١٠ دنانير للسائق عند الوصول للعقبة' : 'Pay JOD 10 to driver upon arriving Aqaba',
  };

  const options: { value: PayOption; label: string; desc: string; emoji: string; recommended?: boolean }[] = [
    { value: 'cash_on_arrival', label: t.coa, desc: t.coaDesc, emoji: '💵', recommended: true },
    { value: 'cash_on_pickup',  label: t.cop, desc: t.copDesc, emoji: '🤝' },
    { value: 'online_discount', label: t.online, desc: t.onlineDesc, emoji: '💳' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur border-b border-border px-4 py-4" style={{ background: 'var(--background, #0B1120)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">💵</div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">{t.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
          </div>
          <Badge className="ml-auto bg-amber-500/15 text-amber-300 border-amber-500/20 text-[10px] flex-shrink-0">{t.badge}</Badge>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Options */}
        <div className="space-y-3">
          {options.map(opt => (
            <motion.button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              whileTap={{ scale: 0.99 }}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border transition-all text-left ${
                selected === opt.value
                  ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                  : 'bg-card border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${selected === opt.value ? 'bg-primary/15' : 'bg-background'}`}>
                {opt.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold text-sm ${selected === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</span>
                  {opt.recommended && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">{ar ? 'مُوصى به' : 'Recommended'}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
              {selected === opt.value && <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
            </motion.button>
          ))}
        </div>

        {/* COA How it works */}
        <AnimatePresence>
          {selected === 'cash_on_arrival' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-4">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">{t.howCOA}</p>
                <div className="space-y-3">
                  {[
                    { step: 1, label: t.step1, emoji: '🔍' },
                    { step: 2, label: t.step2, emoji: '🚗' },
                    { step: 3, label: t.step3, emoji: '💵' },
                    { step: 4, label: t.step4, emoji: '✅' },
                  ].map(s => (
                    <div key={s.step} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">{s.step}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Example */}
                <div className="mt-3 bg-primary/5 border border-primary/10 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1">{t.example}</p>
                  <p className="text-xs text-foreground">{t.exRoute}</p>
                  <p className="text-[11px] text-primary/80 mt-0.5">{t.exCOA}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Score — from backend */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t.trust}</p>
          </div>
          {loadingTrust ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-primary">{trustInfo.totalTrips}</p>
                  <p className="text-[10px] text-muted-foreground">{t.trips}</p>
                </div>
                <div className="bg-background rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-emerald-400">{trustInfo.onTimePayments}</p>
                  <p className="text-[10px] text-muted-foreground">{t.onTime}</p>
                </div>
                <div className="bg-background rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-amber-400">{trustInfo.deposit === 0 ? '0' : formatCurrency(trustInfo.deposit)}</p>
                  <p className="text-[10px] text-muted-foreground">{t.deposit}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full ${i < Math.floor(trustInfo.cashRating) ? 'bg-amber-400' : 'bg-border'}`} />
                ))}
                <span className="text-xs font-bold text-amber-400 ml-1">{trustInfo.cashRating} ★</span>
              </div>
            </>
          )}
          <p className="text-[10px] text-muted-foreground mt-1.5">{t.trustDesc}</p>
        </Card>

        {/* Driver COA Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.coaToggle}</p>
                <p className="text-xs text-muted-foreground">{ar ? 'إعداد للسائقين — قبول الدفع عند الوصول' : 'Driver setting — accept payment upon arrival'}</p>
              </div>
            </div>
            <Switch checked={coaEnabled} onCheckedChange={setCoaEnabled} />
          </div>
        </Card>

        {/* Save */}
        <Button onClick={save} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
          {saved ? (
            <span className="flex items-center gap-2"><Check className="w-4 h-4" />{t.saved}</span>
          ) : t.save}
        </Button>
      </div>
    </div>
  );
}
