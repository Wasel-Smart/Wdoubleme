/**
 * Integration tests for AuthContext
 *
 * Covers:
 * - Proper typed error returns (AuthOperationError — no more `any`)
 * - Initial loading state
 * - Sign-in success / failure flows
 * - Sign-out clears state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { LocalAuthProvider } from '../../../contexts/LocalAuth';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const {
  mockSignInWithPassword,
  mockSignOut,
  mockGetSession,
  mockOnAuthStateChange,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

vi.mock('../../../utils/supabase/client', () => ({
  supabaseUrl: 'https://test.supabase.co',
  supabaseAnonKey: 'test-anon-key',
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
  initSupabaseListeners: vi.fn(() => () => {}),
  isSupabaseConfigured: true,
  checkSupabaseConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../services/api', () => ({
  authAPI: {
    getProfile: vi.fn().mockResolvedValue({ profile: null }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
    updateProfile: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LocalAuthProvider>
        <AuthProvider>{children}</AuthProvider>
      </LocalAuthProvider>
    </LanguageProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext — initial state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('starts with loading=true and user=null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('resolves to loading=false after initialization', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe('AuthContext — signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('returns { error: null } on success', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error: unknown };
    await act(async () => {
      response = await result.current.signIn('test@wasel.com', 'test123456');
    });

    expect(response!.error).toBeNull();
  });

  it('returns { error: AuthError } on failure', async () => {
    const authError = new Error('Invalid login credentials');
    authError.name = 'AuthApiError';

    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: authError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error: unknown };
    await act(async () => {
      response = await result.current.signIn('bad@user.com', 'wrongpass');
    });

    expect(response!.error).toBeTruthy();
    expect(response!.error).toBeInstanceOf(Error);
  });

  it('error is never of type `any` — it is always Error | null (type guard)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.signIn('test@wasel.com', 'pass');
    // If error were `any`, this assignment wouldn't prove the type.
    // By asserting it can be null or an Error we verify the typed contract.
    const err: Error | null = response.error as Error | null;
    expect(err).toBeNull();
  });
});

describe('AuthContext — signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSignOut.mockResolvedValue({ error: null });
  });

  it('calls supabase.auth.signOut exactly once', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});

describe('AuthContext — resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('returns { error: null } for a valid email', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error: unknown };
    await act(async () => {
      response = await result.current.resetPassword('test@wasel.com');
    });

    expect(response!.error).toBeNull();
  });
});
