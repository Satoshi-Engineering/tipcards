import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'

import { unixTimestampToDate } from '@backend/database/deprecated/transforms/dateHelpers.js'
import { createUser } from '@backend/database/deprecated/queries.js'

import {
  createUser as createUserData,
} from '../../../redisData.js'

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
