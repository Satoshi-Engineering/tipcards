import type { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import type { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { getLnurlPForCard, getInvoicesForCard, getCardsForInvoice } from '@backend/database/drizzle/queries'

import { Card as CardRedis } from '@backend/database/redis/data/Card'

/** @throws */
export const cardRedisFromCardDrizzle = async (card: CardVersion): Promise<CardRedis> => {
  const lnurlp = await getLnurlpRedisForCard(card)
  const invoice = await getInvoiceRedisForCard(card, lnurlp)

  return CardRedis.parse({
    cardHash: card.card,
    text: card.textForWithdraw,
    note: card.noteForStatusPage,
    invoice,
    setFunding: null, // todo : load from database
    lnurlp,
    lnbitsWithdrawId: null, // todo : load from database
    landingPageViewed: card.landingPageViewed,
    isLockedByBulkWithdraw: false, // todo : load from database
    used: null, // todo : load from database
  })
}

/** @throws */
const getLnurlpRedisForCard = async (card: CardVersion): Promise<CardRedis['lnurlp']> => {
  const lnurlPDrizzle = await getLnurlPForCard(card)
  if (lnurlPDrizzle == null) {
    return null
  }

  const invoices = await getInvoicesForCard(card)
  return {
    shared: card.sharedFunding,
    amount: await getTotalPaidAmountPerCard(invoices),
    payment_hash: invoices.reduce((total, current) => [...total, current.paymentHash], [] as Invoice['paymentHash'][]),
    id: lnurlPDrizzle.lnbitsId,
    created: Math.round(lnurlPDrizzle.created.getTime() / 1000),
    paid: null,
  }
}

/** @throws */
const getTotalPaidAmountPerCard = async (invoices: Invoice[]) => {
  let amount = 0
  await Promise.all(invoices.map(async (invoice) => {
    if (invoice.paid == null) {
      return
    }
    const invoiceAmountPerCard = await getInvoiceAmountPerCard(invoice)
    amount += invoiceAmountPerCard
  }))
  return amount
}

/** @throws */
const getInvoiceAmountPerCard = async (invoice: Invoice) => {
  const cards = await getCardsForInvoice(invoice)
  if (cards.length === 0) {
    return 0
  }
  return Math.round(invoice.amount / cards.length)
}

/** @throws */
const getInvoiceRedisForCard = async (card: CardVersion, lnurlp: CardRedis['lnurlp']): Promise<CardRedis['invoice']> => {
  if (lnurlp != null) {
    return null
  }
  const invoices = await getInvoicesForCard(card)
  if (invoices.length === 0) {
    return null
  }
  if (invoices.length > 1) {
    throw new Error(`More than one invoice found for card ${card.card}`)
  }
  return {
    amount: await getInvoiceAmountPerCard(invoices[0]),
    payment_hash: invoices[0].paymentHash,
    payment_request: invoices[0].paymentRequest,
    created: Math.round(invoices[0].created.getTime() / 1000),
    paid: invoices[0].paid != null ? Math.round(invoices[0].paid.getTime() / 1000) : null,
  }
}
