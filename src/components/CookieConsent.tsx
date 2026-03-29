/**
 * Cookie Consent Banner - GDPR Compliant
 * Bilingual cookie consent with granular controls
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const { language, dir } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('wasel_cookie_consent');
    if (!consent) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        setPreferences(JSON.parse(consent));
      } catch (e) {
        // Invalid JSON, show banner again
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('wasel_cookie_consent', JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
    
    // Apply preferences (integrate with analytics tools here)
    if (prefs.analytics) {
      // Enable Google Analytics, Mixpanel, etc.
      console.log('[CookieConsent] Analytics enabled');
    }
    if (prefs.marketing) {
      // Enable marketing pixels
      console.log('[CookieConsent] Marketing enabled');
    }
  };

  const acceptAll = () => {
    const allPrefs = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allPrefs);
    savePreferences(allPrefs);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
  };

  const content = {
    ar: {
      title: 'نستخدم ملفات تعريف الارتباط',
      description: 'نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل موقعنا بشكل صحيح. مع موافقتك، قد نستخدم أيضاً ملفات تعريف ارتباط غير ضرورية لتحسين تجربتك وتخصيص المحتوى.',
      acceptAll: 'قبول الكل',
      acceptNecessary: 'الضرورية فقط',
      customizeSettings: 'تخصيص الإعدادات',
      saveSettings: 'حفظ الإعدادات',
      close: 'إغلاق',
      
      categories: {
        necessary: {
          title: 'ضرورية',
          description: 'مطلوبة للوظائف الأساسية (المصادقة، الأمان، التفضيلات الأساسية)',
          locked: 'مطلوب دائماً'
        },
        analytics: {
          title: 'تحليلات',
          description: 'تساعدنا على فهم كيفية استخدامك للمنصة لتحسين تجربتك'
        },
        marketing: {
          title: 'تسويق',
          description: 'تُستخدم لإظهار إعلانات ذات صلة وقياس فعالية الحملات'
        },
        preferences: {
          title: 'تفضيلات',
          description: 'تحفظ اختياراتك (اللغة، المظهر، التفضيلات الثقافية)'
        }
      },
      
      learnMore: 'اعرف المزيد في',
      privacyPolicy: 'سياسة الخصوصية'
    },
    en: {
      title: 'We Use Cookies',
      description: 'We use necessary cookies to ensure our site works properly. With your consent, we may also use non-essential cookies to improve your experience and personalize content.',
      acceptAll: 'Accept All',
      acceptNecessary: 'Necessary Only',
      customizeSettings: 'Customize Settings',
      saveSettings: 'Save Settings',
      close: 'Close',
      
      categories: {
        necessary: {
          title: 'Necessary',
          description: 'Required for essential functions (authentication, security, basic preferences)',
          locked: 'Always Required'
        },
        analytics: {
          title: 'Analytics',
          description: 'Help us understand how you use the platform to improve your experience'
        },
        marketing: {
          title: 'Marketing',
          description: 'Used to show relevant ads and measure campaign effectiveness'
        },
        preferences: {
          title: 'Preferences',
          description: 'Remember your choices (language, theme, cultural preferences)'
        }
      },
      
      learnMore: 'Learn more in our',
      privacyPolicy: 'Privacy Policy'
    }
  };

  const t = content[language as 'ar' | 'en'];

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !showSettings && acceptNecessary()}
          />

          {/* Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
            dir={dir}
          >
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-white/10 bg-white/5"
                  >
                    <div className="p-6 space-y-4">
                      {/* Necessary */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-white">{t.categories.necessary.title}</h4>
                            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                              {t.categories.necessary.locked}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{t.categories.necessary.description}</p>
                        </div>
                        <div className="w-12 h-6 bg-teal-500/20 border border-teal-500/50 rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{t.categories.analytics.title}</h4>
                          <p className="text-sm text-slate-400">{t.categories.analytics.description}</p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            preferences.analytics
                              ? 'bg-teal-500/20 border border-teal-500/50'
                              : 'bg-slate-700 border border-slate-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${
                            preferences.analytics
                              ? 'translate-x-7 bg-teal-500'
                              : 'translate-x-1 bg-slate-500'
                          }`} />
                        </button>
                      </div>

                      {/* Marketing */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{t.categories.marketing.title}</h4>
                          <p className="text-sm text-slate-400">{t.categories.marketing.description}</p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            preferences.marketing
                              ? 'bg-teal-500/20 border border-teal-500/50'
                              : 'bg-slate-700 border border-slate-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${
                            preferences.marketing
                              ? 'translate-x-7 bg-teal-500'
                              : 'translate-x-1 bg-slate-500'
                          }`} />
                        </button>
                      </div>

                      {/* Preferences */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{t.categories.preferences.title}</h4>
                          <p className="text-sm text-slate-400">{t.categories.preferences.description}</p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, preferences: !p.preferences }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            preferences.preferences
                              ? 'bg-teal-500/20 border border-teal-500/50'
                              : 'bg-slate-700 border border-slate-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${
                            preferences.preferences
                              ? 'translate-x-7 bg-teal-500'
                              : 'translate-x-1 bg-slate-500'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-teal-500/20 border border-teal-500/30 shrink-0">
                    <Cookie className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{t.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {t.description}
                    </p>
                    <a href="/privacy" className="text-xs text-teal-400 hover:text-teal-300">
                      {t.learnMore} {t.privacyPolicy} →
                    </a>
                  </div>
                  <button
                    onClick={() => acceptNecessary()}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {showSettings ? (
                    <button
                      onClick={() => savePreferences(preferences)}
                      className="flex-1 min-w-[140px] px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all"
                    >
                      {t.saveSettings}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={acceptAll}
                        className="flex-1 min-w-[140px] px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all"
                      >
                        {t.acceptAll}
                      </button>
                      <button
                        onClick={acceptNecessary}
                        className="px-4 py-2.5 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/15 transition-all"
                      >
                        {t.acceptNecessary}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {showSettings ? t.close : t.customizeSettings}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}