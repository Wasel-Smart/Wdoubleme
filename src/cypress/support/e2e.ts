// Cypress E2E Test Support File
import './commands';

// Disable service worker for testing
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

// Global before hook
before(() => {
  cy.log('Starting E2E test suite');
});

// Global after hook
after(() => {
  cy.log('E2E test suite completed');
});

// Handle uncaught exceptions
Cy.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  
  // Ignore network errors in development
  if (err.message.includes('Network') || err.message.includes('fetch')) {
    return false;
  }
  
  return true;
});
