
import '../mocks/database/client.js'
import { addData, profilesByUserId } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'

import { ZodError } from 'zod'
import { describe, it, expect, beforeAll } from 'vitest'

import { PermissionsEnum } from '@shared/data/auth/User.js'
import User from '@backend/domain/User.js'

import { createUser } from '../../drizzleData.js'
import { getRandomString } from '../lib/randomUtils.js'

const userDatabase = createUser()
userDatabase.permissions = PermissionsEnum.options
const userWithInvalidPermissionsDatabase = createUser()
userWithInvalidPermissionsDatabase.permissions = ['invalid-permission']

beforeAll(() => {
  addData({
    users: [userDatabase, userWithInvalidPermissionsDatabase],
  })
})

describe('User', () => {
  it('should get null from userId that does not exist', async () => {
    const user = await User.fromId('nonexistent')
    expect(user).toBeNull()
  })

  it('should get a user from userId', async () => {
    const user = await User.fromId(userDatabase.id)
    expect(user).toEqual(expect.objectContaining({
      id: userDatabase.id,
      lnurlAuthKey: userDatabase.lnurlAuthKey,
      created: userDatabase.created,
      permissions: userDatabase.permissions,
    }))
  })

  it('should get null from walletLinkingKey that does not exist', async () => {
    const user = await User.fromLnurlAuthKey('nonexistent')
    expect(user).toBeNull()
  })

  it('should get a user from walletLinkingKey', async () => {
    const user = await User.fromLnurlAuthKey(userDatabase.lnurlAuthKey)
    expect(user).toEqual(expect.objectContaining({
      id: userDatabase.id,
      lnurlAuthKey: userDatabase.lnurlAuthKey,
      created: userDatabase.created,
      permissions: userDatabase.permissions,
    }))
  })

  it('should fail to load user with invalid permissions in database data', async () => {
    await expect(async () => {
      await User.fromId(userWithInvalidPermissionsDatabase.id)
    }).rejects.toThrowError(ZodError)
  })

  it('should insert new User', async () => {
    const mockNewLinkingKey = `mockLinkingKeyNew${getRandomString(25)}`
    const user = User.newUserFromWalletLinkingKey(mockNewLinkingKey)

    const userBeforeInsert = await User.fromId(user.id)
    expect(userBeforeInsert).toBeNull()

    await user.insert()

    const userAfterInsert = await User.fromId(user.id)
    expect(userAfterInsert).toEqual(expect.objectContaining({
      id: user.id,
      lnurlAuthKey: mockNewLinkingKey,
      created: user.created,
      permissions: user.permissions,
    }))
  })

  it('should insert a empty profile for a new User', async () => {
    const mockNewLinkingKey = `mockLinkingKeyNew${getRandomString(25)}`
    const user = User.newUserFromWalletLinkingKey(mockNewLinkingKey)
    expect(profilesByUserId[user.id]).toBeUndefined()

    await user.insert()

    expect(profilesByUserId[user.id]).toStrictEqual({
      user: user.id,
      accountName: '',
      displayName: '',
      email: '',
    })
  })
})
