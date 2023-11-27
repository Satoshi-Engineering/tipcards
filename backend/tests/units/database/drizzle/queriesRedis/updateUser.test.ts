import '../../../mocks/process.env'
import {
  insertOrUpdateUser,
  insertOrUpdateProfile,
  insertOrUpdateAllowedRefreshTokens,
} from '../mocks/queries'

import { unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers'
import { updateUser } from '@backend/database/drizzle/queriesRedis'

import {
  createUser as createUserData,
  createProfile as createProfileForUser,
  createAllowedRefreshTokens,
} from '../../../../redisData'
import hashSha256 from '@backend/services/hashSha256'

describe('updateUser', () => {
  it('should insertOrUpdate a user and a profile', async () => {
    const user = createUserData()
    user.profile = createProfileForUser(user.id)

    await updateUser(user)
    expect(insertOrUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: user.id,
      lnurlAuthKey: user.lnurlAuthKey,
      created: unixTimestampToDate(user.created),
      permissions: '[]',
    }))
    expect(insertOrUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      accountName: user.profile.accountName,
      displayName: user.profile.displayName,
      email: user.profile.email,
    }))
  })

  it('should update the allowed refresh tokens', async () => {
    const user = createUserData()
    user.allowedRefreshTokens = createAllowedRefreshTokens()

    await updateUser(user)
    expect(insertOrUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: user.id,
      lnurlAuthKey: user.lnurlAuthKey,
      created: unixTimestampToDate(user.created),
      permissions: '[]',
    }))

    expect(insertOrUpdateAllowedRefreshTokens).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      hash: hashSha256(`${user.id}${user.allowedRefreshTokens[0][0]}${user.allowedRefreshTokens[0][1]}`),
      current: user.allowedRefreshTokens[0][0],
      previous: user.allowedRefreshTokens[0][1],
    }))
    expect(insertOrUpdateAllowedRefreshTokens).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      hash: hashSha256(`${user.id}${user.allowedRefreshTokens[1][0]}`),
      current: user.allowedRefreshTokens[1][0],
      previous: null,
    }))
  })
})
