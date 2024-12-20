import '../mocks/process.env.js'
import { openTask } from '../mocks/domain/OpenTaskCollection.js'

import { describe, it, expect, vi } from 'vitest'

import AccessGuard from '@backend/domain/auth/AccessGuard.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import User from '@backend/domain/User.js'
import { cardRouter } from '@backend/trpc/router/tipcards/card.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'

const user = User.newUserFromWalletLinkingKey('walletLinkingKey')

ApplicationEventEmitter.init()
const applicationEventEmitter = ApplicationEventEmitter.instance
CardLockManager.init({ aquireTimeout: 1000 })
const cardLockManager = CardLockManager.instance

const createCaller = createCallerFactory(cardRouter)

const accessGuard = {
  authenticateUserViaAccessToken: vi.fn(() => user),
} as unknown as AccessGuard

describe('tRPC card.openTasks route', async () => {
  const caller = createCaller({
    accessGuard,
    applicationEventEmitter,
    cardLockManager,
  })

  it('should return the open tasks', async () => {
    const openTasks = await caller.openTasks()

    expect(openTasks).toEqual(expect.arrayContaining([openTask]))
  })
})
