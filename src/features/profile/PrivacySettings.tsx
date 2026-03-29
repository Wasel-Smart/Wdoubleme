/**
 * Privacy Settings Component
 * Hijab-friendly profile privacy options
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Shield, User, Image, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { WaselColors, WaselRadius } from '../../tokens/wasel-tokens';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import {
  loadPrivacyPreferences,
  savePrivacyPreferences,
  getAvatarAlternatives,
  type PrivacyPreferences,
  type ProfilePrivacyLevel,
} from '../../services/privacy';

export function PrivacySettings() {
  const { language } = useLanguage();
  const [preferences, setPreferences] = useState<PrivacyPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const translations = {
    en: {
      title: 'Privacy Settings',
      subtitle: 'Control who sees your information',
      privacyLevel: 'Privacy Level',
      public: 'Public',
      private: 'Private',
      minimal: 'Minimal',
      photoOptions: 'Profile Photo Options',
      enableFaceBlur: 'Blur Face in Photo',
      useAvatarOnly: 'Use Avatar Instead of Photo',
      selectAvatar: 'Select Avatar',
      namePrivacy: 'Name Display',
      showFirstNameOnly: 'Show First Name Only',
      hideFullName: 'Hide Full Name',
      hidePhoneNumber: 'Hide Phone Number',
      shareLocation: 'Share Location Only During Rides',
      photoVisibility: 'Who Can See Photo',
      everyone: 'Everyone',
      driversOnly: 'Drivers Only',
      none: 'No One',
      saveSuccess: 'Privacy settings saved',
      saveError: 'Failed to save settings',
      hijabFriendly: 'Hijab-Friendly Options Available',
    },
    ar: {
      title: 'إعدادات الخصوصية',
      subtitle: 'تحكم في من يرى معلوماتك',
      privacyLevel: 'مستوى الخصوصية',
      public: 'عام',
      private: 'خاص',
      minimal: 'الحد الأدنى',
      photoOptions: 'خيارات الصورة الشخصية',
      enableFaceBlur: 'طمس الوجه في الصورة',
      useAvatarOnly: 'استخدام الصورة الرمزية بدلاً من الصورة',
      selectAvatar: 'اختر صورة رمزية',
      namePrivacy: 'عرض الاسم',
      showFirstNameOnly: 'إظهار الاسم الأول فقط',
      hideFullName: 'إخفاء الاسم الكامل',
      hidePhoneNumber: 'إخفاء رقم الهاتف',
      shareLocation: 'مشاركة الموقع أثناء الرحلات فقط',
      photoVisibility: 'من يمكنه رؤية الصورة',
      everyone: 'الجميع',
      driversOnly: 'السائقون فقط',
      none: 'لا أحد',
      saveSuccess: 'تم حفظ إعدادات الخصوصية',
      saveError: 'فشل حفظ الإعدادات',
      hijabFriendly: 'خيارات متوافقة مع الحجاب متاحة',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prefs = await loadPrivacyPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load privacy preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await savePrivacyPreferences(preferences);
      toast.success(txt.saveSuccess);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error(txt.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof PrivacyPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const handlePhotoVisibilityChange = (value: 'everyone' | 'drivers-only' | 'none') => {
    if (!preferences) return;
    setPreferences({ ...preferences, allowProfilePhotoView: value });
  };

  if (loading || !preferences) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          background: WaselColors.navyCard,
          borderRadius: WaselRadius.lg,
          border: `1px solid ${WaselColors.borderDark}`,
        }}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{
            background: `linear-gradient(135deg, ${WaselColors.teal}15, ${WaselColors.navyCard})`,
            borderBottom: `1px solid ${WaselColors.borderDark}`,
          }}
        >
          <div className={`${rtl.flex(language)} items-center gap-3 mb-2`}>
            <div
              className="p-2 rounded-lg"
              style={{
                background: `${WaselColors.teal}20`,
              }}
            >
              <Shield className="h-5 w-5" style={{ color: WaselColors.teal }} />
            </div>
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: WaselColors.textPrimary }}
              >
                {txt.title}
              </h3>
              <p className="text-sm" style={{ color: WaselColors.textSecondary }}>
                {txt.subtitle}
              </p>
            </div>
          </div>

          {/* Hijab-Friendly Badge */}
          <div
            className="mt-3 p-2 rounded-lg inline-flex items-center gap-2"
            style={{
              background: `${WaselColors.teal}10`,
              border: `1px solid ${WaselColors.teal}30`,
            }}
          >
            <Shield className="h-4 w-4" style={{ color: WaselColors.teal }} />
            <span className="text-xs" style={{ color: WaselColors.teal }}>
              {txt.hijabFriendly}
            </span>
          </div>
        </div>

        {/* Photo Privacy Options */}
        <div className="p-6 space-y-4">
          <h4
            className="font-medium mb-3"
            style={{ color: WaselColors.textPrimary }}
          >
            {txt.photoOptions}
          </h4>

          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <div className={`${rtl.flex(language)} items-center gap-2`}>
              <Eye className="h-4 w-4" style={{ color: WaselColors.textSecondary }} />
              <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
                {txt.enableFaceBlur}
              </span>
            </div>
            <Switch
              checked={preferences.enableFaceBlur}
              onCheckedChange={(checked) => handleToggle('enableFaceBlur', checked)}
            />
          </div>

          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <div className={`${rtl.flex(language)} items-center gap-2`}>
              <User className="h-4 w-4" style={{ color: WaselColors.textSecondary }} />
              <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
                {txt.useAvatarOnly}
              </span>
            </div>
            <Switch
              checked={preferences.useAvatarOnly}
              onCheckedChange={(checked) => {
                handleToggle('useAvatarOnly', checked);
                if (checked) {
                  setShowAvatarPicker(true);
                }
              }}
            />
          </div>

          {/* Avatar Picker */}
          {preferences.useAvatarOnly && showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-3 gap-3 mt-3"
            >
              {getAvatarAlternatives().map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor:
                      selectedAvatar === avatar
                        ? WaselColors.teal
                        : WaselColors.borderDark,
                    background: WaselColors.navyBase,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-8 w-8" style={{ color: WaselColors.textSecondary }} />
                  </div>
                  {selectedAvatar === avatar && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 p-1 rounded-full"
                      style={{
                        background: WaselColors.teal,
                      }}
                    >
                      <Check className="h-3 w-3" style={{ color: WaselColors.navyCard }} />
                    </motion.div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Photo Visibility */}
          <div className="mt-6">
            <h5
              className="text-sm font-medium mb-3"
              style={{ color: WaselColors.textPrimary }}
            >
              {txt.photoVisibility}
            </h5>
            <div className="space-y-2">
              {(['everyone', 'drivers-only', 'none'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => handlePhotoVisibilityChange(option)}
                  className={`w-full p-3 rounded-lg ${rtl.flex(language)} items-center justify-between transition-all`}
                  style={{
                    background:
                      preferences.allowProfilePhotoView === option
                        ? `${WaselColors.teal}20`
                        : WaselColors.navyBase,
                    border: `1px solid ${
                      preferences.allowProfilePhotoView === option
                        ? WaselColors.teal
                        : WaselColors.borderDark
                    }`,
                  }}
                >
                  <span
                    className="text-sm"
                    style={{
                      color:
                        preferences.allowProfilePhotoView === option
                          ? WaselColors.teal
                          : WaselColors.textPrimary,
                    }}
                  >
                    {txt[option.replace('-', '') as keyof typeof txt] as string}
                  </span>
                  {preferences.allowProfilePhotoView === option && (
                    <Check className="h-4 w-4" style={{ color: WaselColors.teal }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Name & Contact Privacy */}
        <div
          className="p-6 space-y-4"
          style={{
            borderTop: `1px solid ${WaselColors.borderDark}`,
          }}
        >
          <h4
            className="font-medium mb-3"
            style={{ color: WaselColors.textPrimary }}
          >
            {txt.namePrivacy}
          </h4>

          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
              {txt.showFirstNameOnly}
            </span>
            <Switch
              checked={preferences.showFirstNameOnly}
              onCheckedChange={(checked) => handleToggle('showFirstNameOnly', checked)}
            />
          </div>

          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
              {txt.hidePhoneNumber}
            </span>
            <Switch
              checked={preferences.hidePhoneNumber}
              onCheckedChange={(checked) => handleToggle('hidePhoneNumber', checked)}
            />
          </div>

          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
              {txt.shareLocation}
            </span>
            <Switch
              checked={preferences.shareLocationOnlyDuringRide}
              onCheckedChange={(checked) =>
                handleToggle('shareLocationOnlyDuringRide', checked)
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <div
          className="p-6"
          style={{
            borderTop: `1px solid ${WaselColors.borderDark}`,
            background: WaselColors.navyBase,
          }}
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
            style={{
              background: WaselColors.teal,
              color: WaselColors.navyCard,
            }}
          >
            {saving ? '...' : language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
