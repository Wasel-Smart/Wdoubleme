/**
 * TrustSafetyHub — Wasel | واصل
 * AI-Powered Trust & Safety Layer
 *
 * Features:
 *  • Real-time Trust Score (0–100) with animated gauge
 *  • Sanad multi-step identity verification
 *  • SOS emergency with 5-second countdown + contacts
 *  • Live behavioral scoring (punctuality, completion, ratings)
 *  • AR identity verification (simulated flow)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, AlertTriangle, CheckCircle2, Clock, Star,
  Phone, MapPin, Camera, Eye, Fingerprint, FileText,
  ChevronRight, X, Zap, TrendingUp, Award, Lock,
  Radio, Wifi, AlertCircle, User, Car,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrustScoreBreakdown {
  identityVerification: number; // /25
  communityRating:      number; // /25
  completionRate:       number; // /20
  punctualityRate:      number; // /15
  communityStanding:    number; // /15
}

interface SanadStep {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  status: 'verified' | 'pending' | 'required' | 'failed';
  icon: React.ComponentType<any>;
  points: number;
}

interface BehavioralMetric {
  label: string;
  labelAr: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrustGauge({ score, size = 180 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  // Only show 270° of the circle (from 135° to 405°)
  const arcLength = circumference * 0.75;
  const offset = circumference - (score / 100) * arcLength;

  const color =
    score >= 80 ? '#04ADBF' :
    score >= 60 ? '#ABD907' :
    score >= 40 ? '#F59E0B' : '#EF4444';

  const label =
    score >= 80 ? 'Excellent' :
    score >= 60 ? 'Good' :
    score >= 40 ? 'Fair' : 'Low';
  const labelAr =
    score >= 80 ? 'ممتاز' :
    score >= 60 ? 'جيد' :
    score >= 40 ? 'مقبول' : 'منخفض';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)"
          strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        {/* Score arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      {/* Score number centered */}
      <div className="flex flex-col items-center" style={{ marginTop: `-${size * 0.55}px` }}>
        <motion.span
          className="font-black text-white"
          style={{ fontSize: size * 0.26 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs font-medium" style={{ color }}>
          {label} · {labelAr}
        </span>
      </div>
    </div>
  );
}

function SanadBadge({ level }: { level: 'none' | 'basic' | 'advanced' | 'full' }) {
  const config = {
    none:     { label: 'Unverified',  labelAr: 'غير موثق',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    basic:    { label: 'Basic',       labelAr: 'أساسي',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    advanced: { label: 'Advanced',    labelAr: 'متقدم',       color: '#04ADBF', bg: 'rgba(4,173,191,0.12)' },
    full:     { label: 'Sanad Full',  labelAr: 'سند كامل',    color: '#ABD907', bg: 'rgba(171,217,7,0.15)' },
  }[level];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}40` }}
    >
      <Shield size={12} />
      <span>{config.label}</span>
      <span className="opacity-60">·</span>
      <span>{config.labelAr}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TrustSafetyHub() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'score' | 'sanad' | 'sos' | 'ar'>('score');
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [arStage, setArStage] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const sosIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mock trust data (in production: fetch from Sanad service)
  const trustScore = 82;
  const breakdown: TrustScoreBreakdown = {
    identityVerification: 22,
    communityRating:      21,
    completionRate:       18,
    punctualityRate:      12,
    communityStanding:    9,
  };

  const sanadSteps: SanadStep[] = [
    {
      id: 'phone', label: 'Phone Verified', labelAr: 'رقم الهاتف',
      description: 'Your phone number is confirmed via OTP',
      descriptionAr: 'تم تأكيد رقم هاتفك عبر OTP',
      status: 'verified', icon: Phone, points: 10,
    },
    {
      id: 'national_id', label: 'National ID', labelAr: 'الهوية الوطنية',
      description: 'Scan your national ID card',
      descriptionAr: 'قم بمسح هويتك الوطنية',
      status: 'verified', icon: FileText, points: 15,
    },
    {
      id: 'face', label: 'Face Verification', labelAr: 'التحقق بالوجه',
      description: 'Real-time face match with your ID',
      descriptionAr: 'مطابقة وجهك مع صورة الهوية',
      status: 'verified', icon: Camera, points: 15,
    },
    {
      id: 'driving_license', label: 'Driving License', labelAr: 'رخصة القيادة',
      description: 'Required for travelers only',
      descriptionAr: 'مطلوبة للمسافرين (السائقين) فقط',
      status: 'pending', icon: Car, points: 20,
    },
    {
      id: 'police_clearance', label: 'Police Clearance', labelAr: 'فيش وتشبيه',
      description: 'Background check certificate',
      descriptionAr: 'شهادة حسن السيرة والسلوك',
      status: 'required', icon: Shield, points: 25,
    },
    {
      id: 'fingerprint', label: 'Biometric Link', labelAr: 'البصمة الحيوية',
      description: 'Link your national biometric ID',
      descriptionAr: 'ربط هويتك البيومترية الوطنية',
      status: 'required', icon: Fingerprint, points: 15,
    },
  ];

  const behavioralMetrics: BehavioralMetric[] = [
    { label: 'Trip Completion', labelAr: 'اكتمال الرحلات', value: 96, max: 100, unit: '%', color: '#04ADBF' },
    { label: 'On-Time Rate',    labelAr: 'الالتزام بالوقت', value: 91, max: 100, unit: '%', color: '#ABD907' },
    { label: 'Response Rate',   labelAr: 'معدل الاستجابة',  value: 88, max: 100, unit: '%', color: '#D9965B' },
    { label: 'Avg Rating',      labelAr: 'متوسط التقييم',   value: 4.8, max: 5,  unit: '★', color: '#F59E0B' },
    { label: 'Total Trips',     labelAr: 'إجمالي الرحلات',  value: 47, max: 100, unit: '',  color: '#04ADBF' },
  ];

  // SOS Logic
  const triggerSOS = useCallback(() => {
    if (sosActive) return;
    setSosActive(true);
    setSosCountdown(5);
  }, [sosActive]);

  const cancelSOS = useCallback(() => {
    setSosActive(false);
    setSosCountdown(null);
    if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
  }, []);

  useEffect(() => {
    if (sosCountdown === null || !sosActive) return;

    if (sosCountdown === 0) {
      setSosTriggered(true);
      setSosCountdown(null);
      setSosActive(false);
      return;
    }

    sosIntervalRef.current = setInterval(() => {
      setSosCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => { if (sosIntervalRef.current) clearInterval(sosIntervalRef.current); };
  }, [sosCountdown, sosActive]);

  const tabs = [
    { id: 'score', label: 'Trust Score', labelAr: 'درجة الثقة', icon: Shield },
    { id: 'sanad', label: 'Sanad ID',    labelAr: 'سند',         icon: Fingerprint },
    { id: 'sos',   label: 'SOS',         labelAr: 'طوارئ',        icon: AlertTriangle },
    { id: 'ar',    label: 'AR Verify',   labelAr: 'هوية AR',      icon: Camera },
  ] as const;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0B1120', direction: ar ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe"
        style={{
          background: 'rgba(11,17,32,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-2xl mx-auto py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield size={20} className="text-teal-400" />
              {ar ? 'مركز الثقة والسلامة' : 'Trust & Safety Hub'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {ar ? 'مدعوم بالذكاء الاصطناعي — سند' : 'AI-Powered · Sanad Verified'}
            </p>
          </div>
          <SanadBadge level="advanced" />
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto flex gap-1 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(4,173,191,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#04ADBF' : '#64748B',
                border: activeTab === tab.id ? '1px solid rgba(4,173,191,0.3)' : '1px solid transparent',
              }}
            >
              <tab.icon size={14} />
              <span className="hidden sm:block">{ar ? tab.labelAr : tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── TRUST SCORE TAB ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'score' && (
            <motion.div key="score"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              {/* Gauge card */}
              <div
                className="rounded-2xl p-6 flex flex-col items-center gap-4"
                style={{
                  background: 'var(--wasel-glass-lg)',
                  border: '1px solid rgba(4,173,191,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <TrustGauge score={trustScore} />
                <p className="text-sm text-slate-400 text-center max-w-xs">
                  {ar
                    ? 'درجة ثقتك تعكس موثوقيتك كمسافر في منصة واصل'
                    : 'Your trust score reflects your reliability as a traveler on Wasel'}
                </p>

                {/* Score breakdown */}
                <div className="w-full space-y-3 pt-2">
                  {[
                    { label: 'Identity Verified', labelAr: 'التحقق من الهوية', val: breakdown.identityVerification, max: 25, color: '#04ADBF' },
                    { label: 'Community Rating',  labelAr: 'تقييم المجتمع',    val: breakdown.communityRating,      max: 25, color: '#ABD907' },
                    { label: 'Trip Completion',   labelAr: 'إتمام الرحلات',    val: breakdown.completionRate,        max: 20, color: '#D9965B' },
                    { label: 'Punctuality',       labelAr: 'الانضباط بالوقت',  val: breakdown.punctualityRate,       max: 15, color: '#F59E0B' },
                    { label: 'Community Standing',labelAr: 'السمعة المجتمعية', val: breakdown.communityStanding,     max: 15, color: '#3B82F6' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{ar ? item.labelAr : item.label}</span>
                        <span className="text-white font-medium">{item.val}/{item.max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.val / item.max) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral metrics */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-teal-400" />
                  {ar ? 'الأداء السلوكي المباشر' : 'Real-Time Behavioral Metrics'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {behavioralMetrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="text-2xl font-black" style={{ color: m.color }}>
                        {m.value}{m.unit}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{ar ? m.labelAr : m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live status */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(4,173,191,0.08)', border: '1px solid rgba(4,173,191,0.2)' }}>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping opacity-50" />
                </div>
                <span className="text-sm text-teal-300">
                  {ar ? 'نظام الثقة يعمل بالوقت الفعلي — آخر تحديث منذ ثوان' : 'Trust engine live — updated seconds ago'}
                </span>
                <Wifi size={14} className="text-teal-400 ms-auto" />
              </div>
            </motion.div>
          )}

          {/* ── SANAD TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'sanad' && (
            <motion.div key="sanad"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-4"
            >
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid rgba(4,173,191,0.2)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-white">
                    {ar ? 'التحقق متعدد المراحل — سند' : 'Multi-Step Verification — Sanad'}
                  </h3>
                  <SanadBadge level="advanced" />
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  {ar
                    ? 'أكمل جميع الخطوات للحصول على شارة سند الكاملة وزيادة درجة الثقة'
                    : 'Complete all steps to earn the full Sanad badge and maximize trust score'}
                </p>

                <div className="space-y-3">
                  {sanadSteps.map((step, idx) => {
                    const statusConfig = {
                      verified: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  icon: CheckCircle2, label: 'Verified', labelAr: 'موثق' },
                      pending:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: Clock,          label: 'Pending',  labelAr: 'قيد المراجعة' },
                      required: { color: '#D9965B', bg: 'rgba(217,150,91,0.1)', border: 'rgba(217,150,91,0.3)', icon: AlertCircle,    label: 'Required', labelAr: 'مطلوب' },
                      failed:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  icon: X,             label: 'Failed',   labelAr: 'فشل' },
                    }[step.status];

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: ar ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group"
                        style={{
                          background: statusConfig.bg,
                          border: `1px solid ${statusConfig.border}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <step.icon size={18} style={{ color: statusConfig.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">
                              {ar ? step.labelAr : step.label}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}
                            >
                              {ar ? statusConfig.labelAr : statusConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {ar ? step.descriptionAr : step.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold" style={{ color: statusConfig.color }}>
                            +{step.points}
                          </span>
                          {step.status !== 'verified' && (
                            <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div
                  className="mt-4 p-3 rounded-xl text-xs text-center text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {ar
                    ? '🔒 بياناتك مشفرة ومحمية وفق معايير ISO 27001'
                    : '🔒 Your data is encrypted and protected under ISO 27001 standards'}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SOS TAB ────────────────────────────────────────────────────── */}
          {activeTab === 'sos' && (
            <motion.div key="sos"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              {/* SOS Button */}
              <div
                className="rounded-2xl p-6 flex flex-col items-center gap-6"
                style={{
                  background: sosTriggered
                    ? 'rgba(239,68,68,0.12)'
                    : 'var(--wasel-glass-lg)',
                  border: `1px solid ${sosTriggered ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <AnimatePresence mode="wait">
                  {sosTriggered ? (
                    <motion.div key="triggered" initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex flex-col items-center gap-3 text-center"
                    >
                      <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.2)', border: '2px solid #EF4444' }}>
                        <Radio size={36} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-red-400 font-bold text-lg">
                          {ar ? '🚨 تم إرسال إشارة الطوارئ' : '🚨 SOS Alert Sent'}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          {ar ? 'تم إخطار جهات الاتصال وفريق واصل' : 'Contacts and Wasel team notified'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 justify-center">
                          <MapPin size={10} />
                          {ar ? 'يتم مشاركة موقعك المباشر' : 'Your live location is being shared'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSosTriggered(false)}
                        className="px-6 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        {ar ? 'إلغاء التنبيه' : 'Cancel Alert'}
                      </button>
                    </motion.div>
                  ) : sosActive ? (
                    <motion.div key="countdown" className="flex flex-col items-center gap-4">
                      <motion.div
                        className="w-28 h-28 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: 'rgba(239,68,68,0.2)', border: '3px solid #EF4444' }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        onClick={cancelSOS}
                      >
                        <span className="text-5xl font-black text-red-400">{sosCountdown}</span>
                      </motion.div>
                      <p className="text-slate-400 text-sm text-center">
                        {ar ? 'اضغط للإلغاء — سيتم إرسال التنبيه تلقائياً' : 'Tap to cancel — alert sends automatically'}
                      </p>
                      <button
                        onClick={cancelSOS}
                        className="px-8 py-2.5 rounded-full font-semibold text-sm"
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}
                      >
                        {ar ? '✕ إلغاء' : '✕ Cancel SOS'}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" className="flex flex-col items-center gap-4">
                      <p className="text-sm text-slate-400 text-center">
                        {ar ? 'في حالة الطوارئ اضغط على الزر' : 'Press the button in case of emergency'}
                      </p>
                      <motion.button
                        onClick={triggerSOS}
                        className="w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 font-black text-white text-xl cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                          boxShadow: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)',
                          border: '3px solid rgba(239,68,68,0.6)',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <AlertTriangle size={28} />
                        SOS
                      </motion.button>
                      <p className="text-xs text-slate-500 text-center max-w-xs">
                        {ar
                          ? 'سيتم تنبيه جهات اتصالك وفريق واصل ومشاركة موقعك خلال 5 ثوان'
                          : 'Your contacts, Wasel team, and location will be shared in 5 seconds'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Emergency contacts */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Phone size={14} className="text-teal-400" />
                  {ar ? 'جهات الاتصال الطارئة' : 'Emergency Contacts'}
                </h3>
                {[
                  { name: ar ? 'الدفاع المدني' : 'Civil Defense', phone: '911',  type: ar ? 'طوارئ' : 'Emergency', color: '#EF4444' },
                  { name: ar ? 'دعم واصل 24/7'  : 'Wasel Support 24/7', phone: '+962 79 000 0000', type: ar ? 'منصة' : 'Platform', color: '#04ADBF' },
                  { name: ar ? 'جهة الاتصال 1'  : 'Emergency Contact 1', phone: '+962 79 123 4567', type: ar ? 'شخصي' : 'Personal', color: '#ABD907' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${c.color}18`, border: `1px solid ${c.color}40` }}>
                      <Phone size={14} style={{ color: c.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full"
                      style={{ background: `${c.color}18`, color: c.color }}>
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── AR IDENTITY TAB ────────────────────────────────────────────── */}
          {activeTab === 'ar' && (
            <motion.div key="ar-verify"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="space-y-5"
            >
              <div
                className="rounded-2xl p-6 flex flex-col items-center gap-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid rgba(4,173,191,0.2)' }}
              >
                {arStage === 'idle' && (
                  <>
                    <div
                      className="w-48 h-48 rounded-2xl flex items-center justify-center relative overflow-hidden"
                      style={{ background: 'rgba(4,173,191,0.08)', border: '2px dashed rgba(4,173,191,0.3)' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Corner brackets */}
                        {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
                          <div key={pos} className={`absolute ${pos} w-6 h-6`}
                            style={{ border: '2px solid #04ADBF', borderRadius: 3 }} />
                        ))}
                        <User size={60} className="text-teal-600" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold text-white">
                        {ar ? 'التحقق بالواقع المعزز (AR)' : 'AR Identity Verification'}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-xs">
                        {ar
                          ? 'وجّه كاميرتك نحو وجهك لمطابقة هويتك الوطنية بتقنية الذكاء الاصطناعي'
                          : 'Point your camera at your face to match your national ID using AI'}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => { setArStage('scanning'); setTimeout(() => setArStage('verified'), 3500); }}
                      className="px-8 py-3 rounded-full font-semibold text-sm text-white flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #04ADBF, #09732E)' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Camera size={16} />
                      {ar ? 'بدء المسح' : 'Start Scan'}
                    </motion.button>
                  </>
                )}

                {arStage === 'scanning' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(4,173,191,0.06)', border: '2px solid rgba(4,173,191,0.4)' }}>
                      <User size={80} className="absolute inset-0 m-auto text-teal-700" />
                      {/* Scanning line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5"
                        style={{ background: 'linear-gradient(90deg, transparent, #04ADBF, transparent)' }}
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      {/* Corner scan brackets */}
                      <motion.div
                        className="absolute inset-2"
                        style={{ border: '2px solid rgba(4,173,191,0.6)', borderRadius: 8 }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-teal-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      {ar ? 'جارٍ المسح والتحقق...' : 'Scanning & verifying...'}
                    </div>
                  </div>
                )}

                {arStage === 'verified' && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-4 text-center"
                  >
                    <motion.div
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '3px solid #22C55E' }}
                      animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 20px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }}
                      transition={{ duration: 1.5, repeat: 2 }}
                    >
                      <CheckCircle2 size={44} className="text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-green-400 text-lg font-bold">
                        {ar ? '✓ تم التحقق من الهوية' : '✓ Identity Verified'}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        {ar ? 'وجهك يطابق هويتك الوطنية بنسبة 98.7%' : 'Face matches national ID at 98.7% confidence'}
                      </p>
                      <div className="flex items-center gap-2 justify-center mt-3 flex-wrap">
                        {['Liveness ✓', 'ID Match ✓', 'Anti-Spoofing ✓'].map((tag) => (
                          <span key={tag} className="text-xs px-3 py-1 rounded-full"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setArStage('idle')}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      {ar ? 'إعادة المسح' : 'Re-scan'}
                    </button>
                  </motion.div>
                )}
              </div>

              {/* AI safety features */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Eye,        label: 'Liveness Check',    labelAr: 'كشف الحيوية',     color: '#04ADBF' },
                  { icon: Lock,       label: 'Anti-Spoofing',     labelAr: 'مكافحة الانتحال',  color: '#ABD907' },
                  { icon: Zap,        label: 'Instant Match',     labelAr: 'مطابقة فورية',     color: '#D9965B' },
                  { icon: Shield,     label: 'ISO 27001',         labelAr: 'معيار الأمان',     color: '#3B82F6' },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
                  >
                    <item.icon size={18} style={{ color: item.color, flexShrink: 0 }} />
                    <div>
                      <p className="text-xs font-semibold text-white">{ar ? item.labelAr : item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TrustSafetyHub;
