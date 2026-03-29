/**
 * UATChecklist — QA / UAT Pass for Sprint 4
 *
 * Full booking → payment → QR scan → delivery flow test.
 * Each test case has: steps, expected result, pass/fail/skip toggle.
 * Results persist in KV store for audit trail.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, XCircle, SkipForward, ChevronDown, ChevronUp,
  Play, Download, RefreshCw, Shield, Package,
  CreditCard, QrCode, Car, Users, Clock, MapPin,
  AlertTriangle, FileText, Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

type TestStatus = 'pending' | 'pass' | 'fail' | 'skip';

interface TestStep {
  description: string;
  expected: string;
}

interface TestCase {
  id: string;
  flow: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  icon: any;
  steps: TestStep[];
  status: TestStatus;
  note: string;
  testedBy?: string;
  testedAt?: string;
}

const INITIAL_CASES: Omit<TestCase, 'status' | 'note' | 'testedBy' | 'testedAt'>[] = [
  // ── CARPOOLING BOOKING FLOW ──────────────────────────────────────────────
  {
    id: 'BOOK-01', flow: 'Carpooling', priority: 'P0', icon: Car,
    title: 'Search rides — results returned for Amman → Aqaba',
    steps: [
      { description: 'Navigate to /app/find-ride', expected: 'SearchRides page loads without error' },
      { description: 'Enter "Amman" as origin, "Aqaba" as destination, select tomorrow as date', expected: 'Form validates and search button enables' },
      { description: 'Click Search', expected: 'Results list shows ≥1 ride cards with price in JOD, seats, gender badge' },
    ],
  },
  {
    id: 'BOOK-02', flow: 'Carpooling', priority: 'P0', icon: Car,
    title: 'Book a seat — seats decrement on confirmation',
    steps: [
      { description: 'Click on a ride card from BOOK-01 results', expected: 'RideDetails page loads with driver info, route, price' },
      { description: 'Select 1 seat and click "Book Seat"', expected: 'BookRide flow opens with cost breakdown showing CostSharing calculator' },
      { description: 'Confirm booking', expected: 'Booking confirmed, seats_available decrements by 1, confirmation screen shown' },
    ],
  },
  {
    id: 'BOOK-03', flow: 'Carpooling', priority: 'P1', icon: Users,
    title: 'Gender preference filter — women-only rides hidden for male passenger',
    steps: [
      { description: 'Open search with a male user profile', expected: 'Rides with gender=women_only are NOT shown in results' },
      { description: 'Switch to a female user profile', expected: 'Women-only rides appear in results with 🚺 badge' },
    ],
  },
  {
    id: 'BOOK-04', flow: 'Carpooling', priority: 'P1', icon: Clock,
    title: 'Prayer stop — auto-calculated for Amman→Aqaba 2PM departure',
    steps: [
      { description: 'Post a ride: Amman → Aqaba, departure 14:00', expected: 'Asr prayer stop (~15:30) and Maghrib stop (~17:45) shown in itinerary' },
      { description: 'Check prayer stop mosque', expected: 'At least 1 pre-vetted mosque with verified facilities shown per stop' },
    ],
  },
  {
    id: 'BOOK-05', flow: 'Carpooling', priority: 'P1', icon: MapPin,
    title: 'Booking requests — traveler receives request notification',
    steps: [
      { description: 'As traveler, navigate to /app/booking-requests', expected: 'BookingRequests page shows pending bookings from BOOK-02' },
      { description: 'Accept the booking', expected: 'Booking status changes to confirmed, passenger sees confirmation' },
    ],
  },

  // ── PAYMENT FLOW ──────────────────────────────────────────────────────────
  {
    id: 'PAY-01', flow: 'Payment', priority: 'P0', icon: CreditCard,
    title: 'Online card payment — booking charge in JOD',
    steps: [
      { description: 'Complete BOOK-02, proceed to payment', expected: 'Payment screen shows JOD amount, card form visible' },
      { description: 'Enter test card 4242 4242 4242 4242, exp 12/28, CVV 123', expected: 'Stripe test charge processes, receipt shown' },
      { description: 'Check server log', expected: 'POST /payments/initiate returns 200, Stripe charge created' },
    ],
  },
  {
    id: 'PAY-02', flow: 'Payment', priority: 'P0', icon: CreditCard,
    title: 'Cash on Arrival — deposit collected + flagged to driver',
    steps: [
      { description: 'During booking, select "Cash on Arrival"', expected: 'JOD 20 deposit prompt shown, COD option displayed' },
      { description: 'Confirm COD booking', expected: 'Driver sees COA flag in BookingRequests, passenger sees JOD 20 deposit charge' },
      { description: 'Verify deposit in KV store', expected: 'deposit:booking_id key set to 20.000 JOD' },
    ],
  },
  {
    id: 'PAY-03', flow: 'Payment', priority: 'P1', icon: CreditCard,
    title: 'Split payment — amount divided correctly among 3 passengers',
    steps: [
      { description: 'Open SplitPayment for a JOD 30 ride with 3 passengers', expected: 'Each share shows JOD 10.000' },
      { description: 'Add third member, verify recalculation', expected: 'Shares update automatically to equal split' },
    ],
  },
  {
    id: 'PAY-04', flow: 'Payment', priority: 'P2', icon: CreditCard,
    title: 'BNPL — Tabby redirect triggers for eligible amount',
    steps: [
      { description: 'Select Tabby on payment screen for JOD 12+ booking', expected: 'Tabby redirect or inline flow opens' },
      { description: 'Verify toast', expected: '"رح تنتقل عـ Tabby..." shown in Arabic (Ammiyah, not MSA)' },
    ],
  },

  // ── RAJE3 PACKAGE DELIVERY FLOW ──────────────────────────────────────────
  {
    id: 'PKG-01', flow: 'Raje3 Delivery', priority: 'P0', icon: Package,
    title: 'Send package — posted and visible to travelers on matching route',
    steps: [
      { description: 'Navigate to /app/awasel/send', expected: 'SendPackage form loads with weight, size, route fields' },
      { description: 'Fill: Amman → Aqaba, 2 kg, JOD 5 offer, description "Small parcel"', expected: 'Form validates, submit enabled' },
      { description: 'Submit package', expected: 'POST /packages returns 201, package_id assigned, status=pending' },
    ],
  },
  {
    id: 'PKG-02', flow: 'Raje3 Delivery', priority: 'P0', icon: Package,
    title: 'Traveler accepts package — status changes to in_transit',
    steps: [
      { description: 'As traveler on Amman→Aqaba route, visit /app/raje3/available-packages', expected: 'Package from PKG-01 visible with weight, price, route' },
      { description: 'Accept package', expected: 'PATCH /packages/:id returns status=accepted, assigned to traveler' },
      { description: 'Sender receives notification', expected: '"راجع: مسافر قبل طردك!" push notification sent' },
    ],
  },
  {
    id: 'PKG-03', flow: 'Raje3 Delivery', priority: 'P0', icon: QrCode,
    title: 'QR scan pickup — traveler scans at pickup, status = picked_up',
    steps: [
      { description: 'Navigate to /app/awasel/qr-scanner', expected: 'QRScanner component loads with camera permission request' },
      { description: 'Scan QR code for package from PKG-02', expected: 'QR decoded, PATCH /packages/:id/status → picked_up, timestamp recorded' },
      { description: 'Verify tracking', expected: '/app/raje3/track shows "In Transit" with live status' },
    ],
  },
  {
    id: 'PKG-04', flow: 'Raje3 Delivery', priority: 'P0', icon: QrCode,
    title: 'QR scan delivery — recipient scans, status = delivered',
    steps: [
      { description: 'Recipient scans delivery QR at destination', expected: 'Status → delivered, delivery timestamp saved' },
      { description: 'Traveler payment released', expected: 'JOD 4 (80% of JOD 5) credited to traveler wallet' },
      { description: 'Insurance fee deducted', expected: 'JOD 0.50 insurance fee recorded in revenue log' },
    ],
  },
  {
    id: 'PKG-05', flow: 'Raje3 Delivery', priority: 'P1', icon: Package,
    title: 'My packages — sender sees sent packages with status',
    steps: [
      { description: 'Navigate to /app/raje3/my-packages', expected: 'MySentPackages loads, shows PKG-01 with current status' },
      { description: 'Check status badge', expected: 'Correct status badge (pending / in_transit / delivered) displayed' },
    ],
  },

  // ── SAFETY ───────────────────────────────────────────────────────────────
  {
    id: 'SAFE-01', flow: 'Safety', priority: 'P1', icon: Shield,
    title: 'Emergency SOS — alert sent, live location shared',
    steps: [
      { description: 'During live trip, tap SOS button', expected: 'SOSDialog opens with confirmation prompt' },
      { description: 'Confirm emergency', expected: 'Toast: "🚨 Emergency alert sent! Help is on the way." — safety team notified' },
    ],
  },
  {
    id: 'SAFE-02', flow: 'Safety', priority: 'P2', icon: Shield,
    title: 'Trust score — 5-star rating updates traveler profile score',
    steps: [
      { description: 'Complete a trip and submit 5-star rating', expected: 'POST /reviews returns 201' },
      { description: 'Check traveler profile', expected: 'TrustScore component shows updated average rating' },
    ],
  },

  // ── CULTURAL ─────────────────────────────────────────────────────────────
  {
    id: 'CULT-01', flow: 'Cultural', priority: 'P1', icon: AlertTriangle,
    title: 'Ramadan Mode — iftar-timed ride shows correct Maghrib time',
    steps: [
      { description: 'Enable Ramadan Mode in cultural settings', expected: 'Ramadan Mode toggle activates, rides filtered to arrive before Maghrib' },
      { description: 'Check ride ETA for March 2026', expected: 'Iftar time ~18:00 shown, rides arriving after 18:00 flagged' },
    ],
  },
  {
    id: 'CULT-02', flow: 'Cultural', priority: 'P2', icon: AlertTriangle,
    title: 'Arabic dialect — all toasts/labels in Jordanian Ammiyah, not MSA',
    steps: [
      { description: 'Switch language to Arabic, trigger COD terms error', expected: '"لازم توافق على الشروط" (NOT "يرجى الموافقة على الشروط")' },
      { description: 'Trigger BNPL redirect', expected: '"رح تنتقل عـ Tabby..." (NOT "سيتم توجيهك إلى")' },
      { description: 'Trigger SplitPayment empty name error', expected: '"حط اسم" (NOT "يرجى إدخال اسم")' },
    ],
  },
];

const STATUS_CONFIG: Record<TestStatus, { icon: any; label: string; cls: string }> = {
  pending: { icon: Clock,        label: 'Pending',  cls: 'bg-slate-500/10  text-slate-400  border-slate-500/20'  },
  pass:    { icon: CheckCircle,  label: 'Pass',     cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  fail:    { icon: XCircle,      label: 'Fail',     cls: 'bg-red-500/10    text-red-400    border-red-500/20'    },
  skip:    { icon: SkipForward,  label: 'Skipped',  cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
};

const PRIORITY_CLS: Record<string, string> = {
  P0: 'bg-red-500/10 text-red-400 border-red-500/20',
  P1: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  P2: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function UATChecklist() {
  const [cases, setCases] = useState<TestCase[]>(() =>
    INITIAL_CASES.map((c) => ({ ...c, status: 'pending', note: '' }))
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [testerName, setTesterName] = useState('QA Engineer');
  const [activeFlow, setActiveFlow] = useState<string>('All');

  const flows = ['All', ...Array.from(new Set(INITIAL_CASES.map(c => c.flow)))];

  const filteredCases = activeFlow === 'All' ? cases : cases.filter(c => c.flow === activeFlow);

  const summary = {
    total:   cases.length,
    pass:    cases.filter(c => c.status === 'pass').length,
    fail:    cases.filter(c => c.status === 'fail').length,
    skip:    cases.filter(c => c.status === 'skip').length,
    pending: cases.filter(c => c.status === 'pending').length,
  };
  const passRate = summary.total ? Math.round((summary.pass / (summary.total - summary.skip)) * 100) : 0;

  const updateStatus = (id: string, status: TestStatus) => {
    setCases(prev => prev.map(c =>
      c.id === id ? { ...c, status, testedBy: testerName, testedAt: new Date().toISOString() } : c
    ));
  };

  const updateNote = (id: string, note: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, note } : c));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSaveResults = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/beta/uat-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ cases, summary, passRate, tester: testerName, savedAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      toast.success('UAT results saved to KV store ✅');
    } catch (err: any) {
      console.error('[UATChecklist] save error:', err);
      toast.error(err.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Flow', 'Title', 'Priority', 'Status', 'Note', 'Tester', 'Tested At'],
      ...cases.map(c => [c.id, c.flow, c.title, c.priority, c.status, c.note, c.testedBy || '', c.testedAt || '']),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `wasel-uat-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('UAT report exported as CSV');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            UAT Checklist — Sprint 4
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full flow: Booking → Payment → QR Scan → Delivery · {new Date().toLocaleDateString('en-JO')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={testerName}
            onChange={(e) => setTesterName(e.target.value)}
            className="h-9 px-3 bg-card border border-border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/40 w-40"
            placeholder="Tester name"
          />
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="border-border text-slate-400 gap-1.5">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={handleSaveResults} disabled={saving} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Save Results
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',   value: summary.total,   cls: 'text-white'           },
          { label: 'Pass',    value: summary.pass,    cls: 'text-emerald-400'     },
          { label: 'Fail',    value: summary.fail,    cls: 'text-red-400'         },
          { label: 'Skipped', value: summary.skip,    cls: 'text-amber-400'       },
          { label: 'Pass Rate', value: `${passRate}%`, cls: passRate >= 80 ? 'text-emerald-400' : passRate >= 60 ? 'text-amber-400' : 'text-red-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`text-2xl font-black ${cls}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Test Progress</span>
          <span className="text-primary font-bold">{summary.total - summary.pending} / {summary.total} tested</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          <div className="bg-emerald-400 h-full transition-all" style={{ width: `${(summary.pass / summary.total) * 100}%` }} />
          <div className="bg-red-400 h-full transition-all"     style={{ width: `${(summary.fail / summary.total) * 100}%` }} />
          <div className="bg-amber-400 h-full transition-all"   style={{ width: `${(summary.skip / summary.total) * 100}%` }} />
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Pass</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Fail</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Skipped</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> Pending</span>
        </div>
      </div>

      {/* Flow filter */}
      <div className="flex flex-wrap gap-2">
        {flows.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFlow(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeFlow === f ? 'bg-primary border-primary text-white' : 'border-border text-slate-400 hover:border-muted-foreground/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Test cases */}
      <div className="space-y-3">
        {filteredCases.map((tc) => {
          const StatusIcon   = STATUS_CONFIG[tc.status].icon;
          const statusCls    = STATUS_CONFIG[tc.status].cls;
          const isExpanded   = expanded.has(tc.id);
          const TcIcon       = tc.icon;

          return (
            <motion.div
              key={tc.id}
              layout
              className={`bg-card border rounded-2xl overflow-hidden transition-all ${
                tc.status === 'fail' ? 'border-red-500/30' :
                tc.status === 'pass' ? 'border-emerald-500/20' :
                'border-border'
              }`}
            >
              {/* Row header */}
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TcIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_CLS[tc.priority]}`}>
                      {tc.priority}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">{tc.id}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{tc.flow}</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate">{tc.title}</p>
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${statusCls}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {STATUS_CONFIG[tc.status].label}
                </span>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => updateStatus(tc.id, 'pass')}  title="Pass"  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${tc.status === 'pass'  ? 'bg-emerald-500/20 border-emerald-500/30' : 'border-border hover:border-emerald-500/30 hover:bg-emerald-500/10'}`}>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button onClick={() => updateStatus(tc.id, 'fail')}  title="Fail"  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${tc.status === 'fail'  ? 'bg-red-500/20 border-red-500/30'         : 'border-border hover:border-red-500/30 hover:bg-red-500/10'}`}>
                    <XCircle className="w-4 h-4 text-red-400" />
                  </button>
                  <button onClick={() => updateStatus(tc.id, 'skip')}  title="Skip"  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${tc.status === 'skip'  ? 'bg-amber-500/20 border-amber-500/30'     : 'border-border hover:border-amber-500/30 hover:bg-amber-500/10'}`}>
                    <SkipForward className="w-4 h-4 text-amber-400" />
                  </button>
                  <button onClick={() => toggleExpand(tc.id)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-slate-500 hover:text-white transition-all">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable steps + notes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
                      {/* Steps */}
                      <div className="space-y-2">
                        {tc.steps.map((step, i) => (
                          <div key={i} className="flex gap-3 text-xs">
                            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0 text-[10px] mt-0.5">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-300">{step.description}</p>
                              <p className="text-slate-600 mt-0.5">→ {step.expected}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-[11px] text-slate-600 mb-1">Notes / Defect Details</p>
                        <textarea
                          value={tc.note}
                          onChange={(e) => updateNote(tc.id, e.target.value)}
                          rows={2}
                          placeholder="Describe what happened, screenshots, logs..."
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary/30 resize-none"
                        />
                      </div>

                      {tc.testedAt && (
                        <p className="text-[10px] text-slate-600">
                          Tested by <strong className="text-slate-400">{tc.testedBy}</strong> at {new Date(tc.testedAt).toLocaleString('en-JO')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
