import '../../initEnv'

import { cardRouter } from '@backend/trpc/router/card'
import { TIPCARDS_API_ORIGIN } from '@backend/constants'

import { CARD_FUNDED_INVOICE } from './FundedCard'
import { initCard } from '../../initRedis'

const callerCards = cardRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
})

beforeAll(async () => {
  await Promise.all([
    initCard(CARD_FUNDED_INVOICE),
  ])
})

describe('TRpc Router Card', () => {
  it('should load a card from cardHash', async () => {
    const card = await callerCards.getByHash(CARD_FUNDED_INVOICE.cardHash)
    expect(card.hash).toBe(CARD_FUNDED_INVOICE.cardHash)
    expect(card.invoice).not.toBeNull()
  })

  it('should load a card that doesnt exist', async () => {
    const imaginedCardId = 'some random string that doesnt exist'
    const card = await callerCards.getByHash(imaginedCardId)
    expect(card.hash).toBe(imaginedCardId)
    expect(card.invoice).toBeNull()
  })
})
