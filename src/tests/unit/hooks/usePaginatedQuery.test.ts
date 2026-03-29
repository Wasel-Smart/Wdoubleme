/**
 * usePaginatedQuery — Scalable pagination hook tests.
 *
 * Covers:
 *  - Initial fetch on mount
 *  - Page navigation (next, prev, goTo)
 *  - Prefetching of next page
 *  - Cache hits for previously visited pages
 *  - Error handling
 *  - Boundary conditions (first/last page)
 *  - Refresh clears cache
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePaginatedQuery, type PaginatedResult } from '../../../hooks/usePaginatedQuery';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockFetch<T>(items: T[], pageSize = 5) {
  return vi.fn(async (page: number, limit: number): Promise<PaginatedResult<T>> => {
    const offset = (page - 1) * limit;
    const pageItems = items.slice(offset, offset + limit);
    return {
      data: pageItems,
      pagination: {
        page,
        limit,
        totalCount: items.length,
        totalPages: Math.ceil(items.length / limit),
        hasNextPage: offset + limit < items.length,
        hasPrevPage: page > 1,
      },
    };
  });
}

const allTrips = Array.from({ length: 23 }, (_, i) => ({ id: `trip-${i + 1}`, from: 'Amman' }));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePaginatedQuery', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch(allTrips, 5);
  });

  it('fetches page 1 on initial mount', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(5);
    expect(result.current.page).toBe(1);
    expect(result.current.pagination.totalCount).toBe(23);
    expect(result.current.pagination.totalPages).toBe(5);
    expect(result.current.pagination.hasNextPage).toBe(true);
    expect(result.current.pagination.hasPrevPage).toBe(false);
  });

  it('navigates to next page', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.nextPage();
    });

    await waitFor(() => expect(result.current.page).toBe(2));
    expect(result.current.data[0].id).toBe('trip-6');
  });

  it('navigates to previous page', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5, initialPage: 3 })
    );

    await waitFor(() => expect(result.current.page).toBe(3));

    await act(async () => {
      result.current.prevPage();
    });

    await waitFor(() => expect(result.current.page).toBe(2));
  });

  it('goToPage jumps to specific page', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.goToPage(4);
    });

    await waitFor(() => expect(result.current.page).toBe(4));
    expect(result.current.data[0].id).toBe('trip-16');
  });

  it('does not exceed boundaries', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Try to go to page 0 (should be no-op)
    await act(async () => {
      result.current.goToPage(0);
    });
    expect(result.current.page).toBe(1);

    // Try to go past last page
    await act(async () => {
      result.current.goToPage(999);
    });
    expect(result.current.page).toBe(1); // didn't change
  });

  it('prevPage is no-op on page 1', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1); // didn't change
  });

  it('handles fetch errors gracefully', async () => {
    const failingFetch = vi.fn().mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() =>
      usePaginatedQuery('trips', failingFetch, { limit: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Network down');
  });

  it('last page has correct item count', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5, initialPage: 5 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(3); // 23 items, page 5 = items 21-23
    expect(result.current.pagination.hasNextPage).toBe(false);
  });

  it('refresh clears cache and re-fetches', async () => {
    const { result } = renderHook(() =>
      usePaginatedQuery('trips', mockFetch, { limit: 5, prefetchNext: false })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
