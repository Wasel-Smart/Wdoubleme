/**
 * Gender Preferences Settings
 * Allows users to select ride gender preferences
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, User, Shield, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { WaselColors, WaselSpacing, WaselRadius } from '../../tokens/wasel-tokens';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import {
  loadGenderPreferences,
  saveGenderPreferences,
  getGenderPreferenceLabel,
  getGenderPreferenceDescription,
  type RideGenderPreference,
  type GenderPreferences,
} from '../../services/gender-preferences';

const preferenceOptions: RideGenderPreference[] = [
  'women-only',
  'family-only',
  'mixed',
  'no-preference',
];

export function GenderPreferencesSettings() {
  const { language } = useLanguage();
  const [preferences, setPreferences] = useState<GenderPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const translations = {
    en: {
      title: 'Ride Preferences',
      subtitle: 'Choose your preferred ride type',
      enableForAllRides: 'Apply to all rides',
      allowEmergency: 'Allow mixed rides in emergencies',
      driverPreference: 'Driver Gender Preference',
      female: 'Female Driver',
      male: 'Male Driver',
      noPreference: 'No Preference',
      saveSuccess: 'Preferences saved successfully',
      saveError: 'Failed to save preferences',
      privacyNote: 'Your preferences are private and secure',
    },
    ar: {
      title: 'تفضيلات الرحلات',
      subtitle: 'اختر نوع الرحلة المفضل لديك',
      enableForAllRides: 'تطبيق على جميع الرحلات',
      allowEmergency: 'السماح بالرحلات المختلطة في حالات الطوارئ',
      driverPreference: 'تفضيل جنس السائق',
      female: 'سائقة',
      male: 'سائق',
      noPreference: 'بدون تفضيل',
      saveSuccess: 'تم حفظ التفضيلات بنجاح',
      saveError: 'فشل حفظ التفضيلات',
      privacyNote: 'تفضيلاتك خاصة وآمنة',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prefs = await loadGenderPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await saveGenderPreferences(preferences);
      toast.success(txt.saveSuccess);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error(txt.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceSelect = (pref: RideGenderPreference) => {
    if (!preferences) return;
    setPreferences({ ...preferences, ridePreference: pref });
  };

  const handleToggle = (key: keyof GenderPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading || !preferences) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const getIcon = (pref: RideGenderPreference) => {
    switch (pref) {
      case 'women-only':
        return <User className="h-5 w-5" />;
      case 'family-only':
        return <Users className="h-5 w-5" />;
      case 'mixed':
      case 'no-preference':
        return <Shield className="h-5 w-5" />;
    }
  };

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
        </div>

        {/* Preference Options */}
        <div className="p-6 space-y-3">
          {preferenceOptions.map((option) => {
            const isSelected = preferences.ridePreference === option;
            return (
              <motion.button
                key={option}
                onClick={() => handlePreferenceSelect(option)}
                className={`w-full p-4 rounded-lg ${rtl.text(language)} transition-all`}
                style={{
                  background: isSelected
                    ? `${WaselColors.teal}20`
                    : WaselColors.navyBase,
                  border: `2px solid ${isSelected ? WaselColors.teal : WaselColors.borderDark}`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`${rtl.flex(language)} items-start justify-between gap-4`}>
                  <div className={`${rtl.flex(language)} items-start gap-3 flex-1`}>
                    <div
                      className="mt-1"
                      style={{
                        color: isSelected ? WaselColors.teal : WaselColors.textSecondary,
                      }}
                    >
                      {getIcon(option)}
                    </div>
                    <div className={rtl.text(language)}>
                      <h4
                        className="font-medium mb-1"
                        style={{
                          color: isSelected ? WaselColors.teal : WaselColors.textPrimary,
                        }}
                      >
                        {getGenderPreferenceLabel(option, language)}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: WaselColors.textSecondary }}
                      >
                        {getGenderPreferenceDescription(option, language)}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0"
                    >
                      <div
                        className="p-1 rounded-full"
                        style={{
                          background: WaselColors.teal,
                        }}
                      >
                        <Check className="h-4 w-4" style={{ color: WaselColors.navyCard }} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Additional Options */}
        <div
          className="p-6 space-y-4"
          style={{
            borderTop: `1px solid ${WaselColors.borderDark}`,
            background: WaselColors.navyBase,
          }}
        >
          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
              {txt.enableForAllRides}
            </span>
            <Switch
              checked={preferences.enableForAllRides}
              onCheckedChange={(checked) => handleToggle('enableForAllRides', checked)}
            />
          </div>

          <div className={`${rtl.flex(language)} items-center justify-between`}>
            <span className="text-sm" style={{ color: WaselColors.textPrimary }}>
              {txt.allowEmergency}
            </span>
            <Switch
              checked={preferences.allowMixedInEmergency}
              onCheckedChange={(checked) => handleToggle('allowMixedInEmergency', checked)}
            />
          </div>

          {/* Privacy Note */}
          <div
            className="p-3 rounded-lg"
            style={{
              background: `${WaselColors.teal}10`,
              border: `1px solid ${WaselColors.teal}30`,
            }}
          >
            <p className="text-xs" style={{ color: WaselColors.textSecondary }}>
              <Shield className="inline h-3 w-3 mr-1" />
              {txt.privacyNote}
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
            style={{
              background: WaselColors.teal,
              color: WaselColors.navyCard,
            }}
          >
            {saving ? '...' : language === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
