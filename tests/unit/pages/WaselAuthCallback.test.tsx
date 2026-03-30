import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/hooks/useIframeSafeNavigate', () => ({
  useIframeSafeNavigate: () => mockNavigate,
}));

vi.mock('@/utils/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

import WaselAuthCallback from '@/pages/WaselAuthCallback';

describe('WaselAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });
  });

  it('redirects into the app when opened in the same tab', async () => {
    render(<WaselAuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/find-ride', { replace: true });
    });

    expect(screen.getByText(/Finalizing authentication/i)).toBeInTheDocument();
  });

  it('shows an error when auth completion fails', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('OAuth failed'),
    });

    render(<WaselAuthCallback />);

    await waitFor(() => {
      expect(screen.getByText(/Sign-in could not finish/i)).toBeInTheDocument();
    });
  });
});
