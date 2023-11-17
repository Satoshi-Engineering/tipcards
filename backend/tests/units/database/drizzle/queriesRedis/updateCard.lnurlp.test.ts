import { randomUUID } from 'crypto'

import '../../../mocks/process.env'
import {
  addData,
  updateCardVesion,
  insertOrUpdateLnurlP,
  insertOrUpdateInvoice,
  insertOrUpdateCardVersionInvoice,
} from '../mocks/queries'

import { updateCard } from '@backend/database/drizzle/queriesRedis'
import hashSha256 from '@backend/services/hashSha256'

import { createCard, createCardVersion, createLnurlP } from '../../../../drizzleData'
import { createCard as createRedisCard, createLnurlP as createRedisLnurlP } from '../../../../redisData'

describe('updateCard', () => {
  it('should add an lnurlp to a card', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.lnurlp = createRedisLnurlP()

    await updateCard(cardRedis)
    expect(updateCardVesion).toHaveBeenCalledWith(expect.objectContaining({
      lnurlP: cardRedis.lnurlp.id,
    }))
    expect(insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnurlp.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
  })

  it('should add a payment to a card', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlp = createLnurlP(cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      lnurlps: [lnurlp],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    cardRedis.lnurlp = createRedisLnurlP()
    cardRedis.lnurlp.id = lnurlp.lnbitsId
    cardRedis.lnurlp.amount = 100
    const payment_hash = hashSha256(randomUUID())
    cardRedis.lnurlp.payment_hash = [payment_hash]
    cardRedis.lnurlp.paid = Math.round(+ new Date() / 1000)

    await updateCard(cardRedis)
    expect(updateCardVesion).toHaveBeenCalledWith(expect.objectContaining({
      lnurlP: cardRedis.lnurlp.id,
    }))
    expect(insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnurlp.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: expect.any(Date),
    }))
    expect(insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100,
      paymentHash: payment_hash,
      paymentRequest: expect.any(String),
      created: expect.any(Date),
      paid: expect.any(Date),
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: cardVersion.id,
      invoice: payment_hash,
    }))
  })
})
