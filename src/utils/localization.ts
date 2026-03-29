/**
 * Multi-Language System with Dynamic Localization
 * Supports 10+ languages with RTL/LTR auto-adaptation
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // Current (Priority 1)
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇯🇴',
    enabled: true
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇬🇧',
    enabled: true
  },
  
  // Regional Expansion (Priority 2)
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    flag: '🇮🇱',
    enabled: false // Enable for Jerusalem cross-border
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
    flag: '🇹🇷',
    enabled: false
  },
  
  // Global Expansion (Priority 3)
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    flag: '🇫🇷',
    enabled: false
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    flag: '🇪🇸',
    enabled: false
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    flag: '🇩🇪',
    enabled: false
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    flag: '🇷🇺',
    enabled: false
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    flag: '🇵🇰',
    enabled: false
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    flag: '🇮🇳',
    enabled: false
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    flag: '🇨🇳',
    enabled: false
  }
];

// Translation keys for all features
export interface TranslationKeys {
  // Core Features
  'app.name': string;
  'app.tagline': string;
  'search.rides': string;
  'post.ride': string;
  'book.ride': string;
  'my.trips': string;
  'messages': string;
  'profile': string;
  'settings': string;
  'logout': string;
  
  // Carpooling Specific
  'cost.sharing': string;
  'fuel.split': string;
  'seats.available': string;
  'departure.time': string;
  'arrival.time': string;
  'traveler': string;
  'passenger': string;
  'advance.booking': string;
  
  // Raje3 Package Delivery
  'send.package': string;
  'package.weight': string;
  'pickup.location': string;
  'dropoff.location': string;
  'package.tracking': string;
  'qr.verification': string;
  'insurance.claim': string;
  
  // Cultural Features
  'prayer.stops': string;
  'gender.preference': string;
  'women.only': string;
  'men.only': string;
  'family.only': string;
  'mixed': string;
  'ramadan.mode': string;
  'hijab.privacy': string;
  
  // Routes
  'popular.routes': string;
  'route.details': string;
  'distance': string;
  'duration': string;
  'price.per.seat': string;
  
  // Payments
  'payment.method': string;
  'cash.on.arrival': string;
  'card.payment': string;
  'wallet.balance': string;
  'refund.request': string;
  
  // Notifications
  'ride.booked': string;
  'trip.reminder': string;
  'package.delivered': string;
  'payment.received': string;
  
  // Admin
  'analytics': string;
  'kpi.tracking': string;
  'live.monitoring': string;
  'driver.performance': string;
  'route.optimization': string;
  
  // AI Features
  'ai.recommendations': string;
  'smart.dispatch': string;
  'predictive.eta': string;
  'route.suggestions': string;
}

// Dynamic localization engine
export class LocalizationEngine {
  private currentLanguage: string = 'en';
  private fallbackLanguage: string = 'en';
  private translations: Map<string, any> = new Map();
  private missingKeys: Set<string> = new Set();

  constructor() {
    this.loadTranslations();
  }

  async loadTranslations() {
    // Dynamically import translation files
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang.enabled) {
        try {
          const translations = await import(`../../locales/${lang.code}.json`);
          this.translations.set(lang.code, translations);
        } catch (error) {
          console.warn(`Failed to load translations for ${lang.code}`);
        }
      }
    }
  }

  setLanguage(langCode: string) {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (lang && lang.enabled) {
      this.currentLanguage = langCode;
      // Store preference
      localStorage.setItem('wasel_language', langCode);
      // Update HTML dir attribute
      document.documentElement.dir = lang.direction;
      document.documentElement.lang = langCode;
    }
  }

  translate(key: keyof TranslationKeys, params?: Record<string, any>): string {
    const translation = this.getTranslation(key);
    
    if (!translation) {
      this.reportMissingKey(key);
      return key; // Return key as fallback
    }

    // Replace parameters {name}, {count}, etc.
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{${param}}`, String(value)),
        translation
      );
    }

    return translation;
  }

  private getTranslation(key: string): string | null {
    // Try current language
    const currentTranslations = this.translations.get(this.currentLanguage);
    if (currentTranslations && currentTranslations[key]) {
      return currentTranslations[key];
    }

    // Fallback to English
    const fallbackTranslations = this.translations.get(this.fallbackLanguage);
    if (fallbackTranslations && fallbackTranslations[key]) {
      return fallbackTranslations[key];
    }

    return null;
  }

  private reportMissingKey(key: string) {
    this.missingKeys.add(key);
    
    // Log missing keys for developers
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${key} for language: ${this.currentLanguage}`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMissingKeyReport(key, this.currentLanguage);
    }
  }

  async sendMissingKeyReport(key: string, language: string) {
    // Send to backend for translation updates
    await fetch('/api/translations/missing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, language, timestamp: Date.now() })
    });
  }

  getMissingKeys(): string[] {
    return Array.from(this.missingKeys);
  }

  // Auto-detect user's preferred language
  detectUserLanguage(): string {
    // Priority 1: Stored preference
    const stored = localStorage.getItem('wasel_language');
    if (stored) return stored;

    // Priority 2: Browser language
    const browserLang = navigator.language.split('-')[0];
    const supported = SUPPORTED_LANGUAGES.find(
      l => l.code === browserLang && l.enabled
    );
    if (supported) return browserLang;

    // Priority 3: Geo-location (Jordan → Arabic)
    // This would need IP geolocation service
    
    // Default: English
    return 'en';
  }

  // Pluralization support
  pluralize(
    key: string,
    count: number,
    params?: Record<string, any>
  ): string {
    const pluralKey = this.getPluralKey(key, count);
    return this.translate(pluralKey as keyof TranslationKeys, { 
      ...params, 
      count 
    });
  }

  private getPluralKey(key: string, count: number): string {
    // English pluralization rules
    if (this.currentLanguage === 'en') {
      return count === 1 ? `${key}.one` : `${key}.other`;
    }

    // Arabic pluralization rules (complex)
    if (this.currentLanguage === 'ar') {
      if (count === 0) return `${key}.zero`;
      if (count === 1) return `${key}.one`;
      if (count === 2) return `${key}.two`;
      if (count >= 3 && count <= 10) return `${key}.few`;
      return `${key}.many`;
    }

    // Default: other
    return `${key}.other`;
  }

  // Date/Time formatting per locale
  formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { year: 'numeric', month: 'numeric', day: 'numeric' }
        : { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          };

    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  // Number formatting per locale
  formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  // Currency formatting (JOD)
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency: 'JOD',
      currencyDisplay: 'symbol'
    }).format(amount);
  }

  // Relative time formatting
  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, {
      numeric: 'auto'
    });

    const diff = date.getTime() - Date.now();
    const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diff / (1000 * 60 * 60));
      return rtf.format(diffInHours, 'hour');
    }

    return rtf.format(diffInDays, 'day');
  }

  // Get current language config
  getCurrentLanguageConfig(): LanguageConfig | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === this.currentLanguage);
  }

  // Get all enabled languages
  getEnabledLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES.filter(l => l.enabled);
  }
}

// Export singleton instance
export const localizationEngine = new LocalizationEngine();

// React Hook for easy usage
import { useState, useEffect } from 'react';

export function useLocalization() {
  const [language, setLanguage] = useState(localizationEngine.getCurrentLanguageConfig());
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(
    language?.direction || 'ltr'
  );

  useEffect(() => {
    const detectedLang = localizationEngine.detectUserLanguage();
    localizationEngine.setLanguage(detectedLang);
    
    const config = localizationEngine.getCurrentLanguageConfig();
    setLanguage(config);
    setDirection(config?.direction || 'ltr');
  }, []);

  const changeLanguage = (langCode: string) => {
    localizationEngine.setLanguage(langCode);
    const config = localizationEngine.getCurrentLanguageConfig();
    setLanguage(config);
    setDirection(config?.direction || 'ltr');
  };

  const t = (key: keyof TranslationKeys, params?: Record<string, any>) => {
    return localizationEngine.translate(key, params);
  };

  const plural = (key: string, count: number, params?: Record<string, any>) => {
    return localizationEngine.pluralize(key, count, params);
  };

  return {
    language,
    direction,
    changeLanguage,
    t,
    plural,
    formatDate: localizationEngine.formatDate.bind(localizationEngine),
    formatNumber: localizationEngine.formatNumber.bind(localizationEngine),
    formatCurrency: localizationEngine.formatCurrency.bind(localizationEngine),
    formatRelativeTime: localizationEngine.formatRelativeTime.bind(localizationEngine),
    enabledLanguages: localizationEngine.getEnabledLanguages()
  };
}

// Example Usage:
/*
import { useLocalization } from '@/utils/localization';

function MyComponent() {
  const { t, language, changeLanguage, formatCurrency, plural } = useLocalization();

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('welcome.message', { name: 'Ahmed' })}</p>
      <p>{formatCurrency(25.50)}</p>
      <p>{plural('rides.available', rideCount)}</p>
      
      <select value={language?.code} onChange={(e) => changeLanguage(e.target.value)}>
        {enabledLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
*/
