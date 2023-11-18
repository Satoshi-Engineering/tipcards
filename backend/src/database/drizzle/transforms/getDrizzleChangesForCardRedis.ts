import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import { CardVersion, CardVersionHasInvoice, Invoice, LnurlW } from '@backend/database/drizzle/schema'
import { getLatestCardVersion, getInvoiceByPaymentHash } from '@backend/database/drizzle/queries'

import { getInvoiceFromCardRedis, getLnurlPFromCardRedis } from './drizzleDataFromCardRedis'

/** @throws */
export const getDrizzleChangesForCardRedis = async (cardRedis: CardRedis) => {
  const cardVersionCurrent = await getLatestCardVersion(cardRedis.cardHash)
  if (cardVersionCurrent == null) {
    throw new Error(`Cannot update card ${cardRedis.cardHash} as it doesn't exist.`)
  }
  const cardVersion = getNewCardVersion(cardVersionCurrent, cardRedis)
  const lnurlp = getLnurlPFromCardRedis(cardRedis, cardVersion)
  const invoices = await getInvoicesFromCardRedisLnurlP(cardRedis, cardVersion)
  const { invoice, cardVersionInvoice } = getInvoiceFromCardRedis(cardRedis, cardVersion)
  if (invoice != null && cardVersionInvoice != null) {
    invoices.push({ invoice, cardVersionInvoice })
  }
  const lnurlw = getLnurlWFromCardRedis(cardRedis, cardVersion)
  return {
    changes: {
      cardVersion,
      invoices,
      lnurlp,
      lnurlw,
    },
  }
}

const getNewCardVersion = (cardVersion: CardVersion, cardRedis: CardRedis) => ({
  ...cardVersion,
  textForWithdraw: cardRedis.text,
  noteForStatusPage: cardRedis.note,
  sharedFunding: !!cardRedis.lnurlp?.shared,
  landingPageViewed: dateFromUnixTimestampOrNull(cardRedis.landingPageViewed),
})

const getInvoicesFromCardRedisLnurlP = async (cardRedis: CardRedis, cardVersion: CardVersion) => {
  if (cardRedis.lnurlp?.payment_hash == null) {
    return []
  }
  const existingInvoices = await getExistingInvoicesForCardRedis(cardRedis, cardVersion)
  return getNewInvoicesForCardRedis(cardRedis, cardVersion, existingInvoices)
}

const getExistingInvoicesForCardRedis = async (cardRedis: CardRedis, cardVersion: CardVersion) => {
  if (cardRedis.lnurlp?.payment_hash == null) {
    return []
  }
  const invoices: { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[] = []
  await Promise.all(cardRedis.lnurlp.payment_hash.map(async (paymentHash) => {
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

const getNewInvoicesForCardRedis = (
  cardRedis: CardRedis,
  cardVersion: CardVersion,
  invoices: { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[],
) => {
  if (cardRedis.lnurlp?.payment_hash == null) {
    return []
  }
  const missingPaymentHashes = invoices.reduce(
    (current, { invoice }) => current.filter((paymentHash) => paymentHash !== invoice.paymentHash),
    cardRedis.lnurlp.payment_hash,
  )
  if (cardRedis.lnurlp?.amount == null || missingPaymentHashes.length === 0) {
    return []
  }

  const amountMissing = cardRedis.lnurlp.amount - invoices.reduce((total, invoice) => total + invoice.invoice.amount, 0)
  const amountPerNewInvoice = amountMissing / missingPaymentHashes.length
  missingPaymentHashes.forEach((paymentHash) => {
    invoices.push({
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
    })
  })
  return invoices
}

/** side-effect: set lnurlW in cardVersion */
export const getLnurlWFromCardRedis = (cardRedis: CardRedis, cardVersion: CardVersion): LnurlW | null => {
  if (cardRedis.lnbitsWithdrawId == null) {
    cardVersion.lnurlW = null
    return null
  }
  cardVersion.lnurlW = cardRedis.lnbitsWithdrawId
  return {
    lnbitsId: cardRedis.lnbitsWithdrawId,
    created: new Date(),
    expiresAt: null,
    withdrawn: dateFromUnixTimestampOrNull(cardRedis.used),
  }
}

const dateFromUnixTimestampOrNull = (timestamp: number | null) => {
  if (timestamp == null) {
    return null
  }
  return dateFromUnixTimestamp(timestamp)
}

const dateFromUnixTimestamp = (timestamp: number) => new Date(timestamp * 1000)
