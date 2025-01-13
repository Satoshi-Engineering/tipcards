import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'

import {
  createUser as createRedisUser,
  createProfile as createProfileForRedisUser,
} from '../../../redisData.js'

import { unixTimestampToDate } from '@backend/database/deprecated/transforms/dateHelpers.js'
import { updateUser } from '@backend/database/deprecated/queries.js'

describe('updateUser', () => {
  it('should insertOrUpdate a user and a profile', async () => {
    const user = createRedisUser()
    user.profile = createProfileForRedisUser(user.id)

    await updateUser(user)
    expect(queries.insertOrUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: user.id,
      lnurlAuthKey: user.lnurlAuthKey,
      created: unixTimestampToDate(user.created),
      permissions: [],
    }))
    expect(queries.insertOrUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      accountName: user.profile.accountName,
      displayName: user.profile.displayName,
      email: user.profile.email,
    }))
  })
})
