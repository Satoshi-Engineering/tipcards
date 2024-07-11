import { describe, it, expect } from 'vitest'

import '../../../mocks/process.env'
import { queries } from '../mocks/client.js'

import { unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers.js'
import { createUser } from '@backend/database/drizzle/queriesRedis.js'

import {
  createUser as createUserData,
} from '../../../../redisData.js'

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
