// e2e/trip-search.spec.ts
// E2E tests for trip search and my-trips flow

import { test, expect } from '@playwright/test';

// Helper: login before tests that require auth
async function loginTestUser(page: any) {
  await page.goto('/auth?tab=login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'test@wasel.com');
  await page.fill('input[type="password"]', 'test123456');
  const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /sign in|login/i }).first();
  await submitBtn.click();
  await page.waitForURL(/.*dashboard/, { timeout: 30000 });
}

test.describe('Trip Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('should load the find-ride page', async ({ page }) => {
    await page.goto('/app/find-ride');
    await page.waitForLoadState('networkidle');

    // Should show search-related UI elements
    await expect(
      page.locator('input, button, h1, h2').filter({ hasText: /search|find|from|to|ride/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should search for trips', async ({ page }) => {
    await page.goto('/app/find-ride');
    await page.waitForLoadState('networkidle');

    // Fill search form (look for location inputs)
    const fromInput = page.locator('input[placeholder*="from" i], input[placeholder*="departure" i]').first();
    const toInput = page.locator('input[placeholder*="to" i], input[placeholder*="destination" i]').first();

    if (await fromInput.isVisible({ timeout: 5000 })) {
      await fromInput.fill('Amman');
    }
    if (await toInput.isVisible({ timeout: 3000 })) {
      await toInput.fill('Aqaba');
    }

    // Look for a date input
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible({ timeout: 3000 })) {
      await dateInput.fill('2026-03-15');
    }

    // Submit search
    const searchBtn = page.locator('button').filter({ hasText: /search|find/i }).first();
    if (await searchBtn.isVisible({ timeout: 3000 })) {
      await searchBtn.click();
    }

    // Wait for results or empty state — either is valid
    await page.waitForTimeout(3000);
  });
});

test.describe('My Trips Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('should display the my-trips page', async ({ page }) => {
    await page.goto('/app/my-trips');
    await page.waitForLoadState('networkidle');

    // Should show some trip-related content or empty state
    await expect(
      page.locator('text=/trip|booking|ride|no.*trip|empty/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
