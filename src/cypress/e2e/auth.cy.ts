/**
 * Cypress E2E Test: Authentication Flow
 * Tests signup, login, and logout functionality
 */

describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@wasel.app`;
  const testPassword = 'Test@123456';
  const testFirstName = 'أحمد';
  const testLastName = 'محمد';

  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the landing page', () => {
    cy.contains('Wasel').should('be.visible');
    cy.contains('واصل').should('be.visible');
  });

  it('should navigate to signup page', () => {
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('should register a new user', () => {
    cy.registerUser(testEmail, testPassword, testFirstName, testLastName);
    
    // Should redirect to dashboard after successful signup
    cy.url().should('not.include', '/signup');
    cy.url().should('include', '/dashboard');
  });

  it('should login with existing user', () => {
    cy.login(testEmail, testPassword);
    
    // Should see user name in dashboard
    cy.contains(testFirstName).should('be.visible');
  });

  it('should reject invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.login(testEmail, testPassword);
    cy.logout();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
  });

  it('should persist session after page refresh', () => {
    cy.login(testEmail, testPassword);
    cy.reload();
    
    // Should still be logged in
    cy.url().should('not.include', '/login');
    cy.contains(testFirstName).should('be.visible');
  });

  it('should validate password strength', () => {
    cy.visit('/signup');
    
    // Weak password
    cy.get('input[type="password"]').type('123');
    cy.contains('Weak').should('be.visible');
    
    // Strong password
    cy.get('input[type="password"]').clear().type('Strong@Pass123');
    cy.contains('Strong').should('be.visible');
  });

  it('should validate email format', () => {
    cy.visit('/signup');
    
    // Invalid email
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="email"]').blur();
    cy.contains('Invalid email').should('be.visible');
    
    // Valid email
    cy.get('input[type="email"]').clear().type('valid@example.com');
    cy.get('input[type="email"]').blur();
    cy.contains('Invalid email').should('not.exist');
  });
});
