import { isSupabaseConfigured } from './supabase/client';

export type WaselRuntimeMode = 'production' | 'demo';

function readBooleanEnv(value: string | boolean | undefined, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export const isDemoDataEnabled = readBooleanEnv(import.meta.env.VITE_ENABLE_DEMO_DATA, true);
export const areSyntheticTripsEnabled = readBooleanEnv(
  import.meta.env.VITE_ENABLE_SYNTHETIC_TRIPS,
  false,
);

export function getRuntimeMode(): WaselRuntimeMode {
  return isSupabaseConfigured && !isDemoDataEnabled ? 'production' : 'demo';
}

export function getRuntimeModeLabel(): string {
  return getRuntimeMode() === 'production' ? 'Live backend' : 'Demo data';
}

export function getRuntimeModeDescription(): string {
  if (getRuntimeMode() === 'production') {
    return 'Connected to the configured backend.';
  }

  if (!isSupabaseConfigured) {
    return 'Backend credentials are missing, so Wasel is using clearly labeled demo data.';
  }

  return 'Demo mode is enabled by environment configuration.';
}
