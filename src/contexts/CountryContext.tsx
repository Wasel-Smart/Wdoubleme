/**
 * Country Context - Multi-Country Support System
 * 
 * Provides country detection, switching, and configuration management
 * across the entire Wasel application.
 * 
 * Features:
 * - Automatic country detection (IP + GPS)
 * - Manual country switching
 * - Currency conversion
 * - Feature flag resolution
 * - Service availability checking
 * - Persistent country preference
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface Country {
  id: string;
  iso_alpha2: string;
  iso_alpha3: string;
  name: string;
  name_ar: string;
  default_currency_code: string;
  default_locale: string;
  phone_country_code: string;
  timezone: string;
  utc_offset_minutes: number;
  is_rtl: boolean;
  calendar_type: 'gregorian' | 'hijri' | 'both';
  weekend_days: number[];
  status: 'active' | 'inactive' | 'coming_soon' | 'beta' | 'planned';
  priority: number;
  flag_emoji: string;
  requires_national_id: boolean;
  requires_police_clearance: boolean;
  min_driver_age: number;
  min_passenger_age_alone: number;
  allows_cross_border: boolean;
}

export interface Currency {
  code: string;
  name: string;
  name_ar: string;
  symbol: string;
  decimals: number;
  symbol_position: 'before' | 'after';
  decimal_separator: string;
  thousands_separator: string;
}

// ============================================================================
// FALLBACK DATA (Mock data when tables don't exist)
// ============================================================================

const FALLBACK_COUNTRIES: Country[] = [
  {
    id: '1',
    name: 'Jordan',
    name_ar: 'الأردن',
    iso_alpha2: 'JO',
    iso_alpha3: 'JOR',
    default_currency_code: 'JOD',
    default_locale: 'ar-JO',
    phone_country_code: '+962',
    timezone: 'Asia/Amman',
    utc_offset_minutes: 180,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'active',
    priority: 1,
    flag_emoji: '🇯🇴',
    requires_national_id: true,
    requires_police_clearance: true,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '2',
    name: 'Egypt',
    name_ar: 'مصر',
    iso_alpha2: 'EG',
    iso_alpha3: 'EGY',
    default_currency_code: 'EGP',
    default_locale: 'ar-EG',
    phone_country_code: '+20',
    timezone: 'Africa/Cairo',
    utc_offset_minutes: 120,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'beta',
    priority: 2,
    flag_emoji: '🇪🇬',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 21,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '3',
    name: 'Saudi Arabia',
    name_ar: 'المملكة العربية السعودية',
    iso_alpha2: 'SA',
    iso_alpha3: 'SAU',
    default_currency_code: 'SAR',
    default_locale: 'ar-SA',
    phone_country_code: '+966',
    timezone: 'Asia/Riyadh',
    utc_offset_minutes: 180,
    is_rtl: true,
    calendar_type: 'hijri',
    weekend_days: [5, 6],
    status: 'coming_soon',
    priority: 3,
    flag_emoji: '🇸🇦',
    requires_national_id: true,
    requires_police_clearance: true,
    min_driver_age: 21,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '4',
    name: 'United Arab Emirates',
    name_ar: 'الإمارات العربية المتحدة',
    iso_alpha2: 'AE',
    iso_alpha3: 'ARE',
    default_currency_code: 'AED',
    default_locale: 'ar-AE',
    phone_country_code: '+971',
    timezone: 'Asia/Dubai',
    utc_offset_minutes: 240,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'coming_soon',
    priority: 4,
    flag_emoji: '🇦🇪',
    requires_national_id: true,
    requires_police_clearance: true,
    min_driver_age: 21,
    min_passenger_age_alone: 18,
    allows_cross_border: true,
  },
  {
    id: '5',
    name: 'Kuwait',
    name_ar: 'الكويت',
    iso_alpha2: 'KW',
    iso_alpha3: 'KWT',
    default_currency_code: 'KWD',
    default_locale: 'ar-KW',
    phone_country_code: '+965',
    timezone: 'Asia/Kuwait',
    utc_offset_minutes: 180,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'coming_soon',
    priority: 5,
    flag_emoji: '🇰🇼',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '6',
    name: 'Bahrain',
    name_ar: 'البحرين',
    iso_alpha2: 'BH',
    iso_alpha3: 'BHR',
    default_currency_code: 'BHD',
    default_locale: 'ar-BH',
    phone_country_code: '+973',
    timezone: 'Asia/Bahrain',
    utc_offset_minutes: 180,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'coming_soon',
    priority: 6,
    flag_emoji: '🇧🇭',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '7',
    name: 'Qatar',
    name_ar: 'قطر',
    iso_alpha2: 'QA',
    iso_alpha3: 'QAT',
    default_currency_code: 'QAR',
    default_locale: 'ar-QA',
    phone_country_code: '+974',
    timezone: 'Asia/Qatar',
    utc_offset_minutes: 180,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'planned',
    priority: 7,
    flag_emoji: '🇶🇦',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '8',
    name: 'Oman',
    name_ar: 'عُمان',
    iso_alpha2: 'OM',
    iso_alpha3: 'OMN',
    default_currency_code: 'OMR',
    default_locale: 'ar-OM',
    phone_country_code: '+968',
    timezone: 'Asia/Muscat',
    utc_offset_minutes: 240,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'planned',
    priority: 8,
    flag_emoji: '🇴🇲',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '9',
    name: 'Lebanon',
    name_ar: 'لبنان',
    iso_alpha2: 'LB',
    iso_alpha3: 'LBN',
    default_currency_code: 'USD',
    default_locale: 'ar-LB',
    phone_country_code: '+961',
    timezone: 'Asia/Beirut',
    utc_offset_minutes: 120,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [6, 0],
    status: 'planned',
    priority: 9,
    flag_emoji: '🇱🇧',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '10',
    name: 'Palestine',
    name_ar: 'فلسطين',
    iso_alpha2: 'PS',
    iso_alpha3: 'PSE',
    default_currency_code: 'JOD',
    default_locale: 'ar-PS',
    phone_country_code: '+970',
    timezone: 'Asia/Hebron',
    utc_offset_minutes: 120,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'planned',
    priority: 10,
    flag_emoji: '🇵🇸',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '11',
    name: 'Morocco',
    name_ar: 'المغرب',
    iso_alpha2: 'MA',
    iso_alpha3: 'MAR',
    default_currency_code: 'MAD',
    default_locale: 'ar-MA',
    phone_country_code: '+212',
    timezone: 'Africa/Casablanca',
    utc_offset_minutes: 60,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'planned',
    priority: 11,
    flag_emoji: '🇲🇦',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '12',
    name: 'Tunisia',
    name_ar: 'تونس',
    iso_alpha2: 'TN',
    iso_alpha3: 'TUN',
    default_currency_code: 'TND',
    default_locale: 'ar-TN',
    phone_country_code: '+216',
    timezone: 'Africa/Tunis',
    utc_offset_minutes: 60,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [6, 0],
    status: 'planned',
    priority: 12,
    flag_emoji: '🇹🇳',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
  {
    id: '13',
    name: 'Iraq',
    name_ar: 'العراق',
    iso_alpha2: 'IQ',
    iso_alpha3: 'IRQ',
    default_currency_code: 'IQD',
    default_locale: 'ar-IQ',
    phone_country_code: '+964',
    timezone: 'Asia/Baghdad',
    utc_offset_minutes: 180,
    is_rtl: true,
    calendar_type: 'gregorian',
    weekend_days: [5, 6],
    status: 'planned',
    priority: 13,
    flag_emoji: '🇮🇶',
    requires_national_id: true,
    requires_police_clearance: false,
    min_driver_age: 18,
    min_passenger_age_alone: 18,
    allows_cross_border: false,
  },
];

const FALLBACK_CURRENCIES: { [key: string]: Currency } = {
  JOD: {
    code: 'JOD', name: 'Jordanian Dinar', name_ar: 'دينار أردني',
    symbol: 'د.أ', decimals: 3, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  EGP: {
    code: 'EGP', name: 'Egyptian Pound', name_ar: 'جنيه مصري',
    symbol: 'ج.م', decimals: 2, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  SAR: {
    code: 'SAR', name: 'Saudi Riyal', name_ar: 'ريال سعودي',
    symbol: 'ر.س', decimals: 2, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  AED: {
    code: 'AED', name: 'UAE Dirham', name_ar: 'درهم إماراتي',
    symbol: 'د.إ', decimals: 2, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  KWD: {
    code: 'KWD', name: 'Kuwaiti Dinar', name_ar: 'دينار كويتي',
    symbol: 'د.ك', decimals: 3, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  BHD: {
    code: 'BHD', name: 'Bahraini Dinar', name_ar: 'دينار بحريني',
    symbol: 'د.ب', decimals: 3, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  QAR: {
    code: 'QAR', name: 'Qatari Riyal', name_ar: 'ريال قطري',
    symbol: 'ر.ق', decimals: 2, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  OMR: {
    code: 'OMR', name: 'Omani Rial', name_ar: 'ريال عُماني',
    symbol: 'ر.ع', decimals: 3, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  USD: {
    code: 'USD', name: 'US Dollar', name_ar: 'دولار أمريكي',
    symbol: '$', decimals: 2, symbol_position: 'before',
    decimal_separator: '.', thousands_separator: ',',
  },
  MAD: {
    code: 'MAD', name: 'Moroccan Dirham', name_ar: 'درهم مغربي',
    symbol: 'د.م', decimals: 2, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  TND: {
    code: 'TND', name: 'Tunisian Dinar', name_ar: 'دينار تونسي',
    symbol: 'د.ت', decimals: 3, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
  IQD: {
    code: 'IQD', name: 'Iraqi Dinar', name_ar: 'دينار عراقي',
    symbol: 'ع.د', decimals: 0, symbol_position: 'after',
    decimal_separator: '.', thousands_separator: ',',
  },
};

const FALLBACK_EXCHANGE_RATES: { [key: string]: number } = {
  'JOD-EGP': 68.50, 'EGP-JOD': 0.0146,
  'JOD-SAR': 5.29,  'SAR-JOD': 0.189,
  'JOD-AED': 5.18,  'AED-JOD': 0.193,
  'JOD-KWD': 0.435, 'KWD-JOD': 2.30,
  'JOD-BHD': 0.531, 'BHD-JOD': 1.88,
  'JOD-QAR': 5.15,  'QAR-JOD': 0.194,
  'JOD-OMR': 0.545, 'OMR-JOD': 1.84,
  'JOD-USD': 1.41,  'USD-JOD': 0.709,
  'JOD-MAD': 14.10, 'MAD-JOD': 0.071,
  'JOD-TND': 4.35,  'TND-JOD': 0.230,
  'JOD-IQD': 1850,  'IQD-JOD': 0.00054,
};

export interface CountryConfig {
  [key: string]: any;
}

export interface ExchangeRate {
  from_currency_code: string;
  to_currency_code: string;
  rate: number;
  fetched_at: string;
}

interface CountryContextType {
  // Current country state
  currentCountry: Country | null;
  currentCurrency: Currency | null;
  countryConfig: CountryConfig;
  
  // Available countries
  availableCountries: Country[];
  
  // Country operations
  setCountry: (isoCode: string) => Promise<void>;
  detectCountry: () => Promise<void>;
  
  // Currency operations
  convertCurrency: (amount: number, fromCode: string, toCode: string) => Promise<number>;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  
  // Feature flags
  isFeatureEnabled: (featureKey: string) => boolean;
  isServiceAvailable: (serviceId: string) => boolean;
  
  // Loading states
  isLoading: boolean;
  isDetecting: boolean;
  
  // Error handling
  error: string | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CountryContext = createContext<CountryContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface CountryProviderProps {
  children: React.ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {
  // State
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [countryConfig, setCountryConfig] = useState<CountryConfig>({});
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Map<string, ExchangeRate>>(new Map());
  const [featureFlags, setFeatureFlags] = useState<Map<string, boolean>>(new Map());
  const [availableServices, setAvailableServices] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FETCH AVAILABLE COUNTRIES
  // ============================================================================
  const fetchAvailableCountries = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('countries')
        .select('*')
        .in('status', ['active', 'coming_soon', 'beta', 'planned'])
        .order('priority', { ascending: true });

      if (fetchError) {
        // Silent fallback - no console warnings
        setAvailableCountries(FALLBACK_COUNTRIES);
        return FALLBACK_COUNTRIES;
      }

      setAvailableCountries(data || []);
      return data || [];
    } catch (err) {
      // Silent fallback - no console logging
      setAvailableCountries(FALLBACK_COUNTRIES);
      return FALLBACK_COUNTRIES;
    }
  }, []);

  // ============================================================================
  // DETECT COUNTRY (IP-based + GPS fallback)
  // ============================================================================
  const detectCountry = useCallback(async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // Check if user has a saved preference
      const savedCountry = localStorage.getItem('wasel_country_preference');
      if (savedCountry) {
        const country = availableCountries.find(c => c.iso_alpha2 === savedCountry);
        if (country && country.status === 'active') {
          await loadCountryData(country);
          setIsDetecting(false);
          return;
        }
      }

      // Try IP-based detection using ipapi.co (free tier)
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const detectedIso = data.country_code;

        const country = availableCountries.find(c => c.iso_alpha2 === detectedIso);
        if (country && country.status === 'active') {
          await loadCountryData(country);
          setIsDetecting(false);
          return;
        }
      } catch (ipError) {
        console.warn('IP detection failed, falling back to default:', ipError);
      }

      // Fallback: Use Jordan (default)
      const defaultCountry = availableCountries.find(c => c.iso_alpha2 === 'JO');
      if (defaultCountry) {
        await loadCountryData(defaultCountry);
      }
    } catch (err) {
      console.error('Country detection error:', err);
      setError('Failed to detect country');
      
      // Ultimate fallback: Jordan
      const jordan = availableCountries.find(c => c.iso_alpha2 === 'JO');
      if (jordan) {
        await loadCountryData(jordan);
      }
    } finally {
      setIsDetecting(false);
    }
  }, [availableCountries]);

  // ============================================================================
  // LOAD COUNTRY DATA (configs, currency, rates, features)
  // ============================================================================
  const loadCountryData = async (country: Country) => {
    try {
      setIsLoading(true);
      setError(null);

      // Set current country
      setCurrentCountry(country);

      // Load currency (with silent fallback)
      const { data: currencyData } = await supabase
        .from('currencies')
        .select('*')
        .eq('code', country.default_currency_code)
        .single();

      if (currencyData) {
        setCurrentCurrency(currencyData);
      } else {
        // Silent fallback - use hardcoded currency
        const fallbackCurrency = FALLBACK_CURRENCIES[country.default_currency_code];
        if (fallbackCurrency) {
          setCurrentCurrency(fallbackCurrency);
        }
      }

      // Try to load country configs (silent on error)
      try {
        const { data: configsData } = await supabase
          .from('country_configs')
          .select('key, value')
          .eq('country_id', country.id);

        const configs: CountryConfig = {};
        configsData?.forEach(config => {
          configs[config.key] = config.value;
        });
        setCountryConfig(configs);
      } catch {
        // Silent - use empty config
        setCountryConfig({});
      }

      // Try to load exchange rates (silent on error)
      try {
        const { data: ratesData } = await supabase
          .from('exchange_rates')
          .select('*')
          .eq('from_currency_code', country.default_currency_code)
          .eq('is_active', true)
          .order('fetched_at', { ascending: false });

        const ratesMap = new Map<string, ExchangeRate>();
        ratesData?.forEach(rate => {
          ratesMap.set(rate.to_currency_code, rate);
        });
        setExchangeRates(ratesMap);
      } catch {
        // Silent - use empty rates
        setExchangeRates(new Map());
      }

      // Try to load feature flags (silent on error)
      try {
        const { data: flagsData } = await supabase
          .from('country_feature_flags')
          .select('flag_key, enabled')
          .eq('country_id', country.id);

        const flagsMap = new Map<string, boolean>();
        flagsData?.forEach(flag => {
          flagsMap.set(flag.flag_key, flag.enabled);
        });
        setFeatureFlags(flagsMap);
      } catch {
        // Silent - use empty flags
        setFeatureFlags(new Map());
      }

      // Try to load available services (silent on error)
      try {
        const { data: servicesData } = await supabase
          .from('country_services')
          .select('service_id')
          .eq('country_id', country.id)
          .eq('enabled', true);

        const servicesSet = new Set<string>();
        servicesData?.forEach(service => {
          servicesSet.add(service.service_id);
        });
        setAvailableServices(servicesSet);
      } catch {
        // Silent - use empty services
        setAvailableServices(new Set());
      }

      // Save preference
      localStorage.setItem('wasel_country_preference', country.iso_alpha2);

    } catch (err) {
      // Silent error handling - still set country with fallback data
      setCurrentCountry(country);
      
      // Use fallback currency
      const fallbackCurrency = FALLBACK_CURRENCIES[country.default_currency_code];
      if (fallbackCurrency) {
        setCurrentCurrency(fallbackCurrency);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // SET COUNTRY (Manual selection)
  // ============================================================================
  const setCountry = useCallback(async (isoCode: string) => {
    const country = availableCountries.find(c => c.iso_alpha2 === isoCode);
    if (!country) {
      setError(`Country ${isoCode} not found`);
      return;
    }

    if (country.status !== 'active') {
      setError(`Country ${country.name} is not yet available`);
      return;
    }

    await loadCountryData(country);
  }, [availableCountries]);

  // ============================================================================
  // CONVERT CURRENCY
  // ============================================================================
  const convertCurrency = useCallback(async (
    amount: number,
    fromCode: string,
    toCode: string
  ): Promise<number> => {
    if (fromCode === toCode) {
      return amount;
    }

    // Check cache first
    const cachedRate = exchangeRates.get(toCode);
    if (cachedRate && cachedRate.from_currency_code === fromCode) {
      return amount * cachedRate.rate;
    }

    // Fetch from database
    try {
      const { data } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency_code', fromCode)
        .eq('to_currency_code', toCode)
        .eq('is_active', true)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        return amount * data.rate;
      }

      throw new Error(`No exchange rate found for ${fromCode} to ${toCode}`);
    } catch (err) {
      console.error('Currency conversion error:', err);
      return amount; // Return original amount on error
    }
  }, [exchangeRates]);

  // ============================================================================
  // FORMAT CURRENCY
  // ============================================================================
  const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
    const currency = currencyCode
      ? availableCountries.find(c => c.default_currency_code === currencyCode)
      : currentCurrency;

    if (!currency && !currentCurrency) {
      return amount.toFixed(2);
    }

    const cur = currentCurrency!;
    const decimals = cur.decimals || 2;
    const formattedAmount = amount.toFixed(decimals);
    
    // Apply thousands separator
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, cur.thousands_separator || ',');
    const numberStr = parts.join(cur.decimal_separator || '.');

    // Apply symbol position
    if (cur.symbol_position === 'before') {
      return `${cur.symbol}${numberStr}`;
    } else {
      return `${numberStr} ${cur.symbol}`;
    }
  }, [currentCurrency, availableCountries]);

  // ============================================================================
  // FEATURE FLAG CHECK
  // ============================================================================
  const isFeatureEnabled = useCallback((featureKey: string): boolean => {
    return featureFlags.get(featureKey) ?? false;
  }, [featureFlags]);

  // ============================================================================
  // SERVICE AVAILABILITY CHECK
  // ============================================================================
  const isServiceAvailable = useCallback((serviceId: string): boolean => {
    return availableServices.has(serviceId);
  }, [availableServices]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  useEffect(() => {
    const initialize = async () => {
      const countries = await fetchAvailableCountries();
      if (countries.length > 0) {
        // Auto-detect country on first load
        await detectCountry();
      }
      setIsLoading(false);
    };

    initialize();
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  const value = useMemo<CountryContextType>(() => ({
    currentCountry,
    currentCurrency,
    countryConfig,
    availableCountries,
    setCountry,
    detectCountry,
    convertCurrency,
    formatCurrency,
    isFeatureEnabled,
    isServiceAvailable,
    isLoading,
    isDetecting,
    error,
  }), [
    currentCountry,
    currentCurrency,
    countryConfig,
    availableCountries,
    setCountry,
    detectCountry,
    convertCurrency,
    formatCurrency,
    isFeatureEnabled,
    isServiceAvailable,
    isLoading,
    isDetecting,
    error,
  ]);

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useCountry = (): CountryContextType => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within CountryProvider');
  }
  return context;
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get current country ISO code
 */
export const useCountryISO = (): string => {
  const { currentCountry } = useCountry();
  return currentCountry?.iso_alpha2 || 'JO';
};

/**
 * Hook to get current currency code
 */
export const useCurrencyCode = (): string => {
  const { currentCurrency } = useCountry();
  return currentCurrency?.code || 'JOD';
};

/**
 * Hook to check if in RTL country
 */
export const useIsRTL = (): boolean => {
  const { currentCountry } = useCountry();
  return currentCountry?.is_rtl ?? true;
};

/**
 * Hook to format price in current currency
 */
export const useFormatPrice = () => {
  const { formatCurrency } = useCountry();
  return formatCurrency;
};

/**
 * Hook to check if feature is available in current country
 */
export const useFeatureFlag = (featureKey: string): boolean => {
  const { isFeatureEnabled } = useCountry();
  return isFeatureEnabled(featureKey);
};

/**
 * Hook to check if service is available in current country
 */
export const useServiceAvailability = (serviceId: string): boolean => {
  const { isServiceAvailable } = useCountry();
  return isServiceAvailable(serviceId);
};