import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TRPCError } from '@trpc/server'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import Database from '@backend/database/Database.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import NotFoundError from '@backend/errors/NotFoundError.js'
import { setRouter } from '@backend/trpc/router/tipcards/set.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import { cardData, setData } from '../lib/apiData.js'
import '../lib/initAxios.js'

ApplicationEventEmitter.init()
CardLockManager.init({ aquireTimeout: 1000 })
const callerLoggedOut = setRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
  applicationEventEmitter: ApplicationEventEmitter.instance,
  cardLockManager: CardLockManager.instance,
})

let callerLoggedIn = callerLoggedOut

const frontend = new FrontendSimulator()

const setIdForSetWithFundingInvoice = setData.generateSetId()
const emptySet = setData.generateSet()
const setWithCards = setData.generateSet()
const cardHash1 = cardData.generateCardHashForSet(setWithCards.id, 0)
const cardHash2 = cardData.generateCardHashForSet(setWithCards.id, 1)
const setWithSetFunding = setData.generateSet()

beforeAll(async () => {
  await Database.init()

  await frontend.createSetFundingInvoice(setIdForSetWithFundingInvoice, 100, [0, 1])

  await frontend.login()
  callerLoggedIn = setRouter.createCaller({
    host: new URL(TIPCARDS_API_ORIGIN).host,
    jwt: frontend.accessToken,
    accessToken: null,
    applicationEventEmitter: ApplicationEventEmitter.instance,
    cardLockManager: CardLockManager.instance,
  })

  await frontend.saveSet(emptySet)

  await frontend.saveSet(setWithCards)
  await frontend.createCardInvoice(cardHash1, 200)
  await frontend.createCardInvoice(cardHash2, 200)

  await frontend.saveSet(setWithSetFunding)
  await frontend.createSetFundingInvoice(setWithSetFunding.id, 100, [0, 1, 2, 3])
})

afterAll(async () => {
  await Database.closeConnectionIfExists()
})

describe('TRpc Router Set', () => {
  it('throws 404 if set is not found', async () => {
    let caughtError: TRPCError | undefined
    try {
      await callerLoggedOut.getCards({ id: setData.generateSetId() })
    } catch (error) {
      caughtError = error as TRPCError
    }
    expect(caughtError?.cause instanceof NotFoundError).toBe(true)
  })

  it('returns no cards for an empty set', async () => {
    const cards = await callerLoggedOut.getCards({ id: emptySet.id })
    expect(cards.length).toBe(0)
  })

  it('returns all cards for a set', async () => {
    const cards = await callerLoggedOut.getCards({ id: setWithCards.id })
    expect(cards.length).toBe(2)
    expect(cards).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: cardHash1,
      }),
      expect.objectContaining({
        hash: cardHash2,
      }),
    ]))
  })

  it('returns all cards for a set funding set', async () => {
    const cards = await callerLoggedOut.getCards({ id: setWithSetFunding.id })
    expect(cards.length).toBe(4)
  })

  it('returns all sets for a logged in user', async () => {
    const sets = await callerLoggedIn.getAll()
    expect(sets.length).toBe(3)
    expect(sets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: emptySet.id,
      }),
      expect.objectContaining({
        id: setWithCards.id,
      }),
      expect.objectContaining({
        id: setWithSetFunding.id,
      }),
    ]))
  })
})
