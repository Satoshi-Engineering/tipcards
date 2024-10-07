import type { CardVersion, CardVersionHasInvoice, Invoice, LnurlP, LnurlW } from '@backend/database/schema/index.js'
import type { DataObjects } from '@backend/database/batchQueries.js'
import type Queries from '@backend/database/Queries.js'
import type { Card as CardRedis } from '@backend/database/deprecated/data/Card.js'

import { unixTimestampOrNullToDate } from './dateHelpers.js'
import {
  getDrizzleInvoiceFromRedisInvoice,
  getAndLinkDrizzleLnurlPFromRedisLnurlP,
  getAndLinkDrizzleLnurlWFromRedisCard,
} from './drizzleDataFromRedisData.js'

/** @throws */
export const getDrizzleDataObjectsForRedisCardChanges = async (queries: Queries, cardRedis: CardRedis): Promise<{
  insertOrUpdate: DataObjects,
  delete: DataObjects,
}> => {
  const cardVersionCurrent = await queries.getLatestCardVersion(cardRedis.cardHash)
  if (cardVersionCurrent == null) {
    throw new Error(`Cannot update card ${cardRedis.cardHash} as it doesn't exist.`)
  }
  const cardVersion = getUpdatedCardVersionForRedisCard(cardVersionCurrent, cardRedis)
  const lnurlP = await getAndLinkDrizzleLnurlPFromRedisLnurlP(queries, cardRedis.lnurlp, cardVersion)
  const { invoices, cardVersionInvoices } = await getDrizzleInvoicesFromRedisLnurlP(queries, cardRedis.lnurlp, cardVersion)
  const { invoice, cardVersionInvoice } = getDrizzleInvoiceFromRedisInvoice(cardRedis.invoice, cardVersion)
  const lnurlW = await getAndLinkDrizzleLnurlWFromRedisCard(queries, cardRedis, cardVersion)

  const dataObjectsToDelete = await getDrizzleInvoicesToDeleteFromRedisLnurlP(queries, cardRedis.lnurlp, cardVersion)
  return {
    insertOrUpdate: insertOrUpdateToDataObjects({
      cardVersion,
      invoices,
      cardVersionInvoices,
      invoice,
      cardVersionInvoice,
      lnurlP,
      lnurlW,
    }),
    delete: dataObjectsToDelete,
  }
}

const getUpdatedCardVersionForRedisCard = (cardVersion: CardVersion, cardRedis: CardRedis): CardVersion => ({
  ...cardVersion,
  textForWithdraw: cardRedis.text,
  noteForStatusPage: cardRedis.note,
  sharedFunding: !!cardRedis.lnurlp?.shared,
  landingPageViewed: unixTimestampOrNullToDate(cardRedis.landingPageViewed),
})

const getDrizzleInvoicesFromRedisLnurlP = async (queries: Queries, lnurlPRedis: CardRedis['lnurlp'], cardVersion: CardVersion): Promise<{
  invoices: Invoice[],
  cardVersionInvoices: CardVersionHasInvoice[],
}> => {
  if (lnurlPRedis?.amount == null || lnurlPRedis?.payment_hash == null) {
    return { invoices: [], cardVersionInvoices: [] }
  }
  const { invoices } = await getExistingDrizzleInvoicesForPaymentHashes(queries, lnurlPRedis.payment_hash, cardVersion)
  return getNewDrizzleInvoicesForRedisLnurlP(
    lnurlPRedis.amount,
    lnurlPRedis.payment_hash,
    cardVersion,
    invoices,
  )
}

const getExistingDrizzleInvoicesForPaymentHashes = async (queries: Queries, paymentHashes: Invoice['paymentHash'][], cardVersion: CardVersion): Promise<{
  invoices: Invoice[],
  cardVersionInvoices: CardVersionHasInvoice[],
}> => {
  const invoices: Invoice[] = []
  const cardVersionInvoices: CardVersionHasInvoice[] = []
  await Promise.all(paymentHashes.map(async (paymentHash) => {
    const invoice = await queries.getInvoiceByPaymentHash(paymentHash)
    if (invoice == null) {
      return
    }
    invoices.push(invoice)
    cardVersionInvoices.push({
      cardVersion: cardVersion.id,
      invoice: invoice.paymentHash,
    })
  }))
  return { invoices, cardVersionInvoices }
}

const getNewDrizzleInvoicesForRedisLnurlP = (
  targetAmount: Invoice['amount'],
  targetPaymentHashes: Invoice['paymentHash'][],
  cardVersion: CardVersion,
  existingInvoices: Invoice[],
): {
  invoices: Invoice[],
  cardVersionInvoices: CardVersionHasInvoice[],
} => {
  const missingPaymentHashes = existingInvoices.reduce(
    (current, invoice) => current.filter((paymentHash) => paymentHash !== invoice.paymentHash),
    targetPaymentHashes,
  )
  if (missingPaymentHashes.length === 0) {
    return { invoices: [], cardVersionInvoices: [] }
  }

  const amountMissing = targetAmount - existingInvoices.reduce((total, invoice) => total + invoice.amount, 0)
  const amountPerNewInvoice = Math.round(amountMissing / missingPaymentHashes.length)
  return {
    invoices: missingPaymentHashes.map((paymentHash) => ({
      amount: amountPerNewInvoice,
      paymentHash,
      paymentRequest: '',
      created: new Date(),
      paid: new Date(),
      expiresAt: new Date(),
      extra: `{ "lnurlp": "${cardVersion.lnurlP}" }`,
    })),
    cardVersionInvoices: missingPaymentHashes.map((paymentHash) => ({
      cardVersion: cardVersion.id,
      invoice: paymentHash,
    })),
  }
}

const getDrizzleInvoicesToDeleteFromRedisLnurlP = async (
  queries: Queries,
  lnurlPRedis: CardRedis['lnurlp'],
  cardVersion: CardVersion,
): Promise<DataObjects> => {
  if (lnurlPRedis == null) {
    return {}
  }
  const invoices = await queries.getUnpaidInvoicesForCardVersion(cardVersion)
  if (invoices.length === 0) {
    return {}
  }
  return {
    invoices,
    cardVersionInvoices: invoices.map((invoice) => ({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion.id,
    })),
  }
}

const insertOrUpdateToDataObjects = ({
  cardVersion,
  invoices,
  cardVersionInvoices,
  invoice,
  cardVersionInvoice,
  lnurlP,
  lnurlW,
}: {
  cardVersion: CardVersion,
  invoices: Invoice[],
  cardVersionInvoices: CardVersionHasInvoice[],
  invoice: Invoice | null,
  cardVersionInvoice: CardVersionHasInvoice | null,
  lnurlP: LnurlP | null,
  lnurlW: LnurlW | null,
}): DataObjects => {
  const dataObjects: DataObjects = {
    cardVersions: [cardVersion],
  }
  if (lnurlP != null) {
    dataObjects.lnurlPs = [lnurlP]
  }
  if (lnurlW != null) {
    dataObjects.lnurlWs = [lnurlW]
  }
  if (invoice != null) {
    invoices = [...invoices, invoice]
  }
  if (invoices.length > 0) {
    dataObjects.invoices = invoices
  }
  if (cardVersionInvoice != null) {
    cardVersionInvoices = [...cardVersionInvoices, cardVersionInvoice]
  }
  if (cardVersionInvoices.length > 0) {
    dataObjects.cardVersionInvoices = cardVersionInvoices
  }
  return dataObjects
}
