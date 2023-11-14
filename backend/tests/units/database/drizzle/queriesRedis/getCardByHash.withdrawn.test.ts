import '../../../mocks/process.env'
import { createAndAddCard, createAndAddCardVersion, createAndAddInvoice, createAndAddLnurlW } from '../mocks/data'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash withdrawn card', () => {
  it('should set the used flag', async () => {
    const card = createAndAddCard()
    const cardVersion = createAndAddCardVersion(card)
    const invoice = createAndAddInvoice(200, cardVersion)
    invoice.paid = new Date()
    const lnurlw = createAndAddLnurlW(cardVersion)
    cardVersion.landingPageViewed = new Date()
    lnurlw.withdrawn = new Date()

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: invoice.amount,
        payment_hash: invoice.paymentHash,
        payment_request: invoice.paymentRequest,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: lnurlw.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: false,
      used: expect.any(Number),
    }))
  })
})
