import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import { CardVersion, CardVersionHasInvoice, Invoice } from '@backend/database/drizzle/schema'
import type {
  DataObjectsForInsertOrUpdate,
  DataObjectsForDelete,
} from '@backend/database/drizzle/batchQueries'
import {
  getLatestCardVersion,
  getInvoiceByPaymentHash,
  getUnpaidInvoicesForCardVersion,
} from '@backend/database/drizzle/queries'

import { unixTimestampOrNullToDate } from './dateHelpers'
import {
  getDrizzleInvoiceFromRedisInvoice,
  getAndLinkDrizzleLnurlPFromRedisLnurlP,
  getAndLinkDrizzleLnurlWFromRedisCard,
} from './drizzleDataFromRedisData'

/** @throws */
export const getDrizzleDataObjectsForRedisCardChanges = async (cardRedis: CardRedis): Promise<{
  insertOrUpdate: DataObjectsForInsertOrUpdate,
  delete: DataObjectsForDelete,
}> => {
  const cardVersionCurrent = await getLatestCardVersion(cardRedis.cardHash)
  if (cardVersionCurrent == null) {
    throw new Error(`Cannot update card ${cardRedis.cardHash} as it doesn't exist.`)
  }
  const cardVersion = getUpdatedCardVersionForRedisCard(cardVersionCurrent, cardRedis)
  const lnurlP = getAndLinkDrizzleLnurlPFromRedisLnurlP(cardRedis.lnurlp, cardVersion)
  const invoices = await getDrizzleInvoicesFromRedisLnurlP(cardRedis.lnurlp, cardVersion)
  const { invoice, cardVersionInvoice } = getDrizzleInvoiceFromRedisInvoice(cardRedis.invoice, cardVersion)
  if (invoice != null && cardVersionInvoice != null) {
    invoices.push({ invoice, cardVersionInvoice })
  }
  const lnurlW = getAndLinkDrizzleLnurlWFromRedisCard(cardRedis, cardVersion)

  const invoicesToDelete = await getDrizzleInvoicesToDeleteFromRedisLnurlP(cardRedis.lnurlp, cardVersion)
  return {
    insertOrUpdate: {
      cardVersion,
      invoices,
      lnurlP,
      lnurlW,
    },
    delete: {
      invoices: invoicesToDelete,
    },
  }
}

const getUpdatedCardVersionForRedisCard = (cardVersion: CardVersion, cardRedis: CardRedis) => ({
  ...cardVersion,
  textForWithdraw: cardRedis.text,
  noteForStatusPage: cardRedis.note,
  sharedFunding: !!cardRedis.lnurlp?.shared,
  landingPageViewed: unixTimestampOrNullToDate(cardRedis.landingPageViewed),
})

const getDrizzleInvoicesFromRedisLnurlP = async (lnurlPRedis: CardRedis['lnurlp'], cardVersion: CardVersion) => {
  if (lnurlPRedis?.amount == null || lnurlPRedis?.payment_hash == null) {
    return []
  }
  const existingInvoices = await getExistingDrizzleInvoicesForPaymentHashes(lnurlPRedis.payment_hash, cardVersion)
  return getNewDrizzleInvoicesForRedisLnurlP(
    lnurlPRedis.amount,
    lnurlPRedis.payment_hash,
    cardVersion,
    existingInvoices,
  )
}

const getExistingDrizzleInvoicesForPaymentHashes = async (paymentHashes: Invoice['paymentHash'][], cardVersion: CardVersion) => {
  const invoices: { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[] = []
  await Promise.all(paymentHashes.map(async (paymentHash) => {
    const invoice = await getInvoiceByPaymentHash(paymentHash)
    if (invoice == null) {
      return
    }
    invoices.push({
      invoice,
      cardVersionInvoice: {
        cardVersion: cardVersion.id,
        invoice: invoice.paymentHash,
      },
    })
  }))
  return invoices
}

const getNewDrizzleInvoicesForRedisLnurlP = (
  targetAmount: Invoice['amount'],
  targetPaymentHashes: Invoice['paymentHash'][],
  cardVersion: CardVersion,
  existingInvoices: { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[],
): { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[] => {
  const missingPaymentHashes = existingInvoices.reduce(
    (current, { invoice }) => current.filter((paymentHash) => paymentHash !== invoice.paymentHash),
    targetPaymentHashes,
  )
  if (missingPaymentHashes.length === 0) {
    return []
  }

  const amountMissing = targetAmount - existingInvoices.reduce((total, invoice) => total + invoice.invoice.amount, 0)
  const amountPerNewInvoice = Math.round(amountMissing / missingPaymentHashes.length)
  return missingPaymentHashes.map((paymentHash) => ({
    invoice: {
      amount: amountPerNewInvoice,
      paymentHash,
      paymentRequest: '',
      created: new Date(),
      paid: new Date(),
      expiresAt: new Date(),
      extra: `{ "lnurlp": "${cardVersion.lnurlP}" }`,
    },
    cardVersionInvoice: {
      cardVersion: cardVersion.id,
      invoice: paymentHash,
    },
  }))
}

const getDrizzleInvoicesToDeleteFromRedisLnurlP = async (
  lnurlPRedis: CardRedis['lnurlp'],
  cardVersion: CardVersion,
): Promise<{
  invoice: Invoice,
  cardVersionInvoice: CardVersionHasInvoice,
}[]> => {
  if (lnurlPRedis == null) {
    return []
  }
  const invoices = await getUnpaidInvoicesForCardVersion(cardVersion)
  return invoices.map((invoice) => ({
    invoice,
    cardVersionInvoice: {
      invoice: invoice.paymentHash,
      cardVersion: cardVersion.id,
    },
  }))
}
