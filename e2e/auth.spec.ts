/**
 * E2E: Authentication flows
 *
 * Tests sign-in, sign-up, and auth guard redirects.
 * Run:  npx playwright test e2e/auth.spec.ts
 */
import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://127.0.0.1:4173';

async function fillSignIn(page: Page, email: string, password: string) {
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /submit sign in/i }).click();
}

test('find-ride redirects unauthenticated users into auth', async ({ page }) => {
  await page.goto(`${BASE}/app/find-ride`);
  await expect(page).toHaveURL(/returnTo=(%2Fapp%2Ffind-ride|\/app\/find-ride)/);
});

test('wallet auth guard preserves the returnTo param', async ({ page }) => {
  await page.goto(`${BASE}/app/wallet`);
  await expect(page).toHaveURL(/returnTo=(%2Fapp%2Fwallet|\/app\/wallet)/);
});

test('app entry redirects unauthenticated users into the auth flow', async ({ page }) => {
  await page.goto(`${BASE}/app`);
  await expect(page).toHaveURL(/\/app\/auth/);
  await expect(page.getByText(/welcome back|join wasel/i).first()).toBeVisible();
});

test('sign in page renders accessible form fields', async ({ page }) => {
  await page.goto(`${BASE}/app/auth`);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /submit sign in/i })).toBeVisible();
});

test('sign in with empty form shows validation feedback', async ({ page }) => {
  await page.goto(`${BASE}/app/auth`);
  await page.getByRole('button', { name: /submit sign in/i }).click();
  await expect(page.getByText(/please enter/i).first()).toBeVisible({ timeout: 3000 });
});

test('sign in with wrong credentials shows an error message', async ({ page }) => {
  await page.goto(`${BASE}/app/auth`);
  await fillSignIn(page, 'nonexistent@example.com', 'WrongPass99!');
  await expect(page.getByText(/invalid|incorrect|failed|error|wrong/i).first()).toBeVisible({ timeout: 8000 });
});

test('register tab is accessible from the sign-in page', async ({ page }) => {
  await page.goto(`${BASE}/app/auth?tab=register`);
  await expect(page.getByRole('button', { name: /submit create account/i })).toBeVisible();
});

test('unknown route renders the 404 page', async ({ page }) => {
  await page.goto(`${BASE}/app/this-route-does-not-exist-xyz`);
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByRole('link', { name: /back|home|wasel/i })).toBeVisible();
});
