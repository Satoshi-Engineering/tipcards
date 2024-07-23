import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice } from '../../../drizzleData.js'
import { createCard as createRedisCard, createInvoice as createRedisInvoice } from '../../../redisData.js'

import { updateCard } from '@backend/database/deprecated/queries.js'

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
    expect(queries.insertCards).not.toHaveBeenCalled()
    expect(queries.insertCardVersions).not.toHaveBeenCalled()
    expect(queries.insertInvoices).not.toHaveBeenCalled()
    expect(queries.insertCardVersionInvoices).not.toHaveBeenCalled()
    expect(queries.insertLnurlPs).not.toHaveBeenCalled()
    expect(queries.insertLnurlWs).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion.id,
      card: card.hash,
      textForWithdraw: 'some super text',
      noteForStatusPage: 'some crazy note',
      landingPageViewed: expect.any(Date),
    }))
    expect(queries.insertOrUpdateInvoice).toHaveBeenCalledTimes(1)
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledTimes(1)
  })
})
