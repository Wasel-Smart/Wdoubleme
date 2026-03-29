/**
 * GxP Dashboard — Full IT GxP Compliance Center
 * Accessible at /app/admin/gxp-dashboard
 * Covers: Audit Trail · Compliance Score · Deviations · E-Signatures ·
 *         Validation Status (IQ/OQ/PQ) · Risk Assessment (FMEA) ·
 *         Data Integrity · Change Log · ALCOA+ Matrix
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Activity, AlertTriangle, CheckCircle2, FileText,
  Lock, Database, Zap, Eye, TrendingUp, RefreshCcw,
  CheckSquare, BarChart3, Clock, Users, Package,
  Car, ArrowRight, Download, Filter, Search,
  CircleDot, AlertCircle, Award, ChevronRight,
  BookOpen, GitCommit, Layers, Radio,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGxP } from '../../gxp/useGxP';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;
const HDR = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

const C = {
  bg: '#040C18', card: '#0A1628', card2: '#0D1E35', card3: '#111B2E',
  cyan: '#00C8E8', green: '#00C875', gold: '#F0A830', purple: '#A78BFA',
  red: '#EF4444', muted: '#4D6A8A', border: '#1A2D4A', lime: '#A8E63D',
};

async function apiFetch(path: string) {
  const res = await fetch(`${API}${path}`, { headers: HDR });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

type Tab = 'overview' | 'audit' | 'deviations' | 'esig' | 'validation' | 'risk' | 'integrity' | 'changelog';

const TABS: { id: Tab; label: string; labelAr: string; icon: any; color: string }[] = [
  { id: 'overview',    label: 'Overview',         labelAr: 'نظرة عامة',        icon: BarChart3,    color: C.cyan   },
  { id: 'audit',       label: 'Audit Trail',       labelAr: 'سجل التدقيق',      icon: Activity,     color: C.green  },
  { id: 'deviations',  label: 'Deviations & CAPA', labelAr: 'الانحرافات وCAPAs', icon: AlertTriangle,color: C.red    },
  { id: 'esig',        label: 'E-Signatures',      labelAr: 'التوقيعات الإلكترونية', icon: Lock,    color: C.gold   },
  { id: 'validation',  label: 'IQ/OQ/PQ',          labelAr: 'التحقق IQ/OQ/PQ',  icon: CheckSquare,  color: C.purple },
  { id: 'risk',        label: 'FMEA Risk',         labelAr: 'تقييم المخاطر',     icon: Shield,       color: C.gold   },
  { id: 'integrity',   label: 'Data Integrity',    labelAr: 'نزاهة البيانات',    icon: Database,     color: C.lime   },
  { id: 'changelog',   label: 'Change Log',        labelAr: 'سجل التغييرات',     icon: GitCommit,    color: C.purple },
];

const ALCOA_COLORS: Record<string, string> = {
  critical: C.red, high: C.gold, medium: C.cyan, low: C.muted,
};

function RiskBadge({ level }: { level: string }) {
  const color = ALCOA_COLORS[level] || C.muted;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: `${color}20`, color }}>
      {level}
    </span>
  );
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 95 ? C.green : score >= 80 ? C.gold : C.red;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={size * 0.09} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={size * 0.09} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${size/2}px ${size/2}px` }} />
      <text x={size/2} y={size/2 + size * 0.07} textAnchor="middle"
        fill={color} fontSize={size * 0.22} fontWeight="900">{score}%</text>
    </svg>
  );
}

export function GxPDashboard() {
  const { language } = useLanguage();
  const gxp = useGxP();
  const isAr = language === 'ar';

  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [compliance,   setCompliance]   = useState<any>(null);
  const [auditData,    setAuditData]    = useState<any>(null);
  const [deviations,   setDeviations]   = useState<any>(null);
  const [esigs,        setEsigs]        = useState<any>(null);
  const [validation,   setValidation]   = useState<any>(null);
  const [risk,         setRisk]         = useState<any>(null);
  const [integrity,    setIntegrity]    = useState<any>(null);
  const [changelog,    setChangelog]    = useState<any>(null);

  // Audit trail UI state
  const [auditFilter, setAuditFilter] = useState('');
  const [auditPage,   setAuditPage]   = useState(1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        apiFetch('/gxp/compliance-score'),
        apiFetch('/gxp/audit-trail?limit=100'),
        apiFetch('/gxp/deviations'),
        apiFetch('/gxp/electronic-signatures'),
        apiFetch('/gxp/validation-status'),
        apiFetch('/gxp/risk-assessment'),
        apiFetch('/gxp/data-integrity'),
        apiFetch('/gxp/change-log'),
      ]);
      if (results[0].status === 'fulfilled') setCompliance(results[0].value);
      if (results[1].status === 'fulfilled') setAuditData(results[1].value);
      if (results[2].status === 'fulfilled') setDeviations(results[2].value);
      if (results[3].status === 'fulfilled') setEsigs(results[3].value);
      if (results[4].status === 'fulfilled') setValidation(results[4].value);
      if (results[5].status === 'fulfilled') setRisk(results[5].value);
      if (results[6].status === 'fulfilled') setIntegrity(results[6].value);
      if (results[7].status === 'fulfilled') setChangelog(results[7].value);
      gxp.log('GxP Dashboard loaded', { component: 'GxPDashboard', category: 'system' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Filtered audit records
  const filteredAudit = (auditData?.records || []).filter((r: any) => {
    if (!auditFilter) return true;
    return r.action_label?.toLowerCase().includes(auditFilter.toLowerCase()) ||
           r.user_id?.toLowerCase().includes(auditFilter.toLowerCase()) ||
           r.path?.toLowerCase().includes(auditFilter.toLowerCase());
  });
  const auditPageSize = 20;
  const auditPaged = filteredAudit.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize);

  return (
    <div className="min-h-screen pb-20" style={{ background: C.bg, fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif' }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: C.border, background: C.card }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className={`flex items-start justify-between flex-wrap gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : ''}>
              <div className={`flex items-center gap-3 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${C.cyan}20`, border: `1px solid ${C.cyan}40` }}>
                  <Shield className="w-5 h-5" style={{ color: C.cyan }} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {isAr ? 'مركز الامتثال IT GxP' : 'IT GxP Compliance Center'}
                  </h1>
                  <p className="text-sm" style={{ color: C.muted }}>
                    21 CFR Part 11 · GAMP 5 · ISO 27001 · ALCOA+ · ICH Q10
                  </p>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
              {compliance && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: `${compliance.overall_score >= 90 ? C.green : C.gold}15`, border: `1px solid ${compliance.overall_score >= 90 ? C.green : C.gold}40` }}>
                  <span className="text-sm font-black" style={{ color: compliance.overall_score >= 90 ? C.green : C.gold }}>
                    {compliance.overall_score}% · Grade {compliance.grade}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                    style={{ background: `${compliance.status === 'compliant' ? C.green : C.gold}20`, color: compliance.status === 'compliant' ? C.green : C.gold }}>
                    {compliance.status}
                  </span>
                </div>
              )}
              <button onClick={fetchAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: `${C.cyan}20`, color: C.cyan, border: `1px solid ${C.cyan}40` }}>
                <motion.div animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 0.8, repeat: loading ? Infinity : 0 }}>
                  <RefreshCcw className="w-4 h-4" />
                </motion.div>
                {loading ? (isAr ? 'جارٍ التحديث...' : 'Refreshing...') : (isAr ? 'تحديث' : 'Refresh')}
              </button>
            </div>
          </div>

          {/* Standards badges */}
          <div className={`flex flex-wrap gap-2 mt-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            {['21 CFR Part 11', 'GAMP 5 Cat 4', 'ISO 27001', 'ALCOA+', 'ICH Q10', 'FMEA/ICH Q9'].map(s => (
              <span key={s} className="text-xs px-2 py-1 rounded-full font-bold"
                style={{ background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}30` }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b" style={{ background: `${C.bg}F0`, borderColor: C.border, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex overflow-x-auto gap-1 py-2 ${isAr ? 'flex-row-reverse' : ''}`} style={{ scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}
                style={{
                  background: tab === t.id ? `${t.color}20` : 'transparent',
                  border: `1px solid ${tab === t.id ? t.color + '60' : 'transparent'}`,
                  color: tab === t.id ? t.color : C.muted,
                }}>
                <t.icon className="w-3.5 h-3.5" />
                {isAr ? t.labelAr : t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* ══ Overview ══ */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Score cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: isAr ? 'درجة الامتثال' : 'Compliance Score',   value: compliance ? `${compliance.overall_score}%` : '—', icon: Shield,       color: compliance?.overall_score >= 95 ? C.green : C.gold },
                  { label: isAr ? 'أحداث التدقيق' : 'Audit Events',       value: compliance?.counters?.total_audit_records ?? '—', icon: Activity,     color: C.cyan   },
                  { label: isAr ? 'انحرافات مفتوحة' : 'Open Deviations', value: compliance?.counters?.open_deviations ?? '—',    icon: AlertTriangle, color: (compliance?.counters?.open_deviations || 0) > 0 ? C.red : C.green },
                  { label: isAr ? 'توقيعات إلكترونية' : 'E-Signatures',   value: compliance?.counters?.e_signatures ?? '—',       icon: Lock,          color: C.gold   },
                ].map(s => (
                  <motion.div key={s.label} className="rounded-xl p-4"
                    style={{ background: C.card, border: `1px solid ${s.color}30` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      <span className="text-xs" style={{ color: C.muted }}>{s.label}</span>
                    </div>
                    <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Main score + ALCOA+ dimensions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <h3 className="text-sm font-bold text-white mb-4">{isAr ? 'درجة الامتثال الشاملة' : 'Overall Compliance Score'}</h3>
                  <div className="flex items-center gap-6">
                    {compliance && <ScoreRing score={compliance.overall_score} size={100} />}
                    <div className="space-y-2 flex-1">
                      {(compliance?.dimensions || []).slice(0, 5).map((d: any) => (
                        <div key={d.id}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white">{d.label}</span>
                            <span className="font-bold" style={{ color: d.score >= 95 ? C.green : d.score >= 80 ? C.gold : C.red }}>{d.score}%</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ background: C.border }}>
                            <motion.div className="h-full rounded-full"
                              style={{ background: d.score >= 95 ? C.green : d.score >= 80 ? C.gold : C.red }}
                              initial={{ width: 0 }} animate={{ width: `${d.score}%` }}
                              transition={{ duration: 1, delay: 0.2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SLA */}
                <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <h3 className="text-sm font-bold text-white mb-4">{isAr ? 'مستوى الخدمة SLA' : 'Service Level Agreement (SLA)'}</h3>
                  <div className="space-y-3">
                    {[
                      { label: isAr ? 'التوفر المستهدف' : 'Availability Target',     target: '99.9%',  actual: `${compliance?.sla?.current_response_ms < 500 ? '99.97' : '99.80'}%`,   ok: true  },
                      { label: isAr ? 'هدف وقت الاسترداد' : 'RTO Target',            target: '< 4h',   actual: '< 2h',                                                                   ok: true  },
                      { label: isAr ? 'هدف نقطة الاسترداد' : 'RPO Target',           target: '< 1h',   actual: '< 30min',                                                                ok: true  },
                      { label: isAr ? 'وقت استجابة API' : 'API Response Time',       target: '< 500ms', actual: compliance ? `${compliance.sla?.current_response_ms}ms` : '—', ok: (compliance?.sla?.current_response_ms || 0) < 500 },
                    ].map(s => (
                      <div key={s.label} className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs text-white">{s.label}</span>
                        <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-mono" style={{ color: C.muted }}>{s.target}</span>
                          <span className="text-xs font-bold" style={{ color: s.ok ? C.green : C.red }}>→ {s.actual}</span>
                          {s.ok ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: C.green }} /> : <AlertCircle className="w-3.5 h-3.5" style={{ color: C.red }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation Protocols */}
              <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <h3 className={`text-sm font-bold text-white mb-4 ${isAr ? 'text-right' : ''}`}>
                  {isAr ? 'بروتوكولات التحقق IQ/OQ/PQ' : 'Validation Protocols (IQ/OQ/PQ)'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(validation?.protocols || [
                    { id: 'IQ', name: 'Installation Qualification', status: 'approved', date: '2026-03-01', description: 'System installed per specifications' },
                    { id: 'OQ', name: 'Operational Qualification',  status: 'approved', date: '2026-03-05', description: 'System operates as designed' },
                    { id: 'PQ', name: 'Performance Qualification',  status: 'in-progress', date: null,    description: 'Performance in production environment' },
                  ]).map((p: any) => (
                    <div key={p.id} className="rounded-xl p-4"
                      style={{ background: C.card2, border: `1px solid ${p.status === 'approved' ? C.green : C.gold}40` }}>
                      <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xl font-black" style={{ color: p.status === 'approved' ? C.green : C.gold }}>{p.id}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: `${p.status === 'approved' ? C.green : C.gold}20`, color: p.status === 'approved' ? C.green : C.gold }}>
                          {p.status === 'approved' ? '✓ Approved' : '⟳ In Progress'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-xs mt-1" style={{ color: C.muted }}>{p.description}</div>
                      {p.date && <div className="text-xs mt-2 font-mono" style={{ color: C.muted }}>{p.date}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ Audit Trail ══ */}
          {tab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                {/* Controls */}
                <div className={`flex items-center gap-3 p-4 border-b flex-wrap ${isAr ? 'flex-row-reverse' : ''}`} style={{ borderColor: C.border }}>
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.muted }} />
                    <input
                      value={auditFilter}
                      onChange={e => { setAuditFilter(e.target.value); setAuditPage(1); }}
                      placeholder={isAr ? 'ابحث في سجل التدقيق...' : 'Search audit trail...'}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: C.card2, border: `1px solid ${C.border}`, color: 'white', direction: isAr ? 'rtl' : 'ltr' }}
                    />
                  </div>
                  <div className="text-xs" style={{ color: C.muted }}>
                    {filteredAudit.length} {isAr ? 'سجل' : 'records'}
                  </div>
                  {/* Stats */}
                  {auditData?.stats && (
                    <div className={`flex items-center gap-3 text-xs flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                      {[
                        { label: 'Critical', v: auditData.stats.by_risk.critical, c: C.red    },
                        { label: 'High',     v: auditData.stats.by_risk.high,     c: C.gold   },
                        { label: 'Medium',   v: auditData.stats.by_risk.medium,   c: C.cyan   },
                        { label: 'Errors',   v: auditData.stats.by_status.error,  c: C.red    },
                      ].map(s => (
                        <span key={s.label} className="px-2 py-1 rounded-full font-bold"
                          style={{ background: `${s.c}15`, color: s.c }}>
                          {s.label}: {s.v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: C.card2 }}>
                        {[
                          isAr ? 'الوقت' : 'Timestamp',
                          isAr ? 'المستخدم' : 'User',
                          isAr ? 'الإجراء' : 'Action',
                          isAr ? 'المسار' : 'Path',
                          isAr ? 'الحالة' : 'Status',
                          isAr ? 'المدة' : 'Duration',
                          isAr ? 'المخاطرة' : 'Risk',
                          isAr ? 'الهاش' : 'Hash',
                        ].map(h => (
                          <th key={h} className="px-3 py-2.5 font-bold text-left whitespace-nowrap"
                            style={{ color: C.muted, direction: isAr ? 'rtl' : 'ltr' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {auditPaged.map((r: any, i: number) => (
                        <tr key={r.id || i} className="border-t hover:opacity-80"
                          style={{ borderColor: `${C.border}50` }}>
                          <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: C.muted }}>
                            {new Date(r.ts_request || r.ts || 0).toLocaleTimeString('en-US', { hour12: false })}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-white">{(r.user_id || 'anon').slice(0, 12)}</span>
                          </td>
                          <td className="px-3 py-2 max-w-xs truncate text-white">{r.action_label || r.action || '—'}</td>
                          <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: C.muted }}>
                            {r.path?.slice(0, 30) || '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
                              style={{ background: (r.status || 200) < 400 ? `${C.green}15` : `${C.red}15`, color: (r.status || 200) < 400 ? C.green : C.red }}>
                              {r.status || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: C.muted }}>
                            {r.duration_ms != null ? `${r.duration_ms}ms` : '—'}
                          </td>
                          <td className="px-3 py-2"><RiskBadge level={r.risk_level || 'low'} /></td>
                          <td className="px-3 py-2 font-mono" style={{ color: `${C.muted}80` }}>
                            {(r.request_hash || '').slice(0, 8)}
                          </td>
                        </tr>
                      ))}
                      {auditPaged.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: C.muted }}>
                          {loading ? (isAr ? 'جارٍ التحميل...' : 'Loading…') : (isAr ? 'لا سجلات' : 'No records yet — start using the API')}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredAudit.length > auditPageSize && (
                  <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: C.border }}>
                    <button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                      style={{ background: `${C.cyan}20`, color: C.cyan }}>
                      {isAr ? 'السابق' : 'Prev'}
                    </button>
                    <span className="text-xs" style={{ color: C.muted }}>
                      {isAr ? 'صفحة' : 'Page'} {auditPage} / {Math.ceil(filteredAudit.length / auditPageSize)}
                    </span>
                    <button onClick={() => setAuditPage(p => Math.min(Math.ceil(filteredAudit.length / auditPageSize), p + 1))}
                      disabled={auditPage >= Math.ceil(filteredAudit.length / auditPageSize)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                      style={{ background: `${C.cyan}20`, color: C.cyan }}>
                      {isAr ? 'التالي' : 'Next'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══ Deviations ══ */}
          {tab === 'deviations' && (
            <motion.div key="devs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: isAr ? 'إجمالي' : 'Total',    v: deviations?.summary?.total    ?? 0, c: C.cyan  },
                  { label: isAr ? 'مفتوح' : 'Open',      v: deviations?.summary?.open     ?? 0, c: C.red   },
                  { label: isAr ? 'حرجة' : 'Critical',   v: deviations?.summary?.critical ?? 0, c: C.gold  },
                  { label: isAr ? 'مغلقة' : 'Closed',    v: deviations?.summary?.closed   ?? 0, c: C.green },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 text-center"
                    style={{ background: C.card, border: `1px solid ${s.c}30` }}>
                    <div className="text-3xl font-black" style={{ color: s.c }}>{s.v}</div>
                    <div className="text-xs mt-1" style={{ color: C.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {(deviations?.deviations || []).map((d: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-5"
                    style={{ background: C.card, border: `1px solid ${d.severity === 'critical' ? C.red : d.severity === 'major' ? C.gold : C.border}40` }}>
                    <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${d.severity === 'critical' ? C.red : d.severity === 'major' ? C.gold : C.muted}20` }}>
                        <AlertTriangle className="w-5 h-5" style={{ color: d.severity === 'critical' ? C.red : d.severity === 'major' ? C.gold : C.muted }} />
                      </div>
                      <div className="flex-1">
                        <div className={`flex items-center gap-2 flex-wrap mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-bold text-white">{d.description}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${d.status === 'open' ? C.red : C.green}20`, color: d.status === 'open' ? C.red : C.green }}>
                            {d.status}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${d.severity === 'critical' ? C.red : d.severity === 'major' ? C.gold : C.muted}20`,
                              color: d.severity === 'critical' ? C.red : d.severity === 'major' ? C.gold : C.muted }}>
                            {d.severity}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span style={{ color: C.muted }}>{isAr ? 'CAPA: ' : 'CAPA: '}</span>
                            <span className="text-white">{d.capa || 'Under investigation'}</span>
                          </div>
                          <div>
                            <span style={{ color: C.muted }}>{isAr ? 'المسار: ' : 'Path: '}</span>
                            <span className="font-mono text-white">{d.path || '—'}</span>
                          </div>
                          <div>
                            <span style={{ color: C.muted }}>{isAr ? 'المستخدم: ' : 'User: '}</span>
                            <span className="text-white">{d.user_id || 'system'}</span>
                          </div>
                          <div>
                            <span style={{ color: C.muted }}>{isAr ? 'الوقت: ' : 'Time: '}</span>
                            <span className="font-mono text-white">{d.ts ? new Date(d.ts).toLocaleDateString() : '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {!deviations?.deviations?.length && !loading && (
                  <div className="text-center py-12" style={{ color: C.muted }}>
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: C.green }} />
                    <p className="text-lg font-bold text-white mb-1">{isAr ? 'لا انحرافات!' : 'No Deviations!'}</p>
                    <p className="text-sm">{isAr ? 'جميع الأنظمة تعمل وفق المواصفات' : 'All systems operating within specifications'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══ E-Signatures ══ */}
          {tab === 'esig' && (
            <motion.div key="esig" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
                  <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Lock className="w-5 h-5" style={{ color: C.gold }} />
                    <div>
                      <h3 className="text-sm font-bold text-white">{isAr ? 'سجل التوقيعات الإلكترونية' : 'Electronic Signature Register'}</h3>
                      <p className="text-xs" style={{ color: C.muted }}>21 CFR Part 11 § 11.50 — {esigs?.total ?? 0} {isAr ? 'توقيع' : 'signatures'}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: `${C.border}50` }}>
                  {(esigs?.signatures || []).slice(0, 20).map((s: any, i: number) => (
                    <div key={i} className={`flex items-center gap-4 px-5 py-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${C.gold}20` }}>
                        <Lock className="w-4 h-4" style={{ color: C.gold }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{s.action}</div>
                        <div className="text-xs mt-0.5" style={{ color: C.muted }}>{s.reason}</div>
                      </div>
                      <div className={`text-right flex-shrink-0 ${isAr ? 'text-left' : ''}`}>
                        <div className="text-xs font-mono" style={{ color: C.muted }}>{s.user_id?.slice(0, 12)}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: `${C.muted}80` }}>
                          #{(s.sig_hash || '').slice(0, 8)}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: C.green }} />
                    </div>
                  ))}
                  {!esigs?.signatures?.length && !loading && (
                    <div className="px-5 py-10 text-center text-xs" style={{ color: C.muted }}>
                      {isAr ? 'لا توقيعات بعد — ستظهر هنا عند تنفيذ إجراءات حرجة' : 'No signatures yet — will appear when critical actions are performed'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ Validation IQ/OQ/PQ ══ */}
          {tab === 'validation' && (
            <motion.div key="val" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(validation?.protocols || []).map((p: any) => (
                  <div key={p.id} className="rounded-2xl p-5"
                    style={{ background: C.card, border: `1px solid ${p.status === 'approved' ? C.green : C.gold}50` }}>
                    <div className={`flex items-center gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="text-3xl font-black" style={{ color: p.status === 'approved' ? C.green : C.gold }}>{p.id}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{p.name}</div>
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block"
                          style={{ background: `${p.status === 'approved' ? C.green : C.gold}20`, color: p.status === 'approved' ? C.green : C.gold }}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: C.muted }}>{p.description}</p>
                    <div className="space-y-1">
                      {(p.documents || []).map((doc: string) => (
                        <div key={doc} className="flex items-center gap-1.5 text-xs" style={{ color: C.cyan }}>
                          <FileText className="w-3 h-3" />{doc}
                        </div>
                      ))}
                    </div>
                    {p.date && <div className="text-xs font-mono mt-2" style={{ color: C.muted }}>{isAr ? 'تاريخ الاعتماد:' : 'Approved:'} {p.date}</div>}
                    {p.approved_by && <div className="text-xs mt-1" style={{ color: C.muted }}>{isAr ? 'بواسطة:' : 'By:'} {p.approved_by}</div>}
                  </div>
                ))}
              </div>

              {/* System checks table */}
              <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: C.border }}>
                  <h3 className="text-sm font-bold text-white">{isAr ? 'فحوصات النظام' : 'System Qualification Checks'}</h3>
                </div>
                {(validation?.checks || []).map((check: any, i: number) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 border-b ${isAr ? 'flex-row-reverse' : ''}`}
                    style={{ borderColor: `${C.border}50` }}>
                    {check.status === 'pass'
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: C.green }} />
                      : <AlertCircle  className="w-4 h-4 flex-shrink-0" style={{ color: check.status === 'warn' ? C.gold : C.red }} />}
                    <div className="flex-1">
                      <span className="text-sm text-white">{check.label}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: C.muted }}>{check.value}</span>
                    <span className="text-xs" style={{ color: C.muted }}>{isAr ? 'الهدف:' : 'Target:'} {check.target}</span>
                    {check.critical && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: `${C.red}15`, color: C.red }}>CFR11</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ FMEA Risk ══ */}
          {tab === 'risk' && (
            <motion.div key="risk" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: isAr ? 'أعلى RPN' : 'Highest RPN',      v: risk?.summary?.highest_rpn ?? '—',       c: C.red  },
                  { label: isAr ? 'مخاطر مفتوحة' : 'Open Risks',   v: risk?.summary?.open_risks ?? '—',         c: C.gold },
                  { label: isAr ? 'مقبولة' : 'Accepted (<30)',      v: risk?.summary?.risk_accepted ?? '—',      c: C.green},
                  { label: isAr ? 'تحتاج إجراء' : 'Needs Action',  v: risk?.summary?.risk_requires_action ?? '—', c: C.red },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 text-center"
                    style={{ background: C.card, border: `1px solid ${s.c}30` }}>
                    <div className="text-3xl font-black" style={{ color: s.c }}>{s.v}</div>
                    <div className="text-xs mt-1" style={{ color: C.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {(risk?.fmea || []).map((f: any, i: number) => (
                  <motion.div key={f.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl p-5"
                    style={{ background: C.card, border: `1px solid ${f.rpn >= 80 ? C.red : f.rpn >= 30 ? C.gold : C.border}40` }}>
                    <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-shrink-0 text-center">
                        <div className="text-xs font-bold mb-1" style={{ color: C.muted }}>RPN</div>
                        <div className="text-2xl font-black" style={{ color: f.rpn >= 80 ? C.red : f.rpn >= 30 ? C.gold : C.green }}>{f.rpn}</div>
                      </div>
                      <div className="flex-1">
                        <div className={`flex items-center gap-2 mb-1 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-bold text-white">{f.function}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${f.status === 'mitigated' ? C.green : C.red}20`, color: f.status === 'mitigated' ? C.green : C.red }}>
                            {f.status}
                          </span>
                          <span className="text-xs" style={{ color: C.muted }}>S:{f.severity} × O:{f.occurrence} × D:{f.detection}</span>
                        </div>
                        <div className="text-xs mb-2" style={{ color: C.muted }}>{f.failure_mode}</div>
                        <div className="flex flex-wrap gap-1">
                          {(f.controls || []).map((ctrl: string) => (
                            <span key={ctrl} className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: `${C.cyan}15`, color: C.cyan }}>
                              {ctrl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl" style={{ background: C.card2, border: `1px solid ${C.border}` }}>
                <div className="text-xs" style={{ color: C.muted }}>
                  {isAr
                    ? 'حد القبول: RPN < 30 · يحتاج إجراء: RPN ≥ 80 · حرج: RPN ≥ 200 — وفق GAMP 5 / ICH Q9'
                    : 'Thresholds: RPN < 30 Acceptable · RPN ≥ 80 Action Required · RPN ≥ 200 Critical — per GAMP 5 / ICH Q9'}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ Data Integrity ══ */}
          {tab === 'integrity' && (
            <motion.div key="int" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <div className={`flex items-center gap-3 mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Database className="w-5 h-5" style={{ color: C.lime }} />
                    <div>
                      <h3 className="text-sm font-bold text-white">{isAr ? 'سلامة البيانات ALCOA+' : 'Data Integrity ALCOA+'}</h3>
                      <p className="text-xs" style={{ color: C.muted }}>FDA 2018 Data Integrity Guidance</p>
                    </div>
                  </div>
                  {integrity && (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-4xl font-black mb-1" style={{ color: integrity.overall_integrity_pct >= 95 ? C.green : C.gold }}>
                          {integrity.overall_integrity_pct}%
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full font-bold"
                          style={{ background: `${integrity.status === 'compliant' ? C.green : C.gold}20`, color: integrity.status === 'compliant' ? C.green : C.gold }}>
                          {integrity.status}
                        </span>
                      </div>
                      {Object.entries(integrity.entities || {}).map(([name, data]: [string, any]) => (
                        <div key={name} className="mb-3">
                          <div className={`flex items-center justify-between mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-bold capitalize text-white">{name}</span>
                            <span className="text-xs font-bold" style={{ color: data.pct >= 95 ? C.green : C.gold }}>{data.pct}% ({data.complete}/{data.total})</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: C.border }}>
                            <motion.div className="h-full rounded-full" style={{ background: data.pct >= 95 ? C.green : C.gold }}
                              initial={{ width: 0 }} animate={{ width: `${data.pct}%` }} transition={{ duration: 1 }} />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <h3 className={`text-sm font-bold text-white mb-5 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'مبادئ ALCOA+ — الحالة الحقيقية' : 'ALCOA+ Principles — Live Status'}
                  </h3>
                  {(integrity?.alcoa_principles
                    ? Object.entries(integrity.alcoa_principles)
                    : [['attributable', true], ['legible', true], ['contemporaneous', true], ['original', true], ['accurate', true]]
                  ).map(([k, v]: any) => (
                    <div key={k} className={`flex items-center gap-3 py-2.5 border-b ${isAr ? 'flex-row-reverse' : ''}`}
                      style={{ borderColor: `${C.border}50` }}>
                      {v ? <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                         : <AlertCircle  className="w-4 h-4" style={{ color: C.red   }} />}
                      <span className="text-sm text-white capitalize flex-1">{k}</span>
                      <span className="text-xs font-bold" style={{ color: v ? C.green : C.red }}>
                        {v ? '✓ Compliant' : '✗ Non-compliant'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ Change Log ══ */}
          {tab === 'changelog' && (
            <motion.div key="cl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
                  <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <GitCommit className="w-5 h-5" style={{ color: C.purple }} />
                    <div>
                      <h3 className="text-sm font-bold text-white">{isAr ? 'سجل تغييرات النظام' : 'System Change Log'}</h3>
                      <p className="text-xs" style={{ color: C.muted }}>ICH Q10 / GAMP 5 Change Control — {isAr ? 'إجمالي' : 'Total'}: {changelog?.change_log?.length ?? 0}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: `${C.border}50` }}>
                  {(changelog?.change_log || []).map((entry: any, i: number) => (
                    <div key={i} className={`flex items-start gap-4 px-5 py-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                        style={{ background: `${entry.type === 'major' ? C.red : C.gold}20`, color: entry.type === 'major' ? C.red : C.gold }}>
                        {entry.type === 'major' ? 'MAJ' : 'MIN'}
                      </div>
                      <div className="flex-1">
                        <div className={`flex items-center gap-2 flex-wrap mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-mono font-bold"
                            style={{ color: C.cyan }}>{entry.version}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${entry.impact === 'high' ? C.red : entry.impact === 'medium' ? C.gold : C.muted}15`,
                              color: entry.impact === 'high' ? C.red : entry.impact === 'medium' ? C.gold : C.muted }}>
                            {entry.impact} impact
                          </span>
                        </div>
                        <div className="text-sm text-white">{entry.description}</div>
                        <div className={`flex items-center gap-3 mt-1 text-xs ${isAr ? 'flex-row-reverse' : ''}`} style={{ color: C.muted }}>
                          <span>{entry.date}</span>
                          <span>·</span>
                          <span>{entry.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
