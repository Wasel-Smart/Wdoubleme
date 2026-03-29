// Custom Cypress Commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      registerUser(email: string, password: string, firstName: string, lastName: string): Chainable<void>;
      switchLanguage(language: 'en' | 'ar'): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Register user command
Cypress.Commands.add('registerUser', (email: string, password: string, firstName: string, lastName: string) => {
  cy.visit('/signup');
  cy.get('input[name="firstName"]').type(firstName);
  cy.get('input[name="lastName"]').type(lastName);
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Switch language command
Cypress.Commands.add('switchLanguage', (language: 'en' | 'ar') => {
  cy.get('[data-testid="language-switcher"]').click();
  cy.get(`[data-testid="language-${language}"]`).click();
  cy.get('html').should('have.attr', 'dir', language === 'ar' ? 'rtl' : 'ltr');
});

export {};
