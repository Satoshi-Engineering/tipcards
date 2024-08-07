// load the global Cypress types
/// <reference types="cypress" />

/**
 * Adds custom command "cy.getTestElement" to the global "cy" object
 *
 * @example cy.getTestElement('headline')
 */
Cypress.Commands.add('getTestElement', (value) => cy.get(`[data-test=${value}]`))

// the types for the custom commands will be defined in "types.d.ts" file
