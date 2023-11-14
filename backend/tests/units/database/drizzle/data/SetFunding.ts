import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'

export const CARD_SET_FUNDING_1: Card = {
  hash: 'unitTestCardSetFunding1',
  created: new Date(),
  set: null,
}

export const CARD_SET_FUNDING_2: Card = {
  hash: 'unitTestCardSetFunding2',
  created: new Date(),
  set: null,
}

export const CARD_VERSION_SET_FUNDING_1: CardVersion = {
  id: 'unitTestCardVersionSetFunding1',
  card: CARD_SET_FUNDING_1.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: 'unitTestCardVersionSetFunding1 text',
  noteForStatusPage: 'unitTestCardVersionSetFunding1 note',
  sharedFunding: false,
  landingPageViewed: null,
}

export const CARD_VERSION_SET_FUNDING_2: CardVersion = {
  id: 'unitTestCardVersionSetFunding2',
  card: CARD_SET_FUNDING_2.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: 'unitTestCardVersionSetFunding2 text',
  noteForStatusPage: 'unitTestCardVersionSetFunding2 note',
  sharedFunding: false,
  landingPageViewed: null,
}

export const INVOICE_FOR_SET_FUNDING: Invoice = {
  amount: 300,
  paymentHash: 'unitTestInvoiceSetFundingPaymentHash',
  paymentRequest: 'unitTestInvoiceSetFundingPaymentRequest',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_INVOICE_FOR_SET_FUNDING_1: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_SET_FUNDING_1.id,
  invoice: INVOICE_FOR_SET_FUNDING.paymentHash,
}

export const CARD_VERSION_INVOICE_FOR_SET_FUNDING_2: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_SET_FUNDING_2.id,
  invoice: INVOICE_FOR_SET_FUNDING.paymentHash,
}
