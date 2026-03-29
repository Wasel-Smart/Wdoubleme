/**
 * Prayer Times Service
 * Calculates Islamic prayer times based on user location
 * Uses Aladhan API for accurate prayer time calculations
 */

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  timezone: string;
}

export interface PrayerPreferences {
  enableNotifications: boolean;
  enableTripPauses: boolean;
  notifyBeforeMinutes: number;
  autoDeclineRidesDuringPrayer: boolean;
  soundEnabled: boolean;
}

const ALADHAN_API = 'https://api.aladhan.com/v1';

/**
 * Fetch prayer times for a specific location
 */
export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  date?: Date
): Promise<PrayerTimes> {
  const targetDate = date || new Date();
  const timestamp = Math.floor(targetDate.getTime() / 1000);

  try {
    const response = await fetch(
      `${ALADHAN_API}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=4`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    const timings = data.data.timings;

    return {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date: data.data.date.readable,
      timezone: data.data.meta.timezone,
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
}

/**
 * Get next prayer time from current time
 */
export function getNextPrayer(prayerTimes: PrayerTimes): { name: string; time: string } | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes > currentTime) {
      return prayer;
    }
  }

  // If no prayer is found today, return Fajr for tomorrow
  return { name: 'Fajr', time: prayerTimes.fajr };
}

/**
 * Calculate time remaining until next prayer
 */
export function getTimeUntilPrayer(prayerTime: string): number {
  const now = new Date();
  const [hours, minutes] = prayerTime.split(':').map(Number);
  
  const prayerDate = new Date();
  prayerDate.setHours(hours, minutes, 0, 0);

  // If prayer time has passed today, set it for tomorrow
  if (prayerDate < now) {
    prayerDate.setDate(prayerDate.getDate() + 1);
  }

  return Math.floor((prayerDate.getTime() - now.getTime()) / 1000 / 60); // minutes
}

/**
 * Check if current time is within prayer window
 */
export function isWithinPrayerWindow(prayerTime: string, windowMinutes: number = 15): boolean {
  const minutesUntil = getTimeUntilPrayer(prayerTime);
  return minutesUntil >= 0 && minutesUntil <= windowMinutes;
}

/**
 * Load user prayer preferences
 */
export async function loadPrayerPreferences(): Promise<PrayerPreferences> {
  try {
    const saved = localStorage.getItem('wasel-prayer-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load prayer preferences:', error);
  }

  // Default preferences
  return {
    enableNotifications: true,
    enableTripPauses: true,
    notifyBeforeMinutes: 10,
    autoDeclineRidesDuringPrayer: false,
    soundEnabled: true,
  };
}

/**
 * Save user prayer preferences
 */
export async function savePrayerPreferences(preferences: PrayerPreferences): Promise<void> {
  try {
    localStorage.setItem('wasel-prayer-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save prayer preferences:', error);
    throw error;
  }
}
