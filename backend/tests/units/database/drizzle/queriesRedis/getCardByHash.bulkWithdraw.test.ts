import '../../../mocks/process.env'
import { addCardVersions, addInvoices, addCardVersionInvoices, addLnurlWs } from '../mocks/queries'

import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'
import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

export const LNURL_W: LnurlW = {
  lnbitsId: '',
  created: new Date(),
  expiresAt: new Date(),
  withdrawn: null,
}

export const CARD_1: Card = {
  hash: 'unitTestBulkWithdrawCardHash1',
  created: new Date(),
  set: null,
}

export const INVOICE_1: Invoice = {
  amount: 123,
  paymentHash: 'unitTestBulkWithdrawInvoicePaymentHash1',
  paymentRequest: 'unitTestBulkWithdrawInvoicePaymentRequest1',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_1: CardVersion = {
  id: 'unitTestBulkWithdrawCardVersionId1',
  card: CARD_1.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: LNURL_W.lnbitsId,
  textForWithdraw: 'unitTestBulkWithdrawCardVersionId1 text',
  noteForStatusPage: 'unitTestBulkWithdrawCardVersionId1 note',
  sharedFunding: false,
  landingPageViewed: new Date(),
}

export const CARD_VERSION_INVOICE_1: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_1.id,
  invoice: INVOICE_1.paymentHash,
}

export const CARD_2: Card = {
  hash: 'unitTestBulkWithdrawCardHash2',
  created: new Date(),
  set: null,
}

export const INVOICE_2: Invoice = {
  amount: 123,
  paymentHash: 'unitTestBulkWithdrawInvoicePaymentHash2',
  paymentRequest: 'unitTestBulkWithdrawInvoicePaymentRequest2',
  created: new Date(),
  paid: new Date(),
  expiresAt: new Date(),
  extra: '',
}

export const CARD_VERSION_2: CardVersion = {
  id: 'unitTestBulkWithdrawCardVersionId2',
  card: CARD_2.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: LNURL_W.lnbitsId,
  textForWithdraw: 'unitTestBulkWithdrawCardVersionId2 text',
  noteForStatusPage: 'unitTestBulkWithdrawCardVersionId2 note',
  sharedFunding: false,
  landingPageViewed: new Date(),
}

export const CARD_VERSION_INVOICE_2: CardVersionHasInvoice = {
  cardVersion: CARD_VERSION_2.id,
  invoice: INVOICE_2.paymentHash,
}

describe('getCardByHash withdrawn card', () => {
  it('should set the used flag', async () => {
    addCardVersions(CARD_VERSION_1, CARD_VERSION_2)
    addInvoices(INVOICE_1, INVOICE_2)
    addCardVersionInvoices(CARD_VERSION_INVOICE_1, CARD_VERSION_INVOICE_2)
    addLnurlWs(LNURL_W)

    const card = await getCardByHash(CARD_VERSION_1.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_1.card,
      text: CARD_VERSION_1.textForWithdraw,
      note: CARD_VERSION_1.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: INVOICE_1.amount,
        payment_hash: INVOICE_1.paymentHash,
        payment_request: INVOICE_1.paymentRequest,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: LNURL_W.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: true,
      used: null,
    }))
  })
})
