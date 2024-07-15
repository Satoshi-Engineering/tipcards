import { describe, it, expect } from 'vitest'

import '../../../mocks/process.env.js'
import '../mocks/client.js'
import { addData } from '../mocks/database.js'

import { dateToUnixTimestamp } from '@backend/database/drizzle/transforms/dateHelpers.js'
import { getUserByLnurlAuthKey } from '@backend/database/drizzle/queriesRedis.js'

import { createUser, createProfileForUser } from '../../../../drizzleData.js'

describe('getUserByLnurlAuthKey', () => {
  it('should return null if a user does not exist', async () => {
    const user = await getUserByLnurlAuthKey('some user id that doesnt exist')
    expect(user).toBeNull()
  })

  it('should return the user', async () => {
    const userData = createUser()
    const profileData = createProfileForUser(userData)

    addData({
      users: [userData],
      profiles: [profileData],
    })

    const userResult = await getUserByLnurlAuthKey(userData.lnurlAuthKey)
    expect(userResult).toEqual(expect.objectContaining({
      id: userData.id,
      created: dateToUnixTimestamp(userData.created),
      lnurlAuthKey: userData.lnurlAuthKey,
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: null,
      profile: {
        displayName: profileData.displayName,
        accountName: profileData.accountName,
        email: profileData.email,
      },
      permissions: [],
    }))
  })
})
