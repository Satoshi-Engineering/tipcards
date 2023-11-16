import { randomUUID } from 'crypto'

import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { cardRedisFromCardDrizzle } from './transforms/cardRedisFromCardDrizzle'
import { getLatestCardVersion, createCards, createCardVerions } from './queries'

/** @throws */
export const getCardByHash = async (cardHash: string): Promise<CardRedis | null> => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    return null
  }
  return cardRedisFromCardDrizzle(cardVersion)
}

/** @throws */
export const createCard = async (card: CardRedis): Promise<void> => {
  await createCards({
    hash: card.cardHash,
    created: new Date(),
    set: null,
  })
  await createCardVerions({
    id: randomUUID(),
    card: card.cardHash,
    created: new Date(),
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: card.text,
    noteForStatusPage: card.note,
    sharedFunding: !!card.lnurlp?.shared,
    landingPageViewed: card.landingPageViewed != null ? new Date(card.landingPageViewed * 1000) : null,
  })

  // todo : handle invoice, lnurlp, setFunding (all usecases)
}

/** @throws */
export const updateCard = async (card: CardRedis): Promise<void> => {
  // todo : implement
}
