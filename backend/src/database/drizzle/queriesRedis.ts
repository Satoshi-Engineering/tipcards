import { randomUUID } from 'crypto'

import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { cardRedisFromCardDrizzle } from './transforms/cardRedisFromCardDrizzle'
import {
  getLatestCardVersion,
  insertCards, insertCardVerions,
  insertInvoices, insertCardVersionInvoices,
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
export const createCard = async (card: CardRedis): Promise<void> => {
  await insertCards({
    hash: card.cardHash,
    created: new Date(),
    set: null,
  })
  const cardVersion = {
    id: randomUUID(),
    card: card.cardHash,
    created: new Date(),
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: card.text,
    noteForStatusPage: card.note,
    sharedFunding: !!card.lnurlp?.shared,
    landingPageViewed: dateFromUnixTimestampOrNull(card.landingPageViewed),
  }
  await insertCardVerions(cardVersion)
  if (card.invoice != null) {
    await insertInvoices({
      amount: card.invoice.amount,
      paymentHash: card.invoice.payment_hash,
      paymentRequest: card.invoice.payment_request,
      created: new Date(card.invoice.created * 1000),
      paid: dateFromUnixTimestampOrNull(card.invoice.paid),
      expiresAt: new Date((card.invoice.created + 300) * 1000),
      extra: '',
    })
    await insertCardVersionInvoices({
      cardVersion: cardVersion.id,
      invoice: card.invoice.payment_hash,
    })
  }
}

/** @throws */
export const updateCard = async (card: CardRedis): Promise<void> => {
  // todo : implement
}

const dateFromUnixTimestampOrNull = (timestamp: number | null) => {
  if (timestamp == null) {
    return null
  }
  return new Date(timestamp * 1000)
}
