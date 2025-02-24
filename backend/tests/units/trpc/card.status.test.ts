import { addCard } from '../mocks/domain/LiveCardStatus.js'
import '../mocks/process.env.js'
import '../mocks/http.js'

import { describe, it, expect } from 'vitest'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import { cardRouter } from '@backend/trpc/router/tipcards/card.js'
import AccessGuard from '@backend/domain/auth/AccessGuard.js'

import { createCard } from '../data/Card.js'

ApplicationEventEmitter.init()
const applicationEventEmitter = ApplicationEventEmitter.instance

CardLockManager.init({ aquireTimeout: 1000 })
const cardLockManager = CardLockManager.instance

const createCaller = createCallerFactory(cardRouter)

describe('tRPC card.status route', async () => {
  const caller = createCaller({
    accessGuard: {} as unknown as AccessGuard,
    applicationEventEmitter,
    cardLockManager,
  })

  it('should return the current card status', async () => {
    const card = createCard()
    addCard(card)
    const result = await caller.status({ hash: card.hash })

    expect(result).toEqual({
      hash: card.hash,

      status: CardStatusEnum.enum.unfunded,
      amount: null,
      feeAmount: null,
    })
  })
})
