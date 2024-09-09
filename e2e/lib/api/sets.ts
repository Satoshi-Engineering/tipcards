// load the global Cypress types
/// <reference types="cypress" />

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'
import { generateSet } from '@e2e/lib/api/data/sets'
import tipCardsApi from '../tipCardsApi'

const API_SET = new URL('/api/set', BACKEND_API_ORIGIN)

export const generateAndAddRandomSet = (name?: string) => {
  tipCardsApi.auth.isLoggedIn()

  cy.get('@accessToken').then(function () {
    const set = generateSet()
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
}
