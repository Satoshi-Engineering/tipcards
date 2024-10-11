// load the global Cypress types
/// <reference types="cypress" />

import { CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

const API_INVOICE = new URL('/api/invoice', BACKEND_API_ORIGIN)

export const createInvoiceForCardHash = (cardHash: CardStatusDto['hash'], amount: number) => cy.request({
  url: `${API_INVOICE.href}/create/${cardHash}`,
  method: 'POST',
  body: {
    amount,
    text: 'Have fun with testing!',
  },
})
