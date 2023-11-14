import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'

export const CARD_SHARED_FUNDING_FINISHED: Card = {
  hash: 'unitTestSharedFundingFinishedCard',
  created: new Date(),
  set: null,
}

export const LNURLP_SHARED_FUNDING_FINISHED: LnurlP = {
  lnbitsId: 'unitTestSharedFundingFinishedLnurlp',
  created: new Date(),
  expiresAt: null,
  finished: new Date(),
}

export const LNURL_W_SHARED_FUNDING_FINISHED: LnurlW = {
  lnbitsId: 'unitTestSharedFundingFinishedLnbitsId',
  created: new Date(),
  expiresAt: new Date(),
  withdrawn: null,
}

export const CARD_VERSION_SHARED_FUNDING_FINISHED: CardVersion = {
  id: 'unitTestSharedFundingFinishedCardVersion',
  card: CARD_SHARED_FUNDING_FINISHED.hash,
  created: new Date(),
  lnurlP: LNURLP_SHARED_FUNDING_FINISHED.lnbitsId,
  lnurlW: LNURL_W_SHARED_FUNDING_FINISHED.lnbitsId,
  textForWithdraw: 'some text',
  noteForStatusPage: 'some note',
  sharedFunding: true,
  landingPageViewed: new Date(),
}

export const INVOICE_SHARED_FUNDING_FINISHED_1: Invoice = {
  amount: 100,
  paymentHash: 'unitTestSharedFundingFinishedPaymentHash1',
  paymentRequest: 'unitTestSharedFundingFinishedPaymentRequest1',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const INVOICE_SHARED_FUNDING_FINISHED_2: Invoice = {
  amount: 200,
  paymentHash: 'unitTestSharedFundingFinishedPaymentHash2',
  paymentRequest: 'unitTestSharedFundingFinishedPaymentRequest2',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_INVOICE_SHARED_FUNDING_FINISHED_1: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_SHARED_FUNDING_FINISHED.id,
  invoice: INVOICE_SHARED_FUNDING_FINISHED_1.paymentHash,
}

export const CARD_VERSION_INVOICE_SHARED_FUNDING_FINISHED_2: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_SHARED_FUNDING_FINISHED.id,
  invoice: INVOICE_SHARED_FUNDING_FINISHED_2.paymentHash,
}
