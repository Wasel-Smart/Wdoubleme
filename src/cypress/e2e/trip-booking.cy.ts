/**
 * Cypress E2E Test: Trip Booking Flow
 * Tests the complete trip search and booking process
 */

describe('Trip Booking Flow', () => {
  const testEmail = 'rider@wasel.app';
  const testPassword = 'Test@123456';

  beforeEach(() => {
    cy.login(testEmail, testPassword);
  });

  it('should search for available trips', () => {
    cy.visit('/find-ride');
    
    // Fill search form
    cy.get('input[name="origin"]').type('Amman');
    cy.get('input[name="destination"]').type('Zarqa');
    cy.get('input[type="date"]').type('2026-03-01');
    cy.get('button[type="submit"]').contains('Search').click();
    
    // Should display results
    cy.get('[data-testid="trip-card"]').should('have.length.greaterThan', 0);
  });

  it('should display trip details', () => {
    cy.visit('/find-ride');
    
    // Search for trips
    cy.get('input[name="origin"]').type('Amman');
    cy.get('input[name="destination"]').type('Zarqa');
    cy.get('button[type="submit"]').click();
    
    // Click on first trip
    cy.get('[data-testid="trip-card"]').first().click();
    
    // Should show trip details modal/page
    cy.contains('Trip Details').should('be.visible');
    cy.contains('Price').should('be.visible');
    cy.contains('Available Seats').should('be.visible');
  });

  it('should book a trip', () => {
    cy.visit('/find-ride');
    
    // Search and select trip
    cy.get('input[name="origin"]').type('Amman');
    cy.get('input[name="destination"]').type('Zarqa');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="trip-card"]').first().click();
    
    // Book trip
    cy.get('button').contains('Book Now').click();
    
    // Should redirect to payment
    cy.url().should('include', '/payment');
  });

  it('should filter trips by price', () => {
    cy.visit('/find-ride');
    
    // Search
    cy.get('input[name="origin"]').type('Amman');
    cy.get('input[name="destination"]').type('Zarqa');
    cy.get('button[type="submit"]').click();
    
    // Apply price filter
    cy.get('[data-testid="price-filter-min"]').clear().type('5');
    cy.get('[data-testid="price-filter-max"]').clear().type('15');
    cy.get('button').contains('Apply Filters').click();
    
    // Check all prices are within range
    cy.get('[data-testid="trip-price"]').each(($price) => {
      const price = parseFloat($price.text().replace(/[^0-9.]/g, ''));
      expect(price).to.be.gte(5);
      expect(price).to.be.lte(15);
    });
  });

  it('should show trip on map', () => {
    cy.visit('/find-ride');
    
    // Search
    cy.get('input[name="origin"]').type('Amman');
    cy.get('input[name="destination"]').type('Zarqa');
    cy.get('button[type="submit"]').click();
    
    // Click map view
    cy.get('[data-testid="map-view-toggle"]').click();
    
    // Should show map
    cy.get('[data-testid="map-container"]').should('be.visible');
  });

  it('should view booking history', () => {
    cy.visit('/my-trips');
    
    // Should show trips
    cy.contains('My Trips').should('be.visible');
    cy.get('[data-testid="booking-item"]').should('have.length.greaterThan', 0);
  });

  it('should cancel a booking', () => {
    cy.visit('/my-trips');
    
    // Find upcoming trip
    cy.get('[data-testid="booking-item"]')
      .contains('Upcoming')
      .parents('[data-testid="booking-item"]')
      .within(() => {
        cy.get('button').contains('Cancel').click();
      });
    
    // Confirm cancellation
    cy.get('[data-testid="confirm-cancel"]').click();
    
    // Should show success message
    cy.contains('Booking cancelled').should('be.visible');
  });
});
