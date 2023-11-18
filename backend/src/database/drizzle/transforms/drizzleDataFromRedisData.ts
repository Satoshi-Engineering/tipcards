import { randomUUID } from 'crypto'

import {
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
} from '@backend/database/drizzle/schema'
import type { DataObjectsForInsert } from '@backend/database/drizzle/batchQueries'
import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { unixTimestampOrNullToDate, unixTimestampToDate } from './dateHelpers'

export const getDrizzleDataObjectsFromRedisCard = (cardRedis: CardRedis): DataObjectsForInsert => {
  const card = getDrizzleCardFromRedisCard(cardRedis)
  const cardVersion = getDrizzleCardVersionFromRedisCard(cardRedis)
  const lnurlP = getAndLinkDrizzleLnurlPFromRedisLnurlP(cardRedis.lnurlp, cardVersion)
  const { invoice, cardVersionInvoice } = getDrizzleInvoiceFromRedisInvoice(cardRedis.invoice, cardVersion)
  return {
    card,
    cardVersion,
    lnurlP,
    invoice,
    cardVersionInvoice,
  }
}

export const getDrizzleCardFromRedisCard = (cardRedis: CardRedis): Card => ({
  hash: cardRedis.cardHash,
  created: new Date(),
  set: null,
})

export const getDrizzleCardVersionFromRedisCard = (cardRedis: CardRedis): CardVersion => ({
  id: randomUUID(),
  card: cardRedis.cardHash,
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: cardRedis.text,
  noteForStatusPage: cardRedis.note,
  sharedFunding: !!cardRedis.lnurlp?.shared,
  landingPageViewed: unixTimestampOrNullToDate(cardRedis.landingPageViewed),
})

/** side-effect: set lnurlP in cardVersion */
export const getAndLinkDrizzleLnurlPFromRedisLnurlP = (lnurlPRedis: CardRedis['lnurlp'], cardVersion: CardVersion): LnurlP | null => {
  if (lnurlPRedis == null) {
    return null
  }
  cardVersion.lnurlP = String(lnurlPRedis.id)
  return {
    lnbitsId: String(lnurlPRedis.id),
    created: unixTimestampToDate(lnurlPRedis.created),
    expiresAt: null,
    finished: unixTimestampOrNullToDate(lnurlPRedis.paid),
  }
}

/** side-effect: set lnurlW in cardVersion */
export const getAndLinkDrizzleLnurlWFromRedisCard = (cardRedis: CardRedis, cardVersion: CardVersion): LnurlW | null => {
  if (cardRedis.lnbitsWithdrawId == null) {
    cardVersion.lnurlW = null
    return null
  }
  cardVersion.lnurlW = cardRedis.lnbitsWithdrawId
  return {
    lnbitsId: cardRedis.lnbitsWithdrawId,
    created: new Date(),
    expiresAt: null,
    withdrawn: unixTimestampOrNullToDate(cardRedis.used),
  }
}

export const getDrizzleInvoiceFromRedisInvoice = (invoiceRedis: CardRedis['invoice'], cardVersion: CardVersion): {
  invoice: Invoice | null,
  cardVersionInvoice: CardVersionHasInvoice | null,
} => {
  if (invoiceRedis == null) {
    return { invoice: null, cardVersionInvoice: null }
  }
  return {
    invoice: {
      amount: invoiceRedis.amount,
      paymentHash: invoiceRedis.payment_hash,
      paymentRequest: invoiceRedis.payment_request,
      created: unixTimestampToDate(invoiceRedis.created),
      paid: unixTimestampOrNullToDate(invoiceRedis.paid),
      expiresAt: unixTimestampToDate(invoiceRedis.created + 300),
      extra: '',
    },
    cardVersionInvoice: {
      cardVersion: cardVersion.id,
      invoice: invoiceRedis.payment_hash,
    },
  }
}
