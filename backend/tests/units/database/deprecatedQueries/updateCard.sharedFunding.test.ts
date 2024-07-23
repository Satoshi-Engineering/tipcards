import { describe, it, expect } from 'vitest'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { updateCard } from '@backend/database/deprecated/queries.js'
import hashSha256 from '@backend/services/hashSha256.js'

import { createCard, createCardVersion, createLnurlP, createInvoice } from '../../../drizzleData.js'
import { createCard as createRedisCard, createLnurlP as createRedisLnurlP } from '../../../redisData.js'

describe('updateCard', () => {
  it('should add a lnurlp sharedFunding to a card', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.lnurlp = createRedisLnurlP()
    cardRedis.lnurlp.shared = true

    await updateCard(cardRedis)
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion.id,
      card: card.hash,
      lnurlP: cardRedis.lnurlp.id,
      sharedFunding: true,
    }))
    expect(queries.insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnurlp.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
  })

  it('should add sharedFunding payments to a card', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlp = createLnurlP(cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      lnurlps: [lnurlp],
    })

    // test fist payment
    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.lnurlp = createRedisLnurlP()
    cardRedis.lnurlp.id = lnurlp.lnbitsId
    cardRedis.lnurlp.shared = true
    cardRedis.lnurlp.amount = 100
    const payment_hash = hashSha256(randomUUID())
    cardRedis.lnurlp.payment_hash = [payment_hash]
    await updateCard(cardRedis)

    // add the first invoice to the mock database
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    invoice.paymentHash = payment_hash
    invoice.paid = new Date()
    cardVersionsHaveInvoice.forEach((cardVersionHasInvoice) => cardVersionHasInvoice.invoice = payment_hash)
    addData({
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    // test a second payment
    const payment_hash2 = hashSha256(randomUUID())
    cardRedis.lnurlp.amount += 200
    cardRedis.lnurlp.payment_hash = [payment_hash, payment_hash2]
    await updateCard(cardRedis)

    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion.id,
      card: card.hash,
      lnurlP: cardRedis.lnurlp.id,
      sharedFunding: true,
    }))
    expect(queries.insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnurlp.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
    expect(queries.insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100,
      paymentHash: payment_hash,
      paymentRequest: expect.any(String),
      created: expect.any(Date),
      paid: expect.any(Date),
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: cardVersion.id,
      invoice: payment_hash,
    }))
    expect(queries.insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      amount: 200,
      paymentHash: payment_hash2,
      paymentRequest: expect.any(String),
      created: expect.any(Date),
      paid: expect.any(Date),
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: cardVersion.id,
      invoice: payment_hash2,
    }))
    expect(queries.deleteInvoice).not.toHaveBeenCalled()
    expect(queries.deleteCardVersionInvoice).not.toHaveBeenCalled()
  })

  it('should finish a sharedFunding for a card', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlp = createLnurlP(cardVersion)
    cardVersion.sharedFunding = true
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    invoice.paid = new Date()
    const {
      invoice: invoice2,
      cardVersionsHaveInvoice: cardVersionsHaveInvoice2,
    } = createInvoice(200, cardVersion)
    invoice2.paid = new Date()
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      lnurlps: [lnurlp],
      invoices: [invoice, invoice2],
      cardVersionInvoices: [...cardVersionsHaveInvoice, ...cardVersionsHaveInvoice2],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.lnurlp = createRedisLnurlP()
    cardRedis.lnurlp.id = lnurlp.lnbitsId
    cardRedis.lnurlp.shared = true
    cardRedis.lnurlp.amount = 300
    cardRedis.lnurlp.payment_hash = [invoice.paymentHash, invoice2.paymentHash]
    cardRedis.lnurlp.paid = Math.round(+ new Date() / 1000)
    await updateCard(cardRedis)

    expect(queries.insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnurlp.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: expect.any(Date),
    }))
    expect(queries.deleteInvoice).not.toHaveBeenCalled()
    expect(queries.deleteCardVersionInvoice).not.toHaveBeenCalled()
  })
})
