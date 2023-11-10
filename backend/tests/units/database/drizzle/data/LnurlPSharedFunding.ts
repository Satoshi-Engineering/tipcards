import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'

export const CARD_SHARED_FUNDING: Card = {
  hash: 'unitTestSharedFundingCard',
  created: new Date(),
  set: null,
}

export const LNURLP_SHARED_FUNDING: LnurlP = {
  lnbitsId: 'unitTestSharedFundingLnurlp',
  created: new Date(),
  expiresAt: null,
}

export const CARD_VERSION_SHARED_FUNDING: CardVersion = {
  id: 'unitTestSharedFundingCardVersion',
  card: CARD_SHARED_FUNDING.hash,
  created: new Date(),
  lnurlP: LNURLP_SHARED_FUNDING.lnbitsId,
  lnurlW: null,
  textForWithdraw: 'some text',
  noteForStatusPage: 'some note',
  sharedFunding: true,
  landingPageViewed: null,
}

export const INVOICE_SHARED_FUNDING_1: Invoice = {
  amount: 100,
  paymentHash: 'unitTestSharedFundingPaymentHash1',
  paymentRequest: 'unitTestSharedFundingPaymentRequest1',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const INVOICE_SHARED_FUNDING_2: Invoice = {
  amount: 200,
  paymentHash: 'unitTestSharedFundingPaymentHash2',
  paymentRequest: 'unitTestSharedFundingPaymentRequest2',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_INVOICE_SHARED_FUNDING_1: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_SHARED_FUNDING.id,
  invoice: INVOICE_SHARED_FUNDING_1.paymentHash,
}

export const CARD_VERSION_INVOICE_SHARED_FUNDING_2: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_SHARED_FUNDING.id,
  invoice: INVOICE_SHARED_FUNDING_2.paymentHash,
}
