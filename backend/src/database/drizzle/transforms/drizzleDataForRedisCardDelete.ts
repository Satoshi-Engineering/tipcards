import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import type { DataObjects } from '@backend/database/drizzle/batchQueries'
import {
  getLatestCardVersion,
  getAllInvoicesFundingCardVersion,
} from '@backend/database/drizzle/queries'

import { getDrizzleCardFromRedisCard } from './drizzleDataFromRedisData'

/** @throws */
export const getDrizzleDataObjectsForRedisCardDelete = async (cardRedis: CardRedis): Promise<DataObjects> => {
  const cardVersion = await getLatestCardVersion(cardRedis.cardHash)
  if (cardVersion == null) {
    throw new Error(`Cannot delete card ${cardRedis.cardHash} as it doesn't exist.`)
  }
  const invoices = await getAllInvoicesFundingCardVersion(cardVersion)
  return {
    cards: [getDrizzleCardFromRedisCard(cardRedis)],
    cardVersions: [cardVersion],
    cardVersionInvoices: invoices.map((invoice) => ({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion.id,
    })),
  }
}
