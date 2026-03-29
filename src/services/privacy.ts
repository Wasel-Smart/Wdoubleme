/**
 * Privacy Service
 * Handles profile privacy including hijab-friendly options
 */

export type ProfilePrivacyLevel = 'public' | 'private' | 'minimal';

export interface PrivacyPreferences {
  privacyLevel: ProfilePrivacyLevel;
  enableFaceBlur: boolean;
  useAvatarOnly: boolean;
  hideFullName: boolean;
  showFirstNameOnly: boolean;
  hidePhoneNumber: boolean;
  shareLocationOnlyDuringRide: boolean;
  allowProfilePhotoView: 'everyone' | 'drivers-only' | 'none';
}

/**
 * Load user privacy preferences
 */
export async function loadPrivacyPreferences(): Promise<PrivacyPreferences> {
  try {
    const saved = localStorage.getItem('wasel-privacy-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load privacy preferences:', error);
  }

  // Default preferences - respectful defaults
  return {
    privacyLevel: 'private',
    enableFaceBlur: false,
    useAvatarOnly: false,
    hideFullName: false,
    showFirstNameOnly: true,
    hidePhoneNumber: true,
    shareLocationOnlyDuringRide: true,
    allowProfilePhotoView: 'drivers-only',
  };
}

/**
 * Save user privacy preferences
 */
export async function savePrivacyPreferences(preferences: PrivacyPreferences): Promise<void> {
  try {
    localStorage.setItem('wasel-privacy-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save privacy preferences:', error);
    throw error;
  }
}

/**
 * Apply face blur effect to image URL (mock implementation)
 * In production, this would call an image processing API
 */
export async function applyFaceBlur(imageUrl: string): Promise<string> {
  // In production, this would:
  // 1. Upload image to processing service
  // 2. Detect faces using AI/ML
  // 3. Apply blur effect
  // 4. Return new URL
  
  // For now, return original URL with a blur parameter
  return `${imageUrl}?blur=face`;
}

/**
 * Get avatar alternatives based on preference
 */
export function getAvatarAlternatives(): string[] {
  return [
    '/avatars/hijab-1.svg',
    '/avatars/hijab-2.svg',
    '/avatars/modest-1.svg',
    '/avatars/modest-2.svg',
    '/avatars/neutral-1.svg',
    '/avatars/neutral-2.svg',
  ];
}

/**
 * Format name based on privacy preferences
 */
export function formatDisplayName(
  fullName: string,
  preferences: PrivacyPreferences
): string {
  if (preferences.hideFullName) {
    return '***';
  }

  if (preferences.showFirstNameOnly) {
    const firstName = fullName.split(' ')[0];
    return firstName || fullName;
  }

  return fullName;
}

/**
 * Get privacy level description
 */
export function getPrivacyLevelDescription(
  level: ProfilePrivacyLevel,
  language: 'en' | 'ar'
): string {
  const descriptions = {
    public: {
      en: 'Your profile is visible to everyone',
      ar: 'ملفك الشخصي مرئي للجميع',
    },
    private: {
      en: 'Your profile is visible to drivers only during rides',
      ar: 'ملفك الشخصي مرئي للسائقين فقط أثناء الرحلات',
    },
    minimal: {
      en: 'Only essential information is shared',
      ar: 'يتم مشاركة المعلومات الأساسية فقط',
    },
  };

  return descriptions[level][language];
}
