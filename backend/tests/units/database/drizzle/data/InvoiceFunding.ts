import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'

export const CARD_INVOICE_FUNDING: Card = {
  hash: 'unitTestCardInvoiceFunding',
  created: new Date(),
  set: null,
}

export const CARD_VERSION_INVOICE_FUNDING: CardVersion = {
  id: 'unitTestCardVersionInvoiceFunding',
  card: CARD_INVOICE_FUNDING.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: 'unitTestCardVersionInvoiceFunding text',
  noteForStatusPage: 'unitTestCardVersionInvoiceFunding note',
  sharedFunding: false,
  landingPageViewed: null,
}

export const INVOICE_FOR_INVOICE_FUNDING: Invoice = {
  amount: 123,
  paymentHash: 'unitTestInvoiceFundingPaymentHash',
  paymentRequest: 'unitTestInvoiceFundingPaymentRequest',
  created: new Date(),
  paid: null,
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_INVOICE_FOR_INVOICE_FUNDING: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_INVOICE_FUNDING.id,
  invoice: INVOICE_FOR_INVOICE_FUNDING.paymentHash,
}
