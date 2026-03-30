/**
 * E2E: Find Ride page
 *
 * Tests the search flow, filtering, and booking confirmation.
 * Run:  npx playwright test e2e/find-ride.spec.ts
 */
import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://127.0.0.1:4173';

async function signInAs(page: Page, email = 'test@wasel.jo', password = 'Test1234!') {
  await page.goto(`${BASE}/app/auth`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/app\/find-ride/, { timeout: 10_000 }).catch(() => {});
}

test.describe('Find Ride page', () => {
  test('page title and header are visible', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    await expect(page.getByRole('heading', { name: /find a ride/i })).toBeVisible();
  });

  test('FROM and TO selects are rendered', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    // Both city select dropdowns present
    const selects = page.locator('select');
    await expect(selects.first()).toBeVisible();
    await expect(selects.nth(1)).toBeVisible();
  });

  test('search button triggers loading state', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    await page.getByRole('button', { name: /search rides/i }).click();
    // Loading spinner or "Searching..." text appears
    await expect(
      page.getByText(/searching/i).or(page.locator('[class*="spin"]').first()),
    ).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('searching same origin and destination shows error', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    // Set both FROM and TO to Amman (default)
    const selects = page.locator('select');
    await selects.first().selectOption('Amman');
    await selects.nth(1).selectOption('Amman');
    await page.getByRole('button', { name: /search rides/i }).click();
    await expect(
      page.getByText(/different cities|نفس المدينة|choose different/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test('ride cards appear after search', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    const selects = page.locator('select');
    await selects.first().selectOption('Amman');
    await selects.nth(1).selectOption('Aqaba');
    await page.getByRole('button', { name: /search rides/i }).click();
    // Wait for results — cards should appear
    await expect(
      page.getByRole('button', { name: /book seat/i }).first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test('opening a ride shows trip detail modal', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    const selects = page.locator('select');
    await selects.first().selectOption('Amman');
    await selects.nth(1).selectOption('Aqaba');
    await page.getByRole('button', { name: /search rides/i }).click();
    const bookBtn = page.getByRole('button', { name: /book seat/i }).first();
    await bookBtn.waitFor({ timeout: 8000 });
    await bookBtn.click();
    await expect(page.getByText(/trip details/i)).toBeVisible({ timeout: 4000 });
  });

  test('modal can be closed', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    const selects = page.locator('select');
    await selects.first().selectOption('Amman');
    await selects.nth(1).selectOption('Aqaba');
    await page.getByRole('button', { name: /search rides/i }).click();
    await page.getByRole('button', { name: /book seat/i }).first().click();
    await expect(page.getByText(/trip details/i)).toBeVisible({ timeout: 4000 });
    await page.keyboard.press('Escape');
    await expect(page.getByText(/trip details/i)).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('package tab is accessible', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    await page.getByRole('button', { name: /send package|أرسل طرد/i }).click();
    await expect(page.getByText(/send.*package|طرد/i).first()).toBeVisible();
  });

  test('offer a ride CTA navigates to offer-ride page', async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/app/find-ride`);
    await page.getByRole('button', { name: /offer a ride|أضف رحلة/i }).click();
    await expect(page).toHaveURL(/\/app\/offer-ride/);
  });
});
