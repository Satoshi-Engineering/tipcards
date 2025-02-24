import { addCard } from '../mocks/domain/LiveCardStatus.js'
import '../mocks/process.env.js'
import '../mocks/http.js'

import { describe, it, expect, vi } from 'vitest'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import ApplicationEventEmitter, { cardUpdateEvent } from '@backend/domain/ApplicationEventEmitter.js'
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
    const iterable = await caller.statusSubscription({ hash: card.hash })

    const result = await iterable[Symbol.asyncIterator]().next()

    expect(result).toEqual({
      done: false,
      value: {
        hash: card.hash,

        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
      },
    })
  })

  it('should not return a second time if no update occurred', async () => {
    const card = createCard()
    addCard(card)
    const iterable = await caller.statusSubscription({ hash: card.hash })
    await iterable[Symbol.asyncIterator]().next()

    const awaitNext = async () => {
      await iterable[Symbol.asyncIterator]().next()
    }
    const nextSpy = vi.fn(awaitNext)
    nextSpy()
    await new Promise(resolve => setTimeout(resolve, 30))

    expect(nextSpy).not.toHaveResolved()
  })

  it('should return the current card status after an update', async () => {
    const card = createCard()
    addCard(card)
    const iterable = await caller.statusSubscription({ hash: card.hash })
    await iterable[Symbol.asyncIterator]().next()

    setTimeout(() => applicationEventEmitter.emit(cardUpdateEvent(card.hash)), 1)
    const result = await iterable[Symbol.asyncIterator]().next()

    expect(result).toEqual({
      done: false,
      value: {
        hash: card.hash,

        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
      },
    })
  })
})
