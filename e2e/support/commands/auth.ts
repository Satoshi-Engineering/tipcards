// load the global Cypress types
/// <reference types="cypress" />

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

const API_AUTH_REFRESH = new URL('/api/auth/refresh', BACKEND_API_ORIGIN)
const API_AUTH_CREATE = new URL('/api/auth/create', BACKEND_API_ORIGIN)
//const API_AUTH_STATUS = new URL('/api/auth/status', BACKEND_API_ORIGIN)

const publicKeyAsHex = '0294dc30a0d9656e36dde32ecac5cc62d094cb6fc1c586646e026dcf828639ebcf'
const privateKeyAsHex = 'f5e5c719e487b6fa44c5d16563a1f9f814b775238a2b92343761f000efa76791'

const lnurlAuth = new LNURLAuth({
  publicKeyAsHex: publicKeyAsHex,
  privateKeyAsHex: privateKeyAsHex,
})

Cypress.Commands.add('login', () => {
  const refreshResponse = cy.request({
    url: API_AUTH_REFRESH.href,
    failOnStatusCode: false,
  })
  refreshResponse.its('status').should('eq', 401)

  cy.request({
    url: API_AUTH_CREATE.href,
  }).then((response) => {
    expect(response.body).to.have.nested.property('data.hash')
    const authServiceLoginHash = response.body.data.hash
    const lnurl = response.body.data.encoded
    cy.log('authServiceLoginHash', authServiceLoginHash)
    cy.log('lnurl', lnurl)
    const url = lnurlAuth.getValidLoginUrlFromLNURLAuth(lnurl)
    cy.log('url', JSON.stringify(url))
  })
})
