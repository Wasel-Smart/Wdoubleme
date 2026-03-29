import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Landing Page - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('landing-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Landing Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('landing-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Landing Page - Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('landing-tablet.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Auth Page - Light Mode', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Ensure light mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });

    await expect(page).toHaveScreenshot('auth-light.png', {
      maxDiffPixels: 100,
    });
  });

  test('Auth Page - Dark Mode', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Enable dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });

    await page.waitForTimeout(500); // Wait for theme transition

    await expect(page).toHaveScreenshot('auth-dark.png', {
      maxDiffPixels: 100,
    });
  });

  test('Dashboard - Rider View', async ({ page }) => {
    // Login as rider
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('Test123456!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('dashboard-rider.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('Services Grid - All Categories', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Wait for all images to load
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every((img) => img.complete);
    });

    await expect(page).toHaveScreenshot('services-grid.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('Modal - Ride Details', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('Test123456!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate to find ride
    await page.getByRole('link', { name: /find ride/i }).click();

    // Search for ride
    await page.getByPlaceholder(/from/i).fill('Amman');
    await page.getByPlaceholder(/to/i).fill('Dead Sea');
    await page.getByRole('button', { name: /search/i }).click();

    // Open ride details
    await page.locator('.ride-card').first().click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"]');

    await expect(page).toHaveScreenshot('modal-ride-details.png', {
      maxDiffPixels: 100,
    });
  });

  test('Empty State - No Trips', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('newuser@example.com');
    await page.getByPlaceholder(/password/i).fill('Test123456!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate to trips
    await page.getByRole('link', { name: /my trips/i }).click();

    await expect(page).toHaveScreenshot('empty-state-trips.png', {
      maxDiffPixels: 50,
    });
  });

  test('Loading States', async ({ page }) => {
    // Capture loading spinner
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.loading-spinner')).toBeVisible();

    await expect(page).toHaveScreenshot('loading-state.png', {
      maxDiffPixels: 50,
    });
  });

  test('Error State - 404', async ({ page }) => {
    await page.goto('/non-existent-route');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('error-404.png', {
      maxDiffPixels: 50,
    });
  });

  test('Responsive Navigation - Mobile Menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();

    await expect(page).toHaveScreenshot('mobile-menu-open.png', {
      maxDiffPixels: 100,
    });
  });

  test('Form Validation - Error States', async ({ page }) => {
    await page.goto('/auth');

    // Trigger validation errors
    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByPlaceholder(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForTimeout(500); // Wait for validation

    await expect(page).toHaveScreenshot('form-validation-errors.png', {
      maxDiffPixels: 100,
    });
  });

  test('Arabic RTL Layout', async ({ page }) => {
    await page.goto('/');

    // Switch to Arabic
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('button', { name: /عربي/i }).click();

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('arabic-rtl-layout.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('Admin Dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('admin@wassel.com');
    await page.getByPlaceholder(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('admin-dashboard.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('Charts and Graphs', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('Test123456!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate to analytics
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('charts-and-graphs.png', {
      fullPage: true,
      maxDiffPixels: 300, // Charts may have slight variations
    });
  });

  test('Map Component', async ({ page }) => {
    await page.goto('/find-ride');

    // Wait for map to load
    await page.waitForSelector('.google-map', { timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for tiles to load

    await expect(page).toHaveScreenshot('map-component.png', {
      maxDiffPixels: 500, // Maps have more variance
    });
  });

  test('Notification Toast', async ({ page }) => {
    await page.goto('/');

    // Trigger a notification
    await page.evaluate(() => {
      // @ts-ignore
      window.showToast?.('Success!', 'Your action was completed successfully.');
    });

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('notification-toast.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Animation and Interaction Tests', () => {
  test('Button Hover States', async ({ page }) => {
    await page.goto('/');

    const button = page.getByRole('button', { name: /get started/i }).first();

    // Hover over button
    await button.hover();
    await page.waitForTimeout(300); // Wait for hover transition

    await expect(page).toHaveScreenshot('button-hover.png', {
      maxDiffPixels: 50,
    });
  });

  test('Card Hover Effects', async ({ page }) => {
    await page.goto('/services');

    const card = page.locator('.service-card').first();

    await card.hover();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('card-hover.png', {
      maxDiffPixels: 100,
    });
  });

  test('Modal Open Animation', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Capture mid-animation
    await page.waitForTimeout(150);

    await expect(page).toHaveScreenshot('modal-opening.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Cross-Browser Visual Tests', () => {
  test('Chrome vs Firefox - Landing Page', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`landing-${browserName}.png`, {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('Chrome vs Firefox - Dashboard', async ({ page, browserName }) => {
    // Login
    await page.goto('/auth');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('Test123456!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`dashboard-${browserName}.png`, {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });
});
