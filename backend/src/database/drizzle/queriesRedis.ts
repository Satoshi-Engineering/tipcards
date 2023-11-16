import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { cardRedisFromCardDrizzle } from './transforms/cardRedisFromCardDrizzle'
import { drizzleDataFromCardRedis } from './transforms/drizzleDataFromCardRedis'
import {
  getLatestCardVersion,
  insertCards,
  insertCardVersions,
  insertInvoices,
  insertCardVersionInvoices,
  insertLnurlPs,
} from './queries'

/** @throws */
export const getCardByHash = async (cardHash: string): Promise<CardRedis | null> => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    return null
  }
  return cardRedisFromCardDrizzle(cardVersion)
}

/** @throws */
export const createCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = drizzleDataFromCardRedis(cardRedis)
  await insertLnurlPs(...dataObjectToArray(drizzleData.lnurlp))
  await insertCards(drizzleData.card)
  await insertCardVersions(drizzleData.cardVersion)
  await insertInvoices(...dataObjectToArray(drizzleData.invoice))
  await insertCardVersionInvoices(...dataObjectToArray(drizzleData.cardVersionInvoice))
}

/** @throws */
export const updateCard = async (cardRedis: CardRedis): Promise<void> => {
  // todo : implement
}

export const dataObjectToArray = <T>(dataObject: T | undefined | null): T[] => {
  if (dataObject == null) {
    return []
  }
  return [dataObject]
}
