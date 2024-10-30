// load the global Cypress types
/// <reference types="cypress" />

/**
 * Custom command to select DOM element by data-test attribute.
 *
 * @example cy.getTestElement('headline')
 */
Cypress.Commands.add('getTestElement', (value, options) => cy.get(`[data-test=${value}]`, options))

/**
 * Custom command to select check if the body has a specific test attribute indicating that a trpc subscription was started.
 * This is needed as a stream cannot be intercepted using cy.intercept.
 *
 * @example cy.waitForSubscription('card-status')
 */
Cypress.Commands.add('waitForSubscription', (value, options) => cy.get(`body[data-test-${value}-subscription=started]`, options))

// the types for the custom commands will be defined in "types.d.ts" file
