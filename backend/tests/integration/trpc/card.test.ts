import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import Database from '@backend/database/Database.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { cardRouter } from '@backend/trpc/router/tipcards/card.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import { cardData } from '../lib/apiData.js'
import '../lib/initAxios.js'

const testCard = cardData.generateCard(cardData.DEFAULT_AMOUNT_IN_SATS)
const frontend = new FrontendSimulator()

ApplicationEventEmitter.init()
CardLockManager.init({ aquireTimeout: 1000 })
const callerCards = cardRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
  applicationEventEmitter: ApplicationEventEmitter.instance,
  cardLockManager: CardLockManager.instance,
})

beforeAll(async () => {
  await Database.init()
  await frontend.createCardViaAPI(testCard.cardHash, testCard.amount, testCard.text, testCard.note)
})

afterAll(async () => {
  await Database.closeConnectionIfExists()
})

describe('TRpc Router Card', () => {
  const imaginedCardId = cardData.generateCardHash() // random card hash that doesnt exist
  it('should load a card that does not exist', async () => {
    const card = await callerCards.getByHash({ hash: imaginedCardId })
    expect(card.hash).toBe(imaginedCardId)
    expect(card.invoice).toBeNull()
  })

  it('should load a card from cardHash', async () => {
    const card = await callerCards.getByHash({ hash: testCard.cardHash })
    expect(card.hash).toBe(testCard.cardHash)
    expect(card.invoice).not.toBeNull()
    expect(card.landingPageViewed).toBeNull()
  })

  it('should return 404 if card does not exist', async () => {
    await expect(() => callerCards.landingPageViewed({ hash: imaginedCardId })).rejects.toThrow(Error)
  })

  let landingPageViewed: Date | null
  it('should set the card landing page as viewed', async () => {
    await callerCards.landingPageViewed({ hash: testCard.cardHash })
    const card = await callerCards.getByHash({ hash: testCard.cardHash })
    expect(card.landingPageViewed).toBeTruthy()
    landingPageViewed = card.landingPageViewed
  })

  it('should not update the landingPageViewed timestamp again', async () => {
    await callerCards.landingPageViewed({ hash: testCard.cardHash })
    const card = await callerCards.getByHash({ hash: testCard.cardHash })
    expect(card.landingPageViewed).toBeTruthy()
    expect(card.landingPageViewed).toEqual(landingPageViewed)
  })
})
