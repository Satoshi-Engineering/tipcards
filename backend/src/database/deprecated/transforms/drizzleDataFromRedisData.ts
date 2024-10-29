import { randomUUID } from 'crypto'

import type {
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  Image,
} from '@backend/database/schema/index.js'
import type { DataObjects } from '@backend/database/batchQueries.js'
import type Queries from '@backend/database/Queries.js'
import type { Card as CardRedis } from '@backend/database/deprecated/data/Card.js'
import type { Image as ImageRedis } from '@backend/database/deprecated/data/Image.js'
import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/deprecated/data/BulkWithdraw.js'

import { unixTimestampOrNullToDate, unixTimestampToDate } from './dateHelpers.js'

export const getDrizzleDataObjectsFromRedisCard = async (queries: Queries, cardRedis: CardRedis): Promise<DataObjects> => {
  const card = getDrizzleCardFromRedisCard(cardRedis)
  const cardVersion = getDrizzleCardVersionFromRedisCard(cardRedis)
  const lnurlP = await getAndLinkDrizzleLnurlPFromRedisLnurlP(queries, cardRedis.lnurlp, cardVersion)
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
export const getAndLinkDrizzleLnurlPFromRedisLnurlP = async (
  queries: Queries,
  lnurlPRedis: CardRedis['lnurlp'],
  cardVersion: CardVersion,
): Promise<LnurlP | null> => {
  if (lnurlPRedis == null) {
    return null
  }

  cardVersion.lnurlP = String(lnurlPRedis.id)

  const lnurlP = await queries.getLnurlPById(String(lnurlPRedis.id))
  if (lnurlP != null) {
    return {
      ...lnurlP,
      finished: unixTimestampOrNullToDate(lnurlPRedis.paid),
    }
  }

  return {
    lnbitsId: String(lnurlPRedis.id),
    created: unixTimestampToDate(lnurlPRedis.created),
    expiresAt: null,
    finished: unixTimestampOrNullToDate(lnurlPRedis.paid),
  }
}

/** side-effect: set lnurlW in cardVersion */
export const getAndLinkDrizzleLnurlWFromRedisCard = async (
  queries: Queries,
  cardRedis: CardRedis,
  cardVersion: CardVersion,
): Promise<LnurlW | null> => {
  if (cardRedis.isLockedByBulkWithdraw) {
    return null
  }

  if (cardRedis.lnbitsWithdrawId == null) {
    cardVersion.lnurlW = null
    return null
  }
  cardVersion.lnurlW = cardRedis.lnbitsWithdrawId

  const lnurlW = await queries.getLnurlWById(cardRedis.lnbitsWithdrawId)
  if (lnurlW != null) {
    return {
      ...lnurlW,
      withdrawn: unixTimestampOrNullToDate(cardRedis.used),
    }
  }

  return {
    lnbitsId: cardRedis.lnbitsWithdrawId,
    created: new Date(),
    expiresAt: null,
    withdrawn: unixTimestampOrNullToDate(cardRedis.used),
    bulkWithdrawId: null,
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

export const getDrizzleLnurlWFromRedisBulkWithdraw = (bulkWithdraw: BulkWithdrawRedis): LnurlW => {
  return {
    created: unixTimestampToDate(bulkWithdraw.created),
    withdrawn: unixTimestampOrNullToDate(bulkWithdraw.withdrawn),
    lnbitsId: bulkWithdraw.lnbitsWithdrawId,
    expiresAt: null,
    bulkWithdrawId: bulkWithdraw.id,
  }
}

/** @throws */
export const getUserIdForRedisImageFromDrizzleImage = async (queries: Queries, image: Image): Promise<ImageRedis['userId']> => {
  const imageUsers = await queries.getAllUsersThatCanUseImage(image)
  const userThatCanEditImage = imageUsers.find((user) => user.canEdit)
  return userThatCanEditImage?.user || null
}
