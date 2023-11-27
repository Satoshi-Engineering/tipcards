import '../../../mocks/process.env'
import { insertOrUpdateUser, insertOrUpdateProfile } from '../mocks/queries'

import { unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers'
import { updateUser } from '@backend/database/drizzle/queriesRedis'

import {
  createUser as createUserData,
  createProfile as createProfileForUser,
} from '../../../../redisData'

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
})
