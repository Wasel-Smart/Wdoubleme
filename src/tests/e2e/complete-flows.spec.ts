/**
 * Comprehensive E2E Test Suite
 * Tests all critical user flows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'https://djccmatubyyudeosrngm.supabase.co';

// Test data
const testRider = {
  email: 'test.rider@wasel.app',
  password: 'Test123!@#',
  fullName: 'Test Rider',
  phone: '+962791234567'
};

const testDriver = {
  email: 'test.driver@wasel.app',
  password: 'Test123!@#',
  fullName: 'Test Driver',
  phone: '+962797654321'
};

test.describe('Rider Flow', () => {
  test('should complete full rider journey', async ({ page }) => {
    // 1. Sign up
    await page.goto(`${BASE_URL}/signup`);
    await page.fill('[name="email"]', testRider.email);
    await page.fill('[name="password"]', testRider.password);
    await page.fill('[name="fullName"]', testRider.fullName);
    await page.click('[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/verify-email');
    expect(page.url()).toContain('/verify-email');

    // 2. Complete profile (skip email verification for test)
    await page.goto(`${BASE_URL}/profile`);
    await page.fill('[name="phone"]', testRider.phone);
    await page.click('[data-testid="save-profile"]');
    await expect(page.locator('.toast-success')).toBeVisible();

    // 3. Add payment method
    await page.goto(`${BASE_URL}/payments`);
    await page.click('[data-testid="add-payment"]');
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');
    await page.click('[data-testid="save-card"]');
    await expect(page.locator('.payment-method')).toBeVisible();

    // 4. Book a ride
    await page.goto(`${BASE_URL}/book`);
    await page.fill('[data-testid="pickup-input"]', 'Amman, Jordan');
    await page.fill('[data-testid="dropoff-input"]', 'Dead Sea, Jordan');
    await page.waitForTimeout(1000); // Wait for autocomplete
    await page.click('[data-testid="vehicle-sedan"]');
    await page.click('[data-testid="request-ride"]');

    // 5. Wait for driver
    await expect(page.locator('[data-testid="finding-driver"]')).toBeVisible();
    await page.waitForSelector('[data-testid="driver-assigned"]', { timeout: 10000 });

    // 6. Track trip
    await expect(page.locator('[data-testid="driver-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="eta"]')).toContainText(/\d+ min/);

    // 7. Complete trip (simulate)
    await page.evaluate(() => {
      // This would be triggered by backend in real scenario
      window.dispatchEvent(new CustomEvent('trip-completed', { 
        detail: { fare: 15.50 } 
      }));
    });

    await page.waitForSelector('[data-testid="trip-completed"]');
    await expect(page.locator('[data-testid="final-fare"]')).toContainText('15.50');

    // 8. Rate driver
    await page.click('[data-testid="star-5"]');
    await page.fill('[data-testid="review-text"]', 'Great driver!');
    await page.click('[data-testid="submit-rating"]');
    await expect(page.locator('.toast-success')).toContainText('Thank you');

    // 9. View trip history
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('.trip-card').first()).toBeVisible();
    await expect(page.locator('.trip-card').first()).toContainText('Dead Sea');
  });

  test('should apply promo code', async ({ page }) => {
    await page.goto(`${BASE_URL}/book`);
    await page.fill('[data-testid="pickup-input"]', 'Amman, Jordan');
    await page.fill('[data-testid="dropoff-input"]', 'Zarqa, Jordan');
    
    // Apply promo
    await page.click('[data-testid="apply-promo"]');
    await page.fill('[data-testid="promo-input"]', 'FIRST20');
    await page.click('[data-testid="apply-button"]');
    
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="promo-applied"]')).toContainText('FIRST20');
  });
});

test.describe('Driver Flow', () => {
  test('should complete driver onboarding', async ({ page }) => {
    // 1. Sign up as driver
    await page.goto(`${BASE_URL}/driver-signup`);
    await page.fill('[name="email"]', testDriver.email);
    await page.fill('[name="password"]', testDriver.password);
    await page.fill('[name="fullName"]', testDriver.fullName);
    await page.fill('[name="phone"]', testDriver.phone);
    await page.click('[type="submit"]');

    // 2. Upload documents
    await page.waitForURL('**/driver-onboarding');
    
    const licenseInput = await page.locator('[data-testid="license-upload"]');
    await licenseInput.setInputFiles('./tests/fixtures/sample-license.jpg');
    await expect(page.locator('[data-testid="license-preview"]')).toBeVisible();

    await page.fill('[name="licenseNumber"]', 'DL123456789');
    await page.fill('[name="licenseExpiry"]', '2026-12-31');

    // 3. Add vehicle
    await page.click('[data-testid="next-step"]');
    await page.fill('[name="make"]', 'Toyota');
    await page.fill('[name="model"]', 'Camry');
    await page.fill('[name="year"]', '2020');
    await page.fill('[name="color"]', 'White');
    await page.fill('[name="licensePlate"]', 'ABC123');

    const vehiclePhoto = await page.locator('[data-testid="vehicle-photo"]');
    await vehiclePhoto.setInputFiles('./tests/fixtures/sample-vehicle.jpg');

    await page.click('[data-testid="submit-application"]');

    // 4. Wait for verification
    await expect(page.locator('.verification-pending')).toBeVisible();
    await expect(page.locator('.verification-message')).toContainText('under review');
  });

  test('should go online and accept trip', async ({ page, context }) => {
    // Login as driver
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', testDriver.email);
    await page.fill('[name="password"]', testDriver.password);
    await page.click('[type="submit"]');

    await page.waitForURL('**/driver-dashboard');

    // Go online
    await page.click('[data-testid="go-online"]');
    await expect(page.locator('[data-testid="status"]')).toContainText('Online');

    // Wait for trip request (simulate)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('trip-request', {
        detail: {
          tripId: 'test-trip-123',
          pickup: 'City Mall, Amman',
          fare: 10.50
        }
      }));
    });

    // Accept trip
    await expect(page.locator('[data-testid="trip-request-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="trip-fare"]')).toContainText('10.50');
    await page.click('[data-testid="accept-trip"]');

    // Navigate to pickup
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="trip-status"]')).toContainText('Going to pickup');

    // Arrive at pickup
    await page.click('[data-testid="arrived-pickup"]');
    await expect(page.locator('[data-testid="trip-status"]')).toContainText('Waiting for rider');

    // Start trip
    await page.click('[data-testid="start-trip"]');
    await expect(page.locator('[data-testid="trip-status"]')).toContainText('In progress');

    // Complete trip
    await page.click('[data-testid="complete-trip"]');
    await expect(page.locator('[data-testid="trip-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="earnings"]')).toContainText('10.50');
  });

  test('should view earnings', async ({ page }) => {
    await page.goto(`${BASE_URL}/driver-earnings`);
    
    await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="trip-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();

    // Filter by date
    await page.click('[data-testid="date-filter"]');
    await page.click('[data-testid="this-week"]');
    await expect(page.locator('.earnings-chart')).toBeVisible();
  });
});

test.describe('Payment Flow', () => {
  test('should process card payment', async ({ page }) => {
    // Book a ride
    await page.goto(`${BASE_URL}/book`);
    // ... ride booking steps ...

    // Trip completed, pay with card
    await page.click('[data-testid="pay-with-card"]');
    await page.click('[data-testid="confirm-payment"]');

    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
    await page.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
    await expect(page.locator('.receipt')).toBeVisible();
  });

  test('should process cash payment', async ({ page }) => {
    await page.goto(`${BASE_URL}/book`);
    // ... ride booking steps ...

    await page.click('[data-testid="payment-method-cash"]');
    await page.click('[data-testid="request-ride"]');

    // Complete trip
    await page.waitForSelector('[data-testid="trip-completed"]');
    await page.click('[data-testid="mark-paid-cash"]');
    await expect(page.locator('.payment-confirmed')).toBeVisible();
  });

  test('should split payment', async ({ page }) => {
    await page.goto(`${BASE_URL}/book`);
    // ... ride booking steps ...

    await page.click('[data-testid="split-payment"]');
    await page.fill('[data-testid="friend-email"]', 'friend@example.com');
    await page.fill('[data-testid="split-amount"]', '50'); // 50%
    await page.click('[data-testid="send-split-request"]');

    await expect(page.locator('.split-pending')).toContainText('Waiting for friend');
  });
});

test.describe('Chat', () => {
  test('should send and receive messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/active`);
    
    await page.click('[data-testid="open-chat"]');
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

    await page.fill('[data-testid="message-input"]', 'Hello, I am waiting at the entrance');
    await page.click('[data-testid="send-message"]');

    await expect(page.locator('.message-sent').last()).toContainText('Hello, I am waiting');

    // Simulate receiving message
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('message-received', {
        detail: { message: 'I see you, arriving in 2 minutes' }
      }));
    });

    await expect(page.locator('.message-received').last()).toContainText('I see you');
  });
});

test.describe('Admin Dashboard', () => {
  test('should approve driver', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/drivers`);
    
    await page.click('[data-testid="pending-drivers"]');
    await page.click('[data-testid="driver-row"]').first();
    
    await expect(page.locator('[data-testid="driver-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="license-image"]')).toBeVisible();
    
    await page.click('[data-testid="approve-driver"]');
    await page.fill('[data-testid="approval-notes"]', 'Documents verified');
    await page.click('[data-testid="confirm-approval"]');
    
    await expect(page.locator('.toast-success')).toContainText('Driver approved');
  });

  test('should view analytics', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);
    
    await expect(page.locator('[data-testid="total-trips"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
    
    await expect(page.locator('.analytics-chart')).toBeVisible();
  });
});

test.describe('API Integration', () => {
  test('should fetch nearby drivers', async ({ request }) => {
    const response = await request.get(`${API_URL}/functions/v1/server/drivers/nearby`, {
      params: {
        lat: 31.9454,
        lng: 35.9284,
        radius: 5
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.drivers)).toBeTruthy();
  });

  test('should calculate fare', async ({ request }) => {
    const response = await request.post(`${API_URL}/functions/v1/server/pricing/calculate`, {
      data: {
        pickup: { lat: 31.9454, lng: 35.9284 },
        dropoff: { lat: 31.9630, lng: 35.9300 },
        vehicleType: 'sedan'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.totalFare).toBeGreaterThan(0);
    expect(data.currency).toBe('JOD');
  });
});

test.describe('Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 seconds max
  });

  test('should handle map rendering', async ({ page }) => {
    await page.goto(`${BASE_URL}/book`);
    
    await page.waitForSelector('[data-testid="map-container"]');
    const map = await page.locator('[data-testid="map-container"]');
    
    await expect(map).toBeVisible();
    await expect(map.locator('canvas')).toBeVisible(); // Google Maps canvas
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    // Should navigate or trigger action
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/book`);
    
    const pickupInput = await page.locator('[data-testid="pickup-input"]');
    expect(await pickupInput.getAttribute('aria-label')).toBeTruthy();
    
    const requestButton = await page.locator('[data-testid="request-ride"]');
    expect(await requestButton.getAttribute('aria-label')).toBeTruthy();
  });
});

test.describe('Offline Handling', () => {
  test('should show offline message', async ({ page, context }) => {
    await page.goto(BASE_URL);
    
    await context.setOffline(true);
    await page.reload();
    
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-banner"]')).toContainText('offline');
  });
});

test.describe('Security', () => {
  test('should prevent unauthorized access', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    
    // Should redirect to login
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should sanitize inputs', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    await page.fill('[name="fullName"]', '<script>alert("xss")</script>');
    await page.click('[data-testid="save-profile"]');
    
    const savedName = await page.locator('[data-testid="display-name"]').textContent();
    expect(savedName).not.toContain('<script>');
  });
});
