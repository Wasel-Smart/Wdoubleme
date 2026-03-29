/**
 * Supabase credentials.
 * Priority: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars (set in .env)
 * Fallback: empty strings → app runs in local demo mode.
 *
 * To connect a real backend:
 *   1. Copy .env.example → .env
 *   2. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   3. Restart the dev server
 */
export const projectId: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)
    ?.replace('https://', '')
    ?.replace('.supabase.co', '') ?? '';

export const publicAnonKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';
