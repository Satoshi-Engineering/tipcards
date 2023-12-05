import { randomUUID } from 'crypto'

import '../../../mocks/process.env'
import {
  insertOrUpdateUser,
  insertOrUpdateProfile,
  insertOrUpdateAllowedRefreshTokens,
  getAllAllowedRefreshTokensForUserId,
} from '../mocks/queries'

import {
  createUser as createUserData,
  createProfile as createProfileForUser,
} from '../../../../redisData'

import { unixTimestampToDate } from '@backend/database/drizzle/transforms/dateHelpers'
import { updateUser } from '@backend/database/drizzle/queriesRedis'
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

  it('should call insertOrUpdateAllowedRefreshTokens with the correct data upon calling updateUser', async () => {
    const user = createUserData()
    user.allowedRefreshTokens = [
      [hashSha256(randomUUID()), hashSha256(randomUUID())],
      [hashSha256(randomUUID())],
    ]

    await updateUser(user)

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
    expect(await getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        {
          user: user.id,
          hash: hashSha256(`${user.id}${user.allowedRefreshTokens[0][0]}${user.allowedRefreshTokens[0][1]}`),
          current: user.allowedRefreshTokens[0][0],
          previous: user.allowedRefreshTokens[0][1],
        },
        {
          user: user.id,
          hash: hashSha256(`${user.id}${user.allowedRefreshTokens[1][0]}`),
          current: user.allowedRefreshTokens[1][0],
          previous: null,
        },
      ],
    )
  })

  // todo : description doesnt match the actual test
  it('should cycle allowed refresh tokens (add a new pair and remove the old pair so that the old "previous" token is no longer valid)', async () => {
    const user = createUserData()

    const unrelatedTokenPair = [hashSha256(randomUUID()), hashSha256(randomUUID())]
    const unrelatedTokenPairDrizzle = redisTokenPairToDrizzleTokenPair(unrelatedTokenPair, user.id)

    const originalRefreshTokenCurrent = hashSha256(randomUUID())
    
    user.allowedRefreshTokens = [
      [originalRefreshTokenCurrent],
      unrelatedTokenPair,
    ]

    // todo : remove this, instead push the drizzle objects into the mock database directly. only to one action+tests (in this case: the updateUser in line 115) per unit test
    await updateUser(user)

    expect(await getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        {
          user: user.id,
          hash: hashSha256(`${user.id}${originalRefreshTokenCurrent}`),
          current: originalRefreshTokenCurrent,
          previous: null,
        },
        unrelatedTokenPairDrizzle,
      ],
    )

    const newRefreshTokenCurrent = hashSha256(randomUUID())

    user.allowedRefreshTokens = [
      [newRefreshTokenCurrent, originalRefreshTokenCurrent],
      unrelatedTokenPair,
    ]

    await updateUser(user)

    expect(await getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        {
          user: user.id,
          hash: hashSha256(`${user.id}${newRefreshTokenCurrent}${originalRefreshTokenCurrent}`),
          current: newRefreshTokenCurrent,
          previous: originalRefreshTokenCurrent,
        },
        unrelatedTokenPairDrizzle,
      ],
    )
  })

  it('deletes tokenPairs that are omitted (use case: log out all other devices)', async () => {
    // structure inside a unit test, take a look at updateSet.test.ts (also apply it to previous test)
    // 1. init drizzle mock database with drizzle objects (user + allowed refresh token)

    // 2. create redis user object (using data from 1.)

    // 3. call updateUser + tests (expect...)

    const user = createUserData()

    const remainingTokenPair = [hashSha256(randomUUID()), hashSha256(randomUUID())]
    const remainingTokenPairDrizzle = redisTokenPairToDrizzleTokenPair(remainingTokenPair, user.id)
    
    user.allowedRefreshTokens = [
      [hashSha256(randomUUID()), hashSha256(randomUUID())],
      remainingTokenPair,
      [hashSha256(randomUUID()), hashSha256(randomUUID())],
      [hashSha256(randomUUID()), hashSha256(randomUUID())],
    ]

    // todo : same as test before, init database directly, only call updateUser once
    await updateUser(user)

    expect(await getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        redisTokenPairToDrizzleTokenPair(user.allowedRefreshTokens[0], user.id),
        remainingTokenPairDrizzle,
        redisTokenPairToDrizzleTokenPair(user.allowedRefreshTokens[2], user.id),
        redisTokenPairToDrizzleTokenPair(user.allowedRefreshTokens[3], user.id),
      ],
    )

    user.allowedRefreshTokens = [
      remainingTokenPair,
    ]

    await updateUser(user)

    expect(await getAllAllowedRefreshTokensForUserId(user.id)).toStrictEqual(
      [
        remainingTokenPairDrizzle,
      ],
    )
  })
})

const redisTokenPairToDrizzleTokenPair = (tokenPair: string[], userId: string) => ({
  user: userId,
  hash: hashSha256(`${userId}${tokenPair[0]}${tokenPair[1]}`),
  current: tokenPair[0],
  previous: tokenPair[1],
})
