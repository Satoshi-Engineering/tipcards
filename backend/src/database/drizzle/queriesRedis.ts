import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { getRedisCardFromDrizzleCardVersion } from './transforms/redisDataFromDrizzleData'
import { getDrizzleDataObjectsFromRedisCard } from './transforms/drizzleDataFromRedisData'
import { getDrizzleDataObjectsForRedisCardChanges } from './transforms/drizzleDataForRedisCardChanges'
import { insertDataObjects } from './batchQueries'
import {
  getLatestCardVersion,
  updateCardVesion,
  insertOrUpdateInvoice,
  insertOrUpdateCardVersionInvoice,
  insertOrUpdateLnurlP,
  insertOrUpdateLnurlW,
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
  const drizzleChanges = await getDrizzleDataObjectsForRedisCardChanges(cardRedis)

  if (drizzleChanges.changes.lnurlp != null) {
    await insertOrUpdateLnurlP(drizzleChanges.changes.lnurlp)
  }
  if (drizzleChanges.changes.lnurlw != null) {
    await insertOrUpdateLnurlW(drizzleChanges.changes.lnurlw)
  }
  await updateCardVesion(drizzleChanges.changes.cardVersion)
  await Promise.all(drizzleChanges.changes.invoices.map(async ({ invoice, cardVersionInvoice }) => {
    await insertOrUpdateInvoice(invoice)
    await insertOrUpdateCardVersionInvoice(cardVersionInvoice)
  }))
}
