import { expect, test } from '@playwright/test';

test.describe('Wasel smoke journeys', () => {
  test('loads the landing page and exposes the core CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/wasel/i);
    await expect(page.getByRole('button', { name: /get started free/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /privacy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /terms/i })).toBeVisible();
  });

  test('opens the auth experience from its dedicated route', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });

  test('serves legal pages without crashing', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/legal/terms');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
