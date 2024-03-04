import '@backend/initEnv' // Info: .env needs to read before imports

import { initDatabase, closeDatabaseConnections } from '@backend/database'
import { cardRouter } from '@backend/trpc/router/card'
import { TIPCARDS_API_ORIGIN } from '@backend/constants'

import FrontendSimulator from '../lib/frontend/FrontendSimulator'
import { cardData } from '../lib/apiData'
import '../lib/initAxios'

const testCard = cardData.generateCard(cardData.DEFAULT_AMOUNT_IN_SATS)
const frontend = new FrontendSimulator()

const callerCards = cardRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
})

beforeAll(async () => {
  await initDatabase()
  await frontend.createCardViaAPI(testCard.cardHash, testCard.amount, testCard.text, testCard.note)
})

afterAll(async () => {
  await closeDatabaseConnections()
})

describe('TRpc Router Card', () => {
  it('should load a card from cardHash', async () => {
    const card = await callerCards.getByHash(testCard.cardHash)
    expect(card.hash).toBe(testCard.cardHash)
    expect(card.invoice).not.toBeNull()
  })

  it('should load a card that doesnt exist', async () => {
    const imaginedCardId = `${cardData.generateCardHash()} some random string that doesnt exist`
    const card = await callerCards.getByHash(imaginedCardId)
    expect(card.hash).toBe(imaginedCardId)
    expect(card.invoice).toBeNull()
  })
})
