import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import type { Set as SetRedis } from '@backend/database/redis/data/Set'

import { getRedisCardFromDrizzleCardVersion } from './transforms/redisDataFromDrizzleData'
import { getDrizzleDataObjectsFromRedisCard } from './transforms/drizzleDataFromRedisData'
import { getDrizzleDataObjectsForRedisCardChanges } from './transforms/drizzleDataForRedisCardChanges'
import { getDrizzleDataObjectsForRedisCardDelete } from './transforms/drizzleDataForRedisCardDelete'
import { getRedisSetFromDrizzleSet } from './transforms/redisSetDataFromDrizzleData'
import { getDrizzleDataObjectsForRedisSet } from './transforms/drizzleDataForRedisSet'
import { insertDataObjects, insertOrUpdateDataObjects, deleteDataObjects } from './batchQueries'
import {
  getLatestCardVersion,
  getSetById as getDrizzleSetById,
  getSetsByUserId as getDrizzleSetsByUserId,
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
  await insertDataObjects(drizzleData)
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
  const drizzleData = getDrizzleDataObjectsForRedisSet(set)
  await insertOrUpdateDataObjects(drizzleData)
}
