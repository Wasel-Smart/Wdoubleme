/**
 * SanadVerification — /features/safety/SanadVerification.tsx
 *
 * Jordan National eKYC via Sanad (سند) platform
 * 🟡 MOCK MODE — Real API pending from Sanad/MoDEE
 *
 * Test IDs (mock only):
 *   9801234567 → أحمد خالد الرشيدي — ✅ Verified (Tier 3)
 *   9855678901 → نور سامر الحسن   — ✅ Verified (Tier 3)
 *   9823456789 → محمد طارق المنصوري — ✅ Verified (Tier 4 driver)
 *   9876543210 → سارة يوسف الزيادات — ✅ Verified (Tier 3)
 *   9899999999 → ❌ ID Not Found
 *   9888888888 → ❌ Face Mismatch (score 42%)
 *   (any other 10-digit) → ✅ Verified as generic user
 *
 * When SANAD_API_KEY is configured on the server, mock is replaced by
 * real calls to https://api.sanad.gov.jo/v1 — no frontend changes needed.
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Fingerprint, Camera, Upload, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, ChevronLeft, Loader2,
  Eye, EyeOff, RefreshCw, BadgeCheck, Info, ScanFace,
  FileText, Car, Star,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { rtl } from '../../utils/rtl';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'intro' | 'national-id' | 'id-photo' | 'selfie' | 'processing' | 'result';

type SanadTier = 0 | 1 | 2 | 3 | 4;

interface SanadResult {
  verified: boolean;
  tier: SanadTier;
  nameAr: string;
  nameEn: string;
  dob: string;
  gender: 'M' | 'F';
  nationalId: string;
  faceMatchScore: number;
  sessionId: string;
  verifiedAt: string;
  hasDriverLicense?: boolean;
  rejectionReason?: string;
  rejectionReasonAr?: string;
}

interface ProcessingStep {
  id: string;
  labelEn: string;
  labelAr: string;
  status: 'pending' | 'active' | 'done' | 'error';
  durationMs: number;
}

// ── Processing steps animation ────────────────────────────────────────────────

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'format',  labelEn: 'Validating ID format',            labelAr: 'التحقق من تنسيق الهوية',     status: 'pending', durationMs: 800  },
  { id: 'ocr',     labelEn: 'Extracting ID data (OCR)',         labelAr: 'استخراج بيانات الهوية (OCR)', status: 'pending', durationMs: 1200 },
  { id: 'face',    labelEn: 'Running face match',               labelAr: 'مقارنة الوجه بالهوية',        status: 'pending', durationMs: 1500 },
  { id: 'civil',   labelEn: 'Querying Civil Status Bureau',      labelAr: 'الاستعلام من دائرة الأحوال المدنية', status: 'pending', durationMs: 1800 },
  { id: 'confirm', labelEn: 'Confirming Sanad certificate',     labelAr: 'تأكيد شهادة سند',             status: 'pending', durationMs: 600  },
];

// ── Tier meta ─────────────────────────────────────────────────────────────────

const TIER_META: Record<SanadTier, { labelEn: string; labelAr: string; color: string; icon: string }> = {
  0: { labelEn: 'Unverified',       labelAr: 'غير موثّق',        color: 'text-muted-foreground', icon: '⭕' },
  1: { labelEn: 'Basic',            labelAr: 'بيسك',             color: 'text-yellow-500',        icon: '📱' },
  2: { labelEn: 'Standard',         labelAr: 'قيد المراجعة',     color: 'text-blue-400',          icon: '📋' },
  3: { labelEn: 'Sanad Verified',   labelAr: 'سند موثّق',        color: 'text-green-500',         icon: '🇯🇴' },
  4: { labelEn: 'Sanad Premium',    labelAr: 'سند بريميوم',      color: 'text-primary',           icon: '🏆' },
};

// ── Main Component ─────────────────────────────────────────────────────────────

export function SanadVerification() {
  const { language, dir } = useLanguage();
  const { user } = useAuth();
  const ar = language === 'ar';

  const [step, setStep] = useState<Step>('intro');
  const [nationalId, setNationalId] = useState('');
  const [nationalIdError, setNationalIdError] = useState('');
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(PROCESSING_STEPS.map(s => ({ ...s })));
  const [result, setResult] = useState<SanadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMockIds, setShowMockIds] = useState(false);

  const idPhotoRef = useRef<HTMLInputElement>(null);
  const selfieRef  = useRef<HTMLInputElement>(null);

  // ── ID validation ────────────────────────────────────────────────────────────

  const validateNationalId = (id: string): boolean => {
    if (!/^\d{10}$/.test(id)) {
      setNationalIdError(ar ? 'الرقم الوطني يجب أن يكون 10 أرقام' : 'National ID must be exactly 10 digits');
      return false;
    }
    setNationalIdError('');
    return true;
  };

  // ── Photo handlers ───────────────────────────────────────────────────────────

  const handlePhotoChange = useCallback((
    file: File,
    setter: (f: File | null) => void,
    previewSetter: (s: string | null) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error(ar ? 'يرجى رفع صورة فقط' : 'Please upload an image file');
      return;
    }
    setter(file);
    const reader = new FileReader();
    reader.onload = (e) => previewSetter(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [ar]);

  // ── Processing animation ─────────────────────────────────────────────────────

  const runProcessingAnimation = useCallback(async (): Promise<SanadResult> => {
    const steps = PROCESSING_STEPS.map(s => ({ ...s }));

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'active';
      setProcessingSteps([...steps]);
      await new Promise(r => setTimeout(r, steps[i].durationMs));
      steps[i].status = 'done';
      setProcessingSteps([...steps]);
    }

    // Call backend mock API
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/sanad/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          nationalId,
          userId: user?.id || 'guest',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Sanad API error: ${response.status}`);
    }

    return response.json();
  }, [nationalId, user?.id]);

  // ── Submit verification ──────────────────────────────────────────────────────

  const handleSubmitVerification = async () => {
    if (!idPhotoFile || !selfieFile) {
      toast.error(ar ? 'يرجى رفع الصورتين' : 'Please upload both photos');
      return;
    }
    setStep('processing');
    setProcessingSteps(PROCESSING_STEPS.map(s => ({ ...s })));

    try {
      const sanadResult = await runProcessingAnimation();
      setResult(sanadResult);
      setStep('result');

      if (sanadResult.verified) {
        toast.success(ar ? '✅ تم التوثيق عبر سند بنجاح!' : '✅ Sanad verification complete!');
      } else {
        toast.error(ar ? '❌ فشل التوثيق. يرجى المحاولة مجدداً' : '❌ Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Sanad verification error:', err);
      toast.error(ar ? 'خطأ في الاتصال بخادم سند' : 'Error connecting to Sanad server');
      setStep('selfie');
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderStepIndicator = () => {
    const steps: { key: Step; labelEn: string; labelAr: string }[] = [
      { key: 'national-id', labelEn: 'ID Number',  labelAr: 'الرقم الوطني' },
      { key: 'id-photo',    labelEn: 'ID Photo',   labelAr: 'صورة الهوية' },
      { key: 'selfie',      labelEn: 'Selfie',     labelAr: 'السيلفي'     },
      { key: 'processing',  labelEn: 'Processing', labelAr: 'جاري التحقق' },
      { key: 'result',      labelEn: 'Result',     labelAr: 'النتيجة'     },
    ];
    const currentIdx = steps.findIndex(s => s.key === step);

    return (
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;
          const future  = i > currentIdx;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className={`flex flex-col items-center gap-1 ${future ? 'opacity-40' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done   ? 'bg-green-500 text-white'                     : ''}
                  ${active ? 'bg-primary text-primary-foreground ring-2 ring-primary/40' : ''}
                  ${future ? 'bg-muted text-muted-foreground'              : ''}
                `}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:block whitespace-nowrap">
                  {ar ? s.labelAr : s.labelEn}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all ${i < currentIdx ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Step: Intro ──────────────────────────────────────────────────────────────

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero */}
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
          <Fingerprint className="w-10 h-10 text-primary" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🇯🇴</span>
          <h1 className="text-3xl font-bold" style={{ fontWeight: 700, fontSize: '1.75rem' }}>
            {ar ? 'التوثيق عبر سند' : 'Verify with Sanad'}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto" style={{ fontSize: '0.875rem' }}>
          {ar
            ? 'سند هو منصة الهوية الرقمية الوطنية الأردنية — توثيق فوري وآمن عبر دائرة الأحوال المدنية'
            : 'Sanad is Jordan\'s national digital identity platform — instant, authoritative verification via the Civil Status Bureau'
          }
        </p>
      </div>

      {/* Mock Mode Banner */}
      <Card className="p-4 border-yellow-500/50 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-500" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {ar ? '🟡 وضع التجربة — بيانات وهمية' : '🟡 Mock Mode — Test Data'}
            </p>
            <p className="text-xs text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>
              {ar
                ? 'API سند قيد التوقيع مع وزارة الاقتصاد الرقمي. جميع البيانات حالياً وهمية للاختبار.'
                : 'Sanad API pending signature with MoDEE. All data is currently mocked for testing.'
              }
            </p>
            <button
              onClick={() => setShowMockIds(!showMockIds)}
              className="text-xs text-yellow-400 underline mt-1 hover:text-yellow-300 transition-colors"
            >
              {ar ? (showMockIds ? 'أخفِ أرقام الاختبار' : 'عرض أرقام الاختبار') : (showMockIds ? 'Hide test IDs' : 'Show test IDs')}
            </button>
            <AnimatePresence>
              {showMockIds && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-2 space-y-1 font-mono text-xs border-t border-yellow-500/20 pt-2">
                    {[
                      { id: '9801234567', name: 'أحمد خالد الرشيدي', result: '✅ Tier 3' },
                      { id: '9855678901', name: 'نور سامر الحسن',   result: '✅ Tier 3' },
                      { id: '9823456789', name: 'محمد طارق المنصوري', result: '✅ Tier 4 (Driver)' },
                      { id: '9876543210', name: 'سارة يوسف الزيادات', result: '✅ Tier 3' },
                      { id: '9899999999', name: '—',                result: '❌ ID Not Found' },
                      { id: '9888888888', name: '—',                result: '❌ Face Mismatch' },
                    ].map(row => (
                      <div key={row.id} className="flex items-center gap-2">
                        <button
                          onClick={() => setNationalId(row.id)}
                          className="text-primary hover:underline font-mono"
                        >{row.id}</button>
                        <span className="text-muted-foreground">{row.name}</span>
                        <span>{row.result}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '⚡', en: 'Instant',    ar: 'فوري',      desc_en: 'No 24-48h wait', desc_ar: 'ما في انتظار' },
          { icon: '🔒', en: 'Private',    ar: 'خصوصية',   desc_en: 'Data never stored', desc_ar: 'بياناتك آمنة' },
          { icon: '🏛️', en: 'Official',  ar: 'رسمي',      desc_en: 'Civil Status Bureau', desc_ar: 'دائرة الأحوال' },
        ].map(b => (
          <Card key={b.en} className="p-3 text-center">
            <div className="text-2xl mb-1">{b.icon}</div>
            <div className="text-xs font-semibold" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {ar ? b.ar : b.en}
            </div>
            <div className="text-[10px] text-muted-foreground">{ar ? b.desc_ar : b.desc_en}</div>
          </Card>
        ))}
      </div>

      {/* Trust Tiers */}
      <Card className="p-4">
        <p className="text-sm font-semibold mb-3" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {ar ? 'مستويات الثقة' : 'Trust Tiers'}
        </p>
        <div className="space-y-2">
          {([1, 2, 3, 4] as SanadTier[]).map(tier => (
            <div key={tier} className="flex items-center gap-3">
              <span className="text-sm">{TIER_META[tier].icon}</span>
              <div className="flex-1">
                <div className={`text-xs font-semibold ${TIER_META[tier].color}`} style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  {ar ? TIER_META[tier].labelAr : TIER_META[tier].labelEn}
                </div>
              </div>
              {tier === 3 && (
                <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                  {ar ? 'هذا التوثيق' : 'This flow'}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy note */}
      <Card className="p-3 bg-muted/30 flex items-start gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
          {ar
            ? 'معلوماتك الشخصية لا تُخزَّن على سيرفرات واصل. يتم التحقق فقط من صحة الهوية عبر سند دون الاحتفاظ بأي بيانات حساسة.'
            : 'Your personal data is never stored on Wasel servers. Only the verification status is retained. All sensitive data is handled exclusively by Sanad/MoDEE.'
          }
        </p>
      </Card>

      <Button
        className="w-full h-12 text-base font-bold"
        style={{ fontWeight: 700, fontSize: '1rem', height: '3rem' }}
        onClick={() => setStep('national-id')}
      >
        <Fingerprint className={`w-5 h-5 ${rtl.mr(2)}`} />
        {ar ? 'ابدأ التوثيق عبر سند' : 'Start Sanad Verification'}
      </Button>
    </motion.div>
  );

  // ── Step: National ID ────────────────────────────────────────────────────────

  const renderNationalId = () => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {ar ? 'أدخل رقمك الوطني' : 'Enter Your National ID Number'}
        </h2>
        <p className="text-sm text-muted-foreground" style={{ fontSize: '0.875rem' }}>
          {ar ? 'الرقم المكوّن من 10 أرقام على هويتك الشخصية' : '10-digit number on your Jordanian national ID card'}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold" style={{ fontWeight: 600 }}>
              {ar ? 'الرقم الوطني' : 'National ID Number'}
            </p>
            <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
              {ar ? 'الرقم الوطني / رقم الهوية الوطنية' : 'رقم وطني / National Number'}
            </p>
          </div>
        </div>

        <Input
          value={nationalId}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 10);
            setNationalId(v);
            if (v.length === 10) validateNationalId(v);
            else setNationalIdError('');
          }}
          placeholder={ar ? '9 8 0 1 2 3 4 5 6 7' : '9 8 0 1 2 3 4 5 6 7'}
          className={`text-center text-2xl tracking-widest font-mono h-14 ${nationalIdError ? 'border-red-500' : nationalId.length === 10 ? 'border-green-500' : ''}`}
          style={{ fontSize: '1.5rem', letterSpacing: '0.2em', height: '3.5rem' }}
          inputMode="numeric"
          dir="ltr"
        />

        {nationalIdError && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
            <XCircle className="w-3 h-3" />
            {nationalIdError}
          </p>
        )}
        {nationalId.length === 10 && !nationalIdError && (
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
            <CheckCircle2 className="w-3 h-3" />
            {ar ? 'تنسيق صحيح ✓' : 'Valid format ✓'}
          </p>
        )}

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
            {ar
              ? '💡 الرقم الوطني موجود على الوجه الأمامي من هويتك الوطنية تحت صورتك مباشرة'
              : '💡 Your national ID number is on the front of your ID card, directly below your photo'
            }
          </p>
        </div>
      </Card>

      {/* ID card diagram */}
      <Card className="p-4 border-dashed border-2 border-primary/30">
        <div className="text-center text-xs text-muted-foreground mb-2" style={{ fontSize: '0.75rem' }}>
          {ar ? 'مثال على موقع الرقم' : 'Example ID card location'}
        </div>
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 rounded-lg p-3 border border-green-500/20 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-12 bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">
              🙂
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-muted/40 rounded w-3/4" />
              <div className="h-2 bg-muted/40 rounded w-1/2" />
              <div className="h-3 bg-primary/30 rounded w-2/3 flex items-center px-1">
                <span className="text-[9px] text-primary font-mono font-bold">9 8 0 1 2 3 4 5 6 7</span>
              </div>
            </div>
            <div className="text-[8px] text-green-500 font-bold">🇯🇴 JO</div>
          </div>
          <div className="absolute top-1 right-1 bg-primary/20 rounded px-1">
            <span className="text-[9px] text-primary">← {ar ? 'هنا' : 'here'}</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('intro')} className="flex-1">
          <ChevronLeft className={`w-4 h-4 ${rtl.mr(1)}`} />
          {ar ? 'رجوع' : 'Back'}
        </Button>
        <Button
          className="flex-2 flex-1"
          disabled={nationalId.length !== 10 || !!nationalIdError}
          onClick={() => {
            if (validateNationalId(nationalId)) setStep('id-photo');
          }}
        >
          {ar ? 'التالي' : 'Next'}
          <ChevronRight className={`w-4 h-4 ${rtl.ml(1)}`} />
        </Button>
      </div>
    </motion.div>
  );

  // ── Step: ID Photo ───────────────────────────────────────────────────────────

  const renderIdPhoto = () => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {ar ? 'صوّر هويتك الشخصية' : 'Photograph Your ID Card'}
        </h2>
        <p className="text-sm text-muted-foreground" style={{ fontSize: '0.875rem' }}>
          {ar ? 'صورة واضحة للوجه الأمامي من هويتك' : 'Clear photo of the front side of your national ID'}
        </p>
      </div>

      <input
        ref={idPhotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handlePhotoChange(f, setIdPhotoFile, setIdPhotoPreview);
        }}
      />

      {idPhotoPreview ? (
        <Card className="p-4 border-green-500/50">
          <div className="relative">
            <img
              src={idPhotoPreview}
              alt="ID Card"
              className="w-full rounded-lg object-cover max-h-48"
            />
            <div className="absolute inset-0 bg-green-500/10 rounded-lg flex items-center justify-center">
              <div className="bg-green-500 text-white rounded-full p-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>
          {/* OCR simulation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500 font-semibold" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                {ar ? 'تم استخراج البيانات (OCR)' : 'OCR Data Extracted'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ fontSize: '0.75rem' }}>
              {[
                { en: 'Name', ar: 'الاسم', val: '* * * * * * *' },
                { en: 'DOB',  ar: 'تاريخ الميلاد', val: '* * / * * / * *' },
                { en: 'Gender', ar: 'الجنس', val: '* * *' },
                { en: 'Expiry', ar: 'الانتهاء', val: '2 0 * * / * *' },
              ].map(f => (
                <div key={f.en}>
                  <span className="text-muted-foreground">{ar ? f.ar : f.en}: </span>
                  <span className="font-mono text-primary">{f.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <Button
            variant="outline" size="sm"
            className="w-full mt-2"
            onClick={() => idPhotoRef.current?.click()}
          >
            <RefreshCw className={`w-3 h-3 ${rtl.mr(1)}`} />
            {ar ? 'صوّر مجدداً' : 'Retake'}
          </Button>
        </Card>
      ) : (
        <Card
          className="p-8 border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors text-center"
          onClick={() => idPhotoRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <p className="font-semibold mb-1" style={{ fontWeight: 600 }}>
            {ar ? 'اضغط لالتقاط/رفع صورة الهوية' : 'Tap to capture or upload ID photo'}
          </p>
          <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
            {ar ? 'يدعم: JPG, PNG, HEIC' : 'Supports: JPG, PNG, HEIC'}
          </p>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-muted/20">
        <p className="text-xs font-semibold mb-2" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
          {ar ? '📸 نصائح للصورة الجيدة' : '📸 Tips for a good photo'}
        </p>
        <ul className="space-y-1">
          {[
            { en: 'Lay ID flat on a dark surface', ar: 'ضع الهوية على سطح داكن مستوٍ' },
            { en: 'All 4 corners must be visible', ar: 'الزوايا الأربعة يجب أن تكون ظاهرة' },
            { en: 'No flash reflections on the card', ar: 'تجنب الوميض والانعكاسات' },
            { en: 'Photo must be in focus (sharp)', ar: 'الصورة يجب تكون حادة وواضحة' },
          ].map(t => (
            <li key={t.en} className="flex items-start gap-2 text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
              <span>✓</span>
              <span>{ar ? t.ar : t.en}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('national-id')} className="flex-1">
          <ChevronLeft className={`w-4 h-4 ${rtl.mr(1)}`} />
          {ar ? 'رجوع' : 'Back'}
        </Button>
        <Button
          className="flex-1"
          disabled={!idPhotoFile}
          onClick={() => setStep('selfie')}
        >
          {ar ? 'التالي' : 'Next'}
          <ChevronRight className={`w-4 h-4 ${rtl.ml(1)}`} />
        </Button>
      </div>
    </motion.div>
  );

  // ── Step: Selfie ─────────────────────────────────────────────────────────────

  const renderSelfie = () => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {ar ? 'التقط سيلفي الآن' : 'Take Your Selfie'}
        </h2>
        <p className="text-sm text-muted-foreground" style={{ fontSize: '0.875rem' }}>
          {ar ? 'سيتم مقارنة وجهك مع الهوية الشخصية عبر سند' : 'Your face will be matched against your ID via Sanad'}
        </p>
      </div>

      <input
        ref={selfieRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handlePhotoChange(f, setSelfieFile, setSelfiePreview);
        }}
      />

      {selfiePreview ? (
        <Card className="p-4 border-green-500/50">
          <div className="relative w-48 h-48 mx-auto">
            <img
              src={selfiePreview}
              alt="Selfie"
              className="w-full h-full rounded-full object-cover border-4 border-green-500"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-sm text-green-500 font-semibold" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {ar ? '✅ السيلفي جاهز' : '✅ Selfie ready'}
            </p>
          </div>
          <Button
            variant="outline" size="sm"
            className="w-full mt-2"
            onClick={() => selfieRef.current?.click()}
          >
            <RefreshCw className={`w-3 h-3 ${rtl.mr(1)}`} />
            {ar ? 'التقط مجدداً' : 'Retake'}
          </Button>
        </Card>
      ) : (
        <Card
          className="p-8 border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors text-center"
          onClick={() => selfieRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center mx-auto mb-4">
            <ScanFace className="w-12 h-12 text-primary" />
          </div>
          <p className="font-semibold mb-1" style={{ fontWeight: 600 }}>
            {ar ? 'اضغط لالتقاط سيلفي' : 'Tap to take selfie'}
          </p>
          <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
            {ar ? 'استخدم الكاميرا الأمامية لوجهك بشكل كامل' : 'Use front camera — full face visible'}
          </p>
        </Card>
      )}

      {/* Liveness hints */}
      <Card className="p-4 bg-muted/20">
        <p className="text-xs font-semibold mb-2" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
          {ar ? '🤳 تعليمات السيلفي' : '🤳 Selfie instructions'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '😊', en: 'Neutral expression', ar: 'تعبير محايد' },
            { emoji: '💡', en: 'Good lighting', ar: 'إضاءة جيدة' },
            { emoji: '👓', en: 'Remove glasses', ar: 'أزل النظارات' },
            { emoji: '📱', en: 'Hold phone steady', ar: 'ثبّت الهاتف' },
          ].map(h => (
            <div key={h.en} className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
              <span>{h.emoji}</span>
              <span>{ar ? h.ar : h.en}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Hijab note */}
      <Card className="p-3 bg-primary/5 border-primary/20">
        <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
          🧕 {ar
            ? 'المحجبات: الحجاب مقبول تماماً في السيلفي. يجب فقط أن يكون الوجه ظاهراً بوضوح'
            : 'Hijab is fully accepted. Only the face must be clearly visible for matching'
          }
        </p>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('id-photo')} className="flex-1">
          <ChevronLeft className={`w-4 h-4 ${rtl.mr(1)}`} />
          {ar ? 'رجوع' : 'Back'}
        </Button>
        <Button
          className="flex-1"
          disabled={!selfieFile || loading}
          onClick={handleSubmitVerification}
        >
          {loading ? (
            <Loader2 className={`w-4 h-4 ${rtl.mr(2)} animate-spin`} />
          ) : (
            <ShieldCheck className={`w-4 h-4 ${rtl.mr(2)}`} />
          )}
          {ar ? 'ابدأ التحقق عبر سند' : 'Verify with Sanad'}
        </Button>
      </div>
    </motion.div>
  );

  // ── Step: Processing ─────────────────────────────────────────────────────────

  const renderProcessing = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 text-center"
    >
      {/* Animated spinner */}
      <div className="py-4">
        <div className="relative w-24 h-24 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/30"
          />
          <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🇯🇴</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {ar ? 'جاري التحقق عبر سند...' : 'Verifying with Sanad...'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontSize: '0.875rem' }}>
          {ar ? 'لا تغلق هذه الصفحة' : 'Please keep this page open'}
        </p>
      </div>

      {/* Step-by-step progress */}
      <Card className="p-6 text-left" dir="ltr">
        <div className="space-y-4">
          {processingSteps.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {s.status === 'done'   && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {s.status === 'active' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                {s.status === 'error'  && <XCircle className="w-5 h-5 text-red-500" />}
                {s.status === 'pending'&& <div className="w-5 h-5 rounded-full border-2 border-muted" />}
              </div>
              <span className={`text-sm ${
                s.status === 'done'    ? 'text-green-500'
                : s.status === 'active' ? 'text-foreground font-semibold'
                : 'text-muted-foreground'
              }`} style={{ fontSize: '0.875rem', fontWeight: s.status === 'active' ? 600 : 400 }}>
                {ar ? s.labelAr : s.labelEn}
              </span>
              {s.status === 'active' && (
                <div className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: ['0%', '80%'] }}
                    transition={{ duration: s.durationMs / 1000, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
        {ar
          ? '🔒 اتصال مشفر بدائرة الأحوال المدنية الأردنية'
          : '🔒 Encrypted connection to Jordan Civil Status Bureau'
        }
      </p>
    </motion.div>
  );

  // ── Step: Result ─────────────────────────────────────────────────────────────

  const renderResult = () => {
    if (!result) return null;

    if (result.verified) {
      const tier = TIER_META[result.tier];
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          {/* Success badge */}
          <div className="py-4">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center mx-auto mb-4"
            >
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🇯🇴</span>
              <h2 className="text-2xl font-bold text-green-500" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                {ar ? 'سند موثّق ✅' : 'Sanad Verified ✅'}
              </h2>
            </div>

            <Badge className={`${tier.color} bg-green-500/10 border-green-500/30 text-sm px-3 py-1`} style={{ fontSize: '0.875rem' }}>
              {tier.icon} {ar ? tier.labelAr : tier.labelEn}
            </Badge>
          </div>

          {/* Verified identity card */}
          <Card className="p-6 border-green-500/40 bg-green-500/5 text-left">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-green-500" style={{ fontWeight: 600 }}>
                {ar ? 'هويتك الموثّقة' : 'Verified Identity'}
              </span>
              <span className="text-xs text-muted-foreground ml-auto" style={{ fontSize: '0.75rem' }}>
                {ar ? 'موثّق عبر سند' : 'via Sanad'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm" style={{ fontSize: '0.875rem' }}>
              <div>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </p>
                <p className="font-semibold" style={{ fontWeight: 600 }}>{result.nameAr}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </p>
                <p className="font-semibold" style={{ fontWeight: 600 }}>{result.nameEn}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'تاريخ الميلاد' : 'Date of Birth'}
                </p>
                <p className="font-semibold" style={{ fontWeight: 600 }}>{result.dob}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'الجنس' : 'Gender'}
                </p>
                <p className="font-semibold" style={{ fontWeight: 600 }}>
                  {result.gender === 'M' ? (ar ? 'ذكر' : 'Male') : (ar ? 'أنثى' : 'Female')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'نسبة تطابق الوجه' : 'Face Match Score'}
                </p>
                <p className="font-bold text-green-500" style={{ fontWeight: 700 }}>
                  {result.faceMatchScore}% ✓
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'رقم الجلسة' : 'Session ID'}
                </p>
                <p className="font-mono text-xs text-muted-foreground" style={{ fontSize: '0.7rem' }}>
                  {result.sessionId}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-green-500/20">
              <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                {ar ? '⏱️ موثّق في: ' : '⏱️ Verified at: '}
                {new Date(result.verifiedAt).toLocaleString(ar ? 'ar-JO' : 'en-US')}
              </p>
            </div>
          </Card>

          {/* Trust score boost */}
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {ar ? '+50 نقطة ثقة مضافة!' : '+50 Trust Score Added!'}
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                  {ar ? 'بروفايلك الآن أكثر مصداقية للركاب' : 'Your profile is now more trusted by passengers'}
                </p>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">+50</Badge>
            </div>
          </Card>

          {/* Next step: Tier 4 — Driver License */}
          {result.tier === 3 && (
            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {ar ? 'ارقَ لمستوى سند بريميوم 🏆' : 'Upgrade to Sanad Premium 🏆'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>
                    {ar
                      ? 'وثّق رخصة قيادتك لتحصل على شارة بريميوم وأولوية في نتائج البحث'
                      : 'Verify your driver license to get Premium badge and priority in search results'
                    }
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 text-xs">
                  {ar ? 'قريباً' : 'Soon'}
                </Button>
              </div>
            </Card>
          )}

          <Button className="w-full h-12 text-base" style={{ height: '3rem', fontSize: '1rem' }}
            onClick={() => window.history.back()}>
            {ar ? 'رجوع للبروفايل' : 'Back to Profile'}
          </Button>
        </motion.div>
      );
    }

    // ── Rejection screen ────────────────────────────────────────────────────────
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        <div className="py-4">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border-4 border-red-500/50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-500" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
            {ar ? 'فشل التوثيق' : 'Verification Failed'}
          </h2>
        </div>

        <Card className="p-4 border-red-500/30 bg-red-500/5 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-400 text-sm" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {ar ? (result.rejectionReasonAr || 'خطأ غير معروف') : (result.rejectionReason || 'Unknown error')}
              </p>
              <p className="text-xs text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>
                {ar
                  ? 'إذا كنت تعتقد أن هذا خطأ، تواصل مع الدعم أو حاول مرة أخرى'
                  : 'If you believe this is an error, contact support or try again'
                }
              </p>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline" className="flex-1"
            onClick={() => {
              setStep('national-id');
              setIdPhotoFile(null);
              setIdPhotoPreview(null);
              setSelfieFile(null);
              setSelfiePreview(null);
              setResult(null);
            }}
          >
            <RefreshCw className={`w-4 h-4 ${rtl.mr(2)}`} />
            {ar ? 'حاول مجدداً' : 'Try Again'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
            {ar ? 'دعم فني' : 'Get Support'}
          </Button>
        </div>
      </motion.div>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div dir={dir} className="max-w-lg mx-auto px-4 pb-12 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-lg">🇯🇴</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
            {ar ? 'سند — التوثيق الوطني' : 'Sanad — National eKYC'}
          </h1>
          <p className="text-xs text-muted-foreground" style={{ fontSize: '0.75rem' }}>
            {ar ? 'وزارة الاقتصاد الرقمي والريادة — الأردن' : 'Ministry of Digital Economy & Entrepreneurship — Jordan'}
          </p>
        </div>
        <Badge className="ml-auto text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
          MOCK
        </Badge>
      </div>

      {/* Step indicator */}
      {step !== 'intro' && renderStepIndicator()}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <div key={step}>
          {step === 'intro'       && renderIntro()}
          {step === 'national-id' && renderNationalId()}
          {step === 'id-photo'    && renderIdPhoto()}
          {step === 'selfie'      && renderSelfie()}
          {step === 'processing'  && renderProcessing()}
          {step === 'result'      && renderResult()}
        </div>
      </AnimatePresence>
    </div>
  );
}

// ── Inline Sanad Badge (use on ride cards, profile headers, etc.) ──────────────

export function SanadBadge({
  tier = 3,
  size = 'sm',
  showLabel = true,
}: {
  tier?: SanadTier;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}) {
  if (tier < 3) return null;

  const meta = TIER_META[tier];
  const sizeClass = size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold bg-green-500/10 text-green-400 border-green-500/30 ${sizeClass}`}
      style={{ fontWeight: 600 }}
      title={`Sanad ${meta.labelEn} — Verified by Jordan Civil Status Bureau`}
    >
      <ShieldCheck className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {showLabel && (tier === 4 ? 'سند بريميوم 🏆' : 'سند موثّق')}
      {!showLabel && '🇯🇴'}
    </span>
  );
}

export type { SanadTier, SanadResult };
