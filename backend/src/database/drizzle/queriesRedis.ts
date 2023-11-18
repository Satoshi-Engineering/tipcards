import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { getRedisCardFromDrizzleCardVersion } from './transforms/redisDataFromDrizzleData'
import { drizzleDataFromCardRedis } from './transforms/drizzleDataFromCardRedis'
import { getDrizzleChangesForCardRedis } from './transforms/getDrizzleChangesForCardRedis'
import {
  getLatestCardVersion,
  insertCards,
  insertCardVersions,
  insertInvoices,
  insertCardVersionInvoices,
  insertLnurlPs,
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
  const drizzleData = drizzleDataFromCardRedis(cardRedis)
  await insertLnurlPs(...dataObjectToArray(drizzleData.lnurlp))
  await insertCards(drizzleData.card)
  await insertCardVersions(drizzleData.cardVersion)
  await insertInvoices(...dataObjectToArray(drizzleData.invoice))
  await insertCardVersionInvoices(...dataObjectToArray(drizzleData.cardVersionInvoice))
}

/** @throws */
export const updateCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleChanges = await getDrizzleChangesForCardRedis(cardRedis)

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

export const dataObjectToArray = <T>(dataObject: T | undefined | null): T[] => {
  if (dataObject == null) {
    return []
  }
  return [dataObject]
}
