// load the global Cypress types
/// <reference types="cypress" />

import { BACKEND_API_ORIGIN } from '../../../lib/constants'

const API_REFRESH = new URL('/api/auth/refresh', BACKEND_API_ORIGIN)

Cypress.Commands.add('login', (value) => {
  const refreshResult = cy.request({
    url: API_REFRESH.href,
    failOnStatusCode: false,
  })
  refreshResult.its('status').should('eq', 401)
  cy.log('Logging in with value:', value)
})
