import type { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import type { Invoice } from '@backend/database/drizzle/schema/Invoice'
import {
  getLnurlPFundingCardVersion,
  getAllInvoicesFundingCardVersion, getAllCardVersionsFundedByInvoice,
  getLnurlWWithdrawingCardVersion, getAllCardsWithdrawnByLnurlW,
} from '@backend/database/drizzle/queries'
import { Card as CardRedis } from '@backend/database/redis/data/Card'

import { dateToUnixTimestamp, dateOrNullToUnixTimestamp } from './dateHelpers'

/** @throws */
export const getRedisCardFromDrizzleCardVersion = async (cardVersion: CardVersion): Promise<CardRedis> => {
  const lnurlP = await getRedisLnurlPForDrizzleCardVersion(cardVersion)
  const { invoice, setFunding } = await getRedisInvoiceAndSetFundingForDrizzleCardVersion(cardVersion, lnurlP)
  const { lnbitsWithdrawId, isLockedByBulkWithdraw, used } = await getRedisWithdrawInfoForDrizzleCardVersion(cardVersion)

  return CardRedis.parse({
    cardHash: cardVersion.card,
    text: cardVersion.textForWithdraw,
    note: cardVersion.noteForStatusPage,
    invoice,
    setFunding,
    lnurlp: lnurlP,
    lnbitsWithdrawId,
    landingPageViewed: dateOrNullToUnixTimestamp(cardVersion.landingPageViewed),
    isLockedByBulkWithdraw,
    used,
  })
}

/** @throws */
export const getRedisLnurlPForDrizzleCardVersion = async (cardVersion: CardVersion): Promise<CardRedis['lnurlp']> => {
  const lnurlp = await getLnurlPFundingCardVersion(cardVersion)
  if (lnurlp == null) {
    return null
  }

  const invoices = await getAllInvoicesFundingCardVersion(cardVersion)
  return {
    shared: cardVersion.sharedFunding,
    amount: invoices.reduce((total, current) => total + current.amount, 0),
    payment_hash: invoices.reduce((total, current) => [...total, current.paymentHash], [] as Invoice['paymentHash'][]),
    id: lnurlp.lnbitsId,
    created: dateToUnixTimestamp(lnurlp.created),
    paid: dateOrNullToUnixTimestamp(lnurlp.finished),
  }
}

/** @throws */
export const getRedisInvoiceAndSetFundingForDrizzleCardVersion = async (cardVersion: CardVersion, lnurlp: CardRedis['lnurlp']): Promise<{
  invoice: CardRedis['invoice'],
  setFunding: CardRedis['setFunding'],
}> => {
  if (invoicesBelongToLnurlP(lnurlp)) {
    return { invoice: null, setFunding: null }
  }

  const invoices = await getAllInvoicesFundingCardVersion(cardVersion)
  if (invoices.length === 0) {
    return { invoice: null, setFunding: null }
  }
  if (invoices.length > 1) {
    throw new Error(`More than one invoice found for card ${cardVersion.card}`)
  }

  const cards = await getAllCardVersionsFundedByInvoice(invoices[0])
  return {
    invoice: getRedisInvoiceForDrizzleInvoice(invoices[0], cards),
    setFunding: getRedisSetFundingForDrizzleInvoice(invoices[0], cards),
  }
}

const invoicesBelongToLnurlP = (lnurlp: CardRedis['lnurlp']) => lnurlp != null

export const getRedisInvoiceForDrizzleInvoice = (invoice: Invoice, cards: CardVersion[]): CardRedis['invoice'] => {
  if (cards.length !== 1) {
    return null
  }
  return {
    amount: invoice.amount,
    payment_hash: invoice.paymentHash,
    payment_request: invoice.paymentRequest,
    created: dateToUnixTimestamp(invoice.created),
    paid: dateOrNullToUnixTimestamp(invoice.paid),
  }
}

export const getRedisSetFundingForDrizzleInvoice = (invoice: Invoice, cards: CardVersion[]): CardRedis['setFunding'] => {
  if (cards.length < 2) {
    return null
  }
  return {
    amount: Math.round(invoice.amount / cards.length),
    created: dateToUnixTimestamp(invoice.created),
    paid: dateOrNullToUnixTimestamp(invoice.paid),
  }
}

/** @throws */
export const getRedisWithdrawInfoForDrizzleCardVersion = async (card: CardVersion): Promise<{
  lnbitsWithdrawId: CardRedis['lnbitsWithdrawId'],
  isLockedByBulkWithdraw: CardRedis['isLockedByBulkWithdraw'],
  used: CardRedis['used'],
}> => {
  const lnurlw = await getLnurlWWithdrawingCardVersion(card)
  if (lnurlw == null) {
    return { lnbitsWithdrawId: null, isLockedByBulkWithdraw: false, used: null }
  }
  const cards = await getAllCardsWithdrawnByLnurlW(lnurlw)
  return {
    lnbitsWithdrawId: lnurlw.lnbitsId,
    isLockedByBulkWithdraw: cards.length > 1,
    used: dateOrNullToUnixTimestamp(lnurlw.withdrawn),
  }
}
