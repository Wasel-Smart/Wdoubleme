/**
 * SendPackage — Awasel | أوصل v6.0  (✅ Migrated to /features/awasel/)
 * Send a package with a traveler already going there
 * "ابعث مع واحد رايح"
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Package, MapPin, Calendar, Shield, ChevronRight, ChevronLeft,
  CheckCircle2, QrCode, Weight, Loader2, Info,
} from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { useCountry } from '../../contexts/CountryContext';
import { getRegion } from '../../utils/regionConfig';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcPrice(weight: number, distance = 330): number {
  let p = 3 + Math.max(0, weight - 1) * 0.5;
  if (distance > 100) p += (distance - 100) * 0.01;
  return Math.max(3, Math.ceil(p));
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// NOTE: ROUTES is now built dynamically from regionConfig inside the component.
// This fallback is used only if CountryContext is unavailable.
const FALLBACK_ROUTES = [
  { from: 'Amman', fromAr: 'عمّان', to: 'Aqaba',    toAr: 'العقبة',      dist: 330, avg: 5, icon: '🏖️' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Irbid',    toAr: 'إربد',        dist: 85,  avg: 3, icon: '🎓' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت', dist: 60,  avg: 3, icon: '🌊' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Zarqa',    toAr: 'الزرقا',      dist: 30,  avg: 2, icon: '🏙️' },
];

const ROUTE_ICONS_SP: Record<string, string> = {
  aqaba: '🏖️', irbid: '🎓', 'dead sea': '🌊', zarqa: '🏙️',
  petra: '🏛️', 'wadi rum': '⛺', alexandria: '🏙️', 'sharm el-sheikh': '🏖️',
  hurghada: '🏖️', riyadh: '🏙️', jeddah: '🕌', dubai: '🏙️',
};
function getPackageRouteIcon(to: string): string {
  return ROUTE_ICONS_SP[to.toLowerCase()] ?? '📦';
}

const STEPS = [
  { num: 1, en: 'Route',     ar: 'المسار'  },
  { num: 2, en: 'Package',   ar: 'الطرد'   },
  { num: 3, en: 'Recipient', ar: 'المستلم' },
  { num: 4, en: 'Review',    ar: 'مراجعة'  },
];

// ─── Bronze accent tokens ─────────────────────────────────────────────────────

const BRONZE = '#D9965B';
const BRONZE_BG = 'rgba(217,150,91,0.1)';
const BRONZE_BORDER = 'rgba(217,150,91,0.22)';
const BRONZE_STRONG = 'rgba(217,150,91,0.35)';

// ─── Helper components ────────────────────────────────────────────────────────

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5" style={{
      background: 'var(--wasel-surface-2)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 'var(--wasel-radius-xl)',
    }}>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, children, hint }: { label: string; icon?: any; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5"
        style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)', fontWeight: 600 }}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {children}
      {hint && <p style={{ color: 'rgba(71,85,105,1)', fontSize: '0.63rem' }}>{hint}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface FormData {
  from: string; to: string; pickupDate: string; deliveryDate: string;
  weight: number; value: number; description: string;
  fragile: boolean; insurance: boolean;
  recipientName: string; recipientPhone: string; senderPhone: string;
}

export function SendPackage() {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isRTL = language === 'ar';

  // ── Country-aware package routes from regionConfig ───────────────────────
  const { currentCountry } = useCountry();
  const region = getRegion(currentCountry?.iso_alpha2 || 'JO');
  // Only show routes where package delivery is enabled
  const ROUTES = region.routes
    .filter(r => r.packageEnabled)
    .slice(0, 6)
    .map(r => ({
      from: r.from, fromAr: r.fromAr,
      to: r.to, toAr: r.toAr,
      dist: r.distanceKm,
      avg: Math.max(2, Math.ceil(calcPrice(1, r.distanceKm))),
      icon: getPackageRouteIcon(r.to),
    }));

  const [step, setStep]         = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selRoute, setSelRoute] = useState<typeof ROUTES[0] | null>(null);
  const [form, setForm] = useState<FormData>({
    from: '', to: '', pickupDate: '', deliveryDate: '',
    weight: 1, value: 0, description: '',
    fragile: false, insurance: false,
    recipientName: '', recipientPhone: '', senderPhone: '',
  });

  const up = (patch: Partial<FormData>) => setForm(f => ({ ...f, ...patch }));

  const basePrice   = form.weight > 0 ? calcPrice(form.weight, selRoute?.dist) : 0;
  const insuranceFee = form.insurance ? 0.5 : 0;
  const totalPrice  = basePrice + insuranceFee;
  const travelerEarns = +(basePrice * 0.8).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = session?.access_token || publicAnonKey;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/packages`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, price: totalPrice }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isRTL
        ? `✅ تم نشر طردتك! كود التتبع: ${data.package?.tracking_code}`
        : `✅ Package posted! Tracking: ${data.package?.tracking_code}`);
      navigate('/app/awasel/track');
    } catch {
      toast.error(isRTL ? 'فشل نشر الطرد — حاول مرة ثانية' : 'Failed to post package — try again');
    } finally { setSubmitting(false); }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--wasel-surface-0)' }} dir={dir}>
      <div className="max-w-2xl mx-auto">

        {/* ── Brand header ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${BRONZE_BG}, rgba(217,150,91,0.05))`,
                border: `1px solid ${BRONZE_BORDER}`,
                boxShadow: 'var(--wasel-shadow-bronze)',
              }}
            >
              <Package className="w-6 h-6" style={{ color: BRONZE }} />
            </div>
            <div>
              <h1 className="type-h1 text-gradient-bronze" style={{ fontWeight: 900 }}>
                {isRTL ? 'أوصل | Awasel' : 'Awasel | أوصل'}
              </h1>
              <p style={{ color: BRONZE, fontSize: 'var(--wasel-text-caption)', fontWeight: 600, marginTop: 2 }}>
                {isRTL ? '"ابعث مع واحد رايح"' : '"Send with Someone Already Going"'}
              </p>
            </div>
          </div>
          <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-body)' }}>
            {isRTL
              ? 'بدل ما تدفع شركة توصيل، ابعث طردك مع مسافر رايح نفس الوجهة. أرخص، أسرع، وموثوق'
              : "Instead of pricey couriers, send your package with a traveler already heading there. Cheaper, faster, trusted"}
          </p>
        </motion.div>

        {/* ── How it works ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="mb-7 p-4 rounded-2xl"
          style={{ background: BRONZE_BG, border: `1px solid ${BRONZE_BORDER}` }}>
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Connector line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px"
              style={{ background: `linear-gradient(90deg, ${BRONZE_BORDER}, ${BRONZE}, ${BRONZE_BORDER})` }} />
            {[
              { icon: '📦', en: 'Post package',      ar: 'انشر طردك'    },
              { icon: '🤝', en: 'Traveler accepts',  ar: 'مسافر يقبل'   },
              { icon: '📱', en: 'QR handoff',        ar: 'تسليم بـQR'   },
              { icon: '✅', en: 'Delivered!',         ar: 'وصل!'         },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 relative z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${BRONZE_BORDER}` }}>
                  {s.icon}
                </div>
                <p style={{ fontSize: '0.62rem', color: `rgba(240,201,154,0.75)`, textAlign: 'center', fontWeight: 500 }}>
                  {isRTL ? s.ar : s.en}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Step progress ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          {/* Bronze progress bar */}
          <div className="step-progress-track mb-4" style={{ background: 'rgba(30,41,59,0.8)' }}>
            <div className="step-progress-fill" style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, #9A6030, ${BRONZE}, #F0C99A)`,
              boxShadow: `0 0 8px rgba(217,150,91,0.5)`,
            }} />
          </div>
          <div className="flex items-center justify-between">
            {STEPS.map(s => {
              const done = step > s.num; const active = step === s.num;
              return (
                <button key={s.num} onClick={() => done && setStep(s.num)}
                  className="flex flex-col items-center gap-1" style={{ cursor: done ? 'pointer' : 'default' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all"
                    style={{
                      background: done ? `linear-gradient(135deg, #9A6030, ${BRONZE})` : active ? BRONZE_BG : 'rgba(30,41,59,0.8)',
                      border: active ? `1.5px solid ${BRONZE}` : '1.5px solid rgba(255,255,255,0.07)',
                      color: done ? '#fff' : active ? BRONZE : 'rgba(71,85,105,1)',
                      fontWeight: 700,
                    }}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500, color: active ? BRONZE : 'rgba(51,65,85,1)', whiteSpace: 'nowrap' }}>
                    {isRTL ? s.ar : s.en}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Steps ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">

            {/* STEP 1 — Route */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    🗺️ {isRTL ? 'من وين لوين؟' : 'From where to where?'}
                  </h3>
                  {/* Quick routes */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {ROUTES.map((r, idx) => (
                      <motion.button key={`${r.from}-${r.to}-${idx}`} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                        onClick={() => { setSelRoute(r); up({ from: isRTL ? r.fromAr : r.from, to: isRTL ? r.toAr : r.to }); }}
                        className="flex items-center justify-between p-3 rounded-xl transition-all"
                        style={{
                          background: selRoute?.to === r.to ? BRONZE_BG : 'rgba(15,23,42,0.5)',
                          border: `1px solid ${selRoute?.to === r.to ? BRONZE_BORDER : 'rgba(255,255,255,0.05)'}`,
                          boxShadow: selRoute?.to === r.to ? 'var(--wasel-shadow-bronze)' : 'none',
                        }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '1rem' }}>{r.icon}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: selRoute?.to === r.to ? BRONZE : 'rgba(100,116,139,1)' }}>
                            {isRTL ? `${r.fromAr} → ${r.toAr}` : `${r.from} → ${r.to}`}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: BRONZE }}>~{r.avg} {isRTL ? 'د.أ' : 'JOD'}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Field label={isRTL ? 'من' : 'From'} icon={MapPin}>
                      <input className="input-premium" style={{ borderColor: 'rgba(217,150,91,0.2)' }}
                        value={form.from} onChange={e => up({ from: e.target.value })}
                        placeholder={isRTL ? 'عمّان' : 'Amman'} required />
                    </Field>
                    <Field label={isRTL ? 'إلى' : 'To'} icon={MapPin}>
                      <input className="input-premium" style={{ borderColor: 'rgba(217,150,91,0.2)' }}
                        value={form.to} onChange={e => up({ to: e.target.value })}
                        placeholder={isRTL ? 'العقبة' : 'Aqaba'} required />
                    </Field>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label={isRTL ? 'يوم الاستلام' : 'Pickup date'} icon={Calendar}>
                        <input type="date" className="input-premium" style={{ colorScheme: 'dark' }}
                          value={form.pickupDate} min={new Date().toISOString().split('T')[0]}
                          onChange={e => up({ pickupDate: e.target.value })} required />
                      </Field>
                      <Field label={isRTL ? 'يوم التسليم' : 'Delivery date'} icon={Calendar}>
                        <input type="date" className="input-premium" style={{ colorScheme: 'dark' }}
                          value={form.deliveryDate} min={form.pickupDate || new Date().toISOString().split('T')[0]}
                          onChange={e => up({ deliveryDate: e.target.value })} />
                      </Field>
                    </div>
                  </div>
                </StepCard>

                <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                  disabled={!form.from || !form.to || !form.pickupDate}
                  className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, #9A6030, ${BRONZE})`,
                    color: '#fff', fontWeight: 700, fontSize: 'var(--wasel-text-body)',
                    boxShadow: 'var(--wasel-shadow-bronze)',
                    opacity: (!form.from || !form.to || !form.pickupDate) ? 0.5 : 1,
                  }}>
                  {isRTL ? 'التالي: تفاصيل الطرد' : 'Next: Package Details'}
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </motion.button>
              </motion.div>
            )}

            {/* STEP 2 — Package details */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    📦 {isRTL ? 'تفاصيل الطرد' : 'Package Details'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={isRTL ? 'الوزن (كغ)' : 'Weight (kg)'} icon={Weight}>
                      <input type="number" className="input-premium" min={0.1} max={30} step={0.5}
                        value={form.weight} onChange={e => up({ weight: +e.target.value })} required />
                    </Field>
                    <Field label={isRTL ? 'قيمة الطرد (د.أ) - للتأمين' : 'Package Value (JOD) — for insurance'}>
                      <input type="number" className="input-premium" min={0}
                        value={form.value} onChange={e => up({ value: +e.target.value })} />
                    </Field>
                  </div>

                  <Field label={isRTL ? 'وصف المحتوى' : 'Content Description'} hint={isRTL ? 'لا تضع أغراض محظورة' : 'No prohibited items'}>
                    <textarea className="input-premium resize-none" rows={3}
                      value={form.description} onChange={e => up({ description: e.target.value })}
                      placeholder={isRTL ? 'مثال: كتب جامعية، ملابس' : 'e.g. University books, clothes'} required />
                  </Field>

                  <div className="mt-4 space-y-3">
                    {[
                      { key: 'fragile', en: 'Fragile items — handle with care', ar: 'محتويات هشة — تعامل برفق', icon: '⚠️' },
                      { key: 'insurance', en: 'Add insurance (JOD 0.50)', ar: 'أضف تأمين (0.50 د.أ)', icon: '🛡️' },
                    ].map(t => (
                      <div key={t.key} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                        style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2.5">
                          <span>{t.icon}</span>
                          <span style={{ color: 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-sm)', fontWeight: 500 }}>
                            {isRTL ? t.ar : t.en}
                          </span>
                        </div>
                        <Switch checked={form[t.key as keyof FormData] as boolean}
                          onCheckedChange={v => up({ [t.key]: v })} />
                      </div>
                    ))}
                  </div>
                </StepCard>

                {/* Price preview */}
                {basePrice > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl"
                    style={{ background: BRONZE_BG, border: `1px solid ${BRONZE_BORDER}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)' }}>
                        {isRTL ? 'تقدير السعر' : 'Price Estimate'}
                      </span>
                      <Info className="w-3.5 h-3.5" style={{ color: 'rgba(71,85,105,1)' }} />
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: isRTL ? 'رسوم التوصيل' : 'Delivery fee', val: `${basePrice} ${isRTL ? 'د.أ' : 'JOD'}` },
                        ...(form.insurance ? [{ label: isRTL ? 'التأمين' : 'Insurance', val: `0.50 ${isRTL ? 'د.أ' : 'JOD'}` }] : []),
                        { label: isRTL ? 'المسافر يكسب' : 'Traveler earns', val: `${travelerEarns} ${isRTL ? 'د.أ' : 'JOD'}` },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between">
                          <span style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)' }}>{label}</span>
                          <span style={{ color: BRONZE, fontWeight: 700, fontSize: 'var(--wasel-text-caption)' }}>{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2" style={{ borderTop: `1px solid ${BRONZE_BORDER}` }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: 'var(--wasel-text-sm)' }}>{isRTL ? 'الإجمالي' : 'Total'}</span>
                        <span className="font-black text-gradient-bronze" style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                          {totalPrice} {isRTL ? 'د.أ' : 'JOD'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(100,116,139,1)', fontWeight: 600, fontSize: 'var(--wasel-text-sm)' }}>
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </motion.button>
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                    disabled={!form.description || form.weight <= 0}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, #9A6030, ${BRONZE})`,
                      color: '#fff', fontWeight: 700, fontSize: 'var(--wasel-text-sm)',
                      opacity: (!form.description || form.weight <= 0) ? 0.5 : 1,
                    }}>
                    {isRTL ? 'التالي' : 'Next'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Recipient */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                <StepCard>
                  <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)', color: '#fff' }}>
                    👤 {isRTL ? 'بيانات المستلم' : 'Recipient Details'}
                  </h3>
                  <div className="space-y-4">
                    <Field label={isRTL ? 'اسم المستلم' : 'Recipient Name'}>
                      <input className="input-premium" value={form.recipientName}
                        onChange={e => up({ recipientName: e.target.value })}
                        placeholder={isRTL ? 'محمد أحمد' : 'Mohammad Ahmad'} required />
                    </Field>
                    <Field label={isRTL ? 'رقم المستلم' : 'Recipient Phone'}
                      hint={isRTL ? 'سيتلقى كود QR للاستلام' : 'Will receive QR code for pickup'}>
                      <input className="input-premium" type="tel" value={form.recipientPhone}
                        onChange={e => up({ recipientPhone: e.target.value })}
                        placeholder="+962 79 123 4567" required />
                    </Field>
                    <Field label={isRTL ? 'رقمك أنت (المرسل)' : 'Your Number (Sender)'}>
                      <input className="input-premium" type="tel" value={form.senderPhone}
                        onChange={e => up({ senderPhone: e.target.value })}
                        placeholder="+962 79 123 4567" required />
                    </Field>
                  </div>
                </StepCard>

                {/* QR info */}
                <div className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(4,173,191,0.05)', border: '1px solid rgba(4,173,191,0.15)' }}>
                  <QrCode className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#04ADBF' }} />
                  <p style={{ color: 'rgba(148,163,184,1)', fontSize: 'var(--wasel-text-caption)', lineHeight: 1.6 }}>
                    {isRTL
                      ? 'المستلم سيحصل على كود QR للتحقق عند التسليم. لا تسلم الطرد إلا بعد مسح الكود.'
                      : 'Recipient gets a QR code for pickup verification. Only hand over after scanning.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(100,116,139,1)', fontWeight: 600, fontSize: 'var(--wasel-text-sm)' }}>
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </motion.button>
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(4)}
                    disabled={!form.recipientName || !form.recipientPhone}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, #9A6030, ${BRONZE})`,
                      color: '#fff', fontWeight: 700, fontSize: 'var(--wasel-text-sm)',
                      opacity: (!form.recipientName || !form.recipientPhone) ? 0.5 : 1,
                    }}>
                    {isRTL ? 'مراجعة' : 'Review'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Review */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                {/* Summary */}
                <div className="p-5 rounded-2xl relative overflow-hidden"
                  style={{ background: 'var(--wasel-surface-2)', border: `1px solid ${BRONZE_BORDER}`, boxShadow: 'var(--wasel-shadow-bronze)' }}>
                  {/* Top accent bar */}
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, #9A6030, ${BRONZE}, #F0C99A)` }} />

                  <h3 className="mb-5 font-bold text-white" style={{ fontWeight: 700, fontSize: 'var(--wasel-text-body)' }}>
                    ✅ {isRTL ? 'مراجعة الطرد' : 'Package Summary'}
                  </h3>

                  <div className="space-y-2.5 mb-5">
                    {[
                      { label: isRTL ? 'المسار' : 'Route',             val: `${form.from} → ${form.to}` },
                      { label: isRTL ? 'يوم الاستلام' : 'Pickup date', val: form.pickupDate },
                      { label: isRTL ? 'الوزن' : 'Weight',             val: `${form.weight} kg` },
                      { label: isRTL ? 'المستلم' : 'Recipient',        val: form.recipientName },
                      { label: isRTL ? 'رقم المستلم' : 'Recipient #',  val: form.recipientPhone },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'rgba(71,85,105,1)', fontSize: 'var(--wasel-text-caption)' }}>{label}</span>
                        <span style={{ fontWeight: 600, fontSize: 'var(--wasel-text-caption)', color: 'rgba(241,245,249,1)' }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="p-4 rounded-xl flex items-center justify-between"
                    style={{ background: BRONZE_BG, border: `1px solid ${BRONZE_BORDER}` }}>
                    <div>
                      <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)' }}>
                        {isRTL ? 'إجمالي التكلفة' : 'Total Cost'}
                      </p>
                      <p className="font-black text-gradient-bronze" style={{ fontWeight: 900, fontSize: '1.5rem' }}>
                        {totalPrice} {isRTL ? 'د.أ' : 'JOD'}
                      </p>
                    </div>
                    <div className="text-4xl">📦</div>
                  </div>
                </div>

                {/* Trust row */}
                <div className="flex items-center gap-4 px-1">
                  {[
                    { icon: Shield,       label: isRTL ? 'مؤمّن' : 'Insured'  },
                    { icon: QrCode,       label: isRTL ? 'تحقق QR' : 'QR Verified' },
                    { icon: CheckCircle2, label: isRTL ? 'موثّق' : 'Verified' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: BRONZE }} />
                      <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.65rem' }}>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(100,116,139,1)', fontWeight: 600, fontSize: 'var(--wasel-text-sm)' }}>
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </motion.button>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={submitting}
                    className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, #9A6030, ${BRONZE}, #F0C99A)`,
                      color: '#fff', fontWeight: 700, fontSize: 'var(--wasel-text-body)',
                      boxShadow: 'var(--wasel-shadow-bronze)',
                    }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                    {isRTL ? 'ابعث الطرد ✨' : 'Send Package ✨'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
