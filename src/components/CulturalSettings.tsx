/**
 * Cultural Settings Page
 * Centralized hub for all culturally-aligned features
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Shield, Users, CreditCard, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { rtl, flipX } from '../utils/rtl';
import { WaselColors, WaselRadius, WaselSpacing } from '../tokens/wasel-tokens';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PrayerTimesWidget } from '../features/islamic/PrayerTimesWidget';
import { RamadanModeBanner } from '../features/islamic/RamadanModeBanner';
import { GenderPreferencesSettings } from '../features/preferences/GenderPreferencesSettings';
import { PrivacySettings } from '../features/profile/PrivacySettings';
import { CODPayment } from '../features/payments/CODPayment';
import { BNPLPayment } from '../features/payments/BNPLPayment';

export function CulturalSettings() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('islamic');

  const translations = {
    en: {
      title: 'Cultural Settings',
      subtitle: 'Personalize your experience with culturally-aligned features',
      islamic: 'Islamic Features',
      islamicDesc: 'Prayer times and Ramadan mode',
      preferences: 'Ride Preferences',
      preferencesDesc: 'Gender segregation and family options',
      privacy: 'Privacy',
      privacyDesc: 'Hijab-friendly profile options',
      payments: 'Payment Methods',
      paymentsDesc: 'Cash on Delivery and Buy Now Pay Later',
    },
    ar: {
      title: 'الإعدادات الثقافية',
      subtitle: 'خصص تجربتك مع الميزات المتوافقة ثقافياً',
      islamic: 'الميزات الإسلامية',
      islamicDesc: 'أوقات الصلاة ووضع رمضان',
      preferences: 'تفضيلات الرحلات',
      preferencesDesc: 'الفصل بين الجنسين وخيارات العائلة',
      privacy: 'الخصوصية',
      privacyDesc: 'خيارات الملف الشخصي المتوافقة مع الحجاب',
      payments: 'طرق الدفع',
      paymentsDesc: 'الدفع عند الاستلام والشراء الآن والدفع لاحقاً',
    },
  };

  const txt = translations[language];

  const sections = [
    {
      id: 'islamic',
      icon: Moon,
      label: txt.islamic,
      description: txt.islamicDesc,
      color: WaselColors.teal,
    },
    {
      id: 'preferences',
      icon: Users,
      label: txt.preferences,
      description: txt.preferencesDesc,
      color: WaselColors.teal,
    },
    {
      id: 'privacy',
      icon: Shield,
      label: txt.privacy,
      description: txt.privacyDesc,
      color: WaselColors.teal,
    },
    {
      id: 'payments',
      icon: CreditCard,
      label: txt.payments,
      description: txt.paymentsDesc,
      color: WaselColors.bronze,
    },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: WaselColors.navyBase }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: WaselColors.textPrimary }}
          >
            {txt.title}
          </h1>
          <p style={{ color: WaselColors.textSecondary }}>{txt.subtitle}</p>
        </motion.div>

        {/* Ramadan Banner */}
        <RamadanModeBanner />

        {/* Main Content */}
        <Card
          className="overflow-hidden"
          style={{
            background: WaselColors.navyCard,
            borderRadius: WaselRadius.lg,
            border: `1px solid ${WaselColors.borderDark}`,
          }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation - Mobile Friendly */}
            <div
              className="p-4 overflow-x-auto"
              style={{
                borderBottom: `1px solid ${WaselColors.borderDark}`,
                background: WaselColors.navyBase,
              }}
            >
              <div className={`${rtl.flex(language)} gap-3 min-w-max`}>
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${rtl.text(language)}`}
                      style={{
                        background: isActive
                          ? `${section.color}20`
                          : 'transparent',
                        border: `1px solid ${
                          isActive ? section.color : WaselColors.borderDark
                        }`,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{
                          color: isActive ? section.color : WaselColors.textSecondary,
                        }}
                      />
                      <div className={rtl.text(language)}>
                        <div
                          className="font-medium text-sm"
                          style={{
                            color: isActive ? section.color : WaselColors.textPrimary,
                          }}
                        >
                          {section.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: WaselColors.textSecondary }}
                        >
                          {section.description}
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 ${flipX(language)}`}
                        style={{
                          color: isActive ? section.color : WaselColors.textSecondary,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <TabsContent value="islamic" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <PrayerTimesWidget />
                </motion.div>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GenderPreferencesSettings />
                </motion.div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PrivacySettings />
                </motion.div>
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Payment Methods Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* COD Demo */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: WaselColors.textPrimary }}
                      >
                        {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                      </h3>
                      <CODPayment
                        amount={15.5}
                        currency="JOD"
                        onConfirm={async (amount) => {
                          console.log('COD confirmed:', amount);
                        }}
                        onCancel={() => console.log('COD cancelled')}
                      />
                    </div>

                    {/* BNPL Demo */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: WaselColors.textPrimary }}
                      >
                        {language === 'ar' ? 'اشترِ الآن وادفع لاحقاً' : 'Buy Now Pay Later'}
                      </h3>
                      <BNPLPayment
                        amount={150}
                        currency="JOD"
                        onConfirm={async (optionId, installments) => {
                          console.log('BNPL confirmed:', optionId, installments);
                        }}
                        onCancel={() => console.log('BNPL cancelled')}
                      />
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card
            className="p-6"
            style={{
              background: `linear-gradient(135deg, ${WaselColors.teal}10, ${WaselColors.navyCard})`,
              borderRadius: WaselRadius.lg,
              border: `1px solid ${WaselColors.teal}30`,
            }}
          >
            <div className={`${rtl.flex(language)} items-start gap-3`}>
              <Shield className="h-5 w-5 flex-shrink-0" style={{ color: WaselColors.teal }} />
              <div>
                <h4
                  className="font-medium mb-1"
                  style={{ color: WaselColors.textPrimary }}
                >
                  {language === 'ar'
                    ? 'خصوصيتك وثقافتك مهمة لنا'
                    : 'Your Privacy and Culture Matter to Us'}
                </h4>
                <p className="text-sm" style={{ color: WaselColors.textSecondary }}>
                  {language === 'ar'
                    ? 'جميع إعداداتك خاصة وآمنة. نحن نحترم قيمك وتقاليدك في كل خطوة من رحلتك معنا.'
                    : 'All your settings are private and secure. We respect your values and traditions at every step of your journey with us.'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}