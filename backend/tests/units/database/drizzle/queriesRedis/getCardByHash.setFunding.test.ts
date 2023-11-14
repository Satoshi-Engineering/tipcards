import '../../../mocks/process.env'
import { createAndAddCard, createAndAddCardVersion, createAndAddInvoice } from '../mocks/data'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash', () => {
  it('should return a set funded card', async () => {
    const card1 = createAndAddCard()
    const cardVersion1 = createAndAddCardVersion(card1)
    const card2 = createAndAddCard()
    const cardVersion2 = createAndAddCardVersion(card2)
    const invoice = createAndAddInvoice(500, cardVersion1, cardVersion2)
    invoice.paid = new Date()

    const cardRedis = await getCardByHash(card1.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card1.hash,
      text: cardVersion1.textForWithdraw,
      note: cardVersion1.noteForStatusPage,
      invoice: null,
      lnurlp: null,
      setFunding: expect.objectContaining({
        amount: 250,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
