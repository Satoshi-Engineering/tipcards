import '../../../mocks/process.env'
import { addCardVersions } from '../mocks/queries'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

import { CARD_VERSION_UNFUNDED } from '../data/UnfundedCard'
describe('getCardByHash', () => {
  it('should return null for a card that doesn\'t exist', async () => {
    const card = await getCardByHash('some card hash that doesnt exist')
    expect(card).toBeNull()
  })

  it('should return a card that exists in the database', async () => {
    addCardVersions(CARD_VERSION_UNFUNDED)

    const card = await getCardByHash(CARD_VERSION_UNFUNDED.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_UNFUNDED.card,
      text: CARD_VERSION_UNFUNDED.textForWithdraw,
      note: CARD_VERSION_UNFUNDED.noteForStatusPage,
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
