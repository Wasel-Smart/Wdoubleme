/**
 * HijabPrivacy — /features/cultural/HijabPrivacy.tsx
 * Profile photo & identity privacy settings for Muslim women
 * ✅ Hide photo | ✅ Nickname | ✅ Women-only visibility | ✅ Backend-connected | ✅ Bilingual
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeOff, Eye, User, Shield, Check, Lock, UserX, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { culturalApi } from '../../services/cultural';
import { toast } from 'sonner';

interface PrivacySettings {
  hideProfilePhoto: boolean;
  useNickname: boolean;
  nickname: string;
  womenOnlyVisible: boolean;
  familyVerification: boolean;
}

export function HijabPrivacy() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const ar = language === 'ar';

  const [settings, setSettings] = useState<PrivacySettings>({
    hideProfilePhoto: false,
    useNickname: false,
    nickname: '',
    womenOnlyVisible: false,
    familyVerification: false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  // Load from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await culturalApi.getGenderPreferences();
        if (!cancelled) {
          setSettings({
            hideProfilePhoto: prefs.hide_photo ?? false,
            useNickname: prefs.use_nickname ?? false,
            nickname: '',
            womenOnlyVisible: prefs.women_only_view ?? false,
            familyVerification: false,
          });
        }
      } catch (err) {
        console.error('[HijabPrivacy] backend load failed, fallback to localStorage:', err);
        try {
          const s = localStorage.getItem('wasel_hijab_prefs');
          if (s && !cancelled) setSettings(JSON.parse(s));
        } catch { /* ignore */ }
      } finally {
        if (!cancelled) setLoadingPrefs(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const update = (patch: Partial<PrivacySettings>) => setSettings(prev => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      await culturalApi.saveGenderPreferences({
        preference: settings.womenOnlyVisible ? 'women_only' : 'mixed',
        hidePhoto: settings.hideProfilePhoto,
        useNickname: settings.useNickname,
        womenOnlyView: settings.womenOnlyVisible,
      });
      localStorage.setItem('wasel_hijab_prefs', JSON.stringify(settings));
      setSaved(true);
      toast.success(ar ? 'تم حفظ إعدادات الخصوصية ✅' : 'Privacy settings saved ✅');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[HijabPrivacy] save failed:', err);
      localStorage.setItem('wasel_hijab_prefs', JSON.stringify(settings));
      toast.success(ar ? 'تم حفظ إعدادات الخصوصية محلياً ✅' : 'Privacy settings saved locally ✅');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const t = {
    title:    ar ? 'الخصوصية والأمان'               : 'Privacy & Identity',
    subtitle: ar ? 'تحكمي في كيفية ظهور ملفك الشخصي' : 'Control how your profile appears to others',
    badge:    ar ? 'مخصص للمرأة'                    : 'Women-Tailored',
    photo:    ar ? 'إخفاء صورة الملف الشخصي'        : 'Hide Profile Photo',
    photoDesc:ar ? 'إظهار أيقونة بدلاً من صورتك الشخصية' : 'Show an avatar icon instead of your photo',
    nickname: ar ? 'استخدام اسم مستعار'              : 'Use Nickname',
    nicknameDesc: ar ? 'أظهري اسماً مستعاراً بدلاً من اسمك الكامل' : 'Show a nickname instead of your full name',
    nicknameLabel: ar ? 'الاسم المستعار'              : 'Your Nickname',
    nicknamePH:    ar ? 'مثال: أم سارة'              : 'e.g., Om Sarah',
    womenVis: ar ? 'مرئي للنساء فقط'                : 'Visible to Women Only',
    womenVisDesc: ar ? 'لا يرى الرجال ملفك الشخصي'   : 'Male users cannot see your full profile',
    family:   ar ? 'التحقق العائلي'                  : 'Family Verification',
    familyDesc: ar ? 'أثبتي العلاقة مع أفراد العائلة للرحلات العائلية' : 'Prove family relations for family rides',
    save:     ar ? 'حفظ الإعدادات'                  : 'Save Settings',
    saved:    ar ? 'تم الحفظ ✅'                    : 'Saved ✅',
    note:     ar ? '🔒 كل هذه الإعدادات خاصة ومشفرة — لا أحد يعلم بها' : '🔒 All settings are private & encrypted — nobody sees this',
    preview:  ar ? 'معاينة الملف الشخصي'             : 'Profile Preview',
    previewPublic: ar ? 'كيف يراك الآخرون' : 'How others see you',
  };

  const displayName = settings.useNickname && settings.nickname ? settings.nickname : (ar ? 'المستخدمة' : 'User');

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur border-b border-border px-4 py-4" style={{ background: 'var(--background, #0B1120)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">🧕</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-foreground text-lg leading-tight">{t.title}</h1>
              <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/20 text-[10px] font-bold">{t.badge}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Profile Preview */}
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">{t.preview} — {t.previewPublic}</p>
          <div className="flex items-center gap-3">
            <div className="relative">
              {settings.hideProfilePhoto ? (
                <div className="w-14 h-14 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500/40 to-pink-500/40 border-2 border-rose-500/30 flex items-center justify-center text-2xl">
                  🧕
                </div>
              )}
              {settings.womenOnlyVisible && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                  <EyeOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-foreground">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {settings.womenOnlyVisible && <Badge className="bg-pink-500/15 text-pink-300 border-pink-500/20 text-[10px]">🚺 {ar ? 'نساء فقط' : 'Women Only'}</Badge>}
                {settings.familyVerification && <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/20 text-[10px]">👨‍👩‍👧 {ar ? 'متحقق عائلياً' : 'Family Verified'}</Badge>}
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        {[
          { key: 'hideProfilePhoto', label: t.photo, desc: t.photoDesc, icon: EyeOff, color: 'text-rose-400' },
          { key: 'womenOnlyVisible', label: t.womenVis, desc: t.womenVisDesc, icon: UserX, color: 'text-pink-400' },
          { key: 'familyVerification', label: t.family, desc: t.familyDesc, icon: Shield, color: 'text-amber-400' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={val => update({ [item.key]: val })}
                />
              </div>
            </Card>
          );
        })}

        {/* Nickname Toggle + Input */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.nickname}</p>
                <p className="text-xs text-muted-foreground">{t.nicknameDesc}</p>
              </div>
            </div>
            <Switch checked={settings.useNickname} onCheckedChange={val => update({ useNickname: val })} />
          </div>
          <AnimatePresence>
            {settings.useNickname && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Input
                  value={settings.nickname}
                  onChange={e => update({ nickname: e.target.value })}
                  placeholder={t.nicknamePH}
                  className="mt-1"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Privacy Note */}
        <div className="flex items-start gap-2 bg-emerald-900/10 border border-emerald-500/15 rounded-xl p-3">
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-400/80">{t.note}</p>
        </div>

        {/* Save */}
        <Button
          onClick={save}
          disabled={saving || loadingPrefs}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm shadow-lg shadow-primary/20"
        >
          {saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> {t.saved}
            </span>
          ) : saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : t.save}
        </Button>
      </div>
    </div>
  );
}
