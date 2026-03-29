/**
 * SkipToContent — Bypass block for keyboard / screen-reader users (WCAG 2.4.1).
 *
 * Covers:
 *  - Renders a link that targets #main-content
 *  - Visually hidden by default (sr-only class)
 *  - Accepts a custom targetId prop
 *  - Contains meaningful text for assistive tech
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipToContent } from '../../../components/SkipToContent';

describe('SkipToContent', () => {
  it('renders a link to #main-content by default', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('accepts a custom targetId', () => {
    render(<SkipToContent targetId="app-body" />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#app-body');
  });

  it('is visually hidden (has sr-only class)', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link.className).toContain('sr-only');
  });

  it('is an anchor element (navigable via Tab)', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link.tagName).toBe('A');
  });
});
