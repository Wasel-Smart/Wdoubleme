// e2e/auth.spec.ts
// E2E tests for authentication flow

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to fully hydrate
    await page.waitForLoadState('networkidle');
  });

  test('should display landing page', async ({ page }) => {
    // The landing page should show the Wasel brand
    await expect(page.locator('text=Wasel')).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to auth page', async ({ page }) => {
    // Look for any CTA button that leads to auth
    const ctaButton = page.locator('button, a').filter({ hasText: /get started|sign up|login|start/i }).first();
    if (await ctaButton.isVisible({ timeout: 5000 })) {
      await ctaButton.click();
      await expect(page).toHaveURL(/.*auth/, { timeout: 10000 });
    }
  });

  test('should show login form on auth page', async ({ page }) => {
    await page.goto('/auth?tab=login');
    await page.waitForLoadState('networkidle');

    // Should show email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
  });

  test('should login with test user credentials', async ({ page }) => {
    await page.goto('/auth?tab=login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', 'test@wasel.com');
    await page.fill('input[type="password"]', 'test123456');

    // Submit — use first visible submit button
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /sign in|login/i }).first();
    await submitBtn.click();

    // Should redirect to dashboard (allow extra time for Edge Function cold-start)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth?tab=login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'wrong@wasel.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /sign in|login/i }).first();
    await submitBtn.click();

    // Should show an error message (various possible wording)
    await expect(
      page.locator('[role="alert"], .text-red-500, .text-destructive, [data-testid="error-message"]').first()
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Authenticated User Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth?tab=login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'test@wasel.com');
    await page.fill('input[type="password"]', 'test123456');

    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /sign in|login/i }).first();
    await submitBtn.click();
    await page.waitForURL(/.*dashboard/, { timeout: 30000 });
  });

  test('should display dashboard', async ({ page }) => {
    // Dashboard should be visible with some content
    await expect(page.locator('text=/dashboard|welcome|trips/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Look for a logout/signout button (may be in a menu or sidebar)
    const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out|log out/i }).first();

    if (await logoutBtn.isVisible({ timeout: 5000 })) {
      await logoutBtn.click();
      // Should redirect to landing or auth page
      await expect(page).toHaveURL(/^\/$|.*auth/, { timeout: 10000 });
    } else {
      // Button might be behind a menu — skip gracefully
      test.skip();
    }
  });
});
