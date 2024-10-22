import { describe, it, expect } from 'vitest'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createUser as createDrizzleUser,
  createProfileForUser as createDrizzleProfileForUser,
  createAllowedRefreshTokensDepricated as createDrizzleAllowedRefreshTokens,
} from '../../../drizzleData.js'

import {
  createUser as createRedisUser,
  createProfile as createProfileForRedisUser,
} from '../../../redisData.js'

import { AllowedRefreshTokens } from '@backend/database/schema/index.js'
import { unixTimestampToDate } from '@backend/database/deprecated/transforms/dateHelpers.js'
import { redisUserFromDrizzleUser } from '@backend/database/deprecated/transforms/redisDataFromDrizzleData.js'
import { updateUser } from '@backend/database/deprecated/queries.js'
import hashSha256 from '@backend/services/hashSha256.js'

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

  it('should call insertOrUpdateAllowedRefreshTokens with the correct data upon calling updateUser', async () => {
    const userRedis = createRedisUser()
    userRedis.allowedRefreshTokens = [
      createRedisTokenPair(true),
      createRedisTokenPair(),
    ]

    await updateUser(userRedis)
    expect(queries.insertOrUpdateAllowedRefreshTokens).toHaveBeenCalledWith(
      drizzleTokenPairFromRedisTokenPair(userRedis.allowedRefreshTokens[0], userRedis.id),
    )
    expect(queries.insertOrUpdateAllowedRefreshTokens).toHaveBeenCalledWith(
      drizzleTokenPairFromRedisTokenPair(userRedis.allowedRefreshTokens[1], userRedis.id),
    )
    expect(await queries.getAllAllowedRefreshTokensForUserId(userRedis.id)).toStrictEqual(
      [
        drizzleTokenPairFromRedisTokenPair(userRedis.allowedRefreshTokens[0], userRedis.id),
        drizzleTokenPairFromRedisTokenPair(userRedis.allowedRefreshTokens[1], userRedis.id),
      ],
    )
  })

  it('should cycle allowed refresh tokens (add a new pair and remove the old pair so that the old "previous" token is no longer valid)', async () => {
    const user = createDrizzleUser()
    const profile = createDrizzleProfileForUser(user)
    const testedTokenPair = createDrizzleAllowedRefreshTokens(user, true)
    const untouchedTokenPair = createDrizzleAllowedRefreshTokens(user, false)
    addData({
      users: [user],
      profiles: [profile],
      allowedRefreshTokens: [testedTokenPair, untouchedTokenPair],
    })

    const userRedis = await redisUserFromDrizzleUser(queries, user)
    if (userRedis.allowedRefreshTokens == null) {
      userRedis.allowedRefreshTokens = []
    }
    userRedis.allowedRefreshTokens[0] = pushNewCurrentRefreshTokenIntoRedisTokenPair(userRedis.allowedRefreshTokens[0])

    await updateUser(userRedis)
    expect(await queries.getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        drizzleTokenPairFromRedisTokenPair(userRedis.allowedRefreshTokens[0], user.id),
        untouchedTokenPair,
      ],
    )
  })

  it('deletes tokenPairs that are omitted (use case: log out all other devices)', async () => {
    const user = createDrizzleUser()
    const profile = createDrizzleProfileForUser(user)
    const tokenPairOfCurrentDevice = createDrizzleAllowedRefreshTokens(user, true)
    const tokenPairOfOtherDevice1 = createDrizzleAllowedRefreshTokens(user, false)
    const tokenPairOfOtherDevice2 = createDrizzleAllowedRefreshTokens(user, false)
    const tokenPairOfOtherDevice3 = createDrizzleAllowedRefreshTokens(user, false)
    addData({
      users: [user],
      profiles: [profile],
      allowedRefreshTokens: [tokenPairOfOtherDevice1, tokenPairOfCurrentDevice, tokenPairOfOtherDevice2, tokenPairOfOtherDevice3],
    })

    const userRedis = await redisUserFromDrizzleUser(queries, user)
    userRedis.allowedRefreshTokens = [
      redisTokenPairFromDrizzleTokenPair(tokenPairOfCurrentDevice),
    ]

    await updateUser(userRedis)
    expect(await queries.getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        tokenPairOfCurrentDevice,
      ],
    )
  })
})

const createRedisTokenPair = (hasPrevious = false) => [
  hashSha256(randomUUID()),
  ...(hasPrevious ? [hashSha256(randomUUID())] : []),
]
const pushNewCurrentRefreshTokenIntoRedisTokenPair = (tokenPair: string[] | null): string[] => [
  hashSha256(randomUUID()),
  ...(tokenPair != null ? [tokenPair[0]] : []),
]
const drizzleTokenPairFromRedisTokenPair = (tokenPair: string[], userId: string) => ({
  user: userId,
  hash: hashSha256(`${userId}${tokenPair[0]}${tokenPair[1] || ''}`),
  current: tokenPair[0],
  previous: tokenPair[1] || null,
})
const redisTokenPairFromDrizzleTokenPair = (tokenPair: AllowedRefreshTokens): string[] => [
  tokenPair.current,
  ...(tokenPair.previous ? [tokenPair.previous] : []),
]
