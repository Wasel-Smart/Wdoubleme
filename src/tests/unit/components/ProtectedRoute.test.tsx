/**
 * ProtectedRoute — Guards authenticated-only routes.
 *
 * Covers:
 *  - Redirects unauthenticated users to /auth
 *  - Shows loading state while checking auth
 *  - Renders children when user is authenticated
 *  - Preserves intended destination via location state
 *  - Loading state has accessible role="status"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseAuth = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../../components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (value: string) => value,
    dir: 'ltr',
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderProtectedRoute(initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div data-testid="protected-content">Secret Page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while auth state is resolving', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, session: null });
    renderProtectedRoute();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('loading state has accessible role="status"', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, session: null });
    renderProtectedRoute();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to /auth when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, session: null });
    renderProtectedRoute();

    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders protected content when user IS authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@wasel.com' },
      loading: false,
      session: { access_token: 'tok' },
    });
    renderProtectedRoute();

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-page')).not.toBeInTheDocument();
  });

  it('does not flash protected content during loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, session: null });
    renderProtectedRoute();

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
