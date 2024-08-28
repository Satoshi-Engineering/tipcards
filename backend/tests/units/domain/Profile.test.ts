import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'

import { describe, it, expect, beforeAll } from 'vitest'

import { asTransaction } from '@backend/database/client.js'
import Profile from '@backend/domain/Profile.js'

import { createUser, createProfileForUser } from '../../drizzleData.js'

const userDatabase = createUser()
const profileDatabase = createProfileForUser(userDatabase)
beforeAll(() => {
  addData({
    users: [userDatabase],
    profiles: [profileDatabase],
  })
})

describe('Profile', () => {
  it('should load an empty profile if none exists', async () => {
    const profile = await Profile.fromUserIdOrDefault(createUser().id)
    const data = profile.toTRpcResponse()
    expect(data).toStrictEqual({
      accountName: '',
      displayName: '',
      email: '',
    })
  })

  it('should load an existing profile', async () => {
    const profile = await Profile.fromUserIdOrDefault(userDatabase.id)
    const data = profile.toTRpcResponse()
    expect(data).toStrictEqual({
      accountName: profileDatabase.accountName,
      displayName: profileDatabase.displayName,
      email: profileDatabase.email,
    })
  })

  it('should update existing profile', async () => {
    const profile = await Profile.fromUserIdOrDefault(userDatabase.id)
    await profile.update({
      accountName: 'new account name',
      displayName: 'new display name',
      email: 'new email',
    })

    const data = profile.toTRpcResponse()
    expect(data).toStrictEqual({
      accountName: 'new account name',
      displayName: 'new display name',
      email: 'new email',
    })
    const profileDatabaseNew = await asTransaction((queries) => queries.getProfileByUserId(userDatabase.id))
    expect(profileDatabaseNew).toStrictEqual({
      user: userDatabase.id,
      accountName: 'new account name',
      displayName: 'new display name',
      email: 'new email',
    })
  })
})
