import '../../../mocks/process.env'
import { createAndAddCard, createAndAddCardVersion, createAndAddInvoice, createAndAddLnurlP, createAndAddLnurlW } from '../mocks/data'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash shared funding', () => {
  it('should return a card funded by lnurlp shared funding', async () => {
    const card = createAndAddCard()
    const cardVersion = createAndAddCardVersion(card)
    createAndAddLnurlP(cardVersion)
    cardVersion.sharedFunding = true
    const invoice1 = createAndAddInvoice(300, cardVersion)
    invoice1.paid = new Date()
    const invoice2 = createAndAddInvoice(600, cardVersion)
    invoice2.paid = new Date()

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: 900,
        payment_hash: expect.arrayContaining([invoice1.paymentHash, invoice2.paymentHash]),
        shared: true,
        paid: null,
      }),
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })

  it('should set paid for shared funding when a withdraw link exists', async () => {
    const card = createAndAddCard()
    const cardVersion = createAndAddCardVersion(card)
    const lnurlp = createAndAddLnurlP(cardVersion)
    cardVersion.sharedFunding = true
    const invoice1 = createAndAddInvoice(400, cardVersion)
    invoice1.paid = new Date()
    const invoice2 = createAndAddInvoice(800, cardVersion)
    invoice2.paid = new Date()
    lnurlp.finished = new Date()
    const lnurlw = createAndAddLnurlW(cardVersion)
    cardVersion.landingPageViewed = new Date()

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: 1200,
        payment_hash: expect.arrayContaining([invoice1.paymentHash, invoice2.paymentHash]),
        shared: true,
        paid: expect.any(Number),
      }),
      setFunding: null,
      lnbitsWithdrawId: lnurlw.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
