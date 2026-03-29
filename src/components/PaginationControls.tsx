/**
 * PaginationControls — Accessible pagination component.
 *
 * WCAG compliant with:
 *  - nav landmark with aria-label
 *  - aria-current="page" on active page
 *  - Disabled state on first/last boundaries
 *  - Keyboard navigable
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationMeta } from '../hooks/usePaginatedQuery';

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({ pagination, onPageChange, isLoading }: PaginationControlsProps) {
  const { page, totalPages, totalCount, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  // Generate visible page numbers (show max 5 pages around current)
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 mt-6">
      {/* Item count */}
      <p className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
        Page {page} of {totalPages} ({totalCount} results)
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || isLoading}
          aria-label="Go to first page"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
          aria-label="Go to previous page"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {start > 1 && <span className="px-1 text-gray-400">…</span>}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={isLoading}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={`min-w-[2.25rem] h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary text-white shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="px-1 text-gray-400">…</span>}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          aria-label="Go to next page"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          aria-label="Go to last page"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
