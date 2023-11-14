import '../../../mocks/process.env'
import { createAndAddCard, createAndAddCardVersion, createAndAddInvoice, createAndAddLnurlW } from '../mocks/data'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash withdrawn card', () => {
  it('should set the used flag', async () => {
    const card1 = createAndAddCard()
    const cardVersion1 = createAndAddCardVersion(card1)
    const invoice1 = createAndAddInvoice(100, cardVersion1)
    cardVersion1.landingPageViewed = new Date()
    invoice1.paid = new Date()

    const card2 = createAndAddCard()
    const cardVersion2 = createAndAddCardVersion(card2)
    const invoice2 = createAndAddInvoice(200, cardVersion2)
    invoice2.paid = new Date()

    const lnurlw = createAndAddLnurlW(cardVersion1, cardVersion2)

    const card = await getCardByHash(card1.hash)

    expect(card).toEqual(expect.objectContaining({
      cardHash: card1.hash,
      text: cardVersion1.textForWithdraw,
      note: cardVersion1.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: invoice1.amount,
        payment_hash: invoice1.paymentHash,
        payment_request: invoice1.paymentRequest,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: lnurlw.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: true,
      used: null,
    }))
  })
})
