/**
 * Settings — Wasel user settings page
 *
 * ✅ Profile form connected to updateProfile() (real backend)
 * ✅ Push Notifications toggle:
 *    - reads  GET  /notifications/push-pref  on mount
 *    - writes POST /notifications/push-pref  on toggle
 *    - calls browser Notification.requestPermission() when user enables
 *    - shows current browser permission status with colour coding
 * ✅ Per-event toggles persisted to server
 * ✅ Language & Dark Mode toggles
 * ✅ Password change & 2FA stubs
 * ✅ Full dark Wasel design system
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CircleUserRound, BellRing, Globe, ShieldCheck, HelpCircle,
  Languages, Moon, Bell, BellOff, Smartphone, CheckCircle,
  AlertTriangle, Loader2, Car, MessageSquare, CreditCard,
  Megaphone, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { toast } from 'sonner';
import { API_URL, fetchWithRetry, getAuthDetails } from '../services/core';
import { motion, AnimatePresence } from 'motion/react';

// ── Push preference type ───────────────────────────────────────────────────────

interface PushPref {
  enabled: boolean;
  events: string[];
}

const DEFAULT_PREF: PushPref = {
  enabled: false,
  events: ['trip_confirmed', 'driver_approaching', 'trip_started', 'trip_completed'],
};

const EVENT_OPTIONS = [
  {
    id: 'trip_confirmed',
    label: 'Trip Confirmations',
    labelAr: 'تأكيدات الرحلة',
    icon: Car,
    description: 'When a driver accepts your booking',
  },
  {
    id: 'driver_approaching',
    label: 'Driver Approaching',
    labelAr: 'السائق يقترب',
    icon: Car,
    description: 'When your driver is ~2 min away',
  },
  {
    id: 'trip_started',
    label: 'Trip Started',
    labelAr: 'بدأت الرحلة',
    icon: Car,
    description: 'When your ride begins',
  },
  {
    id: 'trip_completed',
    label: 'Trip Completed',
    labelAr: 'اكتملت الرحلة',
    icon: CheckCircle,
    description: 'When you arrive at your destination',
  },
  {
    id: 'new_message',
    label: 'New Messages',
    labelAr: 'رسائل جديدة',
    icon: MessageSquare,
    description: 'In-trip messages from your driver',
  },
  {
    id: 'payment_received',
    label: 'Payments & Wallet',
    labelAr: 'المدفوعات والمحفظة',
    icon: CreditCard,
    description: 'Wallet top-ups and fare receipts',
  },
  {
    id: 'promotional',
    label: 'Promotions & Offers',
    labelAr: 'العروض والتخفيضات',
    icon: Megaphone,
    description: 'Wasel deals, promo codes, AI insights',
  },
] as const;

// ── Settings component ─────────────────────────────────────────────────────────

export function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { profile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSupported, permission, requestPermission } = usePushNotifications();

  // ── Profile form ──────────────────────────────────────────────────────────

  const [firstName, setFirstName] = useState(profile?.full_name?.split(' ')[0] || '');
  const [lastName, setLastName]   = useState(profile?.full_name?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone]         = useState((profile as any)?.phone || '');
  const [bio, setBio]             = useState((profile as any)?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Keep in sync with profile changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.full_name?.split(' ')[0] || '');
      setLastName(profile.full_name?.split(' ').slice(1).join(' ') || '');
      setPhone((profile as any)?.phone || '');
      setBio((profile as any)?.bio || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await updateProfile({
        full_name: `${firstName} ${lastName}`.trim(),
        ...(phone ? { phone } : {}),
        ...(bio   ? { bio }   : {}),
      } as any);

      if (error) {
        toast.error(language === 'ar' ? 'فشل حفظ التغييرات' : 'Failed to save changes');
      } else {
        toast.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Profile saved successfully');
      }
    } catch {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Push notification preferences ────────────────────────────────────────

  const [pref, setPref]               = useState<PushPref>(DEFAULT_PREF);
  const [prefLoading, setPrefLoading] = useState(true);
  const [prefSaving, setPrefSaving]   = useState(false);

  // Load server preference on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { token } = await getAuthDetails();
        const res = await fetchWithRetry(`${API_URL}/notifications/push-pref`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.pref) setPref(data.pref);
        }
      } catch {
        // Silent — fallback to defaults
      } finally {
        if (!cancelled) setPrefLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** Persist entire pref object to server */
  const savePref = useCallback(async (next: PushPref) => {
    setPrefSaving(true);
    try {
      const { token } = await getAuthDetails();
      await fetchWithRetry(`${API_URL}/notifications/push-pref`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(next),
      });
    } catch {
      toast.error('Failed to save notification preference');
    } finally {
      setPrefSaving(false);
    }
  }, []);

  /** Toggle master push switch (requests browser permission if needed) */
  const handleMasterToggle = useCallback(async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        toast.error('Browser permission denied — notifications are blocked.', {
          description: 'To re-enable, go to browser settings → Site permissions → Notifications.',
        });
        return;
      }
    }
    const next = { ...pref, enabled: checked };
    setPref(next);
    await savePref(next);
    toast.success(
      checked
        ? (language === 'ar' ? 'تم تفعيل الإشعارات' : 'Push notifications enabled')
        : (language === 'ar' ? 'تم إيقاف الإشعارات' : 'Push notifications disabled'),
    );
  }, [pref, permission, requestPermission, savePref, language]);

  /** Toggle an individual event */
  const handleEventToggle = useCallback(async (eventId: string, checked: boolean) => {
    const events = checked
      ? [...new Set([...pref.events, eventId])]
      : pref.events.filter(e => e !== eventId);
    const next = { ...pref, events };
    setPref(next);
    await savePref(next);
  }, [pref, savePref]);

  // ── Permission status badge ────────────────────────────────────────────────

  const permBadge = () => {
    if (!isSupported) return { label: 'Not Supported', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: BellOff };
    if (permission === 'granted') return { label: 'Allowed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
    if (permission === 'denied')  return { label: 'Blocked', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertTriangle };
    return { label: 'Not Asked', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Bell };
  };

  const pb = permBadge();

  // ── Language helper ────────────────────────────────────────────────────────

  const handleLanguageChange = (newLang: 'en' | 'ar') => {
    setLanguage(newLang);
    toast.success(language === 'ar' ? 'تم تغيير اللغة' : 'Language changed');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-white text-2xl font-bold">
          Settings
          <span className="text-slate-500 text-lg font-normal ml-2" dir="rtl">الإعدادات</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account, notifications, and preferences</p>
      </div>

      {/* ── Profile ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CircleUserRound className="w-5 h-5 text-primary" />
            {t('settings.profile.title')}
          </CardTitle>
          <CardDescription className="text-slate-500">{t('settings.profile.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">{t('settings.profile.firstName')}</Label>
              <Input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="bg-background border-border text-white focus:border-primary/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{t('settings.profile.lastName')}</Label>
              <Input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="bg-background border-border text-white focus:border-primary/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">{t('settings.profile.email')}</Label>
            <Input
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-background border-border text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600">
              {language === 'ar' ? 'الإيميل ما بينتغير' : 'Email cannot be changed'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">{t('settings.profile.phone')}</Label>
            <Input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+962 79 123 4567"
              className="bg-background border-border text-white placeholder:text-slate-600 focus:border-primary/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">{t('settings.profile.bio')}</Label>
            <Input
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={t('settings.profile.bioPlaceholder')}
              className="bg-background border-border text-white placeholder:text-slate-600 focus:border-primary/40"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t('common.saveChanges')}
          </Button>
        </CardContent>
      </Card>

      {/* ── Push Notifications ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                Push Notifications
                <span className="text-slate-500 font-normal text-sm" dir="rtl">الإشعارات</span>
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                Control which Wasel events trigger a browser notification
              </CardDescription>
            </div>
            {prefSaving && <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0 mt-1" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Browser permission status */}
          <div className="flex items-center gap-3 bg-background border border-border rounded-2xl p-3.5">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Browser Permission</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {permission === 'denied'
                  ? 'Blocked by browser — update site settings to re-enable'
                  : permission === 'granted'
                  ? 'Wasel can send you native browser notifications'
                  : 'Enable the master toggle to request permission'}
              </p>
            </div>
            <Badge className={`text-[10px] font-bold border flex-shrink-0 ${pb.color}`}>
              <pb.icon className="w-2.5 h-2.5 mr-1" />
              {pb.label}
            </Badge>
          </div>

          {/* Master toggle */}
          {prefLoading ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-slate-500 text-sm">Loading preferences…</span>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-white text-sm">Enable All Push Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5" dir="rtl">تفعيل جميع الإشعارات</p>
              </div>
              <Switch
                checked={pref.enabled && permission === 'granted'}
                onCheckedChange={handleMasterToggle}
                disabled={permission === 'denied'}
              />
            </div>
          )}

          <Separator className="bg-border" />

          {/* Per-event toggles */}
          <AnimatePresence>
            {pref.enabled && permission === 'granted' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notify me when…
                </p>
                {EVENT_OPTIONS.map(({ id, label, labelAr, description, icon: Icon }) => (
                  <div key={id} className="flex items-start justify-between gap-3 py-1.5">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {label}
                          <span className="text-slate-600 font-normal ml-2 text-xs" dir="rtl">{labelAr}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={pref.events.includes(id)}
                      onCheckedChange={checked => handleEventToggle(id, checked)}
                      disabled={prefSaving}
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disabled hint */}
          {(!pref.enabled || permission !== 'granted') && !prefLoading && (
            <p className="text-xs text-slate-600 text-center">
              {permission === 'denied'
                ? '⚠️ Notifications are blocked. Reset permission in your browser → Site Settings.'
                : 'Enable the toggle above to configure individual event notifications.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Privacy & Security ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t('settings.security.title')}
          </CardTitle>
          <CardDescription className="text-slate-500">{t('settings.security.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">{t('settings.security.twoFactor')}</p>
              <p className="text-slate-500 text-xs mt-0.5">{t('settings.security.twoFactorDesc')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-slate-300 hover:text-white bg-background"
              onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
            >
              {t('settings.security.enable')}
            </Button>
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">{t('settings.security.changePassword')}</p>
              <p className="text-slate-500 text-xs mt-0.5">{t('settings.security.changePasswordDesc')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-slate-300 hover:text-white bg-background"
              onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
            >
              {t('settings.security.change')}
            </Button>
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">{t('settings.security.profileVisibility')}</p>
              <p className="text-slate-500 text-xs mt-0.5">{t('settings.security.profileVisibilityDesc')}</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* ── Language & Appearance ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            {t('settings.language.title')}
          </CardTitle>
          <CardDescription className="text-slate-500">{t('settings.language.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                <Moon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
                </p>
                <p className="text-slate-500 text-xs">
                  {language === 'ar' ? 'تبديل بين الوضع الفاتح والداكن' : 'Toggle between light and dark theme'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => {
                toggleTheme();
                toast.success(
                  theme === 'dark'
                    ? (language === 'ar' ? 'تم التبديل إلى الوضع الفاتح' : 'Switched to light mode')
                    : (language === 'ar' ? 'تم التبديل إلى الوضع الداكن' : 'Switched to dark mode'),
                );
              }}
            />
          </div>

          <Separator className="bg-border" />

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-slate-300">{t('settings.language.language')}</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['en', 'ar'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    language === lang
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-slate-400 hover:text-white hover:border-[#334155]'
                  }`}
                >
                  <span>{lang === 'en' ? '🇬🇧' : '🇯🇴'}</span>
                  <span>{lang === 'en' ? 'English' : 'العربية'}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}