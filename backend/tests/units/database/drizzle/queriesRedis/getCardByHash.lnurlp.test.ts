import '../../../mocks/process.env'
import { createAndAddCard, createAndAddCardVersion, createAndAddInvoice, createAndAddLnurlP } from '../mocks/data'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash lnurlp funding', () => {
  it('should return a card funded by lnurlp', async () => {
    const card = createAndAddCard()
    const cardVersion = createAndAddCardVersion(card)
    createAndAddLnurlP(cardVersion)
    const invoice = createAndAddInvoice(500, cardVersion)
    invoice.paid = new Date()

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: 500,
        payment_hash: expect.arrayContaining([invoice.paymentHash]),
        shared: false,
      }),
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
