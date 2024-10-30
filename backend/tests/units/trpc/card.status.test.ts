import { addCard } from '../mocks/domain/CardStatus.js'
import '../mocks/process.env.js'
import '../mocks/http.js'

import { describe, it, expect, vi } from 'vitest'

import ApplicationEventEmitter, { cardUpdateEvent } from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import { cardRouter } from '@backend/trpc/router/tipcards/card.js'

import { createCard } from '../data/Card.js'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

ApplicationEventEmitter.init()
const applicationEventEmitter = ApplicationEventEmitter.instance

CardLockManager.init({ aquireTimeout: 1000 })
const cardLockManager = CardLockManager.instance

const createCaller = createCallerFactory(cardRouter)

describe('tRPC card.status route', async () => {
  const caller = createCaller({
    host: null,
    jwt: null,
    accessToken: null,
    applicationEventEmitter,
    cardLockManager,
  })

  it('should return the current card status', async () => {
    const card = createCard()
    addCard(card)
    const iterator = await caller.status({ hash: card.hash })

    const result = await iterator.next()

    expect(result).toEqual({
      done: false,
      value: {
        hash: card.hash,

        status: CardStatusEnum.enum.unfunded,
        amount: null,
        created: card.created,
        funded: null,
        withdrawn: null,
      },
    })
  })

  it('should not return a second time if no update occurred', async () => {
    const card = createCard()
    addCard(card)
    const iterator = await caller.status({ hash: card.hash })
    await iterator.next()

    const awaitNext = async () => {
      await iterator.next()
    }
    const nextSpy = vi.fn(awaitNext)
    nextSpy()
    await new Promise(resolve => setTimeout(resolve, 30))

    expect(nextSpy).not.toHaveResolved()
  })

  it('should return the current card status after an update', async () => {
    const card = createCard()
    addCard(card)
    const iterator = await caller.status({ hash: card.hash })
    await iterator.next()

    setTimeout(() => applicationEventEmitter.emit(cardUpdateEvent(card.hash)), 1)
    const result = await iterator.next()

    expect(result).toEqual({
      done: false,
      value: {
        hash: card.hash,

        status: CardStatusEnum.enum.unfunded,
        amount: null,
        created: card.created,
        funded: null,
        withdrawn: null,
      },
    })
  })
})
