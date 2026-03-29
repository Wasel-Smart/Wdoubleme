/**
 * E2E Tests - Critical User Journeys
 * Testing complete flows from signup to trip completion
 */

import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full ride booking flow', async ({ page }) => {
    // 1. Land on homepage
    await expect(page).toHaveTitle(/Wasel/);
    
    // 2. Click Get Started
    await page.click('text=Get Started');
    
    // 3. Sign up
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@wassel.app`);
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    
    // 4. Wait for dashboard
    await page.waitForURL('**/app/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // 5. Navigate to Find Ride
    await page.click('text=Find Ride');
    await page.waitForURL('**/app/find-ride');
    
    // 6. Enter trip details
    await page.fill('input[placeholder*="From"]', 'Abdoun, Amman');
    await page.fill('input[placeholder*="To"]', 'Rainbow Street, Amman');
    await page.fill('input[type="date"]', '2026-02-15');
    await page.selectOption('select[name="seats"]', '1');
    
    // 7. Search for rides
    await page.click('button:has-text("Search Rides")');
    
    // 8. Wait for results
    await page.waitForSelector('.trip-card', { timeout: 5000 });
    
    // 9. Book first available ride
    await page.click('.trip-card >> button:has-text("Book")');
    
    // 10. Confirm booking
    await expect(page.locator('.booking-confirmation')).toBeVisible();
    await page.click('button:has-text("Confirm Booking")');
    
    // 11. Verify success message
    await expect(page.locator('.success-message')).toContainText('Booking confirmed');
  });

  test('should handle payment flow', async ({ page }) => {
    // Prerequisite: User is logged in with a pending booking
    await page.goto('/app/payments');
    
    // 1. Select payment method
    await page.click('text=Add Card');
    
    // 2. Enter card details (Stripe test mode)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
    await stripeFrame.locator('input[name="exp-date"]').fill('12/28');
    await stripeFrame.locator('input[name="cvc"]').fill('123');
    await stripeFrame.locator('input[name="postal"]').fill('11118');
    
    // 3. Submit payment
    await page.click('button:has-text("Pay Now")');
    
    // 4. Wait for confirmation
    await expect(page.locator('.payment-success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.payment-success')).toContainText('Payment successful');
  });

  test('should complete driver acceptance flow', async ({ page }) => {
    // Driver user journey
    await page.goto('/app/driver-dashboard');
    
    // 1. Go online
    await page.click('[data-testid="toggle-online"]');
    await expect(page.locator('.status-indicator')).toHaveClass(/online/);
    
    // 2. Wait for ride request
    await page.waitForSelector('.ride-request', { timeout: 30000 });
    
    // 3. Accept ride
    await page.click('.ride-request >> button:has-text("Accept")');
    
    // 4. Verify navigation to active trip
    await page.waitForURL('**/app/driver-active-trip');
    await expect(page.locator('h1')).toContainText('Active Trip');
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Test network failure
    await page.route('**/api/**', route => route.abort());
    await page.goto('/app/find-ride');
    
    await page.fill('input[placeholder*="From"]', 'Test Location');
    await page.click('button:has-text("Search")');
    
    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText(/failed|error/i);
  });
});

test.describe('Authentication Flows', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    // Switch to login tab
    await page.click('text=Login');
    
    // Enter credentials
    await page.fill('input[name="email"]', 'test@wassel.app');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/app/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Login');
    
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText(/invalid|incorrect/i);
  });

  test('should handle OAuth login', async ({ page }) => {
    await page.goto('/auth');
    
    // Click Google login
    await page.click('button:has-text("Continue with Google")');
    
    // Should redirect to Google (or show popup)
    // Note: Full OAuth testing requires mock server
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });
});

test.describe('Performance & Accessibility', () => {
  test('should load homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should work with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate somewhere
    await expect(page).not.toHaveURL('/');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  });

  test('should display mobile menu', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // Mobile menu button should be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Desktop sidebar should be hidden
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
  });

  test('should work with touch gestures', async ({ page }) => {
    await page.goto('/app/find-ride');
    
    // Simulate swipe gesture
    await page.touchscreen.tap(100, 100);
    await page.touchscreen.tap(300, 100);
    
    // Component should respond to touch
    await expect(page.locator('.touch-active')).toBeVisible();
  });
});

test.describe('Offline Functionality', () => {
  test('should show offline indicator', async ({ page, context }) => {
    await page.goto('/app/dashboard');
    
    // Simulate offline
    await context.setOffline(true);
    
    // Should show offline message
    await expect(page.locator('.offline-indicator')).toBeVisible();
    await expect(page.locator('.offline-indicator')).toContainText(/offline/i);
  });

  test('should cache critical resources', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Should still load (from cache)
    await expect(page.locator('body')).toBeVisible();
  });
});