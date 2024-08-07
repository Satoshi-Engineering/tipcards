// describe custom Cypress commands in this file

// load the global Cypress types
/// <reference types="cypress" />
/// <reference types="./commands/auth" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-test attribute.
     * @example cy.getTestElement('headline')
     */
    getTestElement(value: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
  }
}
