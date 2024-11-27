import '@backend/initEnv.js' // Info: .env needs to read before imports

import { vi, describe, it, expect, beforeAll } from 'vitest'

import '../mocks/database/client.js'
import {
  addData,
} from '../mocks/database/database.js'

import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { profileRouter } from '@backend/trpc/router/tipcards/profile.js'
import { createCallerFactory } from '@backend/trpc/trpc.js'
import AccessGuard from '@backend/domain/auth/AccessGuard.js'
import User from '@backend/domain/User.js'

import { createUser, createProfileForUser } from '../../drizzleData.js'

const createCaller = createCallerFactory(profileRouter)
const applicationEventEmitter = {} as unknown as ApplicationEventEmitter
const cardLockManager = {} as unknown as CardLockManager
const accessGuard = {
  authenticateUserViaAccessToken: vi.fn(),
} as unknown as AccessGuard
const caller = createCaller({
  accessGuard,
  applicationEventEmitter,
  cardLockManager,
})
const dbUserWithProfile = createUser()
const dbUserNoProfile = createUser()
const dbProfileData = createProfileForUser(dbUserWithProfile)
let userWithProfile: User
let userNoProfile: User

beforeAll(async () => {
  addData({
    users: [dbUserWithProfile, dbUserNoProfile],
    profiles: [dbProfileData],
  })
  userWithProfile = await User.fromId(dbUserWithProfile.id) || User.newUserFromWalletLinkingKey('USER COULD NOT BE LOADED')
  userNoProfile = await User.fromId(dbUserNoProfile.id) || User.newUserFromWalletLinkingKey('USER COULD NOT BE LOADED')
})

describe('TRpc Router Profile', () => {
  it('should load a displayName for a profile that doesnt exist', async () => {
    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(userNoProfile)

    const displayName = await caller.getDisplayName()

    expect(displayName).toBe('')
  })

  it('should load a profile that doesnt exist', async () => {
    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(userNoProfile)

    const profile = await caller.get()

    expect(profile).toStrictEqual({
      accountName: '',
      displayName: '',
      email: '',
    })
  })

  it('should load a displayName for an existing profile', async () => {
    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(userWithProfile)
    addData({
      profiles: [dbProfileData],
    })

    const displayName = await caller.getDisplayName()

    expect(displayName).toBe(dbProfileData.displayName)
  })


  it('should load a profile that does exist', async () => {
    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(userWithProfile)
    const profile = await caller.get()

    expect(profile).toStrictEqual({
      accountName: dbProfileData.accountName,
      displayName: dbProfileData.displayName,
      email: dbProfileData.email,
    })
  })

  it('should update the profile data', async () => {
    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(userWithProfile)
    const profile = await caller.update({
      displayName: 'newDisplayName',
      email: 'newEmail',
    })

    expect(profile).toStrictEqual({
      accountName: dbProfileData.accountName,
      displayName: 'newDisplayName',
      email: 'newEmail',
    })

    vi.spyOn(accessGuard, 'authenticateUserViaAccessToken').mockResolvedValueOnce(userWithProfile)
    const fetchedProfile = await caller.get()

    expect(fetchedProfile).toStrictEqual({
      accountName: dbProfileData.accountName,
      displayName: 'newDisplayName',
      email: 'newEmail',
    })
  })
})
