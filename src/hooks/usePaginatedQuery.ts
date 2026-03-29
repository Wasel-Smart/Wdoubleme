/**
 * usePaginatedQuery — Generic pagination hook for scalable data fetching.
 *
 * Provides page-based navigation with prefetching of the next page,
 * loading/error states, and in-memory page cache that resets when
 * the query `key` changes (e.g. new search filters).
 *
 * Usage:
 *   const { data, page, totalPages, nextPage, prevPage, isLoading } =
 *     usePaginatedQuery('trips', fetchTrips, { limit: 20 });
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface UsePaginatedQueryOptions {
  /** Items per page (default: 20, max: 50) */
  limit?: number;
  /** Initial page (default: 1) */
  initialPage?: number;
  /** Whether to prefetch the next page for instant navigation */
  prefetchNext?: boolean;
  /** Disable the query (e.g. while waiting for auth) */
  enabled?: boolean;
}

type FetchFn<T> = (page: number, limit: number) => Promise<PaginatedResult<T>>;

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 20,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export function usePaginatedQuery<T>(
  key: string,
  fetchFn: FetchFn<T>,
  options: UsePaginatedQueryOptions = {},
) {
  const {
    limit = 20,
    initialPage = 1,
    prefetchNext = true,
    enabled = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache keyed by `key` — resets on key change (new search)
  const pageCache = useRef(new Map<number, PaginatedResult<T>>());
  const prevKey = useRef(key);

  // Reset cache and page when key changes
  useEffect(() => {
    if (prevKey.current !== key) {
      prevKey.current = key;
      pageCache.current.clear();
      setPage(initialPage);
      setData([]);
      setPagination(EMPTY_PAGINATION);
      setError(null);
    }
  }, [key, initialPage]);

  const fetchPage = useCallback(
    async (targetPage: number) => {
      if (!enabled) return;

      // Check cache first
      const cached = pageCache.current.get(targetPage);
      if (cached) {
        setData(cached.data);
        setPagination(cached.pagination);
        setPage(targetPage);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFn(targetPage, limit);
        pageCache.current.set(targetPage, result);

        setData(result.data);
        setPagination(result.pagination);
        setPage(targetPage);

        // Prefetch next page in background
        if (prefetchNext && result.pagination.hasNextPage) {
          const next = targetPage + 1;
          if (!pageCache.current.has(next)) {
            fetchFn(next, limit)
              .then((r) => pageCache.current.set(next, r))
              .catch(() => {}); // Silent prefetch failure
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fetch failed'));
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn, limit, prefetchNext, enabled],
  );

  // Initial fetch (and re-fetch when key resets)
  useEffect(() => {
    if (enabled) fetchPage(initialPage);
  }, [fetchPage, initialPage, key, enabled]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) fetchPage(page + 1);
  }, [page, pagination.hasNextPage, fetchPage]);

  const prevPage = useCallback(() => {
    if (page > 1) fetchPage(page - 1);
  }, [page, fetchPage]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage >= 1 && targetPage <= pagination.totalPages) {
        fetchPage(targetPage);
      }
    },
    [pagination.totalPages, fetchPage],
  );

  const refresh = useCallback(() => {
    pageCache.current.clear();
    fetchPage(page);
  }, [page, fetchPage]);

  return {
    data,
    page,
    pagination,
    isLoading,
    error,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
}
