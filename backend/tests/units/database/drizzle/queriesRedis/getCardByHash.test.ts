import '../../../mocks/process.env'
import '../mocks/client'
import { addData } from '../mocks/database'

import { createCard, createCardVersion } from '../../../../drizzleData'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash', () => {
  it('should return null for a cardHash that doesn\'t exist', async () => {
    const card = await getCardByHash('some card hash that doesnt exist')
    expect(card).toBeNull()
  })

  it('should return a card that exists in the database', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
    })

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
