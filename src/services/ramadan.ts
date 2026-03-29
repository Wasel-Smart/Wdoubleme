/**
 * Ramadan Service
 * Automatically detects Ramadan dates and adjusts app behavior
 */

export interface RamadanDates {
  startDate: Date;
  endDate: Date;
  year: number;
  hijriYear: number;
}

export interface RamadanPreferences {
  autoEnableMode: boolean;
  adjustTripScheduling: boolean;
  respectfulTheme: boolean;
  hideFoodImagery: boolean;
  iftarTimeNotification: boolean;
  taraweehTimeNotification: boolean;
}

/**
 * Ramadan dates for upcoming years (Gregorian calendar)
 * Note: These are approximate and should be updated yearly
 */
const RAMADAN_DATES: RamadanDates[] = [
  {
    year: 2026,
    hijriYear: 1448,
    startDate: new Date('2026-02-18'),
    endDate: new Date('2026-03-19'),
  },
  {
    year: 2027,
    hijriYear: 1449,
    startDate: new Date('2027-02-08'),
    endDate: new Date('2027-03-09'),
  },
  {
    year: 2028,
    hijriYear: 1450,
    startDate: new Date('2028-01-28'),
    endDate: new Date('2028-02-26'),
  },
];

/**
 * Check if current date falls within Ramadan
 */
export function isRamadan(date: Date = new Date()): boolean {
  return RAMADAN_DATES.some(ramadan => 
    date >= ramadan.startDate && date <= ramadan.endDate
  );
}

/**
 * Get current Ramadan period if active
 */
export function getCurrentRamadan(): RamadanDates | null {
  const now = new Date();
  return RAMADAN_DATES.find(ramadan => 
    now >= ramadan.startDate && now <= ramadan.endDate
  ) || null;
}

/**
 * Calculate days remaining in Ramadan
 */
export function daysRemainingInRamadan(): number | null {
  const ramadan = getCurrentRamadan();
  if (!ramadan) return null;

  const now = new Date();
  const diffTime = ramadan.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get Ramadan day number (1-30)
 */
export function getRamadanDay(): number | null {
  const ramadan = getCurrentRamadan();
  if (!ramadan) return null;

  const now = new Date();
  const diffTime = now.getTime() - ramadan.startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Check if current time is near Iftar (maghrib prayer time)
 * @param maghribTime - Maghrib prayer time in HH:MM format
 * @param windowMinutes - Minutes before Iftar to consider "near"
 */
export function isNearIftar(maghribTime: string, windowMinutes: number = 60): boolean {
  if (!isRamadan()) return false;

  const now = new Date();
  const [hours, minutes] = maghribTime.split(':').map(Number);
  
  const iftarTime = new Date();
  iftarTime.setHours(hours, minutes, 0, 0);

  const diffMinutes = Math.floor((iftarTime.getTime() - now.getTime()) / 1000 / 60);
  return diffMinutes > 0 && diffMinutes <= windowMinutes;
}

/**
 * Check if current time is during peak hours
 * Peak hours: 1-2 hours before Iftar, 1-2 hours after Taraweeh
 */
export function isRamadanPeakHours(maghribTime: string, ishaTime: string): boolean {
  if (!isRamadan()) return false;

  const now = new Date();
  const currentHour = now.getHours();

  // Parse prayer times
  const [maghribHour] = maghribTime.split(':').map(Number);
  const [ishaHour] = ishaTime.split(':').map(Number);

  // Before Iftar (maghrib - 2 hours to maghrib)
  const beforeIftarStart = maghribHour - 2;
  const beforeIftarEnd = maghribHour;

  // After Taraweeh (isha + 1 hour to isha + 3 hours)
  // Assuming Taraweeh is 1 hour after Isha
  const afterTaraweehStart = ishaHour + 2;
  const afterTaraweehEnd = ishaHour + 4;

  return (
    (currentHour >= beforeIftarStart && currentHour <= beforeIftarEnd) ||
    (currentHour >= afterTaraweehStart && currentHour <= afterTaraweehEnd)
  );
}

/**
 * Load Ramadan preferences
 */
export async function loadRamadanPreferences(): Promise<RamadanPreferences> {
  try {
    const saved = localStorage.getItem('wasel-ramadan-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load Ramadan preferences:', error);
  }

  // Default preferences
  return {
    autoEnableMode: true,
    adjustTripScheduling: true,
    respectfulTheme: true,
    hideFoodImagery: true,
    iftarTimeNotification: true,
    taraweehTimeNotification: true,
  };
}

/**
 * Save Ramadan preferences
 */
export async function saveRamadanPreferences(preferences: RamadanPreferences): Promise<void> {
  try {
    localStorage.setItem('wasel-ramadan-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save Ramadan preferences:', error);
    throw error;
  }
}

/**
 * Get Ramadan greeting message
 */
export function getRamadanGreeting(language: 'en' | 'ar'): string {
  const day = getRamadanDay();
  
  if (language === 'ar') {
    return day ? `رمضان كريم - اليوم ${day}` : 'رمضان كريم';
  }
  
  return day ? `Ramadan Kareem - Day ${day}` : 'Ramadan Kareem';
}
