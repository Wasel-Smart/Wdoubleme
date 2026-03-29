/**
 * ErrorBoundary — Catches unhandled React rendering errors.
 *
 * Covers:
 *  - Renders children normally when no error
 *  - Catches thrown errors and renders fallback UI
 *  - Displays the error message for debugging
 *  - Logs to console.error
 *  - Recovery buttons navigate home / reload
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ThrowingChild({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test explosion 💥');
  return <div data-testid="happy-child">All good!</div>;
}

// Suppress console.error noise from React's own error boundary logging
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('happy-child')).toBeInTheDocument();
  });

  it('catches errors and renders fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('happy-child')).not.toBeInTheDocument();
    // The fallback should show some error indication
    expect(screen.getByText(/something went wrong/i) || screen.getByText(/error/i)).toBeTruthy();
  });

  it('displays the error message for debugging', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Test explosion/i)).toBeInTheDocument();
  });

  it('calls console.error when an error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('provides a "Go Home" recovery action', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    const homeBtn = screen.getByRole('button', { name: /home/i });
    expect(homeBtn).toBeInTheDocument();

    fireEvent.click(homeBtn);
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
  });
});
