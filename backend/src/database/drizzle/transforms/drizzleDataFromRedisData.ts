import { randomUUID } from 'crypto'

import {
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  Image,
} from '@backend/database/drizzle/schema'
import type { DataObjects } from '@backend/database/drizzle/batchQueries'
import type Queries from '@backend/database/drizzle/Queries'
import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import type { Image as ImageRedis } from '@backend/database/redis/data/Image'
import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/redis/data/BulkWithdraw'

import { unixTimestampOrNullToDate, unixTimestampToDate } from './dateHelpers'

export const getDrizzleDataObjectsFromRedisCard = (cardRedis: CardRedis): DataObjects => {
  const card = getDrizzleCardFromRedisCard(cardRedis)
  const cardVersion = getDrizzleCardVersionFromRedisCard(cardRedis)
  const lnurlP = getAndLinkDrizzleLnurlPFromRedisLnurlP(cardRedis.lnurlp, cardVersion)
  const { invoice, cardVersionInvoice } = getDrizzleInvoiceFromRedisInvoice(cardRedis.invoice, cardVersion)
  return toDataObjects({
    card,
    cardVersion,
    lnurlP,
    invoice,
    cardVersionInvoice,
  })
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

const toDataObjects = ({
  card,
  cardVersion,
  lnurlP,
  invoice,
  cardVersionInvoice,
}: {
  card: Card,
  cardVersion: CardVersion,
  lnurlP: LnurlP | null,
  invoice: Invoice | null,
  cardVersionInvoice: CardVersionHasInvoice | null,
}): DataObjects => {
  const dataObjects: DataObjects = {
    cards: [card],
    cardVersions: [cardVersion],
  }
  if (lnurlP != null) {
    dataObjects.lnurlPs = [lnurlP]
  }
  if (invoice != null) {
    dataObjects.invoices = [invoice]
  }
  if (cardVersionInvoice != null) {
    dataObjects.cardVersionInvoices = [cardVersionInvoice]
  }
  return dataObjects
}

export const getDrizzleLnurlWFromRedisBulkWithdraw = (bulkWithdraw: BulkWithdrawRedis) => {
  return {
    created: unixTimestampToDate(bulkWithdraw.created),
    withdrawn: unixTimestampOrNullToDate(bulkWithdraw.withdrawn),
    lnbitsId: bulkWithdraw.lnbitsWithdrawId,
    expiresAt: null,
  }
}

/** @throws */
export const getUserIdForRedisImageFromDrizzleImage = async (queries: Queries, image: Image): Promise<ImageRedis['userId']> => {
  const imageUsers = await queries.getAllUsersThatCanUseImage(image)
  const userThatCanEditImage = imageUsers.find((user) => user.canEdit)
  if (userThatCanEditImage == null) {
    throw new Error(`Image ${image.id} has no user that can use/edit it, which is not allowed for ImageRedis!`)
  }
  return userThatCanEditImage.user
}
