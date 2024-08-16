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
  const userData = createUser(frontend.userId)
  const profileData = createProfileForUser(userData)
  let caller = createCaller({
    host: new URL(TIPCARDS_API_ORIGIN).host,
    jwt: null,
    accessToken: null,
  })

  it('should return 401 if the user is not logged in', async () => {
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
    caller = createCaller({
      host: new URL(TIPCARDS_API_ORIGIN).host,
      jwt: frontend.accessToken,
      accessToken: null,
    })

    const displayName = await caller.getDisplayName()

    expect(displayName).toBe('')
  })

  it('should load a profile that doesnt exist', async () => {
    const profile = await caller.get()

    expect(profile).toStrictEqual({
      accountName: '',
      displayName: '',
      email: '',
    })
  })

  it('should load a displayName for an existing profile', async () => {
    await frontend.setProfile(
      profileData.accountName,
      profileData.displayName,
      profileData.email,
    )

    const displayName = await caller.getDisplayName()

    expect(displayName).toBe(profileData.displayName)
  })

  it('should load a profile that does', async () => {
    const profile = await caller.get()

    expect(profile).toStrictEqual({
      accountName: profileData.accountName,
      displayName: profileData.displayName,
      email: profileData.email,
    })
  })

  it('should update', async () => {
    const profile = await caller.update({
      displayName: 'newDisplayName',
      email: 'newEmail',
    })

    expect(profile).toStrictEqual({
      accountName: profileData.accountName,
      displayName: 'newDisplayName',
      email: 'newEmail',
    })

    const fetchedProfile = await caller.get()

    expect(fetchedProfile).toStrictEqual({
      accountName: profileData.accountName,
      displayName: 'newDisplayName',
      email: 'newEmail',
    })
  })
})
