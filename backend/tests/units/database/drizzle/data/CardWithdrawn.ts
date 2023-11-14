import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'

export const CARD: Card = {
  hash: 'unitTestCardWithdrawnCardHash',
  created: new Date(),
  set: null,
}

export const INVOICE: Invoice = {
  amount: 123,
  paymentHash: 'unitTestCardWithdrawnInvoicePaymentHash',
  paymentRequest: 'unitTestCardWithdrawnInvoicePaymentRequest',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const LNURL_W: LnurlW = {
  lnbitsId: 'unitTestCardWithdrawnLnurlWLnbitsId',
  created: new Date(),
  expiresAt: new Date(),
  withdrawn: new Date(),
}

export const CARD_VERSION: CardVersion = {
  id: 'unitTestCardWithdrawnCardVersionId',
  card: CARD.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: LNURL_W.lnbitsId,
  textForWithdraw: 'unitTestCardWithdrawnCardVersionId text',
  noteForStatusPage: 'unitTestCardWithdrawnCardVersionId note',
  sharedFunding: false,
  landingPageViewed: new Date(),
}

export const CARD_VERSION_INVOICE: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION.id,
  invoice: INVOICE.paymentHash,
}
