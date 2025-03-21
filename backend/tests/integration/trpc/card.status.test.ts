import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import Database from '@backend/database/Database.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { cardRouter } from '@backend/trpc/router/tipcards/card.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import AccessGuard from '@backend/domain/auth/AccessGuard.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import { cardData } from '../lib/apiData.js'
import '../lib/initAxios.js'

ApplicationEventEmitter.init()
CardLockManager.init({ aquireTimeout: 1000 })
const createCaller = createCallerFactory(cardRouter)

const testCard = cardData.generateCard(cardData.DEFAULT_AMOUNT_IN_SATS)
const frontend = new FrontendSimulator()

const callerCards = createCaller({
  accessGuard: {} as unknown as AccessGuard,
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

describe('CardStatus', () => {
  // only the basic tests, detailed tests are done via backend unit and e2e tests

  it('should load the status for a card that doesnt exist', async () => {
    const imaginedCardId = cardData.generateCardHash() // random card hash that doesnt exist
    const cardStatusIterable = await callerCards.statusSubscription({ hash: imaginedCardId })
    const cardStatus = await cardStatusIterable[Symbol.asyncIterator]().next()

    expect(cardStatus).toEqual({
      done: false,
      value: {
        hash: imaginedCardId,
        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
      },
    })
  })

  it('should load a card with invoice from cardHash', async () => {
    const cardStatusIterable = await callerCards.statusSubscription({ hash: testCard.cardHash })
    const cardStatus = await cardStatusIterable[Symbol.asyncIterator]().next()

    expect(cardStatus).toEqual({
      done: false,
      value: {
        hash: testCard.cardHash,
        status: CardStatusEnum.enum.invoiceFunding,
        amount: testCard.amount,
        feeAmount: testCard.feeAmount,
      },
    })
  })
})
