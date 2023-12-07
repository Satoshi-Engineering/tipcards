import '../../../mocks/process.env'
import { queries } from '../mocks/client'
import { addData } from '../mocks/database'

import { createCard, createCardVersion, createInvoice } from '../../../../drizzleData'
import { createCard as createRedisCard, createInvoice as createRedisInvoice } from '../../../../redisData'

import { updateCard } from '@backend/database/drizzle/queriesRedis'

describe('updateCard', () => {
  it('should set an invoice to paid', async () => {
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
    const invoiceRedis = createRedisInvoice(100)
    invoiceRedis.payment_hash = invoice.paymentHash
    invoiceRedis.payment_request = invoice.paymentRequest
    invoiceRedis.paid = Math.round(+ new Date() / 1000)
    cardRedis.invoice = invoiceRedis

    await updateCard(cardRedis)
    expect(queries.insertCards).not.toHaveBeenCalled()
    expect(queries.insertCardVersions).not.toHaveBeenCalled()
    expect(queries.insertInvoices).not.toHaveBeenCalled()
    expect(queries.insertCardVersionInvoices).not.toHaveBeenCalled()
    expect(queries.insertLnurlPs).not.toHaveBeenCalled()
    expect(queries.insertLnurlWs).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledTimes(1)
    expect(queries.insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      paid: expect.any(Date),
    }))
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledTimes(1)
  })
})
