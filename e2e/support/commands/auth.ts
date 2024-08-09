// load the global Cypress types
/// <reference types="cypress" />

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

const API_AUTH_CREATE = new URL('/api/auth/create', BACKEND_API_ORIGIN)
const API_AUTH_STATUS = new URL('/api/auth/status', BACKEND_API_ORIGIN)

Cypress.Commands.add('login', () => {
  cy.fixture('keys.json').then((keys) => {
    const lnurlAuth = new LNURLAuth({
      publicKeyAsHex: keys.publicKeyAsHex,
      privateKeyAsHex: keys.privateKeyAsHex,
    })
    cy.wrap(lnurlAuth).as('lnurlAuth')
  })

  cy.request({
    url: API_AUTH_CREATE.href,
  }).then((response) => {
    expect(response.body).to.have.nested.property('data.hash')
    const authServiceLoginHash = response.body.data.hash
    const lnurl = response.body.data.encoded

    cy.get('@lnurlAuth').then(function () {
      const LNURLAuthCallbackUrl = this.lnurlAuth.getLNURLAuthCallbackUrl(lnurl)
      cy.request({
        url: LNURLAuthCallbackUrl.href,
      }).its('status').should('eq', 200)
    })

    cy.request({
      url: `${API_AUTH_STATUS.href}/${authServiceLoginHash}`,
    }).then((response) => {
      expect(response.body).to.have.nested.property('data.accessToken')
    })
    cy.getCookie('refresh_token').should('exist')
  })
})
