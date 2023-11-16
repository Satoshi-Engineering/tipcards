import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { cardRedisFromCardDrizzle } from './transforms/cardRedisFromCardDrizzle'
import { getLatestCardVersion } from './queries'

/** @throws */
export const getCardByHash = async (cardHash: string): Promise<CardRedis | null> => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    return null
  }
  return cardRedisFromCardDrizzle(cardVersion)
}

/** @throws */
export const updateCard = async (card: CardRedis): Promise<void> => {
  // todo : implement
}
