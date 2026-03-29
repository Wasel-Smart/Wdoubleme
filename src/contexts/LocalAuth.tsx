/**
 * LocalAuth
 *
 * Uses real Supabase auth/session data when configured.
 * Falls back to a local demo profile when backend credentials are absent.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authAPI } from '../services/auth';
import { initSupabaseListeners, isSupabaseConfigured, supabase } from '../utils/supabase/client';
import {
  mapBackendProfile,
  createDemoUserProfile,
  type WaselUserProfile,
} from '../domains/trust/profile';

export type WaselUser = WaselUserProfile;

interface LocalAuthCtx {
  user: WaselUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<WaselUser>) => void;
}

const Ctx = createContext<LocalAuthCtx | null>(null);
const STORAGE_KEY = 'wasel_local_user_v2';

function loadUser(): WaselUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: WaselUser | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? 'Wasel',
    lastName: parts.slice(1).join(' ') || 'User',
  };
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WaselUser | null>(loadUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cleanup = initSupabaseListeners();
    return cleanup;
  }, []);

  useEffect(() => {
    let mounted = true;

    const setAndPersist = (next: WaselUser | null) => {
      if (!mounted) return;
      setUser(next);
      saveUser(next);
    };

    const hydrateFromSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session?.user) {
          setAndPersist(null);
          setLoading(false);
          return;
        }

        const profileResult = await authAPI.getProfile().catch(() => ({ profile: null }));
        const mapped = mapBackendProfile({
          authUser: data.session.user,
          profile: profileResult?.profile ?? null,
        });
        setAndPersist(mapped);
      } catch {
        // Keep any previously stored user if backend sync fails.
      } finally {
        if (mounted) setLoading(false);
      }
    };

    hydrateFromSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;

        if (!session?.user) {
          setAndPersist(null);
          return;
        }

        try {
          const profileResult = await authAPI.getProfile().catch(() => ({ profile: null }));
          const mapped = mapBackendProfile({
            authUser: session.user,
            profile: profileResult?.profile ?? null,
          });
          setAndPersist(mapped);
        } catch {
          const fallbackUser = mapBackendProfile({ authUser: session.user, profile: null });
          setAndPersist(fallbackUser);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const data = await authAPI.signIn(email, password);
        const authUser = (data as any)?.user ?? (data as any)?.session?.user ?? null;

        if (authUser) {
          const profileResult = await authAPI.getProfile().catch(() => ({ profile: null }));
          const mapped = mapBackendProfile({
            authUser,
            profile: profileResult?.profile ?? null,
          });
          setUser(mapped);
          saveUser(mapped);
        }
        return { error: null };
      }

      // ── Demo mode: accept any non-empty email + password ──────────────
      if (!email.trim() || !password) {
        return { error: 'Please enter your email and password.' };
      }
      const demoUser = createDemoUserProfile({
        id: `demo-${btoa(email).slice(0, 12)}`,
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email,
        verified: false,
        balance: 0,
        trips: 0,
        rating: 0,
      });
      setUser(demoUser);
      saveUser(demoUser);
      return { error: null };
    } catch (error) {
      return { error: toMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<{ error: string | null }> => {
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { firstName, lastName } = splitName(name);
        const result = await authAPI.signUp(email, password, firstName, lastName, phone ?? '');
        if (!result) {
          // signUp already completed and auth state listener should hydrate.
        }

        const { data } = await supabase.auth.getSession();
        const authUser = data.session?.user;
        if (!authUser) return { error: null };

        const profileResult = await authAPI.getProfile().catch(() => ({ profile: null }));
        const mapped = mapBackendProfile({
          authUser,
          profile: profileResult?.profile ?? {
            full_name: name,
            phone_number: phone,
            verification_level: phone ? 'level_1' : 'level_0',
          },
        });
        setUser(mapped);
        saveUser(mapped);
        return { error: null };
      }

      // ── Demo mode: create a local profile immediately ────────────────
      if (!name.trim() || !email.trim() || !password) {
        return { error: 'Please fill in all required fields.' };
      }
      const demoUser = createDemoUserProfile({
        id: `demo-${btoa(email).slice(0, 12)}`,
        name: name.trim(),
        email,
        phone,
        verified: false,
        balance: 0,
        trips: 0,
        rating: 0,
      });
      setUser(demoUser);
      saveUser(demoUser);
      return { error: null };
    } catch (error) {
      return { error: toMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await authAPI.signOut();
      }
    } catch {
      // Continue local sign-out even if backend sign-out fails.
    } finally {
      setUser(null);
      saveUser(null);
    }
  };

  const updateUser = (updates: Partial<WaselUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      saveUser(next);
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ user, loading, signIn, register, signOut, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocalAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocalAuth must be inside LocalAuthProvider');
  return ctx;
}
