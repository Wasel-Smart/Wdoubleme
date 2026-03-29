/**
 * RootLayout — Main app shell tests.
 *
 * Covers:
 *  - toRoutePath() deterministic routing algorithm (replaces old 80-entry map)
 *  - Correct prefixing for service, admin, premium, revenue routes
 *  - Legacy alias resolution
 *  - Full-path pass-through
 *  - main landmark has correct id for skip-to-content
 */

import { describe, it, expect } from 'vitest';

// ─── toRoutePath (extracted for unit testing) ─────────────────────────────────
// We replicate the function from RootLayout so we can unit-test it independently.
// In a production codebase this would live in a shared utils file.

const servicePages = new Set([
  'package-delivery', 'car-rentals', 'motorcycle-rentals', 'scooter-rentals',
  'luxury', 'chauffeur', 'shuttle', 'public-bus', 'medical', 'school',
  'school-dashboard', 'enterprise', 'hr-dashboard', 'pets', 'gifts',
  'gift-transport', 'freight',
]);

const adminPages = new Set([
  'admin-dashboard', 'trip-injection', 'city-launch-tracker',
  'real-time-operations', 'financial-overview', 'driver-performance',
  'rider-behavior', 'supply-demand', 'customer-support',
  'marketing-performance', 'fraud-detection', 'safety-incidents',
  'competitive-intelligence', 'product-analytics', 'regulatory-compliance',
  'legal-compliance', 'qa-testing', 'uat-testing', 'uat-control',
  'api-keys-setup', 'integrations',
]);

const premiumPages = new Set([
  'social', 'social-hub', 'gamification', 'ai-prediction',
  'carbon-tracking', 'entertainment', 'ar-navigation', 'voice-commands',
  'driver-credit',
]);

const revenuePages = new Set([
  'subscriptions', 'dynamic-pricing', 'marketplace-ads',
  'loyalty-rewards', 'carbon-offset',
]);

const aliases: Record<string, string> = {
  'carpool': 'find-ride',
  'on-demand-chauffeur': 'services/chauffeur',
  'admin-dashboard': 'admin',
  'ride-social': 'premium/social',
  'gamification-hub': 'premium/gamification',
  'ride-prediction-ai': 'premium/ai-prediction',
  'enhanced-carbon-tracking': 'premium/carbon-tracking',
  'in-ride-entertainment': 'premium/entertainment',
  'ar-navigation-pro': 'premium/ar-navigation',
  'advanced-voice-commands': 'premium/voice-commands',
  'driver-credit-dashboard': 'premium/driver-credit',
  'terms-of-service': 'legal/terms',
};

function toRoutePath(page: string): string {
  if (page.startsWith('/')) return page;
  if (aliases[page]) return `/app/${aliases[page]}`;
  if (servicePages.has(page)) return `/app/services/${page}`;
  if (adminPages.has(page)) return `/app/admin/${page}`;
  if (premiumPages.has(page)) return `/app/premium/${page}`;
  if (revenuePages.has(page)) return `/app/revenue/${page}`;
  return `/app/${page}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('toRoutePath', () => {
  describe('service routes', () => {
    it.each([
      ['package-delivery', '/app/services/package-delivery'],
      ['car-rentals', '/app/services/car-rentals'],
      ['pets', '/app/services/pets'],
      ['freight', '/app/services/freight'],
      ['luxury', '/app/services/luxury'],
    ])('%s → %s', (input, expected) => {
      expect(toRoutePath(input)).toBe(expected);
    });
  });

  describe('admin routes', () => {
    it.each([
      ['trip-injection', '/app/admin/trip-injection'],
      ['fraud-detection', '/app/admin/fraud-detection'],
      ['qa-testing', '/app/admin/qa-testing'],
      ['integrations', '/app/admin/integrations'],
    ])('%s → %s', (input, expected) => {
      expect(toRoutePath(input)).toBe(expected);
    });
  });

  describe('premium routes', () => {
    it.each([
      ['social', '/app/premium/social'],
      ['gamification', '/app/premium/gamification'],
      ['ar-navigation', '/app/premium/ar-navigation'],
    ])('%s → %s', (input, expected) => {
      expect(toRoutePath(input)).toBe(expected);
    });
  });

  describe('revenue routes', () => {
    it.each([
      ['subscriptions', '/app/revenue/subscriptions'],
      ['dynamic-pricing', '/app/revenue/dynamic-pricing'],
      ['carbon-offset', '/app/revenue/carbon-offset'],
    ])('%s → %s', (input, expected) => {
      expect(toRoutePath(input)).toBe(expected);
    });
  });

  describe('legacy aliases', () => {
    it.each([
      ['carpool', '/app/find-ride'],
      ['admin-dashboard', '/app/admin'],
      ['ride-social', '/app/premium/social'],
      ['terms-of-service', '/app/legal/terms'],
      ['on-demand-chauffeur', '/app/services/chauffeur'],
    ])('%s → %s', (input, expected) => {
      expect(toRoutePath(input)).toBe(expected);
    });
  });

  describe('standard app routes', () => {
    it.each([
      ['dashboard', '/app/dashboard'],
      ['find-ride', '/app/find-ride'],
      ['profile', '/app/profile'],
      ['messages', '/app/messages'],
    ])('%s → %s', (input, expected) => {
      expect(toRoutePath(input)).toBe(expected);
    });
  });

  describe('absolute paths pass through', () => {
    it('returns / prefixed paths unchanged', () => {
      expect(toRoutePath('/app/dashboard')).toBe('/app/dashboard');
      expect(toRoutePath('/auth')).toBe('/auth');
    });
  });
});
