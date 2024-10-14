// load the global Cypress types
/// <reference types="cypress" />

import { CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'
import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

import { payCardInvoice, withdrawAllSatsFromLnurlWithdrawRequest } from '@e2e/lib/api/lnbitsWallet'

const API_INVOICE = new URL('/api/invoice', BACKEND_API_ORIGIN)
const API_LNURL = new URL('/api/lnurl', BACKEND_API_ORIGIN)
const API_WITHDRAW = new URL('/api/withdraw', BACKEND_API_ORIGIN)

export const fundCardWithInvoice = (cardHash: CardStatusDto['hash'], amount: number) => {
  createInvoiceForCardHash(cardHash, amount).then((response) => {
    const invoice = response.body.data
    payCardInvoice(cardHash, invoice)
  })
}

export const createInvoiceForCardHash = (cardHash: CardStatusDto['hash'], amount: number) =>
  cy.request({
    url: `${API_INVOICE.href}/create/${cardHash}`,
    method: 'POST',
    body: {
      amount,
      text: 'Have fun with testing!',
    },
  })

export const createLnurlpLinkForCardHash = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_LNURL.href}/${cardHash}`,
    method: 'GET',
  })

export const withdrawAllSatsFromCard = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_LNURL.href}/${cardHash}`,
    method: 'GET',
  }).then((response) => {
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.body)
    withdrawAllSatsFromLnurlWithdrawRequest(lnurlWithdrawRequest)
    cy.request({
      url: `${API_WITHDRAW.href}/used/${cardHash}`,
      method: 'POST',
    })
  })
