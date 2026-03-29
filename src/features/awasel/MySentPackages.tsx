/**
 * MySentPackages — /features/awasel/MySentPackages.tsx
 * Sender's history of all packages posted via Awasel | أوصل
 * Wired to GET /packages/my — real-time status tracking per package
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, MapPin, ChevronLeft, RefreshCw, Loader2,
  Clock, CheckCircle, XCircle, Truck, QrCode, Shield,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { formatCurrency } from '../../utils/currency';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { StatusBadge } from '../../components/StatusBadge';
import { toast } from 'sonner';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

interface SentPackage {
  id: string;
  sender_id: string;
  from: string;
  to: string;
  weight: number;
  value: number;
  description: string;
  fragile: boolean;
  insurance: boolean;
  recipient_name: string;
  recipient_phone: string;
  price: number;
  deadline: string;
  status: string;
  tracking_code: string;
  qr_code: string;
  traveler_id?: string;
  traveler_name?: string;
  accepted_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  created_at: string;
}

const STATUS_STEPS: Record<string, number> = {
  pending: 0,
  accepted: 1,
  picked_up: 2,
  delivered: 3,
  cancelled: -1,
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:    <Clock className="w-4 h-4 text-amber-400" />,
  accepted:   <CheckCircle className="w-4 h-4 text-blue-400" />,
  picked_up:  <Truck className="w-4 h-4 text-violet-400" />,
  delivered:  <CheckCircle className="w-4 h-4 text-emerald-400" />,
  cancelled:  <XCircle className="w-4 h-4 text-red-400" />,
};

export function MySentPackages() {
  const { language } = useLanguage();
  const { session } = useAuth();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [packages, setPackages] = useState<SentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/packages/my`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SentPackage[] = await res.json();
      setPackages(data);
    } catch (err) {
      console.error('[MySentPackages] load failed:', err);
      toast.error(ar ? 'فشل تحميل الطرود' : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const fmtDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(ar ? 'ar-JO' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const copyTracking = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(ar ? 'تم نسخ رمز التتبع' : 'Tracking code copied');
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-foreground leading-tight">
              {ar ? '📦 طرودي المرسلة' : '📦 My Sent Packages'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {ar ? 'أوصل — تتبع طرودك في الوقت الحقيقي' : 'Awasel — real-time package tracking'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="rounded-full">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!loading && packages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-bold text-base mb-1">
              {ar ? 'ما بعثت طرود لحد الآن' : 'No packages sent yet'}
            </h3>
            <p className="text-muted-foreground text-xs max-w-[220px] mb-4">
              {ar
                ? 'ابعث طردتك الأولى مع واحد رايح — ٥ JOD بس!'
                : 'Send your first package with someone already going — from 5 JOD!'}
            </p>
            <Button size="sm" className="rounded-full" onClick={() => navigate('/app/awasel/send')}>
              {ar ? '📦 ابعث طرد' : '📦 Send a Package'}
            </Button>
          </div>
        )}

        {/* Package cards */}
        <AnimatePresence>
          {!loading && packages.map((pkg, i) => {
            const step = STATUS_STEPS[pkg.status] ?? 0;
            const isExpanded = expanded === pkg.id;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="bg-card border border-border overflow-hidden">
                  <div className="p-4 space-y-3">
                    {/* Route + status */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="w-0.5 h-4 bg-border" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">
                          {pkg.from} → {pkg.to}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {fmtDate(pkg.created_at)} · {pkg.weight} kg
                          {pkg.fragile && <span className="ml-1">· ⚠️ {ar ? 'قابل للكسر' : 'Fragile'}</span>}
                        </p>
                      </div>
                      <StatusBadge status={pkg.status} language={language} />
                    </div>

                    {/* Progress bar (not for cancelled) */}
                    {pkg.status !== 'cancelled' && (
                      <div className="flex items-center gap-1">
                        {['pending', 'accepted', 'picked_up', 'delivered'].map((s, idx) => (
                          <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              idx <= step ? 'bg-primary' : 'bg-secondary/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Status icon + label */}
                    <div className="flex items-center gap-2">
                      {STATUS_ICONS[pkg.status] || <Package className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-xs text-muted-foreground">
                        {pkg.status === 'pending'   && (ar ? 'في انتظار مسافر يقبل طردك' : 'Waiting for a traveler to accept')}
                        {pkg.status === 'accepted'  && (ar ? `قبله ${pkg.traveler_name || 'مسافر'} — سيتصل قريباً` : `Accepted by ${pkg.traveler_name || 'a traveler'} — they'll contact you`)}
                        {pkg.status === 'picked_up' && (ar ? 'استلم الطرد — في الطريق' : 'Package picked up — on its way')}
                        {pkg.status === 'delivered' && (ar ? `وصل إلى ${pkg.to}! 🎉` : `Delivered to ${pkg.to}! 🎉`)}
                        {pkg.status === 'cancelled' && (ar ? 'تم إلغاء الطرد' : 'Package cancelled')}
                      </span>
                    </div>

                    {/* Price + tracking toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-primary">
                        {formatCurrency(pkg.price)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setExpanded(isExpanded ? null : pkg.id)}
                      >
                        {isExpanded ? (ar ? 'إخفاء' : 'Less') : (ar ? 'التفاصيل' : 'Details')}
                      </Button>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="h-px bg-border" />

                          {/* Recipient */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">{ar ? 'المستلم' : 'Recipient'}</p>
                              <p className="font-semibold text-foreground">{pkg.recipient_name || '—'}</p>
                              <p className="text-muted-foreground">{pkg.recipient_phone || '—'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{ar ? 'الوصف' : 'Description'}</p>
                              <p className="font-semibold text-foreground truncate">{pkg.description || '—'}</p>
                              <p className="text-muted-foreground">{ar ? `القيمة: ${formatCurrency(pkg.value)}` : `Value: ${formatCurrency(pkg.value)}`}</p>
                            </div>
                          </div>

                          {/* Insurance badge */}
                          {pkg.insurance && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                              <Shield className="w-3 h-3" />
                              <span>{ar ? 'مؤمّن حتى ٠٠ JOD' : 'Insured up to JOD 100'}</span>
                            </div>
                          )}

                          {/* Tracking code */}
                          <button
                            onClick={() => copyTracking(pkg.tracking_code)}
                            className="w-full flex items-center gap-2 bg-secondary/30 border border-border rounded-xl px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
                          >
                            <QrCode className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs font-mono text-foreground flex-1">{pkg.tracking_code}</span>
                            <span className="text-[10px] text-muted-foreground">{ar ? 'انقر للنسخ' : 'tap to copy'}</span>
                          </button>

                          {/* Timestamps */}
                          <div className="space-y-1 text-[10px] text-muted-foreground">
                            <div className="flex justify-between">
                              <span>{ar ? 'تاريخ الإرسال' : 'Posted'}</span>
                              <span>{fmtDate(pkg.created_at)}</span>
                            </div>
                            {pkg.accepted_at && (
                              <div className="flex justify-between">
                                <span>{ar ? 'تاريخ القبول' : 'Accepted'}</span>
                                <span>{fmtDate(pkg.accepted_at)}</span>
                              </div>
                            )}
                            {pkg.picked_up_at && (
                              <div className="flex justify-between">
                                <span>{ar ? 'تاريخ الاستلام' : 'Picked up'}</span>
                                <span>{fmtDate(pkg.picked_up_at)}</span>
                              </div>
                            )}
                            {pkg.delivered_at && (
                              <div className="flex justify-between text-emerald-400">
                                <span>{ar ? 'تاريخ التسليم' : 'Delivered'}</span>
                                <span>{fmtDate(pkg.delivered_at)}</span>
                              </div>
                            )}
                          </div>

                          {/* View full tracking */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => navigate(`/app/awasel/track?code=${pkg.tracking_code}`)}
                          >
                            <MapPin className="w-3 h-3 mr-1.5" />
                            {ar ? 'تتبع الطرد' : 'Track Package'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Send another CTA */}
        {!loading && packages.length > 0 && (
          <Button
            className="w-full h-12 rounded-xl font-bold"
            onClick={() => navigate('/app/awasel/send')}
          >
            📦 {ar ? 'ابعث طرد ثاني' : 'Send Another Package'}
          </Button>
        )}
      </div>
    </div>
  );
}
