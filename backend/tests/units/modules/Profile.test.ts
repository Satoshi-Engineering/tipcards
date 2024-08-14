import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'

import { describe, it, expect, beforeAll } from 'vitest'

import Profile from '@backend/modules/Profile.js'

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
    const data = await profile.toTRpcResponse()
    expect(data).toStrictEqual({
      accountName: '',
      displayName: '',
      email: '',
    })
  })

  it('should load an existing profile', async () => {
    const profile = await Profile.fromUserIdOrDefault(userDatabase.id)
    const data = await profile.toTRpcResponse()
    expect(data).toStrictEqual({
      accountName: profileDatabase.accountName,
      displayName: profileDatabase.displayName,
      email: profileDatabase.email,
    })
  })
})
