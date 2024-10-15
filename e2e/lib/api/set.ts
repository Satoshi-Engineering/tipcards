// load the global Cypress types
/// <reference types="cypress" />

import { generateSet } from '@e2e/lib/api/data/set'
import { paySetInvoice } from '@e2e/lib/api/lnbitsWallet'
import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

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

export const createInvoiceForSet = (
  setId: string,
  amountPerCard = 210,
  cards = 8,
) =>
  cy.request({
    url: `${API_SET.href}/invoice/${setId}`,
    method: 'POST',
    body: {
      amountPerCard,
      cardIndices: [...new Array(cards).keys()],
    },
  })

export const fundSet = (
  setId: string,
  amountPerCard = 210,
  cards = 8,
) => {
  createInvoiceForSet(setId, amountPerCard, cards).then((response) => {
    const invoice = response.body.data.invoice.payment_request
    paySetInvoice(setId, invoice)
  })
}
