import { describe, it, expect } from 'vitest'

import '../../../mocks/process.env'
import { queries } from '../mocks/client'
import { addData } from '../mocks/database'

import { dateToUnixTimestamp, unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers'
import { getUserByLnurlAuthKeyOrCreateNew } from '@backend/database/drizzle/queriesRedis'

import { createUser, createProfileForUser } from '../../../../drizzleData'
import { createUser as createUserData } from '../../../../redisData'

describe('getUserByLnurlAuthKeyOrCreateNew', () => {
  it('should return the user if he exists', async () => {
    const userData = createUser()
    const profileData = createProfileForUser(userData)

    addData({
      users: [userData],
      profiles: [profileData],
    })

    const userResult = await getUserByLnurlAuthKeyOrCreateNew(userData.lnurlAuthKey)
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

  it('should insertOrUpdate a user if he doesnt exist yet', async () => {
    const user = createUserData()

    const userResult = await getUserByLnurlAuthKeyOrCreateNew(user.lnurlAuthKey)
    expect(userResult).toEqual(expect.objectContaining({
      id: expect.any(String),
      lnurlAuthKey: user.lnurlAuthKey,
      created: expect.any(Number),
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: null,
      profile: {
        displayName: '',
        accountName: '',
        email: '',
      },
    }))
    expect(queries.insertOrUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: userResult.id,
      lnurlAuthKey: user.lnurlAuthKey,
      created: unixTimestampToDate(userResult.created),
      permissions: [],
    }))
  })
})
