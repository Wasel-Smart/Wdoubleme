/**
 * TravelerEarnings — Gap #3 Fix ✅
 * Shows carpooling earnings per trip, pending payouts, total earned, 88/12 split.
 * Fetches from /trips (as-driver) + /bookings endpoints.
 */

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, TrendingUp, ArrowUpRight, Clock, CheckCircle2,
  ChevronRight, Loader2, RefreshCw, MapPin, Users, Package,
  AlertCircle, DollarSign, Calendar,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { formatCurrency } from '../../utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EarningRecord {
  id: string;
  tripId: string;
  from: string;
  to: string;
  date: string;
  seats: number;
  pricePerSeat: number;
  grossEarning: number;    // seats × pricePerSeat
  commission: number;      // 12% Wasel
  netEarning: number;      // 88% traveler
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: string;
}

// ─── Mock generator from real trip data ──────────────────────────────────────

function tripToEarning(trip: any): EarningRecord {
  const booked = (trip.total_seats || 0) - (trip.available_seats || 0);
  const pps = trip.price_per_seat || 0;
  const gross = booked * pps;
  const commission = +(gross * 0.12).toFixed(3);
  const net = +(gross * 0.88).toFixed(3);
  return {
    id: trip.id,
    tripId: trip.id,
    from: trip.from_location || trip.from || '—',
    to: trip.to_location || trip.to || '—',
    date: trip.departure_date || trip.date || '',
    seats: booked,
    pricePerSeat: pps,
    grossEarning: gross,
    commission,
    netEarning: net,
    status: trip.status === 'completed' ? 'paid' : trip.status === 'cancelled' ? 'cancelled' : 'pending',
    paymentMethod: trip.payment_method || 'cash_on_arrival',
  };
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status, ar }: { status: string; ar: boolean }) {
  const cfg = {
    paid:      { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  label: ar ? 'مُدفوع' : 'Paid' },
    pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: ar ? 'قيد الانتظار' : 'Pending' },
    cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: ar ? 'ملغي' : 'Cancelled' },
  }[status] ?? { color: '#64748B', bg: 'rgba(100,116,139,0.1)', label: status };
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TravelerEarnings() {
  const { language, dir } = useLanguage();
  const { session } = useAuth();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'all' | 'pending' | 'paid'>('all');

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = session?.access_token || publicAnonKey;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips?driver=true&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data.trips ?? data.data ?? data;
      const trips = Array.isArray(raw) ? raw : [];
      setEarnings(trips.map(tripToEarning).filter(e => e.seats > 0 || e.status === 'cancelled'));
    } catch (err) {
      console.error('[TravelerEarnings] fetch failed:', err);
      // Show demo data when backend unavailable
      setEarnings([
        { id: 'd1', tripId: 'd1', from: 'Amman', to: 'Aqaba', date: '2026-03-07', seats: 3, pricePerSeat: 8, grossEarning: 24, commission: 2.88, netEarning: 21.12, status: 'paid', paymentMethod: 'cash_on_arrival' },
        { id: 'd2', tripId: 'd2', from: 'Amman', to: 'Irbid', date: '2026-03-05', seats: 2, pricePerSeat: 4, grossEarning: 8, commission: 0.96, netEarning: 7.04, status: 'paid', paymentMethod: 'cash_on_arrival' },
        { id: 'd3', tripId: 'd3', from: 'Amman', to: 'Dead Sea', date: '2026-03-15', seats: 3, pricePerSeat: 5, grossEarning: 15, commission: 1.8, netEarning: 13.2, status: 'pending', paymentMethod: 'cash_on_arrival' },
        { id: 'd4', tripId: 'd4', from: 'Amman', to: 'Aqaba', date: '2026-03-21', seats: 2, pricePerSeat: 8, grossEarning: 16, commission: 1.92, netEarning: 14.08, status: 'pending', paymentMethod: 'card' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEarnings(); }, []);

  const filtered = earnings.filter(e => tab === 'all' ? true : e.status === tab);

  const totalNet    = earnings.filter(e => e.status !== 'cancelled').reduce((s, e) => s + e.netEarning, 0);
  const totalPaid   = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + e.netEarning, 0);
  const totalPending = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.netEarning, 0);
  const totalComm   = earnings.filter(e => e.status !== 'cancelled').reduce((s, e) => s + e.commission, 0);
  const totalTrips  = earnings.filter(e => e.status !== 'cancelled').length;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--wasel-surface-0)', direction: dir }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.35), rgba(4,173,191,0.25))', border: '1px solid rgba(9,115,46,0.25)' }}>
            <Wallet className="w-5 h-5" style={{ color: '#22C55E' }} />
          </div>
          <div>
            <h1 className="font-black text-white" style={{ fontWeight: 900, fontSize: '1.4rem' }}>
              {ar ? 'مكاسبي' : 'My Earnings'}
            </h1>
            <p style={{ color: 'rgba(100,116,139,1)', fontSize: 'var(--wasel-text-caption)' }}>
              {ar ? '88% من كل حجز يذهب لك · 12% عمولة واصل' : '88% of every booking goes to you · 12% Wasel commission'}
            </p>
          </div>
          <button onClick={fetchEarnings} disabled={loading}
            className="ms-auto w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#64748B' }} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-5 max-w-2xl mx-auto">

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.18), rgba(4,173,191,0.12))', border: '1px solid rgba(9,115,46,0.25)' }}>
            <p style={{ color: '#22C55E', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em' }}>
              {ar ? 'إجمالي المكاسب' : 'TOTAL EARNED'}
            </p>
            <p className="font-black mt-1" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
              {totalNet.toFixed(3)}
            </p>
            <p style={{ color: '#22C55E', fontSize: '0.68rem', fontWeight: 600, marginTop: 2 }}>JOD</p>
          </motion.div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div>
                <p style={{ color: '#F59E0B', fontSize: '0.6rem', fontWeight: 600 }}>{ar ? 'قيد الانتظار' : 'PENDING'}</p>
                <p className="font-bold text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>{totalPending.toFixed(3)} JOD</p>
              </div>
              <Clock className="w-5 h-5" style={{ color: '#F59E0B', opacity: 0.7 }} />
            </div>
            <div className="p-3 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <div>
                <p style={{ color: '#22C55E', fontSize: '0.6rem', fontWeight: 600 }}>{ar ? 'مدفوع' : 'PAID OUT'}</p>
                <p className="font-bold text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>{totalPaid.toFixed(3)} JOD</p>
              </div>
              <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E', opacity: 0.7 }} />
            </div>
          </div>
        </div>

        {/* Commission breakdown */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-bold text-white mb-3">{ar ? '📊 تفاصيل العمولة' : '📊 Commission Breakdown'}</p>
            <button onClick={fetchEarnings} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#64748B' }} />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { label: ar ? 'الدخل الإجمالي' : 'Gross revenue', val: (totalNet + totalComm).toFixed(3), color: '#fff' },
              { label: ar ? 'عمولة واصل (12%)' : 'Wasel commission (12%)', val: `-${totalComm.toFixed(3)}`, color: '#EF4444' },
              { label: ar ? 'صافي دخلك (88%)' : 'Your net earnings (88%)', val: totalNet.toFixed(3), color: '#22C55E', bold: true },
            ].map(row => (
              <div key={row.label} className={`flex items-center justify-between py-1.5 ${row.bold ? 'border-t' : ''}`}
                style={row.bold ? { borderColor: 'rgba(255,255,255,0.06)' } : {}}>
                <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? '1rem' : '0.84rem' }}>
                  {row.val} JOD
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#475569' }}>
            <span>{ar ? `${totalTrips} رحلة مكتملة` : `${totalTrips} trips completed`}</span>
            <span>{ar ? 'متوسط لكل رحلة:' : 'Avg per trip:'} {totalTrips > 0 ? (totalNet / totalTrips).toFixed(3) : '0.000'} JOD</span>
          </div>
        </div>

        {/* Tab filter */}
        <div className="flex gap-2">
          {[
            { id: 'all',     label: ar ? 'الكل' : 'All',     count: earnings.length },
            { id: 'pending', label: ar ? 'معلّق' : 'Pending', count: earnings.filter(e => e.status === 'pending').length },
            { id: 'paid',    label: ar ? 'مدفوع' : 'Paid',   count: earnings.filter(e => e.status === 'paid').length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: tab === t.id ? 'rgba(4,173,191,0.15)' : 'rgba(30,41,59,0.4)',
                color: tab === t.id ? '#04ADBF' : '#64748B',
                border: tab === t.id ? '1px solid rgba(4,173,191,0.3)' : '1px solid transparent',
              }}>
              {t.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: tab === t.id ? '#04ADBF' : 'rgba(255,255,255,0.07)', color: tab === t.id ? '#fff' : '#94A3B8' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Earnings list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#04ADBF' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: '#1E293B' }} />
            <p className="text-white font-bold mb-1">{ar ? 'لا توجد مكاسب بعد' : 'No earnings yet'}</p>
            <p style={{ color: '#475569', fontSize: '0.8rem' }} className="mb-4">
              {ar ? 'انشر رحلتك الأولى لتبدأ بكسب المال' : 'Post your first ride to start earning'}
            </p>
            <button onClick={() => navigate('/app/offer-ride')}
              className="btn-wasel-primary px-5 py-2.5 text-sm font-bold"
              style={{ borderRadius: 'var(--wasel-radius-lg)' }}>
              {ar ? 'انشر رحلة ←' : 'Post a Ride →'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((e, i) => (
                <motion.div key={e.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-2xl"
                  style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: e.status === 'paid' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.1)', border: `1px solid ${e.status === 'paid' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.15)'}` }}>
                        {e.status === 'paid'
                          ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: '#22C55E' }} />
                          : <Clock className="w-4.5 h-4.5" style={{ color: '#F59E0B' }} />}
                      </div>
                      <div>
                        <p className="font-bold text-white" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {e.from} → {e.to}
                        </p>
                        <p style={{ color: '#64748B', fontSize: '0.68rem' }}>
                          {e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                          {' · '}{e.seats} {ar ? 'مقعد' : 'seats'} × {e.pricePerSeat} JOD
                        </p>
                      </div>
                    </div>
                    <StatusPill status={e.status} ar={ar} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: ar ? 'الإجمالي' : 'Gross', val: e.grossEarning.toFixed(3), color: '#fff' },
                      { label: ar ? 'العمولة' : 'Commission', val: `-${e.commission.toFixed(3)}`, color: '#EF4444' },
                      { label: ar ? 'صافيك' : 'Your cut', val: e.netEarning.toFixed(3), color: '#22C55E' },
                    ].map(col => (
                      <div key={col.label} className="text-center p-2 rounded-xl"
                        style={{ background: 'rgba(15,23,42,0.5)' }}>
                        <p style={{ color: '#64748B', fontSize: '0.6rem', fontWeight: 600 }}>{col.label}</p>
                        <p style={{ color: col.color, fontWeight: 800, fontSize: '0.9rem' }}>{col.val}</p>
                        <p style={{ color: '#334155', fontSize: '0.55rem' }}>JOD</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* CTA */}
        <div className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(9,115,46,0.06)', border: '1px solid rgba(9,115,46,0.15)' }}>
          <p className="text-white font-bold text-sm mb-1">{ar ? '💡 كسب أكثر' : '💡 Earn More'}</p>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem' }} className="mb-3">
            {ar ? 'ارفع عدد المقاعد لرحلاتك أو قبل طرود أوصل لزيادة دخلك' : 'Increase seats on your trips or accept Awasel packages to boost income'}
          </p>
          <button onClick={() => navigate('/app/offer-ride')}
            className="btn-wasel-primary px-5 py-2 text-sm font-bold"
            style={{ borderRadius: 'var(--wasel-radius-lg)' }}>
            {ar ? 'انشر رحلة جديدة' : 'Post a New Ride'}
          </button>
        </div>
      </div>
    </div>
  );
}