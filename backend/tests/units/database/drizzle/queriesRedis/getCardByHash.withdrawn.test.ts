import '../../../mocks/process.env'
import { addCardVersions, addInvoices, addCardVersionInvoices, addLnurlWs } from '../mocks/queries'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

import {
  CARD_VERSION,
  INVOICE,
  CARD_VERSION_INVOICE,
  LNURL_W,
} from '../data/CardWithdrawn'

describe('getCardByHash withdrawn card', () => {
  it('should set the used flag', async () => {
    addCardVersions(CARD_VERSION)
    addInvoices(INVOICE)
    addCardVersionInvoices(CARD_VERSION_INVOICE)
    addLnurlWs(LNURL_W)

    const card = await getCardByHash(CARD_VERSION.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION.card,
      text: CARD_VERSION.textForWithdraw,
      note: CARD_VERSION.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: INVOICE.amount,
        payment_hash: INVOICE.paymentHash,
        payment_request: INVOICE.paymentRequest,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: LNURL_W.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: false,
      used: expect.any(Number),
    }))
  })
})
