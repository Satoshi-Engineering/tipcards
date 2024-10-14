import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

import {
  BACKEND_API_ORIGIN,
  LNBITS_ORIGIN,
  LNBITS_ADMIN_KEY,
} from '@e2e/lib/constants'

const API_INVOICE = new URL('/api/invoice', BACKEND_API_ORIGIN)

export const payInvoice = (cardHash: string, invoice: string) => {
  cy.request({
    url: `${LNBITS_ORIGIN}/api/v1/payments`,
    method: 'POST',
    body: {
      out: true,
      bolt11: invoice,
    },
    headers: {
      'X-Api-Key': LNBITS_ADMIN_KEY,
    },
  })
  cy.request({
    url: `${API_INVOICE.href}/paid/${cardHash}`,
    method: 'POST',
  })
}

export const withdrawAllSatsFromLnurlWithdrawRequest = (lnurlWithdrawRequest: LNURLWithdrawRequest) => {
  const amount = Math.floor(lnurlWithdrawRequest.maxWithdrawable / 1000)
  createInvoice(amount).then((invoice) => {
    const url = createUrlForLnurlWithdrawRequest(lnurlWithdrawRequest, invoice)
    cy.request(url)
  })
}

export const createInvoice = (amount: number) =>
  cy.request({
    url: `${LNBITS_ORIGIN}/api/v1/payments`,
    method: 'POST',
    body: {
      out: false,
      memo: '',
      amount,
    },
    headers: {
      'X-Api-Key': LNBITS_ADMIN_KEY,
    },
  }).then((response) => response.body.payment_request)

export const createUrlForLnurlWithdrawRequest = (lnurlWithdrawRequest: LNURLWithdrawRequest, invoice: string) => {
  const parameterGlue = lnurlWithdrawRequest.callback.includes('?') ? '&' : '?'
  return `${lnurlWithdrawRequest.callback}${parameterGlue}k1=${lnurlWithdrawRequest.k1}&pr=${invoice}`
}
