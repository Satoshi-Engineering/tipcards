import '../../../initEnv'
import { createAndAddCard, createAndAddCardVersion } from '../initData'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

describe('getCardByHash', () => {
  it('should return null for a card that doesn\'t exist', async () => {
    const card = await getCardByHash('some card hash that doesnt exist')
    expect(card).toBeNull()
  })

  it('should return a card that exists in the database', async () => {
    const card = await createAndAddCard()
    const cardVersion = await createAndAddCardVersion(card)

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

afterAll(async () => {
  // todo : clean up database
})
