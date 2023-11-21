import '../../../mocks/process.env'
import {
  addData,
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
  updateCardVesion,
  insertOrUpdateInvoice,
  insertOrUpdateCardVersionInvoice,
} from '../mocks/queries'

import { createCard, createCardVersion, createInvoice } from '../../../../drizzleData'
import { createCard as createRedisCard, createInvoice as createRedisInvoice } from '../../../../redisData'

import { updateCard } from '@backend/database/drizzle/queriesRedis'

describe('updateCard', () => {
  it('should update text and note and landingPageViewed', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.text = 'some super text'
    cardRedis.note = 'some crazy note'
    cardRedis.landingPageViewed = + new Date() / 1000
    const invoiceRedis = createRedisInvoice(100)
    invoiceRedis.payment_hash = invoice.paymentHash
    invoiceRedis.payment_request = invoice.paymentRequest
    cardRedis.invoice = invoiceRedis

    await updateCard(cardRedis)
    expect(insertCards).not.toHaveBeenCalled()
    expect(insertCardVersions).not.toHaveBeenCalled()
    expect(insertInvoices).not.toHaveBeenCalled()
    expect(insertCardVersionInvoices).not.toHaveBeenCalled()
    expect(insertLnurlPs).not.toHaveBeenCalled()
    expect(insertLnurlWs).not.toHaveBeenCalled()
    expect(updateCardVesion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion.id,
      card: card.hash,
      textForWithdraw: 'some super text',
      noteForStatusPage: 'some crazy note',
      landingPageViewed: expect.any(Date),
    }))
    expect(insertOrUpdateInvoice).toHaveBeenCalledTimes(1)
    expect(insertOrUpdateCardVersionInvoice).toHaveBeenCalledTimes(1)
  })
})
