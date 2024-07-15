import { describe, it, expect } from 'vitest'

import '../../../mocks/process.env.js'
import { queries } from '../mocks/client.js'
import { addData } from '../mocks/database.js'

import { dateToUnixTimestamp, unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers.js'
import { initUserFromAccessTokenPayload } from '@backend/database/drizzle/queriesRedis.js'
import { Permission } from '@backend/database/drizzle/schema/enums/Permission.js'

import { createUser, createProfileForUser, createAccessTokenPayloadForUser } from '../../../../drizzleData.js'

describe('initUserFromAccessTokenPayload', () => {
  it('should return the user if he exists', async () => {
    const userData = createUser()
    const profileData = createProfileForUser(userData)

    addData({
      users: [userData],
      profiles: [profileData],
    })

    const userResult = await initUserFromAccessTokenPayload(createAccessTokenPayloadForUser(userData))
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

  it('should insertOrUpdate a user if he doesnt exist yet (including permissions)', async () => {
    const userData = createUser()
    userData.permissions = [Permission.Enum.statistics]

    const userResult = await initUserFromAccessTokenPayload(createAccessTokenPayloadForUser(userData))
    expect(userResult).toEqual(expect.objectContaining({
      id: userData.id,
      lnurlAuthKey: userData.lnurlAuthKey,
      created: expect.any(Number),
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: null,
      profile: {
        displayName: '',
        accountName: '',
        email: '',
      },
      permissions: [Permission.Enum.statistics],
    }))
    expect(queries.insertOrUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: userData.id,
      lnurlAuthKey: userData.lnurlAuthKey,
      created: unixTimestampToDate(userResult.created),
      permissions: [Permission.Enum.statistics],
    }))
  })
})
