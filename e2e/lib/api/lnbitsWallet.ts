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
