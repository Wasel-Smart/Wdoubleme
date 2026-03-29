/**
 * Cultural API Service — Wasel
 * Frontend API layer for cultural features: prayer times, gender preferences,
 * Ramadan mode, hijab privacy, mosque directory.
 *
 * All endpoints hit /cultural/* on the Hono gateway.
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/cultural`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        };
      }
    }
  } catch { /* fallback */ }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
}

export interface PrayerTimesResponse {
  date: string;
  city: string;
  country: string;
  prayers: PrayerTime[];
  isRamadan: boolean;
  ramadanInfo: {
    suhoor: string;
    iftar: string;
    message: string;
    messageAr: string;
  } | null;
}

export interface PrayerStop {
  prayer: string;
  prayerAr: string;
  time: string;
  stopDuration: number;
  mosque: {
    id?: string;
    name: string;
    nameAr: string;
    city?: string;
    km: number;
    facilities?: string[];
  };
  minutesIntoTrip: number;
}

export interface PrayerStopsResponse {
  route: string;
  departureTime: string;
  estimatedDuration: number;
  adjustedDuration: number;
  estimatedArrival: string;
  prayerStops: PrayerStop[];
  totalStopTime: number;
}

export interface MosqueEntry {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  lat: number;
  lng: number;
  route: string;
  km: number;
  facilities: string[];
}

export interface RamadanResponse {
  isRamadan: boolean;
  startDate: string;
  endDate: string;
  today: string;
  iftarTime: string;
  suhoorTime: string;
  features: {
    iftarTimedRides: boolean;
    noFoodDrinks: boolean;
    suhoorTrips: boolean;
    discountPercent: number;
  };
  messages: { en: string; ar: string };
}

export interface GenderPreferences {
  user_id: string;
  preference: 'mixed' | 'women_only' | 'men_only' | 'family_only';
  hide_photo: boolean;
  use_nickname: boolean;
  women_only_view: boolean;
  updated_at?: string;
}

// ── API Methods ──────────────────────────────────────────────────────────────

export const culturalApi = {
  /** GET /cultural/prayer-times?date=YYYY-MM-DD */
  async getPrayerTimes(date?: string): Promise<PrayerTimesResponse> {
    const qs = date ? `?date=${date}` : '';
    const res = await fetch(`${BASE}/prayer-times${qs}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Prayer times fetch failed: ${res.status}`);
    return res.json();
  },

  /** GET /cultural/prayer-stops?departure=HH:MM&duration=240&route=amman-aqaba&date=YYYY-MM-DD */
  async getPrayerStops(params: {
    departure: string;
    duration: number;
    route: string;
    date?: string;
  }): Promise<PrayerStopsResponse> {
    const qs = new URLSearchParams({
      departure: params.departure,
      duration: String(params.duration),
      route: params.route,
      ...(params.date ? { date: params.date } : {}),
    });
    const res = await fetch(`${BASE}/prayer-stops?${qs}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Prayer stops fetch failed: ${res.status}`);
    return res.json();
  },

  /** GET /cultural/mosques?route=amman-aqaba */
  async getMosques(route?: string): Promise<{ mosques: MosqueEntry[]; total: number }> {
    const qs = route ? `?route=${route}` : '';
    const res = await fetch(`${BASE}/mosques${qs}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Mosque directory fetch failed: ${res.status}`);
    return res.json();
  },

  /** GET /cultural/ramadan */
  async getRamadanStatus(): Promise<RamadanResponse> {
    const res = await fetch(`${BASE}/ramadan`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Ramadan status fetch failed: ${res.status}`);
    return res.json();
  },

  /** GET /cultural/gender-preferences */
  async getGenderPreferences(): Promise<GenderPreferences> {
    const res = await fetch(`${BASE}/gender-preferences`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Gender preferences fetch failed: ${res.status}`);
    return res.json();
  },

  /** POST /cultural/gender-preferences */
  async saveGenderPreferences(prefs: {
    preference: string;
    hidePhoto?: boolean;
    useNickname?: boolean;
    womenOnlyView?: boolean;
  }): Promise<{ success: boolean; preferences: GenderPreferences }> {
    const res = await fetch(`${BASE}/gender-preferences`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(prefs),
    });
    if (!res.ok) throw new Error(`Gender preferences save failed: ${res.status}`);
    return res.json();
  },
};
