import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'

export const CARD_FUNDED_LNURLP: Card = {
  hash: 'unitTestCardFunded',
  created: new Date(),
  set: null,
}

export const LNURLP: LnurlP = {
  lnbitsId: 'unitTestLnurlpId',
  created: new Date(),
  expiresAt: null,
  finished: new Date(),
}

export const CARD_VERSION_FUNDED_LNURLP: CardVersion = {
  id: 'unitTestCardVersionFunded',
  card: CARD_FUNDED_LNURLP.hash,
  created: new Date(),
  lnurlP: LNURLP.lnbitsId,
  lnurlW: null,
  textForWithdraw: 'some text',
  noteForStatusPage: 'some note',
  sharedFunding: false,
  landingPageViewed: null,
}

export const INVOICE: Invoice = {
  amount: 100,
  paymentHash: 'unitTestPaymentHash1',
  paymentRequest: 'unitTestpaymentRequest1',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_INVOICE: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_FUNDED_LNURLP.id,
  invoice: INVOICE.paymentHash,
}
