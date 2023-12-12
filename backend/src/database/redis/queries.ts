import { getClient, INDEX_USER_BY_LNURL_AUTH_KEY, INDEX_SETS_BY_USER_ID } from './client'

import type { AccessTokenPayload } from '@shared/data/auth'
import { ErrorCode } from '@shared/data/Errors'

import { BulkWithdraw as ZodBulkWithdraw, type BulkWithdraw } from '@backend/database/redis/data/BulkWithdraw'
import { Card as ZodCard, type Card } from '@backend/database/redis/data/Card'
import { Set as ZodSet, type Set } from '@backend/database/redis/data/Set'
import { User as ZodUser, type User } from '@backend/database/redis/data/User'
import { Image as ZodImage, type Image as ImageMeta } from '@backend/database/redis/data/Image'
import { LandingPage as ZodLandingPage, type LandingPage } from '@backend/database/redis/data/LandingPage'
import AlreadyExistsError from '@backend/errors/AlreadyExistsError'
import NotFoundError from '@backend/errors/NotFoundError'
import hashSha256 from '@backend/services/hashSha256'
import { REDIS_BASE_PATH } from '@backend/constants'

/**
 * @throws ZodError
 * @throws unknown
 */
export const getCardByHash = async (cardHash: string): Promise<Card | null> => {
  const client = await getClient()
  const card = await client.json.get(`${REDIS_BASE_PATH}:cardsByHash:${cardHash}:data`)
  if (card == null) {
    return null
  }
  return ZodCard.parse(card)
}

/**
 * @param card Card
 * @throws
 */
export const createCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (exists) {
    throw new Error(`Card ${card.cardHash} already exists.`)
  }
  await client.json.set(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`, '$', card)
}

/**
 * @throws unknown
 */
export const updateCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (!exists) {
    throw new Error('Card doesn\'t exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`, '$', card)
}

/**
 * @param card Card
 * @throws
 */
export const deleteCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (!exists) {
    throw new Error('Card doesn\'t exists.')
  }
  await client.del(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
}

/**
 * @param setId string
 * @throws
 */
export const getSetById = async (setId: string): Promise<Set | null> => {
  const client = await getClient()
  const set = await client.json.get(`${REDIS_BASE_PATH}:setsById:${setId}:data`)
  if (set == null) {
    return null
  }
  return ZodSet.parse(set)
}

export const getSetsByUserId = async (userId: string): Promise<Set[]> => {
  const client = await getClient()
  const result = await client.ft.search(
    INDEX_SETS_BY_USER_ID,
    `@userId:${userId.replace(/-/g, '')}`,
    { LIMIT: { from: 0, size: 1000 } },
  )
  if (result.total > result.documents.length) {
    console.error(ErrorCode.TooManySetsForUser, `User ${userId} has more than ${result.documents.length} sets. This is currently not supported.`)
  }
  return result.documents
    .filter(({ id }) => new RegExp(`^${REDIS_BASE_PATH}:setsById:[A-z0-9-]+:data$`).test(id))
    .map(({ value }) => ZodSet.parse(value))
}

/**
 * @param set Set
 * @throws
 */
export const createSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
  if (exists) {
    throw new Error('Set already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:setsById:${set.id}:data`, '$', set)
}

/**
 * @param set Set
 * @throws
 */
export const updateSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
  if (!exists) {
    throw new Error('Set doesn\'t exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:setsById:${set.id}:data`, '$', set)
}

export const deleteSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
  if (!exists) {
    throw new Error('Set doesn\'t exists.')
  }
  await client.del(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
}

/**
 * @param user User
 * @throws
 */
export const createUser = async (user: User): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:usersById:${user.id}:data`)
  if (exists) {
    throw new Error('User already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:usersById:${user.id}:data`, '$', user)
}

/**
 * @param user User
 * @throws
 */
export const updateUser = async (user: User): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:usersById:${user.id}:data`)
  if (!exists) {
    throw new Error('User doesn\'t exist.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:usersById:${user.id}:data`, '$', user)
}

/**
 * @param userId string
 * @throws
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const client = await getClient()
  const user = await client.json.get(`${REDIS_BASE_PATH}:usersById:${userId}:data`)
  if (user == null) {
    return null
  }
  return ZodUser.parse(user)
}

/**
 * @param lnurlAuthKey string
 * @throws
 */
export const getUserByLnurlAuthKey = async (lnurlAuthKey: string): Promise<User | null> => {
  const client = await getClient()
  const result = await client.ft.search(INDEX_USER_BY_LNURL_AUTH_KEY, `@lnurlAuthKey:${lnurlAuthKey}`)
  const user = result.documents
    .filter(({ id }) => new RegExp(`^${REDIS_BASE_PATH}:usersById:[A-z0-9-]+:data$`).test(id))
    .map(({ value }) => {
      try {
        return ZodUser.parse(value)
      } catch (error) {
        console.error(ErrorCode.ZodErrorParsingUserByLnurlAuthKey, lnurlAuthKey, error)
        return null
      }
    })
    .filter((user) => user != null) as User[]
  if (user.length === 0) {
    return null
  } else if (user.length > 1) {
    console.error(ErrorCode.FoundMultipleUsersForLnurlAuthKey, lnurlAuthKey)
    return user.sort((a, b) => a.created - b.created)[0] // select the oldest
  }
  return ZodUser.parse(user[0])
}

/**
 * @throws
 */
export const getAllUsers = async (): Promise<User[]> => {
  const client = await getClient()
  const users: User[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:usersById:*:data`,
    })
  ) {
    const userResult = await client.json.get(key)
    try {
      users.push(ZodUser.parse(userResult))
    } catch (error) {
      console.error(ErrorCode.ZodErrorParsingUserByKey, key, error)
    }
  }
  return users
}

/**
 * @param lnurlAuthKey string
 * @throws
 */
export const getUserByLnurlAuthKeyOrCreateNew = async (lnurlAuthKey: string): Promise<User> => {
  let user = await getUserByLnurlAuthKey(lnurlAuthKey)
  if (user != null) {
    return user
  }
  const userId = hashSha256(lnurlAuthKey)
  user = ZodUser.parse({
    id: userId,
    lnurlAuthKey,
    created: Math.floor(+ new Date() / 1000),
  })
  await createUser(user)
  return user
}

/** @throws */
export const initUserFromAccessTokenPayload = async (accessTokenPayload: AccessTokenPayload): Promise<User> => {
  let user = await getUserById(accessTokenPayload.id)
  if (user != null) {
    return user
  }
  user = ZodUser.parse({
    id: accessTokenPayload.id,
    lnurlAuthKey: accessTokenPayload.lnurlAuthKey,
    created: Math.floor(+ new Date() / 1000),
    permissions: accessTokenPayload.permissions,
  })
  await createUser(user)
  return user
}

/**
 * @param imageId string
 * @throws
 */
export const getImageMeta = async (imageId: string): Promise<ImageMeta | null> => {
  const client = await getClient()
  const image = await client.json.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:meta`)
  if (image == null) {
    return null
  }
  return ZodImage.parse(image)
}

/**
 * @param imageId string
 * @throws
 */
export const getImageAsString = async (imageId: string): Promise<string | null> => {
  const client = await getClient()
  const image: string | null = await client.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:data`) as string | null
  return image
}

/**
 * @param landingPageId string
 * @throws
 */
export const getLandingPage = async (landingPageId: string): Promise<LandingPage | null> => {
  const client = await getClient()
  const landingPage = await client.json.get(`${REDIS_BASE_PATH}:landingPagesById:${landingPageId}:data`)
  if (landingPage == null) {
    return null
  }
  return ZodLandingPage.parse(landingPage)
}

/**
 * @throws AlreadyExistsError
 * @throws unknown
 */
export const createBulkWithdraw = async (bulkWithdraw: BulkWithdraw): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
  if (exists) {
    throw new AlreadyExistsError(`Unable to create bulkWithdraw ${bulkWithdraw.id} in Redis. It already exists.`)
  }
  await client.json.set(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`, '$', bulkWithdraw)
}

/**
 * @throws NotFoundError
 * @throws unknown
 */
export const getBulkWithdrawById = async (id: string): Promise<BulkWithdraw> => {
  const client = await getClient()
  const bulkWithdraw = await client.json.get(`${REDIS_BASE_PATH}:bulkWithdrawById:${id}:data`)
  if (bulkWithdraw == null) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  return ZodBulkWithdraw.parse(bulkWithdraw)
}

/**
 * @throws NotFoundError
 * @throws unknown
 */
export const updateBulkWithdraw = async (bulkWithdraw: BulkWithdraw): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
  if (!exists) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`, '$', bulkWithdraw)
}

/**
 * @throws NotFoundError
 * @throws unknown
 */
export const deleteBulkWithdraw = async (bulkWithdraw: BulkWithdraw): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
  if (!exists) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  await client.del(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
}

/**
 * @throws unknown
 */
export const getAllBulkWithdraws = async (): Promise<BulkWithdraw[]> => {
  const client = await getClient()
  const bulkWithdraws: BulkWithdraw[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:bulkWithdrawById:*:data`,
    })
  ) {
    const bulkWithdraw = await client.json.get(key)
    bulkWithdraws.push(ZodBulkWithdraw.parse(bulkWithdraw))
  }
  return bulkWithdraws
}

/**
 * @throws
 */
export const getAllLandingPages = async (): Promise<LandingPage[]> => {
  const client = await getClient()
  const landingPages: LandingPage[] = []
  for await (
    const key of client.scanIterator({
    MATCH: `${REDIS_BASE_PATH}:landingPagesById:*:data`,
  })
    ) {
    const landingPageResult = await client.json.get(key)
    landingPages.push(ZodLandingPage.parse(landingPageResult))
  }
  return landingPages
}
