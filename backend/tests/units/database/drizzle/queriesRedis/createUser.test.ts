import '../../../mocks/process.env'
import { queries } from '../mocks/client'

import { unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers'
import { createUser } from '@backend/database/drizzle/queriesRedis'

import {
  createUser as createUserData,
} from '../../../../redisData'

describe('createUser', () => {
  it('should insertOrUpdate a user', async () => {
    const user = createUserData()

    await createUser(user)
    expect(queries.insertOrUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: user.id,
      lnurlAuthKey: user.lnurlAuthKey,
      created: unixTimestampToDate(user.created),
      permissions: [],
    }))
  })
})
