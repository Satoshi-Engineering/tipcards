// load the global Cypress types
/// <reference types="cypress" />

import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

const API_CYPRESS_CREATE_AUTH_KEYS = new URL('/auth/api/cypress/createRandomPublicPrivateKeyPairAsHex', TIPCARDS_AUTH_ORIGIN)
const API_AUTH_CREATE = new URL('/auth/api/cypress/lnurlAuth/create', TIPCARDS_AUTH_ORIGIN)
const API_AUTH_LOGIN = new URL('/auth/api/cypress/loginWithLnurlAuthHash', TIPCARDS_AUTH_ORIGIN)
const API_AUTH_REFRESH = new URL('/api/auth/refresh', TIPCARDS_AUTH_ORIGIN)

export const login = () => {
  createAndWrapLNURLAuth()

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
      url: `${API_AUTH_LOGIN.href}/${authServiceLoginHash}`,
    }).then((response) => {
      expect(response.body).to.have.nested.property('data.accessToken')
      cy.wrap(response.body.data.accessToken).as('accessToken')
    })
    cy.getCookie('refresh_token', {
      domain: TIPCARDS_AUTH_ORIGIN.hostname,
    }).should('exist')
  })
}

export const refresh = () => {
  cy.request({
    url: `${API_AUTH_REFRESH.href}`,
  }).then((response) => {
    expect(response.body).to.have.nested.property('data.accessToken')
    cy.wrap(response.body.data.accessToken).as('accessToken')
  })
}

export const isLoggedInViaCypress = () => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).should('exist')
  cy.get('@accessToken').should('exist')
}

export const isLoggedOut = () => {
  cy.getCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  }).should('not.exist')
}

export const clearAuth = () => {
  cy.clearCookie('refresh_token', {
    domain: TIPCARDS_AUTH_ORIGIN.hostname,
  })
  cy.request({
    url: `${API_AUTH_REFRESH.href}`,
    failOnStatusCode: false,
  }).its('status').should('eq', 401)
}

export const createAndWrapLNURLAuth = () => {
  // Due to the numerous errors caused by importing the crypto libraries in the Cypress browser, the private/public key generation was shifted to the backend.
  cy.request({
    url: API_CYPRESS_CREATE_AUTH_KEYS.href,
  }).then((response) => {
    expect(response.body).to.have.nested.property('data.publicKeyAsHex')
    expect(response.body).to.have.nested.property('data.privateKeyAsHex')

    const publicKeyAsHex = response.body.data.publicKeyAsHex
    const privateKeyAsHex = response.body.data.privateKeyAsHex

    const lnurlAuth = new LNURLAuth({
      publicKeyAsHex,
      privateKeyAsHex,
    })
    cy.wrap(lnurlAuth).as('lnurlAuth')
  })
}
