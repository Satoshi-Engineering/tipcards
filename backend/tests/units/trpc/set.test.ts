import '@backend/initEnv.js' // Info: .env needs to read before imports

import { vi, describe, it, expect, beforeAll } from 'vitest'
import { TRPCError } from '@trpc/server'

import '../mocks/database/client.js'
import {
  addData,
} from '../mocks/database/database.js'

import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import NotFoundError from '@backend/errors/NotFoundError.js'
import { setRouter } from '@backend/trpc/router/tipcards/set.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import AccessGuard from '@backend/domain/auth/AccessGuard.js'
import User from '@backend/domain/User.js'

import { createCardForSet, createCardVersion, createSet, createSetSettings, createUser } from '../../drizzleData.js'

ApplicationEventEmitter.init()
CardLockManager.init({ aquireTimeout: 1000 })
const createCaller = createCallerFactory(setRouter)
const applicationEventEmitter = {} as unknown as ApplicationEventEmitter
const cardLockManager = {
  lockCards: vi.fn(),
} as unknown as CardLockManager
const accessGuard = {
  authenticateUserViaAccessToken: vi.fn(),
} as unknown as AccessGuard
const caller = createCaller({
  accessGuard,
  applicationEventEmitter,
  cardLockManager,
})

const dbUser = createUser()
const emptySet = createSet()
const setWithCards = createSet()
const setWithSetFunding = createSet()
const setSettings = createSetSettings(setWithCards)
setSettings.numberOfCards = 2
const card1 = createCardForSet(setWithCards, 0)
const card2 = createCardForSet(setWithCards, 1)
let user: User

beforeAll(async () => {
  addData({
    sets: [emptySet, setWithCards, setWithSetFunding],
    setSettings: [setSettings],
    cards: [card1, card2],
    cardVersions: [createCardVersion(card1), createCardVersion(card2)],
    users: [dbUser],
    usersCanUseSets: [
      { user: dbUser.id, set: setWithCards.id, canEdit:true },
      { user: dbUser.id, set: emptySet.id, canEdit:true },
      { user: dbUser.id, set: setWithSetFunding.id, canEdit:true },
    ],
  })

  user = await User.fromId(dbUser.id) || User.newUserFromWalletLinkingKey('USER COULD NOT BE LOADED')
})

describe('TRpc Router Set', () => {
  it('throws 404 if set is not found', async () => {
    const randomSet = createSet()
    let caughtError: TRPCError | undefined
    try {
      await caller.getCards({ id: randomSet.id })
    } catch (error) {
      caughtError = error as TRPCError
    }
    expect(caughtError?.cause instanceof NotFoundError).toBe(true)
  })

  it('returns no cards for an empty set', async () => {
    vi.spyOn(cardLockManager, 'lockCards').mockResolvedValueOnce([])

    const cards = await caller.getCards({ id: emptySet.id })
    expect(cards.length).toBe(0)
  })

  it('returns all cards for a set', async () => {
    vi.spyOn(cardLockManager, 'lockCards').mockResolvedValueOnce([])

    const cards = await caller.getCards({ id: setWithCards.id })
    expect(cards.length).toBe(2)
    expect(cards).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: card1.hash,
      }),
      expect.objectContaining({
        hash: card2.hash,
      }),
    ]))
  })

  it.skip('returns all cards for a set funding set', async () => {
    const cards = await caller.getCards({ id: setWithSetFunding.id })
    expect(cards.length).toBe(4)
  })

  it('returns all sets for a logged in user', async () => {
    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(user)

    const sets = await caller.getAll()
    expect(sets.length).toBe(3)
    expect(sets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: emptySet.id,
      }),
      expect.objectContaining({
        id: setWithCards.id,
      }),
    ]))
  })
})
