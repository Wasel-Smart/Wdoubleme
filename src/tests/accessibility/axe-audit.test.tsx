import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router';
import { SkipToContent } from '../../components/SkipToContent';
import { AuthPage } from '../../components/AuthPage';
import { LanguageProvider } from '../../contexts/LanguageContext';

vi.mock('motion/react', () => {
  const makeMotionComponent = (tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...props }: any) => {
      const {
        animate,
        exit,
        initial,
        layout,
        transition,
        viewport,
        whileHover,
        whileTap,
        whileInView,
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, key: string) => makeMotionComponent(key as keyof JSX.IntrinsicElements),
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      // JSDOM does not compute layout or color reliably, so keep this for browser-level audits.
      'color-contrast': { enabled: false },
    },
  });

  if (results.violations.length > 0) {
    const messages = results.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join('\n');
    throw new Error(messages);
  }
}

describe('Accessibility', () => {
  it('keeps the skip link accessible', async () => {
    const { container } = render(<SkipToContent targetId="main-content" />);

    expect(screen.getByText(/skip to main content/i)).toHaveAttribute('href', '#main-content');
    await expectNoAxeViolations(container);
  });

  it('renders the auth page without critical axe violations', { timeout: 15000 }, async () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthPage />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();

    await expectNoAxeViolations(container);
  });
});
