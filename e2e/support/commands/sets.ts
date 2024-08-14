// load the global Cypress types
/// <reference types="cypress" />

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'
import { setData } from '@e2e/lib/setsHelpers'

const API_SET = new URL('/api/set', BACKEND_API_ORIGIN)

Cypress.Commands.add('addSet', (name?: string) => {
  cy.getCookie('refresh_token').should('exist')
  cy.get('@accessToken').should('exist')

  cy.get('@accessToken').then(function () {
    const set = setData.generateSet()
    set.settings.setName = name || set.settings.setName

    cy.request({
      url: `${API_SET.href}/${set.id}/`,
      method: 'POST',
      body: set,
      headers: {
        Authorization: this.accessToken,
      },
    })
  })
})
