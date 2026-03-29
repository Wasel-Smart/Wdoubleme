/**
 * BetaWaitlist — Sprint 4 Soft Launch
 *
 * Public waitlist page for Wasel soft beta.
 * - Collects name, phone, role (traveler / passenger), preferred route
 * - Issues position in queue + share link
 * - KV-backed via /beta/waitlist endpoint
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, MapPin, Car, Package, CheckCircle, Share2,
  Copy, ArrowRight, Star, Clock, Shield, Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

const ROUTES = [
  { en: 'Amman → Aqaba',    ar: 'عمّان ← العقبة'   },
  { en: 'Amman → Irbid',    ar: 'عمّان ← إربد'     },
  { en: 'Amman → Dead Sea', ar: 'عمّان ← البحر الميت' },
  { en: 'Amman → Zarqa',    ar: 'عمّان ← الزرقاء'  },
  { en: 'Amman → Petra',    ar: 'عمّان ← البتراء'   },
  { en: 'Other',            ar: 'أخرى'               },
];

interface WaitlistEntry {
  position: number;
  referralCode: string;
  name: string;
  email?: string;
}

export function BetaWaitlist() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'passenger' as 'traveler' | 'passenger' | 'sender',
    route: '',
    inviteCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.route) {
      toast.error(ar ? 'حط بياناتك كلها' : 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/beta/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ ...form, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join waitlist');
      setEntry(data);
      toast.success(ar ? '🎉 انضممت للقائمة!' : '🎉 You\'re on the list!');
    } catch (err: any) {
      console.error('[BetaWaitlist] Error:', err);
      toast.error(err.message || (ar ? 'حصل خطأ، جرب مرة ثانية' : 'Something went wrong, try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (!entry) return;
    const link = `${window.location.origin}/beta?ref=${entry.referralCode}`;
    navigator.clipboard?.writeText(link);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
    toast.success(ar ? 'تم نسخ الرابط!' : 'Link copied!');
  };

  const referralLink = entry ? `${window.location.origin}/beta?ref=${entry.referralCode}` : '';

  const PERKS = [
    { icon: Star,   en: 'First 50 travelers — verified badge + free first trip', ar: 'أوّل ٥٠ مسافر — شارة موثّق + رحلة مجانية' },
    { icon: Zap,    en: 'Beta passengers — 30% off first 3 bookings',            ar: 'ركاب البيتا — ٣٠٪ خصم على أوّل ٣ حجوزات'   },
    { icon: Shield, en: 'Priority support & direct line to product team',         ar: 'دعم أولوي وخط مباشر مع فريق المنتج'          },
    { icon: Users,  en: 'Shape the platform — your feedback builds features',     ar: 'أنت تبني المنصة — رأيك يصنع الميزات'         },
  ];

  return (
    <div className="min-h-screen bg-background" dir={ar ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-card via-background to-card border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {ar ? 'البيتا الناعم — مارس ٢٠٢٦' : 'Soft Beta — March 2026'}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              {ar ? (
                <>كن من أوّل <span className="text-primary">٥٠ مسافر</span> في واصل</>
              ) : (
                <>Be among the first <span className="text-primary">50 travelers</span> on Wasel</>
              )}
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              {ar
                ? 'سجّل الآن ووفّر مقعدك في أوّل تجربة مشاركة رحلات طويلة في الأردن'
                : "Register now and secure your spot in Jordan's first long-distance carpooling soft beta"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
        <AnimatePresence mode="wait">
          {!entry ? (
            /* ── Form ── */
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Role selector */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-300 mb-3">
                  {ar ? 'أنا رايح أكون...' : "I'll be joining as..."}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: 'traveler',  icon: Car,     en: 'Traveler',  ar: 'مسافر' },
                    { key: 'passenger', icon: Users,   en: 'Passenger', ar: 'راكب'  },
                    { key: 'sender',    icon: Package, en: 'Sender',    ar: 'مُرسِل' },
                  ] as const).map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setForm({ ...form, role: r.key })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
                        form.role === r.key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-slate-400 hover:border-muted-foreground/30'
                      }`}
                    >
                      <r.icon className="w-5 h-5" />
                      {ar ? r.ar : r.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">{ar ? 'الاسم *' : 'Full Name *'}</Label>
                    <Input
                      placeholder={ar ? 'اسمك بالكامل' : 'Your full name'}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-background border-border text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">{ar ? 'رقم الهاتف *' : 'Phone *'}</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-muted rounded-lg border border-border text-sm text-slate-400">+962</span>
                      <Input
                        type="tel"
                        placeholder="7X XXX XXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                        className="flex-1 bg-background border-border text-white"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300">{ar ? 'الإيميل (اختياري)' : 'Email (optional)'}</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-background border-border text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300">{ar ? 'الطريق المفضّل *' : 'Preferred Route *'}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ROUTES.map((route) => (
                      <button
                        key={route.en}
                        onClick={() => setForm({ ...form, route: route.en })}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          form.route === route.en
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-slate-400 hover:border-muted-foreground/30'
                        }`}
                      >
                        {ar ? route.ar : route.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300">{ar ? 'كود الدعوة (اختياري)' : 'Invite Code (optional)'}</Label>
                  <Input
                    placeholder="WASEL-XXXX"
                    value={form.inviteCode}
                    onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                    className="bg-background border-border text-white font-mono tracking-wider"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      {ar ? 'احجز مقعدي في البيتا' : 'Reserve My Beta Spot'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            /* ── Success ── */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">
                  {ar ? '🎉 أهلاً، ' + entry.name + '!' : `🎉 Welcome, ${entry.name}!`}
                </h2>
                <p className="text-slate-400 text-lg">
                  {ar ? `مرتبتك في القائمة: #${entry.position}` : `Your position in the waitlist: #${entry.position}`}
                </p>
                {entry.position <= 50 && (
                  <span className="inline-block mt-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                    {ar ? '🔥 أنت من أوّل ٥٠!' : '🔥 You\'re in the first 50!'}
                  </span>
                )}
              </div>

              {/* Referral card */}
              <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-3">
                <p className="text-sm font-semibold text-slate-300">
                  {ar ? '👇 شارك واصحى بالقائمة' : '👇 Share to move up the list'}
                </p>
                <p className="text-xs text-slate-500">
                  {ar ? 'كل شخص تدعوه يحط مرتبتك أعلى بـ ١٠ مراكز' : 'Every person you invite moves you up 10 positions'}
                </p>
                <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-3">
                  <span className="text-xs text-slate-300 flex-1 font-mono truncate">{referralLink}</span>
                  <button onClick={handleCopyRef} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    {copiedRef ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCopyRef} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                    <Share2 className="w-4 h-4 mr-2" />
                    {ar ? 'شارك الرابط' : 'Share Link'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-border text-slate-300"
                    onClick={() => {
                      const text = ar
                        ? `انضممت لبيتا واصل! شارك الرحلات الطويلة بالأردن. سجّل من هنا: ${referralLink}`
                        : `I joined Wasel Beta! Long-distance carpooling in Jordan. Join here: ${referralLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Perks */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {ar ? 'مميزات البيتا' : 'Beta Perks'}
          </p>
          {PERKS.map(({ icon: Icon, en, ar: arText }, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-slate-300">{ar ? arText : en}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { n: '47',  label: ar ? 'في القائمة' : 'On waitlist',    sub: ar ? 'حتى الآن' : 'so far'  },
            { n: '12',  label: ar ? 'مسافر مؤكد' : 'Confirmed',      sub: ar ? 'مسافرين' : 'travelers' },
            { n: '3',   label: ar ? 'طرق متاحة'  : 'Routes live',    sub: ar ? 'طرق'     : 'at launch' },
          ].map(({ n, label, sub }, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="text-2xl font-black text-primary">{n}</div>
              <div className="text-xs text-white font-semibold mt-0.5">{label}</div>
              <div className="text-[10px] text-slate-600">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
