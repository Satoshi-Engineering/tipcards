import '../../../mocks/process.env'
import {
  addData,
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
  insertOrUpdateLatestCardVersion,
  insertOrUpdateInvoice,
  insertOrUpdateCardVersionInvoice,
} from '../mocks/queries'

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
    expect(insertCards).not.toHaveBeenCalled()
    expect(insertCardVersions).not.toHaveBeenCalled()
    expect(insertInvoices).not.toHaveBeenCalled()
    expect(insertCardVersionInvoices).not.toHaveBeenCalled()
    expect(insertLnurlPs).not.toHaveBeenCalled()
    expect(insertLnurlWs).not.toHaveBeenCalled()
    expect(insertOrUpdateLatestCardVersion).toHaveBeenCalledTimes(1)
    expect(insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      paid: expect.any(Date),
    }))
    expect(insertOrUpdateCardVersionInvoice).toHaveBeenCalledTimes(1)
  })
})
