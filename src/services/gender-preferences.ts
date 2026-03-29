/**
 * Gender Preferences Service
 * Handles gender-segregated ride preferences
 */

export type RideGenderPreference = 'women-only' | 'family-only' | 'mixed' | 'no-preference';

export interface GenderPreferences {
  ridePreference: RideGenderPreference;
  driverGenderPreference?: 'female' | 'male' | 'no-preference';
  enableForAllRides: boolean;
  allowMixedInEmergency: boolean;
}

export interface DriverGenderOptions {
  allowWomenOnlyRides: boolean;
  allowFamilyOnlyRides: boolean;
  allowMixedRides: boolean;
  verifiedForWomenOnly: boolean; // Requires additional verification
}

/**
 * Load user gender preferences
 */
export async function loadGenderPreferences(): Promise<GenderPreferences> {
  try {
    const saved = localStorage.getItem('wasel-gender-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load gender preferences:', error);
  }

  // Default preferences
  return {
    ridePreference: 'no-preference',
    driverGenderPreference: 'no-preference',
    enableForAllRides: false,
    allowMixedInEmergency: true,
  };
}

/**
 * Save user gender preferences
 */
export async function saveGenderPreferences(preferences: GenderPreferences): Promise<void> {
  try {
    localStorage.setItem('wasel-gender-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save gender preferences:', error);
    throw error;
  }
}

/**
 * Load driver gender options
 */
export async function loadDriverGenderOptions(): Promise<DriverGenderOptions> {
  try {
    const saved = localStorage.getItem('wasel-driver-gender-options');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load driver gender options:', error);
  }

  // Default options
  return {
    allowWomenOnlyRides: false,
    allowFamilyOnlyRides: true,
    allowMixedRides: true,
    verifiedForWomenOnly: false,
  };
}

/**
 * Save driver gender options
 */
export async function saveDriverGenderOptions(options: DriverGenderOptions): Promise<void> {
  try {
    localStorage.setItem('wasel-driver-gender-options', JSON.stringify(options));
  } catch (error) {
    console.error('Failed to save driver gender options:', error);
    throw error;
  }
}

/**
 * Check if a ride matches user preferences
 */
export function isRideMatchingPreferences(
  userPreference: RideGenderPreference,
  rideType: RideGenderPreference
): boolean {
  if (userPreference === 'no-preference') return true;
  if (userPreference === rideType) return true;
  
  // Mixed rides are acceptable for no-preference
  if (rideType === 'mixed' || rideType === 'no-preference') return true;
  
  return false;
}

/**
 * Get display text for gender preference
 */
export function getGenderPreferenceLabel(
  preference: RideGenderPreference,
  language: 'en' | 'ar'
): string {
  const labels = {
    'women-only': { en: 'Women Only', ar: 'للنساء فقط' },
    'family-only': { en: 'Family Only', ar: 'للعائلات فقط' },
    'mixed': { en: 'Mixed', ar: 'مختلط' },
    'no-preference': { en: 'No Preference', ar: 'بدون تفضيل' },
  };

  return labels[preference][language];
}

/**
 * Get description for gender preference
 */
export function getGenderPreferenceDescription(
  preference: RideGenderPreference,
  language: 'en' | 'ar'
): string {
  const descriptions = {
    'women-only': {
      en: 'Ride with female passengers and drivers only',
      ar: 'الركوب مع النساء والسائقات فقط',
    },
    'family-only': {
      en: 'Suitable for families with children',
      ar: 'مناسب للعائلات مع الأطفال',
    },
    'mixed': {
      en: 'Open to all passengers',
      ar: 'مفتوح لجميع الركاب',
    },
    'no-preference': {
      en: 'Any ride type is acceptable',
      ar: 'أي نوع من الركوب مقبول',
    },
  };

  return descriptions[preference][language];
}
