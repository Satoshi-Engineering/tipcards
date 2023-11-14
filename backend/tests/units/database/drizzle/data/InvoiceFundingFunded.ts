import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'

export const CARD_INVOICE_FUNDING_FUNDED: Card = {
  hash: 'unitTestCardInvoiceFundingFunded',
  created: new Date(),
  set: null,
}

export const LNURL_W_FOR_INVOICE_FUNDING_FUNDED: LnurlW = {
  lnbitsId: 'unitTestInvoiceFundingFundedLnbitsId',
  created: new Date(),
  expiresAt: new Date(),
  withdrawn: null,
}

export const CARD_VERSION_INVOICE_FUNDING_FUNDED: CardVersion = {
  id: 'unitTestCardVersionInvoiceFundingFunded',
  card: CARD_INVOICE_FUNDING_FUNDED.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: LNURL_W_FOR_INVOICE_FUNDING_FUNDED.lnbitsId,
  textForWithdraw: 'unitTestCardVersionInvoiceFundingFunded text',
  noteForStatusPage: 'unitTestCardVersionInvoiceFundingFunded note',
  sharedFunding: false,
  landingPageViewed: null,
}

export const INVOICE_FOR_INVOICE_FUNDING_FUNDED: Invoice = {
  amount: 123,
  paymentHash: 'unitTestInvoiceFundingFundedPaymentHash',
  paymentRequest: 'unitTestInvoiceFundingFundedPaymentRequest',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_INVOICE_FOR_INVOICE_FUNDING_FUNDED: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_INVOICE_FUNDING_FUNDED.id,
  invoice: INVOICE_FOR_INVOICE_FUNDING_FUNDED.paymentHash,
}
