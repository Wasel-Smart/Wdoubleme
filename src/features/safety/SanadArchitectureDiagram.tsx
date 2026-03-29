/**
 * SanadArchitectureDiagram — /features/safety/SanadArchitectureDiagram.tsx
 *
 * Enterprise-grade interactive backend architecture diagram:
 * "Wasel × Sanad Digital Identity Integration"
 *
 * Covers all 6 layers from the prompt:
 *  1. Client Layer
 *  2. API Gateway Layer (JWT, rate-limit, validation)
 *  3. Auth & Identity Layer (Sanad OAuth2/OIDC + PKCE + KYC flags)
 *  4. Core Services Layer (6 microservices)
 *  5. Data Layer (encrypted DB, audit log, token store)
 *  6. Trust & Safety Logic (verified vs. unverified)
 *
 * Includes: animated data-flow, lock icons on secure channels,
 * Sanad "Trust Anchor" highlight, OAuth2 step-by-step flow,
 * strategic investor annotation, bilingual labels.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Lock, Zap, Database, Users, Car, Package,
  Brain, AlertTriangle, CheckCircle2, XCircle, Server,
  Key, RefreshCw, Globe, Smartphone,
  Monitor, ShieldCheck, BadgeCheck,
  TrendingUp, Activity, Eye,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:    '#0B1120',
  card:    '#111B2E',
  card2:   '#0F172A',
  teal:    '#04ADBF',
  green:   '#09732E',
  bronze:  '#D9965B',
  purple:  '#8B5CF6',
  blue:    '#3B82F6',
  red:     '#EF4444',
  amber:   '#F59E0B',
  success: '#22C55E',
  sanad:   '#16a34a',   // Sanad trust-anchor green
} as const;

// ── Animated flowing dot component ───────────────────────────────────────────
function FlowDot({ color, delay = 0, duration = 2 }: { color: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ width: 6, height: 6, background: color, top: -3, left: 0, boxShadow: `0 0 8px ${color}` }}
      animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ── Vertical connector with animated flow ─────────────────────────────────────
function VertConnector({ color = C.teal, locked = false, delay = 0 }: { color?: string; locked?: boolean; delay?: number }) {
  return (
    <div className="flex flex-col items-center" style={{ height: 48, minWidth: 32 }}>
      <div className="relative flex-1 flex items-center" style={{ width: 2, position: 'relative', background: `linear-gradient(to bottom, ${color}60, ${color}30)` }}>
        <motion.div
          className="absolute rounded-full"
          style={{ width: 5, height: 5, background: color, left: -1.5, boxShadow: `0 0 6px ${color}` }}
          animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.6, delay, repeat: Infinity, ease: 'linear' }}
        />
        {locked && (
          <div className="absolute" style={{ left: -8, top: '50%', transform: 'translateY(-50%)', background: C.card, borderRadius: 4, padding: 2 }}>
            <Lock style={{ width: 10, height: 10, color: C.amber }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Layer header ───────────────────────────────────────────────────────────────
function LayerHeader({ number, label, sublabel, color }: { number: string; label: string; sublabel: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black shrink-0 text-white"
        style={{ background: color, fontSize: '0.65rem', fontWeight: 900 }}>
        {number}
      </div>
      <div>
        <div className="font-black text-white" style={{ fontWeight: 900, fontSize: '0.78rem', lineHeight: 1.2 }}>{label}</div>
        <div style={{ color: `${color}cc`, fontSize: '0.6rem', fontWeight: 600 }}>{sublabel}</div>
      </div>
    </div>
  );
}

// ── Service box component ──────────────────────────────────────────────────────
function ServiceBox({
  icon, label, sublabel, color = C.teal, highlight = false,
  badge, onClick, active = false,
}: {
  icon: React.ReactNode; label: string; sublabel?: string;
  color?: string; highlight?: boolean; badge?: string;
  onClick?: () => void; active?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      onClick={onClick}
      className="relative rounded-xl flex flex-col items-center gap-1.5 cursor-pointer select-none"
      style={{
        padding: '10px 12px',
        background: active ? `${color}18` : highlight ? `${color}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? color : highlight ? `${color}50` : 'rgba(255,255,255,0.07)'}`,
        boxShadow: active ? `0 0 20px ${color}30` : highlight ? `0 0 12px ${color}15` : 'none',
        minWidth: 88,
        transition: 'all 0.2s',
      }}
    >
      {highlight && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at center, ${color}20, transparent 70%)` }}
        />
      )}
      <div style={{ color, position: 'relative' }}>{icon}</div>
      <div className="text-white text-center font-bold relative" style={{ fontWeight: 700, fontSize: '0.68rem', lineHeight: 1.3 }}>{label}</div>
      {sublabel && (
        <div className="text-center relative" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem', lineHeight: 1.3 }}>{sublabel}</div>
      )}
      {badge && (
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-white font-black"
          style={{ fontSize: '0.5rem', fontWeight: 900, background: color, lineHeight: 1.2 }}>
          {badge}
        </span>
      )}
    </motion.div>
  );
}

// ── OAuth2 Flow Steps ─────────────────────────────────────────────────────────
const OAUTH_STEPS = [
  { id: 1, en: 'User requests verification',         ar: 'المستخدم يطلب التحقق',           icon: '👤', color: C.teal },
  { id: 2, en: 'Wasel initiates OAuth2 + PKCE',      ar: 'واصل يبدأ OAuth2 + PKCE',        icon: '🔑', color: C.teal },
  { id: 3, en: 'Redirect to Sanad (MoDEE)',           ar: 'التوجيه لـ Sanad (MoDEE)',        icon: '🏛️', color: C.sanad },
  { id: 4, en: 'Sanad authenticates & cross-checks', ar: 'سند يتحقق من الأحوال المدنية',   icon: '✅', color: C.sanad },
  { id: 5, en: 'Signed token returned to Wasel',     ar: 'توكن موقّع يُعاد إلى واصل',     icon: '🔐', color: C.amber },
  { id: 6, en: 'Wasel validates token (PKCE)',        ar: 'واصل يتحقق من التوكن',           icon: '🛡️', color: C.purple },
  { id: 7, en: 'KYC flag updated — user Verified',   ar: 'علامة KYC: المستخدم موثّق',     icon: '🏆', color: C.success },
];

// ── Security requirements ─────────────────────────────────────────────────────
const SECURITY_REQUIREMENTS = [
  { icon: '🔑', en: 'OAuth2 Authorization Code Flow', ar: 'تدفق OAuth2' },
  { icon: '🔒', en: 'PKCE (SHA-256 code challenge)',   ar: 'PKCE SHA-256' },
  { icon: '✍️', en: 'Signed JWT token validation',     ar: 'التحقق من JWT الموقّع' },
  { icon: '⚡', en: 'API rate throttling (100 rps)',    ar: 'تحديد معدل الطلبات' },
  { icon: '🕵️', en: 'Fraud detection layer',           ar: 'طبقة كشف الاحتيال' },
  { icon: '📝', en: 'Full activity audit logging',      ar: 'سجل مراجعة كامل' },
  { icon: '🔮', en: 'No raw national ID stored',        ar: 'لا يُخزَّن الرقم الوطني' },
  { icon: '🇪🇺', en: 'GDPR-style privacy structure',   ar: 'هيكل خصوصية GDPR' },
];

// ── Main component ────────────────────────────────────────────────────────────
export function SanadArchitectureDiagram() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance OAuth flow steps
  useEffect(() => {
    if (!autoPlay) return;
    intervalRef.current = setInterval(() => {
      setActiveStep(s => (s + 1) % (OAUTH_STEPS.length + 2));
    }, 1400);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay]);

  useEffect(() => {
    const t = setTimeout(() => setShowAnnotation(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const currentStep = OAUTH_STEPS[activeStep] ?? null;

  return (
    <div className="min-h-screen" style={{ background: C.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl px-6 py-4"
        style={{ background: 'rgba(11,17,32,0.92)' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.sanad})` }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white" style={{ fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>
                {ar ? 'معمارية تكامل واصل × سند' : 'Wasel × Sanad Integration Architecture'}
              </h1>
              <p style={{ color: C.teal, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                {ar ? 'منصة هوية رقمية وطنية · مستوى إنتاجي' : 'NATIONAL DIGITAL IDENTITY · ENTERPRISE-GRADE · v2.0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setAutoPlay(p => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold"
              style={{ fontWeight: 700, fontSize: '0.75rem', background: autoPlay ? `${C.teal}20` : 'rgba(255,255,255,0.06)', border: `1px solid ${autoPlay ? C.teal : 'rgba(255,255,255,0.1)'}` }}
            >
              {autoPlay
                ? <><Activity className="w-3.5 h-3.5" style={{ color: C.teal }} /> {ar ? 'إيقاف الرسوم' : 'Pause Flow'}</>
                : <><RefreshCw className="w-3.5 h-3.5" /> {ar ? 'تشغيل الرسوم' : 'Play Flow'}</>
              }
            </motion.button>

            {/* Trust Anchor badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
              style={{ background: `${C.sanad}15`, border: `1px solid ${C.sanad}40` }}>
              <ShieldCheck style={{ width: 14, height: 14, color: C.sanad }} />
              <span style={{ color: C.sanad, fontSize: '0.7rem', fontWeight: 800 }}>
                {ar ? 'مرساة الثقة: سند' : 'Trust Anchor: Sanad'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">

        {/* ── Strategic Annotation ── */}
        <AnimatePresence>
          {showAnnotation && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: `${C.sanad}0c`, border: `1px solid ${C.sanad}35`, boxShadow: `0 0 40px ${C.sanad}08` }}
            >
              <TrendingUp style={{ width: 18, height: 18, color: C.sanad, marginTop: 2, flexShrink: 0 }} />
              <div>
                <p className="text-white font-bold mb-0.5" style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                  {ar ? '🇯🇴 رؤية استراتيجية' : '🇯🇴 Strategic Positioning'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                  {ar
                    ? '"واصل يدمج البنية التحتية للهوية الرقمية الوطنية لبناء أول منظومة رحلات مشتركة بعيدة المدى مدعومة بالذكاء الاصطناعي ومتمحورة حول الثقة في المنطقة."'
                    : '"Wasel integrates national digital identity infrastructure to build the first AI-powered, trust-centric, long-distance ride-sharing ecosystem in the region."'
                  }
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { en: '📈 Investor-Ready', ar: '📈 جاهز للمستثمرين' },
                    { en: '🏛️ Government-Aligned', ar: '🏛️ متوافق حكومياً' },
                    { en: '🔒 Enterprise Secure', ar: '🔒 أمان مؤسسي' },
                    { en: '📋 Regulation-Friendly', ar: '📋 ملتزم تنظيمياً' },
                  ].map(t => (
                    <span key={t.en} className="px-2 py-0.5 rounded-full text-white"
                      style={{ fontSize: '0.6rem', fontWeight: 700, background: `${C.sanad}20`, border: `1px solid ${C.sanad}40`, color: '#86efac' }}>
                      {ar ? t.ar : t.en}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Architecture Diagram ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT: Main layered diagram (2/3 width) */}
          <div className="lg:col-span-2 space-y-2">

            {/* LAYER 1 — CLIENT */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: `1px solid ${C.blue}30` }}
            >
              <LayerHeader number="1" label={ar ? 'طبقة العميل' : 'Client Layer'} sublabel={ar ? 'واجهات المستخدم' : 'User Interfaces'} color={C.blue} />
              <div className="flex flex-wrap gap-3">
                <ServiceBox
                  icon={<Smartphone className="w-5 h-5" />}
                  label={ar ? 'تطبيق واصل' : 'Wasel Mobile App'}
                  sublabel={ar ? 'راكب / مسافر' : 'Rider / Ride-Sharer'}
                  color={C.blue}
                  active={activeService === 'mobile'}
                  onClick={() => setActiveService(s => s === 'mobile' ? null : 'mobile')}
                />
                <ServiceBox
                  icon={<Monitor className="w-5 h-5" />}
                  label={ar ? 'لوحة التحكم' : 'Web Admin Dashboard'}
                  sublabel={ar ? 'إدارة + تحليلات' : 'Management + Analytics'}
                  color={C.blue}
                  active={activeService === 'web'}
                  onClick={() => setActiveService(s => s === 'web' ? null : 'web')}
                />
                <ServiceBox
                  icon={<Globe className="w-5 h-5" />}
                  label={ar ? 'تطبيق الويب' : 'Web App (PWA)'}
                  sublabel="React 18 + Vite"
                  color={C.blue}
                />
              </div>
            </motion.div>

            {/* Connector 1→2 */}
            <div className="flex items-center gap-4 px-8">
              <div className="flex-1 h-px" style={{ background: `${C.teal}30` }} />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}30` }}>
                <Lock style={{ width: 10, height: 10, color: C.amber }} />
                <span style={{ color: C.amber, fontSize: '0.6rem', fontWeight: 700 }}>HTTPS / TLS 1.3</span>
              </div>
              <div className="flex-1 h-px" style={{ background: `${C.teal}30` }} />
            </div>

            {/* LAYER 2 — API GATEWAY */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: `1px solid ${C.teal}30` }}
            >
              <LayerHeader number="2" label={ar ? 'طبقة بوابة API' : 'API Gateway Layer'} sublabel={ar ? 'الأمان والتحقق' : 'Security + Validation'} color={C.teal} />
              <div className="flex flex-wrap gap-3">
                <ServiceBox
                  icon={<Server className="w-5 h-5" />}
                  label={ar ? 'البوابة الآمنة' : 'Secure API Gateway'}
                  sublabel="Supabase Edge Fn"
                  color={C.teal}
                  highlight
                />
                <ServiceBox
                  icon={<Zap className="w-5 h-5" />}
                  label={ar ? 'تحديد المعدّل' : 'Rate Limiting'}
                  sublabel="100 rps / user"
                  color={C.teal}
                />
                <ServiceBox
                  icon={<Eye className="w-5 h-5" />}
                  label={ar ? 'التحقق من الطلبات' : 'Request Validation'}
                  sublabel="Schema + Sanitize"
                  color={C.teal}
                />
                <ServiceBox
                  icon={<Key className="w-5 h-5" />}
                  label={ar ? 'التحقق من JWT' : 'JWT Verification'}
                  sublabel="RS256 · Signed"
                  color={C.teal}
                />
              </div>
            </motion.div>

            {/* Connector 2→3 */}
            <div className="flex items-center gap-4 px-8">
              <div className="flex-1 h-px" style={{ background: `${C.sanad}30` }} />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${C.sanad}15`, border: `1px solid ${C.sanad}40` }}>
                <ShieldCheck style={{ width: 10, height: 10, color: C.sanad }} />
                <span style={{ color: C.sanad, fontSize: '0.6rem', fontWeight: 700 }}>OAuth2 + PKCE</span>
              </div>
              <div className="flex-1 h-px" style={{ background: `${C.sanad}30` }} />
            </div>

            {/* LAYER 3 — AUTH & IDENTITY (SANAD ANCHOR) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{ background: C.card, border: `2px solid ${C.sanad}50`, boxShadow: `0 0 40px ${C.sanad}10` }}
            >
              {/* Sanad glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 70% 50%, ${C.sanad}08, transparent 60%)` }} />

              <div className="flex items-center justify-between mb-3 relative">
                <LayerHeader number="3" label={ar ? 'طبقة المصادقة والهوية' : 'Authentication & Identity Layer'} sublabel={ar ? 'واصل + سند = ثقة مضمونة' : 'Wasel Auth + Sanad = Guaranteed Trust'} color={C.sanad} />
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: `${C.sanad}20`, border: `1px solid ${C.sanad}` }}
                >
                  <ShieldCheck style={{ width: 12, height: 12, color: C.sanad }} />
                  <span style={{ color: C.sanad, fontSize: '0.62rem', fontWeight: 900 }}>TRUST ANCHOR</span>
                </motion.div>
              </div>

              <div className="flex flex-wrap gap-3 relative">
                <ServiceBox
                  icon={<Lock className="w-5 h-5" />}
                  label={ar ? 'Wasel Auth Service' : 'Wasel Auth Service'}
                  sublabel={ar ? 'مصادقة داخلية' : 'Internal Auth'}
                  color={C.teal}
                  highlight
                />
                {/* Sanad node — special */}
                <motion.div
                  whileHover={{ scale: 1.06, y: -3 }}
                  className="relative rounded-xl flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    padding: '10px 14px',
                    background: `${C.sanad}18`,
                    border: `2px solid ${C.sanad}`,
                    boxShadow: `0 0 24px ${C.sanad}30`,
                    minWidth: 100,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ background: `radial-gradient(circle, ${C.sanad}25, transparent 70%)` }}
                  />
                  <span className="text-2xl relative">🏛️</span>
                  <div className="text-white text-center font-black relative" style={{ fontWeight: 900, fontSize: '0.72rem' }}>Sanad | سند</div>
                  <div className="text-center relative" style={{ color: '#86efac', fontSize: '0.55rem', fontWeight: 700 }}>OAuth2 / OIDC</div>
                  <div className="text-center relative" style={{ color: '#86efac', fontSize: '0.52rem' }}>MoDEE · Gov.jo</div>
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-white font-black"
                    style={{ fontSize: '0.5rem', fontWeight: 900, background: C.sanad }}>🔐</span>
                </motion.div>

                <ServiceBox
                  icon={<RefreshCw className="w-5 h-5" />}
                  label={ar ? 'Token Exchange' : 'Token Exchange'}
                  sublabel={ar ? 'تبادل آمن' : 'Secure Swap'}
                  color={C.purple}
                />
                <div className="rounded-xl flex flex-col gap-1.5 p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minWidth: 120 }}>
                  <div className="text-white font-bold" style={{ fontWeight: 700, fontSize: '0.68rem' }}>{ar ? 'حالة KYC' : 'KYC Status Flag'}</div>
                  {[
                    { label: ar ? '✅ موثّق' : '✅ Verified',   color: C.success },
                    { label: ar ? '⏳ قيد المراجعة' : '⏳ Pending', color: C.amber },
                    { label: ar ? '❌ مرفوض' : '❌ Rejected',   color: C.red },
                  ].map(s => (
                    <span key={s.label} className="px-2 py-0.5 rounded-full"
                      style={{ fontSize: '0.58rem', fontWeight: 700, background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sanad verification note */}
              <div className="mt-3 p-2.5 rounded-lg flex flex-wrap gap-x-4 gap-y-1 relative"
                style={{ background: `${C.sanad}08`, border: `1px solid ${C.sanad}25` }}>
                <span style={{ color: C.sanad, fontSize: '0.65rem', fontWeight: 700 }}>{ar ? 'عند التوثيق:' : 'Sanad Verification unlocks:'}</span>
                {[
                  { en: '🔗 National ID hash (hashed, never raw)', ar: '🔗 هاش الرقم الوطني (لا يُخزَّن الرقم)' },
                  { en: '⬆�� Trust score +30 points',              ar: '⬆️ نقاط الثقة +30' },
                  { en: '🚗 High-value intercity rides unlocked',  ar: '🚗 رحلات بعيدة المدى مفتوحة' },
                  { en: '🛡️ Fraud risk score drops 60%',          ar: '🛡️ خطر الاحتيال ينخفض 60%' },
                ].map(p => (
                  <span key={p.en} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.6rem' }}>{ar ? p.ar : p.en}</span>
                ))}
              </div>
            </motion.div>

            {/* Connector 3→4 */}
            <div className="flex items-center gap-4 px-8">
              <div className="flex-1 h-px" style={{ background: `${C.purple}30` }} />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${C.purple}15`, border: `1px solid ${C.purple}30` }}>
                <Brain style={{ width: 10, height: 10, color: C.purple }} />
                <span style={{ color: C.purple, fontSize: '0.6rem', fontWeight: 700 }}>{ar ? 'خدمات المنصة' : 'Platform Services'}</span>
              </div>
              <div className="flex-1 h-px" style={{ background: `${C.purple}30` }} />
            </div>

            {/* LAYER 4 — CORE SERVICES */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: `1px solid ${C.purple}25` }}
            >
              <LayerHeader number="4" label={ar ? 'طبقة الخدمات الأساسية' : 'Core Services Layer'} sublabel={ar ? 'خدمات المنصة المستقلة' : 'Independent Platform Microservices'} color={C.purple} />
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Users className="w-4 h-4" />, label: 'User Service', labelAr: 'خدمة المستخدم', sub: 'Profiles · Auth' },
                  { icon: <Car className="w-4 h-4" />, label: 'Ride Service', labelAr: 'خدمة الرحلة', sub: 'Carpooling · BlaBlaCar' },
                  { icon: <Package className="w-4 h-4" />, label: 'Seat Marketplace', labelAr: 'سوق المقاعد', sub: 'Raje3 · Delivery' },
                  { icon: <Brain className="w-4 h-4" />, label: 'AI Route Engine', labelAr: 'محرك AI للطرق', sub: 'Optimization · Pricing' },
                  { icon: <Shield className="w-4 h-4" />, label: 'Trust & Safety', labelAr: 'الثقة والأمان', sub: 'Fraud · Sanad score' },
                  { icon: <AlertTriangle className="w-4 h-4" />, label: 'Dispute Resolution', labelAr: 'فض النزاعات', sub: 'Claims · Mediation' },
                ].map(s => (
                  <ServiceBox
                    key={s.label}
                    icon={s.icon}
                    label={ar ? s.labelAr : s.label}
                    sublabel={s.sub}
                    color={C.purple}
                    active={activeService === s.label}
                    onClick={() => setActiveService(p => p === s.label ? null : s.label)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Connector 4→5 */}
            <div className="flex items-center gap-4 px-8">
              <div className="flex-1 h-px" style={{ background: `${C.green}30` }} />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${C.green}15`, border: `1px solid ${C.green}30` }}>
                <Database style={{ width: 10, height: 10, color: C.green }} />
                <span style={{ color: C.green, fontSize: '0.6rem', fontWeight: 700 }}>E2E Encrypted</span>
              </div>
              <div className="flex-1 h-px" style={{ background: `${C.green}30` }} />
            </div>

            {/* LAYER 5 — DATA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: `1px solid ${C.green}25` }}
            >
              <LayerHeader number="5" label={ar ? 'طبقة البيانات' : 'Data Layer'} sublabel={ar ? 'تشفير شامل · بدون رقم وطني خام' : 'End-to-End Encryption · No Raw National ID'} color={C.green} />
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Database className="w-4 h-4" />, label: ar ? 'قاعدة بيانات مشفّرة' : 'Encrypted User DB', sub: 'AES-256 · Supabase Postgres' },
                  { icon: <BadgeCheck className="w-4 h-4" />, label: ar ? 'جدول حالة التوثيق' : 'Verification Status Table', sub: 'Sanad ref ID only' },
                  { icon: <Activity className="w-4 h-4" />, label: ar ? 'سجل المراجعة' : 'Audit Log Table', sub: 'Immutable · GDPR-ready' },
                  { icon: <Key className="w-4 h-4" />, label: ar ? 'تخزين التوكن' : 'Token Storage', sub: 'Short-lived · Encrypted' },
                ].map(s => (
                  <ServiceBox
                    key={s.label}
                    icon={s.icon}
                    label={s.label}
                    sublabel={s.sub}
                    color={C.green}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { en: '🔒 No raw national ID stored — only verification reference ID', ar: '🔒 لا رقم وطني خام — فقط معرّف التوثيق' },
                  { en: '🗑️ Automatic data purge on account deletion (GDPR Article 17)', ar: '🗑️ حذف تلقائي عند إغلاق الحساب (GDPR)' },
                ].map(n => (
                  <span key={n.en} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.62rem', background: `${C.green}08`, border: `1px solid ${C.green}20`, borderRadius: 6, padding: '2px 8px' }}>
                    {ar ? n.ar : n.en}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* LAYER 6 — TRUST LOGIC */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <LayerHeader number="6" label={ar ? 'منطق الثقة والأمان' : 'Trust & Safety Logic'} sublabel={ar ? 'الامتيازات بحسب مستوى التوثيق' : 'Capabilities unlocked by Sanad tier'} color={C.bronze} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: `${C.success}0c`, border: `1px solid ${C.success}30` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 style={{ width: 16, height: 16, color: C.success }} />
                    <span className="font-black text-white" style={{ fontWeight: 900, fontSize: '0.75rem' }}>
                      {ar ? 'إذا كان سند موثّقاً ✅' : 'IF Sanad Verified ✅'}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {[
                      { en: '⬆️ Higher booking limit per week', ar: '⬆️ حد حجز أسبوعي أعلى' },
                      { en: '🔝 Priority listing visibility', ar: '🔝 ظهور أولوي في القوائم' },
                      { en: '✂️ Reduced manual verification', ar: '✂️ تحقق يدوي مخفّض' },
                      { en: '🚗 High-value intercity rides enabled', ar: '🚗 رحلات بين المدن متاحة' },
                      { en: '⭐ Trust score badge displayed', ar: '⭐ شارة نقاط الثقة تُعرض' },
                    ].map(i => (
                      <li key={i.en} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.63rem' }}>{ar ? i.ar : i.en}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-3" style={{ background: `${C.red}0c`, border: `1px solid ${C.red}30` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle style={{ width: 16, height: 16, color: C.red }} />
                    <span className="font-black text-white" style={{ fontWeight: 900, fontSize: '0.75rem' }}>
                      {ar ? 'إذا لم يكن موثّقاً ❌' : 'IF Not Verified ❌'}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {[
                      { en: '⬇️ Limited booking capability', ar: '⬇️ قدرة حجز محدودة' },
                      { en: '🚫 Restricted seat selling', ar: '🚫 بيع مقاعد مقيّد' },
                      { en: '🔵 Prompted to verify via Sanad', ar: '🔵 دعوة للتوثيق عبر سند' },
                      { en: '📊 Lower trust score badge', ar: '📊 شارة ثقة منخفضة' },
                    ].map(i => (
                      <li key={i.en} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.63rem' }}>{ar ? i.ar : i.en}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT PANEL: OAuth2 Flow + Security Requirements */}
          <div className="space-y-4">

            {/* OAuth2 Animated Flow */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: `1px solid ${C.sanad}35`, boxShadow: `0 0 30px ${C.sanad}06` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-black text-white mb-0.5" style={{ fontWeight: 900, fontSize: '0.82rem' }}>
                    {ar ? 'تدفق OAuth2 · سند' : 'OAuth2 Flow · Sanad'}
                  </div>
                  <div style={{ color: C.sanad, fontSize: '0.62rem', fontWeight: 700 }}>
                    {ar ? 'خطوة بخطوة' : 'Step-by-step · PKCE + OIDC'}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: autoPlay ? 360 : 0 }}
                  transition={{ duration: 3, repeat: autoPlay ? Infinity : 0, ease: 'linear' }}
                >
                  <RefreshCw style={{ width: 14, height: 14, color: C.sanad }} />
                </motion.div>
              </div>

              <div className="space-y-2">
                {OAUTH_STEPS.map((step, idx) => {
                  const isActive = idx === activeStep % OAUTH_STEPS.length;
                  const isDone = idx < (activeStep % OAUTH_STEPS.length);
                  return (
                    <motion.div
                      key={step.id}
                      animate={{
                        background: isActive ? `${step.color}18` : isDone ? `${C.success}08` : 'rgba(0,0,0,0)',
                        borderColor: isActive ? step.color : isDone ? `${C.success}40` : 'rgba(255,255,255,0.06)',
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer"
                      onClick={() => { setAutoPlay(false); setActiveStep(idx); }}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-white"
                        style={{
                          fontSize: '0.65rem', fontWeight: 900,
                          background: isActive ? step.color : isDone ? C.success : 'rgba(255,255,255,0.08)',
                        }}>
                        {isDone ? '✓' : step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold truncate" style={{ fontWeight: 600, fontSize: '0.68rem' }}>
                          {ar ? step.ar : step.en}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{step.icon}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Active step detail */}
              <AnimatePresence mode="wait">
                {currentStep && (
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="mt-3 p-3 rounded-xl"
                    style={{ background: `${currentStep.color}12`, border: `1px solid ${currentStep.color}35` }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.1rem' }}>{currentStep.icon}</span>
                      <span className="text-white font-bold" style={{ fontWeight: 700, fontSize: '0.72rem' }}>
                        {ar ? currentStep.ar : currentStep.en}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Security Requirements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl p-4"
              style={{ background: C.card, border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="font-black text-white mb-3" style={{ fontWeight: 900, fontSize: '0.82rem' }}>
                🔐 {ar ? 'متطلبات الأمان' : 'Security Requirements'}
              </div>
              <div className="space-y-2">
                {SECURITY_REQUIREMENTS.map(r => (
                  <div key={r.en} className="flex items-center gap-2.5 p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{r.icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', fontWeight: 600 }}>
                      {ar ? r.ar : r.en}
                    </span>
                    <CheckCircle2 style={{ width: 12, height: 12, color: C.success, marginLeft: 'auto', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Version / compliance stamp */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-4"
              style={{ background: `linear-gradient(135deg, ${C.sanad}0a, ${C.teal}0a)`, border: `1px solid ${C.sanad}25` }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇯🇴</div>
                <div className="font-black text-white mb-1" style={{ fontWeight: 900, fontSize: '0.8rem' }}>
                  {ar ? 'سند | وزارة الاقتصاد الرقمي' : 'Sanad | MoDEE Jordan'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.62rem', lineHeight: 1.6 }}>
                  api.sanad.gov.jo/v1<br />
                  OAuth2 · PKCE · OIDC<br />
                  KYC Tier 3 & 4<br />
                  🟡 Mock Mode — Live pending MoDEE
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {['ISO 27001', 'GDPR-ready', 'PCI-DSS L1', 'Jordan PDPL'].map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full"
                      style={{ fontSize: '0.55rem', fontWeight: 700, background: `${C.sanad}15`, border: `1px solid ${C.sanad}30`, color: '#86efac' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Footer annotation ── */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center py-4 border-t border-white/5"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}
        >
          Wasel | واصل × Sanad | سند — Backend Integration Architecture v2.0 · 2026-03
          <br />
          {ar ? 'جميع الاتصالات مشفرة · لا يُخزَّن رقم وطني خام · متوافق مع GDPR و PDPL الأردني' : 'All connections encrypted · No raw national ID stored · GDPR + Jordan PDPL compliant'}
        </motion.div>
      </div>
    </div>
  );
}