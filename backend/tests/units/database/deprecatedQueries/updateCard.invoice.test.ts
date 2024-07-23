import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice } from '../../../drizzleData.js'
import { createCard as createRedisCard, createInvoice as createRedisInvoice } from '../../../redisData.js'

import { updateCard } from '@backend/database/deprecated/queries.js'

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
