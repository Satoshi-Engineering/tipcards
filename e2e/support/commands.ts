// load the global Cypress types
/// <reference types="cypress" />

/**
 * Adds custom command "cy.getTestElement" to the global "cy" object
 *
 * @example cy.getTestElement('headline')
 */
Cypress.Commands.add('getTestElement', (value, options) => cy.get(`[data-test=${value}]`, options))

Cypress.Commands.add('wrapClipboardValue', () => {
  cy.window().then(win => {
    win.navigator.clipboard.readText().then(text => {
      cy.wrap(text).as('clipboard')
      //expect(text).to.eq(value)
    })
  })
})
// the types for the custom commands will be defined in "types.d.ts" file
