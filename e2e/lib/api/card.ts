// load the global Cypress types
/// <reference types="cypress" />

import { CardStatusDto } from '@shared/data/trpc/CardStatusDto'
import LNURL from '@shared/modules/LNURL/LNURL'
import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

import { payInvoice, withdrawAllSatsFromLnurlWithdrawRequest } from '@e2e/lib/api/lnbitsWallet'

const API_INVOICE = new URL('/api/invoice', BACKEND_API_ORIGIN)
const API_LNURL = new URL('/api/lnurl', BACKEND_API_ORIGIN)
const API_WITHDRAW = new URL('/api/withdraw', BACKEND_API_ORIGIN)
const API_LNURLP = new URL('/api/lnurlp', BACKEND_API_ORIGIN)

export const fundCardWithInvoice = (cardHash: CardStatusDto['hash'], amount: number) => {
  createInvoiceForCardHash(cardHash, amount).then((response) => {
    const invoice = response.body.data
    payInvoice(invoice)
    callInvoicePaidHookForCard(cardHash)
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

export const callInvoicePaidHookForCard = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_INVOICE.href}/paid/${cardHash}`,
    method: 'POST',
  })

export const createLnurlpLinkForCardHash = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_LNURL.href}/${cardHash}`,
    method: 'GET',
  })

export const createSharedFundingForCardHash = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_LNURLP.href}/create/${cardHash}`,
    method: 'POST',
  }).then((response) => response.body.data)

export const useFundedCard = (cardHash: CardStatusDto['hash']) => {
  withdrawAllSatsFromCard(cardHash)
  callWithdrawUsedHookForCard(cardHash)
}

export const withdrawAllSatsFromCard = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_LNURL.href}/${cardHash}`,
    method: 'GET',
  }).then((response) => {
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.body)
    withdrawAllSatsFromLnurlWithdrawRequest(lnurlWithdrawRequest)
  })

export const useLnurlWithdraw = (cardHash: CardStatusDto['hash'], lnurlEncoded: string) => {
  withdrawAllSatsFromLnurlWithdraw(lnurlEncoded)
  callWithdrawUsedHookForCard(cardHash)
}

export const withdrawAllSatsFromLnurlWithdraw = (lnurlEncoded: string) => {
  const lnurl = LNURL.decode(lnurlEncoded)
  cy.request({
    url: lnurl,
    method: 'GET',
  }).then((response) => {
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.body)
    withdrawAllSatsFromLnurlWithdrawRequest(lnurlWithdrawRequest)
  })
}

// this hook is usually called by lnbits,
// but as we do not expose the backend (inside the testing pipeline)
// to lnbits we need to call it manually
export const callWithdrawUsedHookForCard = (cardHash: CardStatusDto['hash']) =>
  cy.request({
    url: `${API_WITHDRAW.href}/used/${cardHash}`,
    method: 'POST',
  })
