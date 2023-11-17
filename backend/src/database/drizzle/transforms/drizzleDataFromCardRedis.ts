import { randomUUID } from 'crypto'

import type { Card as CardRedis } from '@backend/database/redis/data/Card'

import { Card } from '../schema/Card'
import { CardVersion } from '../schema/CardVersion'
import { Invoice } from '../schema/Invoice'
import { CardVersionHasInvoice } from '../schema/CardVersionHasInvoice'
import { LnurlP } from '../schema/LnurlP'

export const drizzleDataFromCardRedis = (cardRedis: CardRedis): {
  card: Card,
  cardVersion: CardVersion,
  lnurlp: LnurlP | null,
  invoice: Invoice | null,
  cardVersionInvoice: CardVersionHasInvoice | null,
} => {
  const card = getCardFromCardRedis(cardRedis)
  const cardVersion = getCardVersionForCardFromCardRedis(cardRedis)
  const lnurlp = getLnurlPFromCardRedis(cardRedis, cardVersion)
  const { invoice, cardVersionInvoice } = getInvoiceFromCardRedis(cardRedis, cardVersion)
  return {
    card,
    cardVersion,
    lnurlp,
    invoice,
    cardVersionInvoice,
  }
}

const getCardFromCardRedis = (cardRedis: CardRedis): Card => ({
  hash: cardRedis.cardHash,
  created: new Date(),
  set: null,
})

const getCardVersionForCardFromCardRedis = (cardRedis: CardRedis): CardVersion => ({
  id: randomUUID(),
  card: cardRedis.cardHash,
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: cardRedis.text,
  noteForStatusPage: cardRedis.note,
  sharedFunding: !!cardRedis.lnurlp?.shared,
  landingPageViewed: dateFromUnixTimestampOrNull(cardRedis.landingPageViewed),
})

/** side-effect: set lnurlp in card */
const getLnurlPFromCardRedis = (cardRedis: CardRedis, cardVersion: CardVersion): LnurlP | null => {
  if (cardRedis.lnurlp == null) {
    return null
  }
  cardVersion.lnurlP = String(cardRedis.lnurlp.id)
  return {
    lnbitsId: String(cardRedis.lnurlp.id),
    created: dateFromUnixTimestamp(cardRedis.lnurlp.created),
    expiresAt: null,
    finished: null,
  }
}

export const getInvoiceFromCardRedis = (cardRedis: CardRedis, cardVersion: CardVersion): {
  invoice: Invoice | null,
  cardVersionInvoice: CardVersionHasInvoice | null,
} => {
  if (cardRedis.invoice == null) {
    return { invoice: null, cardVersionInvoice: null }
  }
  return {
    invoice: {
      amount: cardRedis.invoice.amount,
      paymentHash: cardRedis.invoice.payment_hash,
      paymentRequest: cardRedis.invoice.payment_request,
      created: dateFromUnixTimestamp(cardRedis.invoice.created),
      paid: dateFromUnixTimestampOrNull(cardRedis.invoice.paid),
      expiresAt: dateFromUnixTimestamp(cardRedis.invoice.created + 300),
      extra: '',
    },
    cardVersionInvoice: {
      cardVersion: cardVersion.id,
      invoice: cardRedis.invoice.payment_hash,
    },
  }
}

const dateFromUnixTimestampOrNull = (timestamp: number | null) => {
  if (timestamp == null) {
    return null
  }
  return dateFromUnixTimestamp(timestamp)
}

const dateFromUnixTimestamp = (timestamp: number) => new Date(timestamp * 1000)
