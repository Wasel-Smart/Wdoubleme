/**
 * E2E: Wallet access
 *
 * Tests wallet route protection and redirect behavior.
 * Run:  npx playwright test e2e/wallet.spec.ts
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:4173';

test.describe('Wallet access', () => {
  test('unauthenticated wallet access redirects to auth', async ({ page }) => {
    await page.goto(`${BASE}/app/wallet`);
    await expect(page).toHaveURL(/\/app\/auth/);
  });

  test('wallet redirect preserves the intended return destination', async ({ page }) => {
    await page.goto(`${BASE}/app/wallet`);
    await expect(page).toHaveURL(/returnTo=(%2Fapp%2Fwallet|\/app\/wallet)/);
  });

  test('redirected auth page still exposes accessible sign-in controls', async ({ page }) => {
    await page.goto(`${BASE}/app/wallet`);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /submit sign in/i })).toBeVisible();
  });
});
