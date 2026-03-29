/**
 * Wasel Validation Engine Dashboard
 * Full investment validation: mock data, KPIs, gap analysis, risk-reward, recommendations
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  Database, BarChart3, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  Loader2, RefreshCw, ChevronDown, Users, Car, Package, CreditCard,
  Shield, Target, Zap, Globe, Award, ArrowRight, Download,
  MapPin, Star, Clock, Leaf, Activity, PieChart, FileText,
  Rocket, AlertCircle, Info, ThumbsUp, ThumbsDown, Minus,
} from 'lucide-react';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;
const headers = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

type Step = 'idle' | 'seeding' | 'computing' | 'reporting' | 'done' | 'error';

// ─── Score Badge ────────────────────────────────────────────────────────────
function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 4 ? '#22C55E' : score >= 3 ? '#F59E0B' : '#EF4444';
  const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : size === 'md' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center font-black`}
      style={{ background: `${color}18`, border: `2px solid ${color}40`, color }}>
      {score}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, color = '#04ADBF' }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--wasel-glass-md)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-black text-white" style={{ fontWeight: 900 }}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Expandable Section ─────────────────────────────────────────────────────
function Section({ title, icon: Icon, color, children, defaultOpen = false }: {
  title: string; icon: any; color: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--wasel-glass-md)', border: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-white font-bold text-sm">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Progress Steps ─────────────────────────────────────────────────────────
function StepProgress({ steps, currentStep }: { steps: { id: Step; label: string }[]; currentStep: Step }) {
  const idx = steps.findIndex(s => s.id === currentStep);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, i) => {
        const isActive = s.id === currentStep;
        const isDone = i < idx || currentStep === 'done';
        const isError = currentStep === 'error' && i === idx;
        const color = isError ? '#EF4444' : isDone ? '#22C55E' : isActive ? '#04ADBF' : '#334155';
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `${color}20`, border: `2px solid ${color}`, color }}>
                {isDone ? '✓' : isError ? '✗' : i + 1}
              </div>
              <span className="text-xs font-medium" style={{ color: isActive ? '#fff' : '#64748B' }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-px" style={{ background: isDone ? '#22C55E40' : '#334155' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ValidationDashboard() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [step, setStep] = useState<Step>('idle');
  const [seedData, setSeedData] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // ── Run full pipeline ──
  const runValidation = useCallback(async () => {
    setLoading(true);
    setError('');
    setStep('seeding');
    try {
      // Step 1: Seed mock data
      const seedRes = await fetch(`${API}/validation/seed`, { method: 'POST', headers });
      if (!seedRes.ok) throw new Error(`Seed failed: ${await seedRes.text()}`);
      const seed = await seedRes.json();
      setSeedData(seed);

      // Step 2: Compute KPIs
      setStep('computing');
      const kpiRes = await fetch(`${API}/validation/kpis`, { headers });
      if (!kpiRes.ok) throw new Error(`KPI computation failed: ${await kpiRes.text()}`);
      const kpiData = await kpiRes.json();
      setKpis(kpiData.kpis);

      // Step 3: Generate report
      setStep('reporting');
      const reportRes = await fetch(`${API}/validation/report`, { headers });
      if (!reportRes.ok) throw new Error(`Report generation failed: ${await reportRes.text()}`);
      const reportData = await reportRes.json();
      setReport(reportData);

      setStep('done');
    } catch (err: any) {
      console.error('[ValidationEngine] Error:', err);
      setError(err.message || 'Unknown error');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const STEPS = [
    { id: 'seeding' as Step, label: 'Seed Data' },
    { id: 'computing' as Step, label: 'Compute KPIs' },
    { id: 'reporting' as Step, label: 'Generate Report' },
    { id: 'done' as Step, label: 'Complete' },
  ];

  const recColor = report?.recommendation === 'GO' ? '#22C55E' : report?.recommendation === 'OPTIMIZE' ? '#F59E0B' : '#EF4444';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#0B1120' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3" style={{ fontWeight: 900 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(4,173,191,0.15)', border: '1px solid rgba(4,173,191,0.3)' }}>
                <Activity className="w-5 h-5" style={{ color: '#04ADBF' }} />
              </div>
              {ar ? 'محرك التحقق الرئيسي' : 'Master Validation Engine'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {ar ? 'تقييم شامل للاستثمار — بيانات تجريبية، مؤشرات أداء، تحليل فجوات، تقرير توصيات' : 'Full investment validation — Mock data, KPIs, gap analysis, risk-reward report'}
            </p>
          </div>

          <button onClick={runValidation} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: loading ? '#334155' : 'linear-gradient(135deg, #04ADBF, #09732E)', color: '#fff' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {loading ? (ar ? 'جاري التحليل…' : 'Running…') : (ar ? 'ابدأ التحقق الكامل' : 'Run Full Validation')}
          </button>
        </div>

        {/* ── Step Progress ── */}
        {step !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={{ background: 'var(--wasel-glass-md)', border: '1px solid var(--border)' }}>
            <StepProgress steps={STEPS} currentStep={step} />
            {error && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Seed Summary ── */}
        {seedData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Section title={ar ? 'الخطوة 1: بيانات تجريبية' : 'Step 1: Mock Data Generated'} icon={Database} color="#8B5CF6" defaultOpen>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { icon: Users, label: 'Users', value: seedData.counts?.users, color: '#04ADBF' },
                  { icon: Car, label: 'Vehicles', value: seedData.counts?.vehicles, color: '#09732E' },
                  { icon: MapPin, label: 'Trips', value: seedData.counts?.trips, color: '#D9965B' },
                  { icon: Package, label: 'Packages', value: seedData.counts?.packages, color: '#8B5CF6' },
                  { icon: CreditCard, label: 'Payments', value: seedData.counts?.payments, color: '#F59E0B' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl p-3" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <div>
                      <p className="text-lg font-black text-white">{item.value}</p>
                      <p className="text-[0.65rem] text-slate-500">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* ── KPIs ── */}
        {kpis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Section title={ar ? 'الخطوة 2: مؤشرات الأداء الرئيسية' : 'Step 2: KPI Analytics'} icon={BarChart3} color="#04ADBF" defaultOpen>
              <div className="space-y-6">
                {/* Revenue KPIs */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'الإيرادات' : 'Revenue'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KPICard icon={CreditCard} label="Total Revenue" value={`JOD ${kpis.totalRevenue}`} sub="Commission earned" color="#22C55E" />
                    <KPICard icon={TrendingUp} label="Total GMV" value={`JOD ${kpis.totalGMV}`} sub="Gross merchandise value" color="#04ADBF" />
                    <KPICard icon={Target} label="Avg Rev/Trip" value={`JOD ${kpis.avgRevenuePerTrip}`} sub="Per completed trip" color="#D9965B" />
                    <KPICard icon={Zap} label="Projected Annual" value={`JOD ${kpis.projectedAnnualRevenue}`} sub="12× current monthly" color="#ABD907" />
                  </div>
                </div>

                {/* Trip KPIs */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'الرحلات' : 'Trips'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KPICard icon={Car} label="Total Trips" value={kpis.totalTrips} sub={`${kpis.completedTrips} completed`} color="#04ADBF" />
                    <KPICard icon={Package} label="Package Trips" value={kpis.packageTrips} sub={`${kpis.pkgSuccessRate}% delivered`} color="#D9965B" />
                    <KPICard icon={Activity} label="Occupancy" value={`${kpis.avgOccupancy}%`} sub="Avg seat fill rate" color="#09732E" />
                    <KPICard icon={XCircle} label="Cancel Rate" value={`${kpis.cancelRate}%`} sub="Trip cancellations" color="#EF4444" />
                  </div>
                </div>

                {/* Driver KPIs */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'السائقين' : 'Drivers'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <KPICard icon={Users} label="Total Drivers" value={kpis.totalDrivers} sub={`${kpis.activeDrivers} active`} color="#04ADBF" />
                    <KPICard icon={Activity} label="Utilization" value={`${kpis.avgDriverUtilization}%`} sub="Active driver rate" color="#22C55E" />
                    <KPICard icon={Star} label="Avg Rating" value={kpis.avgRating} sub={`${kpis.retentionRate}% retention`} color="#F59E0B" />
                  </div>
                </div>

                {/* Top Drivers Table */}
                {kpis.topDrivers?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'أفضل السائقين' : 'Top Performing Drivers'}</p>
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">#</th>
                            <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Driver</th>
                            <th className="text-right px-4 py-2 text-slate-500 font-medium text-xs">Trips</th>
                            <th className="text-right px-4 py-2 text-slate-500 font-medium text-xs">Earnings (JOD)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kpis.topDrivers.slice(0, 5).map((d: any, i: number) => (
                            <tr key={d.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                              <td className="px-4 py-2 text-white font-medium">{d.name}</td>
                              <td className="px-4 py-2 text-right text-slate-300">{d.trips}</td>
                              <td className="px-4 py-2 text-right font-bold" style={{ color: '#22C55E' }}>{d.earnings}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Popular Routes */}
                {kpis.popularRoutes?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'المسارات الأكثر شعبية' : 'Most Popular Routes'}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {kpis.popularRoutes.slice(0, 6).map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" style={{ color: '#04ADBF' }} />
                            <span className="text-white text-sm font-medium">{r.route}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{r.trips} trips</span>
                            <span className="font-bold" style={{ color: '#22C55E' }}>JOD {r.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural Feature Adoption */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'تبني الميزات الثقافية' : 'Cultural Feature Adoption'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p className="text-xl font-black" style={{ color: '#10B981' }}>{kpis.prayerStopAdoption}%</p>
                      <p className="text-xs text-slate-500">🕌 Prayer Stops</p>
                    </div>
                    {kpis.genderPreferences && Object.entries(kpis.genderPreferences).map(([key, val]: [string, any]) => (
                      <div key={key} className="rounded-xl p-3 text-center" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
                        <p className="text-xl font-black" style={{ color: '#EC4899' }}>{val}</p>
                        <p className="text-xs text-slate-500 capitalize">{key.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                {kpis.paymentMethods && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{ar ? 'طرق الدفع' : 'Payment Method Distribution'}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(kpis.paymentMethods).map(([method, count]: [string, any]) => (
                        <div key={method} className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <p className="text-xl font-black" style={{ color: '#F59E0B' }}>{count}</p>
                          <p className="text-xs text-slate-500 capitalize">{method.replace(/_/g, ' ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </motion.div>
        )}

        {/* ── Full Report ── */}
        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="space-y-4">

            {/* Overall Recommendation Banner */}
            <div className="rounded-2xl p-6 text-center" style={{ background: `${recColor}10`, border: `2px solid ${recColor}40` }}>
              <div className="flex items-center justify-center gap-3 mb-3">
                {report.recommendation === 'GO' ? <ThumbsUp className="w-8 h-8" style={{ color: recColor }} /> :
                  report.recommendation === 'PAUSE' ? <ThumbsDown className="w-8 h-8" style={{ color: recColor }} /> :
                    <Minus className="w-8 h-8" style={{ color: recColor }} />}
                <span className="text-4xl font-black" style={{ color: recColor, fontWeight: 900 }}>{report.recommendation}</span>
                <ScoreBadge score={report.overallScore} size="lg" />
              </div>
              <p className="text-slate-400 text-sm max-w-3xl mx-auto leading-relaxed">{report.executiveSummary}</p>
            </div>

            {/* Risk-Reward Scores */}
            <Section title={ar ? 'الخطوة 4: تقييم المخاطر والمكافآت' : 'Step 4: Risk-Reward Evaluation'} icon={Target} color="#F59E0B" defaultOpen>
              <div className="space-y-3">
                {report.riskReward && Object.entries(report.riskReward).map(([key, val]: [string, any]) => (
                  <div key={key} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-white font-bold text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <ScoreBadge score={val.score} size="sm" />
                    </div>
                    {/* Score bar */}
                    <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${val.score * 20}%`,
                        background: val.score >= 4 ? '#22C55E' : val.score >= 3 ? '#F59E0B' : '#EF4444',
                      }} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{val.reasoning}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Competitor Analysis */}
            <Section title={ar ? 'تحليل المنافسين' : 'Competitor Analysis'} icon={Globe} color="#8B5CF6">
              <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Competitor</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Type</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Strength</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Weakness</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Threat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.competitors?.map((c: any, i: number) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-2.5 text-white font-medium">{c.name}</td>
                        <td className="px-4 py-2.5 text-slate-400">{c.type}</td>
                        <td className="px-4 py-2.5 text-slate-400 text-xs">{c.strength}</td>
                        <td className="px-4 py-2.5 text-slate-400 text-xs">{c.weakness}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                            background: c.threat.includes('High') ? 'rgba(239,68,68,0.15)' : c.threat.includes('Medium') ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                            color: c.threat.includes('High') ? '#EF4444' : c.threat.includes('Medium') ? '#F59E0B' : '#22C55E',
                          }}>{c.threat}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Unit Economics */}
            <Section title={ar ? 'اقتصاديات الوحدة' : 'Unit Economics'} icon={CreditCard} color="#22C55E">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Avg Trip GMV', value: `JOD ${report.unitEconomics?.avgTripGMV}`, color: '#04ADBF' },
                  { label: 'Avg Commission', value: `JOD ${report.unitEconomics?.avgCommission}`, color: '#22C55E' },
                  { label: 'Estimated CAC', value: `JOD ${report.unitEconomics?.estimatedCAC}`, color: '#EF4444' },
                  { label: 'Estimated LTV', value: `JOD ${report.unitEconomics?.estimatedLTV}`, color: '#ABD907' },
                  { label: 'LTV:CAC Ratio', value: `${report.unitEconomics?.ltvCacRatio}:1`, color: '#D9965B' },
                  { label: 'Gross Margin', value: `${report.unitEconomics?.grossMargin}%`, color: '#09732E' },
                  { label: 'Monthly Burn', value: `JOD ${report.unitEconomics?.monthlyBurnRate?.toLocaleString()}`, color: '#F59E0B' },
                  { label: 'Break-even Users', value: report.unitEconomics?.breakEvenUsers?.toLocaleString(), color: '#8B5CF6' },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <p className="text-lg font-black" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-[0.65rem] text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Operational Gaps */}
            <Section title={ar ? 'الفجوات التشغيلية/التقنية' : 'Operational / Technical Gaps'} icon={AlertTriangle} color="#EF4444">
              <div className="space-y-2">
                {report.operationalGaps?.map((g: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-black flex-shrink-0 mt-0.5" style={{
                      background: g.priority === 'Critical' ? 'rgba(239,68,68,0.15)' : g.priority === 'High' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                      color: g.priority === 'Critical' ? '#EF4444' : g.priority === 'High' ? '#F59E0B' : '#22C55E',
                      border: `1px solid ${g.priority === 'Critical' ? 'rgba(239,68,68,0.3)' : g.priority === 'High' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    }}>{g.priority}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">{g.gap}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Status: {g.status}</p>
                      <p className="text-slate-400 text-xs mt-1">→ {g.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* UX Gaps */}
            <Section title={ar ? 'فجوات تجربة المستخدم/الاحتفاظ' : 'UX / Retention Gaps'} icon={Users} color="#EC4899">
              <div className="space-y-2">
                {report.uxGaps?.map((g: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-black flex-shrink-0 mt-0.5" style={{
                      background: g.priority === 'High' ? 'rgba(245,158,11,0.15)' : g.priority === 'Medium' ? 'rgba(4,173,191,0.15)' : 'rgba(100,116,139,0.15)',
                      color: g.priority === 'High' ? '#F59E0B' : g.priority === 'Medium' ? '#04ADBF' : '#64748B',
                    }}>{g.priority}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">{g.gap}</p>
                      <p className="text-slate-400 text-xs mt-1">💡 {g.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Regulatory Risks */}
            <Section title={ar ? 'المخاطر التنظيمية' : 'Regulatory / Future Risks'} icon={Shield} color="#F59E0B">
              <div className="space-y-2">
                {report.regulatoryRisks?.map((r: any, i: number) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-white text-sm font-bold">{r.risk}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
                      <span>Likelihood: <span style={{ color: r.likelihood === 'High' ? '#EF4444' : r.likelihood === 'Medium' ? '#F59E0B' : '#22C55E' }}>{r.likelihood}</span></span>
                      <span>Impact: <span style={{ color: r.impact === 'High' ? '#EF4444' : r.impact === 'Medium' ? '#F59E0B' : '#22C55E' }}>{r.impact}</span></span>
                    </div>
                    <p className="text-xs text-slate-400">→ {r.mitigation}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Next Steps */}
            <Section title={ar ? 'الخطوات التالية' : 'Recommended Next Steps'} icon={Rocket} color="#ABD907" defaultOpen>
              <div className="space-y-2">
                {report.nextSteps?.map((s: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: 'rgba(171,217,7,0.05)', border: '1px solid rgba(171,217,7,0.15)' }}>
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ABD907' }} />
                    <span className="text-sm text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* ── Idle State ── */}
        {step === 'idle' && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(4,173,191,0.1)', border: '1px solid rgba(4,173,191,0.2)' }}>
              <Activity className="w-10 h-10" style={{ color: '#04ADBF' }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{ar ? 'محرك التحقق جاهز' : 'Validation Engine Ready'}</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              {ar ? 'اضغط "ابدأ التحقق الكامل" لتوليد بيانات تجريبية واقعية، حساب مؤشرات الأداء، وإنتاج تقرير استثماري شامل.' : 'Click "Run Full Validation" to generate realistic mock data, compute KPIs, run gap analysis, and produce a full investment recommendation report.'}
            </p>
            <div className="grid sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
              {['55 Users', '25 Vehicles', '120 Trips', '40 Packages', '150+ Payments'].map((item, i) => (
                <div key={i} className="rounded-xl px-3 py-2 text-xs text-slate-400 font-medium"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}