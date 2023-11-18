import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { getRedisCardFromDrizzleCardVersion } from './transforms/redisDataFromDrizzleData'
import { getDrizzleDataObjectsFromRedisCard } from './transforms/drizzleDataFromRedisData'
import { getDrizzleDataObjectsForRedisCardChanges } from './transforms/drizzleDataForRedisCardChanges'
import { getDrizzleDataObjectsForRedisCardDelete } from './transforms/drizzleDataForRedisCardDelete'
import { insertDataObjects, insertOrUpdateDataObjects, deleteDataObjects } from './batchQueries'
import { getLatestCardVersion } from './queries'

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
