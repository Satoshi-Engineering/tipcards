import NotFoundError from '@backend/errors/NotFoundError'

import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/redis/data/BulkWithdraw'
import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import type { Set as SetRedis } from '@backend/database/redis/data/Set'
import type { LandingPage as LandingPageRedis } from '@backend/database/redis/data/LandingPage'
import type { Image as ImageMetaRedis } from '@backend/database/redis/data/Image'
import { User as UserRedis } from '@backend/database/redis/data/User'
import hashSha256 from '@backend/services/hashSha256'

import {
  getRedisCardFromDrizzleCardVersion,
  redisLandingPageFromDrizzleLandingPage,
  redisUserFromDrizzleUser,
  redisUserFromDrizzleUserOrNull,
} from './transforms/redisDataFromDrizzleData'
import {
  getDrizzleDataObjectsFromRedisCard,
  getDrizzleLnurlWFromRedisBulkWithdraw,
  getUserIdForRedisImageFromDrizzleImage,
} from './transforms/drizzleDataFromRedisData'
import { getDrizzleDataObjectsForRedisCardChanges } from './transforms/drizzleDataForRedisCardChanges'
import { getDrizzleDataObjectsForRedisCardDelete } from './transforms/drizzleDataForRedisCardDelete'
import { getRedisSetFromDrizzleSet } from './transforms/redisSetDataFromDrizzleData'
import {
  getDrizzleDataObjectsForRedisSet,
  getDrizzleDataObjectsForRedisSetDelete,
} from './transforms/drizzleSetDataForRedisSet'
import { getRedisBulkWithdrawForDrizzleLnurlW, filterLnurlWsThatAreUsedForMultipleCards } from './transforms/redisBulkWithdrawDataFromDrizzleData'
import { getDrizzleDataObjectsForRedisUser } from './transforms/drizzleDataFromRedisUserData'
import {
  insertOrUpdateDataObjects,
  updateDataObjects, deleteDataObjects,
} from './batchQueries'
import {
  getLatestCardVersion,
  getSetById as getDrizzleSetById,
  getSetsByUserId as getDrizzleSetsByUserId,
  getLandingPage as getDrizzleLandingPage,
  getAllLandingPages as getDrizzleAllLandingPages,
  getUserById as getDrizzleUserById,
  getUserByLnurlAuthKey as getDrizzleUserByLnurlAuthKey,
  getAllUsers as getAllDrizzleUsers,
  getLnurlWById,
  getAllLnurlWs,
  insertOrUpdateLnurlW,
  updateCardVersion,
  getImageById,
  deleteAllAllowedRefreshTokensForUserId,
} from './queries'

/** @throws */
export const getCardByHash = async (cardHash: string): Promise<CardRedis | null> => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    return null
  }
  return getRedisCardFromDrizzleCardVersion(cardVersion)
}

/** @throws */
export const createCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = getDrizzleDataObjectsFromRedisCard(cardRedis)
  await insertOrUpdateDataObjects(drizzleData)
}

/** @throws */
export const updateCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisCardChanges(cardRedis)
  await insertOrUpdateDataObjects(drizzleData.insertOrUpdate)
  await deleteDataObjects(drizzleData.delete)
}

/** @throws */
export const deleteCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisCardDelete(cardRedis)
  await deleteDataObjects(drizzleData)
}

/** @throws */
export const getSetById = async (setId: SetRedis['id']): Promise<SetRedis | null> => {
  const set = await getDrizzleSetById(setId)
  if (set == null) {
    return null
  }
  return getRedisSetFromDrizzleSet(set)
}

/** @throws */
export const getSetsByUserId = async (userId: string): Promise<SetRedis[]> => {
  const sets = await getDrizzleSetsByUserId(userId)
  const setsRedis = await Promise.all(sets.map((set) => getRedisSetFromDrizzleSet(set)))
  return setsRedis
}

/** @throws */
export const createSet = async (set: SetRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisSet(set)
  await insertOrUpdateDataObjects(drizzleData.insertOrUpdate)
}

/** @throws */
export const updateSet = async (set: SetRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisSet(set)
  await insertOrUpdateDataObjects(drizzleData.insertOrUpdate)
  await deleteDataObjects(drizzleData.delete)
}

/** @throws */
export const deleteSet = async (set: SetRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisSetDelete(set)
  await updateDataObjects(drizzleData.update)
  await deleteDataObjects(drizzleData.delete)
}

export const createBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis): Promise<void> => {
  const lnurlW = getDrizzleLnurlWFromRedisBulkWithdraw(bulkWithdraw)
  await insertOrUpdateLnurlW(lnurlW)
  linkLatestCardVersionsToLnurlW(bulkWithdraw.cards, lnurlW.lnbitsId)
}
const linkLatestCardVersionsToLnurlW = async (cardHashes: CardRedis['cardHash'][], lnurlWlnbitsId: BulkWithdrawRedis['lnbitsWithdrawId']) => {
  await Promise.all(
    cardHashes.map(async (cardHash) => linkLatestCardVersionToLnurlW(cardHash, lnurlWlnbitsId)),
  )
}
const linkLatestCardVersionToLnurlW = async (cardHash: CardRedis['cardHash'], lnurlWlnbitsId: BulkWithdrawRedis['lnbitsWithdrawId']) => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    throw new NotFoundError(`Card ${cardHash} not found.`)
  }
  await updateCardVersion({
    ...cardVersion,
    lnurlW: lnurlWlnbitsId,
  })
}

/** @throws */
export const getBulkWithdrawById = async (lnbitsLnurlWId: string): Promise<BulkWithdrawRedis> => {
  const lnurlW = await getLnurlWById(lnbitsLnurlWId)
  if (lnurlW == null) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  const bulkWithdrawRedis = getRedisBulkWithdrawForDrizzleLnurlW(lnurlW)
  return bulkWithdrawRedis
}

/** @throws */
export const updateBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis): Promise<void> => {
  const lnurlW = getDrizzleLnurlWFromRedisBulkWithdraw(bulkWithdraw)
  await insertOrUpdateLnurlW(lnurlW)
}

/** @throws */
export const deleteBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis): Promise<void> => {
  await getBulkWithdrawById(bulkWithdraw.lnbitsWithdrawId)
  await unlinkLatestCardVersionsFromLnurlW(bulkWithdraw.cards)
}
const unlinkLatestCardVersionsFromLnurlW = async (cardHashes: CardRedis['cardHash'][]) => {
  await Promise.all(
    cardHashes.map(unlinkLatestCardVersionFromLnurlW),
  )
}
const unlinkLatestCardVersionFromLnurlW = async (cardHash: CardRedis['cardHash']) => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    throw new NotFoundError(`Card ${cardHash} not found.`)
  }
  await updateCardVersion({
    ...cardVersion,
    lnurlW: null,
  })
}

/** @throws */
export const getAllBulkWithdraws = async (): Promise<BulkWithdrawRedis[]> => {
  const allLnurlWs = await getAllLnurlWs()
  const lnurlWsForMultipleCards = await filterLnurlWsThatAreUsedForMultipleCards(allLnurlWs)
  const bulkWithdraws = await Promise.all(
    lnurlWsForMultipleCards.map(
      async ({ lnbitsId }) => await getBulkWithdrawById(lnbitsId),
    ),
  )
  return bulkWithdraws
}

/**
 * @param landingPageId string
 * @throws
 */
export const getLandingPage = async (landingPageId: string): Promise<LandingPageRedis | null> => {
  const landingPageDrizzle = await getDrizzleLandingPage(landingPageId)
  return redisLandingPageFromDrizzleLandingPage(landingPageDrizzle)
}

/**
 * @throws
 */
export const getAllLandingPages = async (): Promise<LandingPageRedis[]> => {
  const landingPagesDrizzle = await getDrizzleAllLandingPages()

  return Promise.all(landingPagesDrizzle.map(async (landingPageDrizzle) => {
    const landingPage = await redisLandingPageFromDrizzleLandingPage(landingPageDrizzle)
    if (landingPage === null) {
      throw new Error('not implemented (Due: In redis not valid, but in Drizzle it would be)')
    }
    return landingPage
  }))
}

/**
 * @param imageId string
 * @throws
 */
export const getImageMeta = async (imageId: ImageMetaRedis['id']): Promise<ImageMetaRedis | null> => {
  const imageDrizzle = await getImageById(imageId)
  if (imageDrizzle == null) {
    return null
  }
  return {
    id: imageDrizzle.id,
    type: imageDrizzle.type,
    name: imageDrizzle.name,
    userId: await (getUserIdForRedisImageFromDrizzleImage(imageDrizzle)),
  }
}

/** @throws */
export const getImageAsString = async (imageId: string): Promise<string | null> => {
  const imageDrizzle = await getImageById(imageId)
  if (imageDrizzle == null) {
    return null
  }
  return imageDrizzle.data
}

/** @throws */
export const getUserByLnurlAuthKeyOrCreateNew = async (lnurlAuthKey: UserRedis['lnurlAuthKey']): Promise<UserRedis> => {
  let user = await getUserByLnurlAuthKey(lnurlAuthKey)
  if (user != null) {
    return user
  }
  const userId = hashSha256(lnurlAuthKey)
  user = UserRedis.parse({
    id: userId,
    lnurlAuthKey,
    created: Math.floor(+ new Date() / 1000),
  })
  await createUser(user)
  return user
}

/** @throws */
export const getUserById = async (userId: string): Promise<UserRedis | null> => {
  const user = await getDrizzleUserById(userId)
  return redisUserFromDrizzleUserOrNull(user)
}

/** @throws */
export const getUserByLnurlAuthKey = async (lnurlAuthKey: string): Promise<UserRedis | null> => {
  const user = await getDrizzleUserByLnurlAuthKey(lnurlAuthKey)
  return redisUserFromDrizzleUserOrNull(user)
}

/** @throws */
export const getAllUsers = async (): Promise<UserRedis[]> => {
  const users = await getAllDrizzleUsers()
  return (await Promise.all(users.map(async (user) => redisUserFromDrizzleUser(user))))
    .filter((user) => user != null)
}

/** @throws */
export const createUser = async (user: UserRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisUser(user)
  await insertOrUpdateDataObjects(drizzleData)
}

/** @throws */
export const updateUser = async (user: UserRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisUser(user)
  await deleteAllAllowedRefreshTokensForUserId(user.id)
  await insertOrUpdateDataObjects(drizzleData)
}
