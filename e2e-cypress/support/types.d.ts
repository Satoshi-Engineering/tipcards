// describe custom Cypress commands in this file

// load the global Cypress types
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-test attribute.
     *
     * @example cy.getTestElement('headline')
     */
    getTestElement(value: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to select check if the body has a specific test attribute indicating that a trpc subscription was started.
     * This is needed as a stream cannot be intercepted using cy.intercept.
     *
     * @example cy.waitForSubscription('card-status')
     */
    waitForSubscription(value: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
  }
}
