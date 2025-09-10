// load the global Cypress types
/// <reference types="cypress" />

import { lnurlAuthLoginWithWrappedKeyPair } from '@e2e/lib/api/auth'

export const loginViaMainNav = () => {
  openModalLoginFromMainNav()
  loginViaModalLogin()
}

export const loginViaModalLogin = () => {
  cy.getTestElement('modal-login').should('exist')
  wrapLnurlAuthUrlFromModalLogin()
  lnurlAuthLoginWithWrappedKeyPair()
  closeModalLoginAfterSuccessfulLogin()
}

export const openModalLoginFromMainNav = () => {
  cy.getTestElement('the-layout').should('exist')
  cy.getTestElement('logged-in').should('not.exist')
  cy.getTestElement('the-header-main-nav-button').click()

  cy.getTestElement('main-nav-link-login').click()
  cy.getTestElement('modal-login').should('exist')
}

export const wrapLnurlAuthUrlFromModalLogin = () => {
  cy.get('[data-test=modal-login] [data-test=lightning-qr-code-image]')
    .should('have.attr', 'href')
    .and('match', /^lightning:.+/)
  cy.get('[data-test=modal-login] [data-test=lightning-qr-code-image]').then(($el) => {
    const lnurlAuthUrl = $el.attr('href').substring(10)
    cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
  })
}

export const closeModalLoginAfterSuccessfulLogin = () => {
  cy.get('[data-test=modal-login] [data-test=lightning-qr-code-image-success]').should('exist')
  cy.getTestElement('modal-login-close-button').click()
  cy.getTestElement('modal-login').should('not.exist')
}
