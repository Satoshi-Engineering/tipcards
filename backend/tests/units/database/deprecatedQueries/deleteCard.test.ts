import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice } from '../../../drizzleData.js'
import {
  createCard as createRedisCard,
  createInvoice as createRedisInvoice,
  createSetFunding as createRedisSetFunding,
} from '../../../redisData.js'

import { deleteCard } from '@backend/database/deprecated/queries.js'

describe('deleteCard', () => {
  it('should delete a card with invoice', async () => {
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
    cardRedis.invoice = invoiceRedis

    await deleteCard(cardRedis)
    expect(queries.deleteCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.hash,
    }))
    expect(queries.deleteCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion.id,
    }))
    expect(queries.deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion.id,
    }))
  })

  it('should delete a card with setFunding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(200, cardVersion, cardVersion2)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.setFunding = createRedisSetFunding(100)

    await deleteCard(cardRedis)
    expect(queries.deleteCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.hash,
    }))
    expect(queries.deleteCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion.id,
    }))
    expect(queries.deleteInvoice).not.toHaveBeenCalled()
    expect(queries.deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion.id,
    }))
    expect(queries.deleteCardVersionInvoice).not.toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion2.id,
    }))
  })
})
