/**
 * PaginationControls — Accessible pagination UI tests.
 *
 * Covers:
 *  - Renders page numbers and navigation buttons
 *  - First/Last buttons disabled on boundaries
 *  - Active page has aria-current="page"
 *  - Calls onPageChange with correct page number
 *  - Hidden when totalPages <= 1
 *  - Displays result count
 *  - All buttons have aria-labels
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaginationControls } from '../../../components/PaginationControls';
import type { PaginationMeta } from '../../../hooks/usePaginatedQuery';

const basePagination: PaginationMeta = {
  page: 3,
  limit: 20,
  totalCount: 95,
  totalPages: 5,
  hasNextPage: true,
  hasPrevPage: true,
};

describe('PaginationControls', () => {
  it('renders page numbers around current page', () => {
    render(<PaginationControls pagination={basePagination} onPageChange={vi.fn()} />);

    // Should show pages 1-5 (since totalPages=5 and page=3 with window of ±2)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('marks current page with aria-current="page"', () => {
    render(<PaginationControls pagination={basePagination} onPageChange={vi.fn()} />);

    const currentPage = screen.getByText('3');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange when clicking a page number', () => {
    const onChange = vi.fn();
    render(<PaginationControls pagination={basePagination} onPageChange={onChange} />);

    fireEvent.click(screen.getByText('5'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('calls onPageChange for next/prev buttons', () => {
    const onChange = vi.fn();
    render(<PaginationControls pagination={basePagination} onPageChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(onChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByLabelText('Go to previous page'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables previous buttons on page 1', () => {
    const firstPage: PaginationMeta = { ...basePagination, page: 1, hasPrevPage: false };
    render(<PaginationControls pagination={firstPage} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to first page')).toBeDisabled();
  });

  it('disables next buttons on last page', () => {
    const lastPage: PaginationMeta = { ...basePagination, page: 5, hasNextPage: false };
    render(<PaginationControls pagination={lastPage} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).toBeDisabled();
  });

  it('renders nothing when totalPages is 1', () => {
    const singlePage: PaginationMeta = {
      ...basePagination,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
    const { container } = render(
      <PaginationControls pagination={singlePage} onPageChange={vi.fn()} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('displays total result count', () => {
    render(<PaginationControls pagination={basePagination} onPageChange={vi.fn()} />);
    expect(screen.getByText(/95 results/)).toBeInTheDocument();
  });

  it('all navigation buttons have aria-label', () => {
    render(<PaginationControls pagination={basePagination} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
  });
});
