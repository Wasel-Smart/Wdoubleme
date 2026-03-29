/**
 * GenderPreferences — /features/cultural/GenderPreferences.tsx
 * Cultural gender filtering for carpooling rides (BlaBlaCar MENA model)
 * ✅ Women-only | ✅ Family-only | ✅ Mixed | ✅ Bilingual | ✅ Backend-connected
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, UserCheck, Shield, Check, Info } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { culturalApi } from '../../services/cultural';
import { toast } from 'sonner';

type GenderPref = 'women_only' | 'family_only' | 'men_only' | 'mixed';

interface PreferenceOption {
  value: GenderPref;
  emoji: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  statsEn: string;
  statsAr: string;
  color: string;
  borderColor: string;
}

const OPTIONS: PreferenceOption[] = [
  {
    value: 'women_only',
    emoji: '🚺',
    labelEn: 'Women Only',
    labelAr: 'نساء فقط',
    descEn: 'Female driver and female passengers — fully private and safe',
    descAr: 'سائقة ونساء فقط — خصوصية تامة وأمان',
    statsEn: '60% of female users prefer this',
    statsAr: '٦٠٪ من المستخدمات يفضلن هذا الخيار',
    color: 'text-pink-400',
    borderColor: 'border-pink-500/30',
  },
  {
    value: 'family_only',
    emoji: '👨‍👩‍👧',
    labelEn: 'Family Only',
    labelAr: 'عائلات فقط',
    descEn: 'Families traveling together — verified family rides',
    descAr: 'رحلات العائلات المتحققة — السفر مع العائلة فقط',
    statsEn: 'Great for parents traveling with children',
    statsAr: 'مثالي للعائلات المسافرة مع الأطفال',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  {
    value: 'men_only',
    emoji: '🚹',
    labelEn: 'Men Only',
    labelAr: 'رجال فقط',
    descEn: 'Male traveler, male passengers — business or casual travel',
    descAr: 'مسافر ذكر وركاب ذكور — للأعمال أو السفر الترفيهي',
    statsEn: 'Common for work commutes & business trips',
    statsAr: 'شائع في التنقلات الوظيفية والرحلات التجارية',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
  },
  {
    value: 'mixed',
    emoji: '🌍',
    labelEn: 'Mixed (No Preference)',
    labelAr: 'مختلط (لا تفضيل)',
    descEn: 'Open to all — maximize ride availability and save more',
    descAr: 'مفتوح للجميع — أكثر توافراً وأوفر بالسعر',
    statsEn: 'Highest availability of rides',
    statsAr: 'أعلى توافر للرحلات',
    color: 'text-primary',
    borderColor: 'border-primary/30',
  },
];

export function GenderPreferences() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const ar = language === 'ar';

  const [selected, setSelected] = useState<GenderPref>('mixed');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  // Load from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await culturalApi.getGenderPreferences();
        if (!cancelled) setSelected((prefs.preference as GenderPref) || 'mixed');
      } catch (err) {
        console.error('[GenderPreferences] load from backend failed, falling back to localStorage:', err);
        try {
          const local = localStorage.getItem('wasel_gender_pref') as GenderPref;
          if (local) setSelected(local);
        } catch { /* ignore */ }
      } finally {
        if (!cancelled) setLoadingPrefs(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const save = async () => {
    setSaving(true);
    try {
      await culturalApi.saveGenderPreferences({ preference: selected });
      localStorage.setItem('wasel_gender_pref', selected);
      setSaved(true);
      toast.success(ar ? 'تم حفظ تفضيلاتك ✅' : 'Preferences saved ✅');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[GenderPreferences] save failed:', err);
      // Fallback to localStorage
      localStorage.setItem('wasel_gender_pref', selected);
      toast.success(ar ? 'تم حفظ تفضيلاتك محلياً ✅' : 'Preferences saved locally ✅');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const t = {
    title:   ar ? 'تفضيلات الجنس في الرحلة'         : 'Ride Gender Preferences',
    subtitle:ar ? 'اختر نوع الركاب الذي تشعر بالراحة معه' : 'Choose who you\'re comfortable riding with',
    info:    ar ? 'هذه الإعدادات تحترم خصوصيتك الثقافية وتضمن راحتك' : 'These settings respect your cultural privacy and ensure your comfort',
    save:    ar ? 'حفظ التفضيلات'                    : 'Save Preferences',
    saved:   ar ? 'تم الحفظ ✅'                      : 'Saved ✅',
    privacy: ar ? 'خصوصيتك محمية — هذا الإعداد لا يُشارك مع أحد' : 'Your privacy is protected — this setting is not shared publicly',
    tip:     ar ? '💡 نصيحة: يمكنك تغيير هذا الإعداد لكل رحلة على حدة' : '💡 Tip: You can also change this per-ride when booking',
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur border-b border-border px-4 py-4" style={{ background: 'var(--background, #0B1120)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">{t.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Privacy note */}
        <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-xl p-3">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary/80">{t.privacy}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {OPTIONS.map(opt => {
            const isSelected = selected === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? `bg-card ${opt.borderColor} shadow-lg`
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${isSelected ? 'bg-primary/15' : 'bg-background'}`}>
                    {opt.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {ar ? opt.labelAr : opt.labelEn}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ar ? opt.descAr : opt.descEn}</p>
                    <p className={`text-[10px] font-medium mt-1 ${isSelected ? opt.color : 'text-muted-foreground/60'}`}>
                      {ar ? opt.statsAr : opt.statsEn}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 bg-muted/30 border border-border rounded-xl p-3">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{t.tip}</p>
        </div>

        {/* Save Button */}
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
            ar ? 'جاري الحفظ...' : 'Saving...'
          ) : t.save}
        </Button>
      </div>
    </div>
  );
}
