/**
 * LiquidityDashboard — /features/marketplace/LiquidityDashboard.tsx
 * v2.0 — Fully connected to real KV data via GET /admin/liquidity-stats
 * No more static mock data. All figures derived from live trip_index: scan.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Users, MapPin, Activity, AlertCircle, CheckCircle,
  ArrowUp, ArrowDown, RefreshCw, Zap, Car, Package2, Clock,
  BarChart3, Minus, Database, Sparkles, PackagePlus,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveRouteHealth {
  route: string;
  routeLabel: string;
  from: string;
  to: string;
  totalTrips: number;
  totalSeats: number;
  seededTrips: number;
  realTrips: number;
  liquidityScore: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'stable' | 'down';
  avgBookingSuccessRate: number;
  avgWaitTime: number;
  driversAvailable: number;
  passengersWaiting: number;
  priceRange: string;
  distanceKm: number;
}

interface LiveTotals {
  totalTrips: number;
  seededTrips: number;
  realTrips: number;
  avgLiquidityScore: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusColor(status: LiveRouteHealth['status']) {
  return status === 'healthy' ? '#22C55E' : status === 'warning' ? '#F59E0B' : '#EF4444';
}

function getTrendIcon(trend: LiveRouteHealth['trend']) {
  if (trend === 'up')     return <ArrowUp   className="h-4 w-4" style={{ color: '#22C55E' }} />;
  if (trend === 'down')   return <ArrowDown className="h-4 w-4" style={{ color: '#EF4444' }} />;
  return                         <Minus     className="h-4 w-4" style={{ color: 'rgba(71,85,105,1)' }} />;
}

function StatusBadge({ status, ar }: { status: LiveRouteHealth['status']; ar: boolean }) {
  const map = {
    healthy:  { label: ar ? 'سليم'  : 'Healthy',  color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  icon: CheckCircle },
    warning:  { label: ar ? 'تحذير' : 'Warning',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle },
    critical: { label: ar ? 'حرج'   : 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  icon: AlertCircle },
  }[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: map.bg, color: map.color, border: `1px solid ${map.color}30` }}>
      <map.icon className="w-2.5 h-2.5" />
      {map.label}
    </span>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-6 rounded-2xl animate-pulse" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-40 rounded-lg" style={{ background: 'rgba(30,41,59,0.7)' }} />
            <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(30,41,59,0.5)' }} />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[1,2,3,4].map(j => <div key={j} className="h-10 rounded-lg" style={{ background: 'rgba(30,41,59,0.4)' }} />)}
          </div>
          <div className="h-2 rounded-full" style={{ background: 'rgba(30,41,59,0.6)' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LiquidityDashboard() {
  const { language, dir } = useLanguage();
  const ar = language === 'ar';

  const [routes, setRoutes] = useState<LiveRouteHealth[]>([]);
  const [totals, setTotals] = useState<LiveTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedingPkgs, setSeedingPkgs] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStats = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/liquidity-stats`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRoutes(data.routes || []);
      setTotals(data.totals || null);
      setGeneratedAt(data.generatedAt || null);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[LiquidityDashboard] fetchStats error:', err);
      if (!quiet) toast.error(ar ? 'فشل تحميل بيانات السيولة' : 'Failed to load liquidity data');
    } finally {
      setLoading(false);
    }
  }, [ar]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchStats(true);
    setRefreshing(false);
    toast.success(ar ? '✅ البيانات محدّثة' : '✅ Data refreshed');
  };

  const handleRefreshDates = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/refresh-seed-dates`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(ar ? `🔄 تم تحديث تواريخ ${data.refreshed} رحلة` : `🔄 Refreshed ${data.refreshed} trip dates`);
        await fetchStats(true);
      } else {
        toast.error(data.error || 'Refresh failed');
      }
    } catch (err) {
      console.error('[LiquidityDashboard] refreshDates error:', err);
      toast.error(ar ? 'فشل تحديث التواريخ' : 'Date refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSeedPackages = async () => {
    setSeedingPkgs(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ count: 20 }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(ar ? `✅ تم بذر ${data.seeded} طرد في راجع` : `✅ Seeded ${data.seeded} Raje3 packages`);
        await fetchStats(true);
      } else if (res.status === 401) {
        toast.error(ar ? '🔒 سجّل دخولك أولاً' : '🔒 Sign in first to seed packages');
      } else {
        toast.error(data.error || 'Seeding failed');
      }
    } catch (err) {
      console.error('[LiquidityDashboard] seedPackages error:', err);
      toast.error(ar ? 'فشل بذر الطرود' : 'Package seeding failed');
    } finally {
      setSeedingPkgs(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ count: 30 }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(ar ? `✅ تم بذر ${data.seeded} رحلة` : `✅ Seeded ${data.seeded} rides across all Tier-1 routes`);
        await fetchStats(true);
      } else if (res.status === 401) {
        toast.error(ar ? '🔒 سجّل دخولك أولاً لبذر الرحلات' : '🔒 Sign in first to seed trips');
      } else {
        toast.error(data.error || 'Seeding failed');
      }
    } catch (err) {
      console.error('[LiquidityDashboard] seed error:', err);
      toast.error(ar ? 'فشل البذر' : 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-trips`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(ar ? `🗑️ تم حذف ${data.cleared} رحلة` : `🗑️ Cleared ${data.cleared} seeded trips`);
        await fetchStats(true);
      } else if (res.status === 401) {
        toast.error(ar ? '🔒 سجّل دخولك أولاً' : '🔒 Sign in first to clear trips');
      } else {
        toast.error(data.error || 'Clear failed');
      }
    } catch (err) {
      console.error('[LiquidityDashboard] clear error:', err);
      toast.error(ar ? 'فشل الحذف' : 'Clear failed');
    } finally {
      setClearing(false);
    }
  };

  const actionRecommendation = (route: LiveRouteHealth) => {
    if (route.status === 'critical') {
      return {
        message: ar
          ? `🚨 يحتاج ${Math.max(3, route.driversAvailable * 2)} رحلة إضافية لتفعيل الممر`
          : `🚨 Need ${Math.max(3, route.driversAvailable * 2)} more rides to activate corridor`,
        action: ar ? 'ابدأ حملة توظيف' : 'Start recruitment campaign',
        color: '#EF4444',
      };
    }
    if (route.status === 'warning') {
      return {
        message: ar ? '📢 الطريق يحتاج المزيد من المسافرين' : '📢 Route needs more travelers',
        action: ar ? 'أضف رحلات ببذر' : 'Seed more rides',
        color: '#F59E0B',
      };
    }
    return null;
  };

  const smartInsights = routes
    .filter(r => r.totalTrips > 0)
    .sort((a, b) => b.liquidityScore - a.liquidityScore);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--background)' }} dir={dir}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-6 h-6" style={{ color: '#04ADBF' }} />
              <h1 className="font-black text-white" style={{ fontWeight: 900, fontSize: '1.4rem' }}>
                {ar ? 'لوحة السيولة' : 'Liquidity Dashboard'}
              </h1>
              {/* Live indicator */}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {ar ? 'مباشر' : 'LIVE'}
              </span>
            </div>
            <p style={{ color: 'rgba(71,85,105,1)', fontSize: '0.78rem' }}>
              {ar ? 'بيانات حقيقية من قاعدة البيانات' : 'Real data from KV store · auto-refreshes every 60s'}
              {generatedAt && (
                <span style={{ color: 'rgba(51,65,85,1)', marginLeft: 8, fontSize: '0.65rem' }}>
                  · {ar ? 'آخر تحديث' : 'Last'}: {new Date(generatedAt).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleManualRefresh} variant="outline" size="sm"
              className="gap-2 border-border text-slate-400" disabled={refreshing || loading}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {ar ? 'تحديث' : 'Refresh'}
            </Button>
            <Button onClick={handleRefreshDates} variant="outline" size="sm"
              className="gap-2 border-border text-amber-400" disabled={refreshing}>
              <Clock className="w-4 h-4" />
              {ar ? 'تجديد التواريخ' : 'Refresh Dates'}
            </Button>
            {totals && totals.seededTrips > 0 && (
              <Button onClick={handleClear} variant="outline" size="sm"
                className="gap-2 border-red-500/30 text-red-400" disabled={clearing}>
                <Database className="w-4 h-4" />
                {clearing ? (ar ? 'جاري...' : 'Clearing…') : (ar ? `احذف ${totals.seededTrips}` : `Clear ${totals.seededTrips} seeded`)}
              </Button>
            )}
            <Button onClick={handleSeed} size="sm"
              className="gap-2 text-white" style={{ background: 'linear-gradient(135deg, #09732E, #04ADBF)' }}
              disabled={seeding}>
              <Zap className="w-4 h-4" />
              {seeding ? (ar ? 'جاري البذر...' : 'Seeding…') : (ar ? '🚗 بذر 30 رحلة' : '🚗 Seed 30 Rides')}
            </Button>
            <Button onClick={handleSeedPackages} size="sm"
              className="gap-2 text-white" style={{ background: 'linear-gradient(135deg, #D9965B, #8B5CF6)' }}
              disabled={seedingPkgs}>
              <PackagePlus className="w-4 h-4" />
              {seedingPkgs ? (ar ? 'جاري البذر...' : 'Seeding…') : (ar ? '📦 بذر 20 طرد' : '📦 Seed 20 Pkgs')}
            </Button>
          </div>
        </div>

        {/* ── Overall KPI strip ───────────────────────────────────────────── */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: ar ? 'رحلات نشطة'    : 'Active Trips',      value: totals.totalTrips,         icon: Car,       color: '#04ADBF' },
              { label: ar ? 'رحلات حقيقية'  : 'Real Trips',        value: totals.realTrips,          icon: Users,     color: '#22C55E' },
              { label: ar ? 'رحلات مبذورة'  : 'Seeded Trips',      value: totals.seededTrips,        icon: Database,  color: '#8B5CF6' },
              { label: ar ? 'درجة السيولة'  : 'Avg Liquidity',     value: `${totals.avgLiquidityScore}%`, icon: Activity, color: totals.avgLiquidityScore >= 70 ? '#22C55E' : totals.avgLiquidityScore >= 40 ? '#F59E0B' : '#EF4444' },
            ].map(({ label, value, icon: Icon, color }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl"
                style={{ background: 'var(--card)', border: `1px solid ${color}18` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
                <div className="font-black" style={{ fontWeight: 900, fontSize: '1.8rem', color, lineHeight: 1 }}>{value}</div>
                <div style={{ color: 'rgba(71,85,105,1)', fontSize: '0.68rem', marginTop: 4 }}>{label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Route health cards ──────────────────────────────────────────── */}
        {loading ? <Skeleton /> : (
          <AnimatePresence mode="wait">
            <motion.div key="routes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#04ADBF' }} />
                <h2 className="font-bold text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {ar ? 'صحة الطرق' : 'Route Health'}
                </h2>
                <span style={{ color: 'rgba(71,85,105,1)', fontSize: '0.68rem' }}>
                  — {ar ? 'بيانات حية من قاعدة البيانات' : 'live from KV store'}
                </span>
              </div>

              {routes.map((route, idx) => {
                const rec = actionRecommendation(route);
                const statusColor = getStatusColor(route.status);
                return (
                  <motion.div key={route.route}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="p-5 rounded-2xl"
                    style={{ background: 'var(--card)', border: `1px solid ${statusColor}18` }}>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        {/* Route header */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ background: `${statusColor}12`, border: `1px solid ${statusColor}22` }}>
                              <MapPin className="w-4 h-4" style={{ color: statusColor }} />
                            </div>
                            <div>
                              <div className="font-bold text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>
                                {route.routeLabel}
                              </div>
                              <div style={{ color: 'rgba(71,85,105,1)', fontSize: '0.65rem' }}>
                                {route.distanceKm} km · {ar ? 'السعر' : 'Price'}: {route.priceRange} JOD
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(route.trend)}
                            <StatusBadge status={route.status} ar={ar} />
                          </div>
                        </div>

                        {/* KPI row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {[
                            { label: ar ? 'رحلات نشطة' : 'Active Trips',  value: route.totalTrips,              color: '#04ADBF' },
                            { label: ar ? 'مقاعد متوفرة' : 'Seats Avail', value: route.totalSeats,              color: '#22C55E' },
                            { label: ar ? 'نسبة الحجز' : 'Booking Rate',  value: `${route.avgBookingSuccessRate}%`, color: '#F59E0B' },
                            { label: ar ? 'وقت الانتظار' : 'Wait Time',   value: `${route.avgWaitTime}h`,       color: '#8B5CF6' },
                          ].map(m => (
                            <div key={m.label} className="p-3 rounded-xl text-center"
                              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div className="font-black" style={{ color: m.color, fontWeight: 900, fontSize: '1.1rem' }}>{m.value}</div>
                              <div style={{ color: 'rgba(71,85,105,1)', fontSize: '0.6rem', marginTop: 2 }}>{m.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Seed breakdown */}
                        <div className="flex items-center gap-4 mb-3" style={{ fontSize: '0.65rem' }}>
                          <span style={{ color: '#8B5CF6' }}>
                            📌 {route.seededTrips} {ar ? 'مبذورة' : 'seeded'}
                          </span>
                          <span style={{ color: '#22C55E' }}>
                            ✅ {route.realTrips} {ar ? 'حقيقية' : 'real'}
                          </span>
                        </div>

                        {/* Liquidity score bar */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span style={{ color: 'rgba(100,116,139,1)', fontSize: '0.72rem', fontWeight: 600 }}>
                              {ar ? 'درجة السيولة' : 'Liquidity Score'}
                            </span>
                            <span className="font-bold" style={{ color: statusColor, fontWeight: 700, fontSize: '0.78rem' }}>
                              {route.liquidityScore}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden"
                            style={{ background: 'rgba(30,41,59,0.7)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${route.liquidityScore}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.4, 0, 0.2, 1] }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${statusColor}99, ${statusColor})` }} />
                          </div>
                        </div>
                      </div>

                      {/* Action recommendation */}
                      {rec && (
                        <div className="md:w-56 p-4 rounded-xl"
                          style={{ background: `${rec.color}08`, border: `1px solid ${rec.color}25` }}>
                          <div className="font-bold mb-2" style={{ color: rec.color, fontWeight: 700, fontSize: '0.72rem' }}>
                            ⚡ {ar ? 'إجراء مطلوب' : 'Action Required'}
                          </div>
                          <p style={{ color: 'rgba(148,163,184,1)', fontSize: '0.7rem', lineHeight: 1.5, marginBottom: 10 }}>
                            {rec.message}
                          </p>
                          <button onClick={handleSeed}
                            className="w-full py-2 rounded-lg font-bold text-xs transition-all"
                            style={{ background: `${rec.color}15`, color: rec.color, border: `1px solid ${rec.color}30`, fontWeight: 700, fontSize: '0.68rem' }}>
                            {rec.action}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Smart Insights (live-derived) ──────────────────────────────── */}
        {!loading && routes.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl"
            style={{ background: 'rgba(4,173,191,0.04)', border: '1px solid rgba(4,173,191,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: '#04ADBF' }} />
              <h3 className="font-bold" style={{ color: '#04ADBF', fontWeight: 700, fontSize: '0.85rem' }}>
                {ar ? '💡 رؤى ذكية — مستخرجة من بيانات حية' : '💡 Smart Insights — derived from live data'}
              </h3>
            </div>
            <ul className="space-y-2">
              {smartInsights.length === 0 ? (
                <li style={{ color: 'rgba(71,85,105,1)', fontSize: '0.78rem' }}>
                  {ar ? 'لا توجد رحلات بعد — ابذر لتفعيل الرؤى' : 'No trips yet — seed to activate insights'}
                </li>
              ) : smartInsights.slice(0, 4).map(r => {
                const isTop = r === smartInsights[0];
                const isCrit = r.status === 'critical';
                return (
                  <li key={r.route} className="flex items-start gap-2"
                    style={{ color: 'rgba(148,163,184,1)', fontSize: '0.75rem' }}>
                    <span>{isTop ? '🏆' : isCrit ? '⚠️' : '📈'}</span>
                    <span>
                      {isTop
                        ? (ar
                          ? `${r.routeLabel} — أعلى سيولة (${r.liquidityScore}%) مع ${r.totalTrips} رحلة نشطة`
                          : `${r.routeLabel} — highest liquidity (${r.liquidityScore}%) with ${r.totalTrips} active trips`)
                        : isCrit
                        ? (ar
                          ? `${r.routeLabel} — يحتاج رحلات عاجلاً (درجة: ${r.liquidityScore}%)`
                          : `${r.routeLabel} — urgently needs rides (score: ${r.liquidityScore}%)`)
                        : (ar
                          ? `${r.routeLabel} — ${r.realTrips} رحلة حقيقية، نسبة حجز ${r.avgBookingSuccessRate}%`
                          : `${r.routeLabel} — ${r.realTrips} real ride${r.realTrips !== 1 ? 's' : ''}, ${r.avgBookingSuccessRate}% booking rate`)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
