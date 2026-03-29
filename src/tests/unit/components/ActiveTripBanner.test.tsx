/**
 * ActiveTripBanner — unit tests
 *
 * Verifies rendering logic, polling behaviour, ETA countdown,
 * "Track" navigation, dismiss interaction, and re-appearance on
 * new trips after dismiss.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ActiveTripBanner } from '../../../components/ActiveTripBanner';
import type { ActiveTrip } from '../../../services/activeTrip';

// ── Mock activeTripAPI ────────────────────────────────────────────────────────

vi.mock('../../../services/activeTrip', () => ({
  activeTripAPI: {
    getActiveTrip: vi.fn(),
  },
}));

import { activeTripAPI } from '../../../services/activeTrip';
const mockGetActiveTrip = activeTripAPI.getActiveTrip as ReturnType<typeof vi.fn>;

// ── Mock useNavigate ──────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE: ActiveTrip = {
  id: 'passenger_trip:111',
  from: '7th Circle',
  to: 'Abdali',
  driver: {
    name: 'Ahmad Khalil',
    nameAr: 'أحمد خليل',
    rating: 4.92,
    trips: 1847,
    img: 'https://i.pravatar.cc/150?u=ah',
    phone: '+962 79 123 4567',
    initials: 'AK',
  },
  vehicle: { model: 'Toyota Corolla', color: 'White', plate: '50·12345', year: 2022 },
  price: 1.85,
  passengers: 1,
  eta: '3 min',
  duration: '22 min',
  status: 'en_route_to_pickup',
  shareCode: 'WA-1234',
  tier: 'economy',
  startedAt: '2026-02-22T07:42:00Z',
  userId: 'user-123',
};

// ── Render helper ─────────────────────────────────────────────────────────────

function renderBanner(pollInterval = 60_000) {
  return render(
    <MemoryRouter>
      <ActiveTripBanner pollInterval={pollInterval} />
    </MemoryRouter>
  );
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ActiveTripBanner', () => {
  // ── No active trip ─────────────────────────────────────────────────────────

  it('renders nothing when there is no active trip', async () => {
    mockGetActiveTrip.mockResolvedValue(null);

    const { container } = renderBanner();
    await act(async () => { await Promise.resolve(); });

    // Nothing rendered in the banner container
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  // ── Active trip present ────────────────────────────────────────────────────

  it('shows the Live indicator and route when an active trip exists', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);

    renderBanner();
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(/live/i)).toBeInTheDocument();
    expect(screen.getByText('7th Circle')).toBeInTheDocument();
    expect(screen.getByText('Abdali')).toBeInTheDocument();
  });

  it('shows the correct status label for en_route_to_pickup', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);
    renderBanner();
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(/driver en route to you/i)).toBeInTheDocument();
  });

  it('shows correct status label when status is driver_arrived', async () => {
    mockGetActiveTrip.mockResolvedValue({ ...SAMPLE, status: 'driver_arrived' });
    renderBanner();
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(/driver has arrived/i)).toBeInTheDocument();
  });

  it('hides banner when status is completed', async () => {
    mockGetActiveTrip.mockResolvedValue({ ...SAMPLE, status: 'completed' });
    const { container } = renderBanner();
    await act(async () => { await Promise.resolve(); });

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  // ── ETA display ───────────────────────────────────────────────────────────

  it('displays the ETA from the trip', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);
    renderBanner();
    await act(async () => { await Promise.resolve(); });

    // ETA starts at 3 min → 180 seconds → displays "3 min"
    expect(screen.getByText('3 min')).toBeInTheDocument();
  });

  // ── Track button ──────────────────────────────────────────────────────────

  it('navigates to /app/live-trip when the Track button is clicked', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);
    renderBanner();
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByRole('button', { name: /track/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/app/live-trip');
  });

  it('navigates to /app/live-trip when the banner body is clicked', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);
    renderBanner();
    await act(async () => { await Promise.resolve(); });

    // Click the outer div (first relative overflow-hidden container)
    const banner = screen.getByText('7th Circle').closest('[class*="overflow-hidden"]');
    if (banner) fireEvent.click(banner);
    expect(mockNavigate).toHaveBeenCalledWith('/app/live-trip');
  });

  // ── Dismiss ───────────────────────────────────────────────────────────────

  it('hides the banner when the dismiss (×) button is clicked', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);
    renderBanner();
    await act(async () => { await Promise.resolve(); });

    // Banner is visible
    expect(screen.getByText(/live/i)).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText('Dismiss active trip banner');
    fireEvent.click(dismissBtn);

    // After dismiss, the status label disappears
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByText(/driver en route to you/i)).not.toBeInTheDocument();
  });

  // ── Polling ───────────────────────────────────────────────────────────────

  it('polls getActiveTrip at the specified interval', async () => {
    mockGetActiveTrip.mockResolvedValue(null);
    renderBanner(5_000);
    await act(async () => { await Promise.resolve(); });

    // Called once on mount
    expect(mockGetActiveTrip).toHaveBeenCalledTimes(1);

    // Advance 5 s → second poll
    await act(async () => { vi.advanceTimersByTime(5_000); await Promise.resolve(); });
    expect(mockGetActiveTrip).toHaveBeenCalledTimes(2);

    // Advance another 5 s → third poll
    await act(async () => { vi.advanceTimersByTime(5_000); await Promise.resolve(); });
    expect(mockGetActiveTrip).toHaveBeenCalledTimes(3);
  });

  it('re-shows the banner after dismiss when a new trip arrives', async () => {
    mockGetActiveTrip.mockResolvedValue(SAMPLE);
    renderBanner(5_000);
    await act(async () => { await Promise.resolve(); });

    // Dismiss
    fireEvent.click(screen.getByLabelText('Dismiss active trip banner'));
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByText(/driver en route/i)).not.toBeInTheDocument();

    // New trip with a different id arrives on next poll
    const newTrip = { ...SAMPLE, id: 'passenger_trip:999' };
    mockGetActiveTrip.mockResolvedValue(newTrip);

    await act(async () => { vi.advanceTimersByTime(5_000); await Promise.resolve(); });

    // Banner should reappear because id changed
    expect(screen.getByText(/driver en route/i)).toBeInTheDocument();
  });
});
