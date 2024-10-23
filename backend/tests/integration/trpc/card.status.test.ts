import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import Database from '@backend/database/Database.js'
import { cardRouter } from '@backend/trpc/router/tipcards/card.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import { cardData } from '../lib/apiData.js'
import '../lib/initAxios.js'

const createCaller = createCallerFactory(cardRouter)

const testCard = cardData.generateCard(cardData.DEFAULT_AMOUNT_IN_SATS)
const frontend = new FrontendSimulator()

const callerCards = createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
})

beforeAll(async () => {
  await Database.init()
  await frontend.createCardViaAPI(testCard.cardHash, testCard.amount, testCard.text, testCard.note)
})

afterAll(async () => {
  await Database.closeConnectionIfExists()
})


describe('CardStatus', () => {
  // only the basic tests, detailed tests are done via backend unit and e2e tests

  it('should load the status for a card that doesnt exist', async () => {
    const imaginedCardId = cardData.generateCardHash() // random card hash that doesnt exist
    const cardStatus = await callerCards.status({ hash: imaginedCardId })

    expect(cardStatus).toEqual({
      hash: imaginedCardId,
      status: CardStatusEnum.enum.unfunded,
      amount: null,
      created: expect.any(Date),
      funded: null,
      withdrawn: null,
    })
  })

  it('should load a card with invoice from cardHash', async () => {
    const cardStatus = await callerCards.status({ hash: testCard.cardHash })

    expect(cardStatus).toEqual({
      hash: testCard.cardHash,
      status: CardStatusEnum.enum.invoiceFunding,
      amount: testCard.amount,
      created: expect.any(Date),
      funded: null,
      withdrawn: null,
    })
  })
})
