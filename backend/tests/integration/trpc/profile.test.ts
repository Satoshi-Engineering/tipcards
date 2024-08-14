import '@backend/initEnv.js' // Info: .env needs to read before imports

import { TRPCError } from '@trpc/server'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import Database from '@backend/database/Database.js'
import { profileRouter } from '@backend/trpc/router/profile.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import '../lib/initAxios.js'
import { createUser, createProfileForUser } from '../../drizzleData.js'

const createCaller = createCallerFactory(profileRouter)
const frontend = new FrontendSimulator()

beforeAll(async () => {
  await Database.init()
})

afterAll(async () => {
  await Database.closeConnectionIfExists()
})

describe('TRpc Router Profile', () => {
  it('should return 401 if the user is not logged in', async () => {
    const caller = createCaller({
      host: new URL(TIPCARDS_API_ORIGIN).host,
      jwt: null,
      accessToken: null,
    })
    let caughtError: TRPCError | undefined
    try {
      await caller.getDisplayName()
    } catch (error) {
      caughtError = error as TRPCError
    }
    expect(caughtError?.code).toBe('UNAUTHORIZED')
  })

  it('should load a displayName for a profile that doesnt exist', async () => {
    await frontend.login()
    const caller = createCaller({
      host: new URL(TIPCARDS_API_ORIGIN).host,
      jwt: frontend.accessToken,
      accessToken: null,
    })
    const displayName = await caller.getDisplayName()
    expect(displayName).toBe('')
  })

  it('should load a displayName for an existing profile', async () => {
    const user = createUser(frontend.userId)
    const profile = createProfileForUser(user)
    await frontend.setProfile(
      profile.accountName,
      profile.displayName,
      profile.email,
    )
    const caller = createCaller({
      host: new URL(TIPCARDS_API_ORIGIN).host,
      jwt: frontend.accessToken,
      accessToken: null,
    })

    const displayName = await caller.getDisplayName()
    expect(displayName).toBe(profile.displayName)
  })
})
