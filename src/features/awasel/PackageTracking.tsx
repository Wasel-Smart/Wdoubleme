/**
 * PackageTracking -- Awasel | Package tracking wired to real backend
 * Fetches real package data from /packages/track/:code or /packages/:id
 * Falls back to search params for tracking code or package ID
 */

import { useSearchParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';

import {
  Package, CheckCircle2, Clock, QrCode, Shield,
  MessageCircle, AlertTriangle, RefreshCw, Loader2,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

type TrackingStatus = 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered';

interface PackageData {
  id: string;
  from: string; to: string;
  weight: number; description: string;
  recipient_name: string; recipient_phone: string;
  sender_phone: string; price: number;
  status: TrackingStatus;
  tracking_code: string;
  qr_code: string;
  insurance: boolean;
  fragile: boolean;
  traveler_id?: string;
  traveler_name?: string;
  created_at: string;
  accepted_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
}

const STATUS_STEPS: { key: TrackingStatus; icon: string; en: string; ar: string; descEn: string; descAr: string }[] = [
  { key: 'pending',   icon: '\uD83D\uDCE6', en: 'Package Posted',      ar: '\u062A\u0645 \u0646\u0634\u0631 \u0627\u0644\u0637\u0631\u062F',       descEn: 'Your package listing is live',                   descAr: '\u062A\u0645 \u0646\u0634\u0631 \u0637\u0631\u062F\u0643 \u0648\u0647\u0648 \u0645\u062A\u0627\u062D \u0627\u0644\u0622\u0646' },
  { key: 'accepted',  icon: '\uD83E\uDD1D', en: 'Traveler Matched',    ar: '\u062A\u0645 \u0645\u0637\u0627\u0628\u0642\u0629 \u0645\u0633\u0627\u0641\u0631',     descEn: 'A traveler accepted your package',                descAr: '\u0645\u0633\u0627\u0641\u0631 \u0642\u0628\u0644 \u062A\u0648\u0635\u064A\u0644 \u0637\u0631\u062F\u0643' },
  { key: 'picked_up', icon: '\uD83D\uDCF1', en: 'Picked Up (QR \u2713)', ar: '\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 (QR \u2713)',   descEn: 'Package handed to traveler \u2014 QR code verified',     descAr: '\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0631\u062F \u0644\u0644\u0645\u0633\u0627\u0641\u0631 \u2014 \u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0643\u0648\u062F QR' },
  { key: 'in_transit',icon: '\uD83D\uDE97', en: 'In Transit',          ar: '\u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642',                descEn: 'En route to destination',                         descAr: '\u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642 \u0644\u0644\u0648\u062C\u0647\u0629' },
  { key: 'delivered', icon: '\u2705',         en: 'Delivered (QR \u2713)', ar: '\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 (QR \u2713)',  descEn: 'Recipient received the package',                  descAr: '\u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0627\u0633\u062A\u0644\u0645 \u0627\u0644\u0637\u0631\u062F' },
];

function getStepIndex(status: TrackingStatus): number {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function PackageTracking() {
  const { language, dir } = useLanguage();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRTL = language === 'ar';

  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Accept tracking code or package ID from search params
  const [trackingInput, setTrackingInput] = useState(
    searchParams.get('code') || searchParams.get('id') || ''
  );

  const fetchPackage = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = session?.access_token || publicAnonKey;
      // Try tracking code endpoint first, then direct ID
      let res = await fetch(`${API}/packages/track/${encodeURIComponent(code.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status === 404) {
        // Try by package ID
        res = await fetch(`${API}/packages/${encodeURIComponent(code.trim())}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPkg(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('[PackageTracking] fetch error:', err);
      setError(isRTL ? '\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u062F' : 'Package not found');
    } finally {
      setLoading(false);
    }
  }, [session, isRTL]);

  // Auto-fetch if code was provided via URL
  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('id');
    if (code) fetchPackage(code);
  }, [searchParams, fetchPackage]);

  const handleRefresh = async () => {
    if (!pkg?.tracking_code && !trackingInput) return;
    setRefreshing(true);
    await fetchPackage(pkg?.tracking_code || trackingInput);
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (trackingInput.trim()) fetchPackage(trackingInput.trim());
  };

  const currentStepIdx = pkg ? getStepIndex(pkg.status) : -1;
  const progress = pkg ? ((currentStepIdx) / (STATUS_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl" dir={dir}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
                {isRTL ? '\u062A\u062A\u0628\u0639 \u0627\u0644\u0637\u0631\u062F' : 'Package Tracking'}
              </h1>
              {pkg && <p className="text-sm text-muted-foreground font-mono">{pkg.tracking_code}</p>}
            </div>
          </div>
          {pkg && (
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all text-xs ${refreshing ? 'opacity-50' : ''}`}
              disabled={refreshing}
              style={{ fontSize: '0.75rem' }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {isRTL ? '\u062A\u062D\u062F\u064A\u062B' : 'Refresh'}
            </button>
          )}
        </div>
        {pkg && (
          <p className="text-xs text-muted-foreground">
            {isRTL ? `\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: ${lastUpdated.toLocaleTimeString('ar')}` : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        )}
      </motion.div>

      {/* Search input if no package loaded */}
      {!pkg && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card border-border mb-6">
            <h3 className="font-bold text-foreground mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>
              {isRTL ? '\u0623\u062F\u062E\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062A\u0628\u0639' : 'Enter Tracking Code'}
            </h3>
            <div className="flex gap-2">
              <Input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder={isRTL ? '\u0645\u062B\u0644: AWXXXXXX' : 'e.g. AWXXXXXX'}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={!trackingInput.trim()}>
                {isRTL ? '\u062A\u062A\u0628\u0639' : 'Track'}
              </Button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            {isRTL ? '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...' : 'Loading...'}
          </span>
        </div>
      )}

      {/* Error after search */}
      {!loading && error && pkg === null && trackingInput && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-6 bg-card border-border mb-6 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-amber-400 mb-3" />
            <p className="text-foreground font-bold mb-1">{isRTL ? '\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u062F' : 'Package Not Found'}</p>
            <p className="text-sm text-muted-foreground mb-3">
              {isRTL ? '\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u0645\u0632 \u0627\u0644\u062A\u062A\u0628\u0639 \u0648\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629' : 'Check the tracking code and try again'}
            </p>
            <Button variant="outline" onClick={() => { setPkg(null); setError(''); }}>
              {isRTL ? '\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629' : 'Try Again'}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Package Data Loaded */}
      {pkg && !loading && (
        <>
          {/* Status Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 bg-card border-border mb-6">
              <div className={`flex items-center justify-between mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl">
                    {STATUS_STEPS[currentStepIdx]?.icon || '\uD83D\uDCE6'}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold" style={{ fontWeight: 600, fontSize: '0.65rem' }}>
                      {isRTL ? '\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629' : 'CURRENT STATUS'}
                    </p>
                    <p className="text-xl font-bold text-primary" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                      {isRTL ? STATUS_STEPS[currentStepIdx]?.ar : STATUS_STEPS[currentStepIdx]?.en}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{isRTL ? '\u0627\u0644\u0631\u0633\u0648\u0645' : 'Fee'}</p>
                  <p className="font-bold text-foreground" style={{ fontWeight: 700 }}>{pkg.price} JOD</p>
                </div>
              </div>

              {/* Route */}
              <div className={`flex items-center gap-3 mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-1" />
                  <p className="text-sm font-bold text-foreground" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {pkg.from}
                  </p>
                </div>
                <div className="flex-1 relative">
                  <div className="h-1 bg-muted rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <motion.div
                    initial={{ left: '0%' }}
                    animate={{ left: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-base"
                    style={{ position: 'absolute' }}
                  >
                    {pkg.status === 'delivered' ? '\u2705' : '\uD83D\uDCE6'}
                  </motion.div>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${pkg.status === 'delivered' ? 'bg-primary' : 'bg-muted'}`} />
                  <p className="text-sm font-bold text-foreground" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {pkg.to}
                  </p>
                </div>
              </div>

              {/* Package mini-info */}
              <div className={`flex gap-4 pt-4 border-t border-border text-sm flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                {pkg.weight > 0 && (
                  <div>
                    <span className="text-muted-foreground">{isRTL ? '\u0627\u0644\u0648\u0632\u0646: ' : 'Weight: '}</span>
                    <span className="font-semibold text-foreground" style={{ fontWeight: 600 }}>{pkg.weight} kg</span>
                  </div>
                )}
                {pkg.description && (
                  <div>
                    <span className="text-muted-foreground">{isRTL ? '\u0627\u0644\u0645\u062D\u062A\u0648\u064A\u0627\u062A: ' : 'Contents: '}</span>
                    <span className="font-semibold text-foreground" style={{ fontWeight: 600 }}>{pkg.description}</span>
                  </div>
                )}
                {pkg.insurance && (
                  <div className="flex items-center gap-1 text-primary">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="text-xs" style={{ fontSize: '0.7rem' }}>{isRTL ? '\u0645\u0624\u0645\u0646' : 'Insured'}</span>
                  </div>
                )}
                {pkg.fragile && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs" style={{ fontSize: '0.7rem' }}>{isRTL ? '\u0647\u0634' : 'Fragile'}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 bg-card border-border mb-6">
              <h3 className="font-bold text-foreground mb-5" style={{ fontWeight: 700, fontSize: '1rem' }}>
                {isRTL ? '\uD83D\uDCCB \u0633\u062C\u0644 \u0627\u0644\u062A\u062A\u0628\u0639' : '\uD83D\uDCCB Tracking Timeline'}
              </h3>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, idx) => {
                  const isPast = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  const timestamp = idx === 0 ? pkg.created_at
                    : step.key === 'accepted' ? pkg.accepted_at
                    : step.key === 'picked_up' ? pkg.picked_up_at
                    : step.key === 'delivered' ? pkg.delivered_at
                    : undefined;

                  return (
                    <div key={step.key} className={`relative flex gap-4 pb-6 last:pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute ${isRTL ? 'right-5' : 'left-5'} w-0.5 h-full ${isPast ? 'bg-primary' : 'bg-border'}`}
                          style={{ top: '2.5rem', height: 'calc(100% - 2.5rem)' }}
                        />
                      )}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                        isPast ? 'bg-primary/20 border-2 border-primary' :
                        isActive ? 'bg-primary border-2 border-primary shadow-lg shadow-primary/30' :
                        'bg-muted border-2 border-border'
                      }`}>
                        {isPast ? <CheckCircle2 className="h-5 w-5 text-primary" /> : step.icon}
                      </div>
                      <div className={`flex-1 pt-1 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-0.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <p className={`font-semibold text-sm ${isActive ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}
                            style={{ fontWeight: isActive ? 700 : 600, fontSize: '0.875rem' }}>
                            {isRTL ? step.ar : step.en}
                          </p>
                          {isActive && pkg.status !== 'delivered' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs animate-pulse"
                              style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                              {isRTL ? '\u0627\u0644\u0622\u0646' : 'LIVE'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-0.5" style={{ fontSize: '0.75rem' }}>
                          {isRTL ? step.descAr : step.descEn}
                        </p>
                        {timestamp && (
                          <p className="text-xs text-muted-foreground" style={{ fontSize: '0.65rem' }}>
                            {new Date(timestamp).toLocaleString(isRTL ? 'ar-JO' : 'en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Traveler Info (if assigned) */}
          {pkg.traveler_name && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-6 bg-card border-border mb-6">
                <h3 className="font-bold text-foreground mb-4" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {isRTL ? '\uD83E\uDDD1\u200D\u2708\uFE0F \u0627\u0644\u0645\u0633\u0627\u0641\u0631 \u0627\u0644\u062D\u0627\u0645\u0644 \u0644\u0637\u0631\u062F\u0643' : '\uD83E\uDDD1\u200D\u2708\uFE0F Your Package Carrier'}
                </h3>
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0"
                    style={{ fontWeight: 700 }}>
                    {pkg.traveler_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground" style={{ fontWeight: 700 }}>
                      {pkg.traveler_name}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? '\u062A\u0645 \u0627\u0644\u0642\u0628\u0648\u0644' : 'Accepted'}
                      {pkg.accepted_at && (
                        <span> - {new Date(pkg.accepted_at).toLocaleDateString(isRTL ? 'ar-JO' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" style={{ fontSize: '0.875rem' }}
                    onClick={() => navigate('/app/messages')}>
                    <MessageCircle className="h-4 w-4" />
                    {isRTL ? '\u0631\u0627\u0633\u0644\u0647' : 'Chat'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* QR Codes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6 bg-card border-border">
              <h3 className="font-bold text-foreground mb-4" style={{ fontWeight: 700, fontSize: '1rem' }}>
                {'\uD83D\uDCF1'} {isRTL ? '\u0643\u0648\u062F QR \u0644\u0644\u062A\u0633\u0644\u064A\u0645' : 'Delivery QR Code'}
              </h3>
              <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 bg-muted/30 rounded-xl p-4 text-center border ${
                  pkg.picked_up_at ? 'border-green-500/30' : 'border-border'
                }`}>
                  <QrCode className={`h-16 w-16 mx-auto mb-2 ${pkg.picked_up_at ? 'text-green-400' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-semibold text-foreground mb-1" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    {pkg.picked_up_at
                      ? (isRTL ? '\u2705 \u0643\u0648\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 (\u062A\u0645)' : '\u2705 Pickup QR (Done)')
                      : (isRTL ? '\u0643\u0648\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645' : 'Pickup QR')
                    }
                  </p>
                  {pkg.picked_up_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(pkg.picked_up_at).toLocaleTimeString(isRTL ? 'ar' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className={`flex-1 bg-muted/30 rounded-xl p-4 text-center border ${
                  pkg.delivered_at ? 'border-green-500/30' : 'border-primary/30'
                }`}>
                  <QrCode className={`h-16 w-16 mx-auto mb-2 ${pkg.delivered_at ? 'text-green-400' : 'text-primary'}`} />
                  <p className="text-xs font-semibold text-foreground mb-1" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    {pkg.delivered_at
                      ? (isRTL ? '\u2705 \u0643\u0648\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 (\u062A\u0645)' : '\u2705 Delivery QR (Done)')
                      : (isRTL ? '\uD83D\uDD35 \u0643\u0648\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 (\u0644\u0644\u0645\u0633\u062A\u0644\u0645)' : '\uD83D\uDD35 Delivery QR (For Recipient)')
                    }
                  </p>
                  {!pkg.delivered_at && (
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? '\u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0639\u0646\u062F \u0627\u0644\u0648\u0635\u0648\u0644' : 'Use when package arrives'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300" style={{ fontSize: '0.75rem' }}>
                  {isRTL
                    ? '\u0634\u0627\u0631\u0643 \u0643\u0648\u062F QR \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0645\u0639 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0641\u0642\u0637 \u2014 \u0644\u0627 \u062A\u0639\u0637\u064A\u0647 \u0644\u063A\u064A\u0631\u0647 \u0644\u0636\u0645\u0627\u0646 \u0633\u0644\u0627\u0645\u0629 \u0637\u0631\u062F\u0643'
                    : 'Share the delivery QR code only with the recipient \u2014 do not share with others to ensure package security'}
                </p>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}