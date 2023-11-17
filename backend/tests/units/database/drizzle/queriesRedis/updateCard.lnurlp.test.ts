import '../../../mocks/process.env'
import {
  addData,
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
  updateCardVesion,
  insertOrUpdateLnurlP,
} from '../mocks/queries'

import { createCard, createCardVersion } from '../../../../drizzleData'
import { createCard as createRedisCard, createLnurlP as createRedisLnurlP } from '../../../../redisData'

import { updateCard } from '@backend/database/drizzle/queriesRedis'

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
    expect(insertCards).not.toHaveBeenCalled()
    expect(insertCardVersions).not.toHaveBeenCalled()
    expect(insertInvoices).not.toHaveBeenCalled()
    expect(insertCardVersionInvoices).not.toHaveBeenCalled()
    expect(insertLnurlPs).not.toHaveBeenCalled()
    expect(insertLnurlWs).not.toHaveBeenCalled()
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
})
